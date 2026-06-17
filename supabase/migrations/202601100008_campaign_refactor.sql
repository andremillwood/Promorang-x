-- Campaign Refactor: Promorang-style campaigns with content, drops, and coupons
-- Timestamp: 2026-01-10

-- ============================================================================
-- CAMPAIGN CONTENT ITEMS
-- Content pieces that are part of a campaign (links, images, videos to promote)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.advertiser_campaigns(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('link', 'image', 'video', 'text')),
    title TEXT NOT NULL,
    url TEXT,
    description TEXT,
    media_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_campaign_content_items_campaign 
    ON public.campaign_content_items(campaign_id);

-- ============================================================================
-- CAMPAIGN DROPS
-- Creator tasks associated with a campaign
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.advertiser_campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    drop_type TEXT NOT NULL CHECK (drop_type IN ('share', 'create', 'engage', 'review')),
    gem_reward INTEGER NOT NULL DEFAULT 10,
    keys_cost INTEGER NOT NULL DEFAULT 1,
    max_participants INTEGER NOT NULL DEFAULT 100,
    current_participants INTEGER NOT NULL DEFAULT 0,
    requirements TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    promoshare_tickets_per_completion INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_campaign_drops_campaign 
    ON public.campaign_drops(campaign_id, status);

-- ============================================================================
-- CAMPAIGN DROP APPLICATIONS
-- Users applying to/completing campaign drops
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_drop_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_id UUID NOT NULL REFERENCES public.campaign_drops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    submission_url TEXT,
    submission_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id),
    gems_awarded INTEGER DEFAULT 0,
    tickets_awarded INTEGER DEFAULT 0,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    completed_at TIMESTAMPTZ,
    UNIQUE(drop_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_drop_applications_drop 
    ON public.campaign_drop_applications(drop_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_drop_applications_user 
    ON public.campaign_drop_applications(user_id, status);

-- ============================================================================
-- CAMPAIGN COUPONS
-- Coupons/incentives attached to a campaign
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.advertiser_campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'freebie')),
    discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity_total INTEGER NOT NULL DEFAULT 100,
    quantity_remaining INTEGER NOT NULL DEFAULT 100,
    code TEXT,
    expires_at TIMESTAMPTZ,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_campaign_coupons_campaign 
    ON public.campaign_coupons(campaign_id);

-- ============================================================================
-- CAMPAIGN COUPON CLAIMS
-- Users claiming campaign coupons
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_coupon_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.campaign_coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    redeemed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'redeemed', 'expired')),
    UNIQUE(coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_coupon_claims_coupon 
    ON public.campaign_coupon_claims(coupon_id);
CREATE INDEX IF NOT EXISTS idx_campaign_coupon_claims_user 
    ON public.campaign_coupon_claims(user_id);

-- ============================================================================
-- ALTER EXISTING CAMPAIGNS TABLE
-- Add new fields for Promorang-style campaigns
-- ============================================================================
DO $$
BEGIN
    -- Add promoshare_contribution column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'advertiser_campaigns'
        AND column_name = 'promoshare_contribution'
    ) THEN
        ALTER TABLE public.advertiser_campaigns
        ADD COLUMN promoshare_contribution INTEGER DEFAULT 0;
    END IF;

    -- Add total_gem_budget column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'advertiser_campaigns'
        AND column_name = 'total_gem_budget'
    ) THEN
        ALTER TABLE public.advertiser_campaigns
        ADD COLUMN total_gem_budget INTEGER DEFAULT 0;
    END IF;

    -- Add gems_spent column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'advertiser_campaigns'
        AND column_name = 'gems_spent'
    ) THEN
        ALTER TABLE public.advertiser_campaigns
        ADD COLUMN gems_spent INTEGER DEFAULT 0;
    END IF;

    -- Add description column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'advertiser_campaigns'
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.advertiser_campaigns
        ADD COLUMN description TEXT;
    END IF;
END $$;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaign_content_items_updated_at ON public.campaign_content_items;
CREATE TRIGGER campaign_content_items_updated_at
    BEFORE UPDATE ON public.campaign_content_items
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS campaign_drops_updated_at ON public.campaign_drops;
CREATE TRIGGER campaign_drops_updated_at
    BEFORE UPDATE ON public.campaign_drops
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS campaign_coupons_updated_at ON public.campaign_coupons;
CREATE TRIGGER campaign_coupons_updated_at
    BEFORE UPDATE ON public.campaign_coupons
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.campaign_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_drop_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_coupon_claims ENABLE ROW LEVEL SECURITY;

-- Campaign content items: viewable by all, editable by campaign owner
CREATE POLICY "Campaign content items are viewable by everyone"
    ON public.campaign_content_items FOR SELECT
    USING (true);

CREATE POLICY "Campaign content items are editable by campaign owner"
    ON public.campaign_content_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.advertiser_campaigns c
            WHERE c.id = campaign_id AND c.advertiser_id = auth.uid()
        )
    );

-- Campaign drops: viewable by all, editable by campaign owner
CREATE POLICY "Campaign drops are viewable by everyone"
    ON public.campaign_drops FOR SELECT
    USING (true);

CREATE POLICY "Campaign drops are editable by campaign owner"
    ON public.campaign_drops FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.advertiser_campaigns c
            WHERE c.id = campaign_id AND c.advertiser_id = auth.uid()
        )
    );

-- Drop applications: viewable by applicant or campaign owner
CREATE POLICY "Drop applications viewable by participant or owner"
    ON public.campaign_drop_applications FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.campaign_drops d
            JOIN public.advertiser_campaigns c ON c.id = d.campaign_id
            WHERE d.id = drop_id AND c.advertiser_id = auth.uid()
        )
    );

CREATE POLICY "Users can apply to drops"
    ON public.campaign_drop_applications FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications"
    ON public.campaign_drop_applications FOR UPDATE
    USING (user_id = auth.uid());

-- Campaign coupons: viewable by all
CREATE POLICY "Campaign coupons are viewable by everyone"
    ON public.campaign_coupons FOR SELECT
    USING (true);

CREATE POLICY "Campaign coupons are editable by campaign owner"
    ON public.campaign_coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.advertiser_campaigns c
            WHERE c.id = campaign_id AND c.advertiser_id = auth.uid()
        )
    );

-- Coupon claims: viewable by claimer
CREATE POLICY "Coupon claims viewable by claimer"
    ON public.campaign_coupon_claims FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can claim coupons"
    ON public.campaign_coupon_claims FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- HELPER FUNCTION: Get campaign stats
-- ============================================================================
CREATE OR REPLACE FUNCTION get_campaign_stats(p_campaign_id UUID)
RETURNS TABLE (
    total_drops INTEGER,
    total_applications INTEGER,
    completed_applications INTEGER,
    total_gems_awarded INTEGER,
    total_tickets_awarded INTEGER,
    total_coupons INTEGER,
    coupons_claimed INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM public.campaign_drops WHERE campaign_id = p_campaign_id),
        (SELECT COUNT(*)::INTEGER FROM public.campaign_drop_applications da
         JOIN public.campaign_drops d ON d.id = da.drop_id
         WHERE d.campaign_id = p_campaign_id),
        (SELECT COUNT(*)::INTEGER FROM public.campaign_drop_applications da
         JOIN public.campaign_drops d ON d.id = da.drop_id
         WHERE d.campaign_id = p_campaign_id AND da.status = 'completed'),
        (SELECT COALESCE(SUM(da.gems_awarded), 0)::INTEGER FROM public.campaign_drop_applications da
         JOIN public.campaign_drops d ON d.id = da.drop_id
         WHERE d.campaign_id = p_campaign_id),
        (SELECT COALESCE(SUM(da.tickets_awarded), 0)::INTEGER FROM public.campaign_drop_applications da
         JOIN public.campaign_drops d ON d.id = da.drop_id
         WHERE d.campaign_id = p_campaign_id),
        (SELECT COUNT(*)::INTEGER FROM public.campaign_coupons WHERE campaign_id = p_campaign_id),
        (SELECT COUNT(*)::INTEGER FROM public.campaign_coupon_claims cc
         JOIN public.campaign_coupons c ON c.id = cc.coupon_id
         WHERE c.campaign_id = p_campaign_id);
END;
$$ LANGUAGE plpgsql;
