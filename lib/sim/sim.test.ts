import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import * as BALANCE from '../balance';
import { FRESH, readySpecies } from '../pet/rules';
import { PLAYERS } from './players';
import { run } from './run';
import { summarize } from './summary';

// The balance study. Off by default (slow): `pnpm sim` runs it for every player in parallel, then writes docs/equilibrage.md.
// One player by hand: SIM=1 SIM_PLAYERS=enfant SIM_SEEDS=4 pnpm vitest run lib/sim/sim.test.ts
const only = process.env.SIM_PLAYERS?.split(',');
const seeds = Number(process.env.SIM_SEEDS) || 8, days = Number(process.env.SIM_DAYS) || 365;
const out = process.env.SIM_OUT || path.join(process.cwd(), 'data', 'sim');

// Experiments: SIM_FRESH=legendary,climb
if (process.env.SIM_FRESH?.includes('legendary')) FRESH.legendaryNew = true;
if (process.env.SIM_FRESH?.includes('climb')) FRESH.climb = true;

describe.skipIf(!process.env.SIM)('balance simulation', () => {
  for (const pl of PLAYERS.filter(p => !only || only.includes(p.id))) it(pl.id, () => {
    const res = Array.from({ length: seeds }, (_, i) => summarize(run(pl, i + 1, days)));
    mkdirSync(out, { recursive: true });
    writeFileSync(path.join(out, pl.id + '.json'), JSON.stringify({ player: { id: pl.id, name: pl.name, desc: pl.desc }, days, species: readySpecies().length, balance: BALANCE, runs: res }));
  }, 3600_000);
});
