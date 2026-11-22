/** Version of the code running here: number from package.json (bumped by `pnpm release`), commit and build time (next.config.ts) */
export const VERSION = { version: process.env.TT_VERSION || '', commit: process.env.TT_BUILD_COMMIT || '', builtAt: process.env.TT_BUILD_TIME || '' };
export type Version = typeof VERSION;

/** "1.0.3 · abc1234 · 22/11 à 07:57" */
export function versionLabel(v: Version) {
  const d = v.builtAt ? new Date(v.builtAt) : null;
  const when = d && !isNaN(+d) ? d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', ' à ') : '';
  return [v.version || '?', v.commit, when].filter(Boolean).join(' · ');
}
