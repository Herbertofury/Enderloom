# Creator Vault - AsianHalfSquat History Chunk 26

Status: corrected hard-acceptance checkpoint
Date: 2026-09-05
Repository: `Herbertofury/Enderloom`
Branch: `feature/creator-vault-asianhalfsquat-chunk-26`
Base durable chunk-25 checkpoint: `c972d4c00d6d95c543f2176a36d6f1dd003f0213`
Corrected final contract commit: `9fcaf2a87217c7995a2832ef4fc40c35cf80264f`
Corrected final hard-acceptance run: `33992612693`
Corrected baseline collision proof run: `33992567911`
Corrected post-merge diagnostic run: `33992346887`
Canonical research run: `33991498364`

## Scope and chronology

Chunk 26 continues strictly older than the sealed 2024-09-24 history boundary and does not rescan the 43 AsianHalfSquat video IDs already accepted through chunk 25.

Independent channel chronology establishes two ordinary upload slots immediately below the chunk-25 boundary:

- 2024-09-06 - analytics index exposes only the truncated title fragment `The Best Minecraft Mods T..`.
- 2024-09-04 - fully source-resolved as `youtube:bd83XKp65jw`, `Top 10 Minecraft Mods (1.21.1) - 2024`.

The 2024-09-06 entry remains deliberately `source-identity-pending`. Its bounded archival challenge pass did not recover a trustworthy exact video ID, full title, or creator-authored description. The research ledger preserves the independent analytics observations of 243130 views, 10811 likes, and 391 comments without inventing an identity. Chunk 27 must resolve this gap before progressing to uploads older than 2024-09-04.

## Exact 2024-09-04 creator source

Video: `https://www.youtube.com/watch?v=bd83XKp65jw`

Exactly ten creator-authored Top 10 chapters are promoted, preserving the creator timestamps and loader labels:

1. Dungeons and Taverns - `0:14` / 14s - NeoForge, Fabric
2. Relics - `0:38` / 38s - NeoForge
3. Cascades - `1:09` / 69s - NeoForge, Fabric
4. Remove Loading Screen - `1:31` / 91s - NeoForge, Fabric
5. Chalk - `1:58` / 118s - NeoForge
6. Laser Bridges & Doors - `2:20` / 140s - NeoForge, Fabric
7. Solar Cooker - `2:41` / 161s - NeoForge, Fabric
8. Antique Atlas 4 - `3:07` / 187s - NeoForge, Fabric
9. Particular - `3:44` / 224s - Fabric
10. The Undergarden - `4:09` / 249s - NeoForge

Every runtime video link is the exact base video plus the creator chapter second, for example `https://www.youtube.com/watch?v=bd83XKp65jw&t=91s` for Remove Loading Screen.

Excluded source evidence remains explicit:

- Bliss Shaders - supporting/setup project after the completed Top 10, not an eleventh recommendation.
- Minecraft Forge - generic platform link, not a recommendation identity.
- Fabric - generic platform link, not a recommendation identity.
- Minecraft Volume Beta - Aria Math - music attribution, not a Minecraft project recommendation.

Research source: `catalog/creator-vault/research/asianhalfsquat.chunk26-source.json`
Production source: `catalog/creator-vault/recommendation-sources/asianhalfsquat.history-batch26.json`

## Canonicalization: corrected 5-new / 5-reuse result

The untouched chunk-25 runtime is exactly 804 mentions / 580 canonical projects.

The first exact-name probe reported four directly matching existing labels and six unmatched labels. Provider/lineage research then proved the creator's historical `Remove Loading Screen` wording is an alias of the already-existing global `remove-reloading-screen` / Remove Reloading Screen (RRLS) canonical project. The frozen chunk-25 runtime itself contains RRLS before chunk 26 is applied.

Final reuse identities:

- Dungeons and Taverns -> `dungeons-and-taverns`
- Cascades -> `cascades`
- Remove Loading Screen -> existing `remove-reloading-screen`
- Chalk -> `chalk`
- Particular -> `particular`

Final globally new identities:

- Relics -> `relics`
- Laser Bridges & Doors -> `laser-bridges-and-doors`
- Solar Cooker -> `solar-cooker`
- Antique Atlas 4 -> `antique-atlas-4`
- The Undergarden -> `the-undergarden`

Therefore chunk 26 adds five global canonical projects, not six, and advances the registry from 580 to 585.

## Remove Loading Screen / RRLS identity correction

The corrected mapping is:

- creator historical source label: `Remove Loading Screen`
- canonical project: `Remove Reloading Screen`
- canonical ID: `remove-reloading-screen`
- alias retained: `Remove Loading Screen`

Direct verified homes:

- Modrinth: `https://modrinth.com/mod/rrls`
- CurseForge: `https://www.curseforge.com/minecraft/mc-mods/rrls`
- Source: `https://github.com/dima-dencep/rrls`

The identity is supported by contemporaneous RRLS 1.21 v5.0.1 releases for both Fabric and NeoForge, matching the creator's loader labels, plus 1.21-era pack metadata that uses the shorthand `Remove Loading Screen` while embedding the exact Remove Reloading Screen v5.0.1 artifact.

Permanent anti-false-merge guards reject:

- KennyTV / Force Close Loading Screen: `forcecloseworldloadingscreen`
- the unrelated newer `No loading screen` project
- creation of a duplicate `remove-loading-screen` canonical card

## Bounded provider closure

Candidate/production closure contains exactly seven cards / 19 direct destinations:

- Relics - CurseForge + Modrinth + GitHub
- Remove Reloading Screen - CurseForge + Modrinth + GitHub
- Cascades - existing Modrinth + GitHub source enrichment
- Laser Bridges & Doors - CurseForge + Modrinth + GitHub
- Solar Cooker - CurseForge + Modrinth + GitHub
- Antique Atlas 4 - CurseForge + Modrinth + GitHub
- The Undergarden - CurseForge + Modrinth + GitHub

Corrected baseline collision proof run `33992567911` hides chunk-26 production source/provider files, restores the exact frozen chunk-25 creator ledger, and proves against the untouched 804/580 registry:

- candidateProjects: 7
- destinations: 19
- zeroProviderProjects: []
- collisions: []

The normal post-source collision gate proves the same 7 / 19 / 0 result after merge.

Runtime provider deduplication yields 1099 distinct provider destinations because RRLS already existed in the frozen registry with provider coverage; candidate-overlay destination count must not be arithmetically added to the old runtime total.

Additional anti-false-merge rules:

- Cascades retains the existing Hybrid Beta identity at `https://modrinth.com/datapack/hybrid-beta` and gains only `https://github.com/Crystalis7/Hybrid-Beta`. The later 2026 CurseForge `Cascades - CF Reupload` / `hybrid-terrain` is excluded.
- Antique Atlas 4 remains on the established fourth-generation `sleepingdragoninn/antique-atlas` lineage; unrelated forks/copies are excluded.

Research candidates: `catalog/creator-vault/research/asianhalfsquat.chunk26-provider-candidates.json`
Production overlay: `catalog/creator-vault/project-sources/provider-closure-26a-asianhalfsquat.json`

## Corrected observed runtime

The corrected post-merge diagnostic measured, rather than inferred:

- creators: 14
- indexed creators: 3
- videos: 53
- recommendation mentions: 814
- canonical projects: 585
- verified projects: 583
- unresolved projects: 2
- multi-provider projects: 400
- provider destinations: 1099
- verified homes: 583
- native recommendation sources: 22

The only unresolved projects remain exactly:

- Better Book Recipe
- Plank and Junk

AsianHalfSquat coverage is now:

- expected videos: 350
- indexed videos: 44
- mentions: 555
- linked mentions: 555 / 555
- canonical projects represented: 363
- linked canonical projects: 363

The AHS distinct-canonical count advances from 355 to 363 because this source introduces eight identities new to the AHS corpus even though only five are globally new.

## Zero-loss QA architecture

Chunk 25 is frozen exactly as:

- `scripts/creator-vault-qa-chunk25.js`
- `catalog/creator-vault/research/creators.chunk25-baseline.json`

Frozen chunk-25 blobs remain:

- QA: `a67b93e2c4b7002bf03406c9d0c0ee0458da3eab`
- creators: `676d14ac2ab40e5d7354370196ab7545747c9b30`

Permanent `scripts/creator-vault-qa.js`:

1. Requires chunk-26 production source/provider files.
2. Hides only chunk-26 production source/provider files.
3. Swaps the current creator ledger for the exact frozen chunk-25 ledger.
4. Loads the untouched 804/580 runtime and proves RRLS already exists there.
5. Executes the exact frozen chunk-25 QA recursively.
6. Restores current state in `finally`.
7. Locks the corrected 814/585/583/1099/400/2 runtime.
8. Locks AHS 44 videos, 555 mentions, 555 linked, 363 canonical.
9. Locks all ten source-label -> canonical-ID mappings, timestamps, loaders, and deep links.
10. Locks the RRLS alias and all ten provider sets/direct URLs.
11. Locks the 2024-09-06 chronology gap and its observed analytics values without guessing an identity.
12. Locks excluded Bliss/platform/music evidence.
13. Locks candidate and production provider files to exactly 7 entries / 19 destinations / zero zero-provider entries.
14. Renders the catalog and requires the expected names/source URLs.

The temporary post-merge and corrected pre-production proof harnesses are absent from the final contract tree.

Final permanent workflow has only:

1. AsianHalfSquat chunk 26 provider URL collision gate
2. Missing timestamp regression QA
3. Focused Creator Vault recursive QA
4. Catalog regression QA
5. Render portable catalogs

Corrected final success line:

`Creator Vault AsianHalfSquat chunk 26 QA passed: 814 mentions -> 585 canonical projects; 583 linked / 1099 destinations / 400 multi-provider / 2 unresolved. AHS linked mentions=555/555 across 363 canonical projects; all 10 creator chapter timestamps/deep links, 5-new/5-reuse canonicalization with Remove Loading Screen -> existing RRLS, Sep-6 chronology gap, 7-card/19-destination provider closure, and recursive chunk-25 baseline are locked.`

## Commit / proof chain

- chunk-25 durable base: `c972d4c00d6d95c543f2176a36d6f1dd003f0213`
- chunk-26 research staging: `b52297bc2c4ad88418bb6217cc0e69d7e9b3f392`
- provisional provider research: `58c98ea27838a0f41abda9971252592f892c1e76`
- provisional production/diagnostic: `e8719148c0d4e0ae53a4b2c7e0e77006a061d2c5`
- provisional old acceptance: `d7bd13c67425ad58819b85568833d040126b734b` - superseded by RRLS identity correction
- provisional old docs: `7667aac19b14bcdde5882caf7d76243e23b4a4b2` - superseded
- RRLS correction: `0f4a5a386724788bbd9d0a7ceb6d2dcaedc0532d`
- corrected diagnostic expectation: `81492c07045bdabde08c7e53fe642ba36d429871`
- corrected permanent QA/ledger acceptance candidate: `227abbff3af4760262701488c3d3d94519051f5b`
- corrected baseline collision proof: `311d9eae094394266a6e8588ac88995bb4f2783a`
- corrected clean final contract: `9fcaf2a87217c7995a2832ef4fc40c35cf80264f`

Proof runs:

- canonical research: `33991498364`
- corrected post-merge diagnostic: `33992346887`
- corrected permanent QA candidate: `33992506907`
- corrected frozen-baseline collision proof: `33992567911`
- corrected clean final hard acceptance: `33992612693`

The earlier provisional chunk-26 acceptance run `33991922893` is superseded and must not be used as the authoritative checkpoint because it treated Remove Loading Screen as a new zero-provider card.

## Exact next action for chunk 27

1. Branch from the durable chunk-26 docs checkpoint created after this hard acceptance.
2. Do not progress to any upload older than 2024-09-04 until the 2024-09-06 `The Best Minecraft Mods T..` chronology gap is resolved to trustworthy first-party identity/evidence.
3. Exclude all 44 already indexed AsianHalfSquat video IDs.
4. If the September 6 upload is recovered, stage research-only evidence first and canonical-probe it against the frozen corrected chunk-26 baseline of 814 mentions / 585 canonical projects.
5. Preserve exact creator timestamps/aliases; never manufacture missing timestamps or IDs.
6. Research providers only after canonical existing/new split is proven.
7. Run pre-production collision QA before provider production mutation.
8. Freeze exact chunk-26 QA + creator ledger, diagnose the merged runtime, then lock chunk-27 permanent recursive QA from observed values.
9. Persist the next durable GitHub + Google Drive checkpoint and stop at the next clean bounded boundary.
