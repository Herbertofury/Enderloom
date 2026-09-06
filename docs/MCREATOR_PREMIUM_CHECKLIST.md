# Premium MCreator support

Accepted user addition: 2026-09-06. Continue the existing implementation and [execution ledger](CONTINUATION_CHECKLIST.md). This is an added premium product requirement, not an instruction from the previously supplied documents.

## Detection and truthful evidence

Initial primary-source check (2026-09-06): the current [NeoForge 1.21.1 metadata template](https://raw.githubusercontent.com/MCreator/MCreator/master/plugins/generator-1.21.1/neoforge-1.21.1/templates/modbase/neoforge.mods.toml.ftl) and [NeoForge 26.1.2 metadata template](https://raw.githubusercontent.com/MCreator/MCreator/master/plugins/generator-26.1.x/neoforge-26.1.2/templates/modbase/neoforge.mods.toml.ftl) include generated user-code-section markers but no unconditional field naming MCreator. Inference: a reliable detector cannot depend on a universal `MCreator` metadata string, and template resemblance must be corroborated. Historical/Fabric output and representative exported artifacts remain to be verified. No detector is marked implemented by this research.

- [ ] Inspect actual mod artifacts for documented MCreator metadata or generation signatures across supported loaders; research representative current and older output before choosing detectors.
- [ ] Distinguish explicit generator metadata, corroborated generation signatures, uncertain matches and unknown origin. Missing metadata does not prove a mod was not built with MCreator.
- [ ] Show the exact evidence behind a match with a clear Why? action, confidence and detector version. Show the MCreator version only when evidence supports it.
- [ ] Keep MCreator origin independent from AI-assisted edits, patched files, authorship and code quality. Never infer AI use or poor performance from generator origin.
- [ ] Allow user corrections/declarations with source attribution; preserve them separately from automatic evidence.
- [ ] Cache results by exact SHA-256 and detector version, rescan changed files incrementally, and preserve prior evidence with mod revisions/originals.
- [ ] Read archives safely with cancellation/progress for large batches and no execution of mod code, silent file edits or arbitrary scan/result caps.

## Mods, Favorites and related QOL

- [ ] Add a premium MCreator/generator badge and optional origin column in the existing Mods views with accurate tooltips and restrained styling.
- [ ] Filter confirmed, likely, user-declared, non-matching and unknown results; keep scan status and uncertain origin visible.
- [ ] Sort by generator evidence, confidence and detected generator version where known, combined with existing name/update/compatibility controls.
- [ ] Search generator metadata and evidence, expose counts and bulk-select matching items, and retain view/filter preferences across restart.
- [ ] Offer real bulk actions supported by the existing domain: tag/collect favorites, scan/rescan, inspect config/related files, open the real source and schedule an explicitly requested performance test.
- [ ] Link actual installed copies across instances and avoid duplicate project records. Uninstalling does not remove a project favorite or its historical evidence.
- [ ] Integrate generator context with Config/Addons when the same tracked item has related records, preserving originals and edited configurations.
- [ ] Show existing update/freeze/compatibility state alongside generator origin without implying incompatibility from MCreator alone.
- [ ] Reuse actual Performance measurements and their exact file/environment fingerprints. Static detection never creates an FPS/TPS verdict or labels a mod as slow.
- [ ] Apply the existing premium entitlement/preview policy consistently and expose actionable unavailable/error states without dead controls.

## Shared operations and acceptance

- [ ] Add generator scan/list/evidence/override operations to the shared domain and capability registry, with discoverable CLI filters/sorting and GUI parity.
- [ ] Verify current/older MCreator fixtures, non-MCreator controls, mixed/shaded libraries, stripped metadata, malformed archives and modified-file invalidation; record false-positive/unknown behavior.
- [ ] Prove restart persistence, cross-view consistency, user overrides, sorting/filtering, bulk operations, cancellation and unchanged source JAR/config bytes through the built native service and actual UI.
- [ ] Record requirement → implementation → verification → observed result and checkpoint source. Do not mark this feature complete from a badge or heuristic prototype alone.
