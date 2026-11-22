import { BADGE_BY_ID, levelInfo, RARITY_ORDER, totalXp, unlocked } from '../game/rules';
import type { GameRecord, Rarity } from '../game/types';
import type { Q } from '../game/questions';
import { valueOf } from '../game/value';
import {
  active, appetiteOf, balance, buy, decay, hatch, hatchProgress, incubate, ITEMS, markShown, newPet, openChest,
  readySpecies, setActive, sleep, stageOf, useItem as giveItem,
} from '../pet/rules';
import { SPECIES_BY_ID } from '../pet/species';
import type { Needs, PetState } from '../pet/types';
import { settle } from '../settle';
import { playGame, type Player, type Rnd } from './players';

/** One simulated life of a player: every game through settle() (the end screen's code), then the pet care a child would do. */

export const rng = (seed: number): Rnd => {
  let s = seed >>> 0 || 1;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};

export interface DayStat {
  day: number; games: number; correct: number; earned: number; upkeep: number; chests: number;
  balance: number; species: number; level: number; sad: number; badges: Record<Rarity, number>;
  /** coins of each normal game that counts (for "coins per game") */
  gameCoins: number[];
}
export interface Run {
  player: string; seed: number; days: DayStat[];
  hatched: { day: number; q: Rarity; species: string }[];
  /** chests obtained: source → quality → count */
  chests: Record<string, Partial<Record<Rarity, number>>>;
  complete: number | null;
}

const T0 = Date.UTC(2026, 0, 5, 0);
const DAY = 864e5, HOUR = 36e5;
const ORDER = (q: Rarity) => RARITY_ORDER.indexOf(q);

export function run(pl: Player, seed: number, days = 365): Run {
  const rnd = rng(seed * 7919 + pl.id.length);
  const realRandom = Math.random;
  Math.random = rnd; // the real question picker draws with Math.random
  try { return live(pl, seed, days, rnd); } finally { Math.random = realRandom; }
}

function live(pl: Player, seed: number, nDays: number, rnd: Rnd): Run {
  let h: GameRecord[] = [];
  let p: PetState = newPet(T0, new Set(), 0);
  let badges = new Set<string>();
  const out: Run = { player: pl.id, seed, days: [], hatched: [], chests: {}, complete: null };
  const ready = readySpecies();
  let n = 0;

  const coins = () => balance(h, badges, p);
  /** What a child does on the companion screens: chests, nest, evolutions, food and toys, then save for a chest */
  function care(now: number, ds: DayStat) {
    for (const e of p.eggs.filter(e => !e.opened)) p = openChest(p, e.id, now);
    const hatchNow = () => {
      const pr = hatchProgress(p);
      if (!pr?.ready) return;
      const r = hatch(p, now, rnd());
      if (!r) return;
      p = r.p;
      if (!r.out.dup) out.hatched.push({ day: ds.day, q: r.out.species.q, species: r.out.species.id });
      else ds.earned += r.out.coins;
    };
    hatchNow();
    if (!p.incubating && p.eggs.length) {
      const best = [...p.eggs].sort((a, b) => ORDER(b.q) - ORDER(a.q))[0];
      p = incubate(p, best.id);
    }
    for (const c of p.creatures) while (stageOf(p.creatures.find(x => x.id === c.id)!) > (p.creatures.find(x => x.id === c.id)!.shown)) p = markShown(p, c.id, now);
    const best = [...p.creatures].sort((a, b) => ORDER(SPECIES_BY_ID[b.species].q) - ORDER(SPECIES_BY_ID[a.species].q) || b.xp - a.xp)[0];
    if (best && best.id !== p.activeId) p = setActive(p, best.id, now);
    const c = active(p);
    if (c) {
      if (decay(c, now).needs.energie < 60) p = sleep(p, now);
      if (pl.feeds) for (const [need, kind] of [['faim', 'food'], ['joie', 'toy']] as [keyof Needs, string][]) {
        for (let k = 0; k < 6; k++) {
          const cur = decay(active(p)!, now).needs[need], gap = 100 - cur;
          if (cur >= 70) break;
          // the item that fills the gap best for its price
          const app = appetiteOf(c.species), money = coins();
          const it = ITEMS.filter(i => i.kind === kind && i.price <= money)
            .map(i => ({ i, eff: Math.min(gap, (i.gain![need] ?? 0) / app) / i.price }))
            .sort((a, b) => b.eff - a.eff)[0]?.i;
          if (!it) break;
          p = giveItem(buy(p, it.id, money, now), it.id, now);
          ds.upkeep += it.price;
        }
      }
    }
    // Save up for the chest of the lowest quality that still has species to find
    const owned = new Set(p.creatures.map(x => x.species));
    const missing = RARITY_ORDER.find(q => ready.some(s => s.q === q && !owned.has(s.id)));
    const chest = missing && ITEMS.find(i => i.kind === 'chest' && (i.min ?? 'commun') === missing);
    const reserve = 25 * (c ? appetiteOf(c.species) : 1);
    if (chest && !p.eggs.length && coins() >= chest.price + reserve) {
      p = buy(p, chest.id, coins(), now);
      ds.chests += chest.price;
      const q = p.eggs.at(-1)!.q, src = (out.chests.shop ??= {});
      src[q] = (src[q] ?? 0) + 1;
      care(now + 1, ds);
    }
  }

  for (let day = 0; day < nDays; day++) {
    const ng = pl.games(day, rnd);
    const ds: DayStat = { day, games: ng, correct: 0, earned: 0, upkeep: 0, chests: 0, balance: 0, species: 0, level: 0, sad: 0, badges: { commun: 0, 'peu-commun': 0, rare: 0, epique: 0, legendaire: 0 }, gameCoins: [] };
    // after school, or all day long for many games
    const start = T0 + day * DAY + (ng > 5 ? 9 : 17) * HOUR, gap = ng > 5 ? (11 * HOUR) / ng : 20 * 60e3;
    let lastErrors: Q[] = [];
    for (let i = 0; i < ng; i++) {
      const ts = start + i * gap;
      const g = playGame(pl, day, pl.plan(day, i, rnd, lastErrors), ts, `s${seed}-${++n}`, rnd);
      lastErrors = g.errors.map(({ a, b }) => ({ a, b }));
      const s = settle(h, p, g, ts + 1000);
      h = s.history; p = s.pet!; badges = unlocked(s.stAfter);
      ds.correct += g.correct;
      ds.earned += s.gains.coins;
      if (s.gains.comp?.mood === 'triste') ds.sad++;
      if (g.mode === 'normal' && valueOf(h, s.game).serious) ds.gameCoins.push(s.gains.coins - s.gains.badgeCoins - s.gains.levelCoins);
      for (const e of p.log.filter(e => e.k === 'chest' && e.t === ts + 1000)) {
        const src = (out.chests[e.src!] ??= {});
        src[e.q!] = (src[e.q!] ?? 0) + 1;
      }
      if (i === 0 || i === ng - 1) care(ts + 2000, ds);
    }
    ds.balance = coins();
    ds.species = new Set(p.creatures.map(c => c.species)).size;
    ds.level = s0(h);
    for (const id of badges) ds.badges[BADGE_BY_ID[id].r]++;
    out.days.push(ds);
    if (out.complete === null && ds.species >= ready.length) out.complete = day;
  }
  return out;
}

const s0 = (h: GameRecord[]) => levelInfo(totalXp(h)).num;
