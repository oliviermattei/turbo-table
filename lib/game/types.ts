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
}

export interface Profile { name: string }
