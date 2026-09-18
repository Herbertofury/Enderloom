# Canonical identity acceptance — 2026-09-18

PA-001 is implemented in `native/src/db/graph.rs`, `native/src/artifacts.rs`, the shared service/CLI operations and the project detail identity panel. SQLite schema 22 preserves project observations when a provider version is unknown, separates provider release identities, and rejects conflicting immutable measurements. Modified bytes remain in history but cannot become verified release artifacts. Late verification responses cannot overwrite another project's UI.

Verified against the built native service and CLI:

- `node scripts/artifact-graph-qa.js`: actual installed Create `create-1.21.1-6.0.10.jar`, CurseForge project 328085/file 7963363, SHA-256 `ef87fe5709f1ba1f5b8bb20a2925b5afb4669e178fd6d8bf10c167759eefe37a`; changed bytes, original restoration, repeated verification, sibling isolation and identical CLI projection pass in an owned fixture.
- `node scripts/graph-regression-qa.js`: versionless projects, changed project claims, existing aliases, provider version collisions, immutable conflicts, schema 21 migration, restart idempotence and source preservation pass.
- `node scripts/project-identity-ui-qa.js`: real Electron, contract fixtures; delayed verification across navigation and truthful version-unknown labels pass with zero renderer errors.
- Native service/CLI builds, frontend build, 41 Workbench checks and CLI operation coverage pass.

Evidence: `output/curseforge/artifact-graph.json`, `output/graph-regression-qa.json`. Outputs are ignored local artifacts. Rust unit tests compile but this host's test executable fails to load with pre-existing Windows `0xc0000139`; these are not reported as executed tests. Runtime service/CLI tests above provide the behavioral proof.

This accepts PA-001 only. PA-002 still needs a product workflow for explicit provider/source associations; fixture-seeded aliases do not constitute that workflow. The wider Phase A and release gates remain open.
