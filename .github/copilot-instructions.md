# AFNM Mod Template — Copilot Context

This is an Ascend From Nine Mountains mod project using TypeScript, React, webpack, and bun.

## Key Files

- `AGENTS.md` — project layout, commands, modding rules
- `SUPPLEMENTARY_GUIDE.md` — deep patterns and anti-patterns from shipping real mods
- `docs/reference/MODAPI_QUICK_REFERENCE.md` — compact ModAPI cheat sheet
- `docs/reference/AFNM_MODDING.md` — upstream sources, fallback ladder
- `.agents/skills/` — workflow-specific guidance

## Essential Rules

- Runtime entry point is `src/modContent/index.ts`
- Always use optional chaining on `window.modAPI` access
- React/MUI are externalized (provided by game runtime) — never bundle them
- Import game types from `afnm-types` package
- Run `bun run typecheck` before committing
- Run `bun run build` to produce the distributable zip
- Run `bun run release:validate` before releases
- Follow commit prefixes: `feat:`, `fix:`, `docs:`, `perf:`, `chore:`
