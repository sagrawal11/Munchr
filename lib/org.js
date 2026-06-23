// Multi-tenant helpers. Org isolation ships in supabase/migrations/20260618000000_org_isolation.sql
// and is GATED by env/args until the coordinated cutover (see security/MULTI_TENANCY_ROLLOUT.md).
// Until then these return null and callers behave exactly as before (single-tenant).

// Server-side: the org that this deployment's public consumer surface (the student app) belongs to.
// Set MUNCHR_ORG_ID in the deployment env at cutover. Null = multi-tenancy not enabled yet.
export function defaultOrgId() {
  const v = process.env.MUNCHR_ORG_ID;
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

// Browser-side: the signed-in operator's org_id, via the current_org_ids() RPC (added by the
// org-isolation migration). Returns null if the migration/RPC isn't present or the user has no org.
export async function getOperatorOrgId(supabase) {
  try {
    const { data, error } = await supabase.rpc('current_org_ids');
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch {
    return null;
  }
}

// Fire-and-forget audit entry via the log_audit() definer function (added by the audit-log migration).
// Best-effort: swallows errors so it never blocks or breaks an operator action, and is a no-op before
// the migration is applied (the RPC simply doesn't exist yet).
export async function logAudit(supabase, action, target = null, metadata = {}) {
  try {
    await supabase.rpc('log_audit', { p_action: action, p_target: target, p_metadata: metadata });
  } catch {
    /* audit is best-effort; never surface to the user */
  }
}
