#!/usr/bin/env python3
"""Generate allocation-free Java secondary-motion runtime sources.

Consumes a ready Variant Foundry runtime contract and emits a loader-neutral Java
solver plus a content-specific table. The generated code has no Minecraft or
third-party dependencies; a target renderer binds table targets to its own bone
handles once, then calls the in-place solver during client rendering.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

PACKAGE_RX = re.compile(r"^[a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)*$")
SCHEMA_VERSION = 1


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def java_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def float_literal(value: Any) -> str:
    number = float(value)
    text = format(number, ".9g")
    if "e" not in text.lower() and "." not in text:
        text += ".0"
    return text + "f"


def int_literal(value: Any) -> str:
    return str(int(value))


def load_contract(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or value.get("schema_version") != SCHEMA_VERSION:
        raise ValueError("runtime contract must be a schema_version=1 JSON object")
    if value.get("state") != "ready":
        raise ValueError("runtime contract must be ready before Java code generation")
    variants = value.get("variants")
    if not isinstance(variants, list):
        raise ValueError("runtime contract variants must be an array")
    return value


def flatten(contract: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    variants = sorted(contract["variants"], key=lambda row: str(row.get("variant_id")))
    chains: list[dict[str, Any]] = []
    variant_rows = []
    cursor = 0
    for variant in variants:
        variant_id = variant.get("variant_id")
        if not isinstance(variant_id, str) or not variant_id:
            raise ValueError("every runtime variant requires variant_id")
        physics = variant.get("physics")
        if not isinstance(physics, dict) or not isinstance(physics.get("chains"), list):
            raise ValueError(f"{variant_id} physics.chains must be an array")
        own = sorted(
            physics["chains"],
            key=lambda row: (str(row.get("logical_region")), str(row.get("target")), str(row.get("id"))),
        )
        for row in own:
            if not isinstance(row, dict):
                raise ValueError(f"{variant_id} contains malformed chain")
            params = row.get("parameters")
            sim = row.get("simulation")
            lod = row.get("lod")
            sleep = row.get("sleep")
            if not all(isinstance(x, dict) for x in (params, sim, lod, sleep)):
                raise ValueError(f"{variant_id}:{row.get('target')} chain contract is incomplete")
            target = row.get("target")
            region = row.get("logical_region")
            if not isinstance(target, str) or not target or not isinstance(region, str) or not region:
                raise ValueError(f"{variant_id} chain requires target and logical_region")
            chains.append({"variant_id": variant_id, **row})
        variant_rows.append({
            "variant_id": variant_id,
            "start": cursor,
            "count": len(own),
        })
        cursor += len(own)
    return variant_rows, chains


def array(name: str, java_type: str, values: list[str]) -> str:
    rendered = ", ".join(values)
    return f"    public static final {java_type}[] {name} = new {java_type}[]{{{rendered}}};\n"


def generated_table(package: str, contract: dict[str, Any]) -> str:
    variants, chains = flatten(contract)
    lines = [
        f"package {package};\n\n",
        "/** Generated from a hash-bound Variant Foundry runtime contract. */\n",
        "public final class GeneratedVariantMotionTable {\n",
        "    private GeneratedVariantMotionTable() {}\n",
        f"    public static final String RUNTIME_CONTRACT_SHA256 = {java_string(str(contract.get('runtime_contract_sha256', '')))};\n",
        f"    public static final int VARIANT_COUNT = {len(variants)};\n",
        f"    public static final int CHAIN_COUNT = {len(chains)};\n",
    ]
    lines.append(array("VARIANT_IDS", "String", [java_string(row["variant_id"]) for row in variants]))
    lines.append(array("VARIANT_CHAIN_START", "int", [int_literal(row["start"]) for row in variants]))
    lines.append(array("VARIANT_CHAIN_COUNT", "int", [int_literal(row["count"]) for row in variants]))
    lines.append(array("CHAIN_VARIANT_IDS", "String", [java_string(row["variant_id"]) for row in chains]))
    lines.append(array("CHAIN_REGIONS", "String", [java_string(str(row["logical_region"])) for row in chains]))
    lines.append(array("CHAIN_TARGETS", "String", [java_string(str(row["target"])) for row in chains]))
    lines.append(array("CHAIN_PRESETS", "String", [java_string(str(row.get("preset", ""))) for row in chains]))
    for key, field in (
        ("STIFFNESS", "stiffness"),
        ("DAMPING", "damping"),
        ("GRAVITY", "gravity"),
        ("DRAG", "drag"),
        ("WIND", "wind"),
    ):
        lines.append(array(key, "float", [float_literal(row["parameters"][field]) for row in chains]))
    lines.append(array("FIXED_STEP_HZ", "int", [int_literal(row["simulation"]["fixed_step_hz"]) for row in chains]))
    lines.append(array("MAX_SUBSTEPS", "int", [int_literal(row["simulation"]["max_substeps"]) for row in chains]))
    lines.append(array("LOD_NEAR", "float", [float_literal(row["lod"]["near"]["max_distance_blocks"]) for row in chains]))
    lines.append(array("LOD_MEDIUM", "float", [float_literal(row["lod"]["medium"]["max_distance_blocks"]) for row in chains]))
    lines.append(array("LOD_FAR", "float", [float_literal(row["lod"]["far"]["max_distance_blocks"]) for row in chains]))
    lines.append(array("HZ_NEAR", "int", [int_literal(row["lod"]["near"]["update_hz"]) for row in chains]))
    lines.append(array("HZ_MEDIUM", "int", [int_literal(row["lod"]["medium"]["update_hz"]) for row in chains]))
    lines.append(array("HZ_FAR", "int", [int_literal(row["lod"]["far"]["update_hz"]) for row in chains]))
    lines.append(array("SLEEP_VELOCITY_EPSILON", "float", [float_literal(row["sleep"]["velocity_epsilon"]) for row in chains]))
    lines.append(array("SLEEP_FRAMES", "int", [int_literal(row["sleep"]["frames"]) for row in chains]))

    lines.append("    public static int variantIndex(String variantId) {\n")
    lines.append("        if (variantId == null) return -1;\n")
    lines.append("        return switch (variantId) {\n")
    for index, row in enumerate(variants):
        lines.append(f"            case {java_string(row['variant_id'])} -> {index};\n")
    lines.append("            default -> -1;\n")
    lines.append("        };\n")
    lines.append("    }\n")
    lines.append("}\n")
    return "".join(lines)


def solver_source(package: str) -> str:
    return f"""package {package};

/**
 * Allocation-free damped secondary-motion particle solver.
 *
 * One solver is created per rendered entity/model instance and reused. Target
 * positions are supplied by the renderer's already-bound bone handles; no bone
 * names, JSON, I/O, maps or allocations are touched inside step().
 */
public final class SecondaryMotionSolver {{
    private static final float TAU = (float) (Math.PI * 2.0);
    private final float[] positionX;
    private final float[] positionY;
    private final float[] positionZ;
    private final float[] velocityX;
    private final float[] velocityY;
    private final float[] velocityZ;
    private final int[] quietFrames;
    private final boolean[] initialized;

    public SecondaryMotionSolver(int chainCount) {{
        if (chainCount < 0) throw new IllegalArgumentException("chainCount < 0");
        positionX = new float[chainCount];
        positionY = new float[chainCount];
        positionZ = new float[chainCount];
        velocityX = new float[chainCount];
        velocityY = new float[chainCount];
        velocityZ = new float[chainCount];
        quietFrames = new int[chainCount];
        initialized = new boolean[chainCount];
    }}

    public int size() {{
        return positionX.length;
    }}

    private void check(int index) {{
        if (index < 0 || index >= positionX.length) throw new IndexOutOfBoundsException(index);
    }}

    public void reset(int index, float x, float y, float z) {{
        check(index);
        positionX[index] = x;
        positionY[index] = y;
        positionZ[index] = z;
        velocityX[index] = 0.0f;
        velocityY[index] = 0.0f;
        velocityZ[index] = 0.0f;
        quietFrames[index] = 0;
        initialized[index] = true;
    }}

    public void resetAll() {{
        java.util.Arrays.fill(initialized, false);
        java.util.Arrays.fill(quietFrames, 0);
        java.util.Arrays.fill(velocityX, 0.0f);
        java.util.Arrays.fill(velocityY, 0.0f);
        java.util.Arrays.fill(velocityZ, 0.0f);
    }}

    public boolean initialized(int index) {{
        check(index);
        return initialized[index];
    }}

    /**
     * Advances one fixed simulation step and returns true when the chain is
     * awake. Callers read the in-place result through x/y/z getters.
     */
    public boolean step(
        int index,
        float targetX, float targetY, float targetZ,
        float dt,
        float windX, float windY, float windZ
    ) {{
        check(index);
        if (!Float.isFinite(dt) || dt <= 0.0f) return initialized[index];
        if (!initialized[index]) reset(index, targetX, targetY, targetZ);

        float stiffness01 = GeneratedVariantMotionTable.STIFFNESS[index];
        float damping01 = GeneratedVariantMotionTable.DAMPING[index];
        float gravity01 = GeneratedVariantMotionTable.GRAVITY[index];
        float drag01 = GeneratedVariantMotionTable.DRAG[index];
        float wind01 = GeneratedVariantMotionTable.WIND[index];

        // Convert art-friendly normalized knobs into stable spring constants.
        float frequency = 1.0f + stiffness01 * 11.0f;
        float omega = TAU * frequency;
        float spring = omega * omega;
        float dampingRatio = 0.15f + damping01 * 1.60f;
        float damping = 2.0f * dampingRatio * omega;

        float dx = targetX - positionX[index];
        float dy = targetY - positionY[index];
        float dz = targetZ - positionZ[index];
        float ax = dx * spring - velocityX[index] * damping + windX * wind01 * 4.0f;
        float ay = dy * spring - velocityY[index] * damping + windY * wind01 * 4.0f - 9.81f * gravity01 * 0.35f;
        float az = dz * spring - velocityZ[index] * damping + windZ * wind01 * 4.0f;

        velocityX[index] += ax * dt;
        velocityY[index] += ay * dt;
        velocityZ[index] += az * dt;
        float dragFactor = Math.max(0.0f, 1.0f - drag01 * dt * 4.0f);
        velocityX[index] *= dragFactor;
        velocityY[index] *= dragFactor;
        velocityZ[index] *= dragFactor;
        positionX[index] += velocityX[index] * dt;
        positionY[index] += velocityY[index] * dt;
        positionZ[index] += velocityZ[index] * dt;

        float speed2 = velocityX[index] * velocityX[index]
            + velocityY[index] * velocityY[index]
            + velocityZ[index] * velocityZ[index];
        float epsilon = GeneratedVariantMotionTable.SLEEP_VELOCITY_EPSILON[index];
        if (speed2 <= epsilon * epsilon) {{
            quietFrames[index]++;
        }} else {{
            quietFrames[index] = 0;
        }}
        return quietFrames[index] < GeneratedVariantMotionTable.SLEEP_FRAMES[index];
    }}

    public float x(int index) {{ check(index); return positionX[index]; }}
    public float y(int index) {{ check(index); return positionY[index]; }}
    public float z(int index) {{ check(index); return positionZ[index]; }}

    public static int updateHzForDistance(int chain, float distanceBlocks) {{
        if (distanceBlocks <= GeneratedVariantMotionTable.LOD_NEAR[chain]) return GeneratedVariantMotionTable.HZ_NEAR[chain];
        if (distanceBlocks <= GeneratedVariantMotionTable.LOD_MEDIUM[chain]) return GeneratedVariantMotionTable.HZ_MEDIUM[chain];
        if (distanceBlocks <= GeneratedVariantMotionTable.LOD_FAR[chain]) return GeneratedVariantMotionTable.HZ_FAR[chain];
        return 0;
    }}
}}
"""


def binding_source(package: str) -> str:
    return f"""package {package};

/**
 * Renderer boundary for binding generated target names exactly once.
 * Implement this in the target model backend (native/GeckoLib/AzureLib/etc.).
 */
public interface VariantBoneBinding {{
    int resolve(String targetName);
    void sampleRestTarget(int handle, float[] xyzOut);
    void applySecondaryOffset(int handle, float x, float y, float z);
}}
"""


def generate(contract_path: Path, output: Path, package: str) -> dict[str, Any]:
    if not PACKAGE_RX.fullmatch(package):
        raise ValueError(f"invalid Java package: {package!r}")
    contract_path = contract_path.resolve()
    contract = load_contract(contract_path)
    variants, chains = flatten(contract)
    package_dir = output.resolve().joinpath(*package.split("."))
    package_dir.mkdir(parents=True, exist_ok=True)
    sources = {
        "GeneratedVariantMotionTable.java": generated_table(package, contract),
        "SecondaryMotionSolver.java": solver_source(package),
        "VariantBoneBinding.java": binding_source(package),
    }
    records = []
    for name, text in sources.items():
        path = package_dir / name
        path.write_text(text, encoding="utf-8")
        records.append({
            "name": name,
            "path": str(path),
            "sha256": sha256_file(path),
            "size": path.stat().st_size,
        })
    manifest = {
        "schema_version": 1,
        "state": "generated-runtime-unverified",
        "runtime_contract": str(contract_path),
        "runtime_contract_sha256": sha256_file(contract_path),
        "runtime_contract_identity": contract.get("runtime_contract_sha256"),
        "package": package,
        "variant_count": len(variants),
        "chain_count": len(chains),
        "sources": records,
        "steady_state_contract": {
            "json_or_io_in_step": False,
            "per_step_object_allocation": False,
            "bone_name_lookup_in_step": False,
            "network_secondary_motion_frames": False,
            "server_secondary_motion_tick": False,
        },
    }
    manifest_bytes = (json.dumps(manifest, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")
    manifest_path = output.resolve() / "runtime-codegen.json"
    manifest_path.write_bytes(manifest_bytes)
    return {**manifest, "manifest": str(manifest_path), "manifest_sha256": sha256_file(manifest_path)}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--runtime-contract", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--package", default="dev.enderloom.variant.runtime")
    args = ap.parse_args(argv)
    try:
        result = generate(args.runtime_contract, args.output, args.package)
        print(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False))
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
