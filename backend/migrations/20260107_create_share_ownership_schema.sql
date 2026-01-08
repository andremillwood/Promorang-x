-- Create table for tracking ownership of fractional shares
CREATE TABLE IF NOT EXISTS user_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- What the user owns shares in
    object_type VARCHAR(20) NOT NULL CHECK (object_type IN ('content', 'prediction', 'product', 'store')),
    object_id UUID NOT NULL,
    
    -- Ownership details
    total_shares INTEGER DEFAULT 0 CHECK (total_shares >= 0),
    locked_shares INTEGER DEFAULT 0 CHECK (locked_shares >= 0),
    avg_price_paid DECIMAL(15,8) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, object_type, object_id)
);

CREATE INDEX IF NOT EXISTS idx_user_shares_user ON user_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_user_shares_object ON user_shares(object_type, object_id);

-- Create table for share listings (Order Book)
CREATE TABLE IF NOT EXISTS share_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_type VARCHAR(20) NOT NULL,
    object_id UUID NOT NULL,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0),
    price_per_share DECIMAL(15,8) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'cancelled')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for direct offers (Bids)
CREATE TABLE IF NOT EXISTS share_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Target seller if it's a direct offer on a listing
    listing_id UUID REFERENCES share_listings(id) ON DELETE SET NULL,
    
    object_type VARCHAR(20) NOT NULL CHECK (object_type IN ('content', 'prediction', 'product', 'store')),
    object_id UUID NOT NULL,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    bid_price DECIMAL(15,8) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle share distribution
CREATE OR REPLACE FUNCTION grant_shares(
    p_user_id UUID,
    p_object_type VARCHAR,
    p_object_id UUID,
    p_amount INTEGER,
    p_price DECIMAL DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_shares (user_id, object_type, object_id, total_shares, avg_price_paid)
    VALUES (p_user_id, p_object_type, p_object_id, p_amount, p_price)
    ON CONFLICT (user_id, object_type, object_id) 
    DO UPDATE SET 
        avg_price_paid = (user_shares.total_shares * user_shares.avg_price_paid + p_amount * p_price) / (user_shares.total_shares + p_amount),
        total_shares = user_shares.total_shares + p_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
