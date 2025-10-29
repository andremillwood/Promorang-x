-- Initial Promorang Supabase schema
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  username text unique,
  display_name text,
  user_type text default 'creator',
  advertiser_tier text,
  points_balance integer default 0,
  keys_balance integer default 0,
  gems_balance integer default 0,
  gold_collected integer default 0,
  user_tier text default 'free',
  avatar_url text,
  mocha_user_id text unique,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.drops (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references public.users (id) on delete set null,
  creator_name text,
  creator_avatar text,
  title text not null,
  description text,
  drop_type text,
  difficulty text,
  key_cost integer,
  gem_reward_base integer,
  gem_pool_total integer,
  gem_pool_remaining integer,
  reward_logic text,
  follower_threshold integer,
  time_commitment text,
  requirements text,
  deliverables text,
  deadline_at timestamptz,
  max_participants integer,
  current_participants integer,
  status text default 'active',
  platform text,
  content_url text,
  move_cost_points integer,
  key_reward_amount integer,
  is_proof_drop boolean default false,
  is_paid_drop boolean default false,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users (id) on delete cascade,
  currency_type text default 'USD',
  balance numeric(12,2) default 0,
  is_primary boolean default false,
  payment_method text,
  payment_details jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users (id) on delete cascade,
  transaction_type text,
  amount numeric(12,2),
  currency_type text,
  status text,
  description text,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.social_forecasts (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  status text default 'active',
  expires_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.master_key_status (
  user_id uuid primary key references public.users (id) on delete cascade,
  is_activated boolean default false,
  proof_drops_completed integer default 0,
  proof_drops_required integer default 3,
  last_activated_at timestamptz
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username, display_name, user_type, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'user_type', 'creator'),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = timezone('utc', now());

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
