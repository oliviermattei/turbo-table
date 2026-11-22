'use client';
import { creatureSrc, usePet } from '@/components/pet';
import { BackHeader, RarLabel } from '@/components/ui';
import { RARITY_ORDER } from '@/lib/game/rules';
import { isReady, setActive, stageOf } from '@/lib/pet/rules';
import { SPECIES } from '@/lib/pet/species';

export default function BestiairePage() {
  const { pet, debug, updatePet } = usePet();
  const activeSpecies = pet?.creatures.find(c => c.id === pet.activeId)?.species;
  // Tapping a species you own makes its most grown creature the companion
  const choose = (species: string) => {
    const mine = pet?.creatures.filter(c => c.species === species).sort((a, b) => b.xp - a.xp)[0];
    if (mine) updatePet(p => p && setActive(p, mine.id, Date.now()));
  };
  const best: Record<string, number> = {};
  pet?.creatures.forEach(c => { best[c.species] = Math.max(best[c.species] ?? 0, Math.min(stageOf(c.xp), c.shown)); });
  // Test mode: every species with its images counts as found, shown at its final stage
  if (debug) SPECIES.filter(isReady).forEach(s => { best[s.id] = 3; });
  const found = Object.keys(best).length;

  return (
    <section className="screen">
      <BackHeader title="Bestiaire" />
      <p className="sub">{found} / {SPECIES.length} créatures trouvées</p>
      {pet && pet.creatures.length > 1 && <p className="note center">Touche une de tes créatures pour en faire ton compagnon.</p>}
      {RARITY_ORDER.map(q => (
        <div key={q}>
          <h3 className="sect"><RarLabel r={q} /></h3>
          <div className="bestgrid">
            {SPECIES.filter(s => s.q === q).map(s => {
              const got = s.id in best, ready = isReady(s);
              return (
                <div key={s.id} className={'bestc' + (got ? ' got' : '') + (s.id === activeSpecies ? ' on' : '')} onClick={() => choose(s.id)}>
                  {/* Not found yet: its shadow image only, never the creature itself (a long press would show it in full) */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- static sprites */}
                  {ready ? <img className={got ? '' : 'silhouette'} src={got ? creatureSrc(s.id, best[s.id]) : `/creatures/${s.id}/ombre.webp`} alt={got ? s.name : 'Créature inconnue'} draggable={false} />
                    : <span className="unknown">❓</span>}
                  <small>{s.id === activeSpecies ? '⭐ ' : ''}{got ? s.name : ready ? '???' : 'Bientôt'}</small>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
