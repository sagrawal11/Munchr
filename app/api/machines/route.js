import { fetchMachinesFromDb } from '../../../lib/catalog';

// Public catalog read for the student app. Returns DB machines, or [] if the
// catalog hasn't been migrated yet (caller falls back to the static file).
export const dynamic = 'force-dynamic';

export async function GET() {
  const machines = await fetchMachinesFromDb();
  // The catalog changes rarely; cache at the edge so a flood hits the CDN, not Supabase
  // (amplification/cost mitigation). Inventory edits become visible within ~60s.
  return Response.json(
    { machines },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
