'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Certificate from '@/components/Certificate';
import { BackHeader, Modal } from '@/components/ui';
import { useData } from '@/lib/data';
import { playHref } from '@/lib/game/engine';
import { computeStats, MENTIONS } from '@/lib/game/rules';
import { ensureAudio } from '@/lib/sound';

export default function DiplomesPage() {
  const d = useData();
  const router = useRouter();
  const st = useMemo(() => computeStats(d.history), [d.history]);
  const [sheet, setSheet] = useState<number | null>(null);
  const [cert, setCert] = useState<number | 'grand' | null>(null);
  const all = st.dipCount >= 10;
  const dip = sheet !== null ? st.dips[sheet] : null;

  return (
    <section className="screen">
      <BackHeader title="Diplômes" />
      <div className="panel">
        <h2>Prénom écrit sur les diplômes</h2>
        <input
          key={d.profile.name} className="field" placeholder="Ton prénom" maxLength={20} autoComplete="off"
          defaultValue={d.profile.name}
          onBlur={e => d.setName(e.currentTarget.value)}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        />
      </div>
      <p className="rules">
        {"Pour gagner le diplôme d'une table, réussis son examen : "}<b>20 calculs en 60 secondes</b>, avec <b>2 erreurs au maximum</b>.<br />
        0 erreur = 🥇 Très Bien · 1 erreur = 🥈 Bien · 2 erreurs = 🥉 Assez Bien
      </p>
      <div className="dipgrid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => {
          const x = st.dips[t];
          return (
            <button key={t} className={'dip' + (x ? ' m' + x.mention : '')} onClick={() => setSheet(t)}>
              <span className="dt">Table de {t}</span>
              <span className="dm">{x ? MENTIONS[x.mention].medal + ' ' + MENTIONS[x.mention].name : '🔒 À passer'}</span>
            </button>
          );
        })}
      </div>
      <button className={'grand' + (all ? ' on' : '')} onClick={() => { if (all) setCert('grand'); }}>
        <b>👑 Grand diplôme de Maître des Tables</b>
        <small>{all ? 'Touche pour le voir' : `Obtiens les 10 diplômes pour le débloquer (${st.dipCount}/10)`}</small>
      </button>

      {sheet !== null && (
        <Modal onClose={() => setSheet(null)}>
          <h3>Table de {sheet}</h3>
          <p>{dip ? <>Tu as déjà ce diplôme avec la mention <b>{MENTIONS[dip.mention].name}</b> {MENTIONS[dip.mention].medal}</> : "Réussis l'examen pour gagner ce diplôme !"}</p>
          <p style={{ fontSize: 15, opacity: 0.8 }}>20 calculs · 60 secondes · 2 erreurs maximum</p>
          <div className="btns">
            {dip && <button className="big green" onClick={() => { setSheet(null); setCert(sheet); }}>Voir mon diplôme</button>}
            <button className={dip ? 'big alt' : 'big'} onClick={() => { ensureAudio(); router.push(playHref({ mode: 'exam', table: sheet })); }}>
              {dip ? (dip.mention < 3 ? 'Viser une meilleure mention' : "Repasser l'examen") : "Passer l'examen"}
            </button>
            <button className="link" onClick={() => setSheet(null)}>Fermer</button>
          </div>
        </Modal>
      )}
      {cert !== null && <Certificate which={cert} onClose={() => setCert(null)} />}
    </section>
  );
}
