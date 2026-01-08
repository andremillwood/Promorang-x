-- Add relay_id to orders to track lineage of sales
ALTER TABLE IF EXISTS orders 
ADD COLUMN IF NOT EXISTS relay_id UUID REFERENCES relays(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_relay_id ON orders(relay_id);
