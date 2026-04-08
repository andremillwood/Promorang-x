-- =====================================================
-- BUY MISSION VERIFICATION INFRASTRUCTURE
-- Adds verification workflow and weighted contribution tracking
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drop_applications') THEN
        -- Verification status for Buy Missions
        ALTER TABLE public.drop_applications 
        ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected', 'escalated'));
        
        -- Weighted gems earned (contribution attribution)
        ALTER TABLE public.drop_applications 
        ADD COLUMN IF NOT EXISTS weighted_gems_earned DECIMAL(12,2) DEFAULT 0;
        
        -- Reviewer tracking
        ALTER TABLE public.drop_applications 
        ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS review_notes TEXT;
        
        -- Create index for efficient pending proof queries
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'drop_applications' AND indexname = 'idx_drop_applications_verification_pending') THEN
            CREATE INDEX idx_drop_applications_verification_pending 
            ON public.drop_applications(verification_status, created_at) 
            WHERE verification_status = 'pending';
        END IF;
    END IF;

    -- Campaign Escrow table (for Funded campaigns)
    CREATE TABLE IF NOT EXISTS public.campaign_escrow (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID NOT NULL REFERENCES public.advertiser_campaigns(id) ON DELETE CASCADE,
        gems_deposited INTEGER NOT NULL DEFAULT 0,
        gems_paid_out INTEGER NOT NULL DEFAULT 0,
        gems_remaining INTEGER GENERATED ALWAYS AS (gems_deposited - gems_paid_out) STORED,
        status VARCHAR(20) DEFAULT 'unfunded' CHECK (status IN ('unfunded', 'funded', 'depleted', 'refunded')),
        funded_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Buy Mission verification log (audit trail)
    CREATE TABLE IF NOT EXISTS public.verification_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        application_id UUID NOT NULL REFERENCES public.drop_applications(id) ON DELETE CASCADE,
        action VARCHAR(20) NOT NULL CHECK (action IN ('submitted', 'verified', 'rejected', 'escalated', 'auto_verified')),
        actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
        reason TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

END $$;
