/* eslint-disable @typescript-eslint/no-explicit-any -- untrusted input, checked field by field */
import type { GameRecord, Mode, Profile } from './types';

const num = (v: unknown) => Number(v) || 0;
const MODES: Mode[] = ['normal', 'practice', 'exam'];

/** Normalizes a game from any source (old artifact data, localStorage, API body). */
export function clean(input: unknown): GameRecord {
  const g = (input && typeof input === 'object' ? input : {}) as Record<string, any>;
  const mode: Mode = MODES.includes(g.mode) ? g.mode : g.practice ? 'practice' : 'normal';
  const o: GameRecord = {
    id: String(g.id ?? ''), ts: num(g.ts), mode, duration: num(g.duration),
    tables: Array.isArray(g.tables) ? g.tables.map(num) : [],
    score: num(g.score), correct: num(g.correct), total: num(g.total),
    bestStreak: num(g.bestStreak), stars: num(g.stars),
    errors: Array.isArray(g.errors) ? g.errors.map((e: any) => ({ a: num(e?.a), b: num(e?.b), n: num(e?.n) })) : [],
    seen: {},
  };
  if (g.seen && typeof g.seen === 'object') {
    for (const [k, v] of Object.entries(g.seen)) {
      if (/^\d{1,2}x\d{1,2}$/.test(k) && Array.isArray(v)) o.seen[k] = [num(v[0]), num(v[1])];
    }
  }
  if (mode === 'exam') { o.examTable = num(g.examTable); o.passed = !!g.passed; o.mention = num(g.mention); }
  return o;
}

export const validId = (id: string) => /^[\w-]{1,40}$/.test(id);

export const cleanProfile = (p: unknown): Profile => ({ name: String((p as any)?.name ?? '').trim().slice(0, 20) });
