'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { clean, cleanProfile } from './game/clean';
import { computeStats, unlocked } from './game/rules';
import type { GameRecord, Profile } from './game/types';
import { cleanPet } from './pet/clean';
import { reconcile } from './pet/rules';
import type { PetState } from './pet/types';
import { setSoundOn } from './sound';

type LocalGame = GameRecord & { synced?: boolean };
/** local: server unreachable · cloud: synced with the server · locked: server needs the family code */
export type SyncState = 'local' | 'cloud' | 'locked';

/** Test mode: a sandbox with its own device storage and no server sync, so fake games never reach the real history. */
// Local development only: in production the test mode never shows, whatever is left in localStorage
const isDebug = () => {
  if (process.env.NODE_ENV === 'production') return false;
  try { return localStorage.getItem('tt_debug') === '1'; } catch { return false; }
};
const pre = () => (isDebug() ? 'ttdbg_' : 'tt_');
const store = (k: string, v: unknown) => {
  try { localStorage.setItem(pre() + k, JSON.stringify(v)); } catch { /* storage full or disabled */ }
};
const read = <T,>(k: string, d: T): T => {
  try { const v = localStorage.getItem(pre() + k); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
};
// shortcut: the device cache keeps the last 1000 games; the server keeps them all.
const saveLocal = (h: LocalGame[]) => store('history', h.slice(0, 1000));

function api(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST') {
  return fetch('/api/' + path, body === undefined ? { method } : {
    method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}

function loadLocal() {
  return {
    history: read<unknown[]>('history', []).map(g => ({ ...clean(g), synced: !!(g as LocalGame)?.synced })),
    profile: cleanProfile(read('profile', { name: '' })),
    tables: read<number[]>('tables', [2, 3, 4, 5]),
    duration: read('duration', 60),
    sound: read('sound', true),
    pet: cleanPet(read('pet', null)),
    debug: isDebug(),
  };
}

interface DataCtx {
  history: GameRecord[];
  profile: Profile;
  tables: number[];
  duration: number;
  sound: boolean;
  sync: SyncState;
  setTables(t: number[]): void;
  setDuration(d: number): void;
  setSound(b: boolean): void;
  setName(n: string): void;
  /** Saves a finished game and returns the new history (newest first). */
  saveGame(rec: Omit<GameRecord, 'id'>): GameRecord[];
  /** The companion, eggs and shop state (null until the companion screen is first opened) */
  pet: PetState | null;
  /** Changes the pet; the new state is saved on the device and on the server. */
  updatePet(f: (p: PetState | null) => PetState | null): void;
  /** Test mode (sandbox, see isDebug) */
  debug: boolean;
  setDebug(b: boolean): void;
  /** Sends the family code; on success this device syncs with the server. */
  unlock(code: string): Promise<boolean>;
}

const Ctx = createContext<DataCtx | null>(null);
export function useData() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useData must be used inside <DataProvider>');
  return c;
}

const noop = () => () => {};
/** Everything lives in the browser (localStorage + server sync), so the app renders on the client only. */
export function DataProvider({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  return isClient ? <Store>{children}</Store> : null;
}

function Store({ children }: { children: ReactNode }) {
  const [init] = useState(loadLocal);
  const [history, setHistory] = useState<LocalGame[]>(init.history);
  const [profile, setProfile] = useState(init.profile);
  const [tables, setTablesS] = useState(init.tables);
  const [duration, setDurationS] = useState(init.duration);
  const [sound, setSoundS] = useState(init.sound);
  const [sync, setSyncS] = useState<SyncState>('local');
  const hist = useRef<LocalGame[]>(init.history);
  const prof = useRef(init.profile);
  const syncRef = useRef<SyncState>('local');
  const profileWrites = useRef(Promise.resolve());
  const [pet, setPetS] = useState(init.pet);
  const petRef = useRef(init.pet);
  const petWrites = useRef(Promise.resolve());

  const setSync = (s: SyncState) => { syncRef.current = s; setSyncS(s); };
  // One write at a time on the pet doc, always the latest state
  const pushPet = () => {
    petWrites.current = petWrites.current.then(() => (petRef.current ? api('docs/pet', petRef.current, 'PUT') : null)).then(() => {}, () => {});
  };
  const commitPet = useCallback((p: PetState | null, push: boolean) => {
    petRef.current = p; setPetS(p); store('pet', p);
    if (push && p && syncRef.current === 'cloud') pushPet();
  }, []);
  // Keeps the pet up to date with the history: companion growth, new chests
  const reconcilePet = useCallback((h: GameRecord[]) => {
    const p = petRef.current;
    if (!p) return;
    const next = reconcile(p, h, unlocked(computeStats(h)), Date.now());
    if (next !== p) commitPet({ ...next, updatedAt: Date.now() }, true);
  }, [commitPet]);
  const commit = useCallback((h: LocalGame[]) => { hist.current = h; setHistory(h); saveLocal(h); reconcilePet(h); }, [reconcilePet]);
  // One write at a time on the profile doc
  const pushProfile = (p: Profile) => {
    profileWrites.current = profileWrites.current.then(() => api('docs/profile', p, 'PUT')).then(() => {}, () => {});
  };

  const syncCloud = useCallback(async () => {
    reconcilePet(hist.current);
    if (init.debug) return; // the sandbox never talks to the server
    try {
      const unsynced = hist.current.filter(g => !g.synced);
      if (unsynced.length) {
        const r = await api('games', unsynced.map(clean));
        if (r.status === 401) return setSync('locked');
        if (!r.ok) return;
        unsynced.forEach(g => { g.synced = true; });
      }
      const r = await api('state');
      if (r.status === 401) return setSync('locked');
      if (!r.ok) return;
      const body = (await r.json()) as { games: unknown[]; profile: unknown; pet: unknown };
      const remote: LocalGame[] = body.games.map(g => ({ ...clean(g), synced: true }));
      const ids = new Set(remote.map(g => g.id));
      commit([...remote, ...hist.current.filter(g => !g.synced && !ids.has(g.id))].sort((a, b) => b.ts - a.ts));
      const rp = cleanProfile(body.profile);
      if (rp.name) { prof.current = rp; setProfile(rp); store('profile', rp); }
      else if (prof.current.name) pushProfile(prof.current);
      // The most recently changed pet wins (the other device, or this one)
      const rpet = cleanPet(body.pet);
      if (rpet && rpet.updatedAt > (petRef.current?.updatedAt ?? -1)) { commitPet(rpet, false); reconcilePet(hist.current); }
      setSync('cloud');
      if (petRef.current && petRef.current !== rpet) pushPet();
    } catch { /* offline: keep playing on this device, unsynced games are pushed next time */ }
  }, [commit, commitPet, reconcilePet, init.debug]);


  // Deferred so the first paint never waits on the network (and StrictMode does not sync twice)
  useEffect(() => { const id = setTimeout(syncCloud); return () => clearTimeout(id); }, [syncCloud]);
  useEffect(() => setSoundOn(sound), [sound]);

  const value: DataCtx = {
    history, profile, tables, duration, sound, sync, pet, debug: init.debug,
    setDebug(b) {
      try { localStorage.setItem('tt_debug', b ? '1' : '0'); } catch { /* storage disabled */ }
      location.reload(); // every value is read again from the other storage
    },
    updatePet(f) {
      const next = f(petRef.current);
      if (next === petRef.current) return;
      commitPet(next && { ...next, updatedAt: Date.now() }, true);
    },
    setTables(t) { setTablesS(t); store('tables', t); },
    setDuration(d) { setDurationS(d); store('duration', d); },
    setSound(b) { setSoundS(b); store('sound', b); },
    setName(n) {
      const p = cleanProfile({ name: n });
      if (p.name === prof.current.name) return;
      prof.current = p; setProfile(p); store('profile', p);
      if (syncRef.current === 'cloud') pushProfile(p);
    },
    saveGame(rec) {
      const g: LocalGame = { ...rec, id: 'g' + Date.now() + Math.random().toString(36).slice(2, 6), synced: false };
      const next = [g, ...hist.current];
      commit(next);
      if (syncRef.current === 'cloud') {
        api('games', [clean(g)]).then(r => { if (r.ok) { g.synced = true; saveLocal(hist.current); } }, () => {});
      }
      return next;
    },
    async unlock(code) {
      const r = await api('login', { code }).catch(() => null);
      if (!r?.ok) return false;
      await syncCloud();
      return true;
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
