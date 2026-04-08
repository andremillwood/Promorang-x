-- Daily Outcomes Table
-- Stores finalized results for each day (for "Last Night" view)

CREATE TABLE IF NOT EXISTS daily_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The day this outcome represents
  date DATE NOT NULL UNIQUE,
  
  -- District that was active
  district_id TEXT DEFAULT 'food-district',
  district_name TEXT DEFAULT 'Food District',
  
  -- House competition results
  winning_house_id TEXT,
  house_scores JSONB DEFAULT '{}',
  -- Example: { "sauce": 450, "luna": 520, "tide": 380, "stone": 410 }
  
  -- Participation metrics
  total_participants INTEGER DEFAULT 0,
  total_quests_completed INTEGER DEFAULT 0,
  total_gems_distributed DECIMAL(10,2) DEFAULT 0,
  
  -- Draw results
  draw_id UUID,
  draw_winners JSONB DEFAULT '[]',
  -- Example: [{ "user_id": "...", "prize": "500 Gems", "tier": "grand" }]
  
  -- Lock timestamp
  locked_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_daily_outcomes_date ON daily_outcomes(date DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_daily_outcomes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_daily_outcomes_updated_at ON daily_outcomes;
CREATE TRIGGER trigger_daily_outcomes_updated_at
  BEFORE UPDATE ON daily_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_outcomes_updated_at();

-- User participation tracking per day
CREATE TABLE IF NOT EXISTS user_daily_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Activity metrics
  quests_completed INTEGER DEFAULT 0,
  gems_earned DECIMAL(10,2) DEFAULT 0,
  house_points_contributed INTEGER DEFAULT 0,
  draw_entries INTEGER DEFAULT 0,
  
  -- Position tracking
  house_id TEXT,
  house_rank INTEGER, -- 1-4, where their house placed
  
  -- Timestamps
  first_action_at TIMESTAMPTZ,
  last_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_participation_user_date 
  ON user_daily_participation(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_participation_date 
  ON user_daily_participation(date DESC);

-- Add house_id to users if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'house_id'
  ) THEN
    ALTER TABLE users ADD COLUMN house_id TEXT;
  END IF;
END
$$;

COMMENT ON TABLE daily_outcomes IS 'Stores finalized daily results - powers the Last Night view';
COMMENT ON TABLE user_daily_participation IS 'Tracks individual user activity per day';
