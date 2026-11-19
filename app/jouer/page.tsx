'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import GameSession from '@/components/GameSession';
import { useData } from '@/lib/data';
import { parseOpts } from '@/lib/game/engine';

export default function PlayPage() {
  return <Suspense><Play /></Suspense>;
}

function Play() {
  const sp = useSearchParams();
  const key = sp.toString();
  const opts = useMemo(() => parseOpts(new URLSearchParams(key)), [key]);
  const { tables, debug } = useData();
  if (!opts || (opts.mode === 'normal' && !tables.length)) {
    return <p className="empty">Cette partie ne peut pas démarrer.<br /><Link className="link" href="/">{"Retour à l'accueil"}</Link></p>;
  }
  return <GameSession key={key} opts={opts} fake={debug && sp.get('fake') === '1'} />;
}
