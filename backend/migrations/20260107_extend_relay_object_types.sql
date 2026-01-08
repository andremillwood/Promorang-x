-- Extend Relays object_type CHECK constraint to include product and store
DO $$ 
BEGIN
    -- Drop old constraint
    ALTER TABLE IF EXISTS relays DROP CONSTRAINT IF EXISTS relays_object_type_check;
    
    -- Add new constraint
    ALTER TABLE relays 
    ADD CONSTRAINT relays_object_type_check 
    CHECK (object_type IN ('content', 'prediction', 'drop', 'campaign', 'event', 'coupon', 'season', 'product', 'store'));
END $$;
