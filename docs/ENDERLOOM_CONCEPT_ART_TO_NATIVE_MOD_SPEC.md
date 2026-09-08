# Enderloom — Concept Art -> Native Minecraft Mod Specification

**Status:** Mandatory product / implementation contract  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Parents:** `docs/ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md`, `docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md`, `docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md`, `docs/ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md`

Enderloom must be able to take authorized visual concept material and carry it all the way to a verified, installable, native Minecraft project. The workflow does not end at a moodboard, prompt, picture, `.bbmodel`, or generated Java source. It ends only when the requested content exists in Minecraft, behaves correctly, preserves the accepted concept intent, integrates with the target ecosystem, and passes the strongest applicable runtime acceptance gates.

The product target is:

> **Concept art / reference -> structured design contract -> native models/textures/animations/gameplay -> ecosystem integration -> real Minecraft visual/runtime QA -> iterative repair -> release.**

The pipeline must work without depending on synthetic image generation. Image-generation providers may only be optional user-selected tools when the user explicitly enables them; Enderloom's canonical workflow is reference analysis + native asset authoring/editing + deterministic reconstruction + Minecraft runtime verification.

---

# 1. Concept Source Intake

Supported authorized reference sources include:

- single concept illustration;
- front / side / rear turnaround sheets;
- orthographic model sheets;
- character / creature sheets;
- prop / item / weapon / armor sheets;
- block / furniture / machine concepts;
- architecture / environment / biome concepts;
- UI / HUD mockups;
- spell / particle / VFX concepts;
- rough sketches;
- paintovers;
- screenshots;
- sprite sheets;
- texture sheets;
- GIFs;
- videos;
- multi-view image sets;
- reference models supplied by the user;
- exported Blockbench / Blender / other source files supplied by the user;
- server-delivered or author-supplied assets the user is authorized to use.

Each input receives:

- immutable source hash;
- source type;
- author / origin / rights note where known;
- resolution / dimensions / frame count / duration where applicable;
- project association;
- approved usage scope;
- reference priority;
- notes and user corrections;
- lineage links to all derived assets.

Never erase or overwrite the original reference.

---

# 2. Observed vs Inferred vs Authored Truth

Every concept-derived decision is classified as one of:

- **Observed** — directly visible or explicitly supplied in source material;
- **Constrained** — not directly visible but strongly constrained by multiple views / motion / proportions;
- **Inferred** — a plausible completion of unseen or ambiguous information;
- **Authored** — a deliberate new gameplay / design choice made to complete the mod;
- **User Approved** — an inferred/authored choice explicitly accepted by the user.

Enderloom must never claim unseen geometry, hidden texture detail, animation behavior, gameplay, lore, stats, or mechanics were recovered exactly if the source did not show them.

The UI should let the user inspect which parts of the final mod are observed vs inferred/authored.

---

# 3. Concept Analysis -> Design Dossier

Before building content, Enderloom generates a structured `ConceptDesignDossier`.

The dossier may contain:

## Visual identity

- subject category;
- silhouette;
- scale estimate;
- proportions;
- symmetry / asymmetry;
- major forms;
- material groups;
- color palette;
- emissive / translucent / glowing features;
- wear / dirt / organic detail;
- decorative motifs;
- key identity traits that must not be lost;
- negative space / silhouette rules;
- target Minecraft art direction.

## Structural decomposition

- body / part hierarchy;
- likely rigid vs deforming regions;
- joints / pivots;
- accessories;
- layered geometry;
- detachable pieces;
- held items;
- locators / attachment points;
- likely hitbox regions;
- seat / mount points if implied;
- possible particle / sound emitters.

## Motion interpretation

- locomotion type;
- weight / cadence;
- idle opportunities;
- attack opportunities;
- interaction motions;
- secondary motion;
- facial / eye / ear / tail / cloth motion;
- likely state transitions;
- root motion implications.

## Gameplay interpretation

- creature / boss / pet / NPC role;
- item / tool / weapon role;
- block / machine / furniture role;
- combat role;
- resource / progression role;
- inventory / equipment role;
- worldgen / biome role;
- likely interactions;
- compatibility categories.

## Ambiguities

- unseen surfaces;
- unclear scale;
- unclear rigging;
- contradictory views;
- uncertain gameplay intent;
- uncertain material identity;
- incomplete animation evidence.

The dossier becomes a project artifact linked to implementation and acceptance, not disposable AI prose.

---

# 4. Minecraftization / Style Adaptation

Enderloom must distinguish **concept fidelity** from **medium adaptation**.

A concept can be adapted to modes such as:

- vanilla-faithful;
- vanilla-plus;
- high-detail modded;
- Bedrock-like marketplace style;
- MCModels-style premium model aesthetic;
- cute / chibi;
- realistic / grounded;
- low-poly;
- voxel / cuboid-heavy;
- mesh-assisted where the selected runtime supports it;
- Create-adjacent engineering aesthetic;
- Farmer's Delight-adjacent decorative food / farming aesthetic;
- user-defined pack style.

The style policy defines measurable constraints:

- texture resolution;
- geometry density;
- cube / mesh preference;
- edge softness;
- palette compression;
- material detail;
- animation exaggeration;
- emissive / transparency use;
- performance budget;
- renderer/library target.

Enderloom should never silently simplify distinctive visual traits merely to make implementation easier.

---

# 5. Reference Reconstruction Pipeline

For image / GIF / video driven work, use a deterministic reconstruction sequence:

1. preserve and hash references;
2. identify views / frames / camera assumptions;
3. solve approximate camera and scale;
4. solve silhouette and depth;
5. create coarse geometry;
6. refine proportions against all views;
7. fit pivots / rig hierarchy;
8. establish UV layout;
9. reconstruct visible texture/material information;
10. infer hidden regions with explicit confidence;
11. fit animation states / curves from motion references;
12. attach gameplay locators / hitboxes / seats / emitters;
13. choose the least-lossy target renderer;
14. run deterministic still / motion comparison;
15. run actual Minecraft native-client comparison;
16. iterate measured residuals.

A later layer must not be distorted to conceal an earlier error. Example: do not warp textures to hide wrong geometry, and do not fake foot placement with animation offsets when the pivot / limb proportions are wrong.

---

# 6. Native Asset Authoring

The Studio must support or orchestrate native creation of:

## Geometry

- Blockbench `.bbmodel` projects;
- Java entity / block / item models;
- Bedrock geometry where targeting Bedrock;
- GeckoLib / AzureLib model structures where selected;
- native baked models;
- multipart models;
- armor / wearable geometry;
- custom collision / voxel shapes;
- locators / nulls;
- hitboxes;
- seats;
- attachment points.

## Textures

- UV planning;
- pixel-art texture authoring;
- palette extraction and normalization;
- visible-surface back-projection;
- hidden-surface inference;
- emissive maps;
- animated textures;
- overlays;
- variants / skins;
- damage / state variants;
- transparency validation;
- atlas / mip / filtering validation.

## Animation

- idle;
- locomotion;
- run / sprint;
- jump / fall / land;
- attack variants;
- cast;
- interact;
- eat / use;
- hurt;
- death;
- sit / sleep / lay / loaf;
- follower / pet states;
- boss phases;
- item / block / machine animation;
- secondary motion;
- keyframe gameplay events;
- animation state machines.

## VFX / SFX hooks

- particles;
- trail / burst / aura logic;
- sound event placement;
- loop / one-shot rules;
- animation-event synchronization;
- environmental effects;
- screen / HUD feedback where appropriate.

The generated source assets remain editable. No generated-code or generated-asset prison.

---

# 7. Concept -> Gameplay Translation

Concept art often implies behavior. Enderloom should extract gameplay hypotheses and convert selected ones into an explicit `GameplayDesignContract`.

Examples:

- winged creature -> flight / glide / dive possibilities;
- oversized backpack -> storage / carrying / upgrade semantics;
- crystal body -> energy / magic / shatter / resonance possibilities;
- mushroom creature -> spores / poison / growth / biome interaction possibilities;
- mechanical creature -> energy / gears / Create interaction possibilities;
- staff / focus -> spell casting / cooldown / mana possibilities;
- wearable charm -> Curios / accessory semantics;
- mounted saddle-like geometry -> rideable / seat semantics.

Hard rule:

**Visual implication is not permission to silently invent gameplay.**

Enderloom can propose mechanics, score them by concept fit, and auto-select only within the user's configured autonomy policy. Important authored gameplay choices remain visible in the dossier and acceptance contract.

---

# 8. Content-Family Expansion

When desired, one concept can seed a coherent content family:

- primary entity / boss / pet;
- variants;
- juvenile / elder forms;
- spawn egg;
- drops;
- crafting materials;
- armor;
- weapons / tools;
- decorative blocks;
- trophies;
- furniture;
- food / consumables;
- spell / ability items;
- structures / lairs;
- biome decorations;
- advancements;
- quests;
- guidebook / wiki content;
- configuration;
- localization;
- compatibility adapters.

The expansion must preserve the original art direction rather than becoming unrelated filler.

---

# 9. Multi-Reference Fusion

A single project may combine:

- concept art for appearance;
- GIF / video for motion;
- another authorized implementation for behavioral reference;
- server assets for model / texture evidence;
- Bedrock addon source for semantics;
- user notes for desired gameplay;
- target ecosystem mods for compatibility;
- existing project art for style consistency.

Each reference receives a declared role, such as:

- shape authority;
- texture authority;
- motion authority;
- gameplay authority;
- style inspiration;
- compatibility target;
- non-authoritative mood reference.

When references conflict, Enderloom surfaces the conflict instead of blending silently.

---

# 10. Ecosystem-Aware Integration

After gameplay semantics are established, Enderloom derives a normal `CompatibilityProfile` and runs the relevant contracts from `ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md`.

Examples:

- wearable concept -> Curios / Trinkets / Accessories-family;
- backpack concept -> Sophisticated Backpacks / Curios / item-handler / recipe-viewer tests;
- machine concept -> Create / item-fluid-energy / Jade / recipe-viewer tests;
- RPG equipment -> Apotheosis-style category / affix / socket compatibility;
- food -> Farmer's Delight ecosystem where applicable;
- spellbook / guide -> Patchouli export / progression integration where useful;
- animated mob -> GeckoLib / AzureLib / native renderer plus rendering-stack QA;
- worldgen concept -> structure / biome / dimension compatibility tests.

Compatibility remains behavioral, version-specific and test-backed.

---

# 11. Concept Fidelity Metrics

Enderloom should compute a transparent `ConceptFidelityReport` using the strongest evidence available.

Possible metrics:

- silhouette overlap / residual;
- key landmark position error;
- proportion error;
- bounding-box / scale error;
- visible color / palette distance;
- texture landmark alignment;
- camera-matched reference difference;
- pose error;
- joint / pivot path error;
- animation timing error;
- foot / ground contact error;
- clipping / self-intersection;
- culling / disappearance;
- material / emissive mismatch;
- visible missing-detail inventory.

Do not collapse all fidelity into one opaque magic score. Show per-dimension results and confidence.

---

# 12. Actual Minecraft Visual QA

External renders and editor previews are not final proof.

For visual content, Enderloom must run the real target Minecraft client when feasible and validate:

- target loader/version actually loads the packaged artifact;
- model appears at correct scale;
- texture / atlas resolves;
- animation state runs;
- state synchronization works;
- geometry remains grounded;
- hitbox / rendered body align;
- culling bounds are correct;
- shadows / lighting are acceptable;
- emissive / transparency paths work;
- items / armor render in all required contexts;
- first / third person where applicable;
- GUI / inventory representation where applicable;
- non-obvious animation frames;
- no transform accumulation;
- no missing texture / model warnings;
- no render-thread violations.

Capture deterministic reference cameras and compare against the concept / approved target.

---

# 13. Gameplay / Runtime QA

A concept-derived mod that includes gameplay requires normal native verification:

- compile / build;
- production remap / linkage where applicable;
- dedicated server;
- native client;
- integrated server;
- multiplayer when relevant;
- persistence / restart;
- config behavior;
- AI / combat scenarios;
- inventory / equipment scenarios;
- worldgen / spawn scenarios;
- compatibility contracts;
- performance profile;
- release packaging.

Visual fidelity cannot compensate for broken gameplay, and gameplay correctness cannot compensate for a visibly failed reconstruction.

---

# 14. Iterative Repair Loop

Concept projects use the same AI / repair loop as the rest of Enderloom:

`reference -> dossier -> candidate -> deterministic compare -> Minecraft capture -> residual findings -> targeted change -> rerun invalidated gates`

A `VisualFailurePacket` / `ConceptFailurePacket` can contain:

- exact reference IDs;
- approved target view / frame;
- candidate asset hashes;
- current camera / pose;
- failed fidelity dimensions;
- residual image / geometry metrics;
- clipping / grounding findings;
- animation-state mismatch;
- screenshots / runtime captures;
- changed files;
- relevant source symbols;
- acceptance items still open.

After two no-progress candidates, force a strategy change such as:

- re-solve camera;
- re-block geometry;
- revisit pivots;
- change renderer;
- split mesh / bones differently;
- obtain another reference view;
- reduce ambiguity through user choice;
- isolate a smaller visual target.

---

# 15. Progress UX

Concept-art jobs use the shared hierarchical progress engine.

Example:

`Creating Mossback Stalker from concept art — 58%`

- Reference intake `3/3` ✅
- Design dossier ✅
- Geometry blockout ✅
- Geometry refinement `8/10 landmarks` ●
- UV / texture reconstruction `4/6 regions` ●
- Rigging `12/12 bones` ✅
- Animation `5/9 clips` ●
- Gameplay implementation `3/5 systems` ○
- Ecosystem compatibility `1/4 contracts` ○
- Native Minecraft QA `0/6 scenarios` ○
- Release package ○

Current action example:

**Refining rear-leg proportions**  
“Camera-matched comparison shows the hock joint is 7.4% too high relative to the approved side view. Enderloom is correcting geometry before refining the walk cycle.”

The user can switch between Simple / Detailed / Expert modes.

---

# 16. Unified Studio UX

This workflow belongs inside the single top-level **Studio**, not another top-level tab.

Recommended panes / contexts:

- Reference Board;
- Concept Dossier;
- 3D Viewport;
- Outliner;
- Inspector;
- UV / Texture Editor;
- Paint / Palette tools;
- Rig / Bone tools;
- Animation Timeline / Curves;
- Gameplay / Procedure Graph;
- Code Editor;
- Compatibility panel;
- Evidence / Fidelity panel;
- Native Minecraft Capture comparison;
- Problems / Validation;
- Task / Build / Test.

Selecting a reference landmark can highlight the corresponding model part / UV region / animation track / acceptance item.

---

# 17. AI Operator Support

The AI operator should be able to receive requests such as:

```text
enderloom ai create-mod --concept ./refs/creature-sheet.png --target forge:1.20.1 --quality max
enderloom ai create-mob --concept ./refs/boss --target neoforge:1.21.1 --compat auto
enderloom ai create-item-set --concept ./refs/tools --target forge:1.20.1
enderloom ai reconstruct --reference ./refs/turnaround --renderer geckolib --test full
enderloom ai refine-concept-build --project ./Mossback --against approved-references --quality max
```

Natural-language examples:

- “Turn this creature concept into a full Forge 1.20.1 mob with animations and loot.”
- “Make this backpack concept into a real wearable storage mod and make it work with Curios and Sophisticated Backpacks.”
- “Use these three views as shape authority and this GIF as motion authority.”
- “Keep the art exactly recognizable, but adapt the geometry to vanilla-plus Minecraft.”
- “Build the boss and keep iterating against native Minecraft screenshots until the silhouette and poses match.”

AI output remains untrusted until normal Enderloom gates pass.

---

# 18. Optional Synthetic Image Tools

Synthetic image-generation/editing is **not required** for this workflow and is not a substitute for native model / texture / animation work.

If Enderloom ever supports such providers:

- they are disabled unless the user explicitly enables them for that job;
- generated images are treated as new authored references, never proof of the original concept;
- they cannot substitute for Minecraft runtime evidence;
- they cannot silently overwrite user source art;
- generated textures / references retain provider / prompt / seed / lineage metadata where available;
- the normal rights / provenance / security policies still apply.

The highest-quality default pipeline remains analysis of supplied references plus editable native project assets.

---

# 19. Typed Architecture Required

Wave A must leave typed extension paths for:

- `ConceptReference`;
- `ReferenceRole`;
- `ReferenceLandmark`;
- `ReferenceObservation`;
- `InferenceRecord`;
- `ConceptDesignDossier`;
- `ArtDirectionProfile`;
- `ConceptAssetPlan`;
- `GeometryCandidate`;
- `TextureRegion`;
- `RigPlan`;
- `AnimationPlan`;
- `GameplayDesignContract`;
- `ConceptCompatibilityIntent`;
- `ConceptFidelityMetric`;
- `ConceptFidelityReport`;
- `VisualResidualFinding`;
- `NativeVisualScenario`;
- `NativeVisualResult`;
- `ConceptFailurePacket`;
- `ConceptAcceptanceLedger`.

These attach to existing Project / Artifact / Evidence / Task / AI / Studio / Compatibility / Test / Release objects. No concept-art shadow database.

---

# 20. Acceptance Matrix

A concept-derived mod can only reach `verified` when all applicable rows pass.

## Source / provenance

- references preserved and hashed;
- rights / use scope recorded;
- observed / inferred / authored distinctions preserved;
- no unknown source inputs hidden.

## Visual

- approved silhouette;
- proportions;
- geometry;
- UV / texture;
- variants;
- animation;
- VFX / SFX hooks;
- scale / grounding;
- culling / clipping;
- native Minecraft capture.

## Gameplay

- requested mechanics;
- AI / combat;
- inventory / equipment;
- drops / recipes;
- progression;
- world interaction;
- persistence;
- multiplayer.

## Ecosystem

- applicable compatibility contracts;
- optional-provider absent path;
- provider-present path;
- recipe viewer / accessory / automation / RPG / rendering contracts as applicable.

## Technical

- build;
- production linkage;
- dedicated server;
- native client;
- integrated server;
- restart;
- performance;
- release packaging;
- install / rollback.

---

# 21. Golden Challenge Fixtures

Enderloom should maintain owned / openly licensed evaluation fixtures for:

1. single-view creature concept with hidden-surface ambiguity;
2. three-view turnaround creature;
3. concept + walk GIF;
4. boss concept with multiple combat phases;
5. wearable accessory concept requiring Curios integration;
6. backpack concept requiring inventory + Sophisticated compatibility;
7. Create-like machine concept requiring animation + processing + Ponder-style guide;
8. armor / weapon sheet;
9. furniture / prop collection;
10. environment / structure concept;
11. UI / HUD concept;
12. intentionally contradictory reference set.

Evaluate:

- visual residuals;
- user-correction count;
- runtime failures;
- compatibility failures;
- false claims of exactness;
- performance;
- number of repair iterations;
- acceptance completeness.

Evidence Brain rules learned from fixtures remain scoped and cannot self-promote merely because a fixture passed.

---

# 22. Definition of Done

The Concept Art -> Native Mod capability is complete only when Enderloom can take representative concept references and autonomously or interactively:

1. preserve and classify source references;
2. build a structured design dossier;
3. separate observed / inferred / authored truth;
4. construct editable geometry / textures / rigs / animation source;
5. implement requested gameplay;
6. select relevant ecosystem compatibility contracts;
7. build a real target-loader mod;
8. run deterministic comparison;
9. launch actual Minecraft and capture native visual evidence;
10. measure remaining fidelity defects;
11. iterate repairs without restarting the job context;
12. prove gameplay / persistence / compatibility / performance;
13. package an installable release with source lineage and rollback;
14. show the user exactly what Enderloom built, what was inferred, what passed, and what remains unknown.

**A pretty preview is not the product. The verified native Minecraft mod is the product.**
