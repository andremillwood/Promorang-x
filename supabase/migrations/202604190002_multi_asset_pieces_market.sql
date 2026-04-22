-- Multi-Asset Pieces Market
-- Expands tradable pieces beyond content to moments, hosts, and venues
-- Rebrands "shares" to "pieces" to avoid securities terminology
-- Timestamp: 2026-04-19

-- =====================================================
-- PIECE TYPE ENUM
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'piece_type') THEN
    CREATE TYPE public.piece_type AS ENUM ('content', 'moment', 'host', 'venue');
  END IF;
END $$;

-- =====================================================
-- PIECE TRADE TYPE ENUM
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'piece_trade_type') THEN
    CREATE TYPE public.piece_trade_type AS ENUM ('market', 'limit', 'ipo', 'dividend_reinvest', 'airdrop');
  END IF;
END $$;

-- =====================================================
-- 1. CONTENT PIECES (Existing - renamed from content_shares)
-- =====================================================

-- Content piece positions (replaces content_share_positions)
CREATE TABLE IF NOT EXISTS public.content_piece_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  holder_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pieces_owned integer NOT NULL DEFAULT 0 CHECK (pieces_owned >= 0),
  total_invested numeric(14,4) NOT NULL DEFAULT 0,
  avg_purchase_price numeric(14,4),
  first_acquired_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_trade_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(content_id, holder_id)
);

CREATE INDEX IF NOT EXISTS idx_content_piece_positions_content ON public.content_piece_positions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_piece_positions_holder ON public.content_piece_positions(holder_id);

-- Content piece price history (replaces content_share_price_history)
CREATE TABLE IF NOT EXISTS public.content_piece_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('1m', '5m', '15m', '1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  open_price numeric(14,4) NOT NULL,
  high_price numeric(14,4) NOT NULL,
  low_price numeric(14,4) NOT NULL,
  close_price numeric(14,4) NOT NULL,
  volume integer DEFAULT 0,
  trade_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(content_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_content_piece_price_history_content ON public.content_piece_price_history(content_id, period_type, period_start DESC);

-- Content piece stats (replaces content_share_stats)
CREATE TABLE IF NOT EXISTS public.content_piece_stats (
  content_id uuid PRIMARY KEY REFERENCES public.content_items(id) ON DELETE CASCADE,
  current_price numeric(14,4) NOT NULL DEFAULT 1.00,
  previous_close numeric(14,4),
  day_open numeric(14,4),
  day_high numeric(14,4),
  day_low numeric(14,4),
  week_high numeric(14,4),
  week_low numeric(14,4),
  all_time_high numeric(14,4),
  all_time_low numeric(14,4),
  total_pieces integer DEFAULT 100,
  available_pieces integer DEFAULT 100,
  market_cap numeric(18,2),
  volume_24h integer DEFAULT 0,
  volume_7d integer DEFAULT 0,
  trade_count_24h integer DEFAULT 0,
  change_24h numeric(8,4) DEFAULT 0,
  change_7d numeric(8,4) DEFAULT 0,
  change_30d numeric(8,4) DEFAULT 0,
  avg_volume_30d integer DEFAULT 0,
  holder_count integer DEFAULT 0,
  last_trade_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- =====================================================
-- 2. MOMENT PIECES (NEW)
-- =====================================================

-- Moment piece positions
CREATE TABLE IF NOT EXISTS public.moment_piece_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  holder_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pieces_owned integer NOT NULL DEFAULT 0 CHECK (pieces_owned >= 0),
  total_invested numeric(14,4) NOT NULL DEFAULT 0,
  avg_purchase_price numeric(14,4),
  first_acquired_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_trade_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(moment_id, holder_id)
);

CREATE INDEX IF NOT EXISTS idx_moment_piece_positions_moment ON public.moment_piece_positions(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_piece_positions_holder ON public.moment_piece_positions(holder_id);

-- Moment piece price history
CREATE TABLE IF NOT EXISTS public.moment_piece_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('1m', '5m', '15m', '1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  open_price numeric(14,4) NOT NULL,
  high_price numeric(14,4) NOT NULL,
  low_price numeric(14,4) NOT NULL,
  close_price numeric(14,4) NOT NULL,
  volume integer DEFAULT 0,
  trade_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(moment_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_moment_piece_price_history_moment ON public.moment_piece_price_history(moment_id, period_type, period_start DESC);

-- Moment piece stats
CREATE TABLE IF NOT EXISTS public.moment_piece_stats (
  moment_id uuid PRIMARY KEY REFERENCES public.moments(id) ON DELETE CASCADE,
  current_price numeric(14,4) NOT NULL DEFAULT 1.00,
  previous_close numeric(14,4),
  day_open numeric(14,4),
  day_high numeric(14,4),
  day_low numeric(14,4),
  week_high numeric(14,4),
  week_low numeric(14,4),
  all_time_high numeric(14,4),
  all_time_low numeric(14,4),
  total_pieces integer DEFAULT 100,
  available_pieces integer DEFAULT 100,
  market_cap numeric(18,2),
  volume_24h integer DEFAULT 0,
  volume_7d integer DEFAULT 0,
  trade_count_24h integer DEFAULT 0,
  change_24h numeric(8,4) DEFAULT 0,
  change_7d numeric(8,4) DEFAULT 0,
  change_30d numeric(8,4) DEFAULT 0,
  avg_volume_30d integer DEFAULT 0,
  holder_count integer DEFAULT 0,
  last_trade_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- =====================================================
-- 3. HOST PIECES (NEW)
-- =====================================================

-- Host profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.host_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  display_name text,
  bio text,
  avatar_url text,
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  total_moments_hosted integer DEFAULT 0,
  total_participants_served integer DEFAULT 0,
  avg_moment_rating numeric(3,2) DEFAULT 0,
  reputation_score numeric(5,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_host_profiles_user ON public.host_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_host_profiles_reputation ON public.host_profiles(reputation_score DESC);

-- Host piece positions
CREATE TABLE IF NOT EXISTS public.host_piece_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
  holder_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pieces_owned integer NOT NULL DEFAULT 0 CHECK (pieces_owned >= 0),
  total_invested numeric(14,4) NOT NULL DEFAULT 0,
  avg_purchase_price numeric(14,4),
  first_acquired_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_trade_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(host_id, holder_id)
);

CREATE INDEX IF NOT EXISTS idx_host_piece_positions_host ON public.host_piece_positions(host_id);
CREATE INDEX IF NOT EXISTS idx_host_piece_positions_holder ON public.host_piece_positions(holder_id);

-- Host piece price history
CREATE TABLE IF NOT EXISTS public.host_piece_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('1m', '5m', '15m', '1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  open_price numeric(14,4) NOT NULL,
  high_price numeric(14,4) NOT NULL,
  low_price numeric(14,4) NOT NULL,
  close_price numeric(14,4) NOT NULL,
  volume integer DEFAULT 0,
  trade_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(host_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_host_piece_price_history_host ON public.host_piece_price_history(host_id, period_type, period_start DESC);

-- Host piece stats
CREATE TABLE IF NOT EXISTS public.host_piece_stats (
  host_id uuid PRIMARY KEY REFERENCES public.host_profiles(id) ON DELETE CASCADE,
  current_price numeric(14,4) NOT NULL DEFAULT 1.00,
  previous_close numeric(14,4),
  day_open numeric(14,4),
  day_high numeric(14,4),
  day_low numeric(14,4),
  week_high numeric(14,4),
  week_low numeric(14,4),
  all_time_high numeric(14,4),
  all_time_low numeric(14,4),
  total_pieces integer DEFAULT 100,
  available_pieces integer DEFAULT 100,
  market_cap numeric(18,2),
  volume_24h integer DEFAULT 0,
  volume_7d integer DEFAULT 0,
  trade_count_24h integer DEFAULT 0,
  change_24h numeric(8,4) DEFAULT 0,
  change_7d numeric(8,4) DEFAULT 0,
  change_30d numeric(8,4) DEFAULT 0,
  avg_volume_30d integer DEFAULT 0,
  holder_count integer DEFAULT 0,
  last_trade_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- =====================================================
-- 4. VENUE PIECES (NEW)
-- =====================================================

-- Venue profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.venue_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  location text,
  address text,
  city text,
  country text,
  coordinates point,
  venue_type text CHECK (venue_type IN ('cafe', 'restaurant', 'bar', 'club', 'gallery', 'theater', 'outdoor', 'retail', 'other')),
  capacity integer,
  amenities jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  total_moments_hosted integer DEFAULT 0,
  total_checkins integer DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  popularity_score numeric(5,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_venue_profiles_slug ON public.venue_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_city ON public.venue_profiles(city);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_popularity ON public.venue_profiles(popularity_score DESC);

-- Venue piece positions
CREATE TABLE IF NOT EXISTS public.venue_piece_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venue_profiles(id) ON DELETE CASCADE,
  holder_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pieces_owned integer NOT NULL DEFAULT 0 CHECK (pieces_owned >= 0),
  total_invested numeric(14,4) NOT NULL DEFAULT 0,
  avg_purchase_price numeric(14,4),
  first_acquired_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_trade_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(venue_id, holder_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_piece_positions_venue ON public.venue_piece_positions(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_piece_positions_holder ON public.venue_piece_positions(holder_id);

-- Venue piece price history
CREATE TABLE IF NOT EXISTS public.venue_piece_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venue_profiles(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('1m', '5m', '15m', '1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  open_price numeric(14,4) NOT NULL,
  high_price numeric(14,4) NOT NULL,
  low_price numeric(14,4) NOT NULL,
  close_price numeric(14,4) NOT NULL,
  volume integer DEFAULT 0,
  trade_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(venue_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_venue_piece_price_history_venue ON public.venue_piece_price_history(venue_id, period_type, period_start DESC);

-- Venue piece stats
CREATE TABLE IF NOT EXISTS public.venue_piece_stats (
  venue_id uuid PRIMARY KEY REFERENCES public.venue_profiles(id) ON DELETE CASCADE,
  current_price numeric(14,4) NOT NULL DEFAULT 1.00,
  previous_close numeric(14,4),
  day_open numeric(14,4),
  day_high numeric(14,4),
  day_low numeric(14,4),
  week_high numeric(14,4),
  week_low numeric(14,4),
  all_time_high numeric(14,4),
  all_time_low numeric(14,4),
  total_pieces integer DEFAULT 100,
  available_pieces integer DEFAULT 100,
  market_cap numeric(18,2),
  volume_24h integer DEFAULT 0,
  volume_7d integer DEFAULT 0,
  trade_count_24h integer DEFAULT 0,
  change_24h numeric(8,4) DEFAULT 0,
  change_7d numeric(8,4) DEFAULT 0,
  change_30d numeric(8,4) DEFAULT 0,
  avg_volume_30d integer DEFAULT 0,
  holder_count integer DEFAULT 0,
  last_trade_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- =====================================================
-- 5. UNIFIED PIECE TRADES LEDGER
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL, -- references content_id, moment_id, host_id, or venue_id
  buyer_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_piece numeric(14,4) NOT NULL,
  total_value numeric(14,2) NOT NULL,
  trade_type public.piece_trade_type NOT NULL DEFAULT 'market',
  listing_id uuid, -- reference to piece_listings if applicable
  executed_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_trades_asset ON public.piece_trades(piece_type, asset_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_piece_trades_buyer ON public.piece_trades(buyer_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_piece_trades_seller ON public.piece_trades(seller_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_piece_trades_executed ON public.piece_trades(executed_at DESC);

-- =====================================================
-- 6. PIECE LISTINGS (Order Book)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  seller_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_piece numeric(14,4) NOT NULL,
  listing_type text NOT NULL CHECK (listing_type IN ('sell', 'buy')), -- sell = selling pieces, buy = want to buy
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'filled', 'cancelled', 'expired')),
  expires_at timestamptz,
  filled_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_listings_asset ON public.piece_listings(piece_type, asset_id, status, price_per_piece);
CREATE INDEX IF NOT EXISTS idx_piece_listings_seller ON public.piece_listings(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_piece_listings_active ON public.piece_listings(status, expires_at) WHERE status = 'active';

-- =====================================================
-- 7. USER PIECE WATCHLISTS (Unified)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_piece_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Watchlist',
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_user_piece_watchlists_user ON public.user_piece_watchlists(user_id);

-- Watchlist items (supports all piece types)
CREATE TABLE IF NOT EXISTS public.piece_watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid NOT NULL REFERENCES public.user_piece_watchlists(id) ON DELETE CASCADE,
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL, -- content_id, moment_id, host_id, or venue_id
  added_price numeric(14,4),
  notes text,
  alert_above numeric(14,4),
  alert_below numeric(14,4),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(watchlist_id, piece_type, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_watchlist_items_watchlist ON public.piece_watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_piece_watchlist_items_asset ON public.piece_watchlist_items(piece_type, asset_id);

-- =====================================================
-- 8. PIECE CATEGORIES (Expanded from content categories)
-- =====================================================

-- Add piece_type to existing content_categories or create new unified categories
CREATE TABLE IF NOT EXISTS public.piece_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  color text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(piece_type, slug)
);

CREATE INDEX IF NOT EXISTS idx_piece_categories_type ON public.piece_categories(piece_type, display_order);

-- Seed default categories for each piece type
INSERT INTO public.piece_categories (piece_type, name, slug, description, icon, color, display_order) VALUES
  -- Content categories
  ('content', 'Technology', 'tech', 'Tech reviews, tutorials, and innovation content', 'Cpu', '#3B82F6', 1),
  ('content', 'Fashion', 'fashion', 'Style, clothing, and fashion trends', 'Shirt', '#EC4899', 2),
  ('content', 'Music', 'music', 'Music performances, reviews, and artist content', 'Music', '#8B5CF6', 3),
  ('content', 'Comedy', 'comedy', 'Humor, sketches, and entertainment', 'Laugh', '#F59E0B', 4),
  ('content', 'Inspiration', 'inspiration', 'Motivational and inspirational content', 'Sparkles', '#10B981', 5),
  ('content', 'Business', 'business', 'Entrepreneurship, finance, and business insights', 'Briefcase', '#6366F1', 6),
  ('content', 'Gaming', 'gaming', 'Video game content, streams, and reviews', 'Gamepad2', '#EF4444', 7),
  ('content', 'Fitness', 'fitness', 'Health, workout, and wellness content', 'Dumbbell', '#14B8A6', 8),
  ('content', 'Food', 'food', 'Cooking, recipes, and food reviews', 'UtensilsCrossed', '#F97316', 9),
  ('content', 'Travel', 'travel', 'Travel vlogs, destinations, and adventures', 'Plane', '#0EA5E9', 10),
  ('content', 'Education', 'education', 'Learning, tutorials, and educational content', 'GraduationCap', '#8B5CF6', 11),
  ('content', 'Lifestyle', 'lifestyle', 'Daily life, vlogs, and personal content', 'Heart', '#F43F5E', 12),
  -- Moment categories
  ('moment', 'Gatherings', 'gatherings', 'Social meetups and community events', 'Users', '#3B82F6', 1),
  ('moment', 'Experiences', 'experiences', 'Immersive experiences and activations', 'Zap', '#8B5CF6', 2),
  ('moment', 'Drops', 'drops', 'Exclusive product drops and releases', 'Package', '#F97316', 3),
  ('moment', 'Performances', 'performances', 'Live performances and shows', 'Mic2', '#EC4899', 4),
  ('moment', 'Workshops', 'workshops', 'Educational workshops and classes', 'BookOpen', '#10B981', 5),
  ('moment', 'Pop-ups', 'popups', 'Temporary pop-up events', 'Store', '#F59E0B', 6),
  -- Host categories
  ('host', 'Verified Hosts', 'verified', 'Platform verified hosts', 'BadgeCheck', '#10B981', 1),
  ('host', 'Rising Hosts', 'rising', 'Up-and-coming hosts', 'TrendingUp', '#3B82F6', 2),
  ('host', 'Top Rated', 'top-rated', 'Highest rated hosts', 'Star', '#F59E0B', 3),
  ('host', 'Community Favorites', 'community', 'Community favorite hosts', 'Heart', '#EC4899', 4),
  ('host', 'Niche Experts', 'niche', 'Specialized niche hosts', 'Target', '#8B5CF6', 5),
  -- Venue categories
  ('venue', 'Cafes', 'cafes', 'Coffee shops and cafes', 'Coffee', '#8B5CF6', 1),
  ('venue', 'Restaurants', 'restaurants', 'Restaurants and eateries', 'UtensilsCrossed', '#F97316', 2),
  ('venue', 'Bars & Clubs', 'bars-clubs', 'Bars, pubs, and nightclubs', 'Wine', '#EC4899', 3),
  ('venue', 'Galleries', 'galleries', 'Art galleries and museums', 'Palette', '#8B5CF6', 4),
  ('venue', 'Theaters', 'theaters', 'Theaters and cinemas', 'Film', '#3B82F6', 5),
  ('venue', 'Outdoor', 'outdoor', 'Parks and outdoor spaces', 'TreePine', '#10B981', 6),
  ('venue', 'Retail', 'retail', 'Retail stores and boutiques', 'ShoppingBag', '#F59E0B', 7)
ON CONFLICT (piece_type, slug) DO NOTHING;

-- =====================================================
-- 9. MARKET INDICES BY PIECE TYPE
-- =====================================================

-- Category market indices for each piece type
CREATE TABLE IF NOT EXISTS public.piece_category_indices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  category_id uuid NOT NULL REFERENCES public.piece_categories(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  index_value numeric(14,4) NOT NULL,
  open_value numeric(14,4) NOT NULL,
  high_value numeric(14,4) NOT NULL,
  low_value numeric(14,4) NOT NULL,
  close_value numeric(14,4) NOT NULL,
  total_volume integer DEFAULT 0,
  total_market_cap numeric(18,2) DEFAULT 0,
  change_percent numeric(8,4) DEFAULT 0,
  top_gainer_id uuid,
  top_loser_id uuid,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(piece_type, category_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_piece_category_indices_lookup ON public.piece_category_indices(piece_type, category_id, period_type, period_start DESC);

-- Overall market indices by piece type
CREATE TABLE IF NOT EXISTS public.piece_market_indices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  total_market_cap numeric(18,2) NOT NULL,
  total_volume integer DEFAULT 0,
  active_assets integer DEFAULT 0,
  avg_price numeric(14,4),
  index_value numeric(14,4) NOT NULL DEFAULT 1000,
  open_value numeric(14,4),
  high_value numeric(14,4),
  low_value numeric(14,4),
  close_value numeric(14,4),
  change_percent numeric(8,4) DEFAULT 0,
  top_gainers jsonb DEFAULT '[]'::jsonb,
  top_losers jsonb DEFAULT '[]'::jsonb,
  most_traded jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(piece_type, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_piece_market_indices_lookup ON public.piece_market_indices(piece_type, period_type, period_start DESC);

-- =====================================================
-- 10. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Updated at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Content piece stats trigger
CREATE OR REPLACE FUNCTION public.update_content_piece_stats_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.content_piece_stats (content_id, current_price, day_open, day_high, day_low, last_trade_at)
  VALUES (NEW.asset_id, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.executed_at)
  ON CONFLICT (content_id) DO UPDATE SET
    current_price = NEW.price_per_piece,
    day_high = GREATEST(content_piece_stats.day_high, NEW.price_per_piece),
    day_low = LEAST(content_piece_stats.day_low, NEW.price_per_piece),
    week_high = GREATEST(content_piece_stats.week_high, NEW.price_per_piece),
    week_low = LEAST(content_piece_stats.week_low, NEW.price_per_piece),
    all_time_high = GREATEST(content_piece_stats.all_time_high, NEW.price_per_piece),
    all_time_low = LEAST(content_piece_stats.all_time_low, NEW.price_per_piece),
    volume_24h = content_piece_stats.volume_24h + NEW.quantity,
    trade_count_24h = content_piece_stats.trade_count_24h + 1,
    last_trade_at = NEW.executed_at,
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Moment piece stats trigger
CREATE OR REPLACE FUNCTION public.update_moment_piece_stats_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.moment_piece_stats (moment_id, current_price, day_open, day_high, day_low, last_trade_at)
  VALUES (NEW.asset_id, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.executed_at)
  ON CONFLICT (moment_id) DO UPDATE SET
    current_price = NEW.price_per_piece,
    day_high = GREATEST(moment_piece_stats.day_high, NEW.price_per_piece),
    day_low = LEAST(moment_piece_stats.day_low, NEW.price_per_piece),
    week_high = GREATEST(moment_piece_stats.week_high, NEW.price_per_piece),
    week_low = LEAST(moment_piece_stats.week_low, NEW.price_per_piece),
    all_time_high = GREATEST(moment_piece_stats.all_time_high, NEW.price_per_piece),
    all_time_low = LEAST(moment_piece_stats.all_time_low, NEW.price_per_piece),
    volume_24h = moment_piece_stats.volume_24h + NEW.quantity,
    trade_count_24h = moment_piece_stats.trade_count_24h + 1,
    last_trade_at = NEW.executed_at,
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Host piece stats trigger
CREATE OR REPLACE FUNCTION public.update_host_piece_stats_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.host_piece_stats (host_id, current_price, day_open, day_high, day_low, last_trade_at)
  VALUES (NEW.asset_id, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.executed_at)
  ON CONFLICT (host_id) DO UPDATE SET
    current_price = NEW.price_per_piece,
    day_high = GREATEST(host_piece_stats.day_high, NEW.price_per_piece),
    day_low = LEAST(host_piece_stats.day_low, NEW.price_per_piece),
    week_high = GREATEST(host_piece_stats.week_high, NEW.price_per_piece),
    week_low = LEAST(host_piece_stats.week_low, NEW.price_per_piece),
    all_time_high = GREATEST(host_piece_stats.all_time_high, NEW.price_per_piece),
    all_time_low = LEAST(host_piece_stats.all_time_low, NEW.price_per_piece),
    volume_24h = host_piece_stats.volume_24h + NEW.quantity,
    trade_count_24h = host_piece_stats.trade_count_24h + 1,
    last_trade_at = NEW.executed_at,
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Venue piece stats trigger
CREATE OR REPLACE FUNCTION public.update_venue_piece_stats_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.venue_piece_stats (venue_id, current_price, day_open, day_high, day_low, last_trade_at)
  VALUES (NEW.asset_id, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.price_per_piece, NEW.executed_at)
  ON CONFLICT (venue_id) DO UPDATE SET
    current_price = NEW.price_per_piece,
    day_high = GREATEST(venue_piece_stats.day_high, NEW.price_per_piece),
    day_low = LEAST(venue_piece_stats.day_low, NEW.price_per_piece),
    week_high = GREATEST(venue_piece_stats.week_high, NEW.price_per_piece),
    week_low = LEAST(venue_piece_stats.week_low, NEW.price_per_piece),
    all_time_high = GREATEST(venue_piece_stats.all_time_high, NEW.price_per_piece),
    all_time_low = LEAST(venue_piece_stats.all_time_low, NEW.price_per_piece),
    volume_24h = venue_piece_stats.volume_24h + NEW.quantity,
    trade_count_24h = venue_piece_stats.trade_count_24h + 1,
    last_trade_at = NEW.executed_at,
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Master trigger that routes to correct stats table based on piece_type
CREATE OR REPLACE FUNCTION public.update_piece_stats_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.piece_type
    WHEN 'content' THEN
      PERFORM public.update_content_piece_stats_after_trade();
    WHEN 'moment' THEN
      PERFORM public.update_moment_piece_stats_after_trade();
    WHEN 'host' THEN
      PERFORM public.update_host_piece_stats_after_trade();
    WHEN 'venue' THEN
      PERFORM public.update_venue_piece_stats_after_trade();
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_trades_update_stats') THEN
    CREATE TRIGGER trg_piece_trades_update_stats
      AFTER INSERT ON public.piece_trades
      FOR EACH ROW EXECUTE PROCEDURE public.update_piece_stats_after_trade();
  END IF;
END $$;

-- Apply updated_at triggers
DO $$
BEGIN
  -- Content piece tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_piece_positions_touch') THEN
    CREATE TRIGGER trg_content_piece_positions_touch
      BEFORE UPDATE ON public.content_piece_positions FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_piece_stats_touch') THEN
    CREATE TRIGGER trg_content_piece_stats_touch
      BEFORE UPDATE ON public.content_piece_stats FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;

  -- Moment piece tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_moment_piece_positions_touch') THEN
    CREATE TRIGGER trg_moment_piece_positions_touch
      BEFORE UPDATE ON public.moment_piece_positions FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_moment_piece_stats_touch') THEN
    CREATE TRIGGER trg_moment_piece_stats_touch
      BEFORE UPDATE ON public.moment_piece_stats FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;

  -- Host piece tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_host_piece_positions_touch') THEN
    CREATE TRIGGER trg_host_piece_positions_touch
      BEFORE UPDATE ON public.host_piece_positions FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_host_piece_stats_touch') THEN
    CREATE TRIGGER trg_host_piece_stats_touch
      BEFORE UPDATE ON public.host_piece_stats FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_host_profiles_touch') THEN
    CREATE TRIGGER trg_host_profiles_touch
      BEFORE UPDATE ON public.host_profiles FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;

  -- Venue piece tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_venue_piece_positions_touch') THEN
    CREATE TRIGGER trg_venue_piece_positions_touch
      BEFORE UPDATE ON public.venue_piece_positions FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_venue_piece_stats_touch') THEN
    CREATE TRIGGER trg_venue_piece_stats_touch
      BEFORE UPDATE ON public.venue_piece_stats FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_venue_profiles_touch') THEN
    CREATE TRIGGER trg_venue_profiles_touch
      BEFORE UPDATE ON public.venue_profiles FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;

  -- Unified tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_listings_touch') THEN
    CREATE TRIGGER trg_piece_listings_touch
      BEFORE UPDATE ON public.piece_listings FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_piece_watchlists_touch') THEN
    CREATE TRIGGER trg_user_piece_watchlists_touch
      BEFORE UPDATE ON public.user_piece_watchlists FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_categories_touch') THEN
    CREATE TRIGGER trg_piece_categories_touch
      BEFORE UPDATE ON public.piece_categories FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
END $$;

-- =====================================================
-- 11. SEED INITIAL HOST AND VENUE PROFILES (Demo Data)
-- =====================================================

-- Insert demo host profiles (only if users exist)
INSERT INTO public.host_profiles (user_id, display_name, bio, verification_status, reputation_score)
SELECT 
  u.id,
  COALESCE(u.display_name, u.username, 'Host ' || substr(u.id::text, 1, 8)),
  'Experienced event host and community builder',
  'verified',
  4.5 + random()
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.host_profiles h WHERE h.user_id = u.id)
LIMIT 5;

-- Insert demo venue profiles
INSERT INTO public.venue_profiles (name, slug, description, location, city, country, venue_type, capacity, popularity_score)
VALUES 
  ('Central Cafe', 'central-cafe', 'A cozy downtown cafe perfect for intimate gatherings', '123 Main St', 'Kingston', 'Jamaica', 'cafe', 50, 4.2),
  ('Neon Lounge', 'neon-lounge', 'Vibrant nightlife venue with state-of-the-art sound', '456 Broadway', 'Kingston', 'Jamaica', 'bar', 200, 4.5),
  ('Sunset Gallery', 'sunset-gallery', 'Contemporary art gallery with event space', '789 Art Ave', 'Kingston', 'Jamaica', 'gallery', 100, 4.0),
  ('Urban Park', 'urban-park', 'Outdoor community space for large gatherings', '321 Park Rd', 'Kingston', 'Jamaica', 'outdoor', 500, 4.3),
  ('The Workshop', 'the-workshop', 'Creative workshop and co-working space', '555 Create St', 'Kingston', 'Jamaica', 'cafe', 30, 3.8)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 12. ENABLE RLS
-- =====================================================

ALTER TABLE public.content_piece_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_piece_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_piece_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_piece_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_piece_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_piece_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_piece_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_piece_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_piece_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_watchlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own positions
DROP POLICY IF EXISTS "Users can view own content positions" ON public.content_piece_positions;
CREATE POLICY "Users can view own content positions" ON public.content_piece_positions
  FOR SELECT USING (auth.uid() = holder_id);

DROP POLICY IF EXISTS "Users can view own moment positions" ON public.moment_piece_positions;
CREATE POLICY "Users can view own moment positions" ON public.moment_piece_positions
  FOR SELECT USING (auth.uid() = holder_id);

DROP POLICY IF EXISTS "Users can view own host positions" ON public.host_piece_positions;
CREATE POLICY "Users can view own host positions" ON public.host_piece_positions
  FOR SELECT USING (auth.uid() = holder_id);

DROP POLICY IF EXISTS "Users can view own venue positions" ON public.venue_piece_positions;
CREATE POLICY "Users can view own venue positions" ON public.venue_piece_positions
  FOR SELECT USING (auth.uid() = holder_id);

-- Stats are public
DROP POLICY IF EXISTS "Content stats are public" ON public.content_piece_stats;
CREATE POLICY "Content stats are public" ON public.content_piece_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Moment stats are public" ON public.moment_piece_stats;
CREATE POLICY "Moment stats are public" ON public.moment_piece_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Host stats are public" ON public.host_piece_stats;
CREATE POLICY "Host stats are public" ON public.host_piece_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Venue stats are public" ON public.venue_piece_stats;
CREATE POLICY "Venue stats are public" ON public.venue_piece_stats FOR SELECT USING (true);

-- Host and venue profiles are public
DROP POLICY IF EXISTS "Host profiles are public" ON public.host_profiles;
CREATE POLICY "Host profiles are public" ON public.host_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Venue profiles are public" ON public.venue_profiles;
CREATE POLICY "Venue profiles are public" ON public.venue_profiles FOR SELECT USING (true);

-- Trades are public for transparency
DROP POLICY IF EXISTS "Trades are public" ON public.piece_trades;
CREATE POLICY "Trades are public" ON public.piece_trades FOR SELECT USING (true);

-- Users can manage their own listings
DROP POLICY IF EXISTS "Users can manage own listings" ON public.piece_listings;
CREATE POLICY "Users can manage own listings" ON public.piece_listings
  FOR ALL USING (auth.uid() = seller_id);

-- Users can manage their own watchlists
DROP POLICY IF EXISTS "Users can manage own watchlists" ON public.user_piece_watchlists;
CREATE POLICY "Users can manage own watchlists" ON public.user_piece_watchlists
  FOR ALL USING (auth.uid() = user_id);

-- Watchlist items inherit from watchlist ownership via FK
DROP POLICY IF EXISTS "Watchlist items are manageable by watchlist owner" ON public.piece_watchlist_items;
CREATE POLICY "Watchlist items are manageable by watchlist owner" ON public.piece_watchlist_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_piece_watchlists w WHERE w.id = watchlist_id AND w.user_id = auth.uid()));

notify pgrst, 'reload schema';
