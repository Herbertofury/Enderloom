#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("discover", HERE / "variant_foundry_discover_biomes.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def write_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj), encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        write_json(root / "data/example/worldgen/biome/crystal_grove.json", {
            "has_precipitation": True,
            "temperature": 0.35,
            "downfall": 0.8,
            "effects": {
                "fog_color": 1122867,
                "water_color": 2241348,
                "sky_color": 3359829,
                "grass_color": 4478310,
                "particle": {"options": {"type": "example:sparkle"}, "probability": 0.02},
                "ambient_sound": "example:crystal_hum"
            },
            "features": [["example:crystal_patch"]],
            "spawners": {}
        })
        write_json(root / "data/example/worldgen/placed_feature/crystal_patch.json", {
            "feature": "example:crystal_cluster",
            "placement": [{"type": "minecraft:count", "count": 4}]
        })
        write_json(root / "data/example/worldgen/configured_feature/crystal_cluster.json", {
            "type": "minecraft:ore",
            "config": {"state": {"Name": "example:crystal_block"}}
        })
        write_json(root / "data/example/dimension/crystal_realm.json", {
            "type": "example:crystal_type",
            "generator": {"type": "minecraft:noise", "settings": "minecraft:overworld"}
        })
        write_json(root / "data/example/dimension_type/crystal_type.json", {
            "ultrawarm": False, "natural": True, "ambient_light": 0.1
        })
        write_json(root / "data/example/tags/worldgen/biome/crystal.json", {
            "replace": False, "values": ["example:crystal_grove"]
        })
        bad = root / "data/example/worldgen/biome/broken.json"
        bad.parent.mkdir(parents=True, exist_ok=True)
        bad.write_text("{broken", encoding="utf-8")

        source = root / "src/main/java/example/ModBiomes.java"
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text("""
public final class ModBiomes {
    public static final String MOD_ID = "sourceonly";
    public static final DeferredRegister<Biome> BIOMES =
        DeferredRegister.create(Registries.BIOME, MOD_ID);
    public static final RegistryObject<Biome> MYSTIC =
        BIOMES.register("mystic_biome", () -> null);
}
""", encoding="utf-8")

        mods = root / "mods"
        mods.mkdir()
        jar = mods / "ash.jar"
        with zipfile.ZipFile(jar, "w") as zf:
            zf.writestr("data/zipmod/worldgen/biome/ash_fields.json", json.dumps({
                "has_precipitation": False,
                "temperature": 1.6,
                "downfall": 0.0,
                "effects": {"fog_color": 100, "water_color": 200, "sky_color": 300}
            }))

        runtime = root / "runtime.json"
        write_json(runtime, {
            "registries": {
                "minecraft:worldgen/biome": ["example:crystal_grove", "runtime:secret_grove"],
                "minecraft:dimension": ["example:crystal_realm", "runtime:sky_realm"],
                "minecraft:dimension_type": ["example:crystal_type"]
            }
        })

        result = mod.discover([root], runtime_dump=runtime, max_reference_depth=4)
        result2 = mod.discover([root], runtime_dump=runtime, max_reference_depth=4)
        assert mod.json_dumps(result) == mod.json_dumps(result2), "output is not deterministic"

        biomes = {x["id"]: x for x in result["biomes"]}
        assert "example:crystal_grove" in biomes
        assert "zipmod:ash_fields" in biomes
        assert "runtime:secret_grove" in biomes
        if mod.registration_identity_inventory is not None:
            assert "sourceonly:mystic_biome" in biomes
            source_only = biomes["sourceonly:mystic_biome"]
            assert source_only["confidence"] == "registration-only"
            assert "source-registration" in source_only["sources"]
            assert any(
                row.get("category") == "biome" and row.get("id") == "sourceonly:mystic_biome"
                for row in result["source_registrations"]
            )
        crystal = biomes["example:crystal_grove"]
        assert crystal["profile"]["temperature"] == 0.35
        assert crystal["profile"]["effects"]["grass_color"] == 4478310
        assert "runtime-registry" in crystal["sources"]
        assert "example:crystal" in crystal["tags"]
        closure_ids = {x["id"] for x in crystal["reference_evidence"]}
        assert "example:crystal_patch" in closure_ids
        assert "example:crystal_cluster" in closure_ids
        cue_ids = {x["id"] for x in crystal["environment_cues"]}
        assert "example:crystal_block" in cue_ids

        runtime_only = biomes["runtime:secret_grove"]
        assert runtime_only["confidence"] == "registry-only"
        assert runtime_only["sources"] == ["runtime-registry"]
        assert any(x.get("kind") == "runtime-only-profile" and x.get("id") == "runtime:secret_grove" for x in result["unresolved"])
        assert any(x.get("kind") == "parse-error" and x.get("path", "").endswith("broken.json") for x in result["unresolved"])

        dimensions = {x["id"] for x in result["dimensions"]}
        assert {"example:crystal_realm", "runtime:sky_realm"} <= dimensions
        expected_biomes = 4 if mod.registration_identity_inventory is not None else 3
        assert result["counts"]["biomes"] == expected_biomes
        assert result["counts"]["dimensions"] == 2
        print(json.dumps({
            "status": "passed",
            "biomes": result["counts"]["biomes"],
            "dimensions": result["counts"]["dimensions"],
            "unresolved": result["counts"]["unresolved"],
            "input_resource_sha256": result["input_resource_sha256"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
