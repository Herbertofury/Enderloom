# Config, Addons and mod lineage

Open an instance and use **Config** or **Addons**, next to Mods, Resource Packs and Shaders. The Mods toolbar also links directly to **Mod lineage**.

The 2026-09-06 continuation adds full CLI, Favorites and Performance Lab requirements. Their active ordered ledger is [CONTINUATION_CHECKLIST.md](CONTINUATION_CHECKLIST.md); completing this original feature checklist does not complete the expanded goal.

## Implementation and verification checklist

Execute in order; mark each item only after its behavior has been demonstrated in the real Electron launcher and its native service. Keep the existing implementation and continue from the next unchecked item.

- [x] **1. Premium mod lineage:** identify modified bytes without inventing AI authorship; declare AI assistance/patches; attach the actual upstream original; retain revision notes; restore revisions; prevent ordinary updates/repair from overwriting local work. **Proof, 2026-09-05:** real Electron inspector, metadata edit and upstream-original restoration passed; byte comparison confirms the restored JAR exactly matches the supplied original. Native integration verifies update refusal and persistent revision history. Screenshot: `output/playwright/enderloom-mod-lineage.png`.
- [x] **2. Premium custom installs:** author-grounded Point Blank and version-aware TaCZ recipes, intact ZIP validation, explicit destination preview, custom paths and source identity, original retention. **Proof, 2026-09-05:** installed a real local ZIP through the production Electron dialog into `tacz/`, then verified identical destination bytes. Native integration passes both TaCZ generations, shared legacy Config/Addons placement, duplicate rejection and archive validation. Screenshot: `output/playwright/enderloom-addon-install.png`.
- [x] **3. First-class Config:** real config/helper-mod inventory, syntax/corruption and version warnings, settings/source editing, conflict protection, global presets applied to selected matching instances, recoverable edits. **Proof, 2026-09-05:** Electron edited a real setting while preserving nested JSON; rejected malformed source without changing the file; applied a preset to two selected instances with byte checks; displayed a loader-version warning and cleared it only after the compatibility-review action. Native integration proves stale-edit rejection, external revision capture and restore. Screenshots: `enderloom-config.png`, `enderloom-config-editor.png`, `enderloom-global-config.png` under `output/playwright/`.
- [x] **4. First-class Addons:** shared Config/Addons records where relevant; installed content controls; source/update tracking and honest failure states. **Proof, 2026-09-05:** production Electron UI enabled and disabled the installed ZIP, replaced it while retaining history, and displayed the provider check outcome. Native byte checks verify the destination and replacement; all 37 native feature checks and the full Electron feature suite pass. Screenshots: `output/playwright/enderloom-addons.png`, `output/playwright/enderloom-addon-updates.png`.
- [x] **5. Release checkpoint:** frontend and native production-service builds pass; all 37 native feature checks, the full Electron feature suite, live Modrinth replacement/rollback checks, the existing launcher integration suite, all 49 Catalog release suites, command coverage and the combined Electron self-test pass. Wide/compact screenshots were visually inspected; Electron reported zero renderer errors. **Checkpoint, 2026-09-05:** committed the 19 feature files on `codex/config-addons-workbench`, selectively staging shared files so pre-existing work remains untouched. Supported behavior and limitations are documented below. **Host blocker:** Rust unit-test execution remains unavailable as described immediately below; real-service acceptance supplies the executable verification.

**Verification blocker:** the Rust unit-test executable compiles but cannot start on this Windows host (`STATUS_ENTRYPOINT_NOT_FOUND`, an existing repository limitation). Real native-service tests run successfully; this is not a unit-test pass.

## Configuration workspace

- Inventories real files in `config/`, `defaultconfigs/`, `kubejs/`, `scripts/`, Minecraft options files, and each world's `serverconfig/`. Recognizes common configuration helper mods in the Config library.
- Config and Addons use the same persistent record for content that belongs in both views.
- JSON, TOML, YAML and properties files receive syntax checks. Other supported text formats, including JSON5/JSONC and CFG, are explicitly marked as lacking a syntax validator. Validation does not claim to understand every mod's schema or accepted values.
- Simple top-level JSON settings have switches and fields. Source view supports full-file editing and preserves nested settings unless explicitly edited. Structured JSON edits reformat JSON; source edits retain the submitted text.
- Invalid structured syntax is rejected before saving. Files changed since the editor opened require a fresh read. Drafts remain in the editor and closing a dirty editor offers to keep editing or discard.
- Existing bytes are backed up before each edit or replacement. Revision history can restore exact backups, including a missing tracked file.
- Minecraft, loader and recognized owning-mod version changes produce review warnings. These are compatibility signals, not a claim that old configs are necessarily broken.
- Global presets save the whole configuration file. Applying a preset shows the exact destination and explicitly selected matching-Minecraft instances, with per-instance outcomes and a backup before overwriting. Presets do not silently synchronize or overwrite every instance in the background.

## Custom installs and authors' instructions

The author pages were read on September 5, 2026:

- [Point Blank Official Extension — Doom Pack](https://www.curseforge.com/minecraft/customization/point-blank-official-extension-doom-pack): keep the ZIP intact in the instance's `pointblank/` folder. Doom 1.3.5 requires Point Blank 1.6.7+. Clients and servers need matching content packs.
- [TaCZ — Helldivers: Escalation of Freedom](https://www.curseforge.com/minecraft/customization/tacz-helldivers-escalation-of-freedom): keep the ZIP intact in `config/tacz/custom/` for older TaCZ, or `tacz/` for TaCZ 1.1.4+. Detection reads enabled installed mod metadata, with an explicit generation selector when the version cannot be established.

The import dialog previews the destination. Known recipes attach the exact CurseForge project. Custom recipes accept a relative content directory, local file, original project URL and optional CurseForge/Modrinth identity. Archive entries and CRCs are validated; duplicate destination files are rejected. Custom installations preserve archives intact; they do not execute installers or automatically extract arbitrary multi-folder distributions. Files are limited to 1 GiB per import and 1 GiB expanded per ZIP validation; text editing is limited to 2 MiB.

Addon controls enable/disable content and replace a file while preserving earlier revisions. Dependency and wrong-folder warnings explain problems without claiming that an unverified mod is installed. Update checks use the existing provider clients, Minecraft compatibility and stable releases. An installed provider version may be recovered from an exact SHA-1 match against the saved original. Otherwise the user can link the file/version ID. Unknown identities, provider failures and missing compatible releases remain distinct from “current.” Author restrictions and provider/API-key availability still apply; obtaining an update uses the original project and local replacement workflow.

## Premium mod lineage

Custom installs and mod lineage are labelled **Premium Preview** and enabled in this build. There is no pre-existing commercial entitlement or billing service in this repository; no payment enforcement is implied or implemented here. Config editing, shared inventory and global presets are ordinary first-class features.

SHA-256 identifies saved baselines and revisions. Recorded provider checksums can reveal modified or damaged mod files. AI authorship cannot be detected reliably from bytes: AI assistance, edited status, patches and original authorship are explicit declarations. Users can attach the actual unedited upstream file independently of the installed working copy, and retain source links, provider IDs and notes.

Provider updates and content repair refuse to overwrite protected local work and direct the user to Mod lineage. Its explicit replacement flow preserves both the old working revision and the original. Ordinary unchanged tracked files are snapshotted before the provider operation.

## Persistence and checks

Each instance owns `.enderloom-workbench/library.json` plus independent, content-addressed copies under `.enderloom-workbench/blobs/`. Global presets live under the launcher data root at `workbench/global-presets.json`. Backups are copies, never hardlinks. Damaged tracking metadata is reported and preserved. Path traversal, alternate streams, internal tracking paths and symlink/junction escapes are rejected. Mutations are serialized within the native service and check whether Minecraft or an instance task is running.

Run:

```text
npm run build:launcher
npm run build:launcher-service
npm run workbench-qa
npm run workbench-ui-qa
node scripts/workbench-provider-qa.js
npm run launcher-command-coverage-qa
```

The native integration suite uses the real service and disposable instances. The UI suite uses the production launcher build and preload in an isolated Electron host backed by that same service. Screenshots are written to `output/playwright/`. No user Minecraft instance is used by either suite.

The live provider suite downloads two compatible Sodium releases through Modrinth, verifies their upstream SHA-1 checksums, and exercises available → current → restored-original update states through the native service. It also verifies that an exact externally replaced file supersedes stale version metadata and that unknown bytes remain unverified. This suite requires network access. The author-linked CurseForge UI check exercised its explicit provider-error state on this host; successful authenticated CurseForge update lookup is not claimed.

Final regression evidence: the native service and TypeScript/Vite production build pass; all 37 feature checks pass; the real Electron feature suite passes without renderer errors, with wide and 1050-pixel-window layout screenshots; live Modrinth replacement/rollback checks pass; all 213 frontend commands have implementations; the existing launcher integration suite passes; all 49 Catalog release suites pass; the combined Electron self-test reports `passed: true`, no failures, on Electron 44.0.0 / Chromium 152.0.7977.54. Screenshots of Config, its source editor, Addons, both install/detail flows and global preset application were visually inspected.

The Rust unit test harness compiles on this host but currently exits before executing tests with Windows `STATUS_ENTRYPOINT_NOT_FOUND`, also documented in the existing release evidence. This is reported separately from passing native service integration tests.
