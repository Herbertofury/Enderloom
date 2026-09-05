# Enderloom Creator Vault Wiki

Status: active development  
Current branch: `feature/creator-vault-enderverse-chunk-7`  
Strategy: full-history-first, incremental-after  
Data contract: creator evidence and provider identity are separate gates; never fabricate recommendations, chapters, timestamps, loader labels, aliases, or project URLs.

## Current verified checkpoint

Pinned code/data commit: `8aee8f4b0542ac3021a1349decf54695b9f235a3`  
Pinned-count GitHub Actions run: `33954313086`  
Episode-3 source/provider lineage begins at `5f70eda099f4414e10033f7edb5be132ed852ab7`.

Creator Vault currently preserves **431 recommendation mentions** and merges them into **372 canonical projects**. Of those, **370 canonical projects have verified direct destinations**, exposing **586 exact project destinations** across Modrinth, CurseForge, GitHub, official/creator-controlled pages, MCreator, or Planet Minecraft where those are the truthful homes. **192 canonical projects are multi-provider**. Exactly two canonical projects remain unresolved: historical `Plank and Junk` and Episode 3's `Better Book Recipe`.

The search UI is canonical-project based: repeated recommendations and aliases return one project card while every creator, video, timestamp, loader, and evidence mention remains visible beneath that card. All independently verified provider homes render as direct buttons on the same canonical project. Generic provider search-result pages are forbidden as direct homes.

## Creator coverage

- **AsianHalfSquat** — 16 exact videos / 216 recommendation mentions; verified channel-history target 349 videos.
- **EnderVerse** — 5 exact videos / 185 chapter recommendations; 183 recommendation mentions have verified project homes, with `Plank and Junk` and `Better Book Recipe` retained as explicit no-public-page exceptions rather than guessed.
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

The first monolithic Episode 2 provider overlay proved too fragile as a very long one-line JSON document, so it was removed. Episode 2 provider data is split into five bounded append-only shards: `provider-closure-08a-enderverse-ep2.json` through `provider-closure-08e-enderverse-ep2.json`.

GitHub Actions run `33951030240` on head `e33d79391d82c690ef279876fd4b76879b021836` passed focused Creator Vault QA, catalog regression QA, and portable render. The passing console contract was exactly: `391 mentions -> 334 canonical projects; 333 linked / 515 destinations / 163 multi-provider / 1 unresolved.` Those counts were hard-pinned at commit `263e2857fd86eaa2ac069ea5e4004ff6351ad406`, which passed run `33951139985` with the same three gates green.

### 2024-06-16 — Vanilla+ Episode 3

Video: `https://www.youtube.com/watch?v=6dx2t_lD1gw`  
Title: `TOP 200 Vanilla+ Minecraft Mods For 1.21→ 1.19.2 | EP. 3 (2024) [Forge/Fabric]`  
40 exact original-description chapters, from `Revamped Piles` at 0:10 through `Andromeda` at 22:15. Original timestamps and creator-stated loader labels remain preserved independently from provider metadata.

Episode 3 advances the verified Vault to **431 mentions → 372 canonical projects; 370 linked / 586 destinations / 192 multi-provider / 2 unresolved**. Thirty-nine of the 40 Episode 3 recommendations have verified direct project homes. `Better Book Recipe` is deliberately left without a guessed provider URL; it remains source-backed and searchable with `Find in Enderloom`.

Important Episode 3 canonical/provider behavior:

- `Bridging` canonicalizes to **Bridging Mod** (`bridging-mod`).
- `Fancy Block Particles Renewed` canonicalizes to **FBP Renewed** (`fbp-renewed`).
- `HT's Treechop` canonicalizes to **TreeChop** (`treechop`).
- `Minecraft Earth Mobs` canonicalizes to **Earth Mobs Mod** (`earth-mobs-mod`).
- `3D Skin Layer` canonicalizes to **3D Skin Layers** (`3d-skin-layers`).
- `YUNG's Better Witch Huts` canonicalizes to `yungs-better-witch-huts` and exposes three verified destinations.
- Better Villages and Repurposed Structures each expose four verified direct destinations without creating duplicate search cards.
- The Episode 3 provider set follows the same bounded shard pattern as Episode 2: `provider-closure-09a-enderverse-ep3.json` through `provider-closure-09e-enderverse-ep3.json`.

Pinned QA commit `8aee8f4b0542ac3021a1349decf54695b9f235a3` passed GitHub Actions run `33954313086`. All acceptance steps were green: `npm ci`, focused Creator Vault QA, full catalog regression QA, and portable catalog render. The hard gate now enforces 24 source videos, 431 recommendation mentions, 372 canonical projects, 370 linked projects, 586 exact destinations, 192 multi-provider projects, and exactly the two unresolved projects `Better Book Recipe` and `Plank and Junk`.

## Provider registry architecture

- `catalog/creator-vault/projects.json` is the canonical base registry.
- `catalog/creator-vault/project-sources/provider-closure-01.json` through `provider-closure-06.json` preserve chunk-6 provider closure.
- `provider-closure-07-enderverse-ep1.json` contains Episode 1 provider enrichment.
- `provider-closure-08a-enderverse-ep2.json` through `provider-closure-08e-enderverse-ep2.json` contain Episode 2 provider enrichment.
- `provider-closure-09a-enderverse-ep3.json` through `provider-closure-09e-enderverse-ep3.json` contain Episode 3 provider enrichment.
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

1. Ingest EnderVerse Vanilla+ Episode 5 finale from original YouTube video `GYz4LQcNZ7s`, published 2025-01-11, using only its exact original-description recommendation chapters.
2. Canonicalize every Episode 5 mention against the current 372-project registry before creating new IDs.
3. Resolve every independently verified Modrinth, CurseForge, GitHub, official, or creator-controlled project home; preserve loader/port-specific destinations as separate buttons on one canonical card.
4. Keep the provider batch in bounded append-only shards, then run focused Creator Vault QA, full catalog regression QA, and portable render and pin the exact resulting totals.
5. Checkpoint the repo and this same Drive wiki. After the five-part Vanilla+ family is complete, continue AsianHalfSquat toward 349 videos and then the protected TikTok creator ledger.

No active mod JAR moves are part of Creator Vault work.
