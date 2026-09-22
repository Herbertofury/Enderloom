# Enderloom Northpoint — Apex Conversion v5 Checkpoint

**Status:** verified implementation handoff index  
**Date:** 2026-09-22  
**Canonical repository:** Herbertofury/Enderloom  
**Subsystem:** Northpoint universal version/loader matrix + conversion intelligence  
**Primary graduation project:** AoA Savior  
**Conversion proof baseline:** Minecraft 26.3 Port Toolkit v5 — Apex Conversion Lane

## Resume rule

Continue the existing Enderloom/Northpoint work. Do not restart architecture discovery, create a throwaway converter, fork one full project per Minecraft version, weaken runtime proof, or make a conversion appear successful by removing content.

The complete zero-loss v5 handoff is preserved in the Enderloom/Northpoint Google Drive project folder:

- Full v5 handoff: https://drive.google.com/file/d/1Xjqi1NaB0IUoT0rEKp-7qdOcG82fqZ5G/view
- Machine contract: https://drive.google.com/file/d/11UC6MJthtPZ7QVQ3sBkZB-q-JMzy6bnb/view
- Hardened v5 toolkit: https://drive.google.com/file/d/1QA6UcPshjW9PzWB7hU-R60y2oxkWlQum/view
- SHA-256 manifest: https://drive.google.com/file/d/1zyXPOxqu9_Eh2UCgWweGiN0YplDdGJPt/view

The machine-readable stage/gate contract is also committed beside this checkpoint as `ENDERLOOM_CONVERSION_ENGINE_CONTRACT.json`.

## Verified v5 hardening

Minecraft Dev Kit v5 extends the existing mapping/Mixin/semantic/content-parity lane with exact production JVM legality checks that compile/remap/userdev can miss.

The final packaged candidate is now checked for:

- exact owner + member + JVM descriptor;
- constructor ownership — constructors never resolve through inheritance;
- actual bytecode invocation mode;
- static/instance drift;
- class/interface drift;
- constant-pool Methodref vs InterfaceMethodref compatibility;
- LambdaMetafactory SAM linkage;
- MethodHandle / invokedynamic implementation reference kind;
- public/private/protected/package member access;
- Java nest-host private-access semantics where indexed;
- writes to fields that became final;
- inheritance from classes that became final;
- superclass/interface kind drift;
- Java 25 Multi-Release class selection;
- supported nested-JAR selection;
- package metadata entrypoints, Mixins, access wideners, nested JAR declarations and ServiceLoader providers;
- exact packaged AT/AW/ClassTweaker declarations.

Packaged access rules are resolved against the actual declaration owner and their legal effects are modeled before the audit decides a candidate is broken:

- accessibility widening can satisfy access proof;
- `mutable` / `-f` can satisfy final-field write proof;
- `extendable` / final removal can satisfy superclass proof.

A stale/broken access rule in the final artifact is itself a release blocker.

## Regression proof

The v5 regression corpus includes adversarial fixtures for:

- inherited overload/descriptor resolution;
- ambiguous descriptorless Mixins;
- MixinExtras / overwrite surfaces;
- wrong-owner access rules;
- reflection targets;
- content and registration parity;
- Lambda SAM drift;
- static -> instance drift;
- interface -> class drift;
- constructor removed from child while superclass still has the descriptor;
- public -> private access drift;
- valid packaged AT widening;
- broken packaged AT shipped in the final candidate;
- field becoming final;
- mutable ClassTweaker repair;
- superclass becoming final;
- extendable ClassTweaker repair;
- Lambda/MethodHandle static -> instance drift;
- Java 25 Multi-Release selection;
- nested JAR indexing;
- missing package entrypoints/Mixin/AW/nested JAR/service declarations.

The targeted exact-linkage challenge suite passed. The complete `port_26_3_selftest.py` suite also finished with exit code 0 and:

`Minecraft 26.3 Dev Kit port pipeline/mapping/Mixin self-test: PASS`

## Artifact identities

- `Minecraft-26.3-Port-Toolkit-v5-Apex.zip`
  - size: 181168 bytes
  - SHA-256: `c08a9dc6c3c40907371a3e45d6ecc951e06b1329fd9f8580ea585975229e3580`
- `ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md`
  - size: 44703 bytes
  - SHA-256: `8225c6931ffe692135d8c6199c82cd8986c6754301454e6e8863bc6da118ce96`
- `ENDERLOOM_CONVERSION_ENGINE_CONTRACT.json`
  - SHA-256: `1bfb1376b132731c978fca5887e5cd53be6a6417bc613372cba4f276a5adbea8`

## Enderloom invariants

1. **Primary target first.** Finish and verify the requested target before secondary Northpoint fan-out.
2. **Zero silent content loss.** Adapt/backport/replace semantically or mark a cell Blocked; never delete a feature just to compile.
3. **One semantic project.** Common source -> loader overlay -> Minecraft-version overlay -> rare exact-cell overlay -> generated workspace.
4. **One reusable Conversion IR/UMIR.** Inspect source once and reuse provenance, content, behavior, injection, dependency and parity evidence across cells.
5. **Exact historical mapping lineage.** Carry owner/name/descriptor through MCP/SRG/TSRG/Yarn/Intermediary/Mojang lineage into the real target runtime.
6. **Semantic migration intelligence.** Answer what replaced an API/hook, not only that the old symbol disappeared.
7. **Exact packaged linkage.** Dev compile/remap is intermediate evidence only.
8. **Runtime truth.** A cell is Passed only when its strongest required server/client/integrated/restart gate has passed.
9. **Resumable matrix.** Fingerprint cells, persist state, reuse green work, retry only failed/invalidated cells.
10. **No fake UI.** Every visible action must call real backend behavior and report truthful state.
11. **Repair causal owners.** Fix the earliest causal defect rather than downstream cascades.
12. **Promote reusable fixes.** General conversion solutions become adapter/migration catalog entries plus regression fixtures.

## Missing-vanilla and dependency policy

When a target lacks a vanilla feature used by the mod, do not stub the identifier. Certify the mod-owned base first, record the exact dependency closure, then provide an explicit compatibility/backport layer when realistic. Optional future-vanilla parity remains separately testable.

For third-party dependencies, resolve exact cell availability. Prefer the same project's renamed/restructured artifact, then an official loader-native sibling, then a semantically proven equivalent API, then an internal adapter/backport. Otherwise mark the exact cell Blocked with evidence.

## AoA Savior graduation

AoA Savior remains the final conversion graduation workload.

Enderloom must:

1. build the strongest legitimate historical AoA union from the preserved official/source archaeology;
2. finish a semantic master target with complete content/registration/behavior parity;
3. automatically schedule coherent batches from the dependency/parity graph;
4. fan the verified master through all configured valid version/loader cells;
5. truthfully mark impossible cells Blocked instead of stripping content;
6. preserve an unfinished Savior checkpoint;
7. replay from that checkpoint with the improved Enderloom;
8. finish the clean-room replay without a human manually editing source between normal Enderloom steps;
9. turn every reusable failure into an Enderloom/Dev Kit engine fix plus a regression fixture.

The goal is not one manually rescued AoA port. The goal is proof that Enderloom learned a reusable conversion capability.

## Exact next implementation action

Resume in the real Enderloom Create/Convert backend boundary and implement the normal product path:

```text
source authority + hash
-> persistent ConversionSession / UMIR
-> mapping + ABI lineage
-> semantic migration + adapter plan
-> dependency/toolchain lock
-> primary target generation
-> exact Mixin/access/reflection/parity guards
-> build + datagen
-> causal repair loop
-> v5 packaged linkage
-> strongest required runtime lane
-> immutable verified primary artifact + receipt
-> Northpoint optional matrix fan-out
```

Add compact integration fixtures that intentionally fail constructor, access, final-field, final-superclass, static/interface, reflection and MethodHandle linkage and require Enderloom to surface the specific causal blocker.

Then run the normal Enderloom regression/release gates and the real Electron Create/Convert -> target -> matrix -> results flow. Continue AoA Savior through that path. Do not stop at architecture notes.
