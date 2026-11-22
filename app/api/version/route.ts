import { VERSION } from '@/lib/version';

/** The version the server runs: open it after a deploy to check it went through. Public, never cached. */
export function GET() {
  return Response.json(VERSION, { headers: { 'cache-control': 'no-store' } });
}
