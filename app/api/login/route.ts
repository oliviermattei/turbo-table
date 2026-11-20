import { cookies } from 'next/headers';
import { codeMatches, COOKIE, tokenFor } from '@/lib/server/auth';

const MAX_FAILS = 3;
const BLOCK_MS = 60 * 60_000;
// Per IP: 3 wrong codes block that device for 1 hour.
// shortcut: in memory (reset on restart), fine for one family server; move to SQLite if it ever matters.
const tries = new Map<string, { fails: number; until: number }>();

export async function POST(req: Request) {
  const now = Date.now();
  // Behind Coolify's proxy the client IP is the first x-forwarded-for entry
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const t = tries.get(ip);
  if (t && t.until > now) return new Response('Too many attempts', { status: 429 });
  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === 'string' ? body.code : '';
  if (!codeMatches(code)) {
    const fails = (t?.fails ?? 0) + 1; // reset to 0 when a block starts, so it counts again after the hour
    tries.set(ip, { fails: fails >= MAX_FAILS ? 0 : fails, until: fails >= MAX_FAILS ? now + BLOCK_MS : 0 });
    return new Response(null, { status: fails >= MAX_FAILS ? 429 : 401 });
  }
  tries.delete(ip);
  (await cookies()).set(COOKIE, tokenFor(code), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 400 * 24 * 3600,
  });
  return Response.json({ ok: true });
}
