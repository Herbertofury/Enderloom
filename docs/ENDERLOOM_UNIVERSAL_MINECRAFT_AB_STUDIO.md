# Universal Minecraft A/B Studio

Recorded: 2026-10-05. **Product stage: planned; implementation and gameplay verification remain open.**

## Objective

Run two playable Minecraft clients side by side inside Enderloom Studio. Compare mod versions, Minecraft versions, loaders, and Java/Bedrock builds; transfer selected content and its complete dependencies; compare actual gameplay alongside code, assets, and behavior. Preserve all existing Catalog, Browser, Launcher, conversion, AoA, and Variant Foundry obligations.

## Context and authority

Canonical repository: https://github.com/Herbertofury/Enderloom. GitHub work item: https://github.com/Herbertofury/Enderloom/issues/22. This specification extends `ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`, `ENDERLOOM_STUDIO_EXECUTION.md`, the existing conversion/version-graph contracts, and the Marketplace, Studio comparison and Bedrock roadmap. Use `docs/knowledge/requirements.json` as the sole editable progress owner. AB task IDs below identify acceptance slices; their checkboxes do not independently certify the product. Do not renumber them. New work is planned (`unverified` in the existing ledger); `implemented` requires production wiring; gameplay-tested requires artifact-bound native runtime evidence. Historical claims remain historical.

Existing components to inspect once and reuse: the Rust launcher/service, persistent Electron/Chromium browser, shared project/job/dependency graph, `tools/minecraft-dev-kit/scripts/` conversion and runtime control modules, Blockbench/Variant Foundry, and `scripts/knowledge/knowledge.py` publication pipeline. Resolve exact runtime owners and platform capabilities during implementation preflight; do not invent a parallel launcher, conversion engine, database, or progress owner.

## Accepted user requirements — preserve in full

- Run two playable Minecraft clients side by side inside Studio.
- Compare different mod versions, Minecraft versions, loaders, and Java/Bedrock builds.
- Easy focus switching, resizing, maximizing, fullscreen, windowed and borderless layouts.
- Compare gameplay alongside code, assets and behavior changes.

### 1. Drag-and-drop content between clients

- Drag a weapon, item or block from one client's inventory into the other.
- Carry across its code, assets, dependencies, animations and behavior.
- Adapt it to the destination version, such as 1.20.1 → 1.21.1, and Java ↔ Bedrock.
- Show it immediately in the Universal client while conversion and packaging run in the background.
- Clearly distinguish the live preview from the successfully built and tested destination mod.

### 2. Smooth conversion workflow

- Queue multiple transfers and keep testing while they build.
- Show progress, errors and anything needing attention.
- Provide undo, retry and rollback.
- Let the user restart now, after the batch, or later.
- Preserve test state where possible and verify the generated mod works after restart without relying on the preview.

### 3. Full Marketplace browsing

- Browse Bedrock Marketplace inside Enderloom, like CurseForge and Modrinth.
- Open content in Minecraft Bedrock for the normal purchase/download flow.
- Add the requested authorized PackDL and McTools integration.
- Track upstream releases and test updates before adopting them.

### 4. Powerful mod comparison

- Side-by-side comparison of code, textures, models, animations, sounds, recipes and other assets.
- Show additions, removals, changes and dependencies.
- Preview differences and selectively transfer changes.

### 5. Java ↔ Bedrock conversion testing

- Use Actions & Stuff 1.11.1 as the full conversion test case.
- Check appearance, animation, behavior and actual gameplay parity.
- Report unsupported or unfinished behavior explicitly until it's implemented and verified.

### 6. Keep development organized

- Organize third_party sources, tools and test assets with versions and licenses.
- Keep GitHub and the wiki aligned with verified progress.
- Label planned, implemented and gameplay-tested features separately.
- Keep compact test reports and necessary reproduction files; remove obsolete bulky copies only after replacement validation and safe-cleanup approval.

## Constraints

Use real native game clients for playable panes and certification. A screenshot stream, browser renderer, protocol bot, preview scene, or successful build alone is not proof of a playable native client or destination mod. Keep platform capability limitations visible and actionable. Do not silently substitute a weaker experience.

Use independently owned sandbox instances, worlds, ports, process groups, logs, configs, account/session state, and output directories. Never modify a live user's instance/world for automatic testing. Reuse immutable runtime/download caches safely; two clients must not write to the same world or game directory. An A/B comparison may intentionally use different runtimes; measurement reports must expose those differences.

Honor the user's authorized PackDL/McTools request without inventing extra authorization demands for planning. Scope adapters to authorized accessible content and normal provider entitlements. Do not introduce public key-sharing, payment/entitlement bypasses, or publish commercial test assets. Confirm exact upstream identity and distribution license before bundling; missing public license information is unresolved, not permission to copy.

Default to manual refresh and explicit update adoption. No background watchdog, scheduled polling, or automatic repatching is requested. Pin tools per job; a new release is a candidate until compatibility, fidelity, and rollback tests pass.

## Done when

Every acceptance slice below is implemented, exercised through normal Studio controls and its shared CLI/API where applicable, survives interruptions and restart, and has exact source/tool/runtime/output identities. Both native clients are playable; transfers preserve complete content/dependencies; the certified destination works after restart with preview injection disabled. Actions & Stuff has a complete source census and native parity report, with no unimplemented accepted behavior hidden by a successful thumbnail, model render, or one selected asset.

## Executable acceptance slices

### Playable panes — owner UX-11

- [ ] **AB-T001** Resolve platform adapters for Java/Java, Java/Bedrock, Bedrock/Java and Bedrock/Bedrock; edition, exact build, loader, Java runtime, account entitlement and launch configuration are explicit per pane. Spawn two actual supported native clients and prove their process/window identities.
- [ ] **AB-T002** Embed or host both playable surfaces inside Studio through a validated platform adapter. Exercise mouse look/pointer lock, inventory interaction, keyboard/controller input, focus switching, loss of focus, Alt-Tab, IME, clipboard, DPI changes, multiple monitors and window close/crash. Route input only to the selected pane unless the user explicitly enables replay synchronization.
- [ ] **AB-T003** Implement draggable dividers, resize, maximize one pane, restore split, detached/windowed/borderless/fullscreen layouts and keyboard commands. Persist layout and active pane; recover pointer capture and focus after modals or restart. Keep code/asset/behavior inspectors usable next to gameplay.

Do not assume Win32 reparenting works identically for GLFW/OpenGL/Vulkan Java windows and packaged Bedrock builds. Validate graphics, input, DPI, lifecycle and supported account behavior per platform. Native compositor/window-hosting and capture-based approaches are candidates; capture must preserve input and measured latency and remain explicitly identified. A detached fallback remains visible work until the promised in-Studio experience is proven.

### Inventory transfer and honest preview — owner PORT-15

- [ ] **AB-T004** Implement an explicit Studio inventory export/drag gesture in the source client using its version-specific bridge. Resolve the selected runtime registry ID, components/NBT, owning mod/pack and source revision. A normal inventory stack contains identity and state, not the owning code or dependency closure; obtain those from the project/provenance graph. Do not infer ownership from an icon/name.
- [ ] **AB-T005** Expand a selected weapon/item/block into the complete reachable source, assets, required/optional/nested dependencies, animation/controllers/Molang, sounds, recipes, tags, networking, scripts and behavior graph. Keep unresolved/reflection/dynamic references visible and require evidence before declaring the closure complete.
- [ ] **AB-T006** Translate through the shared UMIR/version-graph pipeline into the exact destination edition/version/loader. Cover 1.20.1 → 1.21.1 and both Java ↔ Bedrock directions. Emit versioned semantic transforms and native behavior adapters where required; preserve unsupported source members and concrete next actions.
- [ ] **AB-T007** Show supported content promptly in the Universal client using the shared preview runtime while conversion/build/package jobs run off the UI/render threads. States must distinguish `Preview only`, `Converting`, `Built`, `Installed—restart pending`, `Gameplay verified`, and `Failed/needs attention`. Unsupported preview behavior is labeled; it is never silently replaced or certified.
- [ ] **AB-T008** Install the real generated artifact transactionally into the destination sandbox, restart with preview injection disabled, verify selected content and full dependency closure, and bind success to output hash/runtime fingerprint. A preview disappearing after restart must fail certification and retain a reproducible case.

### Concurrent conversion and recovery — owner DEP-09

- [ ] **AB-T009** Queue multiple transfers using durable job IDs, dependency ordering, conflict detection and resource-aware build concurrency. Continue gameplay/testing while jobs run. Single-flight identical source/target transforms and cache by complete input/toolchain/rule fingerprint; never reuse stale results.
- [ ] **AB-T010** Expose real phase progress, logs, actionable errors, missing dependencies and needed decisions. Support cancel, undo, retry and rollback, including a failed middle item, disk exhaustion, engine crash, app crash and re-open. Undo preview and staged project changes independently; restoring an installed artifact must also restore manifests/config/dependencies.
- [ ] **AB-T011** Offer restart now / after batch / later; aggregate compatible pending installs. Stop writers and snapshot safe test state before restart. Preserve world snapshot, player inventory/position, camera, test route, selected inspector and scenario checkpoint where possible. When runtime/edition differences prevent restoration, state exactly what can be restored and replay from a verified checkpoint.
- [ ] **AB-T012** Test process supervision, destination edits during builds, stale jobs finishing out of order, same-ID collisions, overlapping dependency changes and concurrent batch adoption. Use a compare-and-swap project revision and transactional destination ownership so a late result cannot overwrite newer work.

### Complete Marketplace and authorized tools — owner LIB-10

- [ ] **AB-T013** Add the complete official Marketplace to the existing provider tabs, with normal search/filter/sort/categories/details/media/account navigation, back/forward, pagination, errors, refresh and session preservation. Keep identity keyed to product/creator IDs and expose exact contextual links. Retain CurseForge/Modrinth/GitHub behavior.
- [ ] **AB-T014** Open the exact product in Minecraft Bedrock using the official product action or validated product-ID deep link for the normal purchase/download flow. Verify installed/missing game, running/closed, signed-in/out, owned/unowned, cancellation, invalid ID and wrong account. Protocol-handler launch does not mean installation succeeded.
- [ ] **AB-T015** Integrate the requested PackDL and McTools behind shared jobs for supported authorized operations. Preserve upstream versions/licenses/notices, securely bind the correct account/product entitlement, isolate staging, validate archive paths/members and deterministic packaging, redact secrets and emit artifact/provenance receipts. Review exact API/CLI contracts before adopting any binary.
- [ ] **AB-T016** Track upstream releases through manual refresh, diff versions/license/API/dependencies, test candidates on the complete fixtures, and explicitly adopt or reject. Pin a job's version; retain the last known good version and prove rollback. No automatic adoption or unrequested polling.

Intended upstream identities, recovered from the existing actual wiki: https://git.silica.codes/BedrockReverse/PackDL and https://git.silica.codes/BedrockReverse/McTools. The prior October 4 source inventory recorded PackDL v1.6 and McTools v12; this is historical evidence, not a fresh latest-release assertion. Do not confuse McTools with unrelated RCON or browser utilities.

### Complete semantic and asset comparison — owner MAKE-12

- [ ] **AB-T017** Compare code/AST/bytecode, metadata, dependency graphs, textures/alpha/materials, models/bones/UVs/locators, animations/easing/controllers/Molang, sounds/events, recipes/loot/tags, scripts, networking and all other discovered assets. Report additions/removals/changes/renames/equal/unknown with exact counts; unsupported or unread content never becomes equal.
- [ ] **AB-T018** Provide source-linked side-by-side code and asset inspectors, synchronized model camera/lighting/pose/animation time and audio audition, optional wipe/overlay views, semantic controller/event traces, and actual gameplay comparison. Preserve original ordering where it changes behavior and display raw unknown fields.
- [ ] **AB-T019** Selectively transfer one change or a group with dependency-impact preview and explicit conflict resolution; preserve untouched content. Support reversible patches, undo/retry/rollback and concurrent source/destination edits. Test removals, identifier renames, shared resources, optional dependencies and source-only changes that alter behavior.

### Actions & Stuff 1.11.1 and cross-edition proof — owner TEST-09

- [ ] **AB-T020** Pin Actions & Stuff 1.11.1 as the complete conversion fixture with original input hashes, product ID, creator, source manifest, all subpacks and exhaustive file/feature census. Build a source-native Bedrock baseline. The official creator's page is the product authority; do not use unofficial free-download mirrors.
- [ ] **AB-T021** Compare original Bedrock and generated Java appearance, first/third-person/item views, textures/materials, models/UVs, animations/transitions/Molang queries, particles, audio, behavior and actual gameplay. Derive scenarios from everything present in the source; Actions & Stuff alone does not prove arbitrary behavior-pack/Script API conversion. Add independent authorized behavior fixtures for absent capabilities.
- [ ] **AB-T022** Verify Java → Bedrock and both round-trip directions with version-specific semantic expectations. Use GameTest/control-plane checks plus rendered native evidence; a protocol bot/server test does not prove visuals, audio, UI, input or animation parity.
- [ ] **AB-T023** Maintain a capability matrix per feature × edition/version/loader cell: planned, implemented, build-proven, gameplay-tested, unsupported/unfinished, with precise cause and next action. Entire conversion remains open while accepted parity gaps remain; do not redefine unsupported as permanently out of scope.

### Organized inputs, proof and publication — owner SHIP-06

- [ ] **AB-T024** Organize immutable `third_party` source/tool revisions, versions, origin URLs, full commits, hashes, licenses and notices separately from editable workspaces and private authorized test assets. Exclude commercial originals, keys, tokens and bulky generated duplicates from public GitHub/wiki/releases and app packages.
- [ ] **AB-T025** Keep compact structured test reports plus necessary reproduction files with source/tool/runtime/output hashes, commands, scenario seed, observations, results and known gaps. Preserve failed cases and baseline lineage; show raw evidence on demand without dumping giant logs into the wiki.
- [ ] **AB-T026** Synchronize the canonical requirements ledger, GitHub backlog and actual live GitHub wiki at coherent verified checkpoints. Planned, implemented and gameplay-tested labels must match evidence. Preserve previous roadmap details and other in-flight projects; a repository-side wiki mirror is not live publication.
- [ ] **AB-T027** Inventory obsolete bulky copies and prove replacement hashes, complete member counts, provenance, reproduction value and rollback coverage before proposing cleanup. Retain originals until safe-cleanup approval; no deletion is authorized by this documentation task.

### Convergence gate

- [ ] **AB-G001** All requested features and all child acceptance slices converge through normal packaged Studio controls. Test Java/Java, Java/Bedrock, Bedrock/Java and Bedrock/Bedrock supported cells, real restart without preview, batch failures/recovery, persistence, keyboard/focus/layout, exact provider flows and complete Actions & Stuff parity. Measure equivalent-work first useful preview, full conversion latency, p50/p95/p99 frame time, input latency, CPU/GPU/RAM/VRAM, disk and UI responsiveness in single/dual/building states. Publish limitations honestly; preserve fidelity, content and required verification while reducing duplicate work. One material challenge pass must resolve significant gaps before certification.

## Implementation sequence and exact next action

First inspect the existing runtime/window supervision, bridge and durable jobs once; freeze their identities. Implement **AB-T001–AB-T003** as a real two-client native vertical slice, then **AB-T004–AB-T008** for one complete inventory transfer through preview, real build/install and restart without preview. Extend the proven shared pipeline to queued recovery, Marketplace, complete comparison and every cross-edition fixture. This order never reduces accepted scope or displaces active AoA work; use an isolated branch/worktree when implementation overlaps.

Research companion: `ENDERLOOM_UNIVERSAL_AB_STUDIO_RESEARCH_2026-10-05.md` (published after the current challenger scan). Existing roadmap and its source inventory remain binding references; reuse them instead of restarting discovery.
