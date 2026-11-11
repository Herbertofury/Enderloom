#!/usr/bin/env python3
"""Compatibility entry point for source conversion using the maintained production engine.

Unlike the historical v6.3 copier, this requires a new/empty target, preserves source
identity and build support, and does not classify copied surfaces as verified ports.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from northpoint_target_26_3 import (ConversionBlock, detect_fabric_identity,
                                    detect_neoforge_identity, materialize_port)


def materialize(source: Path, target: Path, loader: str, mod_id: str,
                *, mod_name=None, group=None, mod_version=None) -> dict:
    source, target = source.resolve(), target.resolve()
    if source == target or source.is_relative_to(target) or target.is_relative_to(source):
        raise ConversionBlock("source and target must be disjoint")
    if target.exists() and (not target.is_dir() or any(target.iterdir())):
        raise ConversionBlock("target must be empty/new; existing work is never replaced")
    if loader not in {"fabric", "neoforge"}:
        raise ConversionBlock(f"unsupported target loader: {loader}")
    identity = (detect_fabric_identity if loader == "fabric" else detect_neoforge_identity)(source)
    for key, requested in (("mod_id", mod_id), ("name", mod_name),
                           ("group", group), ("version", mod_version)):
        if requested is not None and requested != identity[key]:
            raise ConversionBlock(f"materialization preserves source {key}={identity[key]!r}; requested {requested!r}")
    return materialize_port(source, target, loader)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--target", type=Path, required=True)
    parser.add_argument("--loader", choices=["fabric", "neoforge"], required=True)
    parser.add_argument("--mod-id", required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(materialize(args.source, args.target, args.loader, args.mod_id), indent=2))
    except ConversionBlock as exc:
        parser.exit(1, str(exc) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
