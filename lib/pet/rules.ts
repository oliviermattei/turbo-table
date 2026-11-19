import type { GameRecord, Rarity } from '../game/types';
import { BADGE_BY_ID, levelInfo, RARITY_ORDER, totalXp } from '../game/rules';
import assets from './assets.json';
import { SPECIES, SPECIES_BY_ID, type Species } from './species';
import type { Creature, Egg, EggSource, Needs, PetState } from './types';

/* ---------- Stages ---------- */
export const STAGES = ['bebe', 'petit', 'grand', 'super'] as const;
export const STAGE_NAMES = ['Bébé', 'Petit', 'Grand', 'Super'];
/** Creature XP (1 per correct answer) needed for each stage */
export const STAGE_XP = [0, 150, 600, 1500];
export const stageOf = (xp: number) => STAGE_XP.reduce((s, need, i) => (xp >= need ? i : s), 0);

/* ---------- Coins ---------- */
const BADGE_COINS: Record<Rarity, number> = { commun: 5, 'peu-commun': 10, rare: 15, epique: 40, legendaire: 100 };
export const LEVEL_COINS = 20;
/** Training on mistakes earns a bonus: 15 for a session of 3+ questions, 15 more without any mistake */
export const practiceBonus = (g: GameRecord) =>
  g.mode !== 'practice' || g.total < 3 ? 0 : 15 + (g.correct === g.total ? 15 : 0);
export function coinsOfGame(g: GameRecord) {
  if (g.mode === 'exam') return g.passed ? 10 + 10 * (g.mention ?? 0) : Math.min(g.correct, 20);
  if (g.mode === 'practice') return g.correct + practiceBonus(g);
  return g.correct + 5 * g.stars;
}
export const badgeCoins = (ids: Iterable<string>) => [...ids].reduce((s, id) => s + (BADGE_COINS[BADGE_BY_ID[id]?.r] ?? 0), 0);
/** Everything ever earned: games + badges + levels (+ duplicates, stored in the pet) */
export const coinsEarned = (h: GameRecord[], badges: Set<string>) =>
  h.reduce((s, g) => s + coinsOfGame(g), 0) + badgeCoins(badges) + LEVEL_COINS * (levelInfo(totalXp(h)).num - 1);
export const balance = (h: GameRecord[], badges: Set<string>, p: PetState | null) =>
  coinsEarned(h, badges) + (p?.bonus ?? 0) - (p?.spent ?? 0);
export const totalCorrect = (h: GameRecord[]) => h.reduce((s, g) => s + g.correct, 0);

/* ---------- Eggs ---------- */
export const HATCH: Record<Rarity, number> = { commun: 50, 'peu-commun': 100, rare: 150, epique: 250, legendaire: 400 };
const DROP_WEIGHTS: Record<Rarity, number> = { commun: 50, 'peu-commun': 28, rare: 14, epique: 6, legendaire: 2 };
export const DUP_COINS: Record<Rarity, number> = { commun: 25, 'peu-commun': 50, rare: 100, epique: 200, legendaire: 400 };
export const PITY_DAYS = 10;

const STAGE_FILES = [...STAGES, ...STAGES.map(s => s + '-triste')];
const creatureFiles = assets.creatures as Record<string, string[]>;
/** A species can hatch once all its images exist (a legendary also needs its own egg). */
export const isReady = (s: Species) =>
  STAGE_FILES.every(f => creatureFiles[s.id]?.includes(f)) && (s.q !== 'legendaire' || (assets.legendaryEggs as string[]).includes(s.id));
export const readySpecies = (q?: Rarity) => SPECIES.filter(s => isReady(s) && (!q || s.q === q));

/** Deterministic number in [0, 1) from a string: drops can be recomputed and reloading does not re-roll them. */
export function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Egg quality, at least `min`, among the qualities that have a ready species (else the best one that has). */
export function rollQuality(r: number, min: Rarity = 'commun'): Rarity {
  const ready = RARITY_ORDER.filter(q => readySpecies(q).length);
  if (!ready.length) return 'commun';
  const ok = ready.filter(q => RARITY_ORDER.indexOf(q) >= RARITY_ORDER.indexOf(min));
  if (!ok.length) return ready[ready.length - 1];
  const total = ok.reduce((s, q) => s + DROP_WEIGHTS[q], 0);
  let x = r * total;
  for (const q of ok) { x -= DROP_WEIGHTS[q]; if (x < 0) return q; }
  return ok[ok.length - 1];
}

export function makeEgg(key: string, source: EggSource, at: number, min?: Rarity): Egg {
  const q = rollQuality(hash01(key + ':q'), min);
  const egg: Egg = { id: 'e' + Math.floor(hash01(key + ':id') * 1e9).toString(36) + at.toString(36), q, source, at, opened: false };
  if (q === 'legendaire') {
    const pool = readySpecies('legendaire');
    egg.species = pool[Math.floor(hash01(key + ':sp') * pool.length)]?.id;
  }
  return egg;
}

/** Chance that a normal game drops a chest */
export const dropChance = (g: GameRecord) => (g.stars >= 3 ? 0.08 : 0.04);
export const dropsEgg = (g: GameRecord) => g.mode === 'normal' && hash01('drop:' + g.id) < dropChance(g);

const dayKey = (ts: number) => new Date(ts).toDateString();

/** New chests earned since the last check: lucky games, epic / legendary badges, and the safety net. */
export function grantEggs(p: PetState, h: GameRecord[], badges: Set<string>, now: number): PetState {
  const claimed = new Set(p.claimed);
  const eggs: Egg[] = [];
  for (const g of h) {
    const k = 'drop:' + g.id;
    if (g.ts > p.createdAt && !claimed.has(k) && dropsEgg(g)) { claimed.add(k); eggs.push(makeEgg(k, 'drop', now)); }
  }
  for (const id of badges) {
    const r = BADGE_BY_ID[id]?.r, k = 'badge:' + id;
    if ((r === 'epique' || r === 'legendaire') && !claimed.has(k)) {
      claimed.add(k);
      eggs.push(makeEgg(k, 'badge', now, r === 'legendaire' ? 'epique' : 'rare'));
    }
  }
  let lastEggAt = eggs.length ? now : p.lastEggAt;
  const days = new Set(h.filter(g => g.ts > lastEggAt).map(g => dayKey(g.ts)));
  if (days.size >= PITY_DAYS) { eggs.push(makeEgg('pity:' + now, 'pity', now)); lastEggAt = now; }
  if (!eggs.length) return p;
  return { ...p, eggs: [...p.eggs, ...eggs], claimed: [...claimed], lastEggAt };
}

/** Opens a chest: the egg goes straight to the incubator if it is free, otherwise to the nest. */
export function openChest(p: PetState, eggId: string, correct: number): PetState {
  const egg = p.eggs.find(e => e.id === eggId && !e.opened);
  if (!egg) return p;
  if (!p.incubating) return { ...p, eggs: p.eggs.filter(e => e !== egg), incubating: { ...egg, opened: true, start: correct } };
  return { ...p, eggs: p.eggs.map(e => (e === egg ? { ...e, opened: true } : e)) };
}

export function incubate(p: PetState, eggId: string, correct: number): PetState {
  const egg = p.eggs.find(e => e.id === eggId && e.opened);
  if (!egg || p.incubating) return p;
  return { ...p, eggs: p.eggs.filter(e => e !== egg), incubating: { ...egg, start: correct } };
}

export const hatchProgress = (p: PetState, correct: number) => {
  const e = p.incubating;
  if (!e) return null;
  const need = HATCH[e.q], done = Math.max(0, Math.min(need, correct - e.start));
  return { egg: e, done, need, pct: (done / need) * 100, ready: done >= need };
};

export const FULL: Needs = { faim: 100, joie: 100, energie: 100 };
export type Hatched = { species: Species; dup: false; creature: Creature } | { species: Species; dup: true; coins: number };

/** Hatches the incubated egg. `r` is a random number in [0, 1) (picked at hatch time, then stored). */
export function hatch(p: PetState, correct: number, now: number, r: number): { p: PetState; out: Hatched } | null {
  const pr = hatchProgress(p, correct);
  if (!pr?.ready) return null;
  const egg = pr.egg;
  const owned = new Set(p.creatures.map(c => c.species));
  let sp: Species | undefined = egg.species ? SPECIES_BY_ID[egg.species] : undefined;
  if (!sp) {
    const pool = readySpecies(egg.q);
    if (!pool.length) return null;
    const fresh = pool.filter(s => !owned.has(s.id));
    // 80% of the time a species not owned yet, when there is one
    const from = fresh.length && r < 0.8 ? fresh : pool;
    sp = from[Math.floor(((r * 997) % 1) * from.length)];
  }
  const base = { ...p, incubating: null };
  if (owned.has(sp.id)) {
    const coins = DUP_COINS[sp.q];
    return { p: { ...base, bonus: p.bonus + coins }, out: { species: sp, dup: true, coins } };
  }
  const creature: Creature = {
    id: 'c' + now.toString(36) + Math.floor(r * 1e6).toString(36), species: sp.id, name: sp.name,
    bornAt: now, xp: 0, shown: 0, needs: { ...FULL }, tick: now,
  };
  const active = p.activeId && p.creatures.some(c => c.id === p.activeId) ? p.activeId : creature.id;
  // A first companion starts fresh: decay starts now
  return { p: { ...base, creatures: [...p.creatures, creature], activeId: active }, out: { species: sp, dup: false, creature } };
}

/* ---------- Needs and mood ---------- */
/** Points lost per hour */
export const DECAY: Needs = { faim: 2, joie: 1.5, energie: 2 };
export const JOY_PER_GAME = 5;
const clamp = (v: number) => Math.max(0, Math.min(100, v));
export function decay(c: Creature, t: number): Creature {
  if (t <= c.tick) return c;
  const hrs = (t - c.tick) / 36e5;
  const n = c.needs;
  return { ...c, tick: t, needs: { faim: clamp(n.faim - DECAY.faim * hrs), joie: clamp(n.joie - DECAY.joie * hrs), energie: clamp(n.energie - DECAY.energie * hrs) } };
}
export type Mood = 'content' | 'bof' | 'triste';
export function moodOf(n: Needs): Mood {
  const avg = (n.faim + n.joie + n.energie) / 3;
  return avg >= 60 ? 'content' : avg >= 30 ? 'bof' : 'triste';
}
/** The need to show in the bubble above the head (the lowest one under 50) */
export function lowestNeed(n: Needs): keyof Needs | null {
  const [k, v] = (Object.entries(n) as [keyof Needs, number][]).sort((a, b) => a[1] - b[1])[0];
  return v < 50 ? k : null;
}

export const active = (p: PetState | null) => p?.creatures.find(c => c.id === p.activeId) ?? null;
const withActive = (p: PetState, f: (c: Creature) => Creature): PetState =>
  ({ ...p, creatures: p.creatures.map(c => (c.id === p.activeId ? f(c) : c)) });

/**
 * Applies the games played since last time to the companion, in order:
 * its needs decay up to each game, a game cheers it up, and a not-sad companion grows by the correct answers.
 */
export function applyGames(p: PetState, h: GameRecord[]): PetState {
  const todo = h.filter(g => g.ts > p.processed).sort((a, b) => a.ts - b.ts);
  if (!todo.length) return p;
  const processed = todo[todo.length - 1].ts;
  if (!active(p)) return { ...p, processed };
  return {
    ...withActive(p, c => todo.reduce((cur, g) => {
      const d = decay(cur, Math.max(g.ts, cur.tick));
      const grows = moodOf(d.needs) !== 'triste';
      return { ...d, xp: d.xp + (grows ? g.correct : 0), needs: { ...d.needs, joie: clamp(d.needs.joie + JOY_PER_GAME) } };
    }, c)),
    processed,
  };
}

/* ---------- Shop and care ---------- */
export interface Item { id: string; e: string; n: string; price: number; kind: 'food' | 'toy' | 'chest'; gain?: Partial<Needs> }
export const ITEMS: Item[] = [
  { id: 'pomme', e: '🍎', n: 'Pomme', price: 10, kind: 'food', gain: { faim: 20 } },
  { id: 'sandwich', e: '🥪', n: 'Sandwich', price: 25, kind: 'food', gain: { faim: 50 } },
  { id: 'gateau', e: '🎂', n: 'Gâteau', price: 60, kind: 'food', gain: { faim: 100, joie: 10 } },
  { id: 'balle', e: '⚽', n: 'Balle', price: 30, kind: 'toy', gain: { joie: 30 } },
  { id: 'peluche', e: '🧸', n: 'Peluche', price: 80, kind: 'toy', gain: { joie: 70 } },
  { id: 'console', e: '🎮', n: 'Console', price: 200, kind: 'toy', gain: { joie: 100 } },
  { id: 'coffre', e: '🎁', n: 'Coffre', price: 800, kind: 'chest' },
];
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map(i => [i.id, i]));

/** Buys an item; a chest becomes a closed egg at once. Returns p unchanged if it costs too much. */
export function buy(p: PetState, itemId: string, coins: number, now: number): PetState {
  const it = ITEM_BY_ID[itemId];
  if (!it || coins < it.price) return p;
  const paid = { ...p, spent: p.spent + it.price, updatedAt: now };
  if (it.kind === 'chest') return { ...paid, eggs: [...p.eggs, makeEgg('shop:' + now + ':' + p.spent, 'shop', now)], lastEggAt: now };
  return { ...paid, inventory: { ...p.inventory, [it.id]: (p.inventory[it.id] ?? 0) + 1 } };
}

const care = (p: PetState, now: number, gain: Partial<Needs>): PetState => ({
  ...withActive(p, c => {
    const d = decay(c, now);
    return { ...d, needs: { faim: clamp(d.needs.faim + (gain.faim ?? 0)), joie: clamp(d.needs.joie + (gain.joie ?? 0)), energie: clamp(d.needs.energie + (gain.energie ?? 0)) } };
  }),
  careCount: p.careCount + 1,
});

/** Gives an inventory item to the companion */
export function useItem(p: PetState, itemId: string, now: number): PetState {
  const it = ITEM_BY_ID[itemId];
  if (!it?.gain || !p.inventory[itemId] || !active(p)) return p;
  const inv = { ...p.inventory, [itemId]: p.inventory[itemId] - 1 };
  if (!inv[itemId]) delete inv[itemId];
  return { ...care(p, now, it.gain), inventory: inv };
}

/** Free care: a nap fills the energy */
export const sleep = (p: PetState, now: number) => (active(p) ? care(p, now, { energie: 100 }) : p);

/** Switches companion: the old one freezes (its needs are brought up to now), the new one starts decaying from now. */
export function setActive(p: PetState, id: string, now: number): PetState {
  if (!p.creatures.some(c => c.id === id) || id === p.activeId) return p;
  return { ...p, activeId: id, creatures: p.creatures.map(c => (c.id === p.activeId ? decay(c, now) : c.id === id ? { ...c, tick: now } : c)) };
}

export const rename = (p: PetState, id: string, name: string): PetState =>
  ({ ...p, creatures: p.creatures.map(c => (c.id === id ? { ...c, name: name.trim().slice(0, 20) || SPECIES_BY_ID[c.species]?.name || c.name } : c)) });

export const markShown = (p: PetState, id: string): PetState =>
  ({ ...p, creatures: p.creatures.map(c => (c.id === id ? { ...c, shown: stageOf(c.xp) } : c)) });

/** A brand-new pet: the first chest is a gift, badges already won do not give eggs. */
export function newPet(now: number, badges: Set<string>, lastGameTs: number): PetState {
  return {
    createdAt: now, updatedAt: now, spent: 0, bonus: 0, inventory: {},
    eggs: [{ ...makeEgg('start:' + now, 'start', now), q: 'commun', species: undefined }],
    incubating: null, claimed: [...badges].map(id => 'badge:' + id), lastEggAt: now,
    processed: lastGameTs, creatures: [], activeId: null, careCount: 0,
  };
}

/** Brings the pet up to date with the history (other device, finished game): companion growth, then new chests. */
export const reconcile = (p: PetState, h: GameRecord[], badges: Set<string>, now: number) =>
  grantEggs(applyGames(p, h), h, badges, now);
