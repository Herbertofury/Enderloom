#!/usr/bin/env python3
"""Durable, content-addressed Variant Foundry orchestration.

The pipeline composes the already-tested discovery -> BiomeDNA -> VariantPlan ->
Minecraft texture -> immutable ModelBundle stages without creating a second source
of truth. Every stage key includes exact input bytes, options and implementation
bytes so unchanged work is reused and changed code/data invalidates only the
affected downstream stage.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any, Callable

import variant_foundry_discover_biomes as discover_mod
import variant_foundry_biome_dna as dna_mod
import variant_foundry_plan as plan_mod
import variant_foundry_texture_compiler as texture_mod
import variant_foundry_bundle as bundle_mod
import variant_foundry_provider as provider_mod
import variant_foundry_blockbench_recipe as recipe_mod
import variant_foundry_blockbench_execute as execute_mod


SCHEMA_VERSION = 1


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def hash_json(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def implementation_sha(module: Any) -> str:
    path = Path(module.__file__).resolve()
    return sha256_file(path)


def atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    tmp = path.with_name(path.name + f".tmp-{os.getpid()}")
    tmp.write_text(payload, encoding="utf-8")
    os.replace(tmp, path)


def resolve_path(base: Path, raw: str | Path) -> Path:
    p = Path(raw)
    return (p if p.is_absolute() else base / p).resolve()


def read_manifest(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or value.get("schema_version") != SCHEMA_VERSION:
        raise ValueError("pipeline manifest must be a schema_version=1 JSON object")
    return value


def file_input(path: Path, label: str) -> dict[str, Any]:
    if not path.is_file():
        raise ValueError(f"{label} is missing or not a file: {path}")
    return {"path": str(path), "sha256": sha256_file(path), "size": path.stat().st_size}


def path_input(path: Path, label: str) -> dict[str, Any]:
    if not path.exists():
        raise ValueError(f"{label} is missing: {path}")
    if path.is_file():
        return file_input(path, label)
    h = hashlib.sha256()
    files = 0
    for child in sorted(p for p in path.rglob("*") if p.is_file()):
        rel = child.relative_to(path).as_posix()
        digest = sha256_file(child)
        h.update(rel.encode("utf-8"))
        h.update(b"\0")
        h.update(digest.encode("ascii"))
        h.update(b"\n")
        files += 1
    return {"path": str(path), "sha256": h.hexdigest(), "files": files, "kind": "directory"}


def stage_dir(workspace: Path, name: str, key: str) -> Path:
    return workspace / "stages" / name / key


def load_reusable(stage: Path, expected_key: str, output_name: str) -> tuple[dict[str, Any], Path] | None:
    receipt = stage / "receipt.json"
    output = stage / output_name
    if not receipt.is_file() or not output.is_file():
        return None
    try:
        meta = json.loads(receipt.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    if meta.get("stage_key") != expected_key:
        return None
    if meta.get("output_sha256") != sha256_file(output):
        return None
    return meta, output


def write_stage(stage: Path, name: str, key: str, inputs: Any, output_name: str, value: Any, implementation: str) -> tuple[dict[str, Any], Path]:
    stage.mkdir(parents=True, exist_ok=True)
    output = stage / output_name
    atomic_json(output, value)
    receipt = {
        "schema_version": 1,
        "stage": name,
        "state": "completed",
        "stage_key": key,
        "implementation_sha256": implementation,
        "inputs": inputs,
        "output": str(output),
        "output_sha256": sha256_file(output),
    }
    atomic_json(stage / "receipt.json", receipt)
    return receipt, output


def json_stage(
    workspace: Path,
    *,
    name: str,
    output_name: str,
    inputs: Any,
    implementation: str,
    produce: Callable[[], Any],
) -> tuple[dict[str, Any], Path, str]:
    key = hash_json({"stage": name, "inputs": inputs, "implementation_sha256": implementation})
    directory = stage_dir(workspace, name, key)
    reused = load_reusable(directory, key, output_name)
    if reused:
        receipt, output = reused
        return receipt, output, "reused"
    value = produce()
    receipt, output = write_stage(directory, name, key, inputs, output_name, value, implementation)
    return receipt, output, "completed"


def normalize_pipeline_manifest(path: Path, raw: dict[str, Any]) -> dict[str, Any]:
    base = path.parent.resolve()
    sources = raw.get("sources")
    if not isinstance(sources, list) or not sources:
        raise ValueError("pipeline manifest requires non-empty sources")
    if not all(isinstance(x, str) for x in sources):
        raise ValueError("sources must be path strings")
    subject = raw.get("subject")
    if not isinstance(subject, str):
        raise ValueError("pipeline manifest requires subject path")
    target = raw.get("target")
    if not isinstance(target, dict) or not all(isinstance(target.get(k), str) and target.get(k) for k in ("minecraft", "loader", "backend")):
        raise ValueError("target requires minecraft, loader and backend")
    mode = raw.get("mode", "full-phenotype")
    if mode not in plan_mod.MODES:
        raise ValueError(f"unsupported mode: {mode}")
    seed = raw.get("seed", 0)
    if not isinstance(seed, int):
        raise ValueError("seed must be an integer")
    biomes = raw.get("biomes")
    if biomes is not None and (not isinstance(biomes, list) or not all(isinstance(x, str) for x in biomes)):
        raise ValueError("biomes must be a string list")
    assets = raw.get("assets", [])
    textures = raw.get("textures", [])
    provider_jobs = raw.get("provider_jobs", [])
    provider_registry = raw.get("provider_registry")
    authoring_execution = raw.get("authoring_execution")
    if not isinstance(assets, list) or not isinstance(textures, list) or not isinstance(provider_jobs, list):
        raise ValueError("assets, textures and provider_jobs must be lists")
    if provider_jobs and not isinstance(provider_registry, str):
        raise ValueError("provider_registry path is required when provider_jobs are present")
    normalized_assets = []
    for row in assets:
        if not isinstance(row, dict) or not isinstance(row.get("role"), str) or not isinstance(row.get("path"), str):
            raise ValueError("every asset requires role and path")
        normalized_assets.append({"role": row["role"], "path": str(resolve_path(base, row["path"]))})
    normalized_textures = []
    for row in textures:
        if not isinstance(row, dict) or not all(isinstance(row.get(k), str) and row.get(k) for k in ("name", "role", "input", "profile")):
            raise ValueError("every texture requires name, role, input and profile")
        normalized_textures.append({
            "name": row["name"],
            "role": row["role"],
            "input": str(resolve_path(base, row["input"])),
            "profile": str(resolve_path(base, row["profile"])),
        })
    normalized_provider_jobs = []
    seen_provider_jobs: set[str] = set()
    for row in provider_jobs:
        if not isinstance(row, dict) or not all(isinstance(row.get(k), str) and row.get(k) for k in ("name", "capability", "input", "role")):
            raise ValueError("every provider job requires name, capability, input and role")
        if row["name"] in seen_provider_jobs:
            raise ValueError(f"duplicate provider job name: {row['name']}")
        seen_provider_jobs.add(row["name"])
        params = row.get("params", {})
        if not isinstance(params, dict):
            raise ValueError(f"provider job {row['name']} params must be an object")
        preferred = row.get("preferred", [])
        if not isinstance(preferred, list) or not all(isinstance(x, str) and x for x in preferred):
            raise ValueError(f"provider job {row['name']} preferred must be a string list")
        job_seed = row.get("seed", seed)
        if not isinstance(job_seed, int):
            raise ValueError(f"provider job {row['name']} seed must be an integer")
        vram = row.get("vram_budget_gb")
        if vram is not None and (not isinstance(vram, (int, float)) or isinstance(vram, bool) or vram < 0):
            raise ValueError(f"provider job {row['name']} vram_budget_gb must be non-negative")
        extension = row.get("output_extension")
        if extension is not None and (not isinstance(extension, str) or not extension):
            raise ValueError(f"provider job {row['name']} output_extension must be a non-empty string")
        require_rights = row.get("require_verified_rights", False)
        if not isinstance(require_rights, bool):
            raise ValueError(f"provider job {row['name']} require_verified_rights must be boolean")
        normalized_provider_jobs.append({
            "name": row["name"],
            "capability": row["capability"],
            "input": str(resolve_path(base, row["input"])),
            "role": row["role"],
            "seed": job_seed,
            "params": params,
            "preferred": preferred,
            "vram_budget_gb": vram,
            "output_extension": extension,
            "require_verified_rights": require_rights,
        })
    normalized_authoring_execution = None
    if authoring_execution is not None:
        if not isinstance(authoring_execution, dict):
            raise ValueError("authoring_execution must be an object")
        if not isinstance(raw.get("authoring_bindings"), str):
            raise ValueError("authoring_execution requires authoring_bindings")
        source_model = authoring_execution.get("source_model")
        if not isinstance(source_model, str) or not source_model:
            raise ValueError("authoring_execution requires source_model path")
        render_mode = authoring_execution.get("render", "auto")
        if render_mode not in {"off", "auto", "require"}:
            raise ValueError("authoring_execution.render must be off, auto or require")
        protocol = authoring_execution.get("protocol", "2025-06-18")
        if not isinstance(protocol, str) or not protocol:
            raise ValueError("authoring_execution.protocol must be a non-empty string")
        timeout = authoring_execution.get("timeout", 45.0)
        if not isinstance(timeout, (int, float)) or isinstance(timeout, bool) or timeout <= 0:
            raise ValueError("authoring_execution.timeout must be positive")
        command_json = authoring_execution.get("server_command_json")
        if command_json is not None and (not isinstance(command_json, str) or not command_json):
            raise ValueError("authoring_execution.server_command_json must be a path string")
        normalized_authoring_execution = {
            "source_model": str(resolve_path(base, source_model)),
            "server_command_json": str(resolve_path(base, command_json)) if isinstance(command_json, str) else None,
            "render": render_mode,
            "protocol": protocol,
            "timeout": float(timeout),
        }

    return {
        "schema_version": 1,
        "sources": [str(resolve_path(base, x)) for x in sources],
        "runtime_registry_dump": str(resolve_path(base, raw["runtime_registry_dump"])) if isinstance(raw.get("runtime_registry_dump"), str) else None,
        "subject": str(resolve_path(base, subject)),
        "authoring_bindings": str(resolve_path(base, raw["authoring_bindings"])) if isinstance(raw.get("authoring_bindings"), str) else None,
        "authoring_execution": normalized_authoring_execution,
        "biome_overrides": str(resolve_path(base, raw["biome_overrides"])) if isinstance(raw.get("biome_overrides"), str) else None,
        "biomes": biomes,
        "mode": mode,
        "seed": seed,
        "assets": normalized_assets,
        "textures": normalized_textures,
        "provider_registry": str(resolve_path(base, provider_registry)) if isinstance(provider_registry, str) else None,
        "provider_jobs": normalized_provider_jobs,
        "target": {k: target[k] for k in ("minecraft", "loader", "backend")},
    }


def run_pipeline(manifest_path: Path, workspace: Path) -> dict[str, Any]:
    manifest_path = manifest_path.resolve()
    workspace = workspace.resolve()
    raw = read_manifest(manifest_path)
    cfg = normalize_pipeline_manifest(manifest_path, raw)
    workspace.mkdir(parents=True, exist_ok=True)
    state_path = workspace / "pipeline-state.json"
    current_stage = "intake"
    stage_results: list[dict[str, Any]] = []
    try:
        source_paths = [Path(x) for x in cfg["sources"]]
        source_inputs = [path_input(path, "source") for path in source_paths]
        runtime_dump = Path(cfg["runtime_registry_dump"]) if cfg["runtime_registry_dump"] else None
        runtime_input = file_input(runtime_dump, "runtime registry dump") if runtime_dump else None
        subject_path = Path(cfg["subject"])
        subject_input = file_input(subject_path, "SubjectDNA")

        current_stage = "discovery"
        discovery_inputs = {
            "sources": source_inputs,
            "runtime_registry_dump": runtime_input,
            "max_reference_depth": 4,
        }
        discovery_receipt, discovery_path, state = json_stage(
            workspace,
            name="discovery",
            output_name="discovery.json",
            inputs=discovery_inputs,
            implementation=implementation_sha(discover_mod),
            produce=lambda: discover_mod.discover(source_paths, runtime_dump=runtime_dump, max_reference_depth=4),
        )
        stage_results.append({"stage": current_stage, "state": state, "receipt": str(Path(discovery_receipt["output"]).parent / "receipt.json")})

        current_stage = "biome-dna"
        discovery = json.loads(discovery_path.read_text(encoding="utf-8"))
        overrides_path = Path(cfg["biome_overrides"]) if cfg["biome_overrides"] else None
        overrides_input = file_input(overrides_path, "BiomeDNA overrides") if overrides_path else None
        overrides = {}
        if overrides_path:
            overrides = dna_mod.normalize_overrides(json.loads(overrides_path.read_text(encoding="utf-8")))
        dna_inputs = {
            "discovery_sha256": sha256_file(discovery_path),
            "overrides": overrides_input,
        }
        dna_receipt, dna_path, state = json_stage(
            workspace,
            name="biome-dna",
            output_name="biome-dna.json",
            inputs=dna_inputs,
            implementation=implementation_sha(dna_mod),
            produce=lambda: dna_mod.build(discovery, overrides),
        )
        stage_results.append({"stage": current_stage, "state": state, "receipt": str(Path(dna_receipt["output"]).parent / "receipt.json")})

        current_stage = "variant-plan"
        biome_dna = json.loads(dna_path.read_text(encoding="utf-8"))
        subject = json.loads(subject_path.read_text(encoding="utf-8"))
        plan_inputs = {
            "subject": subject_input,
            "biome_dna_sha256": sha256_file(dna_path),
            "biomes": cfg["biomes"],
            "mode": cfg["mode"],
            "seed": cfg["seed"],
        }
        plan_receipt, plans_path, state = json_stage(
            workspace,
            name="variant-plan",
            output_name="variant-plans.json",
            inputs=plan_inputs,
            implementation=implementation_sha(plan_mod),
            produce=lambda: plan_mod.build(
                subject,
                biome_dna,
                biome_ids=cfg["biomes"],
                mode=cfg["mode"],
                base_seed=cfg["seed"],
            ),
        )
        stage_results.append({"stage": current_stage, "state": state, "receipt": str(Path(plan_receipt["output"]).parent / "receipt.json")})

        authoring_recipe_path: Path | None = None
        if cfg["authoring_bindings"]:
            current_stage = "authoring-recipes"
            bindings_path = Path(cfg["authoring_bindings"])
            bindings_input = file_input(bindings_path, "authoring bindings")
            recipe_inputs = {
                "subject": subject_input,
                "plans_sha256": sha256_file(plans_path),
                "bindings": bindings_input,
            }
            recipe_receipt, authoring_recipe_path, state = json_stage(
                workspace,
                name="authoring-recipes",
                output_name="authoring-recipes.json",
                inputs=recipe_inputs,
                implementation=implementation_sha(recipe_mod),
                produce=lambda: recipe_mod.compile_recipes(
                    subject,
                    json.loads(plans_path.read_text(encoding="utf-8")),
                    json.loads(bindings_path.read_text(encoding="utf-8")),
                ),
            )
            recipe_doc = json.loads(authoring_recipe_path.read_text(encoding="utf-8"))
            stage_results.append({
                "stage": current_stage,
                "state": state,
                "semantic_state": recipe_doc.get("state"),
                "receipt": str(Path(recipe_receipt["output"]).parent / "receipt.json"),
            })
            if recipe_doc.get("state") != "ready":
                raise ValueError(
                    "authoring recipes contain required unresolved actions; "
                    "add explicit model bindings/templates instead of inventing coordinates"
                )

        compiled_assets: list[tuple[str, Path]] = []
        compiled_evidence: list[tuple[str, Path]] = []
        authoring_execution_result: dict[str, Any] | None = None
        if authoring_recipe_path is not None:
            compiled_evidence.append(("authoring-recipes", authoring_recipe_path))

        if cfg["authoring_execution"]:
            if authoring_recipe_path is None:
                raise ValueError("authoring_execution requires ready authoring recipes")
            current_stage = "authoring-execution"
            execution_cfg = cfg["authoring_execution"]
            source_model = Path(execution_cfg["source_model"])
            file_input(source_model, "authoring source model")
            command_json = Path(execution_cfg["server_command_json"]) if execution_cfg["server_command_json"] else None
            if command_json is not None:
                file_input(command_json, "Blockbench server command JSON")
            authoring_workspace = workspace / "blockbench-authoring"
            authoring_execution_result = execute_mod.execute(
                authoring_recipe_path,
                source_model,
                authoring_workspace,
                server_command_json=command_json,
                protocol=execution_cfg["protocol"],
                timeout=execution_cfg["timeout"],
                render_mode=execution_cfg["render"],
                overwrite=False,
            )
            summary_path = authoring_workspace / "execution-summary.json"
            execution_evidence_path = authoring_workspace / "execution-evidence.json"
            if execution_evidence_path.is_file():
                compiled_evidence.append(("authoring-execution-evidence", execution_evidence_path))
            execution_states = []
            for result in authoring_execution_result.get("results") or []:
                variant_id = str(result.get("variant_id") or "unknown")
                execution_states.append(str(result.get("reuse_state") or "completed"))
                output_model = result.get("output_model")
                if isinstance(output_model, str):
                    output_path = Path(output_model)
                    if output_path.is_file():
                        compiled_assets.append((f"authoring-model:{variant_id}", output_path))
                        receipt_path = output_path.parent / "execution-receipt.json"
                        if receipt_path.is_file():
                            compiled_evidence.append((f"authoring-execution-receipt:{variant_id}", receipt_path))
                render = result.get("render") if isinstance(result.get("render"), dict) else {}
                for image_index, image in enumerate(render.get("images") or []):
                    if isinstance(image, dict) and isinstance(image.get("path"), str):
                        image_path = Path(image["path"])
                        if image_path.is_file():
                            compiled_evidence.append((f"authoring-render:{variant_id}:{image_index}", image_path))
            stage_results.append({
                "stage": current_stage,
                "state": "reused" if execution_states and all(state == "reused" for state in execution_states) else "completed",
                "semantic_state": authoring_execution_result.get("state"),
                "summary": str(summary_path),
                "variant_count": authoring_execution_result.get("variant_count"),
                "passed": authoring_execution_result.get("passed"),
                "failed": authoring_execution_result.get("failed"),
            })
            if authoring_execution_result.get("state") != "passed":
                raise ValueError(
                    f"authoring execution failed for {authoring_execution_result.get('failed')} "
                    f"of {authoring_execution_result.get('variant_count')} variants"
                )

        for row in cfg["assets"]:
            path = Path(row["path"])
            file_input(path, f"asset {row['role']}")
            compiled_assets.append((row["role"], path))

        if cfg["provider_jobs"]:
            registry_path = Path(cfg["provider_registry"])
            file_input(registry_path, "provider registry")
            provider_workspace = workspace / "provider-jobs"
            for row in cfg["provider_jobs"]:
                current_stage = f"provider:{row['name']}"
                provider_input = Path(row["input"])
                file_input(provider_input, f"provider input {row['name']}")
                provider_result = provider_mod.run_job(
                    registry_path,
                    capability=row["capability"],
                    input_path=provider_input,
                    workspace=provider_workspace,
                    seed=row["seed"],
                    params=row["params"],
                    preferred=row["preferred"],
                    vram_budget_gb=row["vram_budget_gb"],
                    output_extension=row["output_extension"],
                    require_verified_rights=row["require_verified_rights"],
                )
                provider_receipt = provider_workspace / "jobs" / provider_result["job_id"] / "job-receipt.json"
                stage_results.append({
                    "stage": current_stage,
                    "state": provider_result.get("reuse_state") if provider_result.get("state") == "succeeded" else "failed",
                    "receipt": str(provider_receipt),
                    "job_id": provider_result["job_id"],
                    "selected_provider": (provider_result.get("selected_provider") or {}).get("id"),
                    "asset_validation": provider_result.get("asset_validation"),
                })
                if provider_result.get("state") != "succeeded":
                    raise ValueError(
                        f"provider job {row['name']} unresolved: "
                        f"{provider_result.get('reason') or provider_result.get('state')}"
                    )
                provider_output = Path(provider_result["output"]).resolve()
                file_input(provider_output, f"provider output {row['name']}")
                compiled_assets.append((row["role"], provider_output))
                if provider_receipt.is_file():
                    compiled_evidence.append((f"provider-job-receipt:{row['name']}", provider_receipt))
                for attempt_index, attempt in enumerate(provider_result.get("attempts") or []):
                    provider_id = str((attempt.get("provider") or {}).get("id") or f"attempt-{attempt_index}")
                    for stream in ("stdout", "stderr"):
                        raw_path = attempt.get(stream)
                        if isinstance(raw_path, str):
                            log_path = Path(raw_path)
                            if log_path.is_file():
                                compiled_evidence.append((
                                    f"provider-{stream}:{row['name']}:{provider_id}:{attempt_index}",
                                    log_path,
                                ))
                    output_path = attempt.get("output")
                    if isinstance(output_path, str):
                        validation_path = Path(output_path).parent / "asset-validation.json"
                        if validation_path.is_file():
                            compiled_evidence.append((
                                f"provider-asset-validation:{row['name']}:{provider_id}:{attempt_index}",
                                validation_path,
                            ))

        current_stage = "textures"
        for row in cfg["textures"]:
            source = Path(row["input"])
            profile = Path(row["profile"])
            source_input = file_input(source, f"texture input {row['name']}")
            profile_input = file_input(profile, f"texture profile {row['name']}")
            texture_inputs = {"source": source_input, "profile": profile_input, "name": row["name"], "role": row["role"]}
            impl = implementation_sha(texture_mod)
            key = hash_json({"stage": "texture", "inputs": texture_inputs, "implementation_sha256": impl})
            directory = stage_dir(workspace, f"texture-{row['name']}", key)
            output = directory / f"{row['name']}.png"
            receipt_path = directory / "receipt.json"
            reusable = False
            if receipt_path.is_file() and output.is_file():
                try:
                    meta = json.loads(receipt_path.read_text(encoding="utf-8"))
                    reusable = meta.get("stage_key") == key and meta.get("output_sha256") == sha256_file(output)
                except (OSError, json.JSONDecodeError):
                    reusable = False
            if reusable:
                state = "reused"
            else:
                output_bytes, compile_receipt = texture_mod.compile_texture(
                    source.read_bytes(),
                    json.loads(profile.read_text(encoding="utf-8")),
                )
                directory.mkdir(parents=True, exist_ok=True)
                output.write_bytes(output_bytes)
                meta = {
                    "schema_version": 1,
                    "stage": "texture",
                    "name": row["name"],
                    "role": row["role"],
                    "state": "completed",
                    "stage_key": key,
                    "implementation_sha256": impl,
                    "inputs": texture_inputs,
                    "output": str(output),
                    "output_sha256": sha256_file(output),
                    "compiler_receipt": compile_receipt,
                }
                atomic_json(receipt_path, meta)
                state = "completed"
            compiled_assets.append((row["role"], output))
            stage_results.append({"stage": f"texture:{row['name']}", "state": state, "receipt": str(receipt_path)})

        current_stage = "bundle"
        if not compiled_assets:
            raise ValueError("pipeline requires at least one asset or compiled texture before ModelBundle stage")
        manifest = bundle_mod.build_manifest(
            subject_path=subject_path,
            plan_path=plans_path,
            biome_dna_path=dna_path,
            assets=compiled_assets,
            minecraft=cfg["target"]["minecraft"],
            loader=cfg["target"]["loader"],
            backend=cfg["target"]["backend"],
            evidence=compiled_evidence,
        )
        bundle_output = workspace / "bundles" / manifest["bundle_id"]
        bundle_result = bundle_mod.compile_bundle(bundle_output, manifest)
        stage_results.append({
            "stage": "bundle",
            "state": bundle_result["state"],
            "bundle_id": manifest["bundle_id"],
            "manifest": bundle_result["manifest"],
        })

        result = {
            "schema_version": 1,
            "state": "complete",
            "manifest": str(manifest_path),
            "manifest_sha256": sha256_file(manifest_path),
            "workspace": str(workspace),
            "subject_id": subject.get("id"),
            "discovery": str(discovery_path),
            "biome_dna": str(dna_path),
            "variant_plans": str(plans_path),
            "authoring_recipes": str(authoring_recipe_path) if authoring_recipe_path else None,
            "authoring_execution": authoring_execution_result,
            "bundle": bundle_result,
            "stages": stage_results,
        }
        atomic_json(state_path, result)
        return result
    except Exception as exc:
        failure = {
            "schema_version": 1,
            "state": "failed",
            "manifest": str(manifest_path),
            "workspace": str(workspace),
            "failed_stage": current_stage,
            "error": str(exc),
            "completed_stages": stage_results,
        }
        atomic_json(state_path, failure)
        raise


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--manifest", type=Path, required=True)
    ap.add_argument("--workspace", type=Path, required=True)
    args = ap.parse_args(argv)
    try:
        result = run_pipeline(args.manifest, args.workspace)
        print(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False))
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
