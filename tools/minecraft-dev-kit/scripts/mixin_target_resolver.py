#!/usr/bin/env python3
"""Resolve retained source Mixins against an exact target JVM symbol index.

This is a structural gate before real Mixin PREPARE/APPLY. It validates target owners,
injector selectors, @At member references, Shadows/Accessors/Invokers when statically inferable,
and reports descriptor ambiguity instead of guessing.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Iterable

from classfile_symbol_index import resolve_member
from port_26_3_common import Bundle, collect_text, write_json

INJECTORS = [
    "Inject", "Redirect", "ModifyArg", "ModifyArgs", "ModifyVariable", "ModifyConstant",
    # MixinExtras surfaces are common in modern mods and are just as descriptor-sensitive.
    "ModifyExpressionValue", "ModifyReceiver", "ModifyReturnValue",
    "WrapOperation", "WrapMethod", "WrapWithCondition",
]


def _annotation_bodies(text: str, annotation: str) -> Iterable[tuple[int, str]]:
    text = _without_comments(text)
    rx = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|@'
                    + re.escape(annotation) + r"\b")
    for m in rx.finditer(text):
        if not m[0].startswith("@"):
            continue
        pos = m.end()
        while pos < len(text) and text[pos].isspace():
            pos += 1
        if pos >= len(text) or text[pos] != "(":
            yield m.start(), ""
            continue
        start = pos + 1
        depth = 1
        pos += 1
        quote = None
        esc = False
        while pos < len(text) and depth:
            ch = text[pos]
            if quote:
                if esc:
                    esc = False
                elif ch == "\\":
                    esc = True
                elif ch == quote:
                    quote = None
            else:
                if ch in {'"', "'"}:
                    quote = ch
                elif ch == "(":
                    depth += 1
                elif ch == ")":
                    depth -= 1
            pos += 1
        yield m.start(), text[start:pos - 1] if depth == 0 else text[start:]


def _line(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def _imports(text: str) -> dict[str, str]:
    out = {}
    for m in re.finditer(r"^\s*import\s+([\w.$]+)\s*;", text, re.MULTILINE):
        fq = m.group(1)
        out[fq.rsplit(".", 1)[-1]] = fq.replace(".", "/")
    return out


def _mixin_targets(text: str) -> list[dict]:
    imports = _imports(text)
    out = []
    for pos, body in _annotation_bodies(text, "Mixin"):
        for target in re.findall(r"([A-Za-z_$][\w$]*)\.class", body):
            owner = imports.get(target)
            if owner:
                out.append({"owner": owner, "line": _line(text, pos), "source": target + ".class"})
        for fq in re.findall(r"[\"']([A-Za-z_$][\w.$/]+)[\"']", body):
            if "." in fq or "/" in fq:
                out.append({"owner": fq.replace(".", "/"), "line": _line(text, pos), "source": fq})
    # Stable de-dupe.
    seen = set()
    unique = []
    for item in out:
        key = (item["owner"], item["line"])
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


def _quoted_values(expr: str) -> list[str]:
    return re.findall(r"[\"']([^\"']+)[\"']", expr)


def _without_comments(text: str) -> str:
    # Preserve offsets and line numbers, and never strip comment-like text in literals.
    tokens = r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|//[^\n]*|/\*.*?\*/'
    return re.sub(tokens, lambda m: re.sub(r"[^\n]", " ", m[0])
                  if m[0].startswith(("//", "/*")) else m[0], text, flags=re.DOTALL)


def _attribute_expressions(body: str, name: str) -> Iterable[str]:
    # Read the complete value, not just the first string in a Java concatenation.
    token = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|\b'
                       + re.escape(name) + r'\s*=\s*')
    for match in token.finditer(body):
        if match[0].startswith(('"', "'")):
            continue
        start = pos = match.end()
        depth = 0
        quote = None
        escaped = False
        while pos < len(body):
            ch = body[pos]
            if quote:
                if escaped:
                    escaped = False
                elif ch == "\\":
                    escaped = True
                elif ch == quote:
                    quote = None
            elif ch in ('"', "'"):
                quote = ch
            elif ch in "{([":
                depth += 1
            elif ch in "})]":
                if not depth:
                    break
                depth -= 1
            elif ch == "," and not depth:
                break
            pos += 1
        yield body[start:pos].strip()


def _literal_selectors(expr: str) -> list[str]:
    """Accept literal strings/arrays and literal concatenation, never evaluate source."""
    expr = expr.strip()
    array = expr.startswith("{") and expr.endswith("}")
    if array:
        expr = expr[1:-1].strip()
    literal = r'"(?:\\.|[^"\\])*"'
    combined = literal + r'(?:\s*\+\s*' + literal + r')*'
    grammar = combined + (r'(?:\s*,\s*' + combined + r')*\s*,?' if array else '')
    if not re.fullmatch(grammar, expr):
        raise ValueError("Selector expression is not a supported literal string or array")
    return ["".join(json.loads(part) for part in re.findall(literal, value))
            for value in re.findall(combined, expr)]


def _selectors(text: str) -> list[dict]:
    text = _without_comments(text)
    out = []
    for ann in INJECTORS:
        for pos, body in _annotation_bodies(text, ann):
            for attribute, kind in [("method", "method"), ("target", "at-target")]:
                for expr in _attribute_expressions(body, attribute):
                    try:
                        values = _literal_selectors(expr)
                    except ValueError:
                        out.append({"kind": "unparsed", "selector": expr,
                                    "line": _line(text, pos), "annotation": ann})
                        continue
                    for value in values:
                        out.append({"kind": kind, "selector": value,
                                    "line": _line(text, pos), "annotation": ann})
    # Accessor/Invoker explicit target strings.
    for ann, kind in [("Accessor", "field"), ("Invoker", "method")]:
        for pos, body in _annotation_bodies(text, ann):
            vals = _quoted_values(body)
            if vals:
                out.append({"kind": kind, "selector": vals[0], "line": _line(text, pos), "annotation": ann})
    return out


def _declaration_names(text: str, annotation: str) -> list[dict]:
    text = _without_comments(text)
    out = []
    for pos, body in _annotation_bodies(text, annotation):
        end = pos + len(annotation) + 1
        while end < len(text) and text[end].isspace():
            end += 1
        if end < len(text) and text[end] == "(":
            end += len(body) + 2
        tail = text[end:].lstrip()
        # Consume immediately adjacent annotations without crossing a declaration.
        while tail.startswith("@"):
            match = re.match(r"@([\w.]+)", tail)
            if not match:
                break
            rest = tail[match.end():].lstrip()
            if rest.startswith("("):
                nested = next(_annotation_bodies(tail, match[1]), None)
                if nested is None:
                    break
                rest = rest[len(nested[1]) + 2:]
            tail = rest.lstrip()
        # The first delimiter belongs to THIS declaration. A later method must
        # never win over a field just because it appears in a look-ahead window.
        boundary = re.search(r"[;=({}]", tail)
        if not boundary or boundary[0] in "{}":
            continue
        header = tail[:boundary.start()].strip()
        name = re.search(r"([A-Za-z_$][\w$]*)\s*(?:\[\s*\]\s*)*$", header)
        if name:
            kind = "method" if boundary[0] == "(" else "field"
            out.append({"kind": kind, "selector": name[1],
                        "line": _line(text, pos), "annotation": annotation})
    return out


def _shadow_names(text: str) -> list[dict]:
    return _declaration_names(text, "Shadow")


def _overwrite_names(text: str) -> list[dict]:
    return [row for row in _declaration_names(text, "Overwrite") if row["kind"] == "method"]


def parse_member_selector(selector: str, default_owner: str, declared_kind: str) -> dict:
    raw = selector.strip()
    owner = default_owner
    name = raw
    descriptor = None
    kind = declared_kind

    # Mixin target notation: Lowner;name(desc)ret or Lowner;field:Desc
    m = re.match(r"^L([^;]+);([^(:]+)(\([^)]*\).+)$", raw)
    if m:
        owner, name, descriptor = m.group(1), m.group(2), m.group(3)
        kind = "method"
        return {"owner": owner, "name": name, "descriptor": descriptor, "kind": kind, "raw": raw}
    m = re.match(r"^L([^;]+);([^:]+):(.+)$", raw)
    if m:
        owner, name, descriptor = m.group(1), m.group(2), m.group(3)
        kind = "field"
        return {"owner": owner, "name": name, "descriptor": descriptor, "kind": kind, "raw": raw}
    # owner/name(desc) form.
    m = re.match(r"^([\w/$]+)[/.]([A-Za-z_$][\w$]*)(\([^)]*\).+)$", raw)
    if m:
        owner, name, descriptor = m.group(1).replace(".", "/"), m.group(2), m.group(3)
        kind = "method"
        return {"owner": owner, "name": name, "descriptor": descriptor, "kind": kind, "raw": raw}
    # name(desc)ret.
    m = re.match(r"^([A-Za-z_$<>][\w$<>]*)(\([^)]*\).+)$", raw)
    if m:
        name, descriptor = m.group(1), m.group(2)
        kind = "method"
    return {"owner": owner, "name": name, "descriptor": descriptor, "kind": kind, "raw": raw}


def resolve_project(project: Path, target_index: dict) -> dict:
    bundle = Bundle(project)
    try:
        names = bundle.names()
        texts = collect_text(bundle, names)
    finally:
        bundle.close()

    resolved = []
    warnings = []
    blockers = []
    for path, text in texts.items():
        if not path.lower().endswith((".java", ".kt", ".kts", ".groovy")) or "@Mixin" not in text:
            continue
        text = _without_comments(text)
        targets = _mixin_targets(text)
        if not targets:
            warnings.append({"id": "mixin-target-unparsed", "path": path, "line": None, "message": "Mixin source found but target owner could not be inferred statically; require compiled annotation/bytecode resolution."})
            continue
        if len(targets) > 1:
            # Multi-target Mixins are legal; each selector is evaluated against every owner conservatively.
            warnings.append({"id": "mixin-multi-target", "path": path, "line": targets[0]["line"], "message": f"Mixin declares {len(targets)} targets; selectors must resolve for the intended target set."})
        selectors = _selectors(text) + _shadow_names(text) + _overwrite_names(text)
        for target in targets:
            owner = target["owner"]
            if owner not in (target_index.get("classes") or {}):
                blockers.append({"id": "mixin-target-owner-missing", "path": path, "line": target["line"], "message": f"Target class {owner} is absent from the exact target symbol index."})
                continue
            for sel in selectors:
                if sel["kind"] == "unparsed":
                    blockers.append({"id": "mixin-selector-expression-unresolved", "path": path,
                                     "line": sel["line"], "message": f"Cannot statically evaluate {sel['annotation']} selector expression {sel['selector']!r}; require compiled annotation resolution."})
                    continue
                declared_kind = "method" if sel["kind"] in {"method", "at-target"} else sel["kind"]
                parsed = parse_member_selector(sel["selector"], owner, declared_kind)
                if parsed["kind"] not in {"method", "field"}:
                    warnings.append({"id": "mixin-selector-unparsed", "path": path, "line": sel["line"], "message": f"Could not classify selector {sel['selector']!r}."})
                    continue
                result = resolve_member(target_index, parsed["owner"], parsed["kind"], parsed["name"], parsed["descriptor"])
                row = {"path": path, "line": sel["line"], "annotation": sel["annotation"], "target_owner": owner, "selector": parsed, "resolution": result}
                if result["status"] == "RESOLVED":
                    resolved.append(row)
                    if parsed["descriptor"] is None:
                        warnings.append({"id": "mixin-selector-unique-but-descriptorless", "path": path, "line": sel["line"], "message": f"{sel['annotation']} selector {parsed['name']!r} is currently unique but descriptorless; pin the exact descriptor before release to resist overload drift."})
                elif result["status"] == "AMBIGUOUS":
                    blockers.append({"id": "mixin-selector-ambiguous", "path": path, "line": sel["line"], "message": f"Selector {parsed['name']!r} matches multiple target members; add the exact JVM descriptor.", "resolution": result})
                elif result["status"] == "OWNER_MISSING":
                    blockers.append({"id": "mixin-selector-owner-missing", "path": path, "line": sel["line"], "message": f"Selector owner {parsed['owner']} is absent from target index.", "resolution": result})
                else:
                    blockers.append({"id": "mixin-selector-member-missing", "path": path, "line": sel["line"], "message": f"Selector {parsed['name']!r}{parsed['descriptor'] or ''} does not resolve on {parsed['owner']} or inherited owners.", "resolution": result})

    return {
        "schema_version": 1,
        "project": str(project.resolve()),
        "target_index": target_index.get("input"),
        "status": "FAIL" if blockers else "PASS_WITH_WARNINGS" if warnings else "PASS",
        "resolved": resolved,
        "blockers": blockers,
        "warnings": warnings,
        "counts": {"resolved": len(resolved), "blockers": len(blockers), "warnings": len(warnings), "ids": dict(Counter(x["id"] for x in blockers + warnings))},
        "runtime_boundary": "Structural resolution is necessary but not sufficient. Retained Mixins still require real PREPARE/APPLY and affected behavior proof in the exact 26.3 runtime.",
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("project", type=Path)
    ap.add_argument("--target-index", required=True, type=Path)
    ap.add_argument("--json-out", type=Path)
    ap.add_argument("--fail-on-blocker", action="store_true")
    args = ap.parse_args()
    index = json.loads(args.target_index.read_text(encoding="utf-8"))
    result = resolve_project(args.project, index)
    if args.json_out:
        write_json(args.json_out, result)
    else:
        print(json.dumps(result, indent=2, sort_keys=True))
    return 3 if args.fail_on_blocker and result["blockers"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
