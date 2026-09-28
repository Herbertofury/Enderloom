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

PROVIDER = r'''import argparse,hashlib,json,struct
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("--input");p.add_argument("--output");p.add_argument("--seed");p.add_argument("--params")
a=p.parse_args()
source=Path(a.input).read_bytes()
source_sha=hashlib.sha256(source).hexdigest()[:12]
positions=struct.pack("<9f",0,0,0,1,0,0,0,1,0)
root={"asset":{"version":"2.0","generator":"pipeline-provider-"+source_sha},"buffers":[{"byteLength":len(positions)}],"bufferViews":[{"buffer":0,"byteOffset":0,"byteLength":len(positions)}],"accessors":[{"bufferView":0,"componentType":5126,"count":3,"type":"VEC3"}],"meshes":[{"primitives":[{"attributes":{"POSITION":0},"mode":4}]}],"nodes":[{"mesh":0}],"scenes":[{"nodes":[0]}],"scene":0}
j=json.dumps(root,separators=(",",":")).encode();j+=b" "*((4-len(j)%4)%4)
b=positions+b"\x00"*((4-len(positions)%4)%4)
chunks=struct.pack("<II",len(j),0x4E4F534A)+j+struct.pack("<II",len(b),0x004E4942)+b
Path(a.output).write_bytes(struct.pack("<4sII",b"glTF",2,12+len(chunks))+chunks)
print(json.dumps({"state":"succeeded","source_sha":source_sha,"seed":int(a.seed)}))
'''


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
        bindings = root / "bindings.json"
        dump(bindings, {
            "schema_version": 1,
            "subject_id": "bloom_and_boom:creeper_female",
            "model_file": "creeper.bbmodel",
            "region_targets": {"surface_growths": ["surface_growths_anchor"]},
            "motion_targets": {"vines": ["vine_left", "vine_right"]},
            "texture_targets": {},
            "templates": {
                "geometry": {
                    "faceted shards": {
                        "regions": ["surface_growths"],
                        "operations": [{
                            "op": "add_mesh_primitive",
                            "shape": "icosphere",
                            "diameter": 1.0,
                            "detail": 1,
                            "name": "vf_{biome_slug}_facet_{index}",
                            "parent": "{target}"
                        }]
                    },
                    "crystal clusters": {
                        "regions": ["surface_growths"],
                        "operations": [{
                            "op": "add_mesh_primitive",
                            "shape": "cone",
                            "diameter": 1.25,
                            "height": 2.5,
                            "sides": 5,
                            "name": "vf_{biome_slug}_crystal_{index}",
                            "parent": "{target}"
                        }]
                    }
                },
                "motif": {
                    "crystalline": {
                        "regions": ["surface_growths"],
                        "operations": [{
                            "op": "add_group",
                            "name": "vf_{biome_slug}_crystalline_{index}",
                            "origin": [0, 0, 0],
                            "rotation": [0, 0, 0],
                            "parent": "{target}"
                        }]
                    }
                }
            }
        })

        provider_script = root / "provider.py"
        provider_script.write_text(PROVIDER, encoding="utf-8")
        concept = root / "concept.bin"
        concept.write_bytes(b"concept-one")
        registry = root / "providers.json"
        dump(registry, {
            "schema_version": 1,
            "providers": [{
                "id": "fixture-shape",
                "capabilities": ["shape"],
                "execution": "local",
                "command": [
                    "{python}", str(provider_script),
                    "--input", "{input}", "--output", "{output}",
                    "--seed", "{seed}", "--params", "{params_json}",
                ],
                "priority": 1,
                "model": "fixture",
                "code_license": "fixture",
                "weights_license": "fixture",
                "rights_state": "fixture-verified",
                "rights_verified": True,
                "validation": {"self_contained": True, "external": "off"},
                "output_extension": ".glb",
            }],
        })

        manifest = root / "pipeline.json"
        dump(manifest, {
            "schema_version": 1,
            "sources": ["source"],
            "subject": "subject.json",
            "authoring_bindings": "bindings.json",
            "biomes": ["example:crystal_grove"],
            "mode": "full-phenotype",
            "seed": 77,
            "provider_registry": "providers.json",
            "provider_jobs": [{
                "name": "creeper-shape",
                "capability": "shape",
                "input": "concept.bin",
                "role": "generated-model",
                "params": {"mode": "image"},
                "require_verified_rights": True,
                "output_extension": ".glb",
            }],
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
        assert first_states["authoring-recipes"] == "completed"
        assert first_states["provider:creeper-shape"] == "completed"
        assert first_states["texture:creeper-crystal"] == "completed"
        provider_stage = next(row for row in first["stages"] if row["stage"] == "provider:creeper-shape")
        assert provider_stage["asset_validation"]["state"] == "passed"
        bundle_manifest = json.loads(Path(first["bundle"]["manifest"]).read_text(encoding="utf-8"))
        assert bundle_manifest["evidence_count"] >= 5
        assert any(row["role"] == "authoring-recipes" for row in bundle_manifest["evidence"])
        evidence_roles = {row["role"] for row in bundle_manifest["evidence"]}
        assert "provider-job-receipt:creeper-shape" in evidence_roles
        assert any(role.startswith("provider-stdout:creeper-shape:fixture-shape") for role in evidence_roles)
        assert any(role.startswith("provider-asset-validation:creeper-shape:fixture-shape") for role in evidence_roles)

        second = mod.run_pipeline(manifest, workspace)
        assert second["state"] == "complete"
        assert second["bundle"]["state"] == "reused"
        second_states = {row["stage"]: row["state"] for row in second["stages"]}
        assert second_states["discovery"] == "reused"
        assert second_states["biome-dna"] == "reused"
        assert second_states["variant-plan"] == "reused"
        assert second_states["authoring-recipes"] == "reused"
        assert second_states["provider:creeper-shape"] == "reused"
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
        assert third_states["authoring-recipes"] == "reused"
        assert third_states["provider:creeper-shape"] == "reused"
        assert third_states["texture:creeper-crystal"] == "completed"
        assert third["bundle"]["bundle_id"] != first["bundle"]["bundle_id"]

        concept.write_bytes(b"concept-two")
        fourth = mod.run_pipeline(manifest, workspace)
        fourth_states = {row["stage"]: row["state"] for row in fourth["stages"]}
        assert fourth_states["discovery"] == "reused"
        assert fourth_states["biome-dna"] == "reused"
        assert fourth_states["variant-plan"] == "reused"
        assert fourth_states["authoring-recipes"] == "reused"
        assert fourth_states["texture:creeper-crystal"] == "reused"
        assert fourth_states["provider:creeper-shape"] == "completed"
        assert fourth["bundle"]["bundle_id"] != third["bundle"]["bundle_id"]

        state = json.loads((workspace / "pipeline-state.json").read_text(encoding="utf-8"))
        assert state["state"] == "complete"
        assert state["bundle"]["bundle_id"] == fourth["bundle"]["bundle_id"]

        print(json.dumps({
            "status": "passed",
            "first_bundle": first["bundle"]["bundle_id"],
            "third_bundle": third["bundle"]["bundle_id"],
            "fourth_bundle": fourth["bundle"]["bundle_id"],
            "cache_behavior": fourth_states,
            "provider_in_pipeline": True,
            "provider_evidence_bundled": True,
            "authoring_recipe_stage": True,
            "rights_gate": True,
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
