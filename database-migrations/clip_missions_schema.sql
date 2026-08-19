-- =============================================
-- CLIP MISSIONS & SPONSORED CLIPPING SCHEMA
-- =============================================

-- 1. CLIP MISSIONS TABLE
-- Stores long-form media clip offers (creator funded or brand sponsored)
CREATE TABLE IF NOT EXISTS clip_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_id UUID REFERENCES drops(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sponsor_brand_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional brand sponsor
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source_video_url TEXT NOT NULL,
    timestamps_json JSONB DEFAULT '[]'::jsonb, -- e.g. [{"start": 120, "end": 180, "label": "Viral Hot Take"}]
    brand_promo_code VARCHAR(100), -- Trackable brand offer code
    brand_landing_url TEXT, -- Trackable brand affiliate/landing URL
    cpm_payout_rate DECIMAL(10,2) NOT NULL DEFAULT 500.00, -- Gems per 1,000 verified views
    conversion_commission_pct DECIMAL(5,2) DEFAULT 5.00, -- % commission on brand sales
    creator_rev_share_pct DECIMAL(5,2) DEFAULT 10.00, -- % residual share to creator
    total_budget_gems INT DEFAULT 100000,
    remaining_budget_gems INT DEFAULT 100000,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLIP SUBMISSIONS TABLE
-- Tracks short-form clips published by clippers/promoters
CREATE TABLE IF NOT EXISTS clip_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clip_mission_id UUID REFERENCES clip_missions(id) ON DELETE CASCADE,
    promoter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(30) NOT NULL CHECK (platform IN ('tiktok', 'reels', 'youtube_shorts')),
    published_url TEXT NOT NULL UNIQUE,
    verified_views INT DEFAULT 0,
    verified_likes INT DEFAULT 0,
    verified_shares INT DEFAULT 0,
    gems_earned INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    last_polled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for fast querying
CREATE INDEX IF NOT EXISTS idx_clip_missions_creator ON clip_missions(creator_id);
CREATE INDEX IF NOT EXISTS idx_clip_missions_sponsor ON clip_missions(sponsor_brand_id);
CREATE INDEX IF NOT EXISTS idx_clip_missions_status ON clip_missions(status);
CREATE INDEX IF NOT EXISTS idx_clip_submissions_mission ON clip_submissions(clip_mission_id);
CREATE INDEX IF NOT EXISTS idx_clip_submissions_promoter ON clip_submissions(promoter_id);

-- Row Level Security (RLS) Policies
ALTER TABLE clip_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_submissions ENABLE ROW LEVEL SECURITY;

-- Public can view active clip missions
CREATE POLICY clip_missions_public_select ON clip_missions
FOR SELECT USING (status = 'active');

-- Creators and Sponsors can manage their clip missions
CREATE POLICY clip_missions_owner_manage ON clip_missions
FOR ALL USING (
    creator_id = auth.uid() OR sponsor_brand_id = auth.uid()
);

-- Promoters can view their own submissions
CREATE POLICY clip_submissions_promoter_select ON clip_submissions
FOR SELECT USING (promoter_id = auth.uid());

-- Promoters can insert new clip submissions
CREATE POLICY clip_submissions_promoter_insert ON clip_submissions
FOR INSERT WITH CHECK (promoter_id = auth.uid());
