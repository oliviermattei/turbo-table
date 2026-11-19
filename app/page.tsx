'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { CompanionCard } from '@/components/pet';
import { PlayerCard } from '@/components/ui';
import { useData } from '@/lib/data';
import { playHref } from '@/lib/game/engine';
import { ALL_BADGES, bestFor, computeStats, totalXp, unlocked } from '@/lib/game/rules';
import { ensureAudio } from '@/lib/sound';

const DURATIONS = [30, 60, 90, 120, 150, 180];
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function Home() {
  const d = useData();
  const router = useRouter();
  const st = useMemo(() => computeStats(d.history), [d.history]);
  const best = bestFor(d.history, d.duration);
  const n = d.history.length;
  const toggle = (t: number) => d.setTables(d.tables.includes(t) ? d.tables.filter(x => x !== t) : [...d.tables, t]);

  return (
    <section className="screen">
      <div className="top">
        <PlayerCard xp={totalXp(d.history)} name={d.profile.name} />
        <button className="icon-btn" aria-label="Son" onClick={() => { ensureAudio(); d.setSound(!d.sound); }}>{d.sound ? '🔊' : '🔇'}</button>
      </div>
      <h1>Turbo <span>Tables</span></h1>
      <p className="sub">Combien de bonnes réponses avant la fin du chrono ?</p>
      <CompanionCard />

      <div className="panel">
        <h2>Quelles tables ?
          <span className="links">
            <button onClick={() => d.setTables(ALL)}>Toutes</button>
            <button onClick={() => d.setTables([])}>Aucune</button>
          </span>
        </h2>
        <div className="chips">
          {ALL.map(t => (
            <button key={t} className={'chip' + (d.tables.includes(t) ? ' on' : '')} onClick={() => toggle(t)}>
              {t}{st.dips[t] && <span className="cap">🎓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Durée</h2>
        <div className="row">
          {DURATIONS.map(s => (
            <button key={s} className={'chip' + (s === d.duration ? ' on' : '')} onClick={() => d.setDuration(s)}>{s} s</button>
          ))}
        </div>
      </div>

      <div className="spacer" />
      <button className="big" disabled={!d.tables.length} onClick={() => { ensureAudio(); router.push(playHref({ mode: 'normal' })); }}>
        {"C'est parti !"}
      </button>
      <p className="best">{best ? `Record en ${d.duration} s : ${best} points` : ''}</p>
      <div className="nav">
        <Link className="navb" href="/badges"><span className="ic">🏅</span><span className="lb">Badges</span><span className="ct">{unlocked(st).size}/{ALL_BADGES.length}</span></Link>
        <Link className="navb" href="/diplomes"><span className="ic">🎓</span><span className="lb">Diplômes</span><span className="ct">{st.dipCount}/10</span></Link>
        <Link className="navb" href="/historique"><span className="ic">📜</span><span className="lb">Historique</span><span className="ct">{n ? `${n} partie${n > 1 ? 's' : ''}` : ''}</span></Link>
      </div>
    </section>
  );
}
