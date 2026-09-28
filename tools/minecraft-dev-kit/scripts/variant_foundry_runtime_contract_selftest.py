#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("runtime_contract", HERE / "variant_foundry_runtime_contract.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def main() -> int:
    subject = {
        "schema_version": 1,
        "id": "bloom_and_boom:creeper_female",
        "gameplay_contract": {
            "variant_semantics": "spawn-origin-default",
            "variant_persistence": "required",
            "server_authority": "variant id and gameplay state only",
            "client_cosmetics": "secondary motion and purely visual biome phenotype",
        },
    }
    recipes = {
        "schema_version": 1,
        "subject_id": subject["id"],
        "recipes": [{
            "variant_id": "bloom_and_boom:creeper_female@minecraft:swamp",
            "biome_id": "minecraft:swamp",
            "routes": {
                "blockbench": {"operations": []},
                "texture": [],
                "runtime_physics": [{
                    "kind": "secondary-motion",
                    "payload": {
                        "preset": "vine-leaf",
                        "parameters": {
                            "stiffness": 0.34,
                            "damping": 0.48,
                            "gravity": 0.38,
                            "drag": 0.36,
                            "wind": 0.55,
                        },
                    },
                    "logical_regions": ["vines"],
                    "targets": {"vines": ["vine_left", "vine_right"]},
                    "required": True,
                }],
                "runtime_effects": [{
                    "kind": "atmosphere-hook",
                    "payload": {"fog": "swamp"},
                    "required": False,
                }],
            },
        }],
    }
    result = mod.compile_contract(
        subject,
        recipes,
        minecraft="26.3",
        loader="neoforge",
        backend="enderloom-skeletal",
    )
    assert result["state"] == "ready", result
    assert result["proof_state"] == "contract-compiled-runtime-unverified"
    assert result["persistence"]["server_authoritative_variant_id"] is True
    assert result["performance_contract"]["server_tick_secondary_motion"] is False
    variant = result["variants"][0]
    assert variant["physics"]["chain_count"] == 2
    assert {row["target"] for row in variant["physics"]["chains"]} == {"vine_left", "vine_right"}
    assert all(row["lod"]["beyond_far"] == "bind-pose" for row in variant["physics"]["chains"])
    assert all(row["simulation"]["fixed_step_hz"] == 30 for row in variant["physics"]["chains"])
    assert len(variant["effects"]) == 1

    repeated = mod.compile_contract(
        subject,
        recipes,
        minecraft="26.3",
        loader="neoforge",
        backend="enderloom-skeletal",
    )
    assert repeated["runtime_contract_sha256"] == result["runtime_contract_sha256"]

    broken = json.loads(json.dumps(recipes))
    broken["recipes"][0]["routes"]["runtime_physics"][0]["payload"]["parameters"]["wind"] = 2.0
    unresolved = mod.compile_contract(
        subject,
        broken,
        minecraft="26.3",
        loader="neoforge",
        backend="enderloom-skeletal",
    )
    assert unresolved["state"] == "unresolved-active"
    assert unresolved["variants"][0]["unresolved"][0]["kind"] == "invalid-runtime-physics-parameters"

    print(json.dumps({
        "status": "passed",
        "runtime_sha256": result["runtime_contract_sha256"],
        "chains": variant["physics"]["chain_count"],
        "persistence": result["persistence"],
        "bad_parameters_rejected": True,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
