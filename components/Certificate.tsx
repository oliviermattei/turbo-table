'use client';
import { useEffect } from 'react';
import { confetti } from '@/lib/confetti';
import { useData } from '@/lib/data';
import { computeStats, MENTIONS, type Diploma } from '@/lib/game/rules';
import { sFanfare } from '@/lib/sound';
import { Modal } from './ui';

const fmt = (ts: number) => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const MENTION_COLOR: Record<number, string> = { 3: '#ca8a04', 2: '#64748b', 1: '#c2410c' };

/** Diploma of one table, or the Grand diploma once the 10 are won. */
export default function Certificate({ which, onClose }: { which: number | 'grand'; onClose(): void }) {
  const { history, profile } = useData();
  useEffect(() => { sFanfare(); confetti(); }, []);
  const dips = computeStats(history).dips;
  const name = <div className="cn">{profile.name || 'Champion des tables'}</div>;

  let body;
  if (which === 'grand') {
    const got = dips.filter((x): x is Diploma => !!x);
    const tb = got.filter(x => x.mention === 3).length;
    body = (
      <>
        <div className="ct">👑</div><div className="ch">GRAND DIPLÔME</div><div className="cs">de Maître des Tables</div>
        <div className="cx">décerné à</div>{name}
        <div className="cx">pour avoir réussi les examens des 10 tables de multiplication</div>
        <div className="cm" style={{ color: '#7c3aed' }}>{tb} mention{tb > 1 ? 's' : ''} Très Bien</div>
        <div className="cd">le {fmt(Math.max(...got.map(x => x.ts)))}</div><div className="seal">🏅</div>
      </>
    );
  } else {
    const d = dips[which];
    if (!d) return null;
    body = (
      <>
        <div className="ct">🎓</div><div className="ch">DIPLÔME</div><div className="cs">de la table de {which}</div>
        <div className="cx">décerné à</div>{name}
        <div className="cx">{"pour avoir réussi l'examen avec la mention"}</div>
        <div className="cm" style={{ color: MENTION_COLOR[d.mention] }}>{MENTIONS[d.mention].medal} {MENTIONS[d.mention].name}</div>
        <div className="cd">le {fmt(d.ts)}</div><div className="seal">🏅</div>
      </>
    );
  }
  return (
    <Modal onClose={onClose}>
      <div className="cert"><div className="cert-in">{body}</div></div>
      {!profile.name && <p style={{ fontSize: 14, margin: '12px 0 0' }}>{"Écris ton prénom dans la page Diplômes pour qu'il apparaisse ici."}</p>}
      <div className="btns" style={{ marginTop: 14 }}><button className="big alt" onClick={onClose}>Fermer</button></div>
    </Modal>
  );
}
