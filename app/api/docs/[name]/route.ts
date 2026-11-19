import { cleanProfile } from '@/lib/game/clean';
import { cleanPet } from '@/lib/pet/clean';
import { isAuthed, unauthorized } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';

/** Single documents (profile, later the pet). Each one has its validator: nothing else is accepted. */
const DOCS: Record<string, (v: unknown) => unknown> = { profile: cleanProfile, pet: cleanPet };

export async function PUT(req: Request, ctx: RouteContext<'/api/docs/[name]'>) {
  if (!(await isAuthed())) return unauthorized();
  const { name } = await ctx.params;
  if (!Object.hasOwn(DOCS, name)) return new Response(null, { status: 404 });
  const data = DOCS[name](await req.json().catch(() => null));
  if (data === null) return new Response(null, { status: 400 });
  getDb()
    .prepare('INSERT INTO docs (name, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
    .run(name, JSON.stringify(data), Date.now());
  return Response.json(data);
}
