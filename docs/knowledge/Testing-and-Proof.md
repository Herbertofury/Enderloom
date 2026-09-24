# Native testing and control plane

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> Cheap decisive checks during iteration; strongest required proof at certification.

### Deterministic test sandbox

[**TEST-01**](Checklist.md#test-01) - Clone/snapshot only into Enderloom-owned test space, never benchmark live saves; fingerprint full mods/config/world/scenario/Java/loader/hardware conditions.

### Scenario and GameTest compiler

[**TEST-02**](Checklist.md#test-02) - Unify declarative startup/idle/traversal/stress/soak/gameplay scenarios, setup/teardown/assertions, GameTest adapters and deterministic replay across supported targets.

### Runtime supervision and automation

[**TEST-03**](Checklist.md#test-03) - Control real client/dedicated/integrated/Bedrock processes, commands/RCON, readiness, isolated accounts where appropriate, cancellation and restart with exact process/build identity.

### Full CLI, JSON and MCP parity

[**TEST-04**](Checklist.md#test-04) - Expose every accepted domain command and job/evidence operation headlessly through the same service layer, structured events/errors/cancellation, recordable replay and CI integration.

### Artifact-bound native proof

[**TEST-05**](Checklist.md#test-05) - Bind native runs/logs/captures to exact hashes/target/dependencies; verify gameplay and persistence, not only build/menu/server-ready or a script named runtime.

### Compatibility and hostile fixtures

[**TEST-06**](Checklist.md#test-06) - Select full applicable ecosystem, provider-present/absent, platform, source/JAR, data/world, cross-loader/direction and false-success tests without sampling away required scope.

### Results and repeatability

[**TEST-07**](Checklist.md#test-07) - Keep baseline/candidate history, current/stale/confidence states, logs/profiles/screens and reproducible actions; targeted invalidation reuses only still-valid proof.

### Machine-verifiable release gates

[**TEST-08**](Checklist.md#test-08) - Fail on missing/skipped/stale/wrong-artifact evidence, no-op production paths, partial parity or unjustified demotion; a checklist tick alone cannot satisfy certification.

**[Every linked source clause](Sources-TEST.md)** / **[Source manifest](Source-Map.md)**
