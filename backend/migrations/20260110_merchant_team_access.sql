-- Merchant Team Access Migration
-- Enables multiple users to collaborate on a single merchant account with role-based permissions

BEGIN;

-- ============================================================================
-- PHASE 1: Create new tables for organization model
-- ============================================================================

-- Merchant Accounts Table
-- Represents a business entity/store group
CREATE TABLE IF NOT EXISTS merchant_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                              -- Business/brand name
  slug TEXT UNIQUE,                                -- URL-friendly identifier
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  contact_email TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),     -- Primary owner
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_merchant_accounts_slug ON merchant_accounts(slug);
CREATE INDEX IF NOT EXISTS idx_merchant_accounts_owner ON merchant_accounts(owner_id);

-- Merchant Team Members Table
-- Links users to merchant accounts with specific roles
CREATE TABLE IF NOT EXISTS merchant_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  permissions JSONB DEFAULT '{}',                  -- Granular overrides
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_account_id, user_id)
);

-- Indexes for team member queries
CREATE INDEX IF NOT EXISTS idx_merchant_team_members_account ON merchant_team_members(merchant_account_id);
CREATE INDEX IF NOT EXISTS idx_merchant_team_members_user ON merchant_team_members(user_id);

-- Merchant Invitations Table
-- Pending invitations
CREATE TABLE IF NOT EXISTS merchant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  message TEXT,
  invited_by UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  UNIQUE(merchant_account_id, email)
);

-- ============================================================================
-- PHASE 2: Schema Updates for Resources
-- ============================================================================

DO $$
BEGIN
    -- merchant_stores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchant_stores' AND column_name = 'merchant_account_id') THEN
        ALTER TABLE merchant_stores ADD COLUMN merchant_account_id UUID REFERENCES merchant_accounts(id) ON DELETE SET NULL;
        CREATE INDEX idx_merchant_stores_account ON merchant_stores(merchant_account_id);
    END IF;

    -- products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'merchant_account_id') THEN
        ALTER TABLE products ADD COLUMN merchant_account_id UUID REFERENCES merchant_accounts(id) ON DELETE SET NULL;
        CREATE INDEX idx_products_merchant_account ON products(merchant_account_id);
    END IF;

    -- orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'merchant_account_id') THEN
        ALTER TABLE orders ADD COLUMN merchant_account_id UUID REFERENCES merchant_accounts(id) ON DELETE SET NULL;
        CREATE INDEX idx_orders_merchant_account ON orders(merchant_account_id);
    END IF;
END $$;

-- ============================================================================
-- PHASE 3: Data Migration
-- ============================================================================

-- Create merchant_accounts for all existing users who have a store
INSERT INTO merchant_accounts (id, name, slug, logo_url, description, owner_id, created_at)
SELECT 
  gen_random_uuid(),                               -- New UUID for account
  COALESCE(s.store_name, u.display_name, u.username, 'My Store') as name,
  s.store_slug as slug,
  s.logo_url as logo_url,
  s.description as description,
  u.id as owner_id,
  u.created_at
FROM users u
JOIN merchant_stores s ON u.id = s.user_id
ON CONFLICT (slug) DO NOTHING;

-- Create owner team memberships
INSERT INTO merchant_team_members (merchant_account_id, user_id, role, status, accepted_at)
SELECT 
  ma.id as merchant_account_id,
  ma.owner_id as user_id,
  'owner' as role,
  'active' as status,
  NOW() as accepted_at
FROM merchant_accounts ma;

-- Link merchant_stores to accounts
UPDATE merchant_stores s
SET merchant_account_id = ma.id
FROM merchant_accounts ma
WHERE s.user_id = ma.owner_id
AND s.merchant_account_id IS NULL;

-- Link products to accounts
UPDATE products p
SET merchant_account_id = s.merchant_account_id
FROM merchant_stores s
WHERE p.store_id = s.id
AND p.merchant_account_id IS NULL;

-- Link orders to accounts
UPDATE orders o
SET merchant_account_id = s.merchant_account_id
FROM merchant_stores s
WHERE o.store_id = s.id
AND o.merchant_account_id IS NULL;

-- ============================================================================
-- PHASE 4: Helper Functions & RLS
-- ============================================================================

-- Function to check merchant permissions
CREATE OR REPLACE FUNCTION check_merchant_permission(
  p_user_id UUID,
  p_merchant_account_id UUID,
  p_required_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_role TEXT;
  v_role_hierarchy TEXT[] := ARRAY['staff', 'manager', 'admin', 'owner'];
  v_required_index INT;
  v_user_index INT;
BEGIN
  -- Get user's role for this account
  SELECT role INTO v_user_role
  FROM merchant_team_members
  WHERE user_id = p_user_id 
    AND merchant_account_id = p_merchant_account_id 
    AND status = 'active';
  
  IF v_user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get hierarchy positions
  v_required_index := array_position(v_role_hierarchy, p_required_role);
  v_user_index := array_position(v_role_hierarchy, v_user_role);
  
  RETURN v_user_index >= v_required_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE merchant_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_invitations ENABLE ROW LEVEL SECURITY;

-- Merchant Accounts Policies
CREATE POLICY "Users can view merchant accounts they are members of"
  ON merchant_accounts FOR SELECT
  USING (
    id IN (
      SELECT merchant_account_id FROM merchant_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Update merchant_stores policies
ALTER TABLE merchant_stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Store owners can update their store" ON merchant_stores;
CREATE POLICY "Team members can view their store" ON merchant_stores
    FOR SELECT TO authenticated
    USING (check_merchant_permission(auth.uid(), merchant_account_id, 'staff'));

CREATE POLICY "Admins can manage their store" ON merchant_stores
    FOR ALL TO authenticated
    USING (check_merchant_permission(auth.uid(), merchant_account_id, 'admin'));

-- Update products policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Store owners can manage their products" ON products;
CREATE POLICY "Staff can view team products" ON products
    FOR SELECT TO authenticated
    USING (check_merchant_permission(auth.uid(), merchant_account_id, 'staff'));

CREATE POLICY "Managers can manage team products" ON products
    FOR ALL TO authenticated
    USING (check_merchant_permission(auth.uid(), merchant_account_id, 'staff')); -- Staff can often edit products too

-- Trigger for updated_at
CREATE TRIGGER update_merchant_accounts_updated_at
  BEFORE UPDATE ON merchant_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_team_members_updated_at
  BEFORE UPDATE ON merchant_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
