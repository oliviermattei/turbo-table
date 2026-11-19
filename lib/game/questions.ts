export interface Q { a: number; b: number }

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const keyOf = (q: Q) => Math.min(q.a, q.b) + 'x' + Math.max(q.a, q.b);

export const buildPool = (tables: number[]): Q[] =>
  tables.flatMap(t => Array.from({ length: 10 }, (_, i) => ({ a: t, b: i + 1 })));

/** Weighted pick: each miss in this game makes a calculation 3× more likely. Never the same twice in a row. */
export function pickQuestion(pool: Q[], prevKey: string, misses: Map<string, { count: number }>): Q {
  let candidates = pool.filter(q => keyOf(q) !== prevKey);
  if (!candidates.length) candidates = pool;
  const weights = candidates.map(q => 1 + 3 * (misses.get(keyOf(q))?.count || 0));
  let r = Math.random() * weights.reduce((s, w) => s + w, 0);
  let q = candidates[0];
  for (let i = 0; i < candidates.length; i++) { r -= weights[i]; if (r <= 0) { q = candidates[i]; break; } }
  return Math.random() < 0.5 ? { a: q.a, b: q.b } : { a: q.b, b: q.a };
}

/** 4 shuffled answers: the right one + believable traps (neighbours in the table first). */
export function makeChoices(a: number, b: number): number[] {
  const ans = a * b;
  const near = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b];
  const far = [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2,
    parseInt(String(ans).split('').reverse().join(''), 10)];
  const ok = (v: number) => v > 0 && v !== ans;
  const picks: number[] = [];
  [...shuffle(near.filter(ok)), ...shuffle(far.filter(ok))].forEach(v => {
    if (picks.length < 3 && !picks.includes(v)) picks.push(v);
  });
  let extra = ans + 3;
  while (picks.length < 3) { if (!picks.includes(extra)) picks.push(extra); extra++; }
  return shuffle([ans, ...picks]);
}

/** Exam: each multiplier of the table twice, never the same one twice in a row. */
export function examQueue(table: number): Q[] {
  const q: Q[] = [];
  for (let r = 0; r < 2; r++) for (let m = 1; m <= 10; m++) q.push({ a: table, b: m });
  shuffle(q);
  for (let i = 1; i < q.length; i++) {
    if (q[i].b === q[i - 1].b) { const j = (i + 2) % q.length; [q[i], q[j]] = [q[j], q[i]]; }
  }
  return q;
}
