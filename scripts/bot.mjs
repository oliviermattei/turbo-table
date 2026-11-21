// Robots that play the real game in a browser (Playwright), to check that what the end screen shows is what the
// rules computed and stored, and to try the shortcuts a child could find. Local only: its own database in data/e2e.
// Usage: pnpm build && node scripts/bot.mjs   (starts `next start` on port 3100 itself)
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'node:module';

// Playwright is not a project dependency: it must be installed on the machine (npm i -g playwright && npx playwright install chromium)
const { chromium } = createRequire(import.meta.url)('playwright');

const PORT = 3100, BASE = `http://localhost:${PORT}`, CODE = 'robot-code-123';
const dataDir = path.resolve('data/e2e');
rmSync(dataDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });
const shots = path.join(dataDir, 'shots');
mkdirSync(shots, { recursive: true });

// Its own process group, so that stopping it also stops next-server (pnpm does not pass the signal on)
const server = spawn('pnpm', ['start', '-p', String(PORT)], { env: { ...process.env, DATA_DIR: dataDir, FAMILY_CODE: CODE }, stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid); } catch { /* already stopped */ } };
process.on('exit', stop);
if ((await fetch(BASE).catch(() => null))?.ok) throw new Error(`port ${PORT} already in use: stop the other server first`);
for (let i = 0; ; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch { /* not up yet */ }
  if (i > 60) throw new Error('server did not start');
  await new Promise(r => setTimeout(r, 500));
}

const browser = await chromium.launch();
const results = [];
const check = (bot, what, ok, info = '') => { results.push({ bot, what, ok, info }); console.log(ok ? '✓' : '✗', bot, '·', what, info); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const vis = '.screen:visible';

async function newPlayer(settings) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 780 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await page.evaluate(s => { for (const [k, v] of Object.entries(s)) localStorage.setItem('tt_' + k, JSON.stringify(v)); }, settings);
  return page;
}
const local = (page, k) => page.evaluate(k => JSON.parse(localStorage.getItem('tt_' + k) || 'null'), k);

/** Plays one game: reads the question, clicks the right answer (or a wrong one `err` of the time) after `think` ms */
async function play(page, url, { think = 600, err = 0 } = {}) {
  await page.goto(BASE + url);
  await page.locator(`${vis} .q`).waitFor();
  let last = '';
  for (;;) {
    if (await page.locator(`${vis} .xpgain`).count()) break;
    const q = (await page.locator(`${vis} .q`).textContent().catch(() => '')) ?? '';
    const m = q.match(/(\d+) × (\d+)/);
    if (!m || q === last || (await page.locator(`${vis} .card.good, ${vis} .card.bad`).count())) { await sleep(60); continue; }
    last = q;
    await sleep(think);
    const ans = String(Number(m[1]) * Number(m[2]));
    const choices = page.locator(`${vis} .choice`);
    const texts = await choices.allTextContents();
    const idx = Math.random() < err ? texts.findIndex(t => t !== ans) : texts.indexOf(ans);
    if (idx >= 0) await choices.nth(idx).dispatchEvent('pointerdown').catch(() => {});
  }
  const coins = Number((await page.locator(`${vis} .petgain .gain`).textContent()).match(/\d+/)[0]);
  const xp = Number((await page.locator(`${vis} .xpgain .gain`).textContent()).match(/\d+/)[0]);
  const badges = await page.locator(`${vis} .nb`).evaluateAll(els => els.filter(e => !e.querySelector('.next')).map(e => [...e.classList].find(c => c.startsWith('r-'))?.slice(2)));
  const g = (await local(page, 'history'))[0];
  return { coins, xp, badges, g };
}

async function sameAsStored(bot, page, r) {
  check(bot, 'pièces affichées = pièces enregistrées', r.coins === r.g.gains?.coins, `${r.coins} 🪙 (partie ${r.g.correct}/${r.g.total}, ${r.g.gains?.points} pts)`);
  check(bot, 'XP affichée = XP enregistrée', r.xp === r.g.gains?.xp, `${r.xp} XP`);
  check(bot, 'temps de réponse enregistrés', Array.isArray(r.g.ms) && r.g.ms.length === r.g.total, `${r.g.ms?.length} temps`);
}

const bots = {
  /** A child on hard tables: pet first, then games; the coins shown must match the shop */
  async enfant() {
    const page = await newPlayer({ tables: [3, 4, 6, 7, 8], duration: 30, profile: { name: 'Robot' } });
    await page.goto(BASE + '/nid');
    await page.locator(`${vis} .eggb`).first().click();
    await page.locator('.modal, .scene').first().click({ position: { x: 180, y: 380 } }).catch(() => {});
    await sleep(2500);
    const pet = await local(page, 'pet');
    check('enfant', 'le coffre de départ est ouvert et couve', !!pet?.incubating, pet?.incubating?.q);
    for (let i = 0; i < 3; i++) await sameAsStored('enfant', page, await play(page, '/jouer?mode=normal&n=' + i, { think: 900, err: 0.1 }));
    const h = await local(page, 'history');
    await page.goto(BASE + '/boutique');
    const shown = Number((await page.locator(`${vis} .coins`).first().textContent()).replace(/\D/g, ''));
    check('enfant', 'solde de la boutique = solde de la dernière partie', shown === h[0].gains.balance, `${shown} 🪙`);
    const p2 = await local(page, 'pet');
    check('enfant', 'l’œuf a avancé des points des parties', Math.abs(p2.incubating?.done - h.reduce((s, g) => s + g.gains.points, 0)) < 0.01 || !p2.incubating, `${p2.incubating?.done?.toFixed?.(1)} pts`);
    await page.goto(BASE + '/journal');
    await page.locator(`${vis} .jrow`).first().waitFor();
    await page.screenshot({ path: path.join(shots, 'journal.png'), fullPage: true });
    check('enfant', 'le journal montre les parties', (await page.locator(`${vis} .jrow`).count()) >= 3);
  },
  /** The shortcut that broke the game: table of 1 only, fast and without mistakes */
  async table1() {
    const page = await newPlayer({ tables: [1], duration: 30 });
    await page.goto(BASE + '/nid'); // the pet exists, as for the child who found the bug
    for (let i = 0; i < 3; i++) {
      const r = await play(page, '/jouer?mode=normal&n=' + i, { think: 250 });
      await sameAsStored('table1', page, r);
      check('table1', 'peu de pièces', r.coins <= 4, `${r.coins} 🪙 pour ${r.g.correct} bonnes réponses`);
      check('table1', 'aucun badge Rare ou mieux', r.badges.every(q => q === 'commun' || q === 'peu-commun'), r.badges.join(','));
      if (i === 0) await page.screenshot({ path: path.join(shots, 'fin-table1.png'), fullPage: true });
    }
    const pet = await local(page, 'pet');
    check('table1', 'aucun coffre gagné', pet.eggs.length + (pet.incubating ? 1 : 0) <= 1, `${pet.eggs.length} œuf(s) au nid`);
  },
  /** The diploma of the table of 1, twice: it pays once */
  async examen1() {
    const page = await newPlayer({});
    const a = await play(page, '/jouer?mode=exam&table=1&n=1', { think: 250 });
    const b = await play(page, '/jouer?mode=exam&table=1&n=2', { think: 250 });
    check('examen1', 'le 1er diplôme rapporte', a.g.passed && a.coins >= 20, `${a.coins} 🪙`);
    check('examen1', 'le même diplôme ne rapporte plus', b.coins <= 2, `${b.coins} 🪙`);
  },
  /** A synced device: the game reaches the server with its gains, then the parent resets everything */
  async parent() {
    const page = await newPlayer({ tables: [6, 7], duration: 30 });
    await page.goto(BASE + '/historique');
    await page.locator(`${vis} input[type=password]`).fill(CODE);
    await page.locator(`${vis} form button[type=submit]`).click();
    await page.locator(`${vis} .note`, { hasText: 'serveur' }).waitFor();
    await play(page, '/jouer?mode=normal&n=1', { think: 700 });
    await sleep(1500);
    const st = await page.evaluate(() => fetch('/api/state').then(r => r.json()));
    check('parent', 'la partie et ses gains sont sur le serveur', st.games.length === 1 && !!st.games[0].gains, `${st.games.length} partie(s)`);
    await page.goto(BASE + '/historique');
    await page.locator(`${vis} button`, { hasText: 'Remettre la progression' }).click();
    await page.locator(`${vis} form input[type=password]`).last().fill(CODE);
    page.once('dialog', d => d.accept());
    await page.locator(`${vis} button`, { hasText: 'Tout remettre à zéro' }).click();
    await sleep(2000);
    const after = await page.evaluate(() => fetch('/api/state').then(r => r.json()));
    check('parent', 'serveur remis à zéro', after.games.length === 0 && !after.pet && after.reset > 0);
    check('parent', 'appareil remis à zéro', (await local(page, 'history')).length === 0);
    const db = new DatabaseSync(path.join(dataDir, 'turbo-tables.db'), { readOnly: true });
    check('parent', 'la partie est archivée, pas supprimée', db.prepare('SELECT COUNT(*) n FROM games_archive').get().n === 1);
    db.close();
  },
};

const only = process.argv.slice(2);
await Promise.all(Object.entries(bots).filter(([k]) => !only.length || only.includes(k)).map(([k, f]) => f().catch(e => check(k, 'erreur', false, e.message.split('\n')[0]))));
await browser.close();
stop();
writeFileSync(path.join(dataDir, 'bot-report.json'), JSON.stringify(results, null, 1));
const bad = results.filter(r => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} vérifications OK`);
process.exit(bad.length ? 1 : 0);
