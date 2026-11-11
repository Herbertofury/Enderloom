#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import copy
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from variant_foundry_biome_dna import MOTION_PRESETS, motion_profile

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
        # Exercise every shipped preset and normalized spring/damping/drag
        # corners. The original two-chain fixture remains first in the table.
        presets = [(name, params) for _, name, params in MOTION_PRESETS]
        default = motion_profile(set())
        presets.append((default["preset"], default["parameters"]))
        for stiffness in (0.0, 0.5, 1.0):
            for damping in (0.0, 0.5, 1.0):
                for drag in (0.0, 0.5, 1.0):
                    presets.append(("parameter-corner", {"stiffness": stiffness, "damping": damping,
                                    "gravity": 1.0, "drag": drag, "wind": 1.0}))
        chains = []
        for index, (name, parameters) in enumerate(presets):
            chain = copy.deepcopy(contract_data["variants"][0]["physics"]["chains"][0])
            chain.update(id=f"stability-{index:03}", target=f"bone-{index:03}",
                         preset=name, parameters=parameters)
            chains.append(chain)
        contract_data["variants"].append({"variant_id": "zzfixture:stability", "physics": {"chains": chains}})
        contract.write_text(json.dumps(contract_data, indent=2), encoding="utf-8")
        out = root / "generated"
        result = mod.generate(contract, out, "dev.enderloom.variant.runtime")
        assert result["variant_count"] == 2
        assert result["chain_count"] == 2 + len(presets)
        assert result["steady_state_contract"]["per_step_object_allocation"] is False

        harness = root / "Harness.java"
        harness.write_text(r'''
import dev.enderloom.variant.runtime.GeneratedVariantMotionTable;
import dev.enderloom.variant.runtime.SecondaryMotionSolver;
public final class Harness {
  private static void bounded(SecondaryMotionSolver solver, int chain) {
    float x = solver.x(chain), y = solver.y(chain), z = solver.z(chain);
    if (!Float.isFinite(x) || !Float.isFinite(y) || !Float.isFinite(z)
        || Math.abs(x) > 4f || Math.abs(y) > 4f || Math.abs(z) > 4f) {
      throw new AssertionError("unstable chain " + chain + " " + x + " " + y + " " + z);
    }
  }
  private static void near(float value, double expected, String label) {
    if (!Float.isFinite(value) || Math.abs(value - expected) > 0.0002) {
      throw new AssertionError(label + ": " + value + " != " + expected);
    }
  }
  private static void stability() {
    int count = GeneratedVariantMotionTable.CHAIN_COUNT;
    for (int hz : new int[]{5, 15, 30, 60, 240}) {
      SecondaryMotionSolver solver = new SecondaryMotionSolver(count);
      for (int chain = 0; chain < count; chain++) {
        solver.reset(chain, 0f, 1f, 0f);
        boolean awake = true;
        for (int tick = 0; tick < hz * 20; tick++) {
          awake = solver.step(chain, 0.25f, 1f, -0.1f, 1f / hz, 0.5f, -0.1f, 0.25f);
          bounded(solver, chain);
        }
        double frequency = 1.0 + GeneratedVariantMotionTable.STIFFNESS[chain] * 11.0;
        double spring = Math.pow(2.0 * Math.PI * frequency, 2);
        double wind = GeneratedVariantMotionTable.WIND[chain];
        double gravity = GeneratedVariantMotionTable.GRAVITY[chain];
        near(solver.x(chain), 0.25 + 0.5 * wind * 4.0 / spring, "x equilibrium");
        near(solver.y(chain), 1.0 + (-0.1 * wind * 4.0 - 9.81 * gravity * 0.35) / spring, "y equilibrium");
        near(solver.z(chain), -0.1 + 0.25 * wind * 4.0 / spring, "z equilibrium");
        if (awake) throw new AssertionError("stationary chain did not sleep " + chain);
        if (!solver.step(chain, 1.25f, 1f, -0.1f, 1f / hz, 0.5f, -0.1f, 0.25f)) {
          throw new AssertionError("moving target did not wake chain " + chain);
        }
        for (int tick = 0; tick < hz * 4; tick++) {
          solver.step(chain, (float)Math.sin(tick * 0.03), 1f, -0.1f, 1f / hz, 0.5f, -0.1f, 0.25f);
          bounded(solver, chain);
        }
      }
    }
    SecondaryMotionSolver guard = new SecondaryMotionSolver(count);
    for (float dt : new float[]{0f, -1f, Float.NaN, Float.POSITIVE_INFINITY}) {
      if (guard.step(0, 1f, 2f, 3f, dt, 0f, 0f, 0f) || guard.initialized(0)) {
        throw new AssertionError("invalid dt initialized solver");
      }
    }
    guard.reset(0, 0f, 1f, 0f);
    for (float dt : new float[]{Float.MIN_VALUE, 1f, 60f, Float.MAX_VALUE}) {
      guard.step(0, 0.25f, 1f, 0f, dt, 0.5f, 0f, 0f);
      bounded(guard, 0);
    }
    guard.resetAll();
    if (guard.initialized(0)) throw new AssertionError("resetAll retained initialized state");
    guard.step(0, 0f, 1f, 0f, 1f / 30f, 0f, 0f, 0f);
    bounded(guard, 0);
  }
  public static void main(String[] args) {
    if (GeneratedVariantMotionTable.VARIANT_COUNT != 2) throw new AssertionError();
    if (GeneratedVariantMotionTable.CHAIN_COUNT != __EXPECTED_CHAINS__) throw new AssertionError();
    int v = GeneratedVariantMotionTable.variantIndex("bloom_and_boom:creeper_female@minecraft:swamp");
    if (v != 0) throw new AssertionError("variant index " + v);
    SecondaryMotionSolver solver = new SecondaryMotionSolver(GeneratedVariantMotionTable.CHAIN_COUNT);
    solver.reset(0, 0f, 1f, 0f);
    for (int i = 0; i < 120; i++) {
      solver.step(0, 0.25f, 1f, 0f, 1f / 30f, 0.5f, 0f, 0f);
      bounded(solver, 0);
    }
    if (!Float.isFinite(solver.x(0)) || !Float.isFinite(solver.y(0)) || !Float.isFinite(solver.z(0))) {
      throw new AssertionError("non-finite solver result");
    }
    if (SecondaryMotionSolver.updateHzForDistance(0, 10f) != 30) throw new AssertionError("near LOD");
    if (SecondaryMotionSolver.updateHzForDistance(0, 50f) != 15) throw new AssertionError("medium LOD");
    if (SecondaryMotionSolver.updateHzForDistance(0, 80f) != 5) throw new AssertionError("far LOD");
    if (SecondaryMotionSolver.updateHzForDistance(0, 120f) != 0) throw new AssertionError("beyond far LOD");
    stability();
    System.out.println("PASS " + solver.x(0) + " " + solver.y(0) + " " + solver.z(0));
  }
}
'''.replace('__EXPECTED_CHAINS__', str(result["chain_count"])), encoding="utf-8")

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
