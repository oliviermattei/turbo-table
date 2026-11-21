'use client';
import { useMemo } from 'react';
import { BackHeader, Progress, rc } from '@/components/ui';
import { useData } from '@/lib/data';
import { ALL_BADGES, computeStats, famProgress, RARITY, RARITY_ORDER, unlocked } from '@/lib/game/rules';

/** One tile per badge, grouped by quality; the tile takes the colour of its quality once won. */
export default function BadgesPage() {
  const { history } = useData();
  const st = useMemo(() => computeStats(history), [history]);
  const got = useMemo(() => unlocked(st), [st]);

  return (
    <section className="screen">
      <BackHeader title="Badges" />
      <p className="sub">{got.size} badge{got.size > 1 ? 's' : ''} sur {ALL_BADGES.length}</p>
      <p className="note">Les parties trop faciles (table de 1, 2, 5 ou 10 toute seule) ne comptent pas pour les badges.</p>
      {RARITY_ORDER.map(r => {
        const list = ALL_BADGES.filter(b => b.r === r);
        return (
          <div key={r}>
            <h3 className="sect" style={{ color: RARITY[r].c }}>{RARITY[r].n} · {list.filter(b => got.has(b.id)).length}/{list.length}</h3>
            <div className="bgrid2">
              {list.map(b => {
                const on = got.has(b.id);
                if (b.secret && !on) return (
                  <div key={b.id} className="badge2 off" style={rc(RARITY[r].c)}>
                    <span className="e">❓</span><b>Badge secret</b><small>Continue à jouer…</small>
                  </div>
                );
                // Progress only towards the next tier of a family
                const pr = !on && b.fam ? famProgress(b.fam, st) : null;
                const next = pr && !pr.done && pr.i === b.tier ? pr : null;
                return (
                  <div key={b.id} className={'badge2 ' + (on ? 'on r-' + r : 'off')} style={rc(RARITY[r].c)}>
                    <span className="e">{b.fam?.table ? <span className="tnum">{b.fam.table}</span> : b.e}</span>
                    <b>{b.n}</b>
                    <small>{b.d}</small>
                    {next && <><Progress pct={next.pct} /><span className="bnum">{next.v} / {next.goal}</span></>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
