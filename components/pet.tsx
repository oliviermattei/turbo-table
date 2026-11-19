'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useData } from '@/lib/data';
import { computeStats, RARITY, unlocked } from '@/lib/game/rules';
import assets from '@/lib/pet/assets.json';
import { active, balance, decay, hatchProgress, lowestNeed, moodOf, stageOf, STAGES, STAGE_XP, totalCorrect, ITEM_BY_ID } from '@/lib/pet/rules';
import { SPECIES_BY_ID } from '@/lib/pet/species';
import type { Creature, Egg, Needs } from '@/lib/pet/types';

/** Re-renders every `ms` so needs keep decaying on screen */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

/** Everything the pet screens need, derived from history + pet */
export function usePet() {
  const d = useData();
  const now = useNow();
  const badges = useMemo(() => unlocked(computeStats(d.history)), [d.history]);
  const coins = balance(d.history, badges, d.pet);
  const correct = useMemo(() => totalCorrect(d.history), [d.history]);
  const raw = active(d.pet);
  const companion = raw ? decay(raw, now) : null;
  return { ...d, now, badges, coins, correct, companion };
}

export const creatureSrc = (species: string, stage: number, sad = false) =>
  `/creatures/${species}/${STAGES[Math.min(stage, 3)]}${sad ? '-triste' : ''}.webp`;
export const eggSrc = (e: Pick<Egg, 'q' | 'species'>) => (e.species ? `/creatures/${e.species}/oeuf.webp` : `/eggs/${e.q}.webp`);

const NEED_ICON: Record<keyof Needs, string> = { faim: '🍖', joie: '🎾', energie: '💤' };
const NEED_LABEL: Record<keyof Needs, string> = { faim: 'Faim', joie: 'Joie', energie: 'Énergie' };

export type Action = { kind: 'eat' | 'play' | 'sleep'; item?: string; key: number } | null;

/** A creature drawn from its static image, brought to life by CSS (see .crea in globals.css). */
export function CreatureView({ c, size = 200, action, onClick }: { c: Creature; size?: number; action?: Action; onClick?: () => void }) {
  const sp = SPECIES_BY_ID[c.species];
  const mood = moodOf(c.needs);
  const need = lowestNeed(c.needs);
  const stage = Math.min(stageOf(c.xp), c.shown); // the new stage only shows after the evolution scene
  // Random phase so two creatures never move in sync
  const [phase] = useState(() => -Math.random() * 3 + 's');
  const sleeping = action?.kind === 'sleep';
  return (
    <div className={`crea mv-${sp?.move ?? 'sautille'} mood-${mood}${sleeping ? ' sleeping' : ''}${action && !sleeping ? ' act-' + action.kind : ''}`}
      style={{ '--sz': size + 'px', '--d': phase } as CSSProperties} onClick={onClick}>
      <div className="crea-shadow" />
      <div className="crea-mover"><div className="crea-breath">
        {/* eslint-disable-next-line @next/next/no-img-element -- static sprites, already sized WebP */}
        <img src={creatureSrc(c.species, stage, mood === 'triste')} alt={c.name} draggable={false} />
      </div></div>
      {mood === 'triste' && <span className="crea-fx tear">💧</span>}
      {/* eslint-disable-next-line @next/next/no-img-element -- static sprites */}
      {sleeping && ITEM_FILES.includes('lit') && <img className="crea-bed" src="/items/lit.webp" alt="" />}
      {sleeping && <span key={action.key} className="crea-fx zzz">Z</span>}
      {!action && need && mood !== 'triste' && <span className="crea-fx bubble">{NEED_ICON[need]}</span>}
      {action?.item && <span key={action.key} className={'crea-item ' + action.kind}><ItemIcon id={action.item} /></span>}
      {action && !sleeping && <span key={'h' + action.key} className="crea-fx hearts">❤️</span>}
    </div>
  );
}

export function NeedBars({ n }: { n: Needs }) {
  return (
    <div className="needs">
      {(Object.keys(NEED_ICON) as (keyof Needs)[]).map(k => (
        <div key={k} className="need">
          <span>{NEED_ICON[k]}</span>
          <div className="needbar"><div className={n[k] < 30 ? 'low' : ''} style={{ width: n[k] + '%' }} /></div>
          <small>{NEED_LABEL[k]}</small>
        </div>
      ))}
    </div>
  );
}

/** Growth towards the next stage */
export function GrowBar({ c }: { c: Creature }) {
  const s = stageOf(c.xp);
  if (s >= 3) return <p className="grow">⭐ Forme finale atteinte !</p>;
  const from = STAGE_XP[s], to = STAGE_XP[s + 1];
  const sad = moodOf(c.needs) === 'triste';
  return (
    <div className="grow">
      <div className="xpbar"><div style={{ width: ((c.xp - from) / (to - from)) * 100 + '%' }} /></div>
      <small>{sad ? '🔒 Il est triste, occupe-toi de lui !' : `${c.xp - from} / ${to - from} pour grandir`}</small>
    </div>
  );
}

const ITEM_FILES = assets.items as string[];
export function ItemIcon({ id }: { id: string }) {
  const it = ITEM_BY_ID[id];
  // eslint-disable-next-line @next/next/no-img-element -- static sprites
  if (ITEM_FILES.includes(id)) return <img className="itemimg" src={`/items/${id}.webp`} alt={it?.n ?? id} />;
  return <span className="itememo">{it?.e ?? '❓'}</span>;
}

export function EggImg({ e, className = 'eggimg' }: { e: Pick<Egg, 'q' | 'species'>; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- static sprites
  return <img className={className} src={eggSrc(e)} alt="Œuf" style={{ '--rc': RARITY[e.q].c } as CSSProperties} />;
}

export const ChestImg = ({ open = false }: { open?: boolean }) =>
  // eslint-disable-next-line @next/next/no-img-element -- static sprites
  <img className="chestimg" src={`/items/coffre-${open ? 'ouvert' : 'ferme'}.webp`} alt="Coffre" />;

export const Coins = ({ n }: { n: number }) => <span className="coins">🪙 {n}</span>;

/** What the companion says on the home screen */
function speech(c: Creature) {
  const mood = moodOf(c.needs);
  if (mood === 'triste') return 'Je suis triste… Occupe-toi de moi !';
  const need = lowestNeed(c.needs);
  if (need === 'faim') return 'J’ai un petit creux ! 🍖';
  if (need === 'joie') return 'On joue ensemble ? 🎾';
  if (need === 'energie') return 'Je suis un peu fatigué… 💤';
  return 'Allez, on joue ! Je grandis à chaque bonne réponse ⭐';
}

/** Home screen hero: the companion (or the egg) big, talking */
export function CompanionHero() {
  const { pet, companion: c, correct } = usePet();
  const inc = pet && hatchProgress(pet, correct);
  const chests = pet?.eggs.filter(e => !e.opened).length ?? 0;
  return (
    <Link href={c ? '/compagnon' : '/nid'} className="hero">
      <div className="bubble-say">
        {c ? speech(c)
          : inc ? (inc.ready ? 'Ton œuf va éclore ! Viens vite !' : `Encore ${inc.need - inc.done} bonnes réponses et ton œuf éclot !`)
          : chests ? 'Un coffre t’attend ! Touche-le pour l’ouvrir 🎁' : 'Un compagnon t’attend ! 🥚'}
      </div>
      <div className="hero-art">
        {c ? <CreatureView c={c} size={190} /> : inc ? <EggImg e={inc.egg} className="eggimg hero-egg" /> : <ChestImg />}
      </div>
      {c ? <><b className="hero-name">{c.name}</b><NeedBars n={c.needs} /></>
        : inc ? <div className="xpbar hero-bar"><div style={{ width: inc.pct + '%' }} /></div> : null}
    </Link>
  );
}

/** Test mode only: free coins (stored as bonus, like duplicates; the sandbox never reaches the server) */
export function DebugCoins() {
  const { debug, pet, updatePet } = useData();
  if (!debug || !pet) return null;
  return <button className="ghost debugcoins" onClick={() => updatePet(p => p && { ...p, bonus: p.bonus + 1000 })}>🐞 +1000 🪙 (test)</button>;
}
