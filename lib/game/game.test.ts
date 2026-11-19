import { describe, expect, it } from 'vitest';
import { clean } from './clean';
import { createEngine, parseOpts, playHref } from './engine';
import { examQueue, keyOf, makeChoices, pickQuestion } from './questions';
import { ALL_BADGES, computeStats, levelInfo, RARITY_ORDER, rarityFor, starsFor, unlocked, xpOf } from './rules';
import type { GameRecord } from './types';

const DAY = 864e5;
const T0 = new Date(2026, 0, 5, 18).getTime(); // a Monday evening
const game = (p: Partial<GameRecord>): GameRecord => ({
  id: 'g' + Math.random(), ts: T0, mode: 'normal', duration: 60, tables: [2], score: 0, correct: 0, total: 0,
  bestStreak: 0, stars: 0, errors: [], seen: {}, ...p,
});

describe('rules', () => {
  it('has 149 badges', () => expect(ALL_BADGES).toHaveLength(149));
  it('spreads family tiers over the 5 qualities', () => {
    expect(rarityFor(0, 7)).toBe('commun');
    expect(rarityFor(6, 7)).toBe('legendaire');
    expect(new Set([0, 1, 2, 3, 4, 5, 6].map(i => rarityFor(i, 7)))).toEqual(new Set(RARITY_ORDER));
  });

  it('levels need 50, 75, 100… XP', () => {
    expect(levelInfo(0).num).toBe(1);
    expect(levelInfo(49).num).toBe(1);
    expect(levelInfo(50).num).toBe(2);
    expect(levelInfo(125).num).toBe(3);
    expect(levelInfo(125).into).toBe(0);
  });

  it('gives XP per mode', () => {
    expect(xpOf(game({ correct: 10, stars: 2 }))).toBe(30);
    expect(xpOf(game({ mode: 'practice', correct: 10 }))).toBe(20);
    expect(xpOf(game({ mode: 'exam', passed: true, mention: 3, correct: 20 }))).toBe(50);
    expect(xpOf(game({ mode: 'exam', passed: false, correct: 25 }))).toBe(20);
  });

  it('gives stars from answers per minute', () => {
    expect([4, 5, 12, 20].map(c => starsFor(c, 60))).toEqual([0, 1, 2, 3]);
    expect(starsFor(40, 120)).toBe(3);
  });

  it('computes stats from history', () => {
    const h = [
      game({ ts: T0, correct: 10, total: 10, seen: { '3x7': [2, 1] } }),
      game({ ts: T0 + DAY, mode: 'exam', examTable: 7, passed: true, mention: 2 }),
      game({ ts: T0 + 2 * DAY, mode: 'exam', examTable: 7, passed: true, mention: 3 }),
    ];
    const s = computeStats(h);
    expect(s.days).toBe(3);
    expect(s.tableCorrect[3]).toBe(2);
    expect(s.tableCorrect[7]).toBe(2);
    expect(s.dips[7]?.mention).toBe(3);
    expect(s.perfectCount).toBe(1);
    expect(unlocked(s).has('sansfaute:0')).toBe(true);
  });
});

describe('questions', () => {
  it('makes 4 different positive choices including the answer', () => {
    for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) {
      const c = makeChoices(a, b);
      expect(c).toHaveLength(4);
      expect(new Set(c).size).toBe(4);
      expect(c).toContain(a * b);
      expect(c.every(v => v > 0)).toBe(true);
    }
  });

  it('never asks the same calculation twice in a row when it can', () => {
    const pool = [{ a: 2, b: 3 }, { a: 2, b: 4 }];
    for (let i = 0; i < 50; i++) expect(keyOf(pickQuestion(pool, '2x3', new Map()))).toBe('2x4');
  });

  it('builds an exam of 20 questions, each multiplier twice', () => {
    const q = examQueue(7);
    expect(q).toHaveLength(20);
    for (let m = 1; m <= 10; m++) expect(q.filter(x => x.b === m)).toHaveLength(2);
  });
});

describe('engine', () => {
  it('round-trips play options through the URL', () => {
    const url = new URL(playHref({ mode: 'practice', pool: [{ a: 3, b: 7 }] }), 'http://x');
    expect(parseOpts(url.searchParams)).toEqual({ mode: 'practice', pool: [{ a: 3, b: 7 }] });
    expect(parseOpts(new URLSearchParams('mode=exam&table=11'))).toBeNull();
  });

  it('passes an exam with 20 right answers', () => {
    let view: Parameters<Parameters<typeof createEngine>[3]['view']>[0] | null = null;
    let done: Parameters<Parameters<typeof createEngine>[3]['finish']>[0] | null = null;
    const e = createEngine({ mode: 'exam', table: 6 }, [], 60, { view: v => { view = v; }, finish: r => { done = r; } });
    e.start();
    for (let i = 0; i < 20; i++) {
      const cur = view!.current!;
      e.answer(cur.ans);
      e.stop(); e.start(); // skip the 400 ms pause between questions
    }
    expect(done).toMatchObject({ passed: true, mention: 3, rec: { mode: 'exam', correct: 20, examTable: 6 } });
  });
});

describe('clean', () => {
  it('normalizes untrusted games', () => {
    const g = clean({ id: 7, practice: true, seen: { '3x7': [1, 0], bad: [1, 1], '1x2': 'x' }, tables: ['3'] });
    expect(g.mode).toBe('practice');
    expect(g.id).toBe('7');
    expect(g.seen).toEqual({ '3x7': [1, 0] });
    expect(g.tables).toEqual([3]);
  });
});
