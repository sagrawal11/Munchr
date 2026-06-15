import { createServerClient } from '../../../lib/supabase';
import { rateLimit, clientIp } from '../../../lib/rateLimit';

// Per-IP cap on the anonymous tracking endpoint. Comfortable for a very active student
// (a search fires 1–2 events) while blocking automated spam. Best-effort per-instance;
// see SECURITY.md for the distributed (Vercel KV / Upstash) upgrade.
const RATE = { limit: 100, windowMs: 60_000 };
// Per-instance backstop: even if an attacker rotates IPs/sessions to dodge the per-IP cap,
// total writes per instance are bounded. Well above legitimate aggregate campus traffic.
const GLOBAL = { limit: 3000, windowMs: 60_000 };

// The /api/track endpoint is the one anonymous-writable surface (students aren't
// authenticated). To limit data-poisoning and oversized-payload abuse we (a) allowlist
// event types and (b) cap every field. Rate limiting is enforced at the edge (see SECURITY.md).
const EVENT_TYPES = new Set([
  'app_opened',
  'search_performed',
  'no_results_returned',
  'product_clicked',
  'machine_clicked',
  'directions_clicked',
  'category_filter_used',
  'building_filter_used',
  'location_permission_enabled',
  'location_permission_denied',
]);

const MAX = { query: 200, normalized_query: 200, product_id: 100, machine_id: 100, building_id: 200, campus: 20, device_type: 20, session_id: 100 };

// Coerce to a capped string or null — never store more than we asked for.
const str = (v, max) => (typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null);

export async function POST(request) {
  try {
    const perIp = rateLimit(`track:ip:${clientIp(request.headers)}`, RATE);
    const global = rateLimit('track:global', GLOBAL);
    if (!perIp.allowed || !global.allowed) {
      const retryAfter = Math.ceil(Math.max(perIp.retryAfterMs, global.retryAfterMs) / 1000);
      return Response.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await request.json();
    const { event_type, session_id } = body;

    if (!EVENT_TYPES.has(event_type)) {
      return Response.json({ error: 'Invalid event_type' }, { status: 400 });
    }
    if (!str(session_id, MAX.session_id)) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const rc = Number(body.result_count);
    const result_count = Number.isInteger(rc) && rc >= 0 && rc <= 100000 ? rc : null;

    const supabase = createServerClient();
    const { error } = await supabase.from('analytics_events').insert({
      event_type,
      session_id: str(session_id, MAX.session_id),
      query: str(body.query, MAX.query),
      normalized_query: str(body.normalized_query, MAX.normalized_query),
      product_id: str(body.product_id, MAX.product_id),
      machine_id: str(body.machine_id, MAX.machine_id),
      building_id: str(body.building_id, MAX.building_id),
      campus: str(body.campus, MAX.campus),
      result_count,
      device_type: str(body.device_type, MAX.device_type),
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return Response.json({ error: 'Failed to record event' }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Track route error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
