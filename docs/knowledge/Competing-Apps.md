
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
- [ ] Inventory actual reusable modules and owners before extracting a shared component.
- [ ] Version schemas and cancellation/error semantics; keep adapters optional and avoid circular dependencies.
- [ ] Compare cold/warm latency, correctness, memory, interrupted operations and rollback against current Enderloom on identical corpora.
- [ ] Track source/release dates, licenses and retained failures. No published improvement claim without target-project evidence.
