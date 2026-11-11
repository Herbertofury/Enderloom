# Enderloom Northpoint v6.3 — Recovery Checkpoint

Date: 2026-09-22
Repository: Herbertofury/Enderloom
Branch: main
Current head: 6a88c0dfc613abbbb89c8167ab8de4205af145cd
Latest CI run: 35776273612 (queued at checkpoint time)
Workflow: Enderloom Northpoint CI

## Completed / do not redo

- Source intake worker detects conventional Minecraft mod projects read-only and infers build system, loader, source Minecraft, Java, mod id, metadata and mixin counts.
- Convert Mod source selection immediately performs source intake and surfaces detected project details.
- Production driver can infer configuration when northpoint.project.json is absent.
- Runtime-unverified candidate JARs are preserved with exact SHA-256 instead of discarded.
- Runner separates immutable artifact-input fingerprinting from environment/toolchain fingerprinting so verified artifacts are not rebuilt for harmless environment probe changes while blocked/runtime-unverified cells retry when the environment changes.
- Enderloom managed Java now has a dedicated JDK path (javac required) in addition to the existing runtime/JRE behavior.
- Native IPC exposes install_java_jdk and Northpoint automatically provisions exact per-cell JDK majors, including Java 25 for Minecraft 26.3/latest profiles.
- Per-cell managed Java path is carried into the job manifest and production builds/runtime commands use the pinned JDK rather than ambient PATH.
- Job runner accepts external runtime proofs only for exact artifact SHA-256 and promotes runtime-unverified -> passed without rebuilding.
- Node job bridge persists runtime proofs and re-hashes candidate bytes before accepting a proof.
- Runtime-proof bridge QA verifies wrong SHA rejection and zero-rebuild promotion.
- Native Minecraft runtime verifier is implemented in NorthpointService:
  - temporary QA instance
  - exact Minecraft + loader version
  - exact candidate JAR
  - event-driven process log/state observation
  - fatal linkage/mixin/mod-loading error detection
  - late client readiness milestone (resource reload/audio/atlas), not mere JVM/LWJGL bootstrap
  - stabilization window after readiness
  - exact runtime evidence receipt
  - SHA-bound proof recording
  - exact running-id kill/close and QA instance cleanup
  - bounded promotion loop: build -> native verify -> proof -> rerun without rebuild
- Normal Microsoft authentication is NOT reused for QA. A new native launch_instance_qa path uses an in-memory synthetic local QA identity and refuses non-"Enderloom QA " instances. Normal gameplay launch/auth behavior is unchanged.
- Convert Mod UI surfaces managed JDK provisioning and native runtime verification progress/failure/pass states.
- Targeted CI QA added for source intake, runtime proof promotion, bridge proof promotion, native runtime verifier, Rust native service compile, and official Fabric example-mod production smoke.

## Important commits in this checkpoint

- f39aa05084aeb5294df355f1913fb2ec08184f46 — runner external runtime-proof promotion
- 7e21614bfd4df6b90cbdb0ae409dc6e04d67a2af — bridge SHA-bound runtime proof persistence
- 5e7e53d522e2462af6d0cb57e20830083975ca65 — bridge hashes candidate bytes before accepting proof
- fbe531b430b6b38fea8c5159eecd44d988b83eb9 — automatic build/verify/promote loop
- 07bb6160dac4e40531d873a76be3a2d4d012177b — isolated synthetic-account native QA launch
- 2a22859750a453ffdaa726a4e308c7c6a16913a9 — restricted QA launch IPC
- 8613971aafe1be96991deaa9dd9bff848bac6ec6 — Northpoint uses restricted QA launch
- b85e38c56e5688989ff0f07500e41f1e9e67f1fc — late client milestone requirement
- 7bb4958b9ce04cf81bc039d5a8d0dae032ab14f1 — QA proves late milestone requirement
- 6a88c0dfc613abbbb89c8167ab8de4205af145cd — UI native runtime status

## Current gate / exact next action

Do NOT rescan/rebuild settled architecture. Observe GitHub Actions run 35776273612 only after its state changes. If failed, inspect the single failing job/log and patch only the causal defect, then rerun via the next commit. If green, checkpoint that CI result and proceed to the next conversion capability gap (stronger server/integrated runtime lane selection and real-world multi-loader graduation) without weakening the native-client proof just completed.

## No-repeat notes

- Do not replace preserved runtime-unverified candidates with compile-only "passed" claims.
- Do not return to ambient Java/PATH selection for production conversion cells.
- Do not make normal Minecraft launch depend on synthetic QA identity.
- Do not accept early LWJGL/JVM startup as runtime proof.
- Do not poll CI repeatedly; use one observation per real state change and continue independent work otherwise.
