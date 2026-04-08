-- Migration: Game Layer Phase 2 (Houses & Districts)
-- Adds game-world metadata for immersive layering.

-- 1. Houses for Users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS house_id VARCHAR(20);

COMMENT ON COLUMN public.users.house_id IS 'Game house affiliation (Solis, Luna, Terra, Aether)';

-- 2. Districts for Campaigns (Questlines)
-- Note: Using advertiser_campaigns as the base table for Questlines
ALTER TABLE public.advertiser_campaigns 
ADD COLUMN IF NOT EXISTS district_id VARCHAR(50);

COMMENT ON COLUMN public.advertiser_campaigns.district_id IS 'Game district thematic grouping (Neon Ward, Sovereign Spire, etc.)';

-- 3. Districts for Stores (Trading Posts)
ALTER TABLE public.merchant_stores 
ADD COLUMN IF NOT EXISTS district_id VARCHAR(50);

COMMENT ON COLUMN public.merchant_stores.district_id IS 'Game district thematic grouping (Neon Ward, Sovereign Spire, etc.)';

-- 4. Sample Data Initialization (Default assignments)
UPDATE public.advertiser_campaigns SET district_id = 'Neon Ward' WHERE district_id IS NULL;
UPDATE public.merchant_stores SET district_id = 'Sovereign Spire' WHERE district_id IS NULL;

-- 5. Indexing for filtering
CREATE INDEX IF NOT EXISTS idx_users_house ON public.users(house_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_district ON public.advertiser_campaigns(district_id);
CREATE INDEX IF NOT EXISTS idx_stores_district ON public.merchant_stores(district_id);
