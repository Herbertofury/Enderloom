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
        stripped = line.strip()
        if any(marker in line for marker in CORE_DEPENDENCY_MARKERS):
            removed += 1
            continue
        if re.match(r"^mappings\b", stripped):
            removed += 1
            continue
        kept.append(line)
    body = "\n".join(kept)
    if not re.search(r"(?m)^\s*[^}/\s].+", body):
        return None
    return body


def _safe_fabric_loom_access_widener_block(source: pathlib.Path, block: str) -> str | None:
    match = re.search(
        r'''(?m)^\s*accessWidenerPath\s*=\s*file\(\s*["']([^"']+)["']\s*\)\s*$''',
        block,
    )
    if not match:
        return None
    rel = match.group(1).strip().replace("\\", "/")
    rel_path = pathlib.PurePosixPath(rel)
    if not rel or rel_path.is_absolute() or ".." in rel_path.parts:
        return None
    widener = source / pathlib.Path(*rel_path.parts)
    if not widener.is_file():
        return None

    lines = widener.read_text(encoding="utf-8", errors="replace").splitlines()
    header_index = next(
        (i for i, line in enumerate(lines) if line.strip() and not line.lstrip().startswith("#")),
        None,
    )
    if header_index is None:
        return None
    header = lines[header_index].strip()
    header_match = re.fullmatch(
        r"(?:accessWidener|classTweaker)\s+v\d+\s+([A-Za-z0-9_.-]+)",
        header,
    )
    if not header_match:
        return None
    namespace = header_match.group(1)
    directives = [
        line.strip()
        for line in lines[header_index + 1 :]
        if line.strip() and not line.lstrip().startswith("#")
    ]
    # Minecraft 26.1+ is unobfuscated. A non-empty legacy named widener needs
    # symbol-aware conversion; silently wiring it into the target would be unsafe.
    if namespace != "official" and directives:
        return None

    return 'loom {\n    accessWidenerPath = file("' + rel + '")\n}'


def preserve_gradle_build_fragments(source: pathlib.Path, output: pathlib.Path, loader: str) -> dict[str, int]:
    source_build = source / "build.gradle"
    target_build = output / "build.gradle"
    if not source_build.is_file() or not target_build.is_file():
        return {}

    names = {"repositories", "dependencies"}
    if loader == "fabric":
        names.add("loom")
    blocks = extract_gradle_blocks(
        source_build.read_text(encoding="utf-8", errors="replace"),
        names,
    )
    fragments: list[str] = []
    counts = {"repositories": 0, "dependencies": 0, "loom_access_widener": 0}
    for name, block in blocks:
        count_name = name
        if name == "dependencies":
            block = _filter_dependency_block(block)
            if not block:
                continue
        elif name == "loom":
            block = _safe_fabric_loom_access_widener_block(source, block)
            if not block:
                continue
            count_name = "loom_access_widener"
        fragments.append(block)
        counts[count_name] += 1

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



def adapt_fabric_source_layout(source: pathlib.Path, output: pathlib.Path) -> list[dict[str, Any]]:
    # Legacy/conventional Fabric projects commonly keep client and common code together in
    # src/main. Loom's splitEnvironmentSourceSets() intentionally removes client Minecraft
    # classes from the main compile classpath, so enabling it during conversion would break
    # an otherwise valid source layout. Preserve explicit split projects; keep unsplit ones
    # unsplit until a semantic migration deliberately separates ownership.
    has_client_root = any(
        (source / rel).is_dir()
        for rel in ("src/client/java", "src/client/kotlin", "src/client/resources")
    )
    if has_client_root:
        return []

    build = output / "build.gradle"
    if not build.is_file():
        return []
    text = build.read_text(encoding="utf-8", errors="replace")
    changed = re.sub(r"(?m)^\s*splitEnvironmentSourceSets\(\)\s*\n", "", text)
    changed = re.sub(r"(?m)^\s*sourceSet\s+sourceSets\.client\s*\n", "", changed)
    if changed == text:
        return []
    build.write_text(changed, encoding="utf-8")
    return [{
        "rule": "fabric-preserve-unsplit-source-layout",
        "path": "build.gradle",
        "source_layout": "src/main",
    }]



def normalize_empty_fabric_access_wideners(output: pathlib.Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(output.rglob("*.accesswidener")):
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        if not lines:
            continue
        header_index = next((i for i, line in enumerate(lines) if line.strip() and not line.lstrip().startswith("#")), None)
        if header_index is None:
            continue
        header = lines[header_index]
        match = re.match(r"^(\s*accessWidener\s+v\d+\s+)(named|intermediary)(\s*)$", header)
        if not match:
            continue
        substantive = [
            line for i, line in enumerate(lines)
            if i != header_index and line.strip() and not line.lstrip().startswith("#")
        ]
        if substantive:
            # Symbol-bearing wideners require exact namespace translation; never relabel them blindly.
            continue
        lines[header_index] = match.group(1) + "official" + match.group(3)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        rows.append({
            "rule": "fabric-empty-access-widener-official-namespace",
            "path": path.relative_to(output).as_posix(),
            "from": match.group(2),
            "to": "official",
        })
    return rows


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



def _find_matching_java_brace(text: str, open_index: int) -> int | None:
    if open_index < 0 or open_index >= len(text) or text[open_index] != "{":
        return None
    depth = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False
    i = open_index
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""
        if line_comment:
            if ch == "\n":
                line_comment = False
            i += 1
            continue
        if block_comment:
            if ch == "*" and nxt == "/":
                block_comment = False
                i += 2
                continue
            i += 1
            continue
        if quote:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = None
            i += 1
            continue
        if ch == "/" and nxt == "/":
            line_comment = True
            i += 2
            continue
        if ch == "/" and nxt == "*":
            block_comment = True
            i += 2
            continue
        if ch in {'"', "'"}:
            quote = ch
            i += 1
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return None


def _ensure_java_import(text: str, fqcn: str) -> str:
    statement = f"import {fqcn};"
    if statement in text:
        return text
    package_match = re.search(r"(?m)^package\s+[^;]+;\s*$", text)
    if package_match:
        end = package_match.end()
        return text[:end] + "\n\n" + statement + text[end:]
    return statement + "\n" + text


SEMANTIC_RESOLUTIONS_BY_REWRITE: dict[str, tuple[str, ...]] = {
    "minecraft-26.3-screen-renderables-to-super-extract": ("screen-private-renderables-access",),
}


def rewrite_minecraft_26_3_java(output: pathlib.Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(output.rglob("*.java")):
        text = path.read_text(encoding="utf-8", errors="replace")
        changed = text
        file_rules: list[tuple[str, int]] = []

        # 26.3 moved the public GPU/render API from Blaze3D into RenderPearl.
        # These are documented one-to-one API relocations only; semantic rendering
        # changes remain compiler-driven and are intentionally not rewritten here.
        renderpearl_relocations = {
            "com.mojang.blaze3d.GpuFormat": "com.mojang.renderpearl.api.GpuFormat",
            "com.mojang.blaze3d.IndexType": "com.mojang.renderpearl.api.pipeline.IndexType",
            "com.mojang.blaze3d.PrimitiveTopology": "com.mojang.renderpearl.api.pipeline.PrimitiveTopology",
            "com.mojang.blaze3d.buffers.GpuBuffer": "com.mojang.renderpearl.api.buffers.GpuBuffer",
            "com.mojang.blaze3d.buffers.GpuBufferSlice": "com.mojang.renderpearl.api.buffers.GpuBufferSlice",
            "com.mojang.blaze3d.pipeline.BindGroupLayout": "com.mojang.renderpearl.api.pipeline.BindGroupLayout",
            "com.mojang.blaze3d.pipeline.BlendFunction": "com.mojang.renderpearl.api.pipeline.BlendFunction",
            "com.mojang.blaze3d.pipeline.ColorTargetState": "com.mojang.renderpearl.api.pipeline.ColorTargetState",
            "com.mojang.blaze3d.pipeline.RenderPipeline": "com.mojang.renderpearl.api.pipeline.RenderPipeline",
            "com.mojang.blaze3d.shaders.UniformType": "com.mojang.renderpearl.api.pipeline.UniformType",
            "com.mojang.blaze3d.systems.CommandEncoder": "com.mojang.renderpearl.api.commands.CommandEncoder",
            "com.mojang.blaze3d.systems.RenderPass": "com.mojang.renderpearl.api.commands.RenderPass",
            "com.mojang.blaze3d.systems.GpuDevice": "com.mojang.renderpearl.api.device.GpuDevice",
        }
        renderpearl_count = 0
        for old_fqcn, new_fqcn in renderpearl_relocations.items():
            count = changed.count(old_fqcn)
            if count:
                changed = changed.replace(old_fqcn, new_fqcn)
                renderpearl_count += count
        texture_prefix = "com.mojang.blaze3d.textures."
        texture_count = changed.count(texture_prefix)
        if texture_count:
            changed = changed.replace(texture_prefix, "com.mojang.renderpearl.api.textures.")
            renderpearl_count += texture_count
        if renderpearl_count:
            file_rules.append(("minecraft-26.3-renderpearl-api-relocations", renderpearl_count))

        # 26.3 models texture/sampler bindings as combined-image-sampler uniforms.
        # Restrict builder rewrites to BindGroupLayout chains and pass rewrites to
        # variables source-typed as RenderPass inside the same method body.
        sampler_count = 0
        layout_pattern = re.compile(
            r'(?s)(BindGroupLayout\.builder\(\)(?:(?!\.build\(\)).)*?)\.withSampler\(\s*"([^"]+)"\s*\)'
        )
        changed, layout_count = layout_pattern.subn(
            lambda match: (
                match.group(1)
                + '.withUniform("'
                + match.group(2)
                + '", UniformType.COMBINED_IMAGE_SAMPLER)'
            ),
            changed,
        )
        if layout_count:
            changed = _ensure_java_import(changed, "com.mojang.renderpearl.api.pipeline.UniformType")
            sampler_count += layout_count

        render_pass_method = re.compile(
            r"(?s)\((?P<params>[^{};]*)\)\s*(?:throws\s+[^{}]+)?\{"
        )
        pass_scopes: list[tuple[int, int, set[str]]] = []
        for signature in render_pass_method.finditer(changed):
            body_open = signature.end() - 1
            body_close = _find_matching_java_brace(changed, body_open)
            if body_close is None:
                continue
            body = changed[body_open : body_close + 1]
            pass_names = set(
                re.findall(
                    r"\b(?:com\.mojang\.renderpearl\.api\.commands\.)?RenderPass\s+([A-Za-z_$][A-Za-z0-9_$]*)\b",
                    signature.group("params") + "\n" + body,
                )
            )
            if pass_names:
                pass_scopes.append((body_open, body_close, pass_names))

        for body_open, body_close, pass_names in reversed(pass_scopes):
            body = changed[body_open : body_close + 1]
            rewritten = body
            local_count = 0
            for name in sorted(pass_names, key=len, reverse=True):
                rewritten, count = re.subn(
                    rf"\b{re.escape(name)}\.bindTexture\(",
                    f"{name}.setUniform(",
                    rewritten,
                )
                local_count += count
            if local_count:
                changed = changed[:body_open] + rewritten + changed[body_close + 1 :]
                sampler_count += local_count

        if sampler_count:
            file_rules.append(("minecraft-26.3-renderpearl-sampler-uniforms", sampler_count))

        # 26.3 moved keyboard constants off GLFW and onto Minecraft's SDL-backed InputConstants.
        changed, key_count = re.subn(r"\bGLFW\.GLFW_KEY_([A-Z0-9_]+)\b", r"InputConstants.KEY_\1", changed)
        if key_count:
            changed = _ensure_java_import(changed, "com.mojang.blaze3d.platform.InputConstants")
            if "GLFW." not in changed:
                changed = re.sub(r"(?m)^\s*import\s+org\.lwjgl\.glfw\.GLFW;\s*\n", "", changed)
            file_rules.append(("minecraft-26.3-glfw-key-to-inputconstants", key_count))

        # 26.3 replaced GLFW keyboard polling/action codes with SDL-backed InputConstants.
        # These are one-to-one input semantics; cursor, clipboard, and key-name APIs are
        # intentionally left for separate migrations.
        input_core_count = 0
        changed, poll_count = re.subn(
            r"GLFW\.glfwGetKey\(\s*[^,\n]+,\s*([^)\n]+)\)\s*==\s*GLFW\.GLFW_PRESS",
            lambda match: f"InputConstants.isKeyDown({match.group(1).strip()})",
            changed,
        )
        input_core_count += poll_count

        input_replacements = {
            "GLFW.GLFW_PRESS": "InputConstants.PRESS",
            "GLFW.GLFW_RELEASE": "InputConstants.RELEASE",
            "GLFW.GLFW_REPEAT": "InputConstants.REPEAT",
            "InputConstants.Type.KEYSYM": "InputConstants.Type.KEYBOARD",
            "InputConstants.KEY_LEFT_SHIFT": "InputConstants.KEY_LSHIFT",
            "InputConstants.KEY_RIGHT_SHIFT": "InputConstants.KEY_RSHIFT",
            "InputConstants.KEY_LEFT_CONTROL": "InputConstants.KEY_LCONTROL",
            "InputConstants.KEY_RIGHT_CONTROL": "InputConstants.KEY_RCONTROL",
            "InputConstants.KEY_ENTER": "InputConstants.KEY_RETURN",
        }
        for old_value, new_value in input_replacements.items():
            count = changed.count(old_value)
            if count:
                changed = changed.replace(old_value, new_value)
                input_core_count += count

        if input_core_count:
            changed = _ensure_java_import(changed, "com.mojang.blaze3d.platform.InputConstants")
            if "GLFW." not in changed:
                changed = re.sub(r"(?m)^\s*import\s+org\.lwjgl\.glfw\.GLFW;\s*\n", "", changed)
            file_rules.append(("minecraft-26.3-sdl-input-core", input_core_count))

        # 26.3 removed GLFW key-name and direct clipboard helpers. Minecraft's
        # SDL-backed key display name preserves layout awareness, while KeyboardHandler
        # remains the supported clipboard surface.
        text_input_count = 0
        changed, key_name_count = re.subn(
            r"GLFW\.glfwGetKeyName\(\s*([^,\n]+),\s*(?:[^()\n]|\([^()\n]*\))+\)",
            lambda match: (
                f"InputConstants.Type.KEYBOARD.getOrCreate({match.group(1).strip()})"
                ".getDisplayName().getString()"
            ),
            changed,
        )
        text_input_count += key_name_count

        changed, clipboard_set_count = re.subn(
            r"GLFW\.glfwSetClipboardString\(\s*[^,\n]+,\s*([^)\n]+)\)",
            lambda match: f"Minecraft.getInstance().keyboardHandler.setClipboard({match.group(1).strip()})",
            changed,
        )
        text_input_count += clipboard_set_count

        changed, clipboard_get_count = re.subn(
            r"GLFW\.glfwGetClipboardString\(\s*[^)\n]+\)",
            "Minecraft.getInstance().keyboardHandler.getClipboard()",
            changed,
        )
        text_input_count += clipboard_get_count

        if text_input_count:
            changed = _ensure_java_import(changed, "com.mojang.blaze3d.platform.InputConstants")
            changed = _ensure_java_import(changed, "net.minecraft.client.Minecraft")
            if "GLFW." not in changed:
                changed = re.sub(r"(?m)^\s*import\s+org\.lwjgl\.glfw\.GLFW;\s*\n", "", changed)
            file_rules.append(("minecraft-26.3-glfw-text-input-helpers", text_input_count))

        # 26.3 standard cursors are CursorType objects instead of raw GLFW handles.
        # This bounded wrapper migration applies only when a file actually creates
        # GLFW standard cursors and stores them in the conventional cached cursor field.
        cursor_factory_relocations = {
            "GLFW.glfwCreateStandardCursor(GLFW.GLFW_HAND_CURSOR)": "CursorTypes.POINTING_HAND",
            "GLFW.glfwCreateStandardCursor(GLFW.GLFW_IBEAM_CURSOR)": "CursorTypes.IBEAM",
            "GLFW.glfwCreateStandardCursor(GLFW.GLFW_HRESIZE_CURSOR)": "CursorTypes.RESIZE_EW",
            "GLFW.glfwCreateStandardCursor(GLFW.GLFW_VRESIZE_CURSOR)": "CursorTypes.RESIZE_NS",
            "GLFW.glfwCreateStandardCursor(GLFW.GLFW_ARROW_CURSOR)": "CursorTypes.ARROW",
        }
        cursor_factory_count = 0
        for old_value, new_value in cursor_factory_relocations.items():
            count = changed.count(old_value)
            if count:
                changed = changed.replace(old_value, new_value)
                cursor_factory_count += count

        if cursor_factory_count:
            changed, cursor_field_count = re.subn(
                r"\bprivate\s+long\s+cursor\s*;",
                "private CursorType cursor;",
                changed,
                count=1,
            )
            changed, cursor_return_count = re.subn(
                r"\bpublic\s+long\s+getGlfwCursor\s*\(\s*\)",
                "public CursorType getGlfwCursor()",
                changed,
                count=1,
            )
            if not cursor_field_count or not cursor_return_count:
                raise ConversionBlock(
                    f"standard GLFW cursor factories in {path} require an unrecognized cursor wrapper shape"
                )
            changed = _ensure_java_import(changed, "com.mojang.blaze3d.platform.cursor.CursorType")
            changed = _ensure_java_import(changed, "com.mojang.blaze3d.platform.cursor.CursorTypes")

        changed, cursor_select_count = re.subn(
            r"GLFW\.glfwSetCursor\(\s*[^,\n]+,\s*([A-Za-z_$][A-Za-z0-9_$.]*\.getGlfwCursor\(\))\s*\)",
            lambda match: f"{match.group(1)}.select()",
            changed,
        )
        cursor_count = cursor_factory_count + cursor_select_count
        if cursor_count:
            if "GLFW." not in changed:
                changed = re.sub(r"(?m)^\s*import\s+org\.lwjgl\.glfw\.GLFW;\s*\n", "", changed)
            file_rules.append(("minecraft-26.3-glfw-standard-cursor-wrapper", cursor_count))

        # Authlib 10 (Minecraft 26.3) moved stable service value types out of yggdrasil.
        # Service construction is a separate semantic migration and is intentionally excluded.
        authlib_relocations = {
            "com.mojang.authlib.yggdrasil.ProfileResult": "com.mojang.authlib.services.ProfileResult",
            "com.mojang.authlib.yggdrasil.FriendsService": "com.mojang.authlib.services.FriendsService",
        }
        authlib_count = 0
        for old_fqcn, new_fqcn in authlib_relocations.items():
            count = changed.count(old_fqcn)
            if count:
                changed = changed.replace(old_fqcn, new_fqcn)
                authlib_count += count
        if authlib_count:
            file_rules.append(("minecraft-26.3-authlib-service-package-relocations", authlib_count))

        # Authlib 10 replaced the single-proxy Yggdrasil service constructor with
        # MinecraftServicesDiscoveryService.create(proxy). The downstream token factories
        # retain createUserApiService/createFriendsService, so this exact pattern is safe.
        changed, discovery_count = re.subn(
            r"\bYggdrasilAuthenticationService\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*new\s+YggdrasilAuthenticationService\(\s*([^;\n]+?)\s*\)\s*;",
            lambda match: (
                f"MinecraftServicesDiscoveryService {match.group(1)} = "
                f"MinecraftServicesDiscoveryService.create({match.group(2).strip()});"
            ),
            changed,
        )
        if discovery_count:
            changed = _ensure_java_import(changed, "com.mojang.authlib.services.MinecraftServicesDiscoveryService")
            without_yggdrasil_import = re.sub(
                r"(?m)^\s*import\s+com\.mojang\.authlib\.yggdrasil\.YggdrasilAuthenticationService;\s*\n",
                "",
                changed,
            )
            if not re.search(r"\bYggdrasilAuthenticationService\b", without_yggdrasil_import):
                changed = without_yggdrasil_import
            file_rules.append(("minecraft-26.3-authlib-discovery-service-constructor", discovery_count))

        # 26.2 moved current-screen ownership from Minecraft to Gui.
        replacements = [
            ("minecraft-options-hide-gui-to-hud-hidden", r"\bMinecraft\.getInstance\(\)\.options\.hideGui\b", "Minecraft.getInstance().gui.hud.isHidden()"),
            ("minecraft-options-hide-gui-to-hud-hidden", r"\b(this\.minecraft|client|minecraft|mc)\.options\.hideGui\b", r"\1.gui.hud.isHidden()"),
            ("minecraft-gui-set-screen", r"\bMinecraft\.getInstance\(\)\.setScreen\(", "Minecraft.getInstance().gui.setScreen("),
            ("minecraft-gui-screen-accessor", r"\bMinecraft\.getInstance\(\)\.screen\b(?!\s*\()", "Minecraft.getInstance().gui.screen()"),
            ("minecraft-gui-set-screen", r"\b(this\.minecraft|client|minecraft|mc)\.setScreen\(", r"\1.gui.setScreen("),
            ("minecraft-gui-screen-accessor", r"\b(this\.minecraft|client|minecraft|mc)\.screen\b(?!\s*\()", r"\1.gui.screen()"),
            ("minecraft-gui-to-hud-overlay", r"\.gui\.setOverlayMessage\(", ".gui.hud.setOverlayMessage("),
        ]
        for rule_id, pattern, replacement in replacements:
            changed, count = re.subn(pattern, replacement, changed)
            if count:
                file_rules.append((rule_id, count))

        # BlockPos#getCenter was removed; Vec3.atCenterOf preserves the exact center semantics.
        block_pos_names = set(re.findall(r"\bBlockPos\s+([A-Za-z_$][A-Za-z0-9_$]*)\b", changed))
        center_count = 0
        for name in sorted(block_pos_names, key=len, reverse=True):
            pattern = rf"\b{re.escape(name)}\.getCenter\(\)"
            changed, count = re.subn(pattern, f"Vec3.atCenterOf({name})", changed)
            center_count += count
        if center_count:
            changed = _ensure_java_import(changed, "net.minecraft.world.phys.Vec3")
            file_rules.append(("minecraft-26.2-blockpos-center-to-vec3", center_count))

        # 26.3 removed BlockState#blocksMotion. Vanilla 26.2 semantics were
        # legacySolid/isSolid with COBWEB and BAMBOO_SAPLING explicitly walk-through.
        # Preserve that exact predicate instead of silently broadening to plain isSolid().
        blocks_motion_count = 0
        block_state_names = set(
            re.findall(r"\bBlockState\s+([A-Za-z_$][A-Za-z0-9_$]*)\b", changed)
        )
        for name in sorted(block_state_names, key=len, reverse=True):
            replacement = (
                f"({name}.getBlock() != Blocks.COBWEB && "
                f"{name}.getBlock() != Blocks.BAMBOO_SAPLING && {name}.isSolid())"
            )
            changed, count = re.subn(
                rf"\b{re.escape(name)}\.blocksMotion\(\)",
                replacement,
                changed,
            )
            blocks_motion_count += count

        get_block_state_pattern = re.compile(
            r"(?P<receiver>\b[A-Za-z_$][A-Za-z0-9_$.]*\.getBlockState\([^()\n]*\))\.blocksMotion\(\)"
        )
        def _blocks_motion_call(match: re.Match[str]) -> str:
            receiver = match.group("receiver")
            return (
                f"({receiver}.getBlock() != Blocks.COBWEB && "
                f"{receiver}.getBlock() != Blocks.BAMBOO_SAPLING && {receiver}.isSolid())"
            )

        changed, call_count = get_block_state_pattern.subn(_blocks_motion_call, changed)
        blocks_motion_count += call_count
        if blocks_motion_count:
            changed = _ensure_java_import(changed, "net.minecraft.world.level.block.Blocks")
            file_rules.append(("minecraft-26.3-blockstate-blocks-motion", blocks_motion_count))

        # 26.3 renamed KeyEvent#scancode to keycode. Restrict the rewrite to
        # the body of a method/constructor whose parameter is source-typed as
        # Minecraft KeyEvent, preventing same-name variables in other scopes from changing.
        method_scopes: list[tuple[int, int, set[str]]] = []
        method_signature = re.compile(
            r"(?s)\((?P<params>[^{};]*)\)\s*(?:throws\s+[^{}]+)?\{"
        )
        key_event_param = re.compile(
            r"\b(?:net\.minecraft\.client\.input\.)?KeyEvent\s+([A-Za-z_$][A-Za-z0-9_$]*)\b"
        )
        for signature in method_signature.finditer(changed):
            names = set(key_event_param.findall(signature.group("params")))
            if not names:
                continue
            body_open = signature.end() - 1
            body_close = _find_matching_java_brace(changed, body_open)
            if body_close is None:
                continue
            method_scopes.append((body_open, body_close, names))

        keycode_count = 0
        for body_open, body_close, names in reversed(method_scopes):
            body = changed[body_open : body_close + 1]
            rewritten = body
            local_count = 0
            for name in sorted(names, key=len, reverse=True):
                rewritten, count = re.subn(
                    rf"\b{re.escape(name)}\.scancode\(\)",
                    f"{name}.keycode()",
                    rewritten,
                )
                local_count += count
            if local_count:
                changed = changed[:body_open] + rewritten + changed[body_close + 1 :]
                keycode_count += local_count
        if keycode_count:
            file_rules.append(("minecraft-26.3-keyevent-scancode-to-keycode", keycode_count))

        # Screen.renderables is private on 26.3. For the exact legacy loop whose only
        # behavior is forwarding extractRenderState to every base Screen renderable,
        # super.extractRenderState(...) is behavior-equivalent to the 26.3 Screen implementation.
        is_screen_subclass = re.search(
            r"\bclass\s+[A-Za-z_$][A-Za-z0-9_$]*[^{\n]*\bextends\s+[A-Za-z0-9_$.]*Screen\b",
            changed,
        )
        if is_screen_subclass:
            loop_pattern = re.compile(
                r"(?ms)^(?P<indent>[ \t]*)for\s*\(\s*Renderable\s+(?P<var>[A-Za-z_$][A-Za-z0-9_$]*)"
                r"\s*:\s*this\.renderables\s*\)\s*\{\s*(?P=var)\.extractRenderState\("
                r"(?P<args>[^;{}]+)\)\s*;\s*\}"
            )

            def _screen_loop_replacement(match: re.Match[str]) -> str:
                return f"{match.group('indent')}super.extractRenderState({match.group('args').strip()});"

            changed, screen_loop_count = loop_pattern.subn(_screen_loop_replacement, changed)
            if screen_loop_count:
                renderable_import_pattern = r"(?m)^\s*import\s+net\.minecraft\.client\.gui\.components\.Renderable;\s*\n"
                without_renderable_import = re.sub(renderable_import_pattern, "", changed)
                if not re.search(r"\bRenderable\b", without_renderable_import):
                    changed = without_renderable_import
                file_rules.append(("minecraft-26.3-screen-renderables-to-super-extract", screen_loop_count))

        # 26.3 removed AxeItem; item tags preserve the semantic category and include modded axes.
        changed, axe_count = re.subn(
            r"\b([A-Za-z_$][A-Za-z0-9_$]*)\.getItem\(\)\s+instanceof\s+AxeItem\b",
            r"\1.is(ItemTags.AXES)",
            changed,
        )
        if axe_count:
            changed = _ensure_java_import(changed, "net.minecraft.tags.ItemTags")
            axe_import_pattern = r"(?m)^\s*import\s+net\.minecraft\.world\.item\.AxeItem;\s*\n"
            without_axe_import = re.sub(axe_import_pattern, "", changed)
            if not re.search(r"\bAxeItem\b", without_axe_import):
                changed = without_axe_import
            file_rules.append(("minecraft-26.3-axeitem-to-item-tag", axe_count))

        # The two-argument LivingEntity swing overload gained SwingAnimation in 26.3.
        changed, swing_count = re.subn(
            r"\.swing\(\s*(InteractionHand\.[A-Z_]+)\s*,\s*(true|false)\s*\)",
            r".swing(\1, SwingAnimation.DEFAULT, \2)",
            changed,
        )
        if swing_count:
            changed = _ensure_java_import(changed, "net.minecraft.world.item.component.SwingAnimation")
            file_rules.append(("minecraft-26.3-swing-animation-argument", swing_count))

        # 26.2 removed the distance-to-camera argument from deferred name-tag submission.
        changed, nametag_count = re.subn(
            r"(submitNameTag\([^;\n]*?),\s*[A-Za-z_$][A-Za-z0-9_$.]*\.distanceToCameraSq\s*,\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\)",
            r"\1, \2)",
            changed,
        )
        if nametag_count:
            file_rules.append(("minecraft-26.2-submit-name-tag-drop-distance", nametag_count))

        # 26.3 removed ServerboundSwingPacket. The new swing(..., SwingAnimation, sync)
        # path owns synchronization, so the explicit legacy packet is redundant and invalid.
        changed, packet_count = re.subn(
            r"(?ms)^[ \t]*(?:[A-Za-z_$][A-Za-z0-9_$]*\.)*connection\s*(?:\.\s*)?send\(\s*new\s+ServerboundSwingPacket\([^)]*\)\s*\);\s*\n",
            "",
            changed,
        )
        if packet_count:
            changed = re.sub(r"(?m)^\s*import\s+net\.minecraft\.network\.protocol\.game\.ServerboundSwingPacket;\s*\n", "", changed)
            file_rules.append(("minecraft-26.3-remove-serverbound-swing-packet", packet_count))

        if changed != text:
            path.write_text(changed, encoding="utf-8")
            for rule_id, count in file_rules:
                row: dict[str, Any] = {
                    "rule": rule_id,
                    "path": path.relative_to(output).as_posix(),
                    "count": count,
                }
                resolves = SEMANTIC_RESOLUTIONS_BY_REWRITE.get(rule_id)
                if resolves:
                    row["resolves_semantic"] = list(resolves)
                rows.append(row)
    return rows


def semantic_resolution_complete(output: pathlib.Path, semantic_id: str) -> bool:
    if semantic_id == "screen-private-renderables-access":
        hazard = re.compile(
            r"class\s+\w+[^\n{]*extends\s+[A-Za-z0-9_$.]*Screen\b[\s\S]{0,8000}\bthis\.renderables\b"
        )
        for path in sorted(output.rglob("*.java")):
            text = path.read_text(encoding="utf-8", errors="replace")
            if hazard.search(text):
                return False
        return True
    return False


def reconcile_semantic_ledger(output: pathlib.Path, applied: list[dict[str, Any]]) -> list[str]:
    resolved: dict[str, list[dict[str, Any]]] = {}
    for row in applied:
        for semantic_id in row.get("resolves_semantic") or []:
            resolved.setdefault(str(semantic_id), []).append({
                "rule": row.get("rule"),
                "path": row.get("path"),
                "count": row.get("count", 1),
            })
    if not resolved:
        return []

    ledger_path = output / "porting-ledger.json"
    if not ledger_path.is_file():
        return []
    ledger = read_json(ledger_path)
    changed = False
    for item in ledger.get("items") or []:
        if not isinstance(item, dict):
            continue
        item_id = str(item.get("id") or "")
        if not item_id.startswith("semantic:"):
            continue
        semantic_id = item_id.removeprefix("semantic:")
        evidence = resolved.get(semantic_id)
        if not evidence or item.get("status") != "missing":
            continue
        if not semantic_resolution_complete(output, semantic_id):
            continue
        item["status"] = "regenerated"
        item["target_evidence"] = evidence
        item["notes"] = f"Resolved by bounded Northpoint 26.3 rewrite(s): {', '.join(sorted({str(x.get('rule')) for x in evidence}))}"
        changed = True
    if changed:
        write_json(ledger_path, ledger)
    return sorted(
        semantic_id
        for semantic_id in resolved
        if any(
            isinstance(item, dict)
            and item.get("id") == f"semantic:{semantic_id}"
            and item.get("status") == "regenerated"
            for item in ledger.get("items") or []
        )
    )


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
    preserved_gradle_blocks = preserve_gradle_build_fragments(source, output, loader)
    applied: list[dict[str, Any]] = []
    if loader == "fabric" and preserved_gradle_blocks.get("loom_access_widener"):
        applied.append({
            "rule": "fabric-preserve-access-widener-path",
            "path": "northpoint-preserved.gradle",
            "count": int(preserved_gradle_blocks["loom_access_widener"]),
        })
    if loader == "fabric":
        for rule in migrate_fabric_metadata(source, output):
            applied.append({"rule": rule, "path": "src/main/resources/fabric.mod.json"})
        applied.extend(adapt_fabric_source_layout(source, output))
        applied.extend(normalize_empty_fabric_access_wideners(output))
    elif loader == "neoforge":
        for rule in migrate_neoforge_metadata(source, output):
            applied.append({"rule": rule, "path": "src/main/templates/META-INF/neoforge.mods.toml"})
        applied.extend(rewrite_neoforge_property_factories(output))
    applied.extend(rewrite_minecraft_26_3_java(output))
    applied.extend(rewrite_resource_location_java(output))
    applied.extend(rewrite_mixin_java_level(output))
    resolved_semantic_ids = reconcile_semantic_ledger(output, applied)

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
        "resolved_semantic_ids": resolved_semantic_ids,
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
