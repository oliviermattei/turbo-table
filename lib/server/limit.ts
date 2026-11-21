import 'server-only';
import { codeMatches } from './auth';

const MAX_FAILS = 3;
const BLOCK_MS = 60 * 60_000;
// Per IP: 3 wrong codes block that device for 1 hour (login and reset share the count).
// shortcut: in memory (reset on restart), fine for one family server; move to SQLite if it ever matters.
const tries = new Map<string, { fails: number; until: number }>();

/** Checks a family code typed on a device: 'ok', 'bad' (wrong code) or 'blocked' (too many wrong codes) */
export function checkCode(req: Request, code: string): 'ok' | 'bad' | 'blocked' {
  const now = Date.now();
  // Behind Coolify's proxy the client IP is the first x-forwarded-for entry
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const t = tries.get(ip);
  if (t && t.until > now) return 'blocked';
  if (!codeMatches(code)) {
    const fails = (t?.fails ?? 0) + 1; // reset to 0 when a block starts, so it counts again after the hour
    tries.set(ip, { fails: fails >= MAX_FAILS ? 0 : fails, until: fails >= MAX_FAILS ? now + BLOCK_MS : 0 });
    return fails >= MAX_FAILS ? 'blocked' : 'bad';
  }
  tries.delete(ip);
  return 'ok';
}
