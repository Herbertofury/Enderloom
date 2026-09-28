#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("runtime_codegen", HERE / "variant_foundry_runtime_codegen.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def main() -> int:
    javac = shutil.which("javac")
    java = shutil.which("java")
    if not javac or not java:
        raise SystemExit("javac/java are required for runtime codegen selftest")

    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        contract = root / "runtime.json"
        contract_data = {
            "schema_version": 1,
            "state": "ready",
            "runtime_contract_sha256": "abc123",
            "variants": [{
                "variant_id": "bloom_and_boom:creeper_female@minecraft:swamp",
                "physics": {
                    "chains": [
                        {
                            "id": "one",
                            "logical_region": "vines",
                            "target": "vine_left",
                            "preset": "vine-leaf",
                            "parameters": {"stiffness": 0.34, "damping": 0.48, "gravity": 0.38, "drag": 0.36, "wind": 0.55},
                            "simulation": {"fixed_step_hz": 30, "max_substeps": 2},
                            "lod": {
                                "near": {"max_distance_blocks": 24, "update_hz": 30},
                                "medium": {"max_distance_blocks": 64, "update_hz": 15},
                                "far": {"max_distance_blocks": 96, "update_hz": 5},
                                "beyond_far": "bind-pose"
                            },
                            "sleep": {"velocity_epsilon": 0.001, "frames": 20}
                        },
                        {
                            "id": "two",
                            "logical_region": "vines",
                            "target": "vine_right",
                            "preset": "vine-leaf",
                            "parameters": {"stiffness": 0.34, "damping": 0.48, "gravity": 0.38, "drag": 0.36, "wind": 0.55},
                            "simulation": {"fixed_step_hz": 30, "max_substeps": 2},
                            "lod": {
                                "near": {"max_distance_blocks": 24, "update_hz": 30},
                                "medium": {"max_distance_blocks": 64, "update_hz": 15},
                                "far": {"max_distance_blocks": 96, "update_hz": 5},
                                "beyond_far": "bind-pose"
                            },
                            "sleep": {"velocity_epsilon": 0.001, "frames": 20}
                        }
                    ]
                }
            }]
        }
        contract.write_text(json.dumps(contract_data, indent=2), encoding="utf-8")
        out = root / "generated"
        result = mod.generate(contract, out, "dev.enderloom.variant.runtime")
        assert result["variant_count"] == 1
        assert result["chain_count"] == 2
        assert result["steady_state_contract"]["per_step_object_allocation"] is False

        harness = root / "Harness.java"
        harness.write_text(r'''
import dev.enderloom.variant.runtime.GeneratedVariantMotionTable;
import dev.enderloom.variant.runtime.SecondaryMotionSolver;
public final class Harness {
  public static void main(String[] args) {
    if (GeneratedVariantMotionTable.VARIANT_COUNT != 1) throw new AssertionError();
    if (GeneratedVariantMotionTable.CHAIN_COUNT != 2) throw new AssertionError();
    int v = GeneratedVariantMotionTable.variantIndex("bloom_and_boom:creeper_female@minecraft:swamp");
    if (v != 0) throw new AssertionError("variant index " + v);
    SecondaryMotionSolver solver = new SecondaryMotionSolver(GeneratedVariantMotionTable.CHAIN_COUNT);
    solver.reset(0, 0f, 1f, 0f);
    for (int i = 0; i < 120; i++) {
      solver.step(0, 0.25f, 1f, 0f, 1f / 30f, 0.5f, 0f, 0f);
    }
    if (!Float.isFinite(solver.x(0)) || !Float.isFinite(solver.y(0)) || !Float.isFinite(solver.z(0))) {
      throw new AssertionError("non-finite solver result");
    }
    if (SecondaryMotionSolver.updateHzForDistance(0, 10f) != 30) throw new AssertionError("near LOD");
    if (SecondaryMotionSolver.updateHzForDistance(0, 50f) != 15) throw new AssertionError("medium LOD");
    if (SecondaryMotionSolver.updateHzForDistance(0, 80f) != 5) throw new AssertionError("far LOD");
    if (SecondaryMotionSolver.updateHzForDistance(0, 120f) != 0) throw new AssertionError("beyond far LOD");
    System.out.println("PASS " + solver.x(0) + " " + solver.y(0) + " " + solver.z(0));
  }
}
''', encoding="utf-8")

        classes = root / "classes"
        classes.mkdir()
        java_files = [str(Path(row["path"])) for row in result["sources"]] + [str(harness)]
        cp = subprocess.run(
            [javac, "-d", str(classes), *java_files],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=60,
        )
        if cp.returncode:
            raise AssertionError(f"javac failed\n{cp.stdout}\n{cp.stderr}")
        run = subprocess.run(
            [java, "-cp", str(classes), "Harness"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=30,
        )
        if run.returncode:
            raise AssertionError(f"java harness failed\n{run.stdout}\n{run.stderr}")
        assert run.stdout.startswith("PASS ")

        repeated = mod.generate(contract, out, "dev.enderloom.variant.runtime")
        assert repeated["manifest_sha256"] == result["manifest_sha256"]
        assert [row["sha256"] for row in repeated["sources"]] == [row["sha256"] for row in result["sources"]]

        print(json.dumps({
            "status": "passed",
            "javac": javac,
            "runtime_sources": len(result["sources"]),
            "variants": result["variant_count"],
            "chains": result["chain_count"],
            "java_harness": run.stdout.strip(),
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
