'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { playHref, type PlayOpts, type RunResult } from '@/lib/game/engine';
import { MENTIONS, type Badge, type LevelInfo, type NextBadge } from '@/lib/game/rules';
import { practiceBonus, type hatchProgress } from '@/lib/pet/rules';
import { ensureAudio } from '@/lib/sound';
import Certificate from './Certificate';
import { BadgeLine, Stars, Stat } from './ui';

export interface PetInfo {
  coins: number; chest: boolean;
  egg: ReturnType<typeof hatchProgress>;
  /** The companion, and whether this game made it grow (not when it is sad) */
  comp: { name: string; grew: boolean } | null;
}
export interface Result extends RunResult {
  isRecord: boolean; levelUp: boolean; xpGain: number;
  lvBefore: LevelInfo; lvAfter: LevelInfo; newBadges: Badge[]; next: NextBadge | null; pet: PetInfo;
}

const CHEERS = ['Continue, tu vas y arriver !', 'Bien joué !', 'Super fort !', 'Champion des tables !'];

export default function EndScreen({ r, opts }: { r: Result; opts: PlayOpts }) {
  const router = useRouter();
  const [cert, setCert] = useState(false);
  // The XP bar starts where it was and fills up
  const [xpW, setXpW] = useState(r.levelUp ? 0 : r.lvBefore.pct);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setXpW(r.lvAfter.pct)));
    return () => cancelAnimationFrame(id);
  }, [r]);

  const { rec, lvAfter: lv } = r;
  const isExam = rec.mode === 'exam';
  const go = (o: PlayOpts) => { ensureAudio(); router.push(playHref(o)); };
  const n = r.newBadges.length;

  return (
    <section className="screen">
      {isExam ? (r.passed ? (
        <><div className="bigemo">🎓</div>
          <p className="msg">Diplôme de la table de {r.table} !<br />{MENTIONS[r.mention].medal} Mention {MENTIONS[r.mention].name}</p></>
      ) : (
        <><div className="bigemo">💪</div>
          <p className="msg">Pas encore cette fois…<br />
            <small style={{ fontSize: 18, opacity: 0.85 }}>{r.examErrors > 2 ? 'Plus de 2 erreurs' : 'Le temps est écoulé'}. Tu peux réessayer !</small></p></>
      )) : (
        <><div className="stars"><Stars n={rec.stars} /></div><p className="msg">{CHEERS[rec.stars]}</p></>
      )}
      {r.isRecord && <div className="banner">🏆 Nouveau record !</div>}
      {r.levelUp && <div className="banner lvl">⬆️ Niveau {lv.num} : {lv.cur.emoji} {lv.cur.name} !</div>}
      {r.pet.chest && <Link href="/nid" className="banner chest">🎁 Tu as trouvé un coffre ! Va l’ouvrir au nid.</Link>}

      <div className="stats">
        {isExam ? (
          <><Stat v={`${rec.correct}/20`} l="bonnes réponses" /><Stat v={r.examErrors} l={r.examErrors > 1 ? 'erreurs' : 'erreur'} /></>
        ) : (
          <><Stat v={rec.score} l="points" /><Stat v={`${rec.correct}/${rec.total}`} l="bonnes réponses" /></>
        )}
        <Stat v={rec.bestStreak} l="meilleure série" />
      </div>

      <div className="panel">
        <div className="xpgain">
          <span className="gain">+{r.xpGain} XP</span>
          <div className="pinfo">
            <div className="plvl">Niveau {lv.num} · {lv.cur.emoji} {lv.cur.name}</div>
            <div className="xpbar"><div style={{ width: xpW + '%' }} /></div>
            <div className="xptxt">{lv.into} / {lv.need} XP</div>
          </div>
        </div>
        <div className="petgain">
          <span className="gain">+{r.pet.coins} 🪙</span>
          {r.pet.comp ? (
            <Link href="/compagnon" className="pinfo">{r.pet.comp.grew ? `${r.pet.comp.name} a grandi de ${rec.correct} !` : `😢 ${r.pet.comp.name} est triste et n'a pas grandi. Occupe-toi de lui !`}</Link>
          ) : r.pet.egg ? (
            <Link href="/nid" className="pinfo">{r.pet.egg.ready ? '🥚 Ton œuf va éclore !' : `🥚 Œuf : ${r.pet.egg.done} / ${r.pet.egg.need}`}</Link>
          ) : <Link href="/compagnon" className="pinfo">Dépense tes pièces pour ton compagnon !</Link>}
        </div>
        {practiceBonus({ ...rec, id: '' }) > 0 && (
          <p className="bonus-line">🔧 Bonus entraînement : +{practiceBonus({ ...rec, id: '' })} 🪙{rec.correct === rec.total ? ' (sans faute !)' : ''}</p>
        )}
        {r.pet.comp && r.pet.egg && (
          <Link href="/nid" className="egg-line">
            <span>🥚</span><div className="xpbar"><div style={{ width: r.pet.egg.pct + '%' }} /></div>
            <small>{r.pet.egg.ready ? 'Prêt à éclore !' : `${r.pet.egg.done} / ${r.pet.egg.need}`}</small>
          </Link>
        )}
      </div>

      <div className="panel">
        <h2>{n > 1 ? `${n} nouveaux badges !` : n ? 'Nouveau badge !' : 'Prochain badge'}</h2>
        {n ? (
          <>{r.newBadges.slice(0, 6).map(b => <BadgeLine key={b.id} b={b} />)}
            {n > 6 && <p className="bnum">… et {n - 6} autres !</p>}</>
        ) : r.next ? <BadgeLine b={r.next.b} pr={r.next} /> : <p>Tu as tout gagné ! 🎉</p>}
      </div>

      <div className="spacer" />
      <div className="btns">
        {isExam ? (
          <>
            {r.passed && <button className="big green" onClick={() => setCert(true)}>Voir mon diplôme</button>}
            <button className={r.passed ? 'big alt' : 'big'} onClick={() => go(opts)}>
              {r.passed && r.mention < 3 ? 'Viser la mention Très Bien' : "Repasser l'examen"}
            </button>
            <div className="btnrow">
              <Link className="big alt" href="/diplomes">← Retour</Link>
              <Link className="big alt" href="/">🏠 Accueil</Link>
            </div>
          </>
        ) : (
          <>
            {r.errs.length > 0 && (
              <button className="big alt" onClick={() => go({ mode: 'practice', pool: r.errs.map(({ a, b }) => ({ a, b })) })}>
                {"S'entraîner sur mes erreurs"}
              </button>
            )}
            <div className="btnrow">
              <button className="big" onClick={() => go(opts)}>🔁 Rejouer</button>
              <Link className="big alt" href={opts.mode === 'practice' ? '/' : '/partie'}>← Retour</Link>
            </div>
            <Link className="big alt" href="/">🏠 Accueil</Link>
          </>
        )}
      </div>
      {cert && <Certificate which={r.table} onClose={() => setCert(false)} />}
    </section>
  );
}
