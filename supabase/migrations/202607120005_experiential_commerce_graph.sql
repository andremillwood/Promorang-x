-- Canonical experiential-commerce graph.
-- Keeps brands/products/listings/offers and experiential objects independently
-- owned while allowing explicit, attributed relationships between them.
create extension if not exists pgcrypto;

alter table if exists public.saved_objects drop constraint if exists saved_objects_object_type_check;
alter table if exists public.saved_objects add constraint saved_objects_object_type_check
  check (object_type in ('moment','mission','creator','scene','product','offer','piece','merchant','content','campaign'));

create table if not exists public.experience_commerce_links (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('moment','content','mission','campaign','scene','venue','brand','merchant')),
  source_id uuid not null,
  target_type text not null check (target_type in ('product','merchant_listing','offer','coupon','piece','moment','content','mission','campaign','venue','brand','merchant')),
  target_id uuid not null,
  relationship text not null check (relationship in ('features','sells','sponsors','rewards','unlocks','happens_at','created_from','eligible_for','related_to','owned_by','fulfilled_by')),
  position integer not null default 0,
  is_primary boolean not null default false,
  attribution jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(source_type,source_id,target_type,target_id,relationship)
);
create index if not exists experience_commerce_links_source_idx on public.experience_commerce_links(source_type,source_id,position);
create index if not exists experience_commerce_links_target_idx on public.experience_commerce_links(target_type,target_id);

create table if not exists public.commerce_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_id uuid references auth.users(id) on delete set null,
  listing_id uuid references public.merchant_products(id) on delete set null,
  coupon_id uuid,
  moment_id uuid references public.moments(id) on delete set null,
  mission_id uuid,
  campaign_id uuid,
  sale_id uuid,
  receipt_type text not null check (receipt_type in ('claim','reservation','purchase','redemption','refund')),
  status text not null default 'issued' check (status in ('issued','pending','fulfilled','cancelled','refunded')),
  amount numeric(14,2) not null default 0,
  currency text not null default 'USD',
  redemption_code text,
  attribution jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists commerce_receipts_user_idx on public.commerce_receipts(user_id,occurred_at desc);
create index if not exists commerce_receipts_merchant_idx on public.commerce_receipts(merchant_id,status,occurred_at desc);

alter table public.experience_commerce_links enable row level security;
alter table public.commerce_receipts enable row level security;
drop policy if exists "People read public experience commerce links" on public.experience_commerce_links;
create policy "People read public experience commerce links" on public.experience_commerce_links for select using (true);
drop policy if exists "People create attributed commerce links" on public.experience_commerce_links;
create policy "People create attributed commerce links" on public.experience_commerce_links for insert with check (created_by=auth.uid());
drop policy if exists "People manage own commerce links" on public.experience_commerce_links;
create policy "People manage own commerce links" on public.experience_commerce_links for update using (created_by=auth.uid()) with check (created_by=auth.uid());
drop policy if exists "People remove own commerce links" on public.experience_commerce_links;
create policy "People remove own commerce links" on public.experience_commerce_links for delete using (created_by=auth.uid());
drop policy if exists "People read own commerce receipts" on public.commerce_receipts;
create policy "People read own commerce receipts" on public.commerce_receipts for select using (user_id=auth.uid() or merchant_id=auth.uid());

create or replace view public.view_experiential_commerce as
select l.*, mp.name as listing_name, mp.description as listing_description, mp.price,
  mp.currency, mp.image_url, mp.merchant_id, mp.venue_id, mp.discount_type,
  mp.discount_value, mp.fulfillment_mode, mp.inventory_quantity
from public.experience_commerce_links l
left join public.merchant_products mp on l.target_type='merchant_listing' and mp.id=l.target_id;
grant select on public.view_experiential_commerce to anon,authenticated;
notify pgrst,'reload schema';
