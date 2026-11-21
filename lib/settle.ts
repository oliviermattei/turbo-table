import { BADGE_BY_ID, computeStats, levelInfo, nextBadge, RARITY_ORDER, totalXp, unlocked, bestFor } from './game/rules';
import type { Gains, GameRecord } from './game/types';
import { valueOf } from './game/value';
import { active, badgeCoins, balance, coinsEarned, decay, hatchProgress, levelCoins, moodOf, reconcile } from './pet/rules';
import type { PetState } from './pet/types';

/** Version of the rules, written in every game's gains (2 = values by difficulty, daily decrease, chest odds) */
export const RULES_VERSION = 2;

export const newGameId = () => 'g' + Date.now() + Math.random().toString(36).slice(2, 6);

/**
 * Everything a finished game brings, computed once from the history before it and the pet.
 * Used by the end screen and by the player simulator, so both follow exactly the same rules.
 * Returns the new history (the game first, with its gains snapshot) and the pet brought up to date.
 */
export function settle(before: GameRecord[], pet: PetState | null, game: GameRecord, now: number) {
  const after = [game, ...before];
  const stBefore = computeStats(before), stAfter = computeStats(after);
  const badgesBefore = unlocked(stBefore), badgesAfter = unlocked(stAfter);
  const lvBefore = levelInfo(totalXp(before)), lvAfter = levelInfo(totalXp(after));
  const newBadges = [...badgesAfter].filter(id => !badgesBefore.has(id)).map(id => BADGE_BY_ID[id])
    .sort((x, y) => RARITY_ORDER.indexOf(y.r) - RARITY_ORDER.indexOf(x.r));

  const comp = active(pet);
  const petAfter = pet && reconcile(pet, after, badgesAfter, now);
  // The companion's mood when the game was played decides its bonus and growth (as in applyGames)
  const mood = comp ? moodOf(decay(comp, Math.max(game.ts, comp.tick)).needs) : null;
  const compBonus = pet && petAfter ? petAfter.bonus - pet.bonus : 0;
  const newEggs = pet && petAfter ? petAfter.eggs.filter(e => !pet.eggs.some(x => x.id === e.id)) : [];
  const v = valueOf(after, game);
  const coins = coinsEarned(after, badgesAfter) - coinsEarned(before, badgesBefore) + compBonus;

  const gains: Gains = {
    v: RULES_VERSION, points: round2(v.points), raw: round2(v.raw), difficulty: round2(v.difficulty), serious: v.serious,
    xp: lvAfter.xp - lvBefore.xp, level: [lvBefore.num, lvAfter.num],
    coins, badgeCoins: badgeCoins(newBadges.map(b => b.id)), levelCoins: levelCoins(after) - levelCoins(before), compBonus,
    badges: newBadges.map(b => b.id), chests: newEggs.map(e => e.q),
    balance: balance(after, badgesAfter, petAfter),
  };
  if (comp && mood) gains.comp = { species: comp.species, mood, grew: mood !== 'triste' };
  const g = { ...game, gains };
  const history = [g, ...before];

  return {
    history, pet: petAfter, game: g, gains, value: v, newBadges, lvBefore, lvAfter, stAfter,
    isRecord: game.mode === 'normal' && game.score > 0 && game.score > bestFor(before, game.duration),
    newDiploma: game.mode === 'exam' && !!game.passed && !!game.examTable
      && (!stBefore.dips[game.examTable] || (game.mention ?? 0) > stBefore.dips[game.examTable]!.mention),
    next: newBadges.length ? null : nextBadge(stAfter),
    egg: petAfter ? hatchProgress(petAfter) : null,
    comp: comp ? { name: comp.name, grew: mood !== 'triste' } : null,
  };
}
export type Settled = ReturnType<typeof settle>;

const round2 = (x: number) => Math.round(x * 100) / 100;
