# AFNM Modding Rules

Read these files in order before starting work:

1. `AGENTS.md` — project layout, commands, modding rules, validation workflow
2. `SUPPLEMENTARY_GUIDE.md` — deep patterns, gotchas, and anti-patterns
3. `docs/reference/MODAPI_QUICK_REFERENCE.md` — compact ModAPI cheat sheet
4. `docs/reference/AFNM_MODDING.md` — upstream sources, fallback ladder, game code patterns

Skills are in `docs/skills/` — consult them for specific workflows:
- `runtime-oracle.md` — verify API surface against the shipped game
- `modapi-lookup.md` — hook/action/util reference and classification
- `pre-commit-validation.md` — evidence before claims
- `live-game-testing.md` — disable_steam procedure
- `workshop-publishing.md` — upload and release lifecycle
- `systematic-debugging.md` — four-phase debugging methodology
- `conventional-git.md` — commit message and branch naming
- `frontend-mod-ui.md` — mod UI design with game components
- `typescript-afnm.md` — TypeScript conventions for AFNM mods
- `agent-browser-testing.md` — automated game testing (optional)

Key rules:
- Always optional-chain ModAPI access: `window.modAPI?.hooks?.onLocationEnter?.()`
- Run `bun run typecheck && bun run build` before committing
- Trust the installed runtime over docs: `bun run runtime:grep -- "<symbol>"`
- Follow commit conventions: `feat:`, `fix:`, `docs:`, `perf:`, `chore:`
