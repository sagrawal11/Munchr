import { createServerClient } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      event_type,
      session_id,
      query,
      normalized_query,
      product_id,
      machine_id,
      building_id,
      campus,
      result_count,
      device_type,
    } = body;

    if (!event_type || !session_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase.from('analytics_events').insert({
      event_type,
      session_id,
      query: query || null,
      normalized_query: normalized_query || null,
      product_id: product_id || null,
      machine_id: machine_id || null,
      building_id: building_id || null,
      campus: campus || null,
      result_count: result_count ?? null,
      device_type: device_type || null,
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
