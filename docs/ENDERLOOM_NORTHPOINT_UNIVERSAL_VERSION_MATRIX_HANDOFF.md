# ENDERLOOM NORTHPOINT — Canonical Implementation Contract

> **Northpoint is how Enderloom behaves; it is not a module, service, tab, daemon, database, store, orchestrator, or second workflow.**

The canonical implementation contract is deliberately simple: **make Enderloom do the work correctly, recover from normal failures automatically, preserve the mod, keep performance/fidelity high, and avoid making the user babysit internal engineering steps.**

## Canonical readable handoff

- Drive: https://drive.google.com/file/d/1ceIp60vSyspF7zGHC9UXW9hyluDahoWk/view
- File: `ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md`
- Size: `28,608` bytes
- Lines: `724`
- SHA-256: `75010cc0164cf3df2dafcc54a55e556429af8c25d200de1a339810e7602c2000`

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
75010cc0164cf3df2dafcc54a55e556429af8c25d200de1a339810e7602c2000
```

## Implementation law

- Do not create a Northpoint subsystem. Extend Enderloom's existing canonical project/job/build/runtime/evidence/AI systems.
- Create / Convert / Repair / Optimize / matrix builds / AI handoff / Take Back are entry points into the same resumable job model.
- Preserve content, identity, visuals, simulation, saves, integrations, and legitimate historical/newer feature lineage.
- Treat ordinary build, dependency, mapping, Mixin, runtime, performance, AI-return, cache, and secondary-matrix failures as engineering problems Enderloom should diagnose and repair automatically.
- Do not stop and ask the user about decisions Enderloom can resolve from project state, metadata, prior preferences, evidence, or a safe default.
- A blocker is not permission to idle: preserve good state, change strategy after unchanged failure, continue independent work, and resume automatically.
- Primary requested version/loader works first; matrix fan-out follows remembered preference.
- Performance gains may not come from deleting content or reducing gameplay/visual/simulation fidelity.
- Reuse and finish the existing OpenAI AI Operator / Codex integration. Hand Off and Take Back must preserve one canonical job/thread lineage.
- Returned AI work is staged safely, reconciled, built/tested/profiled as applicable, automatically repaired when possible, and only then accepted.
- If AI returns bad work, send precise failure evidence back to the same thread for correction instead of dumping the problem on the user.
- Authentication stays secure and lane-correct: provider account sign-in, explicit API auth, browser session, and MCP/plugin OAuth are not falsely conflated.
- Do not create another planning document before implementing. Follow the eight implementation passes in the canonical handoff and finish the real Electron workflow.

**The intended UX is simple: tell Enderloom what you want once; Enderloom figures out the engineering and gets it done.**
