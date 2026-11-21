'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BackHeader, Stars, Stat } from '@/components/ui';
import { useData } from '@/lib/data';
import { playHref } from '@/lib/game/engine';
import { MENTIONS } from '@/lib/game/rules';
import type { GameRecord } from '@/lib/game/types';
import { ensureAudio } from '@/lib/sound';

function dateOf(ts: number) {
  const d = new Date(ts);
  const s = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Row({ g }: { g: GameRecord }) {
  if (g.mode === 'exam') {
    const res = g.passed ? `${MENTIONS[g.mention ?? 0].medal} ${MENTIONS[g.mention ?? 0].name}` : 'pas réussi';
    return (
      <div className="hrow">
        <div><div className="d">{dateOf(g.ts)}</div><div className="t">🎓 Examen table de {g.examTable} · {res}</div></div>
        <div className="r"><div className="sc">{g.passed ? '🎓' : '–'}</div><div className="mini">{g.correct}/20</div></div>
      </div>
    );
  }
  const tabs = g.tables.length >= 10 ? 'toutes les tables' : (g.tables.length > 1 ? 'tables ' : 'table ') + g.tables.join(', ');
  return (
    <div className="hrow">
      <div><div className="d">{dateOf(g.ts)}</div><div className="t">{g.mode === 'practice' ? '🔧 Entraînement sur les erreurs' : `${tabs} · ${g.duration} s`}</div></div>
      <div className="r"><div className="sc">{g.score}</div><div className="mini">{g.correct}/{g.total} <Stars n={g.stars} /></div></div>
    </div>
  );
}

export default function HistoriquePage() {
  const d = useData();
  const router = useRouter();
  const games = d.history;
  const best = games.filter(g => g.mode === 'normal').reduce((m, g) => Math.max(m, g.score), 0);
  const tc = games.reduce((s, g) => s + g.correct, 0), tt = games.reduce((s, g) => s + g.total, 0);

  const agg = new Map<string, { a: number; b: number; n: number }>();
  games.forEach(g => g.errors.forEach(e => {
    const k = e.a + 'x' + e.b, o = agg.get(k) || { a: e.a, b: e.b, n: 0 };
    o.n += e.n; agg.set(k, o);
  }));
  const top = [...agg.values()].sort((x, y) => y.n - x.n).slice(0, 8);

  return (
    <section className="screen">
      <BackHeader title="Historique" />
      <div className="stats">
        <Stat v={games.length} l={games.length > 1 ? 'parties' : 'partie'} />
        <Stat v={best} l="meilleur score" />
        <Stat v={tt ? Math.round(tc * 100 / tt) + ' %' : '–'} l="de réussite" />
      </div>
      {top.length > 0 && (
        <div className="panel">
          <h2>Calculs les plus ratés</h2>
          <div className="errs">{top.map(e => <span key={e.a + 'x' + e.b} className="err">{e.a} × {e.b} = {e.a * e.b}<small>{e.n} fois</small></span>)}</div>
          <button className="ghost" onClick={() => { ensureAudio(); router.push(playHref({ mode: 'practice', pool: top.map(({ a, b }) => ({ a, b })) })); }}>
            {"S'entraîner sur ces calculs"}
          </button>
        </div>
      )}
      {games.length ? games.slice(0, 100).map(g => <Row key={g.id} g={g} />)
        : <p className="empty">{"Aucune partie pour l'instant."}<br />Lance-toi !</p>}
      <p className="note">
        {d.sync === 'cloud' ? 'Progression enregistrée sur le serveur : la même sur tous tes appareils.' : 'Progression enregistrée sur cet appareil.'}
      </p>
      {d.sync === 'locked' && <FamilyCode />}
      <Link className="ghost center-link" href="/journal">📒 Journal des gains (parents)</Link>
      <ResetProgress />
      {process.env.NODE_ENV !== 'production' && (
        <label className="debugbox">
          <input type="checkbox" checked={d.debug} onChange={e => d.setDebug(e.target.checked)} /> 🐞 Mode test (dev) : appareil isolé, rien n’est envoyé au serveur
        </label>
      )}
    </section>
  );
}

/** For the parent: starts again from zero everywhere (games and companion archived on the server). */
function ResetProgress() {
  const { resetAll } = useData();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  if (!open) return <button className="ghost" onClick={() => setOpen(true)}>♻️ Remettre la progression à zéro (parents)</button>;
  return (
    <form className="panel" style={{ marginTop: 12 }} onSubmit={async e => {
      e.preventDefault();
      if (!window.confirm('Effacer toute la progression (parties, badges, pièces, compagnon) sur tous les appareils ? Le prénom est gardé.')) return;
      const r = await resetAll(code);
      setMsg(r === 'ok' ? 'C’est fait : tout recommence à zéro.' : r === 'blocked' ? 'Trop d’essais. Réessaie dans 1 heure.' : r === 'offline' ? 'Pas de connexion au serveur.' : 'Code incorrect.');
      if (r === 'ok') { setCode(''); setOpen(false); }
    }}>
      <h2>Remettre à zéro</h2>
      <p className="note">Les parties et le compagnon sont mis de côté sur le serveur, puis effacés de chaque appareil à sa prochaine ouverture.</p>
      <input className="field" type="password" placeholder="Code famille" autoComplete="current-password" value={code} onChange={e => setCode(e.target.value)} />
      {msg && <p className="note">{msg}</p>}
      <button className="ghost" type="submit">Tout remettre à zéro</button>
      <button className="ghost" type="button" onClick={() => setOpen(false)}>Annuler</button>
    </form>
  );
}

/** For the parent: links this device to the server once (cookie kept ~1 year). */
function FamilyCode() {
  const { unlock } = useData();
  const [code, setCode] = useState('');
  const [error, setError] = useState<'' | 'bad' | 'blocked'>('');
  return (
    <form className="panel" style={{ marginTop: 12 }} onSubmit={async e => { e.preventDefault(); const r = await unlock(code); setError(r === 'ok' ? '' : r); }}>
      <h2>Synchroniser cet appareil</h2>
      <input className="field" type="password" placeholder="Code famille" autoComplete="current-password" value={code} onChange={e => setCode(e.target.value)} />
      {error && <p className="note">{error === 'blocked' ? 'Trop d’essais. Réessaie dans 1 heure.' : 'Code incorrect.'}</p>}
      <button className="ghost" type="submit">Valider</button>
    </form>
  );
}
