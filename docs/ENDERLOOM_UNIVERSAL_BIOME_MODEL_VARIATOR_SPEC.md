# Enderloom — Universal Biome & Model Variator / Variant Foundry

**Status:** Product / implementation specification  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Scope:** Enderloom + Minecraft Dev Kit + Bloom & Boom and any other mod project  
**Extends:** `ENDERLOOM_CONCEPT_ART_TO_NATIVE_MOD_SPEC.md`, Unified Studio, native visual QA, content lineage, compatibility/evidence systems

## 1. Product goal

Build a first-class **Universal Variant Foundry** inside Enderloom: a one-click/one-workflow system that can take concept art, an existing Minecraft model, an item/block/entity/armor asset, or an already-approved Enderloom project and generate a coherent family of high-quality biome-, dimension-, climate-, and style-aware variants while preserving the source identity.

Primary example: take the approved Bloom & Boom Creeper design and generate beautiful, editable, runtime-ready variants for every vanilla biome plus discovered modded biomes/dimensions (Aether, Twilight Forest, Blue Skies, Undergarden, Bumblezone, Deeper and Darker, Eternal Starlight, Tropicraft, Dimensional Doors, Ad Astra worlds, Voidscape, etc.), without hand-authoring each one from scratch.

This is not only a Bloom & Boom tool. It must work for:

- mobs/entities and bosses;
- items, weapons, tools and food;
- blocks, decorative props and furniture;
- armor/wearables;
- projectiles and particles;
- plants/foliage;
- structures or structure decorations where the same identity-preserving variant logic is useful.

The canonical output remains **editable Minecraft-native assets**, not a flattened render.

## 2. Core pipeline

```text
Concept / existing asset
  -> SubjectDNA
  -> BiomeDNA / DimensionDNA
  -> VariantPlan
  -> geometry + texture + material + rig/animation-aware adaptation
  -> deterministic preview matrix
  -> visual/runtime QA
  -> approved editable assets
  -> loader/version-specific export
```

### SubjectDNA

Capture the source asset's non-negotiable identity:

- silhouette and proportions;
- required face/recognition landmarks;
- horn/ear/tail/limb/body anchors;
- rig hierarchy and pivots;
- texture/material identity;
- palette anchors;
- required animation behaviors;
- gameplay identity and hitbox constraints;
- allowed and forbidden mutation zones;
- provenance and source hashes.

### BiomeDNA / DimensionDNA

Represent biome identity as structured data, not a hardcoded name-to-color table:

- namespaced biome/dimension IDs and tags;
- vanilla/mod/provider provenance;
- temperature, downfall, precipitation and climate;
- sky/fog/water/foliage/grass colors where available;
- dominant surface/subsurface blocks;
- tree/wood/leaf families;
- flowers, fungi, vines, coral, crystals and other flora/mineral motifs;
- common structures/features;
- particles, ambient sounds and music;
- light/emissive character;
- terrain/topology cues;
- common mob families;
- hazard/environment cues;
- source asset palette samples;
- screenshots/reference captures when available;
- confidence and freshness.

The engine should synthesize an art-direction profile from this data while keeping any user-authored profile as the highest-priority authority.

## 3. Dynamic biome/dimension discovery — hard requirement

Do **not** depend on a manually maintained list to support modded biomes.

Enderloom should discover an installed instance's real environment by combining:

1. static scan of datapacks and mod JARs for worldgen biome/dimension JSON, tags, placed/configured features and referenced blocks;
2. mod metadata / dependency identity;
3. runtime registry dump through the Enderloom/Minecraft Dev Kit probe for code-registered biomes/dimensions that static scanning cannot prove;
4. asset mining for referenced textures, blocks, flora and palette cues;
5. optional deterministic native screenshots/reference captures for visual characterization.

Unknown/new custom biomes become **unresolved profiles to characterize**, never silently fall back to generic green/brown.

This lets the tool work with private mods, unreleased mods, modpacks, datapacks and future versions without waiting for an Enderloom update.

## 4. Curated built-in catalog

Maintain a versioned curated catalog as a quality accelerator, while dynamic discovery remains authoritative for what is actually installed.

### Vanilla
- Every current vanilla biome/dimension supported by the selected Minecraft version.
- Include 26.3 Dappled Forest and the current Sulfur Caves lineage.
- Keep experimental/upcoming entries provenance-gated rather than pretending they are already stable.

### Upcoming official content
- Track Mojang-published future dimensions/biomes separately under an `experimental/upcoming` channel.
- The Sift should have a provisional dimension profile based only on official information until Java/Bedrock implementation details are released.
- Never fabricate unknown Sift biomes/features; update the profile as snapshots/releases expose registry and asset truth.

### High-priority modded dimension packs
Start curated adapters/profiles for major ecosystems including at least:
- The Aether / Aether II lineage;
- The Twilight Forest;
- Blue Skies;
- The Undergarden;
- The Bumblezone;
- Deeper and Darker / Otherside;
- Eternal Starlight;
- Tropicraft;
- Dimensional Doors;
- Ad Astra world/dimension families;
- Voidscape;
- other popular dimension mods discovered from the user's actual installed/catalog ecosystem.

Curated packs should contain real namespaced biome IDs/tags/assets for the supported mod version, not fuzzy text matching.

## 5. Variant modes

Expose deliberate levels of transformation:

- **Texture-only** — palette/material/overlay/emissive changes; geometry locked.
- **Surface** — texture plus leaves, flowers, fungi, barnacles, crystals, snow, moss, etc.
- **Geometry** — controlled silhouette-safe horn/spike/frond/plate/body-part adaptations.
- **Rig-aware** — geometry changes constrained by existing bones/pivots/animation envelopes.
- **Animation-aware** — optional secondary-motion or biome-character animation changes.
- **Full phenotype** — geometry + materials + effects + optional gameplay hooks under explicit policy.

Per-region locks must allow a user to freeze the face, horns, body, legs, item silhouette, logo, UV region, animation, or any other identity-critical zone.

## 6. Minecraft-native authoring

First-class outputs:

- Blockbench `.bbmodel`;
- Minecraft Java model/entity assets;
- Bedrock geometry when targeted;
- native/GeckoLib/AzureLib-compatible entity assets where selected;
- item model definitions and texture variants;
- resource-pack compatibility export when useful;
- editable textures, UVs, animation files, locators and source metadata.

A dense AI-generated mesh may be used as a **scaffold/reference**, but never becomes the final Minecraft deliverable by default. Enderloom must fit/adapt it into the chosen Minecraft art-direction and renderer constraints.

## 7. Variant intelligence

For every candidate variant, the planner decides separately:

- palette shift;
- material substitution;
- texture pattern;
- biome growth/decal placement;
- horn/appendage morphology;
- shape accents;
- emissive/translucent accents;
- particle/VFX accents;
- ambient sound hooks;
- animation accents;
- spawn/runtime selector.

Use deterministic seeds so approved variants can be reproduced exactly.

The tool must support:
- `Generate one`;
- `Generate N candidates`;
- `Generate every biome`;
- `Generate every biome in this dimension`;
- `Generate every biome in this installed modpack`;
- `Generate only missing variants`;
- `Regenerate this region only`;
- `Keep geometry, reroll texture`;
- `Keep face/horns, reroll growths`.

## 8. Runtime variant semantics

Support both semantics explicitly:

### Spawn-origin variant
The entity gets a stable variant from its spawn biome/dimension and keeps it when moved. Persist the variant ID in normal entity state/component/NBT as appropriate for the target version/loader.

### Live-environment variant
The asset adapts to its current biome/dimension under configurable transition rules, cooldowns and client/server synchronization.

Default for creature identity should normally be spawn-origin; live adaptation is opt-in unless the mod design calls for it.

Items/blocks should receive equivalent explicit context rules rather than silently changing in ways that break inventory/build identity.

## 9. UX: “it just works”

Inside Unified Studio:

- **Variant Foundry** workspace, not another disconnected application;
- drag concept/model/item in;
- choose target instance/version/loader;
- select `All Biomes`, a dimension, tags, installed mod, or handpicked biomes;
- instant biome cards with palette, blocks, flora, mood and provenance;
- visual strength sliders: conservative <-> wild, texture <-> geometry, organic <-> mineral, clean <-> overgrown, emissive intensity;
- locks for face/silhouette/rig/UV/animation;
- batch candidate gallery;
- synchronized front/side/back/3/4 views;
- turntable and animation preview;
- side-by-side source vs variant;
- native Minecraft capture comparison;
- approve/reject/star and `make more like this`;
- regenerate one part without throwing away the approved rest;
- undo/history and immutable source lineage.

For Bloom & Boom, ship a dedicated preset that understands horn identity, bloom/growth regions, creeper face identity, leg/foot silhouette, charged/explosion state and male/female base families.

## 10. Quality gates

Every approved variant must pass:

- source identity preservation;
- biome/dimension visual relevance;
- real diversity versus sibling variants;
- no accidental clone/palette-swap-only result when geometry variation was requested;
- UV/seam/transparency/emissive audit;
- rig/pivot/animation compatibility;
- hitbox/culling/grounding checks;
- target art-direction constraints;
- performance budget;
- real Minecraft rendering/runtime verification where applicable.

Report metrics separately:
- identity fidelity;
- biome match;
- variant novelty;
- palette/material match;
- silhouette deviation;
- texture/UV quality;
- animation safety;
- runtime/performance status.

Never collapse these into one opaque “quality score.”

## 11. External projects to study/integrate

All integration is license-aware and source-attributed. Prefer adapters/plugins/authorized reuse over reimplementing weaker copies.

### Minecraft-native
- **Blockbench** — core editable model/texture/animation target and plugin host. Prefer the public plugin API/format adapters unless GPL source integration is intentionally isolated/compliant.
  - https://github.com/JannisX11/blockbench
- **Entity Texture Features (ETF)** — study/import/export its random/custom entity texture and emissive rule model; useful compatibility target.
  - https://github.com/Traben-0/Entity_Texture_Features
- **Entity Model Features (EMF)** — study/import/export random Custom Entity Model behavior and modded-entity CEM support.
  - https://github.com/Traben-0/Entity_Model_Features
- **Creeper Overhaul** — biome-specific creeper family as a useful implementation/reference fixture for variant identity and spawn-biome behavior.
  - https://github.com/CheetahStimulate/creeper-overhaul-mc-mod

### Optional 3D reconstruction / scaffolding adapters
- **TRELLIS** — image/text -> 3D plus local editing; useful for multi-view scaffolding.
  - https://github.com/microsoft/TRELLIS
- **Hunyuan3D-2.1** — high-fidelity shape/PBR generation adapter candidate.
  - https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
- **TripoSR** — fast single-image 3D reconstruction; useful for rough blockout.
  - https://github.com/VAST-AI-Research/TripoSR
- **InstantMesh** — single-image -> multi-view/sparse-view mesh generation; useful for geometry hypotheses.
  - https://github.com/TencentARC/InstantMesh
- **UniRig / successor research** — candidate optional rig-proposal stage for imported dense meshes; Minecraft rig conversion still requires Enderloom validation.
  - https://github.com/VAST-AI-Research/UniRig
- **SAM 2** and **Depth Anything V2** — useful reference segmentation/depth cues before Minecraft-specific reconstruction.
  - https://github.com/facebookresearch/sam2
  - https://github.com/DepthAnything/Depth-Anything-V2

These are challengers/providers behind a swappable adapter interface. No single AI model may become a hard dependency.

## 12. Architecture additions

Add typed objects to the existing concept/reference system, not a new shadow database:

- `SubjectDNA`
- `VariantIdentityAnchor`
- `BiomeSource`
- `BiomeDNA`
- `DimensionDNA`
- `BiomeAssetEvidence`
- `BiomePalette`
- `BiomeMotif`
- `VariantPolicy`
- `VariantPlan`
- `VariantSeed`
- `VariantCandidate`
- `VariantRegionLock`
- `VariantFamily`
- `VariantSelector`
- `VariantRuntimeBinding`
- `VariantQualityReport`
- `VariantFailurePacket`
- `BiomeAdapter`
- `VariantProviderAdapter`

Everything attaches to Enderloom's canonical Project/Artifact/Evidence/Task/Concept objects.

## 13. CLI / automation surface

Target commands:

```text
enderloom variant discover-biomes --instance <path>
enderloom variant profile --biome <namespace:id>
enderloom variant create --source <asset> --biome minecraft:dappled_forest
enderloom variant family --source <asset> --all-biomes
enderloom variant family --source <asset> --dimension aether:the_aether
enderloom variant family --source <asset> --installed-instance <path>
enderloom variant reroll --candidate <id> --region horns --keep face,rig
enderloom variant verify --family <id> --native
enderloom variant export --family <id> --target forge:1.20.1
```

GUI, CLI, MCP and AI operator must all call the same canonical operation registry.

## 14. Acceptance fixtures

Mandatory initial fixtures:

1. **Bloom & Boom Creeper**
   - create distinct, identity-preserving variants across a representative Overworld/Nether/End matrix;
   - generate from supplied concept art and from the existing editable base model;
   - prove reroll-region and lock behavior;
   - prove spawn-origin variant persistence.

2. **Vanilla item**
   - create biome-themed material/model variants without breaking inventory/hand/GUI representation.

3. **Unknown custom biome**
   - synthetic test mod/datapack with a biome Enderloom has never seen;
   - prove discovery -> BiomeDNA -> candidate -> export with no hardcoded adapter.

4. **Aether-compatible fixture**
   - discover real namespaced biome data from a supported Aether test instance and create a coherent variant family.

5. **26.3 fixture**
   - include Dappled Forest and Sulfur Caves;
   - native runtime proof for the target route supported by the Dev Kit.

## 15. Non-negotiable invariants

- Preserve the original concept/model/assets immutably.
- Never trade identity, fidelity or content away for speed.
- No hardcoded “supported biomes only” wall for modded content.
- Unknown modded biome != unsupported; characterize it.
- Curated profiles accelerate quality but dynamic discovery provides coverage.
- No fake Minecraft model from a pretty dense mesh; output must be editable and target-runtime-valid.
- Model providers are swappable challengers.
- Every generation keeps exact provider/model/version/seed/input hashes and derivation lineage.
- Generated variants are reproducible.
- Native/runtime proof remains stronger than editor-only proof.
- Existing concept-art-to-native-mod work is extended, not duplicated.
