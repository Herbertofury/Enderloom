#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("recipe", HERE / "variant_foundry_blockbench_recipe.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def main() -> int:
    subject = {
        "schema_version": 1,
        "id": "bloom_and_boom:creeper_female",
        "identity_anchors": ["creeper_face", "horns"],
        "region_locks": [{"region": "creeper_face", "lock": ["geometry", "uv"]}],
        "variant_regions": {
            "eligible-geometry-regions": ["back_growths", "horn_decorations"],
            "eligible-surface-regions": ["body_surface"],
            "eligible-motion-regions": ["vines"],
        },
    }
    plan = {
        "schema_version": 1,
        "subject_id": subject["id"],
        "plans": [{
            "schema_version": 1,
            "variant_id": "bloom_and_boom:creeper_female@minecraft:snowy_plains",
            "subject_id": subject["id"],
            "biome_id": "minecraft:snowy_plains",
            "seed": {"u64": 77},
            "identity_anchors": ["creeper_face", "horns"],
            "lock_contract": [{"region": "creeper_face", "locked": ["geometry", "uv"]}],
            "actions": [
                {"kind": "texture-palette", "target": "variant-texture", "payload": {"snow": "#FFFFFF"}, "source": "test", "required": True},
                {"kind": "geometry-phenotype", "target": "eligible-geometry-regions", "payload": ["icicle tips"], "source": "test", "required": True},
                {"kind": "secondary-motion", "target": "eligible-motion-regions", "payload": {"preset": "heavy-crystal"}, "source": "test", "required": True},
            ],
        }],
    }
    bindings = {
        "schema_version": 1,
        "subject_id": subject["id"],
        "model_file": "creeper-female.bbmodel",
        "region_targets": {
            "back_growths": ["back_growth_anchor"],
            "horn_decorations": ["horn_left_decor", "horn_right_decor"],
        },
        "motion_targets": {"vines": ["vine_left", "vine_right"]},
        "texture_targets": {"body_surface": ["creeper_female_base.png"]},
        "templates": {
            "geometry": {
                "icicle tips": {
                    "regions": ["back_growths", "horn_decorations"],
                    "operations": [{
                        "op": "add_mesh_primitive",
                        "shape": "cone",
                        "diameter": 1.5,
                        "height": 3,
                        "sides": 4,
                        "name": "vf_{biome_slug}_icicle_{index}",
                        "parent": "{target}",
                    }],
                }
            },
            "motif": {},
        },
    }

    result = mod.compile_recipes(subject, plan, bindings)
    assert result["state"] == "ready", result
    recipe = result["recipes"][0]
    ops = recipe["routes"]["blockbench"]["operations"]
    assert len(ops) == 3
    assert {op["parent"] for op in ops} == {"back_growth_anchor", "horn_left_decor", "horn_right_decor"}
    assert all(op["op"] == "add_mesh_primitive" for op in ops)
    assert recipe["routes"]["runtime_physics"][0]["targets"]["vines"] == ["vine_left", "vine_right"]
    assert recipe["routes"]["texture"][0]["kind"] == "texture-palette"
    assert recipe["routes"]["texture"][0]["logical_regions"] == ["body_surface"]
    assert recipe["routes"]["texture"][0]["targets"]["body_surface"] == ["creeper_female_base.png"]
    assert recipe["lock_contract"][0]["region"] == "creeper_face"

    missing_texture = json.loads(json.dumps(bindings))
    missing_texture["texture_targets"] = {}
    unresolved_texture = mod.compile_recipes(subject, plan, missing_texture)
    assert unresolved_texture["state"] == "unresolved-active"
    assert any(
        item["kind"] == "texture-target-binding-missing"
        for item in unresolved_texture["recipes"][0]["unresolved"]
    )

    missing = json.loads(json.dumps(bindings))
    missing["templates"]["geometry"] = {}
    unresolved = mod.compile_recipes(subject, plan, missing)
    assert unresolved["state"] == "unresolved-active"
    assert unresolved["recipes"][0]["unresolved"][0]["kind"] == "authoring-template-missing"

    unsafe = json.loads(json.dumps(bindings))
    unsafe["templates"]["geometry"]["icicle tips"]["operations"][0] = {
        "op": "remove_node", "target": "creeper_face"
    }
    try:
        mod.compile_recipes(subject, plan, unsafe)
    except ValueError as exc:
        assert "unsafe/non-additive" in str(exc)
    else:
        raise AssertionError("unsafe template operation should be rejected")

    print(json.dumps({
        "status": "passed",
        "operations": len(ops),
        "targets": sorted({op["parent"] for op in ops}),
        "unbound_is_unresolved": True,
        "texture_unbound_is_unresolved": True,
        "destructive_op_rejected": True,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
