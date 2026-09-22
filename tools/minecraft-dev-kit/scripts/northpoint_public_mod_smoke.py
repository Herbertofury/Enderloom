#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
DRIVER = ROOT / "scripts" / "northpoint_production_driver.py"


def last_json(text: str) -> dict:
    for line in reversed([row.strip() for row in text.splitlines() if row.strip()]):
        try:
            value = json.loads(line)
        except Exception:
            continue
        if isinstance(value, dict):
            return value
    raise RuntimeError("production driver returned no JSON receipt")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Northpoint production conversion against a real mod source tree.")
    parser.add_argument("--project", type=pathlib.Path, required=True)
    parser.add_argument("--minecraft", required=True)
    parser.add_argument("--loader", required=True)
    parser.add_argument("--java", type=int, required=True)
    parser.add_argument("--timeout", type=int, default=600)
    args = parser.parse_args()

    project = args.project.resolve()
    if not project.is_dir():
        raise SystemExit(f"project does not exist: {project}")

    with tempfile.TemporaryDirectory(prefix="northpoint-public-mod-") as td:
        root = pathlib.Path(td)
        work = root / "work"
        output = root / "output"
        cell = root / "cell.json"
        cell.write_text(
            json.dumps(
                {
                    "id": f"mc-{args.minecraft}-{args.loader}",
                    "minecraft": args.minecraft,
                    "loader": args.loader,
                    "java": args.java,
                    "support_state": "stable",
                    "primary": True,
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        cp = subprocess.run(
            [
                sys.executable,
                str(DRIVER),
                "--cell-json",
                str(cell),
                "--project",
                str(project),
                "--work",
                str(work),
                "--output",
                str(output),
                "--timeout",
                str(args.timeout),
            ],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=args.timeout + 60,
        )
        if cp.returncode != 0:
            raise AssertionError(f"driver exited {cp.returncode}\nSTDOUT:\n{cp.stdout}\nSTDERR:\n{cp.stderr}")
        receipt = last_json(cp.stdout)
        if receipt.get("state") not in {"passed", "runtime-unverified"}:
            raise AssertionError(json.dumps(receipt, indent=2))
        artifact = receipt.get("artifact")
        if not artifact:
            raise AssertionError(f"verified/candidate receipt has no artifact: {receipt}")
        artifact_path = output / str(artifact)
        if not artifact_path.is_file() or artifact_path.stat().st_size <= 0:
            raise AssertionError(f"artifact is missing or empty: {artifact_path}")
        evidence = receipt.get("evidence") or []
        if not any(str(row).startswith("metadata:") for row in evidence):
            raise AssertionError(f"loader metadata was not verified: {evidence}")
        print(
            json.dumps(
                {
                    "status": "PASS",
                    "state": receipt["state"],
                    "artifact": artifact_path.name,
                    "size": artifact_path.stat().st_size,
                    "evidence_count": len(evidence),
                },
                indent=2,
            )
        )
    print("Northpoint public mod production smoke: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
