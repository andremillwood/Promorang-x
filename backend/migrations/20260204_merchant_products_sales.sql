-- Phase 29: Merchant Dashboard Completion
-- Migration: 20260204_merchant_products_sales.sql
-- Description: Adds merchant product catalog, inventory tracking, and sales analytics

-- Merchant Products Table (Enhanced)
-- Note: merchant_products may already exist, so we'll use ALTER TABLE to add new columns
DO $$ 
BEGIN
    -- Check if table exists, create if not
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'merchant_products') THEN
        CREATE TABLE merchant_products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            price_usd DECIMAL(10,2),
            price_points INTEGER,
            image_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Add new columns for inventory and redemption tracking
ALTER TABLE merchant_products
ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT NULL, -- NULL = unlimited
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS redemption_limit_per_user INTEGER DEFAULT NULL, -- NULL = unlimited
ADD COLUMN IF NOT EXISTS total_redemptions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_generated DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_conditions TEXT,
ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'bogo', 'free_item')),
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2);

-- Product Sales/Redemptions Table
CREATE TABLE IF NOT EXISTS product_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES merchant_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    merchant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sale_type TEXT NOT NULL CHECK (sale_type IN ('points', 'cash', 'redemption')),
    amount_paid DECIMAL(10,2),
    points_paid INTEGER,
    redemption_code TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'expired', 'cancelled')),
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchant Inventory Logs (for tracking stock changes)
CREATE TABLE IF NOT EXISTS merchant_inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES merchant_products(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('restock', 'sale', 'adjustment', 'expired')),
    quantity_change INTEGER NOT NULL, -- Positive for additions, negative for reductions
    previous_count INTEGER,
    new_count INTEGER,
    reason TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchant_products_merchant 
ON merchant_products(merchant_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_merchant_products_venue 
ON merchant_products(venue_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_merchant_products_category 
ON merchant_products(category) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_product_sales_product 
ON product_sales(product_id);

CREATE INDEX IF NOT EXISTS idx_product_sales_user 
ON product_sales(user_id);

CREATE INDEX IF NOT EXISTS idx_product_sales_merchant 
ON product_sales(merchant_id);

CREATE INDEX IF NOT EXISTS idx_product_sales_status 
ON product_sales(status);

CREATE INDEX IF NOT EXISTS idx_product_sales_created 
ON product_sales(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_sales_redemption_code 
ON product_sales(redemption_code) WHERE redemption_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product 
ON merchant_inventory_logs(product_id, created_at DESC);

-- Row Level Security Policies

-- merchant_products RLS
ALTER TABLE merchant_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active products" ON merchant_products;
DROP POLICY IF EXISTS "Merchants can manage their own products" ON merchant_products;

CREATE POLICY "Public can view active products"
    ON merchant_products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Merchants can manage their own products"
    ON merchant_products FOR ALL
    USING (merchant_id = auth.uid())
    WITH CHECK (merchant_id = auth.uid());

-- product_sales RLS
ALTER TABLE product_sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own purchases" ON product_sales;
DROP POLICY IF EXISTS "Merchants can view sales of their products" ON product_sales;
DROP POLICY IF EXISTS "Merchants can validate redemptions" ON product_sales;
DROP POLICY IF EXISTS "System can create sales" ON product_sales;

CREATE POLICY "Users can view their own purchases"
    ON product_sales FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Merchants can view sales of their products"
    ON product_sales FOR SELECT
    USING (
        merchant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM merchant_products
            WHERE merchant_products.id = product_sales.product_id
            AND merchant_products.merchant_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can validate redemptions"
    ON product_sales FOR UPDATE
    USING (
        merchant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM merchant_products
            WHERE merchant_products.id = product_sales.product_id
            AND merchant_products.merchant_id = auth.uid()
        )
    );

CREATE POLICY "System can create sales"
    ON product_sales FOR INSERT
    WITH CHECK (true);

-- merchant_inventory_logs RLS
ALTER TABLE merchant_inventory_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Merchants can view their inventory logs" ON merchant_inventory_logs;
DROP POLICY IF EXISTS "Merchants can create inventory logs" ON merchant_inventory_logs;

CREATE POLICY "Merchants can view their inventory logs"
    ON merchant_inventory_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM merchant_products
            WHERE merchant_products.id = merchant_inventory_logs.product_id
            AND merchant_products.merchant_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can create inventory logs"
    ON merchant_inventory_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM merchant_products
            WHERE merchant_products.id = merchant_inventory_logs.product_id
            AND merchant_products.merchant_id = auth.uid()
        )
    );

-- Triggers

-- Update merchant_products.updated_at on changes
CREATE OR REPLACE FUNCTION update_merchant_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_merchant_products_timestamp 
BEFORE UPDATE ON merchant_products
FOR EACH ROW EXECUTE FUNCTION update_merchant_product_timestamp();

-- Update product_sales.updated_at on changes
CREATE OR REPLACE FUNCTION update_product_sale_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_sales_timestamp 
BEFORE UPDATE ON product_sales
FOR EACH ROW EXECUTE FUNCTION update_product_sale_timestamp();

-- Auto-decrement inventory on sale
CREATE OR REPLACE FUNCTION decrement_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Only decrement if product has inventory tracking enabled
    UPDATE merchant_products
    SET 
        inventory_count = GREATEST(0, COALESCE(inventory_count, 0) - 1),
        total_sales = total_sales + 1,
        total_redemptions = CASE 
            WHEN NEW.sale_type = 'redemption' THEN total_redemptions + 1 
            ELSE total_redemptions 
        END,
        revenue_generated = revenue_generated + COALESCE(NEW.amount_paid, 0)
    WHERE id = NEW.product_id
    AND inventory_count IS NOT NULL;
    
    -- Log inventory change
    INSERT INTO merchant_inventory_logs (
        product_id,
        change_type,
        quantity_change,
        previous_count,
        new_count,
        reason,
        performed_by
    )
    SELECT 
        NEW.product_id,
        'sale',
        -1,
        inventory_count + 1,
        inventory_count,
        'Sale to user: ' || NEW.user_id,
        NEW.user_id
    FROM merchant_products
    WHERE id = NEW.product_id
    AND inventory_count IS NOT NULL;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_decrement_inventory 
AFTER INSERT ON product_sales
FOR EACH ROW EXECUTE FUNCTION decrement_product_inventory();

-- Comments for documentation
COMMENT ON TABLE merchant_products IS 'Merchant product catalog with inventory tracking';
COMMENT ON TABLE product_sales IS 'Product sales and redemption transactions';
COMMENT ON TABLE merchant_inventory_logs IS 'Audit log for inventory changes';
COMMENT ON COLUMN merchant_products.inventory_count IS 'Current stock level (NULL = unlimited)';
COMMENT ON COLUMN merchant_products.low_stock_threshold IS 'Alert threshold for low inventory';
COMMENT ON COLUMN merchant_products.redemption_limit_per_user IS 'Max redemptions per user (NULL = unlimited)';
COMMENT ON COLUMN product_sales.redemption_code IS 'Unique code for in-person redemption';
COMMENT ON COLUMN product_sales.status IS 'pending = awaiting validation, validated = redeemed, expired = past expiration';
