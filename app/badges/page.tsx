'use client';
import { useMemo } from 'react';
import { BackHeader, FamCard, RarLabel, rc } from '@/components/ui';
import { useData } from '@/lib/data';
import { ALL_BADGES, computeStats, FAMILIES, RARITY, RARITY_ORDER, SECRETS, unlocked } from '@/lib/game/rules';

export default function BadgesPage() {
  const { history } = useData();
  const st = useMemo(() => computeStats(history), [history]);
  const got = useMemo(() => unlocked(st), [st]);

  return (
    <section className="screen">
      <BackHeader title="Badges" />
      <p className="sub">{got.size} badge{got.size > 1 ? 's' : ''} sur {ALL_BADGES.length}</p>
      <div className="legend">
        {RARITY_ORDER.map(r => (
          <span key={r}>
            <i className="dot" style={{ background: RARITY[r].c }} />
            {RARITY[r].n} {ALL_BADGES.filter(b => b.r === r && got.has(b.id)).length}/{ALL_BADGES.filter(b => b.r === r).length}
          </span>
        ))}
      </div>
      <h3 className="sect">Défis</h3>
      <div className="fgrid">{FAMILIES.filter(f => !f.table).map(f => <FamCard key={f.id} f={f} st={st} got={got} />)}</div>
      <h3 className="sect">Tables</h3>
      <div className="fgrid">{FAMILIES.filter(f => f.table).map(f => <FamCard key={f.id} f={f} st={st} got={got} />)}</div>
      <h3 className="sect">Badges secrets</h3>
      <div className="fgrid">
        {SECRETS.map(x => got.has(x.id) ? (
          <div key={x.id} className={'fcard r-' + x.r} style={rc(RARITY[x.r].c)}>
            <div className="fhead"><span className="fe">{x.e}</span><div><b>{x.n}</b><RarLabel r={x.r} /></div></div>
            <small className="fnext">{x.d}</small>
          </div>
        ) : (
          <div key={x.id} className="fcard none secret">
            <div className="fhead"><span className="fe">❓</span><div><b>Badge secret</b><RarLabel r={x.r} /></div></div>
            <small className="fnext">Continue à jouer pour le découvrir…</small>
          </div>
        ))}
      </div>
    </section>
  );
}
