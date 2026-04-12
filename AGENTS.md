# Repository Guidelines

This template is the default starting point for new *Ascend From Nine Mountains* mods. Keep it lean, ModAPI-first, and easy for later agents to extend.

## Project Layout

- `src/modContent/index.ts` is the real runtime entrypoint.
- `src/mod.ts` is the AFNM mod-loader bootstrap and metadata export.
- `src/global.d.ts` is the shared typing boundary for `window.modAPI`, runtime React, and the template debug registry.
- `scripts/mod-package.js` is the single metadata source of truth for build/package scripts.
- `scripts/zip-dist.js` packages `dist/<package-name>/` into `builds/<package-name>.zip`.
- `scripts/workshop-upload.ts` publishes through the sibling `../ModUploader-AFNM` repo.
- `scripts/installed-game-runtime.js` is the installed-runtime oracle; use it before assuming current AFNM behavior.
- `SUPPLEMENTARY_GUIDE.md` contains the non-obvious patterns and pitfalls learned from CraftBuddy, Lucky All Around, and ElderGPT Spirit Ring.

## Commands

- `bun install`
- `bun run typecheck`
- `bun run build`
- `bun run runtime:oracle`
- `bun run runtime:extract`
- `bun run runtime:grep -- "<pattern>"`
- `bun run workshop:upload -- --change-note "vX.Y.Z - ..."`

## Modding Rules

- Prefer official state access in this order:
  1. `window.modAPI.getGameStateSnapshot()`
  2. `window.modAPI.subscribe()`
  3. `window.modAPI.injectUI()` / `registerOptionsUI()`
  4. raw store or DOM/fiber fallback only for verified gaps
- Store mod settings in numeric global flags unless the data truly belongs to a save file.
- Treat `window.modAPI.hooks.onReduxAction(...)` as high-risk. It runs inside the reducer.
- Treat `window.modAPI.hooks.onGenerateExploreEvents(...)` as pre-weight-expansion. It is not a direct “set final odds” hook.
- Use `fetch()` normally on `0.6.50+`, but keep failures non-fatal.
- Keep game-shape assumptions centralized instead of scattering them across UI and logic modules.

## Validation Workflow

- Default path:
  1. `bun run typecheck`
  2. `bun run build`
  3. `bun run runtime:oracle`
  4. `bun run runtime:grep -- "<symbol-you-care-about>"`
- Use live UI/manual testing only when the installed-runtime oracle is insufficient.
- If you launch the real client directly, create `disable_steam` beside the executable first and delete it when done. Leaving it behind will block Workshop mod loading.
- Prefer the platform's direct executable or native launcher rather than bouncing back through the Steam UI when you only need a smoke test.

## Template-Specific Notes

- The example options panel in `src/modContent/index.ts` is intentionally small but real. Replace it, do not work around it.
- The template debug surface is `window.__afnmModDebug['<package-name>']`.
- React/MUI dependencies are already present so future agents can add overlay UI without first reshaping the toolchain.
