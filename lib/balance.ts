import type { Rarity } from './game/types';

/**
 * Every number that sets the pace of the game, in one place.
 * Tuned with the player simulator (lib/sim, `pnpm sim`): change a value, run it, read docs/equilibrage.md.
 * Objects (not consts) so the simulator can try variants.
 */

/* ---------- What a right answer is worth ---------- */
/** Value of each factor: a calculation is worth the value of its easier factor (7×1 = 0.05, 7×8 = 1) */
export const TABLE_VALUE = [0, 0.05, 0.3, 0.8, 0.8, 0.35, 1, 1, 1, 1, 0.1];
/** A game "counts" (badges, stars, games and days played) when its average calculation is at least this hard and it has enough right answers */
export const SERIOUS = { difficulty: 0.4, correct: 5 };
/** Diminishing returns in a day: the first `full` points count fully, the next `half` at 50 %, the rest at `rest` */
export const DAILY = { full: 100, half: 100, rest: 0.2 };

/* ---------- Game rewards ---------- */
export const GAME = {
  /** coins per counted point; stars only pay in a game that counts */
  coinsPerPoint: 1, coinsPerStar: 1,
  xpPerPoint: 2, xpPerStar: 5,
  /** A diploma pays once, when it is new or its mention improves: base + perMention × mention */
  examCoins: [10, 10] as [number, number], examXp: [20, 10] as [number, number],
  /** Training on mistakes: a bonus for 3+ questions (more without a mistake), at most `perDay` times a day */
  practiceBonus: 5, practicePerfect: 5, practicePerDay: 3,
  /** The first game that counts each day: rewards playing often rather than a lot (keeps a light player's companion fed) */
  dailyBonus: 5,
};
export const BADGE_COINS: Record<Rarity, number> = { commun: 1, 'peu-commun': 2, rare: 3, epique: 5, legendaire: 10 };
export const LEVEL_COINS = { perLevel: 5 };

/* ---------- Chests and eggs ---------- */
/** Chance that a game drops a chest, per counted point (×2 with 3 stars in a game that counts), capped */
export const DROP = { perPoint: 0.001, threeStars: 2, max: 0.05 };
/** What comes out of each chest (weights). The better egg stays a small surprise, the same 5 % in every chest */
export const CHEST_ODDS: Record<Rarity, Partial<Record<Rarity, number>>> = {
  commun: { commun: 95, 'peu-commun': 5 },
  'peu-commun': { 'peu-commun': 95, rare: 5 },
  rare: { rare: 95, epique: 5 },
  epique: { epique: 95, legendaire: 5 },
  legendaire: { legendaire: 100 },
};
/** Chest given by a badge of that quality. None: the simulator showed badges filled the nest (20+ epic badges the first month) */
export const BADGE_CHEST: Partial<Record<Rarity, Rarity>> = {};
/** Counted points to hatch an egg */
export const HATCH: Record<Rarity, number> = { commun: 40, 'peu-commun': 80, rare: 140, epique: 220, legendaire: 320 };
export const DUP_COINS: Record<Rarity, number> = { commun: 5, 'peu-commun': 10, rare: 20, epique: 40, legendaire: 80 };
/** Days played (that count) without any new egg before a free common chest */
export const PITY = { days: 10 };

/* ---------- Companion ---------- */
/** Counted points needed for each stage: Bébé, Petit, Grand, Super */
export const STAGE_XP = [0, 150, 600, 1500];
/** Coin bonus of a happy active companion: quality + stage + per species found */
export const QUALITY_BONUS: Record<Rarity, number> = { commun: 0, 'peu-commun': 0.15, rare: 0.3, epique: 0.5, legendaire: 0.8 };
export const STAGE_BONUS = [0, 0.05, 0.1, 0.15];
/** Collection bonus in whole steps: +1 % for 1 or 2 species found, +2 % for 3 or 4… (+18 % with all 36) */
export const BONUS = { speciesPerStep: 2, perStep: 0.01 };
/** A better companion eats more: food and toys fill its needs this many times less */
export const APPETITE: Record<Rarity, number> = { commun: 1, 'peu-commun': 1.15, rare: 1.3, epique: 1.5, legendaire: 1.8 };
/** Points lost per hour, and joy given by each game */
export const NEEDS = { faim: 1.25, joie: 1, energie: 2, joyPerGame: 4 };
/** Sad when the lowest need is under `sadMin` or the average under `sadAvg`; happy from `happyAvg` with no need under `happyMin` */
export const MOOD = { sadMin: 15, sadAvg: 30, happyAvg: 60, happyMin: 35 };

/* ---------- Shop ---------- */
export const PRICES = {
  pomme: 6, sandwich: 13, gateau: 28, festin: 65, banquet: 150,
  balle: 8, peluche: 19, console: 40, manege: 85, fete: 210,
  coffre: 180, 'coffre-peu-commun': 300, 'coffre-rare': 430, 'coffre-epique': 750, 'coffre-legendaire': 1500,
};
