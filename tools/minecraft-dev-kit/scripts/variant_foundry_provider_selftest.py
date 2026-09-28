#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("provider", HERE / "variant_foundry_provider.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


FAILER = r'''import sys
print("intentional first-provider failure", file=sys.stderr)
raise SystemExit(7)
'''

SUCCESS = r'''import argparse,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("--input");p.add_argument("--output");p.add_argument("--seed");p.add_argument("--params")
a=p.parse_args()
src=Path(a.input).read_bytes()
params=json.loads(Path(a.params).read_text())
Path(a.output).write_bytes(src+b"\\nseed="+a.seed.encode()+b"\\nmode="+str(params.get("mode")).encode())
print("provider success")
'''


def dump(path: Path, value) -> None:
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        failer = root / "failer.py"
        success = root / "success.py"
        failer.write_text(FAILER, encoding="utf-8")
        success.write_text(SUCCESS, encoding="utf-8")
        registry = root / "providers.json"
        dump(registry, {
            "schema_version": 1,
            "providers": [
                {
                    "id": "gpu-too-large",
                    "capabilities": ["shape"],
                    "execution": "local",
                    "command": ["{python}", str(success), "--input", "{input}", "--output", "{output}", "--seed", "{seed}", "--params", "{params_json}"],
                    "min_vram_gb": 48,
                    "priority": 1,
                    "model": "fixture-large",
                    "weights_sha256": "a" * 64,
                    "weights_license": "fixture",
                    "output_extension": ".glb"
                },
                {
                    "id": "first-fails",
                    "capabilities": ["shape"],
                    "execution": "local",
                    "command": ["{python}", str(failer), "{input}", "{output}"],
                    "min_vram_gb": 4,
                    "priority": 2,
                    "model": "fixture-fail",
                    "output_extension": ".glb"
                },
                {
                    "id": "fallback-works",
                    "capabilities": ["shape", "texture"],
                    "execution": "remote",
                    "command": [sys.executable, str(success), "--input", "{input}", "--output", "{output}", "--seed", "{seed}", "--params", "{params_json}"],
                    "min_vram_gb": 8,
                    "priority": 3,
                    "model": "fixture-success",
                    "model_version": "1",
                    "code_license": "MIT",
                    "weights_license": "fixture",
                    "output_extension": ".glb"
                }
            ]
        })
        source = root / "concept.bin"
        source.write_bytes(b"concept-fixture")
        workspace = root / "workspace"
        params = {"mode": "minecraft-creature"}

        result = mod.run_job(
            registry,
            capability="shape",
            input_path=source,
            workspace=workspace,
            seed=77,
            params=params,
            vram_budget_gb=24,
        )
        assert result["state"] == "succeeded"
        assert result["selected_provider"]["id"] == "fallback-works"
        assert result["reuse_state"] == "completed"
        assert [a["provider"]["id"] for a in result["attempts"]] == ["first-fails", "fallback-works"]
        assert result["attempts"][0]["state"] == "failed"
        assert result["attempts"][1]["state"] == "succeeded"
        assert any(x["id"] == "gpu-too-large" and "vram-budget" in x["reasons"] for x in result["rejected"])
        output = Path(result["output"])
        assert output.is_file()
        assert b"seed=77" in output.read_bytes()

        reused = mod.run_job(
            registry,
            capability="shape",
            input_path=source,
            workspace=workspace,
            seed=77,
            params=params,
            vram_budget_gb=24,
        )
        assert reused["state"] == "succeeded"
        assert reused["reuse_state"] == "reused"
        assert reused["job_id"] == result["job_id"]

        none = mod.run_job(
            registry,
            capability="nonexistent",
            input_path=source,
            workspace=workspace,
            seed=1,
            params={},
            vram_budget_gb=24,
        )
        assert none["state"] == "unresolved-active"
        assert none["reason"] == "no compatible provider"

        report = mod.doctor(mod.load_registry(registry), vram_budget_gb=24)
        assert report["state"] == "ready"
        assert any(row["id"] == "gpu-too-large" and row["state"] == "unavailable" for row in report["providers"])

        print(json.dumps({
            "status": "passed",
            "selected": result["selected_provider"]["id"],
            "attempts": [a["state"] for a in result["attempts"]],
            "reuse_state": reused["reuse_state"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
