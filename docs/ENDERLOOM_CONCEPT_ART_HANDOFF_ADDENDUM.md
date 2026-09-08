# Enderloom — Concept Art Workflow Handoff Addendum

**Status:** Mandatory continuation addendum  
**Updated:** 2026-09-07

Future Enderloom implementation work must treat:

- `docs/ENDERLOOM_CONCEPT_ART_TO_NATIVE_MOD_SPEC.md`

as a mandatory child contract of:

- `docs/ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md`;
- `docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md`;
- `docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md`;
- `docs/ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md`.

## Locked product law

**Concept art is a valid first-class Minecraft project source.** Enderloom must be able to take authorized concept/reference material through analysis, native asset authoring, gameplay implementation, ecosystem compatibility, actual Minecraft visual/runtime QA, repair iteration and release packaging.

## Required consequences

- The workflow lives inside the single top-level Studio, not a new top-level Concept Studio.
- Original references remain immutable/hash-addressed and all derived assets retain lineage.
- Observed, constrained, inferred, authored and user-approved details remain distinct.
- Generate a durable `ConceptDesignDossier`, not disposable AI prose.
- Support native editable model/texture/rig/animation source; no generated-asset prison.
- Concept interpretation may propose gameplay, but visual implication never silently becomes canonical gameplay.
- Multi-reference projects can assign separate shape, texture, motion, gameplay and style authority.
- Use the normal semantic `CompatibilityProfile` and ecosystem compatibility contracts.
- Deterministic renders/metrics complement but never replace actual Minecraft native-client proof.
- Visual work must test scale, grounding, culling, texture/atlas integrity, animation-state synchronization, transform accumulation, hitbox alignment and non-obvious frames.
- Gameplay work still requires appropriate server/client/integrated-server/persistence/multiplayer gates.
- The shared progress system must expose concept intake, dossier, geometry, UV/texture, rig, animation, gameplay, compatibility, native QA and release stages.
- AI may perform the workflow headlessly through the same operation/task/evidence layer, but cannot self-declare acceptance.
- Synthetic image generation is not required and must never be silently used as the workflow. If Enderloom supports such providers, they are explicitly user-enabled per job and generated pictures remain authored references, never proof of fidelity.

## Wave A architecture impact

Preserve typed extension paths for at least:

`ConceptReference`, `ReferenceRole`, `ReferenceLandmark`, `ReferenceObservation`, `InferenceRecord`, `ConceptDesignDossier`, `ArtDirectionProfile`, `ConceptAssetPlan`, `GeometryCandidate`, `TextureRegion`, `RigPlan`, `AnimationPlan`, `GameplayDesignContract`, `ConceptCompatibilityIntent`, `ConceptFidelityMetric`, `ConceptFidelityReport`, `VisualResidualFinding`, `NativeVisualScenario`, `NativeVisualResult`, `ConceptFailurePacket`, `ConceptAcceptanceLedger`.

No concept-art shadow database.

## Exact implementation ordering

Do not interrupt the current Wave A Integration Spine to build broad concept-art UI first. Wave A must make the canonical Project / Artifact / Evidence / Task / Operation / Progress structures capable of representing this workflow. Concept Art -> Native Mod becomes a later vertical built on those primitives and the existing Minecraft Dev Kit reconstruction/runtime-acceptance rules.

## Definition of success

A concept-art job is not complete when Enderloom displays a convincing preview. It is complete when the real packaged target mod loads in Minecraft, matches the approved visual intent within explicit measured tolerances, behaves correctly, passes applicable compatibility/runtime/persistence/performance gates, and ships with source/reference lineage and rollback.
