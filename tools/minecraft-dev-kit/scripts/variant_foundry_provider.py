#!/usr/bin/env python3
"""Variant Foundry provider scheduler with deterministic failover and receipts.

Providers are exact argv subprocess adapters described by a JSON registry. The
scheduler never uses a shell, records provider/model/weights/license metadata,
serializes heavy GPU work through a workspace lock, reuses hash-valid results,
and fails over to the next compatible provider without discarding prior attempts.
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

SCHEMA_VERSION = 1
PLACEHOLDERS = {"input", "output", "seed", "params_json", "workspace", "python", "scripts"}


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
    if not isinstance(row["command"], list) or not row["command"] or not all(isinstance(x, str) and x for x in row["command"]):
        raise ValueError(f"provider {row['id']} command must be a non-empty argv string list")
    timeout = row.get("timeout_seconds", 900)
    if not isinstance(timeout, (int, float)) or timeout <= 0:
        raise ValueError(f"provider {row['id']} timeout_seconds must be positive")
    vram = row.get("min_vram_gb", 0)
    if not isinstance(vram, (int, float)) or vram < 0:
        raise ValueError(f"provider {row['id']} min_vram_gb must be non-negative")
    execution = row.get("execution", "local")
    if execution not in {"local", "remote"}:
        raise ValueError(f"provider {row['id']} execution must be local or remote")


def provider_identity(row: dict[str, Any]) -> dict[str, Any]:
    keep = (
        "id", "capabilities", "execution", "command", "timeout_seconds", "min_vram_gb",
        "priority", "provider", "model", "model_version", "weights", "weights_sha256",
        "code_license", "weights_license", "distribution_notes", "output_extension",
    )
    return {key: row.get(key) for key in keep if key in row}


def doctor(registry: dict[str, Any], *, vram_budget_gb: float | None = None) -> dict[str, Any]:
    providers = []
    for row in registry["providers"]:
        reasons = []
        command0 = row["command"][0]
        if not Path(command0).is_file() and not shutil_which(command0):
            reasons.append(f"command-not-found:{command0}")
        if vram_budget_gb is not None and float(row.get("min_vram_gb", 0)) > vram_budget_gb:
            reasons.append(f"vram-budget:{row.get('min_vram_gb', 0)}>{vram_budget_gb}")
        providers.append({
            **provider_identity(row),
            "state": "ready" if not reasons else "unavailable",
            "reasons": reasons,
        })
    return {
        "schema_version": 1,
        "state": "ready" if any(row["state"] == "ready" for row in providers) else "unavailable",
        "vram_budget_gb": vram_budget_gb,
        "providers": providers,
    }


def shutil_which(command: str) -> str | None:
    import shutil
    return shutil.which(command)


def compatible_providers(
    registry: dict[str, Any],
    capability: str,
    *,
    preferred: list[str] | None = None,
    vram_budget_gb: float | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    preferred = preferred or []
    preference_index = {provider_id: index for index, provider_id in enumerate(preferred)}
    accepted = []
    rejected = []
    for row in registry["providers"]:
        reasons = []
        if capability not in row["capabilities"]:
            reasons.append("capability")
        min_vram = float(row.get("min_vram_gb", 0))
        if vram_budget_gb is not None and min_vram > vram_budget_gb:
            reasons.append("vram-budget")
        command0 = row["command"][0]
        if not Path(command0).is_file() and not shutil_which(command0):
            reasons.append("command-not-found")
        if reasons:
            rejected.append({"id": row["id"], "reasons": reasons})
        else:
            accepted.append(row)
    accepted.sort(key=lambda row: (
        0 if row["id"] in preference_index else 1,
        preference_index.get(row["id"], 10**9),
        int(row.get("priority", 100)),
        row["id"],
    ))
    return accepted, rejected


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
        "python": sys.executable,
        "scripts": str(Path(__file__).resolve().parent),
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
    return {
        "state": state,
        "returncode": returncode,
        "elapsed_seconds": round(elapsed, 6),
        "argv": argv,
        "argv_sha256": hash_json(argv),
        "stdout": str(stdout_path),
        "stderr": str(stderr_path),
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
    candidates, rejected = compatible_providers(
        registry,
        capability,
        preferred=preferred,
        vram_budget_gb=vram_budget_gb,
    )
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
    }
    job_id = hash_json(job_identity)
    job_root = workspace / "jobs" / job_id
    receipt_path = job_root / "job-receipt.json"
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

    job_root.mkdir(parents=True, exist_ok=True)
    attempts = []
    if not candidates:
        result = {
            **job_identity,
            "job_id": job_id,
            "state": "unresolved-active",
            "reason": "no compatible provider",
            "rejected": rejected,
            "attempts": [],
        }
        atomic_json(receipt_path, result)
        return result

    lock_path = workspace / ".provider-gpu.lock"
    with WorkspaceLock(lock_path):
        for row in candidates:
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
        "reason": "all compatible providers failed",
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
