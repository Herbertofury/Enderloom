# Enderloom Creator Vault Wiki

Status: active development  
Current branch: `feature/creator-vault-enderverse-chunk-10`  
Strategy: full-history-first, incremental-after  
Data contract: creator evidence and provider identity are separate gates; never fabricate recommendations, chapters, timestamps, loader labels, aliases, or project URLs.

## Current verified checkpoint

Pinned code/data + QA commit: `2e6158b7ab2ed59ce3fd889552c72e45f9004100`  
Pinned GitHub Actions proof: `33955603272`

Creator Vault currently preserves **475 recommendation mentions** and merges them into **413 canonical projects**. Of those, **411 canonical projects have verified direct destinations**, exposing **665 exact project destinations** across Modrinth, CurseForge, GitHub, official/creator-controlled pages, MCreator, or Planet Minecraft where those are the truthful homes. **227 canonical projects are multi-provider**. Exactly two canonical projects remain unresolved: historical `Plank and Junk` and Episode 3's `Better Book Recipe`.

The search UI is canonical-project based: repeated recommendations and aliases return one project card while every creator, video, timestamp, loader, and evidence mention remains visible beneath that card. All independently verified provider homes render as direct buttons on the same canonical project. Generic provider search-result pages are forbidden as direct homes.

## Creator coverage

- **AsianHalfSquat** — 16 exact videos / 216 recommendation mentions; verified channel-history target 349 videos.
- **EnderVerse** — 6 exact videos / 229 project recommendation mentions; 227 recommendation mentions have verified project homes. The five-part Vanilla+ family is complete. `Plank and Junk` and `Better Book Recipe` remain explicit no-public-page exceptions rather than guessed.
- **Kreksu** — 3 exact videos / 30 recommendations / original 30 direct homes regression-locked; 5 recurring setup/resource packs remain separate.
- Kizamiringo, Katsumi, SpeedyChunks, NoxusMinecraft, UnyxYT, CurseForge, HendyVideos, Knarfy, The Breakdown, The Crimson Gaming, and laveOrc remain active in the 14-creator ledger with their existing evidence/live-gate states.

## EnderVerse source history

### 2025-12-06 — Top 25 of the Year

Video: `https://www.youtube.com/watch?v=JF6FITETMLM`  
25 exact original-description chapter recommendations. Creator-stated loader labels and exact timestamp deep links remain preserved.

### 2024-10-19 — Vanilla+ Episode 4

Video: `https://www.youtube.com/watch?v=kxXz-FbvhAA`  
40 exact original-description chapter recommendations. `Plank and Junk` remains source-backed with its original video/timestamp and `Find in Enderloom` rather than receiving a fabricated URL.

### 2024-01-16 — Vanilla+ Episode 1

Video: `https://www.youtube.com/watch?v=vniY9L4EbgM`  
Title: `TOP 200 Vanilla+ Minecraft Mods For 1.20.4 / 1.20 | Ep. 1 (2024) [Forge/Fabric]`  
40 exact original-description chapters.

Episode 1 advanced the full Vault from 311 mentions / 264 canonical projects to 351 mentions / 300 canonical projects. Its verified state is 299 linked projects / 440 destinations / 134 multi-provider / 1 unresolved.

Important canonical merges include `Geophilics` → **Geophilic**, `Explosive Enhancements` → **Explosive Enhancement**, `HandCrafted` → **Handcrafted**, `EnderMan Overhaul` → **Enderman Overhaul**, and `Moog's End Structures` → **MES - Moog's End Structures**. Friends & Foes, Item Borders, and Merchant Markers preserve loader-specific project destinations on one canonical card. VoxelMap remains CurseForge-only where independently substantiated; Nvidium remains Modrinth-only where independently substantiated.

Episode 1 code/data head `a1cf9637d54a3dfcd78b3882723e3df1131bfb34` passed GitHub Actions run `33950177232`: focused Creator Vault QA, catalog regression QA, and portable render all succeeded.

### 2024-03-10 — Vanilla+ Episode 2

Video: `https://www.youtube.com/watch?v=AbkSa8oXDpU`  
Title: `TOP 200 Vanilla+ Minecraft Mods For 1.20 | EP. 2 (2024) [Forge/Fabric]`  
40 exact mod chapters after excluding the sponsor chapter, from `Carry On` at 1:20 through `Visual Workbench` at 25:12.

Episode 2's verified totals are **391 mentions → 334 canonical projects; 333 linked / 515 destinations / 163 multi-provider / 1 unresolved**.

Important Episode 2 canonical/provider behavior:

- Immersive Portals remains one canonical project while preserving Fabric and Forge/NeoForge Modrinth/CurseForge homes.
- Better Combat reuses its existing canonical identity.
- `SawMill` aliases into **Universal Sawmill**.
- `Concurrent Chunk Management Engine` aliases into **C2ME**.
- `Sleep Overhaul 2` aliases into **Sleeping Overhaul 2**.
- `Chisel and Bits` aliases into **Chisels & Bits** and preserves separate CurseForge Forge/NeoForge and Fabric listings.
- Farmer's Delight remains one canonical card while preserving the Forge/NeoForge project and the Refabricated Fabric port across Modrinth/CurseForge.
- `Geophilic - Vanilla Biome Overhauls` merges into the existing **Geophilic** project.
- `More Mobs` is the Tschipcraft project and preserves its Modrinth unified project plus separate CurseForge data-pack/mod destinations.
- Pixelbank's BURNT uses the creator's MCreator project page; Fake Blockz Mod keeps its Modrinth and creator Planet Minecraft pages.
- Source loader labels such as `Wanted [Forge/Fabric/DataPack]`, `Talking Villager [Fabric/Resource Pack]`, and `More Mobs [Forge/Fabric/DataPack]` remain source evidence and are not rewritten by provider metadata.

Episode 2 provider data is split into five bounded append-only shards: `provider-closure-08a-enderverse-ep2.json` through `provider-closure-08e-enderverse-ep2.json`. Pinned-count commit `263e2857fd86eaa2ac069ea5e4004ff6351ad406` passed GitHub Actions run `33951139985` at exactly `391 → 334; 333 linked / 515 destinations / 163 multi-provider / 1 unresolved`.

### 2024-06-16 — Vanilla+ Episode 3

Video: `https://www.youtube.com/watch?v=6dx2t_lD1gw`  
Title: `TOP 200 Vanilla+ Minecraft Mods For 1.21→ 1.19.2 | EP. 3 (2024) [Forge/Fabric]`  
40 exact original-description chapters, from `Revamped Piles` at 0:10 through `Andromeda` at 22:15.

Episode 3 advanced the Vault to **431 mentions → 372 canonical projects; 370 linked / 586 destinations / 192 multi-provider / 2 unresolved**. Thirty-nine of 40 Episode 3 recommendations have verified direct project homes. `Better Book Recipe` is deliberately left without a guessed provider URL.

Important Episode 3 canonical/provider behavior:

- `Bridging` → **Bridging Mod** (`bridging-mod`).
- `Fancy Block Particles Renewed` → **FBP Renewed** (`fbp-renewed`).
- `HT's Treechop` → **TreeChop** (`treechop`).
- `Minecraft Earth Mobs` → **Earth Mobs Mod** (`earth-mobs-mod`).
- `3D Skin Layer` → **3D Skin Layers** (`3d-skin-layers`).
- `YUNG's Better Witch Huts` → `yungs-better-witch-huts` with three verified destinations.
- Better Villages and Repurposed Structures each expose four verified direct destinations without duplicate search cards.

Episode 3 provider enrichment is sharded across `provider-closure-09a-enderverse-ep3.json` through `provider-closure-09e-enderverse-ep3.json`. Pinned QA commit `8aee8f4b0542ac3021a1349decf54695b9f235a3` passed GitHub Actions run `33954313086`.

### 2025-01-11 — Vanilla+ Episode 5 Finale

Video: `https://www.youtube.com/watch?v=GYz4LQcNZ7s`  
Title: `TOP 200 Vanilla+ Minecraft Mods Ep. 5 (Finale) | Forge/Fabric`

The original indexed YouTube description preserves **40 exact recommendation chapter timestamps**. `Tripo3D` at 1:04 is explicitly the affiliate/sponsor AI-modeling segment and is excluded from the Minecraft project registry. Two recommendation chapters are real multi-project bundles, verified against EnderVerse's January 10 first-party `Downloads in order of the video` sheet:

- `Farmer's Delight's addons` at 10:37 expands to **Nether Delight, Ocean Delight, Ender Delight, and Farmer's Structures**.
- `Break free + Multi mine` at 18:40 expands to **Break Free and Multi Mine**.

Therefore Episode 5 preserves **40 recommendation chapters → 44 actual Minecraft project mentions**. All 44 have verified direct project homes. The merge adds 41 new canonical projects and deliberately reuses exactly three existing identities: `Hold My Items`, `Multi Mine`, and `V-Tweaks`.

Episode 5 advances the verified Vault to **475 mentions → 413 canonical projects; 411 linked / 665 exact destinations / 227 multi-provider / 2 unresolved**. The unresolved set does not grow: it remains exactly `Better Book Recipe` and `Plank and Junk`.

Important Episode 5 canonical/provider behavior:

- `Dynamic Surroundings Resource Pack` canonicalizes to `dynamic-surroundings-reworked` and stays CurseForge-only; an unrelated/unofficial Modrinth sounds pack is not merged.
- `qraftyfied: STRUCTURES` canonicalizes to `qraftyfied`.
- `Nether Delight`, `Ocean Delight`, and `Ender Delight` canonicalize to the corresponding apostrophe-normalized Delight projects rather than creating grouped fake cards.
- `Farmer's structures` canonicalizes to `farmers-structures`.
- `Rain Particle` canonicalizes to **Particle Rain** (`particle-rain`) with Modrinth, CurseForge, and GitHub source destinations.
- Equipment Compare preserves a unified Modrinth home plus separate CurseForge Forge/NeoForge and Fabric listings on one canonical card.
- VillagersPlus preserves unified Modrinth plus loader-specific CurseForge Fabric/NeoForge and Forge listings on one card.
- Multi Mine intentionally remains the original CurseForge project; a same-name Modrinth reimplementation/plugin is not merged.
- Keep Some Inventory intentionally remains the Java Modrinth datapack; a Bedrock CurseForge add-on is not merged.
- Single-host projects such as Global Wind, Vanilla Constructs, Portable Wardrobes, Farmer's Structures, Dynamic Surroundings Reworked, and Keep Some Inventory remain single-host because no second trustworthy project home was independently established.

Episode 5 source: `catalog/creator-vault/recommendation-sources/enderversemc.vanilla-plus-ep5.chunk10.json`. Provider enrichment is split into six bounded append-only shards: `provider-closure-10a-enderverse-ep5.json` through `provider-closure-10f-enderverse-ep5.json`.

### Episode 5 acceptance architecture

The Episode 3 QA suite is archived byte-for-byte as `scripts/creator-vault-qa-episode3.js`, together with the exact Episode 3 creator ledger at `catalog/creator-vault/research/creators.episode3-baseline.json`. The current QA wrapper temporarily hides only Episode 5's source/provider shards and swaps in the exact Episode 3 creator ledger, runs every legacy assertion unchanged, restores the current state in `finally`, and then runs the Episode 5/current-state contract. This prevents the newest counts from weakening old regression coverage.

A separate `creator-vault-timestamp-qa.js` guarantees a genuinely missing timestamp remains `null` and uses the base video URL rather than silently becoming a fabricated `0:00` deep link.

Pinned commit `2e6158b7ab2ed59ce3fd889552c72e45f9004100` passed GitHub Actions run `33955603272`. The proof log records both contracts back-to-back:

- `Creator Vault QA passed: 431 mentions -> 372 canonical projects; 370 linked / 586 destinations / 192 multi-provider / 2 unresolved.`
- `Creator Vault Episode 5 QA passed: 475 mentions -> 413 canonical projects; 411 linked / 665 destinations / 227 multi-provider / 2 unresolved.`

The same run also passed the missing-timestamp regression, full catalog regression QA, and portable catalog render.

## Provider registry architecture

- `catalog/creator-vault/projects.json` is the canonical base registry.
- `provider-closure-01.json` through `provider-closure-06.json` preserve chunk-6 provider closure.
- `provider-closure-07-enderverse-ep1.json` contains Episode 1 provider enrichment.
- `provider-closure-08a-enderverse-ep2.json` through `provider-closure-08e-enderverse-ep2.json` contain Episode 2 provider enrichment.
- `provider-closure-09a-enderverse-ep3.json` through `provider-closure-09e-enderverse-ep3.json` contain Episode 3 provider enrichment.
- `provider-closure-10a-enderverse-ep5.json` through `provider-closure-10f-enderverse-ep5.json` contain Episode 5 provider enrichment.
- `src/creator-vault.js` merges repeated canonical IDs, unions aliases, unions provider homes, and URL-deduplicates exact destinations without rewriting creator-source history.
- Future large provider batches should stay small/sharded so malformed long JSON cannot invalidate an entire episode.

## Preserved lineage

### AsianHalfSquat

- 16 exact videos / 216 recommendation mentions.
- target: 349 verified channel-history videos.
- canonical Drive source ID: `1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh`.
- original Drive SHA-256: `6e49a5154e1a757df75c4ab7371f91632250b551f9e1e3b00781db035b43a9e1`.
- compact logical snapshot SHA-256: `4e45e92fed3171175fcf50b37d9dcfd91b88217582fe9a924f405397eea649e8`.
- six deterministic repo shards remain hash/count regression-locked.

### Kreksu

The original 3 videos / 30 recommendations / 30 provider homes remain regression-locked. The queued animation-mod video remains un-ingested until its complete original chapter list becomes source-verifiable; do not reopen the already exhausted search family without new evidence.

## Exact next action

1. Continue **AsianHalfSquat** from the preserved 16-video / 216-mention baseline toward the verified **349-video channel-history target**; do not restart the existing six Drive-derived shards.
2. Recover the next bounded source batch first, canonicalize every mention against the current **413-project registry**, then resolve every independently verified provider home without fabricating missing links.
3. Keep source/provider batches small and append-only, run the same baseline + current Creator Vault QA, full catalog regression, and portable render, and checkpoint exact counts before the next batch.
4. After the AsianHalfSquat history pass, resume the protected TikTok creator ledger and its existing live-gate states.

No active mod JAR moves are part of Creator Vault work.
