#!/usr/bin/env python3
"""Compile Variant Foundry runtime physics/effect/persistence contracts.

This compiler turns already-bound authoring recipes plus SubjectDNA gameplay rules
into a deterministic runtime manifest. It does not claim Minecraft runtime proof:
the output is an implementation contract for the target mod/runtime adapter.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
PARAMETERS = ("stiffness", "damping", "gravity", "drag", "wind")


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def read_json(path: Path, label: str) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be a JSON object: {path}")
    return value


def normalized_target(minecraft: str, loader: str, backend: str) -> dict[str, str]:
    result = {"minecraft": minecraft.strip(), "loader": loader.strip(), "backend": backend.strip()}
    if not all(result.values()):
        raise ValueError("minecraft, loader and backend must be non-empty")
    return result


def subject_contract(subject: dict[str, Any]) -> dict[str, Any]:
    if subject.get("schema_version") != 1 or not isinstance(subject.get("id"), str):
        raise ValueError("SubjectDNA must be schema_version=1 with id")
    gameplay = subject.get("gameplay_contract", {})
    if gameplay is None:
        gameplay = {}
    if not isinstance(gameplay, dict):
        raise ValueError("SubjectDNA gameplay_contract must be an object")
    return {
        "subject_id": subject["id"],
        "variant_semantics": str(gameplay.get("variant_semantics", "spawn-origin-default")),
        "variant_persistence": str(gameplay.get("variant_persistence", "required")),
        "server_authority": str(gameplay.get("server_authority", "variant id and gameplay state only")),
        "client_cosmetics": str(gameplay.get("client_cosmetics", "secondary motion and purely visual phenotype")),
    }


def parameter_map(payload: Any, variant_id: str, target: str) -> tuple[str | None, dict[str, float] | None, str | None]:
    if not isinstance(payload, dict):
        return None, None, "secondary-motion payload must be an object"
    preset = payload.get("preset")
    params = payload.get("parameters")
    if not isinstance(preset, str) or not preset:
        return None, None, "secondary-motion payload requires preset"
    if not isinstance(params, dict):
        return None, None, "secondary-motion payload requires parameters object"
    normalized: dict[str, float] = {}
    for name in PARAMETERS:
        value = params.get(name)
        if not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(float(value)):
            return None, None, f"{variant_id}:{target} parameter {name} must be finite numeric"
        number = float(value)
        if number < 0.0 or number > 1.0:
            return None, None, f"{variant_id}:{target} parameter {name} must be in [0,1], got {number}"
        normalized[name] = number
    return preset, normalized, None


def compile_variant(recipe: dict[str, Any]) -> dict[str, Any]:
    variant_id = recipe.get("variant_id")
    if not isinstance(variant_id, str) or not variant_id:
        raise ValueError("recipe requires variant_id")
    routes = recipe.get("routes")
    if not isinstance(routes, dict):
        raise ValueError(f"{variant_id} recipe routes must be an object")
    physics_routes = routes.get("runtime_physics", [])
    effect_routes = routes.get("runtime_effects", [])
    if not isinstance(physics_routes, list) or not isinstance(effect_routes, list):
        raise ValueError(f"{variant_id} runtime routes must be arrays")

    chains: list[dict[str, Any]] = []
    effects: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []

    for route_index, route in enumerate(physics_routes):
        if not isinstance(route, dict):
            unresolved.append({"kind": "malformed-runtime-physics-route", "route_index": route_index, "required": True})
            continue
        required = bool(route.get("required", True))
        logical_regions = route.get("logical_regions", [])
        targets = route.get("targets", {})
        if not isinstance(logical_regions, list) or not isinstance(targets, dict):
            unresolved.append({"kind": "malformed-runtime-physics-targets", "route_index": route_index, "required": required})
            continue
        emitted = 0
        for region in logical_regions:
            if not isinstance(region, str):
                continue
            region_targets = targets.get(region, [])
            if not isinstance(region_targets, list):
                unresolved.append({
                    "kind": "malformed-runtime-physics-region-targets",
                    "route_index": route_index,
                    "region": region,
                    "required": required,
                })
                continue
            for target in region_targets:
                if not isinstance(target, str) or not target:
                    unresolved.append({
                        "kind": "invalid-runtime-physics-target",
                        "route_index": route_index,
                        "region": region,
                        "required": required,
                    })
                    continue
                preset, params, reason = parameter_map(route.get("payload"), variant_id, target)
                if reason:
                    unresolved.append({
                        "kind": "invalid-runtime-physics-parameters",
                        "route_index": route_index,
                        "region": region,
                        "target": target,
                        "reason": reason,
                        "required": required,
                    })
                    continue
                chain_id = digest({"variant": variant_id, "region": region, "target": target, "preset": preset})[:24]
                chains.append({
                    "id": chain_id,
                    "logical_region": region,
                    "target": target,
                    "preset": preset,
                    "parameters": params,
                    "solver": "enderloom-secondary-motion-v1",
                    "simulation": {
                        "space": "model-local",
                        "fixed_step_hz": 30,
                        "max_substeps": 2,
                        "interpolate_render_pose": True,
                        "reset_on_teleport_or_model_swap": True,
                    },
                    "lod": {
                        "near": {"max_distance_blocks": 24, "update_hz": 30},
                        "medium": {"max_distance_blocks": 64, "update_hz": 15},
                        "far": {"max_distance_blocks": 96, "update_hz": 5},
                        "beyond_far": "bind-pose",
                    },
                    "sleep": {
                        "enabled": True,
                        "velocity_epsilon": 0.001,
                        "frames": 20,
                        "wake_on_root_motion": True,
                    },
                })
                emitted += 1
        if emitted == 0 and required:
            unresolved.append({
                "kind": "runtime-physics-route-produced-no-chains",
                "route_index": route_index,
                "required": True,
            })

    for route_index, route in enumerate(effect_routes):
        if not isinstance(route, dict):
            unresolved.append({"kind": "malformed-runtime-effect-route", "route_index": route_index, "required": False})
            continue
        effects.append({
            "kind": route.get("kind"),
            "payload": route.get("payload"),
            "required": bool(route.get("required", False)),
            "execution": "client-visual-hook",
        })

    required_unresolved = [row for row in unresolved if row.get("required")]
    result = {
        "variant_id": variant_id,
        "biome_id": recipe.get("biome_id"),
        "physics": {
            "chain_count": len(chains),
            "chains": sorted(chains, key=lambda row: (row["logical_region"], row["target"], row["id"])),
        },
        "effects": effects,
        "unresolved": unresolved,
        "state": "ready" if not required_unresolved else "unresolved-active",
    }
    result["variant_runtime_sha256"] = digest(result)
    return result


def compile_contract(
    subject: dict[str, Any],
    recipes_doc: dict[str, Any],
    *,
    minecraft: str,
    loader: str,
    backend: str,
) -> dict[str, Any]:
    gameplay = subject_contract(subject)
    if recipes_doc.get("schema_version") != 1 or recipes_doc.get("subject_id") != gameplay["subject_id"]:
        raise ValueError("authoring recipes do not match SubjectDNA")
    recipes = recipes_doc.get("recipes")
    if not isinstance(recipes, list) or not recipes:
        raise ValueError("authoring recipes require a non-empty recipes list")
    variants = [compile_variant(recipe) for recipe in recipes if isinstance(recipe, dict)]
    if len(variants) != len(recipes):
        raise ValueError("authoring recipes contain malformed entries")
    unresolved = [
        {"variant_id": variant["variant_id"], "items": variant["unresolved"]}
        for variant in variants if variant["state"] != "ready"
    ]
    target = normalized_target(minecraft, loader, backend)
    result = {
        "schema_version": 1,
        "subject_id": gameplay["subject_id"],
        "target": target,
        "gameplay_contract": gameplay,
        "persistence": {
            "variant_id_key": "enderloom:variant_id",
            "selection": gameplay["variant_semantics"],
            "save_load": "required" if gameplay["variant_persistence"] == "required" else gameplay["variant_persistence"],
            "server_authoritative_variant_id": True,
            "client_simulation_authority": "visual-only",
            "variant_change_requires_pose_reset": True,
        },
        "performance_contract": {
            "render_tick_io_forbidden": True,
            "render_tick_allocation_free_target": True,
            "simulation_storage": "preallocated-per-visible-entity",
            "distance_lod_required": True,
            "sleeping_required": True,
            "offscreen_policy": "sleep",
            "server_tick_secondary_motion": False,
            "network_secondary_motion_frames": False,
            "network_payload": "variant-id-and-gameplay-state-only",
        },
        "variants": sorted(variants, key=lambda row: row["variant_id"]),
        "variant_count": len(variants),
        "unresolved": unresolved,
        "state": "ready" if not unresolved else "unresolved-active",
        "proof_state": "contract-compiled-runtime-unverified",
    }
    result["runtime_contract_sha256"] = digest(result)
    return result


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--subject", type=Path, required=True)
    ap.add_argument("--recipes", type=Path, required=True)
    ap.add_argument("--minecraft", required=True)
    ap.add_argument("--loader", required=True)
    ap.add_argument("--backend", required=True)
    ap.add_argument("--json-out", type=Path)
    args = ap.parse_args(argv)
    try:
        result = compile_contract(
            read_json(args.subject, "SubjectDNA"),
            read_json(args.recipes, "authoring recipes"),
            minecraft=args.minecraft,
            loader=args.loader,
            backend=args.backend,
        )
        rendered = json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
        if args.json_out:
            args.json_out.parent.mkdir(parents=True, exist_ok=True)
            args.json_out.write_text(rendered, encoding="utf-8")
        else:
            sys.stdout.write(rendered)
        return 0 if result["state"] == "ready" else 2
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
