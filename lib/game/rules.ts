import type { GameRecord, Rarity } from './types';

/* ---------- Diplomas ---------- */
export const MENTIONS: Record<number, { name: string; medal: string }> = {
  3: { name: 'Très Bien', medal: '🥇' }, 2: { name: 'Bien', medal: '🥈' }, 1: { name: 'Assez Bien', medal: '🥉' },
};

/* ---------- Infinite levels ---------- */
export const RANKS: [number, string, string][] = [
  [1, '🐣', 'Apprenti'], [5, '🐭', 'Petit malin'], [10, '🐰', 'Compteur rapide'], [15, '🦊', 'Calculateur'],
  [20, '🐺', 'As du calcul'], [25, '🦅', 'Expert des tables'], [30, '🐯', 'Maître du calcul'], [35, '🦁', 'Champion'],
  [40, '🐉', 'Légende'], [45, '🦄', 'Génie des maths'], [50, '🚀', 'Astronaute'], [60, '🪐', 'Explorateur des planètes'],
  [70, '☄️', 'Chasseur de comètes'], [80, '🌌', 'Gardien de la galaxie'], [100, '👑', 'Empereur des nombres'],
];
/** XP needed to go from level n to level n + 1 */
export const xpStep = (n: number) => 50 + 25 * (n - 1);
export function rankOf(n: number) {
  let r = RANKS[0];
  for (const x of RANKS) if (n >= x[0]) r = x;
  return { emoji: r[1], name: r[2] };
}
export function levelInfo(xp: number) {
  let n = 1, base = 0;
  while (xp >= base + xpStep(n)) { base += xpStep(n); n++; }
  const need = xpStep(n);
  return { num: n, cur: rankOf(n), into: xp - base, need, pct: (xp - base) / need * 100, xp };
}
export type LevelInfo = ReturnType<typeof levelInfo>;

export function xpOf(g: GameRecord) {
  if (g.mode === 'exam') return g.passed ? 20 + (g.mention ?? 0) * 10 : Math.min(g.correct, 20);
  if (g.mode === 'practice') return g.correct * 2;
  return g.correct * 2 + g.stars * 5;
}
export const totalXp = (h: GameRecord[]) => h.reduce((s, g) => s + xpOf(g), 0);

/** Stars from correct answers per minute: ≥ 5 → 1, ≥ 12 → 2, ≥ 20 → 3 */
export function starsFor(correct: number, duration: number) {
  const rate = correct * 60 / duration;
  return rate >= 20 ? 3 : rate >= 12 ? 2 : rate >= 5 ? 1 : 0;
}
export const pointsFor = (streak: number) => 10 + Math.min(streak, 5) * 2;

export const bestFor = (h: GameRecord[], d: number) =>
  Math.max(0, ...h.filter(g => g.mode === 'normal' && g.duration === d).map(g => g.score));

/* ---------- Rarities ---------- */
export const RARITY: Record<Rarity, { n: string; c: string }> = {
  commun: { n: 'Commun', c: '#cbd5e1' },
  'peu-commun': { n: 'Peu commun', c: '#22c55e' },
  rare: { n: 'Rare', c: '#3b82f6' },
  epique: { n: 'Épique', c: '#a855f7' },
  legendaire: { n: 'Légendaire', c: '#f59e0b' },
};
export const RARITY_ORDER: Rarity[] = ['commun', 'peu-commun', 'rare', 'epique', 'legendaire'];
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
/** Rarity depends on how hard the tier is within its family: first tier commun, last légendaire, the rest spread evenly */
export function rarityFor(i: number, len: number): Rarity {
  const p = len > 1 ? i / (len - 1) : 1;
  return RARITY_ORDER[Math.round(p * (RARITY_ORDER.length - 1))];
}
const pl = (n: number, w: string) => `${n} ${w}${n > 1 ? 's' : ''}`;

/* ---------- Stats recomputed from history ---------- */
export interface Diploma { mention: number; ts: number }
export interface Stats {
  h: GameRecord[]; norm: GameRecord[]; dips: (Diploma | null)[];
  games: number; totalCorrect: number; maxStreak: number; bestRate: number; perfectCount: number;
  totalStars: number; days: number; daysTotal: number; rainbow: number; endurance: number;
  fixedCount: number; dipCount: number; tbCount: number; level: number;
  tableCorrect: number[]; pairsDone: number;
  early: boolean; weekend: boolean; comeback: boolean; records: number; maxPerDay: number;
}

/* ---------- Badges ---------- */
export interface Family {
  id: string; e: string; n: string; table?: number;
  d: (goal: number) => string; v: (s: Stats) => number; goals: number[];
}
export const FAMILIES: Family[] = [
  { id: 'total', e: '✅', n: 'Bonnes réponses', d: g => `${g} bonnes réponses en tout`, v: s => s.totalCorrect, goals: [50, 200, 500, 1000, 2500, 5000, 10000] },
  { id: 'parties', e: '🎮', n: 'Joueur', d: g => `Joue ${pl(g, 'partie')}`, v: s => s.games, goals: [5, 20, 50, 100, 250, 500, 1000] },
  { id: 'serie', e: '🔥', n: 'Série', d: g => `${g} bonnes réponses à la suite`, v: s => s.maxStreak, goals: [10, 20, 30, 50, 75, 100, 150] },
  { id: 'vitesse', e: '⚡', n: 'Vitesse', d: g => `${g} bonnes réponses en 1 minute`, v: s => s.bestRate, goals: [15, 20, 25, 30, 35, 40, 45] },
  { id: 'sansfaute', e: '🎯', n: 'Sans faute', d: g => `${pl(g, 'partie')} sans erreur (10 réponses ou plus)`, v: s => s.perfectCount, goals: [1, 5, 15, 30, 60, 100, 200] },
  { id: 'etoiles', e: '⭐', n: 'Étoiles', d: g => `Gagne ${g} étoiles en tout`, v: s => s.totalStars, goals: [10, 50, 150, 300, 600, 1000, 2000] },
  { id: 'flamme', e: '📅', n: 'Flamme', d: g => `Joue ${g} jours de suite`, v: s => s.days, goals: [2, 3, 5, 7, 14, 21, 30] },
  { id: 'fidele', e: '🗓️', n: 'Fidèle', d: g => `Joue ${g} jours différents`, v: s => s.daysTotal, goals: [3, 7, 15, 30, 60, 100, 200] },
  { id: 'niveau', e: '🆙', n: 'Niveau', d: g => `Atteins le niveau ${g}`, v: s => s.level, goals: [5, 10, 20, 30, 50, 75, 100] },
  { id: 'arcenciel', e: '🌈', n: 'Arc-en-ciel', d: g => `${pl(g, 'partie')} avec toutes les tables et 2 étoiles`, v: s => s.rainbow, goals: [1, 5, 15, 30, 60, 100] },
  { id: 'endurance', e: '🏔️', n: 'Endurance', d: g => `${pl(g, 'partie')} de 3 minutes avec 2 étoiles`, v: s => s.endurance, goals: [1, 5, 15, 30, 60] },
  { id: 'reparateur', e: '🔧', n: 'Réparateur', d: g => `Répare tes erreurs sans faute ${g} fois`, v: s => s.fixedCount, goals: [1, 5, 15, 30, 60] },
  { id: 'diplomes', e: '🎓', n: 'Diplômes', d: g => `Gagne ${pl(g, 'diplôme')}`, v: s => s.dipCount, goals: [1, 3, 5, 8, 10] },
  { id: 'tresbien', e: '🏅', n: 'Très Bien', d: g => `${pl(g, 'diplôme')} « Très Bien »`, v: s => s.tbCount, goals: [1, 3, 5, 8, 10] },
];
// One family per table: correct answers in that table
for (let t = 1; t <= 10; t++) {
  FAMILIES.push({
    id: 't' + t, table: t, e: String(t), n: `Table de ${t}`, d: g => `${g} bonnes réponses dans la table de ${t}`,
    v: s => s.tableCorrect[t], goals: [25, 100, 250, 500, 1000],
  });
}

export interface Secret { id: string; e: string; n: string; r: Rarity; d: string; t: (s: Stats) => boolean }
export const SECRETS: Secret[] = [
  { id: 's_matin', e: '🐓', n: 'Lève-tôt', r: 'rare', d: 'Joue avant 8 h du matin', t: s => s.early },
  { id: 's_weekend', e: '🎉', n: 'Week-end studieux', r: 'rare', d: 'Joue le samedi et le dimanche', t: s => s.weekend },
  { id: 's_100', e: '🎰', n: 'Pile-poil', r: 'rare', d: 'Finis une partie avec exactement 100 points', t: s => s.norm.some(g => g.score === 100) },
  { id: 's_retour', e: '🔁', n: 'Le grand retour', r: 'rare', d: "Reviens jouer après 7 jours d'absence", t: s => s.comeback },
  { id: 's_dix', e: '🦾', n: 'Increvable', r: 'epique', d: 'Joue 10 parties dans la même journée', t: s => s.maxPerDay >= 10 },
  { id: 's_record', e: '📈', n: 'Toujours mieux', r: 'epique', d: 'Bats ton record 10 fois', t: s => s.records >= 10 },
  { id: 's_tous', e: '🧮', n: 'Collectionneur', r: 'epique', d: 'Réussis tous les calculs des tables de 1 à 10', t: s => s.pairsDone >= 55 },
  { id: 's_froid', e: '🧊', n: 'Sang-froid', r: 'epique', d: '3 étoiles dans une partie de 3 minutes', t: s => s.norm.some(g => g.duration >= 180 && g.stars >= 3) },
  { id: 's_perfect', e: '💎', n: 'Perfection', r: 'legendaire', d: '30 bonnes réponses sans aucune erreur', t: s => s.norm.some(g => g.correct >= 30 && g.correct === g.total) },
  { id: 's_tb10', e: '👑', n: 'Maître absolu', r: 'legendaire', d: 'Les 10 diplômes avec la mention Très Bien', t: s => s.tbCount >= 10 },
];

export interface Badge { id: string; r: Rarity; e: string; n: string; d: string; fam?: Family; tier?: number; goal?: number; secret?: boolean }
export const ALL_BADGES: Badge[] = [
  ...FAMILIES.flatMap(f => f.goals.map((goal, i) => ({
    id: f.id + ':' + i, fam: f, tier: i, goal, r: rarityFor(i, f.goals.length),
    e: f.e, n: `${f.n}${f.table ? ' · ' : ' '}${ROMAN[i]}`, d: f.d(goal),
  }))),
  ...SECRETS.map(x => ({ id: x.id, secret: true, r: x.r, e: x.e, n: x.n, d: x.d })),
];
export const BADGE_BY_ID: Record<string, Badge> = Object.fromEntries(ALL_BADGES.map(b => [b.id, b]));

export function unlocked(s: Stats): Set<string> {
  const got = new Set<string>();
  FAMILIES.forEach(f => { const v = f.v(s); f.goals.forEach((g, i) => { if (v >= g) got.add(f.id + ':' + i); }); });
  SECRETS.forEach(x => { if (x.t(s)) got.add(x.id); });
  return got;
}

export type FamProgress =
  | { done: true; v: number; tier: number }
  | { done: false; v: number; i: number; goal: number; tier: number; pct: number };
export function famProgress(f: Family, st: Stats): FamProgress {
  const v = f.v(st);
  const i = f.goals.findIndex(g => v < g); // -1 = every tier won
  if (i < 0) return { done: true, v, tier: f.goals.length - 1 };
  const prev = i ? f.goals[i - 1] : 0, goal = f.goals[i];
  return { done: false, v, i, goal, tier: i - 1, pct: Math.max(0, (v - prev) / (goal - prev) * 100) };
}
export type NextBadge = Extract<FamProgress, { done: false }> & { b: Badge };
/** The badge closest to being won */
export function nextBadge(st: Stats): NextBadge | null {
  let best: NextBadge | null = null;
  for (const f of FAMILIES) {
    const pr = famProgress(f, st);
    if (!pr.done && (!best || pr.pct > best.pct)) best = { ...pr, b: BADGE_BY_ID[f.id + ':' + pr.i] };
  }
  return best;
}

/* ---------- Stats ---------- */
const dayKey = (ts: number) => { const d = new Date(ts); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const dayTime = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };

export function diplomas(h: GameRecord[]): (Diploma | null)[] {
  const d: (Diploma | null)[] = Array(11).fill(null);
  h.forEach(g => {
    if (g.mode !== 'exam' || !g.passed || !g.examTable) return;
    const t = g.examTable, cur = d[t], mention = g.mention ?? 0;
    if (!cur || mention > cur.mention || (mention === cur.mention && g.ts < cur.ts)) d[t] = { mention, ts: g.ts };
  });
  return d;
}

export function computeStats(h: GameRecord[]): Stats {
  const dips = diplomas(h), got = dips.filter((x): x is Diploma => !!x);
  const norm = h.filter(g => g.mode === 'normal');
  const chrono = [...h].sort((a, b) => a.ts - b.ts);

  // Days played
  const perDay: Record<string, number> = {};
  h.forEach(g => { const k = dayKey(g.ts); perDay[k] = (perDay[k] || 0) + 1; });
  const days = Object.keys(perDay).map(dayTime).sort((a, b) => a - b);
  let streak = days.length ? 1 : 0, run = 1, comeback = false;
  for (let i = 1; i < days.length; i++) {
    const gap = Math.round((days[i] - days[i - 1]) / 864e5);
    run = gap === 1 ? run + 1 : 1;
    streak = Math.max(streak, run);
    if (gap >= 8) comeback = true;
  }
  const daySet = new Set(days);
  const weekend = days.some(t => new Date(t).getDay() === 6 && daySet.has(new Date(t).setDate(new Date(t).getDate() + 1)));

  // Records beaten (normal games, per duration)
  const bests: Record<number, number> = {};
  let records = 0;
  chrono.filter(g => g.mode === 'normal').forEach(g => {
    const b = bests[g.duration] || 0;
    if (b > 0 && g.score > b) records++;
    if (g.score > b) bests[g.duration] = g.score;
  });

  // Correct answers per table, and calculations already succeeded
  const tableCorrect: number[] = Array(11).fill(0), pairs = new Set<string>();
  h.forEach(g => Object.entries(g.seen || {}).forEach(([k, v]) => {
    const [a, b] = k.split('x').map(Number);
    if (v[0] > 0 && a >= 1 && b <= 10) pairs.add(k);
    if (a >= 1 && a <= 10) tableCorrect[a] += v[0];
    if (b !== a && b >= 1 && b <= 10) tableCorrect[b] += v[0];
  }));

  return {
    h, norm, dips,
    games: h.length,
    totalCorrect: h.reduce((s, g) => s + g.correct, 0),
    maxStreak: h.reduce((m, g) => Math.max(m, g.bestStreak), 0),
    bestRate: norm.filter(g => g.duration >= 60).reduce((m, g) => Math.max(m, Math.floor(g.correct * 60 / g.duration)), 0),
    perfectCount: norm.filter(g => g.total >= 10 && g.correct === g.total).length,
    totalStars: norm.reduce((s, g) => s + g.stars, 0),
    days: streak, daysTotal: days.length,
    rainbow: norm.filter(g => g.tables.length >= 10 && g.stars >= 2).length,
    endurance: norm.filter(g => g.duration >= 180 && g.stars >= 2).length,
    fixedCount: h.filter(g => g.mode === 'practice' && g.total >= 5 && g.correct === g.total).length,
    dipCount: got.length, tbCount: got.filter(x => x.mention === 3).length,
    level: levelInfo(totalXp(h)).num,
    tableCorrect, pairsDone: pairs.size,
    early: h.some(g => new Date(g.ts).getHours() < 8),
    weekend, comeback, records,
    maxPerDay: Math.max(0, ...Object.values(perDay)),
  };
}
