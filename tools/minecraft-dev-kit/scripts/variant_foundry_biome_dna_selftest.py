#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("biome_dna", HERE / "variant_foundry_biome_dna.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def main() -> int:
    discovery = {
        "schema_version": 1,
        "input_resource_sha256": "a" * 64,
        "biomes": [
            {
                "id": "example:crystal_grove",
                "existence": "present",
                "confidence": "high",
                "sources": ["static-json"],
                "profile": {
                    "temperature": 0.1,
                    "downfall": 0.75,
                    "has_precipitation": True,
                    "effects": {
                        "fog_color": 0x223344,
                        "water_color": 0x335577,
                        "sky_color": 0x7799CC,
                        "foliage_color": 0x55AA66,
                    },
                },
                "tags": ["example:crystal_biomes"],
                "environment_cues": [
                    {"id": "example:crystal_cluster", "context": "features.0.0"},
                    {"id": "example:hanging_vines", "context": "feature.config"},
                ],
                "evidence": [{"path": "data/example/worldgen/biome/crystal_grove.json", "sha256": "b" * 64}],
                "unresolved_references": [],
            },
            {
                "id": "runtime:secret_grove",
                "existence": "present",
                "confidence": "registry-only",
                "sources": ["runtime-registry"],
                "evidence": [{"sha256": "c" * 64}],
            },
        ],
    }
    overrides = {
        "example:crystal_grove": {
            "motion_phenotype": {"preset": "bloom-boom-crystal-vine"},
            "artist_notes": "keep face and horns locked",
        }
    }
    result = mod.build(discovery, overrides)
    assert result["profile_count"] == 2
    profiles = {row["id"]: row for row in result["profiles"]}
    crystal = profiles["example:crystal_grove"]
    assert crystal["palette"]["fog"] == "#223344"
    assert crystal["climate"]["temperature_band"] == "frozen"
    motifs = {row["id"] for row in crystal["motifs"]}
    assert {"crystalline", "vine", "frozen"} <= motifs
    assert "crystal" in crystal["material_language"]
    assert crystal["motion_phenotype"]["preset"] == "bloom-boom-crystal-vine"
    assert crystal["override_applied"] is True
    assert crystal["artist_notes"] == "keep face and horns locked"

    runtime_only = profiles["runtime:secret_grove"]
    assert runtime_only["needs_characterization"] is True
    assert runtime_only["characterization_confidence"] == "low"
    assert runtime_only["palette"] == {}

    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        discovery_path = root / "discovery.json"
        overrides_path = root / "overrides.json"
        output_path = root / "profile.json"
        discovery_path.write_text(json.dumps(discovery), encoding="utf-8")
        overrides_path.write_text(json.dumps({"profiles": overrides}), encoding="utf-8")
        code = mod.main([
            "--discovery", str(discovery_path),
            "--biome", "example:crystal_grove",
            "--overrides", str(overrides_path),
            "--json-out", str(output_path),
        ])
        assert code == 0
        one = json.loads(output_path.read_text(encoding="utf-8"))
        assert one["id"] == "example:crystal_grove"
        assert one["motion_phenotype"]["preset"] == "bloom-boom-crystal-vine"

    print(json.dumps({"status": "passed", "profiles": 2, "motifs": sorted(motifs)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
