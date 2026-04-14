-- =============================================
-- MIGRATION: FIX RLS INFINITE RECURSION
-- DATE: 2026-02-05
-- DESCRIPTION: Fixes 'infinite recursion detected in policy' for user_roles
--              and organization_members by using security definer functions.
-- =============================================

-- 1. STAKEHOLDER ROLE HELPER
CREATE OR REPLACE FUNCTION public.check_is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'master_admin') 
        AND revoked_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. ORGANIZATION MEMBERSHIP HELPER
CREATE OR REPLACE FUNCTION public.check_is_org_member(p_org_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = p_org_id 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. FIX USER_ROLES POLICIES
DROP POLICY IF EXISTS user_roles_admin_view ON user_roles;
CREATE POLICY user_roles_admin_view ON user_roles
    FOR SELECT
    USING (check_is_admin());

-- 4. FIX ORGANIZATION_MEMBERS POLICIES
DROP POLICY IF EXISTS "Members can view their team" ON organization_members;
CREATE POLICY "Members can view their team"
    ON organization_members FOR SELECT
    USING (check_is_org_member(organization_id));

-- 5. FIX ORGANIZATION POLICIES (Optional but recommended for consistency)
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
CREATE POLICY "Members can view their organizations"
    ON organizations FOR SELECT
    USING (check_is_org_member(id));

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$ BEGIN
    RAISE NOTICE 'RLS recursion fixes applied successfully!';
END $$;
