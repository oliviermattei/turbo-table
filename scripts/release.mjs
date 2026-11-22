// Deploys the game: checks the code, bumps the version, pushes to main (Coolify rebuilds), then waits until the
// site serves the new version. Every deploy goes through here, so each one has its own number.
// Usage: pnpm release [patch|minor|major]   (patch by default: 1.0.3 → 1.0.4)
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://turbotable.olm.re';
const part = process.argv[2] || 'patch';
if (!['patch', 'minor', 'major'].includes(part)) throw new Error('usage: pnpm release [patch|minor|major]');
const sh = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts }).trim();
const step = (msg) => console.log(`\n▶ ${msg}`);

if (sh('git status --porcelain')) throw new Error('uncommitted changes: commit them first');
step('main can move forward to this commit');
sh('git fetch -q origin main');
try { sh('git merge-base --is-ancestor origin/main HEAD'); } catch { throw new Error('origin/main has commits this branch lacks: merge them first'); }

step('checks: lint, tests, build');
for (const cmd of ['pnpm lint', 'pnpm test', 'pnpm build']) sh(cmd, { stdio: 'inherit' });

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const [ma, mi, pa] = pkg.version.split('.').map(Number);
const next = part === 'major' ? `${ma + 1}.0.0` : part === 'minor' ? `${ma}.${mi + 1}.0` : `${ma}.${mi}.${pa + 1}`;
step(`version ${pkg.version} → ${next}`);
pkg.version = next;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
sh('git add package.json');
sh(`git commit -q -m "Release ${next}"`);
sh(`git tag v${next}`);

step('push to main (Coolify deploys it)');
const branch = sh('git rev-parse --abbrev-ref HEAD');
sh('git push -q origin HEAD:main', { stdio: 'inherit' });
if (branch !== 'main' && branch !== 'HEAD') sh(`git push -q origin HEAD:${branch}`, { stdio: 'inherit' });
try { sh(`git push -q origin v${next}`); } catch { console.warn(`(tag v${next} not pushed)`); }

step(`waiting for ${SITE}/api/version to say ${next}`);
for (let i = 0; i < 80; i++) {
  const v = await fetch(`${SITE}/api/version`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
  if (v?.version === next) { console.log(`✓ online: ${next} (${v.commit || 'no commit'}, built ${v.builtAt})`); process.exit(0); }
  await new Promise(r => setTimeout(r, 15000));
}
console.error(`✗ ${SITE} still does not serve ${next} after 20 min: look at the deployment in Coolify`);
process.exit(1);
