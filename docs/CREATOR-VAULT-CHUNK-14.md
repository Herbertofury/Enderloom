# Creator Vault — AsianHalfSquat Chunk 14

Status: verified green  
Branch: `feature/creator-vault-asianhalfsquat-chunk-14`  
Pinned QA/data commit: `296d847f546e9d2fe0ffebad9811717e6d77ea93`  
GitHub Actions proof: `33962460077`

## Source batch

Chunk 14 adds exactly two already-enumerated AsianHalfSquat feature videos without rescanning prior IDs:

- `muOwi6IUWdc` — 2025-08-22 — **The Most Realistic Water Physics in Minecraft Yet!** — 5 creator-listed projects.
- `krWFchiDWHs` — 2025-08-07 — **The Most Overkill Minecraft Terrain Generator Just Got Even More Insane** — 10 creator-listed projects.

Neither creator description supplies per-project chapter timestamps. All 15 source mentions intentionally omit timestamp fields, normalize to `timestampSeconds=null`, and use the base video URL. The dedicated timestamp regression test plus the chunk-14 production assertions forbid fabricated `t=0s` links.

The next bounded source pair is already queued for chunk 15:

- `GtPvX62bO30` — 2025-07-25 — **This New Minecraft Terrain Generation Mod Is One of the Best Yet**.
- `l9VYc8La5mg` — 2025-07-18 — **Top 10 Minecraft Mods (1.21) - July 2025**.

## Canonical dedupe contract

The 15 fresh source mentions canonicalize as exactly **12 existing + 3 genuinely new identities**.

Existing cards reused:

- Physics Mod Pro -> `physics-mod`
- BSL Shaders -> `bsl-shaders`
- Solas Shader -> `solas-shader`
- Dynamic Surroundings -> `dynamic-surroundings`
- Better Third Person -> `better-third-person`
- Camera Utils -> `camera-utils`
- Distant Horizons -> `distant-horizons`
- Do a Barrel Roll -> `do-a-barrel-roll`
- Bliss Shaders -> `bliss-shaders`
- Complementary Shaders -> `complementary-shaders`
- Euphoria Patches -> `euphoria-patches`
- Photon Shaders -> `photon-shader`

New identities:

- AstraLex Shaders -> `astralex-shaders`
- JJThunder To The Max -> `jjthunder-to-the-max`
- Fresh Player Animations -> canonical current project `trailer-player-animations`

Fresh Player Animations is preserved as an alias of the current **Trailer Player Animations** project. Provider version history proves the older Fresh Player Animations releases belong to that same project; it is not a separate pack and it is not Fresh Moves.

## Provider closure

The pre-write provider collision gate proved **8 canonical projects / 15 missing verified destinations / zero URL collisions**.

Provider enrichment is split into:

- `provider-closure-14a-asianhalfsquat.json` — the three new identities.
- `provider-closure-14b-asianhalfsquat.json` — missing destinations on five existing cards.

Verified additions include:

- AstraLex Shaders: Modrinth + CurseForge.
- JJThunder To The Max: current Modrinth datapack + legacy CurseForge mod listing from the same project lineage.
- Trailer Player Animations / Fresh Player Animations: Modrinth + CurseForge.
- BSL Shaders: CurseForge + official BSL site added to the existing card.
- Dynamic Surroundings: OreCruncher Modrinth + source repository added to its existing card.
- Better Third Person: Modrinth added.
- Camera Utils: Modrinth + source added.
- Bliss Shaders: Modrinth + source added.

## Current verified contract

Whole Vault:

- **34 source videos**.
- **584 recommendation mentions -> 484 canonical projects**.
- **482** canonical projects linked.
- **838** exact direct destinations.
- **301** multi-provider canonical projects.
- Exactly **2 canonical unresolved** projects: `Better Book Recipe` and `Plank and Junk`.
- `nativeRecommendationSources = 10`.

AsianHalfSquat:

- **25 / 350 videos** indexed.
- **325 recommendation mentions** preserved.
- **325 / 325 mentions** have at least one verified direct project home.
- Those mentions represent **248 canonical projects**.

The two redacted `Structure Mods` links from chunk 13 remain source-level `identity-pending` evidence only and are not revisited without genuinely new evidence.

## Zero-loss QA architecture

Chunk 13 is frozen byte-for-byte as `scripts/creator-vault-qa-chunk13.js` with `catalog/creator-vault/research/creators.chunk13-baseline.json`. The chunk-14 wrapper temporarily hides only its three production files and swaps in the chunk-13 creator ledger, runs the complete chunk-13 suite unchanged (which recursively proves chunk 12, chunk 11, Episode 5, and Episode 3), restores current state in `finally`, then enforces the chunk-14/current-state contract.

## Real QA proof

GitHub Actions run `33962460077` passed on `296d847f546e9d2fe0ffebad9811717e6d77ea93`:

- PASS — Missing timestamp regression QA.
- PASS — entire nested Creator Vault baseline stack.
- PASS — AsianHalfSquat chunk 14: `584 -> 484; 482 linked / 838 destinations / 301 multi-provider / 2 unresolved`; AHS `325/325` linked across 248 canonical projects.
- PASS — all 15 fresh production rows preserve `timestampSeconds=null`, use the base video URL, and contain no `t=0s` deep links.
- PASS — Catalog regression QA.
- PASS — Portable catalog render.

## Exact next action

Start `feature/creator-vault-asianhalfsquat-chunk-15` from this checkpoint. Ingest only `GtPvX62bO30` (2025-07-25) and `l9VYc8La5mg` (2025-07-18). Recover their exact creator-authored recommendation lists through the proven YouTube indexed-description/public-source route rather than retrying the rejected per-video `yt-dlp` metadata path. Canonicalize against the current 484-project registry before creating identities, attach every independently verified project home through bounded append-only overlays, run the entire nested baseline/current QA stack, checkpoint GitHub + the same Drive wiki, and continue backward toward the 350-video target.
