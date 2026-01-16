-- Migration: User Maturity State System
-- Purpose: Add state-aware experience layer for progressive feature reveal
-- This is ADDITIVE ONLY - no existing columns or tables are modified

-- Add maturity_state column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS maturity_state INTEGER DEFAULT 0;

-- Add last_used_surface column to track where user last interacted
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_used_surface TEXT NULL;

-- Add verified_actions_count to track user progress
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS verified_actions_count INTEGER DEFAULT 0;

-- Add first_reward_received_at to track when user received first reward
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_reward_received_at TIMESTAMPTZ NULL;

-- Create user_maturity_transitions table to track state changes (audit trail)
CREATE TABLE IF NOT EXISTS public.user_maturity_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  from_state INTEGER NOT NULL,
  to_state INTEGER NOT NULL,
  trigger_reason TEXT NOT NULL,
  trigger_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_maturity_transitions_user_id 
ON public.user_maturity_transitions(user_id);

CREATE INDEX IF NOT EXISTS idx_users_maturity_state 
ON public.users(maturity_state);

-- Create verified_actions table to track user actions for maturity progression
CREATE TABLE IF NOT EXISTS public.verified_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'deal_claimed', 'event_rsvp', 'post_submitted', 'share_completed', etc.
  action_metadata JSONB DEFAULT '{}',
  surface TEXT NULL, -- 'web', 'mobile', 'api'
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verified_actions_user_id 
ON public.verified_actions(user_id);

CREATE INDEX IF NOT EXISTS idx_verified_actions_type 
ON public.verified_actions(action_type);

-- Comments for documentation
COMMENT ON COLUMN public.users.maturity_state IS 'User maturity state: 0=FIRST_TIME, 1=ACTIVE, 2=REWARDED, 3=POWER_USER, 4=OPERATOR_PRO';
COMMENT ON COLUMN public.users.last_used_surface IS 'Last surface user interacted with: web, mobile, api';
COMMENT ON COLUMN public.users.verified_actions_count IS 'Count of verified actions completed by user';
COMMENT ON COLUMN public.users.first_reward_received_at IS 'Timestamp when user received their first redeemable reward';
COMMENT ON TABLE public.user_maturity_transitions IS 'Audit trail of user maturity state transitions';
COMMENT ON TABLE public.verified_actions IS 'Log of verified user actions for maturity progression';
