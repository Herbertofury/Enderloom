#!/usr/bin/env python3
"""Validate provider-produced GLB assets before Variant Foundry promotion.

The built-in gate is dependency-free and intentionally strict about GLB framing,
index references, self-contained resources and usable geometry. If glTF Transform
is installed, its current spec validator is also run. External validation may be
required for release lanes without making local/offline iteration depend on npm.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import struct
import subprocess
import sys
from pathlib import Path
from typing import Any

JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942
GLTF_TRANSFORM_UPSTREAM = {
    "repository": "donmccurdy/glTF-Transform",
    "commit": "a5d768b87efaae1fa65ddd17cd551a45b57abd70",
    "license": "MIT",
}


class GLBValidationError(ValueError):
    pass


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(path)


def _fail(message: str) -> None:
    raise GLBValidationError(message)


def _list(root: dict[str, Any], name: str) -> list[Any]:
    value = root.get(name, [])
    if value is None:
        return []
    if not isinstance(value, list):
        _fail(f"{name} must be an array")
    return value


def _index(value: Any, size: int, label: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        _fail(f"{label} must be an integer index")
    if value < 0 or value >= size:
        _fail(f"{label} index {value} is outside 0..{size - 1}")
    return value



def _uint(value: Any, label: str, minimum: int = 0) -> int:
    if type(value) is not int or value < minimum:
        _fail(f"{label} must be an integer >= {minimum}")
    return value


def _accessor_layout(accessor: dict[str, Any], label: str) -> tuple[int, int, int, bool]:
    # glTF 2.0 section 3.6.2.4: matrix columns start on 4-byte boundaries.
    sizes = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
    component = accessor.get("componentType")
    if type(component) is not int or component not in sizes:
        _fail(f"{label}.componentType is invalid")
    kind = accessor.get("type")
    shapes = {"SCALAR": (1, 1), "VEC2": (1, 2), "VEC3": (1, 3),
              "VEC4": (1, 4), "MAT2": (2, 2), "MAT3": (3, 3), "MAT4": (4, 4)}
    if not isinstance(kind, str) or kind not in shapes:
        _fail(f"{label}.type is invalid")
    columns, rows = shapes[kind]
    size = sizes[component]
    column_bytes = rows * size
    matrix = columns > 1
    column_stride = (column_bytes + 3) // 4 * 4 if matrix else column_bytes
    # The final column's trailing padding may be absent, unlike internal padding.
    return size, columns * column_stride, (columns - 1) * column_stride + column_bytes, matrix


def _accessor_span(obj: dict[str, Any], views: list[Any], count: int,
                   size: int, packed_stride: int, last_size: int, matrix: bool,
                   label: str, *, sparse: bool = False) -> None:
    view = views[_index(obj.get("bufferView"), len(views), f"{label}.bufferView")]
    offset = _uint(obj.get("byteOffset", 0), f"{label}.byteOffset")
    absolute = view.get("byteOffset", 0) + offset
    if offset % size or absolute % size:
        _fail(f"{label}.byteOffset is not component-aligned")
    if matrix and absolute % 4:
        _fail(f"{label} matrix columns are not 4-byte-aligned")
    if sparse and ("byteStride" in view or "target" in view):
        _fail(f"{label} sparse bufferView must not define byteStride or target")
    stride = view.get("byteStride", packed_stride)
    if stride < packed_stride or stride % size:
        _fail(f"{label} byteStride is smaller than its element or not component-aligned")
    end = offset + (count - 1) * stride + last_size
    if end > view["byteLength"]:
        _fail(f"{label} byte span ends at {end}, beyond bufferView.byteLength {view['byteLength']}")


def _validate_binary_ranges(accessors: list[Any], views: list[Any], buffers: list[Any]) -> None:
    # Metadata containment only. External/data URI payloads and extension decoding
    # remain the external validator's responsibility; never fetch resources here.
    for i, view in enumerate(views):
        label = f"bufferViews[{i}]"
        if not isinstance(view, dict):
            _fail(f"{label} must be an object")
        buffer = buffers[_index(view.get("buffer"), len(buffers), f"{label}.buffer")]
        offset = _uint(view.get("byteOffset", 0), f"{label}.byteOffset")
        length = _uint(view.get("byteLength"), f"{label}.byteLength", 1)
        if offset + length > buffer["byteLength"]:
            _fail(f"{label} byte range exceeds buffers[{view['buffer']}].byteLength")
        if "byteStride" in view:
            stride = _uint(view["byteStride"], f"{label}.byteStride", 4)
            if stride > 252 or stride % 4:
                _fail(f"{label}.byteStride must be a multiple of 4 in 4..252")
    for i, accessor in enumerate(accessors):
        label = f"accessors[{i}]"
        if not isinstance(accessor, dict):
            _fail(f"{label} must be an object")
        count = _uint(accessor.get("count"), f"{label}.count", 1)
        size, stride, last, matrix = _accessor_layout(accessor, label)
        if "bufferView" in accessor:
            _accessor_span(accessor, views, count, size, stride, last, matrix, label)
        elif "byteOffset" in accessor:
            _fail(f"{label}.byteOffset requires bufferView")
        # An absent base bufferView is valid (implicit zeros), with or without sparse.
        if "sparse" not in accessor:
            continue
        sparse = accessor["sparse"]
        if not isinstance(sparse, dict):
            _fail(f"{label}.sparse must be an object")
        sparse_count = _uint(sparse.get("count"), f"{label}.sparse.count", 1)
        if sparse_count > count:
            _fail(f"{label}.sparse.count exceeds accessor.count")
        indices, values = sparse.get("indices"), sparse.get("values")
        if not isinstance(indices, dict) or not isinstance(values, dict):
            _fail(f"{label}.sparse requires indices and values objects")
        index_type = indices.get("componentType")
        if type(index_type) is not int or index_type not in (5121, 5123, 5125):
            _fail(f"{label}.sparse.indices.componentType is invalid")
        index_size = {5121: 1, 5123: 2, 5125: 4}[index_type]
        _accessor_span(indices, views, sparse_count, index_size, index_size, index_size,
                       False, f"{label}.sparse.indices", sparse=True)
        _accessor_span(values, views, sparse_count, size, stride, last, matrix,
                       f"{label}.sparse.values", sparse=True)

def _optional_index(obj: dict[str, Any], key: str, size: int, label: str) -> None:
    if key in obj:
        _index(obj[key], size, f"{label}.{key}")


def _texture_info_index(value: Any, textures: list[Any], label: str) -> None:
    if value is None:
        return
    if not isinstance(value, dict):
        _fail(f"{label} must be an object")
    if "index" not in value:
        _fail(f"{label}.index is required")
    _index(value["index"], len(textures), f"{label}.index")


def parse_glb(path: Path) -> tuple[dict[str, Any], bytes | None, list[dict[str, Any]]]:
    data = path.read_bytes()
    if len(data) < 20:
        _fail("GLB is too small to contain header + JSON chunk")
    magic, version, declared_length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF":
        _fail(f"invalid GLB magic: {magic!r}")
    if version != 2:
        _fail(f"unsupported GLB version: {version}; expected 2")
    if declared_length != len(data):
        _fail(f"GLB declared length {declared_length} != actual {len(data)}")

    chunks: list[dict[str, Any]] = []
    offset = 12
    while offset < len(data):
        if offset + 8 > len(data):
            _fail("truncated GLB chunk header")
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        if chunk_length % 4:
            _fail(f"GLB chunk at {offset} has non-4-byte-aligned length {chunk_length}")
        start = offset + 8
        end = start + chunk_length
        if end > len(data):
            _fail(f"GLB chunk at {offset} overruns declared file length")
        chunks.append({"type": chunk_type, "offset": start, "length": chunk_length, "bytes": data[start:end]})
        offset = end
    if offset != len(data):
        _fail("GLB chunk traversal did not terminate at file end")
    if not chunks or chunks[0]["type"] != JSON_CHUNK:
        _fail("first GLB chunk must be JSON")
    if sum(1 for row in chunks if row["type"] == JSON_CHUNK) != 1:
        _fail("GLB must contain exactly one JSON chunk")
    if sum(1 for row in chunks if row["type"] == BIN_CHUNK) > 1:
        _fail("GLB must not contain more than one BIN chunk")

    raw_json = chunks[0]["bytes"].rstrip(b" \t\r\n\x00")
    try:
        gltf = json.loads(raw_json.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        _fail(f"invalid GLB JSON chunk: {exc}")
    if not isinstance(gltf, dict):
        _fail("GLB JSON root must be an object")
    bin_chunk = next((row["bytes"] for row in chunks if row["type"] == BIN_CHUNK), None)
    public_chunks = [{"type": row["type"], "offset": row["offset"], "length": row["length"]} for row in chunks]
    return gltf, bin_chunk, public_chunks


def validate_structure(gltf: dict[str, Any], bin_chunk: bytes | None, *, self_contained: bool) -> dict[str, Any]:
    asset = gltf.get("asset")
    if not isinstance(asset, dict):
        _fail("asset object is required")
    version = str(asset.get("version", ""))
    if not version.startswith("2."):
        _fail(f"asset.version must be glTF 2.x, got {version!r}")

    scenes = _list(gltf, "scenes")
    nodes = _list(gltf, "nodes")
    meshes = _list(gltf, "meshes")
    accessors = _list(gltf, "accessors")
    buffer_views = _list(gltf, "bufferViews")
    buffers = _list(gltf, "buffers")
    materials = _list(gltf, "materials")
    textures = _list(gltf, "textures")
    images = _list(gltf, "images")
    samplers = _list(gltf, "samplers")
    skins = _list(gltf, "skins")
    animations = _list(gltf, "animations")
    cameras = _list(gltf, "cameras")

    if "scene" in gltf:
        _index(gltf["scene"], len(scenes), "scene")
    for i, scene in enumerate(scenes):
        if not isinstance(scene, dict):
            _fail(f"scenes[{i}] must be an object")
        for j, node in enumerate(scene.get("nodes", []) or []):
            _index(node, len(nodes), f"scenes[{i}].nodes[{j}]")

    for i, node in enumerate(nodes):
        if not isinstance(node, dict):
            _fail(f"nodes[{i}] must be an object")
        _optional_index(node, "mesh", len(meshes), f"nodes[{i}]")
        _optional_index(node, "skin", len(skins), f"nodes[{i}]")
        _optional_index(node, "camera", len(cameras), f"nodes[{i}]")
        for j, child in enumerate(node.get("children", []) or []):
            _index(child, len(nodes), f"nodes[{i}].children[{j}]")

    position_primitives = 0
    vertex_count = 0
    triangle_estimate = 0
    for mi, mesh in enumerate(meshes):
        if not isinstance(mesh, dict):
            _fail(f"meshes[{mi}] must be an object")
        primitives = mesh.get("primitives")
        if not isinstance(primitives, list) or not primitives:
            _fail(f"meshes[{mi}].primitives must be a non-empty array")
        for pi, primitive in enumerate(primitives):
            if not isinstance(primitive, dict):
                _fail(f"meshes[{mi}].primitives[{pi}] must be an object")
            attrs = primitive.get("attributes")
            if not isinstance(attrs, dict) or not attrs:
                _fail(f"meshes[{mi}].primitives[{pi}].attributes must be non-empty")
            for name, accessor in attrs.items():
                _index(accessor, len(accessors), f"meshes[{mi}].primitives[{pi}].attributes.{name}")
            if "POSITION" in attrs:
                position_primitives += 1
                pos_index = _index(attrs["POSITION"], len(accessors), f"meshes[{mi}].primitives[{pi}].attributes.POSITION")
                pos = accessors[pos_index]
                if not isinstance(pos, dict):
                    _fail(f"accessors[{pos_index}] must be an object")
                count = pos.get("count")
                if not isinstance(count, int) or count <= 0:
                    _fail(f"POSITION accessor {pos_index} must have positive count")
                vertex_count += count
            if "indices" in primitive:
                idx = _index(primitive["indices"], len(accessors), f"meshes[{mi}].primitives[{pi}].indices")
                acc = accessors[idx]
                if isinstance(acc, dict) and isinstance(acc.get("count"), int):
                    count = acc["count"]
                else:
                    count = 0
            elif "POSITION" in attrs:
                pos = accessors[attrs["POSITION"]]
                count = pos.get("count", 0) if isinstance(pos, dict) else 0
            else:
                count = 0
            mode = primitive.get("mode", 4)
            if not isinstance(mode, int) or mode < 0 or mode > 6:
                _fail(f"meshes[{mi}].primitives[{pi}].mode is invalid: {mode!r}")
            if mode == 4:
                triangle_estimate += count // 3
            elif mode in (5, 6):
                triangle_estimate += max(0, count - 2)
            if "material" in primitive:
                _index(primitive["material"], len(materials), f"meshes[{mi}].primitives[{pi}].material")
            for ti, target in enumerate(primitive.get("targets", []) or []):
                if not isinstance(target, dict):
                    _fail(f"meshes[{mi}].primitives[{pi}].targets[{ti}] must be an object")
                for name, accessor in target.items():
                    _index(accessor, len(accessors), f"meshes[{mi}].primitives[{pi}].targets[{ti}].{name}")

    if not meshes:
        _fail("asset contains no meshes")
    if position_primitives == 0:
        _fail("asset contains no primitive with a POSITION attribute")

    for i, buffer in enumerate(buffers):
        if not isinstance(buffer, dict):
            _fail(f"buffers[{i}] must be an object")
        byte_length = _uint(buffer.get("byteLength"), f"buffers[{i}].byteLength", 1)
        uri = buffer.get("uri")
        if uri is None:
            if i != 0:
                _fail(f"buffers[{i}] has no URI; only GLB buffer 0 may use the BIN chunk")
            if byte_length and bin_chunk is None:
                _fail("buffer 0 requires BIN chunk but GLB contains none")
            if bin_chunk is not None and byte_length > len(bin_chunk):
                _fail(f"buffer 0 byteLength {byte_length} exceeds BIN chunk {len(bin_chunk)}")
            if bin_chunk is not None and len(bin_chunk) - byte_length > 3:
                _fail("BIN chunk contains more than 3 bytes beyond declared buffer length")
        elif self_contained and not str(uri).startswith("data:"):
            _fail(f"external buffer URI is forbidden by self-contained gate: buffers[{i}].uri={uri!r}")

    _validate_binary_ranges(accessors, buffer_views, buffers)

    for i, image in enumerate(images):
        if not isinstance(image, dict):
            _fail(f"images[{i}] must be an object")
        if "bufferView" in image:
            _index(image["bufferView"], len(buffer_views), f"images[{i}].bufferView")
        uri = image.get("uri")
        if self_contained and isinstance(uri, str) and not uri.startswith("data:"):
            _fail(f"external image URI is forbidden by self-contained gate: images[{i}].uri={uri!r}")
        if "bufferView" not in image and uri is None:
            _fail(f"images[{i}] must have bufferView or uri")

    for i, texture in enumerate(textures):
        if not isinstance(texture, dict):
            _fail(f"textures[{i}] must be an object")
        _optional_index(texture, "source", len(images), f"textures[{i}]")
        _optional_index(texture, "sampler", len(samplers), f"textures[{i}]")

    for i, material in enumerate(materials):
        if not isinstance(material, dict):
            _fail(f"materials[{i}] must be an object")
        pbr = material.get("pbrMetallicRoughness")
        if pbr is not None:
            if not isinstance(pbr, dict):
                _fail(f"materials[{i}].pbrMetallicRoughness must be an object")
            _texture_info_index(pbr.get("baseColorTexture"), textures, f"materials[{i}].pbrMetallicRoughness.baseColorTexture")
            _texture_info_index(pbr.get("metallicRoughnessTexture"), textures, f"materials[{i}].pbrMetallicRoughness.metallicRoughnessTexture")
        _texture_info_index(material.get("normalTexture"), textures, f"materials[{i}].normalTexture")
        _texture_info_index(material.get("occlusionTexture"), textures, f"materials[{i}].occlusionTexture")
        _texture_info_index(material.get("emissiveTexture"), textures, f"materials[{i}].emissiveTexture")

    for i, skin in enumerate(skins):
        if not isinstance(skin, dict):
            _fail(f"skins[{i}] must be an object")
        _optional_index(skin, "inverseBindMatrices", len(accessors), f"skins[{i}]")
        _optional_index(skin, "skeleton", len(nodes), f"skins[{i}]")
        joints = skin.get("joints")
        if not isinstance(joints, list) or not joints:
            _fail(f"skins[{i}].joints must be a non-empty array")
        for j, node in enumerate(joints):
            _index(node, len(nodes), f"skins[{i}].joints[{j}]")

    for ai, animation in enumerate(animations):
        if not isinstance(animation, dict):
            _fail(f"animations[{ai}] must be an object")
        anim_samplers = animation.get("samplers")
        channels = animation.get("channels")
        if not isinstance(anim_samplers, list) or not isinstance(channels, list):
            _fail(f"animations[{ai}] requires samplers and channels arrays")
        for si, sampler in enumerate(anim_samplers):
            if not isinstance(sampler, dict):
                _fail(f"animations[{ai}].samplers[{si}] must be an object")
            _index(sampler.get("input"), len(accessors), f"animations[{ai}].samplers[{si}].input")
            _index(sampler.get("output"), len(accessors), f"animations[{ai}].samplers[{si}].output")
        for ci, channel in enumerate(channels):
            if not isinstance(channel, dict):
                _fail(f"animations[{ai}].channels[{ci}] must be an object")
            _index(channel.get("sampler"), len(anim_samplers), f"animations[{ai}].channels[{ci}].sampler")
            target = channel.get("target")
            if not isinstance(target, dict):
                _fail(f"animations[{ai}].channels[{ci}].target must be an object")
            if "node" in target:
                _index(target["node"], len(nodes), f"animations[{ai}].channels[{ci}].target.node")
            if target.get("path") not in {"translation", "rotation", "scale", "weights", "pointer"}:
                _fail(f"animations[{ai}].channels[{ci}].target.path is invalid: {target.get('path')!r}")

    extensions_used = gltf.get("extensionsUsed", []) or []
    extensions_required = gltf.get("extensionsRequired", []) or []
    if not isinstance(extensions_used, list) or not all(isinstance(x, str) for x in extensions_used):
        _fail("extensionsUsed must be a string array")
    if not isinstance(extensions_required, list) or not all(isinstance(x, str) for x in extensions_required):
        _fail("extensionsRequired must be a string array")
    missing_used = sorted(set(extensions_required) - set(extensions_used))
    if missing_used:
        _fail(f"extensionsRequired contains entries absent from extensionsUsed: {missing_used}")

    return {
        "asset_version": version,
        "generator": asset.get("generator"),
        "scene_count": len(scenes),
        "node_count": len(nodes),
        "mesh_count": len(meshes),
        "primitive_count": sum(len(m.get("primitives", [])) for m in meshes if isinstance(m, dict)),
        "position_primitive_count": position_primitives,
        "vertex_count": vertex_count,
        "triangle_estimate": triangle_estimate,
        "accessor_count": len(accessors),
        "buffer_view_count": len(buffer_views),
        "material_count": len(materials),
        "texture_count": len(textures),
        "image_count": len(images),
        "skin_count": len(skins),
        "animation_count": len(animations),
        "extensions_used": extensions_used,
        "extensions_required": extensions_required,
        "self_contained": self_contained,
    }


def external_validator_fingerprint(mode: str = "auto") -> dict[str, Any]:
    if mode == "off":
        return {"mode": "off", "state": "disabled", "upstream": GLTF_TRANSFORM_UPSTREAM}
    command = shutil.which("gltf-transform")
    if not command:
        return {"mode": mode, "state": "unavailable", "upstream": GLTF_TRANSFORM_UPSTREAM}
    version = ""
    try:
        cp = subprocess.run(
            [command, "--version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10,
        )
        version = (cp.stdout or cp.stderr or "").strip().splitlines()[0] if (cp.stdout or cp.stderr) else ""
    except (OSError, subprocess.TimeoutExpired):
        pass
    return {
        "mode": mode,
        "state": "available",
        "command": command,
        "version": version,
        "upstream": GLTF_TRANSFORM_UPSTREAM,
    }


def run_external_validator(path: Path, mode: str) -> dict[str, Any]:
    fingerprint = external_validator_fingerprint(mode)
    if fingerprint["state"] == "disabled":
        return fingerprint
    if fingerprint["state"] == "unavailable":
        if mode == "require":
            return {**fingerprint, "state": "failed", "reason": "required gltf-transform validator is unavailable"}
        return fingerprint
    started = __import__("time").monotonic()
    try:
        cp = subprocess.run(
            [fingerprint["command"], "validate", str(path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
        )
    except subprocess.TimeoutExpired as exc:
        return {
            **fingerprint,
            "state": "failed",
            "reason": "gltf-transform validate timed out",
            "stdout_tail": (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else "",
            "stderr_tail": (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else "",
        }
    elapsed = __import__("time").monotonic() - started
    return {
        **fingerprint,
        "state": "passed" if cp.returncode == 0 else "failed",
        "returncode": cp.returncode,
        "elapsed_seconds": round(elapsed, 6),
        "stdout_tail": (cp.stdout or "")[-8000:],
        "stderr_tail": (cp.stderr or "")[-8000:],
    }


def validate_glb(path: Path, *, self_contained: bool = True, external: str = "auto") -> dict[str, Any]:
    path = path.resolve()
    if external not in {"off", "auto", "require"}:
        raise ValueError("external validator mode must be off, auto or require")
    base = {
        "schema_version": 1,
        "path": str(path),
        "sha256": sha256_file(path) if path.is_file() else None,
        "size": path.stat().st_size if path.is_file() else 0,
        "self_contained": self_contained,
        "external_mode": external,
    }
    try:
        if not path.is_file() or path.stat().st_size <= 0:
            _fail(f"asset is missing or empty: {path}")
        gltf, bin_chunk, chunks = parse_glb(path)
        stats = validate_structure(gltf, bin_chunk, self_contained=self_contained)
        external_result = run_external_validator(path, external)
        if external_result["state"] == "failed":
            _fail(f"external glTF validation failed: {external_result.get('reason') or external_result.get('stderr_tail') or external_result.get('stdout_tail')}")
        return {
            **base,
            "state": "passed",
            "chunks": chunks,
            "stats": stats,
            "external_validator": external_result,
        }
    except (OSError, GLBValidationError, ValueError, json.JSONDecodeError) as exc:
        return {
            **base,
            "state": "failed",
            "reason": str(exc),
            "external_validator": external_validator_fingerprint(external),
        }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", type=Path, required=True)
    ap.add_argument("--receipt", type=Path)
    ap.add_argument("--external", choices=["off", "auto", "require"], default="auto")
    ap.add_argument("--allow-external-resources", action="store_true")
    args = ap.parse_args(argv)
    report = validate_glb(
        args.input,
        self_contained=not args.allow_external_resources,
        external=args.external,
    )
    if args.receipt:
        atomic_json(args.receipt.resolve(), report)
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    return 0 if report["state"] == "passed" else 2


if __name__ == "__main__":
    raise SystemExit(main())
