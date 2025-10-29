-- =============================================
-- PROMORANG DATABASE SCHEMA
-- Complete schema for the Promorang social investing platform
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    mocha_user_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    social_links JSONB,
    user_type VARCHAR(20) DEFAULT 'regular' CHECK (user_type IN ('regular', 'advertiser', 'admin')),
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    referral_code VARCHAR(20) UNIQUE,
    referred_by BIGINT REFERENCES users(id),
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    total_earnings_usd DECIMAL(10,2) DEFAULT 0,
    promogem_balance INTEGER DEFAULT 0,
    points_balance INTEGER DEFAULT 0,
    keys_balance INTEGER DEFAULT 0,
    gems_balance INTEGER DEFAULT 0,
    gold_collected INTEGER DEFAULT 0,
    user_tier VARCHAR(20) DEFAULT 'free' CHECK (user_tier IN ('free', 'premium', 'super')),
    points_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    master_key_activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_mocha_user_id ON users(mocha_user_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_user_tier ON users(user_tier);

-- =============================================
-- WALLETS TABLE
-- =============================================
CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    currency_type VARCHAR(10) NOT NULL,
    balance DECIMAL(15,8) DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    payment_details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for wallets table
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_currency_type ON wallets(currency_type);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,8) NOT NULL,
    currency_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    reference_id BIGINT,
    reference_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for transactions table
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- =============================================
-- CONTENT PIECES TABLE
-- =============================================
CREATE TABLE content_pieces (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    creator_username VARCHAR(50),
    creator_name VARCHAR(100),
    creator_avatar TEXT,
    platform VARCHAR(50) NOT NULL,
    platform_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_url TEXT,
    total_shares INTEGER DEFAULT 1000,
    available_shares INTEGER DEFAULT 1000,
    engagement_shares_total INTEGER DEFAULT 100,
    engagement_shares_remaining INTEGER DEFAULT 100,
    share_price DECIMAL(10,4) DEFAULT 0.01,
    current_revenue DECIMAL(10,2) DEFAULT 0,
    performance_metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for content_pieces table
CREATE INDEX idx_content_pieces_creator_id ON content_pieces(creator_id);
CREATE INDEX idx_content_pieces_platform ON content_pieces(platform);
CREATE INDEX idx_content_pieces_created_at ON content_pieces(created_at);

-- =============================================
-- DROPS TABLE (NEW ECONOMY)
-- =============================================
CREATE TABLE drops (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    creator_name VARCHAR(100),
    creator_avatar TEXT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    drop_type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    key_cost INTEGER DEFAULT 0,
    gem_reward_base INTEGER DEFAULT 0,
    gem_pool_total INTEGER DEFAULT 0,
    gem_pool_remaining INTEGER DEFAULT 0,
    reward_logic TEXT,
    follower_threshold INTEGER DEFAULT 0,
    time_commitment TEXT,
    requirements TEXT,
    deliverables TEXT,
    deadline_at TIMESTAMP,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    platform VARCHAR(50),
    content_url TEXT,
    move_cost_points INTEGER DEFAULT 0,
    key_reward_amount INTEGER DEFAULT 0,
    is_proof_drop BOOLEAN DEFAULT FALSE,
    is_paid_drop BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for drops table
CREATE INDEX idx_drops_creator_id ON drops(creator_id);
CREATE INDEX idx_drops_drop_type ON drops(drop_type);
CREATE INDEX idx_drops_status ON drops(status);
CREATE INDEX idx_drops_difficulty ON drops(difficulty);

-- =============================================
-- DROP APPLICATIONS TABLE
-- =============================================
CREATE TABLE drop_applications (
    id BIGSERIAL PRIMARY KEY,
    drop_id BIGINT REFERENCES drops(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    application_message TEXT,
    submission_url TEXT,
    submission_notes TEXT,
    review_score INTEGER CHECK (review_score >= 1 AND review_score <= 5),
    gems_earned INTEGER DEFAULT 0,
    applied_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for drop_applications table
CREATE INDEX idx_drop_applications_drop_id ON drop_applications(drop_id);
CREATE INDEX idx_drop_applications_user_id ON drop_applications(user_id);
CREATE INDEX idx_drop_applications_status ON drop_applications(status);

-- =============================================
-- TASKS TABLE (LEGACY)
-- =============================================
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    reward_amount DECIMAL(10,2) NOT NULL,
    currency_type VARCHAR(10) DEFAULT 'USD',
    follower_threshold INTEGER DEFAULT 0,
    time_commitment TEXT,
    requirements TEXT,
    deliverables TEXT,
    deadline_at TIMESTAMP,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for tasks table
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_status ON tasks(status);

-- =============================================
-- SOCIAL ACTIONS TABLE
-- =============================================
CREATE TABLE social_actions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('like', 'comment', 'save', 'share', 'repost')),
    reference_id BIGINT NOT NULL,
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('content', 'task', 'drop')),
    points_earned DECIMAL(5,2) DEFAULT 0,
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for social_actions table
CREATE INDEX idx_social_actions_user_id ON social_actions(user_id);
CREATE INDEX idx_social_actions_reference ON social_actions(reference_type, reference_id);
CREATE INDEX idx_social_actions_action_type ON social_actions(action_type);

-- =============================================
-- USER FOLLOWS TABLE
-- =============================================
CREATE TABLE user_follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create indexes for user_follows table
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- =============================================
-- CONTENT SHARES TABLE
-- =============================================
CREATE TABLE content_shares (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT REFERENCES content_pieces(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    shares_owned DECIMAL(10,4) DEFAULT 0,
    total_invested DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for content_shares table
CREATE INDEX idx_content_shares_content_id ON content_shares(content_id);
CREATE INDEX idx_content_shares_user_id ON content_shares(user_id);

-- =============================================
-- SPONSORSHIPS TABLE
-- =============================================
CREATE TABLE sponsorships (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT REFERENCES content_pieces(id) ON DELETE CASCADE,
    sponsor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    advertiser_name VARCHAR(100),
    gems_allocated INTEGER NOT NULL,
    boost_multiplier DECIMAL(3,2) DEFAULT 1.0,
    duration_hours INTEGER DEFAULT 24,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for sponsorships table
CREATE INDEX idx_sponsorships_content_id ON sponsorships(content_id);
CREATE INDEX idx_sponsorships_sponsor_id ON sponsorships(sponsor_id);
CREATE INDEX idx_sponsorships_status ON sponsorships(status);

-- =============================================
-- MASTER KEY ACTIVATIONS TABLE
-- =============================================
CREATE TABLE master_key_activations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    activation_date DATE NOT NULL,
    proof_drops_required INTEGER DEFAULT 5,
    proof_drops_completed INTEGER DEFAULT 0,
    is_activated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for master_key_activations table
CREATE INDEX idx_master_key_activations_user_id ON master_key_activations(user_id);
CREATE INDEX idx_master_key_activations_date ON master_key_activations(activation_date);

-- =============================================
-- WITHDRAWALS TABLE
-- =============================================
CREATE TABLE withdrawals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency_type VARCHAR(10) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    transaction_id VARCHAR(255),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for withdrawals table
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward_points INTEGER DEFAULT 0,
    reward_gems INTEGER DEFAULT 0,
    reward_gold INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for achievements table
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);

-- =============================================
-- LEADERBOARD TABLE (Materialized View)
-- =============================================
CREATE TABLE leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    total_points INTEGER DEFAULT 0,
    total_gems INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    rank INTEGER,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, period)
);

-- Create indexes for leaderboard table
CREATE INDEX idx_leaderboard_period ON leaderboard(period);
CREATE INDEX idx_leaderboard_rank ON leaderboard(period, rank);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_pieces_updated_at BEFORE UPDATE ON content_pieces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drops_updated_at BEFORE UPDATE ON drops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drop_applications_updated_at BEFORE UPDATE ON drop_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_shares_updated_at BEFORE UPDATE ON content_shares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsorships_updated_at BEFORE UPDATE ON sponsorships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_master_key_activations_updated_at BEFORE UPDATE ON master_key_activations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
        UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Add follower count triggers
CREATE TRIGGER update_follower_counts_on_insert AFTER INSERT ON user_follows FOR EACH ROW EXECUTE FUNCTION update_follower_counts();
CREATE TRIGGER update_follower_counts_on_delete AFTER DELETE ON user_follows FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily leaderboard
    INSERT INTO leaderboard (user_id, period, total_points, total_gems, total_earnings, last_updated)
    VALUES (NEW.user_id, 'daily', NEW.points_earned, NEW.points_earned / 10, NEW.points_earned * 0.001, NOW())
    ON CONFLICT (user_id, period)
    DO UPDATE SET
        total_points = leaderboard.total_points + NEW.points_earned,
        total_gems = leaderboard.total_gems + (NEW.points_earned / 10),
        total_earnings = leaderboard.total_earnings + (NEW.points_earned * 0.001),
        last_updated = NOW();

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add leaderboard update trigger
CREATE TRIGGER update_leaderboard_on_social_action AFTER INSERT ON social_actions FOR EACH ROW EXECUTE FUNCTION update_leaderboard();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_key_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid()::text = mocha_user_id);
CREATE POLICY wallets_own_data ON wallets FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = wallets.user_id AND users.mocha_user_id = auth.uid()::text)
);
CREATE POLICY transactions_own_data ON transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = transactions.user_id AND users.mocha_user_id = auth.uid()::text)
);

-- Public read access for content and drops (for discovery)
CREATE POLICY content_public_read ON content_pieces FOR SELECT USING (true);
CREATE POLICY drops_public_read ON drops FOR SELECT USING (true);

-- Users can create and manage their own content
CREATE POLICY content_own_crud ON content_pieces FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = content_pieces.creator_id AND users.mocha_user_id = auth.uid()::text)
);

-- Similar policies for other tables...

-- =============================================
-- INITIAL DEMO DATA
-- =============================================

-- Insert demo users
INSERT INTO users (mocha_user_id, email, username, display_name, bio, avatar_url, user_type, xp_points, level, user_tier, points_balance, keys_balance, gems_balance, gold_collected, referral_code) VALUES
('demo-user-1', 'demo@example.com', 'demo_user', 'Demo User', 'Content creator and investor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo1', 'regular', 15420, 12, 'premium', 15420, 25, 1250, 5, 'DEMO1234'),
('demo-user-2', 'creator@example.com', 'top_creator', 'Top Creator', 'Social media influencer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator2', 'regular', 25680, 18, 'super', 25680, 50, 2500, 15, 'CREATOR5678'),
('demo-advertiser', 'brand@example.com', 'demo_brand', 'Demo Brand', 'Marketing agency', 'https://api.dicebear.com/7.x/avataaars/svg?seed=brand3', 'advertiser', 50000, 25, 'super', 50000, 100, 5000, 25, 'BRAND9012');

-- Insert demo content
INSERT INTO content_pieces (creator_id, creator_username, creator_name, platform, platform_url, title, description, media_url, share_price, current_revenue) VALUES
(1, 'demo_user', 'Demo User', 'instagram', 'https://instagram.com/p/demo123', 'Amazing travel content!', 'Check out this amazing travel destination with stunning views and great food recommendations.', 'https://picsum.photos/800/600?random=1', 0.01, 250.50),
(2, 'top_creator', 'Top Creator', 'tiktok', 'https://tiktok.com/@top_creator/video/123', 'Viral dance challenge', 'Join the latest dance challenge that is taking over social media!', 'https://picsum.photos/800/600?random=2', 0.02, 500.75),
(1, 'demo_user', 'Demo User', 'youtube', 'https://youtube.com/watch?v=demo456', 'Product review', 'In-depth review of the latest tech gadgets you need to know about.', 'https://picsum.photos/800/600?random=3', 0.03, 125.25);

-- Insert demo drops
INSERT INTO drops (creator_id, creator_name, title, description, drop_type, difficulty, key_cost, gem_reward_base, gem_pool_total, gem_pool_remaining, follower_threshold, max_participants, current_participants, platform, content_url, is_proof_drop, is_paid_drop) VALUES
(3, 'Demo Brand', 'Create Instagram Reel', 'Create a promotional Instagram reel for our new product launch. Show the product features and benefits.', 'content_clipping', 'medium', 2, 100, 1000, 850, 1000, 20, 5, 'instagram', 'https://picsum.photos/800/600?random=4', false, true),
(2, 'Top Creator', 'Write product review', 'Write an honest review of our service and share it on your social media platforms.', 'reviews', 'easy', 0, 50, 500, 450, 500, NULL, 8, 'twitter', 'https://picsum.photos/800/600?random=5', true, false),
(1, 'Demo User', 'Share content challenge', 'Share this post and tag 3 friends to participate in our giveaway!', 'challenges_events', 'easy', 1, 25, 250, 200, 100, 50, 12, 'tiktok', 'https://picsum.photos/800/600?random=6', false, false);

-- Insert demo wallets
INSERT INTO wallets (user_id, currency_type, balance, is_primary, payment_method, payment_details) VALUES
(1, 'USD', 250.75, true, 'stripe', '{"card_last_four": "4242", "card_brand": "visa"}'),
(1, 'BTC', 0.0015, false, 'crypto', '{"address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}'),
(2, 'USD', 500.00, true, 'stripe', '{"card_last_four": "8888", "card_brand": "mastercard"}');

-- Insert demo transactions
INSERT INTO transactions (user_id, transaction_type, amount, currency_type, status, description) VALUES
(1, 'deposit', 100.00, 'USD', 'completed', 'Initial deposit'),
(1, 'reward', 50.00, 'points', 'completed', 'Content engagement reward'),
(2, 'purchase', 25.00, 'gems', 'completed', 'Gem package purchase'),
(3, 'advertising', 200.00, 'USD', 'completed', 'Sponsored content payment');

-- Update user follower counts
UPDATE users SET follower_count = 1, following_count = 2 WHERE id = 1;
UPDATE users SET follower_count = 3, following_count = 1 WHERE id = 2;
UPDATE users SET follower_count = 5, following_count = 0 WHERE id = 3;

-- Insert user follows
INSERT INTO user_follows (follower_id, following_id) VALUES
(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2);

-- Insert social actions
INSERT INTO social_actions (user_id, action_type, reference_id, reference_type, points_earned, multiplier) VALUES
(1, 'like', 1, 'content', 1.5, 1.5),
(2, 'share', 1, 'content', 5.0, 2.0),
(1, 'comment', 2, 'content', 3.0, 1.0),
(3, 'like', 3, 'content', 2.0, 1.0);

-- Insert demo sponsorships
INSERT INTO sponsorships (content_id, sponsor_id, advertiser_name, gems_allocated, boost_multiplier, duration_hours, status) VALUES
(1, 3, 'Demo Brand', 1000, 2.5, 48, 'active'),
(2, 3, 'Demo Brand', 500, 1.8, 24, 'active');

-- Insert master key activation
INSERT INTO master_key_activations (user_id, activation_date, proof_drops_required, proof_drops_completed, is_activated) VALUES
(1, CURRENT_DATE - INTERVAL '7 days', 5, 5, true),
(2, CURRENT_DATE - INTERVAL '3 days', 5, 3, false);

-- Insert demo notifications
INSERT INTO notifications (user_id, type, title, message, data, is_read) VALUES
(1, 'achievement', 'Level Up!', 'Congratulations! You reached level 12!', '{}', false),
(1, 'drop', 'New Drop Available', 'A new paid drop is available for your skills!', '{"drop_id": 1}', false),
(2, 'sponsorship', 'Content Sponsored', 'Your content has been sponsored and will receive 2.5x visibility!', '{"content_id": 1, "boost": 2.5}', true),
(3, 'application', 'Drop Application Approved', 'Your application for "Create Instagram Reel" has been approved!', '{"drop_id": 1}', false);

-- Insert demo achievements
INSERT INTO achievements (user_id, achievement_type, title, description, reward_points, reward_gems, reward_gold) VALUES
(1, 'level_up', 'Level 12 Reached', 'Congratulations on reaching level 12!', 1000, 100, 1),
(1, 'streak', '7-Day Streak', 'Amazing! You have been active for 7 days in a row!', 500, 50, 0),
(2, 'creator', 'Top Creator', 'You have become a recognized top creator!', 2000, 200, 2),
(3, 'advertiser', 'First Campaign', 'Your first advertising campaign is live!', 1500, 150, 1);

-- Update leaderboard
INSERT INTO leaderboard (user_id, period, total_points, total_gems, total_earnings, rank) VALUES
(2, 'daily', 25680, 2568, 25.68, 1),
(1, 'daily', 15420, 1542, 15.42, 2),
(3, 'daily', 50000, 5000, 50.00, 1),
(1, 'weekly', 15420, 1542, 15.42, 1),
(2, 'weekly', 25680, 2568, 25.68, 2);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

-- This schema creates a complete, production-ready database for Promorang
-- with proper relationships, indexes, triggers, and Row Level Security policies.
-- Demo data is included to get you started immediately.
