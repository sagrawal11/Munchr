-- Integration ingestion support: an external id + per-slot price for matching/import,
-- a sales table (operator revenue — sensitive), and an import-history audit table.
-- Enables the CSV connector (and future API connectors) to populate Munchr's catalog.

alter table public.machines add column if not exists external_id text;
create index if not exists machines_external_id_idx on public.machines (external_id);

alter table public.machine_inventory add column if not exists price numeric;

create table if not exists public.sales (
  id          bigserial   primary key,
  machine_id  bigint      references public.machines(id) on delete set null,
  product_id  bigint      references public.products(id) on delete set null,
  quantity    integer,
  price       numeric,
  sold_at     timestamptz,
  source      text        not null default 'csv',
  created_at  timestamptz not null default now()
);
create index if not exists sales_machine_idx on public.sales (machine_id);
create index if not exists sales_sold_at_idx on public.sales (sold_at desc);

create table if not exists public.imports (
  id               bigserial   primary key,
  source           text        not null,
  machines_new     integer     default 0,
  machines_matched integer     default 0,
  products_new     integer     default 0,
  inventory_rows   integer     default 0,
  sales_rows       integer     default 0,
  errors           integer     default 0,
  created_at       timestamptz not null default now()
);

-- Sales + import history are operator-only (no public read; revenue is sensitive).
-- Uses the is_operator() allowlist from 20260614120000_operator_allowlist.sql.
alter table public.sales   enable row level security;
alter table public.imports enable row level security;
create policy "sales_operator_all"   on public.sales   for all using (public.is_operator()) with check (public.is_operator());
create policy "imports_operator_all" on public.imports for all using (public.is_operator()) with check (public.is_operator());
