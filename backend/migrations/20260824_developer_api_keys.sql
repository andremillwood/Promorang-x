-- Migration: Developer API Keys and Headless Access Controls
-- Description: Manages external developer API keys, permission scopes, rate limits, and usage tracking.

CREATE TABLE IF NOT EXISTS public.developer_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,           -- e.g. "pk_live_" or "pk_test_"
    key_hash TEXT NOT NULL UNIQUE,       -- SHA-256 hash of secret key
    masked_key TEXT NOT NULL,            -- e.g. "pk_live_ab...1234"
    scopes TEXT[] NOT NULL DEFAULT ARRAY['feed:read', 'coupons:claim'],
    is_active BOOLEAN NOT NULL DEFAULT true,
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 120,
    environment TEXT NOT NULL DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by key hash
CREATE INDEX IF NOT EXISTS idx_developer_api_keys_hash ON public.developer_api_keys(key_hash) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_developer_api_keys_user ON public.developer_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_developer_api_keys_org ON public.developer_api_keys(organization_id);

-- Enable RLS
ALTER TABLE public.developer_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view and manage their own API keys
CREATE POLICY "Users can manage own api keys" ON public.developer_api_keys
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
