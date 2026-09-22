# Embedded Minecraft Dev Kit worker

This directory is the runtime worker subset used by Enderloom Northpoint.

Normal conversion execution is locked to the trusted `production` driver profile. The fixture driver exists only for explicit QA. The worker composes common -> loader -> Minecraft-version -> exact-cell overlays, runs resumable target-first jobs, zero-loss content/registration parity, packaged linkage checks, and bounded graduation suites.

The complete versioned toolkit archive is also checkpointed in the Enderloom/Northpoint Google Drive project folder.
