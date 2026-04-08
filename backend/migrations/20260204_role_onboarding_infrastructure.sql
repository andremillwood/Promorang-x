-- =============================================
-- ROLE ONBOARDING INFRASTRUCTURE
-- Phase 1: Database Schema for Role Management
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER ROLES TABLE
-- Tracks all roles assigned to users
-- =============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('participant', 'host', 'brand', 'merchant', 'admin', 'master_admin')),
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id), -- NULL for auto-granted roles
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_active ON user_roles(user_id, role) WHERE revoked_at IS NULL;

-- =============================================
-- HOST APPLICATIONS TABLE
-- Tracks fast-track applications for Host role
-- =============================================
CREATE TABLE IF NOT EXISTS host_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motivation TEXT NOT NULL,
    moment_idea TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_host_applications_user_id ON host_applications(user_id);
CREATE INDEX idx_host_applications_status ON host_applications(status);
CREATE INDEX idx_host_applications_created_at ON host_applications(created_at);

-- =============================================
-- BRAND ONBOARDING TABLE
-- Tracks brand onboarding progress
-- =============================================
CREATE TABLE IF NOT EXISTS brand_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_website VARCHAR(255),
    industry VARCHAR(100),
    stripe_account_id VARCHAR(255),
    onboarding_status VARCHAR(50) DEFAULT 'started' CHECK (onboarding_status IN ('started', 'payment_setup', 'completed')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brand_onboarding_user_id ON brand_onboarding(user_id);
CREATE INDEX idx_brand_onboarding_status ON brand_onboarding(onboarding_status);

-- =============================================
-- MERCHANT ONBOARDING TABLE
-- Tracks merchant onboarding progress
-- =============================================
CREATE TABLE IF NOT EXISTS merchant_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_name VARCHAR(255) NOT NULL,
    venue_address TEXT NOT NULL,
    venue_type VARCHAR(100),
    google_place_id VARCHAR(255),
    location_verified BOOLEAN DEFAULT FALSE,
    photo_urls JSONB,
    onboarding_status VARCHAR(50) DEFAULT 'started' CHECK (onboarding_status IN ('started', 'verification', 'completed')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_merchant_onboarding_user_id ON merchant_onboarding(user_id);
CREATE INDEX idx_merchant_onboarding_status ON merchant_onboarding(onboarding_status);

-- =============================================
-- MIGRATE EXISTING DATA
-- =============================================

-- Grant 'participant' role to all existing users
INSERT INTO user_roles (user_id, role, granted_at, granted_by)
SELECT 
    id,
    'participant',
    created_at,
    NULL
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Migrate existing advertisers to 'brand' role
-- Note: Skipping this migration as we need to determine advertiser status from organizations table
-- This will be handled by the application layer when users complete brand onboarding

-- Migrate existing admins to 'admin' role
-- Note: Skipping automatic admin migration
-- Admins will be manually designated via master admin panel

-- =============================================
-- DESIGNATE MASTER ADMINS
-- =============================================

-- Grant master_admin role to specified emails
INSERT INTO user_roles (user_id, role, granted_at, granted_by)
SELECT 
    id,
    'master_admin',
    NOW(),
    NULL
FROM auth.users
WHERE email IN ('andremillwood@gmail.com', 'andre@promorang.co')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also grant admin role to master admins if they don't have it
INSERT INTO user_roles (user_id, role, granted_at, granted_by)
SELECT 
    id,
    'admin',
    NOW(),
    NULL
FROM auth.users
WHERE email IN ('andremillwood@gmail.com', 'andre@promorang.co')
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_id = p_user_id 
        AND role = p_role 
        AND revoked_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant role to user
CREATE OR REPLACE FUNCTION grant_user_role(
    p_user_id UUID,
    p_role VARCHAR,
    p_granted_by UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES (p_user_id, p_role, p_granted_by)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET 
        revoked_at = NULL,
        granted_at = NOW(),
        granted_by = p_granted_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke role from user
CREATE OR REPLACE FUNCTION revoke_user_role(
    p_user_id UUID,
    p_role VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_roles
    SET 
        revoked_at = NOW(),
        revocation_reason = p_reason
    WHERE user_id = p_user_id 
    AND role = p_role 
    AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all active roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE(role VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT ur.role
    FROM user_roles ur
    WHERE ur.user_id = p_user_id
    AND ur.revoked_at IS NULL
    ORDER BY ur.granted_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY user_roles_own_view ON user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY user_roles_admin_view ON user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'master_admin')
            AND ur.revoked_at IS NULL
        )
    );

-- Master admins can manage all roles
CREATE POLICY user_roles_master_admin_manage ON user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'master_admin'
            AND ur.revoked_at IS NULL
        )
    );

-- Users can view their own host applications
CREATE POLICY host_applications_own_view ON host_applications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own host applications
CREATE POLICY host_applications_own_create ON host_applications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view and manage all host applications
CREATE POLICY host_applications_admin_manage ON host_applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'master_admin')
            AND ur.revoked_at IS NULL
        )
    );

-- Similar policies for brand_onboarding and merchant_onboarding
CREATE POLICY brand_onboarding_own_manage ON brand_onboarding
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY merchant_onboarding_own_manage ON merchant_onboarding
    FOR ALL
    USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp on host_applications
CREATE OR REPLACE FUNCTION update_host_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER host_applications_updated_at
    BEFORE UPDATE ON host_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_host_applications_updated_at();

-- Update updated_at timestamp on brand_onboarding
CREATE TRIGGER brand_onboarding_updated_at
    BEFORE UPDATE ON brand_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_host_applications_updated_at();

-- Update updated_at timestamp on merchant_onboarding
CREATE TRIGGER merchant_onboarding_updated_at
    BEFORE UPDATE ON merchant_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_host_applications_updated_at();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Role onboarding infrastructure successfully created!';
    RAISE NOTICE 'Tables: user_roles, host_applications, brand_onboarding, merchant_onboarding';
    RAISE NOTICE 'Master admins designated for: andremillwood@gmail.com, andre@promorang.co';
END $$;
