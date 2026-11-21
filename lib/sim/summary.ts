import { RARITY_ORDER } from '../game/rules';
import type { Rarity } from '../game/types';
import type { Run } from './run';

/** The numbers the balance report compares, for one simulated life */
export const CHECKS = [1, 7, 30, 90, 180, 270, 365];
export const WINDOWS: [number, number][] = [[0, 7], [7, 30], [30, 90], [90, 180], [180, 365]];

export function summarize(r: Run) {
  const at = (d: number) => r.days[Math.min(d, r.days.length) - 1];
  const win = ([a, b]: [number, number]) => {
    const ds = r.days.slice(a, b), n = ds.length || 1;
    const earned = ds.reduce((s, d) => s + d.earned, 0), upkeep = ds.reduce((s, d) => s + d.upkeep, 0);
    const games = ds.reduce((s, d) => s + d.games, 0);
    return { earnedPerDay: earned / n, upkeepPerDay: upkeep / n, upkeepShare: earned ? upkeep / earned : 0, gamesPerDay: games / n, chestsPerDay: ds.reduce((s, d) => s + d.chests, 0) / n };
  };
  const steady = r.days.slice(14, 60).flatMap(d => d.gameCoins).sort((a, b) => a - b);
  const games = r.days.reduce((s, d) => s + d.games, 0), sad = r.days.reduce((s, d) => s + d.sad, 0);
  const first = Object.fromEntries(RARITY_ORDER.map(q => [q, r.hatched.find(x => x.q === q)?.day ?? null])) as Record<Rarity, number | null>;
  return {
    player: r.player, seed: r.seed,
    coinsPerGame: steady[Math.floor(steady.length / 2)] ?? 0,
    windows: WINDOWS.map(win),
    sadShare: games ? sad / games : 0,
    species: CHECKS.map(d => at(d)?.species ?? 0),
    level: CHECKS.map(d => at(d)?.level ?? 0),
    balance: CHECKS.map(d => at(d)?.balance ?? 0),
    badges: CHECKS.map(d => at(d)?.badges ?? null),
    complete: r.complete, first, chests: r.chests, games,
  };
}
export type Summary = ReturnType<typeof summarize>;
