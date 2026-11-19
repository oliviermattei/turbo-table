'use client';
import { useEffect } from 'react';
import { newPet } from '@/lib/pet/rules';
import { usePet } from './pet';

/** The pet is created the first time a pet screen opens: the first chest is a gift. */
export function useEnsurePet() {
  const p = usePet();
  const { pet, updatePet, badges, history } = p;
  useEffect(() => {
    if (pet) return;
    const last = history.reduce((m, g) => Math.max(m, g.ts), 0);
    updatePet(cur => cur ?? newPet(Date.now(), badges, last));
  }, [pet, updatePet, badges, history]);
  return p;
}
