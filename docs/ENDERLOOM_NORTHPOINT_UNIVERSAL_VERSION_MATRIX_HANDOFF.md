# ENDERLOOM NORTHPOINT — Canonical Implementation Contract

> **Northpoint is how Enderloom behaves; it is not a module, service, tab, daemon, database, store, orchestrator, or second workflow.**

This is now the **single Enderloom implementation handoff** for both:
1. Northpoint / mod engineering / OpenAI Hand Off + Take Back; and
2. premium daily-launcher convergence so Enderloom becomes a complete, low-babysitting alternative to Modrinth/CurseForge rather than a collection of disconnected powerful features.

## Canonical readable handoff

- Drive: canonical file ID `1ceIp60vSyspF7zGHC9UXW9hyluDahoWk`
- File: `ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md`
- Size: `55,970` bytes
- Lines: `1,288`
- SHA-256: `ba85ed460e8d3b2eca2882887480c25e9e27612681c104c3d4576984028f4f26`

The repository carries a lossless gzip+base64 mirror under `docs/northpoint-v4-payload/`.

Reconstruct it with:

```bash
cat docs/northpoint-v4-payload/part-*.b64 \
  | base64 -d \
  | gzip -dc \
  > /tmp/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md

sha256sum /tmp/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md
```

The resulting SHA-256 must be:

```text
ba85ed460e8d3b2eca2882887480c25e9e27612681c104c3d4576984028f4f26
```

## Implementation law

- Do not create a Northpoint subsystem or a separate premium-launcher rewrite. Extend Enderloom's existing canonical owners.
- Create / Convert / Repair / Optimize / matrix builds / AI Hand Off / Take Back and ordinary launcher management all share the same resumable product state, evidence, snapshots and activity model where responsibilities overlap.
- Preserve content, identity, visuals, simulation, saves, integrations, external-launcher ownership and legitimate historical/newer feature lineage.
- Ordinary build, dependency, mapping, Mixin, runtime, performance, AI-return, cache, download, update, migration and secondary-matrix failures are engineering problems Enderloom should diagnose/recover from rather than reasons to idle.
- Primary requested mod-engineering target works first; matrix fan-out follows remembered preference.
- Performance gains may not come from deleting content or reducing gameplay/visual/simulation fidelity.
- Reuse and finish the existing OpenAI AI Operator / Codex integration. Hand Off and Take Back preserve one canonical job/thread lineage.
- Returned AI work is staged safely, reconciled, built/tested/profiled as applicable and only then accepted.
- Premium convergence includes Safe Update/Update All, instance history/undo, crash-aware Fix All, dependency/conflict intelligence, persistent activity/downloads, Play/Home polish, cross-instance settings sync, screenshots, Forever World Guard, sharing, Ctrl+K/settings search, signed self-update rollback, storage de-duplication, onboarding/migration, account/skin polish, offline resilience, large-library performance, security hardening, Compare Profiles/States and Performance Clinic/Spark integration.
- Codex should execute independent areas in parallel when ownership allows, but merge into one canonical job/settings/history/snapshot system instead of six competing subsystems.
- Do not create another planning document before implementing. Continue through the real Electron + native workflow and produce a fresh runnable Enderloom package.

**The intended UX remains simple: tell Enderloom what you want once; Enderloom figures out the engineering and gets it done.**
