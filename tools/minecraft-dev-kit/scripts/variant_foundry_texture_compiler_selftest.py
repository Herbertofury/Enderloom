#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("tex", HERE / "variant_foundry_texture_compiler.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def main() -> int:
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

    print(json.dumps({"status": "passed", "output_sha256": receipt["output_sha256"], "colors_after": receipt["colors_after"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
