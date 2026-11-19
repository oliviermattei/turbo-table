import { cookies } from 'next/headers';
import { codeMatches, COOKIE, tokenFor } from '@/lib/server/auth';

// Global brake on guessing. shortcut: in memory and shared by everyone, fine for one family server.
let fails: number[] = [];

export async function POST(req: Request) {
  const now = Date.now();
  fails = fails.filter(t => now - t < 15 * 60_000);
  if (fails.length >= 10) return new Response('Too many attempts', { status: 429 });
  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === 'string' ? body.code : '';
  if (!codeMatches(code)) { fails.push(now); return new Response(null, { status: 401 }); }
  (await cookies()).set(COOKIE, tokenFor(code), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 400 * 24 * 3600,
  });
  return Response.json({ ok: true });
}
