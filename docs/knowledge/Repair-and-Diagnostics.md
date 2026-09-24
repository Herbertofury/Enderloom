# Repair and forensics

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> Fix the causal owner, retain content, and prove the repaired result.

### Root-cause repair workflow

[**FIX-01**](Checklist.md#fix-01) - Attach logs to correct input/run, identify earliest failure, show concise findings, apply scoped fixes and validate; Fix/Fix Issues/View Changes/Undo are real operations.

### Reusable diagnostics adapters

[**FIX-02**](Checklist.md#fix-02) - Version-aware adapter catalog, analyzer selection, shared evidence and auto-provisioning in owned test clones select appropriate tools for crashes, TPS, FPS, memory and loading.

### Crash, linkage, data and configuration repair

[**FIX-03**](Checklist.md#fix-03) - Repair real loader/dependency/Mixin/registration/data/resource/config faults without suppressing diagnostics, wholesale disabling or content deletion.

### Freeze, lock and concurrency forensics

[**FIX-04**](Checklist.md#fix-04) - Correlate threads, dumps, deadlocks/races, locks and runtime phase; repair causal concurrency while preserving semantics, with failing-before/passing-after fixtures.

### Heap and memory-leak diagnosis

[**FIX-05**](Checklist.md#fix-05) - Capture useful allocation/retention/GC evidence, reproduce growth and fix ownership/lifecycle leaks with equivalent-work soak validation.

### Black Box incident timeline

[**FIX-06**](Checklist.md#fix-06) - Owned bounded rolling evidence, meaningful triggers and cross-tool timeline preserve causal context with export/privacy controls; not a hidden perpetual patching watchdog.

### Dependency-safe bisect and reproducer

[**FIX-07**](Checklist.md#fix-07) - Isolate faults using dependency closure, controlled scenarios and delta debugging, retain source content and deliver a working minimized reproduction with provenance.

### Generalized repair knowledge

[**FIX-08**](Checklist.md#fix-08) - Every nontrivial verified fix becomes a scoped reusable transformation/incident recipe with negative regressions, applicability/invalidation and clean replay; no hidden hand-patched outputs.

**[Every linked source clause](Sources-FIX.md)** / **[Source manifest](Source-Map.md)**

## Detailed acceptance from your specifications

Every source task and binding clause has its own tracked entry, rather than disappearing into the heading above.

- [FIX-01 - Root-cause repair workflow](Acceptance-FIX.md#fix-01-details): 45 source details.
- [FIX-02 - Reusable diagnostics adapters](Acceptance-FIX.md#fix-02-details): 25 source details.
- [FIX-03 - Crash, linkage, data and configuration repair](Acceptance-FIX.md#fix-03-details): 90 source details.
- [FIX-04 - Freeze, lock and concurrency forensics](Acceptance-FIX.md#fix-04-details): 32 source details.
- [FIX-05 - Heap and memory-leak diagnosis](Acceptance-FIX.md#fix-05-details): 12 source details.
- [FIX-06 - Black Box incident timeline](Acceptance-FIX.md#fix-06-details): 5 source details.
- [FIX-07 - Dependency-safe bisect and reproducer](Acceptance-FIX.md#fix-07-details): 27 source details.
- [FIX-08 - Generalized repair knowledge](Acceptance-FIX.md#fix-08-details): 4 source details.
