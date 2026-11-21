import { describe, expect, it } from 'vitest';
import type { GameRecord } from '../game/types';
import { cleanPet } from './clean';
import { APPETITE, BADGE_CHEST, BONUS, DUP_COINS, GAME, HATCH, NEEDS, PRICES, QUALITY_BONUS, TABLE_VALUE } from '../balance';
import { computeStats, unlocked, BADGE_BY_ID } from '../game/rules';
import {
  applyGames, buy, coinsOfGame, decay, dropsEgg, grantEggs, hatch, hatchProgress, moodOf, newPet, openChest,
  markShown, readySpecies, rollQuality, sleep, stageOf, useItem,
} from './rules';

const H = 36e5;
const T0 = new Date(2026, 0, 5, 18).getTime();
const game = (p: Partial<GameRecord>): GameRecord => ({
  id: 'g' + Math.random(), ts: T0, mode: 'normal', duration: 60, tables: [2], score: 0, correct: 0, total: 0,
  bestStreak: 0, stars: 0, errors: [], seen: {}, ...p,
});
/** A pet with its first egg hatched into a companion */
function withCompanion() {
  let p = newPet(T0, new Set(), 0);
  p = openChest(p, p.eggs[0].id, T0);
  p = { ...p, incubating: { ...p.incubating!, done: HATCH.commun } };
  const r = hatch(p, T0, 0.1);
  if (!r) throw new Error('should hatch');
  return r.p;
}

describe('pet', () => {
  it('has the dog ready to hatch', () => expect(readySpecies('commun').map(s => s.id)).toContain('chiot'));

  it('pays coins per game, by difficulty', () => {
    const one = (g: GameRecord) => coinsOfGame([g], g);
    // 20 right answers in 3 × 7 (worth 0.8 each) + 3 stars
    const day = GAME.dailyBonus; // the first game that counts each day
    expect(one(game({ correct: 20, total: 20, stars: 3, seen: { '3x7': [20, 0] } }))).toBe(16 + 3 + day);
    // the table of 1: 0.1 a right answer, and the stars do not count
    expect(one(game({ correct: 30, total: 30, stars: 3, tables: [1], seen: { '1x7': [30, 0] } }))).toBe(Math.round(30 * TABLE_VALUE[1]));
    expect(one(game({ mode: 'practice', correct: 8, total: 8, seen: { '6x7': [8, 0] } }))).toBe(8 + 10 + day);
    expect(one(game({ mode: 'practice', correct: 2, total: 2, seen: { '6x7': [2, 0] } }))).toBe(2);
    const exam = (ts: number, mention: number) => game({ id: 'x' + ts, ts, mode: 'exam', examTable: 7, passed: true, mention, correct: 20, total: 20, seen: { '7x8': [20, 0] } });
    const h = [exam(T0 + 2, 3), exam(T0 + 1, 3), exam(T0, 2)];
    expect(h.map(g => coinsOfGame(h, g))).toEqual([20, 40, 30 + day]); // a diploma pays once (new or better mention), then like a game
  });

  it('gives a first chest that hatches after the hatch points', () => {
    let p = newPet(T0, new Set(), 0);
    expect(p.eggs).toHaveLength(1);
    expect(p.eggs[0]).toMatchObject({ q: 'commun', opened: false });
    p = openChest(p, p.eggs[0].id, T0);
    expect(p.incubating?.done).toBe(0);
    // games played after it is in the incubator make it grow by their counted points
    const g = (i: number, n: number) => game({ id: 'h' + i, ts: T0 + i * H, correct: n, total: n, seen: { '6x7': [n, 0] } });
    const h = [g(1, HATCH.commun - 1)];
    p = applyGames(p, h);
    expect(hatchProgress(p)?.ready).toBe(false);
    expect(hatch(p, T0, 0.5)).toBeNull();
    p = applyGames(p, [g(2, 1), ...h]);
    const r = hatch(p, T0, 0.5)!;
    expect(r.out.dup).toBe(false);
    expect(r.p.activeId).toBe(r.p.creatures[0].id);
    expect(r.p.incubating).toBeNull();
  });

  it('turns a duplicate into coins', () => {
    let p = withCompanion();
    // Own every ready common species, so the next common egg is a duplicate
    const c0 = p.creatures[0];
    p = { ...p, creatures: readySpecies('commun').map((s, i) => ({ ...c0, id: 'c' + i, species: s.id })) };
    p = { ...p, incubating: { id: 'x', q: 'commun', source: 'shop', at: T0, opened: true, done: HATCH.commun } };
    const r = hatch(p, T0, 0.1)!;
    expect(r.out).toMatchObject({ dup: true, coins: DUP_COINS.commun });
    expect(r.p.bonus).toBe(DUP_COINS.commun);
    expect(r.p.log.at(-1)).toMatchObject({ k: 'dup', n: DUP_COINS.commun });
  });

  it('gives a coin bonus for a rare companion, not when sad', () => {
    let p = withCompanion();
    p = { ...p, creatures: [{ ...p.creatures[0], species: 'phenix-solaire' }] };
    const g = (ts: number) => game({ id: 'b' + ts, ts, correct: 100, total: 100, seen: { '6x7': [100, 0] } });
    const h1 = [g(T0 + H)];
    p = applyGames(p, h1);
    const b1 = Math.round((100 + GAME.dailyBonus) * (QUALITY_BONUS.legendaire + BONUS.perSpecies));
    expect(p.bonus).toBe(b1); // legendary + 1 species, baby stage
    p = { ...p, incubating: { id: 'x', q: 'rare', source: 'shop', at: T0, opened: true, done: 0 } };
    p = applyGames(p, [g(T0 + 200 * H), ...h1]);
    expect(p.bonus).toBe(b1); // sad after 199 h: no bonus
    expect(p.incubating?.done).toBe(0); // and the egg is not kept warm
  });

  it('decays needs over time and gets sad', () => {
    const c = withCompanion().creatures[0];
    expect(moodOf(decay(c, T0 + 2 * H).needs)).toBe('content');
    expect(moodOf(decay(c, T0 + 72 * H).needs)).toBe('triste');
    // a free nap alone cannot keep it happy: one empty need is enough to be sad
    expect(moodOf({ faim: 0, joie: 100, energie: 100 })).toBe('triste');
    expect(moodOf({ faim: 30, joie: 30, energie: 100 })).toBe('bof');
    expect(NEEDS.faim).toBeGreaterThan(0);
  });

  it('grows only when not sad', () => {
    let p = withCompanion();
    const a = game({ id: 'a', ts: T0 + H, correct: 30, total: 30, seen: { '6x7': [30, 0] } });
    p = applyGames(p, [a]);
    expect(p.creatures[0].xp).toBe(30);
    p = applyGames(p, [game({ id: 'b', ts: T0 + 200 * H, correct: 30, total: 30, seen: { '6x7': [30, 0] } }), a]);
    expect(p.creatures[0].xp).toBe(30); // already processed + sad after 199 h
    expect(stageOf(150)).toBe(1);
    expect(stageOf(1499)).toBe(2);
  });

  it('evolves one stage per scene', () => {
    let p = withCompanion();
    p = { ...p, creatures: [{ ...p.creatures[0], xp: 2000 }] };
    p = markShown(p, p.creatures[0].id);
    expect(p.creatures[0].shown).toBe(1);
    p = markShown(markShown(markShown(p, p.creatures[0].id), p.creatures[0].id), p.creatures[0].id);
    expect(p.creatures[0].shown).toBe(3);
  });

  it('feeds a legendary less per item (appetite)', () => {
    let p = withCompanion();
    p = { ...p, creatures: [{ ...p.creatures[0], species: 'phenix-solaire', needs: { faim: 0, joie: 0, energie: 0 } }], inventory: { sandwich: 1 } };
    p = useItem(p, 'sandwich', T0);
    expect(p.creatures[0].needs.faim).toBeCloseTo(45 / APPETITE.legendaire);
    expect(p.log.at(-1)).toMatchObject({ k: 'use', id: 'sandwich', from: [0, 0, 0] });
    p = sleep({ ...p, creatures: [{ ...p.creatures[0], needs: { faim: 0, joie: 0, energie: 0 } }] }, T0);
    expect(p.creatures[0].needs.energie).toBe(100); // a nap is not divided
  });

  it('buys and gives items', () => {
    let p = withCompanion();
    expect(buy(p, 'pomme', PRICES.pomme - 1, T0)).toBe(p);
    p = buy(p, 'pomme', 100, T0);
    expect(p.spent).toBe(PRICES.pomme);
    expect(p.log.at(-1)).toMatchObject({ k: 'buy', id: 'pomme', n: PRICES.pomme, left: 100 - PRICES.pomme });
    p = useItem(decayAll(p, 10 * H / NEEDS.faim), 'pomme', T0 + 10 * H);
    expect(p.inventory.pomme).toBeUndefined();
    expect(p.creatures[0].needs.faim).toBe(100);
    p = sleep(p, T0 + 20 * H);
    expect(p.creatures[0].needs.energie).toBe(100);
    expect(p.careCount).toBe(2);
    p = buy(p, 'coffre', 1e6, T0);
    expect(p.eggs.at(-1)?.opened).toBe(false);
    expect(p.eggs.at(-1)?.box).toBeUndefined();
    p = buy(p, 'coffre-epique', 1e6, T0 + 1);
    expect(p.eggs.at(-1)?.box).toBe('epique');
    expect(['epique', 'legendaire']).toContain(p.eggs.at(-1)?.q);
    p = buy(p, 'coffre-legendaire', 1e6, T0 + 2);
    expect(p.eggs.at(-1)?.q).toBe('legendaire');
  });

  it('gives a legendary egg a species not owned yet', () => {
    const leg = readySpecies('legendaire');
    if (leg.length < 2) return;
    let p = withCompanion();
    p = { ...p, creatures: leg.slice(1).map((s, i) => ({ ...p.creatures[0], id: 'l' + i, species: s.id })) };
    for (let i = 0; i < 20; i++) expect(buy(p, 'coffre-legendaire', 1e6, T0 + i).eggs.at(-1)?.species).toBe(leg[0].id);
  });

  it('opens a common chest as common 95 % of the time, never better than uncommon', () => {
    const n = 20000, got: Record<string, number> = {};
    for (let i = 0; i < n; i++) { const q = rollQuality((i + 0.5) / n, 'commun'); got[q] = (got[q] ?? 0) + 1; }
    const ready = (q: string) => readySpecies(q as never).length > 0;
    if (ready('peu-commun')) expect(got['peu-commun'] / n).toBeCloseTo(0.05, 2);
    expect(Object.keys(got).every(q => q === 'commun' || q === 'peu-commun')).toBe(true);
  });

  it('grants chests for lucky games and epic badges once', () => {
    const p = newPet(T0, new Set(['total:0']), 0);
    let lucky: GameRecord | undefined;
    for (let i = 0; !lucky; i++) { const g = game({ id: 'g' + i, ts: T0 + H, correct: 30, total: 30, seen: { '6x7': [30, 0] } }); if (dropsEgg([g], g)) lucky = g; }
    let q = grantEggs(p, [lucky], new Set(['total:0', 'total:4']), T0 + H);
    expect(q.eggs).toHaveLength(BADGE_CHEST.epique ? 3 : 2); // start + drop (+ epic badge)
    if (BADGE_CHEST.epique) expect(q.eggs[2].box).toBe(BADGE_CHEST.epique);
    q = grantEggs(q, [lucky], new Set(['total:0', 'total:4']), T0 + 2 * H);
    expect(q.eggs).toHaveLength(BADGE_CHEST.epique ? 3 : 2);
    expect(q.log.filter(e => e.k === "chest").map(e => e.src)).toEqual(BADGE_CHEST.epique ? ["drop", "badge"] : ["drop"]);
  });

  it('a game on the table of 1 alone wins no big badge and no chest', () => {
    // The game that broke the economy: 60 s, table of 1, 30 right answers in a row
    const seen: Record<string, [number, number]> = {};
    for (let i = 0; i < 30; i++) { const k = '1x' + (1 + (i % 10)); seen[k] = [(seen[k]?.[0] ?? 0) + 1, 0]; }
    const g = game({ id: 'one', tables: [1], correct: 30, total: 30, bestStreak: 30, stars: 3, seen });
    const badges = unlocked(computeStats([g]));
    expect([...badges].map(id => BADGE_BY_ID[id].r).filter(r => r !== 'commun')).toEqual([]);
    const p = grantEggs(newPet(T0 - 1, new Set(), 0), [g], badges, T0 + 1);
    expect(p.eggs).toHaveLength(1); // only the starting gift
    expect(coinsOfGame([g], g)).toBe(Math.round(30 * TABLE_VALUE[1]));
  });

  it('cleans untrusted pet data', () => {
    const p = cleanPet({ createdAt: 1, inventory: { pomme: 2, hack: 5 }, creatures: [{ id: 'c', species: 'chiot', needs: { faim: 500 } }, { id: 'd', species: 'nope' }] })!;
    expect(p.inventory).toEqual({ pomme: 2 });
    expect(p.creatures).toHaveLength(1);
    expect(p.creatures[0].needs.faim).toBe(100);
    expect(p.activeId).toBe('c');
    expect(cleanPet(null)).toBeNull();
  });
});

function decayAll(p: ReturnType<typeof withCompanion>, dt: number) {
  return { ...p, creatures: p.creatures.map(c => decay(c, c.tick + dt)) };
}
