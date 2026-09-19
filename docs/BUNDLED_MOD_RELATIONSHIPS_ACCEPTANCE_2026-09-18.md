# Bundled mod relationships

The shared native manifest reader now follows loader-declared Fabric, Quilt and Forge/NeoForge JarJar entries recursively, retaining each embedded path and measured SHA-256. Legacy `mcmod.info` required/optional declarations and multi-mod identities are included. Project details show bundled candidates separately from physical installations and connect dependencies to both forms. Nested libraries never acquire the containing project's provider identity or saved-world ownership.

Project context, service/CLI and performance comparison use this reader. A comparison refuses to remove a carrier JAR required through one of its nested libraries; unresolved conditional requirements stop comparison before launching Minecraft. This is declared dependency evidence, not a runtime compatibility verdict.

Verification:

- `bundled-mods-qa.js`: recursive Fabric/Quilt, JarJar, legacy declarations, SHA-256, duplicate paths, unlisted-JAR exclusion, unsafe/missing/corrupt branches, unchanged source bytes, disabled containers, same-size/time edits, service/CLI restart parity and removal-comparison guards.
- `project-context-ui-qa.js`: real Electron renders the bundled cards, dependency locations, fingerprints, existing world links and direct Config navigation without renderer errors. Screenshot: `output/playwright/bundled-mods.png`.
- Real installed Fabric API in **FCP - Fabric Cross Play**: 43 bundled modules, 115 dependency links, zero warnings; complete native CLI projection in 1,756 ms. Evidence: `output/bundled-mods-real-fabric-api.json`.
- Native service/CLI and frontend builds pass. All 61 release suites pass.
- Config-source lookup now recognizes Quilt v1 production manifests and `QuiltLoader.getConfigDir()` paths. Native regression proves exact production identity, immutable provenance and rejection of a different loader branch. Existing Config Electron grouping, flat view, manual corrections and stale-result tests pass.

Nested parsing has explicit memory/recursion budgets and reports incomplete branches instead of silently dropping them. The small in-memory metadata cache evicts by memory use without limiting inventories. Loader activation and full version/side/conditional constraint solving remain unverified; PA-003 remains open. No Minecraft playthrough is claimed by these checks.

Format references: [Fabric manifests](https://docs.fabricmc.net/develop/loader/fabric-mod-json), [Quilt schema](https://github.com/QuiltMC/quilt-json-schemas/blob/main/quilt.mod.json/schemas/schema_version_1.json), [Forge JarJar metadata](https://github.com/MinecraftForge/JarJar/blob/main/metadata/src/main/java/net/minecraftforge/jarjar/metadata/ContainedJarMetadata.java), [legacy Forge metadata](https://github.com/MinecraftForge/MinecraftForge/blob/1.12.x/src/main/java/net/minecraftforge/fml/common/ModMetadata.java).
