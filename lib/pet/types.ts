import type { Rarity } from '../game/types';

export interface Needs { faim: number; joie: number; energie: number }
export type EggSource = 'start' | 'drop' | 'badge' | 'shop' | 'pity';

/** A closed egg arrives as a chest (opened: false); once opened it waits in the nest. */
/** Chest kind = the lowest egg quality it guarantees (none = common chest, anything can come out) */
export type Box = 'peu-commun' | 'rare' | 'epique' | 'legendaire';
export interface Egg { id: string; q: Rarity; species?: string; source: EggSource; at: number; opened: boolean; box?: Box }

export interface Creature {
  id: string; species: string; name: string; bornAt: number;
  xp: number;
  /** Stage index already celebrated: a higher stageOf(xp) means an evolution is waiting to be shown */
  shown: number;
  needs: Needs;
  /** Time the needs were last brought up to date (only the active creature decays) */
  tick: number;
}

/**
 * One line of the pet journal, for the parent (never used to compute anything).
 * k: buy (id = item, n = price, left = coins left) · use / sleep (from / to = needs [faim, joie, énergie])
 * chest (src, q, box, id = game or badge) · open · hatch / dup (id = species, n = coins) · evolve (n = new stage)
 */
export interface LogEntry {
  t: number; k: 'buy' | 'use' | 'sleep' | 'chest' | 'open' | 'hatch' | 'dup' | 'evolve';
  id?: string; n?: number; left?: number; q?: Rarity; src?: EggSource; box?: Rarity;
  from?: [number, number, number]; to?: [number, number, number];
}

/** The "pet" document. Coins earned are recomputed from history; only what is spent is stored. */
export interface PetState {
  createdAt: number;
  updatedAt: number;
  spent: number;
  /** Coins given by duplicates */
  bonus: number;
  inventory: Record<string, number>;
  eggs: Egg[];
  /** The egg in the incubator, with the counted points it already got (see applyGames) */
  incubating: (Egg & { done: number }) | null;
  /** 'drop:<gameId>', 'badge:<badgeId>' already turned into eggs */
  claimed: string[];
  lastEggAt: number;
  /** ts of the last game applied to the companion */
  processed: number;
  creatures: Creature[];
  activeId: string | null;
  careCount: number;
  /** Last events (see LogEntry), capped at LOG_MAX */
  log: LogEntry[];
}
