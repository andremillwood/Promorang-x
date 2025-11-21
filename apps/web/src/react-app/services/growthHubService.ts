import { supabase } from '../lib/supabaseClient';

type StakingChannel = {
  id: string;
  name: string;
  description: string;
  apy: number;
  min_duration_days: number;
  max_duration_days: number;
  min_amount: number;
  max_amount?: number;
  is_active: boolean;
};

type StakingPosition = {
  id: string;
  user_id: string;
  channel_id: string;
  amount: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'matured' | 'withdrawn';
  created_at: string;
  updated_at: string;
};

type FundingProject = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  target_amount: number;
  amount_raised: number;
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

type ShieldPolicy = {
  id: string;
  name: string;
  description: string;
  premium_amount: number;
  coverage_amount: number;
  duration_days: number;
  is_active: boolean;
};

type ShieldSubscription = {
  id: string;
  user_id: string;
  policy_id: string;
  status: 'active' | 'cancelled' | 'expired';
  expires_at: string;
  created_at?: string;
  updated_at?: string;
  shield_policies?: ShieldPolicy | null;
};

type CreatorReward = {
  id: string;
  creator_id: string;
  amount: number;
  period: string;
  status: 'pending' | 'approved' | 'paid';
  metrics: {
    views: number;
    shares: number;
    comments: number;
    engagement_score: number;
  };
};

// Staking

export const getStakingChannels = async (): Promise<{ data: StakingChannel[] | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('staking_channels')
    .select('*')
    .eq('is_active', true)
    .order('apy', { ascending: false });

  return { data, error };
};

export const createStakingPosition = async (
  channelId: string, 
  amount: number, 
  durationDays: number
): Promise<{ data: StakingPosition | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('staking_positions')
    .insert({
      channel_id: channelId,
      amount,
      duration_days: durationDays,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    })
    .select()
    .single();

  return { data, error };
};

export const claimStakingRewards = async (positionId: string): Promise<{ success: boolean, error?: string }> => {
  const { error } = await supabase.rpc('claim_staking_rewards', {
    position_id: positionId
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Funding

export const getFundingProjects = async (status?: string): Promise<{ data: FundingProject[] | null, error: Error | null }> => {
  let query = supabase
    .from('funding_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createFundingProject = async (
  projectData: Omit<FundingProject, 'id' | 'status' | 'amount_raised' | 'created_at' | 'updated_at'>
): Promise<{ data: FundingProject | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('funding_projects')
    .insert({
      ...projectData,
      status: 'draft',
      amount_raised: 0
    })
    .select()
    .single();

  return { data, error };
};

export const createPledge = async (
  projectId: string, 
  amount: number
): Promise<{ success: boolean, error?: string }> => {
  const { error } = await supabase.rpc('create_pledge', {
    project_id: projectId,
    pledge_amount: amount
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Shield

export const getShieldPolicies = async (): Promise<{ data: ShieldPolicy[] | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('shield_policies')
    .select('*')
    .eq('is_active', true);

  return { data, error };
};

export const subscribeToShield = async (policyId: string): Promise<{ success: boolean, error?: string }> => {
  const { error } = await supabase.rpc('subscribe_to_shield', {
    policy_id: policyId
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const getActiveShieldSubscription = async (): Promise<{ data: ShieldSubscription | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('shield_subscriptions')
    .select('*, shield_policies(*)')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return { data, error };
};

export const cancelShieldSubscription = async (subscriptionId: string): Promise<{ success: boolean, error?: string }> => {
  const { error } = await supabase
    .from('shield_subscriptions')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriptionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Creator Rewards

export const getCreatorRewards = async (): Promise<{ data: CreatorReward[] | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('creator_rewards')
    .select('*')
    .eq('creator_id', (await supabase.auth.getUser()).data.user?.id)
    .order('period', { ascending: false });

  return { data, error };
};

// Ledger

type GrowthLedgerEntry = Record<string, unknown>;

export const getLedgerEntries = async ({
  limit = 20,
  offset = 0
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<{ data: GrowthLedgerEntry[] | null, count: number | null, error: Error | null }> => {
  const { data, count, error } = await supabase
    .from('growth_ledger')
    .select('*', { count: 'exact' })
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, count, error };
};
