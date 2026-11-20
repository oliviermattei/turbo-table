import { describe, it, vi } from 'vitest';
// Every species counts as drawn, so the simulation covers the full bestiary
vi.mock('./assets.json', async () => {
  const { SPECIES } = await import('./species');
  const st = ['bebe', 'petit', 'grand', 'super'];
  const all = [...st, ...st.map(s => s + '-triste')];
  return { default: { creatures: Object.fromEntries(SPECIES.map(s => [s.id, all])), legendaryEggs: SPECIES.filter(s => s.q === 'legendaire').map(s => s.id), eggs: [], items: [] } };
});
import { computeStats, starsFor, unlocked } from '../game/rules';
import type { GameRecord } from '../game/types';
import { balance, buy, grantEggs, hatch, hatchProgress, incubate, ITEMS, openChest, totalCorrect, applyGames, QUALITY_BONUS, HATCH, STAGE_BONUS, BONUS, setActive, stageOf, markShown, FRESH } from './rules';
import { SPECIES } from './species';
import type { PetState } from './types';
import { newPet } from './rules';

const ORDER = ['commun', 'peu-commun', 'rare', 'epique', 'legendaire'];
function run(seed: number) {
  let s = seed; const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const DAY = 864e5, T0 = Date.UTC(2026, 0, 1, 18);
  const h: GameRecord[] = [];
  let p: PetState = newPet(T0 - 1000, new Set(), 0);
  const seen = new Set<string>();
  const unlockDays: number[] = [];
  let spentUpkeep = 0;
  for (let day = 0; day < 365; day++) {
    const perMin = 14 + Math.min(8, (8 * day) / 180);
    for (let g = 0; g < 4; g++) {
      const ts = T0 + day * DAY + g * 600e3;
      const correct = Math.round(perMin * (0.85 + rnd() * 0.3));
      const total = correct + (rnd() < 0.5 ? 0 : 1 + Math.floor(rnd() * 2));
      h.unshift({ id: 'g' + day + '-' + g + '-' + seed, ts, mode: 'normal', duration: 60, tables: [2, 3, 4, 5, 6, 7, 8, 9], score: correct * 15, correct, total,
        bestStreak: Math.min(correct, Math.round(correct * (0.5 + rnd() * 0.5))), stars: starsFor(correct, 60), errors: [], seen: { '3x7': [correct, total - correct] } });
      const badges = unlocked(computeStats(h));
      p = grantEggs(applyGames(p, h), h, badges, ts);
      const now = ts + 1000, tc = totalCorrect(h);
      for (const e of p.eggs.filter(e => !e.opened)) p = openChest(p, e.id, tc);
      if (!p.incubating && p.eggs.length) {
        const best = [...p.eggs].sort((a, b) => ORDER.indexOf(b.q) - ORDER.indexOf(a.q))[0];
        p = incubate(p, best.id, tc);
      }
      const pr = hatchProgress(p, tc);
      for (const c of p.creatures) while (stageOf(c.xp) > (p.creatures.find(x => x.id === c.id)?.shown ?? 0)) p = markShown(p, c.id);
      const bestC = [...p.creatures].sort((a, b) => ORDER.indexOf(SPECIES.find(x => x.id === b.species)!.q) - ORDER.indexOf(SPECIES.find(x => x.id === a.species)!.q) || b.xp - a.xp)[0];
      if (bestC && day % 7 === 0 && g === 0) p = setActive(p, bestC.id, now);
      if (pr?.ready) { const r = hatch(p, tc, now, rnd()); if (r) { p = r.p; if (!r.out.dup) { seen.add(r.out.species.id); unlockDays.push(day); } } }
      // upkeep: ~30 coins a day, kept aside
      if (g === 3) spentUpkeep += 30;
      const coins = balance(h, badges, p) - spentUpkeep;
      // buy the best affordable chest whose guaranteed tier still misses species
      const missing = new Set(SPECIES.filter(sp => !seen.has(sp.id)).map(sp => sp.q));
      const chest = ITEMS.filter(i => i.kind === 'chest' && i.price <= coins && [...missing].some(q => ORDER.indexOf(q) >= ORDER.indexOf(i.min ?? 'commun'))).sort((a, b) => b.price - a.price)[0];
      if (chest) p = buy(p, chest.id, coins, now);
    }
    if (seen.size >= SPECIES.length) break;
  }
  const gaps = unlockDays.map((d, i) => d - (i ? unlockDays[i - 1] : 0));
  return { day: seen.size >= SPECIES.length ? unlockDays.at(-1)! : 365, maxGap: Math.max(...gaps), at60: unlockDays.filter(d => d < 60).length, at30: unlockDays.filter(d => d < 30).length, at90: unlockDays.filter(d => d < 90).length, at120: unlockDays.filter(d => d < 120).length };
}

/** Add variants here to compare settings against the current rules ({} = current). */
const VARIANTS: Record<string, { prices?: number[]; bonus?: number[]; hatch?: number[]; stage?: number[]; per?: number; fresh?: number }> = {
  current: {},
};
const chests = ITEMS.filter(i => i.kind === 'chest'), Q = ['commun', 'peu-commun', 'rare', 'epique', 'legendaire'] as const;
const baseStage = [...STAGE_BONUS], basePer = BONUS.perSpecies, baseFresh = FRESH.rate;
const base = { prices: chests.map(i => i.price), bonus: Q.map(q => QUALITY_BONUS[q]), hatch: Q.map(q => HATCH[q]) };

// Economy simulation: a child playing 4 one-minute games a day, from 14 to 22 right answers a minute.
// Off by default (slow); run with: SIM=1 pnpm vitest run lib/pet/economy.sim.test.ts --reporter=verbose
describe.skipIf(!process.env.SIM)('economy simulation', () => {
  for (const [name, v] of Object.entries(VARIANTS)) it(name, () => {
    chests.forEach((c, i) => { c.price = (v.prices ?? base.prices)[i]; });
    Q.forEach((q, i) => { QUALITY_BONUS[q] = (v.bonus ?? base.bonus)[i]; HATCH[q] = (v.hatch ?? base.hatch)[i]; });
    (v.stage ?? baseStage).forEach((x, i) => { STAGE_BONUS[i] = x; });
    BONUS.perSpecies = v.per ?? basePer;
    FRESH.rate = v.fresh ?? baseFresh;
    const res = Array.from({ length: 10 }, (_, i) => run(i + 1));
    const med = (k: 'day' | 'maxGap' | 'at60' | 'at30' | 'at90' | 'at120') => res.map(r => r[k]).sort((a, b) => a - b)[5];
    console.log('SIM', name, 'complete', med('day'), 'maxGap', med('maxGap'), 'found d30/d60/d90/d120', [med('at30'), med('at60'), med('at90'), med('at120')].join('/'));
  }, 600000);
});
