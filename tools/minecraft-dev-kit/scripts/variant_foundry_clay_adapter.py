#!/usr/bin/env python3
"""Exact-output Variant Foundry adapter to OpenX Clay.

Requires Clay in the Python environment. Runtime jobs use Clay's Python API so
Variant Foundry's seed reaches GenerationRequest and the requested output path is
authoritative. --probe performs a cheap import/config/provider/backend health check
without loading a generation model.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


def load_params(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("params JSON must contain an object")
    return value


def import_clay():
    try:
        from clay.config import load_config
        from clay.pipeline import Pipeline
        from clay.providers import get_provider
        from clay.schemas import GenerationRequest, GenMode
    except ImportError as exc:
        raise ValueError("OpenX Clay is not installed in this Python environment") from exc
    return load_config, Pipeline, get_provider, GenerationRequest, GenMode


def config_path(explicit: str | None, params: dict[str, Any] | None = None) -> str:
    params = params or {}
    return str(
        explicit
        or params.get("config_path")
        or os.environ.get("VARIANT_FOUNDRY_CLAY_CONFIG")
        or "config/config.toml"
    )


def backend_health(url: str, api_key: str, timeout: float = 15) -> dict[str, Any]:
    endpoint = url.rstrip("/") + "/health"
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    req = urllib.request.Request(endpoint, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            payload = response.read()
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        raise ValueError(f"Clay backend HTTP {exc.code}: {body[:1000]}") from exc
    except urllib.error.URLError as exc:
        raise ValueError(f"cannot reach Clay GPU backend {endpoint}: {exc}") from exc
    try:
        value = json.loads(payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("Clay /health returned non-JSON") from exc
    if not isinstance(value, dict) or value.get("status") != "ok":
        raise ValueError(f"Clay /health is not ready: {value!r}")
    return value


def probe(explicit_config: str | None = None) -> dict[str, Any]:
    load_config, _Pipeline, get_provider, _GenerationRequest, _GenMode = import_clay()
    cfg_path = config_path(explicit_config)
    cfg = load_config(cfg_path)
    provider = get_provider(cfg.providers.model)
    if not (provider.supports("image") or provider.supports("text")):
        raise ValueError(f"configured Clay shape provider has no image/text mode: {provider.name}")
    backend_url = str(cfg.gpu_backend.url or "").rstrip("/")
    if not backend_url:
        raise ValueError("Clay has no GPU backend URL configured")
    health = backend_health(backend_url, str(cfg.gpu_backend.api_key or ""))
    endpoints = set(map(str, health.get("endpoints") or []))
    if not ({"image-to-3d", "text-to-3d"} & endpoints):
        raise ValueError(f"Clay backend health lacks generation endpoints: {sorted(endpoints)}")
    return {
        "state": "ready",
        "adapter": "openx-clay",
        "config_path": cfg_path,
        "provider": {
            "name": provider.name,
            "category": provider.category,
            "modes": list(provider.modes),
            "license": provider.license,
        },
        "backend": {
            "url": backend_url,
            "health": health,
        },
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--probe", action="store_true")
    ap.add_argument("--input", type=Path)
    ap.add_argument("--output", type=Path)
    ap.add_argument("--seed", type=int)
    ap.add_argument("--params", type=Path)
    ap.add_argument("--config")
    args = ap.parse_args(argv)
    try:
        if args.probe:
            result = probe(args.config)
            print(json.dumps(result, sort_keys=True))
            return 0
        if args.input is None or args.output is None or args.seed is None or args.params is None:
            raise ValueError("runtime mode requires --input --output --seed --params")
        if not args.input.is_file():
            raise ValueError(f"input is missing: {args.input}")
        params = load_params(args.params)
        load_config, Pipeline, _get_provider, GenerationRequest, GenMode = import_clay()
        cfg_path = config_path(args.config, params)
        cfg = load_config(cfg_path)
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
