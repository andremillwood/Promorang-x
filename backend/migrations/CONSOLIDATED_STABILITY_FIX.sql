-- =============================================
-- CONSOLIDATED STABILITY RECOVERY SCRIPT
-- =============================================
-- This script fixes the schema desynchronization by creating
-- missing tables/functions/types required for the current app.
-- =============================================

-- 1. ENUM TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loyalty_tier') THEN
        CREATE TYPE public.loyalty_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'ambassador');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'point_action') THEN
        CREATE TYPE public.point_action AS ENUM ('checkin', 'referral', 'review', 'media_upload', 'redemption', 'bonus', 'expiry', 'adjustment', 'affiliate_commission');
    END IF;
END $$;

-- 2. ROLE MANAGEMENT TABLES
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'participant',
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.host_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motivation TEXT NOT NULL,
    moment_idea TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LOYALTY SYSTEM TABLES
CREATE TABLE IF NOT EXISTS public.user_brand_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    brand_id UUID NOT NULL,
    current_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    current_tier loyalty_tier DEFAULT 'bronze',
    tier_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, brand_id)
);

CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    brand_id UUID NOT NULL,
    points INTEGER NOT NULL,
    action point_action NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. TELEMETRY
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE TABLE IF NOT EXISTS telemetry.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    event_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RPC FUNCTIONS
DROP FUNCTION IF EXISTS public.user_has_role(UUID, TEXT);
DROP FUNCTION IF EXISTS public.user_has_role(UUID, VARCHAR);
CREATE OR REPLACE FUNCTION public.user_has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = p_user_id 
        AND role = p_role 
        AND revoked_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.get_user_roles(UUID);
CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id UUID)
RETURNS TABLE(role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT ur.role::text
    FROM public.user_roles ur
    WHERE ur.user_id = p_user_id
    AND ur.revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.grant_user_role(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS public.grant_user_role(UUID, VARCHAR, UUID);
CREATE OR REPLACE FUNCTION public.grant_user_role(p_user_id UUID, p_role TEXT, p_granted_by UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (p_user_id, p_role, p_granted_by)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET 
        revoked_at = NULL,
        granted_at = NOW(),
        granted_by = p_granted_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. PERMISSIVE RLS FOR DEVELOPMENT
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brand_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_roles_own_view') THEN
        CREATE POLICY user_roles_own_view ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'host_applications_own_view') THEN
        CREATE POLICY host_applications_own_view ON public.host_applications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_brand_points_own_view') THEN
        CREATE POLICY user_brand_points_own_view ON public.user_brand_points FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'point_transactions_own_view') THEN
        CREATE POLICY point_transactions_own_view ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
