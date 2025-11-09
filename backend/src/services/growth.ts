import { supabase } from '../db';

type RiskLevel = 'low' | 'medium' | 'high';

type GrowthChannelRecord = {
  id: string;
  name: string;
  description: string;
  lock_period_days: number;
  base_multiplier: number;
  risk_level: RiskLevel;
  min_amount: number;
  max_amount: number | null;
  expected_apr: number;
  icon: string;
  color: string;
  features: string[];
  participant_count: number;
  total_deposited: number;
};

type StakingPositionRecord = {
  id: string;
  channel_id: string;
  amount: number;
  multiplier: number;
  lock_until: string;
  earned_so_far: number;
  status: string;
  staking_channel?: {
    id: string;
    name?: string;
    base_apr?: number;
    lock_period_days?: number;
  } | null;
};

type FundingRewardTier = {
  tier: string;
  amount: number;
  reward: string;
};

type FundingProjectRecord = {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  amount_raised: number;
  backer_count: number;
  days_left: number;
  min_pledge: number;
  status: string;
  featured: boolean;
  rewardTiers: FundingRewardTier[];
  created_at: string;
};

type FundingProjectsResult = {
  projects: FundingProjectRecord[];
  total: number;
  limit: number;
  offset: number;
};

type ShieldPolicyRecord = {
  id: string;
  name: string;
  description: string;
  premium_amount: number;
  coverage_amount: number;
  deductible: number;
  min_followers: number;
  coverage: {
    platformBan: boolean;
    algorithmChange: boolean;
    contentStrike: boolean;
    monetizationLoss: boolean;
    followerLoss: boolean;
  };
  platforms: string[];
  duration_days: number;
};

const supabaseClient = supabase as unknown as {
  from: (table: string) => any;
};

const buildDemoChannels = (): GrowthChannelRecord[] => [
  {
    id: 'channel-growth-1',
    name: 'Creator Accelerator',
    description: 'High-yield pool backing top creators and launch drops.',
    lock_period_days: 75,
    base_multiplier: 2.1,
    risk_level: 'high',
    min_amount: 500,
    max_amount: 20000,
    expected_apr: 28,
    icon: 'Rocket',
    color: 'purple',
    features: [
      'Launch drop priority',
      'Risk-adjusted backfill',
      'Creator insurance'
    ],
    participant_count: 94,
    total_deposited: 184000
  },
  {
    id: 'channel-growth-2',
    name: 'Foundation Growth',
    description: 'Balanced staking pool focused on retention and engagement.',
    lock_period_days: 45,
    base_multiplier: 1.4,
    risk_level: 'medium',
    min_amount: 150,
    max_amount: 7500,
    expected_apr: 18.5,
    icon: 'TrendingUp',
    color: 'emerald',
    features: [
      'Boosted engagement rewards',
      'Weekly treasury reports',
      'Auto-compound'
    ],
    participant_count: 182,
    total_deposited: 96500
  },
  {
    id: 'channel-growth-3',
    name: 'Stability Shield',
    description: 'Protected staking for conservative growth portfolios.',
    lock_period_days: 30,
    base_multiplier: 1.1,
    risk_level: 'low',
    min_amount: 50,
    max_amount: 5000,
    expected_apr: 9.5,
    icon: 'Shield',
    color: 'cyan',
    features: [
      'Principal protection',
      'Daily liquidity window',
      'Auto rollover'
    ],
    participant_count: 312,
    total_deposited: 142500
  }
];

const buildDemoPositions = (userId: string): StakingPositionRecord[] => [
  {
    id: 'position-1',
    channel_id: 'channel-growth-1',
    amount: 750,
    multiplier: 1.4,
    lock_until: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    earned_so_far: 86,
    status: 'active',
    staking_channel: {
      id: 'channel-growth-1',
      name: 'Creator Accelerator',
      base_apr: 28,
      lock_period_days: 75
    }
  },
  {
    id: 'position-2',
    channel_id: 'channel-growth-3',
    amount: 300,
    multiplier: 1.1,
    lock_until: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    earned_so_far: 18,
    status: 'withdrawable',
    staking_channel: {
      id: 'channel-growth-3',
      name: 'Stability Shield',
      base_apr: 9.5,
      lock_period_days: 30
    }
  }
];

const buildDemoFundingProjects = (): FundingProjectsResult => ({
  projects: [
    {
      id: 'project-1',
      creator_id: 'demo_creator',
      creator_name: 'Creator Collective',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=collective',
      title: 'Creator Success Toolkit',
      description: 'Interactive toolkit that teaches new creators how to monetize within 30 days.',
      category: 'Education',
      target_amount: 50000,
      amount_raised: 24850,
      backer_count: 186,
      days_left: 18,
      min_pledge: 75,
      status: 'active',
      featured: true,
      rewardTiers: [
        { tier: 'Supporter', amount: 75, reward: 'Early access + creator roundtable' },
        { tier: 'Partner', amount: 350, reward: 'Custom growth audit & promo spotlight' }
      ],
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'project-2',
      creator_id: 'community_capital',
      creator_name: 'Community Capital',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=community_capital',
      title: 'Growth Hub Community Fund',
      description: 'Back emerging creators through pooled capital and mentorship credits.',
      category: 'Finance',
      target_amount: 80000,
      amount_raised: 61200,
      backer_count: 265,
      days_left: 9,
      min_pledge: 120,
      status: 'active',
      featured: false,
      rewardTiers: [
        { tier: 'Backer', amount: 120, reward: 'Badge + quarterly impact report' },
        { tier: 'Angel', amount: 600, reward: 'Board invite + co-marketing slots' }
      ],
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  total: 2,
  limit: 10,
  offset: 0
});

const buildDemoShieldPolicies = (): ShieldPolicyRecord[] => [
  {
    id: 'policy-1',
    name: 'Social Safeguard',
    description: 'Covers platform bans and sudden algorithm changes for verified creators.',
    premium_amount: 45,
    coverage_amount: 7500,
    deductible: 250,
    min_followers: 1000,
    coverage: {
      platformBan: true,
      algorithmChange: true,
      contentStrike: true,
      monetizationLoss: true,
      followerLoss: false
    },
    platforms: ['instagram', 'youtube', 'tiktok'],
    duration_days: 30
  },
  {
    id: 'policy-2',
    name: 'Monetization Guard',
    description: 'Income replacement for monetization suspension and CPM volatility.',
    premium_amount: 65,
    coverage_amount: 12000,
    deductible: 400,
    min_followers: 5000,
    coverage: {
      platformBan: false,
      algorithmChange: true,
      contentStrike: true,
      monetizationLoss: true,
      followerLoss: true
    },
    platforms: ['youtube', 'twitch'],
    duration_days: 30
  }
];

const safeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const coerceCoverage = (value: unknown): ShieldPolicyRecord['coverage'] => {
  if (!value) {
    return {
      platformBan: true,
      algorithmChange: true,
      contentStrike: true,
      monetizationLoss: true,
      followerLoss: false
    };
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return {
        platformBan: Boolean(parsed.platformBan),
        algorithmChange: Boolean(parsed.algorithmChange),
        contentStrike: Boolean(parsed.contentStrike),
        monetizationLoss: Boolean(parsed.monetizationLoss),
        followerLoss: Boolean(parsed.followerLoss)
      };
    } catch (error) {
      console.warn('Failed to parse shield coverage JSON:', error);
    }
  }

  if (typeof value === 'object') {
    const coverage = value as Record<string, unknown>;
    return {
      platformBan: Boolean(coverage.platformBan),
      algorithmChange: Boolean(coverage.algorithmChange),
      contentStrike: Boolean(coverage.contentStrike),
      monetizationLoss: Boolean(coverage.monetizationLoss),
      followerLoss: Boolean(coverage.followerLoss)
    };
  }

  return {
    platformBan: true,
    algorithmChange: true,
    contentStrike: true,
    monetizationLoss: true,
    followerLoss: false
  };
};

export const growthService = {
  async getStakingChannels(): Promise<GrowthChannelRecord[]> {
    try {
      if (!supabaseClient) {
        return buildDemoChannels();
      }

      const { data, error } = await supabaseClient
        .from('staking_channels')
        .select('*')
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return buildDemoChannels();
      }

      return data.map((channel: any) => {
        const minAmount = safeNumber(channel.min_amount ?? channel.minDeposit, 0);
        const rawMax = channel.max_amount ?? channel.maxDeposit;
        const maxAmount = rawMax === null || rawMax === undefined ? null : safeNumber(rawMax, 0);

        return {
          id: channel.id ?? `channel-${Math.random().toString(36).slice(2)}`,
          name: channel.name ?? 'Growth Channel',
          description: channel.description ?? '',
          lock_period_days: safeNumber(channel.lock_period_days ?? channel.lockPeriodDays, 30),
          base_multiplier: safeNumber(channel.base_multiplier ?? channel.baseMultiplier, 1.2),
          risk_level: (channel.risk_level ?? channel.riskLevel ?? 'medium') as RiskLevel,
          min_amount: minAmount,
          max_amount: maxAmount,
          expected_apr: safeNumber(channel.expected_apr ?? channel.apy ?? channel.expectedApr, 12),
          icon: channel.icon_key ?? channel.icon ?? 'Shield',
          color: channel.color ?? 'blue',
          features: Array.isArray(channel.features) ? channel.features : [],
          participant_count: safeNumber(channel.participant_count ?? channel.participantCount, 0),
          total_deposited: safeNumber(channel.total_deposited ?? channel.totalDeposited ?? channel.total_staked, 0)
        } as GrowthChannelRecord;
      });
    } catch (error) {
      console.warn('Falling back to demo staking channels:', error);
      return buildDemoChannels();
    }
  },

  async getUserStakingPositions(userId: string | null): Promise<StakingPositionRecord[]> {
    const effectiveUserId = userId || 'growth-demo-user';

    try {
      if (!supabaseClient || !userId) {
        return buildDemoPositions(effectiveUserId);
      }

      const { data, error } = await supabaseClient
        .from('staking_positions')
        .select(`*, staking_channels:channel_id (id, name, base_apr, lock_period_days)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return buildDemoPositions(effectiveUserId);
      }

      return data.map((position: any) => ({
        id: position.id ?? `position-${Math.random().toString(36).slice(2)}`,
        channel_id: position.channel_id ?? position.channelId ?? position.staking_channels?.id ?? 'channel-growth-1',
        amount: safeNumber(position.amount, 0),
        multiplier: safeNumber(position.multiplier, 1),
        lock_until: position.lock_until ?? position.lockUntil ?? new Date().toISOString(),
        earned_so_far: safeNumber(position.earned_so_far ?? position.earnedSoFar, 0),
        status: position.status ?? 'active',
        staking_channel: position.staking_channels || null
      }));
    } catch (error) {
      console.warn('Falling back to demo staking positions:', error);
      return buildDemoPositions(effectiveUserId);
    }
  },

  async getFundingProjects(options: { limit?: number; offset?: number; status?: string } = {}): Promise<FundingProjectsResult> {
    const { limit = 10, offset = 0, status = 'active' } = options;

    try {
      if (!supabaseClient) {
        return buildDemoFundingProjects();
      }

      const query = supabaseClient
        .from('funding_projects')
        .select('*', { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return buildDemoFundingProjects();
      }

      return {
        projects: data.map((project: any) => {
          const rewardSource = Array.isArray(project.rewardTiers)
            ? project.rewardTiers
            : Array.isArray(project.rewards?.tiers)
            ? project.rewards.tiers
            : [];

          const normalizedRewards: FundingRewardTier[] = rewardSource.map((tier: any, index: number) => ({
            tier: tier?.tier ?? tier?.title ?? `Tier ${index + 1}`,
            amount: safeNumber(tier?.amount, 0),
            reward: tier?.reward ?? tier?.description ?? ''
          }));

          return {
            id: project.id ?? `project-${Math.random().toString(36).slice(2)}`,
            creator_id: project.creator_id ?? 'unknown',
            creator_name: project.creator_name ?? 'Growth Creator',
            creator_avatar: project.creator_avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=growth_creator',
            title: project.title ?? 'Growth initiative',
            description: project.description ?? '',
            category: project.category ?? 'growth',
            target_amount: safeNumber(project.target_amount ?? project.funding_goal, 0),
            amount_raised: safeNumber(project.amount_raised ?? project.current_funding, 0),
            backer_count: safeNumber(project.backer_count ?? project.supporters_count, 0),
            days_left: safeNumber(project.days_left ?? project.daysLeft, 0),
            min_pledge: safeNumber(project.min_pledge ?? project.minPledge, 0),
            status: project.status ?? 'active',
            featured: Boolean(project.featured),
            rewardTiers: normalizedRewards,
            created_at: project.created_at ?? new Date().toISOString()
          } as FundingProjectRecord;
        }),
        total: count ?? data.length,
        limit,
        offset
      };
    } catch (error) {
      console.warn('Falling back to demo funding projects:', error);
      return buildDemoFundingProjects();
    }
  },

  async getShieldPolicies(): Promise<ShieldPolicyRecord[]> {
    try {
      if (!supabaseClient) {
        return buildDemoShieldPolicies();
      }

      const { data, error } = await supabaseClient
        .from('shield_policies')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return buildDemoShieldPolicies();
      }

      return data.map((policy: any) => ({
        id: policy.id ?? `policy-${Math.random().toString(36).slice(2)}`,
        name: policy.name ?? 'Growth Shield',
        description: policy.description ?? '',
        premium_amount: safeNumber(policy.premium_amount ?? policy.monthly_premium, 0),
        coverage_amount: safeNumber(policy.coverage_amount ?? policy.max_coverage, 0),
        deductible: safeNumber(policy.deductible, 0),
        min_followers: safeNumber(policy.min_followers ?? policy.minFollowers, 0),
        coverage: coerceCoverage(policy.coverage),
        platforms: Array.isArray(policy.platforms) ? policy.platforms : [],
        duration_days: safeNumber(policy.duration_days ?? policy.durationDays, 30)
      }));
    } catch (error) {
      console.warn('Falling back to demo shield policies:', error);
      return buildDemoShieldPolicies();
    }
  }
};

export type { GrowthChannelRecord, StakingPositionRecord, FundingProjectsResult, ShieldPolicyRecord };
