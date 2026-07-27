import type { BreakthroughState, Buff, ModAPI } from 'afnm-types';

/**
 * Compile-only contract for the AFNM 0.7.6 ModAPI additions documented by the
 * template. This module is not imported by the runtime bundle.
 */
export function assertModApi076Surface(
  api: ModAPI,
  breakthrough: BreakthroughState,
): void {
  const allBuffs: Record<string, Buff> = api.gameData.buffs;
  const altarStats = api.actions.getCoreFormationAltarStats(breakthrough);
  const statInterceptor: NonNullable<Buff['interceptBuffEffects']>[number] = {
    statFilter: ['power'],
    effects: [],
  };

  void allBuffs;
  void altarStats;
  void statInterceptor;
}
