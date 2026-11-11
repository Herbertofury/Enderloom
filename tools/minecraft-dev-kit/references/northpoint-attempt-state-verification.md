# Northpoint attempt-output isolation

## Defect

The prior runner updated a retained cell record with a driver's partial receipt.
When a rebuild produced no artifact, the receipt omitted the artifact field, so
the previous build's artifact metadata survived. A source-changing rebuild that
returned `runtime-unverified` without an artifact could then accept an old
artifact's SHA-bound proof and report `PASS` without building the new source.

An isolated synthetic driver reproduces this false pass through the actual
runner subprocess. This is an orchestration defect, not evidence of a particular
Minecraft mod failing in gameplay.

## Repair and upgrade behavior

- Starting a new attempt clears current artifact, conversion, evidence and
  stdout-tail fields before saving the building state. Only that attempt's
  validated result can populate them again.
- Input and environment invalidation happen before external runtime proof
  application. Invalidated builds are not reported as runtime-promoted.
- An attempt-schema value is now included in input fingerprints. Existing
  pre-fix cached cells rebuild once, including a previously false passed state.
  The session schema and recorded run history are retained.
- Previous work directories and receipts are still archived by the existing
  runner. Old release files are not deleted. Their presence alone is not release
  acceptance: a failed/artifact-less attempt has no current artifact metadata
  and contributes no release checksum entry.
- Explicit `javac` projects no longer probe unrelated global Gradle/Maven tools.
  Their first-run banners cannot make an unchanged Java candidate appear to have
  a changed build environment. Other build modes keep their existing probes.

## Verification

Run the focused regression with Python 3.12 or newer:

```sh
python tools/minecraft-dev-kit/scripts/northpoint_attempt_state_selftest.py
```

Six tests cover seven no-artifact outcomes (blocked, failed, cancelled,
runtime-unverified, invalid JSON, process failure and missing receipt), old-proof
rejection, changed-input and environment-only proof invalidation, correct
current-artifact promotion, legacy-cache invalidation, cache reuse, release
metadata/checksums and preserved history/old bytes. The
unchanged predecessor passes the valid-current-artifact control but fails the
other five tests, with eleven failing assertions/subtests including a real false
`PASS`. The first local test harness placed its control input outside composed
source, so it did not invalidate the build; the final fixture uses the actual
composed resource directory before either baseline or candidate qualification.

The existing job-runner selftest invokes these regressions. Full graduation and
its inherited Linux/Windows JDK21/JDK25 workflow therefore run them too. The
production-driver selftest additionally checks that an actual unavailable-Java
rebuild has no stale artifact or conversion metadata.

An independent replay generated both blocked-on-runtime and falsely passed
sessions using the unchanged predecessor, then resumed them with this candidate.
Both rebuilt (attempts 2 to 3), dropped the stale association, and retained all
prior runs and archived receipts. An environment-only probe change likewise
rebuilt before proof promotion while its input fingerprint stayed unchanged.

The initial hosted native lanes exposed an unrelated-tool fingerprint drift that
the initial local image, without global Gradle/Maven, did not expose. Both stopped
in the synthetic resume selftest before game launch. A controlled first-run
Gradle banner reproduces that exact assertion. Ignoring irrelevant tools for
explicit javac restores the real compiler/proof-resume test, while current-input
and environment validation remain enforced. Production-probe controls assert
that javac calls neither tool and preserve both existing probes for all other
current modes. Actual Gradle/Maven version-output normalization is not changed.

Synthetic driver receipts are labeled as such. These checks do not establish
native Minecraft, visual, audio, multiplayer or Advent of Ascension acceptance.
Existing source branches and installed products are not updated by this draft.
