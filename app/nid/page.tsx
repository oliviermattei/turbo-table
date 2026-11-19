'use client';
import { useState } from 'react';
import { ChestImg, EggImg } from '@/components/pet';
import { useEnsurePet } from '@/components/pet-ensure';
import { ChestScene, HatchScene } from '@/components/pet-scenes';
import { BackHeader, Progress, RarLabel } from '@/components/ui';
import { hatch, hatchProgress, incubate, openChest, type Hatched } from '@/lib/pet/rules';
import type { Egg } from '@/lib/pet/types';

export default function NidPage() {
  const { pet, updatePet, correct } = useEnsurePet();
  const [chest, setChest] = useState<Egg | null>(null);
  const [hatching, setHatching] = useState<Egg | null>(null);
  if (!pet) return null;

  const chests = pet.eggs.filter(e => !e.opened);
  const waiting = pet.eggs.filter(e => e.opened);
  const inc = hatchProgress(pet, correct);
  const doHatch = (): Hatched | null => {
    // The random draw happens once, here; the result is stored in the pet
    const r = hatch(pet, correct, Date.now(), Math.random());
    if (!r) return null;
    updatePet(() => r.p);
    return r.out;
  };

  return (
    <section className="screen">
      <BackHeader title="Le nid" />

      <div className="panel center">
        <h2>Couveuse</h2>
        {inc ? (
          <div className={'incub' + (inc.ready ? ' ready' : '')} onClick={() => inc.ready && setHatching(inc.egg)}>
            <EggImg e={inc.egg} />
            <RarLabel r={inc.egg.q} />
            {inc.ready ? <b className="ready-txt">Il va éclore ! Touche-le !</b> : (
              <><Progress pct={inc.pct} /><small>{inc.done} / {inc.need} bonnes réponses</small></>
            )}
          </div>
        ) : <p className="note">{waiting.length ? 'Choisis un œuf à couver.' : chests.length ? 'Ouvre un coffre pour trouver un œuf.' : 'Pas d’œuf pour l’instant. Joue pour trouver des coffres !'}</p>}
      </div>

      {chests.length > 0 && (
        <div className="panel">
          <h2>Coffres à ouvrir</h2>
          <div className="eggrow">
            {chests.map(e => <button key={e.id} className="eggb" onClick={() => setChest(e)}><ChestImg /></button>)}
          </div>
        </div>
      )}

      {waiting.length > 0 && (
        <div className="panel">
          <h2>Œufs qui attendent</h2>
          <div className="eggrow">
            {waiting.map(e => (
              <div key={e.id} className="eggb">
                <EggImg e={e} />
                <RarLabel r={e.q} />
                {!inc && <button className="chip on small" onClick={() => updatePet(p => p && incubate(p, e.id, correct))}>Couver</button>}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="note">Chaque bonne réponse fait avancer l’œuf qui couve. On trouve des coffres en jouant, avec les grands badges, ou à la boutique.</p>

      {chest && <ChestScene egg={chest} onOpen={() => updatePet(p => p && openChest(p, chest.id, correct))} onClose={() => setChest(null)} />}
      {hatching && <HatchScene egg={hatching} onHatch={doHatch} onClose={() => setHatching(null)} />}
    </section>
  );
}
