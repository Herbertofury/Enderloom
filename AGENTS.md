# Repository instructions

Read `.agents/athena/AGENTS-adapter.md` for the pinned shared engineering core.
Keep this file and nested instructions project-owned: setup, commands, constraints and acceptance belong here.

## Enderloom-local scope and ownership

- Preserve the protected Catalog/Source/Browser/Full/Split research flows alongside the launcher and mod manager. Read docs/knowledge/Home.md, Architecture.md and Checklist.md plus docs/ENDERLOOM_STUDIO_EXECUTION.md. A new studio or Dev Kit capability is additive, not permission to replace existing research workflows.
- Keep catalog sources, native launcher service, accounts/instances and optional provider/media adapters independently usable. Do not make one catalog, game target, integration or hybrid feature the hidden dependency root for unrelated functionality.
- Preserve catalog-scoped favorites/notes/filter state, exact project/media ownership, complete galleries and explicit access/completeness states. Source-owned media only; icon+avatar is not a complete gallery. Failed refresh retains last-good data. Autoplay stays off unless the user's explicit setting says otherwise.
- Check open source-watcher and zero-loss Browse performance PRs before edits; this guidance does not merge or supersede their implementation. Use .agents/skills/enderloom-catalog-launcher-qa/SKILL.md for affected integration and media regression work.
- Follow package.json and current workflow commands, and compare equivalent complete workloads before promotion. Keep fixture, live provider, native Electron, launcher/game and published build evidence separate. Never publish credentials/private sessions or claim browser login grants API access.

## Mandatory pre-release optimization gate

Before finalizing every release, follow the owner-mandated [Athena zero-loss pre-release optimization standard](https://github.com/Herbertofury/Athena/blob/main/guidance/PRE_RELEASE_OPTIMIZATION.md). Evaluate shrink-anything, fast-anything and rust-anything using reviewed pinned tools in isolated worktrees; run applicable passes, compare equivalent complete workloads, keep only independently verified improvements, restore rejected changes, and record per-tool evidence or explicit inapplicability/blockers. Never weaken tests, delete required content, force a Rust rewrite or regress functionality, quality, portability, compatibility, security or protected performance metrics. Data/documentation-only releases and existing native Rust paths require honest applicability decisions, not artificial ports. Existing local and pinned governance requirements remain intact.

## Mandatory CLI-first / non-interruptive execution

For every task, follow the owner-mandated [Athena CLI-first execution standard](https://github.com/Herbertofury/Athena/blob/main/guidance/CLI_FIRST_EXECUTION.md). Prefer fast official CLI/headless commands, supported APIs/SDKs/connectors and tested local automation. If a required application has no usable structured interface, discover or build a reviewed [CLI-Anything](https://github.com/HKUDS/CLI-Anything) harness over the real supported backend (or a native command surface for first-party code). Use isolated browser/renderer/test sessions for necessary UI proof. Never take over the user's active desktop, mouse, keyboard, focus or browser profile without explicit authorization for unavoidable foreground interaction. Preserve real runtime acceptance, data, permissions, feature parity and portable mode. Record reusable command coverage and unresolved gaps; no fake CLI parity or unnecessary release delay.
