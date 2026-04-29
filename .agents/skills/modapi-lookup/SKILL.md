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

## Rules

- Always use optional chaining when calling ModAPI methods: `window.modAPI?.hooks?.onLocationEnter?.()`
- Understand the hook classification before using it:
  - **Observation hooks** (no return value): `onLocationEnter`, `onLootDrop`, `onAdvanceDay`, `onAdvanceMonth`
  - **Mutation hooks** (return value modifies gameplay): `onCreatePlayerCombatEntity`, `onCreatePlayerCraftingEntity`, `onCreateEnemyCombatEntity`, `onCalculateDamage`, `onBeforeCombat`, `onBeforeCraft`, `onDeriveRecipeDifficulty`, `onEventDropItem`, `onGenerateExploreEvents`
  - **Completion hooks** (return additional `EventStep[]`): `onCompleteCombat`, `onCompleteTournament`, `onCompleteDualCultivation`, `onCompleteCrafting`, `onCompleteAuction`, `onCompleteStoneCutting`
  - **Dangerous hooks**: `onReduxAction` and `onReduxActionPayload` run inside the reducer path — keep fast, deterministic, side-effect-free
- For keybinding registration, use `actions.registerKeybinding()` — custom action names need a cast: `'myMod.action' as KeybindingAction`
- For toast notifications, use `utils.showToast()` — on `window.modAPI.utils`, not the screen API
- Tooltip utilities (`parseTooltipLine`, `expandTooltipTemplate`, `expandTooltipTags`) and components (`GameTooltip`, `GameTooltipBox`, `TooltipLine`) are on `ModReduxAPI` — available in screen, options, and injectUI contexts only
- Prefer the official API in order: snapshot -> subscribe -> hooks -> injectUI -> raw store -> DOM scraping
