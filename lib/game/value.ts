import { DAILY, GAME, SERIOUS, TABLE_VALUE } from '../balance';
import type { GameRecord } from './types';

/**
 * What each game is worth, recomputed from the history (nothing here is stored).
 * A right answer is worth the value of its easier factor, and a day's points shrink past a threshold,
 * so a game on the table of 1 or a marathon day cannot unlock the whole game.
 */

const factorValue = (n: number) => TABLE_VALUE[n] ?? 1;
export const pairValue = (a: number, b: number) => Math.min(factorValue(a), factorValue(b));
const pairsOf = (g: GameRecord) => Object.entries(g.seen || {}).map(([k, v]) => {
  const [a, b] = k.split('x').map(Number);
  return { a, b, v: pairValue(a, b), right: v[0], wrong: v[1] };
});

// A game never changes: its difficulty and points are computed once
const memo = new WeakMap<GameRecord, { d: number; raw: number }>();
const of = (g: GameRecord) => {
  let m = memo.get(g);
  if (!m) { m = { d: computeDifficulty(g), raw: computeRaw(g) }; memo.set(g, m); }
  return m;
};

/** Average value of the calculations asked (0.1 for the table of 1 only, ~0.6 for tables 2 to 9) */
export const difficulty = (g: GameRecord) => of(g).d;
function computeDifficulty(g: GameRecord) {
  const p = pairsOf(g), n = p.reduce((s, x) => s + x.right + x.wrong, 0);
  if (n) return p.reduce((s, x) => s + x.v * (x.right + x.wrong), 0) / n;
  // old games without `seen`: average over the tables played
  const t = g.mode === 'exam' && g.examTable ? [g.examTable] : g.tables;
  if (!t.length) return 0;
  let s = 0;
  for (const a of t) for (let b = 1; b <= 10; b++) s += pairValue(a, b);
  return s / (t.length * 10);
}

/** Points before the daily decrease: the sum of the right answers' values */
export const rawPoints = (g: GameRecord) => of(g).raw;
function computeRaw(g: GameRecord) {
  const p = pairsOf(g);
  return p.length ? p.reduce((s, x) => s + x.v * x.right, 0) : g.correct * computeDifficulty(g);
}

/** A game that counts for badges, stars, games and days played */
export const isSerious = (g: GameRecord) => g.correct >= SERIOUS.correct && difficulty(g) >= SERIOUS.difficulty;

/** Points left of `x` new points when `before` points were already made that day */
export function taper(before: number, x: number) {
  const a = DAILY.full, b = DAILY.full + DAILY.half;
  const seg = (lo: number, hi: number) => Math.max(0, Math.min(before + x, hi) - Math.max(before, lo));
  return seg(0, a) + seg(a, b) * 0.5 + seg(b, Infinity) * DAILY.rest;
}

export interface GameValue {
  difficulty: number; serious: boolean;
  /** points before / after the daily decrease, and points already made that day before this game */
  raw: number; points: number; dayBefore: number;
  /** exam that gives a new diploma or a better mention */
  improved: boolean;
  practiceBonus: number;
  /** first game that counts of the day */
  dailyBonus: number;
  coins: number; xp: number;
}

export const dayKey = (ts: number) => { const d = new Date(ts); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

const cache = new WeakMap<GameRecord[], { n: number; first: string; map: Map<string, GameValue> }>();
/** The value of every game of a history, by id (computed in play order, cached per history array) */
export function values(h: GameRecord[]): Map<string, GameValue> {
  const c = cache.get(h);
  if (c && c.n === h.length && c.first === h[0]?.id) return c.map;
  const map = new Map<string, GameValue>();
  const perDay = new Map<string, { points: number; practice: number; bonus: boolean }>();
  const best: number[] = Array(11).fill(-1);
  for (const g of [...h].sort((x, y) => x.ts - y.ts)) {
    const k = dayKey(g.ts), day = perDay.get(k) ?? { points: 0, practice: 0, bonus: false };
    const diff = difficulty(g), serious = isSerious(g), raw = rawPoints(g);
    const points = taper(day.points, raw);
    let improved = false, practiceBonus = 0;
    if (g.mode === 'exam' && g.passed && g.examTable) {
      const m = g.mention ?? 0;
      improved = m > best[g.examTable];
      if (improved) best[g.examTable] = m;
    }
    if (g.mode === 'practice' && serious && g.total >= 3 && day.practice < GAME.practicePerDay) {
      practiceBonus = GAME.practiceBonus + (g.correct === g.total ? GAME.practicePerfect : 0);
      day.practice++;
    }
    const dailyBonus = serious && !day.bonus ? GAME.dailyBonus : 0;
    if (serious) day.bonus = true;
    const stars = g.mode === 'normal' && serious ? g.stars : 0;
    const m = g.mention ?? 0;
    const coins = Math.round(improved ? GAME.examCoins[0] + GAME.examCoins[1] * m
      : points * GAME.coinsPerPoint + stars * GAME.coinsPerStar + practiceBonus) + dailyBonus;
    const xp = Math.round(improved ? GAME.examXp[0] + GAME.examXp[1] * m : points * GAME.xpPerPoint + stars * GAME.xpPerStar);
    day.points += raw;
    perDay.set(k, day);
    map.set(g.id, { difficulty: diff, serious, raw, points, dayBefore: day.points - raw, improved, practiceBonus, dailyBonus, coins, xp });
  }
  cache.set(h, { n: h.length, first: h[0]?.id, map });
  return map;
}

const ZERO: GameValue = { difficulty: 0, serious: false, raw: 0, points: 0, dayBefore: 0, improved: false, practiceBonus: 0, dailyBonus: 0, coins: 0, xp: 0 };
export const valueOf = (h: GameRecord[], g: GameRecord) => values(h).get(g.id) ?? ZERO;
/** Counted points of the whole history: they hatch eggs (rounded down) */
export const totalPoints = (h: GameRecord[]) => Math.floor([...values(h).values()].reduce((s, v) => s + v.points, 0) + 1e-9);
