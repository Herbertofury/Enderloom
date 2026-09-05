# Creator Vault — AsianHalfSquat Chunk 25

## Durable checkpoint

- Repository: `Herbertofury/Enderloom`
- Branch: `feature/creator-vault-asianhalfsquat-chunk-25`
- Base durable chunk-24 checkpoint: `17f45b84d82cae06bfbc9f70997686a59629f287`
- Pinned green chunk-25 acceptance commit: `1b63ec9693990ea509319ef40a269197e1582c94`
- Research/canonical run: `33990441588`
- Pre-production provider collision run: `33990622190`
- Post-merge diagnostic run: `33990714461`
- Final hard acceptance run: `33990801348`

## Source batch

Chunk 25 continues strictly older than the sealed 2024-09-26 boundary and does not rescan any of the 42 previously indexed AsianHalfSquat video IDs.

One bounded ordinary upload is ingested:

- Published: `2024-09-24`
- Video ID: `pw52tfw26Wg`
- Title: `10 Awesome Minecraft Mods You've Probably Never Heard Of #25`
- URL: `https://www.youtube.com/watch?v=pw52tfw26Wg`

The creator's indexed description names exactly ten Minecraft projects:

1. Vouniern's Turrets
2. Splinecart
3. Astrocraft
4. Rolling Down in The Deep
5. Beautiful Enchanted Books
6. Tide
7. Cosmic Horizons
8. Cardiac
9. Circumnavigate
10. Valarian Conquest

The creator description exposes no per-project chapter timestamps. The production source therefore omits raw `timestampSeconds` for all ten mentions. Runtime resolves every one to `null`, uses the base YouTube video URL, and never fabricates `t=0s`.

Generic `Minecraft Forge` and `Fabric` platform links are excluded as platform-link-not-project evidence. `Music - Minecraft - Aria Math - C418` remains non-project evidence only.

## Canonical probe

The untouched chunk-24 registry was exactly:

- 794 recommendation mentions
- 573 canonical projects
- 571 linked projects
- 1,068 direct destinations
- 389 multi-provider projects
- 2 unresolved projects

Research run `33990441588` measured the ten fresh source labels as exactly **3 globally existing + 7 source-name-new candidates**.

Existing global cards reused:

- Astrocraft -> `astrocraft`
- Rolling Down in The Deep -> `rolling-down-in-the-deep`
- Circumnavigate -> `circumnavigate`

Seven new canonical families:

- Vouniern's Turrets -> `vounierns-turrets`
- Splinecart -> `splinecart`
- Beautiful Enchanted Books -> `beautiful-enchanted-books`
- Tide -> `tide`
- Cosmic Horizons -> `cosmic-horizons`
- Cardiac -> `cardiac`
- Valarian Conquest -> `valarian-conquest`

`Rolling Down in The Deep` was globally existing but had not previously appeared in the AsianHalfSquat corpus. Therefore AHS's own distinct canonical count grows by eight (seven global-new identities plus this one global-reuse/new-to-AHS identity), from 347 to 355.

## Provider closure

Pre-production collision run `33990622190` proved exactly:

- 7 candidate projects
- 14 candidate direct destinations
- 0 cross-project URL collisions

Production provider overlay: `catalog/creator-vault/project-sources/provider-closure-25a-asianhalfsquat.json`.

Exact new provider families:

### Vouniern's Turrets
- CurseForge: `https://www.curseforge.com/minecraft/mc-mods/vounierns-turrets`

### Splinecart
- Modrinth: `https://modrinth.com/mod/splinecart`
- GitHub source: `https://github.com/FoundationGames/Splinecart`
- The later `peterwolf's Splinecart` CurseForge project is a separate 2026 fork and is explicitly excluded.

### Beautiful Enchanted Books
- Modrinth resource pack: `https://modrinth.com/resourcepack/beautiful-enchanted-books`
- CurseForge resource pack: `https://www.curseforge.com/minecraft/texture-packs/beautiful-enchanted-books`
- The later `Beautiful Enchanted Books [MOD EDITION]` project is separate and is explicitly excluded.

### Tide
- Modrinth: `https://modrinth.com/mod/tide`
- CurseForge: `https://www.curseforge.com/minecraft/mc-mods/tide`
- GitHub source: `https://github.com/Lightning-64/Tide-2`
- `Tide 2` is retained as a same-lineage alias while the creator's historical source wording remains `Tide`.

### Cosmic Horizons
- CurseForge: `https://www.curseforge.com/minecraft/mc-mods/cosmic-horizons`
- The old same-name 2017 modpack is explicitly excluded.

### Cardiac
- Modrinth: `https://modrinth.com/mod/cardiac`
- CurseForge: `https://www.curseforge.com/minecraft/mc-mods/cardiac`
- GitHub source: `https://github.com/Octo-Studios/cardiac`

### Valarian Conquest
- Modrinth: `https://modrinth.com/mod/valarian-conquest`
- CurseForge: `https://www.curseforge.com/minecraft/mc-mods/valarian-conquest`

The three reused global cards were not redundantly reopened: Astrocraft already has CurseForge + Modrinth; Rolling Down in The Deep already has CurseForge + Modrinth; Circumnavigate already has CurseForge + GitHub + Modrinth.

## Observed merged state

Diagnostic run `33990714461` recursively proved the exact chunk-24 baseline with chunk-25 production hidden, restored current state, and measured:

- 52 source videos total
- 804 recommendation mentions
- 580 canonical projects
- 578 linked canonical projects
- 1,082 exact direct destinations
- 394 multi-provider projects
- 2 unresolved projects: Better Book Recipe; Plank and Junk
- 21 native recommendation source documents
- AsianHalfSquat: 43 / 350 source videos
- AsianHalfSquat: 545 / 545 linked recommendation mentions
- AsianHalfSquat: 355 distinct linked canonical projects

All ten fresh runtime mappings, provider arrays, null timestamps, and base-video links were observed directly in the diagnostic output before final counts were pinned.

## Zero-loss QA

Chunk 24 is frozen byte-for-byte as:

- `scripts/creator-vault-qa-chunk24.js`
- `catalog/creator-vault/research/creators.chunk24-baseline.json`

Those files reuse the exact original chunk-24 blob SHAs (`a07d3a34a215cec19cf9d3b36010d2b53776fa4f` and `5ded2e52dd1a914a6d7bd81c60fa5abed7a7ada5`) rather than reconstructed copies.

Permanent `scripts/creator-vault-qa.js`:

1. Hides only chunk-25 production source + provider files.
2. Swaps only the current creator ledger for the exact frozen chunk-24 ledger.
3. Runs the frozen chunk-24 wrapper unchanged, recursively proving every older checkpoint.
4. Restores current state in `finally`.
5. Locks the exact 804 / 580 / 578 / 1082 / 394 / 2 current contract.
6. Locks AHS 43 / 350, 545 / 545 linked mentions, and 355 distinct canonical projects.
7. Locks the exact video ID/date/title and all ten source-label -> canonical-ID mappings.
8. Locks all ten timestamps as null/base-link and rejects fabricated `t=0s`.
9. Locks exact provider families and URLs for all seven new projects.
10. Locks Splinecart fork isolation, original Beautiful Enchanted Books resource-pack identity, and Cosmic Horizons mod/modpack isolation.
11. Locks generic Forge/Fabric and music exclusions.
12. Locks the production provider overlay at exactly seven entries / fourteen destinations.
13. Renders the catalog and requires representative names/provider URLs.

The temporary post-merge diagnostic script was deleted before final acceptance.

## Final acceptance

GitHub Actions run `33990801348` completed successfully on `1b63ec9693990ea509319ef40a269197e1582c94`.

All steps passed:

1. Checkout
2. Node 22
3. Install dependencies
4. AsianHalfSquat chunk 25 provider URL collision gate
5. Missing timestamp regression QA
6. Focused Creator Vault recursive QA
7. Catalog regression QA
8. Render portable catalogs

Exact success line:

`Creator Vault AsianHalfSquat chunk 25 QA passed: 804 mentions -> 580 canonical projects; 578 linked / 1082 destinations / 394 multi-provider / 2 unresolved. AHS linked mentions=545/545 across 355 canonical projects; all 10 null timestamps/base links, 7-new/3-reuse canonicalization, provider anti-false-merge rules, exclusions, and recursive chunk-24 baseline are locked.`

The GitHub-hosted actions/checkout@v4 and setup-node@v4 Node-20 deprecation warning is informational. The workflow explicitly installs and runs Node 22.23.2 and all acceptance steps passed.

## Exact next action — chunk 26

Create `feature/creator-vault-asianhalfsquat-chunk-26` from the durable chunk-25 checkpoint. Continue strictly older than **2024-09-24** and exclude all **43 already indexed AsianHalfSquat video IDs**. Freshly verify only the next small ordinary-upload slice; independent chronology currently points toward an upload around **2024-09-06**, with another around **2024-09-04**, but do not assume exact titles/IDs or ingest livestream/noise entries without first-party verification. Recover only creator-authored recommendation evidence, canonicalize every named mention against the frozen **804-mention / 580-project** registry before provider research, preserve ambiguous links as source-level evidence rather than guessed project cards, research provider homes only for genuine new or underlinked identities, add them through bounded append-only overlays only when independently verified, run the same provider-collision + missing-timestamp + recursive Creator Vault QA + catalog QA + portable-render gates, persist repo + Drive checkpoints, and stop again at a clean chunk boundary.
