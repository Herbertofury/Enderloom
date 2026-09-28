#!/usr/bin/env python3
"""Discover Minecraft biomes/dimensions and synthesize evidence-bound profile seeds.

The scanner is intentionally data-first and never executes mod code. It accepts
resource directories, mod/datapack JARs/ZIPs, or whole instance directories.
Optional runtime registry dumps can close the gap for code-registered content.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import zipfile
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Iterator

try:
    from registration_identity_inventory import inventory as registration_identity_inventory
except ImportError:
    registration_identity_inventory = None

RESOURCE_ID = re.compile(r"^[a-z0-9_.-]+:[a-z0-9_./-]+$")
ARCHIVE_EXTS = {".jar", ".zip"}
JSON_EXTS = {".json", ".json5"}

REGISTRY_ROOTS = (
    "worldgen/biome",
    "worldgen/placed_feature",
    "worldgen/configured_feature",
    "worldgen/feature",
    "worldgen/structure",
    "worldgen/structure_set",
    "worldgen/template_pool",
    "worldgen/processor_list",
    "worldgen/noise_settings",
    "worldgen/density_function",
    "worldgen/noise",
    "dimension",
    "dimension_type",
)

FOLLOW_REGISTRY_HINTS = (
    "worldgen/placed_feature",
    "worldgen/configured_feature",
    "worldgen/feature",
    "worldgen/structure",
    "worldgen/structure_set",
    "worldgen/template_pool",
    "worldgen/processor_list",
)

EFFECT_KEYS = (
    "fog_color",
    "water_color",
    "water_fog_color",
    "sky_color",
    "foliage_color",
    "grass_color",
    "grass_color_modifier",
    "particle",
    "ambient_sound",
    "mood_sound",
    "additions_sound",
    "music",
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def json_dumps(obj: Any) -> str:
    return json.dumps(obj, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def logical_resource_name(name: str) -> str | None:
    clean = name.replace("\\", "/").lstrip("./")
    if clean.startswith(("data/", "assets/")):
        return clean
    marker = "/resources/"
    if marker in clean and clean.startswith("src/"):
        return clean.split(marker, 1)[1]
    return None


@dataclass(frozen=True)
class ResourceBlob:
    source: str
    logical_path: str
    data: bytes

    @property
    def digest(self) -> str:
        return sha256(self.data)


class ResourceSource:
    def __init__(self, path: Path, source_label: str | None = None):
        self.path = path
        self.source_label = source_label or str(path.resolve())

    def iter_blobs(self) -> Iterator[ResourceBlob]:
        if self.path.is_file() and self.path.suffix.lower() in ARCHIVE_EXTS:
            yield from self._iter_archive(self.path, self.source_label)
            return
        if self.path.is_file():
            logical = logical_resource_name(self.path.name)
            if logical:
                yield ResourceBlob(self.source_label, logical, self.path.read_bytes())
            return
        if not self.path.is_dir():
            return

        for file in sorted(p for p in self.path.rglob("*") if p.is_file()):
            try:
                rel = file.relative_to(self.path).as_posix()
            except ValueError:
                continue
            logical = logical_resource_name(rel)
            if logical:
                try:
                    yield ResourceBlob(f"{self.source_label}::{rel}", logical, file.read_bytes())
                except OSError:
                    continue

        candidates: list[Path] = []
        for root_name in ("mods", "datapacks"):
            root = self.path / root_name
            if root.is_dir():
                candidates.extend(sorted(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in ARCHIVE_EXTS))
        candidates.extend(sorted(p for p in self.path.iterdir() if p.is_file() and p.suffix.lower() in ARCHIVE_EXTS))
        seen: set[Path] = set()
        for archive in candidates:
            archive = archive.resolve()
            if archive in seen:
                continue
            seen.add(archive)
            yield from self._iter_archive(archive, str(archive))

    @staticmethod
    def _iter_archive(path: Path, source_label: str) -> Iterator[ResourceBlob]:
        try:
            with zipfile.ZipFile(path) as zf:
                for name in sorted(n for n in zf.namelist() if not n.endswith("/")):
                    logical = logical_resource_name(name)
                    if not logical:
                        continue
                    try:
                        yield ResourceBlob(f"{source_label}!/{name}", logical, zf.read(name))
                    except (KeyError, OSError, RuntimeError):
                        continue
        except (OSError, zipfile.BadZipFile):
            return


def id_from_registry_path(logical: str, root: str) -> str | None:
    parts = logical.split("/")
    if len(parts) < 4 or parts[0] != "data":
        return None
    namespace = parts[1]
    prefix = f"data/{namespace}/{root}/"
    if not logical.startswith(prefix) or not logical.endswith(".json"):
        return None
    ident = logical[len(prefix):-5]
    return f"{namespace}:{ident}" if ident else None


def tag_id_from_path(logical: str) -> tuple[str, str] | None:
    parts = logical.split("/")
    if len(parts) < 6 or parts[0] != "data" or parts[2] != "tags" or not logical.endswith(".json"):
        return None
    namespace = parts[1]
    rel = "/".join(parts[3:])[:-5]
    for registry in ("worldgen/biome", "biome"):
        prefix = registry + "/"
        if rel.startswith(prefix):
            return registry, f"{namespace}:{rel[len(prefix):]}"
    return None


def parse_json(blob: ResourceBlob, unresolved: list[dict[str, Any]]) -> Any | None:
    if Path(blob.logical_path).suffix.lower() not in JSON_EXTS:
        return None
    try:
        return json.loads(blob.data.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        unresolved.append({
            "kind": "parse-error",
            "source": blob.source,
            "path": blob.logical_path,
            "sha256": blob.digest,
            "message": str(exc),
        })
        return None


def walk_strings(obj: Any, path: tuple[str, ...] = ()) -> Iterator[tuple[tuple[str, ...], str]]:
    if isinstance(obj, dict):
        for key in sorted(obj):
            yield from walk_strings(obj[key], path + (str(key),))
    elif isinstance(obj, list):
        for idx, value in enumerate(obj):
            yield from walk_strings(value, path + (str(idx),))
    elif isinstance(obj, str):
        yield path, obj


def resource_references(obj: Any) -> list[dict[str, str]]:
    refs: dict[tuple[str, str], dict[str, str]] = {}
    for path, value in walk_strings(obj):
        if RESOURCE_ID.match(value):
            context = ".".join(path)
            refs[(value, context)] = {"id": value, "context": context}
    return [refs[k] for k in sorted(refs)]


def effect_profile(obj: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key in ("temperature", "downfall", "has_precipitation", "precipitation", "temperature_modifier"):
        if key in obj:
            result[key] = obj[key]
    effects = obj.get("effects")
    if isinstance(effects, dict):
        picked = {key: effects[key] for key in EFFECT_KEYS if key in effects}
        if picked:
            result["effects"] = picked
    return result


def cue_references(refs: list[dict[str, str]]) -> list[dict[str, str]]:
    cues = []
    tokens = ("block", "state", "feature", "veget", "tree", "flower", "mushroom", "ore", "crystal", "plant", "replace", "surface", "fluid")
    for ref in refs:
        context = ref.get("context", "").lower()
        rid_path = ref["id"].split(":", 1)[1].lower()
        if any(tok in context or tok in rid_path for tok in tokens):
            cues.append(ref)
    return cues


def registry_index(blobs: Iterable[ResourceBlob], unresolved: list[dict[str, Any]]) -> tuple[dict[str, dict[str, ResourceBlob]], dict[str, Any]]:
    index: dict[str, dict[str, ResourceBlob]] = {root: {} for root in REGISTRY_ROOTS}
    parsed: dict[str, Any] = {}
    for blob in blobs:
        if blob.logical_path.endswith(".json"):
            obj = parse_json(blob, unresolved)
            if obj is not None:
                parsed[blob.source] = obj
        for root in REGISTRY_ROOTS:
            rid = id_from_registry_path(blob.logical_path, root)
            if rid:
                index[root].setdefault(rid, blob)
                break
    return index, parsed


def resolve_reference(index: dict[str, dict[str, ResourceBlob]], rid: str) -> tuple[str, ResourceBlob] | None:
    matches: list[tuple[str, ResourceBlob]] = []
    for root in FOLLOW_REGISTRY_HINTS:
        blob = index.get(root, {}).get(rid)
        if blob:
            matches.append((root, blob))
    return matches[0] if len(matches) == 1 else None


def reference_closure(
    start_obj: dict[str, Any],
    index: dict[str, dict[str, ResourceBlob]],
    parsed_by_source: dict[str, Any],
    max_depth: int,
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    queue: list[tuple[int, dict[str, Any]]] = [(0, start_obj)]
    seen_ids: set[str] = set()
    evidence: list[dict[str, Any]] = []
    unresolved_refs: dict[str, dict[str, str]] = {}
    while queue:
        depth, obj = queue.pop(0)
        if depth >= max_depth:
            continue
        for ref in resource_references(obj):
            rid = ref["id"]
            if rid in seen_ids:
                continue
            seen_ids.add(rid)
            resolved = resolve_reference(index, rid)
            if not resolved:
                unresolved_refs[rid] = {"id": rid, "context": ref.get("context", "")}
                continue
            registry, blob = resolved
            row = {
                "id": rid,
                "registry": registry,
                "source": blob.source,
                "path": blob.logical_path,
                "sha256": blob.digest,
            }
            evidence.append(row)
            child = parsed_by_source.get(blob.source)
            if isinstance(child, dict):
                queue.append((depth + 1, child))
    evidence.sort(key=lambda x: (x["registry"], x["id"], x["source"]))
    return evidence, [unresolved_refs[k] for k in sorted(unresolved_refs)]


def parse_runtime_dump(path: Path | None) -> dict[str, set[str]]:
    out = {"biomes": set(), "dimensions": set(), "dimension_types": set()}
    if path is None:
        return out
    data = json.loads(path.read_text(encoding="utf-8"))

    def add_many(target: str, value: Any) -> None:
        if isinstance(value, str):
            if RESOURCE_ID.match(value):
                out[target].add(value)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, str) and RESOURCE_ID.match(item):
                    out[target].add(item)
                elif isinstance(item, dict):
                    for key in ("id", "name", "key"):
                        candidate = item.get(key)
                        if isinstance(candidate, str) and RESOURCE_ID.match(candidate):
                            out[target].add(candidate)
                            break
        elif isinstance(value, dict):
            for key in value:
                if isinstance(key, str) and RESOURCE_ID.match(key):
                    out[target].add(key)

    if isinstance(data, dict):
        for key, target in (("biomes", "biomes"), ("dimensions", "dimensions"), ("dimension_types", "dimension_types")):
            if key in data:
                add_many(target, data[key])
        registries = data.get("registries")
        if isinstance(registries, dict):
            for reg_name, value in registries.items():
                low = str(reg_name).lower()
                if "biome" in low:
                    add_many("biomes", value)
                elif "dimension_type" in low or "dimension type" in low:
                    add_many("dimension_types", value)
                elif "dimension" in low:
                    add_many("dimensions", value)
    return out


def source_registration_evidence(inputs: list[Path], unresolved: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Reuse the Dev Kit's high-confidence source registration inventory when available."""
    if registration_identity_inventory is None:
        return []
    rows: dict[tuple[str, str, str], dict[str, Any]] = {}
    for path in inputs:
        if not path.exists():
            continue
        try:
            report = registration_identity_inventory(path)
        except Exception as exc:
            unresolved.append({
                "kind": "source-registration-scan-error",
                "path": str(path),
                "message": str(exc),
            })
            continue
        for entry in report.get("entries", []):
            category = entry.get("category")
            rid = entry.get("id")
            if category not in {
                "biome",
                "dimension_type",
                "worldgen/placed_feature",
                "worldgen/configured_feature",
                "worldgen/structure",
                "worldgen/structure_set",
            } or not isinstance(rid, str):
                continue
            row = {
                "category": category,
                "id": rid,
                "source": entry.get("path"),
                "evidence": entry.get("evidence"),
                "confidence": entry.get("confidence", "high"),
                "input": str(path.resolve()),
            }
            rows[(category, rid, str(entry.get("path", "")))] = row
    return [rows[key] for key in sorted(rows)]


def aggregate_input_digest(blobs: Iterable[ResourceBlob]) -> str:
    h = hashlib.sha256()
    for blob in sorted(blobs, key=lambda b: (b.logical_path, b.source, b.digest)):
        h.update(blob.logical_path.encode("utf-8"))
        h.update(b"\0")
        h.update(blob.digest.encode("ascii"))
        h.update(b"\n")
    return h.hexdigest()


def discover(inputs: list[Path], runtime_dump: Path | None = None, max_reference_depth: int = 3) -> dict[str, Any]:
    unresolved: list[dict[str, Any]] = []
    blobs: list[ResourceBlob] = []
    for path in inputs:
        if not path.exists():
            unresolved.append({"kind": "missing-input", "path": str(path)})
            continue
        blobs.extend(ResourceSource(path).iter_blobs())

    unique: dict[tuple[str, str, str], ResourceBlob] = {}
    for blob in blobs:
        unique[(blob.source, blob.logical_path, blob.digest)] = blob
    blobs = list(unique.values())

    index, parsed = registry_index(blobs, unresolved)
    source_registrations = source_registration_evidence(inputs, unresolved)
    runtime = parse_runtime_dump(runtime_dump)
    runtime_sha256 = sha256(runtime_dump.read_bytes()) if runtime_dump else None

    biome_profiles: dict[str, dict[str, Any]] = {}
    dimension_profiles: dict[str, dict[str, Any]] = {}
    dimension_type_profiles: dict[str, dict[str, Any]] = {}
    tags: list[dict[str, Any]] = []

    for rid, blob in sorted(index["worldgen/biome"].items()):
        obj = parsed.get(blob.source)
        if not isinstance(obj, dict):
            continue
        refs = resource_references(obj)
        closure, unresolved_refs = reference_closure(obj, index, parsed, max_reference_depth)
        combined_refs = refs[:]
        for row in closure:
            child = parsed.get(row["source"])
            if isinstance(child, dict):
                combined_refs.extend(resource_references(child))
        biome_profiles[rid] = {
            "id": rid,
            "existence": "present",
            "confidence": "high",
            "sources": ["static-json"],
            "profile": effect_profile(obj),
            "direct_references": refs,
            "environment_cues": cue_references(combined_refs),
            "reference_evidence": closure,
            "unresolved_references": unresolved_refs,
            "evidence": [{
                "source": blob.source,
                "path": blob.logical_path,
                "sha256": blob.digest,
            }],
        }

    for root, target in (("dimension", dimension_profiles), ("dimension_type", dimension_type_profiles)):
        for rid, blob in sorted(index[root].items()):
            obj = parsed.get(blob.source)
            target[rid] = {
                "id": rid,
                "existence": "present",
                "confidence": "high",
                "sources": ["static-json"],
                "references": resource_references(obj) if isinstance(obj, dict) else [],
                "evidence": [{"source": blob.source, "path": blob.logical_path, "sha256": blob.digest}],
            }

    for blob in blobs:
        tag = tag_id_from_path(blob.logical_path)
        if not tag:
            continue
        registry, rid = tag
        if "biome" not in registry:
            continue
        obj = parsed.get(blob.source)
        if isinstance(obj, dict):
            values = obj.get("values", [])
            clean_values = []
            if isinstance(values, list):
                for value in values:
                    if isinstance(value, str):
                        clean_values.append(value)
                    elif isinstance(value, dict) and isinstance(value.get("id"), str):
                        clean_values.append(value["id"])
            tags.append({
                "id": rid,
                "registry": registry,
                "values": sorted(set(clean_values)),
                "replace": bool(obj.get("replace", False)),
                "evidence": {"source": blob.source, "path": blob.logical_path, "sha256": blob.digest},
            })

    def merge_registration(target: dict[str, dict[str, Any]], rows: list[dict[str, Any]], kind: str) -> None:
        for row in rows:
            rid = row["id"]
            if rid in target:
                if "source-registration" not in target[rid]["sources"]:
                    target[rid]["sources"].append("source-registration")
                target[rid].setdefault("registration_evidence", []).append(row)
                continue
            target[rid] = {
                "id": rid,
                "existence": "present",
                "confidence": "registration-only",
                "sources": ["source-registration"],
                "registration_evidence": [row],
                "evidence": [{"source_registration": row}],
            }
            unresolved.append({
                "kind": "registration-only-profile",
                "registry": kind,
                "id": rid,
                "message": "Source registration proves identity, but static profile JSON was not found in scanned resources.",
            })

    merge_registration(
        biome_profiles,
        [row for row in source_registrations if row["category"] == "biome"],
        "biome",
    )
    merge_registration(
        dimension_type_profiles,
        [row for row in source_registrations if row["category"] == "dimension_type"],
        "dimension_type",
    )

    def merge_runtime(target: dict[str, dict[str, Any]], ids: set[str], kind: str) -> None:
        for rid in sorted(ids):
            if rid in target:
                if "runtime-registry" not in target[rid]["sources"]:
                    target[rid]["sources"].append("runtime-registry")
                continue
            target[rid] = {
                "id": rid,
                "existence": "present",
                "confidence": "registry-only",
                "sources": ["runtime-registry"],
                "evidence": [{
                    "runtime_registry_dump": str(runtime_dump.resolve()) if runtime_dump else None,
                    "sha256": runtime_sha256,
                }],
            }
            unresolved.append({
                "kind": "runtime-only-profile",
                "registry": kind,
                "id": rid,
                "message": "Registry proves existence, but static biome/dimension profile data was not found in scanned inputs.",
            })

    merge_runtime(biome_profiles, runtime["biomes"], "biome")
    merge_runtime(dimension_profiles, runtime["dimensions"], "dimension")
    merge_runtime(dimension_type_profiles, runtime["dimension_types"], "dimension_type")

    membership: dict[str, list[str]] = defaultdict(list)
    for tag in tags:
        for value in tag["values"]:
            if value.startswith("#"):
                continue
            membership[value].append(tag["id"])
    for rid, profile in biome_profiles.items():
        if membership.get(rid):
            profile["tags"] = sorted(set(membership[rid]))

    result = {
        "schema_version": 1,
        "rule": "Static/runtime evidence may establish existence. Missing fields are never invented; runtime-only or unresolved evidence stays explicit.",
        "inputs": [str(p.resolve()) if p.exists() else str(p) for p in inputs],
        "input_resource_sha256": aggregate_input_digest(blobs),
        "runtime_registry_dump": ({
            "path": str(runtime_dump.resolve()),
            "sha256": runtime_sha256,
        } if runtime_dump else None),
        "counts": {
            "resource_blobs": len(blobs),
            "biomes": len(biome_profiles),
            "dimensions": len(dimension_profiles),
            "dimension_types": len(dimension_type_profiles),
            "biome_tags": len(tags),
            "source_registrations": len(source_registrations),
            "unresolved": len(unresolved),
        },
        "biomes": [biome_profiles[k] for k in sorted(biome_profiles)],
        "dimensions": [dimension_profiles[k] for k in sorted(dimension_profiles)],
        "dimension_types": [dimension_type_profiles[k] for k in sorted(dimension_type_profiles)],
        "biome_tags": sorted(tags, key=lambda x: (x["registry"], x["id"])),
        "source_registrations": source_registrations,
        "unresolved": sorted(unresolved, key=lambda x: (x.get("kind", ""), x.get("id", ""), x.get("path", ""), x.get("source", ""))),
    }
    return result


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("inputs", nargs="+", type=Path, help="Resource trees, JARs/ZIPs, datapacks, or instance directories")
    ap.add_argument("--runtime-registry-dump", type=Path, help="Optional JSON dump containing runtime biome/dimension registry IDs")
    ap.add_argument("--max-reference-depth", type=int, default=3)
    ap.add_argument("--json-out", type=Path)
    args = ap.parse_args()
    if args.max_reference_depth < 0 or args.max_reference_depth > 12:
        ap.error("--max-reference-depth must be between 0 and 12")
    try:
        result = discover(args.inputs, args.runtime_registry_dump, args.max_reference_depth)
    except (OSError, json.JSONDecodeError, zipfile.BadZipFile) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    text = json_dumps(result)
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
