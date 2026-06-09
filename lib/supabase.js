import { createClient } from '@supabase/supabase-js';

// Lazy client for browser usage (uses public anon key)
let _supabase = null;
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

// For convenience in client components — same as getSupabase()
export const supabase = {
  get auth() { return getSupabase().auth; },
  from: (...args) => getSupabase().from(...args),
};

// Server-side client using the service role key (API routes only — never sent to browser)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
