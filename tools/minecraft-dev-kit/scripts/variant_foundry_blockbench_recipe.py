#!/usr/bin/env python3
"""Compile VariantPlans into lock-aware, backend-routed authoring recipes.

The compiler does not invent model coordinates. Geometry mutations are generated
only from explicit subject/model bindings and are additive-only by default.
Texture, physics and runtime-effect actions are routed separately so no semantic
action disappears just because Blockbench is not its correct execution backend.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
SAFE_ADDITIVE_OPS = {
    "add_group",
    "add_cube",
    "add_mesh",
    "add_mesh_primitive",
    "add_locator",
    "add_material",
}
PLACEHOLDER_RX = re.compile(r"\{([a-z0-9_]+)\}")
ALLOWED_PLACEHOLDERS = {
    "target",
    "region",
    "variant_id",
    "variant_slug",
    "biome_id",
    "biome_slug",
    "motif",
    "index",
    "seed_u64",
}


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_") or "variant"


def read_json(path: Path, label: str) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be a JSON object: {path}")
    return value


def normalize_subject(value: dict[str, Any]) -> dict[str, Any]:
    if value.get("schema_version") != 1 or not isinstance(value.get("id"), str):
        raise ValueError("SubjectDNA must be schema_version=1 with id")
    regions = value.get("variant_regions", {})
    if not isinstance(regions, dict):
        raise ValueError("SubjectDNA variant_regions must be an object")
    for key, items in regions.items():
        if not isinstance(key, str) or not isinstance(items, list) or not all(isinstance(x, str) for x in items):
            raise ValueError("SubjectDNA variant_regions entries must be string lists")
    return value


def normalize_plans(value: dict[str, Any], subject_id: str) -> list[dict[str, Any]]:
    if value.get("schema_version") != 1 or not isinstance(value.get("plans"), list):
        raise ValueError("VariantPlan document must be schema_version=1 with plans")
    out = []
    for i, plan in enumerate(value["plans"]):
        if not isinstance(plan, dict) or not isinstance(plan.get("variant_id"), str):
            raise ValueError(f"plans[{i}] requires variant_id")
        if plan.get("subject_id") != subject_id:
            raise ValueError(f"plans[{i}] subject_id does not match SubjectDNA")
        actions = plan.get("actions")
        if not isinstance(actions, list):
            raise ValueError(f"plans[{i}].actions must be a list")
        out.append(plan)
    return out


def normalize_target_map(value: Any, label: str) -> dict[str, list[str]]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be an object")
    out: dict[str, list[str]] = {}
    for region, targets in value.items():
        if not isinstance(region, str) or not isinstance(targets, list) or not all(isinstance(x, str) and x for x in targets):
            raise ValueError(f"{label}.{region} must be a non-empty string list")
        out[region] = list(dict.fromkeys(targets))
    return out


def normalize_bindings(value: dict[str, Any], subject_id: str) -> dict[str, Any]:
    if value.get("schema_version") != 1:
        raise ValueError("authoring bindings must be schema_version=1")
    if value.get("subject_id") != subject_id:
        raise ValueError("authoring bindings subject_id does not match SubjectDNA")
    model_file = value.get("model_file")
    if not isinstance(model_file, str) or not model_file.lower().endswith(".bbmodel"):
        raise ValueError("authoring bindings require model_file ending in .bbmodel")
    templates = value.get("templates", {})
    if not isinstance(templates, dict):
        raise ValueError("bindings.templates must be an object")
    normalized_templates: dict[str, dict[str, Any]] = {}
    for family in ("geometry", "motif"):
        family_value = templates.get(family, {})
        if not isinstance(family_value, dict):
            raise ValueError(f"bindings.templates.{family} must be an object")
        normalized_family: dict[str, Any] = {}
        for name, spec in family_value.items():
            if not isinstance(name, str) or not isinstance(spec, dict):
                raise ValueError(f"bindings.templates.{family} entries must be objects")
            regions = spec.get("regions")
            operations = spec.get("operations")
            if not isinstance(regions, list) or not regions or not all(isinstance(x, str) for x in regions):
                raise ValueError(f"template {family}:{name} requires regions")
            if not isinstance(operations, list) or not operations or not all(isinstance(x, dict) for x in operations):
                raise ValueError(f"template {family}:{name} requires operations")
            for op in operations:
                op_name = op.get("op")
                if op_name not in SAFE_ADDITIVE_OPS:
                    raise ValueError(
                        f"template {family}:{name} uses unsafe/non-additive op {op_name!r}; "
                        f"automatic biome authoring allows only {sorted(SAFE_ADDITIVE_OPS)}"
                    )
            normalized_family[name] = {"regions": regions, "operations": operations}
        normalized_templates[family] = normalized_family
    return {
        "schema_version": 1,
        "subject_id": subject_id,
        "model_file": model_file,
        "region_targets": normalize_target_map(value.get("region_targets"), "region_targets"),
        "motion_targets": normalize_target_map(value.get("motion_targets"), "motion_targets"),
        "texture_targets": normalize_target_map(value.get("texture_targets"), "texture_targets"),
        "templates": normalized_templates,
    }


def render_value(value: Any, variables: dict[str, str]) -> Any:
    if isinstance(value, str):
        names = set(PLACEHOLDER_RX.findall(value))
        unknown = names - ALLOWED_PLACEHOLDERS
        if unknown:
            raise ValueError(f"operation template has unsupported placeholders: {sorted(unknown)}")
        out = value
        for name in names:
            out = out.replace("{" + name + "}", variables[name])
        return out
    if isinstance(value, list):
        return [render_value(x, variables) for x in value]
    if isinstance(value, dict):
        return {k: render_value(v, variables) for k, v in value.items()}
    return value


def action_items(action: dict[str, Any]) -> list[str]:
    payload = action.get("payload")
    if isinstance(payload, list):
        out: list[str] = []
        for item in payload:
            if isinstance(item, str):
                out.append(item)
            elif isinstance(item, dict) and isinstance(item.get("id"), str):
                out.append(item["id"])
        return out
    return []


def eligible_regions(subject: dict[str, Any], action: dict[str, Any]) -> list[str]:
    target = action.get("target")
    regions = subject.get("variant_regions", {})
    if isinstance(target, str) and isinstance(regions.get(target), list):
        return list(regions[target])
    return []


def compile_template_actions(
    *,
    plan: dict[str, Any],
    subject: dict[str, Any],
    bindings: dict[str, Any],
    action: dict[str, Any],
    family: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    ops: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []
    allowed_regions = set(eligible_regions(subject, action))
    templates = bindings["templates"][family]
    for item_index, item in enumerate(action_items(action)):
        spec = templates.get(item)
        if not spec:
            unresolved.append({
                "kind": "authoring-template-missing",
                "action": action.get("kind"),
                "item": item,
                "required": bool(action.get("required", True)),
            })
            continue
        regions = [region for region in spec["regions"] if region in allowed_regions]
        if not regions:
            unresolved.append({
                "kind": "template-region-outside-plan-eligibility",
                "action": action.get("kind"),
                "item": item,
                "template_regions": spec["regions"],
                "eligible_regions": sorted(allowed_regions),
                "required": bool(action.get("required", True)),
            })
            continue
        emitted = 0
        for region in regions:
            targets = bindings["region_targets"].get(region, [])
            if not targets:
                unresolved.append({
                    "kind": "region-target-binding-missing",
                    "action": action.get("kind"),
                    "item": item,
                    "region": region,
                    "required": bool(action.get("required", True)),
                })
                continue
            for target_index, target in enumerate(targets):
                variables = {
                    "target": target,
                    "region": region,
                    "variant_id": plan["variant_id"],
                    "variant_slug": slug(plan["variant_id"]),
                    "biome_id": str(plan.get("biome_id", "")),
                    "biome_slug": slug(str(plan.get("biome_id", ""))),
                    "motif": item,
                    "index": str(item_index * 1000 + target_index),
                    "seed_u64": str((plan.get("seed") or {}).get("u64", 0)),
                }
                for template_op in spec["operations"]:
                    op = render_value(copy.deepcopy(template_op), variables)
                    if op.get("op") not in SAFE_ADDITIVE_OPS:
                        raise ValueError(f"rendered operation escaped additive allowlist: {op.get('op')!r}")
                    ops.append(op)
                    emitted += 1
        if emitted == 0 and not any(row.get("item") == item for row in unresolved):
            unresolved.append({
                "kind": "template-produced-no-operations",
                "action": action.get("kind"),
                "item": item,
                "required": bool(action.get("required", True)),
            })
    return ops, unresolved


def compile_plan(plan: dict[str, Any], subject: dict[str, Any], bindings: dict[str, Any]) -> dict[str, Any]:
    blockbench_ops: list[dict[str, Any]] = []
    texture: list[dict[str, Any]] = []
    physics: list[dict[str, Any]] = []
    effects: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []

    for action in plan["actions"]:
        if not isinstance(action, dict) or not isinstance(action.get("kind"), str):
            raise ValueError(f"variant {plan['variant_id']} contains malformed action")
        kind = action["kind"]
        if kind in {"texture-palette", "material-language"}:
            surface_regions = list((subject.get("variant_regions") or {}).get("eligible-surface-regions") or [])
            targets = {
                region: bindings["texture_targets"].get(region, [])
                for region in surface_regions
            }
            if action.get("required", True) and not any(targets.values()):
                unresolved.append({
                    "kind": "texture-target-binding-missing",
                    "action": kind,
                    "logical_regions": surface_regions,
                    "required": True,
                })
            texture.append({
                "kind": kind,
                "source": action.get("source"),
                "payload": action.get("payload"),
                "logical_regions": surface_regions,
                "targets": targets,
                "required": bool(action.get("required", True)),
            })
        elif kind == "motif-placement":
            ops, missing = compile_template_actions(
                plan=plan, subject=subject, bindings=bindings, action=action, family="motif"
            )
            blockbench_ops.extend(ops)
            unresolved.extend(missing)
        elif kind in {"surface-growth", "geometry-phenotype"}:
            ops, missing = compile_template_actions(
                plan=plan, subject=subject, bindings=bindings, action=action, family="geometry"
            )
            blockbench_ops.extend(ops)
            unresolved.extend(missing)
        elif kind == "secondary-motion":
            logical = eligible_regions(subject, action)
            targets = {region: bindings["motion_targets"].get(region, []) for region in logical}
            if not any(targets.values()) and action.get("required", True):
                unresolved.append({
                    "kind": "motion-target-binding-missing",
                    "action": kind,
                    "logical_regions": logical,
                    "required": True,
                })
            physics.append({
                "kind": kind,
                "payload": action.get("payload"),
                "logical_regions": logical,
                "targets": targets,
                "required": bool(action.get("required", True)),
            })
        elif kind == "atmosphere-hook":
            effects.append({
                "kind": kind,
                "payload": action.get("payload"),
                "required": bool(action.get("required", False)),
            })
        else:
            unresolved.append({
                "kind": "unsupported-plan-action",
                "action": kind,
                "required": bool(action.get("required", True)),
            })

    required_unresolved = [row for row in unresolved if row.get("required")]
    recipe = {
        "schema_version": 1,
        "variant_id": plan["variant_id"],
        "biome_id": plan.get("biome_id"),
        "seed": plan.get("seed"),
        "model_file": bindings["model_file"],
        "lock_contract": plan.get("lock_contract", []),
        "identity_anchors": plan.get("identity_anchors", []),
        "routes": {
            "blockbench": {
                "operation_count": len(blockbench_ops),
                "operations": blockbench_ops,
                "execution": "bbmodel_info -> bbmodel_edit(expected_revision) -> bbmodel_validate -> bbmodel_validate_animations -> visual review",
            },
            "texture": texture,
            "runtime_physics": physics,
            "runtime_effects": effects,
        },
        "unresolved": unresolved,
        "state": "ready" if not required_unresolved else "unresolved-active",
    }
    recipe["recipe_sha256"] = digest(recipe)
    return recipe


def compile_recipes(
    subject: dict[str, Any],
    plans_doc: dict[str, Any],
    bindings_doc: dict[str, Any],
    *,
    variants: list[str] | None = None,
) -> dict[str, Any]:
    subject = normalize_subject(subject)
    plans = normalize_plans(plans_doc, subject["id"])
    bindings = normalize_bindings(bindings_doc, subject["id"])
    selected = set(variants or [])
    if selected:
        missing = sorted(selected - {p["variant_id"] for p in plans})
        if missing:
            raise ValueError(f"requested variants are missing from VariantPlan document: {missing}")
        plans = [p for p in plans if p["variant_id"] in selected]
    recipes = [compile_plan(plan, subject, bindings) for plan in plans]
    unresolved = [
        {"variant_id": recipe["variant_id"], "items": recipe["unresolved"]}
        for recipe in recipes if recipe["state"] != "ready"
    ]
    result = {
        "schema_version": 1,
        "subject_id": subject["id"],
        "model_file": bindings["model_file"],
        "recipe_count": len(recipes),
        "recipes": recipes,
        "unresolved": unresolved,
        "state": "ready" if not unresolved else "unresolved-active",
        "safety": {
            "automatic_geometry_policy": "additive-only",
            "allowed_blockbench_ops": sorted(SAFE_ADDITIVE_OPS),
            "locked_regions_may_not_be_mutated": True,
            "unbound_coordinates_are_never_invented": True,
        },
    }
    result["document_sha256"] = digest(result)
    return result


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--subject", type=Path, required=True)
    ap.add_argument("--plans", type=Path, required=True)
    ap.add_argument("--bindings", type=Path, required=True)
    ap.add_argument("--variant", action="append", dest="variants")
    ap.add_argument("--json-out", type=Path)
    args = ap.parse_args(argv)
    try:
        result = compile_recipes(
            read_json(args.subject, "SubjectDNA"),
            read_json(args.plans, "VariantPlan"),
            read_json(args.bindings, "authoring bindings"),
            variants=args.variants,
        )
        rendered = json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
        if args.json_out:
            args.json_out.parent.mkdir(parents=True, exist_ok=True)
            args.json_out.write_text(rendered, encoding="utf-8")
        else:
            sys.stdout.write(rendered)
        return 0 if result["state"] == "ready" else 2
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
