-- =====================================================
-- INTEGRATE BLOG SYSTEM WITH RELAY PRIMITIVE
-- =====================================================

-- 1. Add relay capability columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relay_weight DECIMAL(5,2) DEFAULT 1.0;

-- 2. Update the check constraint on relays.object_type to include 'blog_post'
-- Note: PostgreSQL doesn't allow direct ALTER TABLE modification of check constraints easily.
-- We usually drop and recreate.

ALTER TABLE relays DROP CONSTRAINT IF EXISTS relays_object_type_check;
ALTER TABLE relays ADD CONSTRAINT relays_object_type_check 
CHECK (object_type IN ('content', 'prediction', 'drop', 'campaign', 'event', 'coupon', 'season', 'blog_post'));

-- 3. Trigger to increment relay_count on blog_posts when a relay is created
CREATE OR REPLACE FUNCTION update_blog_post_relay_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.object_type = 'blog_post' THEN
        UPDATE blog_posts
        SET relay_count = relay_count + 1
        WHERE id = NEW.object_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_blog_post_relay_count ON relays;
CREATE TRIGGER tr_update_blog_post_relay_count
AFTER INSERT ON relays
FOR EACH ROW
EXECUTE FUNCTION update_blog_post_relay_count();
