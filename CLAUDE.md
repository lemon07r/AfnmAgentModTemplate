# AFNM Mod Template — Agent Context

Read these files in order before starting work:

1. `AGENTS.md` — project layout, commands, modding rules, validation workflow
2. `SUPPLEMENTARY_GUIDE.md` — deep patterns, gotchas, and anti-patterns from shipping real mods
3. `docs/reference/MODAPI_QUICK_REFERENCE.md` — compact ModAPI cheat sheet (all hooks, actions, utils)
4. `docs/reference/AFNM_MODDING.md` — practical reference: upstream sources, fallback ladder, game code patterns
5. `.agents/skills/` — workflow-specific skills (runtime oracle, debugging, validation, publishing, etc.)

The runtime entry point is `src/modContent/index.ts`. The build chain is `bun run typecheck && bun run build`. Validate with `bun run release:validate`.

## Available Skills

Skills in `.agents/skills/` provide workflow-specific guidance (auto-discovered by agents following the agentskills.io standard):

- `runtime-oracle/SKILL.md` — verify API surface against the shipped game
- `modapi-lookup/SKILL.md` — hook/action/util reference and classification
- `pre-commit-validation/SKILL.md` — evidence before claims
- `live-game-testing/SKILL.md` — disable_steam procedure
- `workshop-publishing/SKILL.md` — upload and release lifecycle
- `systematic-debugging/SKILL.md` — four-phase debugging methodology
- `conventional-git/SKILL.md` — commit message and branch naming
- `frontend-mod-ui/SKILL.md` — mod UI design with game components
- `typescript-afnm/SKILL.md` — TypeScript conventions for AFNM mods
- `agent-browser-testing/SKILL.md` — automated Electron game testing (optional)
