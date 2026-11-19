import type { Rarity } from '../game/types';

export interface Needs { faim: number; joie: number; energie: number }
export type EggSource = 'start' | 'drop' | 'badge' | 'shop' | 'pity';

/** A closed egg arrives as a chest (opened: false); once opened it waits in the nest. */
export interface Egg { id: string; q: Rarity; species?: string; source: EggSource; at: number; opened: boolean }

export interface Creature {
  id: string; species: string; name: string; bornAt: number;
  xp: number;
  /** Stage index already celebrated: a higher stageOf(xp) means an evolution is waiting to be shown */
  shown: number;
  needs: Needs;
  /** Time the needs were last brought up to date (only the active creature decays) */
  tick: number;
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
  incubating: (Egg & { start: number }) | null;
  /** 'drop:<gameId>', 'badge:<badgeId>' already turned into eggs */
  claimed: string[];
  lastEggAt: number;
  /** ts of the last game applied to the companion */
  processed: number;
  creatures: Creature[];
  activeId: string | null;
  careCount: number;
}
