# AoA original inputs acquired

Enderloom's actual download queue recovered both authoritative donors from public official sources and checked them against the handoff hashes before promoting the downloads:

| Input | Source | Bytes | SHA-256 |
|---|---|---:|---|
| AoA3-1.16.5-3.6.11.jar | CurseForge project 311054, file [4431558](https://www.curseforge.com/minecraft/mc-mods/advent-of-ascension-nevermine/files/4431558) | 137118802 | `34bd44a5118f85a7af5ff61f2186adc0e022e9ed808ced37ff648b0169b6f313` |
| Advent-Of-Ascension-1.16.5.zip | [Official 1.16.5 branch archive](https://github.com/Tslat/Advent-Of-Ascension/archive/refs/heads/1.16.5.zip) | 7630852 | `5fa90060229da0f6108f6133f63a3486c145ee4d0cfabdb4d02938d0a7411d40` |
| AoA-upstream-1.20-85d6beba.zip | [Pinned official commit](https://github.com/Tslat/Advent-Of-Ascension/commit/85d6beba07e3a09032834dcf79b5a01f411092c3) | 9604362 | `6cc7b042507fbaf34200a532f46890c8f5b362733580f3919f17eaf10b421ee4` (measured on acquisition) |

Saved in the actual user's Studio as `aoa-savior`, **AoA Savior · complete restoration**, primary target Minecraft 1.20.1 / Forge 47.4.23 / Java 17. Snapshot `30eec70089a6f2afec752c50660d472a02f8aff48b024b9d44b1a6fbb09a50de` indexes 20,705 release entries, 14,394 original source entries, and 14,972 modern reference entries. Both donor inventories were reused when adding the modern reference. Original files remain in Downloads and retained copies live under the canonical SHA-256 input store.

Artifacts: `output/aoa-donor-intake.json`, `output/playwright/aoa-studio-donors.png`. The package comparisons describe byte/path correspondence only, not lost-feature counts or a completed semantic census. Neither the source packages nor the project has been executed or promoted as a converted mod.

Still missing: the private Savior promoted checkpoint source and receipts (CP40 visual-final plus review of later CP44/entity continuations), and the private Minecraft Dev Kit bundle. Google's sign-in page is open in Enderloom. No CP1–40 restoration was discarded or redone, and no private checkpoint was silently replaced with the public modern source.
