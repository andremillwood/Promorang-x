-- Create moment_type enum for ownership classification
CREATE TYPE public.moment_type AS ENUM ('community', 'venue_hosted', 'brand_sponsored');

-- Create reward_type enum for consistent reward categorization
CREATE TYPE public.reward_type AS ENUM ('discount', 'freebie', 'points', 'voucher', 'experience', 'access');

-- Add venue_id FK and moment_type to moments table
ALTER TABLE public.moments
ADD COLUMN venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
ADD COLUMN moment_type public.moment_type NOT NULL DEFAULT 'community',
ADD COLUMN campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Add index for venue lookups (merchant analytics)
CREATE INDEX idx_moments_venue_id ON public.moments(venue_id);

-- Add index for campaign lookups (brand analytics)
CREATE INDEX idx_moments_campaign_id ON public.moments(campaign_id);

-- Update rewards table to use the new reward_type enum
-- First add a new column, migrate data, then drop old
ALTER TABLE public.rewards
ADD COLUMN reward_type_enum public.reward_type;

-- Migrate existing text values to enum (with fallback to 'discount')
UPDATE public.rewards
SET reward_type_enum = CASE
  WHEN reward_type ILIKE '%discount%' THEN 'discount'::public.reward_type
  WHEN reward_type ILIKE '%free%' THEN 'freebie'::public.reward_type
  WHEN reward_type ILIKE '%point%' THEN 'points'::public.reward_type
  WHEN reward_type ILIKE '%voucher%' THEN 'voucher'::public.reward_type
  WHEN reward_type ILIKE '%experience%' THEN 'experience'::public.reward_type
  WHEN reward_type ILIKE '%access%' THEN 'access'::public.reward_type
  ELSE 'discount'::public.reward_type
END;

-- Drop old column and rename new one
ALTER TABLE public.rewards DROP COLUMN reward_type;
ALTER TABLE public.rewards RENAME COLUMN reward_type_enum TO reward_type;
ALTER TABLE public.rewards ALTER COLUMN reward_type SET NOT NULL;
ALTER TABLE public.rewards ALTER COLUMN reward_type SET DEFAULT 'discount'::public.reward_type;

-- Update campaigns table to use enum for reward_type as well
ALTER TABLE public.campaigns
ADD COLUMN reward_type_enum public.reward_type;

UPDATE public.campaigns
SET reward_type_enum = CASE
  WHEN reward_type ILIKE '%discount%' THEN 'discount'::public.reward_type
  WHEN reward_type ILIKE '%free%' THEN 'freebie'::public.reward_type
  WHEN reward_type ILIKE '%point%' THEN 'points'::public.reward_type
  WHEN reward_type ILIKE '%voucher%' THEN 'voucher'::public.reward_type
  WHEN reward_type ILIKE '%experience%' THEN 'experience'::public.reward_type
  WHEN reward_type ILIKE '%access%' THEN 'access'::public.reward_type
  ELSE 'discount'::public.reward_type
END;

ALTER TABLE public.campaigns DROP COLUMN reward_type;
ALTER TABLE public.campaigns RENAME COLUMN reward_type_enum TO reward_type;
ALTER TABLE public.campaigns ALTER COLUMN reward_type SET NOT NULL;
ALTER TABLE public.campaigns ALTER COLUMN reward_type SET DEFAULT 'discount'::public.reward_type;

-- Add RLS policy for brands to view moments linked to their campaigns
CREATE POLICY "Brands can view moments linked to their campaigns"
ON public.moments
FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE brand_id = auth.uid()
  )
);

-- Add RLS policy for merchants to view moments at their venues
CREATE POLICY "Merchants can view moments at their venues"
ON public.moments
FOR SELECT
USING (
  venue_id IN (
    SELECT id FROM public.venues WHERE owner_id = auth.uid()
  )
);