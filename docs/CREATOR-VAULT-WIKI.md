# Enderloom Creator Vault Wiki

Status: active development  
Chunk: Kreksu ingestion / native Enderloom addon, chunk 1  
Strategy: full-history-first, incremental-after  
Data contract: evidence-first; never invent a CurseForge/Modrinth/provider URL.

## What Creator Vault is

Creator Vault is Enderloom's creator-recommendation layer. It tracks Minecraft creators across YouTube and TikTok, records the exact videos/posts where they recommend projects, keeps timestamps and evidence attached, and exposes those recommendations directly inside Enderloom's catalog UI.

The addon is intentionally additive: it loads through `src/catalog-renderer.js`, so the existing launcher, catalog, provider-media pipeline, and active JAR locations remain untouched.

## User experience

The Creator Vault panel provides:

- creator cards with platform, role, coverage state, and pinned favorites;
- YouTube/TikTok and per-creator filtering;
- recommendation search across creator, mod, loader, title, and evidence;
- video-grouped recommendation cards;
- exact timestamp links to the creator's recommendation moment;
- `Find in Enderloom` handoff for projects without a verified provider URL;
- direct project buttons only when the provider URL is verified;
- one-click copy of every mod name from a video;
- recurring creator setup/resource packs separated from the main recommendation list;
- source/evidence badges so discovery never becomes anonymous catalog data.

## Creator coverage ledger

| Creator | Platform | Role | Current state | Goal / next evidence gate |
| --- | --- | --- | --- | --- |
| AsianHalfSquat (`@AsianHalfSquat`) | YouTube | protected core | Legacy catalog ready; previous checkpoint has 11 exact videos / 93 evidence-backed recommendations; expected channel history recorded as 349 videos | Import the legacy Creator Vault bundle into native Enderloom, then resume history coverage |
| EnderVerse (`@EnderVerseMC`) | YouTube | protected core | Legacy catalog ready | Import legacy creator bundle and retain provider/showcase cross-links |
| Kreksu (`@KreksuMinecraft`) | YouTube | curated core | **Active ingestion: 2 verified videos / 20 recommendations in chunk 1** | Continue channel history in bounded batches; resolve discovered animation video only when chapters are verifiable |
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

## Kreksu - chunk 1

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

`Keybind Atlas` is currently the only project in this batch with an independently verified provider URL in the Creator Vault dataset: https://modrinth.com/mod/keybind-atlas. All other unresolved provider URLs intentionally remain empty until verified.

### Recurring setup/resource packs

Kreksu lists these as extra animation texture packs used in every indexed video, so Creator Vault stores them separately from each video's main recommendations:

- Detailed Animations
- Fresh Animations
- Fresh Animations: Player Extension
- Joyful Motion
- Silly Moves

### Queued discovery

`TOP +10 Best Animation Mods in Minecraft! [+1.20.1, +1.21.1 | Forge / Fabric / NeoForge]` has been discovered as a Kreksu video, but its full chapter/recommendation list has not yet been captured from a source reliable enough for the evidence-first dataset. It remains queued instead of being guessed.

## Data files

- `catalog/creator-vault/creators.json` - canonical creator identity and coverage ledger
- `catalog/creator-vault/recommendations.json` - source-grounded creator videos, recommendations, timestamps, and recurring setup packs
- `src/creator-vault.js` - fail-soft loader and normalization
- `catalog/creator-vault/creator-vault.js` - native Enderloom UI addon
- `catalog/creator-vault/creator-vault.css` - responsive Creator Vault presentation
- `scripts/creator-vault-qa.js` - focused acceptance/provenance gate

## Acceptance gate for this chunk

`npm run creator-vault-qa` must prove:

- 14 creator identities are present and unique;
- Kreksu is registered under `youtube:kreksuminecraft`;
- chunk 1 contains exactly 2 verified Kreksu videos and 20 main recommendations;
- all 20 recommendations retain chapter timestamps and source evidence;
- timestamps are ordered and deep-link to the video moment;
- unresolved provider URLs remain empty;
- verified Keybind Atlas provider URL is preserved;
- the Creator Vault data, CSS, and UI script are embedded by the real catalog renderer.

## Exact next chunk

1. Run the branch QA in the full Enderloom checkout/runtime.
2. Continue Kreksu's channel-wide history scan in another bounded batch; prefer direct YouTube descriptions/chapters and never infer missing projects from titles alone.
3. Enrich the current 20 recommendations with verified Modrinth/CurseForge project URLs and metadata where exact identity is unambiguous.
4. Import the existing AsianHalfSquat and EnderVerse legacy Creator Vault records into the same native schema.
5. Then move through the protected TikTok list in the ledger, preserving the old full-history-first / incremental-after contract and live acceptance gates.

No active mod JAR moves are part of Creator Vault work.
