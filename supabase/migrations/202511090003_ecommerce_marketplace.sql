-- =====================================================
-- PROMORANG E-COMMERCE MARKETPLACE
-- Comprehensive multi-currency marketplace with stores, products, orders
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- MERCHANT STORES TABLE
-- Users can create stores to sell products
-- =====================================================
create table if not exists public.merchant_stores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  store_name text not null,
  store_slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  
  -- Store settings
  status text not null default 'active' check (status in ('active', 'suspended', 'pending_review', 'closed')),
  is_verified boolean not null default false,
  verification_badge text, -- 'creator', 'brand', 'official'
  
  -- Business info
  business_type text, -- 'individual', 'business', 'brand'
  contact_email text,
  contact_phone text,
  business_address jsonb, -- {street, city, state, zip, country}
  
  -- Store metrics
  total_sales numeric(14,2) not null default 0,
  total_orders integer not null default 0,
  total_products integer not null default 0,
  rating numeric(3,2) default 0,
  review_count integer not null default 0,
  
  -- Store policies
  return_policy text,
  shipping_policy text,
  terms_of_service text,
  
  -- Social links
  social_links jsonb default '{}'::jsonb, -- {instagram, tiktok, twitter, etc}
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint valid_slug check (store_slug ~ '^[a-z0-9-]+$'),
  constraint valid_rating check (rating >= 0 and rating <= 5)
);

-- Indexes
create index if not exists idx_merchant_stores_user on public.merchant_stores(user_id);
create index if not exists idx_merchant_stores_slug on public.merchant_stores(store_slug);
create index if not exists idx_merchant_stores_status on public.merchant_stores(status) where status = 'active';
create index if not exists idx_merchant_stores_verified on public.merchant_stores(is_verified) where is_verified = true;
create index if not exists idx_merchant_stores_rating on public.merchant_stores(rating desc) where status = 'active';

-- =====================================================
-- PRODUCT CATEGORIES TABLE
-- Hierarchical product categories
-- =====================================================
create table if not exists public.product_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.product_categories(id) on delete cascade,
  icon text, -- Icon name or emoji
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  
  constraint valid_category_slug check (slug ~ '^[a-z0-9-]+$')
);

-- Seed default categories
insert into public.product_categories (name, slug, icon, display_order) values
  ('Digital Products', 'digital', '💻', 1),
  ('Physical Goods', 'physical', '📦', 2),
  ('Services', 'services', '🛠️', 3),
  ('Merchandise', 'merchandise', '👕', 4),
  ('Courses & Education', 'courses', '📚', 5),
  ('Art & Design', 'art', '🎨', 6),
  ('Music & Audio', 'music', '🎵', 7),
  ('Video & Film', 'video', '🎬', 8)
on conflict (slug) do nothing;

-- =====================================================
-- PRODUCTS TABLE
-- Products listed in stores
-- =====================================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references public.merchant_stores(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  
  -- Product info
  name text not null,
  slug text not null,
  description text,
  short_description text,
  
  -- Pricing (multi-currency)
  price_usd numeric(14,2),
  price_gems integer,
  price_gold integer,
  original_price_usd numeric(14,2), -- For showing discounts
  
  -- Inventory
  inventory_count integer default 0,
  is_digital boolean not null default false,
  is_unlimited boolean not null default false, -- For digital products
  low_stock_threshold integer default 10,
  
  -- Product details
  sku text,
  weight numeric(10,2), -- in kg
  dimensions jsonb, -- {length, width, height, unit}
  
  -- Media
  images text[] default '{}',
  video_url text,
  
  -- Categorization
  tags text[] default '{}',
  
  -- Status
  status text not null default 'draft' check (status in ('draft', 'active', 'out_of_stock', 'archived')),
  is_featured boolean not null default false,
  
  -- Metrics
  views_count integer not null default 0,
  sales_count integer not null default 0,
  rating numeric(3,2) default 0,
  review_count integer not null default 0,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_store_slug unique(store_id, slug),
  constraint valid_product_slug check (slug ~ '^[a-z0-9-]+$'),
  constraint valid_pricing check (
    (price_usd is not null and price_usd > 0) or
    (price_gems is not null and price_gems > 0) or
    (price_gold is not null and price_gold > 0)
  ),
  constraint valid_rating check (rating >= 0 and rating <= 5)
);

-- Indexes
create index if not exists idx_products_store on public.products(store_id, status);
create index if not exists idx_products_category on public.products(category_id) where status = 'active';
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured = true and status = 'active';
create index if not exists idx_products_sales on public.products(sales_count desc) where status = 'active';
create index if not exists idx_products_rating on public.products(rating desc) where status = 'active';
create index if not exists idx_products_tags on public.products using gin(tags);
create index if not exists idx_products_search on public.products using gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

-- =====================================================
-- SHOPPING CARTS TABLE
-- User shopping carts
-- =====================================================
create table if not exists public.shopping_carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_user_cart unique(user_id)
);

-- =====================================================
-- CART ITEMS TABLE
-- Items in shopping carts
-- =====================================================
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references public.shopping_carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  
  -- Snapshot of pricing at time of add
  price_usd numeric(14,2),
  price_gems integer,
  price_gold integer,
  
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_cart_product unique(cart_id, product_id),
  constraint valid_quantity check (quantity > 0)
);

-- =====================================================
-- ORDERS TABLE
-- Customer orders
-- =====================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  buyer_id uuid not null references public.users(id) on delete restrict,
  store_id uuid not null references public.merchant_stores(id) on delete restrict,
  
  -- Order status
  status text not null default 'pending' check (status in (
    'pending', 'payment_pending', 'paid', 'processing', 
    'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
  )),
  
  -- Payment details
  payment_method text not null, -- 'stripe', 'gems', 'gold', 'mixed'
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  
  -- Totals (multi-currency)
  subtotal_usd numeric(14,2) not null default 0,
  subtotal_gems integer not null default 0,
  subtotal_gold integer not null default 0,
  
  tax_amount numeric(14,2) not null default 0,
  shipping_amount numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  
  total_usd numeric(14,2) not null default 0,
  total_gems integer not null default 0,
  total_gold integer not null default 0,
  
  -- Shipping info
  shipping_address jsonb,
  shipping_method text,
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  
  -- Customer info
  customer_email text,
  customer_phone text,
  
  -- Notes
  customer_notes text,
  merchant_notes text,
  
  -- Payment references
  stripe_payment_intent_id text,
  stripe_charge_id text,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

-- Indexes
create index if not exists idx_orders_buyer on public.orders(buyer_id, created_at desc);
create index if not exists idx_orders_store on public.orders(store_id, created_at desc);
create index if not exists idx_orders_status on public.orders(status, created_at desc);
create index if not exists idx_orders_number on public.orders(order_number);

-- =====================================================
-- ORDER ITEMS TABLE
-- Line items in orders
-- =====================================================
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  
  -- Product snapshot (in case product changes/deleted)
  product_name text not null,
  product_image text,
  product_sku text,
  
  quantity integer not null default 1,
  
  -- Pricing at time of purchase
  unit_price_usd numeric(14,2),
  unit_price_gems integer,
  unit_price_gold integer,
  
  total_price_usd numeric(14,2),
  total_price_gems integer,
  total_price_gold integer,
  
  -- Fulfillment
  is_digital boolean not null default false,
  digital_download_url text,
  digital_download_expires_at timestamptz,
  
  created_at timestamptz not null default timezone('utc', now()),
  
  constraint valid_quantity check (quantity > 0)
);

-- Indexes
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);

-- =====================================================
-- PRODUCT REVIEWS TABLE
-- Customer reviews and ratings
-- =====================================================
create table if not exists public.product_reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  
  rating integer not null check (rating between 1 and 5),
  title text,
  review_text text,
  
  -- Media
  images text[] default '{}',
  
  -- Verification
  is_verified_purchase boolean not null default false,
  
  -- Moderation
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'flagged')),
  
  -- Helpfulness
  helpful_count integer not null default 0,
  not_helpful_count integer not null default 0,
  
  -- Merchant response
  merchant_response text,
  merchant_responded_at timestamptz,
  
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_user_product_review unique(product_id, user_id, order_id)
);

-- Indexes
create index if not exists idx_product_reviews_product on public.product_reviews(product_id, status);
create index if not exists idx_product_reviews_user on public.product_reviews(user_id);
create index if not exists idx_product_reviews_rating on public.product_reviews(rating desc);

-- =====================================================
-- PRODUCT WISHLIST TABLE
-- Users can save products to wishlist
-- =====================================================
create table if not exists public.product_wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_user_product_wishlist unique(user_id, product_id)
);

-- Indexes
create index if not exists idx_product_wishlist_user on public.product_wishlist(user_id, created_at desc);
create index if not exists idx_product_wishlist_product on public.product_wishlist(product_id);

-- =====================================================
-- EXTEND USERS TABLE
-- Add marketplace-related columns
-- =====================================================
alter table public.users add column if not exists has_store boolean not null default false;
alter table public.users add column if not exists store_id uuid references public.merchant_stores(id) on delete set null;
alter table public.users add column if not exists total_purchases numeric(14,2) not null default 0;
alter table public.users add column if not exists total_orders integer not null default 0;

-- =====================================================
-- TRIGGERS
-- Automatic updates and calculations
-- =====================================================

-- Update store metrics when order is completed
create or replace function public.update_store_metrics()
returns trigger as $$
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    update public.merchant_stores
    set total_sales = total_sales + new.total_usd,
        total_orders = total_orders + 1,
        updated_at = timezone('utc', now())
    where id = new.store_id;
    
    update public.users
    set total_purchases = total_purchases + new.total_usd,
        total_orders = total_orders + 1
    where id = new.buyer_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_store_metrics
  after insert or update on public.orders
  for each row
  execute function public.update_store_metrics();

-- Update product metrics when order item is created
create or replace function public.update_product_metrics()
returns trigger as $$
begin
  update public.products
  set sales_count = sales_count + new.quantity
  where id = new.product_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_product_metrics
  after insert on public.order_items
  for each row
  execute function public.update_product_metrics();

-- Update product rating when review is approved
create or replace function public.update_product_rating()
returns trigger as $$
begin
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    update public.products
    set rating = (
      select avg(rating)::numeric(3,2)
      from public.product_reviews
      where product_id = new.product_id and status = 'approved'
    ),
    review_count = review_count + 1
    where id = new.product_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_product_rating
  after insert or update on public.product_reviews
  for each row
  execute function public.update_product_rating();

-- Update store product count
create or replace function public.update_store_product_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.merchant_stores
    set total_products = total_products + 1
    where id = new.store_id;
  elsif tg_op = 'DELETE' then
    update public.merchant_stores
    set total_products = total_products - 1
    where id = old.store_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_store_product_count
  after insert or delete on public.products
  for each row
  execute function public.update_store_product_count();

-- Auto-update timestamps
create or replace function public.update_marketplace_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trg_merchant_stores_timestamp
  before update on public.merchant_stores
  for each row execute function public.update_marketplace_timestamp();

create trigger trg_products_timestamp
  before update on public.products
  for each row execute function public.update_marketplace_timestamp();

create trigger trg_orders_timestamp
  before update on public.orders
  for each row execute function public.update_marketplace_timestamp();

-- Generate unique order number
create or replace function public.generate_order_number()
returns trigger as $$
begin
  new.order_number = 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 8));
  return new;
end;
$$ language plpgsql;

create trigger trg_generate_order_number
  before insert on public.orders
  for each row
  when (new.order_number is null)
  execute function public.generate_order_number();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Secure access to marketplace data
-- =====================================================

alter table public.merchant_stores enable row level security;
alter table public.products enable row level security;
alter table public.shopping_carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_reviews enable row level security;
alter table public.product_wishlist enable row level security;

-- Merchant stores policies
create policy "Anyone can view active stores"
  on public.merchant_stores for select
  using (status = 'active');

create policy "Users can create their own store"
  on public.merchant_stores for insert
  with check (auth.uid() = user_id);

create policy "Store owners can update their store"
  on public.merchant_stores for update
  using (auth.uid() = user_id);

-- Products policies
create policy "Anyone can view active products"
  on public.products for select
  using (status in ('active', 'out_of_stock'));

create policy "Store owners can manage their products"
  on public.products for all
  using (exists (
    select 1 from public.merchant_stores
    where id = products.store_id and user_id = auth.uid()
  ));

-- Shopping carts policies
create policy "Users can manage their own cart"
  on public.shopping_carts for all
  using (auth.uid() = user_id);

create policy "Users can manage their cart items"
  on public.cart_items for all
  using (exists (
    select 1 from public.shopping_carts
    where id = cart_items.cart_id and user_id = auth.uid()
  ));

-- Orders policies
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = buyer_id or exists (
    select 1 from public.merchant_stores
    where id = orders.store_id and user_id = auth.uid()
  ));

create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create policy "Store owners can update their orders"
  on public.orders for update
  using (exists (
    select 1 from public.merchant_stores
    where id = orders.store_id and user_id = auth.uid()
  ));

-- Order items policies
create policy "Users can view order items for their orders"
  on public.order_items for select
  using (exists (
    select 1 from public.orders
    where id = order_items.order_id and (
      buyer_id = auth.uid() or
      store_id in (select id from public.merchant_stores where user_id = auth.uid())
    )
  ));

-- Reviews policies
create policy "Anyone can view approved reviews"
  on public.product_reviews for select
  using (status = 'approved');

create policy "Users can create reviews"
  on public.product_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.product_reviews for update
  using (auth.uid() = user_id);

-- Wishlist policies
create policy "Users can manage their wishlist"
  on public.product_wishlist for all
  using (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- Utility functions for marketplace operations
-- =====================================================

-- Check product availability
create or replace function public.check_product_availability(p_product_id uuid, p_quantity integer)
returns boolean as $$
declare
  v_product record;
begin
  select * into v_product from public.products where id = p_product_id;
  
  if not found then
    return false;
  end if;
  
  if v_product.status != 'active' then
    return false;
  end if;
  
  if v_product.is_unlimited then
    return true;
  end if;
  
  return v_product.inventory_count >= p_quantity;
end;
$$ language plpgsql security definer;

-- Calculate order total
create or replace function public.calculate_order_total(p_order_id uuid)
returns jsonb as $$
declare
  v_totals jsonb;
begin
  select jsonb_build_object(
    'subtotal_usd', coalesce(sum(total_price_usd), 0),
    'subtotal_gems', coalesce(sum(total_price_gems), 0),
    'subtotal_gold', coalesce(sum(total_price_gold), 0)
  ) into v_totals
  from public.order_items
  where order_id = p_order_id;
  
  return v_totals;
end;
$$ language plpgsql security definer;

-- =====================================================
-- COMMENTS
-- Documentation for tables and columns
-- =====================================================

comment on table public.merchant_stores is 'Stores created by users to sell products';
comment on table public.products is 'Products listed in merchant stores';
comment on table public.orders is 'Customer orders with multi-currency support';
comment on table public.order_items is 'Line items in orders';
comment on table public.product_reviews is 'Customer reviews and ratings for products';
comment on table public.shopping_carts is 'User shopping carts';
comment on table public.cart_items is 'Items in shopping carts';

comment on column public.products.price_usd is 'Price in USD (can be null if only gems/gold)';
comment on column public.products.price_gems is 'Price in gems (can be null if only USD/gold)';
comment on column public.products.price_gold is 'Price in gold (can be null if only USD/gems)';
comment on column public.orders.payment_method is 'Payment method: stripe, gems, gold, or mixed';
