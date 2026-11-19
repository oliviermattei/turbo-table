'use client';
import { useState } from 'react';
import { ChestImg, EggImg } from '@/components/pet';
import { useEnsurePet } from '@/components/pet-ensure';
import { ChestScene, HatchScene } from '@/components/pet-scenes';
import { BackHeader, Progress, RarLabel } from '@/components/ui';
import { RARITY_ORDER } from '@/lib/game/rules';
import { hatch, hatchProgress, incubate, openChest, type Hatched } from '@/lib/pet/rules';
import type { Egg } from '@/lib/pet/types';

export default function NidPage() {
  const { pet, updatePet, correct } = useEnsurePet();
  const [chest, setChest] = useState<Egg | null>(null);
  const [hatching, setHatching] = useState<Egg | null>(null);
  if (!pet) return null;

  const chests = pet.eggs.filter(e => !e.opened);
  const waiting = pet.eggs.filter(e => e.opened);
  // Same-looking eggs are stacked: one tile per quality (a legendary egg per species)
  const groups = new Map<string, Egg[]>(); // not Map.groupBy: older tablets lack it
  waiting.forEach(e => { const k = e.q + ':' + (e.species ?? ''); groups.set(k, [...(groups.get(k) ?? []), e]); });
  const stacks = [...groups.values()]
    .sort((a, b) => RARITY_ORDER.indexOf(a[0].q) - RARITY_ORDER.indexOf(b[0].q));
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
            {([undefined, 'epique', 'legendaire'] as const).map(box => {
              const list = chests.filter(e => e.box === box);
              return list.length > 0 && (
                <button key={box ?? 'base'} className="eggb" onClick={() => setChest(list[0])}>
                  <ChestImg box={box} />
                  {list.length > 1 && <span className="stackct">×{list.length}</span>}
                  {box && <RarLabel r={box} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {waiting.length > 0 && (
        <div className="panel">
          <h2>Œufs qui attendent</h2>
          <div className="eggrow">
            {stacks.map(s => (
              <div key={s[0].id} className="eggb">
                <EggImg e={s[0]} />
                {s.length > 1 && <span className="stackct">×{s.length}</span>}
                <RarLabel r={s[0].q} />
                {!inc && <button className="chip on small" onClick={() => updatePet(p => p && incubate(p, s[0].id, correct))}>Couver</button>}
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
