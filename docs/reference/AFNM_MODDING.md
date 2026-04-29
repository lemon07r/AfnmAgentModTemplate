# AFNM Modding Reference

Practical reference for working with the Ascend From Nine Mountains modding system. This is not the primary source of truth for your mod's implementation details; it provides context about the game's modding surface and how to work with or against the live runtime.

## Upstream Sources

Check these first when AFNM updates or you need authoritative API docs:

- **Docs site:** <https://lyeeedar.github.io/AfnmExampleMod/>
- **Example repo:** <https://github.com/Lyeeedar/AfnmExampleMod>
- **Types package:** `afnm-types` on npm (install as dev dependency)
- **Local runtime oracle:** `bun run runtime:oracle`

When docs, types, and the live runtime disagree, trust the installed runtime.

## ModAPI Fallback Ladder

Use this order when deciding how to access game state or functionality. Always start at the top; only descend when the higher tier does not expose what you need.

### Tier 1 — Official Snapshot + Subscribe

```typescript
const snap = window.modAPI?.getGameStateSnapshot?.();
window.modAPI?.subscribe?.(() => { /* reactive updates */ });
```

Read-only. Safe. Covers player stats, inventory, location, calendar, flags, and most game state.

### Tier 2 — Official UI Integration

```typescript
window.modAPI?.actions?.registerOptionsUI?.(MyOptionsComponent);
window.modAPI?.injectUI?.('combat-victory', (api, el, inject) => { /* ... */ });
window.modAPI?.actions?.addScreen?.({ key: 'myScreen', component: MyScreen });
```

For rendering settings, injecting UI into existing dialogs, or creating full mod screens.

### Tier 3 — Official Hooks

```typescript
window.modAPI?.hooks?.onLocationEnter?.((locationId, flags) => { /* ... */ });
window.modAPI?.hooks?.onBeforeCombat?.((enemies, player, flags) => { /* ... */ });
```

Observation or mutation hooks. See `MODAPI_QUICK_REFERENCE.md` for the full list.

### Tier 4 — Raw Store (Read-Only Fallback)

```typescript
const state = (window as any).gameStore?.getState?.();
const player = state?.player?.player;
const location = state?.location?.current;
```

`window.gameStore` is the live Redux store. Treat it as read-only. Do not dispatch actions or mutate state through it. Use it only when the official snapshot is missing a field you need.

### Tier 5 — React Fiber / DOM Scraping (Last Resort)

Fiber traversal or DOM scraping is the final escape hatch. Only use it when:

- the live modAPI does not expose the data
- the docs site does not document a safe hook or API
- the mod genuinely needs the missing signal

If used, keep it inside a small adapter with `try/catch` boundaries, document the exact reason it exists, and plan to remove it when the official API catches up.

## Working With the Installed Game Runtime

The runtime oracle (`scripts/installed-game-runtime.js`) extracts the installed game's Electron asar bundle and lets you grep it without launching Steam.

```bash
# Print a parity summary (version, hooks, launcher behavior)
bun run runtime:oracle

# Extract the bundle (cached by file fingerprint)
bun run runtime:extract

# Grep for specific symbols
bun run runtime:grep -- "registerOptionsUI|injectUI|onGenerateExploreEvents"
bun run runtime:grep -- "onAdvanceDay|onAdvanceMonth|onBeforeCombat"
```

**When to use this instead of launching the game:**

- Confirming whether a hook or API method exists in the shipped runtime
- Checking launcher behavior (disable_steam support, settings.json path)
- Verifying that docs or type stubs match the actual binary
- Any parity check where you don't need live UI interaction

**Override the game path** if auto-detection misses your install:

```bash
AFNM_GAME_DIR="/path/to/Ascend From Nine Mountains" bun run runtime:oracle
```

## Live Game Testing

Use live testing only when the oracle is insufficient (e.g., UI smoke tests, visual verification).

1. Place the built zip in the installed game's `mods/` directory
2. Create an empty `disable_steam` file beside the game executable
3. Launch with `launch-native.sh` (Linux) or the executable directly
4. For DevTools access: launch with `--remote-debugging-port=9222`, then open `chrome://inspect` in Chrome
5. **Delete `disable_steam` when done** — leaving it behind blocks Workshop mod loading

## Known API Gaps (as of 0.6.53)

These game behaviors have no official ModAPI interception point:

| Gap | Workaround |
|-----|-----------|
| World map event `triggerChance` | Use `addMapEventsToLocation` or `addEventsToLocation` instead |
| Auto-battle state | Not in `getGameStateSnapshot()`; DOM inspection is the only fallback |
| Crafting action dispatch outside an active crafting screen | Inside screens/options use `api.actions.executeCraftingTechnique()` and `api.actions.previewCraftingTechnique()`; outside that context there is no standalone root ModAPI action |
| Post-weight-expansion explore events | `onGenerateExploreEvents` fires before expansion; see SUPPLEMENTARY_GUIDE.md §3 |

When you discover a new gap, consider filing a request with the game developer rather than building fragile workarounds.

## Key Runtime Facts

- `CraftingTechnique.name` is a stable, non-localized identifier (not a display name)
- Global flags are numeric only — store booleans as `0` / `1`
- `fetch()` works normally on `0.6.50+` — no special CSP workarounds needed
- React, ReactDOM, MUI, and MUI Icons are provided by the game runtime — externalize them in webpack, do not bundle them
- The game runtime exposes `window.React` — use it for `createElement` calls when JSX is not available
- `registerOptionsUI` components receive `{ api }` with `api.components.GameButton` and `api.actions`
- `utils.makeSave()`, `utils.loadSave()`, and `utils.listSaves()` are on `window.modAPI.utils` for character-scoped backup saves (no UI screen context required)
- `actions.addToSectShop()` adds items directly to the Nine Mountain Sect Favour Exchange shop
- `onReduxAction` and `onReduxActionPayload` run inside the reducer path — keep them fast, deterministic, side-effect-free
- New combat buffs should use `beforeTechniqueEffects`, `afterTechniqueEffects`, and `onStackGainEffects`; legacy `onTechniqueEffects` and `afterTechnique` are no longer read as of 0.6.52

### New in 0.6.53

- **Player entity hooks:** `onCreatePlayerCombatEntity` and `onCreatePlayerCraftingEntity` allow modifying the player's combat or crafting entity after creation, before the session begins
- **`onBeforeCraft`:** Modify recipe, recipe stats, or player crafting entity before crafting begins
- **`onDeriveRecipeDifficulty` fix:** Now always includes `control` and `intensity` in the gameFlags parameter
- **`registerKeybinding`:** Register custom keyboard shortcuts in `actions`; appears in Controls > Mods section. `KeybindingDefinition.action` is typed as the `KeybindingAction` union — custom mod actions need a cast: `'myMod.action' as KeybindingAction`
- **Toast notifications:** `utils.showToast(message, timeout?, style?, customStyle?)` displays toast messages with `'info'`, `'success'`, `'warning'`, or `'error'` styles
- **Tooltip components and utilities:** `GameTooltip`, `GameTooltipBox`, `TooltipLine` components plus `parseTooltipLine()`, `expandTooltipTemplate()`, `expandTooltipTags()` utilities — available on `ModReduxAPI` (screen/options/injectUI contexts)
- **New `injectUI` sub-slots:** Screen-specific injection points like `'combat-topBarPlayerInfo'`, `'crafting-craftingScreen'`, `'stoneCutting-jadeCuttingScreen'`
- **`useKeybinding` hook:** Available on `ModReduxAPI` for responding to keyboard shortcuts in screen/UI contexts
- **Extraction utility:** `afnm-extract-translations` now supports an ignore patterns flag and produces cleaner `template.json` output
