#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("pipeline", HERE / "variant_foundry_pipeline.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def dump(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        source = root / "source"
        dump(source / "data/example/worldgen/biome/crystal_grove.json", {
            "has_precipitation": True,
            "temperature": 0.1,
            "downfall": 0.8,
            "effects": {
                "fog_color": 0x223344,
                "water_color": 0x335577,
                "sky_color": 0x7799CC,
                "foliage_color": 0x55AA66,
            },
            "features": [["example:crystal_patch"]],
        })
        dump(source / "data/example/worldgen/placed_feature/crystal_patch.json", {
            "feature": "example:crystal_cluster",
            "placement": [],
        })
        dump(source / "data/example/worldgen/configured_feature/crystal_cluster.json", {
            "type": "minecraft:ore",
            "config": {"state": {"Name": "example:crystal_block"}},
        })

        subject = root / "subject.json"
        dump(subject, {
            "schema_version": 1,
            "id": "bloom_and_boom:creeper_female",
            "identity_anchors": ["creeper_face", "horns"],
            "region_locks": [
                {"region": "creeper_face", "lock": ["geometry", "uv"]},
                {"region": "horns", "lock": ["base-geometry"]},
            ],
            "variant_regions": {
                "eligible-geometry-regions": ["surface_growths"],
                "eligible-motion-regions": ["vines"],
            },
        })

        image = mod.texture_mod.Image(2, 2, bytearray([
            20, 150, 40, 255, 40, 180, 60, 255,
            200, 220, 240, 255, 0, 0, 0, 0,
        ]))
        working_png = root / "working.png"
        working_png.write_bytes(mod.texture_mod.encode_png(image))
        style = root / "style.json"
        dump(style, {
            "schema_version": 1,
            "name": "fixture",
            "target_size": [2, 2],
            "palette": ["#149628", "#C8DCF0"],
            "dither": "none",
            "alpha_threshold": 128,
            "transparent_edge_dilation": 1,
        })

        model = root / "creeper.bbmodel"
        model.write_text('{"meta":{"model_format":"free"},"name":"fixture"}', encoding="utf-8")
        manifest = root / "pipeline.json"
        dump(manifest, {
            "schema_version": 1,
            "sources": ["source"],
            "subject": "subject.json",
            "biomes": ["example:crystal_grove"],
            "mode": "full-phenotype",
            "seed": 77,
            "textures": [{
                "name": "creeper-crystal",
                "role": "texture",
                "input": "working.png",
                "profile": "style.json",
            }],
            "assets": [{"role": "editable-model", "path": "creeper.bbmodel"}],
            "target": {"minecraft": "26.3", "loader": "neoforge", "backend": "enderloom-skeletal"},
        })
        workspace = root / "workspace"

        first = mod.run_pipeline(manifest, workspace)
        assert first["state"] == "complete"
        assert first["bundle"]["state"] == "compiled"
        first_states = {row["stage"]: row["state"] for row in first["stages"]}
        assert first_states["discovery"] == "completed"
        assert first_states["biome-dna"] == "completed"
        assert first_states["variant-plan"] == "completed"
        assert first_states["texture:creeper-crystal"] == "completed"

        second = mod.run_pipeline(manifest, workspace)
        assert second["state"] == "complete"
        assert second["bundle"]["state"] == "reused"
        second_states = {row["stage"]: row["state"] for row in second["stages"]}
        assert second_states["discovery"] == "reused"
        assert second_states["biome-dna"] == "reused"
        assert second_states["variant-plan"] == "reused"
        assert second_states["texture:creeper-crystal"] == "reused"
        assert second["bundle"]["bundle_id"] == first["bundle"]["bundle_id"]

        style_data = json.loads(style.read_text(encoding="utf-8"))
        style_data["palette"].append("#553377")
        dump(style, style_data)
        third = mod.run_pipeline(manifest, workspace)
        third_states = {row["stage"]: row["state"] for row in third["stages"]}
        assert third_states["discovery"] == "reused"
        assert third_states["biome-dna"] == "reused"
        assert third_states["variant-plan"] == "reused"
        assert third_states["texture:creeper-crystal"] == "completed"
        assert third["bundle"]["bundle_id"] != first["bundle"]["bundle_id"]

        state = json.loads((workspace / "pipeline-state.json").read_text(encoding="utf-8"))
        assert state["state"] == "complete"
        assert state["bundle"]["bundle_id"] == third["bundle"]["bundle_id"]

        print(json.dumps({
            "status": "passed",
            "first_bundle": first["bundle"]["bundle_id"],
            "third_bundle": third["bundle"]["bundle_id"],
            "cache_behavior": third_states,
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
