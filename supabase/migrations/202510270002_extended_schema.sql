-- Extended Promorang schema for content, advertiser, and engagement data

-- Content catalog
create table if not exists public.content_items (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references public.users(id) on delete set null,
  drop_id uuid references public.drops(id) on delete set null,
  title text not null,
  description text,
  media_url text,
  platform text,
  status text default 'draft',
  posted_at timestamptz,
  impressions bigint default 0,
  clicks bigint default 0,
  engagements bigint default 0,
  shares bigint default 0,
  conversions integer default 0,
  engagement_rate numeric(6,4),
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.content_tags (
  id serial primary key,
  name text unique not null
);

create table if not exists public.content_item_tags (
  content_id uuid references public.content_items(id) on delete cascade,
  tag_id integer references public.content_tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table if not exists public.drop_applications (
  id uuid primary key default uuid_generate_v4(),
  drop_id uuid references public.drops(id) on delete cascade,
  creator_id uuid references public.users(id) on delete cascade,
  status text default 'pending',
  proof_url text,
  submission_notes text,
  reviewer_notes text,
  reward_amount numeric(12,2),
  reward_currency text default 'usd',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.content_reviews (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references public.drop_applications(id) on delete cascade,
  reviewer_id uuid references public.users(id) on delete set null,
  rating integer check (rating between 1 and 5),
  feedback text,
  created_at timestamptz default timezone('utc', now())
);

-- Advertiser hub
create table if not exists public.advertiser_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  company_name text not null,
  company_website text,
  company_description text,
  industry text,
  contact_email text,
  contact_phone text,
  monthly_budget numeric(14,2),
  preferred_platforms text[],
  goals text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  advertiser_id uuid references public.users(id) on delete cascade,
  name text not null,
  objective text,
  status text default 'draft',
  start_date date,
  end_date date,
  total_budget numeric(14,2),
  budget_spent numeric(14,2) default 0,
  target_audience jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.campaign_assets (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  asset_type text,
  asset_url text,
  notes text,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.campaign_metrics (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  metric_date date not null,
  impressions bigint default 0,
  clicks bigint default 0,
  conversions integer default 0,
  spend numeric(14,2) default 0,
  revenue numeric(14,2),
  created_at timestamptz default timezone('utc', now()),
  unique (campaign_id, metric_date)
);

create table if not exists public.inventory_usage (
  id uuid primary key default uuid_generate_v4(),
  advertiser_id uuid references public.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  moves_used integer default 0,
  proof_drops_used integer default 0,
  paid_drops_used integer default 0,
  budget_consumed numeric(14,2) default 0,
  created_at timestamptz default timezone('utc', now()),
  unique (advertiser_id, period_start, period_end)
);

-- Leaderboard & engagement
create table if not exists public.leaderboard_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  period_type text not null,
  period_start date not null,
  period_end date not null,
  rank integer,
  points integer default 0,
  total_earnings numeric(14,2) default 0,
  created_at timestamptz default timezone('utc', now()),
  unique (user_id, period_type, period_start, period_end)
);

create table if not exists public.content_shares (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete cascade,
  platform text,
  share_url text,
  shared_at timestamptz default timezone('utc', now()),
  clicks integer default 0,
  conversions integer default 0,
  notes text
);

create table if not exists public.user_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  event_type text not null,
  event_source text,
  metadata jsonb,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.payouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete set null,
  amount numeric(12,2) not null,
  currency text default 'usd',
  status text default 'pending',
  initiated_at timestamptz default timezone('utc', now()),
  completed_at timestamptz,
  reference text
);

-- Helpful indexes
create index if not exists idx_content_items_creator_id on public.content_items(creator_id);
create index if not exists idx_content_items_drop_id on public.content_items(drop_id);
create index if not exists idx_drop_applications_drop_id on public.drop_applications(drop_id);
create index if not exists idx_drop_applications_creator_id on public.drop_applications(creator_id);
create index if not exists idx_campaigns_advertiser_id on public.campaigns(advertiser_id);
create index if not exists idx_campaign_metrics_campaign_id on public.campaign_metrics(campaign_id);
create index if not exists idx_inventory_usage_advertiser_id on public.inventory_usage(advertiser_id);
create index if not exists idx_leaderboard_user_id on public.leaderboard_entries(user_id);
create index if not exists idx_content_shares_content_id on public.content_shares(content_id);
create index if not exists idx_user_events_user_id on public.user_events(user_id);
create index if not exists idx_payouts_user_id on public.payouts(user_id);

-- Trigger to keep updated_at in sync
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
    where tgname = 'trg_content_items_touch'
      and tgrelid = 'public.content_items'::regclass
  ) then
    create trigger trg_content_items_touch
      before update on public.content_items
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_drop_applications_touch'
      and tgrelid = 'public.drop_applications'::regclass
  ) then
    create trigger trg_drop_applications_touch
      before update on public.drop_applications
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_advertiser_profiles_touch'
      and tgrelid = 'public.advertiser_profiles'::regclass
  ) then
    create trigger trg_advertiser_profiles_touch
      before update on public.advertiser_profiles
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_campaigns_touch'
      and tgrelid = 'public.campaigns'::regclass
  ) then
    create trigger trg_campaigns_touch
      before update on public.campaigns
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_inventory_usage_touch'
      and tgrelid = 'public.inventory_usage'::regclass
  ) then
    create trigger trg_inventory_usage_touch
      before update on public.inventory_usage
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_leaderboard_entries_touch'
      and tgrelid = 'public.leaderboard_entries'::regclass
  ) then
    create trigger trg_leaderboard_entries_touch
      before update on public.leaderboard_entries
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;
