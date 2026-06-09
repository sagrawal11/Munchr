-- Analytics events: every user action tracked from the student app
create table analytics_events (
  id               uuid        primary key default gen_random_uuid(),
  event_type       text        not null,
  session_id       text        not null,
  query            text,
  normalized_query text,
  product_id       text,
  machine_id       text,
  building_id      text,
  campus           text,
  result_count     integer,
  device_type      text,
  timestamp        timestamptz not null
);

-- Indexes for operator dashboard queries
create index analytics_events_timestamp_idx  on analytics_events (timestamp desc);
create index analytics_events_event_type_idx on analytics_events (event_type);
create index analytics_events_session_idx    on analytics_events (session_id);

-- RLS: anonymous users can insert (tracking), authenticated operators can read
alter table analytics_events enable row level security;

create policy "anon_insert" on analytics_events
  for insert with check (true);

create policy "auth_select" on analytics_events
  for select using (auth.role() = 'authenticated');
