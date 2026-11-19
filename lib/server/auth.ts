import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

// shortcut: one shared family code for the whole app (single player); add real accounts if siblings join.
export const COOKIE = 'tt_key';

export const tokenFor = (code: string) => createHash('sha256').update('turbo-tables:' + code).digest('hex');
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Fails closed: without FAMILY_CODE nobody gets in. */
export function codeMatches(code: string) {
  const expected = process.env.FAMILY_CODE;
  return !!expected && same(tokenFor(code), tokenFor(expected));
}

export async function isAuthed() {
  const expected = process.env.FAMILY_CODE;
  const v = (await cookies()).get(COOKIE)?.value;
  return !!expected && !!v && same(v, tokenFor(expected));
}

export const unauthorized = () => new Response(null, { status: 401 });
