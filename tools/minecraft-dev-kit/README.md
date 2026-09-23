# Minecraft Dev Kit Workbench

A persistent command-line front end to the **same Northpoint production engine used by Enderloom**. Build or convert real source projects, retain candidate JARs and complete command logs, resume exact-hash results, and package candidates with evidence.

## Start here

Install Python 3.13 and the JDK required by the chosen Minecraft target, then run from this directory:

```powershell
.\devkit.cmd doctor
.\devkit.cmd convert --project "C:\Mods\MyMod" --minecraft 26.3 --loader fabric --java 25 --java-path "C:\Java\jdk-25\bin\java.exe" --workspace "C:\DevKit-Runs\MyMod-26.3"
.\devkit.cmd status --workspace "C:\DevKit-Runs\MyMod-26.3"
.\devkit.cmd resume --workspace "C:\DevKit-Runs\MyMod-26.3"
.\devkit.cmd package --workspace "C:\DevKit-Runs\MyMod-26.3" --output "C:\DevKit-Releases\MyMod-candidate.zip"
```

On Linux/macOS use `sh devkit.sh` or `python3 scripts/devkit.py` with the same arguments and native paths. Source and workspace must be separate directory trees. Omit `--workspace` for a unique run beneath `~/.minecraft-dev-kit/runs/`. `--java-path` pins a real JDK; a JRE alone is insufficient.

Official setup: [Python](https://www.python.org/downloads/), [Temurin JDK](https://adoptium.net/temurin/releases/), [Git](https://git-scm.com/downloads). Enderloom's native app has a separate managed-JDK provisioning path; the standalone CLI currently uses an installed JDK.

## Commands

| Command | Actual behavior |
|---|---|
| `doctor` | Reports Python, Java, javac, Git, the production engine path and its hash. |
| `convert` | Inspects source, freezes a target manifest and invokes the canonical production worker without editing original source. |
| `status` | Reports state, attempts, failure reason and candidate paths; independently re-hashes saved JARs. |
| `resume` | Reuses unchanged intact candidates. Source/engine changes or corruption invalidate reuse. Previous work directories are archived, not deleted. |
| `package` | Creates a new ZIP containing candidate bytes, state, receipts, command evidence and SHA-256 manifests. Never silently overwrites an existing package. |

The inferred migration route implemented here is same-loader legacy Fabric/NeoForge to 26.3. Same-version conventional builds and explicit Northpoint overlays retain their existing support. Cross-loader transformations require an appropriate explicit adapter/overlay; selecting a target is not proof that arbitrary code can already be converted. Forge/Quilt choices preserve existing explicit configuration routes, not an automatic universal-port claim.

## Evidence survives the command

```text
manifest.json                       Source and exact target configuration
intake.json                         Read-only source intake
result.json                         Latest user-facing result
runs/<run-id>/                      Runner stdout, stderr and process receipt
state/session.json                  Persistent attempts, hashes and gate states
state/release/                      Candidate JARs and release matrix
state/work/<cell>/receipt.json       Production receipt
state/work/<cell>/evidence/commands/ Complete compiler/runtime command output
state/work/history/<cell>/<run-id>/ Previous attempts and their evidence
```

A process timeout is recorded as a timeout, not a successful build or proof that Minecraft itself hung. Only the owned process tree is targeted. OS-owned workspace locks prevent simultaneous writers and release automatically when their owner exits.

## Verification states

**`runtime-unverified` is a preserved build candidate, not playable-release certification.** A configured JVM fixture is not a Minecraft client. Converted mods still need the appropriate dedicated-server/client/integrated-server gates, actual Mixin application, asset/gameplay checks and restart proof. Enderloom's native verification route can promote an exact candidate through SHA-bound proof without rebuilding it.

Exit codes: `0` passes configured gates; `2` means the primary cell is blocked, failed or runtime-unverified; `3` means a secondary cell remains unresolved. `status` can exit successfully while reporting unresolved work. Read the actual state rather than treating every successful command as a finished conversion.

`package` permits intact `runtime-unverified` candidates and retains that label in `VERIFICATION.json`. It excludes account state, Gradle caches and private source trees. Review full logs before external sharing because build tools can print sensitive project-specific values.

## Regression commands

```text
python scripts/northpoint_execution_selftest.py
python scripts/devkit_workbench_selftest.py
python scripts/northpoint_production_driver_selftest.py
python scripts/northpoint_job_runner_selftest.py
python scripts/northpoint_runtime_proof_selftest.py
python scripts/northpoint_target_26_3_selftest.py
python scripts/port_26_3_selftest.py
```

The workbench test invokes actual javac, packages and inspects a JAR, runs its JVM entry point, proves zero-rebuild reuse, corrupts a candidate, introduces and recovers from a real compiler error, verifies package hashes, and proves pending runtime evidence stays pending. Its synthetic API fixture is explicitly **not** a native Minecraft test.

Workbench CI covers Linux and Windows and retains real frozen Aoba and LibrarianTradeFinder conversion JARs. The original eight Northpoint lanes remain intact. Existing converter rules, mod IDs, packet behavior, source/build metadata and content-parity requirements are preserved.
