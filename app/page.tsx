'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { CompanionHero, Coins, DebugCoins, UiIcon, usePet } from '@/components/pet';
import { PlayerCard } from '@/components/ui';
import { useData } from '@/lib/data';
import { ALL_BADGES, computeStats, totalXp, unlocked } from '@/lib/game/rules';
import { ensureAudio } from '@/lib/sound';

export default function Home() {
  const d = useData();
  const { coins } = usePet();
  const st = useMemo(() => computeStats(d.history), [d.history]);
  const n = d.history.length;
  const chests = d.pet?.eggs.filter(e => !e.opened).length ?? 0;

  return (
    <section className="screen home">
      <div className="top">
        <PlayerCard xp={totalXp(d.history)} name={d.profile.name} />
        {n > 0 && <Link href="/boutique" className="coins-link" aria-label="Boutique"><Coins n={coins} /><span className="coins-shop"><UiIcon n="boutique" /></span></Link>}
      </div>
      {d.debug && <p className="debugbar">🐞 Mode test : rien n’est envoyé au serveur</p>}
      <div className="home-body">
        {n > 0 ? <CompanionHero /> : (
          <>
            <h1>Turbo <span>Tables</span></h1>
            <p className="sub">Joue ta première partie pour découvrir ton compagnon !</p>
          </>
        )}
        <Link className="big play" href="/partie" onClick={() => ensureAudio()}><UiIcon n="jouer" /> Jouer</Link>
        <DebugCoins />
      </div>
      <div className="nav six">
        {n > 0 ? (
          <>
            <Link className="navb" href="/nid"><span className="ic"><UiIcon n="nid" /></span><span className="lb">Nid</span><span className="ct">{chests ? <>{chests} <UiIcon n="cadeau" /></> : ''}</span></Link>
            <Link className="navb" href="/bestiaire"><span className="ic"><UiIcon n="bestiaire" /></span><span className="lb">Bestiaire</span></Link>
            <Link className="navb" href="/boutique"><span className="ic"><UiIcon n="boutique" /></span><span className="lb">Boutique</span></Link>
          </>
        ) : [['nid', 'Nid'], ['bestiaire', 'Bestiaire'], ['boutique', 'Boutique']].map(([n, l]) => (
          <span key={n} className="navb disabled" aria-disabled="true"><span className="ic"><UiIcon n={n} /></span><span className="lb">{l}</span><span className="ct"><UiIcon n="cadenas" /> Après ta 1re partie</span></span>
        ))}
        <Link className="navb" href="/badges"><span className="ic"><UiIcon n="badges" /></span><span className="lb">Badges</span><span className="ct">{unlocked(st).size}/{ALL_BADGES.length}</span></Link>
        <Link className="navb" href="/diplomes"><span className="ic"><UiIcon n="diplomes" /></span><span className="lb">Diplômes</span><span className="ct">{st.dipCount}/10</span></Link>
        <Link className="navb" href="/historique"><span className="ic"><UiIcon n="historique" /></span><span className="lb">Historique</span><span className="ct">{n ? `${n} partie${n > 1 ? 's' : ''}` : ''}</span></Link>
      </div>
    </section>
  );
}
