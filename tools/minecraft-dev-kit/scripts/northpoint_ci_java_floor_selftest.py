#!/usr/bin/env python3
"""Regression guard for the maintained Fabric 1.21 smoke Gradle/JVM split."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github" / "workflows" / "northpoint-ci.yml"


def main() -> int:
    text = WORKFLOW.read_text(encoding="utf-8")
    setup = re.search(
        r"- uses: actions/setup-java@v5\s+with:\s+distribution: temurin\s+java-version: "(\d+)"",
        text,
        re.S,
    )
    if not setup:
        raise SystemExit("northpoint-ci.yml has no primary Temurin setup-java block")
    runtime = int(setup.group(1))
    if runtime < 25:
        raise SystemExit(f"Northpoint CI Gradle runtime regressed below Java 25: {runtime}")

    smoke = re.search(
        r"- name: Official Fabric example mod production smoke\s+run: >-\s+"
        r"python tools/minecraft-dev-kit/scripts/northpoint_public_mod_smoke.py\s+"
        r"--project .*?\s+--minecraft 1\.21\s+--loader fabric\s+--java (\d+)",
        text,
        re.S,
    )
    if not smoke:
        raise SystemExit("maintained Fabric 1.21 production smoke block is missing")
    target = int(smoke.group(1))
    if target != 21:
        raise SystemExit(f"Fabric 1.21 target contract changed unexpectedly: Java {target}")

    if "Switch to Java 25 for Minecraft 26.3 public graduation" in text:
        raise SystemExit("stale redundant Java 25 switch returned; CI should already run on Java 25")

    print(f"Northpoint CI Java floor regression: PASS (Gradle runtime Java {runtime}, Fabric 1.21 target Java {target})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
