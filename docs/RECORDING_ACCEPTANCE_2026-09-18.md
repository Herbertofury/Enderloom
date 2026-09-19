# Recorded Aether acceptance

The actual rendered Minecraft test `cfbe854f-5b91-4e1b-97d1-dc332c28614d` completed all 26 scenario steps, five screenshots, Aether travel, Gravitite Sword damage and Spark analysis. Minecraft 1.21.1, NeoForge 21.1.250, Aether 1.5.10, Spark 1.10.124, HMC 2.4.0, probe 1.0.1. The source profile's complete file fingerprint was unchanged; the owned client and encoder exited and the temporary instance was removed.

Recording remains off by default. When enabled, capture resolves a positive HWND from the owned Java PID, rejects desktop/window-title fallback, and records at 30 fps without audio. Encoder failures and finalization failures are visible in the report. A recoverable fragmented capture is retained; finalization stream-copies its encoded packets to an indexed MP4 without re-encoding. Local video responses support byte ranges, HEAD and stream cancellation. Analyze can also prepare playback for older completed captures.

The final run automatically produced a **107.367-second** H.264 recording. Real Electron playback, seek to 93 seconds, resume to 94 seconds and pause all passed without decoder errors. The full duration was available before playback. Screenshot: `output/playwright/aether-recording-final-acceptance.png`. Raw report: `output/aether-acceptance/recorded-report.json`; canonical report and original/playback videos remain in the launcher's `testing-reports/cfbe854f-5b91-4e1b-97d1-dc332c28614d` directory.

Two runtime defects were reproduced and fixed before acceptance: the probe could trigger Minecraft initialization on its telemetry worker and deadlock the game; fragmented-only playback exposed only the currently buffered duration and could not reliably seek. Failed startup `6b446520-2506-48c1-a86c-bfe7d5b81d2b` was retained and cleaned up. Its JVM thread dump is `output/aether-recording-startup-threads.txt`. The probe now waits for VM-confirmed class initialization and postpones loader hooks until a world exists. Unsupported JVM inspection fails closed with a diagnostic, never by forcing game initialization.

Verification passed:

- `minecraft-probe-qa.js` on Java 17.0.20.1, 21.0.12 and 25.0.4.1: no forced initialization, initialization-in-progress handling and resumed telemetry.
- `local-video-response-qa.js`: full, closed/open/suffix ranges, invalid/empty requests, HEAD and cancellation.
- `recording-finalization-qa.js`: identical encoded packet hashes, complete duration, early MP4 index, concurrent/idempotent analysis, original preservation and corrupt-capture reporting.
- `testing-cli-qa.js`, `testing-ui-qa.js`, native service/CLI and frontend builds.
- `aether-live-qa.js --live-account --record` followed by actual Electron playback/seek/pause.

Recording adds overhead; these measurements must not be substituted for the separate recording-off run. This completes the tested recording path for the stated environment, not every Minecraft adapter/version or the broad Testing phase. PA-004 remains the next integration dependency.

Implementation references: [OpenJDK initialization observation](https://github.com/openjdk/jdk25u/blob/master/src/java.base/share/classes/jdk/internal/misc/Unsafe.java), [FFmpeg window capture](https://ffmpeg.org/ffmpeg-devices.html#gdigrab), [FFmpeg MP4 indexing](https://ffmpeg.org/ffmpeg-formats.html#mov_002c-mp4_002c-ismv).
