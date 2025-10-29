// Mock user data
exports.mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  gems_balance: 1000,
  username: 'testuser',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock staking channel
exports.mockStakingChannel = {
  id: 'staking-1',
  name: 'Test Staking',
  description: 'A test staking channel',
  apy: 10.5,
  min_duration_days: 30,
  max_duration_days: 365,
  min_amount: 100,
  max_amount: 10000,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock staking position
exports.mockStakingPosition = {
  id: 'position-1',
  user_id: 'test-user-1',
  channel_id: 'staking-1',
  amount: 500,
  duration_days: 90,
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock funding project
exports.mockFundingProject = {
  id: 'funding-1',
  creator_id: 'test-user-1',
  title: 'Test Project',
  description: 'A test funding project',
  target_amount: 5000,
  amount_raised: 1000,
  status: 'active',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock funding pledge
exports.mockFundingPledge = {
  id: 'pledge-1',
  user_id: 'test-user-1',
  project_id: 'funding-1',
  amount: 100,
  status: 'pledged',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock shield policy
exports.mockShieldPolicy = {
  id: 'shield-1',
  name: 'Basic Shield',
  description: 'Basic protection plan',
  premium_amount: 100,
  coverage_amount: 1000,
  duration_days: 30,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock shield subscription
exports.mockShieldSubscription = {
  id: 'sub-1',
  user_id: 'test-user-1',
  policy_id: 'shield-1',
  premium_paid: 100,
  coverage_amount: 1000,
  started_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock creator reward
exports.mockCreatorReward = {
  id: 'reward-1',
  creator_id: 'test-user-1',
  amount: 50,
  period: '2025-10',
  status: 'pending',
  metrics: {
    views: 1000,
    shares: 50,
    comments: 20,
    engagement_score: 75
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock ledger entry
exports.mockLedgerEntry = {
  id: 'ledger-1',
  user_id: 'test-user-1',
  source_type: 'staking_reward',
  source_id: 'position-1',
  amount: 10.5,
  currency: 'gems',
  status: 'completed',
  metadata: { note: 'Staking reward' },
  created_at: new Date().toISOString()
};
