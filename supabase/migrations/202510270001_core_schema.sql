-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- USERS -----------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  username text,
  display_name text,
  user_type text,
  advertiser_tier text,
  points_balance int default 0,
  keys_balance int default 0,
  gems_balance int default 0,
  gold_collected int default 0,
  user_tier text,
  avatar_url text,
  mocha_user_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CONTENT ---------------------------------------------------------------------
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.users(id) on delete cascade,
  drop_id uuid,
  title text,
  description text,
  media_url text,
  platform text,
  status text,
  posted_at timestamptz,
  impressions int default 0,
  clicks int default 0,
  engagements int default 0,
  shares int default 0,
  conversions int default 0,
  engagement_rate numeric
);

-- APPLICATIONS ---------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.users(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete cascade,
  status text default 'pending',
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  review_notes text
);

-- REVIEWS --------------------------------------------------------------------
create table if not exists public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  reviewer_id uuid references public.users(id) on delete cascade,
  rating int check (rating between 1 and 5),
  feedback text,
  created_at timestamptz default now()
);
