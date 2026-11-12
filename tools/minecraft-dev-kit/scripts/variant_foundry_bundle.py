#!/usr/bin/env python3
"""Compile immutable content-addressed Variant Foundry ModelBundle manifests.

This is the packaging boundary between editable/generative authoring state and a
runtime backend. It deduplicates identical asset bytes, records exact input hashes,
and refuses to mutate an existing bundle into different content.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def hash_json(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def read_json(path: Path, label: str) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be a JSON object: {path}")
    return value


def parse_asset(value: str) -> tuple[str, Path]:
    if "=" not in value:
        raise ValueError("--asset requires ROLE=PATH")
    role, raw = value.split("=", 1)
    role = role.strip()
    if not role or not raw.strip():
        raise ValueError("--asset requires non-empty ROLE=PATH")
    return role, Path(raw)


def file_record(role: str, path: Path) -> dict[str, Any]:
    path = path.resolve()
    if not path.is_file():
        raise ValueError(f"asset does not exist or is not a file: {path}")
    digest = sha256_file(path)
    return {
        "role": role,
        "source_path": str(path),
        "source_name": path.name,
        "sha256": digest,
        "size": path.stat().st_size,
        "object_path": f"objects/sha256/{digest[:2]}/{digest}",
    }


def normalized_target(minecraft: str, loader: str, backend: str) -> dict[str, str]:
    values = {"minecraft": minecraft.strip(), "loader": loader.strip(), "backend": backend.strip()}
    if not all(values.values()):
        raise ValueError("minecraft, loader and backend must be non-empty")
    return values


def build_manifest(
    *,
    subject_path: Path,
    plan_path: Path,
    assets: list[tuple[str, Path]],
    minecraft: str,
    loader: str,
    backend: str,
    biome_dna_path: Path | None = None,
    evidence: list[tuple[str, Path]] | None = None,
) -> dict[str, Any]:
    subject = read_json(subject_path, "SubjectDNA")
    plans = read_json(plan_path, "VariantPlan")
    if biome_dna_path:
        read_json(biome_dna_path, "BiomeDNA")
    if not isinstance(subject.get("id"), str):
        raise ValueError("SubjectDNA requires id")
    if not isinstance(plans.get("plans"), list):
        raise ValueError("VariantPlan document requires plans list")

    records = [file_record(role, path) for role, path in assets]
    records.sort(key=lambda row: (row["role"], row["sha256"], row["source_name"]))
    evidence_records = [file_record(role, path) for role, path in (evidence or [])]
    evidence_records.sort(key=lambda row: (row["role"], row["sha256"], row["source_name"]))
    plan_ids = sorted(
        row.get("variant_id") for row in plans["plans"]
        if isinstance(row, dict) and isinstance(row.get("variant_id"), str)
    )
    inputs = {
        "subject": {"path": str(subject_path.resolve()), "sha256": sha256_file(subject_path.resolve())},
        "variant_plan": {"path": str(plan_path.resolve()), "sha256": sha256_file(plan_path.resolve())},
    }
    if biome_dna_path:
        inputs["biome_dna"] = {"path": str(biome_dna_path.resolve()), "sha256": sha256_file(biome_dna_path.resolve())}

    manifest: dict[str, Any] = {
        "schema_version": 1,
        "subject_id": subject["id"],
        "subject_sha256": hash_json(subject),
        "target": normalized_target(minecraft, loader, backend),
        "inputs": inputs,
        "variant_ids": plan_ids,
        "asset_count": len(records),
        "unique_object_count": len({row["sha256"] for row in [*records, *evidence_records]}),
        "assets": records,
        "runtime_rules": {
            "immutable_release_bundle": True,
            "content_addressed_objects": True,
            "render_tick_io_forbidden": True,
            "variant_delta_ready": True,
        },
    }
    if evidence_records:
        manifest["evidence_count"] = len(evidence_records)
        manifest["evidence"] = evidence_records
    manifest["bundle_id"] = hash_json(manifest)
    return manifest


def write_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + f".tmp-{os.getpid()}")
    tmp.write_bytes(data)
    os.replace(tmp, path)


def existing_bundle(output: Path, manifest: dict[str, Any]) -> dict[str, Any] | None:
    manifest_path = output / "model-bundle.json"
    if manifest_path.is_file():
        existing = json.loads(manifest_path.read_text(encoding="utf-8"))
        if existing != manifest:
            raise ValueError(f"immutable bundle already exists with different content: {output}")
        for row in [*manifest["assets"], *manifest.get("evidence", [])]:
            obj = output / row["object_path"]
            if not obj.is_file() or sha256_file(obj) != row["sha256"]:
                raise ValueError(f"existing bundle object is missing or corrupt: {obj}")
        return {"state": "reused", "bundle_id": manifest["bundle_id"], "output": str(output), "manifest": str(manifest_path)}
    if output.exists() and any(output.iterdir()):
        raise ValueError(f"output directory is non-empty but has no matching immutable bundle: {output}")
    return None


def compile_bundle(output: Path, manifest: dict[str, Any]) -> dict[str, Any]:
    output = output.resolve()
    existing = existing_bundle(output, manifest)
    if existing is not None:
        return existing
    output.parent.mkdir(parents=True, exist_ok=True)

    # Keep incomplete objects and the manifest outside the release directory.
    # A sibling staging directory keeps final publication on the same filesystem.
    # Context cleanup removes only this attempt's staging data on normal failure.
    with tempfile.TemporaryDirectory(prefix=f".{output.name}.build-", dir=output.parent) as td:
        staged = Path(td) / "bundle"
        staged.mkdir()
        copied: set[str] = set()
        for row in [*manifest["assets"], *manifest.get("evidence", [])]:
            digest = row["sha256"]
            if digest in copied:
                continue
            src = Path(row["source_path"])
            dst = staged / row["object_path"]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
            if sha256_file(dst) != digest:
                raise ValueError(f"copied object failed integrity verification: {src}")
            copied.add(digest)

        release = json.loads(json.dumps(manifest))
        manifest_bytes = (json.dumps(release, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")
        write_atomic(staged / "model-bundle.json", manifest_bytes)

        # Windows cannot rename a directory over an existing empty directory.
        # rmdir is deliberately non-recursive: never remove another publisher's
        # complete bundle or an unrelated file, even if it appeared after preflight.
        try:
            # Retain the existing empty directory's mode and supported metadata;
            # in particular, do not broaden a private output directory's access.
            shutil.copystat(output, staged)
            output.rmdir()
        except FileNotFoundError:
            pass
        except OSError:
            existing = existing_bundle(output, manifest)
            if existing is not None:
                return existing
            raise
        try:
            staged.rename(output)
        except OSError:
            # A concurrent identical publisher may have won the rename. Verify
            # every object before reusing it; different or corrupt output is fatal.
            existing = existing_bundle(output, manifest)
            if existing is not None:
                return existing
            raise

    return {"state": "compiled", "bundle_id": manifest["bundle_id"], "output": str(output), "manifest": str(output / "model-bundle.json")}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--subject", type=Path, required=True)
    ap.add_argument("--plans", type=Path, required=True)
    ap.add_argument("--biome-dna", type=Path)
    ap.add_argument("--asset", action="append", default=[], help="ROLE=PATH; repeatable")
    ap.add_argument("--evidence", action="append", default=[], help="ROLE=PATH; repeatable proof/provenance object")
    ap.add_argument("--minecraft", required=True)
    ap.add_argument("--loader", required=True)
    ap.add_argument("--backend", required=True)
    ap.add_argument("--output", type=Path, required=True)
    args = ap.parse_args(argv)
    try:
        assets = [parse_asset(value) for value in args.asset]
        evidence = [parse_asset(value) for value in args.evidence]
        if not assets:
            raise ValueError("at least one --asset ROLE=PATH is required")
        manifest = build_manifest(
            subject_path=args.subject,
            plan_path=args.plans,
            biome_dna_path=args.biome_dna,
            assets=assets,
            minecraft=args.minecraft,
            loader=args.loader,
            backend=args.backend,
            evidence=evidence,
        )
        result = compile_bundle(args.output, manifest)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
