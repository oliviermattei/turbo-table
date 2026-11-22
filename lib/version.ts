/** Version of the code running here (set at build time in next.config.ts) */
export const VERSION = { commit: process.env.TT_BUILD_COMMIT || '', builtAt: process.env.TT_BUILD_TIME || '' };

/** "abc1234 · 22/11 07:57" */
export function versionLabel(v: { commit: string; builtAt: string }) {
  const d = v.builtAt ? new Date(v.builtAt) : null;
  const when = d && !isNaN(+d) ? d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', ' à ') : '?';
  return `${v.commit || '?'} · ${when}`;
}
