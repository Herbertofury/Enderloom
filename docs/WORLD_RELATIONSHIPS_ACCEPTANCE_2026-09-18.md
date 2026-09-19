# Saved-world version relationships

Project details now read historical loaded-mod records from legacy Forge `FML/ModList` and modern Forge/NeoForge `fml/LoadingModList`. Each link keeps the exact mod ID, recorded version, source file and NBT path. Matching is exact: lookalike IDs, unrelated compounds, wrong list names and world display names do not establish relationships.

The shared native projection compares the saved version with enabled installed candidates, showing unchanged versions, changed versions, unknown versions or no enabled copy. These are historical references, not assertions that a world contains placed mod blocks, that a loader will activate a bundled candidate, or that removing a mod is safe. Existing pack-selection, dimension-storage, world-config and dedicated-server links remain available. Backup reads preserve `level.dat_old` provenance. One parsed metadata result now serves both the summary and relationships, avoiding duplicate decompression.

Verification:

- Built native service/CLI and frontend pass.
- `project-world-links-qa.js`: legacy and modern records, exact/sibling identity, source paths, backup recovery, changed/matching/missing versions, dedicated-server records, traversal/junction rejection and unchanged source bytes pass.
- `project-context-qa.js`: provider aliases, configs, manual owners, missing/disabled files, dependencies and identical service/CLI projection pass.
- `project-context-ui-qa.js`: real Electron displays saved versions and comparisons, existing bundled dependencies, world-folder actions and Config navigation with no renderer errors. Screenshot: `output/playwright/project-context.png`.
- `saved-world-real-qa.js`: actual Aether acceptance `level.dat` copied unchanged into an isolated association fixture produced Aether **1.5.10**, Minecraft **1.21.1**, source `level.dat/fml/LoadingModList/9`. Original and copied SHA-256 stayed `b82de2413f2ec4a4590deaddd1180625bbb87dbc277a9cc8247095d1768ebc31`. This verifies real save parsing; the temporary mod/provider association is explicitly a fixture.
- The Rust unit harness compiles but still fails before running on this host with the pre-existing `0xc0000139 / STATUS_ENTRYPOINT_NOT_FOUND`. It is not counted as a test pass; built-process checks above execute the actual native operations.

Together with `IDENTITY_GRAPH_ACCEPTANCE_2026-09-18.md`, `BUNDLED_MOD_RELATIONSHIPS_ACCEPTANCE_2026-09-18.md` and the Config ownership checks, these establish PA-003's instance, server, config, declared dependency and observed world links. The canonical projection derives from existing inventories, ownership records and save files; it does not introduce a competing store. Full loader constraint solving, region-content inspection and causal removal compatibility remain separate unverified behaviors, not conclusions of these links. Next identity requirement is PA-004 source/code/provenance/license metadata.

Format references: [legacy Forge writer](https://github.com/MinecraftForge/MinecraftForge/blob/1.12.x/src/main/java/net/minecraftforge/fml/common/FMLContainer.java), [Forge writer](https://github.com/MinecraftForge/MinecraftForge/blob/1.20.x/src/main/java/net/minecraftforge/common/ForgeHooks.java), [NeoForge writer](https://github.com/neoforged/NeoForge/blob/1.21.1/src/main/java/net/neoforged/neoforge/common/CommonHooks.java). Enderloom's reader is an original implementation against these fields.
