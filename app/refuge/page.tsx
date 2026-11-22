'use client';
import { creatureSrc, usePet } from '@/components/pet';
import { BackHeader } from '@/components/ui';
import { setActive, stageOf, STAGE_NAMES } from '@/lib/pet/rules';

export default function RefugePage() {
  const { pet, updatePet } = usePet();
  if (!pet) return null;
  return (
    <section className="screen">
      <BackHeader title="Refuge" />
      <p className="sub">Choisis le compagnon dont tu t’occupes. Les autres se reposent ici.</p>
      <div className="bestgrid">
        {pet.creatures.map(c => {
          const s = Math.min(stageOf(c), c.shown), on = c.id === pet.activeId;
          return (
            <button key={c.id} className={'bestc got' + (on ? ' on' : '')} onClick={() => updatePet(p => p && setActive(p, c.id, Date.now()))}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static sprites */}
              <img src={creatureSrc(c.species, s)} alt={c.name} />
              <b>{c.name}</b>
              <small>{on ? '⭐ Compagnon' : STAGE_NAMES[s]}</small>
            </button>
          );
        })}
      </div>
      {!pet.creatures.length && <p className="note">Pas encore de créature. Fais éclore un œuf au nid !</p>}
    </section>
  );
}
