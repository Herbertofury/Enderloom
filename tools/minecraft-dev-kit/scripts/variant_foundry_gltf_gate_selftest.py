#!/usr/bin/env python3
from __future__ import annotations

import copy
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



def range_regressions(directory: Path) -> dict[str, int]:
    seed = directory / "range-seed.glb"
    seed.write_bytes(glb_bytes())
    base, _, _ = mod.parse_glb(seed)
    totals = {"accepted": 0, "rejected": 0}

    def check(name, root, passed, reason="", *, self_contained=True):
        # Byte-layout controls, not full-spec acceptance tests. Geometry payloads
        # are zero-filled, so keep their POSITION bounds coherent with the bytes.
        root = copy.deepcopy(root)
        root["accessors"][0].update(min=[0, 0, 0], max=[0, 0, 0])
        raw = json.dumps(root, separators=(",", ":")).encode()
        raw += b" " * (-len(raw) % 4)
        chunks = struct.pack("<II", len(raw), mod.JSON_CHUNK) + raw
        if root.get("buffers") and "uri" not in root["buffers"][0]:
            size = root["buffers"][0]["byteLength"]
            if type(size) is not int or size < 0:
                size = 36
            data = bytearray(size + (-size % 4))
            # Give accepted sparse layouts strictly increasing in-range indices.
            # Leave negative fixtures untouched so their intended defects survive.
            if passed:
                for accessor in root["accessors"]:
                    sparse = accessor.get("sparse")
                    if sparse is None:
                        continue
                    indices = sparse["indices"]
                    view = root["bufferViews"][indices["bufferView"]]
                    fmt = {5121: "B", 5123: "H", 5125: "I"}[indices["componentType"]]
                    width = struct.calcsize("<" + fmt)
                    start = view.get("byteOffset", 0) + indices.get("byteOffset", 0)
                    assert view["buffer"] == 0 and sparse["count"] <= accessor["count"]
                    assert indices.get("byteOffset", 0) + sparse["count"] * width <= view["byteLength"]
                    for index in range(sparse["count"]):
                        struct.pack_into("<" + fmt, data, start + index * width, index)
            chunks += struct.pack("<II", len(data), mod.BIN_CHUNK) + data
        path = directory / (name + ".glb")
        path.write_bytes(struct.pack("<4sII", b"glTF", 2, 12 + len(chunks)) + chunks)
        report = mod.validate_glb(path, external="off", self_contained=self_contained)
        assert report["state"] == ("passed" if passed else "failed"), (name, report)
        if reason:
            assert reason in report.get("reason", ""), (name, report)
        totals["accepted" if passed else "rejected"] += 1

    for key, value, reason in [
        ("byteOffset", 36, "byte range"), ("byteLength", 37, "byte range"),
        ("byteOffset", -1, "integer"), ("byteOffset", True, "integer"),
        ("byteLength", 0, "integer"), ("byteLength", 36.0, "integer"),
        ("byteStride", 8, "smaller"), ("byteStride", 14, "multiple"),
        ("byteStride", 256, "multiple"), ("byteStride", True, "integer")]:
        root = copy.deepcopy(base)
        root["bufferViews"][0][key] = value
        check(f"view-{key}-{value}", root, False, reason)
    for key, value, reason in [
        ("count", 4, "byte span"), ("count", True, "integer"),
        ("count", 0, "positive"), ("byteOffset", 4, "byte span"),
        ("byteOffset", 2, "component-aligned"), ("byteOffset", -4, "integer"),
        ("byteOffset", False, "integer"), ("componentType", 5126.0, "componentType"),
        ("componentType", [], "componentType"), ("type", [], ".type")]:
        root = copy.deepcopy(base)
        root["accessors"][0][key] = value
        check(f"accessor-{key}-{value}", root, False, reason)
    for length, passed in [(68, True), (67, False)]:
        root = copy.deepcopy(base)
        root["buffers"][0]["byteLength"] = length
        root["bufferViews"][0].update(byteLength=length, byteStride=24)
        root["accessors"][0]["byteOffset"] = 8
        check(f"interleaved-{length}", root, passed)
    root = copy.deepcopy(base)
    root["accessors"][0].pop("bufferView")
    root["bufferViews"] = []
    root["buffers"] = []
    check("implicit-zero", root, True)
    root["accessors"][0]["byteOffset"] = 0
    check("implicit-zero-with-offset", root, False, "requires bufferView")

    # Extra, non-vertex accessors isolate matrix layout from geometry semantics.
    for kind, component, stride, tail in [
        ("MAT2", 5121, 8, 6), ("MAT3", 5121, 12, 11),
        ("MAT3", 5123, 24, 22), ("MAT4", 5126, 64, 64)]:
        for count in (1, 2):
            for delta, passed in [(0, True), (-1, False), (stride-tail, True)]:
                root = copy.deepcopy(base)
                length = (count-1)*stride + tail + delta
                root["buffers"][0]["byteLength"] = 36 + length
                root["bufferViews"].append({"buffer": 0, "byteOffset": 36, "byteLength": length})
                root["accessors"].append({"bufferView": 1, "componentType": component,
                                          "type": kind, "count": count})
                check(f"matrix-{kind}-{component}-{count}-{delta}", root, passed)

    root = copy.deepcopy(base)
    root["accessors"][0].pop("bufferView")
    root["buffers"][0]["byteLength"] = 40
    root["bufferViews"] = [{"buffer": 0, "byteLength": 3},
                            {"buffer": 0, "byteOffset": 4, "byteLength": 36}]
    root["accessors"][0]["sparse"] = {"count": 3,
        "indices": {"bufferView": 0, "componentType": 5121}, "values": {"bufferView": 1}}
    check("sparse-zero-base", root, True)
    for label, change, reason in [
        ("index-overrun", lambda r: r["bufferViews"][0].update(byteLength=2), "sparse.indices byte span"),
        ("value-overrun", lambda r: r["bufferViews"][1].update(byteLength=35), "sparse.values byte span"),
        ("count-overrun", lambda r: r["accessors"][0]["sparse"].update(count=4), "exceeds accessor.count"),
        ("index-type", lambda r: r["accessors"][0]["sparse"]["indices"].update(componentType=True), "componentType"),
        ("sparse-stride", lambda r: r["bufferViews"][1].update(byteStride=12), "must not define"),
        ("sparse-ref", lambda r: r["accessors"][0]["sparse"]["values"].update(bufferView=2), "outside")]:
        broken = copy.deepcopy(root)
        change(broken)
        check(label, broken, False, reason)
    root = copy.deepcopy(base)
    root["buffers"][0]["uri"] = "external.bin"
    check("external-valid-opt-out", root, True, self_contained=False)
    root["accessors"][0]["count"] = 4
    check("external-overrun-opt-out", root, False, "byte span", self_contained=False)
    root = copy.deepcopy(base)
    root["buffers"][0]["byteLength"] = 35
    check("bin-padding-is-not-buffer", root, False, "byte range")
    return totals

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
            "binary_range_cases": range_regressions(root),
            "bad_header_rejected": True,
            "bad_reference_rejected": True,
            "external_resource_policy": True,
            "external_validator_state": fingerprint["state"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
