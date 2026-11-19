'use client';
import { creatureSrc, usePet } from '@/components/pet';
import { BackHeader, RarLabel } from '@/components/ui';
import { RARITY_ORDER } from '@/lib/game/rules';
import { isReady, stageOf } from '@/lib/pet/rules';
import { SPECIES } from '@/lib/pet/species';

export default function BestiairePage() {
  const { pet } = usePet();
  const best: Record<string, number> = {};
  pet?.creatures.forEach(c => { best[c.species] = Math.max(best[c.species] ?? 0, Math.min(stageOf(c.xp), c.shown)); });
  const found = Object.keys(best).length;

  return (
    <section className="screen">
      <BackHeader title="Bestiaire" />
      <p className="sub">{found} / {SPECIES.length} créatures trouvées</p>
      {RARITY_ORDER.map(q => (
        <div key={q}>
          <h3 className="sect"><RarLabel r={q} /></h3>
          <div className="bestgrid">
            {SPECIES.filter(s => s.q === q).map(s => {
              const got = s.id in best, ready = isReady(s);
              return (
                <div key={s.id} className={'bestc' + (got ? ' got' : '')}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static sprites */}
                  {ready ? <img className={got ? '' : 'silhouette'} src={creatureSrc(s.id, got ? best[s.id] : 0)} alt={got ? s.name : 'Créature inconnue'} />
                    : <span className="unknown">❓</span>}
                  <small>{got ? s.name : ready ? '???' : 'Bientôt'}</small>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
