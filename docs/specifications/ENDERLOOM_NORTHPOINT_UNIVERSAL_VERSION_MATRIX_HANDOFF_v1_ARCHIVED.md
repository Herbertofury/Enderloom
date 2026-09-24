# ENDERLOOM NORTHPOINT — UNIVERSAL VERSION MATRIX
## Implementation Handoff — Do This Now

**Project:** Enderloom  
**Goal name:** Northpoint  
**Purpose:** Every mod Enderloom creates or converts must be able to become a proper multi-version / multi-loader project without forcing the user to repeat the same conversion work manually.

This is **not** a roadmap. Do not stop after architecture notes, mock UI, config files, or one successful target build. Implement the complete working flow below, test it end-to-end, and leave Enderloom able to use it immediately.

---

# 1. NORTHPOINT CONTRACT — NON-NEGOTIABLE BEHAVIOR

Implement this exact user flow:

1. User starts **Create Mod** or **Convert Mod**.
2. User chooses the primary target first, for example:
   - Minecraft `26.3`
   - NeoForge
3. Enderloom finishes and verifies that **primary target first**.
4. Only after the primary target succeeds, Enderloom handles the version matrix according to the stored mode:
   - **Ask me after the target succeeds** — default.
   - **Target only** — never fan out automatically.
   - **All supported versions for this project** — fan out automatically for this project only.
   - **Always build all supported versions** — global preference for future projects too.
5. When mode is `ask`, show one compact post-target prompt:
   - `Keep target only`
   - `Build all supported versions`
   - `Always do this for this project`
   - `Always do this for every project`
6. Remember the choice at the correct scope. Do **not** ask again when a remembered setting already answers the question.
7. "All versions" means **every valid cell in Enderloom's supported version/loader matrix**, not blindly attempting impossible combinations.
8. If a cell cannot be built because an API/dependency/loader does not exist, mark it **Blocked** with the exact reason. Never silently remove features just to make that cell compile.
9. Preserve the mod's intended content and behavior across every supported cell. Version differences must be implemented through adapters/overlays, not by deleting functionality.
10. Produce one clean matrix report showing exactly what built, what failed, what was blocked, artifact paths, hashes, and retry actions.

**Primary target success is the fan-out gate.** Do not waste time building twenty variants while the requested target is still broken.

---

# 2. BUILD A REAL STONECUTTER-LIKE MATRIX, BUT MAKE IT ENDERLOOM-NATIVE

Do not create a pile of copied repositories per Minecraft version.

Use one canonical project with shared code plus narrow version/loader differences.

Recommended generated mod-project shape:

```text
project/
  common/                         # loader/version-neutral mod logic and assets
  loaders/
    fabric/                       # Fabric-only adapters/bootstrap
    neoforge/                     # NeoForge-only adapters/bootstrap
    forge/                        # only when the matrix declares Forge valid
  versions/
    1.20.1/                       # version-specific API/data differences only
    1.21.1/
    26.3/
  cells/                          # only for truly unique mc+loader exceptions
    1.20.1-forge/
    26.3-neoforge/
  .enderloom/
    matrix.json                   # project matrix + overrides + support states
    matrix-lock.json              # resolved toolchains/dependency versions
    matrix-state.json             # last build/test state, hashes, failed cells
  build-matrix/                   # generated workspaces; disposable; gitignored
  dist/                           # final verified artifacts only
```

The exact folder names may be adjusted to fit the existing generator, but preserve the model:

`common -> loader overlay -> MC-version overlay -> rare exact-cell overlay -> generated build workspace`

Rules:

- Shared source remains authoritative.
- Generated workspaces are disposable and reproducible.
- Never hand-fork an entire mod just because one API changed.
- Keep version-specific conditionals out of common code when an adapter can isolate them.
- Keep loader-specific bootstrap/events/registry/network code in loader adapters.
- Use exact-cell patches only when both loader **and** MC version truly require it.
- Assets/data that are unchanged stay shared.
- Version-specific datapack/resource-format changes may have their own overlays.
- A matrix cell must have one deterministic resolved input set and one deterministic artifact destination.

Do **not** require Stonecutter itself if it becomes a limitation for NeoForge/Fabric/Forge combinations. Match the useful Stonecutter behavior with Enderloom's own planner if that gives broader loader support.

---

# 3. CENTRAL VERSION MATRIX — ONE SOURCE OF TRUTH

Create one data-driven support registry. Do not hard-code version buttons throughout the UI.

Each matrix cell needs at minimum:

```text
minecraftVersion
loader
supportState = stable | experimental | blocked | unsupported
javaVersion
gradleVersion
loaderVersion
mappingStrategy
apiDependencies
requiredAdapters
runtimeTestLane
blockedReason
```

Requirements:

- Support registry is updateable without rewriting the UI.
- The primary target is always inserted even if it is newer than the cached matrix; resolve it first from current loader metadata when possible.
- Matrix planner computes valid cells from:
  - Minecraft version availability
  - loader availability
  - required Java/toolchain
  - mod dependency availability
  - source feature requirements
  - user includes/excludes
- Never label a cell supported until its loader/toolchain/dependencies can actually resolve.
- Keep `experimental` distinct from `stable`.
- Keep `blocked` distinct from `failed`:
  - **blocked** = known impossible/missing prerequisite before build.
  - **failed** = valid cell attempted and did not pass its gates.
- Every blocked cell gets an actionable reason such as:
  - `Dependency X has no Fabric build for 1.20.1`
  - `Mod requires vanilla registry introduced after this target`
  - `NeoForge not available for this Minecraft version`

Add the current 26.3 lane to this same registry; do not special-case 26.3 elsewhere.

---

# 4. CREATE / CONVERT FLOW — TARGET FIRST, THEN MATRIX

Refactor both workflows to use the same matrix engine.

## New mod

- Generate the requested primary cell.
- Build it.
- Run target-appropriate static/runtime verification.
- Only after green target proof, apply the user's matrix mode.
- Fan shared code/assets into additional supported cells.
- Generate only the adapters actually needed by each cell.

## Existing mod conversion

Perform one source inventory first and reuse it for all cells:

- mod ID / metadata
- current Minecraft version(s)
- current loader(s)
- Java level
- registries/content IDs
- mixins
- access transformers / access wideners
- configs
- networking
- saved state / capabilities/components/attachments
- entities / blocks / items / menus / screens
- recipes / loot / tags / advancements
- worldgen / dimensions / structures
- models / textures / animations / sounds / particles
- datagen
- dependencies / integrations
- client-only vs server/common surfaces

Then:

- Convert the requested primary target first.
- Treat that working target as the behavioral reference for matrix fan-out.
- Reuse the inventory instead of rescanning the original mod for every cell.
- Preserve every intended content surface across supported cells.
- If an old/new vanilla feature is missing, create an explicit compatibility adapter/fallback or mark the cell blocked. Do not silently omit the feature.

---

# 5. SETTINGS / QOL — MAKE THIS FEEL OBVIOUS, NOT TECHNICAL

Add a simple preference named something like **Version Matrix Behavior**.

Values:

```text
ask
target-only
all-supported-project
all-supported-global
```

Behavior precedence:

```text
explicit current-run choice
> project preference
> global preference
> default = ask
```

Required QOL:

- Project setting can override global setting.
- User can reset project behavior back to global/default.
- User can change the setting before starting a job.
- Post-target prompt includes a clear estimate/count, e.g. `Build 7 additional supported targets`.
- Show exact versions/loaders before starting fan-out; allow quick uncheck/exclude.
- Remember exclusions per project only when the user chooses to remember them.
- Headless/CLI/automation mode must never hang waiting for a prompt:
  - use explicit CLI mode if supplied;
  - otherwise project setting;
  - otherwise global setting;
  - otherwise target-only for noninteractive execution.
- Add one-click actions:
  - `Build all supported`
  - `Build failed only`
  - `Build selected`
  - `Open artifacts`
  - `Copy matrix report`
- Let the user stop remaining secondary cells without invalidating the already-verified primary artifact.

Suggested CLI/API semantics:

```text
--target-mc 26.3
--target-loader neoforge
--matrix ask|target-only|all
--remember none|project|global
--versions 1.20.1,1.21.1,26.3
--loaders forge,neoforge,fabric
--exclude 1.20.1-fabric
--retry-failed
```

Names can match existing Enderloom conventions; behavior must exist.

---

# 6. BUILD ORCHESTRATOR — FAST, RESUMABLE, NO REDOING GOOD WORK

The primary target is serialized first. After it passes, secondary matrix cells may run in parallel within sane CPU/RAM limits.

Implement:

- Content-addressed cell fingerprint from:
  - shared source hash
  - relevant loader overlay hash
  - relevant version overlay hash
  - exact-cell overlay hash
  - resolved dependency/toolchain lock
  - build configuration
- Skip rebuilding a green cell when its fingerprint is unchanged.
- Rebuild only cells invalidated by changed inputs.
- Cache downloaded Gradle/loader/mapping/dependency artifacts across cells.
- Never redownload identical toolchains for every target.
- Persist each cell state immediately after success/failure so interrupted matrix runs resume instead of restarting.
- `Retry failed` must operate only on failed/invalidated cells.
- Do not let one broken secondary cell delete or overwrite successful artifacts.
- Never overwrite a known-good artifact until the replacement cell passes verification.
- Give every build cell an isolated work directory and log file.
- Use bounded parallelism; do not launch more Gradle clients than the machine can sustain.
- Cancel should terminate only matrix processes owned by that job.

State per cell:

```text
pending
blocked
building
built
testing
passed
failed
cancelled
stale
```

---

# 7. DEPENDENCY + API ADAPTATION — NO SILENT CONTENT LOSS

When fan-out reaches another version/loader:

1. Resolve required dependencies for that exact cell.
2. If the same dependency exists, pin the compatible version.
3. If the dependency changed artifact/module names, map it explicitly.
4. If an equivalent loader-native API exists, use an adapter.
5. If no equivalent exists:
   - implement an internal compatibility layer when realistic; or
   - mark the cell blocked with exact reason.
6. Never comment out/remove features merely to get a green compile.

Maintain adapters for common break families:

- registry/bootstrap changes
- loader event buses / callbacks
- networking payload APIs
- config APIs
- capability/component/attachment systems
- rendering hooks
- key/input APIs
- item/block/entity registration
- tags/datapack paths and pack formats
- worldgen / biome modification APIs
- data generation
- mixin target/name changes
- mappings/namespaces
- Java language/runtime level
- metadata files (`fabric.mod.json`, `mods.toml`, `neoforge.mods.toml`, etc.)

If migration logic becomes reusable, add it to Enderloom's shared adapter catalog. Do not solve the same API break from scratch for every project.

---

# 8. UI — ONE MATRIX, EASY TO READ

Add a compact matrix view after target selection and on the final result screen.

Rows = Minecraft versions.  
Columns = loaders.

Each cell must visibly show one of:

```text
✓ Passed
• Ready
↻ Building
! Failed
× Blocked
— Unsupported
E Experimental
```

Cell details on click/hover:

- exact Minecraft version
- loader + loader version
- Java version
- build status
- dependency state
- last artifact
- last test result
- blocked/failure reason
- `Build` / `Retry` / `Open log`

Do not build a giant wizard. Keep the create/convert flow simple:

`Choose target -> Build target -> optional matrix fan-out -> Results`

The matrix is a power feature underneath a basic workflow, not a reason to add twenty setup pages.

Enderloom already has a React/TypeScript launcher UI and central store. Keep the UI state there; do not execute Gradle or manipulate project files directly from renderer components. Route privileged build/filesystem/process work through the existing main/native service boundary.

---

# 9. ARTIFACT CONTRACT

Use deterministic output naming.

Example:

```text
dist/<mod-version>/
  mc-26.3/neoforge/<modid>-<mod-version>+mc26.3-neoforge.jar
  mc-26.3/fabric/<modid>-<mod-version>+mc26.3-fabric.jar
  mc-1.21.1/neoforge/<modid>-<mod-version>+mc1.21.1-neoforge.jar
  release-matrix.json
  SHA256SUMS.txt
```

`release-matrix.json` must include per cell:

- Minecraft version
- loader + loader version
- Java version
- artifact filename
- SHA-256
- build fingerprint
- support state
- build result
- static-test result
- runtime-test result
- known differences
- blocked/failure reason

Never produce ambiguous names like `mod-final.jar`, `mod-new.jar`, `working.jar`.

---

# 10. VERIFICATION — THIS FEATURE IS NOT DONE AT "COMPILES"

Add dedicated Northpoint QA rather than relying only on existing launcher tests.

At minimum prove these cases:

- [ ] New 26.3 NeoForge mod builds requested target first.
- [ ] `ask` mode waits until that target passes, then offers matrix fan-out.
- [ ] Choosing `Build all supported versions` creates additional valid cells.
- [ ] Choosing `Always for this project` suppresses the prompt on the next build of that project.
- [ ] Choosing global always-all applies to a new project.
- [ ] Project override beats the global setting.
- [ ] Target failure prevents secondary fan-out.
- [ ] A dependency missing on one matrix cell marks it blocked with the correct reason and does not strip the dependent feature from other cells.
- [ ] A common-source edit invalidates every affected cell.
- [ ] A Fabric-only adapter edit invalidates Fabric cells but does not rebuild unrelated NeoForge cells.
- [ ] An unchanged second matrix run reuses passed cells instead of rebuilding everything.
- [ ] Interrupted fan-out resumes from persisted matrix state.
- [ ] `Retry failed only` does not rebuild green cells.
- [ ] Secondary failure does not delete the valid primary artifact.
- [ ] Every produced JAR has unique deterministic naming and SHA-256.
- [ ] Final matrix report exactly matches files on disk.
- [ ] Headless mode never waits for UI input.
- [ ] Existing single-target users can still choose target-only and get the same simple workflow as before.
- [ ] Existing Enderloom launcher/catalog behavior is not regressed.

For real mod conversions, verification remains loader/feature appropriate:

- compile/build
- static migration guard
- dedicated server when common/server behavior exists
- native client when rendering/input/UI/client behavior exists
- integrated-server/gameplay lane when sync/gameplay requires it
- restart/persistence proof for configs/saves/stateful systems

Do not label a matrix cell `Passed` if its strongest required runtime gate was skipped. Use a truthful state such as `Built - runtime unverified` if the environment prevents runtime proof.

---

# 11. PERFORMANCE / QOL CHALLENGE PASS

Before calling Northpoint finished, check these specifically:

- Do repeated matrix builds reuse downloads and successful cells?
- Does one common edit trigger only logically affected cells?
- Can secondary cells build concurrently without RAM/CPU thrash?
- Is the requested target available as soon as it passes, even while matrix fan-out continues?
- Can the user cancel secondary work without losing the target?
- Are logs separated by cell so one failure is obvious?
- Is the support matrix loaded once and reused instead of repeatedly rescanned?
- Are dependency/toolchain resolutions locked and reused?
- Is generated-workspace cleanup safe and limited to Enderloom-owned generated directories?
- Does the app avoid copying complete source trees unnecessarily when overlays/hardlinks/cached generation can be used safely?

Fix meaningful waste found here before finishing.

---

# 12. IMPLEMENTATION PLACEMENT IN CURRENT ENDERLOOM

Current Enderloom is Electron/Node with a React/TypeScript launcher frontend and Rust-backed native launcher/service. Keep responsibilities clean:

**Renderer / launcher frontend**

- matrix display
- target selection
- prompt/preferences
- progress/status
- result actions
- no direct arbitrary process execution

Likely homes:

```text
launcher/src/lib/               matrix types/client helpers
launcher/src/components/        matrix prompt + matrix status UI
launcher/src/store.ts           project/global matrix preference state
launcher/src/views/             integrate into create/convert workflow
```

**Electron main / native service**

- filesystem mutation
- source inventory
- matrix planning authority
- toolchain/dependency resolution
- build execution
- cancellation
- hashing
- state persistence
- runtime QA launching

Do not dump the whole feature into the already-large `main.js`. Extract a dedicated Northpoint/matrix service/module and keep `main.js` as orchestration/IPC wiring where possible.

Use the Rust native service for operations already owned there; do not create a second competing process/download/runtime manager in renderer JavaScript.

---

# 13. DEFINITION OF DONE — DO NOT STOP BEFORE THIS

Northpoint is complete only when all of the following are true:

- [ ] Both **Create Mod** and **Convert Mod** use the same version-matrix engine.
- [ ] Requested target builds and verifies first.
- [ ] Post-target `ask / target-only / all-supported` behavior works.
- [ ] Project and global remembered settings work and have correct precedence.
- [ ] A data-driven Minecraft x loader support matrix exists.
- [ ] Shared source + loader/version overlays prevent copy-paste project forks.
- [ ] Dependency/toolchain availability is resolved per cell.
- [ ] Blocked cells explain themselves instead of silently losing features.
- [ ] Build state is persistent and resumable.
- [ ] Changed-input fingerprints prevent needless rebuilds.
- [ ] Failed-only retry works.
- [ ] Deterministic artifacts + SHA-256 + matrix manifest are produced.
- [ ] UI matrix accurately reflects real backend state.
- [ ] Headless/automation flow is noninteractive and deterministic.
- [ ] New Northpoint QA covers the acceptance cases above.
- [ ] Existing Enderloom integration/release QA remains green.
- [ ] Real native Electron app is launched and the create/convert -> target -> all-versions flow is exercised end-to-end.
- [ ] A complete usable Enderloom build/package is produced after implementation.

## Final instruction

Do not respond with a design proposal for this task. **Implement it.** Inspect the current create/convert path, wire the smallest coherent matrix engine into it, test the target-first flow immediately, then finish the remembered-setting, fan-out, caching, reporting, and UI work. Avoid ceremonial milestones and repeated repo audits. Make a coherent change, test it, checkpoint it, and continue until the Definition of Done is satisfied.
