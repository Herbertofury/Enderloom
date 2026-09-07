# Enderloom — Diagnostics Handoff Addendum

**Status:** Mandatory handoff addendum  
**Updated:** 2026-09-07  

Codex/agents continuing Enderloom must read these three diagnostics documents together:

1. `docs/ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md`
2. `docs/ENDERLOOM_DIAGNOSTICS_ADAPTER_CATALOG.md`
3. `docs/ENDERLOOM_DIAGNOSTICS_ADAPTER_CATALOG_CHANGELOG.md`

They are mandatory supplements to the existing Performance/Testing, AI Operator, Repair and Wave A architecture contracts.

## Current checkpoint

- Diagnostics/progress spec initial commit: `49333b1144ddba7e11e8dec9d793f9eabcc78779`
- Living adapter catalog commit: `8bcaa73cb68a8ea8178da4e82135c3a0d509f79e`
- Diagnostics/progress spec catalog/enricher expansion: `bef22256f6085667940eb832c5214a370971e7bc`

## Required consequences

- Wave A must support diagnostics adapters, raw + normalized profiler evidence, measurement-vs-attribution runs, evidence confidence and one structured progress stream shared by GUI/CLI/MCP/AI.
- Performance/Testing must select compatible analyzers by Minecraft version/loader/symptom instead of assuming one profiler.
- Starting first-class/high-value integrations include spark, Observable, maintained Observable descendants, Crash Assistant, JFR/jcmd, async-profiler, Enderloom Probe/Black Box, TaskManager-style client profilers, Chunk Loading Profiler, MixinTrace, ModernFix diagnostic/watchdog evidence, Neruina recovery/isolation evidence, external heap/JVM viewers, and legacy/server report importers.
- Missing diagnostic mods may be injected only into isolated test clones/sandboxes under user policy; never silently mutate the live pack.
- Performance claims require a minimally instrumented measurement pass; heavier profilers are attribution evidence unless explicitly proven negligible for the metric.
- Every long job—testing, repair, AI creation, conversion, porting, migration, world repair, release—must expose honest hierarchical progress with real gates/work units, current-action explanations, findings, candidate history and evidence links.
- GUI/CLI/JSONL/MCP/AI consume the same progress/evidence events.
- No job reaches 100% before all mandatory acceptance gates pass.
