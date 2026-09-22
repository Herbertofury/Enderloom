#!/usr/bin/env python3
"""Materialize source-owned mod content into a target-native 26.3 scaffold.

This is intentionally conservative: it copies source-owned code/resources, regenerates loader
metadata only when the source/target loader family is understood, and records unresolved build/API
semantics instead of guessing. It never overwrites the target scaffold build/toolchain files.
"""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from typing import Any

from port_intake import inspect
from northpoint_source_intake import detect_runtime_scope

SKIP_PARTS = {
    ".git", ".gradle", ".idea", "build", "out", "run", ".northpoint",
}
FABRIC_META = "fabric.mod.json"
FORGE_META = "META-INF/mods.toml"
NEOFORGE_META = "META-INF/neoforge.mods.toml"


def _copy_file(src: Path, dst: Path, copied: list[dict[str, Any]], origin: str) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    copied.append({
        "origin": origin,
        "source": str(src),
        "target": str(dst),
        "size": dst.stat().st_size,
    })


def _iter_files(root: Path):
    if not root.is_dir():
        return
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if any(part in SKIP_PARTS for part in path.parts):
            continue
        yield path


def _fabric_manifest(source: Path, target: Path, mod_id: str, copied: list[dict[str, Any]], rewrites: list[dict[str, Any]]) -> bool:
    candidates = [
        source / "src/main/resources/fabric.mod.json",
        source / "fabric.mod.json",
    ]
    src = next((p for p in candidates if p.is_file()), None)
    if src is None:
        return False
    data = json.loads(src.read_text(encoding="utf-8"))
    before_depends = dict(data.get("depends") or {})
    data["schemaVersion"] = int(data.get("schemaVersion") or 1)
    data["id"] = mod_id
    data["version"] = "${version}"
    depends = dict(before_depends)
    if "fabric" in depends and "fabric-api" not in depends:
        depends["fabric-api"] = depends.pop("fabric")
        rewrites.append({
            "kind": "safe-json-rewrite",
            "id": "fabric-depends-old-fabric-id",
            "from": "fabric",
            "to": "fabric-api",
        })
    depends["fabricloader"] = ">=0.19.5"
    depends["minecraft"] = "~26.3"
    depends["java"] = ">=25"
    depends.setdefault("fabric-api", "*")
    data["depends"] = depends
    dst = target / "src/main/resources/fabric.mod.json"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    copied.append({
        "origin": "generated:loader-metadata",
        "source": str(src),
        "target": str(dst),
        "size": dst.stat().st_size,
    })
    rewrites.append({
        "kind": "target-metadata-normalization",
        "loader": "fabric",
        "minecraft": "26.3",
        "java": 25,
        "loader_min": "0.19.5",
    })
    return True


def materialize(source: Path, target: Path, loader: str, mod_id: str) -> dict[str, Any]:
    source = source.resolve()
    target = target.resolve()
    if not source.is_dir():
        raise RuntimeError(f"source is not a directory: {source}")
    if not target.is_dir():
        raise RuntimeError(f"target scaffold is not a directory: {target}")

    intake = inspect(source, loader)
    detected = list(intake.get("detected", {}).get("loaders") or [])
    copied: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    rewrites: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []

    source_sets = [
        ("src/main/java", "src/main/java"),
        ("src/client/java", "src/client/java"),
        ("src/main/kotlin", "src/main/kotlin"),
        ("src/client/kotlin", "src/client/kotlin"),
        ("src/generated/resources", "src/generated/resources"),
    ]
    for src_rel, dst_rel in source_sets:
        src_root = source / src_rel
        if not src_root.is_dir():
            continue
        if loader == "neoforge" and src_rel.startswith("src/client/"):
            unresolved.append({
                "kind": "source-set-layout",
                "path": src_rel,
                "reason": "NeoForge target scaffold does not declare a separate client source set; preserve manually after side-safety review.",
            })
            continue
        for path in _iter_files(src_root) or ():
            rel = path.relative_to(src_root)
            _copy_file(path, target / dst_rel / rel, copied, f"source-set:{src_rel}")

    resources = source / "src/main/resources"
    if resources.is_dir():
        for path in _iter_files(resources) or ():
            rel = path.relative_to(resources)
            rel_posix = rel.as_posix()
            if rel_posix in {FABRIC_META, FORGE_META, NEOFORGE_META}:
                skipped.append({
                    "path": f"src/main/resources/{rel_posix}",
                    "reason": "loader metadata is regenerated/normalized for the target",
                })
                continue
            _copy_file(path, target / "src/main/resources" / rel, copied, "source-set:src/main/resources")

    metadata_written = False
    if loader == "fabric":
        if detected and detected != ["fabric"]:
            unresolved.append({
                "kind": "loader-family",
                "source_loaders": detected,
                "target_loader": loader,
                "reason": "cross-loader source translation requires symbolic/semantic adapters; source content was preserved but metadata was not trusted",
            })
        else:
            metadata_written = _fabric_manifest(source, target, mod_id, copied, rewrites)
    elif loader == "neoforge":
        # Keep the target-native NeoForge template produced by the scaffold. Forge/NeoForge
        # annotations and event APIs are handled by symbolic/semantic migration, never blind
        # package replacement.
        unresolved.append({
            "kind": "loader-metadata",
            "target_loader": "neoforge",
            "reason": "target-native NeoForge metadata retained; source Forge/NeoForge metadata remains intake evidence only",
        })
        metadata_written = (target / "src/main/templates/META-INF/neoforge.mods.toml").is_file()

    build_files = [
        p for p in (
            source / "build.gradle",
            source / "build.gradle.kts",
            source / "gradle.properties",
            source / "settings.gradle",
            source / "settings.gradle.kts",
        ) if p.is_file()
    ]
    if build_files:
        unresolved.append({
            "kind": "source-build-logic",
            "paths": [str(p.relative_to(source)) for p in build_files],
            "reason": "target-native 26.3 build files take precedence; external/custom dependencies must be migrated explicitly",
        })

    runtime_scope = detect_runtime_scope(source, detected[0] if len(detected) == 1 else None)
    result = {
        "schema_version": 1,
        "status": "materialized",
        "source": str(source),
        "target": str(target),
        "target_loader": loader,
        "target_minecraft": "26.3",
        "target_java": 25,
        "mod_id": mod_id,
        "source_loaders": detected,
        "runtime_scope": runtime_scope,
        "metadata_written": metadata_written,
        "copied_count": len(copied),
        "skipped_count": len(skipped),
        "rewrite_count": len(rewrites),
        "unresolved_count": len(unresolved),
        "copied": copied,
        "skipped": skipped,
        "rewrites": rewrites,
        "unresolved": unresolved,
        "rule": "Only deterministic source-preservation and safe metadata rewrites are automatic. Symbolic/semantic API changes remain explicit repair work.",
    }
    evidence = target / "devkit-evidence"
    evidence.mkdir(parents=True, exist_ok=True)
    (evidence / "source-materialization.json").write_text(
        json.dumps(result, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return result


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source", type=Path)
    ap.add_argument("--target", type=Path, required=True)
    ap.add_argument("--loader", required=True, choices=["fabric", "neoforge"])
    ap.add_argument("--mod-id", required=True)
    ap.add_argument("--json-out", type=Path)
    args = ap.parse_args()
    result = materialize(args.source, args.target, args.loader, args.mod_id)
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
