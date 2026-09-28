# Minecraft Dev Kit v8

A durable workbench for building, converting, recovering, testing and packaging Minecraft mod projects through Enderloom's existing Northpoint engine.

## Start here

**Windows:** extract the complete package and double-click `devkit.cmd`. The guided menu selects a source project, detects its metadata, chooses a target, provisions its JDK, and retains the result in a separate workspace. When Python is missing, the launcher downloads a checksum-pinned private Python runtime from python.org. It does not require administrator access, install globally or modify your system PATH.

**Linux/macOS:** use `sh devkit.sh` with Python 3.12 or newer installed. The same menu and managed JDK setup are available. Use `sh devkit.sh doctor` for a noninteractive prerequisite check.

Already use a terminal? The minimal Windows conversion command is:

```powershell
.\devkit.cmd convert --project "C:\Mods\MyMod" --minecraft 26.3 --loader fabric --workspace "C:\DevKit-Runs\MyMod-26.3" --verify
```

`--java` and `--java-path` are optional. The kit selects the required Java major, reuses an appropriate installed JDK or provisions a private verified Temurin JDK. An explicitly supplied JDK must actually contain matching `java` and `javac` binaries.

## Reusable Stonecutter multiversion output

A successful **conversion** is no longer treated as a disposable one-version folder. The production conversion automatically exports a reusable shared-source project and `multiversion-project.zip` in that run's evidence. It runs the actual Stonecutter Gradle plugin (pinned to 0.9.8) for version preprocessing; Enderloom does not fake Stonecutter with regex-only source copies.

The workspace keeps shared `src/` code once, factors genuine version differences behind Stonecutter conditions where that is safe, keeps non-mergeable source/resource differences under `overrides/<minecraft-loader>/`, and preserves each target's full native Gradle/build/dependency/mapping/access-rule setup under `targets/<minecraft-loader>/build/`. This prevents a later port from starting over or forcing one loader/version's dependency graph onto another.

From an extracted multiversion project:

```powershell
.\build-all.cmd
.\.devkit\worker\devkit.cmd matrix-build --workspace . --target 26.3-fabric --verify
.\.devkit\worker\devkit.cmd matrix-add --workspace . --project "C:\Ports\MyMod-Next" --minecraft <version> --loader fabric
```

On Linux/macOS use `sh build-all.sh` and `sh .devkit/worker/devkit.sh ...`. `matrix-build` runs real Stonecutter generation before the preserved native build for every requested target. `matrix-add` first materializes the existing targets through Stonecutter, then factors the new completed native port into the same shared project, retaining previous candidate/proof state so unchanged targets do not rebuild. A backup is kept before the workspace swap.

Adding a target does **not** pretend arbitrary future Minecraft APIs are already compatible: semantic/API migrations still go through the normal converter and strongest applicable runtime QA. Stonecutter then makes the successfully ported variants maintainable together afterward.

## Everyday commands

```powershell
.\devkit.cmd doctor
.\devkit.cmd setup --minecraft 26.3
.\devkit.cmd status --workspace "C:\DevKit-Runs\MyMod-26.3"
.\devkit.cmd resume --workspace "C:\DevKit-Runs\MyMod-26.3"
.\devkit.cmd package --workspace "C:\DevKit-Runs\MyMod-26.3" --output "C:\DevKit-Releases\MyMod-candidate.zip"
```

Do not run `convert` over a nonempty workspace: use `resume`. Exact unchanged candidate hashes are reused; changed source, missing files or corruption invalidates reuse. Previous attempts and compiler failures remain inspectable.

## Real native verification

For an already built Fabric 26.3 candidate:

```powershell
.\devkit.cmd verify --jar "C:\Mods\MyMod.jar" --workspace "C:\DevKit-Runs\MyMod-native"
```

The native route fetches and records the exact official Fabric template revision, closes required mod dependencies, builds an independent test probe, and starts the **packaged candidate in production Minecraft**. It checks the loaded candidate's SHA-256 from inside Fabric, creates an integrated world, synchronizes a server-owned block to the client, captures the real rendered world, saves/closes it, reopens it, and checks persistence on both sides. Fresh logs, screenshots, dependency locks and proof are retained.

The same real runtime probe now also writes `variant-foundry-registry.json` from the loaded server registry, covering biome, dimension and dimension-type IDs. That hash-bound file is retained in native evidence/packages and can be passed directly to `variant discover-biomes --runtime-registry-dump`, closing the gap for private or code-registered biomes that static JAR/datapack inspection cannot characterize by existence alone.

This automated native probe currently targets **Fabric 26.3**. Other versions and loaders retain their existing build and runtime-adapter routes; selecting them is not a promise that this particular probe supports them. A native world smoke test is not exhaustive mod gameplay, multiplayer or hardware-GPU performance certification.

The first native run needs network access for the official template, Gradle, game libraries/assets and required mods. On headless Linux it also needs Xvfb, Mesa/OpenGL, OpenAL and the narrator's native libraries. The repository's native CI workflow provisions these prerequisites. On a normal Windows desktop it uses the available graphics driver. This test fixture is not a substitute for a normal licensed gameplay account or launcher.

## Required dependencies without source surgery

```powershell
.\devkit.cmd dependencies --jar "C:\Mods\MyMod.jar" --minecraft 26.3 --loader-version 0.19.5 --output "C:\DevKit-Runs\MyMod-dependencies"
```

The resolver reads nested Fabric JARs, evaluates required version predicates using Fabric's semantics, queries exact target-compatible Modrinth releases, verifies provider SHA-512/SHA-256, and resolves transitive requirements. Provider hash metadata can expose an old bundled library whose broad metadata incorrectly suggests newer compatibility. Compatible external versions are installed in a separate managed directory; original mod and embedded JAR bytes are not edited or deleted.

Use every dependency listed in the resulting lock when installing the candidate. Optional recommendations are reported, not silently installed. A missing provider identity, incompatible explicit top-level mod, unsupported constraint or unresolved dependency remains a visible failure. Supply `--projects mapping.json` with exact mod-ID-to-Modrinth-project-ID mappings when provider names differ. `--audit-only` reads metadata without downloading. This is a Fabric resolver, not an unverified Forge/NeoForge metadata translator.

## Variant Foundry workflow

Variant Foundry is now an executable Dev Kit lane rather than specification-only.

### 1. Discover biomes and dimensions

Scan a source tree, datapack, JAR/ZIP, mods directory, or installed instance without executing mod code:

```powershell
.\devkit.cmd variant discover-biomes "C:\Minecraft\Instances\BloomBoomDev" --json-out "C:\DevKit-Runs\biomes.json"
```

When a native test run provides a registry dump, merge it so code-registered/private content with no static biome JSON is still retained:

```powershell
.\devkit.cmd variant discover-biomes "C:\Minecraft\Instances\BloomBoomDev" --runtime-registry-dump "C:\DevKit-Runs\registry.json" --json-out "C:\DevKit-Runs\biomes.json"
```

The discovery result is deterministic and evidence-bound. Static biome/dimension JSON records climate/effect fields, tags and recursively resolved worldgen evidence; high-confidence source registrations are merged when source is available; runtime-only identities remain explicit `registry-only` profiles instead of being rejected or filled with invented facts.

### 2. Build BiomeDNA

Turn discovery evidence into explicit art-direction profiles:

```powershell
.\devkit.cmd variant profile --discovery "C:\DevKit-Runs\biomes.json" --json-out "C:\DevKit-Runs\biome-dna.json"
```

Use `--biome namespace:id` for one profile or `--overrides custom-biome-overrides.json` to apply curated/user-authored art direction as the highest-priority layer.

### 3. Create deterministic lock-aware VariantPlans

Use a canonical SubjectDNA file such as the included Bloom & Boom presets:

```powershell
.\devkit.cmd variant plan --subject references\variant-foundry\bloom-boom-creeper-female-subject.json --biome-dna "C:\DevKit-Runs\biome-dna.json" --mode full-phenotype --seed 77 --json-out "C:\DevKit-Runs\variant-plans.json"
```

Face, horns, body silhouette, gameplay-state timing and other identity locks travel with every plan. Low-characterization biomes are marked for stronger review rather than silently receiving made-up properties.

### 4. Compile Minecraft-oriented pixel textures

A generated high-resolution PNG is working material, not automatically finished Minecraft art. Compile it through a `TextureStyleProfile`:

```powershell
.\devkit.cmd variant texture --input "C:\DevKit-Runs\working-texture.png" --profile "C:\DevKit-Runs\bloom-boom-style.json" --output "C:\DevKit-Runs\creeper-female-snow.png"
```

The current deterministic compiler supports common 8-bit non-interlaced PNGs, nearest-neighbor resizing, explicit palette quantization, optional 4x4 ordered dithering, alpha thresholding, and transparent-edge RGB dilation to reduce dark filtering/mipmap fringes. It writes a hash-bound receipt beside the texture by default.

Minimal style profile:

```json
{
  "schema_version": 1,
  "name": "bloom-boom-faithful-32",
  "target_size": [32, 32],
  "palette": ["#1E5A32", "#3D8C4B", "#75B85B", "#E8EDF4", "#A9C9E8"],
  "dither": "ordered4",
  "alpha_threshold": 128,
  "transparent_edge_dilation": 2
}
```

### 5. Drive Blockbench live/headless authoring

The default headless backend is pinned to Jason Gardner's Blockbench MCP commit `6295e20af26ec0f67bc81a5e95dac98db85a1801`. Enderloom discovers the tool surface over MCP before trusting it:

```powershell
.\devkit.cmd variant blockbench --root "C:\DevKit-Runs\models" doctor --receipt "C:\DevKit-Runs\blockbench-capabilities.json"
```

List exact tool schemas or call a safe `bbmodel_*` operation with JSON arguments:

```powershell
.\devkit.cmd variant blockbench --root "C:\DevKit-Runs\models" tools --json-out "C:\DevKit-Runs\blockbench-tools.json"
.\devkit.cmd variant blockbench --root "C:\DevKit-Runs\models" call --tool bbmodel_validate --args-json "C:\DevKit-Runs\validate-args.json" --receipt "C:\DevKit-Runs\validate-receipt.json"
```

The adapter does not expose arbitrary `execute_script`. Use `--server-command-json` with an exact argv array for a local/offline compatible headless server. The pinned default stays outside Enderloom as a process/MCP boundary, which preserves its license boundary while still giving Variant Foundry atomic `.bbmodel` edits, validation, rendering, pose sampling and contact sheets.

### 6. Compile an immutable ModelBundle

Package approved editable/runtime assets behind exact hashes:

```powershell
.\devkit.cmd variant bundle --subject references\variant-foundry\bloom-boom-creeper-female-subject.json --plans "C:\DevKit-Runs\variant-plans.json" --biome-dna "C:\DevKit-Runs\biome-dna.json" --asset editable-model="C:\DevKit-Runs\creeper.bbmodel" --asset texture="C:\DevKit-Runs\creeper-female-snow.png" --minecraft 26.3 --loader neoforge --backend enderloom-skeletal --output "C:\DevKit-Runs\model-bundle"
```

Identical bytes are deduplicated into content-addressed objects. Exact rebuilds reuse the bundle; changing an input changes the bundle ID, and an existing immutable release directory is never silently mutated.

### Capability contract

```powershell
.\devkit.cmd variant capability-gate
```

The gate currently validates **38 mandatory Variant Foundry capability contracts**. It proves that the complete design/acceptance surface is still represented; it deliberately does **not** claim all 38 capabilities are implemented or native-runtime proven.

## Offline, integrity and recovery

`setup --offline` reuses a previously verified installed/private JDK without network access. `dependencies --offline` uses verified lockfile bytes. Native `--offline` additionally requires a cached `--template` and already populated Gradle/game caches. `convert --offline` prevents JDK provisioning; source-owned build tools may still perform their normal dependency resolution.

Private JDKs live under `~/.minecraft-dev-kit/cache` (override `DEVKIT_CACHE`). Private Windows Python lives under `%LOCALAPPDATA%\MinecraftDevKit` (override `DEVKIT_BOOTSTRAP_CACHE`). Set `DEVKIT_OFFLINE=1` to prevent the Windows bootstrap from downloading Python. No broad Java-process termination, global package installation or background watchdog is installed.

Candidate/evidence ZIPs are created exclusively rather than overwritten. Packaging re-hashes candidate and runtime dependency bytes. `VERIFICATION.json` distinguishes build-only `runtime-unverified`, separately scoped `native_runtime`, failed and stale proof states. Full command logs can contain project-specific text emitted by your own build tools; review them before sharing publicly.

## Tests and source

The canonical worker is `tools/minecraft-dev-kit` in [Enderloom](https://github.com/Herbertofury/Enderloom). In the complete skill bundle, `worker/` isolates this import graph from the preserved model, animation, server-asset, mapping, caching and older runtime tools in `scripts/` and `references/`.

Run `python scripts/devkit_qol_selftest.py` and `python scripts/devkit_workbench_selftest.py` from the repository kit, or replace `scripts/` with `worker/scripts/` in the skill bundle. The workbench fixture uses a real compiler/JVM but explicitly does **not** count as Minecraft. `devkit_setup_selftest.py` performs real provider downloads; the native CI executes real Minecraft independently.
