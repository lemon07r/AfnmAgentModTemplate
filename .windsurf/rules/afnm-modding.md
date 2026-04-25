# AFNM Modding Rules

Read these files in order before starting work:

1. `AGENTS.md` — project layout, commands, modding rules, validation workflow
2. `SUPPLEMENTARY_GUIDE.md` — deep patterns, gotchas, and anti-patterns
3. `docs/reference/MODAPI_QUICK_REFERENCE.md` — compact ModAPI cheat sheet
4. `docs/reference/AFNM_MODDING.md` — upstream sources, fallback ladder, game code patterns

Skills are in `.agents/skills/` — consult them for specific workflows (auto-discovered by agents following the agentskills.io standard):
- `runtime-oracle/SKILL.md` — verify API surface against the shipped game
- `modapi-lookup/SKILL.md` — hook/action/util reference and classification
- `pre-commit-validation/SKILL.md` — evidence before claims
- `live-game-testing/SKILL.md` — disable_steam procedure
- `workshop-publishing/SKILL.md` — upload and release lifecycle
- `systematic-debugging/SKILL.md` — four-phase debugging methodology
- `conventional-git/SKILL.md` — commit message and branch naming
- `frontend-mod-ui/SKILL.md` — mod UI design with game components
- `typescript-afnm/SKILL.md` — TypeScript conventions for AFNM mods
- `agent-browser-testing/SKILL.md` — automated game testing (optional)

Key rules:
- Always optional-chain ModAPI access: `window.modAPI?.hooks?.onLocationEnter?.()`
- Run `bun run typecheck && bun run build` before committing
- Trust the installed runtime over docs: `bun run runtime:grep -- "<symbol>"`
- Follow commit conventions: `feat:`, `fix:`, `docs:`, `perf:`, `chore:`
