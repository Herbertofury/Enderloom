#!/usr/bin/env python3
"""Variant Foundry provider scheduler with deterministic health, failover and receipts.

Providers are exact argv subprocess adapters described by a JSON registry. The
scheduler never uses a shell, records provider/model/weights/license metadata,
runs optional cheap provider health probes before new work, serializes heavy GPU
work through a workspace lock, reuses hash-valid results even when a provider is
temporarily offline, and fails over without discarding prior attempts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import variant_foundry_gltf_gate as gltf_gate

SCHEMA_VERSION = 1
PLACEHOLDERS = {"input", "output", "seed", "params_json", "workspace", "python", "scripts"}
PROBE_PLACEHOLDERS = {"python", "scripts"}


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


def atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + f".tmp-{os.getpid()}")
    tmp.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def load_registry(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or value.get("schema_version") != SCHEMA_VERSION:
        raise ValueError("provider registry must be a schema_version=1 JSON object")
    providers = value.get("providers")
    if not isinstance(providers, list) or not providers:
        raise ValueError("provider registry requires a non-empty providers list")
    ids: set[str] = set()
    for row in providers:
        validate_provider(row)
        if row["id"] in ids:
            raise ValueError(f"duplicate provider id: {row['id']}")
        ids.add(row["id"])
    return value


def _argv_field(row: dict[str, Any], field: str, required: bool = False) -> None:
    value = row.get(field)
    if value is None and not required:
        return
    if not isinstance(value, list) or not value or not all(isinstance(x, str) and x for x in value):
        raise ValueError(f"provider {row.get('id', '<unknown>')} {field} must be a non-empty argv string list")


def validate_provider(row: Any) -> None:
    if not isinstance(row, dict):
        raise ValueError("provider entries must be objects")
    for key in ("id", "capabilities", "command"):
        if key not in row:
            raise ValueError(f"provider missing {key}")
    if not isinstance(row["id"], str) or not row["id"]:
        raise ValueError("provider id must be non-empty")
    if not isinstance(row["capabilities"], list) or not row["capabilities"] or not all(isinstance(x, str) and x for x in row["capabilities"]):
        raise ValueError(f"provider {row['id']} capabilities must be non-empty strings")
    _argv_field(row, "command", required=True)
    _argv_field(row, "probe_command")
    timeout = row.get("timeout_seconds", 900)
    if not isinstance(timeout, (int, float)) or timeout <= 0:
        raise ValueError(f"provider {row['id']} timeout_seconds must be positive")
    probe_timeout = row.get("probe_timeout_seconds", 15)
    if not isinstance(probe_timeout, (int, float)) or probe_timeout <= 0:
        raise ValueError(f"provider {row['id']} probe_timeout_seconds must be positive")
    vram = row.get("min_vram_gb", 0)
    if not isinstance(vram, (int, float)) or vram < 0:
        raise ValueError(f"provider {row['id']} min_vram_gb must be non-negative")
    execution = row.get("execution", "local")
    if execution not in {"local", "remote"}:
        raise ValueError(f"provider {row['id']} execution must be local or remote")


def provider_identity(row: dict[str, Any]) -> dict[str, Any]:
    keep = (
        "id", "capabilities", "execution", "command", "probe_command", "timeout_seconds",
        "probe_timeout_seconds", "min_vram_gb", "priority", "provider", "model",
        "model_version", "weights", "weights_sha256", "code_license", "weights_license",
        "source_repository", "source_commit", "rights_state", "distribution_notes",
        "output_extension", "validation",
    )
    return {key: row.get(key) for key in keep if key in row}


def shutil_which(command: str) -> str | None:
    import shutil
    return shutil.which(command)


def static_values() -> dict[str, str]:
    return {
        "python": sys.executable,
        "scripts": str(Path(__file__).resolve().parent),
    }


def expand_argv(template: list[str], values: dict[str, str]) -> list[str]:
    result = []
    for token in template:
        out = token
        for name in PLACEHOLDERS:
            out = out.replace("{" + name + "}", values[name])
        if "{" in out or "}" in out:
            raise ValueError(f"unrecognized provider command placeholder in token: {token}")
        result.append(out)
    return result


def expand_probe_argv(template: list[str]) -> list[str]:
    values = static_values()
    result = []
    for token in template:
        out = token
        for name in PROBE_PLACEHOLDERS:
            out = out.replace("{" + name + "}", values[name])
        if "{" in out or "}" in out:
            raise ValueError(
                f"provider probe commands may use only {{python}}/{{scripts}} placeholders: {token}"
            )
        result.append(out)
    return result


def executable_available(token: str) -> bool:
    resolved = token.replace("{python}", sys.executable).replace(
        "{scripts}", str(Path(__file__).resolve().parent)
    )
    return Path(resolved).is_file() or shutil_which(resolved) is not None


def last_json_object(text: str) -> dict[str, Any] | None:
    for line in reversed([row.strip() for row in text.splitlines() if row.strip()]):
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    return None


def run_health_probe(row: dict[str, Any]) -> dict[str, Any]:
    template = row.get("probe_command")
    if not template:
        return {"state": "not-declared"}
    argv = expand_probe_argv(template)
    if not executable_available(argv[0]):
        return {
            "state": "unavailable",
            "reason": f"probe-command-not-found:{argv[0]}",
            "argv_sha256": hash_json(argv),
        }
    started = time.monotonic()
    try:
        cp = subprocess.run(
            argv,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=float(row.get("probe_timeout_seconds", 15)),
        )
        state = "ready" if cp.returncode == 0 else "unavailable"
        runtime = last_json_object(cp.stdout or "")
        return {
            "state": state,
            "returncode": cp.returncode,
            "elapsed_seconds": round(time.monotonic() - started, 6),
            "argv_sha256": hash_json(argv),
            "runtime": runtime,
            "stdout_tail": (cp.stdout or "")[-2000:],
            "stderr_tail": (cp.stderr or "")[-2000:],
        }
    except subprocess.TimeoutExpired as exc:
        stdout = exc.stdout.decode("utf-8", "replace") if isinstance(exc.stdout, bytes) else (exc.stdout or "")
        stderr = exc.stderr.decode("utf-8", "replace") if isinstance(exc.stderr, bytes) else (exc.stderr or "")
        return {
            "state": "timed-out",
            "elapsed_seconds": round(time.monotonic() - started, 6),
            "argv_sha256": hash_json(argv),
            "stdout_tail": stdout[-2000:],
            "stderr_tail": stderr[-2000:],
        }
    except OSError as exc:
        return {
            "state": "unavailable",
            "reason": str(exc),
            "elapsed_seconds": round(time.monotonic() - started, 6),
            "argv_sha256": hash_json(argv),
        }


def static_reasons(row: dict[str, Any], *, vram_budget_gb: float | None = None) -> list[str]:
    reasons: list[str] = []
    if not executable_available(row["command"][0]):
        reasons.append(f"command-not-found:{row['command'][0]}")
    if vram_budget_gb is not None and float(row.get("min_vram_gb", 0)) > vram_budget_gb:
        reasons.append(f"vram-budget:{row.get('min_vram_gb', 0)}>{vram_budget_gb}")
    return reasons


def doctor(registry: dict[str, Any], *, vram_budget_gb: float | None = None) -> dict[str, Any]:
    providers = []
    for row in registry["providers"]:
        reasons = static_reasons(row, vram_budget_gb=vram_budget_gb)
        probe = {"state": "skipped", "reason": "static-rejection"}
        if not reasons:
            probe = run_health_probe(row)
            if probe["state"] not in {"ready", "not-declared"}:
                reasons.append(f"health-probe:{probe['state']}")
        providers.append({
            **provider_identity(row),
            "state": "ready" if not reasons else "unavailable",
            "reasons": reasons,
            "health_probe": probe,
        })
    return {
        "schema_version": 1,
        "state": "ready" if any(row["state"] == "ready" for row in providers) else "unavailable",
        "vram_budget_gb": vram_budget_gb,
        "providers": providers,
    }


def compatible_providers(
    registry: dict[str, Any],
    capability: str,
    *,
    preferred: list[str] | None = None,
    vram_budget_gb: float | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    preferred = preferred or []
    preference_index = {provider_id: index for index, provider_id in enumerate(preferred)}
    accepted: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = []
    for row in registry["providers"]:
        reasons: list[str] = []
        if capability not in row["capabilities"]:
            reasons.append("capability")
        reasons.extend(static_reasons(row, vram_budget_gb=vram_budget_gb))
        probe: dict[str, Any] | None = None
        if not reasons:
            probe = run_health_probe(row)
            if probe["state"] not in {"ready", "not-declared"}:
                reasons.append(f"health-probe:{probe['state']}")
        if reasons:
            rejected_row: dict[str, Any] = {"id": row["id"], "reasons": reasons}
            if probe is not None:
                rejected_row["health_probe"] = probe
            rejected.append(rejected_row)
        else:
            accepted.append({"provider": row, "health_probe": probe or {"state": "not-declared"}})
    accepted.sort(key=lambda item: (
        0 if item["provider"]["id"] in preference_index else 1,
        preference_index.get(item["provider"]["id"], 10**9),
        int(item["provider"].get("priority", 100)),
        item["provider"]["id"],
    ))
    return accepted, rejected


class WorkspaceLock:
    def __init__(self, path: Path):
        self.path = path
        self.fd: int | None = None

    def __enter__(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        try:
            self.fd = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError as exc:
            try:
                owner = self.path.read_text(encoding="utf-8")
            except OSError:
                owner = "unknown"
            raise ValueError(f"provider workspace is busy: {self.path}; owner={owner}") from exc
        os.write(self.fd, json.dumps({"pid": os.getpid(), "started_unix": time.time()}).encode("utf-8"))
        os.fsync(self.fd)
        return self

    def __exit__(self, exc_type, exc, tb):
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None
        try:
            self.path.unlink()
        except FileNotFoundError:
            pass


def run_provider(
    row: dict[str, Any],
    *,
    input_path: Path,
    output_path: Path,
    seed: int,
    params: dict[str, Any],
    workspace: Path,
) -> dict[str, Any]:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    params_path = output_path.parent / "params.json"
    atomic_json(params_path, params)
    values = {
        "input": str(input_path),
        "output": str(output_path),
        "seed": str(seed),
        "params_json": str(params_path),
        "workspace": str(workspace),
        **static_values(),
    }
    argv = expand_argv(row["command"], values)
    started = time.monotonic()
    proc = None
    try:
        proc = subprocess.Popen(
            argv,
            cwd=str(workspace),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        stdout, stderr = proc.communicate(timeout=float(row.get("timeout_seconds", 900)))
        returncode = proc.returncode
        state = "succeeded" if returncode == 0 else "failed"
    except subprocess.TimeoutExpired:
        if proc is not None:
            proc.terminate()
            try:
                stdout, stderr = proc.communicate(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
                stdout, stderr = proc.communicate()
        else:
            stdout, stderr = "", ""
        returncode = None
        state = "timed-out"
    except KeyboardInterrupt:
        if proc is not None:
            proc.terminate()
        raise
    elapsed = time.monotonic() - started
    stdout_path = output_path.parent / "stdout.log"
    stderr_path = output_path.parent / "stderr.log"
    stdout_path.write_text(stdout or "", encoding="utf-8")
    stderr_path.write_text(stderr or "", encoding="utf-8")
    if state == "succeeded" and (not output_path.is_file() or output_path.stat().st_size <= 0):
        state = "failed"
        stderr = (stderr or "") + "\nprovider returned success but output file is missing/empty"
        stderr_path.write_text(stderr, encoding="utf-8")

    asset_validation = None
    if state == "succeeded" and output_path.suffix.lower() == ".glb":
        policy = row.get("validation") if isinstance(row.get("validation"), dict) else {}
        asset_validation = gltf_gate.validate_glb(
            output_path,
            self_contained=bool(policy.get("self_contained", True)),
            external=str(policy.get("external", "auto")),
        )
        gltf_gate.atomic_json(output_path.parent / "asset-validation.json", asset_validation)
        if asset_validation.get("state") != "passed":
            state = "failed"
            stderr = (stderr or "") + "\nprovider GLB failed Variant Foundry asset gate: " + str(asset_validation.get("reason"))
            stderr_path.write_text(stderr, encoding="utf-8")
    return {
        "state": state,
        "returncode": returncode,
        "elapsed_seconds": round(elapsed, 6),
        "argv": argv,
        "argv_sha256": hash_json(argv),
        "stdout": str(stdout_path),
        "stderr": str(stderr_path),
        "provider_runtime": last_json_object(stdout or ""),
        "asset_validation": asset_validation,
        "output": str(output_path),
        "output_sha256": sha256_file(output_path) if state == "succeeded" else None,
        "output_size": output_path.stat().st_size if state == "succeeded" else 0,
    }


def run_job(
    registry_path: Path,
    *,
    capability: str,
    input_path: Path,
    workspace: Path,
    seed: int,
    params: dict[str, Any],
    preferred: list[str] | None = None,
    vram_budget_gb: float | None = None,
    output_extension: str | None = None,
) -> dict[str, Any]:
    registry_path = registry_path.resolve()
    input_path = input_path.resolve()
    workspace = workspace.resolve()
    if not input_path.is_file():
        raise ValueError(f"provider input is missing or not a file: {input_path}")
    registry = load_registry(registry_path)
    job_identity = {
        "schema_version": 1,
        "registry_sha256": sha256_file(registry_path),
        "capability": capability,
        "input_sha256": sha256_file(input_path),
        "input_size": input_path.stat().st_size,
        "seed": seed,
        "params": params,
        "preferred": preferred or [],
        "vram_budget_gb": vram_budget_gb,
        "output_extension": output_extension,
        "implementation": {
            "scheduler_sha256": sha256_file(Path(__file__).resolve()),
            "gltf_gate_sha256": sha256_file(Path(gltf_gate.__file__).resolve()),
            "external_validator": gltf_gate.external_validator_fingerprint("auto"),
        },
    }
    job_id = hash_json(job_identity)
    job_root = workspace / "jobs" / job_id
    receipt_path = job_root / "job-receipt.json"

    # Reuse already-proven bytes before touching a provider. A temporary backend outage
    # must not invalidate a content-addressed successful result.
    if receipt_path.is_file():
        try:
            existing = json.loads(receipt_path.read_text(encoding="utf-8"))
            output = Path(existing.get("output", ""))
            if (
                existing.get("state") == "succeeded"
                and existing.get("job_id") == job_id
                and output.is_file()
                and sha256_file(output) == existing.get("output_sha256")
            ):
                reused = dict(existing)
                reused["reuse_state"] = "reused"
                return reused
        except (OSError, json.JSONDecodeError, ValueError):
            pass

    candidates, rejected = compatible_providers(
        registry,
        capability,
        preferred=preferred,
        vram_budget_gb=vram_budget_gb,
    )
    job_root.mkdir(parents=True, exist_ok=True)
    attempts = []
    if not candidates:
        result = {
            **job_identity,
            "job_id": job_id,
            "state": "unresolved-active",
            "reason": "no compatible healthy provider",
            "rejected": rejected,
            "attempts": [],
        }
        atomic_json(receipt_path, result)
        return result

    lock_path = workspace / ".provider-gpu.lock"
    with WorkspaceLock(lock_path):
        for candidate in candidates:
            row = candidate["provider"]
            provider = provider_identity(row)
            provider_key = hash_json({"provider": provider, "job": job_identity})
            attempt_root = job_root / "attempts" / provider_key
            ext = output_extension or str(row.get("output_extension") or ".bin")
            if not ext.startswith("."):
                ext = "." + ext
            output = attempt_root / ("output" + ext)
            attempt_root.mkdir(parents=True, exist_ok=True)
            attempt = {
                "provider": provider,
                "provider_key": provider_key,
                "health_probe": candidate["health_probe"],
                "state": "running",
            }
            atomic_json(attempt_root / "attempt.json", attempt)
            run = run_provider(
                row,
                input_path=input_path,
                output_path=output,
                seed=seed,
                params=params,
                workspace=attempt_root,
            )
            attempt.update(run)
            atomic_json(attempt_root / "attempt.json", attempt)
            attempts.append(attempt)
            if run["state"] == "succeeded":
                result = {
                    **job_identity,
                    "job_id": job_id,
                    "state": "succeeded",
                    "reuse_state": "completed",
                    "selected_provider": provider,
                    "provider_runtime": run.get("provider_runtime"),
                    "asset_validation": run.get("asset_validation"),
                    "output": run["output"],
                    "output_sha256": run["output_sha256"],
                    "output_size": run["output_size"],
                    "attempts": attempts,
                    "rejected": rejected,
                }
                atomic_json(receipt_path, result)
                return result

    result = {
        **job_identity,
        "job_id": job_id,
        "state": "unresolved-active",
        "reason": "all compatible healthy providers failed",
        "attempts": attempts,
        "rejected": rejected,
    }
    atomic_json(receipt_path, result)
    return result


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--registry", type=Path, required=True)
    sub = ap.add_subparsers(dest="command", required=True)
    doctor_cmd = sub.add_parser("doctor")
    doctor_cmd.add_argument("--vram-budget-gb", type=float)
    doctor_cmd.add_argument("--json-out", type=Path)
    run_cmd = sub.add_parser("run")
    run_cmd.add_argument("--capability", required=True)
    run_cmd.add_argument("--input", type=Path, required=True)
    run_cmd.add_argument("--workspace", type=Path, required=True)
    run_cmd.add_argument("--seed", type=int, default=0)
    run_cmd.add_argument("--params", type=Path)
    run_cmd.add_argument("--preferred", action="append", default=[])
    run_cmd.add_argument("--vram-budget-gb", type=float)
    run_cmd.add_argument("--output-extension")
    args = ap.parse_args(argv)
    try:
        registry = load_registry(args.registry.resolve())
        if args.command == "doctor":
            result = doctor(registry, vram_budget_gb=args.vram_budget_gb)
            if args.json_out:
                atomic_json(args.json_out, result)
            print(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False))
            return 0 if result["state"] == "ready" else 2
        params: dict[str, Any] = {}
        if args.params:
            value = json.loads(args.params.read_text(encoding="utf-8"))
            if not isinstance(value, dict):
                raise ValueError("--params must contain a JSON object")
            params = value
        result = run_job(
            args.registry,
            capability=args.capability,
            input_path=args.input,
            workspace=args.workspace,
            seed=args.seed,
            params=params,
            preferred=args.preferred,
            vram_budget_gb=args.vram_budget_gb,
            output_extension=args.output_extension,
        )
        print(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False))
        return 0 if result["state"] == "succeeded" else 2
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
