import { fetchMachinesFromDb } from '../../../lib/catalog';

// Public catalog read for the student app. Returns DB machines, or [] if the
// catalog hasn't been migrated yet (caller falls back to the static file).
export const dynamic = 'force-dynamic';

export async function GET() {
  const machines = await fetchMachinesFromDb();
  return Response.json({ machines });
}
