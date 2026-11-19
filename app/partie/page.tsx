'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BackHeader } from '@/components/ui';
import { useData } from '@/lib/data';
import { playHref } from '@/lib/game/engine';
import { bestFor, computeStats } from '@/lib/game/rules';
import { ensureAudio } from '@/lib/sound';

const DURATIONS = [30, 60, 90, 120, 150, 180];
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Game setup: tables, duration, start */
export default function PartiePage() {
  const d = useData();
  const router = useRouter();
  const st = useMemo(() => computeStats(d.history), [d.history]);
  const best = bestFor(d.history, d.duration);
  const [fake, setFake] = useState(false);
  const toggle = (t: number) => d.setTables(d.tables.includes(t) ? d.tables.filter(x => x !== t) : [...d.tables, t]);

  return (
    <section className="screen">
      <BackHeader title="Nouvelle partie" />
      <p className="sub">Combien de bonnes réponses avant la fin du chrono ?</p>
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
        <h2 className="h2-gap">Durée</h2>
        <div className="row">
          {DURATIONS.map(s => (
            <button key={s} className={'chip' + (s === d.duration ? ' on' : '')} onClick={() => d.setDuration(s)}>{s} s</button>
          ))}
        </div>
      </div>
      <button className="big" disabled={!d.tables.length} onClick={() => { ensureAudio(); router.push(playHref({ mode: 'normal' }) + (fake ? '&fake=1' : '')); }}>
        {"C'est parti !"}
      </button>
      {d.debug && (
        <label className="debugbox">
          <input type="checkbox" checked={fake} onChange={e => setFake(e.target.checked)} /> 🐞 Gagner tout de suite (super score, sans jouer)
        </label>
      )}
      <p className="best">{best ? `Record en ${d.duration} s : ${best} points` : ''}</p>
    </section>
  );
}
