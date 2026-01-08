const { randomUUID } = require('crypto');

const getUserStore = () => {
  if (!global.__promorangUserStore) {
    global.__promorangUserStore = new Map();
  }
  return global.__promorangUserStore;
};

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator';

const createMockUserProfile = (context = {}) => {
  const id = context.id || 'demo-user-id';
  const username = context.username || 'demo_user';
  const displayName = context.display_name || username || 'Demo User';
  const email = context.email || 'demo@promorang.com';

  const now = new Date();
  const isoNow = now.toISOString();

  return {
    id,
    mocha_user_id: context.mocha_user_id || id,
    email,
    username,
    display_name: displayName,
    google_user_data: context.google_user_data || {
      given_name: displayName.split(' ')[0] || 'Demo',
      family_name: displayName.split(' ')[1] || 'User',
      email,
      picture: context.avatar_url || defaultAvatar,
      name: displayName
    },
    user_type: context.user_type || 'regular',
    xp_points: context.xp_points ?? 15420,
    level: context.level ?? 12,
    referral_code: context.referral_code || 'DEMO1234',
    follower_count: context.follower_count ?? 15000,
    following_count: context.following_count ?? 320,
    total_earnings_usd: context.total_earnings_usd ?? 215.5,
    promogem_balance: context.promogem_balance ?? 1250,
    points_balance: context.points_balance ?? 15420,
    keys_balance: context.keys_balance ?? 55,
    gems_balance: context.gems_balance ?? 1500,
    gold_collected: context.gold_collected ?? 12,
    user_tier: context.user_tier || 'free',
    kyc_status: context.kyc_status || 'none',
    role: context.role || 'user',
    points_streak_days: context.points_streak_days ?? 7,
    last_activity_date: context.last_activity_date || isoNow.split('T')[0],
    master_key_activated_at: context.master_key_activated_at || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: context.created_at || new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: context.updated_at || isoNow,
    avatar_url: context.avatar_url || defaultAvatar,
  };
};

const ensureUserProfile = (context = {}) => {
  const store = getUserStore();
  const id = context.id || 'demo-user-id';

  if (!store.has(id)) {
    const profile = createMockUserProfile(context);
    store.set(id, profile);
    return profile;
  }

  const current = store.get(id);
  const updated = {
    ...current,
    ...context,
    username: context.username || current.username,
    display_name: context.display_name || current.display_name,
    email: context.email || current.email,
    user_type: context.user_type || current.user_type,
    avatar_url: context.avatar_url || current.avatar_url,
    updated_at: new Date().toISOString()
  };

  store.set(id, updated);
  return updated;
};

const getUserProfile = (userId) => {
  const store = getUserStore();
  return store.get(userId) || null;
};

const updateUserProfile = (userId, updates = {}) => {
  const store = getUserStore();
  const current = store.get(userId) || createMockUserProfile({ id: userId });
  const updated = {
    ...current,
    ...updates,
    updated_at: updates.updated_at || new Date().toISOString()
  };
  store.set(userId, updated);
  return updated;
};

// Growth data store
const getGrowthStore = () => {
  if (!global.__promorangGrowthStore) {
    const now = new Date();
    const addDays = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d.toISOString();
    };

    global.__promorangGrowthStore = {
      channels: [
        {
          id: 'stable',
          name: 'Stable Growth',
          description: 'Low-risk staking with steady returns. Perfect for conservative investors.',
          lockPeriodDays: 30,
          baseMultiplier: 1.2,
          riskLevel: 'low',
          minDeposit: 100,
          maxDeposit: 5000,
          expectedApr: 12,
          icon: 'TrendingUp',
          color: 'green',
          features: [
            'Daily compounding rewards',
            'Instant withdrawal after lock period',
            'Capital protection guarantee up to 80%',
            'Access to growth analytics dashboard'
          ],
          participantCount: 3240,
          totalDeposited: 845000
        },
        {
          id: 'growth',
          name: 'Creator Accelerator',
          description: 'Moderate risk channel that boosts growth for emerging creators.',
          lockPeriodDays: 45,
          baseMultiplier: 1.45,
          riskLevel: 'medium',
          minDeposit: 250,
          maxDeposit: 7500,
          expectedApr: 19,
          icon: 'Rocket',
          color: 'blue',
          features: [
            'Weekly performance insights',
            'Access to partner marketplace',
            'Priority support from growth team',
            'Eligible for creator spotlight features'
          ],
          participantCount: 1260,
          totalDeposited: 462500
        },
        {
          id: 'prime',
          name: 'Prime Vault',
          description: 'High potential rewards with advanced automation for top creators.',
          lockPeriodDays: 60,
          baseMultiplier: 1.85,
          riskLevel: 'high',
          minDeposit: 500,
          maxDeposit: 15000,
          expectedApr: 28,
          icon: 'Star',
          color: 'purple',
          features: [
            'Dedicated growth strategist',
            'Insurance-backed principal protection',
            'Access to exclusive brand deals',
            'Performance-based bonus rewards'
          ],
          participantCount: 480,
          totalDeposited: 389000
        }
      ],
      fundingProjects: [
        {
          id: 1,
          creatorId: 'creator-1',
          creatorName: 'Alex Rivera',
          creatorAvatar: '/api/placeholder/32/32',
          title: 'Revolutionary Content Creation Studio',
          description: 'Building a state-of-the-art content creation studio with AI-powered editing tools and virtual reality capabilities.',
          category: 'Technology',
          fundingGoal: 50000,
          currentFunding: 32750,
          backerCount: 127,
          daysLeft: 18,
          minPledge: 25,
          rewardTiers: [
            { amount: 25, title: 'Early Access', description: 'Get early access to studio tools', estimatedDelivery: '2025-03-01', backerCount: 45 },
            { amount: 100, title: 'Pro Tools', description: 'Professional editing suite license', estimatedDelivery: '2025-02-01', backerCount: 32 },
            { amount: 500, title: 'Studio Visit', description: 'Exclusive studio tour and workshop', estimatedDelivery: '2025-04-01', backerCount: 8 }
          ],
          featured: true,
          status: 'active',
          createdAt: addDays(-12),
        },
        {
          id: 2,
          creatorId: 'creator-2',
          creatorName: 'Maria Santos',
          creatorAvatar: '/api/placeholder/32/32',
          title: 'Sustainable Fashion Documentary',
          description: 'A documentary exploring sustainable fashion practices and their impact on the environment.',
          category: 'Film',
          fundingGoal: 25000,
          currentFunding: 18200,
          backerCount: 89,
          daysLeft: 25,
          minPledge: 15,
          rewardTiers: [
            { amount: 15, title: 'Digital Copy', description: 'Digital download of the documentary', estimatedDelivery: '2025-05-01', backerCount: 35 },
            { amount: 50, title: 'Behind the Scenes', description: 'Documentary + behind the scenes content', estimatedDelivery: '2025-05-01', backerCount: 24 },
            { amount: 200, title: 'Producer Credit', description: 'Executive producer credit in the film', estimatedDelivery: '2025-05-01', backerCount: 5 }
          ],
          featured: false,
          status: 'active',
          createdAt: addDays(-20),
        }
      ],
      policies: [
        {
          id: 'basic',
          name: 'Basic Shield',
          description: 'Essential protection for growing creators',
          monthlyPremium: 29,
          maxCoverage: 1000,
          deductible: 50,
          minFollowers: 1000,
          coverage: {
            platformBan: false,
            algorithmChange: true,
            contentStrike: true,
            monetizationLoss: false,
            followerLoss: false
          },
          platforms: ['Instagram', 'TikTok']
        },
        {
          id: 'pro',
          name: 'Pro Shield',
          description: 'Comprehensive protection for established creators',
          monthlyPremium: 79,
          maxCoverage: 5000,
          deductible: 100,
          minFollowers: 5000,
          coverage: {
            platformBan: true,
            algorithmChange: true,
            contentStrike: true,
            monetizationLoss: true,
            followerLoss: false
          },
          platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter']
        },
        {
          id: 'enterprise',
          name: 'Enterprise Shield',
          description: 'Maximum protection for professional creators',
          monthlyPremium: 199,
          maxCoverage: 25000,
          deductible: 250,
          minFollowers: 25000,
          coverage: {
            platformBan: true,
            algorithmChange: true,
            contentStrike: true,
            monetizationLoss: true,
            followerLoss: true
          },
          platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Twitch']
        }
      ],
      stakingPositions: new Map(),
      shieldSubscriptions: new Map(),
      fundingCounter: 3,
      stakingCounter: 1
    };
  }
  return global.__promorangGrowthStore;
};

const getStakingPositions = (userId) => {
  const store = getGrowthStore();
  if (!store.stakingPositions.has(userId)) {
    store.stakingPositions.set(userId, []);
  }
  return store.stakingPositions.get(userId);
};

const addStakingPosition = (userId, channelId, amount, multiplier, lockPeriodDays) => {
  const store = getGrowthStore();
  const positions = getStakingPositions(userId);
  const now = new Date();
  const lockUntil = new Date(now);
  lockUntil.setDate(lockUntil.getDate() + lockPeriodDays);

  const position = {
    id: randomUUID(),
    channelId,
    amount,
    multiplier,
    lockUntil: lockUntil.toISOString(),
    earnedSoFar: Number((amount * (multiplier - 1) * 0.15).toFixed(2)),
    status: 'active',
    startedAt: now.toISOString()
  };

  positions.push(position);
  store.stakingCounter += 1;
  return position;
};

const getGrowthChannels = () => getGrowthStore().channels;

const getFundingProjects = () => getGrowthStore().fundingProjects;

const addFundingProject = (project) => {
  const store = getGrowthStore();
  const id = store.fundingCounter++;
  const newProject = {
    id,
    ...project,
    currentFunding: 0,
    backerCount: 0,
    status: 'active',
    featured: false,
    createdAt: new Date().toISOString()
  };
  store.fundingProjects.push(newProject);
  return newProject;
};

const pledgeToProject = (projectId, amount) => {
  const store = getGrowthStore();
  const project = store.fundingProjects.find(p => p.id === projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  project.currentFunding += amount;
  project.backerCount += 1;
  return project;
};

const getShieldPolicies = () => getGrowthStore().policies;

const getShieldSubscriptions = (userId) => {
  const store = getGrowthStore();
  if (!store.shieldSubscriptions.has(userId)) {
    store.shieldSubscriptions.set(userId, []);
  }
  return store.shieldSubscriptions.get(userId);
};

const addShieldSubscription = (userId, policyId) => {
  const store = getGrowthStore();
  const subscriptions = getShieldSubscriptions(userId);
  const policy = store.policies.find(p => p.id === policyId);
  if (!policy) {
    throw new Error('Policy not found');
  }
  const subscription = {
    id: randomUUID(),
    policyId,
    subscribedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    premiumPaid: policy.monthlyPremium
  };
  subscriptions.push(subscription);
  return subscription;
};

module.exports = {
  ensureUserProfile,
  updateUserProfile,
  getUserProfile,
  getGrowthChannels,
  getStakingPositions,
  addStakingPosition,
  getFundingProjects,
  addFundingProject,
  pledgeToProject,
  getShieldPolicies,
  addShieldSubscription,
};
