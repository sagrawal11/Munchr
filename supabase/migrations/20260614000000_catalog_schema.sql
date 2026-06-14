-- Catalog schema: machines, products, and the inventory join between them.
-- Migrates Munchr's vending catalog from the static file (src/data/vendingMachines.js)
-- into real tables so the data is editable (admin editor) and acquirer-grade.
--
-- Read access is public (the student app reads anonymously); writes require an
-- authenticated operator. The service role (used by the seed script) bypasses RLS.

-- ============================== machines ==============================
create table if not exists public.machines (
  id               bigint       primary key,          -- keep existing numeric ids for continuity
  name             text         not null,
  building         text         not null,
  floor            text,
  notes            text,
  latitude         double precision not null,
  longitude        double precision not null,
  campus           text,                               -- 'east' | 'west' (derived at seed time)
  credit_card_only boolean      not null default false,
  status           text         not null default 'active',
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now()
);

-- ============================== products ==============================
-- Master catalog, deduped by name. category = broad bucket (categorizeProduct);
-- label = concise type shown to users (getProductLabel).
create table if not exists public.products (
  id          bigserial   primary key,
  name        text        not null unique,
  category    text,
  label       text,
  created_at  timestamptz not null default now()
);

-- ========================= machine_inventory =========================
-- Which products are in which machine. `available` + `updated_at` give us the
-- hook for inventory freshness / stockouts later without a schema change.
create table if not exists public.machine_inventory (
  id          bigserial   primary key,
  machine_id  bigint      not null references public.machines(id) on delete cascade,
  product_id  bigint      not null references public.products(id) on delete cascade,
  available   boolean     not null default true,
  updated_at  timestamptz not null default now(),
  unique (machine_id, product_id)
);

create index if not exists machine_inventory_machine_idx on public.machine_inventory (machine_id);
create index if not exists machine_inventory_product_idx on public.machine_inventory (product_id);

-- ============================== RLS ==============================
alter table public.machines          enable row level security;
alter table public.products          enable row level security;
alter table public.machine_inventory enable row level security;

-- Public read (student app, anon key)
create policy "machines_public_read"  on public.machines          for select using (true);
create policy "products_public_read"   on public.products          for select using (true);
create policy "inventory_public_read"  on public.machine_inventory for select using (true);

-- Authenticated operators can write (admin editor)
create policy "machines_auth_write"   on public.machines          for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "products_auth_write"    on public.products          for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "inventory_auth_write"   on public.machine_inventory for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
