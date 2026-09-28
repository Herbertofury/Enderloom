#!/usr/bin/env python3
"""Variant Foundry adapter for a running MyMeshy backend.

Uses the documented REST job API, forwards the deterministic seed through
GenOptions, rejects MyMeshy mock mode by default, polls one real job, and writes
the finished GLB to the exact output path expected by the provider scheduler.
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import os
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any


def load_params(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("params JSON must contain an object")
    return value


def request_json(url: str, *, method: str = "GET", data: bytes | None = None, headers: dict[str, str] | None = None, timeout: float = 30) -> Any:
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            payload = response.read()
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        raise ValueError(f"MyMeshy HTTP {exc.code} for {url}: {body[:1000]}") from exc
    except urllib.error.URLError as exc:
        raise ValueError(f"cannot reach MyMeshy backend {url}: {exc}") from exc
    try:
        return json.loads(payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"MyMeshy returned non-JSON from {url}") from exc


def request_bytes(url: str, *, timeout: float = 60) -> bytes:
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        raise ValueError(f"MyMeshy HTTP {exc.code} for {url}: {body[:1000]}") from exc
    except urllib.error.URLError as exc:
        raise ValueError(f"cannot download MyMeshy asset {url}: {exc}") from exc


def multipart_image(path: Path, options: dict[str, Any]) -> tuple[bytes, str]:
    boundary = "----Enderloom" + uuid.uuid4().hex
    body = bytearray()

    def field(name: str, value: str) -> None:
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body.extend(value.encode("utf-8"))
        body.extend(b"\r\n")

    field("options", json.dumps(options, separators=(",", ":")))
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(f'Content-Disposition: form-data; name="images"; filename="{path.name}"\r\n'.encode())
    body.extend(f"Content-Type: {mime}\r\n\r\n".encode())
    body.extend(path.read_bytes())
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())
    return bytes(body), f"multipart/form-data; boundary={boundary}"


def cancel(endpoint: str, job_id: str) -> None:
    try:
        request_json(f"{endpoint}/api/jobs/{urllib.parse.quote(job_id)}", method="POST", data=b"", timeout=5)
    except Exception:
        pass


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--seed", type=int, required=True)
    ap.add_argument("--params", type=Path, required=True)
    ap.add_argument("--endpoint", default=os.environ.get("MYMESHY_URL", "http://127.0.0.1:8000"))
    args = ap.parse_args(argv)
    job_id = None
    try:
        params = load_params(args.params)
        endpoint = args.endpoint.rstrip("/")
        if not endpoint.startswith(("http://", "https://")):
            raise ValueError("MyMeshy endpoint must use http:// or https://")
        system = request_json(endpoint + "/api/system")
        if not isinstance(system, dict):
            raise ValueError("MyMeshy /api/system returned an invalid object")
        if system.get("mock_mode") is True and not bool(params.get("allow_mock", False)):
            raise ValueError("MyMeshy is in mock mode; placeholder geometry cannot satisfy Variant Foundry production acceptance")

        mode = str(params.get("mode", "image")).lower()
        options = {
            key: params[key]
            for key in ("adapter", "target_polycount", "texture_size", "generate_pbr", "decimate")
            if key in params
        }
        options["seed"] = args.seed

        if mode == "image":
            if not args.input.is_file():
                raise ValueError(f"input image is missing: {args.input}")
            body, content_type = multipart_image(args.input, options)
            job = request_json(
                endpoint + "/api/jobs/image-to-3d",
                method="POST",
                data=body,
                headers={"Content-Type": content_type},
                timeout=float(params.get("submit_timeout_seconds", 60)),
            )
        elif mode == "text":
            prompt = str(params.get("prompt", "")).strip()
            if not prompt:
                prompt = args.input.read_text(encoding="utf-8").strip()
            if not prompt:
                raise ValueError("text mode requires params.prompt or a non-empty UTF-8 input file")
            payload = json.dumps({"prompt": prompt, "options": options}, separators=(",", ":")).encode("utf-8")
            job = request_json(
                endpoint + "/api/jobs/text-to-3d",
                method="POST",
                data=payload,
                headers={"Content-Type": "application/json"},
                timeout=float(params.get("submit_timeout_seconds", 60)),
            )
        else:
            raise ValueError("MyMeshy adapter mode must be image or text")

        if not isinstance(job, dict) or not isinstance(job.get("id"), str):
            raise ValueError("MyMeshy job submission returned no job id")
        job_id = job["id"]
        poll = max(0.1, float(params.get("poll_seconds", 1.0)))
        deadline = time.monotonic() + float(params.get("job_timeout_seconds", 1800))
        while True:
            status = request_json(
                f"{endpoint}/api/jobs/{urllib.parse.quote(job_id)}",
                timeout=float(params.get("poll_timeout_seconds", 30)),
            )
            if not isinstance(status, dict):
                raise ValueError("MyMeshy job status was not an object")
            state = status.get("status")
            if state == "done":
                asset_id = status.get("asset_id")
                if not isinstance(asset_id, str) or not asset_id:
                    raise ValueError("MyMeshy completed job has no asset_id")
                payload = request_bytes(
                    f"{endpoint}/api/assets/{urllib.parse.quote(asset_id)}/model.glb",
                    timeout=float(params.get("download_timeout_seconds", 120)),
                )
                if not payload:
                    raise ValueError("MyMeshy returned an empty model.glb")
                args.output.parent.mkdir(parents=True, exist_ok=True)
                args.output.write_bytes(payload)
                print(json.dumps({
                    "state": "succeeded",
                    "adapter": "mymeshy",
                    "backend_version": system.get("version"),
                    "active": system.get("active"),
                    "job_id": job_id,
                    "asset_id": asset_id,
                    "seed": args.seed,
                    "output": str(args.output.resolve()),
                }, sort_keys=True))
                return 0
            if state in {"error", "cancelled"}:
                raise ValueError(f"MyMeshy job {job_id} ended as {state}: {status.get('error') or status.get('message')}")
            if time.monotonic() >= deadline:
                cancel(endpoint, job_id)
                raise ValueError(f"MyMeshy job timed out: {job_id}")
            time.sleep(poll)
    except KeyboardInterrupt:
        if job_id:
            cancel(args.endpoint.rstrip("/"), job_id)
        raise
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"state": "error", "adapter": "mymeshy", "job_id": job_id, "reason": str(exc)}, sort_keys=True), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
