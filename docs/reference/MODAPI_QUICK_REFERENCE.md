# ModAPI Quick Reference

Compact cheat sheet for `afnm-types@0.7.17`. The package's `.d.ts` files define the signatures below; see also the [upstream docs](https://lyeeedar.github.io/AfnmExampleMod/).

All methods are on `window.modAPI` unless noted otherwise.

---

## State Access

| Method | Returns | Notes |
|--------|---------|-------|
| `getGameStateSnapshot()` | `RootState` | Read-only snapshot of entire game state; default base state when no save is loaded |
| `subscribe(callback)` | `() => void` | Returns unsubscribe function; fires on every Redux action |
| `actions.getGlobalFlags()` | `Record<string, number>` | Cross-save numeric flags |
| `actions.setGlobalFlag(key, value)` | `void` | Persist a numeric flag across all saves |
| `actions.startEvent(event)` | `boolean` | Starts the event only when no event is active; result reports whether it started |

## UI Integration

| Method | Signature | Notes |
|--------|-----------|-------|
| `actions.registerOptionsUI(component)` | `(ModOptionsFC) => void` | Settings panel in mod-loading dialog |
| `actions.registerKeybinding(definition)` | `(KeybindingDefinition) => void` | Register custom keybinding; appears in Controls > Mods |
| `actions.triggerUIReset()` | `() => void` | Force all UIRefreshWrapper-wrapped components to unmount/remount |
| `injectUI(slotId, generator)` | `(slot, (api, inject) => void) => void` | Inject React content into a named game dialog/screen slot |
| `actions.addScreen(config)` | `({ key, component, music?, ambience? }) => void` | Register a full mod screen |
| `actions.addTab(slot, config)` | `(ModTabSlot, ModTabConfig) => void` | Add a tab to supported built-in dialogs such as journal, techniques, inventory, or options |

### `injectUI` Slot Names and Positioning

- **Dialogs:** the dialog's DOM `id` (e.g. `'combat-victory'`)
- **Full screens:** the `ScreenType` value (e.g. `'combat'`, `'location'`, `'crafting'`, `'jadeCutting'`)
- **Screen sub-slots:** `'combat-topBarPlayerInfo'`, `'crafting-craftingScreen'`, `'stoneCutting-jadeCuttingScreen'`

AFNM 0.7.17 added controller support and changed the DOM. Verify slot names and
selectors against the current client before relying on an injection; the example
below is not a selector compatibility guarantee.

The `inject` helper's 3rd parameter controls placement relative to the matched element:

```
inject(selectorOrElement, content, placement?)
// placement: 'after' (default for selectors) | 'before' | 'appendChild' | 'prependChild' | 'overlay' | ...
```

Example:

```tsx
window.modAPI.injectUI('combat-victory', (api, inject) => {
  inject(
    '[aria-live="assertive"]',
    <api.components.GameButton onClick={() => console.log('clicked')}>
      My Mod Action
    </api.components.GameButton>,
    'after',
  );
});
```

## Screen/Options API (ModReduxAPI)

Methods and hooks available from the `api` object passed to mod screens,
options panels, and injected UI generators.

| Method | Notes |
|--------|-------|
| `api.actions.setModData(modName, key, data)` | Store save-scoped JSON-serializable mod data |
| `api.actions.removeModData(modName, key)` | Remove one save-scoped mod-data key |
| `api.actions.executeCraftingTechnique(technique)` | Execute a resolved crafting technique during an active crafting session |
| `api.actions.previewCraftingTechnique(technique, state)` | Preview crafting technique results without dispatching Redux actions |
| `api.useGameSettings()` | Returns `GameSettingsProps` — access to game settings with getters and setters |

```ts
api.actions.setModData('myMod', 'draft', { seen: true });
api.actions.removeModData('myMod', 'draft');
```

```tsx
window.modAPI.actions.addTab('journal', {
  id: 'myMod_notes',
  title: 'Notes',
  component: ({ screenAPI }) => {
    const location = screenAPI.useSelector((s) => s.location.current);
    return <div>Current location: {location}</div>;
  },
});
```

## Lifecycle Hooks — Observation (no return value)

| Hook | Parameters |
|------|-----------|
| `hooks.onLocationEnter` | `(locationId, gameFlags)` |
| `hooks.onLootDrop` | `(items[], gameFlags)` |
| `hooks.onAdvanceDay` | `(days, gameFlags)` |
| `hooks.onAdvanceMonth` | `(month, year, gameFlags)` |

## Lifecycle Hooks — Mutation (return value modifies gameplay)

| Hook | Parameters | Returns |
|------|-----------|---------|
| `hooks.onCreatePlayerCombatEntity` | `(player, combatEntity, breakthrough, gameFlags)` | `CombatEntity` |
| `hooks.onCreatePlayerCraftingEntity` | `(player, craftingEntity, breakthrough, characters, gameFlags)` | `CraftingEntity` |
| `hooks.onCreateEnemyCombatEntity` | `(enemy, combatEntity, gameFlags)` | `CombatEntity` |
| `hooks.onCalculateDamage` | `(attacker, defender, damage, damageType, gameFlags)` | `number` |
| `hooks.onBeforeCombat` | `(enemies[], playerState, gameFlags)` | `{ enemies, playerState }` |
| `hooks.onBeforeCraft` | `(player, recipe, recipeStats, gameFlags)` | `{ recipe?, recipeStats?, player? } \| undefined` |
| `hooks.onModifyRecipeIngredients` | `(recipe, gameFlags)` | `RecipeItem` |
| `hooks.onDeriveRecipeDifficulty` | `(recipe, recipeStats, gameFlags)` | `CraftingRecipeStats` |
| `hooks.onGenerateExploreEvents` | `(locationId, events[], gameFlags)` | `LocationEvent[]` |
| `hooks.onEventDropItem` | `(item, step, gameFlags)` | `ItemDesc` |

Read-only combat hook pattern:

```ts
const unregister = window.modAPI.hooks.onCombatAfterStep((_step, ctx) => {
  console.log('Round', ctx.roundNum, 'HP', ctx.playerState?.stats.hp);
  return null;
});
// later: unregister()
```

## Lifecycle Hooks — Equipment Upgrade & Reforge

These hooks intercept the equipment upgrade and reforge flows. Return `{ costItems?, resultItem? }` to override, or `undefined` to leave unchanged.

| Hook | Parameters | When |
|------|-----------|------|
| `hooks.onDeriveEquipmentUpgradeRequirement` | `(baseItem, costItems, resultItem, gameFlags)` | Before upgrade dialog is shown |
| `hooks.onCompleteEquipmentUpgrade` | `(baseItem, costItems, resultItem, gameFlags)` | Before upgrade completion dialog |
| `hooks.onDeriveEquipmentReforgeRequirement` | `(baseItem, costItems, resultItem, gameFlags)` | Before reforge dialog is shown |
| `hooks.onCompleteEquipmentReforge` | `(baseItem, costItems, resultItem, gameFlags)` | Before reforge completion dialog |

## Lifecycle Hooks — Completion (return additional event steps)

| Hook | Parameters | Returns |
|------|-----------|---------|
| `hooks.onCompleteCombat` | `(eventStep, victory, playerCombatState, foughtEnemies, droppedItems, gameFlags)` | `EventStep[]` |
| `hooks.onCompleteTournament` | `(eventStep, tournamentState, gameFlags)` | `EventStep[]` |
| `hooks.onCompleteDualCultivation` | `(eventStep, success, gameFlags)` | `EventStep[]` |
| `hooks.onCompleteCrafting` | `(eventStep, item \| undefined, gameFlags)` | `EventStep[]` |
| `hooks.onCompleteAuction` | `(eventStep, itemsBought[], gameFlags)` | `EventStep[]` |
| `hooks.onCompleteStoneCutting` | `(eventStep, gameFlags)` | `EventStep[]` |

## Lifecycle Hooks — Dangerous

| Hook | Parameters | Returns | Warning |
|------|-----------|---------|---------|
| `hooks.onReduxAction` | `(actionType, stateBefore, stateAfter, payload)` | `RootState` | Runs inside the reducer after action payload interception. Keep fast, deterministic, no side-effects. Prefer `subscribe()` when possible. |
| `hooks.onReduxActionPayload` | `(actionType, payload, stateBefore)` | `unknown \| null` | Runs before the reducer. Return a replacement payload, or `null` to drop the action. Keep fast, deterministic, no side-effects. |

## Lifecycle Hooks — New Game

| Hook | Parameters | Returns |
|------|-----------|---------|
| `hooks.onNewGame` | `(intent: NewGameIntent)` | `NewGameIntent` |

Override all parameters of a new game: starting items, techniques, recipes, destinies, quests, money, favour, flags, player entity, and crafting actions.

```
interface NewGameIntent {
  items: ItemDesc[];
  techniques: string[];
  recipes: string[];
  destinies: string[];
  quests: string[];
  money: number;
  favour: number;
  flags: Record<string, number>;
  player: PlayerEntity;
  craftingActions: string[];
}
```

## Combat Buff Timing

AFNM replaced the legacy `onTechniqueEffects` + `afterTechnique`
pattern for new combat buffs. Prefer these fields when authoring buff data:

```
beforeTechniqueEffects
afterTechniqueEffects
onStackGainEffects
onRoundEffects
onRoundStartEffects
onCombatStartEffects
```

### Buff Interceptors

`interceptBuffEffects` can match a specific buff, one or more combat stat
categories, or either criterion:

```ts
interceptBuffEffects: [{
  statFilter: ['power', 'defense'],
  effects: [/* runs once per matching buff application */],
  blockAmount: { value: 1, stat: undefined, eqn: 'incoming' },
}]
```

- `buff?: Buff | string` matches by buff name.
- `statFilter?: CombatStatistic[]` matches an incoming buff whose `stats` map
  contributes a non-zero value to any listed stat.
- When both are present, matching is OR, not AND. At least one must be present.
- Effects run once with `intercepted` set to the handled stack count.
- Omit `blockAmount` for a listener that reacts without consuming stacks.

## Content Registration — Items

```
actions.addItem(item)
actions.addItemToShop(item, stacks, location, realm, valueModifier?, reputation?)
actions.addItemToGuild(item, stacks, guild, rank, valueModifier?, reputation?)
actions.addToSectShop(item, stacks, realm, valueModifier?, reputation?)
actions.addItemToAuction(item, chance, condition, countOverride?, countMultiplier?)
actions.addItemToFallenStar(item, realm)
```

## Content Registration — Characters & Backgrounds

```
actions.addCharacter(character)
actions.addChildBackground(background, glyph?)
actions.addStartingTreasure(treasure)
```

`StartingTreasure` extends `Background` with required `items: Item[]`; register
those items separately with `addItem`. `addBirthBackground` and
`addTeenBackground` still exist but are deprecated. The latter converts legacy
teen backgrounds into treasure collections.

## Content Registration — Cultivation

```
actions.addBreakthrough(realm, breakthrough)
actions.addTechnique(technique)
actions.addCombatVfx(definition)
actions.addManual(manual)
actions.addCraftingTechnique(technique)
actions.addDestiny(destiny)
actions.addDualCultivationTechnique(technique)
```

`Technique.type` is `'origin' | TechniqueElement | RealTechniqueElement[]`;
hybrids use an array, not `secondaryType`. Arrays exclude the neutral `'none'`
school. `addCombatVfx(TechniqueVfx)` registers presentation effects and default
mapping rules; `Technique.vfx` can override them (`[]` disables them).

## Content Registration — World

```
actions.addLocation(location)
actions.linkLocations(existing, link)
actions.registerRootLocation(locationName, condition)
actions.addQuest(quest)
actions.addQuestToRequestBoard(quest, realm, rarity, condition, location)
actions.addCalendarEvent(event)
actions.addTriggeredEvent(event)
actions.addTournamentConfig(config)
actions.addTournamentReward(tournamentId, tier)
```

Tournament configs have stable `id`s (duplicates throw), a `roster()` factory,
realm, participant buffs, optional placement rewards and combat/crafting
`roundKinds`. Reward tiers use `placementMin`, required `items`, and optional
`money` / `favour`; qualifying tiers are cumulative.

## Content Registration — Location Modification

```
actions.addBuildingsToLocation(location, buildings[])
actions.addEnemiesToLocation(location, enemies[])
actions.addEventsToLocation(location, events[])
actions.addExplorationEventsToLocation(location, events[])
actions.addMapEventsToLocation(location, mapEvents[])
actions.addMissionsToLocation(location, missions[])
actions.addCraftingMissionsToLocation(location, missions[])
actions.addExpeditionTiles(expeditionName, tiles[])
```

### Core Formation Altar Helpers

```
actions.isRegisteredAltarLocation(locationName)
actions.getLocationAltarReward(locationName)
actions.getCoreFormationAltarStats(breakthrough)
```

`getCoreFormationAltarStats` aggregates the combat and crafting `Scaling`
rewards from every location in `breakthrough.coreFormation.beatenAltars`. It
also returns a per-altar contribution breakdown. Modded golden-core
breakthroughs should call it from `dynamicStats` so they inherit altar rewards.

## Content Registration — Specialized

```
actions.addCrop(realm, crop)
actions.addMineConfig(mineId, mineConfig)
actions.addMineChamber(mineId, realm, progress, chamber)
actions.addGuild(guild)
actions.addEnchantment(enchantment)
actions.addFallenStar(fallenStar)
actions.addMysticalRegionBlessing(blessing)
actions.addMysticalRegionDefinition(definition)
actions.addSoulShardDelve(delve)
actions.addPuppetType(puppet)
actions.addAlternativeStart(start)
actions.addPlayerSprite(sprite)
```

## Content Registration — Crafting

```
actions.addRecipeToLibrary(item)
actions.addRecipeToResearch(baseItem, recipe)
actions.addResearchableRecipe(baseItem, recipe)
actions.addUncutStone(realm, uncutStone)
actions.addHarmonyType(harmonyType, config)
```

Harmony is player-selected for sublime crafts in AFNM 0.7.17; it is not inferred
from item kind. Built-ins are `forge`, `alchemical`, `inscription`, `resonance`,
`formless`, `enhancingEcho`, `eccentricDecree`, `captivatingCadence`, and
`returningCycle` (nine total).

`HarmonyTypeConfig` includes `name`, `description`, `shortDescription`,
`processEffect`, optional `onBarChange`, `initEffect`, optional live `qiCostMultiplier` and
`stabilityCostMultiplier`, `renderComponent`, icon/colour fields,
`complexityMultiplier`, optional `startingHarmony`, `unlockFlag`, and
`statTable`.

Crafting **stat keys** are now `qiCostReduction`, `qiCostPenalty`,
`stabilityCostReduction`, and `stabilityCostPenalty`, replacing the old cost
multiplier stats. These are distinct from the still-valid `HarmonyTypeConfig`
callbacks `qiCostMultiplier` and `stabilityCostMultiplier` above.

Persisted enhanced equipment uses:

```ts
interface ItemDesc {
  name: string;
  dropQuality?: number; // transient drop input
  harmonyAugment?: { type: RecipeHarmonyType; quality: number };
}
```

Resolve descriptors through `utils.getFullItem(desc)` to apply enchantments,
harmony stat grants, and harmony field upgrades.

## Content Registration — Keybindings

```
actions.registerKeybinding({
  action: 'myMod.specialAction',
  category: 'general',
  displayName: 'Special Action',
  description: 'Performs a special action',
  defaultKey: 'F',
  allowRebind: true,
})
```

Registered keybindings appear in Controls settings under a "Mods" section.
Call during mod initialization. Permanent for the session once registered.

`KeybindingDefinition.action` accepts plain strings — no cast needed for custom mod actions.

Use `api.useKeybinding(priority, bindings)` in screen/UI contexts to respond to keys.

## Content Registration — Audio

```
actions.addMusic(name, path[])
actions.addSfx(name, path)
```

Cast custom names: `'my_music' as MusicName`

## Utility Functions — Enemy Scaling

```
utils.alpha(enemy)              // Elite variant
utils.alphaPlus(enemy)          // Enhanced elite
utils.realmbreaker(enemy)       // Cross-realm variant
utils.corrupted(enemy)          // Corrupted variant
utils.scaleEnemy(base, realm, realmProgress)
utils.calculateEnemyHp(enemy)
utils.calculateEnemyPower(enemy)
```

## Utility Functions — Balance

```
utils.getExpectedHealth(realm, progress)
utils.getExpectedPower(realm, progress)
utils.getExpectedDefense(realm, progress)
utils.getExpectedBarrier(realm, progress)
utils.getExpectedToxicity(realm, progress)
utils.getExpectedPool(realm, progress)
utils.getExpectedIntensity(realm, progress)
utils.getExpectedControl(realm, progress)
utils.getExpectedPlayerPower(realm, progress)
utils.getExpectedArtefactPower(realm, progress)
utils.getRealmQi(realm, realmProgress)
utils.getBreakthroughQi(realm, realmProgress)
utils.getNumericReward(base, realm, progress)
utils.getPillRealmMultiplier(realm)
utils.getCraftingEquipmentStats(realm, progress, factors, type)
utils.getClothingDefense(realm, scale)
utils.getClothingCharisma(realm, mult)
utils.getBreakthroughCharisma(realm, mult)
utils.calculateDamage(attackPower, defenderDefense, defenderDr, defenderVulnerability, realm, realmProgress, defenderProtection)
```

Combat uses unified player/enemy health; the damage helper takes no defense
factor or cultivator-resistance argument.

## Utility Functions — Mastery Builders

All are on `utils`; combat helpers return `TechniqueMasteryRarityMap`, crafting
helpers return `CraftingTechniqueMasteryRarityMap` unless noted.

```
createUpgradeMap(key, rarity, upgrades)
createUpgradeMapSimple(key, rarity, tooltip, shouldMultiply, changes, renderTransform?)
createUpgradeMapStepped(key, rarity, tooltip, maxChange, shouldMultiply?, renderTransform?)
create30PercentUpgradeMap(key, rarity, tooltip)
createPowerUpgradeMap(key, rarity)
createScalingUpgradeMap(key, rarity)
createDamageUpgradeMap(key, rarity)
createHealingUpgradeMap(key, rarity, buffName?)
createBarrierUpgradeMap(key, rarity)
createTemporaryHealthUpgradeMap(key, rarity)
createStacksUpgradeMap(key, rarity, buffName, maxChange)
createCleanseUpgradeMap(key, rarity, buffName, maxChange, verb)
createStacksInflictedUpgradeMap(key, rarity, buffName, maxChange)
createCostUpgradeMap(key, rarity, buffName, maxChange)
createRequirementUpgradeMap(key, rarity, buffName, maxChange)
createMaxIncreaseUpgradeMap(key, rarity, buffNameOrNames, maxChange)
createSingleTierMastery(mastery)
createRoundBuffMap(buff, rarity, chanceStep, effectKind?)
createStackingRoundBuffMap(buff, rarity, stacks, effectKind?)
createFullKindMap(rarityMap) // Returns TechniqueMasteryKindMap

createCraftingUpgradeMap(key, rarity, upgrades)
createCraftingUpgradeMapSimple(key, rarity, tooltip, shouldMultiply, changes, renderTransform?)
createCraftingUpgradeMapStepped(key, rarity, tooltip, maxChange)
createCraftingPowerUpgradeMap(key, rarity, tooltip)
createCraftingPerfectionUpgradeMap(key, rarity)
createCraftingCompletionUpgradeMap(key, rarity)
createCraftingPoolUpgradeMap(key, rarity)
createCraftingStabilityUpgradeMap(key, rarity)
createCraftingStacksUpgradeMap(key, rarity, buffName, maxChange)
createCraftingCostUpgradeMap(key, rarity, buffName, maxChange)
createCraftingMaxIncreaseUpgradeMap(key, rarity, buffNameOrNames, maxChange)
```

`upgrades` is a `Record<Rarity, { tooltip, change, shouldMultiply? } | undefined>`;
`changes` is a `Record<Rarity, number | undefined>`. Simple/stepped tooltips use
`{change}`. Stepped helpers reach `maxChange` at incandescent, not transcendent.
Round-buff `effectKind` is `'buffSelf'` (default) or `'buffTarget'`.

## Utility Functions — Quest Templates

```
utils.createCombatEvent(enemy)
utils.createCullingMission(monster, location, description, favour)
utils.createCollectionMission(item, location, description, favour)
utils.createDeliveryMission(items, count, location, description, preSteps, postSteps, favour)
utils.createHuntQuest(monster, location, description, encounter, stones, rep, repName, maxRep, charEncounter?)
utils.createPackQuest(monster, location, description, encounter, stones, rep, repName, maxRep)
utils.createDeliveryQuest(location, description, predelivery, item, amount, postdelivery, stones, rep, repName, maxRep)
utils.createFetchQuest(title, description, srcLoc, srcHint, srcSteps, dstLoc, dstHint, dstSteps, stones, rep, repName, maxRep)
utils.createCraftingMission(recipe, cost, location, appraiser, description, introSteps, sublimeSteps, perfectSteps, basicSteps, failureSteps, favour)
```

## Utility Functions — Text Formatting

```
utils.col(text, color)    // Colored text
utils.loc(text)            // Purple — location names
utils.rlm(realm, progress?) // Styled realm name
utils.num(number)          // Styled number
utils.buf(buff)            // Pink — buff names
utils.itm(item)            // Pink — item names
utils.char(text)           // Green — character names
utils.elem(element)        // Styled technique element
utils.t(value, variables?, context?) // Translate immediately
utils.tr(key, variables?, context?) // Deferred translation object for data definitions
```

## Utility Functions — Toast Notifications

On `window.modAPI.utils`.

```
utils.showToast(message)                              // Default info toast, 3s timeout
utils.showToast(message, timeout)                     // Custom timeout in ms
utils.showToast(message, timeout, style)              // 'info' | 'success' | 'warning' | 'error'
utils.showToast(message, timeout, style, customStyle) // { bg?, border?, color? }
```

`message` accepts `React.ReactNode` (strings, JSX elements, etc.).

## Utility Functions — Tooltips & Components

Available on both `window.modAPI.utils` and `api.utils` in screen, options, and
injectUI contexts:

```
utils.parseTooltipLine(tooltip) // Expanded tooltip string -> ReactNode
utils.expandTooltipTemplate(template, templateValues, addPeriod?) // Map<string, string>; {key} placeholders
utils.expandTooltipTags(template) // Tooltip markup tags -> HTML spans
```

Components are exposed on both `window.modAPI.components` and `api.components`:

```
components.GameTooltip      // Tooltip wrapper (provider, children, flipped?, disabled?, minimal?)
components.GameTooltipBox   // Tooltip content box (isSecondary?, isAux?, removeWidthLimit?)
components.TooltipLine      // Single tooltip line (children)
components.ItemComponent    // Inventory cell; required item and equipped props
components.tooltips        // ItemTooltip, TechniqueTooltip, CraftingBuffTooltip, etc.
components.recipes         // RecipesComponent, RecipeRow, RecipeDetails, RecipeIngredients, etc.
components.ChildhoodIcon
components.childhoodGlyphs
components.physicalStatToIcon
```

Each built-in tooltip/recipe component has exported props in `components.d.ts`.
Use `utils.defaultRecipeStats` and `utils.defaultProgressState` when building
crafting previews outside an active session; do not mutate these shared defaults.

## Utility Functions — Save Management

On `window.modAPI.utils`.

```
utils.makeSave(filename)   // Create a character-scoped backup save file
utils.loadSave(filename)   // Load a character-scoped backup save file
utils.listSaves()          // List backup saves for the current character
```

## Utility Functions — Keybinding & Save State Query

```
utils.getRegisteredKeybindValue(action)  // Returns current bound key string or undefined
utils.getHasSaveLoaded()                 // Whether a save is currently loaded
```

## Utility Functions — Other

```
utils.createQuestionAnswerList(key, questions[], exit, showExitOnAllComplete?)
utils.flag(flag)           // Convert flag name to game flag format
utils.evalExp(exp, flags)  // Evaluate expression against flags (floors result > 3)
utils.evalExpNoFloor(exp, flags)
utils.evaluateScaling(scaling, variables, stanceLength, preMaxTransform?)
utils.getNextCondition(progress, entity?)
utils.getMaxCompletion(recipe, recipeStats, realm, maxStepsBoost?)
utils.getMaxPerfection(recipe, recipeStats, realm, maxStepsBoost?)
```

`Scaling.keepEqnForTooltip` replaces `removeEqnForTooltip`.
`getNextCondition` uses randomness; pass the crafting entity to account for
`discordantConditions` buffs. The quality-cap helpers return `{ flat, percentage }`;
`maxStepsBoost` supplies bonus threshold steps (e.g. `bonusMaximumQuality`).

## Game Data Collections

Access via `window.modAPI.gameData`:

```
items                    Record<string, Item>
characters               Record<string, Character>
techniques               Record<string, Technique>
combatVfx                Record<string, TechniqueVfx>
locations                Record<string, GameLocation>
quests                   Record<string, Quest>
manuals                  Record<string, ManualItem>
destinies                Record<string, Destiny>
calendarEvents           CalendarEvent[]
triggeredEvents          TriggeredEvent[]
auction                  Record<Realm, AuctionItemDef[]>
breakthroughs            Record<Realm, Breakthrough[]>
crops                    Record<Realm, Crop[]>
craftingTechniques       Record<string, CraftingTechnique>
monsters                 EnemyEntity[]
enchantments             Enchantment[]
fallenStars              FallenStar[]
rooms                    Room[]
guilds                   Record<string, Guild>
puppets                  PuppetType[]
alternativeStarts        AlternativeStart[]
startingTreasures        StartingTreasure[]
backgrounds              { child: Background[], treasures: StartingTreasure[] }
techniqueBuffs           { blood, blossom, celestial, cloud, fist, weapon }
mysticalRegionBlessings  Blessing[]
mysticalRegionDefinitions Record<string, MysticalRegionDefinition>
dualCultivationTechniques IntimateTechnique[]
researchableMap          Record<string, RecipeItem[]>
recipeConditionEffects   RecipeConditionEffect[]
harmonyConfigs           Record<RecipeHarmonyType, HarmonyTypeConfig>
buffs                    Record<string, Buff>
expeditionTiles          Record<string, ExpeditionTiles[]>
soulShardDelves          Record<string, SoulShardDelveConfig>
tutorials                { newGameTutorials, tutorialTriggers }
mineConfigs              Record<string, MineConfig>
uncutStones              Record<Realm, UncutStonePool | undefined>
tournamentConfigs        TournamentConfig[]
```

## 0.7.17 Snapshot State

- `research.queue` holds material, remaining/discovered recipes, progress, and
  optional `materialReturned`; `research.glyphs` holds harmony glyphs that
  multiply research speed.
- `soulShardDelve` holds `delveKey`, optional `currentRun` (ordered nodes,
  room/stage indexes, qither, blessings/curses/rewards), and per-delve
  `progression`. There is no floor/max-floor pair.
- Player formation/delve layouts are named persisted layouts with placements;
  use their typed `current*Layout` / `stored*Layouts` fields.
- `sect` holds rank, generated `disciples`, `authoredMembers`, population targets
  and events, plus optional promotion tournaments, world disciples, and services.
- `tournament` stores `tournamentId`, seed, optional character fighters, previous
  and current rounds, carried `fighterHealth`, `tournamentBuffs`, and optional
  crafting challenge/results. Static rules/rewards live in `gameData.tournamentConfigs`;
  completion hooks still receive `victory`, `second`, or `defeat`.
- `characters` exposes `followingCharacter`, `followingRemainingMonths`, and
  optional `additionalFollowingCharacters`; there is no `followSlotMember`.
- Event `HistoryItem.text` is `Translatable`, not necessarily a string; resolve
  with `utils.t()` for display rather than applying string methods directly.
- Explore repeat bookkeeping is
  `location.currentLocationLastEvent` plus
  `location.currentLocationLastEventCount`. Authored events can set
  `repeatPenaltyMonths`.
