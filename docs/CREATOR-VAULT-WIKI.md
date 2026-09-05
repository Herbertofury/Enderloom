# Enderloom Creator Vault Wiki

Status: active development  
Current branch: `feature/creator-vault-enderverse-chunk-5`  
Strategy: full-history-first, incremental-after  
Data contract: evidence-first; never fabricate creator recommendations, chapters, timestamps, loader labels, or provider URLs.

## Purpose

Creator Vault is Enderloom's native creator-recommendation layer. It catalogs Minecraft projects surfaced by tracked YouTube/TikTok creators, keeps the source video/post and evidence attached, and exposes the data through Enderloom's existing searchable UI. It remains additive and fail-soft; this work does not move active mod JARs or rewrite launcher internals.

## Current native totals - chunk 5

- 14 creators retained in the canonical ledger
- 3 creators with native recommendation data: Kreksu, AsianHalfSquat, EnderVerse
- 21 source videos
- 311 recommendation mentions
- 31 verified direct project homes
- 1 pinned legacy catalog import
- 2 native recommendation source documents (primary Kreksu data + EnderVerse chunk 5)
- 5 recurring Kreksu setup/resource packs

## Evidence / provider contract

Creator evidence and provider identity are separate gates.

1. Recommendation identity must come from source-verifiable creator evidence.
2. Timestamps/loaders are stored only when stated by the source.
3. A Modrinth/CurseForge/project URL is added only after the exact project identity is independently known.
4. Missing provider homes remain empty; the UI keeps `Find in Enderloom` as the unresolved handoff.
5. Legacy imports preserve their lineage with `legacy-catalog` provenance; fresh creator batches remain native source shards.
6. Tests/fixtures are never promoted into recommendation evidence.

## Creator coverage ledger

| Creator | Platform | Role | Current state | Next evidence gate |
| --- | --- | --- | --- | --- |
| AsianHalfSquat (`@AsianHalfSquat`) | YouTube | protected core | **16 exact videos / 216 recommendations / 1 verified home; target 349 videos** | Continue source lineage toward 349; verify provider homes individually |
| EnderVerse (`@EnderVerseMC`) | YouTube | protected core | **Active native ingestion: 2 exact videos / 65 chapter recommendations / 0 verified homes** | Resolve exact provider homes, then continue the 200-mod Vanilla+ series/history |
| Kreksu (`@KreksuMinecraft`) | YouTube | curated core | **3 exact videos / 30 recommendations / 30 verified homes** | Continue new source-verifiable history; queued animation video still requires original full chapters |
| Kizamiringo (`@kizamiringo`) | TikTok | protected core | Legacy pipeline; live gate pending | Full-history enumeration + real text-only extraction parity |
| Katsumi (`@its_katsumi`) | TikTok | curated core | Legacy ready; link refresh pending | Refresh public link-hub children, then ingest posts |
| SpeedyChunks (`@speedychunks`) | TikTok | curated core | Queued | Import legacy evidence, then full-history scan |
| NoxusMinecraft (`@noxusminecraft`) | TikTok | required | Queued | Import legacy evidence, then full-history scan |
| UnyxYT (`@unyxyt`) | TikTok | required | Queued | Import legacy evidence, then full-history scan |
| CurseForge (`@curseforge`) | TikTok | curated core | Queued | Import legacy evidence while keeping creator/provider identity distinct |
| HendyVideos (`@hendyvideos`) | TikTok | curated core | Queued | Import legacy evidence, then full-history scan |
| Knarfy (`@itsknarfy`) | TikTok | recommended discovery | Tracked | Promote only evidence-backed Minecraft recommendations |
| The Breakdown (`@thebreakdownxyz`) | TikTok | recommended discovery | Tracked | Promote only evidence-backed Minecraft recommendations |
| The Crimson Gaming (`@thecrimsongaming`) | TikTok | recommended discovery | Tracked | Promote only evidence-backed Minecraft recommendations |
| laveOrc (`@ygz207`) | TikTok | recommended discovery | Tracked | Promote only evidence-backed Minecraft recommendations |

## EnderVerse - chunk 5

### Legacy recovery truth

The archived Minecraft Mod Vault v0.7.0 creator-archive checkpoint was recovered and inspected before native ingestion. Its canonical status says the exhaustive creator archive implementation for AsianHalfSquat/EnderVerse was built and tested, but the runtime could not resolve YouTube/GitHub DNS and therefore **did not pre-populate the actual public-channel corpus**. Release/source archives contain implementation code/tests but no persisted real EnderVerse corpus. Deterministic test fixtures are therefore not valid creator evidence and were not imported.

EnderVerse moved from the misleading `legacy-catalog-ready` state to fresh source-verified ingestion from the actual channel.

### 2025-12-06 - Top 25 of the Year

Video: `https://www.youtube.com/watch?v=JF6FITETMLM`  
Title: `TOP 25 Minecraft Mods OF THE YEAR 2025 | 1.21.x / 1.20.1 (Forge & Fabric)`

25 exact chapter recommendations from the original YouTube description (sponsor chapter excluded):

Etherology; protomanly's weather; Unusual Prehistory 2; Clockwork; Improved Village Placement; Oceanic Realms; Overgeared; Enderling Invaders; Orbital Railgun; Fang's Textiles and Trinkets ✦ Annihilation Update; The Day Of The Beast; Warium; Better Combat Particle; Wayfinder; Crow's Weapon Classes; Fancy Toasts | Better Advancements; Saint's Dragons; Etheria; Kilt; Adorable Hamster Pets; More Critters; harpy express; Kaleidoscope Cookery; Valley & Sky; Wonderous Sea - An Endless Ocean Adventure.

Creator-stated loader labels are preserved. In particular, `harpy express` remains `Quilt / Fabric`.

### 2024-10-19 - Vanilla+ 200 series, episode 4

Video: `https://www.youtube.com/watch?v=kxXz-FbvhAA`  
Title: `TOP 200 Vanilla+ Minecraft Mods EP. 4 (Forge & Fabric) | 1.21 & Older`

40 exact chapter recommendations from the original YouTube description:

MoreVanillaArmor; Merged Elytra; Patriot Structures; Aileron; Remove Reloading Screen; Tiny Item Animations; EXP Counter; Snowy Sniffer; Straw Golem Rebaled: Ported; Decorative Storage; Buttercup's Shrines; Bookshelf Inspector; Asian food cart; Items Displayed; Old fisherman swamp house; Better Than Mending; Wither Spawn Animation; Simple Uncrafting Table; Plank and Junk; Re:Deco; Dunes and Drought; Jake's Build Tools; Water Condenser; YUNG's Cave Biomes; Geysers; Dungeons and Taverns: Nether Fortress Overhaul; Endless Music; Extra Dungeons; Better F1 Reborn; fapdos' Nether Mobs: Recrafted; Dynamites Overhaul; Curious Lanterns; Mutated Items; Musket Mod; Mo Glass; You Thief: Remastered Edition; Better Lily Pads; Horseman; Sooty Chimneys; Reacharound.

`Straw Golem Rebaled: Ported` preserves the creator's chapter spelling. `EXP Counter` preserves the creator-stated `Fabric / Forge / NeoForge` label. No other loader labels are guessed.

### Native source architecture

Fresh creator batches now live under `catalog/creator-vault/recommendation-sources/*.json` instead of continually rewriting the primary Kreksu `recommendations.json` file. Chunk 5 adds `enderversemc.chunk5.json` as a compact source document with shared evidence defaults and timestamp/name rows. `src/creator-vault.js` expands compact rows at load time, merges sorted native source documents, and keeps the previous legacy import pipeline intact.

EnderVerse chunk-5 source SHA-256: `9a1330c4cd48f8729d59e24d1f0258da2f971ffadc1d023938f62e1fd5bed27b`.

All 65 EnderVerse records intentionally have no provider URL yet. That is a correctness feature, not missing work hidden by guessed links.

## Kreksu preserved state

Chunk 3's provider closure remains intact:

- `youtube:Hg1_20vRrZM` — 2026-04-05 — 10 recommendations / 10 verified homes
- `youtube:iTsP0Xsdcv8` — 2026-04-09 — 10 / 10
- `youtube:fgu7ssEVzAA` — 2026-05-07 — 10 / 10
- total: 30 / 30 exact provider homes
- 5 recurring animation/resource packs remain separately tracked
- queued `TOP +10 Best Animation Mods...` video remains un-ingested because its original full chapter list has not passed the source gate

A materially different recovery pass in chunk 4/5 still did not surface the queued video's complete original chapters, so partial mirrors were not used.

## AsianHalfSquat preserved state

Chunk 4 imported the newer reconciled Minecraft Mod Vault snapshot, superseding the earlier 11-video / 93-recommendation checkpoint:

- 16 exact videos
- 216 evidence-backed recommendation mentions
- verified channel-history target: 349 videos
- 1 independently verified creator-owned project home
- 215 provider homes intentionally unresolved
- canonical Drive source ID: `1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh`
- original Drive SHA-256: `6e49a5154e1a757df75c4ab7371f91632250b551f9e1e3b00781db035b43a9e1`
- compact logical snapshot SHA-256: `4e45e92fed3171175fcf50b37d9dcfd91b88217582fe9a924f405397eea649e8`
- six deterministic repo shards with per-shard hashes/count contracts

Verified home: `Satisfaction Guaranteed`, CurseForge modpack, project ID `1490741`, `https://www.curseforge.com/minecraft/modpacks/satisfaction-guaranteed`.

## UI / behavior

Creator Vault continues to provide creator cards/pins, platform and creator filtering, recommendation search, evidence/source badges, video grouping, timestamp deep links, provider/project-type badges, direct verified provider actions, unresolved `Find in Enderloom`, per-video verified-home counts, overall verified-home KPI, copy-all names, and separately tracked recurring creator setup packs.

Imported AsianHalfSquat and fresh EnderVerse data flow through the same UI as Kreksu; no separate legacy browser is required.

## Chunk 5 changed surface

- new `catalog/creator-vault/recommendation-sources/enderversemc.chunk5.json`
- `src/creator-vault.js` adds compact native recommendation-source loading/expansion
- `catalog/creator-vault/creators.json` corrects EnderVerse legacy state and records 2/65/0 coverage
- `scripts/creator-vault-qa.js` adds EnderVerse and aggregate gates
- `.github/workflows/creator-vault-qa.yml` now covers `feature/creator-vault-*-chunk-*` branches rather than Kreksu-only chunk branches
- this wiki

The primary Kreksu `catalog/creator-vault/recommendations.json` remains unchanged in chunk 5.

## Acceptance gate through chunk 5

Focused QA requires:

- exactly 14 unique creators;
- 3 indexed creators;
- 21 videos / 311 recommendations / 31 verified homes;
- 1 pinned AsianHalfSquat legacy import;
- 2 native recommendation source documents;
- all 30 Kreksu provider/timestamp/provenance contracts unchanged;
- all six AsianHalfSquat shard hashes/counts unchanged; 16/216 with exactly 1 verified home and 215 unresolved;
- EnderVerse coverage exactly 2 videos / 65 chapter recommendations / 0 verified homes;
- 2025 EnderVerse video exactly 25 recommendations, first `Etherology`, last `Wonderous Sea - An Endless Ocean Adventure`;
- 2024 EnderVerse video exactly 40 recommendations, first `MoreVanillaArmor`, last `Reacharound`;
- both EnderVerse videos preserve `youtube-description` + `chapters` provenance, numeric strictly ordered timestamps, exact deep links, and empty provider URLs/identities;
- creator-stated loader checks for `harpy express` and `EXP Counter`;
- rendered catalog embeds Kreksu, AsianHalfSquat, EnderVerse, the verified Asian modpack home, existing Kreksu homes, and the unresolved-provider handoff.

Observed locally after the compact-source conversion:

- PASS — `src/creator-vault.js` syntax gate.
- PASS — focused Creator Vault QA: **14 creators / 3 indexed creators / 21 videos / 311 recommendations / 31 verified homes / 1 imported catalog / 5 setup packs**.
- PASS — `nativeRecommendationSources = 2`.
- PASS — fresh portable preview: `creator-vault-chunk5-preview.html`, **147,966 bytes**, SHA-256 `fee43cc10f68d1f8c788f203dea223b704af52993e4d67d9887d45a5a34acc6d`.
- No browser visual-runtime pass is claimed in chunk 5.
- Full repository checkout/CI is not claimed in this chat because the current runtime cannot resolve `github.com`; API-authored commits also do not recursively trigger Actions. The workflow is committed as the broad gate for the next normal push/manual dispatch.

## Exact next action

1. Resolve EnderVerse chunk-5 provider homes only where project identity is exact.
2. Continue source-verified EnderVerse history, with the remaining `TOP 200 Vanilla+` episodes as a strong bounded family.
3. Continue AsianHalfSquat from 16 toward the verified 349-video target.
4. Then progress the protected TikTok creator ledger while preserving its existing live gates.
5. Do not reopen the failed Kreksu queued-animation search family unless new source evidence appears.
6. On the next normal checkout/push/manual dispatch, run the broader committed Creator Vault workflow and record the run/job identity.

No active mod JAR moves are part of Creator Vault work.
