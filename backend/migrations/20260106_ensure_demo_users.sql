-- Ensure demo users exist with static UUIDs for stable demo mode interactions
-- These UUIDs match the mapping in backend/middleware/auth.js

-- 1. Demo Creator
INSERT INTO public.users (id, email, username, display_name, user_type)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'creator@demo.com',
    'demo_creator',
    'Demo Creator',
    'creator'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    user_type = EXCLUDED.user_type;

-- 2. Demo Advertiser
INSERT INTO public.users (id, email, username, display_name, user_type)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'advertiser@demo.com',
    'demo_advertiser',
    'Demo Advertiser',
    'advertiser'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    user_type = EXCLUDED.user_type;

-- 3. Ensure event_rsvps table exists (it might be missing from some environments)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going',
    check_in_code TEXT UNIQUE,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
