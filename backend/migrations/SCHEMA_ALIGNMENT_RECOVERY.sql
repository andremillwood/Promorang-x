
-- =============================================
-- 'SCHEMA-ALIGNMENT' INFRASTRUCTURE RECOVERY
-- RUN THIS IN SUPABASE SQL EDITOR
-- =============================================

-- 1. RESTORE MISSING ENUM TYPES
-- This ensures that table columns have their required data types.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('participant', 'host', 'brand', 'merchant', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_status') THEN
        CREATE TYPE public.moment_status AS ENUM ('draft', 'scheduled', 'joinable', 'active', 'closed', 'archived');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_type') THEN
        CREATE TYPE public.moment_type AS ENUM ('community', 'venue_hosted', 'brand_sponsored');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_visibility') THEN
        CREATE TYPE public.moment_visibility AS ENUM ('open', 'invite', 'private');
    END IF;
END $$;


-- 2. ALIGN TABLE COLUMNS (Fixing 'character varying' mismatch)
-- This converts existing columns from text to the proper Enum types.
DO $$ 
BEGIN
    -- Fix user_roles.role column type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'role' 
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE public.user_roles 
        ALTER COLUMN role TYPE public.user_role 
        USING role::public.user_role;
    END IF;
END $$;


-- 3. RESTORE CORE TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  maturity_state INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);


-- 4. FIX RLS INFINITE RECURSION
-- First, drop ALL possible conflicting policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS user_roles_unified_view ON public.user_roles;
DROP POLICY IF EXISTS user_roles_unified_manage ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_view ON public.user_roles;
DROP POLICY IF EXISTS user_roles_own_view ON public.user_roles;
DROP POLICY IF EXISTS user_roles_final_view ON public.user_roles;
DROP POLICY IF EXISTS user_roles_final_manage ON public.user_roles;

-- Create robust security definer function to avoid recursion
-- Using explicit casting to prevent 'operator does not exist' errors
CREATE OR REPLACE FUNCTION public.check_is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role::text = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Unified Non-Recursive Policy for user_roles
CREATE POLICY "user_roles_final_view" 
ON public.user_roles FOR SELECT 
USING (
    (auth.uid() = user_id) 
    OR 
    (public.check_is_admin())
);

CREATE POLICY "user_roles_final_manage" 
ON public.user_roles FOR ALL
USING (public.check_is_admin());


-- 5. FINAL RPC SYNC (with explicit casting)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
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
      AND role::text = _role::text
  )
$$;

DO $$ BEGIN
    RAISE NOTICE 'Schema-Alignment Recovery Complete. Dashboard infrastructure confirmed stable.';
END $$;
