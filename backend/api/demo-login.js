const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production';

// Demo accounts for local testing
const DEMO_ACCOUNTS = [
  {
    email: 'creator@demo.com',
    password: 'demo123',
    username: 'demo_creator',
    display_name: 'Demo Creator',
    user_type: 'creator'
  },
  {
    email: 'investor@demo.com',
    password: 'demo123',
    username: 'demo_investor',
    display_name: 'Demo Investor',
    user_type: 'investor'
  },
  {
    email: 'advertiser@demo.com',
    password: 'demo123',
    username: 'demo_advertiser',
    display_name: 'Demo Advertiser',
    user_type: 'advertiser'
  }
];

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user.userId,
      email: user.email,
      username: user.username,
      user_type: user.user_type,
      onboarding_completed: user.onboarding_completed !== undefined ? user.onboarding_completed : true
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Demo creator login endpoint
router.post('/demo-creator', (req, res) => {
  try {
    console.log('Demo creator login request received (new endpoint)');

    const demoAccount = DEMO_ACCOUNTS[0];
    const token = generateToken({
      id: 'demo-creator-id',
      email: demoAccount.email,
      username: demoAccount.username,
      display_name: demoAccount.display_name,
      user_type: demoAccount.user_type,
      points_balance: 1000,
      keys_balance: 50,
      gems_balance: 100,
      gold_collected: 0,
      user_tier: 'free',
      has_completed_onboarding: true
    });

    return res.json({
      success: true,
      user: {
        id: 'demo-creator-id',
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type,
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        gold_collected: 0,
        user_tier: 'free',
        has_completed_onboarding: true
      },
      token
    });
  } catch (error) {
    console.error('Error in demo creator login:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process demo login'
    });
  }
});

// State 0: New User (Onboarding Incomplete)
router.post('/state-0', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000000';
  const token = generateToken({
    id: userId,
    email: 'newbie@demo.com',
    username: 'state0_user',
    display_name: 'New User (State 0)',
    user_type: 'creator',
    onboarding_completed: false,
    total_rewards_earned: 0,
    verified_proofs_count: 0
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: false }, token });
});

// State 1: Exploring (Onboarding Done, No Rewards)
router.post('/state-1', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000001';
  const token = generateToken({
    id: userId,
    email: 'exploring@demo.com',
    username: 'state1_user',
    display_name: 'Explorer (State 1)',
    user_type: 'creator',
    onboarding_completed: true,
    total_rewards_earned: 0,
    verified_proofs_count: 0
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: true, total_rewards_earned: 0, verified_proofs_count: 0 }, token });
});

// State 2: Engaged (1+ Reward)
router.post('/state-2', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000002';
  const token = generateToken({
    id: userId,
    email: 'engaged@demo.com',
    username: 'state2_user',
    display_name: 'Engaged (State 2)',
    user_type: 'creator',
    onboarding_completed: true,
    total_rewards_earned: 1,
    verified_proofs_count: 1
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: true, total_rewards_earned: 1, verified_proofs_count: 1 }, token });
});

// State 3: Power (Many Rewards)
router.post('/state-3', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000003';
  const token = generateToken({
    id: userId,
    email: 'power@demo.com',
    username: 'state3_user',
    display_name: 'Power User (State 3)',
    user_type: 'creator',
    onboarding_completed: true,
    total_rewards_earned: 100,
    verified_proofs_count: 10
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: true, total_rewards_earned: 100, verified_proofs_count: 10 }, token });
});

module.exports = router;
