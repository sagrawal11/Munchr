-- Multi-tenant data isolation.
--
-- Today the app is single-tenant: any allowlisted operator can read ALL analytics and write
-- ANY catalog row. Before onboarding a SECOND (external) operator, each operator must see only
-- their own data. This migration adds an `organizations` table, an `org_id` owner on every
-- tenant-scoped table, helper functions, a backfill of all existing data into a default org,
-- and rewrites RLS from "any operator" to "the operator's own org".
--
-- ⚠️ This is a COORDINATED CUTOVER. Apply it and complete the companion steps in
--    security/MULTI_TENANCY_ROLLOUT.md (set MUNCHR_ORG_ID, ship org-stamping code, assign
--    operators to orgs) in one go, and run the isolation test there BEFORE onboarding operator #2.
--    Products remain a shared master catalog (product names are not operator-confidential).

-- ============================== organizations ==============================
create table if not exists public.organizations (
  id         bigserial   primary key,
  name       text        not null,
  slug       text        unique,
  created_at timestamptz not null default now()
);
alter table public.organizations enable row level security;

-- Operators belong to exactly one org (extend the existing allowlist table).
alter table public.operators add column if not exists org_id bigint references public.organizations(id);

-- Org ownership on tenant-scoped tables.
alter table public.machines          add column if not exists org_id bigint references public.organizations(id);
alter table public.machine_inventory add column if not exists org_id bigint references public.organizations(id);
alter table public.sales             add column if not exists org_id bigint references public.organizations(id);
alter table public.imports           add column if not exists org_id bigint references public.organizations(id);
alter table public.analytics_events  add column if not exists org_id bigint references public.organizations(id);

create index if not exists machines_org_idx   on public.machines (org_id);
create index if not exists inventory_org_idx  on public.machine_inventory (org_id);
create index if not exists sales_org_idx       on public.sales (org_id);
create index if not exists imports_org_idx     on public.imports (org_id);
create index if not exists analytics_org_idx   on public.analytics_events (org_id);

-- ============================== backfill ==============================
-- Put ALL existing data into a default "Duke Pilot" org and assign existing operators to it.
insert into public.organizations (name, slug) values ('Duke Pilot', 'duke')
  on conflict (slug) do nothing;

update public.operators        set org_id = (select id from public.organizations where slug = 'duke') where org_id is null;
update public.machines         set org_id = (select id from public.organizations where slug = 'duke') where org_id is null;
update public.machine_inventory set org_id = (select id from public.organizations where slug = 'duke') where org_id is null;
update public.sales            set org_id = (select id from public.organizations where slug = 'duke') where org_id is null;
update public.imports          set org_id = (select id from public.organizations where slug = 'duke') where org_id is null;
update public.analytics_events set org_id = (select id from public.organizations where slug = 'duke') where org_id is null;

-- ============================== helper functions ==============================
-- SECURITY DEFINER so policy subqueries bypass RLS on the operators table (same pattern as is_operator()).
create or replace function public.is_org_member(target bigint)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.operators
    where email = (auth.jwt() ->> 'email') and org_id = target
  );
$$;

-- Callable by the browser via supabase.rpc('current_org_ids') so the operator console can learn
-- its own org (the operators table itself stays locked down).
create or replace function public.current_org_ids()
returns setof bigint language sql security definer set search_path = public stable as $$
  select org_id from public.operators
  where email = (auth.jwt() ->> 'email') and org_id is not null;
$$;

-- ============================== RLS: scope to the operator's org ==============================
-- organizations: a member can read their own org.
drop policy if exists "org_member_read" on public.organizations;
create policy "org_member_read" on public.organizations
  for select using (public.is_org_member(id));

-- analytics_events: anon INSERT unchanged (service role stamps org_id server-side).
-- Operator READ now scoped to their org (was: any operator reads everything).
drop policy if exists "operator_select" on public.analytics_events;
drop policy if exists "auth_select" on public.analytics_events;
create policy "analytics_org_select" on public.analytics_events
  for select using (public.is_org_member(org_id));

-- machines / inventory: PUBLIC READ stays (the consumer map needs it). WRITES scoped to the operator's org.
drop policy if exists "machines_operator_write" on public.machines;
create policy "machines_org_write" on public.machines
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

drop policy if exists "inventory_operator_write" on public.machine_inventory;
create policy "inventory_org_write" on public.machine_inventory
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

-- sales / imports: operator-only, scoped to org (revenue + import history are sensitive).
drop policy if exists "sales_operator_all" on public.sales;
create policy "sales_org_all" on public.sales
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

drop policy if exists "imports_operator_all" on public.imports;
create policy "imports_org_all" on public.imports
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

-- products: unchanged — shared master catalog (names are not operator-confidential),
-- public read + operator write via the existing products_operator_write policy.
