# Universal Minecraft A/B Studio

**Planned. Implementation and native gameplay verification remain open. Added October 5, 2026.**

[Home](Home.md) / [Execution checklist](Checklist.md) / [Studio](Studio.md) / [Marketplace and Bedrock roadmap](Marketplace-Studio-and-Bedrock-Roadmap.md)

Run two playable Minecraft clients side by side inside Studio. Compare Minecraft versions, mod versions, loaders and Java/Bedrock builds while inspecting gameplay, code, assets and behavior. Resize, switch focus, maximize, detach, fullscreen, windowed or borderless with saved layouts and real native input.

| Capability | Canonical owner | Current stage | Acceptance slices |
| --- | --- | --- | --- |
| Two playable native clients and all layouts | UX-11 | Planned | AB-T001–AB-T003 |
| Inventory drag-and-drop, complete closure and honest preview | PORT-15 | Planned | AB-T004–AB-T008 |
| Batch queue, progress/errors, undo/retry/rollback and restart choices | DEP-09 | Planned | AB-T009–AB-T012 |
| Complete Marketplace, normal Bedrock purchase/download, authorized PackDL/McTools and tested updates | LIB-10 | Planned | AB-T013–AB-T016 |
| Code/textures/models/animations/sounds/recipes/assets and dependency comparison with selective transfer | MAKE-12 | Planned | AB-T017–AB-T019 |
| Complete Actions & Stuff 1.11.1 native Java↔Bedrock parity | TEST-09 | Planned | AB-T020–AB-T023 |
| Versioned third_party inputs, compact proof, aligned live progress and approved safe cleanup | SHIP-06 | Planned | AB-T024–AB-T027 |

## Transfer what you play with

Drag a weapon, item or block from one inventory into the other. Resolve its actual owning project and carry code, assets, dependencies, animations and behavior through the shared conversion engine, including 1.20.1 → 1.21.1 and Java ↔ Bedrock. An inventory stack supplies identity/state; the project graph supplies the code and complete dependency closure.

Show supported content immediately in the Universal preview client while background conversion and packaging run. Label **Preview only**, **Converting**, **Built**, **Installed—restart pending**, **Gameplay verified**, and **Failed/needs attention** separately. Certify the destination only after the generated artifact works after restart with preview injection disabled.

## Keep testing while conversions build

Queue multiple transfers, show real progress/errors/attention, and provide undo, retry and rollback. Choose restart now, after the batch or later. Restore safe world/player/camera/scenario/inspector checkpoints where possible; identify any state that needs replay. Protect current edits from late jobs and preserve originals through partial failure.

## Browse and compare completely

Browse the full official Marketplace like existing CurseForge/Modrinth providers. Open the exact content in Bedrock for normal purchase/download and integrate the requested authorized PackDL/McTools operations. Manually refresh upstream releases, test candidates before explicit adoption, and retain rollback. Compare complete code, assets and dependency graphs with source-linked visual/audio/semantic inspectors and selective reversible transfers.

## Prove complete cross-edition parity

Use the entire authorized Actions & Stuff 1.11.1 fixture: appearance, animation, behavior and actual gameplay. Census all source content and subpacks; add independent behavior/Script API fixtures for capabilities absent from that pack. Test both directions and round trips. Report every unsupported/unfinished behavior with its cause and next action until it is implemented and verified.

## Keep ownership and evidence clear

The [canonical ledger](requirements.json) owns progress. Planned, implemented and gameplay-tested labels follow evidence. Keep versions/licenses/notices and private test assets organized; publish compact reports and necessary reproduction files. Obsolete bulky copies require replacement validation and safe-cleanup approval before removal.

[Full executable contract](../ENDERLOOM_UNIVERSAL_MINECRAFT_AB_STUDIO.md) contains every original requirement, AB-T001–AB-T027, the convergence gate and exact implementation sequence. Research follows as a source-linked integration companion; no feature is certified by this documentation update.
