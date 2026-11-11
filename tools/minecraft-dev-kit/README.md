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

### 4. Compile lock-aware authoring recipes

VariantPlans deliberately describe **what** should change without inventing model coordinates. Bind those logical regions to the approved editable model, then compile a backend recipe:

```json
{
  "schema_version": 1,
  "subject_id": "bloom_and_boom:creeper_female",
  "model_file": "creeper-female.bbmodel",
  "region_targets": {
    "back_growths": ["back_growth_anchor"],
    "horn_decorations": ["horn_left_decor", "horn_right_decor"]
  },
  "motion_targets": {
    "vines": ["vine_left", "vine_right"]
  },
  "texture_targets": {
    "body_surface": ["creeper-female-base.png"]
  },
  "templates": {
    "geometry": {
      "icicle tips": {
        "regions": ["back_growths", "horn_decorations"],
        "operations": [
          {
            "op": "add_mesh_primitive",
            "shape": "cone",
            "diameter": 1.5,
            "height": 3,
            "sides": 4,
            "name": "vf_{biome_slug}_icicle_{index}",
            "parent": "{target}"
          }
        ]
      }
    },
    "motif": {}
  }
}
```

```powershell
.\devkit.cmd variant recipe --subject references\variant-foundry\bloom-boom-creeper-female-subject.json --plans "C:\DevKit-Runs\variant-plans.json" --bindings "C:\DevKit-Runs\authoring-bindings.json" --json-out "C:\DevKit-Runs\authoring-recipes.json"
```

Automatic geometry authoring is **additive-only**: the recipe compiler permits safe add operations, carries the SubjectDNA lock contract forward, and rejects destructive operations such as removing or rewriting protected nodes. Missing region targets or phenotype templates stay `unresolved-active`; Variant Foundry will not guess coordinates just to manufacture an output. Texture, secondary-motion/physics and runtime-effect actions are routed separately instead of being silently dropped when Blockbench is not their correct backend.

### 5. Compile the runtime phenotype contract

The same ready recipes compile into a deterministic target-runtime contract for persistent variant IDs, client-only secondary motion, visual effects, simulation LOD and sleeping:

```powershell
.\devkit.cmd variant runtime-contract --subject references\variant-foundry\bloom-boom-creeper-female-subject.json --recipes "C:\DevKit-Runs\authoring-recipes.json" --minecraft 26.3 --loader neoforge --backend enderloom-skeletal --json-out "C:\DevKit-Runs\variant-runtime.json"
```

The runtime contract expands every bound secondary-motion target into an explicit chain with validated stiffness/damping/gravity/drag/wind parameters, fixed-step limits, interpolation, teleport/model-swap reset, distance LOD and sleeping. It also carries the SubjectDNA persistence/server-authority contract: the server owns the variant ID and gameplay state while cosmetic motion remains client-side, so motion frames are not streamed over the network or simulated on the server tick.

This is intentionally marked `contract-compiled-runtime-unverified`: it is the exact artifact a target runtime adapter must execute, not a claim that Minecraft has already run it. Invalid or unbound required physics stays `unresolved-active` rather than being clamped, ignored or replaced with a cheaper fake.

### 6. Compile Minecraft-oriented pixel textures

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

### 7. Drive Blockbench live/headless authoring

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

Apply a ready recipe to a copy of the approved source model, validate geometry/animations, and capture six-view evidence:

```powershell
.\devkit.cmd variant execute-recipes --recipes "C:\DevKit-Runs\authoring-recipes.json" --source-model "C:\DevKit-Runs\creeper-female.bbmodel" --workspace "C:\DevKit-Runs\blockbench-authoring" --render require
```

Each variant gets its own durable model copy and hash-bound execution receipt. Writes use Blockbench's revision/expected-revision contract and one atomic `bbmodel_edit` batch, so another writer cannot be silently overwritten. `--render require` additionally requires the headless contact-sheet renderer; `auto` records render evidence when available without confusing render-environment failure with model validation. Exact successful outputs are reused before relaunching the backend, and the canonical `execution-evidence.json` stays byte-stable across cache reuse so an unchanged release does not acquire a new bundle ID merely because it was rerun.

The executor intentionally leaves texture, runtime-physics and runtime-effect routes visible in the receipt until their dedicated backends execute them; Blockbench success is never presented as proof those other routes are finished.

### 8. Run generation/texturing/rig providers with failover

Variant Foundry's provider plane is registry-driven instead of hardcoding one AI model. Each provider entry declares its capabilities, exact argv, local/remote execution metadata, minimum VRAM, model/weight identity and licensing/provenance fields. The scheduler never uses a shell, serializes heavy provider work through a workspace lock, preserves failed-attempt logs, and tries the next compatible challenger automatically.

```powershell
.\devkit.cmd variant provider --registry "C:\DevKit-Runs\providers.json" doctor --vram-budget-gb 24
.\devkit.cmd variant provider --registry "C:\DevKit-Runs\providers.json" run --capability shape --input "C:\DevKit-Runs\concept.png" --workspace "C:\DevKit-Runs\provider-jobs" --seed 77 --vram-budget-gb 24 --preferred local-primary
```

Provider commands use exact argv tokens and may reference `{input}`, `{output}`, `{seed}`, `{params_json}`, `{workspace}`, `{python}` and `{scripts}`. Release/publish lanes can add `--require-verified-rights`; any provider whose exact runtime model/weight rights have not been explicitly verified is rejected before generation. Optional `probe_command` entries are cheap health gates and may use only `{python}` / `{scripts}`; a provider whose adapter exists but whose real backend/import/config is unavailable is rejected **before** expensive work. Hash-valid successful jobs are reused before probing so a temporary backend outage never invalidates already-proven bytes.

A pinned starter registry is included at `references/variant-foundry/provider-registry.example.json`. It records the current tested OpenX Clay source commit `eb41696224cca3021b44b244fda1362e6d3a535e` and MyMeshy commit `1854487f1e6c918becc859850727bc83d9ad24cd`, with explicit health probes. Use `VARIANT_FOUNDRY_CLAY_CONFIG` for the Clay config and `MYMESHY_URL` for the MyMeshy backend. Code licensing does **not** automatically license runtime model weights: the exact selected model/weights remain a separate evidence/rights gate. The starter registry keeps `rights_verified: false` until the exact deployed model/weights have actually been reviewed; flip it only in the environment whose rights evidence you verified.

Incompatible, unhealthy or over-budget providers are recorded as rejected; timeouts/failures remain evidence and do not erase earlier attempts. Successful adapter stdout JSON is retained as `provider_runtime` so the actual backend/model metadata can travel into provenance. If every route fails, the receipt stays `unresolved-active` rather than pretending the provider capability does not exist.

### 9. Gate generated GLB assets before promotion

Every provider result ending in `.glb` now passes a dependency-free structural/spec-sanity gate before the scheduler can call the job successful. It verifies GLB v2 framing, chunk bounds, JSON/index references, embedded buffers/images by default, non-empty POSITION geometry, animation/skin references, and records mesh/vertex/triangle/material/texture/animation statistics. Malformed output becomes a failed provider attempt and the scheduler continues to the next challenger instead of poisoning the asset cache.

```powershell
.\devkit.cmd variant validate-glb --input "C:\DevKit-Runs\provider-jobs\output.glb" --receipt "C:\DevKit-Runs\provider-jobs\gltf-validation.json"
```

If the MIT-licensed glTF Transform CLI is installed, `--external auto` also runs its `validate` command; release lanes can use `--external require`. The current audited upstream reference is glTF Transform commit `a5d768b87efaae1fa65ddd17cd551a45b57abd70`, with Khronos glTF-Validator commit `434283be08a668a8fb4e437145630ddbf93b0686` tracked as the authoritative validator challenger/reference. Neither tool is silently downloaded during offline work.

Provider cache identity now includes the scheduler, GLB-gate implementation, and current external-validator fingerprint. A gate/tool upgrade therefore invalidates only provider results whose proof is no longer current, while an already hash-valid result still survives a temporary provider/backend outage.

### 10. Compile an immutable ModelBundle

Package approved editable/runtime assets behind exact hashes:

```powershell
.\devkit.cmd variant bundle --subject references\variant-foundry\bloom-boom-creeper-female-subject.json --plans "C:\DevKit-Runs\variant-plans.json" --biome-dna "C:\DevKit-Runs\biome-dna.json" --asset editable-model="C:\DevKit-Runs\creeper.bbmodel" --asset texture="C:\DevKit-Runs\creeper-female-snow.png" --minecraft 26.3 --loader neoforge --backend enderloom-skeletal --output "C:\DevKit-Runs\model-bundle"
```

Identical bytes are deduplicated into content-addressed objects. Exact rebuilds reuse the bundle; changing an input changes the bundle ID, and an existing immutable release directory is never silently mutated. `--evidence ROLE=PATH` stores provenance/proof in a separate immutable evidence lane, so provider receipts and logs travel with the release without being confused for runtime model assets.

### 11. Run the durable end-to-end pipeline

For repeatable production work, put the same inputs into one manifest and let Variant Foundry reuse only stages whose exact inputs **and implementation bytes** are unchanged:

```json
{
  "schema_version": 1,
  "sources": ["C:/Minecraft/Instances/BloomBoomDev"],
  "runtime_registry_dump": "C:/DevKit-Runs/variant-foundry-registry.json",
  "subject": "references/variant-foundry/bloom-boom-creeper-female-subject.json",
  "authoring_bindings": "C:/DevKit-Runs/authoring-bindings.json",
  "authoring_execution": {
    "source_model": "C:/DevKit-Runs/creeper-female.bbmodel",
    "render": "require",
    "timeout": 90
  },
  "biomes": ["minecraft:snowy_plains", "minecraft:swamp"],
  "mode": "full-phenotype",
  "seed": 77,
  "provider_registry": "references/variant-foundry/provider-registry.example.json",
  "provider_jobs": [
    {
      "name": "creeper-shape",
      "capability": "shape",
      "input": "C:/DevKit-Runs/concept.png",
      "role": "generated-model",
      "params": {"mode": "image"},
      "preferred": ["mymeshy-shape"],
      "require_verified_rights": true,
      "vram_budget_gb": 24,
      "output_extension": ".glb"
    }
  ],
  "textures": [
    {
      "name": "creeper-working",
      "role": "texture",
      "input": "C:/DevKit-Runs/working-texture.png",
      "profile": "C:/DevKit-Runs/bloom-boom-style.json"
    }
  ],
  "assets": [
    {"role": "editable-model", "path": "C:/DevKit-Runs/creeper.bbmodel"}
  ],
  "target": {
    "minecraft": "26.3",
    "loader": "neoforge",
    "backend": "enderloom-skeletal"
  }
}
```

```powershell
.\devkit.cmd variant pipeline --manifest "C:\DevKit-Runs\variant-foundry.json" --workspace "C:\DevKit-Runs\variant-foundry-work"
```

The pipeline content-addresses **discovery -> BiomeDNA -> VariantPlan -> authoring recipe -> runtime phenotype contract -> Blockbench execution/visual proof -> provider generation/failover -> texture compile -> ModelBundle**. The runtime contract is packaged as a real bundle asset; the pipeline result remains explicitly `artifacts-built-runtime-unverified` until a target Minecraft runtime adapter executes and proves it. Provider jobs are first-class manifest stages: their health/rights/provenance/GLB-gate receipts are preserved, successful exact jobs are reused, and changing only a concept/provider input invalidates that provider asset plus the final bundle without redoing unrelated biome or texture work. Provider job receipts, every attempted provider's stdout/stderr, and GLB-validation receipts are packaged into the ModelBundle evidence lane, preserving failover history and promotion proof alongside the immutable asset. Re-running unchanged input reuses verified stage receipts instead of recomputing them. Changing only a texture style invalidates that texture and the final bundle while preserving unchanged discovery/profile/plan work. A failure leaves `pipeline-state.json` with the exact failed stage plus completed-stage receipts, so recovery resumes from durable evidence instead of restarting the asset.

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
