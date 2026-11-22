'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VERSION } from '@/lib/version';

/** Shows a banner when the server runs another build than this page (old tab, cache, rollback): one tap reloads. */
export default function VersionBanner() {
  const [newer, setNewer] = useState(false);
  const playing = usePathname().startsWith('/jouer');
  useEffect(() => {
    if (!VERSION.builtAt) return;
    const check = () => fetch('/api/version', { cache: 'no-store' }).then(r => r.json())
      .then((v: { builtAt?: string }) => setNewer(!!v.builtAt && v.builtAt !== VERSION.builtAt)).catch(() => {});
    check();
    // A tablet can keep the game open for days: check again when it comes back to the front
    const onShow = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, []);
  // Never during a game: a tap would reload the page and lose it
  if (!newer || playing) return null;
  return <button className="version-banner" onClick={() => location.reload()}>✨ Nouvelle version du jeu ! Touche ici pour la charger.</button>;
}
