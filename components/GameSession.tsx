'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { confetti } from '@/lib/confetti';
import { useData } from '@/lib/data';
import { createEngine, fakeRun, type PlayOpts, type RunResult, type View } from '@/lib/game/engine';
import { BADGE_BY_ID, bestFor, computeStats, levelInfo, nextBadge, RARITY_ORDER, totalXp, unlocked } from '@/lib/game/rules';
import { active, coinsEarned, companionBonus, decay, dropsEgg, hatchProgress, moodOf, totalCorrect } from '@/lib/pet/rules';
import { ensureAudio, sEnd, sFanfare, sGo, sTick } from '@/lib/sound';
import EndScreen, { type PetInfo, type Result } from './EndScreen';

type Engine = ReturnType<typeof createEngine>;
const COUNT = ['3', '2', '1', 'Go !'];

/** One game, from the countdown to the end screen. Mounted with a new key for every start. */
export default function GameSession({ opts, fake = false }: { opts: PlayOpts; fake?: boolean }) {
  const data = useData();
  const router = useRouter();
  const engine = useRef<Engine | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [count, setCount] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const onFinish = useEffectEvent((r: RunResult) => {
    const before = data.history;
    const stBefore = computeStats(before), lvBefore = levelInfo(totalXp(before)), badgesBefore = unlocked(stBefore);
    const dipBefore = r.rec.mode === 'exam' ? stBefore.dips[r.table] : null;
    const isRecord = r.rec.mode === 'normal' && r.rec.score > 0 && r.rec.score > bestFor(before, r.rec.duration);
    const after = data.saveGame(r.rec);
    const stAfter = computeStats(after), lvAfter = levelInfo(totalXp(after));
    const badgesAfter = unlocked(stAfter);
    const newBadges = [...badgesAfter].filter(id => !badgesBefore.has(id)).map(id => BADGE_BY_ID[id])
      .sort((x, y) => RARITY_ORDER.indexOf(y.r) - RARITY_ORDER.indexOf(x.r));
    const levelUp = lvAfter.num > lvBefore.num;
    const pet = data.pet, comp = active(pet), now = Date.now();
    const grew = !!comp && moodOf(decay(comp, now).needs) !== 'triste';
    const compBonus = comp && grew ? companionBonus(after[0], comp.species) : 0;
    const petInfo: PetInfo = {
      coins: coinsEarned(after, badgesAfter) - coinsEarned(before, badgesBefore) + compBonus,
      compBonus,
      chest: !!pet && dropsEgg(after[0]),
      egg: pet ? hatchProgress(pet, totalCorrect(after)) : null,
      comp: comp ? { name: comp.name, grew } : null,
    };
    const newDiploma = r.passed && (!dipBefore || r.mention > dipBefore.mention);
    setResult({
      ...r, isRecord, levelUp, lvBefore, lvAfter, newBadges, pet: petInfo,
      xpGain: lvAfter.xp - lvBefore.xp, next: newBadges.length ? null : nextBadge(stAfter),
    });
    window.scrollTo(0, 0);
    sEnd();
    if (levelUp || newDiploma || newBadges.length || r.rec.stars === 3) { sFanfare(); setTimeout(confetti, 300); }
    if (newBadges.some(b => b.r === 'legendaire')) setTimeout(confetti, 1200);
  });
  const settings = useEffectEvent(() => ({ tables: data.tables, duration: data.duration }));

  // Countdown, then the game loop
  useEffect(() => {
    if (result) return; // coming back to a finished game: keep its end screen
    const { tables, duration } = settings();
    if (fake) { // test mode: straight to the end screen of a won game
      const t = setTimeout(() => onFinish(fakeRun(tables, duration)));
      return () => clearTimeout(t);
    }
    const e = createEngine(opts, tables, duration, { view: setView, finish: r => onFinish(r) });
    engine.current = e;
    e.publish();
    ensureAudio();
    let i = 0, t: ReturnType<typeof setTimeout> | undefined;
    const step = () => {
      if (i < COUNT.length) {
        setCount(COUNT[i]);
        if (i === 3) sGo(); else sTick();
        i++;
        t = setTimeout(step, i === 4 ? 500 : 750);
      } else {
        setCount(null);
        e.start();
      }
    };
    step();
    return () => { clearTimeout(t); e.stop(); };
  }, [opts, result, fake]);

  // Keys 1 to 4 pick an answer on a computer
  useEffect(() => {
    if (result) return;
    const onKey = (ev: KeyboardEvent) => { const i = '1234'.indexOf(ev.key); if (i >= 0) engine.current?.answerIndex(i); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [result]);

  if (result) return <EndScreen r={result} opts={opts} />;
  if (!view) return null;

  const exam = opts.mode === 'exam';
  const { current: cur, fb } = view;
  const secs = Math.ceil(view.left / 1000);
  const choiceClass = (c: number) => {
    if (!fb || !cur) return 'choice';
    if (c === fb.picked) return fb.good ? 'choice right' : 'choice wrong';
    if (fb.good) return 'choice';
    return c === cur.ans ? 'choice right' : 'choice dim';
  };

  return (
    <section className="screen">
      {opts.mode !== 'normal' && (
        <div className="exam-tag">{exam ? `🎓 Examen de la table de ${opts.table}` : '🔧 Entraînement sur les erreurs'}</div>
      )}
      <div className="hud">
        <span className="pill">{exam ? `${Math.min(view.examShown, 20)}/20` : view.score}</span>
        <span className={'streak' + (exam || view.streak >= 3 ? ' show' : '')}>{exam ? `❌ ${view.examErrors}/2` : '🔥 ' + view.streak}</span>
        <span className="pill">{secs}</span>
      </div>
      <div className="bar"><div className={secs <= 10 ? 'low' : ''} style={{ width: Math.min(100, view.left / (view.duration * 10)) + '%' }} /></div>
      <div className={'card' + (fb ? (fb.good ? ' good' : ' bad') : '')}>
        {fb?.good && <div key={view.plusKey} className="plus pop">+{fb.pts}</div>}
        <div className="q">{cur ? `${cur.a} × ${cur.b}` : '…'}</div>
        <div className="a">
          {!fb || !cur ? <span className="ph">?</span> : fb.good ? cur.ans : <><s>{fb.picked}</s>{cur.ans}</>}
        </div>
      </div>
      <div className="choices">
        {cur?.choices.map((c, i) => (
          <button key={i} className={choiceClass(c)} onPointerDown={ev => { ev.preventDefault(); engine.current?.answer(c); }}>{c}</button>
        ))}
      </div>
      <button className="link" onClick={() => router.push(exam ? '/diplomes' : '/')}>Arrêter la partie</button>
      {count && <div className="count"><span key={count}>{count}</span></div>}
    </section>
  );
}
