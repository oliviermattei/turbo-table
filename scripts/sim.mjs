// Balance study: simulates every virtual player (lib/sim/players.ts) over a year, several lives each, in parallel,
// then writes docs/equilibrage.md. Usage: pnpm sim [--seeds 8] [--days 365] [--players enfant,fourbe]
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const seeds = arg('seeds', '8'), days = arg('days', '365');
const ALL = ['enfant', 'marathon', 'fourbe', 'facile', 'adulte', 'petit', 'negligent'];
const players = arg('players', ALL.join(',')).split(',');
const out = path.resolve('data/sim');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const runOne = id => new Promise((ok, ko) => {
  const p = spawn('pnpm', ['vitest', 'run', 'lib/sim/sim.test.ts', '--silent'], {
    stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, SIM: '1', SIM_PLAYERS: id, SIM_SEEDS: seeds, SIM_DAYS: days, SIM_OUT: out },
  });
  p.on('exit', c => (c ? ko(new Error(id + ' failed')) : ok()));
});
const t0 = Date.now();
const queue = [...players];
await Promise.all(Array.from({ length: Math.min(os.availableParallelism(), queue.length) }, async () => {
  while (queue.length) { const id = queue.shift(); await runOne(id); console.log('✓', id, Math.round((Date.now() - t0) / 1000) + ' s'); }
}));

/* ---------- Report ---------- */
const data = readdirSync(out).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(path.join(out, f), 'utf8')))
  .sort((a, b) => ALL.indexOf(a.player.id) - ALL.indexOf(b.player.id));
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const rng = a => { const s = a.filter(x => x !== null).sort((x, y) => x - y); return s.length ? `${s[0]}–${s[s.length - 1]}` : '–'; };
const r0 = x => Math.round(x);
const pc = x => Math.round(x * 100) + ' %';
const CHECKS = [1, 7, 30, 90, 180, 270, 365].filter(d => d <= Number(days));
const WIN = ['J1-7', 'J8-30', 'J31-90', 'J91-180', 'J181-365'];
const Q = ['commun', 'peu-commun', 'rare', 'epique', 'legendaire'], QN = ['Commun', 'Peu commun', 'Rare', 'Épique', 'Légendaire'];
const nSpecies = data[0]?.species ?? 0;
const doneTxt = runs => { const done = runs.map(r => r.complete).filter(x => x !== null); return done.length === runs.length ? `${med(done)} j (${rng(done)})` : done.length ? `${med(done)} j pour ${done.length}/${runs.length} vies` : 'jamais en ' + days + ' j'; };

let md = `# Équilibrage : rapport du simulateur\n\n`;
md += `Généré par \`pnpm sim\` le ${new Date().toISOString().slice(0, 10)} : ${seeds} vies par joueur, ${days} jours, ${nSpecies} espèces disponibles. `;
md += `Chaque partie passe par \`settle()\`, le même code que l’écran de fin de partie. Les chiffres sont des médianes (avec le min–max des vies).\n\n`;
md += `Joueurs virtuels (\`lib/sim/players.ts\`) :\n\n` + data.map(d => `- **${d.player.name}** (\`${d.player.id}\`) : ${d.player.desc}`).join('\n') + '\n\n';

md += `## Espèces trouvées\n\n| Joueur | ${CHECKS.map(d => 'J' + d).join(' | ')} | Bestiaire complet |\n|---|${CHECKS.map(() => '---').join('|')}|---|\n`;
for (const d of data) md += `| ${d.player.name} | ${CHECKS.map((c, i) => med(d.runs.map(r => r.species[i]))).join(' | ')} | ${doneTxt(d.runs)} |\n`;

md += `\n## Première espèce de chaque qualité (jour)\n\n| Joueur | ${QN.join(' | ')} |\n|---|${Q.map(() => '---').join('|')}|\n`;
for (const d of data) md += `| ${d.player.name} | ${Q.map(q => { const v = d.runs.map(r => r.first[q]).filter(x => x !== null); return v.length ? `${med(v)}${v.length < d.runs.length ? ` (${v.length}/${d.runs.length})` : ''}` : '–'; }).join(' | ')} |\n`;

md += `\n## Pièces\n\nPièces d’une partie normale qui compte (J15-60, sans badges ni niveaux), puis pièces gagnées par jour et part dépensée en nourriture et jouets.\n\n`;
md += `| Joueur | 🪙 / partie | Parties / jour | ${WIN.map(w => '🪙 / jour ' + w).join(' | ')} | Entretien ${WIN[1]} | Entretien ${WIN[3]} | Triste |\n|---|---|---|${WIN.map(() => '---').join('|')}|---|---|---|\n`;
for (const d of data) {
  const w = i => d.runs.map(r => r.windows[i]).filter(Boolean);
  md += `| ${d.player.name} | ${med(d.runs.map(r => r.coinsPerGame))} | ${med(w(1).map(x => x.gamesPerDay)).toFixed(1)} | ${WIN.map((_, i) => w(i).length ? r0(med(w(i).map(x => x.earnedPerDay))) : '–').join(' | ')} | ${pc(med(w(1).map(x => x.upkeepShare)))} | ${w(3).length ? pc(med(w(3).map(x => x.upkeepShare))) : '–'} | ${pc(med(d.runs.map(r => r.sadShare)))} |\n`;
}
md += `\nSolde (pièces non dépensées) :\n\n| Joueur | ${CHECKS.map(d => 'J' + d).join(' | ')} |\n|---|${CHECKS.map(() => '---').join('|')}|\n`;
for (const d of data) md += `| ${d.player.name} | ${CHECKS.map((c, i) => r0(med(d.runs.map(r => r.balance[i])))).join(' | ')} |\n`;

md += `\n## Niveaux et badges\n\n| Joueur | Niveau J7 | J30 | J180 | J365 | Badges J7 (C/PC/R/É/L) | Badges J30 | Badges J180 |\n|---|---|---|---|---|---|---|---|\n`;
const bq = (d, i) => Q.map(q => med(d.runs.map(r => r.badges[i]?.[q] ?? 0))).join('/');
const ci = d => CHECKS.indexOf(d);
for (const d of data) md += `| ${d.player.name} | ${[7, 30, 180, 365].map(x => ci(x) >= 0 ? med(d.runs.map(r => r.level[ci(x)])) : '–').join(' | ')} | ${ci(7) >= 0 ? bq(d, ci(7)) : '–'} | ${ci(30) >= 0 ? bq(d, ci(30)) : '–'} | ${ci(180) >= 0 ? bq(d, ci(180)) : '–'} |\n`;

md += `\n## Coffres obtenus sur ${days} jours (médiane par qualité de l’œuf : C/PC/R/É/L)\n\n| Joueur | Parties | Boutique | Badges | Parties (chance) | Filet de sécurité |\n|---|---|---|---|---|---|\n`;
const cq = (d, src) => Q.map(q => med(d.runs.map(r => r.chests[src]?.[q] ?? 0))).join('/');
for (const d of data) md += `| ${d.player.name} | ${med(d.runs.map(r => r.games))} | ${cq(d, 'shop')} | ${cq(d, 'badge')} | ${cq(d, 'drop')} | ${cq(d, 'pity')} |\n`;

const b = data[0]?.balance;
if (b) {
  md += `\n## Réglages utilisés (\`lib/balance.ts\`)\n\n\`\`\`json\n${JSON.stringify(b, null, 1).replace(/\n\s+(?=[\d\]}-])/g, ' ').replace(/\[\s+/g, '[')}\n\`\`\`\n`;
}
mkdirSync('docs', { recursive: true });
writeFileSync('docs/equilibrage.md', md);
console.log(`docs/equilibrage.md written in ${Math.round((Date.now() - t0) / 1000)} s`);
