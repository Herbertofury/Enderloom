# Enderloom Creator Vault Wiki

Status: active development  
Current branch: `feature/creator-vault-enderverse-chunk-7`  
Strategy: full-history-first, incremental-after  
Data contract: creator evidence and provider identity are separate gates; never fabricate recommendations, chapters, timestamps, loader labels, aliases, or project URLs.

## Current verified checkpoint

Pinned code/data commit: `263e2857fd86eaa2ac069ea5e4004ff6351ad406`  
Pinned-count GitHub Actions run: `33951139985`  
Episode-2 sharded provider proof run: `33951030240`

Creator Vault currently preserves **391 recommendation mentions** and merges them into **334 canonical projects**. Of those, **333 canonical projects have verified direct destinations**, exposing **515 exact project destinations** across Modrinth, CurseForge, GitHub, official/creator-controlled pages, MCreator, or Planet Minecraft where those are the truthful homes. **163 canonical projects are multi-provider**. Exactly one canonical project remains unresolved: `Plank and Junk` from EnderVerse Vanilla+ Episode 4.

The search UI is canonical-project based: repeated recommendations and aliases return one project card while every creator, video, timestamp, loader, and evidence mention remains visible beneath that card. All independently verified provider homes render as direct buttons on the same canonical project. Generic provider search-result pages are forbidden as direct homes.

## Creator coverage

- **AsianHalfSquat** — 16 exact videos / 216 recommendation mentions; verified channel-history target 349 videos.
- **EnderVerse** — 4 exact videos / 145 chapter recommendations; 144 recommendation mentions have verified project homes, with historical `Plank and Junk` the only no-public-page exception.
- **Kreksu** — 3 exact videos / 30 recommendations / original 30 direct homes regression-locked; 5 recurring setup/resource packs remain separate.
- Kizamiringo, Katsumi, SpeedyChunks, NoxusMinecraft, UnyxYT, CurseForge, HendyVideos, Knarfy, The Breakdown, The Crimson Gaming, and laveOrc remain active in the 14-creator ledger with their existing evidence/live-gate states.

## EnderVerse source history

### 2025-12-06 — Top 25 of the Year

Video: `https://www.youtube.com/watch?v=JF6FITETMLM`  
25 exact original-description chapter recommendations. Creator-stated loader labels and exact timestamp deep links remain preserved.

### 2024-10-19 — Vanilla+ Episode 4

Video: `https://www.youtube.com/watch?v=kxXz-FbvhAA`  
40 exact original-description chapter recommendations. `Plank and Junk` is the sole project in the entire current Creator Vault without a trustworthy public project page; the UI retains its source moment and `Find in Enderloom` rather than inventing a URL.

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

Episode 2 brings the full Vault to the current verified totals: **391 mentions → 334 canonical projects; 333 linked / 515 destinations / 163 multi-provider / 1 unresolved**.

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

The first monolithic Episode 2 provider overlay proved too fragile as a very long one-line JSON document, so it was removed. Episode 2 provider data is now split into five bounded append-only shards: `provider-closure-08a-enderverse-ep2.json` through `provider-closure-08e-enderverse-ep2.json`. This is now the preferred pattern for large future provider batches.

GitHub Actions run `33951030240` on head `e33d79391d82c690ef279876fd4b76879b021836` passed focused Creator Vault QA, catalog regression QA, and portable render. The passing console contract was exactly: `391 mentions -> 334 canonical projects; 333 linked / 515 destinations / 163 multi-provider / 1 unresolved.` Those counts are now hard-pinned in `scripts/creator-vault-qa.js`. The pinned-count commit `263e2857fd86eaa2ac069ea5e4004ff6351ad406` passed run `33951139985` with the same three gates green.

## Provider registry architecture

- `catalog/creator-vault/projects.json` is the canonical base registry.
- `catalog/creator-vault/project-sources/provider-closure-01.json` through `provider-closure-06.json` preserve chunk-6 provider closure.
- `provider-closure-07-enderverse-ep1.json` contains Episode 1 provider enrichment.
- `provider-closure-08a-enderverse-ep2.json` through `provider-closure-08e-enderverse-ep2.json` contain Episode 2 provider enrichment.
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

1. Ingest EnderVerse Vanilla+ Episode 3 from original YouTube video `6dx2t_lD1gw`, published 2024-06-16, using its exact 40 original-description mod chapters.
2. Canonicalize those 40 mentions against the current 334-project registry before creating new IDs.
3. Resolve all independently verified direct provider homes, using small sharded provider overlays rather than one large monolith.
4. Run focused Creator Vault QA, full catalog regression QA, and portable render; pin the exact new aggregate counts.
5. Checkpoint repo + the same Drive wiki, then ingest Episode 5 finale (`GYz4LQcNZ7s`).
6. After the five-part Vanilla+ family is complete, continue AsianHalfSquat toward 349 videos and then the protected TikTok creator ledger.

No active mod JAR moves are part of Creator Vault work.
