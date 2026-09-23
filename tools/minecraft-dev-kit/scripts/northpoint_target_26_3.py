#!/usr/bin/env python3
"""Materialize an inferred legacy Minecraft mod as a loader-native Minecraft 26.3 target.

This bridge deliberately separates source authority from target output. It delegates scaffold/evidence
creation to port_26_3_pipeline.py, carries source-owned code/resources into that target, applies only
bounded evidence-backed rewrites, and records exactly what changed. Unhandled semantic work remains
visible in the Dev Kit evidence instead of being silently dropped.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
from typing import Any

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
DEFAULT_PIPELINE = SCRIPT_DIR / "port_26_3_pipeline.py"
TARGET_MINECRAFT = "26.3"
TARGET_JAVA = 25
IGNORED_DIGEST_DIRS = {".git", ".gradle", "build", "target", "out", "run", "runs", "logs", ".northpoint"}


class ConversionBlock(RuntimeError):
    """A real source-to-target conversion cannot proceed safely with the current adapter."""


def read_json(path: pathlib.Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ConversionBlock(f"expected JSON object: {path}")
    return value


def write_json(path: pathlib.Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def parse_properties(path: pathlib.Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith(("#", "!")):
            continue
        sep = "=" if "=" in line else ":" if ":" in line else None
        if not sep:
            continue
        key, value = line.split(sep, 1)
        out[key.strip()] = value.strip()
    return out


def tree_digest(root: pathlib.Path) -> str:
    h = hashlib.sha256()
    rr = root.resolve()
    for base, dirs, files in os.walk(rr):
        base_path = pathlib.Path(base)
        dirs[:] = sorted(d for d in dirs if d not in IGNORED_DIGEST_DIRS)
        for name in sorted(files):
            path = base_path / name
            rel = path.relative_to(rr).as_posix()
            try:
                stat = path.stat()
            except OSError:
                continue
            if stat.st_size > 20 * 1024 * 1024:
                continue
            h.update(rel.encode("utf-8")); h.update(b"\0")
            with path.open("rb") as f:
                for chunk in iter(lambda: f.read(1024 * 1024), b""):
                    h.update(chunk)
            h.update(b"\0")
    return h.hexdigest()


def detect_fabric_identity(source: pathlib.Path) -> dict[str, str]:
    metadata = source / "src/main/resources/fabric.mod.json"
    if not metadata.is_file():
        raise ConversionBlock("Fabric source conversion requires src/main/resources/fabric.mod.json")
    mod = read_json(metadata)
    mod_id = str(mod.get("id") or "").strip()
    if not re.fullmatch(r"[a-z][a-z0-9_-]{1,63}", mod_id):
        raise ConversionBlock(f"invalid or missing Fabric mod id: {mod_id!r}")
    props = parse_properties(source / "gradle.properties")
    group = str(props.get("group") or props.get("maven_group") or "com.example").strip() or "com.example"
    version = str(props.get("version") or props.get("mod_version") or mod.get("version") or "1.0.0").strip()
    if version.startswith("${"):
        version = str(props.get("version") or props.get("mod_version") or "1.0.0")
    name = str(mod.get("name") or re.sub(r"[_-]+", " ", mod_id).title()).strip()
    minecraft = str(props.get("minecraft_version") or "").strip()
    return {"mod_id": mod_id, "group": group, "version": version, "name": name, "minecraft": minecraft}


def _neoforge_metadata_path(source: pathlib.Path) -> pathlib.Path | None:
    for rel in (
        "src/main/templates/META-INF/neoforge.mods.toml",
        "src/main/resources/META-INF/neoforge.mods.toml",
    ):
        path = source / rel
        if path.is_file():
            return path
    return None


def detect_neoforge_identity(source: pathlib.Path) -> dict[str, str]:
    props = parse_properties(source / "gradle.properties")
    mod_id = str(props.get("mod_id") or props.get("modId") or "").strip()
    metadata = _neoforge_metadata_path(source)
    if not mod_id and metadata:
        text = metadata.read_text(encoding="utf-8", errors="replace")
        match = re.search(r'(?m)^\s*modId\s*=\s*["\']([^"\']+)["\']', text)
        if match and not match.group(1).startswith("${"):
            mod_id = match.group(1).strip()
    if not re.fullmatch(r"[a-z][a-z0-9_]{1,63}", mod_id):
        raise ConversionBlock(f"invalid or missing NeoForge mod id: {mod_id!r}")
    group = str(props.get("mod_group_id") or props.get("group") or "com.example").strip() or "com.example"
    version = str(props.get("mod_version") or props.get("version") or "1.0.0").strip() or "1.0.0"
    name = str(props.get("mod_name") or mod_id.replace("_", " ").title()).strip()
    minecraft = str(props.get("minecraft_version") or "").strip()
    return {"mod_id": mod_id, "group": group, "version": version, "name": name, "minecraft": minecraft}


def copy_file(source: pathlib.Path, target: pathlib.Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def copy_tree_overlay(source: pathlib.Path, target: pathlib.Path, *, skip_names: set[str] | None = None) -> int:
    if not source.is_dir():
        return 0
    skip_names = skip_names or set()
    count = 0
    for path in sorted(p for p in source.rglob("*") if p.is_file()):
        if path.name in skip_names:
            continue
        rel = path.relative_to(source)
        copy_file(path, target / rel)
        count += 1
    return count


def replace_source_roots(source: pathlib.Path, output: pathlib.Path) -> dict[str, int]:
    copied: dict[str, int] = {}
    for rel in ("src/main/java", "src/client/java", "src/main/kotlin", "src/client/kotlin"):
        dst = output / rel
        if dst.exists():
            shutil.rmtree(dst)
        count = copy_tree_overlay(source / rel, dst)
        if count:
            copied[rel] = count
    return copied


def carry_resources(source: pathlib.Path, output: pathlib.Path, loader: str) -> dict[str, int]:
    copied: dict[str, int] = {}
    skips: set[str] = set()
    if loader == "fabric":
        skips.add("fabric.mod.json")
    elif loader == "neoforge":
        skips.add("neoforge.mods.toml")
    roots = ["src/main/resources", "src/client/resources", "src/generated/resources"]
    if loader == "neoforge":
        roots.append("src/main/templates")
    for rel in roots:
        count = copy_tree_overlay(
            source / rel,
            output / rel,
            skip_names=skips if rel in {"src/main/resources", "src/main/templates"} else set(),
        )
        if count:
            copied[rel] = count
    return copied



TARGET_OWNED_GRADLE_PROPERTIES = {
    "minecraft_version", "minecraft_version_range", "loader_version", "loader_version_range",
    "loom_version", "fabric_api_version", "neo_version", "parchment_minecraft_version",
    "parchment_mappings_version", "mod_id", "mod_name", "mod_license", "mod_version",
    "mod_group_id", "maven_group", "archives_base_name",
}
CORE_DEPENDENCY_MARKERS = (
    "com.mojang:minecraft:",
    "net.fabricmc:fabric-loader:",
    "net.fabricmc.fabric-api:fabric-api:",
)


def merge_gradle_properties(source: pathlib.Path, output: pathlib.Path) -> list[str]:
    src = source / "gradle.properties"
    dst = output / "gradle.properties"
    if not src.is_file() or not dst.is_file():
        return []
    target_props = parse_properties(dst)
    preserved: list[str] = []
    additions: list[str] = []
    for raw in src.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith(("#", "!")):
            continue
        sep = "=" if "=" in line else ":" if ":" in line else None
        if not sep:
            continue
        key, _ = line.split(sep, 1)
        key = key.strip()
        if key in TARGET_OWNED_GRADLE_PROPERTIES or key in target_props:
            continue
        additions.append(raw)
        preserved.append(key)
    if additions:
        text = dst.read_text(encoding="utf-8", errors="replace").rstrip()
        text += "\n\n# Preserved from legacy source by Northpoint\n" + "\n".join(additions) + "\n"
        dst.write_text(text, encoding="utf-8")
    return preserved


def _copy_support_tree(source: pathlib.Path, output: pathlib.Path, rel: str, *, skip_prefixes: tuple[str, ...] = ()) -> int:
    root = source / rel
    if not root.is_dir():
        return 0
    count = 0
    for path in sorted(p for p in root.rglob("*") if p.is_file()):
        child = path.relative_to(root).as_posix()
        if any(child == prefix or child.startswith(prefix.rstrip("/") + "/") for prefix in skip_prefixes):
            continue
        copy_file(path, output / rel / child)
        count += 1
    return count


def carry_build_support_files(source: pathlib.Path, output: pathlib.Path) -> dict[str, int]:
    copied: dict[str, int] = {}
    specs = (
        ("libs", ()),
        ("gradle", ("wrapper",)),
        ("buildSrc", ()),
        ("build-logic", ()),
    )
    for rel, skips in specs:
        count = _copy_support_tree(source, output, rel, skip_prefixes=skips)
        if count:
            copied[rel] = count
    return copied


def _brace_delta(line: str) -> int:
    depth = 0
    quote: str | None = None
    escaped = False
    i = 0
    while i < len(line):
        ch = line[i]
        nxt = line[i + 1] if i + 1 < len(line) else ""
        if quote:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = None
            i += 1
            continue
        if ch in {"'", '"'}:
            quote = ch
            i += 1
            continue
        if ch == "/" and nxt == "/":
            break
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        i += 1
    return depth


def extract_gradle_blocks(text: str, names: set[str]) -> list[tuple[str, str]]:
    lines = text.splitlines()
    out: list[tuple[str, str]] = []
    i = 0
    while i < len(lines):
        match = re.match(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*\{", lines[i])
        if not match or match.group(1) not in names:
            i += 1
            continue
        name = match.group(1)
        block = [lines[i]]
        depth = _brace_delta(lines[i])
        i += 1
        while i < len(lines) and depth > 0:
            block.append(lines[i])
            depth += _brace_delta(lines[i])
            i += 1
        if depth == 0:
            out.append((name, "\n".join(block)))
    return out


def _filter_dependency_block(block: str) -> str | None:
    lines = block.splitlines()
    kept: list[str] = []
    removed = 0
    for line in lines:
        if any(marker in line for marker in CORE_DEPENDENCY_MARKERS):
            removed += 1
            continue
        kept.append(line)
    body = "\n".join(kept)
    if not re.search(r"(?m)^\s*[^}/\s].+", body):
        return None
    return body


def preserve_gradle_build_fragments(source: pathlib.Path, output: pathlib.Path) -> dict[str, int]:
    source_build = source / "build.gradle"
    target_build = output / "build.gradle"
    if not source_build.is_file() or not target_build.is_file():
        return {}
    blocks = extract_gradle_blocks(
        source_build.read_text(encoding="utf-8", errors="replace"),
        {"repositories", "dependencies"},
    )
    fragments: list[str] = []
    counts = {"repositories": 0, "dependencies": 0}
    for name, block in blocks:
        if name == "dependencies":
            block = _filter_dependency_block(block)
            if not block:
                continue
        fragments.append(block)
        counts[name] += 1
    if not fragments:
        return {}
    fragment_path = output / "northpoint-preserved.gradle"
    fragment_path.write_text(
        "// Preserved source build metadata. Target loader/Minecraft pins remain authoritative.\n\n"
        + "\n\n".join(fragments).rstrip()
        + "\n",
        encoding="utf-8",
    )
    target = target_build.read_text(encoding="utf-8", errors="replace").rstrip()
    apply_line = 'apply from: file("northpoint-preserved.gradle")'
    if apply_line not in target:
        target += "\n\n// Northpoint zero-loss source build metadata\n" + apply_line + "\n"
        target_build.write_text(target, encoding="utf-8")
    return {k: v for k, v in counts.items() if v}


def carry_wrapper(source: pathlib.Path, output: pathlib.Path) -> list[str]:
    carried: list[str] = []
    for rel in ("gradlew", "gradlew.bat", "gradle/wrapper/gradle-wrapper.jar"):
        src = source / rel
        if src.is_file():
            copy_file(src, output / rel)
            carried.append(rel)
    # Keep the target scaffold's gradle-wrapper.properties: it is target toolchain authority.
    return carried


def migrate_fabric_metadata(source: pathlib.Path, output: pathlib.Path) -> list[str]:
    src_path = source / "src/main/resources/fabric.mod.json"
    dst_path = output / "src/main/resources/fabric.mod.json"
    src = read_json(src_path)
    target = read_json(dst_path)
    merged = dict(src)
    merged["schemaVersion"] = int(src.get("schemaVersion") or target.get("schemaVersion") or 1)
    merged["id"] = str(src.get("id") or target.get("id"))
    merged["version"] = src.get("version") or target.get("version") or "${version}"
    merged["environment"] = src.get("environment", target.get("environment", "*"))
    depends = dict(src.get("depends") or {})
    target_depends = dict(target.get("depends") or {})
    depends["fabricloader"] = target_depends.get("fabricloader", ">=0.19.5")
    depends["minecraft"] = "~26.3"
    depends["java"] = ">=25"
    if "fabric-api" in depends or "fabric-api" in target_depends:
        depends["fabric-api"] = "*"
    merged["depends"] = depends
    write_json(dst_path, merged)
    return ["fabric-metadata-target-dependencies"]


def migrate_neoforge_metadata(source: pathlib.Path, output: pathlib.Path) -> list[str]:
    src_path = _neoforge_metadata_path(source)
    if not src_path:
        return []
    text = src_path.read_text(encoding="utf-8", errors="replace")
    lines: list[str] = []
    active_dependency: str | None = None
    for raw in text.splitlines():
        stripped = raw.strip()
        if re.match(r"^(?:modLoader|loaderVersion)\s*=", stripped):
            continue
        if stripped.startswith("[[dependencies."):
            active_dependency = None
        mod_match = re.match(r'^modId\s*=\s*["\']([^"\']+)["\']', stripped)
        if mod_match:
            dep_id = mod_match.group(1)
            if dep_id in {"neoforge", "minecraft"}:
                active_dependency = dep_id
        if active_dependency and re.match(r"^versionRange\s*=", stripped):
            indent = raw[: len(raw) - len(raw.lstrip())]
            replacement = "[${neo_version},)" if active_dependency == "neoforge" else "${minecraft_version_range}"
            raw = f'{indent}versionRange="{replacement}"'
        lines.append(raw)
    target = output / "src/main/templates/META-INF/neoforge.mods.toml"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return ["neoforge-metadata-target-schema"]


def rewrite_neoforge_property_factories(output: pathlib.Path) -> list[dict[str, Any]]:
    rules = [
        (
            "neoforge-register-simple-block-properties-factory",
            re.compile(r'(registerSimpleBlock\(\s*[^,\n]+,\s*)BlockBehaviour\.Properties\.of\(\)'),
            r"\1p -> p",
        ),
        (
            "neoforge-register-simple-item-properties-factory",
            re.compile(r'(registerSimpleItem\(\s*[^,\n]+,\s*)new\s+Item\.Properties\(\)'),
            r"\1p -> p",
        ),
    ]
    rows: list[dict[str, Any]] = []
    for path in sorted(output.rglob("*.java")):
        text = path.read_text(encoding="utf-8", errors="replace")
        changed = text
        for rule_id, pattern, replacement in rules:
            changed, count = pattern.subn(replacement, changed)
            if count:
                rows.append({"rule": rule_id, "path": path.relative_to(output).as_posix(), "count": count})
        if changed != text:
            path.write_text(changed, encoding="utf-8")
    return rows


def rewrite_resource_location_java(output: pathlib.Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(output.rglob("*.java")):
        text = path.read_text(encoding="utf-8", errors="replace")
        if "net.minecraft.resources.ResourceLocation" not in text:
            continue
        changed = text.replace("net.minecraft.resources.ResourceLocation", "net.minecraft.resources.Identifier")
        changed = re.sub(r"\bResourceLocation\b", "Identifier", changed)
        if changed != text:
            path.write_text(changed, encoding="utf-8")
            rows.append({"rule": "resource-location-to-identifier", "path": path.relative_to(output).as_posix()})
    return rows


def rewrite_mixin_java_level(output: pathlib.Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(output.rglob("*.json")):
        name = path.name.lower()
        if "mixin" not in name:
            continue
        try:
            value = read_json(path)
        except Exception:
            continue
        level = str(value.get("compatibilityLevel") or "")
        if level == "JAVA_25":
            continue
        if re.fullmatch(r"JAVA_(?:8|11|16|17|18|19|20|21|22|23|24)", level):
            value["compatibilityLevel"] = "JAVA_25"
            write_json(path, value)
            rows.append({"rule": "legacy-mixin-java-level", "path": path.relative_to(output).as_posix(), "from": level, "to": "JAVA_25"})
    return rows


def run_pipeline(source: pathlib.Path, output: pathlib.Path, loader: str, identity: dict[str, str], pipeline_script: pathlib.Path) -> None:
    cmd = [
        sys.executable,
        str(pipeline_script),
        str(source),
        "--loader", loader,
        "--output", str(output),
        "--mod-id", identity["mod_id"],
        "--mod-name", identity["name"],
        "--group", identity["group"],
        "--mod-version", identity["version"],
    ]
    cp = subprocess.run(cmd, cwd=str(SCRIPT_DIR), text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if cp.returncode:
        raise ConversionBlock((cp.stderr or cp.stdout or "26.3 pipeline failed").strip()[-12000:])


def materialize_port(source: pathlib.Path, output: pathlib.Path, loader: str, *, pipeline_script: pathlib.Path | None = None) -> dict[str, Any]:
    source = source.resolve()
    output = output.resolve()
    if not source.is_dir():
        raise ConversionBlock(f"source project does not exist: {source}")
    if loader == "fabric":
        identity = detect_fabric_identity(source)
    elif loader == "neoforge":
        identity = detect_neoforge_identity(source)
    else:
        raise ConversionBlock(f"automatic inferred-source 26.3 materialization is not implemented for loader {loader!r}")
    if identity["minecraft"] == TARGET_MINECRAFT:
        raise ConversionBlock("source already targets 26.3; conversion materialization is unnecessary")
    if output.exists():
        shutil.rmtree(output)
    source_before = tree_digest(source)
    run_pipeline(source, output, loader, identity, (pipeline_script or DEFAULT_PIPELINE).resolve())

    copied_sources = replace_source_roots(source, output)
    copied_resources = carry_resources(source, output, loader)
    wrapper_files = carry_wrapper(source, output)
    preserved_gradle_properties = merge_gradle_properties(source, output)
    preserved_build_files = carry_build_support_files(source, output)
    preserved_gradle_blocks = preserve_gradle_build_fragments(source, output)
    applied: list[dict[str, Any]] = []
    if loader == "fabric":
        for rule in migrate_fabric_metadata(source, output):
            applied.append({"rule": rule, "path": "src/main/resources/fabric.mod.json"})
    elif loader == "neoforge":
        for rule in migrate_neoforge_metadata(source, output):
            applied.append({"rule": rule, "path": "src/main/templates/META-INF/neoforge.mods.toml"})
        applied.extend(rewrite_neoforge_property_factories(output))
    applied.extend(rewrite_resource_location_java(output))
    applied.extend(rewrite_mixin_java_level(output))

    source_after = tree_digest(source)
    if source_after != source_before:
        raise ConversionBlock("source tree changed during materialization; conversion aborted to preserve source authority")

    manifest = {
        "schema_version": 1,
        "source": {
            "path": str(source),
            "sha256": source_before,
            "minecraft": identity.get("minecraft") or None,
            "loader": loader,
            "mod_id": identity["mod_id"],
        },
        "target": {"path": str(output), "minecraft": TARGET_MINECRAFT, "loader": loader, "java": TARGET_JAVA},
        "copied_source_roots": copied_sources,
        "copied_resource_roots": copied_resources,
        "wrapper_files": wrapper_files,
        "preserved_gradle_properties": preserved_gradle_properties,
        "preserved_build_files": preserved_build_files,
        "preserved_gradle_blocks": preserved_gradle_blocks,
        "applied_rewrites": applied,
        "applied_rule_ids": sorted({str(row.get("rule")) for row in applied}),
        "unresolved_semantics_evidence": "devkit-evidence/semantic-port-plan.json",
        "target_sha256": tree_digest(output),
        "source_unchanged": True,
    }
    evidence = output / "devkit-evidence" / "northpoint-conversion.json"
    write_json(evidence, manifest)
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=pathlib.Path, required=True)
    parser.add_argument("--output", type=pathlib.Path, required=True)
    parser.add_argument("--loader", choices=["fabric", "neoforge"], required=True)
    parser.add_argument("--pipeline", type=pathlib.Path, help=argparse.SUPPRESS)
    args = parser.parse_args()
    try:
        manifest = materialize_port(args.source, args.output, args.loader, pipeline_script=args.pipeline)
    except ConversionBlock as exc:
        print(json.dumps({"status": "BLOCKED", "reason": str(exc)}))
        return 4
    print(json.dumps({"status": "PASS", "manifest": manifest}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
