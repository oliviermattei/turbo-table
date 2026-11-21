/* eslint-disable @typescript-eslint/no-explicit-any -- untrusted input, checked field by field */
import type { Gains, GameRecord, Mode, Profile, Rarity } from './types';

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
  if (Array.isArray(g.ms)) o.ms = g.ms.slice(0, 1000).map((x: unknown) => Math.max(0, Math.min(600000, Math.round(num(x)))));
  const gains = cleanGains(g.gains);
  if (gains) o.gains = gains;
  return o;
}

const RARITIES: Rarity[] = ['commun', 'peu-commun', 'rare', 'epique', 'legendaire'];
const MOODS = ['content', 'bof', 'triste'] as const;
function cleanGains(x: any): Gains | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const lv = Array.isArray(x.level) ? x.level : [];
  const o: Gains = {
    v: num(x.v), points: num(x.points), raw: num(x.raw), difficulty: num(x.difficulty), serious: !!x.serious,
    xp: num(x.xp), level: [num(lv[0]), num(lv[1])],
    coins: num(x.coins), badgeCoins: num(x.badgeCoins), levelCoins: num(x.levelCoins), compBonus: num(x.compBonus),
    badges: Array.isArray(x.badges) ? x.badges.slice(0, 200).map((b: unknown) => String(b).slice(0, 40)) : [],
    chests: Array.isArray(x.chests) ? x.chests.filter((q: any) => RARITIES.includes(q)).slice(0, 50) : [],
    balance: num(x.balance),
  };
  if (x.comp && typeof x.comp === 'object' && MOODS.includes(x.comp.mood)) {
    o.comp = { species: String(x.comp.species ?? '').slice(0, 40), mood: x.comp.mood, grew: !!x.comp.grew };
  }
  return o;
}

export const validId = (id: string) => /^[\w-]{1,40}$/.test(id);

export const cleanProfile = (p: unknown): Profile => ({ name: String((p as any)?.name ?? '').trim().slice(0, 20) });
