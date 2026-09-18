# Canonical identity acceptance — 2026-09-18

PA-001 is implemented in `native/src/db/graph.rs`, `native/src/artifacts.rs`, the shared service/CLI operations and the project detail identity panel. SQLite schema 22 preserves project observations when a provider version is unknown, separates provider release identities, and rejects conflicting immutable measurements. Modified bytes remain in history but cannot become verified release artifacts. Late verification responses cannot overwrite another project's UI.

Verified against the built native service and CLI:

- `node scripts/artifact-graph-qa.js`: actual installed Create `create-1.21.1-6.0.10.jar`, CurseForge project 328085/file 7963363, SHA-256 `ef87fe5709f1ba1f5b8bb20a2925b5afb4669e178fd6d8bf10c167759eefe37a`; changed bytes, original restoration, repeated verification, sibling isolation and identical CLI projection pass in an owned fixture.
- `node scripts/graph-regression-qa.js`: versionless projects, changed project claims, existing aliases, provider version collisions, immutable conflicts, schema 21 migration, restart idempotence and source preservation pass.
- `node scripts/project-identity-ui-qa.js`: real Electron, contract fixtures; delayed verification across navigation and truthful version-unknown labels pass with zero renderer errors.
- Native service/CLI builds, frontend build, 41 Workbench checks and CLI operation coverage pass.

Evidence: `output/curseforge/artifact-graph.json`, `output/graph-regression-qa.json`. Outputs are ignored local artifacts. Rust unit tests compile but this host's test executable fails to load with pre-existing Windows `0xc0000139`; these are not reported as executed tests. Runtime service/CLI tests above provide the behavioral proof.

## Provider/source associations (PA-002)

Schema 23 adds reversible source-association edges and an audit history. Provider records, release IDs, measurements and locations are retained separately; a canonical connected projection exposes associated sources together. Comparisons resolve official provider metadata and stable project IDs. Linking requires an explicit user confirmation and reason; matching names or hashes do not automatically join projects. Unlinking changes the projection without modifying installed files or deleting evidence.

`ProjectSourceLinks.tsx` exposes comparison cards with provider icons, authors, source URLs, matching verified hashes, confirmation, Why and Unlink. Shared service/CLI operations are `preview_project_source_link`, `link_project_sources`, and `unlink_project_source`. Verification from either associated provider checks known installed copies from both.

- `node scripts/project-source-qa.js`: actual native service and CLI with isolated provider-cache fixtures; read-only comparison, canonical slug resolution, similarly named sibling isolation, confirmation, URL validation, version separation, restart, changed-file detection across providers, transitive associations, lossless unlink/relink, audit idempotence and preserved files pass.
- `node scripts/project-source-ui-qa.js`: real Electron controls backed by the native service; compare/confirm/Why/unlink/error/navigation pass. Visual evidence: `output/playwright/project-sources.png`.
- `node scripts/project-source-live-qa.js`: live read-only official APIs resolved CurseForge Create 328085 and Modrinth Create LNytGWDc, both reporting simibubi, with real icons and source pages. No association was silently saved.
- Existing graph migration, actual Create artifact and project-navigation tests pass against schema 23. Operation coverage includes all three new routes.

This accepts PA-001 and PA-002. PA-003 instance/world/server/config/dependency graph links are the next incomplete dependency. The wider Phase A and release gates remain open.
