-- =============================================
-- UNIVERSAL STABILITY RECOVERY - PHASE 2
-- =============================================
-- This script fixes the core Auth and Moment infrastructure.
-- Run this in the Supabase SQL Editor.
-- =============================================

-- 1. IDENTITY & METADATA FIX (Required for Auth Middleware)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Use UUID from auth.users
    email TEXT,
    username TEXT UNIQUE,
    display_name TEXT,
    user_type TEXT DEFAULT 'regular',
    points_balance INTEGER DEFAULT 0,
    keys_balance INTEGER DEFAULT 0,
    gems_balance INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure existing columns exist if table was created differently
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS keys_balance INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gems_balance INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'regular';

-- 2. MOMENT INFRASTRUCTURE (Expected by Frontend)
CREATE TABLE IF NOT EXISTS public.moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES auth.users(id), -- Expected by useMoments.ts
    organizer_id UUID REFERENCES auth.users(id), -- Expected by backend service
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    location TEXT,
    venue_name TEXT,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    reward TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'joinable',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.moment_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'joined',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(moment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_verified BOOLEAN DEFAULT false,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(moment_id, user_id)
);

-- 3. TELEMETRY (Ensure public table if schema-loading fails)
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    event_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS POLICIES FOR NEW TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Moments: Publicly readable for active/joinable
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'moments_public_view') THEN
        CREATE POLICY moments_public_view ON public.moments FOR SELECT USING (is_active = true OR auth.uid() = host_id);
    END IF;
    -- Moments: Hosts can manage their own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'moments_host_manage') THEN
        CREATE POLICY moments_host_manage ON public.moments FOR ALL USING (auth.uid() = host_id);
    END IF;
    -- Participants: Users can see their own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'moment_participants_own_view') THEN
        CREATE POLICY moment_participants_own_view ON public.moment_participants FOR SELECT USING (auth.uid() = user_id);
    END IF;
    -- Check-ins: Users can see their own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'check_ins_own_view') THEN
        CREATE POLICY check_ins_own_view ON public.check_ins FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
RAISE NOTICE 'Universal Stability Fix Phase 2 Complete.';
