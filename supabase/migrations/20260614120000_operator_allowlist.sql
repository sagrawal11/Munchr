-- Restrict analytics reads and catalog writes to an explicit operator allowlist instead of
-- "any authenticated user". Closes the gap where, if Supabase email signups are enabled,
-- anyone could self-register and read analytics / tamper with the catalog.
--
-- Membership is checked via a SECURITY DEFINER function so policy subqueries bypass RLS on
-- the operators table itself (otherwise the subquery would see 0 rows and lock everyone out).

create table if not exists public.operators (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- Lock the table down: RLS on, no policies → only the service role (and the definer
-- function below) can touch it.
alter table public.operators enable row level security;

create or replace function public.is_operator()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.operators
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- Seed the initial operator. Adjust/extend as the team grows.
insert into public.operators (email) values ('sarthak@munchr.com')
  on conflict (email) do nothing;

-- Analytics: approved operators read (was: any authenticated user). Anon insert is unchanged.
drop policy if exists "auth_select" on public.analytics_events;
create policy "operator_select" on public.analytics_events
  for select using (public.is_operator());

-- Catalog: public read stays; writes restricted to approved operators (was: any authenticated).
drop policy if exists "machines_auth_write" on public.machines;
create policy "machines_operator_write" on public.machines
  for all using (public.is_operator()) with check (public.is_operator());

drop policy if exists "products_auth_write" on public.products;
create policy "products_operator_write" on public.products
  for all using (public.is_operator()) with check (public.is_operator());

drop policy if exists "inventory_auth_write" on public.machine_inventory;
create policy "inventory_operator_write" on public.machine_inventory
  for all using (public.is_operator()) with check (public.is_operator());
