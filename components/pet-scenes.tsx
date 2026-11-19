'use client';
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { confetti } from '@/lib/confetti';
import { RARITY } from '@/lib/game/rules';
import { STAGE_NAMES } from '@/lib/pet/rules';
import type { Hatched } from '@/lib/pet/rules';
import { SPECIES_BY_ID } from '@/lib/pet/species';
import type { Creature, Egg } from '@/lib/pet/types';
import { sFanfare } from '@/lib/sound';
import { ChestImg, creatureSrc, EggImg } from './pet';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

function Scene({ children, onClose, done }: { children: ReactNode; onClose(): void; done: boolean }) {
  return (
    <div className="scene">
      <div className="scene-in">{children}</div>
      {done && <button className="big" onClick={onClose}>Super !</button>}
    </div>
  );
}

const QUALITY_TEXT = (e: Pick<Egg, 'q' | 'species'>) =>
  e.species ? `Œuf de ${SPECIES_BY_ID[e.species]?.name ?? 'légende'} !` : `Œuf ${RARITY[e.q].n} !`;

/** Opening a chest: it shakes, opens, and the egg pops out. */
export function ChestScene({ egg, onOpen, onClose }: { egg: Egg; onOpen(): void; onClose(): void }) {
  const [step, setStep] = useState<'idle' | 'shake' | 'open'>('idle');
  const start = async () => {
    if (step !== 'idle') return;
    setStep('shake'); await wait(1200);
    setStep('open'); onOpen(); sFanfare(); setTimeout(confetti, 200);
  };
  return (
    <Scene onClose={onClose} done={step === 'open'}>
      <div className={'chest-stage ' + step} style={{ '--rc': RARITY[egg.q].c } as CSSProperties} onClick={start}>
        <ChestImg open={step === 'open'} />
        {step === 'open' && <EggImg e={egg} className="eggimg pop-egg" />}
      </div>
      <p className="scene-txt">{step === 'open' ? QUALITY_TEXT(egg) : step === 'idle' ? 'Touche le coffre pour l’ouvrir !' : '…'}</p>
    </Scene>
  );
}

/** Hatching: the egg shakes harder and harder, cracks, flashes, and the creature appears. */
export function HatchScene({ egg, onHatch, onClose }: { egg: Egg; onHatch(): Hatched | null; onClose(): void }) {
  const [step, setStep] = useState<'idle' | 'shake' | 'crack1' | 'crack2' | 'flash' | 'done'>('idle');
  const [out, setOut] = useState<Hatched | null>(null);
  const start = async () => {
    if (step !== 'idle') return;
    setStep('shake'); await wait(900);
    setStep('crack1'); await wait(800);
    setStep('crack2'); await wait(800);
    setStep('flash');
    setOut(onHatch()); await wait(400);
    setStep('done'); sFanfare(); setTimeout(confetti, 100);
  };
  const shown = step === 'done' || step === 'flash';
  return (
    <Scene onClose={onClose} done={step === 'done'}>
      <div className={'hatch-stage ' + step} style={{ '--rc': RARITY[egg.q].c } as CSSProperties} onClick={start}>
        {shown && out ? (
          // eslint-disable-next-line @next/next/no-img-element -- static sprites
          <img className="born-img" src={creatureSrc(out.species.id, 0)} alt={out.species.name} />
        ) : (
          <div className="hatch-egg">
            <EggImg e={egg} />
            {step !== 'idle' && step !== 'shake' && (
              <svg className="cracks" viewBox="0 0 100 130" aria-hidden>
                <polyline points="20,55 32,48 40,60 50,50 60,62 70,52 82,58" />
                {step !== 'crack1' && <polyline points="28,80 38,72 46,84 56,74 66,86 74,76" />}
              </svg>
            )}
          </div>
        )}
      </div>
      <p className="scene-txt">
        {step === 'idle' ? 'Touche l’œuf pour le faire éclore !'
          : step !== 'done' ? '…'
          : !out ? 'Cet œuf n’est pas encore prêt.'
          : out.dup ? `Encore un ${out.species.name} ! Il t'offre ${out.coins} 🪙`
          : `C'est un ${out.species.name} !`}
      </p>
    </Scene>
  );
}

/** Evolution, 5 s: anticipation, white blinking that speeds up with growth jolts, swelling, flash, new stage. */
export function EvolutionScene({ c, onDone }: { c: Creature; onDone(): void }) {
  const [step, setStep] = useState<'idle' | 'run' | 'done'>('idle');
  const [stage, setStage] = useState(c.shown);
  const img = useRef<HTMLImageElement>(null), br = useRef<HTMLDivElement>(null), box = useRef<HTMLDivElement>(null);
  const target = Math.min(3, Math.max(c.shown + 1, 0));
  const start = async () => {
    if (step !== 'idle' || !img.current || !br.current || !box.current) return;
    setStep('run');
    const im = img.current, b = br.current, bx = box.current, t0 = performance.now();
    bx.classList.add('evolving'); b.classList.add('jolt'); im.classList.add('glow');
    b.style.transform = 'scale(1.08, .9)'; await wait(350);
    b.style.transform = 'scale(1)'; await wait(350);
    let d = 320, on = false, s = 0;
    while (performance.now() - t0 < 3200 - d) {
      on = !on; im.classList.toggle('white', on);
      await wait(d); d = Math.max(45, d * 0.82);
      const k = Math.floor((performance.now() - t0 - 700) / 700);
      if (k > s) { s = k; b.style.transform = `scale(${1 + s * 0.06})`; }
    }
    im.classList.add('white'); bx.classList.add('charge');
    b.classList.replace('jolt', 'swell'); b.style.transform = 'scale(1.3)';
    await wait(800);
    bx.classList.add('flash'); await wait(300);
    setStage(target);
    b.classList.remove('swell'); b.style.transform = '';
    bx.classList.remove('charge', 'evolving'); bx.classList.add('born');
    requestAnimationFrame(() => im.classList.remove('white', 'glow'));
    sFanfare(); confetti();
    await wait(700);
    bx.classList.remove('flash', 'born'); b.classList.remove('jolt');
    setStep('done');
  };
  return (
    <Scene onClose={onDone} done={step === 'done'}>
      <div ref={box} className="evo-stage" onClick={start}>
        <div ref={br} className="evo-breath">
          {/* eslint-disable-next-line @next/next/no-img-element -- static sprites */}
          <img ref={img} src={creatureSrc(c.species, stage)} alt={c.name} />
        </div>
      </div>
      <p className="scene-txt">
        {step === 'idle' ? `Quelque chose se passe… Touche ${c.name} !` : step === 'run' ? '…' : `${c.name} est devenu ${STAGE_NAMES[target]} !`}
      </p>
    </Scene>
  );
}
