# Horizon Rust Compatibility

**Status: planned research and implementation; not yet available in Enderloom.**

[Horizon](https://github.com/horizon-rust/horizon) is an unofficial, native Rust reimplementation targeting Minecraft Java Edition 26.3. Its maintainers describe a launcher, client and server, with owned Minecraft assets and a Microsoft account that owns Java Edition. Their claims require independent Enderloom testing. Its documented native mod formats are content mods (.hmod) and Rust mods (.hnmod). Horizon states that Java Fabric, Forge and NeoForge mod code does not run; importing a Java modpack's data and assets is not equivalent to executing its mods.

## Required Enderloom outcome

- Add Horizon to the planned installable and moddable Minecraft targets, with verified official release discovery, platform and ownership prerequisites, checksum verification, isolated profiles, updates, rollback and recovery.
- Aim to load and fully test mods from any Minecraft version and diagnose, fix and port mods to any other version, including Fabric, Forge and NeoForge. Complete Horizon compatibility with these Java mods is a research and development goal, not an existing feature or a verified guarantee.
- Investigate a Java execution and loader compatibility layer, semantics-preserving bridge or port, alongside actual version-matched Minecraft runtimes. Rust does not execute JVM bytecode or loader APIs automatically. Preserve code, dependencies, mixins, data, assets, behavior and worlds; show exact unsupported cases rather than dropping content silently.
- Evaluate Horizon's documented horizon-ctl as an isolated internal game-test backend. Route other versions and loader types to the appropriate actual runtime. Horizon alone cannot validate every Java mod or game version.
- Prove each version/loader combination with representative real mods, actual gameplay, diagnostics, repair and cross-version tests, recorded artifact identities, cleanup and reproducibility. Keep real user saves and originals safe.

See the [launcher contract](https://github.com/Herbertofury/Enderloom/blob/main/docs/LAUNCHER_PARITY_MATRIX.md) for the planned target and acceptance gates.
