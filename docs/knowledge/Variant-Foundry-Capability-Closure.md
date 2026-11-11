# Variant Foundry Capability Closure

The **Variant Foundry & High-Fidelity Java Models** feature is treated as a complete asset-production system, not just a biome recolor generator.

## The whole chain

```text
Concept / Existing Asset
  -> SubjectDNA
  -> Shape + Parts
  -> Minecraftization
  -> UV + Texture + Materials
  -> Rig + Animation + IK + Living Motion
  -> BiomeDNA / DimensionDNA
  -> Variant Family
  -> Target Runtime Compiler
  -> Minecraft Runtime Proof
  -> Performance + Compatibility Proof
  -> Variant Atlas
```

Every stage is replaceable behind a typed adapter. If one model, provider or editor route fails, Enderloom resumes from the last valid stage instead of throwing away the asset.

## New pieces required for true closure

### Minecraft Texture Compiler

AI-generated 2K/4K materials are useful working data, but they are not automatically good Minecraft art.

Enderloom now requires a **TextureStyleProfile** with pixel-grid/texel-density rules, palette anchors, alpha handling, UV padding, seam-safe edge dilation, emissive/PBR policy and mod-specific style exemplars. It can intentionally produce vanilla-faithful, 32x/64x faithful or custom mod-native styles rather than doing a blurry last-second resize.

### Runtime ModelBundle compiler

Approved models compile into content-addressed runtime bundles containing shared geometry, texture pages, skeleton/bind pose, animation/controller data, motion graphs, culling/LOD data, variant deltas, biome selectors and exact provenance.

Variants share identical data instead of cloning it. Development hot reload rebuilds only invalidated nodes; release bundles are immutable and reproducible.

### Local/remote GPU job plane

Shape, texture and rig AI runs as cancellable jobs with exact seed/hash receipts, VRAM budgets and provider capability discovery. Heavy stages can run locally or behind a remote GPU worker while deterministic mesh/UV/compile steps stay CPU/headless.

Useful orchestration challengers include:

- [MyMeshy](https://github.com/felippeomgt/mymeshy)
- [OpenX Clay](https://github.com/OpenX-Inc/clay)
- [AssetForge](https://github.com/InFaNsO/AssetForge)

Their useful patterns are integrated behind Enderloom's canonical operation registry rather than creating another parallel asset database.

### Better texture/material challengers

The texture lane now explicitly compares:

- Hunyuan3D-Paint;
- [MVPaint](https://github.com/3DTopia/MVPaint);
- [SyncMVD](https://github.com/LIU-Yuxin/SyncMVD);
- [Paint3D](https://github.com/OpenTexture/Paint3D);
- [TEXGen](https://github.com/CVMI-Lab/TEXGen);
- [StableMaterials](https://github.com/Joey-Jang/StableMaterials) for tileable PBR material proposals.

Exact code/model-weight rights are checked per provider before promotion.

### Stronger asset interchange

GLB/glTF is a first-class intermediate lane. Enderloom uses deterministic validation/processing rather than blindly trusting generator output:

- [glTF Transform](https://github.com/donmccurdy/glTF-Transform)
- [glTF Validator](https://github.com/KhronosGroup/glTF-Validator)
- [meshoptimizer](https://github.com/zeux/meshoptimizer)
- [xatlas](https://github.com/jpcy/xatlas)

### Worldgen adapters

Unknown modded biomes remain supported through runtime discovery. Extra adapters enrich the profile when common worldgen systems are installed:

- [TerraBlender](https://github.com/Glitchfiend/TerraBlender), including its 26.3 branch;
- [Biolith](https://github.com/TerraformersMC/Biolith);
- [Lithostitched](https://github.com/Apollounknowndev/lithostitched);
- [Terra](https://github.com/PolyhedralDev/Terra);
- loader-native biome modification/registry systems.

That means a private biome, datapack biome or future biome can still become a usable BiomeDNA profile without waiting for a hand-written Enderloom preset.

## Runtime compatibility is part of quality

A high-detail model is not “done” because it looks good in Blockbench. Every promoted runtime backend must be challenged with the applicable vanilla/Sodium-or-Embeddium/Iris-or-Oculus/ImmediatelyFast/EntityCulling/MoreCulling/resource-reload combinations.

Near-field detail remains full fidelity. Culling, sleep, shared immutable data, variant deltas, animation/physics LOD and optional GPU paths remove **invisible work**, not visible quality.

## Golden proof

Bloom & Boom remains the flagship end-to-end fixture:

**concept -> editable model -> pixel-art texture compile -> rig -> animations -> living vines/flowers -> discovered biome family -> native Java compile -> actual Minecraft captures -> crowd/render-stack benchmarks -> Wiki Variant Atlas.**

The fixture must include at least one synthetic/unknown biome to prove Variant Foundry is a real discovery engine rather than a hardcoded list.

## Canonical documents

- [Variant Foundry / Universal Biome & Model Variator](../ENDERLOOM_UNIVERSAL_BIOME_MODEL_VARIATOR_SPEC.md)
- [High-Fidelity Java Model Runtime](../ENDERLOOM_HIGH_FIDELITY_JAVA_MODEL_RUNTIME_SPEC.md)
- [Capability Closure](../ENDERLOOM_VARIANT_FOUNDRY_CAPABILITY_CLOSURE.md)
- [Current challenger scan](../ENDERLOOM_VARIANT_MODEL_RUNTIME_CHALLENGER_SCAN_2026-09-27.md)
