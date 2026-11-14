# Repository instructions

Read `.agents/foundry/AGENTS-adapter.md` for the pinned shared engineering core.
Keep this file and nested instructions project-owned: setup, commands, constraints and acceptance belong here.

## Enderloom-local scope and ownership

- Preserve the protected Catalog/Source/Browser/Full/Split research flows alongside the launcher and mod manager. Read docs/knowledge/Home.md, Architecture.md and Checklist.md plus docs/ENDERLOOM_STUDIO_EXECUTION.md. A new studio or Dev Kit capability is additive, not permission to replace existing research workflows.
- Keep catalog sources, native launcher service, accounts/instances and optional provider/media adapters independently usable. Do not make one catalog, game target, integration or hybrid feature the hidden dependency root for unrelated functionality.
- Preserve catalog-scoped favorites/notes/filter state, exact project/media ownership, complete galleries and explicit access/completeness states. Source-owned media only; icon+avatar is not a complete gallery. Failed refresh retains last-good data. Autoplay stays off unless the user's explicit setting says otherwise.
- Check open source-watcher and zero-loss Browse performance PRs before edits; this guidance does not merge or supersede their implementation. Use .agents/skills/enderloom-catalog-launcher-qa/SKILL.md for affected integration and media regression work.
- Follow package.json and current workflow commands, and compare equivalent complete workloads before promotion. Keep fixture, live provider, native Electron, launcher/game and published build evidence separate. Never publish credentials/private sessions or claim browser login grants API access.
