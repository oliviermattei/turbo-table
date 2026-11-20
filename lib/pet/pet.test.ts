import { describe, expect, it } from 'vitest';
import type { GameRecord } from '../game/types';
import { cleanPet } from './clean';
import {
  applyGames, buy, coinsOfGame, decay, dropsEgg, grantEggs, hatch, hatchProgress, moodOf, newPet, openChest,
  markShown, readySpecies, sleep, stageOf, useItem,
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
  p = openChest(p, p.eggs[0].id, 0);
  const r = hatch(p, 50, T0, 0.1);
  if (!r) throw new Error('should hatch');
  return r.p;
}

describe('pet', () => {
  it('has the dog ready to hatch', () => expect(readySpecies('commun').map(s => s.id)).toContain('chiot'));

  it('pays coins per game', () => {
    expect(coinsOfGame(game({ correct: 20, stars: 3 }))).toBe(35);
    expect(coinsOfGame(game({ mode: 'practice', correct: 8, total: 10 }))).toBe(8 + 15);
    expect(coinsOfGame(game({ mode: 'practice', correct: 8, total: 8 }))).toBe(8 + 30);
    expect(coinsOfGame(game({ mode: 'practice', correct: 2, total: 2 }))).toBe(2);
    expect(coinsOfGame(game({ mode: 'exam', passed: true, mention: 3 }))).toBe(40);
  });

  it('gives a first chest that hatches after 25 correct answers', () => {
    let p = newPet(T0, new Set(), 0);
    expect(p.eggs).toHaveLength(1);
    expect(p.eggs[0]).toMatchObject({ q: 'commun', opened: false });
    p = openChest(p, p.eggs[0].id, 100);
    expect(p.incubating?.start).toBe(100);
    expect(hatchProgress(p, 124)?.ready).toBe(false);
    expect(hatch(p, 124, T0, 0.5)).toBeNull();
    const r = hatch(p, 125, T0, 0.5)!;
    expect(r.out.dup).toBe(false);
    expect(r.p.activeId).toBe(r.p.creatures[0].id);
    expect(r.p.incubating).toBeNull();
  });

  it('turns a duplicate into coins', () => {
    let p = withCompanion();
    // Own every ready common species, so the next common egg is a duplicate
    const c0 = p.creatures[0];
    p = { ...p, creatures: readySpecies('commun').map((s, i) => ({ ...c0, id: 'c' + i, species: s.id })) };
    p = { ...p, incubating: { id: 'x', q: 'commun', source: 'shop', at: T0, opened: true, start: 0 } };
    const r = hatch(p, 50, T0, 0.1)!;
    expect(r.out).toMatchObject({ dup: true, coins: 25 });
    expect(r.p.bonus).toBe(25);
  });

  it('gives a coin bonus for a rare companion, not when sad', () => {
    let p = withCompanion();
    p = { ...p, creatures: [{ ...p.creatures[0], species: 'phenix-solaire' }] };
    p = applyGames(p, [game({ ts: T0 + H, correct: 20, stars: 0 })]);
    expect(p.bonus).toBe(5); // legendary 25 % + baby 0 % + 1 species 2 % of 20 coins
    p = applyGames(p, [game({ ts: T0 + 90 * H, correct: 20, stars: 0 })]);
    expect(p.bonus).toBe(5); // sad after 89 h: no bonus
    p = { ...p, creatures: [{ ...p.creatures[0], xp: 2000, shown: 3, needs: { faim: 100, joie: 100, energie: 100 }, tick: T0 + 90 * H }] };
    p = applyGames(p, [game({ ts: T0 + 91 * H, correct: 20, stars: 0 })]);
    expect(p.bonus).toBe(5 + 15); // + 77 % once Super
  });

  it('decays needs over time and gets sad', () => {
    const c = withCompanion().creatures[0];
    expect(moodOf(decay(c, T0 + 24 * H).needs)).toBe('bof');
    expect(moodOf(decay(c, T0 + 72 * H).needs)).toBe('triste');
  });

  it('grows only when not sad', () => {
    let p = withCompanion();
    p = applyGames(p, [game({ ts: T0 + H, correct: 30 })]);
    expect(p.creatures[0].xp).toBe(30);
    p = applyGames(p, [game({ ts: T0 + H, correct: 30 }), game({ ts: T0 + 80 * H, correct: 30 })]);
    expect(p.creatures[0].xp).toBe(30); // already processed + sad after 79 h
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

  it('buys and gives items', () => {
    let p = withCompanion();
    expect(buy(p, 'pomme', 5, T0)).toBe(p);
    p = buy(p, 'pomme', 100, T0);
    expect(p.spent).toBe(10);
    p = useItem(decayAll(p, 10 * H), 'pomme', T0 + 10 * H);
    expect(p.inventory.pomme).toBeUndefined();
    expect(p.creatures[0].needs.faim).toBe(100);
    p = sleep(p, T0 + 20 * H);
    expect(p.creatures[0].needs.energie).toBe(100);
    expect(p.careCount).toBe(2);
    p = buy(p, 'coffre', 800, T0);
    expect(p.eggs.at(-1)?.opened).toBe(false);
    expect(p.eggs.at(-1)?.box).toBeUndefined();
    p = buy(p, 'coffre-epique', 6000, T0 + 1);
    expect(p.eggs.at(-1)?.box).toBe('epique');
    expect(['epique', 'legendaire']).toContain(p.eggs.at(-1)?.q);
    p = buy(p, 'coffre-legendaire', 12000, T0 + 2);
    expect(p.eggs.at(-1)?.q).toBe('legendaire');
  });

  it('grants chests for lucky games and epic badges once', () => {
    const p = newPet(T0, new Set(['total:0']), 0);
    let lucky: GameRecord | undefined;
    for (let i = 0; !lucky; i++) { const g = game({ id: 'g' + i, ts: T0 + H }); if (dropsEgg(g)) lucky = g; }
    let q = grantEggs(p, [lucky], new Set(['total:0', 'total:4']), T0 + H);
    expect(q.eggs).toHaveLength(3); // start + drop + epic badge
    expect(q.eggs[2].box).toBe('rare'); // an epic badge guarantees at least Rare
    expect(['rare', 'epique', 'legendaire']).toContain(q.eggs[2].q);
    q = grantEggs(q, [lucky], new Set(['total:0', 'total:4']), T0 + 2 * H);
    expect(q.eggs).toHaveLength(3);
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
