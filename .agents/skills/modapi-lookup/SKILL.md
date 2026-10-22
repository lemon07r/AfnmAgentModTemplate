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
- For keybinding registration, use `actions.registerKeybinding()`; `action` accepts plain strings (no cast needed)
- Use `utils.getRegisteredKeybindValue(action)` to read the current bound key at runtime
- Toast notifications are on `window.modAPI.utils.showToast()`, not the screen API
- Tooltip utilities and components are on both root `ModAPI` and screen-context `ModReduxAPI`; `components.tooltips` and `components.recipes` expose the built-in variants
- `utils.getHasSaveLoaded()` — check if a save is loaded (on `window.modAPI.utils`)
- `api.useGameSettings()` — access game settings with getters/setters in screen contexts
- `actions.triggerUIReset()` forces a full component remount
- `gameData.buffs` is the complete combat-buff registry; `techniqueBuffs` is
  only the school-focused subset
- Combat `interceptBuffEffects` entries can use `buff`, `statFilter`, or both
  (OR matching)
- `actions.getCoreFormationAltarStats(breakthrough)` aggregates every beaten
  Core Formation altar for modded golden-core `dynamicStats`
- `hooks.onNewGame(intent => modifiedIntent)` — override new game parameters (items, flags, money, player, etc.)
- `onReduxActionPayload` now receives `stateBefore` as 3rd parameter
- `injectUI` uses a `placement` parameter such as `'appendChild'`, `'prependChild'`, `'before'`, `'after'`, or `'overlay'`; verify selectors after the 0.7.17 controller/DOM changes
- Prefer the official API fallback order from `AGENTS.md` § Modding Rules
