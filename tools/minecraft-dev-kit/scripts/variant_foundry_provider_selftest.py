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
BAD_GLB = r'''from pathlib import Path
import argparse,json
p=argparse.ArgumentParser();p.add_argument("--input");p.add_argument("--output");p.add_argument("--seed");p.add_argument("--params")
a=p.parse_args();Path(a.output).write_bytes(b"not-a-glb")
print(json.dumps({"state":"succeeded","fixture_backend":"malformed"}))
'''
SUCCESS = r'''import argparse,json,struct
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("--input");p.add_argument("--output");p.add_argument("--seed");p.add_argument("--params")
a=p.parse_args()
params=json.loads(Path(a.params).read_text())
positions=struct.pack("<9f",0,0,0,1,0,0,0,1,0)
root={"asset":{"version":"2.0","generator":"provider-selftest"},"buffers":[{"byteLength":len(positions)}],"bufferViews":[{"buffer":0,"byteOffset":0,"byteLength":len(positions)}],"accessors":[{"bufferView":0,"componentType":5126,"count":3,"type":"VEC3"}],"meshes":[{"primitives":[{"attributes":{"POSITION":0},"mode":4}]}],"nodes":[{"mesh":0}],"scenes":[{"nodes":[0]}],"scene":0}
j=json.dumps(root,separators=(",",":")).encode();j+=b" "*((4-len(j)%4)%4)
b=positions+b"\x00"*((4-len(positions)%4)%4)
chunks=struct.pack("<II",len(j),0x4E4F534A)+j+struct.pack("<II",len(b),0x004E4942)+b
Path(a.output).write_bytes(struct.pack("<4sII",b"glTF",2,12+len(chunks))+chunks)
print(json.dumps({"state":"succeeded","fixture_backend":"ok","seed":int(a.seed),"mode":params.get("mode")}))
'''
PROBE_OK = r'''import json
print(json.dumps({"state":"ready","backend":"fixture"}))
'''
PROBE_FAIL = r'''import json,sys
print(json.dumps({"state":"error","reason":"fixture unavailable"}))
raise SystemExit(9)
'''


def dump(path: Path, value) -> None:
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        failer = root / "failer.py"
        bad = root / "bad.py"
        success = root / "success.py"
        probe_ok = root / "probe_ok.py"
        probe_fail = root / "probe_fail.py"
        failer.write_text(FAILER, encoding="utf-8")
        bad.write_text(BAD_GLB, encoding="utf-8")
        success.write_text(SUCCESS, encoding="utf-8")
        probe_ok.write_text(PROBE_OK, encoding="utf-8")
        probe_fail.write_text(PROBE_FAIL, encoding="utf-8")
        registry = root / "providers.json"
        common_probe = ["{python}", str(probe_ok)]
        validation = {"self_contained": True, "external": "off"}
        dump(registry, {
            "schema_version": 1,
            "providers": [
                {
                    "id": "gpu-too-large",
                    "capabilities": ["shape"],
                    "execution": "local",
                    "command": ["{python}", str(success), "--input", "{input}", "--output", "{output}", "--seed", "{seed}", "--params", "{params_json}"],
                    "probe_command": common_probe,
                    "min_vram_gb": 48,
                    "priority": 1,
                    "model": "fixture-large",
                    "weights_sha256": "a" * 64,
                    "weights_license": "fixture",
                    "validation": validation,
                    "output_extension": ".glb"
                },
                {
                    "id": "probe-bad",
                    "capabilities": ["shape"],
                    "execution": "local",
                    "command": ["{python}", str(success), "--input", "{input}", "--output", "{output}", "--seed", "{seed}", "--params", "{params_json}"],
                    "probe_command": ["{python}", str(probe_fail)],
                    "min_vram_gb": 2,
                    "priority": 1,
                    "model": "fixture-health-fail",
                    "validation": validation,
                    "output_extension": ".glb"
                },
                {
                    "id": "first-fails",
                    "capabilities": ["shape"],
                    "execution": "local",
                    "command": ["{python}", str(failer), "{input}", "{output}"],
                    "probe_command": common_probe,
                    "min_vram_gb": 4,
                    "priority": 2,
                    "model": "fixture-process-fail",
                    "validation": validation,
                    "output_extension": ".glb"
                },
                {
                    "id": "bad-glb",
                    "capabilities": ["shape"],
                    "execution": "local",
                    "command": ["{python}", str(bad), "--input", "{input}", "--output", "{output}", "--seed", "{seed}", "--params", "{params_json}"],
                    "probe_command": common_probe,
                    "min_vram_gb": 4,
                    "priority": 3,
                    "model": "fixture-malformed",
                    "validation": validation,
                    "output_extension": ".glb"
                },
                {
                    "id": "fallback-works",
                    "capabilities": ["shape", "texture"],
                    "execution": "remote",
                    "command": ["{python}", str(success), "--input", "{input}", "--output", "{output}", "--seed", "{seed}", "--params", "{params_json}"],
                    "probe_command": common_probe,
                    "min_vram_gb": 8,
                    "priority": 4,
                    "model": "fixture-success",
                    "model_version": "1",
                    "code_license": "MIT",
                    "weights_license": "fixture",
                    "rights_state": "fixture-unverified",
                    "rights_verified": False,
                    "source_repository": "fixture/provider",
                    "source_commit": "1" * 40,
                    "validation": validation,
                    "output_extension": ".glb"
                },
                {
                    "id": "rights-ok",
                    "capabilities": ["shape"],
                    "execution": "local",
                    "command": ["{python}", str(success), "--input", "{input}", "--output", "{output}", "--seed", "{seed}", "--params", "{params_json}"],
                    "probe_command": common_probe,
                    "min_vram_gb": 8,
                    "priority": 5,
                    "model": "fixture-rights-verified",
                    "code_license": "MIT",
                    "weights_license": "fixture",
                    "rights_state": "fixture-verified",
                    "rights_verified": True,
                    "validation": validation,
                    "output_extension": ".glb"
                }
            ]
        })
        source = root / "concept.bin"
        source.write_bytes(b"concept-fixture")
        workspace = root / "workspace"
        params = {"mode": "minecraft-creature"}

        report = mod.doctor(mod.load_registry(registry), vram_budget_gb=24)
        assert report["state"] == "ready"
        by_id = {row["id"]: row for row in report["providers"]}
        assert by_id["gpu-too-large"]["state"] == "unavailable"
        assert by_id["gpu-too-large"]["health_probe"]["state"] == "skipped"
        assert by_id["probe-bad"]["state"] == "unavailable"
        assert by_id["probe-bad"]["health_probe"]["state"] == "unavailable"
        assert by_id["fallback-works"]["health_probe"]["state"] == "ready"

        result = mod.run_job(
            registry,
            capability="shape",
            input_path=source,
            workspace=workspace,
            seed=77,
            params=params,
            vram_budget_gb=24,
        )
        assert result["state"] == "succeeded", result
        assert result["selected_provider"]["id"] == "fallback-works"
        assert result["reuse_state"] == "completed"
        assert result["provider_runtime"]["fixture_backend"] == "ok"
        assert result["asset_validation"]["state"] == "passed"
        assert result["asset_validation"]["stats"]["triangle_estimate"] == 1
        assert [a["provider"]["id"] for a in result["attempts"]] == ["first-fails", "bad-glb", "fallback-works"]
        assert result["attempts"][0]["state"] == "failed"
        assert result["attempts"][1]["state"] == "failed"
        assert result["attempts"][1]["asset_validation"]["state"] == "failed"
        assert result["attempts"][2]["state"] == "succeeded"
        assert any(x["id"] == "gpu-too-large" and any(r.startswith("vram-budget") for r in x["reasons"]) for x in result["rejected"])
        assert any(x["id"] == "probe-bad" and "health-probe:unavailable" in x["reasons"] for x in result["rejected"])
        output = Path(result["output"])
        assert output.is_file()

        # Cached successful bytes are authoritative until inputs/registry/tool implementation
        # change. A later provider outage must not force the exact same successful job to regenerate.
        probe_ok.write_text(PROBE_FAIL, encoding="utf-8")
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

        rights_result = mod.run_job(
            registry,
            capability="shape",
            input_path=source,
            workspace=root / "rights-workspace",
            seed=77,
            params=params,
            vram_budget_gb=24,
            require_verified_rights=True,
        )
        assert rights_result["state"] == "succeeded", rights_result
        assert rights_result["selected_provider"]["id"] == "rights-ok"
        assert rights_result["selected_provider"]["rights_verified"] is True
        assert any(x["id"] == "fallback-works" and "rights-unverified" in x["reasons"] for x in rights_result["rejected"])

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
        assert none["reason"] == "no compatible healthy provider"

        try:
            mod.expand_probe_argv(["{python}", "x", "{input}"])
        except ValueError as exc:
            assert "only {python}/{scripts}" in str(exc)
        else:
            raise AssertionError("probe must reject dynamic job placeholders")

        print(json.dumps({
            "status": "passed",
            "selected": result["selected_provider"]["id"],
            "attempts": [a["state"] for a in result["attempts"]],
            "malformed_output_rejected": True,
            "asset_gate": result["asset_validation"]["stats"],
            "reuse_state": reused["reuse_state"],
            "health_rejection": True,
            "rights_gate": rights_result["selected_provider"]["id"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
