#!/usr/bin/env python3
"""Create deterministic, lock-aware Variant Foundry mutation plans.

The planner converts SubjectDNA + BiomeDNA into explicit actions. It never edits
geometry/textures itself; downstream authoring backends execute the plan and must
return evidence for every action.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

MODES = {"texture-only", "surface", "geometry", "rig-aware", "full-phenotype"}


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def normalize_subject(data: Any) -> dict[str, Any]:
    if not isinstance(data, dict):
        raise ValueError("SubjectDNA must be a JSON object")
    subject_id = data.get("id")
    if not isinstance(subject_id, str) or ":" not in subject_id:
        raise ValueError("SubjectDNA requires a namespaced id")
    anchors = data.get("identity_anchors", [])
    if not isinstance(anchors, list) or not all(isinstance(x, str) for x in anchors):
        raise ValueError("identity_anchors must be a string list")
    locks = data.get("region_locks", [])
    if not isinstance(locks, list):
        raise ValueError("region_locks must be a list")
    for row in locks:
        if not isinstance(row, dict) or not isinstance(row.get("region"), str):
            raise ValueError("every region lock requires a region")
        kinds = row.get("lock", [])
        if not isinstance(kinds, list) or not all(isinstance(x, str) for x in kinds):
            raise ValueError("region lock types must be strings")
    return data


def biome_index(data: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(data, dict) or data.get("schema_version") != 1 or not isinstance(data.get("profiles"), list):
        raise ValueError("unsupported BiomeDNA document")
    out = {}
    for row in data["profiles"]:
        if isinstance(row, dict) and isinstance(row.get("id"), str):
            out[row["id"]] = row
    return out


def stable_seed(base_seed: int, subject_hash: str, biome_id: str, mode: str) -> dict[str, Any]:
    material = f"{base_seed}|{subject_hash}|{biome_id}|{mode}".encode("utf-8")
    hex_seed = hashlib.sha256(material).hexdigest()
    return {"base_seed": base_seed, "sha256": hex_seed, "u64": int(hex_seed[:16], 16)}


def lock_index(subject: dict[str, Any]) -> dict[str, set[str]]:
    out: dict[str, set[str]] = {}
    for row in subject.get("region_locks", []):
        out.setdefault(row["region"], set()).update(row.get("lock", []))
    return out


def action(kind: str, target: str, payload: Any, *, source: str, required: bool = True) -> dict[str, Any]:
    return {"kind": kind, "target": target, "payload": payload, "source": source, "required": required}


def build_actions(subject: dict[str, Any], biome: dict[str, Any], mode: str) -> list[dict[str, Any]]:
    actions: list[dict[str, Any]] = []
    palette = biome.get("palette") if isinstance(biome.get("palette"), dict) else {}
    materials = biome.get("material_language") if isinstance(biome.get("material_language"), list) else []
    geometry = biome.get("geometry_language") if isinstance(biome.get("geometry_language"), list) else []
    motion = biome.get("motion_phenotype") if isinstance(biome.get("motion_phenotype"), dict) else None
    motifs = biome.get("motifs") if isinstance(biome.get("motifs"), list) else []

    if palette:
        actions.append(action("texture-palette", "variant-texture", palette, source="BiomeDNA.palette"))
    if materials:
        actions.append(action("material-language", "variant-materials", materials, source="BiomeDNA.material_language"))
    if motifs:
        actions.append(action("motif-placement", "eligible-surface-regions", motifs, source="BiomeDNA.motifs"))

    if mode in {"surface", "geometry", "rig-aware", "full-phenotype"} and geometry:
        actions.append(action(
            "surface-growth" if mode == "surface" else "geometry-phenotype",
            "eligible-geometry-regions",
            geometry,
            source="BiomeDNA.geometry_language",
        ))
    if mode in {"rig-aware", "full-phenotype"} and motion:
        actions.append(action("secondary-motion", "eligible-motion-regions", motion, source="BiomeDNA.motion_phenotype"))
    if mode == "full-phenotype":
        atmosphere = biome.get("atmosphere") if isinstance(biome.get("atmosphere"), dict) else {}
        if atmosphere:
            actions.append(action("atmosphere-hook", "runtime-effects", atmosphere, source="BiomeDNA.atmosphere", required=False))
    return actions


def apply_lock_contract(actions: list[dict[str, Any]], subject: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    locks = lock_index(subject)
    anchors = sorted(set(subject.get("identity_anchors", [])))
    contract = []
    for region, kinds in sorted(locks.items()):
        contract.append({"region": region, "locked": sorted(kinds)})
    for anchor in anchors:
        if anchor not in locks:
            contract.append({"region": anchor, "locked": ["identity"]})
    return actions, contract


def plan_one(subject: dict[str, Any], biome: dict[str, Any], mode: str, base_seed: int) -> dict[str, Any]:
    if mode not in MODES:
        raise ValueError(f"unsupported variant mode: {mode}")
    subject_hash = digest(subject)
    actions, lock_contract = apply_lock_contract(build_actions(subject, biome, mode), subject)
    seed = stable_seed(base_seed, subject_hash, biome["id"], mode)
    warnings = []
    if biome.get("needs_characterization"):
        warnings.append({
            "kind": "low-characterization",
            "message": "Biome profile has incomplete static evidence; generated candidates require stronger visual/runtime review.",
        })
    if not actions:
        warnings.append({
            "kind": "no-derived-actions",
            "message": "BiomeDNA supplied no safe derived mutations; preserve source identity and require characterization/override before generation.",
        })
    return {
        "schema_version": 1,
        "variant_id": f"{subject['id']}@{biome['id']}",
        "subject_id": subject["id"],
        "subject_sha256": subject_hash,
        "biome_id": biome["id"],
        "biome_profile_sha256": digest(biome),
        "mode": mode,
        "seed": seed,
        "status": "needs-review" if warnings else "ready",
        "identity_anchors": sorted(set(subject.get("identity_anchors", []))),
        "lock_contract": lock_contract,
        "eligible_regions": subject.get("variant_regions", {}),
        "actions": actions,
        "warnings": warnings,
        "execution_rule": "Backends may implement these actions only inside eligible regions and must preserve every lock/identity anchor unless the user explicitly changes SubjectDNA.",
    }


def build(subject: dict[str, Any], biome_dna: dict[str, Any], *, biome_ids: list[str] | None = None, mode: str = "full-phenotype", base_seed: int = 0) -> dict[str, Any]:
    subject = normalize_subject(subject)
    profiles = biome_index(biome_dna)
    selected = sorted(set(biome_ids or profiles))
    missing = [rid for rid in selected if rid not in profiles]
    plans = [plan_one(subject, profiles[rid], mode, base_seed) for rid in selected if rid in profiles]
    return {
        "schema_version": 1,
        "subject_id": subject["id"],
        "subject_sha256": digest(subject),
        "mode": mode,
        "base_seed": base_seed,
        "plan_count": len(plans),
        "plans": plans,
        "unresolved": [{"kind": "biome-profile-not-found", "id": rid} for rid in missing],
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--subject", type=Path, required=True)
    ap.add_argument("--biome-dna", type=Path, required=True)
    ap.add_argument("--biome", action="append", dest="biomes")
    ap.add_argument("--mode", choices=sorted(MODES), default="full-phenotype")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--json-out", type=Path)
    args = ap.parse_args(argv)
    try:
        subject = json.loads(args.subject.read_text(encoding="utf-8"))
        dna = json.loads(args.biome_dna.read_text(encoding="utf-8"))
        result = build(subject, dna, biome_ids=args.biomes, mode=args.mode, base_seed=args.seed)
        rendered = json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
        if args.json_out:
            args.json_out.parent.mkdir(parents=True, exist_ok=True)
            args.json_out.write_text(rendered, encoding="utf-8")
        else:
            sys.stdout.write(rendered)
        return 0 if not result["unresolved"] else 2
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
