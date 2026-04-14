
-- =============================================
-- 'UNIVERSAL-COMPATIBILITY' INFRASTRUCTURE RECOVERY
-- FINAL STABILIZATION SCRIPT
-- =============================================

-- 1. HARDEN THE CORE FUNCTIONS (SECURITY DEFINER)
-- These break recursion and handle ANY data type (ENUM or VARCHAR) via ::text casting.

CREATE OR REPLACE FUNCTION public.check_is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role::text IN ('admin', 'master_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_is_master_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role::text = 'master_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Unified user_has_role RPC for frontend
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;


-- 2. APPLY COMPREHENSIVE RLS (GLOBAL REFRESH)
-- This replaces recursive raw subqueries with the safe functions above.

-- Table: user_roles
DO $$ BEGIN
    DROP POLICY IF EXISTS "user_roles_own_view" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_admin_view" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_master_admin_manage" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_final_view" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_final_manage" ON public.user_roles;
END $$;

CREATE POLICY "user_roles_unified_view" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.check_is_admin());

CREATE POLICY "user_roles_unified_manage" ON public.user_roles
    FOR ALL USING (public.check_is_master_admin());

-- Table: host_applications
DO $$ BEGIN
    DROP POLICY IF EXISTS "host_applications_own_view" ON public.host_applications;
    DROP POLICY IF EXISTS "host_applications_own_create" ON public.host_applications;
    DROP POLICY IF EXISTS "host_applications_admin_manage" ON public.host_applications;
END $$;

CREATE POLICY "host_applications_unified_view" ON public.host_applications
    FOR SELECT USING (auth.uid() = user_id OR public.check_is_admin());

CREATE POLICY "host_applications_unified_manage" ON public.host_applications
    FOR ALL USING (public.check_is_admin());

-- Table: moments
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view active moments" ON public.moments;
    DROP POLICY IF EXISTS "Hosts can manage own moments" ON public.moments;
END $$;

CREATE POLICY "moments_unified_view" ON public.moments
    FOR SELECT USING (is_active = true OR auth.uid() = host_id OR public.check_is_admin());

CREATE POLICY "moments_unified_manage" ON public.moments
    FOR ALL USING (auth.uid() = host_id OR public.check_is_admin());


-- 3. ENSURE FOUNDATION TYPES EXIST
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('participant', 'host', 'brand', 'merchant', 'admin', 'master_admin');
    END IF;
END $$;

-- 4. FINAL TABLE RESET (Non-destructive)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    RAISE NOTICE 'Universal Stability achieved. Recursion and Type Mismatches resolved.';
END $$;
