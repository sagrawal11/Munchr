import { createServerClient } from '../../../../lib/supabase';
import { loadCatalogFromNayax } from '../../../../lib/integrations/nayax';

// Server-side Nayax fetch: keeps the operator's Lynx token off the browser and avoids CORS.
// Gated to authenticated operators (the caller passes their Supabase JWT in Authorization).
export async function POST(request) {
  try {
    const authz = request.headers.get('authorization') || '';
    const jwt = authz.startsWith('Bearer ') ? authz.slice(7) : null;
    if (!jwt) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { data: { user } = {}, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Operator allowlist check (defense in depth alongside RLS).
    const { data: op } = await supabase.from('operators').select('email').eq('email', user.email).maybeSingle();
    if (!op) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { token, env, includeSales } = await request.json();
    if (!token) return Response.json({ error: 'Missing Nayax token' }, { status: 400 });

    const catalog = await loadCatalogFromNayax({ token, env, includeSales: !!includeSales });
    return Response.json({ catalog });
  } catch (err) {
    console.error('Nayax integration error:', err);
    return Response.json({ error: 'Failed to load from Nayax' }, { status: 500 });
  }
}
