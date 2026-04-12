# AFNM Mod Template — Agent Context

Read these files in order before starting work:

1. `AGENTS.md` — project layout, commands, modding rules, validation workflow
2. `SUPPLEMENTARY_GUIDE.md` — deep patterns, gotchas, and anti-patterns from shipping real mods
3. `docs/reference/MODAPI_QUICK_REFERENCE.md` — compact ModAPI cheat sheet (all hooks, actions, utils)
4. `docs/reference/AFNM_MODDING.md` — practical reference: upstream sources, fallback ladder, game code patterns
5. `docs/skills/` — workflow-specific skills (runtime oracle, debugging, validation, publishing, etc.)

The runtime entry point is `src/modContent/index.ts`. The build chain is `bun run typecheck && bun run build`. Validate with `bun run release:validate`.

## Available Skills

Skills in `docs/skills/` provide workflow-specific guidance:

- `runtime-oracle.md` — verify API surface against the shipped game
- `modapi-lookup.md` — hook/action/util reference and classification
- `pre-commit-validation.md` — evidence before claims
- `live-game-testing.md` — disable_steam procedure
- `workshop-publishing.md` — upload and release lifecycle
- `systematic-debugging.md` — four-phase debugging methodology
- `conventional-git.md` — commit message and branch naming
- `frontend-mod-ui.md` — mod UI design with game components
- `typescript-afnm.md` — TypeScript conventions for AFNM mods
- `agent-browser-testing.md` — automated Electron game testing (optional)
