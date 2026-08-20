-- Migration: Create ManyChat syncs table and enhance profiles with Instagram metadata

-- 1. Ensure profiles has instagram fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_username TEXT,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS influence_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0;

-- 2. Create manychat_syncs table
CREATE TABLE IF NOT EXISTS public.manychat_syncs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    instagram TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    follower_count INTEGER NOT NULL DEFAULT 0,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for fast lookup by user and instagram handle
CREATE INDEX IF NOT EXISTS idx_manychat_syncs_user_id ON public.manychat_syncs(user_id);
CREATE INDEX IF NOT EXISTS idx_manychat_syncs_instagram ON public.manychat_syncs(lower(instagram));
CREATE INDEX IF NOT EXISTS idx_manychat_syncs_synced_at ON public.manychat_syncs(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_username ON public.profiles(lower(instagram_username));

-- 4. Enable RLS
ALTER TABLE public.manychat_syncs ENABLE ROW LEVEL SECURITY;

-- Policies: users can view their own syncs, service role has full access
CREATE POLICY "Users can view their own manychat syncs"
    ON public.manychat_syncs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to manychat syncs"
    ON public.manychat_syncs
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
