#!/usr/bin/env python3
"""Exact-output adapter from Variant Foundry provider jobs to OpenX Clay.

Requires Clay to be installed in the Python environment. Uses Clay's Python API
rather than scraping CLI output so the Variant Foundry seed reaches
GenerationRequest and the requested output path is authoritative.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any


def load_params(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("params JSON must contain an object")
    return value


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--seed", type=int, required=True)
    ap.add_argument("--params", type=Path, required=True)
    ap.add_argument("--config")
    args = ap.parse_args(argv)
    try:
        if not args.input.is_file():
            raise ValueError(f"input is missing: {args.input}")
        params = load_params(args.params)
        try:
            from clay.config import load_config
            from clay.pipeline import Pipeline
            from clay.schemas import GenerationRequest, GenMode
        except ImportError as exc:
            raise ValueError("OpenX Clay is not installed in this Python environment") from exc

        config_path = args.config or params.get("config_path") or os.environ.get("VARIANT_FOUNDRY_CLAY_CONFIG") or "config/config.toml"
        cfg = load_config(config_path)
        mode_name = str(params.get("mode", "image")).lower()
        if mode_name not in {"image", "text"}:
            raise ValueError("Clay adapter mode must be image or text")
        mode = GenMode.image if mode_name == "image" else GenMode.text
        prompt = str(params.get("prompt", "")).strip()
        image_path = None
        if mode_name == "image":
            image_path = str(args.input.resolve())
        elif not prompt:
            prompt = args.input.read_text(encoding="utf-8").strip()
        if mode_name == "text" and not prompt:
            raise ValueError("text mode requires params.prompt or a non-empty UTF-8 input file")

        request = GenerationRequest(
            mode=mode,
            image_path=image_path,
            prompt=prompt,
            format=str(params.get("format", "glb")),
            target_tris=int(params.get("target_tris", 60000)),
            unwrap_uvs=bool(params.get("unwrap_uvs", True)),
            pbr=bool(params.get("pbr", True)),
            seed=args.seed,
        )
        args.output.parent.mkdir(parents=True, exist_ok=True)
        asset = Pipeline(cfg).run(request, out_path=str(args.output))
        produced = Path(asset.path).resolve()
        requested = args.output.resolve()
        if not produced.is_file() or produced.stat().st_size <= 0:
            raise ValueError(f"Clay returned a missing/empty asset: {produced}")
        if produced != requested:
            shutil.copyfile(produced, requested)
        if not requested.is_file() or requested.stat().st_size <= 0:
            raise ValueError("Clay adapter failed to materialize the requested output path")

        print(json.dumps({
            "state": "succeeded",
            "adapter": "openx-clay",
            "output": str(requested),
            "provider": getattr(asset, "provider", ""),
            "format": getattr(asset, "format", request.format),
            "triangles": int(getattr(asset, "triangles", 0) or 0),
            "seed": args.seed,
        }, sort_keys=True))
        return 0
    except (OSError, ValueError, json.JSONDecodeError, RuntimeError) as exc:
        print(json.dumps({"state": "error", "adapter": "openx-clay", "reason": str(exc)}, sort_keys=True), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
