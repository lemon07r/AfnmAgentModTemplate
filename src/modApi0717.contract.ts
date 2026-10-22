import type {
  BreakthroughState,
  Buff,
  CharactersState,
  CraftingEntity,
  CraftingStatistic,
  HistoryItem,
  ModAPI,
  ModReduxAPI,
  Rarity,
  Realm,
  RealmProgress,
  RecipeHarmonyType,
  RecipeItem,
  Scaling,
  SectState,
  Technique,
  TechniqueMasteryRarityMap,
  TournamentConfig,
  TournamentRewardTier,
} from 'afnm-types';

type Assert<T extends true> = T;
type Absent<T, K extends PropertyKey> = Extract<K, keyof T> extends never
  ? true
  : false;

// Removed fields must stay absent, not merely become optional.
type RemovedUtils = Assert<Absent<ModAPI['utils'], 'tPlural' | 'generateSkipTutorialFlags'>>;
type RemovedActions = Assert<Absent<ModAPI['actions'], 'addRoom'>>;
type RemovedBackgrounds = Assert<Absent<ModAPI['gameData']['backgrounds'], 'birth' | 'teen'>>;
type RemovedScaling = Assert<Absent<Scaling, 'removeEqnForTooltip'>>;
type RemovedTechnique = Assert<Absent<Technique, 'secondaryType'>>;
type RemovedBuff = Assert<Absent<Buff, 'secondaryType'>>;
type RemovedParty = Assert<Absent<CharactersState, 'followSlotMember'>>;
type RemovedCraftingStats = Assert<
  Extract<CraftingStatistic, 'poolCostPercentage' | 'stabilityCostPercentage'> extends never ? true : false
>;
type DamageArity = Assert<Parameters<ModAPI['utils']['calculateDamage']>['length'] extends 7 ? true : false>;

/**
 * Compile-only contract for the documented AFNM 0.7.17 surface.
 * Not imported by the runtime bundle; calls below never run in the game.
 */
export function assertModApi0717Surface(
  api: ModAPI,
  screenApi: ModReduxAPI,
  breakthrough: BreakthroughState,
  entity: CraftingEntity,
  recipe: RecipeItem,
  realm: Realm,
  realmProgress: RealmProgress,
  label: string, // Dynamic input keeps compile-only fixtures out of translation extraction.
): void {
  const allBuffs: Record<string, Buff> = api.gameData.buffs;
  api.actions.getCoreFormationAltarStats(breakthrough);
  const statInterceptor: NonNullable<Buff['interceptBuffEffects']>[number] = {
    statFilter: ['power'],
    effects: [],
  };

  api.actions.addStartingTreasure({
    name: label,
    description: api.utils.tr(label),
    items: [], // Non-empty bundles must also register their items with addItem.
  });
  api.actions.addChildBackground({ name: label, description: label }, null);
  api.actions.addCombatVfx({ name: label, attack: [], support: [] });
  const tournament: TournamentConfig = {
    id: 'contract_tournament',
    title: label,
    realm,
    roster: () => [],
    participantBuffs: [],
    roundKinds: ['combat', 'crafting'],
  };
  const reward: TournamentRewardTier = { placementMin: 1, items: [], money: 100 };
  api.actions.addTournamentConfig(tournament);
  api.actions.addTournamentReward(tournament.id, reward);
  const treasures = api.gameData.startingTreasures;
  const backgroundTreasures: typeof treasures = api.gameData.backgrounds.treasures;
  const vfx = api.gameData.combatVfx;
  const tournaments: TournamentConfig[] = api.gameData.tournamentConfigs;

  const scaling: Scaling = { value: 1, stat: 'power', eqn: 'power', keepEqnForTooltip: true };
  const hybrid: Technique = { name: label, icon: '', type: ['blood', 'cloud'], effects: [] };
  api.actions.addTechnique(hybrid);
  const costs: Partial<Record<CraftingStatistic, number>> = {
    qiCostReduction: 0,
    qiCostPenalty: 0,
    stabilityCostReduction: 0,
    stabilityCostPenalty: 0,
  };
  const harmonies = {
    forge: true,
    alchemical: true,
    inscription: true,
    resonance: true,
    formless: true,
    enhancingEcho: true,
    eccentricDecree: true,
    captivatingCadence: true,
    returningCycle: true,
  } satisfies Record<RecipeHarmonyType, boolean>;

  const damage: number = api.utils.calculateDamage(100, 10, 0, 0, realm, realmProgress, 0);
  const recipeStats = api.utils.defaultRecipeStats;
  const progress = api.utils.defaultProgressState;
  api.utils.getNextCondition(progress);
  api.utils.getNextCondition(progress, entity);
  api.utils.getMaxCompletion(recipe, recipeStats, realm, 1);
  api.utils.getMaxPerfection(recipe, recipeStats, realm, 1);

  const components: ModReduxAPI['components'] = api.components;
  const tooltip = components.tooltips.ItemTooltip;
  const recipeRow = components.recipes.RecipeRow;
  const itemComponent = components.ItemComponent;
  const glyphs = components.childhoodGlyphs;
  const screenComponents: typeof components = screenApi.components;
  const markup: string = api.utils.expandTooltipTemplate('<num>{n}</num>', new Map([['n', '1']]), false);
  api.utils.parseTooltipLine(api.utils.expandTooltipTags(markup));
  screenApi.utils.parseTooltipLine(screenApi.utils.expandTooltipTemplate(markup, new Map()));
  screenApi.utils.expandTooltipTags(markup);

  const changes: Record<Rarity, number> = {
    mundane: 1, qitouched: 2, empowered: 3, resplendent: 4, incandescent: 5, transcendent: 6,
  };
  const upgrades = {
    mundane: undefined, qitouched: undefined, empowered: { tooltip: label, change: 1 },
    resplendent: undefined, incandescent: undefined, transcendent: undefined,
  };
  const utils = api.utils;
  const masteries: Record<string, TechniqueMasteryRarityMap> = {
    explicit: utils.createUpgradeMap('stacks', 'empowered', upgrades),
    simple: utils.createUpgradeMapSimple('stacks', 'empowered', '{change}', false, changes),
    stepped: utils.createUpgradeMapStepped('stacks', 'empowered', '{change}', 5),
    percent: utils.create30PercentUpgradeMap('duration', 'empowered', '{change}%'),
    power: utils.createPowerUpgradeMap('basePower', 'empowered'),
    scaling: utils.createScalingUpgradeMap('scaling', 'empowered'),
    damage: utils.createDamageUpgradeMap('damage', 'empowered'),
    healing: utils.createHealingUpgradeMap('healing', 'empowered', label),
    barrier: utils.createBarrierUpgradeMap('barrier', 'empowered'),
    temporaryHealth: utils.createTemporaryHealthUpgradeMap('temphp', 'empowered'),
    stacks: utils.createStacksUpgradeMap('stacks', 'empowered', label, 3),
    cleanse: utils.createCleanseUpgradeMap('stacks', 'empowered', label, 3, 'cleansed'),
    inflicted: utils.createStacksInflictedUpgradeMap('stacks', 'empowered', label, 3),
    cost: utils.createCostUpgradeMap('cost', 'empowered', label, -3),
    requirement: utils.createRequirementUpgradeMap('requirement', 'empowered', label, -3),
    max: utils.createMaxIncreaseUpgradeMap('max', 'empowered', [label], 3),
    single: utils.createSingleTierMastery({ kind: 'effect', effects: [] }),
    round: utils.createRoundBuffMap(allBuffs[label], 'empowered', 10, 'buffSelf'),
    stackingRound: utils.createStackingRoundBuffMap(allBuffs[label], 'empowered', changes, 'buffTarget'),
  };
  utils.createFullKindMap(masteries);
  utils.createCraftingUpgradeMap('stacks', 'empowered', upgrades);
  utils.createCraftingUpgradeMapSimple('stacks', 'empowered', '{change}', false, changes);
  utils.createCraftingUpgradeMapStepped('stacks', 'empowered', '{change}', 5);
  utils.createCraftingPowerUpgradeMap('power', 'empowered', '{change}%');
  utils.createCraftingPerfectionUpgradeMap('perfection', 'empowered');
  utils.createCraftingCompletionUpgradeMap('completion', 'empowered');
  utils.createCraftingPoolUpgradeMap('pool', 'empowered');
  utils.createCraftingStabilityUpgradeMap('stability', 'empowered');
  utils.createCraftingStacksUpgradeMap('stacks', 'empowered', label, 3);
  utils.createCraftingCostUpgradeMap('cost', 'empowered', label, -3);
  utils.createCraftingMaxIncreaseUpgradeMap('max', 'empowered', [label], 3);

  const state = api.getGameStateSnapshot();
  const sect: SectState = state.sect;
  const bracket: Pick<typeof state.tournament, 'tournamentId' | 'seed' | 'fighterHealth' | 'tournamentBuffs' | 'craftChallenge'> = state.tournament;
  const historyText: HistoryItem['text'] = utils.tr(label);
  utils.t(historyText);

  void [statInterceptor, backgroundTreasures, vfx, tournaments, scaling, costs, harmonies,
    damage, tooltip, recipeRow, itemComponent, glyphs, screenComponents, sect, bracket];
}
