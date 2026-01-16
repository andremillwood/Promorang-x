-- Advertiser Team Access Migration
-- Enables multiple users to collaborate on a single advertiser account with role-based permissions

-- ============================================================================
-- PHASE 1: Create new tables for organization model
-- ============================================================================

-- Advertiser Accounts Table
-- Represents a brand/business entity separate from individual users
CREATE TABLE IF NOT EXISTS advertiser_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                              -- Business/brand name
  slug TEXT UNIQUE,                                -- URL-friendly identifier
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  industry TEXT,
  billing_email TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_advertiser_accounts_slug ON advertiser_accounts(slug);
CREATE INDEX IF NOT EXISTS idx_advertiser_accounts_created_by ON advertiser_accounts(created_by);

-- Advertiser Team Members Table
-- Links users to advertiser accounts with specific roles
CREATE TABLE IF NOT EXISTS advertiser_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_account_id UUID NOT NULL REFERENCES advertiser_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'manager', 'viewer')),
  permissions JSONB DEFAULT '{}',                  -- Optional granular permissions override
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advertiser_account_id, user_id)
);

-- Indexes for team member queries
CREATE INDEX IF NOT EXISTS idx_team_members_account ON advertiser_team_members(advertiser_account_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON advertiser_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON advertiser_team_members(status);

-- Advertiser Invitations Table
-- Pending invitations (before user accepts)
CREATE TABLE IF NOT EXISTS advertiser_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_account_id UUID NOT NULL REFERENCES advertiser_accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),  -- Can't invite as owner
  message TEXT,                                    -- Optional personal message from inviter
  invited_by UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  UNIQUE(advertiser_account_id, email)             -- One pending invite per email per account
);

-- Indexes for invitation queries
CREATE INDEX IF NOT EXISTS idx_invitations_account ON advertiser_invitations(advertiser_account_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON advertiser_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON advertiser_invitations(token);

-- ============================================================================
-- PHASE 2: Migrate existing advertisers to advertiser_accounts
-- ============================================================================

-- Create advertiser_accounts for all existing advertiser users
INSERT INTO advertiser_accounts (id, name, slug, logo_url, description, created_by, created_at)
SELECT 
  u.id,                                            -- Use same ID as user for easy migration
  COALESCE(u.display_name, u.username, 'My Brand') as name,
  u.username as slug,
  u.avatar_url as logo_url,
  u.bio as description,
  u.id as created_by,
  u.created_at
FROM users u
WHERE u.user_type = 'advertiser'
ON CONFLICT (id) DO NOTHING;

-- Create owner team memberships for migrated accounts
INSERT INTO advertiser_team_members (advertiser_account_id, user_id, role, status, accepted_at)
SELECT 
  u.id as advertiser_account_id,
  u.id as user_id,
  'owner' as role,
  'active' as status,
  NOW() as accepted_at
FROM users u
WHERE u.user_type = 'advertiser'
ON CONFLICT (advertiser_account_id, user_id) DO NOTHING;

-- ============================================================================
-- PHASE 3: Row Level Security Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE advertiser_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_invitations ENABLE ROW LEVEL SECURITY;

-- Advertiser Accounts Policies
CREATE POLICY "Users can view accounts they are members of"
  ON advertiser_accounts FOR SELECT
  USING (
    id IN (
      SELECT advertiser_account_id FROM advertiser_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team admins and owners can update account"
  ON advertiser_accounts FOR UPDATE
  USING (
    id IN (
      SELECT advertiser_account_id FROM advertiser_team_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can create advertiser accounts"
  ON advertiser_accounts FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Only owners can delete accounts"
  ON advertiser_accounts FOR DELETE
  USING (
    id IN (
      SELECT advertiser_account_id FROM advertiser_team_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role = 'owner'
    )
  );

-- Team Members Policies
CREATE POLICY "Users can view team members of their accounts"
  ON advertiser_team_members FOR SELECT
  USING (
    advertiser_account_id IN (
      SELECT advertiser_account_id FROM advertiser_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Admins and owners can manage team members"
  ON advertiser_team_members FOR ALL
  USING (
    advertiser_account_id IN (
      SELECT advertiser_account_id FROM advertiser_team_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin')
    )
  );

-- Invitations Policies
CREATE POLICY "Admins can view and manage invitations"
  ON advertiser_invitations FOR ALL
  USING (
    advertiser_account_id IN (
      SELECT advertiser_account_id FROM advertiser_team_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PHASE 4: Helper Functions
-- ============================================================================

-- Function to check if a user has a specific permission level for an account
CREATE OR REPLACE FUNCTION check_advertiser_permission(
  p_user_id UUID,
  p_advertiser_account_id UUID,
  p_required_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_role TEXT;
  v_role_hierarchy TEXT[] := ARRAY['viewer', 'manager', 'admin', 'owner'];
  v_required_index INT;
  v_user_index INT;
BEGIN
  -- Get user's role for this account
  SELECT role INTO v_user_role
  FROM advertiser_team_members
  WHERE user_id = p_user_id 
    AND advertiser_account_id = p_advertiser_account_id 
    AND status = 'active';
  
  IF v_user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get hierarchy positions
  v_required_index := array_position(v_role_hierarchy, p_required_role);
  v_user_index := array_position(v_role_hierarchy, v_user_role);
  
  -- User has permission if their role is at or above required level
  RETURN v_user_index >= v_required_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all accounts a user has access to
CREATE OR REPLACE FUNCTION get_user_advertiser_accounts(p_user_id UUID)
RETURNS TABLE (
  account_id UUID,
  account_name TEXT,
  account_slug TEXT,
  account_logo TEXT,
  user_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aa.id,
    aa.name,
    aa.slug,
    aa.logo_url,
    atm.role
  FROM advertiser_accounts aa
  JOIN advertiser_team_members atm ON aa.id = atm.advertiser_account_id
  WHERE atm.user_id = p_user_id AND atm.status = 'active'
  ORDER BY atm.role = 'owner' DESC, aa.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 5: Triggers for updated_at
-- ============================================================================

-- Trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_advertiser_accounts_updated_at ON advertiser_accounts;
CREATE TRIGGER update_advertiser_accounts_updated_at
  BEFORE UPDATE ON advertiser_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON advertiser_team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON advertiser_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
