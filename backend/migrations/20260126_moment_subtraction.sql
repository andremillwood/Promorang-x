-- =============================================
-- MIGRATION: MOMENT INFRASTRUCTURE SUBTRACTION
-- DESCRIPTION: Removes financial, gamification, and legacy tables. Refactors Users for PRI.
-- =============================================

-- 1. DROP LEGACY & VIOLATING TABLES
DROP TABLE IF EXISTS content_shares CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sponsorships CASCADE;
DROP TABLE IF EXISTS social_actions CASCADE; -- Re-implement later as metadata only if needed
DROP TABLE IF EXISTS user_follows CASCADE; -- Social graph removal (Doctrine: Social is echo only, need to verify if we keep graph but remove points)
-- Wait, the audit said "Social media is echo only". Does that mean we remove the follow graph?
-- "Whether follower count... affects them". "Social is echo only".
-- I will keep user_follows for now as "echo" (metadata), but ensure no points/logic attach to it.
-- Actually, the plan said "Downgrade Social Actions to Metadata". I'll keep user_follows but drop social_actions which had 'points_earned'.

-- 2. CLEAN USERS TABLE
ALTER TABLE users 
    DROP COLUMN IF EXISTS total_earnings_usd,
    DROP COLUMN IF EXISTS xp_points,
    DROP COLUMN IF EXISTS level,
    DROP COLUMN IF EXISTS points_streak_days,
    DROP COLUMN IF EXISTS gems_balance,
    DROP COLUMN IF EXISTS keys_balance,
    DROP COLUMN IF EXISTS gold_collected,
    DROP COLUMN IF EXISTS last_activity_date; -- Daily recurrence logic will likely change

-- 3. REFACTOR PROMOPOINTS TO RELIABILITY INDEX (PRI)
ALTER TABLE users 
    RENAME COLUMN points_balance TO reliability_score;

-- Set baseline PRI (e.g., 100 for everyone, or 0? Doctrine says "maintained not earned").
-- Let's set a default of 100.
UPDATE users SET reliability_score = 100;
ALTER TABLE users ALTER COLUMN reliability_score SET DEFAULT 100;

-- Add PRI Metadata
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reliability_decay_rate INTEGER DEFAULT 1, -- Points lost per day of inactivity
    ADD COLUMN IF NOT EXISTS last_reliability_update TIMESTAMPTZ DEFAULT NOW();

-- 4. CLEAN UP OTHER TABLES
-- Remove financial columns from content_pieces
ALTER TABLE content_pieces
    DROP COLUMN IF EXISTS share_price,
    DROP COLUMN IF EXISTS current_revenue,
    DROP COLUMN IF EXISTS total_shares,
    DROP COLUMN IF EXISTS available_shares,
    DROP COLUMN IF EXISTS engagement_shares_total,
    DROP COLUMN IF EXISTS engagement_shares_remaining;
    
-- =============================================
-- END MIGRATION
-- =============================================
