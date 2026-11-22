import {
  APPETITE, BADGE_CHEST, BADGE_COINS, BONUS, CHEST_ODDS, DROP, DUP_COINS, HATCH, LEVEL_COINS, MOOD, NEEDS, PITY, PRICES,
  QUALITY_BONUS, STAGE_BONUS, STAGE_XP,
} from '../balance';
import type { GameRecord, Rarity } from '../game/types';
import { BADGE_BY_ID, levelInfo, RARITY_ORDER, totalXp } from '../game/rules';
import { dayKey, isSerious, valueOf, values } from '../game/value';
import assets from './assets.json';
import { SPECIES, SPECIES_BY_ID, type Species } from './species';
import type { Box, Creature, Egg, EggSource, LogEntry, Needs, PetState } from './types';

export { APPETITE, DUP_COINS, HATCH, QUALITY_BONUS, STAGE_BONUS, STAGE_XP, BONUS };

/* ---------- Stages ---------- */
export const STAGES = ['bebe', 'petit', 'grand', 'super'] as const;
export const STAGE_NAMES = ['Bébé', 'Petit', 'Grand', 'Super'];
/** Creature XP (counted points, see balance.ts) needed for each stage */
export const stageOf = (xp: number) => STAGE_XP.reduce((s, need, i) => (xp >= need ? i : s), 0);

/* ---------- Coins ---------- */
/** Coins of one game within its history (counted points, stars, new diploma, training bonus): see game/value.ts */
export const coinsOfGame = (h: GameRecord[], g: GameRecord) => valueOf(h, g).coins;
export const badgeCoins = (ids: Iterable<string>) => [...ids].reduce((s, id) => s + (BADGE_COINS[BADGE_BY_ID[id]?.r] ?? 0), 0);
export const levelCoins = (h: GameRecord[]) => LEVEL_COINS.perLevel * (levelInfo(totalXp(h)).num - 1);
/** Everything ever earned: games + badges + levels (+ duplicates and companion bonus, stored in the pet) */
export const coinsEarned = (h: GameRecord[], badges: Set<string>) =>
  [...values(h).values()].reduce((s, v) => s + v.coins, 0) + badgeCoins(badges) + levelCoins(h);
export const balance = (h: GameRecord[], badges: Set<string>, p: PetState | null) =>
  coinsEarned(h, badges) + (p?.bonus ?? 0) - (p?.spent ?? 0);

/* ---------- Eggs ---------- */

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

/**
 * Egg quality from a chest (CHEST_ODDS), among the qualities that have a ready species.
 * If none of the chest's qualities has one, the nearest ready quality below it (else above).
 */
export function rollQuality(r: number, chest: Rarity = 'commun'): Rarity {
  const ready = RARITY_ORDER.filter(q => readySpecies(q).length);
  if (!ready.length) return 'commun';
  const odds = (Object.entries(CHEST_ODDS[chest]) as [Rarity, number][]).filter(([q]) => ready.includes(q));
  if (!odds.length) {
    const i = RARITY_ORDER.indexOf(chest);
    return [...ready].reverse().find(q => RARITY_ORDER.indexOf(q) <= i) ?? ready[0];
  }
  let x = r * odds.reduce((s, [, w]) => s + w, 0);
  for (const [q, w] of odds) { x -= w; if (x < 0) return q; }
  return odds[odds.length - 1][0];
}

export function makeEgg(key: string, source: EggSource, at: number, chest: Rarity = 'commun', taken?: Set<string>): Egg {
  const q = rollQuality(hash01(key + ':q'), chest);
  const egg: Egg = { id: 'e' + Math.floor(hash01(key + ':id') * 1e9).toString(36) + at.toString(36), q, source, at, opened: false };
  const box = BOX_OF[chest];
  if (box) egg.box = box;
  if (q === 'legendaire') {
    // A legendary egg shows its species before it hatches: it takes one not owned nor already waiting, if any is left
    const all = readySpecies('legendaire'), free = taken ? all.filter(s => !taken.has(s.id)) : [];
    const pool = free.length ? free : all;
    egg.species = pool[Math.floor(hash01(key + ':sp') * pool.length)]?.id;
  }
  return egg;
}

/** The chest an egg comes in shows its kind (none = common chest) */
const BOX_OF: Partial<Record<Rarity, Box>> = { 'peu-commun': 'peu-commun', rare: 'rare', epique: 'epique', legendaire: 'legendaire' };

/** Chance that a game drops a common chest: grows with its counted points (more with 3 stars in a game that counts) */
export function dropChance(h: GameRecord[], g: GameRecord) {
  const v = valueOf(h, g);
  const k = g.mode === 'normal' && v.serious && g.stars >= 3 ? DROP.threeStars : 1;
  return Math.min(DROP.max, v.points * DROP.perPoint * k);
}
export const dropsEgg = (h: GameRecord[], g: GameRecord) => hash01('drop:' + g.id) < dropChance(h, g);

/* ---------- Journal ---------- */
/** The pet keeps its last LOG_MAX events (purchases, care, chests, hatches) for the parent's journal */
export const LOG_MAX = 300;
export const logged = (p: PetState, ...e: LogEntry[]): PetState => (e.length ? { ...p, log: [...p.log, ...e].slice(-LOG_MAX) } : p);

/** New chests earned since the last check: lucky games, epic / legendary badges, and the safety net. */
export function grantEggs(p: PetState, h: GameRecord[], badges: Set<string>, now: number): PetState {
  const claimed = new Set(p.claimed);
  const eggs: Egg[] = [], log: LogEntry[] = [];
  for (const g of h) {
    const k = 'drop:' + g.id;
    if (g.ts > p.createdAt && !claimed.has(k) && dropsEgg(h, g)) {
      claimed.add(k);
      const e = makeEgg(k, 'drop', now, 'commun', takenOf(p));
      eggs.push(e); log.push({ t: now, k: 'chest', src: 'drop', q: e.q, id: g.id });
    }
  }
  for (const id of badges) {
    const box = BADGE_CHEST[BADGE_BY_ID[id]?.r], k = 'badge:' + id;
    if (box && !claimed.has(k)) {
      claimed.add(k);
      const e = makeEgg(k, 'badge', now, box, takenOf(p));
      eggs.push(e); log.push({ t: now, k: 'chest', src: 'badge', q: e.q, box, id });
    }
  }
  let lastEggAt = eggs.length ? now : p.lastEggAt;
  const days = new Set(h.filter(g => g.ts > lastEggAt && isSerious(g)).map(g => dayKey(g.ts)));
  if (days.size >= PITY.days) {
    const e = makeEgg('pity:' + now, 'pity', now, 'commun', takenOf(p));
    eggs.push(e); log.push({ t: now, k: 'chest', src: 'pity', q: e.q });
    lastEggAt = now;
  }
  if (!eggs.length) return p;
  return logged({ ...p, eggs: [...p.eggs, ...eggs], claimed: [...claimed], lastEggAt }, ...log);
}

/** Opens a chest: the egg goes straight to the incubator if it is free, otherwise to the nest. */
export function openChest(p: PetState, eggId: string, now = Date.now()): PetState {
  const egg = p.eggs.find(e => e.id === eggId && !e.opened);
  if (!egg) return p;
  const lp = logged(p, { t: now, k: 'open', q: egg.q, src: egg.source });
  if (!p.incubating) return { ...lp, eggs: p.eggs.filter(e => e !== egg), incubating: { ...egg, opened: true, done: 0 } };
  return { ...lp, eggs: p.eggs.map(e => (e === egg ? { ...e, opened: true } : e)) };
}

export function incubate(p: PetState, eggId: string): PetState {
  const egg = p.eggs.find(e => e.id === eggId && e.opened);
  if (!egg || p.incubating) return p;
  return { ...p, eggs: p.eggs.filter(e => e !== egg), incubating: { ...egg, done: 0 } };
}

/** The incubated egg grows by the counted points of the games played while it is in the incubator (see applyGames) */
export const hatchProgress = (p: PetState) => {
  const e = p.incubating;
  if (!e) return null;
  const need = HATCH[e.q], done = Math.max(0, Math.min(need, Math.floor(e.done + 1e-9)));
  return { egg: e, done, need, pct: (done / need) * 100, ready: done >= need };
};

export const FULL: Needs = { faim: 100, joie: 100, energie: 100 };
/** Share of hatches that pick a species not owned yet (when one is left in that quality): 1 = no duplicate until the quality is complete */
export const FRESH = { rate: 1, climb: false };
/** Species already owned or waiting in a legendary egg */
export const takenOf = (p: PetState) => new Set([...p.creatures.map(c => c.species), ...[...p.eggs, ...(p.incubating ? [p.incubating] : [])].flatMap(e => (e.species ? [e.species] : []))]);
export type Hatched = { species: Species; dup: false; creature: Creature } | { species: Species; dup: true; coins: number };

/** Hatches the incubated egg. `r` is a random number in [0, 1) (picked at hatch time, then stored). */
export function hatch(p: PetState, now: number, r: number): { p: PetState; out: Hatched } | null {
  const pr = hatchProgress(p);
  if (!pr?.ready) return null;
  const egg = pr.egg;
  const owned = new Set(p.creatures.map(c => c.species));
  let sp: Species | undefined = egg.species ? SPECIES_BY_ID[egg.species] : undefined;
  if (!sp) {
    let pool = readySpecies(egg.q);
    if (!pool.length) return null;
    let fresh = pool.filter(s => !owned.has(s.id));
    if (!fresh.length && FRESH.climb) {
      const up = RARITY_ORDER.slice(RARITY_ORDER.indexOf(egg.q) + 1).find(q => readySpecies(q).some(s => !owned.has(s.id)));
      if (up) { pool = readySpecies(up); fresh = pool.filter(s => !owned.has(s.id)); }
    }
    // A species not owned yet, as long as there is one (FRESH.rate of the time)
    const from = fresh.length && r < FRESH.rate ? fresh : pool;
    sp = from[Math.floor(((r * 997) % 1) * from.length)];
  }
  const base = { ...p, incubating: null };
  if (owned.has(sp.id)) {
    const coins = DUP_COINS[sp.q];
    return { p: logged({ ...base, bonus: p.bonus + coins }, { t: now, k: 'dup', id: sp.id, q: sp.q, n: coins }), out: { species: sp, dup: true, coins } };
  }
  const creature: Creature = {
    id: 'c' + now.toString(36) + Math.floor(r * 1e6).toString(36), species: sp.id, name: sp.name,
    bornAt: now, xp: 0, shown: 0, needs: { ...FULL }, tick: now,
  };
  const active = p.activeId && p.creatures.some(c => c.id === p.activeId) ? p.activeId : creature.id;
  // A first companion starts fresh: decay starts now
  return { p: logged({ ...base, creatures: [...p.creatures, creature], activeId: active }, { t: now, k: 'hatch', id: sp.id, q: sp.q }), out: { species: sp, dup: false, creature } };
}

/* ---------- Needs and mood ---------- */
/** A better companion eats and plays more: food and toys fill its needs APPETITE times less */
export const appetiteOf = (species: string) => APPETITE[SPECIES_BY_ID[species]?.q] ?? 1;
/**
 * Extra coins a not-sad active companion brings at the end of a game. It adds up its quality, its stage
 * (each evolution raises it) and the size of the collection, so coins grow as the child progresses.
 */
export const bonusRate = (c: Pick<Creature, 'species' | 'xp' | 'shown'>, collection: number) =>
  (QUALITY_BONUS[SPECIES_BY_ID[c.species]?.q] ?? 0) + STAGE_BONUS[Math.min(stageOf(c.xp), c.shown)] + BONUS.perSpecies * collection;
export const companionBonus = (h: GameRecord[], g: GameRecord, c: Pick<Creature, 'species' | 'xp' | 'shown'>, collection: number) =>
  Math.round(coinsOfGame(h, g) * bonusRate(c, collection));
export const collectionSize = (p: PetState) => new Set(p.creatures.map(c => c.species)).size;
const clamp = (v: number) => Math.max(0, Math.min(100, v));
export function decay(c: Creature, t: number): Creature {
  if (t <= c.tick) return c;
  const hrs = (t - c.tick) / 36e5;
  const n = c.needs;
  return { ...c, tick: t, needs: { faim: clamp(n.faim - NEEDS.faim * hrs), joie: clamp(n.joie - NEEDS.joie * hrs), energie: clamp(n.energie - NEEDS.energie * hrs) } };
}
export type Mood = 'content' | 'bof' | 'triste';
/** Sad as soon as one need is very low (a free nap alone cannot keep it happy), or when all are low */
export function moodOf(n: Needs): Mood {
  const avg = (n.faim + n.joie + n.energie) / 3, min = Math.min(n.faim, n.joie, n.energie);
  if (min < MOOD.sadMin || avg < MOOD.sadAvg) return 'triste';
  return avg >= MOOD.happyAvg && min >= MOOD.happyMin ? 'content' : 'bof';
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
 * Applies the games played since last time, in order: the companion's needs decay up to each game and a game
 * cheers it up. A not-sad companion grows by the game's counted points, brings its coin bonus and keeps the
 * incubated egg warm: a sad companion stops all three (with no companion yet, the egg always grows).
 */
// Points have decimals (×1 is worth 0.05): rounded to the hundredth as they add up, so 0.05 × 3 is 0.15 and not 0.15000000000000002
const r2 = (x: number) => Math.round(x * 100) / 100;
export function applyGames(p: PetState, h: GameRecord[]): PetState {
  const todo = h.filter(g => g.ts > p.processed).sort((a, b) => a.ts - b.ts);
  if (!todo.length) return p;
  const processed = todo[todo.length - 1].ts;
  let bonus = p.bonus, warm = 0;
  const pts = (g: GameRecord) => valueOf(h, g).points;
  const c0 = active(p);
  if (!c0) {
    warm = todo.reduce((s, g) => s + pts(g), 0);
    return { ...p, processed, incubating: p.incubating && { ...p.incubating, done: r2(p.incubating.done + warm) } };
  }
  const next = withActive(p, c => todo.reduce((cur, g) => {
    const d = decay(cur, Math.max(g.ts, cur.tick));
    const happy = moodOf(d.needs) !== 'triste';
    if (happy) { bonus += companionBonus(h, g, d, collectionSize(p)); warm += pts(g); }
    return { ...d, xp: r2(d.xp + (happy ? pts(g) : 0)), needs: { ...d.needs, joie: clamp(d.needs.joie + NEEDS.joyPerGame) } };
  }, c));
  return { ...next, processed, bonus, incubating: p.incubating && { ...p.incubating, done: r2(p.incubating.done + warm) } };
}

/* ---------- Shop and care ---------- */
export interface Item { id: string; e: string; n: string; price: number; kind: 'food' | 'toy' | 'chest'; gain?: Partial<Needs>; min?: Rarity; box?: Box }
const I = (id: keyof typeof PRICES, e: string, n: string, kind: Item['kind'], rest: Partial<Item> = {}): Item =>
  ({ id, e, n, kind, get price() { return PRICES[id]; }, ...rest });
/** Prices live in balance.ts (getters, so the simulator can try other prices) */
export const ITEMS: Item[] = [
  I('pomme', '🍎', 'Pomme', 'food', { gain: { faim: 20 } }),
  I('sandwich', '🥪', 'Sandwich', 'food', { gain: { faim: 45 } }),
  I('gateau', '🎂', 'Gâteau', 'food', { gain: { faim: 100, joie: 10 } }),
  I('festin', '🍗', 'Festin', 'food', { gain: { faim: 240 } }),
  I('banquet', '🍱', 'Banquet', 'food', { gain: { faim: 550, joie: 50 } }),
  I('balle', '⚽', 'Balle', 'toy', { gain: { joie: 20 } }),
  I('peluche', '🧸', 'Peluche', 'toy', { gain: { joie: 50 } }),
  I('console', '🎮', 'Console', 'toy', { gain: { joie: 110 } }),
  I('manege', '🎠', 'Manège', 'toy', { gain: { joie: 240 } }),
  I('fete', '🎡', 'Fête foraine', 'toy', { gain: { joie: 600 } }),
  I('coffre', '🎁', 'Coffre', 'chest'),
  I('coffre-peu-commun', '🎁', 'Coffre peu commun', 'chest', { min: 'peu-commun', box: 'peu-commun' }),
  I('coffre-rare', '🎁', 'Coffre rare', 'chest', { min: 'rare', box: 'rare' }),
  I('coffre-epique', '🎁', 'Coffre épique', 'chest', { min: 'epique', box: 'epique' }),
  I('coffre-legendaire', '🎁', 'Coffre légendaire', 'chest', { min: 'legendaire', box: 'legendaire' }),
];
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map(i => [i.id, i]));

/** Buys an item; a chest becomes a closed egg at once. Returns p unchanged if it costs too much. */
export function buy(p: PetState, itemId: string, coins: number, now: number): PetState {
  const it = ITEM_BY_ID[itemId];
  if (!it || coins < it.price) return p;
  const paid = logged({ ...p, spent: p.spent + it.price, updatedAt: now }, { t: now, k: 'buy', id: it.id, n: it.price, left: coins - it.price });
  if (it.kind === 'chest') {
    const e = makeEgg('shop:' + now + ':' + p.spent, 'shop', now, it.min, takenOf(p));
    return logged({ ...paid, eggs: [...p.eggs, e], lastEggAt: now }, { t: now, k: 'chest', src: 'shop', q: e.q, box: it.min });
  }
  return { ...paid, inventory: { ...p.inventory, [it.id]: (p.inventory[it.id] ?? 0) + 1 } };
}

/** Food and toys are divided by the companion's appetite; a nap is not */
const care = (p: PetState, now: number, gain: Partial<Needs>, eats: boolean, what: string): PetState => {
  let before: Needs | null = null, after: Needs | null = null;
  const next = withActive(p, c => {
    const d = decay(c, now), k = eats ? appetiteOf(c.species) : 1;
    before = d.needs;
    after = { faim: clamp(d.needs.faim + (gain.faim ?? 0) / k), joie: clamp(d.needs.joie + (gain.joie ?? 0) / k), energie: clamp(d.needs.energie + (gain.energie ?? 0)) };
    return { ...d, needs: after };
  });
  const r = (n: Needs | null) => n && [Math.round(n.faim), Math.round(n.joie), Math.round(n.energie)] as [number, number, number];
  return logged({ ...next, careCount: p.careCount + 1 }, { t: now, k: eats ? 'use' : 'sleep', id: what, from: r(before) ?? undefined, to: r(after) ?? undefined });
};

/** Gives an inventory item to the companion */
export function useItem(p: PetState, itemId: string, now: number): PetState {
  const it = ITEM_BY_ID[itemId];
  if (!it?.gain || !p.inventory[itemId] || !active(p)) return p;
  const inv = { ...p.inventory, [itemId]: p.inventory[itemId] - 1 };
  if (!inv[itemId]) delete inv[itemId];
  return { ...care(p, now, it.gain, true, itemId), inventory: inv };
}

/** Free care: a nap fills the energy */
export const sleep = (p: PetState, now: number) => (active(p) ? care(p, now, { energie: 100 }, false, 'dodo') : p);

/** Switches companion: the old one freezes (its needs are brought up to now), the new one starts decaying from now. */
export function setActive(p: PetState, id: string, now: number): PetState {
  if (!p.creatures.some(c => c.id === id) || id === p.activeId) return p;
  return { ...p, activeId: id, creatures: p.creatures.map(c => (c.id === p.activeId ? decay(c, now) : c.id === id ? { ...c, tick: now } : c)) };
}

export const rename = (p: PetState, id: string, name: string): PetState =>
  ({ ...p, creatures: p.creatures.map(c => (c.id === id ? { ...c, name: name.trim().slice(0, 20) || SPECIES_BY_ID[c.species]?.name || c.name } : c)) });

/** One evolution scene = one stage: a creature that grew several stages at once evolves several times in a row */
export const markShown = (p: PetState, id: string, now = Date.now()): PetState => {
  const c = p.creatures.find(x => x.id === id);
  if (!c || c.shown >= stageOf(c.xp)) return p;
  return logged({ ...p, creatures: p.creatures.map(x => (x.id === id ? { ...x, shown: x.shown + 1 } : x)) }, { t: now, k: 'evolve', id: c.species, n: c.shown + 1 });
};

/** A brand-new pet: the first chest is a gift, badges already won do not give eggs. */
export function newPet(now: number, badges: Set<string>, lastGameTs: number): PetState {
  return {
    createdAt: now, updatedAt: now, spent: 0, bonus: 0, inventory: {},
    eggs: [{ ...makeEgg('start:' + now, 'start', now), q: 'commun', species: undefined }],
    incubating: null, claimed: [...badges].map(id => 'badge:' + id), lastEggAt: now,
    processed: lastGameTs, creatures: [], activeId: null, careCount: 0, log: [],
  };
}

/** Brings the pet up to date with the history (other device, finished game): companion growth, then new chests. */
export const reconcile = (p: PetState, h: GameRecord[], badges: Set<string>, now: number) =>
  grantEggs(applyGames(p, h), h, badges, now);
