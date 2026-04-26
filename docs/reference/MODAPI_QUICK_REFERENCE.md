# ModAPI Quick Reference

Compact cheat sheet for the AFNM ModAPI surface. For full documentation, see the [upstream docs](https://lyeeedar.github.io/AfnmExampleMod/).

All methods are on `window.modAPI` unless noted otherwise.

---

## State Access

| Method | Returns | Notes |
|--------|---------|-------|
| `getGameStateSnapshot()` | `RootState \| null` | Read-only snapshot of entire game state |
| `subscribe(callback)` | `() => void` | Returns unsubscribe function; fires on every Redux action |
| `actions.getGlobalFlags()` | `Record<string, number>` | Cross-save numeric flags |
| `actions.setGlobalFlag(key, value)` | `void` | Persist a numeric flag across all saves |

## UI Integration

| Method | Signature | Notes |
|--------|-----------|-------|
| `actions.registerOptionsUI(component)` | `(ModOptionsFC) => void` | Settings panel in mod-loading dialog |
| `injectUI(slotId, generator)` | `(string, InjectGenerator) => void` | Inject React content into a named game dialog/screen slot |
| `addScreen(config)` | `({ key, component, music?, ambience? }) => void` | Register a full mod screen |

## Screen/Options API Actions

These methods are available from the `api.actions` object passed to mod screens,
options panels, and injected UI generators.

| Method | Notes |
|--------|-------|
| `setModData(modName, key, data)` | Store save-scoped JSON-serializable mod data |
| `executeCraftingTechnique(technique)` | Execute a resolved crafting technique during an active crafting session |
| `previewCraftingTechnique(technique, state)` | Preview crafting technique results without dispatching Redux actions |

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
| `hooks.onCreateEnemyCombatEntity` | `(enemy, combatEntity, gameFlags)` | `CombatEntity` |
| `hooks.onCalculateDamage` | `(attacker, defender, damage, damageType, gameFlags)` | `number` |
| `hooks.onBeforeCombat` | `(enemies[], playerState, gameFlags)` | `{ enemies, playerState }` |
| `hooks.onDeriveRecipeDifficulty` | `(recipe, recipeStats, gameFlags)` | `CraftingRecipeStats` |
| `hooks.onGenerateExploreEvents` | `(locationId, events[], gameFlags)` | `LocationEvent[]` |
| `hooks.onEventDropItem` | `(item, step, gameFlags)` | `ItemDesc` |

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
| `hooks.onReduxActionPayload` | `(actionType, payload)` | `unknown \| null` | Runs before the reducer. Return a replacement payload, or `null` to drop the action. Keep fast, deterministic, no side-effects. |

## Combat Buff Timing

AFNM `0.6.52` replaced the legacy `onTechniqueEffects` + `afterTechnique`
pattern for new combat buffs. Prefer these fields when authoring buff data:

```
beforeTechniqueEffects
afterTechniqueEffects
onStackGainEffects
onRoundEffects
onRoundStartEffects
onCombatStartEffects
```

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
actions.addBirthBackground(background)
actions.addChildBackground(background)
actions.addTeenBackground(background)
```

## Content Registration — Cultivation

```
actions.addBreakthrough(realm, breakthrough)
actions.addTechnique(technique)
actions.addManual(manual)
actions.addCraftingTechnique(technique)
actions.addDestiny(destiny)
actions.addDualCultivationTechnique(technique)
```

## Content Registration — World

```
actions.addLocation(location)
actions.linkLocations(existing, link)
actions.registerRootLocation(locationName, condition)
actions.addQuest(quest)
actions.addQuestToRequestBoard(quest, realm, rarity, condition, location)
actions.addCalendarEvent(event)
actions.addTriggeredEvent(event)
```

## Content Registration — Location Modification

```
actions.addBuildingsToLocation(location, buildings[])
actions.addEnemiesToLocation(location, enemies[])
actions.addEventsToLocation(location, events[])
actions.addExplorationEventsToLocation(location, events[])
actions.addMapEventsToLocation(location, mapEvents[])
actions.addMissionsToLocation(location, missions[])
actions.addCraftingMissionsToLocation(location, missions[])
```

## Content Registration — Specialized

```
actions.addCrop(realm, crop)
actions.addMineChamber(realm, progress, chamber)
actions.addGuild(guild)
actions.addEnchantment(enchantment)
actions.addFallenStar(fallenStar)
actions.addRoom(room)
actions.addMysticalRegionBlessing(blessing)
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
actions.overrideItemTypeToHarmonyType(mapping)
```

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
utils.calculateDamage(attackPower, defenderDefense, defenderDr, defenderDefenseFactor, maxReduction, defenderVulnerability, realm, realmProgress, defenderProtection, cultivatorResistance)
```

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
utils.tPlural(count, one, other, variables?) // Translate pluralized copy
utils.tr(key, variables?, context?) // Deferred translation object for data definitions
```

## Utility Functions — Save Management

Added in `0.6.52-v2`. These are on `window.modAPI.utils`, so they can be called
from any mod context (no UI screen required).

```
utils.makeSave(filename)   // Create a character-scoped backup save file
utils.loadSave(filename)   // Load a character-scoped backup save file
utils.listSaves()          // List backup saves for the current character
```

Note: `listSaves()` returns `Promise<SaveFileInfo[]>` but `afnm-types@0.6.52-v2`
imports `SaveFileInfo` from a `./electron` module that is not shipped in the
package. Infer the return type from `ReturnType<typeof modAPI.utils.listSaves>`
until upstream exports it.

## Utility Functions — Other

```
utils.createQuestionAnswerList(key, questions[], exit, showExitOnAllComplete?)
utils.flag(flag)           // Convert flag name to game flag format
utils.evalExp(exp, flags)  // Evaluate expression against flags (floors result > 3)
utils.evalExpNoFloor(exp, flags)
utils.evaluateScaling(scaling, variables, stanceLength, preMaxTransform?)
utils.generateSkipTutorialFlags(tutorials[], triggers[])
```

## Game Data Collections

Access via `window.modAPI.gameData`:

```
items                    Record<string, Item>
characters               Record<string, Character>
techniques               Record<string, Technique>
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
backgrounds              { birth, child, teen }
techniqueBuffs           { blood, blossom, celestial, cloud, fist, weapon }
mysticalRegionBlessings  Blessing[]
dualCultivationTechniques IntimateTechnique[]
researchableMap          Record<string, RecipeItem[]>
recipeConditionEffects   RecipeConditionEffect[]
harmonyConfigs           Record<RecipeHarmonyType, HarmonyTypeConfig>
itemTypeToHarmonyType    Record<ItemKind, RecipeHarmonyType>
tutorials                { newGameTutorials, tutorialTriggers }
mineChambers             Record<Realm, Record<RealmProgress, MineChamber[]>>
uncutStones              Record<Realm, UncutStonePool | undefined>
```
