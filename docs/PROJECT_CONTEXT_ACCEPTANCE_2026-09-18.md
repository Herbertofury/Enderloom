# Project relationships and config ownership — 2026-09-18

Project details now contain **Used in your library**. The native `get_project_context` operation projects installed copies from existing instance/server inventory and confirmed provider associations. It reports enabled, disabled and missing files, current version metadata, associated configs and world server-config scope. Buttons open the correct instance or the exact instance/server config editor. Linking or unlinking a provider source refreshes the open relationship panel.

`config_ownership.rs` is the shared owner resolver for Config, project relationships and CLI. The renderer displays its result instead of maintaining a second heuristic. Matching prefers exact mod IDs, then known folders, then unambiguous project-title hints. Enabled copies take precedence over disabled duplicates. Sibling names and world folder names cannot steal another mod's settings. User corrections use the existing preferences store, including explicit shared/unassigned files and remembered missing owners. Real mod artwork still comes from the installed-content icon pipeline. Grouped and flat views remain available.

Dependencies and dependents are read from installed Fabric, Forge and NeoForge manifests, with source file, manifest, direction, required/optional/conflict category, raw range and declared side. They are author declarations, not tested runtime compatibility. Format references: [Fabric manifest](https://docs.fabricmc.net/develop/loader/fabric-mod-json) and [NeoForge mod files](https://docs.neoforged.net/docs/1.20.4/gettingstarted/modfiles).

Verified:

- `scripts/config-associations-qa.js`: real native resolver, duplicate copies, siblings, misleading world names, ambiguous titles, persisted corrections and automatic suggestion.
- `scripts/project-context-qa.js`: native service and CLI return the same projection; linked/unlinked providers, actual file enable/remove states, instance/world/server configs, corrected ownership, Fabric/Forge declarations and unreadable JAR warnings pass. Config bytes remain unchanged.
- `scripts/project-context-ui-qa.js`: real Electron and native service; relationships, source isolation, dependency detail, direct instance and server config navigation, shared correction and instance opening pass without renderer errors. Screenshot: `output/playwright/project-context.png`.
- Config icon/group/flat-view checks and all 41 Workbench checks pass. The 3,512-row Electron view returns in 232 ms with search, editing, windowed rows and End/Home navigation intact.
- The 3,502-file native regression passes fresh-hash invalidation, same-size/time edits, corrupt ZIP detection, concurrent editor reads, external toggles/deletion, unchanged provenance and restart cache. Measured inventory 524 ms, warm verification 2,431 ms, independent editor read 11 ms during verification. Cold timing during concurrent compilation is not a comparison baseline.
- Frontend/native builds and shared CLI capability coverage pass.

This advances PA-003 and the unified project context. PA-003 remains open: save-content footprint/registry evidence, Quilt/legacy/nested manifest relationships and evaluated version/side constraints are not implemented here. A world config link does not claim the mod's content is present in that save. No new source-of-truth database or parallel job system was introduced.
