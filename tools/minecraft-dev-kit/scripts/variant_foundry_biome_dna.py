#!/usr/bin/env python3
"""Synthesize deterministic BiomeDNA art-direction profiles from discovery evidence.

This stage never fabricates missing registry facts. It converts evidence into explicit
art-direction hints with traceable reasons, and accepts user/curated overrides as the
highest-priority layer.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path
from typing import Any

TOKEN_RX = re.compile(r"[a-z0-9]+")

MOTIF_TOKENS = {
    "floral": {"flower", "flowers", "blossom", "petal", "rose", "tulip", "orchid", "daisy", "sunflower", "bloom", "cherry"},
    "vine": {"vine", "vines", "ivy", "liana", "tendril", "hanging"},
    "mossy": {"moss", "mossy", "lichen", "overgrown"},
    "forest": {"forest", "woods", "wooded", "tree", "trees", "grove", "canopy", "birch", "oak", "spruce", "taiga"},
    "jungle": {"jungle", "bamboo", "tropical", "rainforest"},
    "swamp": {"swamp", "mangrove", "marsh", "bog", "mud", "mire"},
    "aquatic": {"ocean", "sea", "river", "water", "aquatic", "kelp", "coral", "reef", "beach", "shore"},
    "frozen": {"snow", "snowy", "ice", "icy", "frozen", "frost", "glacier", "wintry"},
    "crystalline": {"crystal", "crystalline", "gem", "amethyst", "quartz", "shard"},
    "fungal": {"fungus", "fungal", "mushroom", "mushrooms", "mycelium", "spore", "warped", "crimson"},
    "volcanic": {"lava", "magma", "basalt", "volcanic", "volcano", "ash", "infernal"},
    "desert": {"desert", "sand", "sandy", "dune", "arid", "cactus"},
    "badlands": {"badlands", "mesa", "terracotta", "eroded"},
    "mountain": {"mountain", "peak", "peaks", "hills", "windswept", "cliff", "stony"},
    "cave": {"cave", "caves", "underground", "dripstone", "lush", "sulfur"},
    "sulfuric": {"sulfur", "sulphur", "sulfuric"},
    "soul": {"soul", "souls", "spectral", "ghost", "haunted"},
    "void": {"end", "void", "ender", "cosmic", "abyss", "space"},
    "aetheric": {"aether", "aetheric", "sky", "cloud", "heaven", "celestial"},
    "meadow": {"meadow", "prairie", "plains", "grassland"},
}

MATERIALS = {
    "floral": ["petal", "leaf"],
    "vine": ["vine", "leaf"],
    "mossy": ["moss", "lichen"],
    "forest": ["bark", "leaf"],
    "jungle": ["broadleaf", "vine"],
    "swamp": ["moss", "mud", "wet-bark"],
    "aquatic": ["kelp", "coral", "shell"],
    "frozen": ["snow", "ice"],
    "crystalline": ["crystal", "gemstone"],
    "fungal": ["fungus", "spore-cap"],
    "volcanic": ["basalt", "magma-crust"],
    "desert": ["sandstone", "dry-plant"],
    "badlands": ["terracotta", "dry-stone"],
    "mountain": ["stone", "lichen"],
    "cave": ["stone", "mineral"],
    "sulfuric": ["sulfur", "mineral"],
    "soul": ["bone", "spectral"],
    "void": ["end-stone", "void-crystal"],
    "aetheric": ["cloud", "feather", "light-crystal"],
    "meadow": ["grass", "wildflower"],
}

GEOMETRY = {
    "floral": ["petal clusters", "small flower crowns"],
    "vine": ["hanging tendrils", "wrapped vine growths"],
    "mossy": ["soft moss patches", "short lichen fringes"],
    "forest": ["leaf sprigs", "bark-like plates"],
    "jungle": ["broad leaves", "longer hanging growths"],
    "swamp": ["hanging moss", "root-like accents"],
    "aquatic": ["fin/frond planes", "kelp or coral accents"],
    "frozen": ["icicle tips", "snow caps"],
    "crystalline": ["faceted shards", "crystal clusters"],
    "fungal": ["mushroom caps", "elastic fungal tendrils"],
    "volcanic": ["cracked plates", "magma vents"],
    "desert": ["dry spikes", "wind-worn plates"],
    "badlands": ["layered terracotta ridges", "eroded horn accents"],
    "mountain": ["stone ridges", "wind-swept tufts"],
    "cave": ["mineral nodules", "hanging cave growths"],
    "sulfuric": ["sulfur crystal nodules", "vent-like accents"],
    "soul": ["spectral strips", "bone-like accents"],
    "void": ["floating shard accents", "star/void specks"],
    "aetheric": ["feather-like fronds", "light floating petals"],
    "meadow": ["grass tufts", "wildflower sprigs"],
}

MOTION_PRESETS = (
    ({"aquatic"}, "water-frond", {"stiffness": 0.28, "damping": 0.50, "gravity": 0.08, "drag": 0.85, "wind": 0.10}),
    ({"frozen", "crystalline"}, "heavy-crystal", {"stiffness": 0.86, "damping": 0.72, "gravity": 0.60, "drag": 0.12, "wind": 0.08}),
    ({"fungal"}, "elastic-tendril", {"stiffness": 0.38, "damping": 0.42, "gravity": 0.26, "drag": 0.30, "wind": 0.28}),
    ({"vine", "swamp", "jungle"}, "vine-leaf", {"stiffness": 0.34, "damping": 0.48, "gravity": 0.38, "drag": 0.36, "wind": 0.55}),
    ({"aetheric"}, "buoyant-frond", {"stiffness": 0.30, "damping": 0.36, "gravity": 0.08, "drag": 0.22, "wind": 0.70}),
    ({"desert", "badlands"}, "dry-stiff", {"stiffness": 0.76, "damping": 0.62, "gravity": 0.38, "drag": 0.16, "wind": 0.35}),
)


def rgb_hex(value: Any) -> str | None:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0 or value > 0xFFFFFF:
        return None
    return f"#{value:06X}"


def climate(profile: dict[str, Any]) -> dict[str, Any]:
    temp = profile.get("temperature")
    downfall = profile.get("downfall")
    out: dict[str, Any] = {}
    if isinstance(temp, (int, float)) and not isinstance(temp, bool):
        if temp <= 0.15:
            band = "frozen"
        elif temp <= 0.45:
            band = "cool"
        elif temp <= 0.95:
            band = "temperate"
        elif temp <= 1.35:
            band = "warm"
        else:
            band = "hot"
        out.update(temperature=float(temp), temperature_band=band)
    if isinstance(downfall, (int, float)) and not isinstance(downfall, bool):
        if downfall <= 0.15:
            moisture = "arid"
        elif downfall <= 0.45:
            moisture = "dry"
        elif downfall <= 0.75:
            moisture = "moist"
        else:
            moisture = "wet"
        out.update(downfall=float(downfall), moisture_band=moisture)
    if "has_precipitation" in profile:
        out["has_precipitation"] = bool(profile["has_precipitation"])
    elif "precipitation" in profile:
        out["precipitation"] = profile["precipitation"]
    return out


def palette(profile: dict[str, Any]) -> dict[str, str]:
    effects = profile.get("effects") if isinstance(profile.get("effects"), dict) else {}
    out = {}
    for key in ("fog_color", "water_color", "water_fog_color", "sky_color", "foliage_color", "grass_color"):
        value = rgb_hex(effects.get(key))
        if value:
            out[key.removesuffix("_color")] = value
    return out


def evidence_tokens(row: dict[str, Any]) -> tuple[set[str], list[dict[str, Any]]]:
    tokens: set[str] = set()
    evidence: list[dict[str, Any]] = []

    def add_text(text: str, source: str) -> None:
        found = TOKEN_RX.findall(text.lower())
        if not found:
            return
        tokens.update(found)
        evidence.append({"source": source, "value": text})

    add_text(str(row.get("id", "")), "biome-id")
    for tag in row.get("tags", []) if isinstance(row.get("tags"), list) else []:
        if isinstance(tag, str):
            add_text(tag, "biome-tag")
    for ref in row.get("environment_cues", []) if isinstance(row.get("environment_cues"), list) else []:
        if isinstance(ref, dict) and isinstance(ref.get("id"), str):
            add_text(ref["id"], "environment-cue")
            if isinstance(ref.get("context"), str):
                add_text(ref["context"], "cue-context")
    return tokens, evidence


def motif_scores(tokens: set[str]) -> dict[str, int]:
    scores = {}
    for motif, words in MOTIF_TOKENS.items():
        score = len(tokens & words)
        if score:
            scores[motif] = score
    return scores


def infer_climate_motifs(profile: dict[str, Any], scores: dict[str, int]) -> None:
    temp = profile.get("temperature")
    downfall = profile.get("downfall")
    if isinstance(temp, (int, float)) and not isinstance(temp, bool):
        if temp <= 0.15:
            scores["frozen"] = scores.get("frozen", 0) + 1
        elif temp >= 1.5 and isinstance(downfall, (int, float)) and downfall <= 0.2:
            scores["desert"] = scores.get("desert", 0) + 1


def motion_profile(motifs: set[str]) -> dict[str, Any]:
    for required, preset, params in MOTION_PRESETS:
        if required & motifs:
            return {"preset": preset, "parameters": dict(params), "source": "derived-motif-baseline"}
    return {
        "preset": "balanced-organic",
        "parameters": {"stiffness": 0.52, "damping": 0.52, "gravity": 0.32, "drag": 0.24, "wind": 0.25},
        "source": "derived-default-baseline",
    }


def deep_merge(base: dict[str, Any], overlay: dict[str, Any]) -> dict[str, Any]:
    out = copy.deepcopy(base)
    for key, value in overlay.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = copy.deepcopy(value)
    return out


def normalize_overrides(data: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(data, dict):
        raise ValueError("override file must contain a JSON object")
    raw = data.get("profiles", data)
    if not isinstance(raw, dict):
        raise ValueError("override profiles must be an object keyed by biome id")
    out = {}
    for rid, value in raw.items():
        if not isinstance(rid, str) or not isinstance(value, dict):
            raise ValueError("every override must map a biome id to an object")
        out[rid] = value
    return out


def build_profile(row: dict[str, Any], override: dict[str, Any] | None = None) -> dict[str, Any]:
    rid = str(row.get("id", ""))
    static = row.get("profile") if isinstance(row.get("profile"), dict) else {}
    tokens, token_evidence = evidence_tokens(row)
    scores = motif_scores(tokens)
    infer_climate_motifs(static, scores)
    ordered = sorted(scores, key=lambda name: (-scores[name], name))
    motifs = set(ordered)

    materials: list[str] = []
    geometry: list[str] = []
    for motif in ordered:
        materials.extend(MATERIALS.get(motif, []))
        geometry.extend(GEOMETRY.get(motif, []))

    evidence_strength = 0
    if row.get("confidence") == "high":
        evidence_strength += 2
    if static:
        evidence_strength += 2
    if row.get("environment_cues"):
        evidence_strength += 2
    if row.get("tags"):
        evidence_strength += 1
    if ordered:
        evidence_strength += 1
    confidence = "high" if evidence_strength >= 6 else "medium" if evidence_strength >= 3 else "low"

    result = {
        "schema_version": 1,
        "id": rid,
        "existence": row.get("existence", "unresolved-active"),
        "characterization_confidence": confidence,
        "source_confidence": row.get("confidence"),
        "climate": climate(static),
        "palette": palette(static),
        "motifs": [{"id": name, "score": scores[name]} for name in ordered],
        "material_language": list(dict.fromkeys(materials)),
        "geometry_language": list(dict.fromkeys(geometry)),
        "motion_phenotype": motion_profile(motifs),
        "source_tags": sorted(set(row.get("tags", []))) if isinstance(row.get("tags"), list) else [],
        "derived_from": token_evidence,
        "evidence": copy.deepcopy(row.get("evidence", [])),
        "unresolved_references": copy.deepcopy(row.get("unresolved_references", [])),
        "needs_characterization": row.get("confidence") in {"registry-only", "registration-only"} or not static,
    }
    if override:
        result = deep_merge(result, override)
        result["override_applied"] = True
    else:
        result["override_applied"] = False
    return result


def build(discovery: dict[str, Any], overrides: dict[str, dict[str, Any]] | None = None) -> dict[str, Any]:
    if discovery.get("schema_version") != 1 or not isinstance(discovery.get("biomes"), list):
        raise ValueError("unsupported or invalid Variant Foundry discovery JSON")
    overrides = overrides or {}
    profiles = []
    seen = set()
    for row in discovery["biomes"]:
        if not isinstance(row, dict) or not isinstance(row.get("id"), str):
            continue
        rid = row["id"]
        profiles.append(build_profile(row, overrides.get(rid)))
        seen.add(rid)
    unknown_overrides = sorted(set(overrides) - seen)
    return {
        "schema_version": 1,
        "discovery_input_sha256": discovery.get("input_resource_sha256"),
        "profile_count": len(profiles),
        "profiles": sorted(profiles, key=lambda x: x["id"]),
        "unresolved": [
            {"kind": "override-target-not-discovered", "id": rid}
            for rid in unknown_overrides
        ],
        "rule": "BiomeDNA art direction is derived from explicit evidence and optional overrides. Missing registry facts are never invented.",
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--discovery", type=Path, required=True)
    ap.add_argument("--biome", help="Return only one namespaced biome profile")
    ap.add_argument("--overrides", type=Path)
    ap.add_argument("--json-out", type=Path)
    args = ap.parse_args(argv)
    try:
        discovery = json.loads(args.discovery.read_text(encoding="utf-8"))
        overrides = normalize_overrides(json.loads(args.overrides.read_text(encoding="utf-8"))) if args.overrides else {}
        result = build(discovery, overrides)
        if args.biome:
            profile = next((row for row in result["profiles"] if row["id"] == args.biome), None)
            if profile is None:
                raise ValueError(f"biome not found in discovery: {args.biome}")
            result = profile
        rendered = json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
        if args.json_out:
            args.json_out.parent.mkdir(parents=True, exist_ok=True)
            args.json_out.write_text(rendered, encoding="utf-8")
        else:
            sys.stdout.write(rendered)
        return 0
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
