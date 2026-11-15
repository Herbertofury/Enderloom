
# Competing apps, foundations and shared capabilities
Reviewed **2026-11-12**. This page complements [Ecosystem](Ecosystem.md); that catalog remains the detailed upstream inventory. These are research candidates, not proven superiority or blanket integration approval.

## Product comparisons
[Prism Launcher](https://prismlauncher.org/) and [Modrinth App](https://modrinth.com/app) are launcher/mod-management baselines. [MCreator](https://mcreator.net/) is a creator-workflow baseline. Aim to improve the complete discover → build/convert → inspect → launch → diagnose → recover journey without sacrificing their relevant capabilities. Measure actual task completion and failure recovery rather than feature counts.

## Build on maintained foundations
| Foundation and reuse mode | Concrete capability to investigate | Gate before adoption |
| --- | --- | --- |
| [Fabric mapping-io](https://github.com/FabricMC/mapping-io), library/adapter | Mapping readers, visitors and trees instead of another mapping parser | Exact revision/license; namespace and descriptor parity on real artifacts; JVM/Rust boundary overhead |
| [Chunker](https://github.com/HiveGamesOSS/Chunker), isolated conversion backend/oracle | Java/Bedrock world conversion with field-by-field reconciliation | Supported edition/version pair, loss report, copied worlds, rollback; not a mod-code translator |
| Existing Ecosystem build, model and profiling candidates | Reuse existing adapters before introducing a second implementation | Per-tool license and runtime compatibility, measured end-to-end improvement |

## Proposed own-project interoperation
- [Minecraft-Mod-Vault](https://github.com/Herbertofury/Minecraft-Mod-Vault): investigate versioned instance/content identities, source provenance and reusable test manifests rather than duplicate discovery.
- [Hover-App](https://github.com/Herbertofury/Hover-App): propose a read-only metadata/thumbnail contract for supported pack/world assets; never couple preview availability to starting a game.
- [Ferrum](https://github.com/Herbertofury/Ferrum-Browser): reuse evidence formats and applicable real-app acceptance automation, not a simulated success badge.

## Proof backlog
- Inventory actual reusable modules and owners before extracting a shared component.
- Version schemas and cancellation/error semantics; keep adapters optional and avoid circular dependencies.
- Compare cold/warm latency, correctness, memory, interrupted operations and rollback against current Enderloom on identical corpora.
- Track source/release dates, licenses and retained failures. No published improvement claim without target-project evidence.

## 2026-11-15 launcher research refresh: Prism 12 preview

The official [12.0.0-pre1 release](https://github.com/PrismLauncher/PrismLauncher/releases/tag/12.0.0-pre1) was published **2026-11-14** and is explicitly a **prerelease**, not a stable-release recommendation. Its assets include Windows MSVC/MinGW, Linux and macOS packages. This refresh covers Prism only; the other catalog entries were not revalidated today.

Three upstream changes provide concrete regression-oracle candidates:

| Primary evidence | Enderloom comparison to perform, not an adoption claim |
| --- | --- |
| [Preserve existing CurseForge game root, #6066](https://github.com/PrismLauncher/PrismLauncher/pull/6066) | On disposable copied instances, update packs with only `.minecraft`, only `minecraft`, both, and neither directory. Compare the active root and hashes of worlds/configs/mods before and after update, failure and restart. The upstream report describes old data becoming invisible after extraction selected a different root; it does not establish an Enderloom defect. |
| [Modrinth creation cancellation, #5933](https://github.com/PrismLauncher/PrismLauncher/pull/5933) | Cancel during a deliberately stalled local download. Record actual worker/network termination, partial-output cleanup, truthful UI state and successful retry, not merely an enabled Cancel button. |
| [Automatic versus manual retry budget, #6371](https://github.com/PrismLauncher/PrismLauncher/pull/6371) | Count actual attempts with a failing local endpoint; separate automatic budget from one explicit user retry and reject work continuing after cancellation. Do not silently adopt a shorter timeout that regresses slow valid transfers. |

**Reuse/license:** [the pinned Prism license](https://github.com/PrismLauncher/PrismLauncher/blob/12.0.0-pre1/LICENSE) is GPL v3. These are behavioral test ideas for Enderloom's existing Electron/Rust services, not a proposed Qt/C++ transplant. Any copied implementation needs file-level notice/dependency review and compatible distribution obligations; artwork and branding are separate. No upstream code/assets were copied.

**Evidence boundary:** Release metadata and merged upstream discussions were reviewed; neither application was executed or benchmarked in this pass. No performance, security-completeness, or target superiority claim follows. Preserve current implementation until real Enderloom comparison supports a change. Open Enderloom source-watcher #58 and held Browse-performance #19 were checked and remain untouched.
