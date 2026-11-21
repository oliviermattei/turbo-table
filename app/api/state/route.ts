import { isAuthed, unauthorized } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';

/** Everything a device needs at startup: all games + the profile + the pet + the last reset time. */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  const db = getDb();
  const games = db.prepare('SELECT data FROM games ORDER BY ts DESC').all().map(r => JSON.parse(String(r.data)));
  const doc = (name: string) => { const r = db.prepare('SELECT data FROM docs WHERE name = ?').get(name); return r ? JSON.parse(String(r.data)) : null; };
  return Response.json({ games, profile: doc('profile'), pet: doc('pet'), reset: Number(doc('reset')?.at) || 0 });
}
