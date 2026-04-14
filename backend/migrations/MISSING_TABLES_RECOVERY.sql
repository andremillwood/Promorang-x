-- =============================================
-- FRONTEND DEPENDENCIES RECOVERY
-- This script creates the missing tables expected by the 
-- BrandDashboard ('campaigns' and 'event_bounties'). 
-- It resolves the 404 Not Found errors on the frontend.
-- =============================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create or Replace Campaigns Table
-- First, drop the old incompatible campaigns table if it was created from earlier migrations
DROP TABLE IF EXISTS public.campaigns CASCADE;

CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    budget DECIMAL(10,2),
    reward_type TEXT DEFAULT 'discount',
    reward_value TEXT,
    target_categories TEXT[],
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT false,
    impressions INTEGER DEFAULT 0,
    redemptions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and setup permissive policies for frontend access
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view own campaigns"
    ON public.campaigns FOR SELECT
    USING (auth.uid() = brand_id);

CREATE POLICY "Brands can manage own campaigns"
    ON public.campaigns FOR ALL
    USING (auth.uid() = brand_id);

-- 2. Create Event Bounties Table
DROP TABLE IF EXISTS public.event_bounties CASCADE;
DROP TABLE IF EXISTS public.moment_bounties CASCADE;

CREATE TABLE public.event_bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    target_category TEXT,
    target_location TEXT,
    target_date_range JSONB,
    target_min_participants INTEGER DEFAULT 10,
    payout_amount DECIMAL(10,2) DEFAULT 0,
    platform_fee_percent DECIMAL(5,2) DEFAULT 10.0,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fulfilled_moment_id UUID,
    status TEXT DEFAULT 'open',
    expires_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Also create the moment_bounties view/table as fallback if the code switches back
CREATE VIEW public.moment_bounties AS SELECT * FROM public.event_bounties;

-- Enable RLS and setup permissive policies for frontend access on event_bounties
ALTER TABLE public.event_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view open event_bounties"
    ON public.event_bounties FOR SELECT
    USING (status = 'open' OR auth.uid() = brand_id OR auth.uid() = assigned_to);

CREATE POLICY "Brands can manage own event_bounties"
    ON public.event_bounties FOR ALL
    USING (auth.uid() = brand_id);

CREATE POLICY "Hosts can update assigned event_bounties"
    ON public.event_bounties FOR UPDATE
    USING (auth.uid() = assigned_to);

-- Refresh the PostgREST schema cache to ensure the API recognizes the tables
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN
    RAISE NOTICE 'Successfully provisions campaigns and event_bounties tables for the UI.';
END $$;
