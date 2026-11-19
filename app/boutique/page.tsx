'use client';
import { useState } from 'react';
import { Coins, DebugCoins, ItemIcon } from '@/components/pet';
import { useEnsurePet } from '@/components/pet-ensure';
import { BackHeader } from '@/components/ui';
import { buy, ITEMS, type Item } from '@/lib/pet/rules';

const TABS: [Item['kind'], string][] = [['food', '🍎 Nourriture'], ['toy', '⚽ Jouets'], ['chest', '🎁 Coffres']];

export default function BoutiquePage() {
  const { pet, updatePet, coins } = useEnsurePet();
  const [tab, setTab] = useState<Item['kind']>('food');
  const [bought, setBought] = useState(0);
  if (!pet) return null;

  const doBuy = (it: Item) => {
    updatePet(p => p && buy(p, it.id, coins, Date.now()));
    setBought(n => n + 1);
  };
  return (
    <section className="screen">
      <BackHeader title="Boutique" />
      <div className="petbar"><Coins n={coins} /></div>
      <DebugCoins />
      <div className="row tabs">
        {TABS.map(([k, l]) => <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      <div className="shop">
        {ITEMS.filter(i => i.kind === tab).map(it => (
          <div key={it.id} className="shopi">
            <ItemIcon id={it.id} />
            <b>{it.n}</b>
            <small>{it.gain ? Object.entries(it.gain).map(([k, v]) => `${k === 'faim' ? 'Faim' : k === 'joie' ? 'Joie' : 'Énergie'} +${v}`).join(', ') : 'Un œuf surprise !'}</small>
            {it.kind !== 'chest' && pet.inventory[it.id] ? <small className="own">Dans ton sac : {pet.inventory[it.id]}</small> : null}
            <button className="chip on" disabled={coins < it.price} onClick={() => doBuy(it)}>🪙 {it.price}</button>
          </div>
        ))}
      </div>
      {bought && <p key={bought} className="note pop-note">Acheté ! {tab === 'chest' ? 'Ton coffre t’attend au nid.' : 'C’est dans ton sac.'}</p>}
    </section>
  );
}
