-- Add indexes for Growth Hub tables

-- Staking channels
CREATE INDEX IF NOT EXISTS idx_staking_channels_is_active ON public.staking_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_staking_channels_apy ON public.staking_channels(apy);

-- Staking positions
CREATE INDEX IF NOT EXISTS idx_staking_positions_user_id ON public.staking_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_positions_channel_id ON public.staking_positions(channel_id);
CREATE INDEX IF NOT EXISTS idx_staking_positions_status ON public.staking_positions(status);
CREATE INDEX IF NOT EXISTS idx_staking_positions_end_date ON public.staking_positions(end_date);

-- Funding projects
CREATE INDEX IF NOT EXISTS idx_funding_projects_creator_id ON public.funding_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_funding_projects_status ON public.funding_projects(status);
CREATE INDEX IF NOT EXISTS idx_funding_projects_end_date ON public.funding_projects(end_date);

-- Funding pledges
CREATE INDEX IF NOT EXISTS idx_funding_pledges_user_id ON public.funding_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_pledges_project_id ON public.funding_pledges(project_id);
CREATE INDEX IF NOT EXISTS idx_funding_pledges_status ON public.funding_pledges(status);

-- Shield policies
CREATE INDEX IF NOT EXISTS idx_shield_policies_is_active ON public.shield_policies(is_active);

-- Shield subscriptions
CREATE INDEX IF NOT EXISTS idx_shield_subscriptions_user_id ON public.shield_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_shield_subscriptions_policy_id ON public.shield_subscriptions(policy_id);
CREATE INDEX IF NOT EXISTS idx_shield_subscriptions_status ON public.shield_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_shield_subscriptions_expires_at ON public.shield_subscriptions(expires_at);

-- Creator rewards
CREATE INDEX IF NOT EXISTS idx_creator_rewards_creator_id ON public.creator_rewards(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_rewards_period ON public.creator_rewards(period);
CREATE INDEX IF NOT EXISTS idx_creator_rewards_status ON public.creator_rewards(status);

-- Growth ledger
CREATE INDEX IF NOT EXISTS idx_growth_ledger_user_id ON public.growth_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_ledger_source_type ON public.growth_ledger(source_type);
CREATE INDEX IF NOT EXISTS idx_growth_ledger_created_at ON public.growth_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_growth_ledger_status ON public.growth_ledger(status);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_staking_positions_user_status ON public.staking_positions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_funding_pledges_user_project ON public.funding_pledges(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_shield_subscriptions_user_status ON public.shield_subscriptions(user_id, status);

-- Add indexes for foreign keys to improve join performance
CREATE INDEX IF NOT EXISTS idx_funding_pledges_project_fk ON public.funding_pledges(project_id);
CREATE INDEX IF NOT EXISTS idx_staking_positions_channel_fk ON public.staking_positions(channel_id);
CREATE INDEX IF NOT EXISTS idx_shield_subscriptions_policy_fk ON public.shield_subscriptions(policy_id);
