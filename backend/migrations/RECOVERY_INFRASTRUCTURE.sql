
-- =============================================
-- CRITICAL INFRASTRUCTURE RECOVERY SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR
-- =============================================

-- 1. FIX RLS INFINITE RECURSION
-- First, drop the recursive policies
DROP POLICY IF EXISTS user_roles_admin_view ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

-- Create robust security definer that bypasses RLS
CREATE OR REPLACE FUNCTION public.check_is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-apply policies with non-recursive base case
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id OR check_is_admin());

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles FOR ALL
USING (check_is_admin());


-- 2. RESTORE MISSING TABLES
-- Restore moment_participants
CREATE TABLE IF NOT EXISTS public.moment_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'checked_in', 'completed', 'cancelled')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (moment_id, user_id)
);
ALTER TABLE public.moment_participants ENABLE ROW LEVEL SECURITY;

-- Restore moment_hosts (if missing)
CREATE TABLE IF NOT EXISTS public.moment_hosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'lead' CHECK (role IN ('lead', 'co-host', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (moment_id, user_id)
);
ALTER TABLE public.moment_hosts ENABLE ROW LEVEL SECURITY;

-- Restore moment_checkins (Expected by Dashboard UI)
CREATE TABLE IF NOT EXISTS public.moment_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_code TEXT,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_verified BOOLEAN DEFAULT false,
  UNIQUE (moment_id, user_id)
);
ALTER TABLE public.moment_checkins ENABLE ROW LEVEL SECURITY;


-- 3. APPLY BASIC POLICIES FOR DASHBOARD
CREATE POLICY "Users can view their own participations" 
ON public.moment_participants FOR SELECT 
USING (auth.uid() = user_id OR check_is_admin());

CREATE POLICY "Users can view their own hostings" 
ON public.moment_hosts FOR SELECT 
USING (auth.uid() = user_id OR check_is_admin());

CREATE POLICY "Users can view their own checkins" 
ON public.moment_checkins FOR SELECT 
USING (auth.uid() = user_id OR check_is_admin());

-- Final Sync Success
DO $$ BEGIN
    RAISE NOTICE 'Infrastructure Recovery Complete. Dashboard should now load without 404/Recursion errors.';
END $$;
