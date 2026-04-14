
-- =============================================
-- 'CLEAN SLATE' SECURITY RECOVERY SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR
-- =============================================

-- 1. NUKE ALL KNOWN POLICIES ON USER_ROLES
-- This force-clears all conflicting names found in your migrations.
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS user_roles_own_view ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_view ON public.user_roles;
DROP POLICY IF EXISTS user_roles_master_admin_manage ON public.user_roles;
DROP POLICY IF EXISTS master_admin_all ON public.user_roles;

-- 2. HARDEN THE ADMIN CHECK FUNCTION
-- Re-creating check_is_admin as a SECURITY DEFINER to bypass RLS recursion.
CREATE OR REPLACE FUNCTION public.check_is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) INTO is_admin;
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. APPLY SINGLE, NON-RECURSIVE SECURITY POLICY
-- Strategy:
-- 'Users can view their own roles' -> (auth.uid() = user_id) is always safe.
-- 'Admins can manage all' -> uses the SECURITY DEFINER check_is_admin() which bypasses recursion.

-- Policy for viewing
CREATE POLICY "user_roles_unified_view" 
ON public.user_roles FOR SELECT 
USING (
    (auth.uid() = user_id) 
    OR 
    (public.check_is_admin())
);

-- Policy for modifications (Admins Only)
CREATE POLICY "user_roles_unified_manage" 
ON public.user_roles FOR ALL
USING (public.check_is_admin())
WITH CHECK (public.check_is_admin());

-- 4. RE-STRENGTHEN THE has_role RPC
-- Used by the frontend/AuthContext
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
      AND role = _role
  )
$$;

-- 5. FINAL RESET
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    RAISE NOTICE 'Clean-Slate Recovery Complete. ALL conflicting user_roles policies have been nuked and rebuilt.';
END $$;
