'use client';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { famProgress, levelInfo, RARITY, rarityFor, ROMAN, type Badge, type Family, type Stats } from '@/lib/game/rules';
import type { Rarity } from '@/lib/game/types';

/** Rarity colour as the --rc CSS variable */
export const rc = (c: string) => ({ '--rc': c }) as CSSProperties;

export const Stat = ({ v, l }: { v: ReactNode; l: string }) => <div className="stat"><b>{v}</b><small>{l}</small></div>;

export const Stars = ({ n }: { n: number }) => <>{[0, 1, 2].map(i => <span key={i} className={i < n ? '' : 'off'}>⭐</span>)}</>;

export const RarLabel = ({ r }: { r: Rarity }) => <span className="rar" style={{ color: RARITY[r].c }}>{RARITY[r].n}</span>;

export const Progress = ({ pct }: { pct: number }) => <div className="bprog"><div style={{ width: pct + '%' }} /></div>;

export function BackHeader({ title }: { title: string }) {
  return (
    <div className="hhead">
      <Link href="/" className="icon-btn" aria-label="Retour">←</Link>
      <span className="htitle">{title}</span>
      <span style={{ width: 44 }} />
    </div>
  );
}

export function Modal({ children, onClose }: { children: ReactNode; onClose(): void }) {
  return (
    <div className="modal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">{children}</div>
    </div>
  );
}

export function PlayerCard({ xp, name }: { xp: number; name: string }) {
  const lv = levelInfo(xp);
  return (
    <div className="player">
      <div className="avatar">{lv.cur.emoji}</div>
      <div className="pinfo">
        <div className="plvl">Niveau {lv.num} · {lv.cur.name}</div>
        {name && <div className="pname">{name}</div>}
        <div className="xpbar"><div style={{ width: lv.pct + '%' }} /></div>
        <div className="xptxt">{lv.into} / {lv.need} XP</div>
      </div>
    </div>
  );
}

const BadgeIcon = ({ b }: { b: Badge }) => (b.fam?.table ? <span className="tnum">{b.fam.table}</span> : <>{b.e}</>);

/** A badge on one line (end of game). With `pr`, shows the progress towards it. */
export function BadgeLine({ b, pr }: { b: Badge; pr?: { pct: number; v: number; goal: number } }) {
  return (
    <div className={'nb r-' + b.r} style={rc(RARITY[b.r].c)}>
      <span className={'e' + (pr ? ' next' : '')}><BadgeIcon b={b} /></span>
      <div style={{ flex: 1 }}>
        <b>{b.n}</b> <RarLabel r={b.r} />
        <small>{b.d}</small>
        {pr && <><Progress pct={pr.pct} /><span className="bnum">{pr.v} / {pr.goal}</span></>}
      </div>
    </div>
  );
}

export function FamCard({ f, st, got }: { f: Family; st: Stats; got: Set<string> }) {
  const pr = famProgress(f, st);
  const r = pr.tier >= 0 ? rarityFor(pr.tier, f.goals.length) : null;
  return (
    <div className={'fcard ' + (r ? 'r-' + r : 'none')} style={rc(r ? RARITY[r].c : 'transparent')}>
      <div className="fhead">
        <span className="fe">{f.table ? <span className="tnum">{f.table}</span> : f.e}</span>
        <div>
          <b>{r ? `${f.n}${f.table ? ' · ' : ' '}${ROMAN[pr.tier]}` : f.n}</b>
          {r ? <RarLabel r={r} /> : <span className="rar" style={{ opacity: 0.6 }}>Pas encore</span>}
        </div>
      </div>
      <div className="dots">
        {f.goals.map((_, i) => (
          <i key={i} className="dot" style={got.has(f.id + ':' + i) ? { background: RARITY[rarityFor(i, f.goals.length)].c } : undefined} />
        ))}
      </div>
      {pr.done ? <small className="fnext">Tout gagné ! 🎉</small> : (
        <>
          <small className="fnext">Prochain : {f.d(pr.goal)} <RarLabel r={rarityFor(pr.i, f.goals.length)} /></small>
          <Progress pct={pr.pct} />
          <span className="bnum">{pr.v} / {pr.goal}</span>
        </>
      )}
    </div>
  );
}
