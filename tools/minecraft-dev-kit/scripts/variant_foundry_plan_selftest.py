#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("planner", HERE / "variant_foundry_plan.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def main() -> int:
    subject = {
        "schema_version": 1,
        "id": "bloom_and_boom:creeper_female",
        "family": "bloom_and_boom:creeper",
        "identity_anchors": ["creeper_face", "horns", "body_silhouette"],
        "region_locks": [
            {"region": "creeper_face", "lock": ["geometry", "uv", "texture-layout"]},
            {"region": "horns", "lock": ["base-geometry", "root-pivot"]},
        ],
        "variant_regions": {
            "eligible-geometry-regions": ["surface_growths", "horn_decorations", "back_growths"],
            "eligible-motion-regions": ["vines", "petals", "leaf_fronds"],
        },
    }
    dna = {
        "schema_version": 1,
        "profiles": [
            {
                "id": "example:crystal_grove",
                "needs_characterization": False,
                "palette": {"fog": "#223344", "foliage": "#55AA66"},
                "motifs": [{"id": "crystalline", "score": 2}, {"id": "vine", "score": 1}],
                "material_language": ["crystal", "vine", "leaf"],
                "geometry_language": ["faceted shards", "wrapped vine growths"],
                "motion_phenotype": {"preset": "heavy-crystal", "parameters": {"stiffness": 0.8}},
            },
            {
                "id": "runtime:secret_grove",
                "needs_characterization": True,
                "palette": {},
                "motifs": [],
                "material_language": [],
                "geometry_language": [],
                "motion_phenotype": {"preset": "balanced-organic", "parameters": {}},
            },
        ],
    }
    result = mod.build(subject, dna, mode="full-phenotype", base_seed=77)
    result2 = mod.build(subject, dna, mode="full-phenotype", base_seed=77)
    assert result == result2
    assert result["plan_count"] == 2
    plans = {row["biome_id"]: row for row in result["plans"]}
    crystal = plans["example:crystal_grove"]
    kinds = {row["kind"] for row in crystal["actions"]}
    assert {"texture-palette", "material-language", "motif-placement", "geometry-phenotype", "secondary-motion"} <= kinds
    locks = {row["region"]: set(row["locked"]) for row in crystal["lock_contract"]}
    assert "geometry" in locks["creeper_face"]
    assert "base-geometry" in locks["horns"]
    assert crystal["status"] == "ready"
    secret = plans["runtime:secret_grove"]
    assert secret["status"] == "needs-review"
    assert any(x["kind"] == "low-characterization" for x in secret["warnings"])
    assert crystal["seed"]["u64"] != secret["seed"]["u64"]

    texture = mod.build(subject, dna, biome_ids=["example:crystal_grove"], mode="texture-only", base_seed=77)
    texture_kinds = {row["kind"] for row in texture["plans"][0]["actions"]}
    assert "geometry-phenotype" not in texture_kinds
    assert "secondary-motion" not in texture_kinds

    missing = mod.build(subject, dna, biome_ids=["missing:not_here"], mode="geometry", base_seed=1)
    assert missing["plan_count"] == 0
    assert missing["unresolved"] == [{"kind": "biome-profile-not-found", "id": "missing:not_here"}]

    print(json.dumps({"status": "passed", "plans": 2, "action_kinds": sorted(kinds)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
