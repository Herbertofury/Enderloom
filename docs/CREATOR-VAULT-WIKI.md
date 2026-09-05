# Enderloom Creator Vault Wiki

Status: active development  
Chunk: Kreksu ingestion / native Enderloom addon, chunk 2  
Strategy: full-history-first, incremental-after  
Data contract: evidence-first; never invent a CurseForge/Modrinth/provider URL.

## What Creator Vault is

Creator Vault is Enderloom's creator-recommendation layer. It tracks Minecraft creators across YouTube and TikTok, records the exact videos/posts where they recommend projects, keeps timestamps and evidence attached, and exposes those recommendations directly inside Enderloom's catalog UI.

The addon is intentionally additive: it loads through `src/catalog-renderer.js`, so the existing launcher, catalog, provider-media pipeline, and active JAR locations remain untouched.

## User experience

The Creator Vault panel provides:

- creator cards with platform, role, coverage state, and pinned favorites;
- YouTube/TikTok and per-creator filtering;
- recommendation search across creator, mod, loader, provider, project type, title, and evidence;
- video-grouped recommendation cards;
- exact timestamp links to the creator's recommendation moment;
- `Find in Enderloom` handoff for projects without a verified provider URL;
- direct provider-specific buttons only when the project home is independently verified;
- visible `Modrinth` / `CurseForge` badges plus `Mod` / `Data Pack` project-type badges;
- a verified-project-home KPI and per-video verified-home counts;
- one-click copy of every mod name from a video;
- recurring creator setup/resource packs separated from the main recommendation list;
- source/evidence badges so discovery never becomes anonymous catalog data.

## Creator coverage ledger

| Creator | Platform | Role | Current state | Goal / next evidence gate |
| --- | --- | --- | --- | --- |
| AsianHalfSquat (`@AsianHalfSquat`) | YouTube | protected core | Legacy catalog ready; previous checkpoint has 11 exact videos / 93 evidence-backed recommendations; expected channel history recorded as 349 videos | Import the legacy Creator Vault bundle into native Enderloom, then resume history coverage |
| EnderVerse (`@EnderVerseMC`) | YouTube | protected core | Legacy catalog ready | Import legacy creator bundle and retain provider/showcase cross-links |
| Kreksu (`@KreksuMinecraft`) | YouTube | curated core | **Active ingestion: 3 verified videos / 30 recommendations / 11 verified project homes through chunk 2** | Continue channel history in bounded batches; resolve discovered animation video only when chapters are verifiable |
| Kizamiringo (`@kizamiringo`) | TikTok | protected core | Legacy pipeline; live gate pending | Full-history enumeration + real text-only extraction parity |
| Katsumi (`@its_katsumi`) | TikTok | curated core | Legacy ready; link refresh pending | Refresh public link-hub child destinations, then ingest posts |
| SpeedyChunks (`@speedychunks`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| NoxusMinecraft (`@noxusminecraft`) | TikTok | required | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| UnyxYT (`@unyxyt`) | TikTok | required | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| CurseForge (`@curseforge`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence and keep provider identity distinct from project provider links |
| HendyVideos (`@hendyvideos`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| Knarfy (`@itsknarfy`) | TikTok | recommended discovery source | Tracked | Evaluate creator history and promote only evidence-backed Minecraft recommendations |
| The Breakdown (`@thebreakdownxyz`) | TikTok | recommended discovery source | Tracked | Evaluate creator history and promote only evidence-backed Minecraft recommendations |
| The Crimson Gaming (`@thecrimsongaming`) | TikTok | recommended discovery source | Tracked | Evaluate creator history and promote only evidence-backed Minecraft recommendations |
| laveOrc (`@ygz207`) | TikTok | recommended discovery source | Tracked | Evaluate creator history and promote only evidence-backed Minecraft recommendations |

## Kreksu - chunk 2

### Video: These Underrated Minecraft Mods are Actually Insane!

Published: 2026-04-05  
Source: https://www.youtube.com/watch?v=Hg1_20vRrZM

1. `00:08` - Apocalyptic Bosses - Forge / NeoForge
2. `00:56` - Chris's Additions - Fabric
3. `01:48` - Envelope - Fabric / NeoForge
4. `02:55` - Cascades - Fabric / Forge / NeoForge
5. `03:42` - Curiosities! - NeoForge
6. `04:16` - Starcatcher - Forge / NeoForge
7. `04:55` - [BUB] Gender - Forge
8. `05:24` - Simply Bows - Fabric / NeoForge
9. `06:06` - Shutter Up! - Fabric / Forge / NeoForge
10. `06:23` - ShellBound for AirShip - Fabric / Forge / NeoForge

Evidence is the original Kreksu YouTube description/chapter list.

### Verified project homes for all 10 April 5 recommendations

| Recommendation | Verified provider home | Provider / project type |
| --- | --- | --- |
| Apocalyptic Bosses | https://www.curseforge.com/minecraft/mc-mods/apocalypticbosses | CurseForge / Mod |
| Chris's Additions | https://modrinth.com/mod/chris_s_additions | Modrinth / Mod |
| Envelope | https://modrinth.com/mod/envelope | Modrinth / Mod |
| Cascades | https://modrinth.com/datapack/hybrid-beta | Modrinth / Data Pack |
| Curiosities! | https://modrinth.com/mod/curiosities-syndicate | Modrinth / Mod |
| Starcatcher | https://modrinth.com/mod/starcatcher | Modrinth / Mod |
| [BUB] Gender | https://modrinth.com/mod/genderbub | Modrinth / Mod |
| Simply Bows | https://modrinth.com/mod/simply-bows | Modrinth / Mod |
| Shutter Up! | https://modrinth.com/mod/shutter-up | Modrinth / Mod |
| ShellBound for AirShip | https://modrinth.com/mod/shellbound-for-airship | Modrinth / Mod |

Provider identity was verified against exact project title plus relevant Minecraft version/loader evidence. Cascades is intentionally stored as `projectType=datapack` because the canonical Modrinth project is a world-generation data pack that also ships for mod loaders; Kreksu's creator-stated Fabric/Forge/NeoForge evidence is preserved separately.

## Kreksu - chunk 1 retained

### Video: HIDDEN GEM Minecraft Mods That Are Actually INSANE!

Published: 2026-04-09  
Source: https://www.youtube.com/watch?v=iTsP0Xsdcv8

1. `00:07` - Legionary - Forge
2. `01:09` - Draconic Spells - Forge
3. `01:59` - Threateningly Mobs - Forge
4. `02:58` - Wings Of Fire! - Forge / NeoForge
5. `03:43` - ByteBuddies - Forge / NeoForge
6. `04:48` - Better Fishtanks - Forge / NeoForge
7. `05:51` - Feastful - Forge
8. `06:37` - ReCased - Forge
9. `07:36` - Bountiful Fares - Fabric / NeoForge
10. `08:27` - Even Better Nether - Forge / NeoForge

### Video: These New Underrated Minecraft Mods are Actually Insane!

Published: 2026-05-07  
Source: https://www.youtube.com/watch?v=fgu7ssEVzAA

1. `00:06` - Craftics - Grid Based Tactical RPG - Fabric
2. `02:08` - Gateway to Doom - Fabric / NeoForge
3. `02:54` - Boundless & Endless - Forge
4. `03:44` - Iden's Decor - NeoForge
5. `04:30` - Nimbu's: Pocket Dimensions - Fabric
6. `05:32` - Better Horse/Mount Steering - Forge
7. `06:10` - Keybind Atlas - Forge / NeoForge
8. `06:50` - Lazy Tools - NeoForge
9. `08:10` - Happy Ghast Inventory - Fabric / Forge / NeoForge
10. `08:42` - Jaki Versatile Structures: Sails & Sea - Fabric / Forge

`Keybind Atlas` remains independently verified at https://modrinth.com/mod/keybind-atlas. Together with the April 5 provider pass, the native Kreksu dataset now has **11 verified direct project homes** and 19 recommendations that remain source-backed but provider-unresolved.

### Recurring setup/resource packs

Kreksu lists these as extra animation texture packs used in every indexed video, so Creator Vault stores them separately from each video's main recommendations:

- Detailed Animations
- Fresh Animations
- Fresh Animations: Player Extension
- Joyful Motion
- Silly Moves

All five reference all three indexed Kreksu source videos.

### Queued discovery

`TOP +10 Best Animation Mods in Minecraft! [+1.20.1, +1.21.1 | Forge / Fabric / NeoForge]` remains discovered but un-ingested because its complete chapter list has not yet been recovered from a source reliable enough for the evidence-first dataset.

## Data files

- `catalog/creator-vault/creators.json` - canonical creator identity and coverage ledger
- `catalog/creator-vault/recommendations.json` - source-grounded creator videos, recommendations, timestamps, provider homes, and recurring setup packs
- `src/creator-vault.js` - fail-soft loader and normalization
- `catalog/creator-vault/creator-vault.js` - native Enderloom UI addon
- `catalog/creator-vault/creator-vault.css` - responsive Creator Vault presentation including provider/project-type visual states
- `scripts/creator-vault-qa.js` - focused acceptance/provenance/provider gate
- `.github/workflows/creator-vault-qa.yml` - durable branch QA runner for checkout + Creator Vault + catalog regression + portable render

## Acceptance gate through chunk 2

`npm run creator-vault-qa` must prove:

- 14 creator identities are present and unique;
- Kreksu is registered under `youtube:kreksuminecraft`;
- the native dataset contains exactly 3 verified Kreksu videos and 30 main recommendations;
- the April 5 video retains all 10 exact chapter recommendations from Apocalyptic Bosses through ShellBound for AirShip;
- all 10 April 5 recommendations have exact provider homes and `provider-project` provenance;
- Cascades resolves to the canonical Modrinth data-pack project and stays typed as `datapack`;
- all 30 recommendations retain chapter timestamps and source evidence;
- timestamps are ordered and deep-link to the video moment;
- the provider-enriched set is exactly 11 homes: the ten April 5 projects plus Keybind Atlas;
- unresolved provider URLs elsewhere remain empty;
- the Creator Vault data, CSS, and UI script are embedded by the real catalog renderer.

## Verification state

- Local changed-path syntax gate: **PASS** for the exact updated `creator-vault.js` (`node --check`).
- Local changed-path data gate: **PASS** for the exact provider-enriched `recommendations.json`: 3 videos / 30 recommendations / 11 verified homes / 10 of 10 April 5 homes / Cascades typed as data pack.
- Focused full-repository QA is committed and updated for the same invariants.
- A GitHub Actions workflow is committed to run `npm ci`, Creator Vault QA, catalog regression QA, and portable rendering on a real checkout for `feature/creator-vault-kreksu-chunk-*` branches.
- The connector-created workflow commit did not recursively trigger Actions, so no CI-pass claim is made yet. The workflow remains durable for the next normal branch push/manual run.
- The current chat container cannot resolve `github.com`, so direct `git clone` is an environment blocker rather than a source/test failure.

## Exact next chunk

1. Continue Kreksu's channel-wide history scan in another bounded batch using original YouTube descriptions/chapters when available.
2. Resolve exact provider homes for the remaining 19 indexed Kreksu recommendations only where identity is unambiguous.
3. Import the existing AsianHalfSquat and EnderVerse legacy Creator Vault records into the same native schema.
4. Then move through the protected TikTok list in the ledger, preserving the old full-history-first / incremental-after contract and live acceptance gates.
5. On the next normal project checkout/push, run the committed CI workflow and record its run/job identity in this wiki.

No active mod JAR moves are part of Creator Vault work.
