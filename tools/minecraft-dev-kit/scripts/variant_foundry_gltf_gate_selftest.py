#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import struct
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("gltf_gate", HERE / "variant_foundry_gltf_gate.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def glb_bytes(*, bad_mesh_index: bool = False, external_buffer: bool = False) -> bytes:
    positions = struct.pack("<9f", 0, 0, 0, 1, 0, 0, 0, 1, 0)
    buffer = {"byteLength": len(positions)}
    if external_buffer:
        buffer["uri"] = "external.bin"
    root = {
        "asset": {"version": "2.0", "generator": "variant-foundry-selftest"},
        "buffers": [buffer],
        "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": len(positions)}],
        "accessors": [{
            "bufferView": 0,
            "componentType": 5126,
            "count": 3,
            "type": "VEC3",
            "min": [0, 0, 0],
            "max": [1, 1, 0],
        }],
        "meshes": [{"primitives": [{"attributes": {"POSITION": 0}, "mode": 4}]}],
        "nodes": [{"mesh": 7 if bad_mesh_index else 0}],
        "scenes": [{"nodes": [0]}],
        "scene": 0,
    }
    raw_json = json.dumps(root, separators=(",", ":")).encode()
    raw_json += b" " * ((4 - len(raw_json) % 4) % 4)
    bin_data = positions + b"\x00" * ((4 - len(positions) % 4) % 4)
    chunks = struct.pack("<II", len(raw_json), mod.JSON_CHUNK) + raw_json
    if not external_buffer:
        chunks += struct.pack("<II", len(bin_data), mod.BIN_CHUNK) + bin_data
    return struct.pack("<4sII", b"glTF", 2, 12 + len(chunks)) + chunks


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        good = root / "good.glb"
        good.write_bytes(glb_bytes())
        report = mod.validate_glb(good, external="off")
        assert report["state"] == "passed", report
        assert report["stats"]["mesh_count"] == 1
        assert report["stats"]["vertex_count"] == 3
        assert report["stats"]["triangle_estimate"] == 1
        assert report["external_validator"]["state"] == "disabled"

        bad = root / "bad.glb"
        bad.write_bytes(b"not-a-glb")
        failed = mod.validate_glb(bad, external="off")
        assert failed["state"] == "failed"

        bad_index = root / "bad-index.glb"
        bad_index.write_bytes(glb_bytes(bad_mesh_index=True))
        failed_index = mod.validate_glb(bad_index, external="off")
        assert failed_index["state"] == "failed"
        assert "outside" in failed_index["reason"]

        external = root / "external.glb"
        external.write_bytes(glb_bytes(external_buffer=True))
        blocked = mod.validate_glb(external, self_contained=True, external="off")
        assert blocked["state"] == "failed"
        allowed = mod.validate_glb(external, self_contained=False, external="off")
        assert allowed["state"] == "passed", allowed

        fingerprint = mod.external_validator_fingerprint("auto")
        assert fingerprint["state"] in {"available", "unavailable"}

        print(json.dumps({
            "status": "passed",
            "valid": report["stats"],
            "bad_header_rejected": True,
            "bad_reference_rejected": True,
            "external_resource_policy": True,
            "external_validator_state": fingerprint["state"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
