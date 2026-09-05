# Enderloom Creator Vault Wiki

Status: active development  
Current branch: `feature/creator-vault-search-qol-chunk-6`  
Strategy: full-history-first, incremental-after  
Data contract: source evidence and provider identity are separate gates; never fabricate creator recommendations, chapters, timestamps, loaders, aliases, or project URLs.

## Purpose

Creator Vault is Enderloom's native creator-recommendation layer. It catalogs Minecraft projects surfaced by tracked YouTube/TikTok creators, keeps every source video/post and evidence mention attached, and exposes the corpus through Enderloom's existing UI. It remains additive and fail-soft; Creator Vault work does not move active mod JARs or rewrite launcher internals.

## Chunk 6 — duplicate-free search + provider closure

Checkpoint code/data commit: `1af7c25ad08c220aa9b838fc1b733f2ecbfdbc2d`  
GitHub Actions proof run: `33941675803`

The Creator Vault search model is now canonical-project based instead of mention based:

- **311 source recommendation mentions** remain preserved.
- Those mentions merge into **264 canonical projects** during search.
- **263 / 264 canonical projects have verified direct project destinations**.
- The registry exposes **366 exact direct destinations** across Modrinth, CurseForge, official project pages, GitHub, or creator-controlled project pages where applicable.
- **100 canonical projects are multi-provider** and expose every verified provider destination on the same card.
- The sole unresolved source label is **`Plank and Junk`**. Extensive source-context/public-project searching did not find a trustworthy public project page, so its original EnderVerse source moment remains available and the UI deliberately keeps `Find in Enderloom` rather than inventing a URL.

### Search behavior

When the user searches Creator Vault, repeated recommendations are no longer repeated as separate cards. One canonical project card is returned and every creator/video/timestamp/evidence occurrence is listed underneath it.

Examples of canonical alias merging include:

- `Solas`, `Solas Shader`, `Solas Shaders` → one **Solas Shader** project with 7 source mentions.
- `Complementary`, `Complementary Shaders` → one **Complementary Shaders** project with 5 mentions.
- `Leawind`, `Leawind's Third Person` → one project with all 3 mentions.
- `Physics Mod`, `Physics Mod Pro` → one **Physics Mod** project with 3 mentions; `Physics Mod Pro` remains a searchable alias.
- `Auto HUD` / `AutoHud`, `Bliss` / `Bliss Shaders`, `Photon` / `Photon Shader` / `Photon Shaders`, `Road Architect & Encounters` / `Road Architect Encounters`, and the other established alias groups are handled the same way.

Search matches canonical names, aliases, creator names/handles, source video titles, loaders, provider names, and provider URLs. Creator/platform filters still scope the source mentions shown on the merged result.

### Direct-provider buttons

A canonical card renders every independently verified project destination instead of choosing one arbitrary provider. Provider badges remain non-repetitive while direct buttons may repeat a provider when the provider itself has loader-specific project pages.

Important cases:

- **Eating Animation** stays one canonical card but exposes four loader/provider destinations: Modrinth Fabric, CurseForge Fabric, Modrinth Forge/NeoForge, and CurseForge Forge/NeoForge.
- **Connectible Chains** stays one canonical card but preserves separate CurseForge Fabric and Forge destinations.
- **Orbital Railgun** preserves its loader-specific Modrinth/CurseForge destinations.
- **Valley & Sky** is still WIP and has no public Modrinth/CurseForge build; its real official creator-controlled project page is used instead of manufacturing a provider listing.
- **CazToon** exposes its real creator-controlled project page rather than a guessed provider slug.

The direct-link gate rejects generic provider search pages. A button must be an exact HTTPS project destination.

### Append-only provider overlays

Provider resolution is now maintainable without rewriting historical recommendation sources:

- `catalog/creator-vault/projects.json` is the compact canonical base registry.
- `catalog/creator-vault/project-sources/*.json` contains append-only provider/alias overlays.
- Repeated canonical project IDs across overlays are merged by `src/creator-vault.js` rather than treated as duplicate projects.
- Provider links are unioned and URL-deduplicated.
- Aliases are unioned into the same canonical identity.
- Future Modrinth/CurseForge/official mirrors can be added in small evidence-backed batches without touching creator-source history.

Chunk 6 provider closure is currently split into six bounded overlay files:

- `provider-closure-01.json`
- `provider-closure-02.json`
- `provider-closure-03.json`
- `provider-closure-04.json`
- `provider-closure-05.json`
- `provider-closure-06.json`

## Current Creator Vault totals

- 14 tracked creators
- 3 creators with native recommendation data: Kreksu, AsianHalfSquat, EnderVerse
- 21 exact source videos
- 311 recommendation mentions
- 264 canonical projects
- 263 canonical projects with verified direct destinations
- 366 exact direct destinations
- 100 multi-provider canonical projects
- 1 explicit no-public-project-page exception: `Plank and Junk`
- 1 pinned AsianHalfSquat legacy import
- 2 native recommendation source documents
- 5 recurring Kreksu setup/resource packs

## Creator coverage ledger

| Creator | Platform | Role | Current state | Next evidence gate |
| --- | --- | --- | --- | --- |
| AsianHalfSquat (`@AsianHalfSquat`) | YouTube | protected core | **16 exact videos / 216 recommendation mentions; target 349 videos** | Continue source lineage toward 349; provider overlays now enrich shared canonical projects automatically |
| EnderVerse (`@EnderVerseMC`) | YouTube | protected core | **2 exact videos / 65 chapter recommendations** | Continue the remaining 200-mod Vanilla+ episodes/history; new projects inherit the canonical link workflow |
| Kreksu (`@KreksuMinecraft`) | YouTube | curated core | **3 exact videos / 30 recommendations / original 30 direct homes preserved** | Continue new source-verifiable history; queued animation video still requires original full chapters |
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

All 14 creator identities remain active in the canonical ledger.

## Preserved source-lineage state

### Kreksu

Kreksu remains 3 source-verified videos / 30 recommendations. All original chunk-3 direct project URLs are regression-locked and remain the primary URLs for their original recommendation records. The recurring animation/resource packs remain separately tracked. The queued animation-mod video remains un-ingested until its original full chapter list is source-verifiable.

### AsianHalfSquat

The chunk-4 reconciled Minecraft Mod Vault import remains pinned:

- 16 exact videos
- 216 recommendation mentions
- verified channel-history target: 349 videos
- canonical Drive source ID: `1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh`
- original Drive SHA-256: `6e49a5154e1a757df75c4ab7371f91632250b551f9e1e3b00781db035b43a9e1`
- compact logical snapshot SHA-256: `4e45e92fed3171175fcf50b37d9dcfd91b88217582fe9a924f405397eea649e8`
- six deterministic repo shards with their existing per-shard hash/count contracts

The source records are not rewritten when provider homes are discovered. Canonical registry overlays enrich them at load time.

### EnderVerse

The archived v0.7.0 recovery checkpoint remains explicit: the old creator-archive implementation did not pre-populate a real public EnderVerse corpus because network/DNS access failed. Test fixtures were never promoted to creator evidence.

Current real EnderVerse data remains:

- 2025-12-06 `JF6FITETMLM`: 25 exact chapter recommendations.
- 2024-10-19 `kxXz-FbvhAA`: 40 exact chapter recommendations.

All 65 recommendation records retain original YouTube description/chapter provenance, numeric ordered timestamps, and exact deep links. Provider enrichment is applied independently through canonical project identities.

## Chunk 6 acceptance gate

`npm run creator-vault-qa` now requires:

- 14 unique creators, 3 indexed creators, 21 source videos;
- 311 recommendation mentions preserved;
- exactly 264 canonical projects;
- canonical mention counts sum back to 311;
- exactly 263 canonical projects with direct homes;
- exactly 366 verified direct destinations;
- exactly 100 multi-provider projects;
- exactly one unresolved canonical project and its name must be `Plank and Junk`;
- every provider URL is HTTPS and no generic `/search` result is accepted as a direct home;
- every source mention resolves to a canonical project;
- Solas, Complementary, Leawind, Physics Mod/Pro and other alias contracts remain merged;
- Eating Animation and Connectible Chains preserve loader-specific provider destinations;
- Valley & Sky and CazToon preserve truthful creator-controlled project destinations;
- all original Kreksu direct homes remain unchanged;
- AsianHalfSquat import hashes/counts remain unchanged;
- EnderVerse 25+40 chapter contracts remain unchanged;
- rendered UI contains duplicate-free search, full source evidence, multi-provider actions and the sole unresolved fallback.

## Verified CI proof

GitHub Actions run `33941675803` on code/data commit `1af7c25ad08c220aa9b838fc1b733f2ecbfdbc2d` completed successfully.

Successful steps:

- Checkout
- Node 22
- Install dependencies
- **Focused Creator Vault QA — success**
- **Catalog regression QA — success**
- **Render portable catalogs — success**

This is the real broad repository proof for the duplicate-free/provider-closure implementation; it replaces the earlier chunks where only targeted local validation was available.

## Exact next action

1. Resume creator-history ingestion rather than re-researching already-resolved provider identities.
2. Continue EnderVerse with the remaining `TOP 200 Vanilla+` episodes as a strong bounded source family.
3. Continue AsianHalfSquat from 16 toward the verified 349-video history target.
4. Progress the protected TikTok creator ledger while preserving the existing live extraction gates.
5. As new recommendations arrive, resolve their canonical identity first; add provider homes through small append-only overlays and show all verified providers on the same result card.
6. Revisit `Plank and Junk` only if new source or project-page evidence appears; never invent a destination.

No active mod JAR moves are part of Creator Vault work.
