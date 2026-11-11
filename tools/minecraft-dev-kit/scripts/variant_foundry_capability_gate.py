#!/usr/bin/env python3
"""Validate Variant Foundry capability-contract completeness without claiming implementation proof."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MATRIX = ROOT / "docs" / "variant-foundry-capability-matrix.json"
CLOSURE = ROOT / "docs" / "ENDERLOOM_VARIANT_FOUNDRY_CAPABILITY_CLOSURE.md"
WIKI = ROOT / "docs" / "wiki" / "Variant-Foundry-Capability-Closure.md"
RUNTIME = ROOT / "docs" / "ENDERLOOM_HIGH_FIDELITY_JAVA_MODEL_RUNTIME_SPEC.md"
VARIANT = ROOT / "docs" / "ENDERLOOM_UNIVERSAL_BIOME_MODEL_VARIATOR_SPEC.md"

MANDATORY = {
    "VF-INTAKE-01", "VF-DNA-01", "VF-SHAPE-01", "VF-PARTS-01",
    "VF-RETOPO-01", "VF-GLTF-01", "VF-MCIZE-01", "VF-UV-01",
    "VF-TEX-01", "VF-MAT-01", "VF-PIXEL-01", "VF-RIG-01",
    "VF-IK-01", "VF-ANIM-01", "VF-EVENT-01", "VF-MOTION-01",
    "VF-PHYSICS-01", "VF-BIOME-01", "VF-WORLDGEN-01", "VF-BIOMEDNA-01",
    "VF-CATALOG-01", "VF-VARIANT-01", "VF-ATMOS-01", "VF-BUNDLE-01",
    "VF-HOT-01", "VF-RENDER-01", "VF-SERVER-01", "VF-NET-01",
    "VF-BLOCKBENCH-01", "VF-GPU-01", "VF-QA-EDITOR-01", "VF-QA-NATIVE-01",
    "VF-VISREG-01", "VF-PERF-01", "VF-RENDERCOMPAT-01", "VF-PROV-01",
    "VF-WIKI-01", "VF-RECOVERY-01",
}

REQUIRED_AREAS = {
    "intake", "identity", "generation", "geometry", "interchange",
    "minecraftization", "texture", "material", "rig", "animation", "physics",
    "biome", "variant", "compile", "runtime", "authoring", "execution",
    "qa", "performance", "compatibility", "provenance", "documentation",
    "recovery",
}

def fail(message: str) -> None:
    raise SystemExit("Variant Foundry capability gate FAILED: " + message)

def main() -> int:
    for path in (MATRIX, CLOSURE, WIKI, RUNTIME, VARIANT):
        if not path.is_file():
            fail(f"missing canonical file: {path.relative_to(ROOT)}")

    data = json.loads(MATRIX.read_text(encoding="utf-8"))
    if data.get("schema_version") != 1:
        fail("unsupported matrix schema_version")

    caps = data.get("capabilities")
    if not isinstance(caps, list) or not caps:
        fail("capabilities must be a non-empty list")

    ids = [item.get("id") for item in caps]
    if any(not isinstance(cid, str) or not cid.startswith("VF-") for cid in ids):
        fail("every capability requires a VF-* id")
    if len(ids) != len(set(ids)):
        fail("duplicate capability ids")
    missing = sorted(MANDATORY - set(ids))
    if missing:
        fail("missing mandatory capabilities: " + ", ".join(missing))

    areas = {item.get("area") for item in caps}
    missing_areas = sorted(REQUIRED_AREAS - areas)
    if missing_areas:
        fail("missing required capability areas: " + ", ".join(missing_areas))

    required_fields = ("id", "area", "name", "required", "owner", "proof")
    for item in caps:
        missing_fields = [field for field in required_fields if field not in item]
        if missing_fields:
            fail(f"{item.get('id', '<unknown>')} missing fields: {', '.join(missing_fields)}")
        if item["required"] is not True:
            fail(f"{item['id']} must remain required in the closure matrix")
        if not str(item["owner"]).strip() or not str(item["proof"]).strip():
            fail(f"{item['id']} has empty owner/proof contract")

    closure = CLOSURE.read_text(encoding="utf-8")
    for cid in ids:
        if cid not in closure:
            fail(f"{cid} missing from human-readable closure contract")

    wiki = WIKI.read_text(encoding="utf-8")
    for phrase in ("Minecraft Texture Compiler", "Runtime ModelBundle compiler", "Worldgen adapters", "Golden proof"):
        if phrase not in wiki:
            fail(f"Wiki closure missing section: {phrase}")

    result = {
        "status": "passed",
        "evidence_boundary": "Capability-contract completeness only; this does not claim the feature is implemented or runtime-proven.",
        "capabilities": len(caps),
        "areas": len(areas),
        "mandatory_capabilities": len(MANDATORY),
        "matrix": str(MATRIX.relative_to(ROOT)),
        "closure": str(CLOSURE.relative_to(ROOT)),
        "wiki": str(WIKI.relative_to(ROOT)),
    }
    print(json.dumps(result, indent=2))
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, json.JSONDecodeError) as exc:
        print("Variant Foundry capability gate FAILED:", exc, file=sys.stderr)
        raise SystemExit(1)
