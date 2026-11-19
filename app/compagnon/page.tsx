'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { CreatureView, Coins, GrowBar, ItemIcon, NeedBars, type Action } from '@/components/pet';
import { useEnsurePet } from '@/components/pet-ensure';
import { EvolutionScene } from '@/components/pet-scenes';
import { BackHeader, RarLabel } from '@/components/ui';
import { ITEM_BY_ID, ITEMS, markShown, rename, sleep, stageOf, STAGE_NAMES, useItem as giveItem, hatchProgress } from '@/lib/pet/rules';
import { SPECIES_BY_ID } from '@/lib/pet/species';

export default function CompagnonPage() {
  const { pet, updatePet, companion: c, coins, correct } = useEnsurePet();
  const [action, setAction] = useState<Action>(null);
  const [evo, setEvo] = useState(false);
  const seq = useRef(0); // restarts the one-shot animations
  if (!pet) return null;

  const chests = pet.eggs.filter(e => !e.opened).length;
  const inc = hatchProgress(pet, correct);
  const play = (a: NonNullable<Action>) => { setAction(a); setTimeout(() => setAction(cur => (cur?.key === a.key ? null : cur)), a.kind === 'sleep' ? 3500 : 2200); };
  const give = (id: string) => {
    updatePet(p => p && giveItem(p, id, Date.now()));
    play({ kind: ITEM_BY_ID[id].kind === 'food' ? 'eat' : 'play', item: id, key: ++seq.current });
  };
  const nap = () => { updatePet(p => p && sleep(p, Date.now())); play({ kind: 'sleep', key: ++seq.current }); };
  const inv = ITEMS.filter(i => pet.inventory[i.id]);
  const sp = c && SPECIES_BY_ID[c.species];
  const canEvolve = c && stageOf(c.xp) > c.shown;

  return (
    <section className="screen">
      <BackHeader title="Compagnon" />
      <div className="petbar"><Coins n={coins} /></div>

      {c && sp ? (
        <>
          <div className="petstage" onClick={() => canEvolve && setEvo(true)}>
            <CreatureView c={c} size={230} action={action} />
            {canEvolve && <div className="evo-hint">✨ Touche-le, il va évoluer !</div>}
          </div>
          <div className="petname">
            <b>{c.name}</b>
            <button className="icon-btn small" aria-label="Renommer" onClick={() => {
              const n = window.prompt('Comment veux-tu l’appeler ?', c.name);
              if (n) updatePet(p => p && rename(p, c.id, n));
            }}>✏️</button>
          </div>
          <p className="sub">{sp.name} · {STAGE_NAMES[Math.min(stageOf(c.xp), c.shown)]} · <RarLabel r={sp.q} /></p>
          <div className="panel">
            <NeedBars n={c.needs} />
            <GrowBar c={c} />
          </div>
          <div className="panel">
            <h2>Sac</h2>
            {inv.length ? (
              <div className="inv">
                {inv.map(i => (
                  <button key={i.id} className="invb" onClick={() => give(i.id)}>
                    <ItemIcon id={i.id} /><span className="ct">×{pet.inventory[i.id]}</span>
                  </button>
                ))}
              </div>
            ) : <p className="note">Ton sac est vide. Va à la boutique !</p>}
            <button className="ghost" onClick={nap}>💤 Faire dormir (gratuit)</button>
          </div>
        </>
      ) : (
        <div className="panel center">
          <h2>{inc ? 'Ton œuf couve…' : 'Ton premier compagnon t’attend !'}</h2>
          <p className="note">
            {inc ? `Encore ${inc.need - inc.done} bonnes réponses pour qu'il éclose.`
              : chests ? 'Ouvre ton coffre dans le nid.' : 'Va au nid pour choisir un œuf.'}
          </p>
          <Link className="big" href="/nid">🥚 Aller au nid</Link>
        </div>
      )}

      <div className="spacer" />
      <div className="nav four">
        <Link className="navb" href="/boutique"><span className="ic">🛒</span><span className="lb">Boutique</span></Link>
        <Link className="navb" href="/nid"><span className="ic">🥚</span><span className="lb">Nid</span><span className="ct">{chests ? `${chests} 🎁` : inc?.ready ? 'Prêt !' : ''}</span></Link>
        <Link className="navb" href="/refuge"><span className="ic">🏡</span><span className="lb">Refuge</span><span className="ct">{pet.creatures.length || ''}</span></Link>
        <Link className="navb" href="/bestiaire"><span className="ic">📖</span><span className="lb">Bestiaire</span></Link>
      </div>
      {evo && c && <EvolutionScene c={c} onDone={() => { updatePet(p => p && markShown(p, c.id)); setEvo(false); }} />}
    </section>
  );
}
