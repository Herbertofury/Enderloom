#!/usr/bin/env python3
from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
PIPELINE = HERE / "port_26_3_pipeline.py"
GUARD = HERE / "port_guard.py"
PUBLIC_SMOKE = HERE / "northpoint_public_mod_smoke.py"


def write(root: pathlib.Path, rel: str, text: str) -> None:
    path = root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def run(cmd: list[str], *, cwd: pathlib.Path | None = None, timeout: int = 900) -> subprocess.CompletedProcess[str]:
    cp = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
    )
    if cp.returncode:
        raise AssertionError(
            f"command failed ({cp.returncode}): {cmd}\nSTDOUT:\n{cp.stdout}\nSTDERR:\n{cp.stderr}"
        )
    return cp


def make_old_mod(source: pathlib.Path) -> None:
    write(source, "gradle.properties", "minecraft_version=1.20.1\nloader_version=0.15.11\n")
    write(
        source,
        "build.gradle",
        """plugins { id 'fabric-loom' version '1.6-SNAPSHOT' }
repositories { mavenCentral() }
dependencies { minecraft 'com.mojang:minecraft:1.20.1' }
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


def main() -> int:
    gradle = shutil.which("gradle")
    if not gradle:
        raise SystemExit("Gradle is required for the simple conversion production smoke")

    with tempfile.TemporaryDirectory(prefix="northpoint-simple-conversion-") as td:
        root = pathlib.Path(td)
        source = root / "source-1.20.1"
        target = root / "converted-26.3"
        make_old_mod(source)

        pipeline = run(
            [
                sys.executable,
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
            ],
            timeout=180,
        )
        conversion = json.loads(pipeline.stdout)
        assert conversion["materialization"]["unresolved_count"] == 0, conversion

        guard = run([sys.executable, str(GUARD), str(target), "--loader", "fabric"], timeout=180)
        guard_receipt = json.loads(guard.stdout)
        assert guard_receipt["status"] == "PASS", guard_receipt

        run(
            [gradle, "wrapper", "--gradle-version", "9.6.0", "--distribution-type", "bin", "--no-daemon"],
            cwd=target,
            timeout=300,
        )
        wrapper = target / ("gradlew.bat" if sys.platform.startswith("win") else "gradlew")
        assert wrapper.is_file(), wrapper
        if not sys.platform.startswith("win"):
            wrapper.chmod(wrapper.stat().st_mode | 0o111)

        smoke = run(
            [
                sys.executable,
                str(PUBLIC_SMOKE),
                "--project",
                str(target),
                "--minecraft",
                "26.3",
                "--loader",
                "fabric",
                "--java",
                "25",
                "--timeout",
                "600",
            ],
            timeout=720,
        )
        assert "Northpoint public mod production smoke: PASS" in smoke.stdout, smoke.stdout
        print(
            json.dumps(
                {
                    "status": "PASS",
                    "source_minecraft": "1.20.1",
                    "target_minecraft": "26.3",
                    "loader": "fabric",
                    "guard": guard_receipt["status"],
                    "production_smoke": "PASS",
                    "materialized_files": conversion["materialization"]["copied_count"],
                    "safe_rewrites": conversion["materialization"]["rewrite_count"],
                },
                indent=2,
            )
        )
    print("Northpoint simple old-source conversion smoke: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
