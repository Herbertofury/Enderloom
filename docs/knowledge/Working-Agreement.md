# Working agreement

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> Implement first. Update one progress record. Keep the source details and proof connected.


## Continue, do not restart

Read the current project instructions, active worktree/job and the [current Studio execution brief](../ENDERLOOM_STUDIO_EXECUTION.md). Preserve existing code, task identities, source hashes, accepted targets and verified fixes. This Wiki is a navigation and progress layer, not permission to replace the original detailed contracts. The latest explicit user direction controls conflicts; older independent requirements remain binding. The original Studio task IDs remain searchable aliases in the source map.

Keep documentation changes out of the way of implementation. Use `mutate -> changed-path test -> coherent checkpoint -> next ready task`; broader native/release tests happen at convergence and when invalidated. Two unchanged failed attempts require a causal strategy change. A rights or authentication requirement is not a task completion.

## Record progress

`docs/knowledge/requirements.json` is the **only editable progress owner**. The checklist, domain pages and native Wiki are generated views. Do not edit generated checkboxes separately.

```bash
python scripts/knowledge/knowledge.py record AOA-02 --state in_progress --next "Resolve the earliest failing target transform"
python scripts/knowledge/knowledge.py record AOA-02 --state verified --proof docs/evidence/aoa-port.json
python scripts/knowledge/knowledge.py build
python scripts/knowledge/knowledge.py check
```

Use a real proof file, not a dummy to satisfy validation. The proof JSON must contain `status: "passed"`, `requirement_id`, the tested `artifact_sha256`, `source_commit`, `commands`, and `observations`. Every referenced command must have actually run. For runtime-sensitive outcomes include exact native-run identity, relevant observations, parity and repeatable artifact evidence. The structural validator checks presence/identity, not the truth of a human assertion; reviewers and product acceptance still inspect actual evidence.

Mark `implemented` until required runtime/parity/performance proof exists. If later inputs or code invalidate proof, use `reopened` and give the exact next action. Preserve historical source checkmarks as claims, never automatically promote them to verified. No percentage here claims to measure how much of the real app currently works.

## Source coverage and deduplication

One canonical outcome owns each capability. Source blocks are preserved by exact file, line range, context and SHA-256. Literal repeated blocks can share an identity; short clauses keep heading context. Paraphrases and different qualifiers are not silently discarded as equivalent. Several detailed requirements can roll up to one outcome, whose box may be checked only when **all applicable linked details** and acceptance pass.

Automatic block routing is navigation, not a semantic proof or authority to waive a clause. Inspect linked context during implementation; fix a misplaced owner rather than dropping the requirement. Original specs retain their original checkboxes as historical/source detail, not competing current ledgers. The Source map reports every parsed block and original task alias so consolidation is auditable.

## Publication and maintenance

Commit the ledger, generator or source changes normally. The knowledge workflow validates and regenerates docs, preserves a complete artifact, updates the scoped README section and publishes the native Wiki with authorized credentials. It is event-driven, not scheduled app polling. Generated pages preserve manually maintained unrelated Wiki files. Wiki publication has its own explicit success/failure receipt; a repository documentation commit does not by itself prove native Wiki publication.

## Locked product boundaries

Preserve one Studio, dedicated Hotkeys, Favorites and Performance surfaces, the real browser/catalog/launcher, full CLI parity and both immediate product outcomes. Friend-hosting/P2P/reverse-tunnel services and a Voice/Social center were explicitly excluded. Optional image tools never replace real project previews or native proof. Reqsery's separate permission applies to MC Mod Porter, not unrelated restricted projects.
