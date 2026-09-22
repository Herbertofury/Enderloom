#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
PIPELINE = HERE / "port_26_3_pipeline.py"
GUARD = HERE / "port_guard.py"


def write(root: pathlib.Path, rel: str, text: str) -> None:
    path = root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def digest(root: pathlib.Path) -> str:
    h = hashlib.sha256()
    for path in sorted(p for p in root.rglob("*") if p.is_file()):
        h.update(path.relative_to(root).as_posix().encode())
        h.update(b"\0")
        h.update(path.read_bytes())
        h.update(b"\0")
    return h.hexdigest()


def run(*args: str, expect: int = 0) -> subprocess.CompletedProcess[str]:
    cp = subprocess.run(
        [sys.executable, *args],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=120,
    )
    if cp.returncode != expect:
        raise AssertionError(
            f"command failed: {args}\nexpected={expect} actual={cp.returncode}\nSTDOUT:\n{cp.stdout}\nSTDERR:\n{cp.stderr}"
        )
    return cp


with tempfile.TemporaryDirectory(prefix="northpoint-simple-port-") as td:
    root = pathlib.Path(td)
    source = root / "old-fabric"
    target = root / "mc263"

    write(source, "gradle.properties", "minecraft_version=1.20.1\nloader_version=0.15.11\n")
    write(
        source,
        "build.gradle",
        """plugins { id 'fabric-loom' version '1.6-SNAPSHOT' }
dependencies {
    minecraft 'com.mojang:minecraft:1.20.1'
}
""",
    )
    write(
        source,
        "src/main/resources/fabric.mod.json",
        json.dumps(
            {
                "schemaVersion": 1,
                "id": "simpleport",
                "version": "1.2.3",
                "name": "Simple Port",
                "environment": "*",
                "entrypoints": {"main": ["com.example.SimplePort"]},
                "depends": {
                    "fabricloader": ">=0.15.0",
                    "minecraft": "~1.20.1",
                    "java": ">=17",
                    "fabric": "*",
                },
            },
            indent=2,
        )
        + "\n",
    )
    write(
        source,
        "src/main/java/com/example/SimplePort.java",
        """package com.example;

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class SimplePort implements ModInitializer {
    private static final Logger LOG = LoggerFactory.getLogger("simpleport");
    @Override public void onInitialize() { LOG.info("simple port alive"); }
}
""",
    )
    write(
        source,
        "src/main/resources/assets/simpleport/lang/en_us.json",
        '{"item.simpleport.proof":"Proof"}\n',
    )

    before = digest(source)
    cp = run(
        str(PIPELINE),
        str(source),
        "--loader",
        "fabric",
        "--output",
        str(target),
        "--mod-id",
        "simpleport",
        "--mod-name",
        "Simple Port",
        "--group",
        "com.example",
        "--mod-version",
        "1.2.3",
        "--materialize-source",
    )
    result = json.loads(cp.stdout)
    assert result["status"] == "workspace-created", result
    assert result["materialized_source"] is True, result
    materialization = result["materialization"]
    assert materialization["unresolved_count"] == 0, materialization
    assert materialization["superseded_count"] >= 1, materialization
    assert "fabric-depends-old-fabric-id" in {
        row.get("id") for row in materialization["rewrites"] if isinstance(row, dict)
    }, materialization

    assert digest(source) == before, "source tree changed during conversion"
    target_build = (target / "build.gradle").read_text(encoding="utf-8")
    assert "net.fabricmc.fabric-loom" in target_build, target_build
    assert "com.mojang:minecraft:1.20.1" not in target_build, target_build
    assert (target / "src/main/java/com/example/SimplePort.java").is_file()
    assert (target / "src/main/resources/assets/simpleport/lang/en_us.json").is_file()

    manifest = json.loads((target / "src/main/resources/fabric.mod.json").read_text(encoding="utf-8"))
    assert manifest["id"] == "simpleport", manifest
    assert manifest["entrypoints"]["main"] == ["com.example.SimplePort"], manifest
    assert manifest["depends"]["minecraft"] == "~26.3", manifest
    assert manifest["depends"]["java"] == ">=25", manifest
    assert manifest["depends"]["fabricloader"] == ">=0.19.5", manifest
    assert "fabric" not in manifest["depends"], manifest
    assert manifest["depends"]["fabric-api"] == "*", manifest

    ledger = json.loads((target / "porting-ledger.json").read_text(encoding="utf-8"))
    rows = {row["id"]: row for row in ledger["items"]}
    assert rows["surface:java_sources"]["status"] == "carried", rows["surface:java_sources"]
    assert rows["surface:json_resources"]["status"] == "regenerated", rows["surface:json_resources"]
    assert rows["semantic:fabric-old-loom-remap-plugin"]["status"] == "regenerated", rows
    assert rows["semantic:fabric-depends-old-fabric-id"]["status"] == "regenerated", rows
    assert not [row for row in ledger["items"] if row.get("status") == "missing"], ledger["items"]

    guard = run(str(GUARD), str(target), "--loader", "fabric")
    guard_result = json.loads(guard.stdout)
    assert guard_result["status"] == "PASS", guard_result

print("Northpoint simple source materialization self-test: PASS")
