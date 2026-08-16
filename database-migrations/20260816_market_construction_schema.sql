-- Migration: 20260816_market_construction_schema.sql
-- Description: Adds database support for Persistent Scenes, Intent Moments, Sub-Moments, Discovery Polls/Questions, PromoKeys, and Stakeholder Lead CRM.

BEGIN;

-- 1. SAFE EXPANSION OF SCENES TABLE (Uses existing 'title' column structure)
CREATE TABLE IF NOT EXISTS public.scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100) DEFAULT 'Kingston',
    country VARCHAR(100) DEFAULT 'Jamaica',
    image_url TEXT,
    visibility VARCHAR(20) DEFAULT 'public',
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add title column if scenes existed under a different definition
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. SCENE MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.scene_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES public.scenes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scene_id, user_id)
);

-- 3. MARKET INTELLIGENCE DISCOVERY QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.discovery_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_name VARCHAR(255) DEFAULT 'Community Scout',
    threshold_for_moment INT DEFAULT 100,
    total_votes INT DEFAULT 0,
    is_moment_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DISCOVERY OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.discovery_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discovery_id UUID REFERENCES public.discovery_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    votes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DISCOVERY VOTES TABLE
CREATE TABLE IF NOT EXISTS public.discovery_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discovery_id UUID REFERENCES public.discovery_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.discovery_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discovery_id, user_id)
);

-- 6. PROMOKEY CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.promokey_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID,
    user_id UUID NOT NULL,
    promo_code VARCHAR(50) NOT NULL UNIQUE,
    perk_description TEXT NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MARKETPLACE CRM LEADS TABLE
CREATE TABLE IF NOT EXISTS public.marketplace_crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- VENUE, MOMENT_OWNER, CREATOR, BRAND
    contact_person VARCHAR(255),
    phone VARCHAR(100),
    email VARCHAR(255),
    stage VARCHAR(50) DEFAULT 'LEAD', -- LEAD, DIAGNOSTIC, PILOT_PROPOSED, ACTIVE, REPORTING, RENEWAL
    scene_affinity VARCHAR(255),
    off_peak_capacity_perk TEXT,
    objective TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED INITIAL SCENES (USING 'title' AND 'image_url')
INSERT INTO public.scenes (slug, title, description, city, country, image_url)
VALUES 
    ('kingston-after-dark', 'Kingston After Dark', 'The definitive lens for nightlife, late-night food spots, live music, and party culture in Kingston.', 'Kingston', 'Jamaica', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'),
    ('food-and-taste', 'Food & Taste Jamaica', 'Discover underrated breakfast joints, street vendors, chef popups, and signature dining experiences.', 'Kingston', 'Jamaica', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'),
    ('move-jamaica', 'Move & Fitness Jamaica', 'Active lifestyle, outdoor runs, fitness popups, wellness retreats, and beach workouts.', 'Kingston', 'Jamaica', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title, 
    description = EXCLUDED.description, 
    image_url = EXCLUDED.image_url, 
    updated_at = NOW();

COMMIT;
