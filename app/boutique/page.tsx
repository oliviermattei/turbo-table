'use client';
import { useState } from 'react';
import { ChestImg, Coins, DebugCoins, ItemIcon } from '@/components/pet';
import { useEnsurePet } from '@/components/pet-ensure';
import { BackHeader } from '@/components/ui';
import { buy, ITEMS, type Item } from '@/lib/pet/rules';

const TABS: [Item['kind'], string, string][] = [['food', '🍎', 'Nourriture'], ['toy', '⚽', 'Jouets'], ['chest', '🎁', 'Coffres']];

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
      <div className="shop">
        {ITEMS.filter(i => i.kind === tab).map(it => (
          <div key={it.id} className="shopi">
            {it.kind === 'chest' ? <ChestImg box={it.box} /> : <ItemIcon id={it.id} />}
            <b>{it.n}</b>
            <small>{it.gain ? Object.entries(it.gain).map(([k, v]) => `${k === 'faim' ? 'Faim' : k === 'joie' ? 'Joie' : 'Énergie'} +${v}`).join(', ') : (it.min === 'epique' ? 'Un œuf Épique ou Légendaire !' : it.min === 'rare' ? 'Un œuf Rare ou mieux !' : 'Un œuf surprise !')}</small>
            {it.kind !== 'chest' && pet.inventory[it.id] ? <small className="own">Dans ton sac : {pet.inventory[it.id]}</small> : null}
            <button className="chip on" disabled={coins < it.price} onClick={() => doBuy(it)}>🪙 {it.price}</button>
          </div>
        ))}
      </div>
      {bought > 0 && <p key={bought} className="note pop-note">Acheté ! {tab === 'chest' ? 'Ton coffre t’attend au nid.' : 'C’est dans ton sac.'}</p>}
      <div className="spacer" />
      <div className="nav shop-tabs">
        {TABS.map(([k, e, l]) => (
          <button key={k} className={'navb' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>
            <span className="ic">{k === 'chest' ? <ChestImg /> : e}</span><span className="lb">{l}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
