/* eslint-disable @typescript-eslint/no-explicit-any -- untrusted input, checked field by field */
import { RARITY_ORDER } from '../game/rules';
import type { Rarity } from '../game/types';
import { ITEM_BY_ID } from './rules';
import { SPECIES_BY_ID } from './species';
import type { Creature, Egg, EggSource, LogEntry, Needs, PetState } from './types';

const num = (v: unknown, max = 1e13) => Math.max(0, Math.min(max, Number(v) || 0));
const str = (v: unknown, max: number) => String(v ?? '').slice(0, max);
const arr = (v: unknown, max: number): any[] => (Array.isArray(v) ? v.slice(0, max) : []);
const SOURCES: EggSource[] = ['start', 'drop', 'badge', 'shop', 'pity'];
const quality = (v: unknown): Rarity => (RARITY_ORDER.includes(v as Rarity) ? (v as Rarity) : 'commun');
const needs = (n: any): Needs => ({ faim: num(n?.faim, 100), joie: num(n?.joie, 100), energie: num(n?.energie, 100) });

function egg(e: any): Egg {
  const o: Egg = { id: str(e?.id, 40), q: quality(e?.q), source: SOURCES.includes(e?.source) ? e.source : 'drop', at: num(e?.at), opened: !!e?.opened };
  if (SPECIES_BY_ID[e?.species]) o.species = e.species;
  if (['peu-commun', 'rare', 'epique', 'legendaire'].includes(e?.box)) o.box = e.box;
  return o;
}
const creature = (c: any): Creature => ({
  id: str(c?.id, 40), species: str(c?.species, 40), name: str(c?.name, 20), bornAt: num(c?.bornAt),
  xp: num(c?.xp, 1e9), shown: num(c?.shown, 10), needs: needs(c?.needs), tick: num(c?.tick),
});

const LOG_KINDS: LogEntry['k'][] = ['buy', 'use', 'sleep', 'chest', 'open', 'hatch', 'dup', 'evolve'];
const triple = (v: any) => (Array.isArray(v) && v.length === 3 ? (v.map(x => Math.round(num(x, 100))) as [number, number, number]) : undefined);
function logEntry(e: any): LogEntry | null {
  if (!LOG_KINDS.includes(e?.k)) return null;
  const o: LogEntry = { t: num(e.t), k: e.k };
  if (e.id !== undefined) o.id = str(e.id, 60);
  if (e.n !== undefined) o.n = num(e.n, 1e9);
  if (e.left !== undefined) o.left = num(e.left, 1e9);
  if (RARITY_ORDER.includes(e.q)) o.q = e.q;
  if (RARITY_ORDER.includes(e.box)) o.box = e.box;
  if (SOURCES.includes(e.src)) o.src = e.src;
  const from = triple(e.from), to = triple(e.to);
  if (from) o.from = from;
  if (to) o.to = to;
  return o;
}

/** Normalizes the pet document from any source (localStorage, API body). */
export function cleanPet(input: unknown): PetState | null {
  const p = input && typeof input === 'object' ? (input as Record<string, any>) : null;
  if (!p || !p.createdAt) return null;
  const inventory: Record<string, number> = {};
  for (const [k, v] of Object.entries(p.inventory ?? {})) if (ITEM_BY_ID[k] && num(v, 999) >= 1) inventory[k] = Math.floor(num(v, 999));
  const creatures = arr(p.creatures, 500).map(creature).filter(c => c.id && SPECIES_BY_ID[c.species]);
  const inc = p.incubating && typeof p.incubating === 'object' ? { ...egg(p.incubating), done: num(p.incubating.done, 1e6) } : null;
  return {
    createdAt: num(p.createdAt), updatedAt: num(p.updatedAt), spent: num(p.spent, 1e9), bonus: num(p.bonus, 1e9), inventory,
    eggs: arr(p.eggs, 200).map(egg).filter(e => e.id),
    incubating: inc?.id ? inc : null,
    claimed: arr(p.claimed, 5000).map(k => str(k, 60)),
    lastEggAt: num(p.lastEggAt), processed: num(p.processed),
    creatures,
    activeId: creatures.some(c => c.id === p.activeId) ? String(p.activeId) : creatures[0]?.id ?? null,
    careCount: num(p.careCount, 1e9),
    log: arr(p.log, 300).map(logEntry).filter((e): e is LogEntry => !!e),
  };
}
