-- Migration: 20260118_bounty_hunter_equity.sql
-- Description: Adds tables for Bounty Hunter scouting and Social Equity Yield

-- 1. Bounty Scout Records: Tracks who "found" external content first
CREATE TABLE IF NOT EXISTS public.bounty_scout_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES public.users(id),
    content_id UUID NOT NULL REFERENCES public.content_pieces(id),
    source_platform TEXT NOT NULL, -- e.g., 'youtube', 'tiktok'
    source_id TEXT NOT NULL, -- The platform's unique ID for the content
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'claimed', 'inactive')),
    finder_fee_percentage DECIMAL(5,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_platform, source_id) -- Only one person can "find" a piece of content
);

-- 2. Content Equity Ledger: Manages distribution of programmatic yield
CREATE TABLE IF NOT EXISTS public.content_equity_ledger (
    content_id UUID PRIMARY KEY REFERENCES public.content_pieces(id),
    creator_equity_escrow DECIMAL(20,8) DEFAULT 0, -- Held for later claim
    scout_equity DECIMAL(20,8) DEFAULT 0,
    community_equity DECIMAL(20,8) DEFAULT 0,
    platform_equity DECIMAL(20,8) DEFAULT 0,
    total_yield_accumulated DECIMAL(20,8) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Platform Yield Cycles: Tracks global revenue for distribution
CREATE TABLE IF NOT EXISTS public.platform_yield_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ NOT NULL,
    total_ad_subscription_revenue DECIMAL(20,2) DEFAULT 0,
    total_merchant_sales_commission DECIMAL(20,2) DEFAULT 0,
    yield_pool_amount DECIMAL(20,2) DEFAULT 0, -- The chunk allocated to users/creators
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'calculating', 'distributed', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.bounty_scout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_equity_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_yield_cycles ENABLE ROW LEVEL SECURITY;

-- 5. Basic Policies (MVP)
-- Scouts can view their own records
DROP POLICY IF EXISTS "Scouts can view own records" ON public.bounty_scout_records;
CREATE POLICY "Scouts can view own records" ON public.bounty_scout_records
    FOR SELECT USING (auth.uid() = scout_id);

-- Everyone can view equity ledgers (transparency)
DROP POLICY IF EXISTS "Public equity ledger transparency" ON public.content_equity_ledger;
CREATE POLICY "Public equity ledger transparency" ON public.content_equity_ledger
    FOR SELECT USING (true);

-- Everyone can view yield cycle status
DROP POLICY IF EXISTS "Public yield cycle info" ON public.platform_yield_cycles;
CREATE POLICY "Public yield cycle info" ON public.platform_yield_cycles
    FOR SELECT USING (true);

-- Functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_content_equity_ledger_modtime ON public.content_equity_ledger;
CREATE TRIGGER update_content_equity_ledger_modtime
    BEFORE UPDATE ON public.content_equity_ledger
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();
