import { describe, expect, it } from 'vitest';
import { PLAYERS } from './players';
import { run } from './run';

// Keeps the simulator working: a short life for each player (the full study is `pnpm sim`)
describe('simulator', () => {
  for (const pl of PLAYERS) it(pl.id, () => {
    const r = run(pl, 1, 20);
    expect(r.days).toHaveLength(20);
    expect(r.days.at(-1)!.balance).toBeGreaterThanOrEqual(0);
  });
});
