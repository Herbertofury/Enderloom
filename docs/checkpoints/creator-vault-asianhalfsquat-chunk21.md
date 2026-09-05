# Creator Vault — AsianHalfSquat Chunk 21 Verified Checkpoint

Repository: `Herbertofury/Enderloom`
Branch: `feature/creator-vault-asianhalfsquat-chunk-21`
Pinned acceptance commit: `eabb1833db1f0ca478c7ea3b0d3b0114dd307135`
Canonical-probe run: `33985909960`
Pre-production provider-collision run: `33986077658`
Corrected post-merge diagnostic run: `33986249179`
Final acceptance run: `33986346774`

## Source batch

Chunk 21 continues backward from the sealed 2024-12-17 boundary without rescanning any of the 37 previously indexed AsianHalfSquat videos.

- 2024-11-26 — `7Yr4KIjdWcE` — **You've Never Seen Clouds Like THIS In Minecraft...** — two explicitly named support projects: Distant Horizons and Shoulder Surfing Reloaded. The creator's featured cloud/weather download link remains `identity-pending` because the indexed public surface hides its exact project label/direct URL; no project identity is guessed.
- 2024-10-26 — `rYXEREsiGrE` — **This Unknown Minecraft Mod Adds Raytracing With Incredible Performance** — nine creator-linked named projects: Photonics, Sodium, Iris, BSL 8.2.09, Chisels & Bits, NostalgiaVX, Alacrity, Terralith, and Distant Horizons.

Neither creator description exposes per-project chapter timestamps. All 11 canonicalized mentions preserve `timestampSeconds=null`, use their base YouTube video URL, and never fabricate `t=0s`.

## Canonical dedupe contract

Research against the untouched chunk-20 `739 mentions / 551 projects` registry measured 11 source mentions as 7 direct existing hits plus 4 name misses.

`BSL 8.2.09` is a creator-stated version label and canonicalizes to existing `BSL Shaders`, leaving exactly three genuinely new project families:

- Photonics
- NostalgiaVX
- Alacrity

The 11 fresh mentions represent 10 fresh canonical identities because Distant Horizons appears in both videos.

## Provider closure

Pre-production collision QA proved exactly `7 overlays / 8 candidate destinations / 0 cross-project URL collisions`.

New families:
- Photonics — Modrinth only.
- NostalgiaVX — RRe36's exact creator-owned official project page only.
- Alacrity — Modrinth + CurseForge.

Verified reused-card enrichments:
- Sodium — official CurseForge + `CaffeineMC/sodium` source.
- Chisels & Bits — `ChiselsAndBits/Chisels-and-Bits` source.
- Shoulder Surfing Reloaded — `Exopandora/ShoulderSurfing` source.
- BSL Shaders — alias-only `BSL 8.2.09`; no duplicate provider destination.

A diagnostic challenge pass caught a temporary provider-overlay ID error (`chisels-bits`) before acceptance. It was corrected to the actual canonical ID `chisels-and-bits`; the corrected runtime proves the GitHub source is attached to the existing Chisels & Bits card. No source recommendation or identity decision changed.

## Current verified Vault totals

- 48 source videos total.
- 750 recommendation mentions.
- 750 mentions → exactly 554 canonical projects.
- 552 canonical projects have verified direct homes.
- 1,022 exact direct destinations are exposed.
- 372 canonical projects are multi-provider.
- Exactly 2 unresolved canonical projects remain: Better Book Recipe and Plank and Junk.
- `nativeRecommendationSources = 17`.

## AsianHalfSquat coverage

- 39 / 350 source videos indexed.
- 491 recommendation mentions preserved.
- 491 / 491 indexed AsianHalfSquat mentions have at least one verified direct project home.
- Those mentions represent 327 AsianHalfSquat canonical projects.

## Zero-loss QA

`scripts/creator-vault-qa-chunk20.js` and `catalog/creator-vault/research/creators.chunk20-baseline.json` freeze chunk 20 byte-for-byte. Chunk 21 hides only its source/provider production files, swaps only the chunk-20 creator ledger, runs the frozen chunk-20 wrapper unchanged (recursively proving all older checkpoints), restores current state in `finally`, then enforces chunk 21.

The permanent chunk-21 gate locks aggregate totals, AHS coverage, all 11 canonical mappings, all 11 null-timestamp/base-link rules, BSL 8.2.09 aliasing, the hidden featured-cloud `identity-pending` evidence rule, exact provider families, the corrected Chisels & Bits canonical source enrichment, and the same two historical unresolved project exceptions.

## Real QA proof

- PASS — canonical research run `33985909960`: untouched 739 / 551 baseline; 11 source mentions = 7 existing hits + 4 name misses; BSL version label resolved as alias, yielding 3 true new families.
- PASS — provider collision run `33986077658`: 7 overlays / 8 destinations / 0 collisions.
- PASS — corrected post-merge diagnostic run `33986249179`: exact 750 → 554; 552 linked / 1,022 destinations / 372 multi-provider / 2 unresolved; AHS 491/491 across 327 canonical projects; Chisels & Bits GitHub enrichment visibly attached.
- PASS — final acceptance run `33986346774` on `eabb1833db1f0ca478c7ea3b0d3b0114dd307135`: provider collision gate; missing-timestamp regression; full recursive Creator Vault QA through chunk 21; catalog regression QA; portable catalog rendering.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-22` from the repository checkpoint commit containing this file. Continue backward from the already-indexed 2024-10-26 boundary without rescanning any of the 39 indexed AsianHalfSquat IDs. Enumerate only the next small older source slice, recover creator-authored recommendation evidence, canonicalize every named mention against the frozen 554-project registry before provider research, preserve hidden/ambiguous links as source-level evidence rather than guessed project cards, add only independently verified direct homes through bounded append-only overlays, run the same collision + recursive QA + catalog + portable gates, checkpoint GitHub + the canonical Drive wiki, and continue toward the 350-video target.
