import { cookies } from 'next/headers';
import { COOKIE, tokenFor } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { checkCode } from '@/lib/server/limit';

/**
 * Starts the progression again (parent only: the family code is asked again, even on a linked device).
 * Games and the pet move to archive tables (nothing is deleted); the profile stays. The `reset` doc tells
 * the other devices to clear what they keep locally. Also links this device, like a login.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === 'string' ? body.code : '';
  const r = checkCode(req, code);
  if (r === 'blocked') return new Response('Too many attempts', { status: 429 });
  if (r === 'bad') return new Response(null, { status: 401 });
  const at = Date.now(), db = getDb();
  db.exec('BEGIN');
  try {
    db.prepare('INSERT OR IGNORE INTO games_archive (id, ts, data, archived_at) SELECT id, ts, data, ? FROM games').run(at);
    db.prepare("INSERT INTO docs_archive (name, data, archived_at) SELECT name, data, ? FROM docs WHERE name = 'pet'").run(at);
    db.exec("DELETE FROM games; DELETE FROM docs WHERE name = 'pet'");
    db.prepare("INSERT INTO docs (name, data, updated_at) VALUES ('reset', ?, ?) ON CONFLICT(name) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
      .run(JSON.stringify({ at }), at);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  (await cookies()).set(COOKIE, tokenFor(code), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 400 * 24 * 3600,
  });
  return Response.json({ at });
}
