# Bedrock / Java fidelity matrix and Actions & Stuff fixture plan

**Planned / not implemented. October 4, 2026.**

[Roadmap](https://github.com/Herbertofury/Enderloom/wiki/Marketplace-Studio-and-Bedrock-Roadmap) / [Input inventory](https://github.com/Herbertofury/Enderloom/blob/docs/marketplace-studio-bedrock-roadmap-2026-10-04/docs/BEDROCK_THIRD_PARTY_INVENTORY_2026-10-04.md)

The target is complete Actions & Stuff parity and reusable conversion in both
directions. User-reported prior successful Bedrock conversions are relevant
evidence; add any available original/output/tool/runtime receipts as differential
fixtures without making them a prerequisite for this plan. No conversion or
runtime test was performed here, so every capability cell below is **unverified**.

## Capability receipt

Resolve each concrete source feature per exact target cell, including game
version, edition, loader/runtime profile and required dependency versions. Record
the source path/ID/hash, parsed semantic feature, chosen target representation,
transform rule/revision, generated output, dependencies and acceptance evidence.
Disposition is `direct`, `runtime-adapter`, `native-reimplementation` or
`unresolved`. Also record `not-present-in-fixture` when applicable; that does not
certify the converter's support. An unsupported-feature report means unresolved
in the selected converter/target revision, not universally impossible.

Each unresolved receipt names its source location, exact diagnostic, retained
bytes, attempted routes, affected outputs and next implementation/test action.
UI states are accurate: partial outputs can be inspected, while the whole-project
Complete gate stays open until every mandatory source feature passes. Source
assets, metadata and unknown fields remain in the canonical project through all
target-specific transformations.

## Bidirectional fidelity matrix

These are implementation routes to prove, not declarations of current support.
The [Bedrock manifest reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/packmanifest?view=minecraft-bedrock-stable)
defines pack identity/modules/dependencies; the target schema must be pinned per
actual game release. The supplied resource pack uses manifest format 3.

| Content | Bedrock -> Java route | Java -> Bedrock route | Decisive proof |
| --- | --- | --- | --- |
| Identity, metadata, dependencies, settings | Translate pack modules/UUIDs to target pack/mod identity and graph; retain original lineage/settings | Translate target pack/mod graph to compatible resource/data/script modules and stable derived UUIDs | Schema load; identity uniqueness; settings persistence; complete dependency closure; no original-ID collision |
| Texture paths, pixels, alpha, mipmaps, animated textures | Map asset names/layout; preserve pixels; convert flipbook timing to target metadata/runtime as needed | Map target layout/animation metadata to Bedrock definitions and image format | Decoded pixel/alpha equality for equivalent assets; frame order/time; native reload; no missing references |
| Geometry, bones, pivots, UVs, item models, attachments and armor | Compile geometry and attachments into target models or a target-native rendering runtime | Recover target-native model semantics into Bedrock geometry/attachables; retain custom fields in project | Bounds/bone/UV checks; equip and first/third-person views; silhouette/occlusion and transforms at controlled angles |
| Animation tracks, interpolation and state controllers | Preserve time/rotation/scale/blending; generate controller runtime where needed | Lower Java animation/state logic to Bedrock controllers or an equivalent script/runtime route | Frame-sampled poses; transition order; blend duration; event traces; loops, interruptions, attack/equip/death cases |
| Molang expressions and game queries | Parse expressions, preserve evaluation units/order and implement query providers against target entity state | Recover equivalent expressions/queries or generate Bedrock-native event/script logic | Truth-table and recorded-input replay; random-seed controls; delta-time tests; all queries bound or explicitly unresolved |
| Render controllers, materials, PBR and subpack options | Implement target material/render selection and equivalent options in renderer/shader/runtime profile | Map supported target materials/render states to Bedrock profiles/settings | Lighting/alpha/emission/depth/normal comparisons; every subpack/profile; graphics mode and low/high settings |
| Particles and visual events | Translate event/emitter semantics; implement target runtime behavior as needed | Generate Bedrock particle components/event bindings from equivalent semantics | Spawn counts/timing, lifetime, motion, attachment, culling and seeded scenes; missing bindings rejected |
| Audio files, events, music, attenuation and pitch | Preserve permitted codecs or convert with measured quality; map triggers and spatial behavior | Translate event mapping/codec/settings to Bedrock definitions | Decode duration/channels; event sequence; pitch/volume/attenuation; audio/video synchronization |
| Skins and dressing-room presentation | Preserve source images/metadata; implement target-native selectable presentation | Map compatible target skin assets to Bedrock skin pack representation | Exact image census; selection and persistence; geometry/attachments where present; no invented account ownership |
| Behavior components, AI goals, events and scripting | Generate Java target-native code/runtime for equivalent logic | Reimplement target Java behavior through Bedrock components/events/script APIs | Client/server gameplay assertions, persistence, multiplayer, interactions and state transitions |
| Recipes, loot, tags, inventory and commands | Translate semantic rules to target schema/runtime | Translate target rules to Bedrock data/events/runtime | Ingredient/result/count/probability and command behavior; native server reload and negative cases |
| Java-only loader hooks, Mixins, reflection, native calls and bytecode | N/A for a resource-only Bedrock source; retain behavior-derived implementations | Analyze source/bytecode and reimplement observable behavior through target-native components/scripts; carry unresolved code | Feature-specific native tests; no claim that Bedrock executes JVM bytecode or arbitrary Java/native APIs |
| Worlds, structures and persisted data when present | Use version-aware state/NBT/world adapters | Use Bedrock format/state adapters | Save-load-world behavior, structures and migration recovery; never count absent world data as a passed feature |
| Unknown, nested or opaque archive members | Retain original bytes; parse supported format through a reviewed authorized adapter | Preserve provenance and opaque members through the project; only export valid permitted target content | Full input count/hash accounting; unread member makes parity incomplete; no silent exclusion |

Where the target does not expose the same primitive, full parity requires native
reimplementation or an explicit runtime adapter. A generic file conversion does
not supply equivalent renderer queries, scripts, loader hooks or persistence.
This is engineering work to resolve and test, not a reason to discard the feature.
The [animation-controller reference](https://learn.microsoft.com/en-us/minecraft/creator/documents/animations/animationcontroller?view=minecraft-bedrock-stable)
describes ordered transitions and blending; [Molang](https://learn.microsoft.com/en-us/minecraft/creator/documents/molang/introduction?view=minecraft-bedrock-stable)
expressions depend on game state. Java rendering uses version-specific
[native rendering APIs](https://docs.fabricmc.net/develop/rendering/basic-concepts).
Those source facts motivate the adapters; no source-only inspection establishes
an impossible conversion. The official [texture-conversion tutorial](https://learn.microsoft.com/en-us/minecraft/creator/documents/convertingtexturepacks?view=minecraft-bedrock-stable)
also distinguishes names, layout, formats and animated-texture metadata.

## Actions & Stuff 1.11.1 fixture identity

Use both local files listed in the [hash inventory](https://github.com/Herbertofury/Enderloom/blob/docs/marketplace-studio-bedrock-roadmap-2026-10-04/docs/BEDROCK_THIRD_PARTY_INVENTORY_2026-10-04.md).
Their filenames label the request `1.11.1`; both manifests identify version
`1.1.54`. The resource pack requires engine `1.26.10`. Do not silently relabel,
substitute a current Marketplace revision, or infer a retail version from the
numeric manifest alone. Reconcile the source receipt/creator release naming and
freeze the exact two input hashes as this requested fixture.

The resource ZIP has 12,137 file members, including 8,466 under subpacks, 2,819
under textures, 823 under sounds and 19 `.brarchive` members. The skin ZIP has 36
file members. Readable manifests declare resource and skin modules; neither
declares a data or script module. The archive containers cover animations,
controllers, attachables, entity models, render controllers, particles, materials,
UI and other resources. Their inner semantic census remains unverified until an
authorized reviewed importer processes them. No archive-processing or decryption
tool was executed for this roadmap.

## Dependency-ordered fixture runs

| Phase | Work and acceptance | Evidence retained |
| --- | --- | --- |
| F01: freeze and inventory | Resolve filename/manifest identity; validate file hashes, safe member paths, full module/subpack/settings census and permitted fixture use. Import in a derived isolated workspace. Every original/inner member has a parsed, retained or unresolved disposition. | Two original SHA-256 receipts; inner path/hash manifest; provenance and license summary; no content keys in public evidence |
| F02: original Bedrock baseline | Use the actual compatible installed Bedrock version, recording its build, platform, graphics mode, world seed, resource stack/order, selected subpack/options, screen/camera settings and hardware. Run every source-derived feature family, first/third person, skins, equip/armor/items, entities, particles, materials, sounds, reload and multiplayer where applicable. | Native runtime logs, private screenshots/videos, animation/event/audio traces and performance samples bound to source hashes |
| F03: generate Java | Choose the exact Java game/loader/rendering profile using the canonical version graph and compatible APIs, not a guessed hardcoded version. Produce all required resource packs and runtime mods as one reviewed output family. Provision all dependencies. | Target-cell manifest, rule/tool locks, complete source-to-target coverage report, output hashes, reproducible build/package commands |
| F04: native parity | Repeat F02's source-derived scenarios on Java, including every source asset/subpack and all controller/state/option paths. Fix discrepancies in shared transform/runtime code and replay from original inputs without manual output surgery. | Paired scenes/screenshots, pose traces, state/event/behavior/audio assertions; each mandatory requirement passing |
| F05: reverse and round-trip | Convert the generated Java family back to Bedrock and test it natively. Independently test Java -> Bedrock -> Java with an authorized Java behavior mod, plus Bedrock -> Java -> Bedrock with an authorized behavior/script pack. | Per-direction dependency/output receipts; identity/semantic comparisons; native runtime evidence and cumulative drift report |
| F06: ordinary product/recovery | Complete packaged Studio select/import/compare/convert/build/test/export journeys and CLI equivalents. Test save/reopen, concurrent input edits, cancellation, interruption, dependency repair, offline replay and rollback. | Exact Enderloom package/converter revision; commands; original-byte preservation and failure-state checks |

For screenshots, capture fixed camera/time/weather/lighting/pose and the same
visible content; compare split/wipe and quantitative image differences with
renderer tolerances fixed before inspecting the candidate. Proposed initial
numeric checks for non-renderer geometry are 1e-4 model-unit pose tolerance, one
frame maximum deterministic event drift at the recorded sample rate, and exact
decoded pixels for assets with no required image transform. Validate these
tolerances against baseline repeatability before adopting them. Material/lighting
differences need feature-specific review, not a global similarity score hiding
missing items. Review all asset bindings; representative camera scenes supplement
the complete census, they do not replace it.

Sample animations at start/end, every keyframe and transition boundary, then
uniformly across complete loops at 60 Hz where the runtime permits, with a
30/60/120 Hz delta-time lane. Include variable inputs, interrupted actions,
first/third-person switches, state resets and deterministic random seeds. Verify
audio triggers and visual synchronization in native runs as well as Studio
previews. Keep proprietary captures private unless their publication is permitted.

For performance, run original/candidate and required vanilla/control profiles on
the same machine/settings/world. Record cold/warm import, indexing, conversion,
load/reload, peak memory, frame-time p50/p95/p99, stutter counts and server tick
cost when behavior is present. Proposed initial gate: no unexplained regression
over 10% beyond measured run variance, using at least five equal-duration runs
per profile and a full source workload. Publish the measured distributions,
hardware and exceptions; do not compare different editions' raw FPS as an
equivalent baseline or hide regressions in a single average.

Round-trip acceptance compares canonical semantics, identity, dependency closure,
feature/event behavior and stable asset hashes, not target ZIP byte equality.
Store source-specific metadata in the project and identify which portions require
Enderloom lineage for reversible recovery. Test a standalone converted artifact
separately from a lineage-assisted round trip; retaining the input beside an
incomplete output does not establish playable target fidelity. Reject growing
semantic drift across repeated cycles.

## Unsupported-feature and completion gates

Inject known failures in narrowly labeled fault fixtures: unavailable query,
unknown field, corrupt model, missing dependency, altered input hash, nested
archive failure, stale worker result, missing runtime proof and wrong output hash.
Each must produce a specific visible diagnostic, preserved source, repair route
and non-Complete state. A no-data/script module finding in Actions & Stuff must
not close behavior/mod-code support; the independent behavior fixtures remain
mandatory.

Actions & Stuff Complete requires all original source-derived mandatory features
passing on the exact Java target, all accepted Bedrock/Java reverse cells passing,
no unresolved dropped feature, the whole ordinary packaged journey, repeatable
performance and current hash-bound evidence. Expansion to more versions/targets
adds cells, without invalidating already verified siblings or claiming universal
perfect lossless conversion.
