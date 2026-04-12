# AFNM Agent Mod Template

A reusable starter repo for building *Ascend From Nine Mountains* mods with a workflow that already matches the current `0.6.50` ModAPI, installed-runtime validation, and Steam Workshop packaging.

Validated against the installed AFNM runtime `0.6.50-c2637ae` on `2026-04-11`.

## What this template gives you

- a modular TypeScript + webpack scaffold instead of a single-file throwaway mod
- a working options-panel example backed by numeric global flags
- installed-runtime inspection scripts for verifying the live game bundle without launching Steam
- packaging and Workshop upload helpers that derive metadata from `package.json`
- preinstalled React/MUI dependencies so UI work does not start with dependency churn

Use the upstream [AfnmExampleMod](https://github.com/Lyeeedar/AfnmExampleMod) repo as the content/API reference. Use this repo as the implementation scaffold you actually clone for new work.

## Quick Start

1. Copy this directory into a new repo.
2. Update `package.json`:
   - `name`
   - `version`
   - `description`
   - `author`
   - `afnmWorkshop.*`
3. Run `bun install`.
4. Replace the example logic in `src/modContent/index.ts`.
5. Run `bun run typecheck`.
6. Run `bun run build`.
7. Copy `builds/<package-name>.zip` into the installed game's `mods/` directory.

The template exposes a debug surface at `window.__afnmModDebug['<package-name>']`.

## Layout

- `src/mod.ts`
  Metadata/bootstrap entry for the AFNM mod loader.
- `src/modContent/index.ts`
  Real runtime entrypoint. Start here for gameplay logic, hooks, settings, and UI wiring.
- `src/global.d.ts`
  Shared typings for `MOD_METADATA`, `window.modAPI`, runtime React, and the debug registry.
- `scripts/mod-package.js`
  Single source of truth for metadata and `gameVersion` resolution.
- `scripts/installed-game-runtime.js`
  Installed-runtime oracle for parity checks.
- `scripts/workshop-upload.ts`
  Upload wrapper around the sibling `../ModUploader-AFNM` repo.
- `AGENTS.md`
  Low-noise implementation guidance for future coding agents.
- `SUPPLEMENTARY_GUIDE.md`
  The deeper strategy guide: architecture choices, gotchas, testing discipline, and advanced patterns.

## Default Workflow

Build and validation:

```bash
bun run typecheck
bun run build
bun run runtime:oracle
```

Useful runtime grep examples:

```bash
bun run runtime:grep -- "getGameStateSnapshot|injectUI|onGenerateExploreEvents|registerOptionsUI"
```

Workshop upload:

```bash
bun run workshop:upload -- --change-note "v0.1.0 - Initial release" --allow-create
```

## Recommended Architecture

- Use `window.modAPI.getGameStateSnapshot()` for read-only state.
- Use `window.modAPI.subscribe()` for reactive updates.
- Use `window.modAPI.actions.registerOptionsUI(...)` for mod settings before inventing your own settings surface.
- Use `window.modAPI.injectUI(...)` for screen- or dialog-local affordances.
- Use a persistent body-mounted overlay only when the UI truly must survive screen transitions.
- Keep game-shape assumptions centralized in `src/modContent/` or a dedicated `src/integration/` folder if the mod grows.

## Manual Live Testing

Most tasks should use the installed-runtime oracle, not a live UI launch.

If you do need a real client smoke test:

1. create the empty `disable_steam` file beside the game executable
2. launch through the platform's direct executable or native launcher
3. remove `disable_steam` when you finish, or Workshop mods will stop loading

## Docs To Read Next

- [AGENTS.md](./AGENTS.md)
- [SUPPLEMENTARY_GUIDE.md](./SUPPLEMENTARY_GUIDE.md)
- [AfnmExampleMod docs](https://github.com/Lyeeedar/AfnmExampleMod/tree/main/docs)
