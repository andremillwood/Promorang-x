-- Content share positions for holdings
create table if not exists public.content_share_positions (
  id uuid primary key default uuid_generate_v4(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  holder_id uuid not null references public.users(id) on delete cascade,
  shares_owned numeric(18,4) not null default 0,
  total_invested numeric(14,2) not null default 0,
  average_price numeric(14,4) generated always as (
    case
      when shares_owned = 0 then 0
      else round((total_invested / nullif(shares_owned, 0))::numeric, 4)
    end
  ) stored,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_content_share_positions_content on public.content_share_positions(content_id);
create index if not exists idx_content_share_positions_holder on public.content_share_positions(holder_id);

alter table public.content_share_positions enable row level security;

create policy if not exists "allow_owners_read_positions"
  on public.content_share_positions
  for select
  using (auth.uid() = holder_id);

create policy if not exists "service_role_full_access_positions"
  on public.content_share_positions
  as permissive
  for all
  using (request.jwt.claims ->> 'role' = 'service_role')
  with check (request.jwt.claims ->> 'role' = 'service_role');

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_content_share_positions_touch'
      and tgrelid = 'public.content_share_positions'::regclass
  ) then
    create trigger trg_content_share_positions_touch
      before update on public.content_share_positions
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;
