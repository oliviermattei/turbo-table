import { cookies } from 'next/headers';
import { COOKIE, tokenFor } from '@/lib/server/auth';
import { checkCode } from '@/lib/server/limit';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === 'string' ? body.code : '';
  const r = checkCode(req, code);
  if (r === 'blocked') return new Response('Too many attempts', { status: 429 });
  if (r === 'bad') return new Response(null, { status: 401 });
  (await cookies()).set(COOKIE, tokenFor(code), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 400 * 24 * 3600,
  });
  return Response.json({ ok: true });
}
