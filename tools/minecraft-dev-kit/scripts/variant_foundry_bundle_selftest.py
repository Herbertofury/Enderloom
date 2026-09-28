#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("bundle", HERE / "variant_foundry_bundle.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def dump(path: Path, value) -> None:
    path.write_text(json.dumps(value, sort_keys=True), encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        subject = root / "subject.json"
        plans = root / "plans.json"
        dna = root / "dna.json"
        model = root / "creeper.bbmodel"
        texture = root / "creeper.png"
        duplicate = root / "copy.bin"
        output = root / "bundle"

        dump(subject, {"schema_version": 1, "id": "bloom_and_boom:creeper_female"})
        dump(plans, {"schema_version": 1, "plans": [
            {"variant_id": "bloom_and_boom:creeper_female@minecraft:snowy_plains"},
            {"variant_id": "bloom_and_boom:creeper_female@minecraft:swamp"},
        ]})
        dump(dna, {"schema_version": 1, "profiles": []})
        model.write_bytes(b"bbmodel-fixture-v1")
        texture.write_bytes(b"texture-fixture-v1")
        duplicate.write_bytes(b"texture-fixture-v1")

        assets = [
            ("editable-model", model),
            ("texture", texture),
            ("duplicate-proof", duplicate),
        ]
        manifest = mod.build_manifest(
            subject_path=subject,
            plan_path=plans,
            biome_dna_path=dna,
            assets=assets,
            minecraft="26.3",
            loader="neoforge",
            backend="enderloom-skeletal",
        )
        assert manifest["asset_count"] == 3
        assert manifest["unique_object_count"] == 2
        assert len(manifest["variant_ids"]) == 2

        first = mod.compile_bundle(output, manifest)
        assert first["state"] == "compiled"
        second = mod.compile_bundle(output, manifest)
        assert second["state"] == "reused"
        assert second["bundle_id"] == first["bundle_id"]

        object_files = [p for p in (output / "objects").rglob("*") if p.is_file()]
        assert len(object_files) == 2
        saved = json.loads((output / "model-bundle.json").read_text(encoding="utf-8"))
        assert saved["bundle_id"] == manifest["bundle_id"]

        texture.write_bytes(b"texture-fixture-v2")
        changed = mod.build_manifest(
            subject_path=subject,
            plan_path=plans,
            biome_dna_path=dna,
            assets=assets,
            minecraft="26.3",
            loader="neoforge",
            backend="enderloom-skeletal",
        )
        assert changed["bundle_id"] != manifest["bundle_id"]
        try:
            mod.compile_bundle(output, changed)
        except ValueError as exc:
            assert "immutable bundle" in str(exc)
        else:
            raise AssertionError("mutating an existing immutable bundle should fail")

        print(json.dumps({
            "status": "passed",
            "bundle_id": manifest["bundle_id"],
            "assets": manifest["asset_count"],
            "unique_objects": manifest["unique_object_count"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
