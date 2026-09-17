# ENDERLOOM NORTHPOINT — Canonical Implementation Contract

> **Northpoint is how Enderloom behaves; it is not a module, service, tab, daemon, database, store, orchestrator, or second workflow.**

This is the single Enderloom implementation handoff for Northpoint/mod engineering/OpenAI round trips and the complete daily launcher experience.

## Canonical readable handoff

- Drive: https://drive.google.com/file/d/1ceIp60vSyspF7zGHC9UXW9hyluDahoWk/view
- File: `ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md`
- Size: `75,531` bytes
- Lines: `1,704`
- SHA-256: `dc33da32ac4b4120abab7cb93b884471c5d8d28a313841f4ee40acd91cd747c6`

The repository carries a lossless gzip+base64 mirror under `docs/northpoint-v4-payload/`.

```bash
cat docs/northpoint-v4-payload/part-*.b64 \
  | base64 -d \
  | gzip -dc \
  > /tmp/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md
sha256sum /tmp/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md
```

The resulting SHA-256 must be:

```text
dc33da32ac4b4120abab7cb93b884471c5d8d28a313841f4ee40acd91cd747c6
```

## Current implementation law

- Do not create a Northpoint subsystem or a separate launcher rewrite. Extend Enderloom's existing canonical owners.
- The app should feel complete, polished, calm, fast, recoverable and trustworthy without literally branding normal features as "Premium".
- Mod behavior intelligence is first-class across Discover, installed content, update/remove planning and profile/world management.
- Classify exact artifacts by runtime side, vanilla impact, persistent save/world footprint, worldgen/biome/dimension/entity effects and removal risk using evidence rather than provider-description guesses.
- Keep **Vanilla Untouched** separate from **Forever World Safe**. Additive mods can still leave persistent blocks/entities/worldgen/dimensions in a save.
- A save-aware Removal Audit can determine whether a specific installed world is safe to remove a mod from, will lose mod content, requires migration, or remains unknown.
- A Forever World profile preference should prioritize low-impact results, snapshot risky operations and flag updates whose behavior becomes more invasive without hiding the rest of the catalog.
- Side/world/vanilla classification must be conservative, explainable, cached by exact artifact hash and computed without executing untrusted mod code.
- Safe Update, Update All, Fix All, history/undo, task recovery, world protection, diagnostics, OpenAI Hand Off/Take Back and mod engineering reuse shared canonical systems rather than spawning parallel mini-apps.
- Do not create another planning document before implementing. Continue through the real Electron + native workflow and produce a fresh runnable Enderloom package.

**The intended UX is simple: tell Enderloom what you want once; Enderloom figures out the engineering and gets it done.**
