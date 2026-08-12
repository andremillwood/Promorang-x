-- =============================================
-- DISCOVERIES & CAMPAIGNS SCHEMA EXPANSION
-- Adds Evergreen Discoveries, Business Campaigns, and Category Reputation Scores
-- =============================================

-- 1. EVERGREEN DISCOVERIES TABLE
CREATE TABLE IF NOT EXISTS discoveries (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- restaurant, beach, trail, attraction, hidden_gem, product, media
    description TEXT,
    cover_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    location_address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    city VARCHAR(100),
    country VARCHAR(100),
    venue_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verification_status VARCHAR(20) DEFAULT 'approved' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    checkin_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for discoveries
CREATE INDEX IF NOT EXISTS idx_discoveries_slug ON discoveries(slug);
CREATE INDEX IF NOT EXISTS idx_discoveries_category ON discoveries(category);
CREATE INDEX IF NOT EXISTS idx_discoveries_city ON discoveries(city);

-- 2. CAMPAIGNS TABLE SAFE EXPANSION
-- Creates table if not present, or safely adds missing columns if pre-existing
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Safely add expansion columns if table already existed
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS objective VARCHAR(50) DEFAULT 'awareness';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS budget_usd DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS spent_usd DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS gem_pool_allocated INTEGER DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS points_pool_allocated INTEGER DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS promopush_managed BOOLEAN DEFAULT FALSE;

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- 3. CAMPAIGN DISCOVERIES & MOMENTS JUNCTIONS
CREATE TABLE IF NOT EXISTS campaign_discoveries (
    id BIGSERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    discovery_id BIGINT REFERENCES discoveries(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, discovery_id)
);

CREATE TABLE IF NOT EXISTS campaign_moments (
    id BIGSERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    moment_id UUID REFERENCES drops(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, moment_id)
);

-- 4. REPUTATION SCORES TABLE (Domain-Specific Authority)
CREATE TABLE IF NOT EXISTS reputation_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- food_explorer, music_scout, beach_hunter, top_reviewer, community_leader
    score INTEGER DEFAULT 0,
    title_level VARCHAR(50) DEFAULT 'Novice', -- Novice, Scout, Insider, Specialist, Master
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_reputation_scores_user ON reputation_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_category ON reputation_scores(category);
