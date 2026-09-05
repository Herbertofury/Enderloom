# Creator Vault — AsianHalfSquat Chunk 13

Status: verified green  
Branch: `feature/creator-vault-asianhalfsquat-chunk-13`  
Pinned QA/data commit: `39d9b8d5a8ec4c463dd3ea81a76faac2688f4e0d`  
GitHub Actions proof: `33962008942`

## Source batch

Chunk 13 ingests exactly two previously enumerated late-2025 AsianHalfSquat videos without retrying the rejected per-video `yt-dlp` path:

- `8fwC4CzRDmE` — 2025-09-24 — **Minecraft Mod Combinations That Work Perfectly Together #8** — 33 explicitly named project mentions across 10 grouped creator chapter timestamps.
- `o9V0iP7rik4` — 2025-09-04 — **Top 10 Minecraft Mods (1.20.1) - September 2025** — 10 exact creator chapter recommendations.

The combo video also contains a generic `Structure Mods` line at 6:33 with two creator links whose destination names/URLs remain redacted by the public indexed surface. Those two links are preserved as source-level `identity-pending` evidence and deliberately do **not** become a generic/fake project card.

## Canonical dedupe contract

The 43 named source mentions canonicalize as exactly **12 existing + 31 genuinely new canonical projects**.

Existing identities reused:

- Angel's Weather -> `angels-weather`
- Particle Rain -> `particle-rain`
- Immersive UI -> `immersive-ui`
- HT's TreeChop -> `treechop`
- Physics Mod -> `physics-mod`
- Fresh Animations -> `fresh-animations`
- Complementary Shaders -> `complementary-shaders`
- Photon -> `photon-shader`
- Presence Footsteps -> `presence-footsteps`
- Distant Horizons -> `distant-horizons`
- Amendments -> `amendments`
- More Critters -> `more-critters`

The other 31 are new identities. The pre-write provider collision gate proved **31 candidate projects / 66 verified destinations / zero URL collisions** against the 450-project pre-chunk-13 registry.

## Provider rules retained

Provider enrichment is split into four append-only overlays:

- `provider-closure-13a-asianhalfsquat.json`
- `provider-closure-13b-asianhalfsquat.json`
- `provider-closure-13c-asianhalfsquat.json`
- `provider-closure-13d-asianhalfsquat.json`

Notable challenge-pass decisions:

- Physical Falling Trees uses Modrinth plus the creator's Planet Minecraft page. An apparent CurseForge mirror is excluded because the creator states they do not publish there.
- Cave Spelunking keeps its exact CurseForge project only; no trustworthy direct Modrinth slug was established.
- VeinMiner is pinned to MiraculixxT's long-running unified project with Modrinth, current CurseForge home, and source repository; unrelated same-purpose projects are excluded.
- RoadArchitect stays the base project; RoadArchitect Encounters is not merged unless the creator source explicitly names it.
- Euphoria Patches exposes Modrinth, CurseForge, and its official download page.
- Larion World Generation exposes Modrinth, CurseForge, and source; the later unofficial Forge port is excluded.
- ATi Structures is the main project; ATi Structures - Vanilla Edition remains separate.

## Current verified contract

Whole Vault:

- **32 source videos**.
- **569 recommendation mentions -> 481 canonical projects**.
- **479** canonical projects linked.
- **823** exact direct destinations.
- **293** multi-provider canonical projects.
- Exactly **2 canonical unresolved** projects: `Better Book Recipe` and `Plank and Junk`.
- `nativeRecommendationSources = 9`.

AsianHalfSquat:

- **23 / 350 videos** indexed.
- **310 recommendation mentions** preserved.
- **310 / 310 mentions** have at least one verified direct project home.
- Those mentions represent **245 canonical projects**.
- Separate source-level unresolved evidence: two redacted `Structure Mods` links at 6:33 in `8fwC4CzRDmE`, status `identity-pending`.

## Zero-loss QA architecture

Chunk 12 is frozen byte-for-byte as `scripts/creator-vault-qa-chunk12.js` with `catalog/creator-vault/research/creators.chunk12-baseline.json`. The chunk-13 wrapper temporarily hides only its five production shards and swaps in the chunk-12 creator ledger, runs the complete chunk-12 suite unchanged (which recursively proves chunk 11, Episode 5, and Episode 3), restores current state in `finally`, then enforces the chunk-13 contract.

## Real QA proof

GitHub Actions run `33962008942` passed on `39d9b8d5a8ec4c463dd3ea81a76faac2688f4e0d`:

- PASS — Missing timestamp regression QA.
- PASS — Episode 3 preserved baseline: `431 -> 372; 370 linked / 586 destinations / 192 multi-provider / 2 unresolved`.
- PASS — Episode 5 preserved baseline: `475 -> 413; 411 linked / 665 destinations / 227 multi-provider / 2 unresolved`.
- PASS — AsianHalfSquat chunk 11 preserved baseline: `507 -> 435; 433 linked / 721 destinations / 250 multi-provider / 2 unresolved`; AHS `248/248` linked across 192 canonical projects.
- PASS — AsianHalfSquat chunk 12 preserved baseline: `526 -> 450; 448 linked / 757 destinations / 263 multi-provider / 2 unresolved`; AHS `267/267` linked across 209 canonical projects.
- PASS — AsianHalfSquat chunk 13: `569 -> 481; 479 linked / 823 destinations / 293 multi-provider / 2 unresolved`; AHS `310/310` linked across 245 canonical projects; source-level `Structure Mods` links = 2 identity-pending.
- PASS — Catalog regression QA.
- PASS — Portable catalog render.

## Exact next action

Start the next AsianHalfSquat history chunk from this verified checkpoint. Enumerate only uploads older than the already-indexed 2025-09-04 video, exclude all 23 known IDs, recover a small bounded creator-authored source slice through the proven uploads/indexed-description routes, canonicalize against the current 481-project registry before creating any identity, attach every independently verified destination through small append-only overlays, run the complete nested baseline/current QA stack, checkpoint GitHub + the same Drive wiki, and continue toward the 350-video target. Do not revisit the two redacted `Structure Mods` links unless genuinely new source evidence appears.
