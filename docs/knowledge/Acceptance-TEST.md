# Native testing and control plane - detailed source acceptance

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> Exact source requirements, independently checkable through the same ledger. Source checkmarks are historical claims, not current certification.

**[Detail progress commands](Working-Agreement.md#detailed-source-progress)** / **[All-source acceptance index](Detailed-Acceptance.md)**

<a id="test-01-details"></a>
## TEST-01 - Deterministic test sandbox

[Outcome](Checklist.md#test-01) / 384 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 1. Product laws (1)</summary>

<a id="d-de70b72f3f9e823b94ee"></a>
- [ ] **D-de70b72f3f9e823b94ee** - Never install an AI-returned artifact directly into a live instance before sandbox validation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Product laws
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 27-27](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L27-L27)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 2. One repair job, one durable state machine (2)</summary>

<a id="d-9725b8f6f745b4515ba0"></a>
- [ ] **D-9725b8f6f745b4515ba0** - sandbox_preparing
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 57-57](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L57-L57)

<a id="d-9faa2fa7ce666e39e8c4"></a>
- [ ] **D-9faa2fa7ce666e39e8c4** - test_failed
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 59-59](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L59-L59)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 8. Returned artifact quarantine (1)</summary>

<a id="d-8e176cf37c2bac07d0b3"></a>
- [ ] **D-8e176cf37c2bac07d0b3** - Never execute arbitrary returned scripts outside the controlled build sandbox without an explicit supported plan.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Returned artifact quarantine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 305-305](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L305-L305)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 10. Sandbox test engine (18)</summary>

<a id="d-3a5c25157ef902f8fd28"></a>
- [ ] **D-3a5c25157ef902f8fd28** - Never test the candidate in the live profile first.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 337-337](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L337-L337)

<a id="d-3f844625e74a969ad0cd"></a>
- [ ] **D-3f844625e74a969ad0cd** - clone/materialize the minimum compatible instance state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 341-341](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L341-L341)

<a id="d-dfb0bdaf63e6ae653e26"></a>
- [ ] **D-dfb0bdaf63e6ae653e26** - preserve exact enabled dependency closure;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 342-342](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L342-L342)

<a id="d-329b75413bfbade54e5c"></a>
- [ ] **D-329b75413bfbade54e5c** - hard-link/copy immutable assets safely;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 343-343](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L343-L343)

<a id="d-7fb6829334a5ad68842b"></a>
- [ ] **D-7fb6829334a5ad68842b** - isolate writable config/world/log/output state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 344-344](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L344-L344)

<a id="d-416ecd9af18461c4c334"></a>
- [ ] **D-416ecd9af18461c4c334** - inject candidate artifact only in sandbox;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 345-345](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L345-L345)

<a id="d-9b28b693bfaf4d20b4ce"></a>
- [ ] **D-9b28b693bfaf4d20b4ce** - fingerprint all test inputs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 346-346](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L346-L346)

<a id="d-3724ad71df56acdff9fb"></a>
- [ ] **D-3724ad71df56acdff9fb** - static archive/metadata validation;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 350-350](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L350-L350)

<a id="d-ab95f73fa02ada3c0341"></a>
- [ ] **D-ab95f73fa02ada3c0341** - compile/build;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 351-351](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L351-L351)

<a id="d-b7e696eab6d4e6d95008"></a>
- [ ] **D-b7e696eab6d4e6d95008** - packaged production-linkage check where mapped-dev may hide linkage errors;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 352-352](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L352-L352)

<a id="d-7629e98b5904d4a9420b"></a>
- [ ] **D-7629e98b5904d4a9420b** - dedicated-server boot to authoritative readiness when server/common code changed;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 353-353](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L353-L353)

<a id="d-fc8e83f08426c3597cb1"></a>
- [ ] **D-fc8e83f08426c3597cb1** - native client boot when client/render/model/UI/input code changed;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 354-354](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L354-L354)

<a id="d-f63e0bf51c52cced4fb1"></a>
- [ ] **D-f63e0bf51c52cced4fb1** - integrated-server test for synced gameplay;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 355-355](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L355-L355)

<a id="d-40f490427eafd88195f6"></a>
- [ ] **D-40f490427eafd88195f6** - deterministic reproduction scenario;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 356-356](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L356-L356)

<a id="d-6a1d945c5749a6e87a11"></a>
- [ ] **D-6a1d945c5749a6e87a11** - restart/persistence test for save/config/state changes;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 357-357](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L357-L357)

<a id="d-c1025470173152dfb40c"></a>
- [ ] **D-c1025470173152dfb40c** - content inventory parity;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 359-359](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L359-L359)

<a id="d-bbbad5bddc8bcec6b934"></a>
- [ ] **D-bbbad5bddc8bcec6b934** - fresh log scan for task-related warnings/errors;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 361-361](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L361-L361)

<a id="d-d01c6832343ec447e617"></a>
- [ ] **D-d01c6832343ec447e617** - compatibility smoke with required companion mods.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Sandbox test engine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 362-362](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L362-L362)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 14. Mod page integration (1)</summary>

<a id="d-2e77a5bc56e130a60740"></a>
- [ ] **D-2e77a5bc56e130a60740** - Test Patched Version
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Mod page integration
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 470-470](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L470-L470)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 20. CLI/API parity (1)</summary>

<a id="d-c9bb9eb7f6d16e266d36"></a>
- [ ] **D-c9bb9eb7f6d16e266d36** - enderloom repair test
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. CLI/API parity
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 595-595](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L595-L595)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 21. Security and trust boundaries (1)</summary>

<a id="d-154482ed383a53f3388f"></a>
- [ ] **D-154482ed383a53f3388f** - Build sandbox/working directory isolation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. Security and trust boundaries
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 612-612](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L612-L612)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 22. QA fixtures (1)</summary>

<a id="d-978ccb677df3db0ec039"></a>
- [ ] **D-978ccb677df3db0ec039** - Enderloom restarts during sandbox test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. QA fixtures
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 645-645](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L645-L645)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.3 Preservation and safety (1)</summary>

<a id="d-df73c52ffcabd7051e5c"></a>
- [ ] **D-df73c52ffcabd7051e5c** - Isolated testing: repair/performance/conversion experiments do not destructively test the mutable live profile/save.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.3 Preservation and safety
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: SAFE-002 : 91-91](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L91-L91)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.3 Deterministic sandbox/fingerprint (2)</summary>

<a id="d-c4abf6945df52a71ae0a"></a>
- [ ] **D-c4abf6945df52a71ae0a** - tests isolate writable state and never destructively benchmark the live profile.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.3 Deterministic sandbox/fingerprint
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-020 : 358-358](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L358-L358)

<a id="d-294a10db7ad2f5833578"></a>
- [ ] **D-294a10db7ad2f5833578** - immutable assets are reused safely; baseline reuse requires compatible fingerprint; cancellation cleans only Enderloom-owned test state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.3 Deterministic sandbox/fingerprint
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-021 : 359-359](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L359-L359)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5A. Second-sweep integration expansion - revision 2 / 5A.8 Executable additions for Codex / D. World safety, proof and delivery (1)</summary>

<a id="d-c89d07ac3ff33a55596f"></a>
- [ ] **D-c89d07ac3ff33a55596f** - - Use pytest-minecraft only for appropriate artifact/data fixtures with required tests explicitly enabled and skip counts checked. Preserve Enderloom&#x27;s real dedicated-server, ...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** - Use pytest-minecraft only for appropriate artifact/data fixtures with required tests explicitly enabled and skip counts checked. Preserve Enderloom&#x27;s real dedicated-server, packaged-client, integrated-server and Bedrock runtime gates; artifact extraction does not replace any of them.
  - **Binding context:** 5A. Second-sweep integration expansion - revision 2 / 5A.8 Executable additions for Codex / D. World safety, proof and delivery / 5A. Specialized engines and integration tasks / 5A.8 Specialized integration implementation / D. World safety, proof and delivery
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T109 : 706-706](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L706-L706) / [ENDERLOOM_STUDIO_EXECUTION.md :: T109 : 868-868](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L868-L868)

</details>

<details>
<summary>ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md / 1. Diagnostics Adapter Registry (1)</summary>

<a id="d-678cf0e3b49c8ab26e41"></a>
- [ ] **D-678cf0e3b49c8ab26e41** - - detect an analyzer already installed; - detect compatible analyzer versions; - offer or automatically inject test-only analyzer dependencies into an isolated clone/sandbox accord...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - detect an analyzer already installed; - detect compatible analyzer versions; - offer or automatically inject test-only analyzer dependencies into an isolated clone/sandbox according to user policy; - never silently add diagnostics mods to the user’s live pack; - use external/JVM profilers without modifying the modpack when possible; - run the analyzer through commands/API/UI automation only when needed; - import existing reports/profile URLs/files supplied by the user; - preserve the original raw report plus normalized evidence; - remove temporary testing-only tooling from disposable clones automatically.
  - **Binding context:** 1. Diagnostics Adapter Registry
  - **Original specification:** [ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md : 47-55](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md#L47-L55)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.5 Sandbox policy (1)</summary>

<a id="d-c5714748c1dcf1163ba2"></a>
- [ ] **D-c5714748c1dcf1163ba2** - Security-risk artifacts run only in Enderloom-owned test sandboxes until trusted.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.5 Sandbox policy
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 100-100](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L100-L100)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 4. Enderloom Developer IDE — actual coding workbench / 4.3 Build/task/terminal (1)</summary>

<a id="d-75b6957f10b953ec8c31"></a>
- [ ] **D-75b6957f10b953ec8c31** - Test filtering.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Enderloom Developer IDE — actual coding workbench / 4.3 Build/task/terminal
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 215-215](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L215-L215)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 12. Protocol / Network / Crossplay Lab / 12.4 Network chaos test (2)</summary>

<a id="d-d069dae7cbdbc5ea585d"></a>
- [ ] **D-d069dae7cbdbc5ea585d** - Add latency/jitter/loss in a controlled test environment.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Protocol / Network / Crossplay Lab / 12.4 Network chaos test
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 654-654](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L654-L654)

<a id="d-633ef1ef51ecd6715ae8"></a>
- [ ] **D-633ef1ef51ecd6715ae8** - Chunk-travel bandwidth scenario.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Protocol / Network / Crossplay Lab / 12.4 Network chaos test
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 657-657](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L657-L657)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 13. Collaboration / Shared Instances / Team Pack Authoring / 13.2 Team modpack projects (1)</summary>

<a id="d-f106bff905cee42a05c3"></a>
- [ ] **D-f106bff905cee42a05c3** - performance/compatibility test status attached to proposal.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Collaboration / Shared Instances / Team Pack Authoring / 13.2 Team modpack projects
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 688-688](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L688-L688)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 16. Hot Reload / Fast Dev Loop (1)</summary>

<a id="d-17d17e6381b0e45c536b"></a>
- [ ] **D-17d17e6381b0e45c536b** - retain current player/world test position across controlled relaunch when safe through test fixtures rather than mutating user save.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Hot Reload / Fast Dev Loop
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 801-801](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L801-L801)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 17. Multiplayer / Chaos / Soak Test Matrix (11)</summary>

<a id="d-5cbc7e4eeff06d824f16"></a>
- [ ] **D-5cbc7e4eeff06d824f16** - one real client;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 809-809](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L809-L809)

<a id="d-6b0859bc29d3e8483ff9"></a>
- [ ] **D-6b0859bc29d3e8483ff9** - multiple real clients where hardware permits;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 810-810](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L810-L810)

<a id="d-22d42ee8a64742037cf1"></a>
- [ ] **D-22d42ee8a64742037cf1** - login/logout loop;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 812-812](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L812-L812)

<a id="d-908a002a7e83981859e6"></a>
- [ ] **D-908a002a7e83981859e6** - reconnect after timeout;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 813-813](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L813-L813)

<a id="d-4a445b952dd925e13399"></a>
- [ ] **D-4a445b952dd925e13399** - teleport/extreme chunk travel;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 815-815](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L815-L815)

<a id="d-4f2f0d694d4eecb8aa00"></a>
- [ ] **D-4f2f0d694d4eecb8aa00** - death/respawn;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 816-816](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L816-L816)

<a id="d-8486ab689b862ca8f60b"></a>
- [ ] **D-8486ab689b862ca8f60b** - mount/dismount;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 817-817](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L817-L817)

<a id="d-785ab49e1344001d82ae"></a>
- [ ] **D-785ab49e1344001d82ae** - inventory/menu spam;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 818-818](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L818-L818)

<a id="d-9732d16c9f806167a07f"></a>
- [ ] **D-9732d16c9f806167a07f** - block update/redstone stress;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 820-820](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L820-L820)

<a id="d-5b99f377b1dc41622818"></a>
- [ ] **D-5b99f377b1dc41622818** - save/restart/rejoin;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 821-821](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L821-L821)

<a id="d-e1af9decd6ce5a1dda7c"></a>
- [ ] **D-e1af9decd6ce5a1dda7c** - long soak with memory/GC/thread monitoring;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Multiplayer / Chaos / Soak Test Matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 823-823](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L823-L823)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 22. Hardware / JVM / Render Advisor (1)</summary>

<a id="d-f4ac4d3edc7dc10f9711"></a>
- [ ] **D-f4ac4d3edc7dc10f9711** - portable hardware profile to compare test results while warning when hardware differs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Hardware / JVM / Render Advisor
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 917-917](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L917-L917)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 29. Ecosystem Challenge Matrix — expanded benchmark set (13)</summary>

<a id="d-ffd760a210f42ac5e7c7"></a>
- [ ] **D-ffd760a210f42ac5e7c7** - The existing external benchmark list must add these capability families to the recurring challenge pass:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1045-1045](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1045-L1045)

<a id="d-5f77ae4de0e16ce9ad2b"></a>
- [ ] **D-5f77ae4de0e16ce9ad2b** - Snowstorm particle editor.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1050-1050](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1050-L1050)

<a id="d-b48079b0741f01e8c053"></a>
- [ ] **D-b48079b0741f01e8c053** - Axiom.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1053-1053](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1053-L1053)

<a id="d-b03703ff99937b2fb910"></a>
- [ ] **D-b03703ff99937b2fb910** - WorldEdit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1054-1054](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1054-L1054)

<a id="d-a59d338ecd43abc8a07b"></a>
- [ ] **D-a59d338ecd43abc8a07b** - Litematica.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1055-1055](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1055-L1055)

<a id="d-d134c884a252bef021ac"></a>
- [ ] **D-d134c884a252bef021ac** - Misode generators.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1056-1056](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1056-L1056)

<a id="d-26837f64004a79dd763a"></a>
- [ ] **D-26837f64004a79dd763a** - Fabric Loom.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1058-1058](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1058-L1058)

<a id="d-946b0c0f1ebf19f58aba"></a>
- [ ] **D-946b0c0f1ebf19f58aba** - NeoForge ModDevGradle.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1059-1059](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1059-L1059)

<a id="d-25bfc8595435a31b6b63"></a>
- [ ] **D-25bfc8595435a31b6b63** - Sinytra Connector compatibility/test concepts.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1060-1060](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1060-L1060)

<a id="d-ce4dd25ebf3ab4f0dfd7"></a>
- [ ] **D-ce4dd25ebf3ab4f0dfd7** - Paper/Folia.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1061-1061](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1061-L1061)

<a id="d-de4b89e7c913cf87be2e"></a>
- [ ] **D-de4b89e7c913cf87be2e** - Velocity.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1062-1062](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1062-L1062)

<a id="d-6da00ff6daada4c3d1a3"></a>
- [ ] **D-6da00ff6daada4c3d1a3** - Geyser/Floodgate.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1063-1063](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1063-L1063)

<a id="d-387396b27c86a994080b"></a>
- [ ] **D-387396b27c86a994080b** - ViaVersion family.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1064-1064](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1064-L1064)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 31. Cross-integration requirements for these newly added domains (1)</summary>

<a id="d-6b6eae78a671886896f7"></a>
- [ ] **D-6b6eae78a671886896f7** - New mod version capability diff can trigger canary testing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 31. Cross-integration requirements for these newly added domains
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1104-1104](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1104-L1104)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 32. New golden fixtures required (3)</summary>

<a id="d-06a88fe1990a407d997f"></a>
- [ ] **D-06a88fe1990a407d997f** - malicious-looking but benign capability examples to test false positives.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 32. New golden fixtures required
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1129-1129](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1129-L1129)

<a id="d-7ab02114c6ca4a609321"></a>
- [ ] **D-7ab02114c6ca4a609321** - Geyser/Floodgate crossplay test server.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 32. New golden fixtures required
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1144-1144](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1144-L1144)

<a id="d-c1ab16a942f477f29f1f"></a>
- [ ] **D-c1ab16a942f477f29f1f** - ViaVersion protocol-version test matrix.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 32. New golden fixtures required
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1145-1145](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1145-L1145)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 2. Product principles — non-negotiable / 2.6 User-controlled automation (1)</summary>

<a id="d-802fe1311954768733e0"></a>
- [ ] **D-802fe1311954768733e0** - Ordinary mod update/patch/test workflows are user-triggered by default.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Product principles — non-negotiable / 2.6 User-controlled automation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 98-98](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L98-L98)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 3. Top-level Enderloom workspaces (1)</summary>

<a id="d-f970fc0ed42b9411111c"></a>
- [ ] **D-f970fc0ed42b9411111c** - Testing — Premium Performance Lab.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Top-level Enderloom workspaces
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 117-117](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L117-L117)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 10. Snapshots, backups, repair, recovery (1)</summary>

<a id="d-31e6e09df19bca156e20"></a>
- [ ] **D-31e6e09df19bca156e20** - Test sandboxes use the same preservation mindset but remain isolated from normal backup history.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Snapshots, backups, repair, recovery
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 460-460](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L460-L460)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 11. Logs, diagnostics, storage, system visibility / Diagnostics (1)</summary>

<a id="d-28cf0a25e064b533d255"></a>
- [ ] **D-28cf0a25e064b533d255** - Network test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Logs, diagnostics, storage, system visibility / Diagnostics
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 482-482](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L482-L482)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 12. Split research + browser integration (1)</summary>

<a id="d-ae0daef91b3332cf7b74"></a>
- [ ] **D-ae0daef91b3332cf7b74** - Testing + Mod Manager pairing for live culprit drill-down.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 507-507](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L507-L507)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 13. Premium Testing workspace — Performance Lab / 13.1 Core flows (8)</summary>

<a id="d-4123b5d1a9bf7f1454b9"></a>
- [ ] **D-4123b5d1a9bf7f1454b9** - Test One Mod — direct paired A/B impact test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 525-525](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L525-L525)

<a id="d-dcad21316d7551933f58"></a>
- [ ] **D-dcad21316d7551933f58** - Test All Mods — adaptive whole-pack isolation then direct confirmation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 526-526](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L526-L526)

<a id="d-b6304d02276a3ef1b99e"></a>
- [ ] **D-b6304d02276a3ef1b99e** - Startup Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 527-527](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L527-L527)

<a id="d-a77e1a98cd645b529a71"></a>
- [ ] **D-a77e1a98cd645b529a71** - Client FPS Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 528-528](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L528-L528)

<a id="d-1e3dcea796cc2d2f13e7"></a>
- [ ] **D-1e3dcea796cc2d2f13e7** - Server TPS Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 529-529](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L529-L529)

<a id="d-c8f46e3edbb10079fc4a"></a>
- [ ] **D-c8f46e3edbb10079fc4a** - Lag Spike Hunt.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 530-530](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L530-L530)

<a id="d-cbe98dc2e2e2a2492d2f"></a>
- [ ] **D-cbe98dc2e2e2a2492d2f** - Memory Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 531-531](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L531-L531)

<a id="d-0eec198069a9726bf0fa"></a>
- [ ] **D-0eec198069a9726bf0fa** - Regression Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 533-533](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L533-L533)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 13. Premium Testing workspace — Performance Lab / 13.2 Verdict language (2)</summary>

<a id="d-751d7e2ad54e649987bd"></a>
- [ ] **D-751d7e2ad54e649987bd** - Static analysis alone can only produce risk/suspicion findings.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.2 Verdict language
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 549-549](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L549-L549)

<a id="d-20108a8fb8ca6265e4f9"></a>
- [ ] **D-20108a8fb8ca6265e4f9** - If the effect appears only in combinations, label it Interaction.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.2 Verdict language
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 551-551](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L551-L551)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard (5)</summary>

<a id="d-3b7108a441767141d2f7"></a>
- [ ] **D-3b7108a441767141d2f7** - highest static-risk untested mods
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 610-610](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L610-L610)

<a id="d-03c28235e02b0b53df34"></a>
- [ ] **D-03c28235e02b0b53df34** - recently regressed mods
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 612-612](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L612-L612)

<a id="d-145f5df208419779076b"></a>
- [ ] **D-145f5df208419779076b** - untested changed mods
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 613-613](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L613-L613)

<a id="d-1275f536e0afefb9d4a2"></a>
- [ ] **D-1275f536e0afefb9d4a2** - test queue/history
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 614-614](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L614-L614)

<a id="d-7bb9a8b83e43f5cd5176"></a>
- [ ] **D-7bb9a8b83e43f5cd5176** - Before vs After scorecard
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 615-615](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L615-L615)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 15. Dependency-aware A/B testing / 15.2 Test All Mods (1)</summary>

<a id="d-ef4d005e113d497b2928"></a>
- [ ] **D-ef4d005e113d497b2928** - --exhaustive means exhaustive; never silently downgrade it to sampling.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 15. Dependency-aware A/B testing / 15.2 Test All Mods
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 707-707](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L707-L707)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 16. Test sandbox + deterministic fingerprinting (7)</summary>

<a id="d-4ce25591cffdd9c3a188"></a>
- [ ] **D-4ce25591cffdd9c3a188** - Automated tests never run against the user&#x27;s mutable live profile directly.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 16. Test sandbox + deterministic fingerprinting
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 713-713](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L713-L713)

<a id="d-5abca1dbbf709ecc73b3"></a>
- [ ] **D-5abca1dbbf709ecc73b3** - Baseline reuse only when fingerprint/scenario compatibility is proven.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Test sandbox + deterministic fingerprinting
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 736-736](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L736-L736)

<a id="d-1be8602aeff2b7073909"></a>
- [ ] **D-1be8602aeff2b7073909** - Hard-link/equivalent immutable mod JARs when safe/supported.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Test sandbox + deterministic fingerprinting
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 738-738](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L738-L738)

<a id="d-46c042c28e94d5ad834e"></a>
- [ ] **D-46c042c28e94d5ad834e** - Writable configs/worlds/logs/profiler outputs are isolated.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Test sandbox + deterministic fingerprinting
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 739-739](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L739-L739)

<a id="d-30a02c5e8385cd12dace"></a>
- [ ] **D-30a02c5e8385cd12dace** - Cancellation/failed runs clean owned temporary state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Test sandbox + deterministic fingerprinting
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 740-740](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L740-L740)

<a id="d-91681126dde5658ce1a3"></a>
- [ ] **D-91681126dde5658ce1a3** - Preserve completed evidence during recovery.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Test sandbox + deterministic fingerprinting
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 741-741](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L741-L741)

<a id="d-761173b55d18b64f7537"></a>
- [ ] **D-761173b55d18b64f7537** - Never blame a library merely because dependents fail when the library is removed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Test sandbox + deterministic fingerprinting
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 742-742](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L742-L742)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 17. Deterministic benchmark scenarios (7)</summary>

<a id="d-6f80b832adb2b9c5bbf2"></a>
- [ ] **D-6f80b832adb2b9c5bbf2** - Startup
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 750-750](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L750-L750)

<a id="d-2221343e830e3cb2e703"></a>
- [ ] **D-2221343e830e3cb2e703** - Client idle
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 751-751](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L751-L751)

<a id="d-9dcc45e0b89021f31c3e"></a>
- [ ] **D-9dcc45e0b89021f31c3e** - Client traversal
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 752-752](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L752-L752)

<a id="d-744e440e6a41f67d6608"></a>
- [ ] **D-744e440e6a41f67d6608** - Separate worldgen traversal
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 753-753](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L753-L753)

<a id="d-132b09478136ca283c03"></a>
- [ ] **D-132b09478136ca283c03** - Server idle
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 754-754](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L754-L754)

<a id="d-b003fcc057941d3c5a9a"></a>
- [ ] **D-b003fcc057941d3c5a9a** - Server stress
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 755-755](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L755-L755)

<a id="d-94c4ff0e2407267199ad"></a>
- [ ] **D-94c4ff0e2407267199ad** - Soak
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 756-756](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L756-L756)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 19. Fast Launch Engine (3)</summary>

<a id="d-14d26ceb629fc36b30f4"></a>
- [ ] **D-14d26ceb629fc36b30f4** - Keep a prepared benchmark sandbox.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. Fast Launch Engine
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 833-833](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L833-L833)

<a id="d-0ac0bc3452ed9ec7cd96"></a>
- [ ] **D-0ac0bc3452ed9ec7cd96** - Use dedicated-server nogui when the test is genuinely server-only.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. Fast Launch Engine
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 839-839](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L839-L839)

<a id="d-aaae554fe66a00d00b71"></a>
- [ ] **D-aaae554fe66a00d00b71** - Never claim a speedup by skipping required initialization that changes the meaning of the test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. Fast Launch Engine
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 841-841](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L841-L841)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 20. Enderloom Probe — Minecraft test control plane (14)</summary>

<a id="d-631b2dca5e0038161b33"></a>
- [ ] **D-631b2dca5e0038161b33** - Required capabilities as technically valid:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 862-862](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L862-L862)

<a id="d-1fd038f8b6a71ff332e4"></a>
- [ ] **D-1fd038f8b6a71ff332e4** - title-ready marker
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 864-864](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L864-L864)

<a id="d-d11150b709dbd873affa"></a>
- [ ] **D-d11150b709dbd873affa** - player-ready marker
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 866-866](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L866-L866)

<a id="d-190c738c3582c0ac258f"></a>
- [ ] **D-190c738c3582c0ac258f** - chunk/benchmark-region-ready marker
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 867-867](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L867-L867)

<a id="d-4894ed26a8f3e21943f4"></a>
- [ ] **D-4894ed26a8f3e21943f4** - GUI state dump
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 869-869](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L869-L869)

<a id="d-05e2a737badd7da1bc15"></a>
- [ ] **D-05e2a737badd7da1bc15** - GUI click/assert
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 870-870](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L870-L870)

<a id="d-d48857ca1be6f63587b3"></a>
- [ ] **D-d48857ca1be6f63587b3** - key/mouse/input control
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 871-871](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L871-L871)

<a id="d-5fe763b5ffc711295ffe"></a>
- [ ] **D-5fe763b5ffc711295ffe** - look/camera control
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 872-872](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L872-L872)

<a id="d-6a0931e59651429d8bc2"></a>
- [ ] **D-6a0931e59651429d8bc2** - scripted movement/route
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 873-873](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L873-L873)

<a id="d-8d518d1248dfec048354"></a>
- [ ] **D-8d518d1248dfec048354** - interaction steps
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 874-874](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L874-L874)

<a id="d-99400086ac5aca20c65e"></a>
- [ ] **D-99400086ac5aca20c65e** - telemetry stream
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 876-876](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L876-L876)

<a id="d-3a1319d962868940584e"></a>
- [ ] **D-3a1319d962868940584e** - scenario-complete marker
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 878-878](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L878-L878)

<a id="d-767686609335e3fab960"></a>
- [ ] **D-767686609335e3fab960** - clean exit
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 879-879](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L879-L879)

<a id="d-a681dedd6393ab02e58b"></a>
- [ ] **D-a681dedd6393ab02e58b** - scoped to Enderloom-owned test runs;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 883-883](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L883-L883)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 22. Scenario DSL — one engine for GUI, CLI, CI, Codex (1)</summary>

<a id="d-399a4e24ca0fc4c2396b"></a>
- [ ] **D-399a4e24ca0fc4c2396b** - deterministic skip reason when preconditions are not met;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 976-976](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L976-L976)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 26. Noise/confidence engine (1)</summary>

<a id="d-e1ebc1fc8d8bced3ce6b"></a>
- [ ] **D-e1ebc1fc8d8bced3ce6b** - Performance testing must handle real-world noise.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 26. Noise/confidence engine
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1161-1161](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1161-L1161)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 28. Performance staleness / regression tracking (1)</summary>

<a id="d-1f17a6fb1d133f23264a"></a>
- [ ] **D-1f17a6fb1d133f23264a** - Re-test changed mods user-triggered queue.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Performance staleness / regression tracking
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1247-1247](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1247-L1247)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 35. Release/QA contract / Add for CLI/Testing (4)</summary>

<a id="d-f342b184632bc6c2b707"></a>
- [ ] **D-f342b184632bc6c2b707** - deterministic scenario run.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1444-1444](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1444-L1444)

<a id="d-a262a7354edef8e5a552"></a>
- [ ] **D-a262a7354edef8e5a552** - cancellation cleans only owned test processes/state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1451-1451](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1451-L1451)

<a id="d-c62f9a8cb6a242620e52"></a>
- [ ] **D-c62f9a8cb6a242620e52** - live external instance unchanged before/after Performance Lab test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1453-1453](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1453-L1453)

<a id="d-7cc2530489d51f26a853"></a>
- [ ] **D-7cc2530489d51f26a853** - restart/persistence verification for test history.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1454-1454](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1454-L1454)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-1 — foundation (4)</summary>

<a id="d-1b2e18ac8eb6760af8fe"></a>
- [ ] **D-1b2e18ac8eb6760af8fe** - normalized test-session schema
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-1 — foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1516-1516](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1516-L1516)

<a id="d-f8e324b31f5a51f8ee01"></a>
- [ ] **D-f8e324b31f5a51f8ee01** - fingerprints
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-1 — foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1518-1518](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1518-L1518)

<a id="d-1ed065f2f811c375c34b"></a>
- [ ] **D-1ed065f2f811c375c34b** - safe test sandbox
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-1 — foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1519-1519](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1519-L1519)

<a id="d-bdd613bca4671e62fe79"></a>
- [ ] **D-bdd613bca4671e62fe79** - Quick Scan static analyzer
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-1 — foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1520-1520](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1520-L1520)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-3 — Enderloom Probe (3)</summary>

<a id="d-33d1b4caf98f8ee292e4"></a>
- [ ] **D-33d1b4caf98f8ee292e4** - lifecycle markers
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-3 — Enderloom Probe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1535-1535](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1535-L1535)

<a id="d-ef2e15dce7af717a904e"></a>
- [ ] **D-ef2e15dce7af717a904e** - deterministic benchmark world/route
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-3 — Enderloom Probe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1536-1536](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1536-L1536)

<a id="d-b7e4c02e61209450a409"></a>
- [ ] **D-b7e4c02e61209450a409** - automatic warmup/capture/exit
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-3 — Enderloom Probe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1541-1541](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1541-L1541)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-4 — profiler adapters (1)</summary>

<a id="d-8c2de2e7ab4a72aaa877"></a>
- [ ] **D-8c2de2e7ab4a72aaa877** - Observable optional lane
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-4 — profiler adapters
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1546-1546](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1546-L1546)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence (3)</summary>

<a id="d-360dc39aacf982c4eafc"></a>
- [ ] **D-360dc39aacf982c4eafc** - adaptive cohort/binary isolation
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1551-1551](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1551-L1551)

<a id="d-06b6e70c1694e43faf7e"></a>
- [ ] **D-06b6e70c1694e43faf7e** - direct culprit confirmation
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1552-1552](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1552-L1552)

<a id="d-78d84572798fa9192b49"></a>
- [ ] **D-78d84572798fa9192b49** - regression dashboard
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1554-1554](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1554-L1554)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-6 — AI handoff + polish (1)</summary>

<a id="d-9738aa15d39e8490c44f"></a>
- [ ] **D-9738aa15d39e8490c44f** - saved comparisons
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-6 — AI handoff + polish
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1562-1562](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1562-L1562)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 39. Definition of done — whole Enderloom vision (2)</summary>

<a id="d-fa2a9e3d1418ed84b6c5"></a>
- [ ] **D-fa2a9e3d1418ed84b6c5** - Minecraft client/server test runtimes can be deterministically controlled for supported scenarios.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1606-1606](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1606-L1606)

<a id="d-ad0f1f4e4b9b3c9963ca"></a>
- [ ] **D-ad0f1f4e4b9b3c9963ca** - No live user profile/save/config is damaged by testing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1614-1614](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1614-L1614)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES (1)</summary>

<a id="d-8bc61997b591bcfca4be"></a>
- [ ] **D-8bc61997b591bcfca4be** - Risky updates/removals/migrations can run in an automatic disposable Safe Test copy and only promote a proven delta back to the real instance/world.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2279-2279](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2279-L2279) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2279-2279](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2279-L2279)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.2 One test model, many runners (1)</summary>

<a id="d-31d467e661d7635b2ce4"></a>
- [ ] **D-31d467e661d7635b2ce4** - Do not make every target author its own ad-hoc test script.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.2 One test model, many runners
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 3968-3968](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L3968-L3968) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 3968-3968](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L3968-L3968)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.3 Test lanes ordered by cost / Lane 4 — headless Java client/integrated runtime (1)</summary>

<a id="d-0908afcebe32e7945b61"></a>
- [ ] **D-0908afcebe32e7945b61** - Use HeadlessMC/mc-runtime-test or equivalent to run the actual Java client/integrated server when client classes/state must load but pixel-perfect rendering is not the assertion.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.3 Test lanes ordered by cost / Lane 4 — headless Java client/integrated runtime
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4083-4083](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4083-L4083) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4083-4083](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4083-L4083)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / Loader-native GameTest path (1)</summary>

<a id="d-3911a06a44e96a4ca22c"></a>
- [ ] **D-3911a06a44e96a4ca22c** - - generate/register Enderloom test namespaces automatically; - include the exact production artifact under test; - generate/copy required structure templates; - fail if the expecte...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - generate/register Enderloom test namespaces automatically; - include the exact production artifact under test; - generate/copy required structure templates; - fail if the expected test count is not discovered; - run only changed/affected suites during iteration; - run the broad suite at convergence; - emit deterministic structured results.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / Loader-native GameTest path
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4119-4125](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4119-L4125) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4119-4125](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4119-L4125)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / HeadlessMC path (1)</summary>

<a id="d-d5199ed71e46e591c76e"></a>
- [ ] **D-d5199ed71e46e591c76e** - Do not blindly enable dummy assets when the test depends on resource/model/sound loading.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / HeadlessMC path
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4147-4147](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4147-L4147) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4147-4147](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4147-L4147)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Immutable templates + cheap disposable workspaces (2)</summary>

<a id="d-129079c1cc11218f21ba"></a>
- [ ] **D-129079c1cc11218f21ba** - Create each test workspace using the fastest safe copy/reflink/hardlink/content-addressed strategy available on the platform while ensuring mutable files do not cross-contaminate r...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Create each test workspace using the fastest safe copy/reflink/hardlink/content-addressed strategy available on the platform while ensuring mutable files do not cross-contaminate runs.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Immutable templates + cheap disposable workspaces
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4437-4437](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4437-L4437) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4437-4437](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4437-L4437)

<a id="d-c407426d57a1dfbfc6cf"></a>
- [ ] **D-c407426d57a1dfbfc6cf** - Never reuse a dirty world because it saves a few seconds.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Immutable templates + cheap disposable workspaces
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4439-4439](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4439-L4439) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4439-4439](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4439-L4439)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.17 Test-run safety (1)</summary>

<a id="d-33b7b109c1aa29a2ee8b"></a>
- [ ] **D-33b7b109c1aa29a2ee8b** - - use disposable QA worlds by default; - never point conversion stress tests at a user&#x27;s only copy of a world; - snapshot/copy a real-world fixture before testing it; - never ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - use disposable QA worlds by default; - never point conversion stress tests at a user&#x27;s only copy of a world; - snapshot/copy a real-world fixture before testing it; - never delete user packs/worlds because a cleanup step failed; - kill only processes owned by the exact run identity; - use dynamic ports and run-scoped directories; - do not log auth tokens/secrets; - do not persist Microsoft/Xbox/OpenAI credentials into QA packs or artifacts; - isolate untrusted add-on/mod parsing from arbitrary execution; - only execute the candidate in the intended Minecraft sandbox/runtime lane; - preserve crash/log evidence before cleanup.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.17 Test-run safety
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4675-4685](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4675-L4685) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4675-4685](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4675-L4685)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard (7)</summary>

<a id="d-188cb4f5deb4bca56016"></a>
- [ ] **D-188cb4f5deb4bca56016** - overall current test status;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 122-122](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L122-L122)

<a id="d-a5c1a6b6d53dd55281a4"></a>
- [ ] **D-a5c1a6b6d53dd55281a4** - last test date;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 124-124](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L124-L124)

<a id="d-a640ef0b103d13b119b9"></a>
- [ ] **D-a640ef0b103d13b119b9** - highest static-risk untested mods;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 130-130](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L130-L130)

<a id="d-b98d6085f572f2d38cd0"></a>
- [ ] **D-b98d6085f572f2d38cd0** - interaction/conflict suspects;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 131-131](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L131-L131)

<a id="d-4756b70572c34b69424c"></a>
- [ ] **D-4756b70572c34b69424c** - recently regressed mods;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 132-132](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L132-L132)

<a id="d-66276a0a729c3ae58898"></a>
- [ ] **D-66276a0a729c3ae58898** - changed mods that need retesting;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 133-133](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L133-L133)

<a id="d-3ad5779cc3e1e5822eda"></a>
- [ ] **D-3ad5779cc3e1e5822eda** - Before vs After comparison card.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 137-137](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L137-L137)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows (11)</summary>

<a id="d-caba01508bc2f4bb9a09"></a>
- [ ] **D-caba01508bc2f4bb9a09** - Quick Scan — out-of-game static analysis, no Minecraft launch.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 141-141](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L141-L141)

<a id="d-5698c4e61f9fcae203a7"></a>
- [ ] **D-5698c4e61f9fcae203a7** - Test One Mod — direct paired A/B test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 142-142](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L142-L142)

<a id="d-f7f4f05309fc5b472980"></a>
- [ ] **D-f7f4f05309fc5b472980** - Test All Mods — adaptive whole-pack isolation + direct confirmation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 143-143](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L143-L143)

<a id="d-6b02df6d7ec78e54a213"></a>
- [ ] **D-6b02df6d7ec78e54a213** - Startup Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 144-144](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L144-L144)

<a id="d-2474a974aa750ae9679e"></a>
- [ ] **D-2474a974aa750ae9679e** - Client FPS Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 145-145](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L145-L145)

<a id="d-e3f9a6226bfbfe06a2d9"></a>
- [ ] **D-e3f9a6226bfbfe06a2d9** - Server TPS Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 146-146](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L146-L146)

<a id="d-49f85d9613fea072897a"></a>
- [ ] **D-49f85d9613fea072897a** - Lag Spike Hunt.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 147-147](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L147-L147)

<a id="d-69602cf0378a53c39c8c"></a>
- [ ] **D-69602cf0378a53c39c8c** - Memory Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 148-148](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L148-L148)

<a id="d-9cc83b3329165a3f7961"></a>
- [ ] **D-9cc83b3329165a3f7961** - Compare Runs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 149-149](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L149-L149)

<a id="d-685738748416fc4d4c0c"></a>
- [ ] **D-685738748416fc4d4c0c** - Regression Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 150-150](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L150-L150)

<a id="d-5eed9804016a9502d679"></a>
- [ ] **D-5eed9804016a9502d679** - Re-test Changed Mods.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 151-151](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L151-L151)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 7. Safe test sandbox (8)</summary>

<a id="d-00f7ea1b17f8fd80930b"></a>
- [ ] **D-00f7ea1b17f8fd80930b** - Never run destructive A/B mutation against the user&#x27;s live instance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 300-300](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L300-L300)

<a id="d-74edf8a60868507b3237"></a>
- [ ] **D-74edf8a60868507b3237** - Create isolated Enderloom-owned test sandboxes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 301-301](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L301-L301)

<a id="d-81a9b3b5a7845d1fe5ea"></a>
- [ ] **D-81a9b3b5a7845d1fe5ea** - Isolate writable configs, worlds, logs, profiler output, and temp test mods.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 303-303](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L303-L303)

<a id="d-edef46b9c0468712393f"></a>
- [ ] **D-edef46b9c0468712393f** - Preserve user-edited configs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 304-304](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L304-L304)

<a id="d-916383c1293d598af467"></a>
- [ ] **D-916383c1293d598af467** - Allow explicit Current Config vs Fresh Config test modes inside the sandbox.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 305-305](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L305-L305)

<a id="d-7c0a579cf7d4a10ea03d"></a>
- [ ] **D-7c0a579cf7d4a10ea03d** - Failed/cancelled test cleans only Enderloom-owned temp state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 306-306](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L306-L306)

<a id="d-dc7a028ddcb6965ba966"></a>
- [ ] **D-dc7a028ddcb6965ba966** - Preserve completed evidence even if a later run crashes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 307-307](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L307-L307)

<a id="d-ed68ff187e79e15ceffe"></a>
- [ ] **D-ed68ff187e79e15ceffe** - Never silently leave test-only profiler/Probe mods inside the live profile.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 308-308](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L308-L308)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 7. Safe test sandbox / Fingerprint each run (18)</summary>

<a id="d-4ec0c42459fd2d2a793f"></a>
- [ ] **D-4ec0c42459fd2d2a793f** - Minecraft version;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 312-312](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L312-L312)

<a id="d-a5ca3b22eed8b12089d1"></a>
- [ ] **D-a5ca3b22eed8b12089d1** - loader + loader version;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 313-313](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L313-L313)

<a id="d-cb97afc65dccf6d22b09"></a>
- [ ] **D-cb97afc65dccf6d22b09** - Java runtime;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 314-314](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L314-L314)

<a id="d-29dbe2a0f08c73ae5179"></a>
- [ ] **D-29dbe2a0f08c73ae5179** - JVM args;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 315-315](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L315-L315)

<a id="d-9537f22a7e89c2c19c33"></a>
- [ ] **D-9537f22a7e89c2c19c33** - enabled mod SHA-256 set;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 316-316](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L316-L316)

<a id="d-4755ddfa90dd67ebcd6c"></a>
- [ ] **D-4755ddfa90dd67ebcd6c** - config hashes;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 317-317](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L317-L317)

<a id="d-6af5ce941901706db7b7"></a>
- [ ] **D-6af5ce941901706db7b7** - shader state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 318-318](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L318-L318)

<a id="d-b408a10e737ac6ed5e75"></a>
- [ ] **D-b408a10e737ac6ed5e75** - resource-pack state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 319-319](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L319-L319)

<a id="d-681235fb2779afe4c7f1"></a>
- [ ] **D-681235fb2779afe4c7f1** - render distance;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 320-320](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L320-L320)

<a id="d-7b06a12a0300514a5c97"></a>
- [ ] **D-7b06a12a0300514a5c97** - simulation distance;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 321-321](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L321-L321)

<a id="d-5726cec6bdb55e695306"></a>
- [ ] **D-5726cec6bdb55e695306** - benchmark-world hash;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 322-322](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L322-L322)

<a id="d-99368d69db13e5b82830"></a>
- [ ] **D-99368d69db13e5b82830** - scenario version;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 323-323](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L323-L323)

<a id="d-65e43945bc6960aae871"></a>
- [ ] **D-65e43945bc6960aae871** - CPU;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 324-324](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L324-L324)

<a id="d-97b54749160d8bceeb1a"></a>
- [ ] **D-97b54749160d8bceeb1a** - GPU;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 325-325](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L325-L325)

<a id="d-9fa467d3a28e61e41908"></a>
- [ ] **D-9fa467d3a28e61e41908** - OS;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 326-326](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L326-L326)

<a id="d-af63a95ae60f41ee780f"></a>
- [ ] **D-af63a95ae60f41ee780f** - relevant power mode;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 327-327](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L327-L327)

<a id="d-6b76d48bec56e44f789f"></a>
- [ ] **D-6b76d48bec56e44f789f** - cache policy;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 328-328](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L328-L328)

<a id="d-c2a506f49ea664c1d416"></a>
- [ ] **D-c2a506f49ea664c1d416** - runtime mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Safe test sandbox / Fingerprint each run
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 329-329](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L329-L329)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 8. Test One Mod — direct A/B proof (11)</summary>

<a id="d-7c19ca7d270f2e2a22b8"></a>
- [ ] **D-7c19ca7d270f2e2a22b8** - determine whether isolation is valid;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 338-338](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L338-L338)

<a id="d-13766ee2d024ae6f9b4f"></a>
- [ ] **D-13766ee2d024ae6f9b4f** - create/reuse compatible baseline;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 339-339](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L339-L339)

<a id="d-337c2a1d7bc68a1abf34"></a>
- [ ] **D-337c2a1d7bc68a1abf34** - create sandbox variant A;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 340-340](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L340-L340)

<a id="d-8946d8bef7d4d3838b01"></a>
- [ ] **D-8946d8bef7d4d3838b01** - create comparison variant B;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 341-341](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L341-L341)

<a id="d-7b92deeb89804988fdcb"></a>
- [ ] **D-7b92deeb89804988fdcb** - run same deterministic scenario;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 342-342](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L342-L342)

<a id="d-3456039c8b69ac70787f"></a>
- [ ] **D-3456039c8b69ac70787f** - repeat if noise is too high;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 343-343](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L343-L343)

<a id="d-3db0cc19937491f082d9"></a>
- [ ] **D-3db0cc19937491f082d9** - compare metrics;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 344-344](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L344-L344)

<a id="d-bd61b31ad3b7899a471f"></a>
- [ ] **D-bd61b31ad3b7899a471f** - calculate delta;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 345-345](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L345-L345)

<a id="d-9ac7141ae7514effe86b"></a>
- [ ] **D-9ac7141ae7514effe86b** - classify verdict;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 346-346](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L346-L346)

<a id="d-837561add03d17224c86"></a>
- [ ] **D-837561add03d17224c86** - calculate confidence/noise status;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 347-347](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L347-L347)

<a id="d-0a8120374a5bfcfd75c0"></a>
- [ ] **D-0a8120374a5bfcfd75c0** - store raw evidence;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 348-348](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L348-L348)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 9. Test All Mods — adaptive whole-pack isolation (7)</summary>

<a id="d-f2cdf34d76c330ae5e82"></a>
- [ ] **D-f2cdf34d76c330ae5e82** - static Quick Scan first;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 360-360](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L360-L360)

<a id="d-125fa71c0653b6071d44"></a>
- [ ] **D-125fa71c0653b6071d44** - run cohort/binary isolation tests;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 364-364](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L364-L364)

<a id="d-f56737e5d285d974d4b8"></a>
- [ ] **D-f56737e5d285d974d4b8** - direct A/B confirm likely offenders;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 366-366](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L366-L366)

<a id="d-76b042aef1270f893f0f"></a>
- [ ] **D-76b042aef1270f893f0f** - mark untestable clusters truthfully;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 368-368](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L368-L368)

<a id="d-17d48d8d2aacd54623ef"></a>
- [ ] **D-17d48d8d2aacd54623ef** - preserve a resumable test queue;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 369-369](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L369-L369)

<a id="d-4637649262ea28db3502"></a>
- [ ] **D-4637649262ea28db3502** - explicit Exhaustive mode for direct per-mod confirmation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 374-374](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L374-L374)

<a id="d-b979e424d6797670dc6f"></a>
- [ ] **D-b979e424d6797670dc6f** - --exhaustive must actually mean exhaustive.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 375-375](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L375-L375)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 10. Deterministic benchmark scenarios (17)</summary>

<a id="d-e239928a6a745c5cdc24"></a>
- [ ] **D-e239928a6a745c5cdc24** - Startup;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 383-383](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L383-L383)

<a id="d-b676de60030898ab79c6"></a>
- [ ] **D-b676de60030898ab79c6** - Client idle;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 384-384](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L384-L384)

<a id="d-431f1dc3f47deb0acd04"></a>
- [ ] **D-431f1dc3f47deb0acd04** - Client traversal;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 385-385](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L385-L385)

<a id="d-5a86cf40df5221fdd9e8"></a>
- [ ] **D-5a86cf40df5221fdd9e8** - Worldgen traversal;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 386-386](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L386-L386)

<a id="d-0501db0ef47118bea1d9"></a>
- [ ] **D-0501db0ef47118bea1d9** - Server idle;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 387-387](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L387-L387)

<a id="d-639e44780a54a94e02c4"></a>
- [ ] **D-639e44780a54a94e02c4** - Server stress;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 388-388](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L388-L388)

<a id="d-08e2ad097eba372c574e"></a>
- [ ] **D-08e2ad097eba372c574e** - Memory/GC soak.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 389-389](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L389-L389)

<a id="d-81a6cabdcb049ccdd099"></a>
- [ ] **D-81a6cabdcb049ccdd099** - fixed benchmark world/snapshot;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 393-393](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L393-L393)

<a id="d-2442de0b7b99461179d5"></a>
- [ ] **D-2442de0b7b99461179d5** - fixed player spawn/start;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 394-394](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L394-L394)

<a id="d-82641e19f0c51a152f9d"></a>
- [ ] **D-82641e19f0c51a152f9d** - fixed camera position;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 395-395](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L395-L395)

<a id="d-626c95a3106bcbaf61af"></a>
- [ ] **D-626c95a3106bcbaf61af** - versioned movement route;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 396-396](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L396-L396)

<a id="d-648353e33bd608a5ef8f"></a>
- [ ] **D-648353e33bd608a5ef8f** - fixed settings;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 397-397](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L397-L397)

<a id="d-6fa0079da9bdcafbfaf8"></a>
- [ ] **D-6fa0079da9bdcafbfaf8** - fixed warmup;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 398-398](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L398-L398)

<a id="d-57173ce6f2c2200e1455"></a>
- [ ] **D-57173ce6f2c2200e1455** - fixed measurement window;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 399-399](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L399-L399)

<a id="d-3b37e4ace055174dc24e"></a>
- [ ] **D-3b37e4ace055174dc24e** - explicit completion condition;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 400-400](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L400-L400)

<a id="d-37889b2c12799a6f82b2"></a>
- [ ] **D-37889b2c12799a6f82b2** - explicit timeout;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 401-401](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L401-L401)

<a id="d-856e9aee27db8222a402"></a>
- [ ] **D-856e9aee27db8222a402** - scenario fingerprint stored with the result.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Deterministic benchmark scenarios
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 402-402](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L402-L402)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 11. Enderloom Probe — test-only Minecraft control mod (14)</summary>

<a id="d-e642b3e7376c4c1e78ec"></a>
- [ ] **D-e642b3e7376c4c1e78ec** - title-ready marker;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 413-413](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L413-L413)

<a id="d-9a7ec32a645068998d21"></a>
- [ ] **D-9a7ec32a645068998d21** - player-ready marker;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 415-415](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L415-L415)

<a id="d-c21592afcc2cd593922c"></a>
- [ ] **D-c21592afcc2cd593922c** - chunks/benchmark-region-ready marker;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 416-416](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L416-L416)

<a id="d-f21e592b518fc37d5724"></a>
- [ ] **D-f21e592b518fc37d5724** - deterministic benchmark-world entry;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 417-417](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L417-L417)

<a id="d-25d3287f5af1dd32c5b6"></a>
- [ ] **D-25d3287f5af1dd32c5b6** - GUI state dump where feasible;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 419-419](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L419-L419)

<a id="d-b3200e7adafb0d634dfd"></a>
- [ ] **D-b3200e7adafb0d634dfd** - GUI click/assert where feasible;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 420-420](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L420-L420)

<a id="d-9d5c492f0e33d4797103"></a>
- [ ] **D-9d5c492f0e33d4797103** - keyboard/mouse/input control;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 421-421](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L421-L421)

<a id="d-c6bb68b344a193842641"></a>
- [ ] **D-c6bb68b344a193842641** - camera/look control;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 422-422](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L422-L422)

<a id="d-5b821b5020b0be51a705"></a>
- [ ] **D-5b821b5020b0be51a705** - scripted movement/routes;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 423-423](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L423-L423)

<a id="d-ff09291a7813b8d937f0"></a>
- [ ] **D-ff09291a7813b8d937f0** - interaction steps;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 424-424](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L424-L424)

<a id="d-4456ac5cbb5a010e1e8f"></a>
- [ ] **D-4456ac5cbb5a010e1e8f** - scenario-complete marker;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 430-430](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L430-L430)

<a id="d-a691d561399f88f17f8d"></a>
- [ ] **D-a691d561399f88f17f8d** - clean automatic exit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 431-431](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L431-L431)

<a id="d-04d76942199ba03dd3ae"></a>
- [ ] **D-04d76942199ba03dd3ae** - Probe control channel is local/scoped to the Enderloom-owned test run.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 435-435](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L435-L435)

<a id="d-d2652ddcc1ec5bf9f760"></a>
- [ ] **D-d2652ddcc1ec5bf9f760** - Probe never becomes a permanent hidden live-profile mod.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 436-436](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L436-L436)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 14. Fast Launch Engine for testing (8)</summary>

<a id="d-c88105c0a013c15b9b75"></a>
- [ ] **D-c88105c0a013c15b9b75** - Keep benchmark sandbox prepared.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 515-515](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L515-L515)

<a id="d-b31258166d94245b2066"></a>
- [ ] **D-b31258166d94245b2066** - Materialize only changed mod state when safe.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 516-516](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L516-L516)

<a id="d-a00c1321f82e2d1d5fe6"></a>
- [ ] **D-a00c1321f82e2d1d5fe6** - Launch directly into test flow when Probe supports it.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 518-518](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L518-L518)

<a id="d-af0eec0d36332c1ab47a"></a>
- [ ] **D-af0eec0d36332c1ab47a** - Auto-warmup.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 519-519](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L519-L519)

<a id="d-6203b6ca9108b5753872"></a>
- [ ] **D-6203b6ca9108b5753872** - Auto-capture.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 520-520](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L520-L520)

<a id="d-d7938816f1ca1981fde4"></a>
- [ ] **D-d7938816f1ca1981fde4** - Auto-exit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 521-521](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L521-L521)

<a id="d-ff1ea95241945db6e605"></a>
- [ ] **D-ff1ea95241945db6e605** - Reuse compatible baselines by fingerprint.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 522-522](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L522-L522)

<a id="d-f58fbb2575beacae297b"></a>
- [ ] **D-f58fbb2575beacae297b** - Never fake speed by skipping required Minecraft initialization.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 525-525](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L525-L525)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 15. Per-mod Performance page (5)</summary>

<a id="d-9603497cc15ed8f2b9b0"></a>
- [ ] **D-9603497cc15ed8f2b9b0** - last test time;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 538-538](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L538-L538)

<a id="d-9e6333df0fdaaec42f5c"></a>
- [ ] **D-9e6333df0fdaaec42f5c** - Test Again;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 566-566](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L566-L566)

<a id="d-5b802cf14bbf6d92d3a0"></a>
- [ ] **D-5b802cf14bbf6d92d3a0** - Test Without;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 567-567](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L567-L567)

<a id="d-c641349cfcc1b70365e8"></a>
- [ ] **D-c641349cfcc1b70365e8** - Test With Current Config;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 568-568](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L568-L568)

<a id="d-81e2d255f62095683405"></a>
- [ ] **D-81e2d255f62095683405** - Test With Fresh Config;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 569-569](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L569-L569)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 16. Performance history and staleness (1)</summary>

<a id="d-17491d269a3489010125"></a>
- [ ] **D-17491d269a3489010125** - Re-test Changed Mods is user-triggered, not a mandatory watchdog.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Performance history and staleness
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 593-593](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L593-L593)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 20. Scenario DSL for Performance tests (1)</summary>

<a id="d-7f5e2c3312bd48452126"></a>
- [ ] **D-7f5e2c3312bd48452126** - Benchmark world/snapshot.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 697-697](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L697-L697)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 22. Performance research/reference ideas already discussed (2)</summary>

<a id="d-6694a4c852dbfcc1d421"></a>
- [ ] **D-6694a4c852dbfcc1d421** - mc-runtime-test — client CI, Xvfb, helper-mod world entry/chunk wait/exit, GameTest.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Performance research/reference ideas already discussed
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 766-766](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L766-L766)

<a id="d-6682362333ce6dfdb28e"></a>
- [ ] **D-6682362333ce6dfdb28e** - mcman — server test/CI workflow precedent.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Performance research/reference ideas already discussed
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 772-772](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L772-L772)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 23. Acceptance tests / Performance (3)</summary>

<a id="d-e421cd43d5905f71aee8"></a>
- [ ] **D-e421cd43d5905f71aee8** - Noisy test lowers confidence/repeats instead of overclaiming.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Performance
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 801-801](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L801-L801)

<a id="d-aaf7b97420b9c9700da2"></a>
- [ ] **D-aaf7b97420b9c9700da2** - Live user instance/config/world is unchanged after test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Performance
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 804-804](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L804-L804)

<a id="d-153cc6378c5af403873b"></a>
- [ ] **D-153cc6378c5af403873b** - Test history survives restart.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Performance
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 805-805](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L805-L805)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 2 — Performance foundation (2)</summary>

<a id="d-3fbfc5150e741ecb4476"></a>
- [ ] **D-3fbfc5150e741ecb4476** - Test-session schema.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 2 — Performance foundation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 835-835](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L835-L835)

<a id="d-85a882e8eeee61e81faf"></a>
- [ ] **D-85a882e8eeee61e81faf** - Safe sandbox.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 2 — Performance foundation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 838-838](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L838-L838)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 3 — Direct mod impact (2)</summary>

<a id="d-23b7bbba7662859e522b"></a>
- [ ] **D-23b7bbba7662859e522b** - Startup test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 3 — Direct mod impact
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 847-847](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L847-L847)

<a id="d-bd7af683d6e49037bbbe"></a>
- [ ] **D-bd7af683d6e49037bbbe** - Dedicated-server test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 3 — Direct mod impact
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 848-848](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L848-L848)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing (4)</summary>

<a id="d-fe6a16ae55cd952a1940"></a>
- [ ] **D-fe6a16ae55cd952a1940** - Probe.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 854-854](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L854-L854)

<a id="d-acc8317893bd7489ef66"></a>
- [ ] **D-acc8317893bd7489ef66** - Lifecycle markers.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 855-855](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L855-L855)

<a id="d-1c2bf166d947fa5ca9d7"></a>
- [ ] **D-1c2bf166d947fa5ca9d7** - Deterministic benchmark world/route.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 856-856](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L856-L856)

<a id="d-dbcf39c21744719792f2"></a>
- [ ] **D-dbcf39c21744719792f2** - Auto warmup/capture/exit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 860-860](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L860-L860)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence (1)</summary>

<a id="d-0b30ecd81a789c9d2da7"></a>
- [ ] **D-0b30ecd81a789c9d2da7** - Adaptive Test All.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 866-866](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L866-L866)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 25. Focused definition of done (4)</summary>

<a id="d-e466a69e4ec4afc41e71"></a>
- [ ] **D-e466a69e4ec4afc41e71** - Performance Lab can Quick Scan, test one mod, and test whole packs safely.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 891-891](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L891-L891)

<a id="d-6af25e9b4c3847c761cf"></a>
- [ ] **D-6af25e9b4c3847c761cf** - Headless vs rendered conclusions are truthfully separated.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 893-893](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L893-L893)

<a id="d-f85f4bf5036fa903f9f5"></a>
- [ ] **D-f85f4bf5036fa903f9f5** - Test sandboxes never damage the live instance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 895-895](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L895-L895)

<a id="d-75808f053645119dbe3a"></a>
- [ ] **D-75808f053645119dbe3a** - Why/tooltips explain recommendations and test verdicts.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 901-901](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L901-L901)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 0. North-star product promise (2)</summary>

<a id="d-49b2bd2e4d9188e80caa"></a>
- [ ] **D-49b2bd2e4d9188e80caa** - Say Fix with AI and let Enderloom use its integrated authenticated browser to run the full handoff -&gt; returned artifact -&gt; build -&gt; sandbox test -&gt; failure feedback -&g...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Say Fix with AI and let Enderloom use its integrated authenticated browser to run the full handoff -&gt; returned artifact -&gt; build -&gt; sandbox test -&gt; failure feedback -&gt; retry -&gt; transactional install loop.
  - **Binding context:** 0. North-star product promise
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 30-30](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L30-L30)

<a id="d-b247668d9ce023122e8f"></a>
- [ ] **D-b247668d9ce023122e8f** - Turn one mod into a release matrix across versions/loaders, test every target, package it, and retain exact provenance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. North-star product promise
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 33-33](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L33-L33)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 4. Universal Project / Mod Detail Surface (1)</summary>

<a id="d-6feac192b3760b2bf039"></a>
- [ ] **D-6feac192b3760b2bf039** - Test
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 214-214](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L214-L214)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 5. Right-click / Power Context Menu — obsessive QOL / 5.3 `Performance` submenu (4)</summary>

<a id="d-cdaae12a20ed5ae2a3e5"></a>
- [ ] **D-cdaae12a20ed5ae2a3e5** - Test startup impact
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.3 `Performance` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 292-292](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L292-L292)

<a id="d-3dee458a358d823b1015"></a>
- [ ] **D-3dee458a358d823b1015** - Test memory/GC
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.3 `Performance` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 295-295](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L295-L295)

<a id="d-ba5b352cdd40ea7ff6e4"></a>
- [ ] **D-ba5b352cdd40ea7ff6e4** - Test without this mod
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.3 `Performance` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 297-297](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L297-L297)

<a id="d-b6d7375149c1589d4308"></a>
- [ ] **D-b6d7375149c1589d4308** - Test current vs previous version
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.3 `Performance` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 298-298](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L298-L298)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 15. Compatibility Lab (1)</summary>

<a id="d-0fcfa1af4e340cb81db3"></a>
- [ ] **D-0fcfa1af4e340cb81db3** - Pairwise test automation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Compatibility Lab
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 698-698](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L698-L698)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 18. Autonomous AI Repair Loop (1)</summary>

<a id="d-c0f579e1fc6374ebee59"></a>
- [ ] **D-c0f579e1fc6374ebee59** - Sandbox test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Autonomous AI Repair Loop
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 809-809](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L809-L809)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 25. Resource Pack / Data Pack Studio (1)</summary>

<a id="d-4da34d403e3c3797b2d9"></a>
- [ ] **D-4da34d403e3c3797b2d9** - Live reload into controlled test client where safe.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Resource Pack / Data Pack Studio
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1111-1111](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1111-L1111)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 26. Shader / Render Pipeline Manager (1)</summary>

<a id="d-c8c303586942906b1ddf"></a>
- [ ] **D-c8c303586942906b1ddf** - Fast enable/disable test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 26. Shader / Render Pipeline Manager
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1121-1121](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1121-L1121)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 28. Modpack Workbench (1)</summary>

<a id="d-bcdf65ed52bb5fb1deca"></a>
- [ ] **D-bcdf65ed52bb5fb1deca** - Compatibility test queue.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Modpack Workbench
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1171-1171](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1171-L1171)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 31. Launch Doctor / Fast Launch Engine (1)</summary>

<a id="d-ab34378ba7468c2be20a"></a>
- [ ] **D-ab34378ba7468c2be20a** - Reuse prepared test sandboxes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 31. Launch Doctor / Fast Launch Engine
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1245-1245](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1245-L1245)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 37. Enderloom itself must be absurdly fast (1)</summary>

<a id="d-36faff7d8ced2fb00e6d"></a>
- [ ] **D-36faff7d8ced2fb00e6d** - Benchmark world scans on very large saves.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Enderloom itself must be absurdly fast
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1395-1395](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1395-L1395)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 38. Micro-QOL saturation pass (1)</summary>

<a id="d-4898d25c883823f256c7"></a>
- [ ] **D-4898d25c883823f256c7** - Test what changed automatically selects invalidated gates.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 38. Micro-QOL saturation pass
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1445-1445](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1445-L1445)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 39. Safety / preservation rules (1)</summary>

<a id="d-2149a19b186d07e7dee7"></a>
- [ ] **D-2149a19b186d07e7dee7** - Live user instances are never automated-test sandboxes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Safety / preservation rules
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1454-1454](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1454-L1454)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 41. Verification contract (2)</summary>

<a id="d-f1392b974ec90ec4ae9d"></a>
- [ ] **D-f1392b974ec90ec4ae9d** - deterministic scenario;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1527-1527](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1527-L1527)

<a id="d-9690f151e18ea659e14f"></a>
- [ ] **D-9690f151e18ea659e14f** - target runtime open test when meaningful;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1546-1546](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1546-L1546)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Stable exit-code families (2)</summary>

<a id="d-7d1f4c89d8940548c89a"></a>
- [ ] **D-7d1f4c89d8940548c89a** - success / test passed
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 99-99](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L99-L99)

<a id="d-f3981d3c4f2c22029a6c"></a>
- [ ] **D-f3981d3c4f2c22029a6c** - test/assertion failure
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 105-105](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L105-L105)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / Runtime modes (2)</summary>

<a id="d-f51e2df383e9a0c3206d"></a>
- [ ] **D-f51e2df383e9a0c3206d** - Every test result must record the mode because the mode changes what conclusions are valid.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Runtime modes
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 326-326](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L326-L326)

<a id="d-fedd75995af573cb7eb2"></a>
- [ ] **D-fedd75995af573cb7eb2** - virtual-display — real client on a virtual framebuffer/hidden test display. Useful for CI/client logic; do not claim physical GPU/FPS equivalence.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Runtime modes
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 329-329](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L329-L329)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / GameTest (1)</summary>

<a id="d-e34f5122d8e4b5a0de82"></a>
- [ ] **D-e34f5122d8e4b5a0de82** - Capture per-test pass/fail/duration/error into structured result JSON.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / GameTest
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 383-383](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L383-L383)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex (6)</summary>

<a id="d-411108b21996355f8c2b"></a>
- [ ] **D-411108b21996355f8c2b** - enderloom test scenario list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 425-425](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L425-L425)

<a id="d-c709f50cc9fd7c5f5bc0"></a>
- [ ] **D-c709f50cc9fd7c5f5bc0** - enderloom test scenario show &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 426-426](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L426-L426)

<a id="d-aa1a679329d41ebd2cc9"></a>
- [ ] **D-aa1a679329d41ebd2cc9** - enderloom test scenario validate &lt;FILE&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 427-427](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L427-L427)

<a id="d-3937a0f4ccccd9905b25"></a>
- [ ] **D-3937a0f4ccccd9905b25** - enderloom test scenario run &lt;FILE|ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 428-428](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L428-L428)

<a id="d-e7d674a5bff50c3e2d38"></a>
- [ ] **D-e7d674a5bff50c3e2d38** - enderloom test scenario copy &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 429-429](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L429-L429)

<a id="d-2cc6263c26e33e1b1fe9"></a>
- [ ] **D-2cc6263c26e33e1b1fe9** - enderloom test scenario export &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 430-430](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L430-L430)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Quick/static analysis (3)</summary>

<a id="d-4c81fc6c116ea758227d"></a>
- [ ] **D-4c81fc6c116ea758227d** - enderloom test quick-scan --jar &lt;PATH&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Quick/static analysis
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 447-447](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L447-L447)

<a id="d-dbb3eeb6e0899c961fdd"></a>
- [ ] **D-dbb3eeb6e0899c961fdd** - enderloom test quick-scan --instance &lt;ID&gt; --mod &lt;SELECTOR&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Quick/static analysis
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 448-448](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L448-L448)

<a id="d-abee2706bfccd7d6a314"></a>
- [ ] **D-abee2706bfccd7d6a314** - enderloom test quick-scan --instance &lt;ID&gt; --all
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Quick/static analysis
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 449-449](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L449-L449)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Baselines (4)</summary>

<a id="d-7415fccaf10b6f42fdb2"></a>
- [ ] **D-7415fccaf10b6f42fdb2** - enderloom test baseline create --instance &lt;ID&gt; --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Baselines
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 455-455](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L455-L455)

<a id="d-0591b83fa7de3b8da8f2"></a>
- [ ] **D-0591b83fa7de3b8da8f2** - enderloom test baseline list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Baselines
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 456-456](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L456-L456)

<a id="d-8c9116280dd544216c00"></a>
- [ ] **D-8c9116280dd544216c00** - enderloom test baseline show &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Baselines
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 457-457](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L457-L457)

<a id="d-e43c461a5fb642e01230"></a>
- [ ] **D-e43c461a5fb642e01230** - enderloom test baseline invalidate &lt;ID&gt; where explicitly requested.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Baselines
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 458-458](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L458-L458)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Direct tests (7)</summary>

<a id="d-06e1dd9683e57c9c27db"></a>
- [ ] **D-06e1dd9683e57c9c27db** - enderloom test startup --instance &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Direct tests
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 463-463](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L463-L463)

<a id="d-b3eeb0a12f6d2bba1285"></a>
- [ ] **D-b3eeb0a12f6d2bba1285** - enderloom test client-fps --instance &lt;ID&gt; --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Direct tests
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 464-464](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L464-L464)

<a id="d-5f6a6ae97d3c16ea0ab2"></a>
- [ ] **D-5f6a6ae97d3c16ea0ab2** - enderloom test server-tps --instance &lt;ID&gt; --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Direct tests
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 465-465](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L465-L465)

<a id="d-b56d75d64ce4da74269b"></a>
- [ ] **D-b56d75d64ce4da74269b** - enderloom test memory --instance &lt;ID&gt; --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Direct tests
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 466-466](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L466-L466)

<a id="d-7190936948c37ba154f8"></a>
- [ ] **D-7190936948c37ba154f8** - enderloom test lag-spikes --instance &lt;ID&gt; --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Direct tests
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 467-467](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L467-L467)

<a id="d-f118c1b80b2678f21144"></a>
- [ ] **D-f118c1b80b2678f21144** - enderloom test mod-impact --instance &lt;ID&gt; --mod &lt;SELECTOR&gt; --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Direct tests
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 468-468](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L468-L468)

<a id="d-82bfbe5d2688c1016a04"></a>
- [ ] **D-82bfbe5d2688c1016a04** - enderloom test interactions --instance &lt;ID&gt; --mods ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Direct tests
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 469-469](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L469-L469)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Whole-pack test (4)</summary>

<a id="d-a8b635e7c2b7155a159d"></a>
- [ ] **D-a8b635e7c2b7155a159d** - enderloom test all --instance &lt;ID&gt; --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Whole-pack test
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 473-473](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L473-L473)

<a id="d-4fdd162f22f7d80346a7"></a>
- [ ] **D-4fdd162f22f7d80346a7** - Default is adaptive dependency-aware cohort isolation + direct confirmation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Whole-pack test
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 474-474](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L474-L474)

<a id="d-96539f518ecc3a9f952a"></a>
- [ ] **D-96539f518ecc3a9f952a** - --exhaustive explicitly requests direct per-mod confirmation even when expensive.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Whole-pack test
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 475-475](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L475-L475)

<a id="d-087dcf1b601724dcd88d"></a>
- [ ] **D-087dcf1b601724dcd88d** - --resume &lt;SESSION&gt; resumes from durable completed sub-runs rather than starting over.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Whole-pack test
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 476-476](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L476-L476)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Results / comparisons (6)</summary>

<a id="d-ed0ffc0c0e02cb3489c6"></a>
- [ ] **D-ed0ffc0c0e02cb3489c6** - enderloom test result list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 482-482](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L482-L482)

<a id="d-b711ccf68a13124264e7"></a>
- [ ] **D-b711ccf68a13124264e7** - enderloom test result show &lt;RUN&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 483-483](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L483-L483)

<a id="d-f51826f7a91e35b1c629"></a>
- [ ] **D-f51826f7a91e35b1c629** - enderloom test compare &lt;A&gt; &lt;B&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 484-484](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L484-L484)

<a id="d-4d89aa4300f48a07665a"></a>
- [ ] **D-4d89aa4300f48a07665a** - enderloom test regression --baseline &lt;A&gt; --candidate &lt;B&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 485-485](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L485-L485)

<a id="d-bc88dd8effd90c60559b"></a>
- [ ] **D-bc88dd8effd90c60559b** - enderloom test history --mod &lt;HASH|SELECTOR&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 486-486](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L486-L486)

<a id="d-3b0b6488100cc13dc6a9"></a>
- [ ] **D-3b0b6488100cc13dc6a9** - enderloom test artifacts &lt;RUN&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 487-487](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L487-L487)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Cancellation / recovery (2)</summary>

<a id="d-6d5e5ded07eda1359f0b"></a>
- [ ] **D-6d5e5ded07eda1359f0b** - enderloom test cancel &lt;SESSION&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Cancellation / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 493-493](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L493-L493)

<a id="d-d9a0b7c1afd503d36ace"></a>
- [ ] **D-d9a0b7c1afd503d36ace** - enderloom test resume &lt;SESSION&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Cancellation / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 494-494](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L494-L494)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 8. Profiler CLI adapters / Spark (1)</summary>

<a id="d-31fa3e54c5fcb594f4b5"></a>
- [ ] **D-31fa3e54c5fcb594f4b5** - enderloom profile spark ensure --instance &lt;TEST_SANDBOX&gt; resolves a compatible official build.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Profiler CLI adapters / Spark
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 512-512](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L512-L512)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 9. Protocol-bot / synthetic-player test lane (5)</summary>

<a id="d-b2ff486918857819a9f4"></a>
- [ ] **D-b2ff486918857819a9f4** - enderloom bot spawn --count N --server HOST:PORT --scenario &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Protocol-bot / synthetic-player test lane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 534-534](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L534-L534)

<a id="d-dc683ef2384de6c6d909"></a>
- [ ] **D-dc683ef2384de6c6d909** - enderloom bot list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Protocol-bot / synthetic-player test lane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 535-535](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L535-L535)

<a id="d-91ac9659f1776e5bcbe0"></a>
- [ ] **D-91ac9659f1776e5bcbe0** - enderloom bot stop
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Protocol-bot / synthetic-player test lane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 537-537](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L537-L537)

<a id="d-43560c2bd01f8b1360d0"></a>
- [ ] **D-43560c2bd01f8b1360d0** - Deterministic connection ramp rate.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Protocol-bot / synthetic-player test lane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 538-538](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L538-L538)

<a id="d-37b38b20d88d250042df"></a>
- [ ] **D-37b38b20d88d250042df** - Never copy external implementations without license review.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 9. Protocol-bot / synthetic-player test lane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 549-549](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L549-L549)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 10. GitHub projects to learn from — current research / Mineflayer — `PrismarineJS/mineflayer` (1)</summary>

<a id="d-b9b8e08d4fb2acd9a5c7"></a>
- [ ] **D-b9b8e08d4fb2acd9a5c7** - - optional adapter/reference for synthetic-player server load scenarios; - never substitute a Mineflayer bot for a real modded client benchmark.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 10. GitHub projects to learn from — current research / Mineflayer — `PrismarineJS/mineflayer`
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 660-661](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L660-L661)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 11. Fast Launch Engine CLI integration (6)</summary>

<a id="d-ab591939edc00be36009"></a>
- [ ] **D-ab591939edc00be36009** - enderloom test sandbox create materializes only mutable test state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Fast Launch Engine CLI integration
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 716-716](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L716-L716)

<a id="d-36f40edfa6c5ec8841bd"></a>
- [ ] **D-36f40edfa6c5ec8841bd** - enderloom test sandbox show
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Fast Launch Engine CLI integration
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 717-717](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L717-L717)

<a id="d-aa3c1d2ef81ce600fd32"></a>
- [ ] **D-aa3c1d2ef81ce600fd32** - enderloom test sandbox clean
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Fast Launch Engine CLI integration
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 718-718](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L718-L718)

<a id="d-ad7734477a97d4c467c9"></a>
- [ ] **D-ad7734477a97d4c467c9** - enderloom test sandbox recover
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Fast Launch Engine CLI integration
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 719-719](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L719-L719)

<a id="d-3f7374e1e4e98dd0b80a"></a>
- [ ] **D-3f7374e1e4e98dd0b80a** - --cold test mode intentionally invalidates selected caches when measuring cold startup.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Fast Launch Engine CLI integration
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 722-722](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L722-L722)

<a id="d-83fe52a3e9ecf589981e"></a>
- [ ] **D-83fe52a3e9ecf589981e** - --warm test mode preserves documented caches.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Fast Launch Engine CLI integration
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 723-723](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L723-L723)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 13. Security and safety requirements (2)</summary>

<a id="d-632eee0474e917768862"></a>
- [ ] **D-632eee0474e917768862** - Test sandboxes are isolated from real saves/configs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Security and safety requirements
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 752-752](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L752-L752)

<a id="d-0fbf2b2c51858e8f285d"></a>
- [ ] **D-0fbf2b2c51858e8f285d** - Probe control channel is scoped to Enderloom-owned test runs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Security and safety requirements
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 753-753](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L753-L753)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Parser/contract (6)</summary>

<a id="d-f37325e9b82ff8d76bc6"></a>
- [ ] **D-f37325e9b82ff8d76bc6** - stable legacy flags
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 764-764](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L764-L764)

<a id="d-519b4ed9650af099e4e0"></a>
- [ ] **D-519b4ed9650af099e4e0** - missing required args returns non-zero
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 766-766](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L766-L766)

<a id="d-a048227d9bf1713392d0"></a>
- [ ] **D-a048227d9bf1713392d0** - unknown args rejected except explicit passthrough after --
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 767-767](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L767-L767)

<a id="d-8ed854c7572154805604"></a>
- [ ] **D-8ed854c7572154805604** - selectors reject ambiguity
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 768-768](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L768-L768)

<a id="d-204ef29293e6feb1f164"></a>
- [ ] **D-204ef29293e6feb1f164** - JSONL progress schema validation
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 770-770](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L770-L770)

<a id="d-db903b3afcbc96a111db"></a>
- [ ] **D-db903b3afcbc96a111db** - shell completion generation
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 771-771](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L771-L771)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Real launcher behavior (5)</summary>

<a id="d-b0865ada41809d47a6ea"></a>
- [ ] **D-b0865ada41809d47a6ea** - list instances
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Real launcher behavior
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 775-775](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L775-L775)

<a id="d-3d8a784595af7ee1aa01"></a>
- [ ] **D-3d8a784595af7ee1aa01** - install game/loader fixture
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Real launcher behavior
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 777-777](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L777-L777)

<a id="d-fc8f66ba73ad2be3fd99"></a>
- [ ] **D-fc8f66ba73ad2be3fd99** - install/toggle/remove test content
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Real launcher behavior
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 778-778](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L778-L778)

<a id="d-1cf873398d8d7514a710"></a>
- [ ] **D-1cf873398d8d7514a710** - snapshot/restore
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Real launcher behavior
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 779-779](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L779-L779)

<a id="d-46b092c5aef092871abd"></a>
- [ ] **D-46b092c5aef092871abd** - pack import/export fixture
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Real launcher behavior
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 782-782](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L782-L782)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Minecraft test control (9)</summary>

<a id="d-137b4303bf366b9d9b41"></a>
- [ ] **D-137b4303bf366b9d9b41** - Probe handshake
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 787-787](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L787-L787)

<a id="d-3241662e8deb4a3ed26a"></a>
- [ ] **D-3241662e8deb4a3ed26a** - title-ready detection
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 788-788](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L788-L788)

<a id="d-9097d010c5a7a48673c4"></a>
- [ ] **D-9097d010c5a7a48673c4** - world-open detection
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 789-789](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L789-L789)

<a id="d-84c13faa8f1e87781e57"></a>
- [ ] **D-84c13faa8f1e87781e57** - chunks-ready detection
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 790-790](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L790-L790)

<a id="d-cb7217ad2119e9d5a9b5"></a>
- [ ] **D-cb7217ad2119e9d5a9b5** - GUI dump/assert on at least one supported client version
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 792-792](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L792-L792)

<a id="d-b58cd602fced130a7237"></a>
- [ ] **D-b58cd602fced130a7237** - deterministic route playback
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 794-794](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L794-L794)

<a id="d-19632e826dd01801aa23"></a>
- [ ] **D-19632e826dd01801aa23** - automatic profiler start/stop
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 795-795](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L795-L795)

<a id="d-481099650e241f74b177"></a>
- [ ] **D-481099650e241f74b177** - automatic clean exit
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 796-796](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L796-L796)

<a id="d-cfbc20f42f478b5efe40"></a>
- [ ] **D-cfbc20f42f478b5efe40** - timeout/cancel kills only owned test processes
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 797-797](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L797-L797)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Performance proof (4)</summary>

<a id="d-0f80f58d458cc29de788"></a>
- [ ] **D-0f80f58d458cc29de788** - deliberate startup regression detected
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Performance proof
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 801-801](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L801-L801)

<a id="d-4f755bd0cf7febe7ff81"></a>
- [ ] **D-4f755bd0cf7febe7ff81** - deliberate rendered-client frame regression detected in rendered mode
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Performance proof
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 803-803](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L803-L803)

<a id="d-c49f736e28f78232e222"></a>
- [ ] **D-c49f736e28f78232e222** - deliberate allocation/GC regression detected
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Performance proof
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 804-804](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L804-L804)

<a id="d-cd42e9a56fcff57fe037"></a>
- [ ] **D-cd42e9a56fcff57fe037** - profiler overhead challenge pass
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Performance proof
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 806-806](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L806-L806)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-2 — test-session foundation (4)</summary>

<a id="d-deeab376b8914c738d0d"></a>
- [ ] **D-deeab376b8914c738d0d** - normalized test-session schema
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-2 — test-session foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 852-852](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L852-L852)

<a id="d-95bd37d8154de7226e79"></a>
- [ ] **D-95bd37d8154de7226e79** - fingerprinting
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-2 — test-session foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 853-853](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L853-L853)

<a id="d-384152389d2d54c07b78"></a>
- [ ] **D-384152389d2d54c07b78** - sandbox create/recover/clean
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-2 — test-session foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 854-854](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L854-L854)

<a id="d-d914e24433c335bcbf71"></a>
- [ ] **D-d914e24433c335bcbf71** - JFR startup test
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-2 — test-session foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 855-855](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L855-L855)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Core promises (1)</summary>

<a id="d-f357c14c7f28d45dd219"></a>
- [ ] **D-f357c14c7f28d45dd219** - 1. One-click test one mod. Select a mod and choose Test Impact. Enderloom produces a controlled baseline and a matching run with the target changed, then reports the delta on the m...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** 1. One-click test one mod. Select a mod and choose Test Impact. Enderloom produces a controlled baseline and a matching run with the target changed, then reports the delta on the mod itself. 2. Test the whole pack. A dependency-aware adaptive sweep isolates likely performance offenders without blindly doing one full boot per JAR when a faster statistically valid route exists. 3. Direct with/without evidence. Any mod labeled with a measured performance cost must have direct paired evidence. Inferred candidates are shown as Suspected until a direct confirmation run exists. 4. Never touch the live instance. All automated testing runs in a disposable or recoverable test sandbox. User worlds, configs, saves, screenshots, launcher metadata, and external CurseForge/Modrinth instances are not mutated. 5. Preserve user-edited configs. The normal test uses the user&#x27;s current configs. Optional Fresh Config and Default Config comparisons are explicit separate scenarios and never overwrite the live config. 6. No fake precision. Every score carries run count, environment fingerprint, test scenario, variance/confidence, and whether a metric is measured, estimated, or inferred. 7. Fast by architecture, not by skipping work. Reuse immutable game assets, Java installs, loader artifacts, dependency resolution, authentication state, precomputed fingerprints, and profiler/tool caches. Avoid re-copying unchanged data and re-running unchanged baselines. 8. Why? everywhere. Any warning, score, recommendation, or test option exposes a concise Why? explanation describing what was measured, what it means, and what tradeoff a change would have.
  - **Binding context:** Enderloom Premium Testing Lab / Core promises
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 23-30](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L23-L30)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Fast test pipeline / 2. Dependency-aware test sandbox (1)</summary>

<a id="d-64e2aae52ae8a3f5d5d5"></a>
- [ ] **D-64e2aae52ae8a3f5d5d5** - The sandbox must always be restorable/deletable as one transaction.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Fast test pipeline / 2. Dependency-aware test sandbox
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 83-83](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L83-L83)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Fast test pipeline / 4. Adaptive full-pack sweep (1)</summary>

<a id="d-199d733789b0673aaf8c"></a>
- [ ] **D-199d733789b0673aaf8c** - Test All Mods must not naively require N + 1 full launches by default.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Fast test pipeline / 4. Adaptive full-pack sweep
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 99-99](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L99-L99)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Launch acceleration for testing (1)</summary>

<a id="d-59de9e989942880e7604"></a>
- [ ] **D-59de9e989942880e7604** - A different enabled-mod set requires a new Minecraft JVM; Enderloom must not pretend it can hot-unload normal mods from a running game. Instead, make each required restart as cheap...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** A different enabled-mod set requires a new Minecraft JVM; Enderloom must not pretend it can hot-unload normal mods from a running game. Instead, make each required restart as cheap as possible.
  - **Binding context:** Enderloom Premium Testing Lab / Launch acceleration for testing
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 121-121](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L121-L121)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Launch acceleration for testing / Fast Launch Engine (1)</summary>

<a id="d-6fe2ceff2459b22c2001"></a>
- [ ] **D-6fe2ceff2459b22c2001** - - pre-resolve Java, loader, classpath, assets, natives, auth, launch arguments, and dependency plans - reuse already-installed immutable libraries and game assets - retain warm fil...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - pre-resolve Java, loader, classpath, assets, natives, auth, launch arguments, and dependency plans - reuse already-installed immutable libraries and game assets - retain warm filesystem and download caches - keep a prebuilt benchmark sandbox rather than cloning the full profile for every run - materialize only the changed enabled-mod set - avoid launcher UI work that is irrelevant to the benchmark - launch directly into the benchmark scenario through the Enderloom test probe when supported - auto-exit after the required capture window - reuse valid baselines by fingerprint - run server-only tests through nogui dedicated-server paths whenever the mod side metadata makes that valid - never report a speed gain obtained by omitting required initialization or benchmark work
  - **Binding context:** Enderloom Premium Testing Lab / Launch acceleration for testing / Fast Launch Engine
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 125-135](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L125-L135)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Instrumentation stack / E. Enderloom Probe mod (1)</summary>

<a id="d-d205aa286ae0ef52fc06"></a>
- [ ] **D-d205aa286ae0ef52fc06** - The Probe must be test-sandbox-only by default and must not remain silently installed in the user&#x27;s live pack.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Instrumentation stack / E. Enderloom Probe mod
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 201-201](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L201-L201)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Metrics shown per mod (1)</summary>

<a id="d-ed3601d786972057df71"></a>
- [ ] **D-ed3601d786972057df71** - Never collapse everything into one unexplained score.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Metrics shown per mod
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 284-284](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L284-L284)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Licensing/integration boundary (1)</summary>

<a id="d-985970d9a430104605d9"></a>
- [ ] **D-985970d9a430104605d9** - Use external tools through normal installation/integration/export protocols or independently implemented adapters. Do not casually copy code into Enderloom.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Licensing/integration boundary
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 565-565](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L565-L565)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Data model (1)</summary>

<a id="d-2dce8870a9df1ae65f6d"></a>
- [ ] **D-2dce8870a9df1ae65f6d** - Each test session must persist:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Data model
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 577-577](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L577-L577)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Release acceptance (1)</summary>

<a id="d-7b48af7f8da7a9abaf9a"></a>
- [ ] **D-7b48af7f8da7a9abaf9a** - - live profile is never mutated by an automated test - failed/cancelled runs restore/clean the sandbox - required dependency closure is preserved in target tests - a measured per-m...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - live profile is never mutated by an automated test - failed/cancelled runs restore/clean the sandbox - required dependency closure is preserved in target tests - a measured per-mod verdict can be traced to raw evidence - direct A/B comparisons show exact scenario and environment fingerprints - changed mod/config/hardware/Java/loader state invalidates only the evidence that truly became stale - baseline caching never crosses incompatible fingerprints - startup tests capture real loader/game work - client FPS tests use a real rendered client and never claim headless FPS accuracy - server-only tests can run without a graphical client when valid - at least one built-in test catches a deliberate tick regression - at least one catches a deliberate render/frame regression - at least one catches startup inflation - at least one catches allocation/GC regression - AI bundles redact secrets and enumerate contents before external handoff - every visible button performs a real operation or reports a truthful unsupported state - results persist across Enderloom restart - mod version history remains comparable by SHA-256 - one final challenge/regression pass verifies that profiler overhead itself is not being mistaken for target-mod cost
  - **Binding context:** Enderloom Premium Testing Lab / Release acceptance
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 689-707](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L689-L707)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Matrix/QOL (1)</summary>

<a id="d-0b7c996dbb2e30f50583"></a>
- [ ] **D-0b7c996dbb2e30f50583** - headless mode never waits for prompt.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Matrix/QOL
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 903-903](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L903-L903) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1307-1307](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1307-L1307)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release (1)</summary>

<a id="d-91cf0e5a88eb0ce88af7"></a>
- [ ] **D-91cf0e5a88eb0ce88af7** - deterministic SHA-256 generated for every artifact.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 954-954](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L954-L954) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1358-1358](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1358-L1358)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior (1)</summary>

<a id="d-0906fcaaf19da14ee576"></a>
- [ ] **D-0906fcaaf19da14ee576** - deterministic headless fallback that never waits on UI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 232-232](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L232-L232)

</details>

<a id="test-02-details"></a>
## TEST-02 - Scenario and GameTest compiler

[Outcome](Checklist.md#test-02) / 91 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 6. Automatic evidence bundle (1)</summary>

<a id="d-e5b3e53f7d2d2fcc406f"></a>
- [ ] **D-e5b3e53f7d2d2fcc406f** - exact reproduction scenario DSL;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Automatic evidence bundle
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 228-228](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L228-L228)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 11. Automatic failure feedback loop (1)</summary>

<a id="d-8bed0181caf434763409"></a>
- [ ] **D-8bed0181caf434763409** - reproduction scenario;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Automatic failure feedback loop
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 379-379](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L379-L379)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 16. Performance Lab integration (1)</summary>

<a id="d-0bc4599cf0e823bc1609"></a>
- [ ] **D-0bc4599cf0e823bc1609** - Candidate runs the same scenario against the same compatible fingerprint.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Performance Lab integration
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 497-497](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L497-L497)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.2 Minecraft control plane (1)</summary>

<a id="d-35cd00b29afc38a10cef"></a>
- [ ] **D-35cd00b29afc38a10cef** - screenshot/capture/telemetry and GameTest list/run/filter.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.2 Minecraft control plane
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PC-012 : 288-288](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L288-L288)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.4 Scenario engine (2)</summary>

<a id="d-6582cde1c1cc266ff725"></a>
- [ ] **D-6582cde1c1cc266ff725** - built-in Startup, Client Idle, Client Traversal, Worldgen Traversal, Server Idle, Server Stress, Soak, and applicable multiplayer/chaos scenarios.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.4 Scenario engine
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-030 : 363-363](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L363-L363)

<a id="d-f5f1babb39515e337a3a"></a>
- [ ] **D-f5f1babb39515e337a3a** - versioned scenario DSL supports runtime mode, target, world snapshot, settings, warmup, waits/assertions, profiler boundaries, input/movement/interactions, measurement windows, met...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** versioned scenario DSL supports runtime mode, target, world snapshot, settings, warmup, waits/assertions, profiler boundaries, input/movement/interactions, measurement windows, metrics, timeouts, cancellation/cleanup; arbitrary shell is opt-in only.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.4 Scenario engine
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-031 : 364-364](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L364-L364)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.6 A/B, whole-pack isolation, confidence (1)</summary>

<a id="d-9025a63da485140015da"></a>
- [ ] **D-9025a63da485140015da** - single-mod paired same-scenario comparison honors dependency closure and repeats noisy measurements.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.6 A/B, whole-pack isolation, confidence
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-050 : 376-376](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L376-L376)

</details>

<details>
<summary>ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md / 2. Heap / Memory-Leak Lab (1)</summary>

<a id="d-4d00e619361f3b8e1065"></a>
- [ ] **D-4d00e619361f3b8e1065** - compare before/after scenario;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Heap / Memory-Leak Lab
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 49-49](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L49-L49)

</details>

<details>
<summary>ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md / 4. Concurrency Correctness Lab (1)</summary>

<a id="d-75a9cbc2ffbe5b392f7a"></a>
- [ ] **D-75a9cbc2ffbe5b392f7a** - race-sensitive stress scenarios with repeated runs;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Concurrency Correctness Lab
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 120-120](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L120-L120)

</details>

<details>
<summary>ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md / 6. Unified GameTest / Scenario Compiler (18)</summary>

<a id="d-100bd17dc1a49853141f"></a>
- [ ] **D-100bd17dc1a49853141f** - author scenario once in Enderloom&#x27;s typed scenario model;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 172-172](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L172-L172)

<a id="d-1a94217ab8813abc7e72"></a>
- [ ] **D-1a94217ab8813abc7e72** - compile to Forge GameTest where supported;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 173-173](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L173-L173)

<a id="d-aba63460835d51a1cc84"></a>
- [ ] **D-aba63460835d51a1cc84** - compile to NeoForge GameTest where supported;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 174-174](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L174-L174)

<a id="d-1220b6a73fa051808a3f"></a>
- [ ] **D-1220b6a73fa051808a3f** - compile to Fabric server/client game-test harnesses where supported;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 175-175](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L175-L175)

<a id="d-689fba78a33ac571adcc"></a>
- [ ] **D-689fba78a33ac571adcc** - Bedrock GameTest/Script API adapter where applicable;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 176-176](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L176-L176)

<a id="d-82c2d91b875e172b9b15"></a>
- [ ] **D-82c2d91b875e172b9b15** - native Probe fallback when framework cannot express the scenario;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 177-177](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L177-L177)

<a id="d-c7834cefdb683a7a835c"></a>
- [ ] **D-c7834cefdb683a7a835c** - structure/template fixture management;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 178-178](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L178-L178)

<a id="d-c1d276bf182f2f50746c"></a>
- [ ] **D-c1d276bf182f2f50746c** - setup/teardown;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 179-179](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L179-L179)

<a id="d-18456c98628082deade3"></a>
- [ ] **D-18456c98628082deade3** - time/weather/gamerules;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 180-180](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L180-L180)

<a id="d-c83e370a374a663a918f"></a>
- [ ] **D-c83e370a374a663a918f** - assertions on blocks/entities/inventories/data/components;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 181-181](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L181-L181)

<a id="d-96d3cc8b03c4d81c1f47"></a>
- [ ] **D-96d3cc8b03c4d81c1f47** - timeouts;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 182-182](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L182-L182)

<a id="d-1e94d0bf50e200b41760"></a>
- [ ] **D-1e94d0bf50e200b41760** - repeated/flaky-run mode;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 183-183](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L183-L183)

<a id="d-682878bfda2bb2d2197c"></a>
- [ ] **D-682878bfda2bb2d2197c** - parameterized version/loader/dependency matrix;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 184-184](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L184-L184)

<a id="d-68eb529343ee46147d42"></a>
- [ ] **D-68eb529343ee46147d42** - headless game-test-server lane when valid;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 185-185](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L185-L185)

<a id="d-a42b34f620b487acc011"></a>
- [ ] **D-a42b34f620b487acc011** - real client lane for rendering/UI/input/client state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 186-186](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L186-L186)

<a id="d-bf31078ec853c4164b25"></a>
- [ ] **D-bf31078ec853c4164b25** - generate test source into mod project when requested;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 187-187](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L187-L187)

<a id="d-15f5fdb78ed4801c1941"></a>
- [ ] **D-15f5fdb78ed4801c1941** - ingest existing project GameTests into Enderloom scenario catalog.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 188-188](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L188-L188)

<a id="d-df7de81263142a3a7b08"></a>
- [ ] **D-df7de81263142a3a7b08** - Scenario results must write to the same TestRun / evidence model used by Performance Lab, Compatibility Lab, conversion, repair and release readiness.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 6. Unified GameTest / Scenario Compiler
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 190-190](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L190-L190)

</details>

<details>
<summary>ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md / 11. Performance Patch Acceptance Contract (1)</summary>

<a id="d-0ac4795603cb8c92ae67"></a>
- [ ] **D-0ac4795603cb8c92ae67** - target scenario correctness;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Performance Patch Acceptance Contract
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 288-288](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L288-L288)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.5 Sandbox policy (1)</summary>

<a id="d-a29813110e196f5c71c0"></a>
- [ ] **D-a29813110e196f5c71c0** - Never claim “safe” from static analysis alone; use explainable risk levels and provenance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.5 Sandbox policy
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 102-102](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L102-L102)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 21. Replay / Capture / Showcase Studio (1)</summary>

<a id="d-17225c799c8c7c49e2c6"></a>
- [ ] **D-17225c799c8c7c49e2c6** - exact build/hash/scenario stamped into capture metadata.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. Replay / Capture / Showcase Studio
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 896-896](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L896-L896)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 27. Canary / Staged Update Engine (1)</summary>

<a id="d-3d5ac66d89b8a5065593"></a>
- [ ] **D-3d5ac66d89b8a5065593** - Run targeted regression scenarios.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Canary / Staged Update Engine
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1016-1016](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1016-L1016)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard (1)</summary>

<a id="d-9ecf000b6a3b52903f52"></a>
- [ ] **D-9ecf000b6a3b52903f52** - top startup offenders
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.4 Whole-pack dashboard
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 606-606](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L606-L606)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 22. Scenario DSL — one engine for GUI, CLI, CI, Codex (5)</summary>

<a id="d-78ce8dfd47e3a2ca9601"></a>
- [ ] **D-78ce8dfd47e3a2ca9601** - versioned schema;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 971-971](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L971-L971)

<a id="d-fbaa327176621b5a5476"></a>
- [ ] **D-fbaa327176621b5a5476** - schema migration rules;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 972-972](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L972-L972)

<a id="d-b987935a43b35f398fc4"></a>
- [ ] **D-b987935a43b35f398fc4** - strict validation mode;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 973-973](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L973-L973)

<a id="d-e1b3eaa75f3c0b773770"></a>
- [ ] **D-e1b3eaa75f3c0b773770** - explicit timeout per step;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 974-974](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L974-L974)

<a id="d-8ccb79d377be40626586"></a>
- [ ] **D-8ccb79d377be40626586** - no arbitrary shell execution by default;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 977-977](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L977-L977)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 26. Noise/confidence engine (1)</summary>

<a id="d-4903ab33ade40c0414b4"></a>
- [ ] **D-4903ab33ade40c0414b4** - paired scenario fingerprints;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 26. Noise/confidence engine
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1164-1164](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1164-L1164)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-2 — direct A/B (2)</summary>

<a id="d-619cb4ef72688547ce42"></a>
- [ ] **D-619cb4ef72688547ce42** - startup scenario
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-2 — direct A/B
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1528-1528](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1528-L1528)

<a id="d-cd00b27bbbb006cfd5e8"></a>
- [ ] **D-cd00b27bbbb006cfd5e8** - dedicated-server scenario
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-2 — direct A/B
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1529-1529](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1529-L1529)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-3 — Enderloom Probe (1)</summary>

<a id="d-069dc45b54944666d322"></a>
- [ ] **D-069dc45b54944666d322** - GameTest adapter
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-3 — Enderloom Probe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1540-1540](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1540-L1540)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 39. Definition of done — whole Enderloom vision (1)</summary>

<a id="d-9b6686d32994f405dda1"></a>
- [ ] **D-9b6686d32994f405dda1** - Performance evidence persists by mod SHA-256 and environment/scenario fingerprint.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1611-1611](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1611-L1611)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.16 Version/channel matrix intelligence (1)</summary>

<a id="d-280d38ca2841a7487c6a"></a>
- [ ] **D-280d38ca2841a7487c6a** - Do not hard-code today&#x27;s Bedrock GameTest beta API forever.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.16 Version/channel matrix intelligence
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4667-4667](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4667-L4667) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4667-4667](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4667-L4667)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard (1)</summary>

<a id="d-4267e163f04181ee61b5"></a>
- [ ] **D-4267e163f04181ee61b5** - top startup offenders;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 126-126](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L126-L126)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 11. Enderloom Probe — test-only Minecraft control mod (1)</summary>

<a id="d-c89d00aa40b26b99cdb4"></a>
- [ ] **D-c89d00aa40b26b99cdb4** - GameTest list/run support where appropriate;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 428-428](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L428-L428)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 12. Truthful runtime modes / Virtual-display (1)</summary>

<a id="d-66bbbf59d66ef8020ea8"></a>
- [ ] **D-66bbbf59d66ef8020ea8** - Valid for CI/client behavior/world joining/GameTest.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Truthful runtime modes / Virtual-display
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 450-450](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L450-L450)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 12. Truthful runtime modes / Headless (1)</summary>

<a id="d-39f24aed6afb9dadecd6"></a>
- [ ] **D-39f24aed6afb9dadecd6** - Useful for bootstrap, compatibility, client logic, and selected GameTest workflows.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Truthful runtime modes / Headless
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 455-455](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L455-L455)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 15. Per-mod Performance page (2)</summary>

<a id="d-e70ed7ff0d220649101d"></a>
- [ ] **D-e70ed7ff0d220649101d** - latest scenario/environment;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 537-537](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L537-L537)

<a id="d-2f04f5244b88768b227d"></a>
- [ ] **D-2f04f5244b88768b227d** - scenario;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 546-546](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L546-L546)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 16. Performance history and staleness (1)</summary>

<a id="d-16cf036ac08e5bfdbbcb"></a>
- [ ] **D-16cf036ac08e5bfdbbcb** - Scenario definition change retains old evidence but does not merge it into the new baseline.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Performance history and staleness
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 590-590](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L590-L590)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 20. Scenario DSL for Performance tests (11)</summary>

<a id="d-a04d2b5965ee685b43b1"></a>
- [ ] **D-a04d2b5965ee685b43b1** - Settings.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 698-698](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L698-L698)

<a id="d-877845a4b7bff4178fa9"></a>
- [ ] **D-877845a4b7bff4178fa9** - Warmup.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 699-699](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L699-L699)

<a id="d-96bd0f67323102d25fa3"></a>
- [ ] **D-96bd0f67323102d25fa3** - Wait conditions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 700-700](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L700-L700)

<a id="d-328ecdcc73ee93729ca7"></a>
- [ ] **D-328ecdcc73ee93729ca7** - Lifecycle assertions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 701-701](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L701-L701)

<a id="d-319ee44cca92ec5dede2"></a>
- [ ] **D-319ee44cca92ec5dede2** - Route/input steps.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 703-703](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L703-L703)

<a id="d-eef7aa47ef3bab5b75ae"></a>
- [ ] **D-eef7aa47ef3bab5b75ae** - Measurement windows.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 704-704](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L704-L704)

<a id="d-4e5bedffc75b26cb79f7"></a>
- [ ] **D-4e5bedffc75b26cb79f7** - Metric assertions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 705-705](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L705-L705)

<a id="d-ac55beaa7d8a57a4b5a1"></a>
- [ ] **D-ac55beaa7d8a57a4b5a1** - Timeout.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 706-706](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L706-L706)

<a id="d-1e9d4076710b1e138d60"></a>
- [ ] **D-1e9d4076710b1e138d60** - Clean exit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 708-708](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L708-L708)

<a id="d-8ffc2cbefb1a6ef15b2a"></a>
- [ ] **D-8ffc2cbefb1a6ef15b2a** - No arbitrary shell execution by default.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 709-709](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L709-L709)

<a id="d-bd3a571a4e5ffb0ce174"></a>
- [ ] **D-bd3a571a4e5ffb0ce174** - Explicit opt-in for external hooks.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 710-710](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L710-L710)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 21. AI analysis handoff (1)</summary>

<a id="d-9eb5d16bf3fc9f3730a1"></a>
- [ ] **D-9eb5d16bf3fc9f3730a1** - Include scenario/reproduction steps.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. AI analysis handoff
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 733-733](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L733-L733)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 23. Acceptance tests / Performance (1)</summary>

<a id="d-56bf0e81778a7f1b3ffb"></a>
- [ ] **D-56bf0e81778a7f1b3ffb** - Exact mod SHA-256 and scenario/environment fingerprint are retained.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Performance
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 806-806](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L806-L806)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing (1)</summary>

<a id="d-98f7dc44564c124130f4"></a>
- [ ] **D-98f7dc44564c124130f4** - GameTest support.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 859-859](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L859-L859)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 6 — CLI + AI handoff polish (1)</summary>

<a id="d-6b6801d23c50f4cf091b"></a>
- [ ] **D-6b6801d23c50f4cf091b** - Scenario DSL.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 6 — CLI + AI handoff polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 876-876](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L876-L876)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 25. Focused definition of done (1)</summary>

<a id="d-1682819e5dbd6c7bd25d"></a>
- [ ] **D-1682819e5dbd6c7bd25d** - Per-mod performance history persists by exact mod SHA-256 + environment/scenario fingerprint.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 896-896](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L896-L896)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 7. Bedrock Studio — first-class Bedrock support (1)</summary>

<a id="d-09ecaa337c45cf71c48d"></a>
- [ ] **D-09ecaa337c45cf71c48d** - GameTest-related content.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Bedrock Studio — first-class Bedrock support
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 421-421](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L421-L421)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 37. Enderloom itself must be absurdly fast (1)</summary>

<a id="d-f7db08781c4e0f72e67b"></a>
- [ ] **D-f7db08781c4e0f72e67b** - Benchmark 1k/5k/10k-content synthetic instances and huge catalogs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Enderloom itself must be absurdly fast
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1394-1394](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1394-L1394)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / Runtime modes (1)</summary>

<a id="d-af7dfffc8af7eb3e6bbf"></a>
- [ ] **D-af7dfffc8af7eb3e6bbf** - headless — rendering stubbed/skipped. Useful for client bootstrap, logic, compatibility and GameTest-style checks; invalid for render performance conclusions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Runtime modes
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 330-330](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L330-L330)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / Core commands (1)</summary>

<a id="d-de63454b270a8874890b"></a>
- [ ] **D-de63454b270a8874890b** - scenario-complete
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 356-356](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L356-L356)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / GameTest (5)</summary>

<a id="d-5d93d70bba60df7d1e3c"></a>
- [ ] **D-5d93d70bba60df7d1e3c** - enderloom mc gametest list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / GameTest
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 380-380](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L380-L380)

<a id="d-15e38a626f1ededbb64e"></a>
- [ ] **D-15e38a626f1ededbb64e** - enderloom mc gametest run --all
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / GameTest
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 381-381](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L381-L381)

<a id="d-26dc875e48b885f565a9"></a>
- [ ] **D-26dc875e48b885f565a9** - enderloom mc gametest run --namespace &lt;NS&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / GameTest
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 382-382](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L382-L382)

<a id="d-5b4f7f8ce5d2d18ab9c8"></a>
- [ ] **D-5b4f7f8ce5d2d18ab9c8** - Support modern built-in GameTest where practical.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / GameTest
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 384-384](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L384-L384)

<a id="d-1d05af860e820a8dcacf"></a>
- [ ] **D-1d05af860e820a8dcacf** - Provide Probe-based fallback assertions for versions/loaders where GameTest registration is missing or unreliable.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / GameTest
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 385-385](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L385-L385)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex (8)</summary>

<a id="d-4540ce0836ac9c57c6dc"></a>
- [ ] **D-4540ce0836ac9c57c6dc** - Schema is versioned and migrations are explicit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 431-431](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L431-L431)

<a id="d-bd8b10514d47033b2787"></a>
- [ ] **D-bd8b10514d47033b2787** - Unknown fields fail clearly in strict mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 432-432](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L432-L432)

<a id="d-6e242e0cc4fd3a9578f1"></a>
- [ ] **D-6e242e0cc4fd3a9578f1** - Scenario execution is deterministic where Minecraft allows it.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 433-433](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L433-L433)

<a id="d-dcfcc3a77d7fe0f08a7c"></a>
- [ ] **D-dcfcc3a77d7fe0f08a7c** - Assertions return machine-readable failure reason and observed value.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 435-435](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L435-L435)

<a id="d-84ee7b358c19dc1ef56f"></a>
- [ ] **D-84ee7b358c19dc1ef56f** - Scenario supports environment preconditions and skip reasons.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 436-436](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L436-L436)

<a id="d-b656f7e8c6e443e56b90"></a>
- [ ] **D-b656f7e8c6e443e56b90** - Scenario supports client, integrated-server, dedicated-server and protocol-bot stages.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 437-437](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L437-L437)

<a id="d-dd8c667acf364c54a7b1"></a>
- [ ] **D-dd8c667acf364c54a7b1** - No arbitrary shell execution inside a scenario by default.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 438-438](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L438-L438)

<a id="d-e2c65ca16570538446d3"></a>
- [ ] **D-e2c65ca16570538446d3** - Any optional external-command hook requires explicit user opt-in and is shown in the scenario review/plan.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 439-439](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L439-L439)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 9. Protocol-bot / synthetic-player test lane (1)</summary>

<a id="d-93e89ba5f6ed1ab4c392"></a>
- [ ] **D-93e89ba5f6ed1ab4c392** - Record connection failures, latency, server tick effect and per-bot scenario completion.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Protocol-bot / synthetic-player test lane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 540-540](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L540-L540)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 13. Security and safety requirements (1)</summary>

<a id="d-b94205cdc10dc265513a"></a>
- [ ] **D-b94205cdc10dc265513a** - External scenario hooks never execute arbitrary downloaded commands automatically.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Security and safety requirements
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 754-754](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L754-L754)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Minecraft test control (1)</summary>

<a id="d-5e1e79739b03d6fe97af"></a>
- [ ] **D-5e1e79739b03d6fe97af** - GameTest run
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 793-793](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L793-L793)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-3 — Minecraft Probe/control plane (1)</summary>

<a id="d-8ff281a70bbfbce9527e"></a>
- [ ] **D-8ff281a70bbfbce9527e** - GameTest adapter
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-3 — Minecraft Probe/control plane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 865-865](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L865-L865)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior (3)</summary>

<a id="d-6f0059e8c749deb6d52c"></a>
- [ ] **D-6f0059e8c749deb6d52c** - ask
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 226-226](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L226-L226)

<a id="d-e938031e3bf465b461ed"></a>
- [ ] **D-e938031e3bf465b461ed** - all-supported-project
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 228-228](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L228-L228)

<a id="d-4666e18e1273154ff74c"></a>
- [ ] **D-4666e18e1273154ff74c** - all-supported-global
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 229-229](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L229-L229)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 16. EXECUTE IN THIS ORDER — NO MILESTONE THEATER (1)</summary>

<a id="d-deaa8b363081fc63bcfd"></a>
- [ ] **D-deaa8b363081fc63bcfd** - Add matrix fan-out modes and remembered project/global preferences, including headless behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. EXECUTE IN THIS ORDER — NO MILESTONE THEATER
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md :: NP-10 : 1407-1407](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1407-L1407)

</details>

<a id="test-03-details"></a>
## TEST-03 - Runtime supervision and automation

[Outcome](Checklist.md#test-03) / 120 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 11. Automatic failure feedback loop (1)</summary>

<a id="d-d0041843d55c38bba203"></a>
- [ ] **D-d0041843d55c38bba203** - runtime mode;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Automatic failure feedback loop
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 378-378](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L378-L378)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 23. Definition of done (1)</summary>

<a id="d-b57695ec29853ad8f939"></a>
- [ ] **D-b57695ec29853ad8f939** - It is tested in an isolated Minecraft sandbox using the strongest applicable runtime gates.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Definition of done
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 664-664](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L664-L664)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 0. ASTRA RUN CONTRACT / 0.3 Continuous-run behavior (1)</summary>

<a id="d-459c0ae85d548b14e887"></a>
- [ ] **D-459c0ae85d548b14e887** - Treat compilation as intermediate evidence when runtime behavior changed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. ASTRA RUN CONTRACT / 0.3 Continuous-run behavior
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md : 41-41](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L41-L41)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.2 Truthful behavior (1)</summary>

<a id="d-b4407b76af4524784f46"></a>
- [ ] **D-b4407b76af4524784f46** - Runtime mode: rendered, virtual-display, headless, server, and protocol-bot evidence are never conflated.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.2 Truthful behavior
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: TRUTH-005 : 86-86](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L86-L86)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions (1)</summary>

<a id="d-a0840ea6960a0f07d118"></a>
- [ ] **D-a0840ea6960a0f07d118** - Premium automated Performance/Testing Control Plane.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: DEC-009 : 112-112](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L112-L112)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.2 Minecraft control plane (1)</summary>

<a id="d-2f30a127b91e38bea34f"></a>
- [ ] **D-2f30a127b91e38bea34f** - command/chat, GUI dump-click-assert, input/look/move/interact when supported by the active runtime/Probe.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.2 Minecraft control plane
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PC-011 : 287-287](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L287-L287)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.5 Runtime and metrics (2)</summary>

<a id="d-bd34887f4696bbde2d1f"></a>
- [ ] **D-bd34887f4696bbde2d1f** - runtime modes: rendered / virtual-display / headless / server / protocol-bot with TRUTH-005 enforcement.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.5 Runtime and metrics
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-040 : 368-368](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L368-L368)

<a id="d-bf1a136a33abbb7afdc2"></a>
- [ ] **D-bf1a136a33abbb7afdc2** - Startup: process/loader/title/world-ready/class-loading measurements.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.5 Runtime and metrics
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-041 : 369-369](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L369-L369)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 13. PHASE J — AUTHORIZED SERVER / SPELLBROOK-CLASS -&gt; NATIVE MOD / 13.1 Lawful intake and ecosystem inventory (1)</summary>

<a id="d-02c4d9406d715298dc6f"></a>
- [ ] **D-02c4d9406d715298dc6f** - accept user-supplied archives, legitimately delivered resource packs, screenshots/video/runtime observations, author-supplied models and plugin/custom-content configs without bypas...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** accept user-supplied archives, legitimately delivered resource packs, screenshots/video/runtime observations, author-supplied models and plugin/custom-content configs without bypassing protected access.
  - **Binding context:** 13. PHASE J — AUTHORIZED SERVER / SPELLBROOK-CLASS -&gt; NATIVE MOD / 13.1 Lawful intake and ecosystem inventory
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PJ-001 : 500-500](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L500-L500)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 22. FINAL CROSS-CUTTING RELEASE GATE (1)</summary>

<a id="d-ef6e1b01227fd2ddedbf"></a>
- [ ] **D-ef6e1b01227fd2ddedbf** - actual built product exercised; strongest applicable Minecraft runtime evidence retained.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. FINAL CROSS-CUTTING RELEASE GATE
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: REL-006 : 682-682](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L682-L682)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5A. Second-sweep integration expansion - revision 2 / 5A.8 Executable additions for Codex / D. World safety, proof and delivery (1)</summary>

<a id="d-ef6044d2ed6978a4df9c"></a>
- [ ] **D-ef6044d2ed6978a4df9c** - extension: the final completion gate below also covers 5A&#x27;s selected integration modes and T079-T115. N12/N30 may remain deliberately non-ingested for their documented rights ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** extension: the final completion gate below also covers 5A&#x27;s selected integration modes and T079-T115. N12/N30 may remain deliberately non-ingested for their documented rights boundary without preventing lawful alternatives from delivering the required capability. No uncertain research lead, unimplemented production path, or missing required runtime test may be silently relabelled complete.
  - **Binding context:** 5A. Second-sweep integration expansion - revision 2 / 5A.8 Executable additions for Codex / D. World safety, proof and delivery
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md : 714-714](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L714-L714)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5B. Production completion hardening - revision 3 / 5B.5 Parity and real runtime certification (1)</summary>

<a id="d-b4b68aa2a0b062b84efb"></a>
- [ ] **D-b4b68aa2a0b062b84efb** - Visual proof uses deterministic native captures of real project assets at the required views/time points; generated showcase images are not evidence. Bedrock behavior requires an a...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Visual proof uses deterministic native captures of real project assets at the required views/time points; generated showcase images are not evidence. Bedrock behavior requires an appropriate real supported runtime; a Java server does not prove it. Missing required runtime capability stays pending with a provisioning/recovery action, not a pass or dropped requirement. Use the cheapest decisive tests during iteration and broader runtime gates at coherent checkpoints, rerunning only invalidated proof.
  - **Binding context:** 5B. Production completion hardening - revision 3 / 5B.5 Parity and real runtime certification / 5B. Production requirements / 5B.5 Parity and real runtime certification
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md : 759-759](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L759-L759) / [ENDERLOOM_STUDIO_EXECUTION.md : 920-920](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L920-L920)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5B. Production completion hardening - revision 3 / 5B.7 Measured excellence and release proof (2)</summary>

<a id="d-ec651bce0a51f5c585b4"></a>
- [ ] **D-ec651bce0a51f5c585b4** - Preserve a recoverable baseline at the real starting revision, full fixture manifest, configuration and hardware/runtime identity. Compare identical work and required output/proof:...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Preserve a recoverable baseline at the real starting revision, full fixture manifest, configuration and hardware/runtime identity. Compare identical work and required output/proof: first useful result, full completion, mapping/transformation throughput, cold/warm setup, memory, UI responsiveness, recovery and manual interventions. Use multiple repetitions, report sample size and spread, and set a variance-aware material-gain threshold before accepting results. This document asserts no invented universal speedup percentage.
  - **Binding context:** 5B. Production completion hardening - revision 3 / 5B.7 Measured excellence and release proof / 5B. Production requirements / 5B.7 Measured excellence and release proof
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md : 771-771](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L771-L771) / [ENDERLOOM_STUDIO_EXECUTION.md : 932-932](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L932-L932)

<a id="d-635957e7416f88b74cf2"></a>
- [ ] **D-635957e7416f88b74cf2** - Deliver source checkpoint, usable current Enderloom package, redistributable converted fixture artifacts, tool/dependency locks with licenses/notices, manifests/hashes, runtime/ben...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Deliver source checkpoint, usable current Enderloom package, redistributable converted fixture artifacts, tool/dependency locks with licenses/notices, manifests/hashes, runtime/benchmark proof and exact continuation state. Keep private permissions/assets out of public bundles. Publish deliverables/checkpoint to the existing authorized Drive project folder and appropriate repository/release destination; verify bytes, not just acknowledgement. Never publish an untested candidate as certified. When acceptance remains incomplete, preserve/deliver a truthful in-progress candidate and continue feasible work; leave G009 unchecked.
  - **Binding context:** 5B. Production completion hardening - revision 3 / 5B.7 Measured excellence and release proof / 5B. Production requirements / 5B.7 Measured excellence and release proof
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md : 777-777](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L777-L777) / [ENDERLOOM_STUDIO_EXECUTION.md : 938-938](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L938-L938)

</details>

<details>
<summary>ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md / 2. Current High-Value Minecraft Diagnostic Integrations / 2.8 Crash/runtime diagnostic enrichers (1)</summary>

<a id="d-6b03e5e1e74a339bcf5b"></a>
- [ ] **D-6b03e5e1e74a339bcf5b** - These tools provide evidence/context. Their presence is never proof that they are the culprit, and suppression/recovery behavior cannot substitute for fixing and retesting the unde...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** These tools provide evidence/context. Their presence is never proof that they are the culprit, and suppression/recovery behavior cannot substitute for fixing and retesting the underlying failure.
  - **Binding context:** 2. Current High-Value Minecraft Diagnostic Integrations / 2.8 Crash/runtime diagnostic enrichers
  - **Original specification:** [ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md : 229-229](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md#L229-L229)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.1 Local static artifact scanner (1)</summary>

<a id="d-2accf48fed9aa8be3a46"></a>
- [ ] **D-2accf48fed9aa8be3a46** - Detect process execution / shell / Runtime / ProcessBuilder capability.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.1 Local static artifact scanner
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 53-53](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L53-L53)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 15. Legacy Archaeology / Truly Broad Version Support / 15.1 Java runtime matrix (1)</summary>

<a id="d-77e2ceaa412bf030539d"></a>
- [ ] **D-77e2ceaa412bf030539d** - per-version JVM flags/runtime discovery.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Legacy Archaeology / Truly Broad Version Support / 15.1 Java runtime matrix
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 757-757](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L757-L757)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 31. Cross-integration requirements for these newly added domains (1)</summary>

<a id="d-664baebde446f9cdb626"></a>
- [ ] **D-664baebde446f9cdb626** - Hot reload/relaunch uses the same runtime supervisor/Probe and truthfully records mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 31. Cross-integration requirements for these newly added domains
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1118-1118](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1118-L1118)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof (1)</summary>

<a id="d-137348411fc4a10d5471"></a>
- [ ] **D-137348411fc4a10d5471** - GATE — Whole queue convergence and runtime proof
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: G008 : 1039-1039](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L1039-L1039)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof / T021 — State/restart regression pass (1)</summary>

<a id="d-fca41c33fb0cfb2d8a42"></a>
- [ ] **D-fca41c33fb0cfb2d8a42** - · State/restart regression pass
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof / T021 — State/restart regression pass
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T021 : 1049-1049](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L1049-L1049)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 2. Product principles — non-negotiable / 2.6 User-controlled automation (1)</summary>

<a id="d-2158dd4353233a99636a"></a>
- [ ] **D-2158dd4353233a99636a** - No hidden watchdog repeatedly patching or testing mods.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Product principles — non-negotiable / 2.6 User-controlled automation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 99-99](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L99-L99)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 11. Logs, diagnostics, storage, system visibility / Logs (1)</summary>

<a id="d-ed123b8ab74f70af9adc"></a>
- [ ] **D-ed123b8ab74f70af9adc** - Runtime log levels.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Logs, diagnostics, storage, system visibility / Logs
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 475-475](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L475-L475)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 20. Enderloom Probe — Minecraft test control plane (1)</summary>

<a id="d-cc76930c96227db56999"></a>
- [ ] **D-cc76930c96227db56999** - screenshot of actual runtime
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Enderloom Probe — Minecraft test control plane
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 875-875](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L875-L875)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 21. Truthful runtime modes / `rendered` (1)</summary>

<a id="d-818de616a67ade44daec"></a>
- [ ] **D-818de616a67ade44daec** - Real rendered client. Required for trustworthy:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 21. Truthful runtime modes / `rendered`
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 895-895](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L895-L895)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 21. Truthful runtime modes / `headless` (1)</summary>

<a id="d-156cc6b1649b80925e18"></a>
- [ ] **D-156cc6b1649b80925e18** - Never use it to claim real render performance.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 21. Truthful runtime modes / `headless`
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 928-928](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L928-L928)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 21. Truthful runtime modes / `protocol-bot` (1)</summary>

<a id="d-3f41fb10cd9e5ae1b34b"></a>
- [ ] **D-3f41fb10cd9e5ae1b34b** - Never substitute it for the user&#x27;s actual modded rendered client.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 21. Truthful runtime modes / `protocol-bot`
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 945-945](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L945-L945)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-2 — direct A/B (1)</summary>

<a id="d-9fa6b0e9886258766366"></a>
- [ ] **D-9fa6b0e9886258766366** - with/without variant runner
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-2 — direct A/B
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1527-1527](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1527-L1527)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 39. Definition of done — whole Enderloom vision (1)</summary>

<a id="d-e622a3e07db1e45dc13d"></a>
- [ ] **D-e622a3e07db1e45dc13d** - Static scans never invent runtime metrics.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1608-1608](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1608-L1608)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 8. VERIFY REAL MODS, BUT KEEP THE VERIFICATION INVISIBLE TO THE USER (1)</summary>

<a id="d-bd5a6e681ba368152b4b"></a>
- [ ] **D-bd5a6e681ba368152b4b** - If the environment cannot run the strongest applicable runtime lane, do not pretend it passed. Continue everything that can be completed, preserve the artifact, and report that spe...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** If the environment cannot run the strongest applicable runtime lane, do not pretend it passed. Continue everything that can be completed, preserve the artifact, and report that specific verification as unavailable rather than stalling the whole job.
  - **Binding context:** 8. VERIFY REAL MODS, BUT KEEP THE VERIFICATION INVISIBLE TO THE USER
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 424-424](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L424-L424) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 424-424](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L424-L424)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES (1)</summary>

<a id="d-951f438e4735ecffbe88"></a>
- [ ] **D-951f438e4735ecffbe88** - A build/runtime/performance failure causes automatic diagnosis and a changed retry strategy rather than an idle blocker.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2225-2225](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2225-L2225) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2225-2225](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2225-L2225)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / HeadlessMC path (1)</summary>

<a id="d-0c0e5693fc61a1494fcd"></a>
- [ ] **D-0c0e5693fc61a1494fcd** - - provision the requested Minecraft version; - select Forge/NeoForge/Fabric/vanilla as appropriate; - mount the exact candidate mod set; - use cached assets/runtime files; - choose...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - provision the requested Minecraft version; - select Forge/NeoForge/Fabric/vanilla as appropriate; - mount the exact candidate mod set; - use cached assets/runtime files; - choose no-display/headless/Xvfb mode based on the required proof; - join the generated QA world; - execute tests; - return a meaningful process exit status; - preserve the exact runtime/log/evidence identity.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / HeadlessMC path
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4137-4145](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4137-L4145) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4137-4145](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4137-L4145)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.8 Typed API for UI, Codex, and automation (1)</summary>

<a id="d-6c18b637d49846db0e52"></a>
- [ ] **D-6c18b637d49846db0e52** - Do not make Codex scrape a 200 MB raw log just to learn that one mob failed to retain its target after reload.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.8 Typed API for UI, Codex, and automation
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4377-4377](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4377-L4377) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4377-4377](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4377-L4377)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.17 Test-run safety (1)</summary>

<a id="d-0f2f3eebe2e64a4a050d"></a>
- [ ] **D-0f2f3eebe2e64a4a050d** - Automated runtime testing must be aggressive about tests and conservative about user data.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.17 Test-run safety
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4671-4671](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4671-L4671) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4671-4671](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4671-L4671)

</details>

<details>
<summary>ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md / 7. Maximum-Speed Execution Without Quality Loss / 7.3 Persistent runtime supervisor (1)</summary>

<a id="d-470c961319d0eb393668"></a>
- [ ] **D-470c961319d0eb393668** - - keep dedicated test server alive across independent client-side edits; - use resource/datapack reload when sufficient; - use hot swap only for changes the runtime actually suppor...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - keep dedicated test server alive across independent client-side edits; - use resource/datapack reload when sufficient; - use hot swap only for changes the runtime actually supports; - fast prepared restart when structural registries/classes require it; - preserve exact process/run identity; - never mistake shell timeout for Minecraft hang.
  - **Binding context:** 7. Maximum-Speed Execution Without Quality Loss / 7.3 Persistent runtime supervisor
  - **Original specification:** [ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md : 433-438](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md#L433-L438)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard (1)</summary>

<a id="d-ce5b8342ee87c0464c79"></a>
- [ ] **D-ce5b8342ee87c0464c79** - top client/render offenders;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 127-127](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L127-L127)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 4. Performance verdicts — no fake precision (1)</summary>

<a id="d-e51d30df2da8d7850679"></a>
- [ ] **D-e51d30df2da8d7850679** - Measured requires direct traceable runtime evidence.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Performance verdicts — no fake precision
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 169-169](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L169-L169)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 6. Quick Scan — out-of-game static mod analysis (2)</summary>

<a id="d-44677943256a70d0a59b"></a>
- [ ] **D-44677943256a70d0a59b** - Quick Scan must be fast and must not pretend static analysis equals measured runtime performance.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 6. Quick Scan — out-of-game static mod analysis
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 254-254](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L254-L254)

<a id="d-e1d17396768926f786b5"></a>
- [ ] **D-e1d17396768926f786b5** - needs runtime confirmation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Quick Scan — out-of-game static mod analysis
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 292-292](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L292-L292)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 11. Enderloom Probe — test-only Minecraft control mod (1)</summary>

<a id="d-ea91dc68a7644888fcd5"></a>
- [ ] **D-ea91dc68a7644888fcd5** - actual runtime screenshot capture;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Enderloom Probe — test-only Minecraft control mod
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 429-429](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L429-L429)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 12. Truthful runtime modes / Rendered (1)</summary>

<a id="d-679b6cc15f9e0958aab6"></a>
- [ ] **D-679b6cc15f9e0958aab6** - Real rendered client.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Truthful runtime modes / Rendered
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 444-444](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L444-L444)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 12. Truthful runtime modes / Virtual-display (1)</summary>

<a id="d-6d34015e7f9c551a36c3"></a>
- [ ] **D-6d34015e7f9c551a36c3** - Real client under virtual/hidden display where supported.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Truthful runtime modes / Virtual-display
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 449-449](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L449-L449)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 12. Truthful runtime modes / Headless (1)</summary>

<a id="d-a2fdf15ec1779142cd5b"></a>
- [ ] **D-a2fdf15ec1779142cd5b** - Never claim real FPS/GPU impact from headless mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Truthful runtime modes / Headless
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 456-456](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L456-L456)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 20. Scenario DSL for Performance tests (1)</summary>

<a id="d-4cac217a9467f1f5e2ef"></a>
- [ ] **D-4cac217a9467f1f5e2ef** - Runtime mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 695-695](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L695-L695)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 22. Performance research/reference ideas already discussed (1)</summary>

<a id="d-e9f03ae3d2c41e5a5fdc"></a>
- [ ] **D-e9f03ae3d2c41e5a5fdc** - Ferium — automation-friendly mod CLI precedent.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Performance research/reference ideas already discussed
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 770-770](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L770-L770)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing (1)</summary>

<a id="d-2a06fe326c2f6a3d7920"></a>
- [ ] **D-2a06fe326c2f6a3d7920** - Input/GUI control where feasible.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 4 — Minecraft Probe + rendered testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 858-858](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L858-L858)

</details>

<details>
<summary>ENDERLOOM_STUDIO_EXECUTION.md / 0. Codex launch contract - implement, verify, finish / 0.7 Build a beautiful, approachable Enderloom Studio / Primary workflow: Convert to Version (1)</summary>

<a id="d-a305e7253d10140cdaf7"></a>
- [ ] **D-a305e7253d10140cdaf7** - Show simple stage labels such as Preparing, Converting, Building, Testing and Fixing an issue. Progress is backed by real events. The final view offers Play Test, Install to Instan...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Show simple stage labels such as Preparing, Converting, Building, Testing and Fixing an issue. Progress is backed by real events. The final view offers Play Test, Install to Instance, Open Output, and View Changes, plus per-target verification status. Unknown content, unavailable dependencies and failed tests remain visible and actionable, never green with fine print. Cross-edition outputs distinguish code/behavior/assets; compatibility-runtime mode never masquerades as a native port.
  - **Binding context:** 0. Codex launch contract - implement, verify, finish / 0.7 Build a beautiful, approachable Enderloom Studio / Primary workflow: Convert to Version
  - **Original specification:** [ENDERLOOM_STUDIO_EXECUTION.md : 172-172](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L172-L172)

</details>

<details>
<summary>ENDERLOOM_STUDIO_EXECUTION.md / 0. Codex launch contract - implement, verify, finish / 0.9 Immediate product implementation tasks (1)</summary>

<a id="d-50ffd0da866dcca12e19"></a>
- [ ] **D-50ffd0da866dcca12e19** - - Finish native Play Test/Test Lab for exact target packages and persistent proof, with isolated worlds and real scenario controls. Distinguish editor previews from native runtime ...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** - Finish native Play Test/Test Lab for exact target packages and persistent proof, with isolated worlds and real scenario controls. Distinguish editor previews from native runtime results.
  - **Binding context:** 0. Codex launch contract - implement, verify, finish / 0.9 Immediate product implementation tasks
  - **Original specification:** [ENDERLOOM_STUDIO_EXECUTION.md :: T151 : 265-265](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L265-L265)

</details>

<details>
<summary>ENDERLOOM_STUDIO_EXECUTION.md / 5A. Specialized engines and integration tasks / 5A.8 Specialized integration implementation / D. World safety, proof and delivery (1)</summary>

<a id="d-18d28be3aa0b3c09ef79"></a>
- [ ] **D-18d28be3aa0b3c09ef79** - Acceptance: G009 covers 5A&#x27;s selected integration modes and T079-T115. N12/N30 may remain deliberately non-ingested for their documented rights boundary without preventing law...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Acceptance: G009 covers 5A&#x27;s selected integration modes and T079-T115. N12/N30 may remain deliberately non-ingested for their documented rights boundary without preventing lawful alternatives from delivering the required capability. No uncertain research lead, unimplemented production path, or missing required runtime test may be silently relabelled complete.
  - **Binding context:** 5A. Specialized engines and integration tasks / 5A.8 Specialized integration implementation / D. World safety, proof and delivery
  - **Original specification:** [ENDERLOOM_STUDIO_EXECUTION.md : 876-876](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L876-L876)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 5. Right-click / Power Context Menu — obsessive QOL / 5.4 `Files &amp; Configs` submenu (1)</summary>

<a id="d-481e596c78b5d812b378"></a>
- [ ] **D-481e596c78b5d812b378** - Generated runtime files.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.4 `Files &amp; Configs` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 318-318](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L318-L318)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 16. Premium Performance Lab — evidence everywhere (1)</summary>

<a id="d-29d0b4457350e70ab272"></a>
- [ ] **D-29d0b4457350e70ab272** - No runtime number is shown as measured from static analysis only.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Premium Performance Lab — evidence everywhere
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 749-749](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L749-L749)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 17. Enderloom Probe / Runtime Automation (15)</summary>

<a id="d-031a3135d16d7815325a"></a>
- [ ] **D-031a3135d16d7815325a** - lifecycle markers;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 757-757](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L757-L757)

<a id="d-a74e8d8036f92267bcd9"></a>
- [ ] **D-a74e8d8036f92267bcd9** - title ready;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 758-758](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L758-L758)

<a id="d-cfbbe0701a486149166d"></a>
- [ ] **D-cfbbe0701a486149166d** - chunk-ready;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 760-760](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L760-L760)

<a id="d-9df4b06cce4b61301844"></a>
- [ ] **D-9df4b06cce4b61301844** - GUI dump/assert/click;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 763-763](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L763-L763)

<a id="d-a37c0ffa855468f8a0e8"></a>
- [ ] **D-a37c0ffa855468f8a0e8** - input/key/mouse;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 764-764](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L764-L764)

<a id="d-95b5b70e545f1dacdfc0"></a>
- [ ] **D-95b5b70e545f1dacdfc0** - camera/look;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 765-765](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L765-L765)

<a id="d-3ad82e7572c4bf69b8c2"></a>
- [ ] **D-3ad82e7572c4bf69b8c2** - scripted movement;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 766-766](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L766-L766)

<a id="d-0caa9d4328e43e3a0434"></a>
- [ ] **D-0caa9d4328e43e3a0434** - interaction;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 767-767](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L767-L767)

<a id="d-f1ef5b16da796d4d0794"></a>
- [ ] **D-f1ef5b16da796d4d0794** - inventory assertions;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 768-768](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L768-L768)

<a id="d-37e3ef6e7652c622afe9"></a>
- [ ] **D-37e3ef6e7652c622afe9** - entity/block assertions;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 769-769](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L769-L769)

<a id="d-72a93dc4873da1351a84"></a>
- [ ] **D-72a93dc4873da1351a84** - screenshot capture;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 770-770](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L770-L770)

<a id="d-bd0c26bd88f57ca0462d"></a>
- [ ] **D-bd0c26bd88f57ca0462d** - telemetry stream;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 771-771](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L771-L771)

<a id="d-c4f3473823b00d53ba58"></a>
- [ ] **D-c4f3473823b00d53ba58** - GameTest integration;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 773-773](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L773-L773)

<a id="d-5f260d83a95734946554"></a>
- [ ] **D-5f260d83a95734946554** - clean auto-exit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 774-774](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L774-L774)

<a id="d-533a1eee4b43a69f7e36"></a>
- [ ] **D-533a1eee4b43a69f7e36** - Never use headless mode to claim real render/FPS results.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. Enderloom Probe / Runtime Automation
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 784-784](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L784-L784)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 41. Verification contract (1)</summary>

<a id="d-3a16dbff4bf1457c79fe"></a>
- [ ] **D-3a16dbff4bf1457c79fe** - runtime behavior checks;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1537-1537](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1537-L1537)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / Enderloom Premium Testing — Full CLI + Minecraft Automation Checklist / North-star requirement (1)</summary>

<a id="d-da72756fa7335ca11ccb"></a>
- [ ] **D-da72756fa7335ca11ccb** - For Performance Lab specifically, a user, CI runner, Codex agent, or another local tool must be able to install/prepare Minecraft, create an isolated test sandbox, launch a real cl...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** For Performance Lab specifically, a user, CI runner, Codex agent, or another local tool must be able to install/prepare Minecraft, create an isolated test sandbox, launch a real client or server, wait for deterministic lifecycle states, control the test runtime, capture profiler evidence, assert outcomes, compare A/B runs, export artifacts, and terminate/clean up without clicking the GUI.
  - **Binding context:** Enderloom Premium Testing — Full CLI + Minecraft Automation Checklist / North-star requirement
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 15-15](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L15-L15)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / Runtime modes (1)</summary>

<a id="d-03ea8b12c1db6206456a"></a>
- [ ] **D-03ea8b12c1db6206456a** - server — dedicated nogui server runtime.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Runtime modes
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 331-331](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L331-L331)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / Core commands (11)</summary>

<a id="d-5cfe7af21ff8500d7221"></a>
- [ ] **D-5cfe7af21ff8500d7221** - enderloom mc attach --run &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 338-338](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L338-L338)

<a id="d-92fe2eb40c0dc7269798"></a>
- [ ] **D-92fe2eb40c0dc7269798** - enderloom mc wait --run &lt;ID&gt; --state &lt;STATE&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 339-339](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L339-L339)

<a id="d-c805d125e0d384b33b3a"></a>
- [ ] **D-c805d125e0d384b33b3a** - enderloom mc wait --run &lt;ID&gt; --log-regex &lt;REGEX&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 340-340](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L340-L340)

<a id="d-4b7477205c013fa4e490"></a>
- [ ] **D-4b7477205c013fa4e490** - enderloom mc exit --run &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 341-341](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L341-L341)

<a id="d-ab9104fac042421c3b04"></a>
- [ ] **D-ab9104fac042421c3b04** - enderloom mc kill --run &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 342-342](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L342-L342)

<a id="d-53761ca2d93b699729b6"></a>
- [ ] **D-53761ca2d93b699729b6** - JVM-started
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 347-347](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L347-L347)

<a id="d-cc64ee4f8db57b216299"></a>
- [ ] **D-cc64ee4f8db57b216299** - mods-initialized
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 349-349](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L349-L349)

<a id="d-3eb77f86d6391067644c"></a>
- [ ] **D-3eb77f86d6391067644c** - title-ready
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 350-350](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L350-L350)

<a id="d-ff16d0b3afff70b3728d"></a>
- [ ] **D-ff16d0b3afff70b3728d** - player-ready
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 352-352](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L352-L352)

<a id="d-2ab072f62a1c485cc285"></a>
- [ ] **D-2ab072f62a1c485cc285** - chunks-ready / benchmark-region-ready
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 353-353](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L353-L353)

<a id="d-fac40e0a516a3fb27b72"></a>
- [ ] **D-fac40e0a516a3fb27b72** - exited
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 357-357](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L357-L357)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe (12)</summary>

<a id="d-d472d0dfd5c30e80ac01"></a>
- [ ] **D-d472d0dfd5c30e80ac01** - enderloom mc chat --run &lt;ID&gt; &lt;TEXT&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 364-364](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L364-L364)

<a id="d-785a91cf4923f6486a02"></a>
- [ ] **D-785a91cf4923f6486a02** - enderloom mc gui dump --run &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 365-365](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L365-L365)

<a id="d-f9454f03c985764c03b5"></a>
- [ ] **D-f9454f03c985764c03b5** - enderloom mc gui click --run &lt;ID&gt; ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 366-366](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L366-L366)

<a id="d-b20a0c1931279b5844db"></a>
- [ ] **D-b20a0c1931279b5844db** - enderloom mc gui assert --run &lt;ID&gt; ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 367-367](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L367-L367)

<a id="d-2e25acd1b2c8851b5a42"></a>
- [ ] **D-2e25acd1b2c8851b5a42** - enderloom mc input key --run &lt;ID&gt; ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 368-368](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L368-L368)

<a id="d-0251d82e97f61ef91566"></a>
- [ ] **D-0251d82e97f61ef91566** - enderloom mc input mouse --run &lt;ID&gt; ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 369-369](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L369-L369)

<a id="d-50656b2bf0a8c9a1e135"></a>
- [ ] **D-50656b2bf0a8c9a1e135** - enderloom mc look --run &lt;ID&gt; --yaw ... --pitch ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 370-370](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L370-L370)

<a id="d-f9271b529c85c8beb69a"></a>
- [ ] **D-f9271b529c85c8beb69a** - enderloom mc move --run &lt;ID&gt; ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 371-371](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L371-L371)

<a id="d-b76b1541e1b3907eb380"></a>
- [ ] **D-b76b1541e1b3907eb380** - enderloom mc interact --run &lt;ID&gt; ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 372-372](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L372-L372)

<a id="d-cbd0213e6a4587f7932f"></a>
- [ ] **D-cbd0213e6a4587f7932f** - enderloom mc screenshot --run &lt;ID&gt; --out &lt;PATH&gt; captures actual runtime output only.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 373-373](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L373-L373)

<a id="d-31a967d47fd06b29d52f"></a>
- [ ] **D-31a967d47fd06b29d52f** - enderloom mc telemetry --run &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 374-374](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L374-L374)

<a id="d-f15cabaef2bf498abc08"></a>
- [ ] **D-f15cabaef2bf498abc08** - Probe is injected into isolated test sandboxes by default and never silently remains in the live profile.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / In-game command/control through Enderloom Probe
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 376-376](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L376-L376)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 9. Protocol-bot / synthetic-player test lane (1)</summary>

<a id="d-39184ef1aa376abb6206"></a>
- [ ] **D-39184ef1aa376abb6206** - This lane is useful for server load, networking, command workflows and player-count behavior. It must never be labeled as a rendered mod-client benchmark.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 9. Protocol-bot / synthetic-player test lane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 532-532](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L532-L532)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 17. Definition of done (1)</summary>

<a id="d-a43eddfcfbef2d4f6595"></a>
- [ ] **D-a43eddfcfbef2d4f6595** - Real rendered-client benchmarks remain distinct from headless/virtual/protocol tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Definition of done
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 927-927](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L927-L927)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Statistical comparison (1)</summary>

<a id="d-60c13f0b6800a25d0ad2"></a>
- [ ] **D-60c13f0b6800a25d0ad2** - A/B comparison must control noise.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Statistical comparison
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 333-333](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L333-L333)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 9. Packaged JVM linkage — validate what ships, not what compiled (1)</summary>

<a id="d-143a5666a8f86d3ede82"></a>
- [ ] **D-143a5666a8f86d3ede82** - Do not promote a cell to Passed from this gate alone. It is the final cheap structural gate before the real runtime.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 9. Packaged JVM linkage — validate what ships, not what compiled
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 452-452](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L452-L452) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 478-478](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L478-L478) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 554-554](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L554-L554) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 554-554](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L554-L554)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 12. Testing engine — headless first, native when it matters / Lane 3 — native client (1)</summary>

<a id="d-39dc7b697568f247703c"></a>
- [ ] **D-39dc7b697568f247703c** - Required for renderer/models/textures/animations/sound/input/screens/client lifecycle and retained client Mixins.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 12. Testing engine — headless first, native when it matters / Lane 3 — native client
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 581-581](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L581-L581) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 607-607](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L607-L607) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 683-683](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L683-L683) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 683-683](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L683-L683)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 19. CLI / automation contract (1)</summary>

<a id="d-ac714d5313a3c4d07413"></a>
- [ ] **D-ac714d5313a3c4d07413** - For automation, unresolved interactive ask must deterministically become target-only unless an explicit noninteractive policy says otherwise.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 19. CLI / automation contract
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 874-874](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L874-L874) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 900-900](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L900-L900) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 976-976](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L976-L976) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 976-976](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L976-L976)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 21. Apex conversion receipt (1)</summary>

<a id="d-41482758a31b843c4634"></a>
- [ ] **D-41482758a31b843c4634** - A report must never say Passed if the strongest required runtime lane was skipped.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 21. Apex conversion receipt
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 937-937](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L937-L937) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 963-963](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L963-L963) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 1039-1039](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L1039-L1039) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 1039-1039](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L1039-L1039)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof (1)</summary>

<a id="d-8ce5009929bd0dd34083"></a>
- [ ] **D-8ce5009929bd0dd34083** - Exact target class index is content-identified and runtime-selected.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 1129-1129](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L1129-L1129) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 1164-1164](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L1164-L1164)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Runtime and artifacts (2)</summary>

<a id="d-f602df9bf4aca0829de1"></a>
- [ ] **D-f602df9bf4aca0829de1** - Strongest required runtime lane is selected automatically.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Runtime and artifacts
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 1158-1158](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L1158-L1158) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 1197-1197](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L1197-L1197)

<a id="d-03a0f855b9b9a4e0d628"></a>
- [ ] **D-03a0f855b9b9a4e0d628** - Built - runtime unverified cannot become Passed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Runtime and artifacts
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 1159-1159](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L1159-L1159) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 1198-1198](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L1198-L1198)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof (1)</summary>

<a id="d-22e3f5bf26cf816a1090"></a>
- [ ] **D-22e3f5bf26cf816a1090** - · Exact target class index is content-identified and runtime-selected.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md :: T008 : 1257-1257](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L1257-L1257) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md :: T008 : 1257-1257](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L1257-L1257)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Runtime and artifacts (2)</summary>

<a id="d-31c36e85d78dc8c23980"></a>
- [ ] **D-31c36e85d78dc8c23980** - · Strongest required runtime lane is selected automatically.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Runtime and artifacts
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md :: T035 : 1290-1290](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L1290-L1290) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md :: T035 : 1290-1290](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L1290-L1290)

<a id="d-273513fcd27615bdf73e"></a>
- [ ] **D-273513fcd27615bdf73e** - · Built - runtime unverified cannot become Passed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Runtime and artifacts
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md :: T036 : 1291-1291](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L1291-L1291) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md :: T036 : 1291-1291](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L1291-L1291)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md / 13. DEFINITION OF DONE — DO NOT STOP BEFORE THIS (1)</summary>

<a id="d-eb17f1bff84d84f524a8"></a>
- [ ] **D-eb17f1bff84d84f524a8** - Headless/automation flow is noninteractive and deterministic.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. DEFINITION OF DONE — DO NOT STOP BEFORE THIS
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md : 507-507](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md#L507-L507)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 9. RUNTIME / PARITY GATES PER MOD AND PER MATRIX CELL / Restart/persistence (1)</summary>

<a id="d-0aae95391acf85d23926"></a>
- [ ] **D-0aae95391acf85d23926** - A cell cannot be Passed when its strongest required runtime gate was skipped. Use a truthful Built - runtime unverified state.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 9. RUNTIME / PARITY GATES PER MOD AND PER MATRIX CELL / Restart/persistence
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 685-685](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L685-L685) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1089-1089](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1089-L1089)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release (2)</summary>

<a id="d-1562b33e043ed664f337"></a>
- [ ] **D-1562b33e043ed664f337** - restart/persistence used when required.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 952-952](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L952-L952) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1356-1356](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1356-L1356)

<a id="d-1e6c4dbc91ada37286d6"></a>
- [ ] **D-1e6c4dbc91ada37286d6** - fresh runnable Enderloom build/package produced after implementation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 957-957](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L957-L957) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1361-1361](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1361-L1361)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-05 — Implement the primary-target-first executor (1)</summary>

<a id="d-498a8c0d817e80bbff6e"></a>
- [ ] **D-498a8c0d817e80bbff6e** - Hard-block fan-out until the primary target is certified or explicitly runtime/performance-unverified under the rules below.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-05 — Implement the primary-target-first executor
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 143-143](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L143-L143)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-14 — Implement the Northpoint UI as a truthful control surface (2)</summary>

<a id="d-8b48ac0ffe4b09b4aebe"></a>
- [ ] **D-8b48ac0ffe4b09b4aebe** - Show only backend-derived support/build/parity/runtime/performance state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-14 — Implement the Northpoint UI as a truthful control surface
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 300-300](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L300-L300)

<a id="d-38c68594793df9c9681a"></a>
- [ ] **D-38c68594793df9c9681a** - Show project summary badges for CONTENT/PARITY, RUNTIME, PERFORMANCE and MATRIX.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-14 — Implement the Northpoint UI as a truthful control surface
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 302-302](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L302-L302)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass (9)</summary>

<a id="d-c1c46b3b66dcafb3e66c"></a>
- [ ] **D-c1c46b3b66dcafb3e66c** - content/lineage omission;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 364-364](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L364-L364)

<a id="d-1894683377ab6ca883d9"></a>
- [ ] **D-1894683377ab6ca883d9** - optional dependency absent;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 365-365](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L365-L365)

<a id="d-28740dff58786ea00d78"></a>
- [ ] **D-28740dff58786ea00d78** - dependency/API drift;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 366-366](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L366-L366)

<a id="d-44d9ab08a171fe2841a4"></a>
- [ ] **D-44d9ab08a171fe2841a4** - Mixin/production linkage;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 367-367](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L367-L367)

<a id="d-5181f0bb1bb62f09f05b"></a>
- [ ] **D-5181f0bb1bb62f09f05b** - world restart/persistence;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 368-368](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L368-L368)

<a id="d-8f983a7116065de6df93"></a>
- [ ] **D-8f983a7116065de6df93** - stale cache/resume;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 369-369](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L369-L369)

<a id="d-c087d40fe7a2f45be599"></a>
- [ ] **D-c087d40fe7a2f45be599** - one failed matrix cell;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 370-370](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L370-L370)

<a id="d-b877ce395dbc37918844"></a>
- [ ] **D-b877ce395dbc37918844** - lifecycle/cache leak;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 371-371](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L371-L371)

<a id="d-9c82bd39ec961d03bf41"></a>
- [ ] **D-9c82bd39ec961d03bf41** - UI reporting mismatch.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY / [ ] NP-19 — Run one adversarial regression/challenge pass
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 373-373](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L373-L373)

</details>

<a id="test-04-details"></a>
## TEST-04 - Full CLI, JSON and MCP parity

[Outcome](Checklist.md#test-04) / 232 source-derived details.

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Mission (1)</summary>

<a id="d-4d50b649197d1fbf47d9"></a>
- [ ] **D-4d50b649197d1fbf47d9** - The user requirement is stronger than add some commands: meaningful Enderloom functionality must be CLI-addressable, and the complete Performance Lab must be operable from CLI/CI w...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** The user requirement is stronger than add some commands: meaningful Enderloom functionality must be CLI-addressable, and the complete Performance Lab must be operable from CLI/CI without GUI clicking.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Mission
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 17-17](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L17-L17)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Non-negotiable product decisions (1)</summary>

<a id="d-6f48d354dcd9c03e2ebb"></a>
- [ ] **D-6f48d354dcd9c03e2ebb** - - GUI and CLI must converge on the same domain operations and safety rules. - Do not build a second launcher inside cli.rs. - Do not implement CLI by scripting/clicking the React/E...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - GUI and CLI must converge on the same domain operations and safety rules. - Do not build a second launcher inside cli.rs. - Do not implement CLI by scripting/clicking the React/Electron UI. - Preserve existing enderloom --launch &lt;instance&gt; and enderloom --list compatibility. - Unknown arguments in the future command tree should fail clearly unless explicitly passed through after --; current silent-ignore behavior is legacy compatibility to retire deliberately. - Headless test modes are valid for bootstrap/logic/CI but must not be used to claim rendered-client FPS/GPU performance. - Performance Lab automated tests never mutate the live Enderloom/CurseForge/Modrinth instance. - Static JAR scan produces risk evidence, never fabricated runtime metrics. - A mod receives a Measured verdict only after direct paired evidence. - Keep evidence and history keyed by exact hashes/fingerprints. - Long testing operations must support cancellation/recovery and preserve completed evidence. - Do not silently upload profiler/diagnostic data to third-party services. - External project code is research/reference only unless license review and an explicit integration design justify otherwise.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Non-negotiable product decisions
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 21-33](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L21-L33)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Existing architecture already resolved (1)</summary>

<a id="d-5bc1ae7211151d952e08"></a>
- [ ] **D-5bc1ae7211151d952e08** - Do not rediscover these facts unless the files changed after the handoff head.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Existing architecture already resolved
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 37-37](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L37-L37)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Existing architecture already resolved / Rust dependencies (1)</summary>

<a id="d-d9ccbb26ae7db7a14f8b"></a>
- [ ] **D-d9ccbb26ae7db7a14f8b** - - already includes clap = { version = &quot;4.6.6&quot;, features = [&quot;derive&quot;] }; - already has Tokio, serde/serde_json, rusqlite, hashing, sysinfo and the other required...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - already includes clap = { version = &quot;4.6.6&quot;, features = [&quot;derive&quot;] }; - already has Tokio, serde/serde_json, rusqlite, hashing, sysinfo and the other required launcher foundation.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Existing architecture already resolved / Rust dependencies
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 52-53](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L52-L53)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Existing architecture already resolved / Existing parity QA (1)</summary>

<a id="d-f29e9b7b16ae15103ca9"></a>
- [ ] **D-f29e9b7b16ae15103ca9** - Use this as the seed for CLI parity enforcement. Do not manually maintain a disconnected command inventory if it can be derived/generated.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Existing architecture already resolved / Existing parity QA
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 83-83](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L83-L83)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / GitHub research already completed (1)</summary>

<a id="d-da67f5087d17b697c1eb"></a>
- [ ] **D-da67f5087d17b697c1eb** - Do not repeat the broad search before coding. Recheck a reference only if a load-bearing fact/license/version matters to an implementation decision.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / GitHub research already completed
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 87-87](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L87-L87)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / GitHub research already completed / `headlesshq/headlessmc` (1)</summary>

<a id="d-2378abce79a77c3e6bf2"></a>
- [ ] **D-2378abce79a77c3e6bf2** - Design lesson: Enderloom should have a real Minecraft control plane + Probe, but must keep rendered mode for performance truth.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / GitHub research already completed / `headlesshq/headlessmc`
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 102-102](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L102-L102)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Exact next action (1)</summary>

<a id="d-3c9c4838427cc572402c"></a>
- [ ] **D-3c9c4838427cc572402c** - Start Phase CLI-0 from the checklist. Do not begin with UI work or profiler adapters.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Exact next action
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 162-162](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L162-L162)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Exact next action / First implementation slice (1)</summary>

<a id="d-fc46318b230d1d48f491"></a>
- [ ] **D-fc46318b230d1d48f491** - 1. Inspect only the files required to implement the slice: - native/src/cli.rs - native/src/service.rs - native/src/bin/enderloom-service.rs - native/src/lib.rs - native/Cargo.toml...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** 1. Inspect only the files required to implement the slice: - native/src/cli.rs - native/src/service.rs - native/src/bin/enderloom-service.rs - native/src/lib.rs - native/Cargo.toml - launcher/src/lib/api.ts - scripts/launcher-command-coverage-qa.js - existing relevant CLI/launcher tests if present. 2. Preserve legacy CLI behavior. 3. Introduce a shared command/capability registry or equivalent single source of truth that can map: - canonical operation ID; - service command; - CLI route; - GUI/API route; - read/write/destructive class; - plan/cancellation/progress support; - machine schema version; - explicit visual-only exception when valid. 4. Add a true CLI/headless bootstrap that does not create/show the normal GUI merely to execute a command. 5. Add stable machine output envelopes for --json and event output for --jsonl. 6. Implement the first useful new subcommands through shared domain functions: - enderloom capabilities --json - enderloom instance list --json - enderloom instance show &lt;selector&gt; --json - enderloom launch &lt;selector&gt; --wait - enderloom launch &lt;selector&gt; --detach - enderloom process list --json - initial log read/follow commands where the existing domain path makes this coherent. 7. Add scripts/cli-parity-qa.js (or evolve the current coverage gate cleanly) and wire an npm script. 8. The parity test must fail when a meaningful domain operation gains GUI/service exposure with no CLI route and no reviewed visual-only exception. 9. Add parser/machine-output tests including invalid/ambiguous selectors and JSON stdout cleanliness. 10. Run changed-path tests, then npm run build:integration, the launcher integration gate, existing command coverage QA, and CLI parity QA. 11. Exercise a real built CLI command path; prove the new binary/code path is actually loaded. 12. Checkpoint source after this coherent architecture slice before broadening command coverage.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Exact next action / First implementation slice
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 166-200](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L166-L200)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Minecraft CLI control target (2)</summary>

<a id="d-2af0c15fdee09f1dd0c4"></a>
- [ ] **D-2af0c15fdee09f1dd0c4** - The future enderloom mc control plane must support distinct modes:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Minecraft CLI control target
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 226-226](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L226-L226)

<a id="d-31cc74715be7b2a9ae37"></a>
- [ ] **D-31cc74715be7b2a9ae37** - The scenario DSL in the checklist is the portable contract shared by GUI, CLI, CI and Codex. Do not design four separate test engines.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Minecraft CLI control target
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 236-236](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L236-L236)

</details>

<details>
<summary>CODEX_HANDOFF_PREMIUM_TESTING_CLI.md / Codex Handoff — Enderloom Premium Testing + Full CLI / Verification expectations (1)</summary>

<a id="d-d3e5261847610f50e45c"></a>
- [ ] **D-d3e5261847610f50e45c** - - a passing compile is not user-visible proof; - CLI JSON must be parsed by tests, not eyeballed; - prove commands use the current built artifact rather than stale executables; - d...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - a passing compile is not user-visible proof; - CLI JSON must be parsed by tests, not eyeballed; - prove commands use the current built artifact rather than stale executables; - destructive fixture tests use disposable project/test data only; - do not mutate real external CurseForge/Modrinth libraries during QA; - direct game/client tests may use authorized current account state when needed; - cancellation must terminate only Enderloom-owned test processes; - one final challenge pass must test that CLI and GUI cannot drift onto separate implementations.
  - **Binding context:** Codex Handoff — Enderloom Premium Testing + Full CLI / Verification expectations
  - **Original specification:** [CODEX_HANDOFF_PREMIUM_TESTING_CLI.md : 246-253](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md#L246-L253)

</details>

<details>
<summary>CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md / Codex Handoff — Enderloom Ultimate Minecraft Workbench / Exact implementation order / Wave C — Performance Lab continuity (1)</summary>

<a id="d-183af48364988df98261"></a>
- [ ] **D-183af48364988df98261** - CLI/Testing expansion should continue through the same domain/capability registry rather than a second CLI architecture. The AI operator must call these same testing/profiling oper...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** CLI/Testing expansion should continue through the same domain/capability registry rather than a second CLI architecture. The AI operator must call these same testing/profiling operations instead of maintaining its own weaker testing path.
  - **Binding context:** Codex Handoff — Enderloom Ultimate Minecraft Workbench / Exact implementation order / Wave C — Performance Lab continuity
  - **Original specification:** [CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md : 253-253](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md#L253-L253)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.3 Preservation and safety (2)</summary>

<a id="d-4db9d5c066b37b43ba3f"></a>
- [ ] **D-4db9d5c066b37b43ba3f** - Concurrency correctness: “move it async” is never accepted without thread-ownership and behavioral correctness proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.3 Preservation and safety
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: SAFE-005 : 94-94](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L94-L94)

<a id="d-da7694b59c4eadc11856"></a>
- [ ] **D-da7694b59c4eadc11856** - Secrets: auth tokens/cookies/API keys/session secrets never enter ordinary logs, CLI arguments, public evidence, or project memory.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.3 Preservation and safety
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: SAFE-009 : 98-98](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L98-L98)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 5. PHASE B — FIRST REAL CANONICAL VERTICAL (1)</summary>

<a id="d-eb83cb611a3964c5506e"></a>
- [ ] **D-eb83cb611a3964c5506e** - Project the same canonical object into Mod Manager, Catalog, service/CLI, and Testing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. PHASE B — FIRST REAL CANONICAL VERTICAL
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PB-003 : 263-263](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L263-L263)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.1 CLI/service parity (2)</summary>

<a id="d-93d3e376e211cc5cabf0"></a>
- [ ] **D-93d3e376e211cc5cabf0** - Normal GUI bootstrap plus no-visible-GUI subcommand mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.1 CLI/service parity
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PC-002 : 276-276](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L276-L276)

<a id="d-523cd8ef8def78c86191"></a>
- [ ] **D-523cd8ef8def78c86191** - CI fails meaningful GUI/service operations lacking CLI mapping or an approved visual-only exception.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.1 CLI/service parity
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PC-006 : 280-280](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L280-L280)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 21. GOLDEN CHALLENGE MATRIX (1)</summary>

<a id="d-2d6c7d6dd4fd5df09187"></a>
- [ ] **D-2d6c7d6dd4fd5df09187** - Server/proxy/plugin scenario: PN-020..022 with CLI/service evidence and truthful runtime semantics.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. GOLDEN CHALLENGE MATRIX
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: GX-13 : 667-667](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L667-L667)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 3. Execution work / 3.3 Merge ModForge&#x27;s deterministic truth model with Enderloom (1)</summary>

<a id="d-da28ca9fa3d95909f45a"></a>
- [ ] **D-da28ca9fa3d95909f45a** - · Expose the canonical resolver to Enderloom&#x27;s AI/Codex operator through a stable JSON/CLI/tool contract so agents ask deterministic version truth instead of guessing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Execution work / 3.3 Merge ModForge&#x27;s deterministic truth model with Enderloom
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T020 : 475-475](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L475-L475) / [ENDERLOOM_STUDIO_EXECUTION.md :: T020 : 637-637](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L637-L637)

</details>

<details>
<summary>ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md / 9. CLI / Headless Progress (1)</summary>

<a id="d-852618758db044426aec"></a>
- [ ] **D-852618758db044426aec** - The same jobs must remain beautiful/useful without GUI.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 9. CLI / Headless Progress
  - **Original specification:** [ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md : 661-661](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md#L661-L661)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 3. Bedrock Developer Center — full creator/debugger parity / 3.4 Bedrock Editor integration (1)</summary>

<a id="d-0ddf488ebac579fb6e49"></a>
- [ ] **D-0ddf488ebac579fb6e49** - Editor Extension debugging/test deployment.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Bedrock Developer Center — full creator/debugger parity / 3.4 Bedrock Editor integration
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 162-162](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L162-L162)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 3. Bedrock Developer Center — full creator/debugger parity / 3.5 Creator Tools interoperability (1)</summary>

<a id="d-7354ed6fc357d091e492"></a>
- [ ] **D-7354ed6fc357d091e492** - Interoperate with official Creator Tools CLI/project conventions where useful.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Bedrock Developer Center — full creator/debugger parity / 3.5 Creator Tools interoperability
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 168-168](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L168-L168)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 29. Ecosystem Challenge Matrix — expanded benchmark set (1)</summary>

<a id="d-4b3c8cddb4fcd6f2a9ea"></a>
- [ ] **D-4b3c8cddb4fcd6f2a9ea** - Minecraft Creator Tools (mctools.dev / Creator Tools CLI concepts).
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1048-1048](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1048-L1048)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 22. Scenario DSL — one engine for GUI, CLI, CI, Codex (2)</summary>

<a id="d-60909590dfdd443d55d4"></a>
- [ ] **D-60909590dfdd443d55d4** - explicit cancellation behavior;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 975-975](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L975-L975)

<a id="d-fd5c07d9e930f1f91ea0"></a>
- [ ] **D-fd5c07d9e930f1f91ea0** - external-command hooks require explicit user opt-in and appear in plan/review.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Scenario DSL — one engine for GUI, CLI, CI, Codex
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 978-978](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L978-L978)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere (2)</summary>

<a id="d-0e5bbcb4f581435de09a"></a>
- [ ] **D-0e5bbcb4f581435de09a** - Everything meaningful Enderloom can do through the GUI must also be scriptable through a real CLI unless it is purely presentational.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 23. Full CLI everywhere
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 984-984](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L984-L984)

<a id="d-79f0c6dda6b62aa6c8a3"></a>
- [ ] **D-79f0c6dda6b62aa6c8a3** - -L/--list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 997-997](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L997-L997)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.1 Global automation contract (14)</summary>

<a id="d-ca680888245f97ace97c"></a>
- [ ] **D-ca680888245f97ace97c** - --json
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1009-1009](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1009-L1009)

<a id="d-14a003297eaf3a882d2b"></a>
- [ ] **D-14a003297eaf3a882d2b** - --jsonl
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1010-1010](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1010-L1010)

<a id="d-323ae9c2cb5324db9e2a"></a>
- [ ] **D-323ae9c2cb5324db9e2a** - --quiet
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1011-1011](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1011-L1011)

<a id="d-49e1730c2620b9e29f02"></a>
- [ ] **D-49e1730c2620b9e29f02** - --verbose
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1012-1012](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1012-L1012)

<a id="d-2800119c8e5716382031"></a>
- [ ] **D-2800119c8e5716382031** - --no-color
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1013-1013](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1013-L1013)

<a id="d-600605677ba34c5f8c71"></a>
- [ ] **D-600605677ba34c5f8c71** - --non-interactive
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1014-1014](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1014-L1014)

<a id="d-f30afadb6b897b765420"></a>
- [ ] **D-f30afadb6b897b765420** - --yes
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1015-1015](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1015-L1015)

<a id="d-88950539bf35c2ac7e1b"></a>
- [ ] **D-88950539bf35c2ac7e1b** - --timeout
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1016-1016](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1016-L1016)

<a id="d-eb57b836cae1b96ec065"></a>
- [ ] **D-eb57b836cae1b96ec065** - --trace-id
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1017-1017](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1017-L1017)

<a id="d-0db37e3306baf4052f2b"></a>
- [ ] **D-0db37e3306baf4052f2b** - --output
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1018-1018](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1018-L1018)

<a id="d-1ab12132ae35b4fc4e2d"></a>
- [ ] **D-1ab12132ae35b4fc4e2d** - --dry-run/--plan where meaningful
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1019-1019](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1019-L1019)

<a id="d-5216c8937c549d5b401a"></a>
- [ ] **D-5216c8937c549d5b401a** - stable exit-code families
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1020-1020](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1020-L1020)

<a id="d-7a4470bedf3c99091e12"></a>
- [ ] **D-7a4470bedf3c99091e12** - stdout/stderr discipline
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1021-1021](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1021-L1021)

<a id="d-775f6865ce6c8a159f69"></a>
- [ ] **D-775f6865ce6c8a159f69** - enderloom capabilities --json
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1027-1027](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1027-L1027)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.2 CLI parity domains (7)</summary>

<a id="d-f6e3a79c411507a4e55f"></a>
- [ ] **D-f6e3a79c411507a4e55f** - CLI must cover meaningful operations for:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1032-1032](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1032-L1032)

<a id="d-fffe500c3c234d4266b7"></a>
- [ ] **D-fffe500c3c234d4266b7** - settings
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1035-1035](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1035-L1035)

<a id="d-36b72b8b204ebd6666f7"></a>
- [ ] **D-36b72b8b204ebd6666f7** - auth/accounts
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1037-1037](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1037-L1037)

<a id="d-ba4441294dd22f356830"></a>
- [ ] **D-ba4441294dd22f356830** - skins/capes
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1038-1038](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1038-L1038)

<a id="d-4ce823570e01fa32ac4b"></a>
- [ ] **D-4ce823570e01fa32ac4b** - instances
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1039-1039](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1039-L1039)

<a id="d-c91dbf8d6854400e3509"></a>
- [ ] **D-c91dbf8d6854400e3509** - versions/loaders
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1041-1041](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1041-L1041)

<a id="d-ef4dcfbef2b5308477be"></a>
- [ ] **D-ef4dcfbef2b5308477be** - Testing/Performance Lab
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1052-1052](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1052-L1052)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.3 CLI parity CI gate (7)</summary>

<a id="d-0e1bd0eb80c3f23e24fe"></a>
- [ ] **D-0e1bd0eb80c3f23e24fe** - GUI/API route.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.3 CLI parity CI gate
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1062-1062](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1062-L1062)

<a id="d-80d5a601ae9eb82ceed9"></a>
- [ ] **D-80d5a601ae9eb82ceed9** - service route.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.3 CLI parity CI gate
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1063-1063](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1063-L1063)

<a id="d-32c1226c320f5f927b7a"></a>
- [ ] **D-32c1226c320f5f927b7a** - CLI route.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.3 CLI parity CI gate
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1064-1064](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1064-L1064)

<a id="d-21bfc10d055191ec6d46"></a>
- [ ] **D-21bfc10d055191ec6d46** - read/write/destructive classification.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.3 CLI parity CI gate
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1065-1065](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1065-L1065)

<a id="d-c0863011f7f64d37e0c9"></a>
- [ ] **D-c0863011f7f64d37e0c9** - output schema version.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.3 CLI parity CI gate
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1067-1067](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1067-L1067)

<a id="d-c8f7126f617e22437495"></a>
- [ ] **D-c8f7126f617e22437495** - plan/dry-run support.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.3 CLI parity CI gate
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1068-1068](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1068-L1068)

<a id="d-b286f6dc75cf13ca1434"></a>
- [ ] **D-b286f6dc75cf13ca1434** - CI fails if a meaningful new GUI/service operation has no CLI mapping or approved exception.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.3 CLI parity CI gate
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1070-1070](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1070-L1070)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 35. Release/QA contract / Add for CLI/Testing (16)</summary>

<a id="d-a116209a3c25e007efd5"></a>
- [ ] **D-a116209a3c25e007efd5** - CLI parser tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1435-1435](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1435-L1435)

<a id="d-410e124ea2989808f27b"></a>
- [ ] **D-410e124ea2989808f27b** - JSON/JSONL schema tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1436-1436](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1436-L1436)

<a id="d-d4e4368f19dff642182b"></a>
- [ ] **D-d4e4368f19dff642182b** - CLI parity QA.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1437-1437](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1437-L1437)

<a id="d-b6e82d7e544618c0f73b"></a>
- [ ] **D-b6e82d7e544618c0f73b** - actual built CLI fresh-code proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1438-1438](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1438-L1438)

<a id="d-58d9aeeec175bb2a3aff"></a>
- [ ] **D-58d9aeeec175bb2a3aff** - instance list/show through CLI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1439-1439](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1439-L1439)

<a id="d-54ea4fcfd0944909fb9a"></a>
- [ ] **D-54ea4fcfd0944909fb9a** - real launch/wait/log/exit path.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1440-1440](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1440-L1440)

<a id="d-73c01432a55a46521e8e"></a>
- [ ] **D-73c01432a55a46521e8e** - managed server CLI smoke.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1441-1441](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1441-L1441)

<a id="d-a95b4ca9a8faf6808686"></a>
- [ ] **D-a95b4ca9a8faf6808686** - Probe handshake.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1442-1442](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1442-L1442)

<a id="d-4a06f2781fae93d2a1e6"></a>
- [ ] **D-4a06f2781fae93d2a1e6** - lifecycle marker tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1443-1443](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1443-L1443)

<a id="d-fc423a40b39b8588d370"></a>
- [ ] **D-fc423a40b39b8588d370** - deliberate startup regression detected.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1445-1445](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1445-L1445)

<a id="d-5906a7662a9ff5e7fce4"></a>
- [ ] **D-5906a7662a9ff5e7fce4** - deliberate rendered-client frame regression detected in rendered mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1447-1447](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1447-L1447)

<a id="d-605bfa379131ec94dae2"></a>
- [ ] **D-605bfa379131ec94dae2** - deliberate allocation/GC regression detected.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1448-1448](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1448-L1448)

<a id="d-d868511587de16e6b127"></a>
- [ ] **D-d868511587de16e6b127** - same frame regression is not falsely claimed in headless mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1449-1449](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1449-L1449)

<a id="d-4174dddf9d55619d41fe"></a>
- [ ] **D-4174dddf9d55619d41fe** - profiler-overhead challenge pass.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1450-1450](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1450-L1450)

<a id="d-5b0ec31d921f71a1dbd6"></a>
- [ ] **D-5b0ec31d921f71a1dbd6** - crash recovery preserves completed evidence.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1452-1452](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1452-L1452)

<a id="d-e518e91a99b54027d00b"></a>
- [ ] **D-e518e91a99b54027d00b** - AI bundle redaction/manifests verified before external handoff.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1455-1455](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1455-L1455)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation (6)</summary>

<a id="d-a782ec9c039d6bee34e1"></a>
- [ ] **D-a782ec9c039d6bee34e1** - Inventory existing API/service commands using current coverage tooling.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1483-1483](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1483-L1483)

<a id="d-5191169202ef1c8cd372"></a>
- [ ] **D-5191169202ef1c8cd372** - Add no-visible-GUI CLI bootstrap.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1485-1485](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1485-L1485)

<a id="d-11048c946b3e200344b6"></a>
- [ ] **D-11048c946b3e200344b6** - Add versioned JSON/JSONL envelopes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1486-1486](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1486-L1486)

<a id="d-c58dafd282820eadfe47"></a>
- [ ] **D-c58dafd282820eadfe47** - Add cli-parity-qa.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1493-1493](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1493-L1493)

<a id="d-f74bf518579294c4a2b5"></a>
- [ ] **D-f74bf518579294c4a2b5** - Wire CLI parity into release QA.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1494-1494](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1494-L1494)

<a id="d-61dec2766a007b124c26"></a>
- [ ] **D-61dec2766a007b124c26** - Fresh build + real CLI proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1495-1495](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1495-L1495)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity (4)</summary>

<a id="d-cba6c242a19348885307"></a>
- [ ] **D-cba6c242a19348885307** - packs
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1502-1502](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1502-L1502)

<a id="d-76b309fe7c0c1ed1e643"></a>
- [ ] **D-76b309fe7c0c1ed1e643** - tasks
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1508-1508](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1508-L1508)

<a id="d-d0e42161ab9032f7438f"></a>
- [ ] **D-d0e42161ab9032f7438f** - skins
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1510-1510](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1510-L1510)

<a id="d-1888120abb59f0524613"></a>
- [ ] **D-1888120abb59f0524613** - zero unexplained domain gaps
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1512-1512](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1512-L1512)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-6 — AI handoff + polish (2)</summary>

<a id="d-6e8c8dcf36857ea7bda3"></a>
- [ ] **D-6e8c8dcf36857ea7bda3** - CLI completions/examples
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-6 — AI handoff + polish
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1563-1563](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1563-L1563)

<a id="d-c8d830250b57a41b7941"></a>
- [ ] **D-c8d830250b57a41b7941** - CI examples
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-6 — AI handoff + polish
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1564-1564](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1564-L1564)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 39. Definition of done — whole Enderloom vision (3)</summary>

<a id="d-ec75827d0f6cde5a00d7"></a>
- [ ] **D-ec75827d0f6cde5a00d7** - GUI and CLI share domain logic.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1604-1604](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1604-L1604)

<a id="d-bb691c716e7f674afa36"></a>
- [ ] **D-bb691c716e7f674afa36** - CLI/CI can run Performance Lab end-to-end.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1605-1605](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1605-L1605)

<a id="d-84025e80a9d0bdb34cb1"></a>
- [ ] **D-84025e80a9d0bdb34cb1** - CLI parity and real runtime workflows are part of release QA.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1617-1617](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1617-L1617)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.5 Build the missing Bedrock headless runner in full / Generated Enderloom Bedrock QA pack (1)</summary>

<a id="d-dfbd09576aed0b383858"></a>
- [ ] **D-dfbd09576aed0b383858** - - GameTest registration glue; - semantic test adapters; - structures required by the tests; - structured result markers; - optional Script API helpers; - optional server-admin/serv...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - GameTest registration glue; - semantic test adapters; - structures required by the tests; - structured result markers; - optional Script API helpers; - optional server-admin/server-net integration where supported and actually useful; - version-specific compatibility shims.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.5 Build the missing Bedrock headless runner in full / Generated Enderloom Bedrock QA pack
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4223-4229](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4223-L4229) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4223-4229](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4223-L4229)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.5 Build the missing Bedrock headless runner in full / External `bedrock-protocol` client (1)</summary>

<a id="d-baab68f51571c43f9c3d"></a>
- [ ] **D-baab68f51571c43f9c3d** - Do not expose raw packet plumbing to every test. Most tests should use a high-level Enderloom action API so Bedrock protocol version changes are repaired in one adapter.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.5 Build the missing Bedrock headless runner in full / External `bedrock-protocol` client
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4284-4284](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4284-L4284) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4284-4284](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4284-L4284)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.6 Bedrock result transport should be structured and local-first (2)</summary>

<a id="d-9996d2e12f0ca45002c2"></a>
- [ ] **D-9996d2e12f0ca45002c2** - Do not require internet access for ordinary local tests.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.6 Bedrock result transport should be structured and local-first
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4299-4299](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4299-L4299) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4299-4299](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4299-L4299)

<a id="d-4237cca9e12860573bbc"></a>
- [ ] **D-4237cca9e12860573bbc** - Do not expose secrets/tokens to test packs or logs.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.6 Bedrock result transport should be structured and local-first
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4301-4301](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4301-L4301) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4301-4301](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4301-L4301)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.7 CLI that is actually useful (1)</summary>

<a id="d-cbf35ee87870f1320a4c"></a>
- [ ] **D-cbf35ee87870f1320a4c** - The exact syntax may change to fit the existing Enderloom CLI conventions, but the capabilities must exist.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.7 CLI that is actually useful
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4335-4335](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4335-L4335) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4335-4335](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4335-L4335)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Cache immutable runtimes/toolchains (1)</summary>

<a id="d-b4607f4f8f7f72818120"></a>
- [ ] **D-b4607f4f8f7f72818120** - Verify the cache before trusting it; do not repeatedly redownload unchanged artifacts.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Cache immutable runtimes/toolchains
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4431-4431](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4431-L4431) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4431-4431](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4431-L4431)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Incremental invalidation (1)</summary>

<a id="d-49f075c525516df1816a"></a>
- [ ] **D-49f075c525516df1816a** - When only a renderer changes, do not rerun unrelated recipe tests.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Incremental invalidation
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4454-4454](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4454-L4454) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4454-4454](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4454-L4454)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Parallel shards (1)</summary>

<a id="d-8cbf8527d1b4296a94e0"></a>
- [ ] **D-8cbf8527d1b4296a94e0** - Do not oversubscribe the machine until every test becomes slower and flaky.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Parallel shards
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4471-4471](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4471-L4471) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4471-4471](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4471-L4471)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.15 Performance testing through the same engine (1)</summary>

<a id="d-cc02e899f3b4297affb1"></a>
- [ ] **D-cc02e899f3b4297affb1** - Do not equate headless server speed with client FPS.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.15 Performance testing through the same engine
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4636-4636](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4636-L4636) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4636-4636](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4636-L4636)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.19 Native escalation policy (1)</summary>

<a id="d-8e81a7765b2ab91817ff"></a>
- [ ] **D-8e81a7765b2ab91817ff** - Do not make the user select runners manually for normal work.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.19 Native escalation policy
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4731-4731](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4731-L4731) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4731-4731](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4731-L4731)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.21 Clean-room test-engine proof (2)</summary>

<a id="d-d4c2482daccba8193cca"></a>
- [ ] **D-d4c2482daccba8193cca** - The headless engine itself must pass a clean-room acceptance flow.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.21 Clean-room test-engine proof
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4766-4766](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4766-L4766) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4766-4766](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4766-L4766)

<a id="d-56859b52f137cb6190a6"></a>
- [ ] **D-56859b52f137cb6190a6** - No manual clicking through Minecraft menus should be required for the headless portions.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.21 Clean-room test-engine proof
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4783-4783](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4783-L4783) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4783-4783](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4783-L4783)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.22 Headless QA acceptance (1)</summary>

<a id="d-3a66d9ad151e62c12bac"></a>
- [ ] **D-3a66d9ad151e62c12bac** - - Java and Bedrock both expose one consistent CLI/API testing workflow; - Java reuses/integrates proven HeadlessMC/mc-runtime-test/Mineflayer-style foundations where they improve r...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Java and Bedrock both expose one consistent CLI/API testing workflow; - Java reuses/integrates proven HeadlessMC/mc-runtime-test/Mineflayer-style foundations where they improve reliability or speed; - Bedrock uses the official BDS as the authoritative headless runtime; - Bedrock reuses bedrock-protocol rather than reimplementing the entire network protocol; - Enderloom can generate and run Bedrock GameTest packs without manual world/menu setup; - expected/discovered test counts prevent false zero-test passes; - simulated players are used where supported but never treated as identical to a real player when the API says otherwise; - external Bedrock headless clients can join/spawn/exercise representative gameplay/network workflows; - Java headless clients can exercise representative integrated/client-state workflows; - real native clients are automatically used when rendering/UI/audio/client-only proof is required; - disposable fixtures protect real worlds; - exact versions/hashes/environment are preserved in every run receipt; - local caches and incremental invalidation materially reduce repeated work; - independent suites/matrix cells run in bounded parallel; - structured JSON/JSONL/JUnit results exist; - failure evidence can be handed directly to Codex/OpenAI and replayed after repair; - AoA&#x27;s giant test surface can run changed-path subsets quickly during development and the full suite at graduation; - the engine proves failures rather than merely detecting process exits; - headless optimization never weakens the strongest required native runtime proof.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.22 Headless QA acceptance
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4789-4807](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4789-L4807) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4789-4807](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4789-L4807)

</details>

<details>
<summary>ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md / 11. Fully Headless / CLI Operation (1)</summary>

<a id="d-9b0e83f7a40d203edc05"></a>
- [ ] **D-9b0e83f7a40d203edc05** - An AI job must be startable without opening Enderloom UI.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 11. Fully Headless / CLI Operation
  - **Original specification:** [ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md : 576-576](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md#L576-L576)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 14. Fast Launch Engine for testing (1)</summary>

<a id="d-cf5b7c3fd2f89ef6b250"></a>
- [ ] **D-cf5b7c3fd2f89ef6b250** - Skip irrelevant Enderloom UI work for CLI/automated tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. Fast Launch Engine for testing
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 517-517](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L517-L517)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 20. Scenario DSL for Performance tests (1)</summary>

<a id="d-7e8ab1128369724b39e0"></a>
- [ ] **D-7e8ab1128369724b39e0** - One versioned YAML/JSON scenario format shared by GUI, CLI, CI, and AI/Codex workflows.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 20. Scenario DSL for Performance tests
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 694-694](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L694-L694)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 21. AI analysis handoff (1)</summary>

<a id="d-5dafa9dc728cb72de47c"></a>
- [ ] **D-5dafa9dc728cb72de47c** - Include benchmark JSON.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. AI analysis handoff
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 725-725](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L725-L725)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 22. Performance research/reference ideas already discussed (2)</summary>

<a id="d-4eaa21a5e99b954789e7"></a>
- [ ] **D-4eaa21a5e99b954789e7** - HeadlessMc — Minecraft CLI/headless/CI control ideas.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Performance research/reference ideas already discussed
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 765-765](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L765-L765)

<a id="d-8bdda0b653775c08b6b4"></a>
- [ ] **D-8bdda0b653775c08b6b4** - PortableMC — CLI launcher/machine-readable output ideas.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. Performance research/reference ideas already discussed
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 767-767](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L767-L767)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 23. Acceptance tests / CLI (7)</summary>

<a id="d-ab7bc365d26af67eca7c"></a>
- [ ] **D-ab7bc365d26af67eca7c** - Performance CLI and GUI use the same test engine.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 812-812](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L812-L812)

<a id="d-4034049329c9525c3d79"></a>
- [ ] **D-4034049329c9525c3d79** - JSON stdout contains no prose/log noise.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 813-813](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L813-L813)

<a id="d-530009b005dd7be70e5b"></a>
- [ ] **D-530009b005dd7be70e5b** - JSONL progress is structurally valid.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 814-814](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L814-L814)

<a id="d-695ec184a5c295e9a35a"></a>
- [ ] **D-695ec184a5c295e9a35a** - Cancel/resume works.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 815-815](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L815-L815)

<a id="d-18e9d4ada8d2752e7f81"></a>
- [ ] **D-18e9d4ada8d2752e7f81** - CLI can complete a real Quick Scan.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 816-816](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L816-L816)

<a id="d-dcb7388324aa0ee80ac6"></a>
- [ ] **D-dcb7388324aa0ee80ac6** - CLI can complete a real rendered/client test when the environment supports it.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 817-817](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L817-L817)

<a id="d-ee9a41a375f2869cfd87"></a>
- [ ] **D-ee9a41a375f2869cfd87** - CLI can complete a real dedicated-server test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 818-818](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L818-L818)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 6 — CLI + AI handoff polish (2)</summary>

<a id="d-935b349fe34d1c26143a"></a>
- [ ] **D-935b349fe34d1c26143a** - Performance/Test CLI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 6 — CLI + AI handoff polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 875-875](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L875-L875)

<a id="d-59a6e1eaf6d7ac508286"></a>
- [ ] **D-59a6e1eaf6d7ac508286** - JSON/JSONL schemas.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 6 — CLI + AI handoff polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 877-877](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L877-L877)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 1. The Integration Law — absolutely non-negotiable (1)</summary>

<a id="d-d58a72c3c30f43bc21cb"></a>
- [ ] **D-d58a72c3c30f43bc21cb** - CLI/CI operates on the same domain objects and task engine as the GUI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. The Integration Law — absolutely non-negotiable
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 56-56](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L56-L56)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 35. CLI / API / CI parity (6)</summary>

<a id="d-4e76c43adb43f79973cd"></a>
- [ ] **D-4e76c43adb43f79973cd** - Everything meaningful must be scriptable unless purely presentational.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 35. CLI / API / CI parity
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1309-1309](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1309-L1309)

<a id="d-24732cc2905dee0750d2"></a>
- [ ] **D-24732cc2905dee0750d2** - JSON/JSONL;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. CLI / API / CI parity
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1335-1335](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1335-L1335)

<a id="d-3040c2f7e15962f27c90"></a>
- [ ] **D-3040c2f7e15962f27c90** - dry-run/plan;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. CLI / API / CI parity
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1337-1337](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1337-L1337)

<a id="d-2d5cc58c68aedbbec73c"></a>
- [ ] **D-2d5cc58c68aedbbec73c** - progress events;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. CLI / API / CI parity
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1338-1338](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1338-L1338)

<a id="d-703088686d2e52c728e7"></a>
- [ ] **D-703088686d2e52c728e7** - stable exit code families;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. CLI / API / CI parity
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1340-1340](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1340-L1340)

<a id="d-fcd5da483fa76230929f"></a>
- [ ] **D-fcd5da483fa76230929f** - parity CI gate.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. CLI / API / CI parity
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1343-1343](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1343-L1343)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 41. Verification contract (1)</summary>

<a id="d-d963cf2b5e66d2354a2c"></a>
- [ ] **D-d963cf2b5e66d2354a2c** - CLI parity.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1520-1520](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1520-L1520)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / Enderloom Premium Testing — Full CLI + Minecraft Automation Checklist / North-star requirement (2)</summary>

<a id="d-cac8ef62d0d33aab541e"></a>
- [ ] **D-cac8ef62d0d33aab541e** - Everything meaningful Enderloom can do through the UI must also be scriptable through a real CLI unless the operation is purely presentational.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing — Full CLI + Minecraft Automation Checklist / North-star requirement
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 11-11](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L11-L11)

<a id="d-6360a07b771da54291e9"></a>
- [ ] **D-6360a07b771da54291e9** - The CLI is not an afterthought, UI macro layer, DOM automation shim, or duplicate implementation. The GUI, Electron IPC/service transport, CLI, tests, and future automation integra...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** The CLI is not an afterthought, UI macro layer, DOM automation shim, or duplicate implementation. The GUI, Electron IPC/service transport, CLI, tests, and future automation integrations must converge on the same domain operations and the same validation/safety rules.
  - **Binding context:** Enderloom Premium Testing — Full CLI + Minecraft Automation Checklist / North-star requirement
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 13-13](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L13-L13)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 1. Current Enderloom baseline — preserve, expand, do not restart / Existing CLI foundation (3)</summary>

<a id="d-d0519cb4c372f6ad00bb"></a>
- [ ] **D-d0519cb4c372f6ad00bb** - native/src/cli.rs already uses clap.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Current Enderloom baseline — preserve, expand, do not restart / Existing CLI foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 23-23](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L23-L23)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-d06f403bed48daa8cd1c"></a>
- [ ] **D-d06f403bed48daa8cd1c** - Existing CLI supports -L/--list.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Current Enderloom baseline — preserve, expand, do not restart / Existing CLI foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 25-25](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L25-L25)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-7973fee22eca4b3e46ee"></a>
- [ ] **D-7973fee22eca4b3e46ee** - Stop ignoring unknown CLI arguments once the new command tree is enabled. Unknown CLI input must fail clearly with a non-zero exit code unless it is intentionally passed through af...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Stop ignoring unknown CLI arguments once the new command tree is enabled. Unknown CLI input must fail clearly with a non-zero exit code unless it is intentionally passed through after --.
  - **Binding context:** 1. Current Enderloom baseline — preserve, expand, do not restart / Existing CLI foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 30-30](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L30-L30)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 1. Current Enderloom baseline — preserve, expand, do not restart / Existing service/domain foundation (1)</summary>

<a id="d-99100216cdc77418eeb5"></a>
- [ ] **D-99100216cdc77418eeb5** - Reuse this service/core architecture for CLI parity instead of reimplementing launcher behavior in argument handlers.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Current Enderloom baseline — preserve, expand, do not restart / Existing service/domain foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 38-38](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L38-L38)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 1. Current Enderloom baseline — preserve, expand, do not restart / Architecture rule (1)</summary>

<a id="d-ba6ccbb0fdbd199b5c32"></a>
- [ ] **D-ba6ccbb0fdbd199b5c32** - Purely headless CLI commands must not initialize rendering/UI infrastructure just to read or mutate launcher data.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Current Enderloom baseline — preserve, expand, do not restart / Architecture rule
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 48-48](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L48-L48)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Invocation (1)</summary>

<a id="d-6bd8551d216fc55a30cd"></a>
- [ ] **D-6bd8551d216fc55a30cd** - If packaging constraints make the installed GUI binary and CLI binary require separate filenames, keep enderloom as the user-facing shell command and use a stable internal helper n...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** If packaging constraints make the installed GUI binary and CLI binary require separate filenames, keep enderloom as the user-facing shell command and use a stable internal helper name such as enderloom-service; do not force users to understand transport binaries.
  - **Binding context:** 2. CLI executable contract / Invocation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 65-65](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L65-L65)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Global flags (12)</summary>

<a id="d-ce53b7adb394c8104691"></a>
- [ ] **D-ce53b7adb394c8104691** - --help
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 69-69](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L69-L69)

<a id="d-d330ed8eed8fd45ed911"></a>
- [ ] **D-d330ed8eed8fd45ed911** - --version
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 70-70](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L70-L70)

<a id="d-6ae292f257f4f4e07cf3"></a>
- [ ] **D-6ae292f257f4f4e07cf3** - --data-dir &lt;PATH&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 71-71](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L71-L71)

<a id="d-791e211757c5044ebd8a"></a>
- [ ] **D-791e211757c5044ebd8a** - --json — one complete JSON result on stdout.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 72-72](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L72-L72)

<a id="d-a2692d901a652ddc3399"></a>
- [ ] **D-a2692d901a652ddc3399** - --jsonl — structured progress/events and final result as JSON Lines.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 73-73](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L73-L73)

<a id="d-6bd6b5f4d54707f6b1b3"></a>
- [ ] **D-6bd6b5f4d54707f6b1b3** - --quiet
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 74-74](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L74-L74)

<a id="d-2ce6aab31963c92dcdcd"></a>
- [ ] **D-2ce6aab31963c92dcdcd** - --verbose / -v, repeatable where useful.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 75-75](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L75-L75)

<a id="d-95bb3f3a12c28c0646fb"></a>
- [ ] **D-95bb3f3a12c28c0646fb** - --no-color
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 76-76](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L76-L76)

<a id="d-f6650bcbee33f5745953"></a>
- [ ] **D-f6650bcbee33f5745953** - --non-interactive
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 77-77](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L77-L77)

<a id="d-ae8f1352fde953627a51"></a>
- [ ] **D-ae8f1352fde953627a51** - --yes for explicitly approved destructive operations.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 78-78](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L78-L78)

<a id="d-f125788d86d3b9e4348c"></a>
- [ ] **D-f125788d86d3b9e4348c** - --trace-id &lt;ID&gt; or generated run correlation ID surfaced in result metadata.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 80-80](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L80-L80)

<a id="d-00993ca2a2339d4e0c20"></a>
- [ ] **D-00993ca2a2339d4e0c20** - --dry-run / --plan for destructive or high-impact mutations where a meaningful plan exists.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 82-82](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L82-L82)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Output discipline (5)</summary>

<a id="d-f75073e5c0e525f04ca1"></a>
- [ ] **D-f75073e5c0e525f04ca1** - Human-readable normal output goes to stdout.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Output discipline
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 86-86](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L86-L86)

<a id="d-6bae74558a750a7ad441"></a>
- [ ] **D-6bae74558a750a7ad441** - Machine-readable --json output contains only the result envelope on stdout.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Output discipline
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 87-87](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L87-L87)

<a id="d-e8b34160447215885566"></a>
- [ ] **D-e8b34160447215885566** - Logs, warnings, and progress go to stderr when --json is active.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Output discipline
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 88-88](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L88-L88)

<a id="d-2c6be0909372ceb0ebac"></a>
- [ ] **D-2c6be0909372ceb0ebac** - --jsonl uses a versioned event envelope.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Output discipline
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 89-89](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L89-L89)

<a id="d-4926b8fb32e98cc7675b"></a>
- [ ] **D-4926b8fb32e98cc7675b** - Long-running commands emit stage/progress events without making callers parse prose.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Output discipline
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 92-92](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L92-L92)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Stable exit-code families (5)</summary>

<a id="d-aa03a0df49c1c4082091"></a>
- [ ] **D-aa03a0df49c1c4082091** - invalid CLI usage
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 100-100](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L100-L100)

<a id="d-0affcee796a88481e5b1"></a>
- [ ] **D-0affcee796a88481e5b1** - preflight/environment failure
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 101-101](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L101-L101)

<a id="d-36fa13fedfeed86d29ec"></a>
- [ ] **D-36fa13fedfeed86d29ec** - timeout
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 104-104](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L104-L104)

<a id="d-72be94aa2067454ec47a"></a>
- [ ] **D-72be94aa2067454ec47a** - regression threshold exceeded
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 107-107](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L107-L107)

<a id="d-a0bb5db84c31f794404c"></a>
- [ ] **D-a0bb5db84c31f794404c** - partial result with preserved artifacts when a later optional stage fails
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 109-109](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L109-L109)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Automation ergonomics (1)</summary>

<a id="d-2ae6af43c7c737a46e0e"></a>
- [ ] **D-2ae6af43c7c737a46e0e** - Environment-variable equivalents only for stable global configuration; explicit CLI flags override environment values.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Automation ergonomics
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 120-120](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L120-L120)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist (1)</summary>

<a id="d-f2be87d979d32b7545cd"></a>
- [ ] **D-f2be87d979d32b7545cd** - Every row below must either receive a CLI route or be placed in an explicit UI_ONLY_EXCEPTIONS registry with a reason proving it is purely presentational.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 3. Full launcher CLI parity checklist
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 127-127](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L127-L127)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / App / settings / environment (9)</summary>

<a id="d-c33997dbcb2d6d87246e"></a>
- [ ] **D-c33997dbcb2d6d87246e** - enderloom app info
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 131-131](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L131-L131)

<a id="d-9715677f0696d2b0198a"></a>
- [ ] **D-9715677f0696d2b0198a** - enderloom app doctor
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 132-132](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L132-L132)

<a id="d-55c79fb5aeebc13db1e7"></a>
- [ ] **D-55c79fb5aeebc13db1e7** - enderloom app paths
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 133-133](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L133-L133)

<a id="d-ded68eb2efcba7c5b12b"></a>
- [ ] **D-ded68eb2efcba7c5b12b** - enderloom app network test [URL]
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 134-134](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L134-L134)

<a id="d-49e7a6dab4fba455da57"></a>
- [ ] **D-49e7a6dab4fba455da57** - enderloom settings get
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 135-135](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L135-L135)

<a id="d-d7aaff9f8d8366dcb962"></a>
- [ ] **D-d7aaff9f8d8366dcb962** - enderloom settings set ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 136-136](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L136-L136)

<a id="d-bb2962971e942de6ce01"></a>
- [ ] **D-bb2962971e942de6ce01** - enderloom storage scan
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 140-140](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L140-L140)

<a id="d-2293a31de058ab5adefd"></a>
- [ ] **D-2293a31de058ab5adefd** - enderloom storage reclaim ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 141-141](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L141-L141)

<a id="d-8237291a08f61fc9e20d"></a>
- [ ] **D-8237291a08f61fc9e20d** - enderloom update check
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / App / settings / environment
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 142-142](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L142-L142)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Versions / loaders (2)</summary>

<a id="d-6c62be8d8a891b500078"></a>
- [ ] **D-6c62be8d8a891b500078** - enderloom version list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Versions / loaders
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 173-173](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L173-L173)

<a id="d-62176832f3eb6f7ae270"></a>
- [ ] **D-62176832f3eb6f7ae270** - Forge, NeoForge, Fabric, Quilt behavior matches GUI resolver behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Versions / loaders
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 176-176](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L176-L176)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Snapshots / backups / recovery (5)</summary>

<a id="d-80014614dac1af921764"></a>
- [ ] **D-80014614dac1af921764** - enderloom snapshot list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Snapshots / backups / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 219-219](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L219-L219)

<a id="d-c7848dc6f7a8cab94fb2"></a>
- [ ] **D-c7848dc6f7a8cab94fb2** - enderloom snapshot rename
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Snapshots / backups / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 221-221](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L221-L221)

<a id="d-3afebb54ddc37f8f221e"></a>
- [ ] **D-3afebb54ddc37f8f221e** - enderloom snapshot restore
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Snapshots / backups / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 222-222](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L222-L222)

<a id="d-1fb3969eca23706aec1f"></a>
- [ ] **D-1fb3969eca23706aec1f** - enderloom snapshot delete
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Snapshots / backups / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 223-223](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L223-L223)

<a id="d-0b8de73fb1f8080d07da"></a>
- [ ] **D-0b8de73fb1f8080d07da** - Restore/destructive paths use the same rollback rules as GUI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Snapshots / backups / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 224-224](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L224-L224)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Launcher migration / external instances (6)</summary>

<a id="d-8c5c674210a99bc231a2"></a>
- [ ] **D-8c5c674210a99bc231a2** - enderloom migrate detect
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Launcher migration / external instances
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 228-228](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L228-L228)

<a id="d-c13f5ba4f0e387b3c31f"></a>
- [ ] **D-c13f5ba4f0e387b3c31f** - enderloom migrate scan
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Launcher migration / external instances
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 229-229](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L229-L229)

<a id="d-77c7b226d2720ac85380"></a>
- [ ] **D-77c7b226d2720ac85380** - enderloom migrate import
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Launcher migration / external instances
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 230-230](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L230-L230)

<a id="d-a77f40b978a8c26d63d7"></a>
- [ ] **D-a77f40b978a8c26d63d7** - enderloom migrate connect-in-place
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Launcher migration / external instances
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 231-231](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L231-L231)

<a id="d-4f43bc729e002c4dd762"></a>
- [ ] **D-4f43bc729e002c4dd762** - enderloom migrate reconcile
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Launcher migration / external instances
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 232-232](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L232-L232)

<a id="d-def3b56a5591a7d37e06"></a>
- [ ] **D-def3b56a5591a7d37e06** - Preserve physical-path/junction safety.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Launcher migration / external instances
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 233-233](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L233-L233)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Tasks / cancellation (1)</summary>

<a id="d-8181dbd6584520f67f17"></a>
- [ ] **D-8181dbd6584520f67f17** - Long CLI operations surface task IDs immediately in JSONL/event mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Tasks / cancellation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 270-270](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L270-L270)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Catalog / research workspace (1)</summary>

<a id="d-db96d0be1dcd0d7c2a60"></a>
- [ ] **D-db96d0be1dcd0d7c2a60** - Do not implement catalog CLI by driving the Chromium UI; move/reuse catalog domain functions behind an addressable service/module.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 287-287](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L287-L287)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 4. CLI parity enforcement — make missing coverage impossible to ignore / Automated QA (4)</summary>

<a id="d-86ff80ff53ef975a1796"></a>
- [ ] **D-86ff80ff53ef975a1796** - Extend scripts/launcher-command-coverage-qa.js or add scripts/cli-parity-qa.js.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. CLI parity enforcement — make missing coverage impossible to ignore / Automated QA
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 310-310](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L310-L310)

<a id="d-ee17d88537a6ec045b95"></a>
- [ ] **D-ee17d88537a6ec045b95** - Fail CI when a new meaningful GUI/service domain operation has no CLI mapping and no approved visual-only exception.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. CLI parity enforcement — make missing coverage impossible to ignore / Automated QA
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 312-312](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L312-L312)

<a id="d-bdf59c3d300072b71b01"></a>
- [ ] **D-bdf59c3d300072b71b01** - Fail CI when two CLI commands map to divergent duplicated domain implementations.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. CLI parity enforcement — make missing coverage impossible to ignore / Automated QA
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 313-313](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L313-L313)

<a id="d-1820c1c3100824732ff2"></a>
- [ ] **D-1820c1c3100824732ff2** - Add npm run cli-parity-qa.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. CLI parity enforcement — make missing coverage impossible to ignore / Automated QA
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 315-315](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L315-L315)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / Core commands (1)</summary>

<a id="d-74046ed1c7a4858db9d3"></a>
- [ ] **D-74046ed1c7a4858db9d3** - enderloom mc status --run &lt;ID&gt; --json
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 343-343](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L343-L343)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex (1)</summary>

<a id="d-977e22fbc0327d973a44"></a>
- [ ] **D-977e22fbc0327d973a44** - Every step has explicit timeout/cancellation behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 434-434](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L434-L434)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Whole-pack test (1)</summary>

<a id="d-49fe324d0ef13ea93e42"></a>
- [ ] **D-49fe324d0ef13ea93e42** - --fail-fast optional for CI; interactive/full analysis defaults to preserve useful completed evidence.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Whole-pack test
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 478-478](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L478-L478)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Results / comparisons (2)</summary>

<a id="d-25b41e5d4edd83c1fddf"></a>
- [ ] **D-25b41e5d4edd83c1fddf** - enderloom test export &lt;RUN&gt; --format json|md|zip
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 488-488](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L488-L488)

<a id="d-1501e23e6283c18e4ca9"></a>
- [ ] **D-1501e23e6283c18e4ca9** - Result JSON exposes raw metrics, deltas, confidence/noise, verdict classification and artifact paths.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Results / comparisons
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 489-489](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L489-L489)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Cancellation / recovery (1)</summary>

<a id="d-54ad0268118ed66b3ccf"></a>
- [ ] **D-54ad0268118ed66b3ccf** - Crash recovery discovers interrupted test sandboxes and offers resume/cleanup instead of deleting evidence blindly.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Cancellation / recovery
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 496-496](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L496-L496)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 8. Profiler CLI adapters / Observable (2)</summary>

<a id="d-2dd864efad68e2c55b02"></a>
- [ ] **D-2dd864efad68e2c55b02** - enderloom profile observable ensure
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Profiler CLI adapters / Observable
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 519-519](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L519-L519)

<a id="d-60d52cfb632f16792cc5"></a>
- [ ] **D-60d52cfb632f16792cc5** - enderloom profile observable scan
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Profiler CLI adapters / Observable
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 520-520](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L520-L520)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 11. Fast Launch Engine CLI integration (1)</summary>

<a id="d-c1aeaeb0b81dbd517918"></a>
- [ ] **D-c1aeaeb0b81dbd517918** - Headless/dummy-asset acceleration is allowed only for tests whose conclusions remain valid under that mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Fast Launch Engine CLI integration
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 725-725](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L725-L725)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 13. Security and safety requirements (1)</summary>

<a id="d-7ba1d37b3c65b5e9d8d7"></a>
- [ ] **D-7ba1d37b3c65b5e9d8d7** - CLI server file operations use the same traversal/symlink protections as GUI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Security and safety requirements
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 751-751](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L751-L751)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Parser/contract (3)</summary>

<a id="d-77d0ad3d0bfe4e4267ac"></a>
- [ ] **D-77d0ad3d0bfe4e4267ac** - help for every command and subcommand
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 763-763](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L763-L763)

<a id="d-41334604d77824b66037"></a>
- [ ] **D-41334604d77824b66037** - invalid command returns non-zero
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 765-765](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L765-L765)

<a id="d-3124ed54e9a69f15df40"></a>
- [ ] **D-3124ed54e9a69f15df40** - JSON stdout remains valid while warnings occur on stderr
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parser/contract
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 769-769](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L769-L769)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Real launcher behavior (1)</summary>

<a id="d-e305061b94236fcaf765"></a>
- [ ] **D-e305061b94236fcaf765** - managed server install/start/command/stop
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Real launcher behavior
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 781-781](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L781-L781)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Minecraft test control (1)</summary>

<a id="d-4837d256ea82f9dedc58"></a>
- [ ] **D-4837d256ea82f9dedc58** - in-game command
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Minecraft test control
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 791-791](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L791-L791)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Performance proof (1)</summary>

<a id="d-2bf0c9cec9fd2d74fe87"></a>
- [ ] **D-2bf0c9cec9fd2d74fe87** - same frame regression is not falsely claimed from headless mode
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Performance proof
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 805-805](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L805-L805)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Parity gate (3)</summary>

<a id="d-01b388c60ebe442d3555"></a>
- [ ] **D-01b388c60ebe442d3555** - every meaningful launcher API/service operation has CLI route or reviewed UI-only exception
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parity gate
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 811-811](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L811-L811)

<a id="d-17349f8b85b0348bb94d"></a>
- [ ] **D-17349f8b85b0348bb94d** - adding a new service/API command without parity fails CI
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parity gate
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 812-812](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L812-L812)

<a id="d-5d96ca26fac4179b77f5"></a>
- [ ] **D-5d96ca26fac4179b77f5** - release QA runs CLI parity gate
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Parity gate
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 813-813](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L813-L813)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex (1)</summary>

<a id="d-2033a4af64fe6d6473d0"></a>
- [ ] **D-2033a4af64fe6d6473d0** - Do not attempt to build the entire Performance Lab before the CLI foundation is trustworthy.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 15. Implementation order for Codex
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 819-819](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L819-L819)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-0 — shared command foundation (6)</summary>

<a id="d-1f577a38fd810c01f0ab"></a>
- [ ] **D-1f577a38fd810c01f0ab** - Add CLI command/result envelope types.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-0 — shared command foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 827-827](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L827-L827)

<a id="d-98719297aeea6612ef05"></a>
- [ ] **D-98719297aeea6612ef05** - Add headless state/bootstrap path that does not create a visible GUI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-0 — shared command foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 828-828](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L828-L828)

<a id="d-9ca2bad919f7f70a759d"></a>
- [ ] **D-9ca2bad919f7f70a759d** - Add global --json, --jsonl, --quiet, --no-color behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-0 — shared command foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 829-829](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L829-L829)

<a id="d-7e5c28e0d6aab5104f97"></a>
- [ ] **D-7e5c28e0d6aab5104f97** - Add capabilities and parity QA.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-0 — shared command foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 830-830](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L830-L830)

<a id="d-b028685a8141d8cf0577"></a>
- [ ] **D-b028685a8141d8cf0577** - Targeted tests + integration build.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-0 — shared command foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 831-831](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L831-L831)

<a id="d-4adabcd2e07be4c7473a"></a>
- [ ] **D-4adabcd2e07be4c7473a** - Checkpoint before expanding breadth.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-0 — shared command foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 832-832](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L832-L832)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity (4)</summary>

<a id="d-ca96809232d8ba99b404"></a>
- [ ] **D-ca96809232d8ba99b404** - instances
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 836-836](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L836-L836)

<a id="d-0ec93ea2044ea5bca0d9"></a>
- [ ] **D-0ec93ea2044ea5bca0d9** - packs
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 839-839](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L839-L839)

<a id="d-e56401e8fa2cd1d3714c"></a>
- [ ] **D-e56401e8fa2cd1d3714c** - skins
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 846-846](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L846-L846)

<a id="d-b061d9dac0abe2743a7b"></a>
- [ ] **D-b061d9dac0abe2743a7b** - parity QA reaches zero unexplained domain gaps.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 848-848](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L848-L848)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-2 — test-session foundation (1)</summary>

<a id="d-c23c1bce69de3916b55a"></a>
- [ ] **D-c23c1bce69de3916b55a** - CLI result/history commands
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-2 — test-session foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 856-856](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L856-L856)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-3 — Minecraft Probe/control plane (2)</summary>

<a id="d-a60a43150cf847cb26c3"></a>
- [ ] **D-a60a43150cf847cb26c3** - lifecycle markers
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-3 — Minecraft Probe/control plane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 862-862](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L862-L862)

<a id="d-c844ab74a3102883afaf"></a>
- [ ] **D-c844ab74a3102883afaf** - rendered vs headless vs virtual-display truth labels
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-3 — Minecraft Probe/control plane
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 864-864](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L864-L864)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-4 — direct A/B and Fast Launch Engine (4)</summary>

<a id="d-fcd152c027c10d9f3833"></a>
- [ ] **D-fcd152c027c10d9f3833** - direct mod-impact CLI
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-4 — direct A/B and Fast Launch Engine
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 869-869](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L869-L869)

<a id="d-8aa40a7a2fdc34398494"></a>
- [ ] **D-8aa40a7a2fdc34398494** - reusable compatible baseline
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-4 — direct A/B and Fast Launch Engine
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 870-870](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L870-L870)

<a id="d-431068672274b29d5b19"></a>
- [ ] **D-431068672274b29d5b19** - repeated/noise-aware comparisons
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-4 — direct A/B and Fast Launch Engine
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 872-872](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L872-L872)

<a id="d-00127be71a0292281fb9"></a>
- [ ] **D-00127be71a0292281fb9** - automatic cleanup/recovery
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-4 — direct A/B and Fast Launch Engine
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 873-873](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L873-L873)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-6 — AI bundle + polish (2)</summary>

<a id="d-2130eb6d459fb91bd12e"></a>
- [ ] **D-2130eb6d459fb91bd12e** - diagnostic bundle CLI
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-6 — AI bundle + polish
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 885-885](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L885-L885)

<a id="d-aa89cf21c838098771b9"></a>
- [ ] **D-aa89cf21c838098771b9** - generated CLI docs/examples
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-6 — AI bundle + polish
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 888-888](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L888-L888)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 16. Exact first Codex implementation slice (1)</summary>

<a id="d-ec1ab6ae9b8a4fad42fe"></a>
- [ ] **D-ec1ab6ae9b8a4fad42fe** - Do not call this full CLI parity after the first slice. The first slice establishes architecture and proof; Phase CLI-1 closes the remaining domain surface.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 16. Exact first Codex implementation slice
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 915-915](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L915-L915)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 17. Definition of done (4)</summary>

<a id="d-6965db48b873b31f0eef"></a>
- [ ] **D-6965db48b873b31f0eef** - GUI and CLI use the same domain logic and safety rules.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Definition of done
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 924-924](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L924-L924)

<a id="d-f53530eee7e19179421e"></a>
- [ ] **D-f53530eee7e19179421e** - Performance Lab can be run entirely from CLI/CI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Definition of done
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 925-925](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L925-L925)

<a id="d-bc6a3b328572ea5da33b"></a>
- [ ] **D-bc6a3b328572ea5da33b** - Minecraft can be launched and deterministically controlled for supported test scenarios from CLI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Definition of done
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 926-926](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L926-L926)

<a id="d-f2897e942110f6ddeccd"></a>
- [ ] **D-f2897e942110f6ddeccd** - CLI parity is automatically enforced in CI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Definition of done
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 929-929](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L929-L929)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Product goal (1)</summary>

<a id="d-ebc24e1edb086387dc93"></a>
- [ ] **D-ebc24e1edb086387dc93** - The Testing workspace must let a user answer, with evidence:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Product goal
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 11-11](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L11-L11)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 19. CLI / automation contract (2)</summary>

<a id="d-59c4bee9fffc1b65ee93"></a>
- [ ] **D-59c4bee9fffc1b65ee93** - The GUI and headless paths must call the same conversion service.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 19. CLI / automation contract
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 857-857](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L857-L857) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 883-883](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L883-L883) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 959-959](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L959-L959) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 959-959](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L959-L959)

<a id="d-032d1ad753d18709da22"></a>
- [ ] **D-032d1ad753d18709da22** - Exit codes/result JSON must distinguish:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 19. CLI / automation contract
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 876-876](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L876-L876) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 902-902](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L902-L902) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 978-978](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L978-L978) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 978-978](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L978-L978)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 5. TARGET-FIRST UNIVERSAL VERSION / LOADER MATRIX / 5.1 User modes (1)</summary>

<a id="d-51eb6ad02808db6b26ab"></a>
- [ ] **D-51eb6ad02808db6b26ab** - Headless/CLI must never wait for UI input:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 5. TARGET-FIRST UNIVERSAL VERSION / LOADER MATRIX / 5.1 User modes
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 262-262](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L262-L262) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 666-666](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L666-L666)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-12 — Implement isolated secondary-cell orchestration after primary certification (1)</summary>

<a id="d-eed92e4029c14202a9f7"></a>
- [ ] **D-eed92e4029c14202a9f7** - Run the same parity, correctness, runtime and performance gates per claimed cell; do not assume a passing sibling proves this cell.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-12 — Implement isolated secondary-cell orchestration after primary certification
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 269-269](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L269-L269)

</details>

<a id="test-05-details"></a>
## TEST-05 - Artifact-bound native proof

[Outcome](Checklist.md#test-05) / 41 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 7. Prompt compiler (1)</summary>

<a id="d-62f7f0e16bbec541269d"></a>
- [ ] **D-62f7f0e16bbec541269d** - require before/after proof;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Prompt compiler
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 273-273](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L273-L273)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 21. Security and trust boundaries (1)</summary>

<a id="d-f0d649558da91ebb5c2b"></a>
- [ ] **D-f0d649558da91ebb5c2b** - Surface native libraries/coremods/agents prominently before testing/install.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. Security and trust boundaries
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 619-619](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L619-L619)

</details>

<details>
<summary>CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md / Codex Handoff — Enderloom Ultimate Minecraft Workbench / Implementation discipline (1)</summary>

<a id="d-dd267ae3a16356c6c2e0"></a>
- [ ] **D-dd267ae3a16356c6c2e0** - - Preserve existing accepted functionality. - Reuse current Rust/service/browser architecture rather than creating parallel systems. - Once canonical target + safe edit are known, ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Preserve existing accepted functionality. - Reuse current Rust/service/browser architecture rather than creating parallel systems. - Once canonical target + safe edit are known, implement rather than continuing read-only research. - Use targeted tests during iteration and broad gates at convergence. - Build a fresh runnable Enderloom artifact after implementation changes. - Exercise the actual built app/CLI path, not only unit tests. - For Minecraft behavior, use the strongest applicable native runtime proof. - Never use the user&#x27;s live instance/world as automated-test scratch space. - Never silently delete content to make conversions/ports compile. - Never call static-risk findings measured performance. - Never install an AI-returned binary before security/quarantine/validation gates. - AI cannot self-declare acceptance; only Enderloom gate evidence closes requirements. - Every recommendation must expose Why? / evidence. - Every import/conversion must classify every source file or report it as unknown/unsupported. - Never call an async/off-thread optimization successful until thread-safety and persistence gates pass. - Never call an FPS optimization successful until visual/content parity and identical-scenario comparison pass. - Generated Studio source/data stays inspectable and editable; visual authoring must not create a black-box prison. - Config migration must preserve user intent and upstream evolution through explicit three-way semantics. - Evidence Brain cannot promote AI/web/community text to verified truth without real evidence/challenge. - Never lower the final quality/acceptance contract merely because a headless or faster route exists. - Every material checkpoint must preserve exact repo/branch/commit and next action.
  - **Binding context:** Codex Handoff — Enderloom Ultimate Minecraft Workbench / Implementation discipline
  - **Original specification:** [CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md : 294-314](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md#L294-L314)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 0. ASTRA RUN CONTRACT / 0.4 Evidence ledger (1)</summary>

<a id="d-b400a696e0a454188fc8"></a>
- [ ] **D-b400a696e0a454188fc8** - strongest applicable runtime proof;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. ASTRA RUN CONTRACT / 0.4 Evidence ledger
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md : 64-64](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L64-L64)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 21. GOLDEN CHALLENGE MATRIX (2)</summary>

<a id="d-35f949d67694af276cf9"></a>
- [ ] **D-35f949d67694af276cf9** - Broken JAR: PI-020..021 plus applicable runtime proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. GOLDEN CHALLENGE MATRIX
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: GX-04 : 658-658](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L658-L658)

<a id="d-4b358643c74f1ed9046e"></a>
- [ ] **D-4b358643c74f1ed9046e** - World recovery: PN-010 on a broken copied world with reopen/restart proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. GOLDEN CHALLENGE MATRIX
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: GX-10 : 664-664](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L664-L664)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / Enderloom Conversion Ecosystem Integration Directive — 2026-09-23 / Objective (1)</summary>

<a id="d-c0ce3063a6254fcc4eb3"></a>
- [ ] **D-c0ce3063a6254fcc4eb3** - Every third-party integration must improve one or more of those stages while preserving Enderloom&#x27;s existing zero-loss, no-guess, runtime-proof requirements.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Conversion Ecosystem Integration Directive — 2026-09-23 / Objective / Enderloom Studio - Complete Advent of Ascension and Ship the Studio / Objective
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md : 17-17](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L17-L17) / [ENDERLOOM_STUDIO_EXECUTION.md : 17-17](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L17-L17)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5B. Production completion hardening - revision 3 / 5B.8 Executable production hardening (1)</summary>

<a id="d-1482a4a296e7151567eb"></a>
- [ ] **D-1482a4a296e7151567eb** - - Prove 5B.6&#x27;s clean-workspace cold and warm/offline replay on affected claimed platforms. Remove only owned test outputs/caches; no hidden developer environment or hand-fixed...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** - Prove 5B.6&#x27;s clean-workspace cold and warm/offline replay on affected claimed platforms. Remove only owned test outputs/caches; no hidden developer environment or hand-fixed target tree may be required.
  - **Binding context:** 5B. Production completion hardening - revision 3 / 5B.8 Executable production hardening / 5B. Production requirements / 5B.8 Executable production hardening
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T122 : 789-789](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L789-L789) / [ENDERLOOM_STUDIO_EXECUTION.md :: T122 : 950-950](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L950-L950)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 6. Verification gates (1)</summary>

<a id="d-9af272c2da98599de849"></a>
- [ ] **D-9af272c2da98599de849** - GATE — each changed conversion lane has targeted tests plus the strongest applicable real Minecraft runtime proof; package/build-only evidence is not used to close runtime-sensitiv...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** GATE — each changed conversion lane has targeted tests plus the strongest applicable real Minecraft runtime proof; package/build-only evidence is not used to close runtime-sensitive work.
  - **Binding context:** 6. Verification gates
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: G006 : 803-803](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L803-L803) / [ENDERLOOM_STUDIO_EXECUTION.md :: G006 : 964-964](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L964-L964)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof / T022 — Packaged-app workflow proof (1)</summary>

<a id="d-6fb96681e733314382a3"></a>
- [ ] **D-6fb96681e733314382a3** - · Packaged-app workflow proof
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof / T022 — Packaged-app workflow proof
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T022 : 1055-1055](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L1055-L1055)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 13. Premium Testing workspace — Performance Lab / 13.1 Core flows (1)</summary>

<a id="d-e860d514e5e77760bd48"></a>
- [ ] **D-e860d514e5e77760bd48** - Compare Runs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Premium Testing workspace — Performance Lab / 13.1 Core flows
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 532-532](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L532-L532)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-4 — profiler adapters (1)</summary>

<a id="d-1a876de367f00c33761c"></a>
- [ ] **D-1a876de367f00c33761c** - richer native telemetry normalization
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-4 — profiler adapters
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1547-1547](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1547-L1547)

</details>

<details>
<summary>ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md / 3. Spellbrook-Class Server -&gt; Fully Native Mod Conversion / 3.4 Runtime proof (1)</summary>

<a id="d-7192d956501b2dae7c97"></a>
- [ ] **D-7192d956501b2dae7c97** - - dedicated-server launch; - native client launch; - integrated-server gameplay; - multiplayer sync; - persistence/restart; - deterministic visual QA; - interaction/AI/quest/item/b...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - dedicated-server launch; - native client launch; - integrated-server gameplay; - multiplayer sync; - persistence/restart; - deterministic visual QA; - interaction/AI/quest/item/block scenarios; - performance comparison; - no unresolved required asset references.
  - **Binding context:** 3. Spellbrook-Class Server -&gt; Fully Native Mod Conversion / 3.4 Runtime proof
  - **Original specification:** [ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md : 207-215](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md#L207-L215)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES (1)</summary>

<a id="d-dbbfa2631064976c8bd2"></a>
- [ ] **D-dbbfa2631064976c8bd2** - Every exact mod artifact can carry evidence-backed Client/Server/Both behavior classification with Unknown used when proof is insufficient.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2249-2249](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2249-L2249) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2249-2249](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2249-L2249)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.3 Test lanes ordered by cost / Lane 5 — real rendered native client (2)</summary>

<a id="d-9bf08caa21451319dab4"></a>
- [ ] **D-9bf08caa21451319dab4** - Bedrock should use an actual supported Windows Bedrock client/Preview build when client rendering/UI/audio proof is required.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.3 Test lanes ordered by cost / Lane 5 — real rendered native client
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4103-4103](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4103-L4103) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4103-4103](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4103-L4103)

<a id="d-c447cf73d443dc6c9ab3"></a>
- [ ] **D-c447cf73d443dc6c9ab3** - Headless success never replaces rendered-client proof for a rendering defect.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.3 Test lanes ordered by cost / Lane 5 — real rendered native client
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4105-4105](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4105-L4105) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4105-4105](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4105-L4105)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / Loader-native GameTest path (1)</summary>

<a id="d-755ed8383ba33390671a"></a>
- [ ] **D-755ed8383ba33390671a** - Do not accept 0 tests discovered as green.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / Loader-native GameTest path
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4127-4127](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4127-L4127) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4127-4127](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4127-L4127)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / Mineflayer path (1)</summary>

<a id="d-5244463c4bf1adc362d8"></a>
- [ ] **D-5244463c4bf1adc362d8** - Do not use Mineflayer as proof of Java rendering, client-only mod code, GUI rendering, or input behavior it does not actually model.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.4 Fast Java runner / Mineflayer path
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4166-4166](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4166-L4166) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4166-4166](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4166-L4166)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Fail fast on causal setup defects (1)</summary>

<a id="d-57022027ac4ba15624fd"></a>
- [ ] **D-57022027ac4ba15624fd** - If the artifact cannot load because of one missing dependency, do not launch 40 duplicate runtime shards to discover the same failure.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.10 Make it very fast without cheating / Fail fast on causal setup defects
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4477-4477](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4477-L4477) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4477-4477](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4477-L4477)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.1 Workspace identity (1)</summary>

<a id="d-99cc4d7d70ece9cd2d96"></a>
- [ ] **D-99cc4d7d70ece9cd2d96** - Top-level tab/workspace: Performance or Testing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.1 Workspace identity
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 112-112](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L112-L112)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 8. Test One Mod — direct A/B proof (2)</summary>

<a id="d-2f870a7791313ec39f0a"></a>
- [ ] **D-2f870a7791313ec39f0a** - resolve dependencies/dependents;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 337-337](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L337-L337)

<a id="d-b0279cb659b71b4c07e5"></a>
- [ ] **D-b0279cb659b71b4c07e5** - attach result to that exact mod SHA-256/version;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 349-349](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L349-L349)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 23. Reference Reconstruction Lab (1)</summary>

<a id="d-2a32671f81311bf6f512"></a>
- [ ] **D-2a32671f81311bf6f512** - Native Minecraft runtime proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Reference Reconstruction Lab
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1070-1070](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1070-L1070)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 41. Verification contract (2)</summary>

<a id="d-4c2ff15e865cf69d3dfe"></a>
- [ ] **D-4c2ff15e865cf69d3dfe** - build artifact fresh-code proof;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1524-1524](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1524-L1524)

<a id="d-a035335e7758ec834987"></a>
- [ ] **D-a035335e7758ec834987** - rollback proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1547-1547](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1547-L1547)

</details>

<details>
<summary>ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md / 9. Performance / Testing becomes the Minecraft Control Plane / 9.7 Why Enderloom should be better than the current tools (1)</summary>

<a id="d-c2edc766e7c3d00c8a58"></a>
- [ ] **D-c2edc766e7c3d00c8a58** - - PortableMC-like launch knows the exact mod/config/world evidence graph. - Ferium/packwiz-like updates automatically invalidate/re-run affected tests. - mcman-like server changes ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - PortableMC-like launch knows the exact mod/config/world evidence graph. - Ferium/packwiz-like updates automatically invalidate/re-run affected tests. - mcman-like server changes feed the same config/provenance system. - HeadlessMC-like testing can escalate to native rendered-client proof when necessary. - MCC/protocol-bot runs are marked as protocol-only evidence, never visual proof. - MCA-style world operations are transactional and tied to snapshots/rollback. - Chunky-like pregeneration records measured performance/storage evidence. - spark/JFR/heap/render/incident captures attach directly to culprit projects and Repair Jobs. - Creator Tools-like Bedrock validation/deployment feeds the same Studio/CLI/test history.
  - **Binding context:** 9. Performance / Testing becomes the Minecraft Control Plane / 9.7 Why Enderloom should be better than the current tools
  - **Original specification:** [ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md : 860-868](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md#L860-L868)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 1. Current Enderloom baseline — preserve, expand, do not restart / Existing CLI foundation (1)</summary>

<a id="d-2b745eb2d1cec857b408"></a>
- [ ] **D-2b745eb2d1cec857b408** - clap = 4.6.6 already exists in native/Cargo.toml.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Current Enderloom baseline — preserve, expand, do not restart / Existing CLI foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 28-28](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L28-L28)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 1. Current Enderloom baseline — preserve, expand, do not restart / Existing service/domain foundation (1)</summary>

<a id="d-a978093d649dccd17003"></a>
- [ ] **D-a978093d649dccd17003** - native/src/bin/enderloom-service.rs already provides a headless Rust service executable.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Current Enderloom baseline — preserve, expand, do not restart / Existing service/domain foundation
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 34-34](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L34-L34)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Global flags (1)</summary>

<a id="d-64e6da2a0fcc08eac582"></a>
- [ ] **D-64e6da2a0fcc08eac582** - --output &lt;PATH&gt; for result/artifact manifests when applicable.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Global flags
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 81-81](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L81-L81)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 7. Performance Lab CLI / Whole-pack test (1)</summary>

<a id="d-52b8183594d8c24c195a"></a>
- [ ] **D-52b8183594d8c24c195a** - --max-runs can bound exploratory mode, but never silently converts a requested exhaustive run into sampling.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Performance Lab CLI / Whole-pack test
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 477-477](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L477-L477)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 14. CLI test matrix / Performance proof (2)</summary>

<a id="d-7929bddcde39ccee2bb3"></a>
- [ ] **D-7929bddcde39ccee2bb3** - deliberate server tick regression detected
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Performance proof
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 802-802](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L802-L802)

<a id="d-f5cb1a48e5b1b4bbee24"></a>
- [ ] **D-f5cb1a48e5b1b4bbee24** - noisy A/B run repeats automatically until configured confidence/rule is met
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. CLI test matrix / Performance proof
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 807-807](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L807-L807)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 17. Definition of done (1)</summary>

<a id="d-e1ed3c4462379f427ff2"></a>
- [ ] **D-e1ed3c4462379f427ff2** - A normal user can perform all meaningful launcher/mod/server/testing operations without opening the GUI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Definition of done
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 923-923](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L923-L923)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 12. Testing engine — headless first, native when it matters / Lane 5 — restart/persistence (1)</summary>

<a id="d-bbb1aec512026369b483"></a>
- [ ] **D-bbb1aec512026369b483** - Required for config/save/state/registry migration behavior.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 12. Testing engine — headless first, native when it matters / Lane 5 — restart/persistence
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 589-589](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L589-L589) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 615-615](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L615-L615) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 691-691](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L691-L691) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 691-691](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L691-L691)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md / 5. SETTINGS / QOL — MAKE THIS FEEL OBVIOUS, NOT TECHNICAL (1)</summary>

<a id="d-d737e16ae6c927e9ee01"></a>
- [ ] **D-d737e16ae6c927e9ee01** - - Project setting can override global setting. - User can reset project behavior back to global/default. - User can change the setting before starting a job. - Post-target prompt i...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Project setting can override global setting. - User can reset project behavior back to global/default. - User can change the setting before starting a job. - Post-target prompt includes a clear estimate/count, e.g. Build 7 additional supported targets. - Show exact versions/loaders before starting fan-out; allow quick uncheck/exclude. - Remember exclusions per project only when the user chooses to remember them. - Headless/CLI/automation mode must never hang waiting for a prompt: - use explicit CLI mode if supplied; - otherwise project setting; - otherwise global setting; - otherwise target-only for noninteractive execution. - Add one-click actions: - Build all supported - Build failed only - Build selected - Open artifacts - Copy matrix report - Let the user stop remaining secondary cells without invalidating the already-verified primary artifact.
  - **Binding context:** 5. SETTINGS / QOL — MAKE THIS FEEL OBVIOUS, NOT TECHNICAL
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md : 205-222](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md#L205-L222)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md / 10. VERIFICATION — THIS FEATURE IS NOT DONE AT &quot;COMPILES&quot; (1)</summary>

<a id="d-d8ea2e87f88aa7e87ee4"></a>
- [ ] **D-d8ea2e87f88aa7e87ee4** - Do not label a matrix cell Passed if its strongest required runtime gate was skipped. Use a truthful state such as Built - runtime unverified if the environment prevents runtime pr...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Do not label a matrix cell Passed if its strongest required runtime gate was skipped. Use a truthful state such as Built - runtime unverified if the environment prevents runtime proof.
  - **Binding context:** 10. VERIFICATION — THIS FEATURE IS NOT DONE AT &quot;COMPILES&quot;
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md : 427-427](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md#L427-L427)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 4. COMPLETE-LINEAGE RULE — CONVERT THE MOD, NOT ONE RANDOM BRANCH / 4.2 Inclusion policy (1)</summary>

<a id="d-08830c234b8c42e8f858"></a>
- [ ] **D-08830c234b8c42e8f858** - Never treat not present in newest branch as proof the author wanted it gone.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 4. COMPLETE-LINEAGE RULE — CONVERT THE MOD, NOT ONE RANDOM BRANCH / 4.2 Inclusion policy
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 214-214](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L214-L214) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 618-618](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L618-L618)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release (1)</summary>

<a id="d-462cf4b0ed6bb7fc5f44"></a>
- [ ] **D-462cf4b0ed6bb7fc5f44** - native client used when required.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 950-950](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L950-L950) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1354-1354](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1354-L1354)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.1 Progress rules (1)</summary>

<a id="d-213d29ad810ebe67dc55"></a>
- [ ] **D-213d29ad810ebe67dc55** - - [ ] = not complete. It may be pending, active, or blocked. - [x] = complete only when the stated Done condition is satisfied and evidence is written into the task. - For the one ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - [ ] = not complete. It may be pending, active, or blocked. - [x] = complete only when the stated Done condition is satisfied and evidence is written into the task. - For the one task currently being worked, add State: IN PROGRESS under it. - For a blocked task, leave it unchecked and add State: BLOCKED — &lt;exact reason&gt; plus the exact next action that would unblock it. - Replace every Evidence: TODO with concrete file paths, test names/results, run IDs, hashes, screenshots/log paths, or artifact names before checking the task. - A scaffold, mock, placeholder, dead button, compile-only success, TODO comment, or untested code path does not satisfy a checkbox. - Do not check a parent task while any required child behavior is still missing. - Do not mark work complete because a different version/loader happens to pass. The requested primary target must pass first, and every claimed matrix cell must carry its own evidence. - Keep the detailed rules in Sections 1–15 intact. This board is the execution index; those sections are the acceptance contract. - Do not ask the user to re-decide engineering details already resolved by this file or discoverable from the repository/runtime. Choose the safest complete implementation and keep moving unless a genuinely user-only choice blocks correctness. - Once an NP task has enough evidence to identify the safe edit set, implement it immediately; do not substitute another plan, issue list, architecture memo, or research loop for the work.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.1 Progress rules
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 26-36](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L26-L36)

</details>

<details>
<summary>Enderloom Ultimate Minecraft Workbench — Codex Handoff Checkpoint — 2026-09-07.txt /  (1)</summary>

<a id="d-080f4d83b2f35c486296"></a>
- [ ] **D-080f4d83b2f35c486296** - QUALITY BAR No dead buttons. No fake progress. No fake provider success. No fake measured metrics. No silent content loss in ports/conversions. No live instance/world as automated ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** QUALITY BAR No dead buttons. No fake progress. No fake provider success. No fake measured metrics. No silent content loss in ports/conversions. No live instance/world as automated test scratch space. No AI-returned artifact installed before verification. Preserve exact hashes, source provenance, rollback, licenses and user edits. Use dedicated-server/native-client/integrated-server proof where applicable. Every recommendation needs a Why/evidence path. GUI and CLI share the same native domain logic. Enderloom itself must stay fast on enormous packs, catalogs and worlds.
  - **Binding context:** 
  - **Original specification:** [Enderloom Ultimate Minecraft Workbench — Codex Handoff Checkpoint — 2026-09-07.txt : 52-53](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/Enderloom%20Ultimate%20Minecraft%20Workbench%20%E2%80%94%20Codex%20Handoff%20Checkpoint%20%E2%80%94%202026-09-07.txt#L52-L53)

</details>

<details>
<summary>MC-26.3-APEX-HARDENING-2026-09-22.md / Minecraft 26.3 Apex Hardening — 2026-09-22 / Runtime boundary (1)</summary>

<a id="d-b20fb739b887534bc7ab"></a>
- [ ] **D-b20fb739b887534bc7ab** - These gates are intentionally pre-runtime evidence. A static PASS still does not replace required dedicated-server, native-client/integrated-server, Mixin PREPARE/APPLY, gameplay, ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** These gates are intentionally pre-runtime evidence. A static PASS still does not replace required dedicated-server, native-client/integrated-server, Mixin PREPARE/APPLY, gameplay, visual, networking, save/config, or restart proof.
  - **Binding context:** Minecraft 26.3 Apex Hardening — 2026-09-22 / Runtime boundary
  - **Original specification:** [MC-26.3-APEX-HARDENING-2026-09-22.md : 44-44](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/MC-26.3-APEX-HARDENING-2026-09-22.md#L44-L44)

</details>

<a id="test-06-details"></a>
## TEST-06 - Compatibility and hostile fixtures

[Outcome](Checklist.md#test-06) / 19 source-derived details.

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 3. Execution work / 3.2 Ingest MC Mod Porter under the granted permission (1)</summary>

<a id="d-8b6aad71938511771566"></a>
- [ ] **D-8b6aad71938511771566** - · Run MC Mod Porter&#x27;s own tests plus Enderloom differential fixtures. Any behavior intentionally changed by hardening must have an explicit stronger Enderloom test proving why...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** · Run MC Mod Porter&#x27;s own tests plus Enderloom differential fixtures. Any behavior intentionally changed by hardening must have an explicit stronger Enderloom test proving why.
  - **Binding context:** 3. Execution work / 3.2 Ingest MC Mod Porter under the granted permission
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T015 : 467-467](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L467-L467) / [ENDERLOOM_STUDIO_EXECUTION.md :: T015 : 629-629](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L629-L629)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 3. Execution work / 3.3 Merge ModForge&#x27;s deterministic truth model with Enderloom (1)</summary>

<a id="d-dd03be9fafb42f7d45e2"></a>
- [ ] **D-dd03be9fafb42f7d45e2** - · Build a differential harness: feed the same symbol/mapping/JAR fixtures through Enderloom and ModForge; compare owner, name, descriptor, inheritance, overload, candidate, and unr...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** · Build a differential harness: feed the same symbol/mapping/JAR fixtures through Enderloom and ModForge; compare owner, name, descriptor, inheritance, overload, candidate, and unresolved results.
  - **Binding context:** 3. Execution work / 3.3 Merge ModForge&#x27;s deterministic truth model with Enderloom
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T017 : 472-472](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L472-L472) / [ENDERLOOM_STUDIO_EXECUTION.md :: T017 : 634-634](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L634-L634)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 4. Regression corpus — every outside tool must make Enderloom measurably stronger (8)</summary>

<a id="d-b16e33d72a832f698335"></a>
- [ ] **D-b16e33d72a832f698335** - · Add a small source-based Fabric version-hop fixture spanning pre-26.x -&gt; 26.x with mappings, Mixins, AW/ClassTweaker, resources, metadata, and a real client path.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T060 : 539-539](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L539-L539) / [ENDERLOOM_STUDIO_EXECUTION.md :: T060 : 701-701](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L701-L701)

<a id="d-7b715237c8628bc81b78"></a>
- [ ] **D-7b715237c8628bc81b78** - · Add a Fabric Kotlin fixture to exercise Ravel/PSI mapping migration where Loom alone is insufficient.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T061 : 540-540](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L540-L540) / [ENDERLOOM_STUDIO_EXECUTION.md :: T061 : 702-702](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L702-L702)

<a id="d-6a2209e1b519ab136629"></a>
- [ ] **D-6a2209e1b519ab136629** - · Add a NeoForge source fixture exercising NeoFormRuntime/JST/ART, ATs, Mixins, registries, datagen, and runtime.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T062 : 541-541](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L541-L541) / [ENDERLOOM_STUDIO_EXECUTION.md :: T062 : 703-703](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L703-L703)

<a id="d-9dcad0b1b2f985f3599b"></a>
- [ ] **D-9dcad0b1b2f985f3599b** - · Add Forge/NeoForge -&gt; Fabric and Fabric -&gt; NeoForge fixtures containing loader-specific events/registrations/config/dependencies so compatibility knowledge is tested semant...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** · Add Forge/NeoForge -&gt; Fabric and Fabric -&gt; NeoForge fixtures containing loader-specific events/registrations/config/dependencies so compatibility knowledge is tested semantically, not just by compilation.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T063 : 542-542](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L542-L542) / [ENDERLOOM_STUDIO_EXECUTION.md :: T063 : 704-704](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L704-L704)

<a id="d-0fce7cf607a590bbea7b"></a>
- [ ] **D-0fce7cf607a590bbea7b** - · Add a 1.7.10 Forge fixture through RetroFuturaGradle and a legacy Unimined fixture.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T065 : 544-544](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L544-L544) / [ENDERLOOM_STUDIO_EXECUTION.md :: T065 : 706-706](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L706-L706)

<a id="d-dc7f045249e9a12ea71c"></a>
- [ ] **D-dc7f045249e9a12ea71c** - · Add a Java/classfile backport fixture through JvmDowngrader with target-runtime linkage and launch proof.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T066 : 545-545](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L545-L545) / [ENDERLOOM_STUDIO_EXECUTION.md :: T066 : 707-707](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L707-L707)

<a id="d-a36408bb5d099ff6e6e8"></a>
- [ ] **D-a36408bb5d099ff6e6e8** - · Add a multi-version Stonecutter + Modstitch fixture producing at least Fabric and NeoForge cells and proving stale-cell incremental rebuild behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T067 : 546-546](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L546-L546) / [ENDERLOOM_STUDIO_EXECUTION.md :: T067 : 708-708](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L708-L708)

<a id="d-5527572afbd3155c5d2f"></a>
- [ ] **D-5527572afbd3155c5d2f** - · Add a Forgix convenience-jar fixture only after its 26.x regression is proven fixed or safely routed around.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Regression corpus — every outside tool must make Enderloom measurably stronger
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T068 : 547-547](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L547-L547) / [ENDERLOOM_STUDIO_EXECUTION.md :: T068 : 709-709](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L709-L709)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5A. Second-sweep integration expansion - revision 2 / 5A.8 Executable additions for Codex / D. World safety, proof and delivery (1)</summary>

<a id="d-8574c07c0d1f02a52203"></a>
- [ ] **D-8574c07c0d1f02a52203** - - Add registry regression fixtures for two same-name PortKit projects, moved Mecha/Class Tweaker sources, a Codeberg access failure, stale release-page dates versus actual build ti...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** - Add registry regression fixtures for two same-name PortKit projects, moved Mecha/Class Tweaker sources, a Codeberg access failure, stale release-page dates versus actual build timestamps, and a restricted license. Unknown/offline must not become absent, unsupported or permission-granted.
  - **Binding context:** 5A. Second-sweep integration expansion - revision 2 / 5A.8 Executable additions for Codex / D. World safety, proof and delivery / 5A. Specialized engines and integration tasks / 5A.8 Specialized integration implementation / D. World safety, proof and delivery
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T111 : 708-708](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L708-L708) / [ENDERLOOM_STUDIO_EXECUTION.md :: T111 : 870-870](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L870-L870)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 18. Profiler/instrumentation stack / 18.4 Observable adapter (1)</summary>

<a id="d-2e2dbf811cf3539ee83c"></a>
- [ ] **D-2e2dbf811cf3539ee83c** - never required for ordinary Testing success.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Profiler/instrumentation stack / 18.4 Observable adapter
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 816-816](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L816-L816)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence (1)</summary>

<a id="d-e35bfcda6d27419056fc"></a>
- [ ] **D-e35bfcda6d27419056fc** - interaction tests
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1553-1553](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1553-L1553)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard (2)</summary>

<a id="d-bb1cf67c68929a6bd558"></a>
- [ ] **D-bb1cf67c68929a6bd558** - queued/running tests;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 135-135](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L135-L135)

<a id="d-358f707dd765e5865166"></a>
- [ ] **D-358f707dd765e5865166** - recent completed tests;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 136-136](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L136-L136)

</details>

<details>
<summary>ENDERLOOM_STUDIO_EXECUTION.md / 0. Codex launch contract - implement, verify, finish / 0.8 Universal capability, ease of use and product proof / Any mod and any Minecraft version (1)</summary>

<a id="d-10a24ebd4375f1038e03"></a>
- [ ] **D-10a24ebd4375f1038e03** - Test all registered target-adapter families and required requested cells, with both migration directions where claimed, unsupported constructs, metadata updates, unmapped symbols a...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Test all registered target-adapter families and required requested cells, with both migration directions where claimed, unsupported constructs, metadata updates, unmapped symbols and dependency gaps. Keep a living per-project capability/test matrix, and expand it when a job exposes a new feature. A few fixtures cannot establish universal correctness, but they must not be used to restrict the product to toy examples. Complete required target jobs by repairing the shared path; expose real external requirements truthfully.
  - **Binding context:** 0. Codex launch contract - implement, verify, finish / 0.8 Universal capability, ease of use and product proof / Any mod and any Minecraft version
  - **Original specification:** [ENDERLOOM_STUDIO_EXECUTION.md : 210-210](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L210-L210)

</details>

<details>
<summary>ENDERLOOM_STUDIO_EXECUTION.md / 5A. Specialized engines and integration tasks / 5A.7 Source coverage and provenance (1)</summary>

<a id="d-cd50715f5cc294676fa9"></a>
- [ ] **D-cd50715f5cc294676fa9** - | Surface | Observed outcome | Honest completeness boundary | | --- | --- | --- | | GitHub and primary project docs | Repository, license, release and source references are supplie...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** | Surface | Observed outcome | Honest completeness boundary | | --- | --- | --- | | GitHub and primary project docs | Repository, license, release and source references are supplied. | Resolve exact pinned code and run the required fixtures; do not infer complete host enumeration or runtime proof. | | Gradle/plugin and publisher pages | Dated artifact/source observations are supplied. | A release listing does not certify Enderloom compatibility; validate each exact target pair. | | Codeberg/Forgejo | Indexed/owner-linked coverage only; direct access was unavailable during source collection. | Incomplete host coverage. Failed access is not an empty result. Use a changed supported route or network state; do not loop unchanged failures. | | GitLab and other hosting | Partial indexed references. | Discover reusable engines without misclassifying individual mod ports as general converters. | | Restricted/private/commercial/Discord-only material | Only public evidence and the user&#x27;s explicit MC Mod Porter grant used. | No claim to have inspected inaccessible private source or obtained rights not provided by the owner/user. |
  - **Binding context:** 5A. Specialized engines and integration tasks / 5A.7 Source coverage and provenance
  - **Original specification:** [ENDERLOOM_STUDIO_EXECUTION.md : 811-817](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L811-L817)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 38. Micro-QOL saturation pass (1)</summary>

<a id="d-ea579d1dacc58eac8433"></a>
- [ ] **D-ea579d1dacc58eac8433** - Ctrl/Shift multi-select and bulk install/test/update.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 38. Micro-QOL saturation pass
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1437-1437](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1437-L1437)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Instrumentation stack / D. Observable adapter (1)</summary>

<a id="d-a3c0ad868bf11cab26ab"></a>
- [ ] **D-a3c0ad868bf11cab26ab** - Do not make Observable a mandatory dependency for basic testing because compatibility differs by Minecraft/loader version.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Instrumentation stack / D. Observable adapter
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 182-182](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L182-L182)

</details>

<a id="test-07-details"></a>
## TEST-07 - Results and repeatability

[Outcome](Checklist.md#test-07) / 9 source-derived details.

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 3. Execution work / 3.10 Conversion planner and user experience (1)</summary>

<a id="d-faaa522f0e2ee3cbd7c4"></a>
- [ ] **D-faaa522f0e2ee3cbd7c4** - · Add machine-readable conversion status/report output that includes source authority, target cell, content parity counts, transformations, exact/candidate/unresolved items, depend...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** · Add machine-readable conversion status/report output that includes source authority, target cell, content parity counts, transformations, exact/candidate/unresolved items, dependencies, tool versions/hashes, build result, runtime result, performance result, and final artifact hash.
  - **Binding context:** 3. Execution work / 3.10 Conversion planner and user experience
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T056 : 532-532](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L532-L532) / [ENDERLOOM_STUDIO_EXECUTION.md :: T056 : 694-694](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L694-L694)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-1 — foundation (1)</summary>

<a id="d-01b7cb9be8446418a75c"></a>
- [ ] **D-01b7cb9be8446418a75c** - persistent history
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-1 — foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1517-1517](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1517-L1517)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-2 — direct A/B (1)</summary>

<a id="d-e4f5f66887f6e2d137c8"></a>
- [ ] **D-e4f5f66887f6e2d137c8** - baseline reuse
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-2 — direct A/B
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1526-1526](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1526-L1526)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence (1)</summary>

<a id="d-1cb5fbba52b750203983"></a>
- [ ] **D-1cb5fbba52b750203983** - confidence/noise engine
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase Testing-5 — whole-pack intelligence
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1555-1555](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1555-L1555)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard (1)</summary>

<a id="d-0dbe5d9c418b7ee96976"></a>
- [ ] **D-0dbe5d9c418b7ee96976** - latest baseline;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 123-123](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L123-L123)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 9. Test All Mods — adaptive whole-pack isolation (1)</summary>

<a id="d-d6411c4a169ed8e5803b"></a>
- [ ] **D-d6411c4a169ed8e5803b** - retain completed results if the batch stops.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 370-370](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L370-L370)

</details>

<details>
<summary>ENDERLOOM_STUDIO_EXECUTION.md / 0. Codex launch contract - implement, verify, finish / 0.8 Universal capability, ease of use and product proof / It-just-works defaults (1)</summary>

<a id="d-8cb1ad61a14e0748d9b0"></a>
- [ ] **D-8cb1ad61a14e0748d9b0** - A details drawer contains logs, dependency/mapping provenance and test output for experts. The main UI answers: what is this, what can I do, what is happening, what needs me, and w...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** A details drawer contains logs, dependency/mapping provenance and test output for experts. The main UI answers: what is this, what can I do, what is happening, what needs me, and where is my result? Internal task IDs, checklist ledgers and agent administrative language do not belong in ordinary screens.
  - **Binding context:** 0. Codex launch contract - implement, verify, finish / 0.8 Universal capability, ease of use and product proof / It-just-works defaults
  - **Original specification:** [ENDERLOOM_STUDIO_EXECUTION.md : 218-218](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L218-L218)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior (2)</summary>

<a id="d-b94b49aa97b808880498"></a>
- [ ] **D-b94b49aa97b808880498** - target-only
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 227-227](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L227-L227)

<a id="d-b828463211f257af55d2"></a>
- [ ] **D-b828463211f257af55d2** - precedence: current-run &gt; project &gt; global &gt; ask;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 230-230](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L230-L230)

</details>

<a id="test-08-details"></a>
## TEST-08 - Machine-verifiable release gates

[Outcome](Checklist.md#test-08) / 9 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 2. One repair job, one durable state machine (1)</summary>

<a id="d-0b475f13411843521fb4"></a>
- [ ] **D-0b475f13411843521fb4** - testing
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 58-58](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L58-L58)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5B. Production completion hardening - revision 3 / 5B.8 Executable production hardening (1)</summary>

<a id="d-048c24ae331ee3bb5cfa"></a>
- [ ] **D-048c24ae331ee3bb5cfa** - - Extend the existing acceptance verifier with a machine-readable nonzero-failing completion check binding requirements, dispositions, hashes, runtime, parity and benchmarks. Add n...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** - Extend the existing acceptance verifier with a machine-readable nonzero-failing completion check binding requirements, dispositions, hashes, runtime, parity and benchmarks. Add negative controls for missing/skipped/stale proof, wrong artifacts, falsely demoted mandatory backends and partial results marked Complete. Check production evidence, not checkbox wording alone.
  - **Binding context:** 5B. Production completion hardening - revision 3 / 5B.8 Executable production hardening / 5B. Production requirements / 5B.8 Executable production hardening
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md :: T123 : 790-790](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L790-L790) / [ENDERLOOM_STUDIO_EXECUTION.md :: T123 : 951-951](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L951-L951)

</details>

<details>
<summary>ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md / Enderloom — Minecraft Dev Kit Workflow Challenge Pass (1)</summary>

<a id="d-2e213458422a4ed4c73f"></a>
- [ ] **D-2e213458422a4ed4c73f** - This challenge pass focuses specifically on recurring real Minecraft Dev Kit work patterns that Enderloom must absorb explicitly rather than leaving them implied by broad labels su...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** This challenge pass focuses specifically on recurring real Minecraft Dev Kit work patterns that Enderloom must absorb explicitly rather than leaving them implied by broad labels such as “Performance Lab” or “Testing”.
  - **Binding context:** Enderloom — Minecraft Dev Kit Workflow Challenge Pass
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 8-8](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L8-L8)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 35. Release/QA contract / Existing release gates to preserve (1)</summary>

<a id="d-c62ff5db52da1ead190c"></a>
- [ ] **D-c62ff5db52da1ead190c** - Electron self-test;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Existing release gates to preserve
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1429-1429](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1429-L1429)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 35. Release/QA contract / Add for CLI/Testing (1)</summary>

<a id="d-5fc40b52790efef06d54"></a>
- [ ] **D-5fc40b52790efef06d54** - deliberate server tick regression detected.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. Release/QA contract / Add for CLI/Testing
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1446-1446](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1446-L1446)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK (2)</summary>

<a id="d-b12a02ded7b8e4abdf10"></a>
- [ ] **D-b12a02ded7b8e4abdf10** - Enderloom should be able to run hundreds or thousands of conversion checks quickly from the CLI/API while preserving the stronger native runtime gates required for release.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 3892-3892](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L3892-L3892) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 3892-3892](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L3892-L3892)

<a id="d-de2ad24aaea03a1c98d3"></a>
- [ ] **D-de2ad24aaea03a1c98d3** - This testing capability belongs inside Enderloom&#x27;s existing canonical project/job/evidence system. Do not create a second test-product architecture, daemon, database, or state...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** This testing capability belongs inside Enderloom&#x27;s existing canonical project/job/evidence system. Do not create a second test-product architecture, daemon, database, or state machine just because the runners are diverse.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 3894-3894](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L3894-L3894) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 3894-3894](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L3894-L3894)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Output discipline (1)</summary>

<a id="d-49f1f18368c64df32619"></a>
- [ ] **D-49f1f18368c64df32619** - Never mix ANSI progress bars into machine-readable output.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Output discipline
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 90-90](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L90-L90)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release (1)</summary>

<a id="d-81adc6176318b9940995"></a>
- [ ] **D-81adc6176318b9940995** - final report matches actual artifacts on disk.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 953-953](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L953-L953) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1357-1357](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1357-L1357)

</details>

