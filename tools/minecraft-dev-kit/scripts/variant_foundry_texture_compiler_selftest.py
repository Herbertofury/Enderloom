#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import contextlib
import io
import json
import struct
import sys
import tempfile
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("tex", HERE / "variant_foundry_texture_compiler.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def sample_png(color_type: int, rows: list[bytes], transparency: bytes | None = None,
               palette: bytes | None = None) -> bytes:
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
    width = len(rows[0]) // channels
    ihdr = struct.pack(">IIBBBBB", width, len(rows), 8, color_type, 0, 0, 0)
    data = mod.PNG_SIG + mod.png_chunk(b"IHDR", ihdr)
    if palette is not None:
        data += mod.png_chunk(b"PLTE", palette)
    if transparency is not None:
        data += mod.png_chunk(b"tRNS", transparency)
    data += mod.png_chunk(b"IDAT", zlib.compress(b"".join(b"\x00" + row for row in rows)))
    return data + mod.png_chunk(b"IEND", b"")


def test_transparent_color_keys() -> int:
    cases = []
    for key in (0, 42, 255):
        values = [key, (key + 1) % 256, (key - 1) % 256]
        rows = [bytes(values), bytes(reversed(values))]
        expected = bytes(channel for row in rows for value in row
                         for channel in (value, value, value, 0 if value == key else 255))
        cases.append((f"gray-{key}", sample_png(0, rows, struct.pack(">H", key)), expected))
        cases.append((f"gray-high-bits-{key}", sample_png(0, rows, struct.pack(">H", 0xFF00 | key)), expected))
    for key in ((0, 0, 0), (20, 160, 40), (255, 255, 255)):
        # Neighbours match two channels, but only a full key match is transparent.
        values = [key] + [tuple((value + (index == changed)) % 256
                               for index, value in enumerate(key)) for changed in range(3)]
        row = bytes(channel for rgb in values for channel in rgb)
        expected = bytes(channel for rgb in values for channel in (*rgb, 0 if rgb == key else 255))
        cases.append((f"rgb-{key[0]}", sample_png(2, [row], struct.pack(">HHH", *key)), expected))
        high_bits = tuple(value | high for value, high in zip(key, (0x0100, 0x8000, 0xFF00)))
        cases.append((f"rgb-high-bits-{key[0]}", sample_png(2, [row], struct.pack(">HHH", *high_bits)), expected))

    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        for label, png, expected in cases:
            image = mod.decode_png(png)
            assert bytes(image.pixels) == expected, label
            profile = {"target_size": [image.width, image.height], "palette": [],
                       "alpha_threshold": 1, "transparent_edge_dilation": 0}
            output, receipt = mod.compile_texture(png, profile)
            assert bytes(mod.decode_png(output).pixels) == expected, label
            assert receipt["alpha"]["transparent"] == expected[3::4].count(0), label
            assert receipt["alpha"]["partial"] == 0, label
            assert mod.compile_texture(png, profile) == (output, receipt), label
            # Exercise the actual file-writing entrypoint and its recorded alpha evidence.
            inp, prof, out = (root / f"{label}{suffix}" for suffix in (".png", ".json", "-out.png"))
            inp.write_bytes(png)
            prof.write_text(json.dumps(profile), encoding="utf-8")
            with contextlib.redirect_stdout(io.StringIO()):
                code = mod.main(["--input", str(inp), "--profile", str(prof), "--output", str(out)])
            assert code == 0 and out.read_bytes() == output, label
            assert inp.read_bytes() == png, label
            assert json.loads(out.with_suffix(".png.receipt.json").read_text()) == receipt, label

    controls = [
        (sample_png(0, [bytes([42])]), bytes((42, 42, 42, 255))),
        (sample_png(2, [bytes([20, 160, 40])]), bytes((20, 160, 40, 255))),
        (sample_png(4, [bytes([42, 128])]), bytes((42, 42, 42, 128))),
        (sample_png(6, [bytes([20, 160, 40, 128])]), bytes((20, 160, 40, 128))),
        (sample_png(3, [bytes([0, 1, 2])], bytes([0, 128]),
                    bytes([20, 160, 40, 30, 180, 50, 220, 40, 40])),
         bytes((20, 160, 40, 0, 30, 180, 50, 128, 220, 40, 40, 255))),
    ]
    for png, expected in controls:
        assert bytes(mod.decode_png(png).pixels) == expected

    malformed = [(0, bytes([42]), b"\x00" * length) for length in (0, 1, 3, 4)]
    malformed += [(2, bytes([20, 160, 40]), b"\x00" * length) for length in (0, 2, 5, 7)]
    for color_type, row, transparency in malformed:
        try:
            mod.decode_png(sample_png(color_type, [row], transparency))
        except ValueError as exc:
            assert "tRNS" in str(exc)
        else:
            raise AssertionError("malformed PNG tRNS key must not silently become opaque")
    return len(cases) + len(controls) + len(malformed)


def main() -> int:
    transparency_cases = test_transparent_color_keys()
    pixels = bytearray()
    source_rows = [
        [(20, 160, 40, 255), (30, 180, 50, 255), (220, 40, 40, 255), (0, 0, 0, 0)],
        [(20, 160, 40, 255), (30, 180, 50, 255), (220, 40, 40, 255), (0, 0, 0, 0)],
        [(60, 120, 70, 255), (70, 130, 80, 255), (100, 100, 100, 100), (0, 0, 0, 0)],
        [(60, 120, 70, 255), (70, 130, 80, 255), (100, 100, 100, 100), (0, 0, 0, 0)],
    ]
    for row in source_rows:
        for rgba in row:
            pixels.extend(rgba)
    source = mod.Image(4, 4, pixels)
    png = mod.encode_png(source)
    profile = {
        "schema_version": 1,
        "name": "test-faithful",
        "target_size": [2, 2],
        "palette": ["#149A32", "#DC2828", "#647064"],
        "dither": "none",
        "alpha_threshold": 128,
        "transparent_edge_dilation": 2,
    }
    output, receipt = mod.compile_texture(png, profile)
    output2, receipt2 = mod.compile_texture(png, profile)
    assert output == output2
    assert receipt == receipt2
    decoded = mod.decode_png(output)
    assert (decoded.width, decoded.height) == (2, 2)
    assert receipt["target_size"] == [2, 2]
    assert receipt["operations"]["palette_colors"] == 3
    allowed = {(0x14, 0x9A, 0x32), (0xDC, 0x28, 0x28), (0x64, 0x70, 0x64)}
    for y in range(decoded.height):
        for x in range(decoded.width):
            r, g, b, a = decoded.rgba(x, y)
            if a:
                assert (r, g, b) in allowed

    profile2 = dict(profile, target_size=[4, 4], palette=[], transparent_edge_dilation=2)
    output3, receipt3 = mod.compile_texture(png, profile2)
    decoded3 = mod.decode_png(output3)
    assert receipt3["alpha"]["partial"] == 0
    r, g, b, a = decoded3.rgba(2, 2)
    assert a == 0
    assert (r, g, b) != (0, 0, 0)

    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        inp = root / "in.png"
        prof = root / "profile.json"
        out = root / "out.png"
        inp.write_bytes(png)
        prof.write_text(json.dumps(profile), encoding="utf-8")
        code = mod.main(["--input", str(inp), "--profile", str(prof), "--output", str(out)])
        assert code == 0
        assert out.is_file()
        assert out.with_suffix(".png.receipt.json").is_file()

    print(json.dumps({"status": "passed", "output_sha256": receipt["output_sha256"], "colors_after": receipt["colors_after"],
                      "transparency_cases": transparency_cases}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
