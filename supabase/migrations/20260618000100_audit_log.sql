-- Operator audit log: an append-only trail of security-relevant operator actions
-- (catalog edits, integration runs, report exports, etc.), scoped per org.
--
-- Apply AFTER 20260618000000_org_isolation.sql. Writes happen via the SECURITY DEFINER
-- log_audit() function so the actor + org are stamped server-side from the JWT and can't be forged.
-- Wire app calls per security/MULTI_TENANCY_ROLLOUT.md. Until calls are wired, the table simply
-- stays empty — it does not affect existing functionality.

create table if not exists public.audit_log (
  id          bigserial   primary key,
  org_id      bigint      references public.organizations(id),
  actor_email text,
  action      text        not null,          -- e.g. 'catalog.machine.update', 'integration.import', 'report.export'
  target      text,                           -- e.g. machine id/name, import source
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_org_idx     on public.audit_log (org_id, created_at desc);
create index if not exists audit_log_actor_idx   on public.audit_log (actor_email);

alter table public.audit_log enable row level security;

-- Members can READ their org's audit trail. No direct INSERT/UPDATE/DELETE policy → entries can
-- only be created through log_audit() below (immutable from the client's perspective).
drop policy if exists "audit_org_read" on public.audit_log;
create policy "audit_org_read" on public.audit_log
  for select using (public.is_org_member(org_id));

-- Append an entry as the current operator, into the current operator's org. SECURITY DEFINER so
-- it can insert despite the absence of an INSERT policy, while stamping a trustworthy actor/org.
create or replace function public.log_audit(p_action text, p_target text default null, p_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_email text; v_org bigint;
begin
  v_email := auth.jwt() ->> 'email';
  select org_id into v_org from public.operators where email = v_email and org_id is not null limit 1;
  if v_org is null then
    return; -- only allowlisted operators with an org can write audit entries
  end if;
  insert into public.audit_log (org_id, actor_email, action, target, metadata)
  values (v_org, v_email, p_action, p_target, coalesce(p_metadata, '{}'::jsonb));
end;
$$;
