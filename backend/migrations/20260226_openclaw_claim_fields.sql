-- Migration: Add claim status and source tracking to moments and venues
-- For the OpenClaw "Claim Your Moment" feature

-- ============================================
-- Add claim fields to moments table
-- ============================================
DO $$
BEGIN
  -- claim_status: tracks whether a moment was user-created or discovered
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moments' AND column_name = 'claim_status'
  ) THEN
    ALTER TABLE moments
    ADD COLUMN claim_status text NOT NULL DEFAULT 'claimed'
    CHECK (claim_status IN ('unclaimed', 'claimed', 'verified'));
  END IF;

  -- source: where the moment was discovered
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moments' AND column_name = 'source'
  ) THEN
    ALTER TABLE moments
    ADD COLUMN source text DEFAULT 'manual'
    CHECK (source IN ('manual', 'eventbrite', 'partiful', 'google_maps', 'scraped'));
  END IF;

  -- source_url: original URL where the event was found
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moments' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE moments ADD COLUMN source_url text;
  END IF;

  -- claimed_by: user who claimed ownership
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moments' AND column_name = 'claimed_by'
  ) THEN
    ALTER TABLE moments ADD COLUMN claimed_by uuid REFERENCES auth.users(id);
  END IF;

  -- claimed_at: timestamp of claim
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moments' AND column_name = 'claimed_at'
  ) THEN
    ALTER TABLE moments ADD COLUMN claimed_at timestamp with time zone;
  END IF;
END $$;

-- ============================================
-- Add claim fields to venues table
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'claim_status'
  ) THEN
    ALTER TABLE venues
    ADD COLUMN claim_status text NOT NULL DEFAULT 'claimed'
    CHECK (claim_status IN ('unclaimed', 'claimed', 'verified'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'source'
  ) THEN
    ALTER TABLE venues
    ADD COLUMN source text DEFAULT 'manual'
    CHECK (source IN ('manual', 'google_maps', 'scraped', 'yelp'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE venues ADD COLUMN source_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'claimed_by'
  ) THEN
    ALTER TABLE venues ADD COLUMN claimed_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'claimed_at'
  ) THEN
    ALTER TABLE venues ADD COLUMN claimed_at timestamp with time zone;
  END IF;
END $$;

-- ============================================
-- Indexes for efficient queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_moments_claim_status ON moments(claim_status);
CREATE INDEX IF NOT EXISTS idx_moments_source ON moments(source);
CREATE INDEX IF NOT EXISTS idx_venues_claim_status ON venues(claim_status);
CREATE INDEX IF NOT EXISTS idx_venues_source ON venues(source);

-- ============================================
-- RLS policies for unclaimed content
-- ============================================

-- Anyone can view unclaimed moments (they're public discovery)
DROP POLICY IF EXISTS "Anyone can view unclaimed moments" ON moments;
CREATE POLICY "Anyone can view unclaimed moments"
  ON moments FOR SELECT
  USING (claim_status = 'unclaimed');

-- Only the platform (service key) can create unclaimed moments
-- This is handled by using SUPABASE_SERVICE_KEY in the OpenClaw skills

-- Users can claim unclaimed moments if they verify ownership
DROP POLICY IF EXISTS "Users can claim unclaimed moments" ON moments;
CREATE POLICY "Users can claim unclaimed moments"
  ON moments FOR UPDATE
  USING (claim_status = 'unclaimed')
  WITH CHECK (
    claim_status = 'claimed'
    AND claimed_by = auth.uid()
  );
