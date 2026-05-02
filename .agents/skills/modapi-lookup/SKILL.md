---
name: modapi-lookup
description: Reference for AFNM ModAPI hooks, actions, and utilities. Activate when writing hook registrations, using content registration functions, accessing game data, or implementing registerOptionsUI, injectUI, or addScreen.
---

# Skill: ModAPI Lookup

When working with AFNM ModAPI hooks, actions, or utilities, consult `docs/reference/MODAPI_QUICK_REFERENCE.md` before searching external sources or guessing signatures.

## When to activate

- Writing or modifying hook registrations (`window.modAPI.hooks.*`)
- Using content registration functions (`window.modAPI.actions.*`)
- Using utility functions (`window.modAPI.utils.*`)
- Accessing game data collections (`window.modAPI.gameData.*`)
- Implementing `registerOptionsUI`, `injectUI`, or `addScreen`

## Workflow

1. Open `docs/reference/MODAPI_QUICK_REFERENCE.md` for the compact cheat sheet
2. Open `docs/reference/AFNM_MODDING.md` for the fallback ladder and practical patterns
3. If the method isn't documented, use `bun run runtime:grep -- "<method-name>"` to verify it exists in the shipped runtime
4. For full upstream documentation, see https://lyeeedar.github.io/AfnmExampleMod/

## Guidelines

- Use optional chaining when calling ModAPI methods (see `typescript-afnm` skill for patterns)
- Understand the hook classification before using it — see `MODAPI_QUICK_REFERENCE.md` for the full table (observation, mutation, completion, equipment, dangerous)
- Equipment upgrade/reforge hooks (`onDerive*Requirement`, `onComplete*`) allow overriding costs and result items — return `{ costItems?, resultItem? }` or `undefined`
- `onModifyRecipeIngredients` runs before `onDeriveRecipeDifficulty` — use it to alter recipe ingredients dynamically
- For keybinding registration, use `actions.registerKeybinding()` — custom action names need a cast: `'myMod.action' as KeybindingAction`
- Use `utils.getRegisteredKeybindValue(action)` to read the current bound key at runtime
- Toast notifications are on `window.modAPI.utils.showToast()`, not the screen API
- Tooltip utilities and components are on `ModReduxAPI` — available in screen, options, and injectUI contexts only
- `api.hasSave` / `api.utils.hasSave()` — check save state in screen/options/injectUI contexts
- `api.useGameSettings()` — access game settings with getters/setters in screen contexts
- `actions.triggerUIReset()` forces a full component remount
- `injectUI` inject helper supports `position` parameter: `'inside'`, `'before'`, `'after'`
- Prefer the official API fallback order from `AGENTS.md` § Modding Rules
