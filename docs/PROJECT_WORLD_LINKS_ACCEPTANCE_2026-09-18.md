# Project world and Quilt relationships

PA-003 now projects world connections from saved data-pack identifiers and nonempty region files under matching dimension namespaces. World names alone never establish ownership. Instance and dedicated-server saves share the existing bounded NBT reader. Recovered `level.dat_old` evidence identifies that actual source and retains the primary-file warning. Symlinks/junctions and unsafe server world paths are excluded. World bytes are never changed. Project details show these observations with a world-folder action.

Quilt v1 dependency declarations now preserve optional dependencies, qualified identifiers, nested alternative groups, conditional `unless`, side declarations, and composite version expressions. The UI labels alternatives/conditions and displays their raw constraints without claiming runtime satisfaction. Dependency manifest reads now share the existing 1 MiB parser memory budget; this is not an inventory cap. [Official Quilt schema](https://github.com/QuiltMC/quilt-json-schemas/blob/main/quilt.mod.json/schemas/schema_version_1.json).

Acceptance:

- `project-world-links-qa.js`: enabled/disabled pack IDs, dimension storage, misleading world names and sibling namespaces, recovered metadata, dedicated-server path, junction/path exclusion, unchanged NBT/region bytes.
- `project-context-qa.js`: native and CLI context, Quilt composite/conditional/alternative declarations plus existing Fabric/Forge/provider/manual-ownership coverage.
- `project-context-ui-qa.js`: actual Electron, world evidence and exact folder action, conditional/alternative declarations, instance/server config navigation, no renderer errors.
- Frontend and native service/CLI builds pass. Screenshot: `output/playwright/project-context.png`.

World relationships remain visible after installed copies are removed when their indexed mod identity is retained. A delayed config-source result cannot override a newer refresh; the Electron test holds an old native response across a rescan to verify this.

PA-003 remains open. These observations do not prove chunk-level block/entity ownership or safe removal. Legacy/nested-JAR relationships and evaluated version/side constraints still require implementation. No unrelated requirement was marked complete.
