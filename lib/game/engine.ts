import { sBad, sGood } from '../sound';
import { buildPool, examQueue, keyOf, makeChoices, pickQuestion, type Q } from './questions';
import { pointsFor, starsFor } from './rules';
import type { GameRecord } from './types';

export type PlayOpts = { mode: 'normal' } | { mode: 'practice'; pool: Q[] } | { mode: 'exam'; table: number };

/** URL of the play screen. `n` makes every start unique, so "Rejouer" remounts a fresh game. */
export function playHref(o: PlayOpts) {
  const p = new URLSearchParams({ mode: o.mode, n: String(Date.now()) });
  if (o.mode === 'exam') p.set('table', String(o.table));
  if (o.mode === 'practice') p.set('pool', o.pool.map(q => q.a + 'x' + q.b).join(','));
  return '/jouer?' + p;
}

const isFactor = (n: number) => Number.isInteger(n) && n >= 1 && n <= 10;
export function parseOpts(sp: { get(k: string): string | null }): PlayOpts | null {
  const mode = sp.get('mode');
  if (mode === 'exam') {
    const t = Number(sp.get('table'));
    return isFactor(t) ? { mode, table: t } : null;
  }
  if (mode === 'practice') {
    const pool = (sp.get('pool') || '').split(',').map(s => s.split('x').map(Number))
      .filter(([a, b]) => isFactor(a) && isFactor(b)).map(([a, b]) => ({ a, b }));
    return pool.length ? { mode, pool } : null;
  }
  return mode === 'normal' ? { mode } : null;
}

/** Test mode: a normal game won with a super score, without playing (800 right answers, no mistake). */
export function fakeRun(tables: number[], duration: number): RunResult {
  const pool = buildPool(tables), correct = 800;
  const seen: Record<string, [number, number]> = {};
  let score = 0;
  for (let i = 0; i < correct; i++) {
    const q = pool[i % pool.length], k = keyOf(q);
    seen[k] = [(seen[k]?.[0] ?? 0) + 1, 0];
    score += pointsFor(i);
  }
  const rec: Omit<GameRecord, 'id'> = {
    ts: Date.now(), mode: 'normal', duration, tables: [...tables].sort((x, y) => x - y),
    score, correct, total: correct, bestStreak: correct, stars: starsFor(correct, duration), errors: [], seen,
  };
  return { rec, table: 0, passed: false, mention: 0, examErrors: 0, errs: [] };
}

export interface Current extends Q { ans: number; choices: number[] }
export interface Feedback { picked: number; good: boolean; pts: number }
/** What the play screen draws. Republished on every change and every 100 ms. */
export interface View {
  score: number; streak: number; examErrors: number; examShown: number;
  left: number; duration: number; current: Current | null; fb: Feedback | null; plusKey: number;
}
export interface MissCount { a: number; b: number; count: number }
export interface RunResult {
  rec: Omit<GameRecord, 'id'>; table: number; passed: boolean; mention: number; examErrors: number; errs: MissCount[];
}

/** Game loop (normal, practice, exam). Framework-free: the React screen only feeds clicks and draws views. */
export function createEngine(opts: PlayOpts, tables: number[], duration: number,
  on: { view(v: View): void; finish(r: RunResult): void }) {
  const exam = opts.mode === 'exam';
  const s = {
    table: exam ? opts.table : 0,
    duration: exam ? 60 : duration,
    tables: exam ? [opts.table] : opts.mode === 'normal' ? [...tables].sort((x, y) => x - y) : [],
    pool: opts.mode === 'practice' ? opts.pool : opts.mode === 'normal' ? buildPool(tables) : [],
    queue: exam ? examQueue(opts.table) : [],
    misses: new Map<string, MissCount>(),
    seen: new Map<string, [number, number]>(),
    prevKey: '', score: 0, streak: 0, bestStreak: 0, correct: 0, total: 0, examErrors: 0,
    endAt: 0, playing: false, locked: false, plusKey: 0,
    current: null as Current | null, fb: null as Feedback | null,
    timer: undefined as ReturnType<typeof setInterval> | undefined,
    next: undefined as ReturnType<typeof setTimeout> | undefined,
  };

  const publish = () => on.view({
    score: s.score, streak: s.streak, examErrors: s.examErrors, examShown: 20 - s.queue.length,
    left: s.playing ? Math.max(0, s.endAt - performance.now()) : s.duration * 1000, duration: s.duration,
    current: s.current, fb: s.fb, plusKey: s.plusKey,
  });

  function stop() { clearInterval(s.timer); clearTimeout(s.next); s.playing = false; }

  function showQuestion() {
    if (!s.playing) return;
    let q: Q;
    if (exam) {
      if (!s.queue.length || s.examErrors > 2) return finish();
      const e = s.queue.shift()!;
      q = Math.random() < 0.5 ? e : { a: e.b, b: e.a };
    } else {
      q = pickQuestion(s.pool, s.prevKey, s.misses);
      s.prevKey = keyOf(q);
    }
    s.current = { ...q, ans: q.a * q.b, choices: makeChoices(q.a, q.b) };
    s.locked = false;
    s.fb = null;
    publish();
  }

  function answer(val: number) {
    const c = s.current;
    if (!s.playing || s.locked || !c) return;
    s.locked = true;
    s.total++;
    const k = keyOf(c), sv = s.seen.get(k) || [0, 0];
    if (val === c.ans) sv[0]++; else sv[1]++;
    s.seen.set(k, sv);
    if (val === c.ans) {
      const pts = pointsFor(s.streak);
      s.correct++; s.score += pts; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.fb = { picked: val, good: true, pts }; s.plusKey++;
      sGood();
      s.next = setTimeout(showQuestion, 400);
    } else {
      s.streak = 0;
      if (exam) { s.examErrors++; s.endAt += 1600; } // the exam clock stops while the correction shows
      const m = s.misses.get(k) || { a: Math.min(c.a, c.b), b: Math.max(c.a, c.b), count: 0 };
      m.count++; s.misses.set(k, m);
      s.fb = { picked: val, good: false, pts: 0 };
      sBad();
      s.next = setTimeout(showQuestion, 1600);
    }
    publish();
  }

  function finish() {
    if (!s.playing) return;
    stop();
    const errs = [...s.misses.values()].sort((x, y) => y.count - x.count);
    const passed = exam && s.total === 20 && s.examErrors <= 2;
    const mention = passed ? 3 - s.examErrors : 0;
    const rec: Omit<GameRecord, 'id'> = {
      ts: Date.now(), mode: opts.mode, duration: s.duration, tables: s.tables,
      score: s.score, correct: s.correct, total: s.total, bestStreak: s.bestStreak,
      stars: exam ? 0 : starsFor(s.correct, s.duration),
      errors: errs.map(e => ({ a: e.a, b: e.b, n: e.count })),
      seen: Object.fromEntries(s.seen),
    };
    if (exam) Object.assign(rec, { examTable: s.table, passed, mention });
    on.finish({ rec, table: s.table, passed, mention, examErrors: s.examErrors, errs });
  }

  function tick() {
    publish();
    if (s.endAt - performance.now() <= 0) finish();
  }

  return {
    publish,
    start() {
      s.playing = true;
      s.endAt = performance.now() + s.duration * 1000;
      s.timer = setInterval(tick, 100);
      showQuestion();
    },
    stop,
    answer,
    answerIndex(i: number) { const v = s.current?.choices[i]; if (v !== undefined) answer(v); },
    /** test hook: end the clock now */
    expire() { s.endAt = performance.now(); },
  };
}
