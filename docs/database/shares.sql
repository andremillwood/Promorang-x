-- Shares attribution schema
create schema if not exists shares;

create table if not exists shares.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  campaign_id text null,
  target_url text not null,
  sig text not null,
  created_at timestamptz not null default now()
);

create table if not exists shares.clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references shares.links(id) on delete cascade,
  user_agent text null,
  ip inet null,
  referer text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_links_user on shares.links (user_id, created_at);
create index if not exists idx_clicks_link on shares.clicks (link_id, created_at);

alter table shares.links enable row level security;
alter table shares.clicks enable row level security;

create policy if not exists shares_links_insert_any
  on shares.links
  for insert
  with check (true);

create policy if not exists shares_clicks_insert_any
  on shares.clicks
  for insert
  with check (true);
