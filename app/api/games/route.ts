import { clean, validId } from '@/lib/game/clean';
import { isAuthed, unauthorized } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';

/** Upserts a batch of games. Games never change once played, so an existing id is kept as is. */
export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body: unknown = await req.json().catch(() => null);
  if (!Array.isArray(body) || body.length > 5000) return new Response('Expected an array of games', { status: 400 });
  const games = body.map(clean).filter(g => validId(g.id) && g.ts > 0);
  const db = getDb();
  const insert = db.prepare('INSERT INTO games (id, ts, data) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING');
  db.exec('BEGIN');
  try {
    for (const g of games) insert.run(g.id, g.ts, JSON.stringify(g));
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return Response.json({ saved: games.length });
}
