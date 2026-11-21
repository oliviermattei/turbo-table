import { buildPool, examQueue, keyOf, pickQuestion, type Q } from '../game/questions';
import { pointsFor, starsFor } from '../game/rules';
import type { GameRecord } from '../game/types';
import { pairValue } from '../game/value';

/**
 * Virtual players for the balance simulator. Each one decides how many games it plays each day,
 * which ones (tables, duration, exams, training), and how fast and how well it answers.
 */

export type Rnd = () => number;
export type Plan = { mode: 'normal'; tables: number[]; duration: number } | { mode: 'practice'; pool: Q[] } | { mode: 'exam'; table: number };

export interface Player {
  id: string; name: string; desc: string;
  /** Right answers per minute on tables 2 to 9, on day d (0 = first day) */
  speed(d: number): number;
  /** Chance of a wrong answer on the hardest calculations, on day d */
  error(d: number): number;
  /** Games played on day d */
  games(d: number, rnd: Rnd): number;
  /** The i-th game of day d; `lastErrors` = mistakes of the previous game */
  plan(d: number, i: number, rnd: Rnd, lastErrors: Q[]): Plan;
  /** Takes care of the companion (food, toys); false = only the free nap */
  feeds: boolean;
}

/** Easy calculations are answered faster: time × (0.3 + 0.7 × value). Average of that factor on tables 2 to 9: */
const HARD_FACTOR = (() => { const p = buildPool([2, 3, 4, 5, 6, 7, 8, 9]); return p.reduce((s, q) => s + 0.3 + 0.7 * pairValue(q.a, q.b), 0) / p.length; })();
const pick = <T,>(rnd: Rnd, a: T[]) => a[Math.floor(rnd() * a.length)];
const between = (rnd: Rnd, lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
const HARD = [2, 3, 4, 5, 6, 7, 8, 9];

/** A child who learns: 14 → 22 right answers a minute in 6 months, very keen the first week, then ~4 games a day */
const childGames = (d: number, rnd: Rnd) => {
  if (rnd() < (d < 14 ? 0.03 : 0.12)) return 0; // days off
  if (d < 7) return between(rnd, 10, 15);
  if (d < 14) return between(rnd, 6, 9);
  if (d < 30) return between(rnd, 4, 7);
  return between(rnd, 3, 5);
};
function childPlan(d: number, i: number, rnd: Rnd, lastErrors: Q[]): Plan {
  if (lastErrors.length >= 2 && rnd() < 0.3) return { mode: 'practice', pool: lastErrors };
  if (d > 5 && i === 0 && rnd() < 0.15) return { mode: 'exam', table: pick(rnd, d < 60 ? [1, 2, 5, 10, 3] : [...HARD, 1, 10]) };
  const r = rnd(), duration = pick(rnd, [60, 60, 60, 60, 60, 60, 120, 120, 180, 30]);
  if (r < 0.4) return { mode: 'normal', tables: d < 45 ? [2, 3, 4, 5] : HARD, duration };
  if (r < 0.65) return { mode: 'normal', tables: [pick(rnd, HARD)], duration };
  if (r < 0.9) return { mode: 'normal', tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], duration };
  return { mode: 'normal', tables: [pick(rnd, [1, 2, 5, 10])], duration }; // sometimes an easy one
}
const child = { speed: (d: number) => Math.min(24, 14 + (8 * d) / 180), error: (d: number) => Math.max(0.04, 0.14 - (0.08 * d) / 180), plan: childPlan, feeds: true };

export const PLAYERS: Player[] = [
  { id: 'enfant', name: 'Enfant (cas visé)', desc: '14 → 22 bonnes réponses/min en 6 mois ; 10-15 parties/jour la 1re semaine, puis ~4 ; tables variées, examens, entraînements', games: childGames, ...child },
  { id: 'marathon', name: 'Enfant très motivé', desc: 'Comme l’enfant, mais 30 parties/jour la 1re semaine et 8/jour ensuite', ...child, games: (d, rnd) => (d < 7 ? 30 : between(rnd, 6, 10)) },
  { id: 'fourbe', name: 'Fourbe table de 1', desc: 'Uniquement la table de 1 en 30 s (20 parties/jour), examen de la table de 1, entraînements pour le bonus', ...child,
    games: (d, rnd) => (d < 14 ? 20 : between(rnd, 8, 12)),
    plan: (d, i) => (i % 5 === 4 ? { mode: 'exam', table: 1 } : i % 5 === 3 ? { mode: 'practice', pool: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 1, b: 4 }] } : { mode: 'normal', tables: [1], duration: 30 }) },
  { id: 'facile', name: 'Fourbe tables faciles', desc: 'Tables 1, 2, 5 et 10 ensemble, parties de 60 s, 10 par jour', ...child,
    games: () => 10, plan: () => ({ mode: 'normal', tables: [1, 2, 5, 10], duration: 60 }) },
  { id: 'adulte', name: 'Adulte rapide', desc: '32 bonnes réponses/min, 2 % d’erreurs, toutes les tables, 4 parties de 60 à 180 s par jour', ...child,
    speed: () => 32, error: () => 0.02, games: () => 4,
    plan: (d, i, rnd) => ({ mode: 'normal', tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], duration: pick(rnd, [60, 120, 180]) }) },
  { id: 'petit', name: 'Joue peu', desc: '12 bonnes réponses/min, 2 parties de 60 s par jour, tables 2 à 5', ...child,
    speed: () => 12, games: (d, rnd) => (rnd() < 0.2 ? 0 : 2), plan: () => ({ mode: 'normal', tables: [2, 3, 4, 5], duration: 60 }) },
  { id: 'negligent', name: 'Ne nourrit jamais', desc: 'Joue comme l’enfant mais ne donne jamais à manger ni à jouer (seulement la sieste gratuite)', games: childGames, ...child, feeds: false },
];

/**
 * Plays one game like the real engine (same question picker, same pauses: 0.4 s after a right answer, 1.6 s after
 * a wrong one, the exam clock stops during a correction), with the player's thinking time and mistakes.
 */
export function playGame(pl: Player, d: number, plan: Plan, ts: number, id: string, rnd: Rnd): GameRecord {
  const exam = plan.mode === 'exam';
  const duration = plan.mode === 'normal' ? plan.duration : 60;
  // thinking time for a hard calculation, so that `speed` right answers fit in a minute on tables 2 to 9
  const think = Math.max(0.3, (60 / pl.speed(d) - 0.4) / HARD_FACTOR);
  const pool = plan.mode === 'normal' ? buildPool(plan.tables) : plan.mode === 'practice' ? plan.pool : [];
  const queue = exam ? examQueue(plan.table) : [];
  const misses = new Map<string, { count: number }>(), seen: Record<string, [number, number]> = {}, ms: number[] = [];
  let t = 0, end = duration, prev = '', score = 0, streak = 0, best = 0, correct = 0, total = 0, errs = 0;
  while (true) {
    let q: Q;
    if (exam) {
      if (!queue.length || errs > 2) break;
      const e = queue.shift()!;
      q = rnd() < 0.5 ? e : { a: e.b, b: e.a };
    } else { q = pickQuestion(pool, prev, misses); prev = keyOf(q); }
    const v = pairValue(q.a, q.b);
    const dt = think * (0.3 + 0.7 * v) * (0.7 + rnd() * 0.6);
    if (t + dt > end) break;
    t += dt; total++; ms.push(Math.round(dt * 1000));
    const k = keyOf(q), sv = seen[k] ?? [0, 0];
    const good = rnd() >= pl.error(d) * v;
    if (good) { score += pointsFor(streak); streak++; best = Math.max(best, streak); correct++; sv[0]++; t += 0.4; }
    else {
      streak = 0; sv[1]++; errs++;
      const m = misses.get(k) ?? { count: 0 }; m.count++; misses.set(k, m);
      if (exam) end += 1.6;
      t += 1.6;
    }
    seen[k] = sv;
  }
  const errors = [...misses.entries()].map(([k, m]) => { const [a, b] = k.split('x').map(Number); return { a, b, n: m.count }; });
  const g: GameRecord = {
    id, ts, mode: plan.mode, duration, tables: plan.mode === 'normal' ? [...plan.tables].sort((x, y) => x - y) : exam ? [plan.table] : [],
    score, correct, total, bestStreak: best, stars: exam ? 0 : starsFor(correct, duration), errors, seen, ms,
  };
  if (exam) Object.assign(g, { examTable: plan.table, passed: total === 20 && errs <= 2, mention: total === 20 && errs <= 2 ? 3 - errs : 0 });
  return g;
}
