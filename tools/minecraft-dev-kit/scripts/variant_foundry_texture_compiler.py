#!/usr/bin/env python3
"""Compile working PNG textures into deterministic Minecraft-oriented pixel textures.

The compiler intentionally avoids heavyweight imaging dependencies. It supports the
common 8-bit non-interlaced PNG color modes, nearest-neighbor resampling, explicit
palette quantization, optional ordered dithering, alpha thresholding and transparent
edge color dilation for safer texture filtering/mip behavior.
"""
from __future__ import annotations

import argparse
import binascii
import hashlib
import json
import struct
import sys
import zlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any

PNG_SIG = b"\x89PNG\r\n\x1a\n"
BAYER4 = (
    (0, 8, 2, 10),
    (12, 4, 14, 6),
    (3, 11, 1, 9),
    (15, 7, 13, 5),
)


@dataclass
class Image:
    width: int
    height: int
    pixels: bytearray

    def index(self, x: int, y: int) -> int:
        return (y * self.width + x) * 4

    def rgba(self, x: int, y: int) -> tuple[int, int, int, int]:
        i = self.index(x, y)
        return tuple(self.pixels[i:i + 4])  # type: ignore[return-value]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def chunks(data: bytes):
    if not data.startswith(PNG_SIG):
        raise ValueError("not a PNG file")
    pos = len(PNG_SIG)
    while pos + 12 <= len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        kind = data[pos + 4:pos + 8]
        start = pos + 8
        end = start + length
        if end + 4 > len(data):
            raise ValueError("truncated PNG chunk")
        payload = data[start:end]
        expected = struct.unpack(">I", data[end:end + 4])[0]
        actual = binascii.crc32(kind + payload) & 0xFFFFFFFF
        if actual != expected:
            raise ValueError(f"PNG CRC mismatch in {kind.decode('ascii', 'replace')}")
        yield kind, payload
        pos = end + 4
        if kind == b"IEND":
            return
    raise ValueError("PNG missing IEND")


def decode_png(data: bytes) -> Image:
    ihdr = None
    palette = None
    transparency = None
    idat = bytearray()
    for kind, payload in chunks(data):
        if kind == b"IHDR":
            ihdr = struct.unpack(">IIBBBBB", payload)
        elif kind == b"PLTE":
            if len(payload) % 3:
                raise ValueError("invalid PNG palette")
            palette = [tuple(payload[i:i + 3]) for i in range(0, len(payload), 3)]
        elif kind == b"tRNS":
            transparency = bytes(payload)
        elif kind == b"IDAT":
            idat.extend(payload)
    if ihdr is None:
        raise ValueError("PNG missing IHDR")
    width, height, bit_depth, color_type, compression, filter_method, interlace = ihdr
    if width <= 0 or height <= 0:
        raise ValueError("invalid PNG dimensions")
    if bit_depth != 8 or compression != 0 or filter_method != 0 or interlace != 0:
        raise ValueError("only 8-bit non-interlaced standard PNGs are supported")
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(color_type)
    if channels is None:
        raise ValueError(f"unsupported PNG color type: {color_type}")
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    expected = height * (stride + 1)
    if len(raw) != expected:
        raise ValueError(f"unexpected PNG scanline size: got {len(raw)}, expected {expected}")

    rows: list[bytearray] = []
    offset = 0
    bpp = channels
    prev = bytearray(stride)
    for _ in range(height):
        f = raw[offset]
        offset += 1
        scan = raw[offset:offset + stride]
        offset += stride
        recon = bytearray(stride)
        for x, val in enumerate(scan):
            left = recon[x - bpp] if x >= bpp else 0
            up = prev[x]
            upper_left = prev[x - bpp] if x >= bpp else 0
            if f == 0:
                pred = 0
            elif f == 1:
                pred = left
            elif f == 2:
                pred = up
            elif f == 3:
                pred = (left + up) // 2
            elif f == 4:
                pred = paeth(left, up, upper_left)
            else:
                raise ValueError(f"unsupported PNG filter: {f}")
            recon[x] = (val + pred) & 0xFF
        rows.append(recon)
        prev = recon

    out = bytearray(width * height * 4)
    o = 0
    for row in rows:
        for x in range(width):
            i = x * channels
            if color_type == 6:
                r, g, b, a = row[i:i + 4]
            elif color_type == 2:
                r, g, b = row[i:i + 3]
                a = 255
            elif color_type == 0:
                r = g = b = row[i]
                a = 255
            elif color_type == 4:
                r = g = b = row[i]
                a = row[i + 1]
            else:
                idx = row[i]
                if palette is None or idx >= len(palette):
                    raise ValueError("indexed PNG references missing palette entry")
                r, g, b = palette[idx]
                a = transparency[idx] if transparency is not None and idx < len(transparency) else 255
            out[o:o + 4] = bytes((r, g, b, a))
            o += 4
    return Image(width, height, out)


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    crc = binascii.crc32(kind + payload) & 0xFFFFFFFF
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", crc)


def encode_png(image: Image, compression: int = 9) -> bytes:
    raw = bytearray()
    stride = image.width * 4
    for y in range(image.height):
        raw.append(0)
        start = y * stride
        raw.extend(image.pixels[start:start + stride])
    ihdr = struct.pack(">IIBBBBB", image.width, image.height, 8, 6, 0, 0, 0)
    return PNG_SIG + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", zlib.compress(bytes(raw), compression)) + png_chunk(b"IEND", b"")


def parse_hex(value: str) -> tuple[int, int, int]:
    text = value.strip().lstrip("#")
    if len(text) != 6 or any(ch not in "0123456789abcdefABCDEF" for ch in text):
        raise ValueError(f"invalid palette color: {value}")
    return tuple(int(text[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def validate_profile(data: Any) -> dict[str, Any]:
    if not isinstance(data, dict):
        raise ValueError("TextureStyleProfile must be a JSON object")
    size = data.get("target_size")
    if not isinstance(size, list) or len(size) != 2 or not all(isinstance(v, int) and v > 0 for v in size):
        raise ValueError("target_size must be [width,height] positive integers")
    alpha = data.get("alpha_threshold", 1)
    if not isinstance(alpha, int) or alpha < 0 or alpha > 255:
        raise ValueError("alpha_threshold must be 0..255")
    radius = data.get("transparent_edge_dilation", 1)
    if not isinstance(radius, int) or radius < 0 or radius > 16:
        raise ValueError("transparent_edge_dilation must be 0..16")
    dither = data.get("dither", "none")
    if dither not in {"none", "ordered4"}:
        raise ValueError("dither must be none or ordered4")
    palette_raw = data.get("palette", [])
    if not isinstance(palette_raw, list) or not all(isinstance(x, str) for x in palette_raw):
        raise ValueError("palette must be a list of #RRGGBB strings")
    out = dict(data)
    out["target_size"] = size
    out["alpha_threshold"] = alpha
    out["transparent_edge_dilation"] = radius
    out["dither"] = dither
    out["palette_rgb"] = [parse_hex(x) for x in palette_raw]
    return out


def resize_nearest(image: Image, width: int, height: int) -> Image:
    if image.width == width and image.height == height:
        return Image(width, height, bytearray(image.pixels))
    out = bytearray(width * height * 4)
    for y in range(height):
        sy = min(image.height - 1, (y * image.height) // height)
        for x in range(width):
            sx = min(image.width - 1, (x * image.width) // width)
            si = image.index(sx, sy)
            di = (y * width + x) * 4
            out[di:di + 4] = image.pixels[si:si + 4]
    return Image(width, height, out)


def nearest_palette(rgb: tuple[int, int, int], palette: list[tuple[int, int, int]]) -> tuple[int, int, int]:
    r, g, b = rgb
    return min(palette, key=lambda p: (r - p[0]) ** 2 + (g - p[1]) ** 2 + (b - p[2]) ** 2)


def quantize(image: Image, palette: list[tuple[int, int, int]], dither: str) -> None:
    if not palette:
        return
    for y in range(image.height):
        for x in range(image.width):
            i = image.index(x, y)
            if image.pixels[i + 3] == 0:
                continue
            r, g, b = image.pixels[i:i + 3]
            if dither == "ordered4":
                delta = (BAYER4[y % 4][x % 4] - 7.5) * 2.0
                r = max(0, min(255, round(r + delta)))
                g = max(0, min(255, round(g + delta)))
                b = max(0, min(255, round(b + delta)))
            pr, pg, pb = nearest_palette((r, g, b), palette)
            image.pixels[i:i + 3] = bytes((pr, pg, pb))


def threshold_alpha(image: Image, threshold: int) -> None:
    if threshold <= 0:
        return
    for i in range(3, len(image.pixels), 4):
        if image.pixels[i] < threshold:
            image.pixels[i] = 0


def dilate_transparent_rgb(image: Image, radius: int) -> None:
    if radius <= 0:
        return
    known = [image.pixels[i + 3] > 0 for i in range(0, len(image.pixels), 4)]
    for _ in range(radius):
        updates: list[tuple[int, int, int, int]] = []
        for y in range(image.height):
            for x in range(image.width):
                idx_px = y * image.width + x
                if known[idx_px]:
                    continue
                samples = []
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < image.width and 0 <= ny < image.height:
                        npx = ny * image.width + nx
                        if known[npx]:
                            ni = npx * 4
                            samples.append(tuple(image.pixels[ni:ni + 3]))
                if samples:
                    r = round(sum(v[0] for v in samples) / len(samples))
                    g = round(sum(v[1] for v in samples) / len(samples))
                    b = round(sum(v[2] for v in samples) / len(samples))
                    updates.append((idx_px, r, g, b))
        if not updates:
            break
        for idx_px, r, g, b in updates:
            i = idx_px * 4
            image.pixels[i:i + 3] = bytes((r, g, b))
            known[idx_px] = True


def color_count(image: Image) -> int:
    return len({tuple(image.pixels[i:i + 4]) for i in range(0, len(image.pixels), 4)})


def alpha_stats(image: Image) -> dict[str, int]:
    values = [image.pixels[i] for i in range(3, len(image.pixels), 4)]
    return {
        "opaque": sum(v == 255 for v in values),
        "transparent": sum(v == 0 for v in values),
        "partial": sum(0 < v < 255 for v in values),
    }


def compile_texture(input_bytes: bytes, profile_data: dict[str, Any]) -> tuple[bytes, dict[str, Any]]:
    profile = validate_profile(profile_data)
    source = decode_png(input_bytes)
    before_colors = color_count(source)
    width, height = profile["target_size"]
    result = resize_nearest(source, width, height)
    threshold_alpha(result, profile["alpha_threshold"])
    quantize(result, profile["palette_rgb"], profile["dither"])
    dilate_transparent_rgb(result, profile["transparent_edge_dilation"])
    output = encode_png(result)
    receipt = {
        "schema_version": 1,
        "input_sha256": sha256_bytes(input_bytes),
        "output_sha256": sha256_bytes(output),
        "profile_sha256": sha256_bytes(json.dumps(profile_data, sort_keys=True, separators=(",", ":")).encode("utf-8")),
        "source_size": [source.width, source.height],
        "target_size": [result.width, result.height],
        "colors_before": before_colors,
        "colors_after": color_count(result),
        "alpha": alpha_stats(result),
        "operations": {
            "resample": "nearest-neighbor",
            "palette_colors": len(profile["palette_rgb"]),
            "dither": profile["dither"],
            "alpha_threshold": profile["alpha_threshold"],
            "transparent_edge_dilation": profile["transparent_edge_dilation"],
        },
    }
    return output, receipt


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", type=Path, required=True)
    ap.add_argument("--profile", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--receipt", type=Path)
    args = ap.parse_args(argv)
    try:
        input_bytes = args.input.read_bytes()
        profile = json.loads(args.profile.read_text(encoding="utf-8"))
        output, receipt = compile_texture(input_bytes, profile)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(output)
        receipt_path = args.receipt or args.output.with_suffix(args.output.suffix + ".receipt.json")
        receipt_path.parent.mkdir(parents=True, exist_ok=True)
        receipt_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps({"state": "compiled", "output": str(args.output.resolve()), "receipt": str(receipt_path.resolve()), **receipt}, indent=2, sort_keys=True))
        return 0
    except (OSError, ValueError, json.JSONDecodeError, zlib.error) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
