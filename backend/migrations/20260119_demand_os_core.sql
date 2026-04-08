-- =====================================================
-- DEMAND OS CORE INFRASTRUCTURE
-- Implements Campaign Maturity, Drop Weighting, and Gem USD Logic
-- =====================================================

DO $$ 
BEGIN
    -- 1. Campaign Maturity Levels
    -- Level 1: Seed (Incentives only)
    -- Level 2: Activated (100 purchases proven)
    -- Level 3: Funded (Escrow live)
    -- Level 4: Dominant (Category ownership)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advertiser_campaigns') THEN
        ALTER TABLE public.advertiser_campaigns 
        ADD COLUMN IF NOT EXISTS campaign_maturity VARCHAR(20) DEFAULT 'seed' 
        CHECK (campaign_maturity IN ('seed', 'activated', 'funded', 'dominant'));
    END IF;

    -- 2. Drop Roles & Weighting
    -- Roles: buy, activate, create, influence, review, share
    -- Weights: 1.0, 1.3, 0.8, 1.1, 0.6, 0.3
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drops') THEN
        ALTER TABLE public.drops 
        ADD COLUMN IF NOT EXISTS drop_role VARCHAR(20) DEFAULT 'share' 
        CHECK (drop_role IN ('buy', 'activate', 'create', 'influence', 'review', 'share')),
        ADD COLUMN IF NOT EXISTS drop_weight DECIMAL(3,2) DEFAULT 0.30,
        ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.advertiser_campaigns(id) ON DELETE SET NULL;
        
        -- Default weights based on role
        UPDATE public.drops SET drop_weight = 1.0 WHERE drop_role = 'buy' AND drop_weight = 0.30;
        UPDATE public.drops SET drop_weight = 1.3 WHERE drop_role = 'activate' AND drop_weight = 0.30;
        UPDATE public.drops SET drop_weight = 0.8 WHERE drop_role = 'create' AND drop_weight = 0.30;
        UPDATE public.drops SET drop_weight = 1.1 WHERE drop_role = 'influence' AND drop_weight = 0.30;
        UPDATE public.drops SET drop_weight = 0.6 WHERE drop_role = 'review' AND drop_weight = 0.30;
    END IF;

    -- 3. Gem USD Logic
    -- Add USD value tracking to transactions for "Financially Real" transparency
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transaction_history') THEN
        ALTER TABLE public.transaction_history 
        ADD COLUMN IF NOT EXISTS usd_value DECIMAL(15,2),
        ADD COLUMN IF NOT EXISTS usd_rate_at_time DECIMAL(15,4);
    END IF;

    -- 4. Payout/Withdrawal Requests
    CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        gems_amount INTEGER NOT NULL,
        usd_value DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL, -- 'paypal', 'venmo', 'bank'
        payment_details JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
        processed_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 5. System Settings (for GEM_USD_RATE)
    CREATE TABLE IF NOT EXISTS public.system_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO public.system_settings (key, value, description)
    VALUES ('GEM_USD_RATE', '{"rate": 1.0}', 'Conversion rate from 1 Gem to USD')
    ON CONFLICT (key) DO NOTHING;

END $$;
