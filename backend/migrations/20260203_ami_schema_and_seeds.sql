-- =============================================
-- MIGRATION: ACTIVATION MECHANICS INDEX (AMI)
-- DATE: 2026-02-03
-- DESCRIPTION: Creates the core AMI tables, types, relationships, and seeds initial data.
-- =============================================

-- 1. DEFINE ENUMS
DO $$ BEGIN
    CREATE TYPE mechanic_category AS ENUM ('IRL', 'Digital', 'Hybrid');
    CREATE TYPE mechanic_proof_type AS ENUM ('QR', 'GPS', 'Photo', 'Video', 'API', 'Code');
    CREATE TYPE mechanic_outcome AS ENUM ('Foot Traffic', 'UGC', 'Social Follows', 'App Download', 'Sales');
    CREATE TYPE mechanic_difficulty AS ENUM ('Low', 'Medium', 'High');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CREATE core table `activation_mechanics`
CREATE TABLE IF NOT EXISTS activation_mechanics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category mechanic_category NOT NULL,
    proof_type mechanic_proof_type NOT NULL,
    difficulty mechanic_difficulty DEFAULT 'Medium',
    
    -- Constraints & Context
    min_audience_size INTEGER DEFAULT 1,
    max_audience_size INTEGER,
    min_duration_minutes INTEGER,
    
    -- Outcome Constraints
    primary_outcome mechanic_outcome NOT NULL,
    secondary_outcomes TEXT[], -- Array of strings
    
    -- System Metadata
    is_seeded BOOLEAN DEFAULT FALSE, -- True for system-defined "Truth" mechanics
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_ami_category ON activation_mechanics(category);
CREATE INDEX IF NOT EXISTS idx_ami_outcome ON activation_mechanics(primary_outcome);


-- 3. CREATE relationship to `moments`
-- Add mechanic_id to moments table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE moments ADD COLUMN mechanic_id UUID REFERENCES activation_mechanics(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;


-- 4. CREATE performance table `mechanic_metrics`
CREATE TABLE IF NOT EXISTS mechanic_metrics (
    mechanic_id UUID REFERENCES activation_mechanics(id) PRIMARY KEY,
    total_instances INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    avg_completion_rate DECIMAL(5,2) DEFAULT 0.00, -- % of joined who verified
    avg_cost_per_action DECIMAL(10,2) DEFAULT 0.00, -- Spend / Verified Actions
    reliability_score DECIMAL(5,2) DEFAULT 50.00, -- System computed trust score (0-100)
    last_updated TIMESTAMPTZ DEFAULT NOW()
);


-- 5. SEED DATA (The "Truth" Set)
-- We insert the 25 initial mechanics. 
-- Using ON CONFLICT DO NOTHING to avoid duplicates if run multiple times.

INSERT INTO activation_mechanics (name, description, category, proof_type, difficulty, primary_outcome, is_seeded, secondary_outcomes) VALUES
-- RETAIL / FOOT TRAFFIC
('The BOGO Snap', 'Buy One Get One Free when you snap a photo of your purchase.', 'IRL', 'Photo', 'Low', 'Sales', TRUE, ARRAY['UGC']),
('Queue Jumper', 'Show your Promorang Rank to skip the line.', 'IRL', 'GPS', 'Low', 'Foot Traffic', TRUE, ARRAY['Sales']),
('Flash Sale Check-in', 'Check-in via GPS within a specific 1-hour window to unlock a discount.', 'IRL', 'GPS', 'Medium', 'Foot Traffic', TRUE, ARRAY['Sales']),
('Secret Menu Unlock', 'Check-in to reveal a secret menu item available only to Promorang users.', 'IRL', 'GPS', 'Low', 'Foot Traffic', TRUE, ARRAY['Sales']),
('Receipt Lottery', 'Upload a receipt over $10 for a chance to win Gems.', 'IRL', 'Photo', 'Medium', 'Sales', TRUE, ARRAY['UGC']),
('Store Scavenger Hunt', 'Find 3 specific items in-store and photograph them.', 'IRL', 'Photo', 'High', 'Foot Traffic', TRUE, ARRAY['UGC', 'Time in Store']),
('The "Regular" Perk', '5th visit this month unlocks a free item.', 'IRL', 'GPS', 'Medium', 'Sales', TRUE, ARRAY['Retention']),
('Bring a Friend', 'Check-in with another user (Dual GPS check-in) for diverse rewards.', 'IRL', 'GPS', 'Medium', 'Foot Traffic', TRUE, ARRAY['Growth']),

-- HOSPITALITY / VIBE
('Happy Hour Streak', 'Check-in 3 times in 7 days during Happy Hour.', 'IRL', 'GPS', 'Medium', 'Foot Traffic', TRUE, ARRAY['Retention']),
('DJ Request', 'Tip the DJ and request a song via the app.', 'IRL', 'Code', 'Low', 'Sales', TRUE, ARRAY['Vibe']),
('Bartender high-five', 'Show the bartender your app for a custom welcome.', 'IRL', 'GPS', 'Low', 'Vibe', TRUE, ARRAY['Retention']),
('VIP Table Unlock', 'Burn Gems to reserve a VIP table instantly.', 'IRL', 'Code', 'High', 'Sales', TRUE, ARRAY['Prestige']),
('Feedback Loop', 'Rate the vibe (Music/Crowd) for instant Points.', 'IRL', 'GPS', 'Low', 'UGC', TRUE, ARRAY['Data']),
('Last Call Hero', 'Check-in after 1 AM for a late-night badge.', 'IRL', 'GPS', 'Medium', 'Foot Traffic', TRUE, ARRAY['Vibe']),
('Bathroom Mirror Selfie', 'Take a selfie in the branded bathroom mirror.', 'IRL', 'Photo', 'Low', 'UGC', TRUE, ARRAY['Social Follows']),

-- DIGITAL / GROWTH
('App Download Sprint', 'Download a partner app and upload a screenshot.', 'Digital', 'Photo', 'Medium', 'App Download', TRUE, ARRAY['Sales']),
('Story Tag Cascade', 'Post an IG Story tagging the brand and Promorang.', 'Digital', 'Photo', 'Medium', 'Social Follows', TRUE, ARRAY['UGC', 'Growth']),
('TikTok Challenge', 'Recreate a specific dance/skit and link the video.', 'Digital', 'Video', 'High', 'UGC', TRUE, ARRAY['Social Follows']),
('Review Blitz', 'Leave a 5-star review on Google Maps.', 'Digital', 'Photo', 'Medium', 'Sales', TRUE, ARRAY['Reputation']),
('Newsletter Signup', 'Sign up for the brand newsletter.', 'Digital', 'Photo', 'Low', 'Sales', TRUE, ARRAY['Retention']),

-- COMMUNITY / HYBRID
('Run Club 5K', 'Complete a 5K run and upload your tracking app screenshot.', 'Hybrid', 'Photo', 'High', 'UGC', TRUE, ARRAY['Health']),
('Cleanup Crew', 'Before and after photo of cleaning up a public space.', 'Hybrid', 'Photo', 'Medium', 'UGC', TRUE, ARRAY['Impact']),
('Book Club Check-in', 'Attend the monthly book club meeting.', 'IRL', 'GPS', 'Low', 'Foot Traffic', TRUE, ARRAY['Community']),
('Volunteer Shift', 'Complete a verified volunteer shift.', 'IRL', 'Code', 'High', 'UGC', TRUE, ARRAY['Impact']),
('Workshop Attendance', 'Attend an educational workshop.', 'IRL', 'QR', 'Medium', 'Foot Traffic', TRUE, ARRAY['Education'])

ON CONFLICT DO NOTHING;


-- 6. INITIALIZE METRICS
-- Insert default metrics for seeded mechanics
INSERT INTO mechanic_metrics (mechanic_id, reliability_score)
SELECT id, 95.00 FROM activation_mechanics WHERE is_seeded = TRUE
ON CONFLICT DO NOTHING;
