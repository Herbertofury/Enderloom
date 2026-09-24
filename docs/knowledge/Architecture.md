# Architecture

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> One identity graph, one action registry, one job state, many proven engines.


```mermaid
flowchart TD
    UI["Studio / Catalog / Launcher"] --> Actions["Typed action registry"]
    CLI["CLI / MCP / AI operator"] --> Actions
    Actions --> Jobs["Durable job and transaction core"]
    Jobs --> IDs["Identity and dependency graphs"]
    Jobs --> IR["Source authority and semantic project"]
    IR --> Engines["Version-aware conversion / creation / repair engines"]
    IDs --> Engines
    Engines --> Stage["Owned staging and build matrix"]
    Stage --> Proof["Static, native runtime and parity validation"]
    Proof --> Release["Verified artifacts and safe installation"]
    Proof --> Brain["Evidence Brain and regression fixtures"]
    Brain --> Engines
    Jobs --> Events["Structured progress, findings and recovery"]
    Events --> UI
    Events --> CLI
```

## The boundaries that keep it coherent

| Owner | Owns | Must not become |
| :--- | :--- | :--- |
| Identity graph | Projects, versions, sources, mods, instances and exact artifact identity | Filename-based guesses or duplicate provider records |
| Semantic project | Source lineage, behavior, content and target transformations | A disconnected copy per version or loader |
| Action registry | Shared typed GUI/CLI/MCP/agent operations | Bypass-only agent commands or decorative buttons |
| Job core | Staging, cancellation, retry, fingerprints and recovery | A fresh task after every restart or duplicate worker writes |
| Evidence graph | Inputs, artifacts, scenarios, observations and proof freshness | Model confidence or unchecked upstream assertions |
| Tool adapters | Pair-specific capabilities and tested library/CLI calls | The product's version ceiling or a user-facing tool maze |

## Honest state transitions

```mermaid
stateDiagram-v2
    [*] --> Planned
    Planned --> Preparing
    Preparing --> Running
    Running --> Verifying
    Running --> Repairing: causal failure
    Repairing --> Running: shared fix and regression
    Verifying --> Complete: current artifact and required proof pass
    Verifying --> Repairing: parity or runtime mismatch
    Running --> Cancelled: scoped cancellation
    Preparing --> NeedsAction: real external requirement
    NeedsAction --> Preparing: requirement satisfied
    Cancelled --> Preparing: resume valid stages
    Complete --> Stale: inputs or relevant implementation changed
    Stale --> Preparing: verify again
```

Cancellation, failed downloads and inaccessible hosts never mean success or absence. Partial and staged outputs stay separate from certified artifacts. A completed symbol mapping is not a completed semantic port.
