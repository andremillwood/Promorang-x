-- Content Shares Market Enhancement
-- Adds categories, price history (OHLC), market indices, and watchlists
-- Timestamp: 2026-01-10

-- Content categories for bundling shares
CREATE TABLE IF NOT EXISTS public.content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text, -- lucide icon name
  color text, -- hex color for UI
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Seed default categories
INSERT INTO public.content_categories (name, slug, description, icon, color, display_order) VALUES
  ('Technology', 'tech', 'Tech reviews, tutorials, and innovation content', 'Cpu', '#3B82F6', 1),
  ('Fashion', 'fashion', 'Style, clothing, and fashion trends', 'Shirt', '#EC4899', 2),
  ('Music', 'music', 'Music performances, reviews, and artist content', 'Music', '#8B5CF6', 3),
  ('Comedy', 'comedy', 'Humor, sketches, and entertainment', 'Laugh', '#F59E0B', 4),
  ('Inspiration', 'inspiration', 'Motivational and inspirational content', 'Sparkles', '#10B981', 5),
  ('Business', 'business', 'Entrepreneurship, finance, and business insights', 'Briefcase', '#6366F1', 6),
  ('Gaming', 'gaming', 'Video game content, streams, and reviews', 'Gamepad2', '#EF4444', 7),
  ('Fitness', 'fitness', 'Health, workout, and wellness content', 'Dumbbell', '#14B8A6', 8),
  ('Food', 'food', 'Cooking, recipes, and food reviews', 'UtensilsCrossed', '#F97316', 9),
  ('Travel', 'travel', 'Travel vlogs, destinations, and adventures', 'Plane', '#0EA5E9', 10),
  ('Education', 'education', 'Learning, tutorials, and educational content', 'GraduationCap', '#8B5CF6', 11),
  ('Lifestyle', 'lifestyle', 'Daily life, vlogs, and personal content', 'Heart', '#F43F5E', 12)
ON CONFLICT (slug) DO NOTHING;

-- Link content to categories (many-to-many)
CREATE TABLE IF NOT EXISTS public.content_category_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.content_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(content_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_content_category_links_content ON public.content_category_links(content_id);
CREATE INDEX IF NOT EXISTS idx_content_category_links_category ON public.content_category_links(category_id);

-- Price history for candlestick charts (OHLC data)
CREATE TABLE IF NOT EXISTS public.content_share_price_history (
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
CREATE INDEX IF NOT EXISTS idx_content_share_price_history_content ON public.content_share_price_history(content_id, period_type, period_start DESC);

-- Category market indices (aggregate performance)
CREATE TABLE IF NOT EXISTS public.category_market_indices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.content_categories(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  index_value numeric(14,4) NOT NULL, -- weighted average of category shares
  open_value numeric(14,4) NOT NULL,
  high_value numeric(14,4) NOT NULL,
  low_value numeric(14,4) NOT NULL,
  close_value numeric(14,4) NOT NULL,
  total_volume integer DEFAULT 0,
  total_market_cap numeric(18,2) DEFAULT 0,
  change_percent numeric(8,4) DEFAULT 0,
  top_gainer_id uuid REFERENCES public.content_items(id),
  top_loser_id uuid REFERENCES public.content_items(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(category_id, period_type, period_start)
);
CREATE INDEX IF NOT EXISTS idx_category_market_indices_category ON public.category_market_indices(category_id, period_type, period_start DESC);

-- Overall market index (all content shares)
CREATE TABLE IF NOT EXISTS public.market_index_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type text NOT NULL CHECK (period_type IN ('1h', '4h', '1d', '1w')),
  period_start timestamptz NOT NULL,
  total_market_cap numeric(18,2) NOT NULL,
  total_volume integer DEFAULT 0,
  active_shares integer DEFAULT 0,
  avg_price numeric(14,4),
  index_value numeric(14,4) NOT NULL DEFAULT 1000, -- base index value
  open_value numeric(14,4),
  high_value numeric(14,4),
  low_value numeric(14,4),
  close_value numeric(14,4),
  change_percent numeric(8,4) DEFAULT 0,
  top_gainers jsonb DEFAULT '[]', -- array of {content_id, change_percent}
  top_losers jsonb DEFAULT '[]',
  most_traded jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(period_type, period_start)
);
CREATE INDEX IF NOT EXISTS idx_market_index_snapshots_period ON public.market_index_snapshots(period_type, period_start DESC);

-- User watchlists for tracking favorite shares
CREATE TABLE IF NOT EXISTS public.user_share_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Watchlist',
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_user_share_watchlists_user ON public.user_share_watchlists(user_id);

-- Watchlist items
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid NOT NULL REFERENCES public.user_share_watchlists(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  added_price numeric(14,4), -- price when added to watchlist
  notes text,
  alert_above numeric(14,4), -- price alert thresholds
  alert_below numeric(14,4),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(watchlist_id, content_id)
);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist ON public.watchlist_items(watchlist_id);

-- Share trades ledger for accurate price history
CREATE TABLE IF NOT EXISTS public.share_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price_per_share numeric(14,4) NOT NULL,
  total_value numeric(14,2) NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('market', 'limit', 'ipo', 'dividend_reinvest')),
  listing_id uuid, -- reference to share_listings if applicable
  executed_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_share_trades_content ON public.share_trades(content_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_trades_buyer ON public.share_trades(buyer_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_trades_seller ON public.share_trades(seller_id, executed_at DESC);

-- Content share stats (real-time aggregates)
CREATE TABLE IF NOT EXISTS public.content_share_stats (
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
  total_shares integer DEFAULT 100,
  available_shares integer DEFAULT 100,
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

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_categories_touch') THEN
    CREATE TRIGGER trg_content_categories_touch
      BEFORE UPDATE ON public.content_categories
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_share_watchlists_touch') THEN
    CREATE TRIGGER trg_user_share_watchlists_touch
      BEFORE UPDATE ON public.user_share_watchlists
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_share_stats_touch') THEN
    CREATE TRIGGER trg_content_share_stats_touch
      BEFORE UPDATE ON public.content_share_stats
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
END $$;

-- Function to update content share stats after a trade
CREATE OR REPLACE FUNCTION public.update_share_stats_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.content_share_stats (content_id, current_price, day_open, day_high, day_low, last_trade_at)
  VALUES (NEW.content_id, NEW.price_per_share, NEW.price_per_share, NEW.price_per_share, NEW.price_per_share, NEW.executed_at)
  ON CONFLICT (content_id) DO UPDATE SET
    current_price = NEW.price_per_share,
    day_high = GREATEST(content_share_stats.day_high, NEW.price_per_share),
    day_low = LEAST(content_share_stats.day_low, NEW.price_per_share),
    week_high = GREATEST(content_share_stats.week_high, NEW.price_per_share),
    week_low = LEAST(content_share_stats.week_low, NEW.price_per_share),
    all_time_high = GREATEST(content_share_stats.all_time_high, NEW.price_per_share),
    all_time_low = LEAST(content_share_stats.all_time_low, NEW.price_per_share),
    volume_24h = content_share_stats.volume_24h + NEW.quantity,
    trade_count_24h = content_share_stats.trade_count_24h + 1,
    last_trade_at = NEW.executed_at,
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_share_trades_update_stats') THEN
    CREATE TRIGGER trg_share_trades_update_stats
      AFTER INSERT ON public.share_trades
      FOR EACH ROW EXECUTE PROCEDURE public.update_share_stats_after_trade();
  END IF;
END $$;
