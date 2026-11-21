export type Mode = 'normal' | 'practice' | 'exam';
export type Rarity = 'commun' | 'peu-commun' | 'rare' | 'epique' | 'legendaire';

export interface Miss { a: number; b: number; n: number }

/** One played game. This is the only thing stored: levels, XP, badges and diplomas are recomputed from it. */
export interface GameRecord {
  id: string;
  ts: number;
  mode: Mode;
  duration: number;
  tables: number[];
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  stars: number;
  errors: Miss[];
  /** key = "min x max" → [right, wrong] */
  seen: Record<string, [number, number]>;
  // exams only
  examTable?: number;
  passed?: boolean;
  mention?: number;
  /** Time taken by each answer, in ms */
  ms?: number[];
  /** What the game brought when it was played: a snapshot for the parent's journal and balance analysis, never used to compute anything */
  gains?: Gains;
}

/** Snapshot of a game's rewards (see lib/settle.ts). `v` = version of the rules that computed it. */
export interface Gains {
  v: number;
  /** counted points (after the daily decrease), points before it, average difficulty, game that counts for badges */
  points: number; raw: number; difficulty: number; serious: boolean;
  xp: number; level: [number, number];
  /** coins: total, of which badges, levels and the companion bonus */
  coins: number; badgeCoins: number; levelCoins: number; compBonus: number;
  badges: string[];
  /** qualities of the chests won (drop, badge, safety net) */
  chests: Rarity[];
  /** coins after the game */
  balance: number;
  /** active companion when the game ended */
  comp?: { species: string; mood: 'content' | 'bof' | 'triste'; grew: boolean };
}

export interface Profile { name: string }
