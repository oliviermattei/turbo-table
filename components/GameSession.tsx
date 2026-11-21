'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { confetti } from '@/lib/confetti';
import { useData } from '@/lib/data';
import { createEngine, fakeRun, type PlayOpts, type RunResult, type View } from '@/lib/game/engine';
import { newGameId, settle } from '@/lib/settle';
import { ensureAudio, sEnd, sFanfare, sGo, sTick } from '@/lib/sound';
import EndScreen, { type PetInfo, type Result } from './EndScreen';
import { UiIcon } from './ui';

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
    const s = settle(data.history, data.pet, { ...r.rec, id: newGameId() }, Date.now());
    data.saveGame(s.game, s.pet);
    const levelUp = s.lvAfter.num > s.lvBefore.num, newBadges = s.newBadges;
    const petInfo: PetInfo = {
      coins: s.gains.coins, compBonus: s.gains.compBonus, chest: s.gains.chests.length > 0, egg: s.egg, comp: s.comp,
    };
    const newDiploma = s.newDiploma;
    setResult({
      ...r, isRecord: s.isRecord, levelUp, lvBefore: s.lvBefore, lvAfter: s.lvAfter, newBadges, pet: petInfo,
      xpGain: s.gains.xp, next: s.next, value: s.value,
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
    <section className="screen game">
      {opts.mode !== 'normal' && (
        <div className="exam-tag">{exam ? `🎓 Examen de la table de ${opts.table}` : '🔧 Entraînement sur les erreurs'}</div>
      )}
      <div className="hud">
        <button className="icon-btn small" aria-label="Arrêter la partie" onClick={() => router.push(exam ? '/diplomes' : '/')}>✕</button>
        <span className="pill">{exam ? `📝 ${Math.min(view.examShown, 20)}/20` : <><UiIcon n="etoile" /> {view.score}</>}</span>
        <span className={'streak' + (exam || view.streak >= 3 ? ' show' : '')}>{exam ? `❌ ${view.examErrors}/2` : '🔥 ' + view.streak}</span>
        <span className="pill"><UiIcon n="chrono" /> {secs}</span>
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
      {count && <div className="count"><span key={count}>{count}</span></div>}
    </section>
  );
}
