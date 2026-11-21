'use client';
import { useMemo } from 'react';
import { BackHeader } from '@/components/ui';
import { useData } from '@/lib/data';
import { BADGE_BY_ID, RARITY } from '@/lib/game/rules';
import type { GameRecord, Rarity } from '@/lib/game/types';
import { values, type GameValue } from '@/lib/game/value';
import { ITEM_BY_ID } from '@/lib/pet/rules';
import { SPECIES_BY_ID } from '@/lib/pet/species';
import type { LogEntry } from '@/lib/pet/types';

/**
 * For the parent: what each game brought and how (points, coins, XP, badges, chests), and what the coins bought.
 * Games carry a snapshot of their gains since the rules version 2; older ones are recomputed (without badges).
 */
type Line = { t: number; game?: GameRecord; ev?: LogEntry };

const Q = ({ q }: { q?: Rarity }) => (q ? <b style={{ color: RARITY[q].c }}>{RARITY[q].n}</b> : null);
const time = (t: number) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dayOf = (t: number) => {
  const s = new Date(t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const n2 = (x: number) => x.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const SRC: Record<string, string> = { drop: 'trouvé en jouant', badge: 'badge', shop: 'boutique', pity: 'filet de sécurité', start: 'cadeau de départ' };
const NEED = (v?: [number, number, number]) => (v ? `faim ${v[0]} · joie ${v[1]} · énergie ${v[2]}` : '');

export default function JournalPage() {
  const { history, pet, profile } = useData();
  const vals = useMemo(() => values(history), [history]);
  const days = useMemo(() => {
    const lines: Line[] = [...history.map(g => ({ t: g.ts, game: g })), ...(pet?.log ?? []).map(ev => ({ t: ev.t, ev }))]
      .sort((a, b) => b.t - a.t);
    const by = new Map<string, Line[]>();
    for (const l of lines) { const k = new Date(l.t).toDateString(); by.set(k, [...(by.get(k) ?? []), l]); }
    return [...by.values()];
  }, [history, pet]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ games: history, pet, profile }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `turbo-tables-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="screen">
      <BackHeader title="Journal des gains" />
      <p className="note">
        Pour les parents : ce que chaque partie a rapporté et pourquoi, et ce que les pièces ont acheté.
        Les calculs faciles (× 1, × 10, puis × 2, × 5) valent moins, et les points baissent après une longue journée.
      </p>
      <button className="ghost" onClick={exportData}>⬇️ Exporter les données (JSON)</button>
      {!days.length && <p className="empty">Rien pour l’instant.</p>}
      {days.slice(0, 60).map(lines => {
        const games = lines.filter(l => l.game).map(l => l.game!);
        const earned = games.reduce((s, g) => s + (g.gains?.coins ?? vals.get(g.id)?.coins ?? 0), 0);
        const spent = lines.reduce((s, l) => s + (l.ev?.k === 'buy' ? l.ev.n ?? 0 : 0), 0);
        return (
          <div key={lines[0].t} className="panel jday">
            <h2>{dayOf(lines[0].t)}</h2>
            <p className="jsum">{games.length} partie{games.length > 1 ? 's' : ''} · +{earned} 🪙 gagnées{spent ? ` · −${spent} 🪙 dépensées` : ''}</p>
            {lines.map(l => (l.game ? <GameLine key={'g' + l.game.id} g={l.game} v={vals.get(l.game.id)} /> : <EventLine key={'e' + l.t + l.ev!.k + (l.ev!.id ?? '')} e={l.ev!} />))}
          </div>
        );
      })}
    </section>
  );
}

function GameLine({ g, v }: { g: GameRecord; v?: GameValue }) {
  const gn = g.gains;
  const what = g.mode === 'exam' ? `🎓 Examen table de ${g.examTable} ${g.passed ? '(réussi)' : '(raté)'}`
    : g.mode === 'practice' ? '🔧 Entraînement' : `🎮 ${g.tables.length >= 10 ? 'toutes les tables' : 'tables ' + g.tables.join(', ')} · ${g.duration} s`;
  const points = gn?.points ?? v?.points ?? 0, raw = gn?.raw ?? v?.raw ?? 0, diff = gn?.difficulty ?? v?.difficulty ?? 0;
  const serious = gn?.serious ?? v?.serious ?? false;
  return (
    <div className="jrow">
      <div className="jt">{time(g.ts)}</div>
      <div className="jb">
        <div><b>{what}</b> · {g.correct}/{g.total} · difficulté {n2(diff)}</div>
        <div className="jd">
          {n2(raw)} pts{raw - points > 0.05 && <> → {n2(points)} après la baisse du jour</>}
          {!serious && ' · ne compte pas pour les badges'}
        </div>
        <div className="jd">
          +{gn?.coins ?? v?.coins ?? 0} 🪙
          {gn && (gn.badgeCoins || gn.levelCoins || gn.compBonus) ? ` (dont badges ${gn.badgeCoins}, niveau ${gn.levelCoins}, compagnon ${gn.compBonus})` : ''}
          {' · '}+{gn?.xp ?? v?.xp ?? 0} XP{gn && gn.level[1] > gn.level[0] && ` · niveau ${gn.level[0]} → ${gn.level[1]}`}
          {gn && ` · solde ${gn.balance} 🪙`}
          {!gn && ' (recalculé)'}
        </div>
        {gn?.badges.length ? <div className="jd">🏅 {gn.badges.map(id => BADGE_BY_ID[id]).filter(Boolean).map((b, i) => <span key={b.id}>{i ? ', ' : ''}{b.n} <Q q={b.r} /></span>)}</div> : null}
        {gn?.chests.length ? <div className="jd">🎁 {gn.chests.map((q, i) => <span key={i}>{i ? ', ' : ''}œuf <Q q={q} /></span>)}</div> : null}
        {gn?.comp && <div className="jd">{SPECIES_BY_ID[gn.comp.species]?.name ?? gn.comp.species} : {gn.comp.mood}{gn.comp.grew ? '' : ' (n’a pas grandi)'}</div>}
      </div>
    </div>
  );
}

function EventLine({ e }: { e: LogEntry }) {
  const item = e.id ? ITEM_BY_ID[e.id] : undefined, sp = e.id ? SPECIES_BY_ID[e.id] : undefined;
  const text = (() => {
    switch (e.k) {
      case 'buy': return <>🛒 Achat {item?.e} {item?.n ?? e.id} : −{e.n} 🪙 (reste {e.left})</>;
      case 'use': return <>{item?.e} {item?.n ?? e.id} donné : {NEED(e.from)} → {NEED(e.to)}</>;
      case 'sleep': return <>💤 Sieste : {NEED(e.from)} → {NEED(e.to)}</>;
      case 'chest': return <>🎁 Coffre ({SRC[e.src ?? ''] ?? e.src}{e.box ? ', coffre ' + RARITY[e.box].n : ''}) : œuf <Q q={e.q} /></>;
      case 'open': return <>🔓 Coffre ouvert : œuf <Q q={e.q} /></>;
      case 'hatch': return <>🐣 Éclosion : {sp?.name ?? e.id} <Q q={e.q} /></>;
      case 'dup': return <>♻️ Doublon {sp?.name ?? e.id} : +{e.n} 🪙</>;
      case 'evolve': return <>✨ {sp?.name ?? e.id} évolue (stade {(e.n ?? 0) + 1})</>;
    }
  })();
  return <div className="jrow ev"><div className="jt">{time(e.t)}</div><div className="jb">{text}</div></div>;
}
