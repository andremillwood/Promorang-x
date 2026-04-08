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

// Role 0: New Auditor (Initial Access)
router.post('/state-0', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000000';
  const token = generateToken({
    id: userId,
    email: 'newbie@demo.com',
    username: 'auditor_new',
    display_name: 'New Auditor (Trial)',
    user_type: 'creator',
    onboarding_completed: false,
    total_rewards_earned: 0,
    verified_proofs_count: 0
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: false }, token });
});

// Role 1: Verified Participant (Ready for Activation)
router.post('/state-1', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000001';
  const token = generateToken({
    id: userId,
    email: 'verified@demo.com',
    username: 'auditor_verified',
    display_name: 'Verified Auditor',
    user_type: 'creator',
    onboarding_completed: true,
    total_rewards_earned: 0,
    verified_proofs_count: 0
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: true, total_rewards_earned: 0, verified_proofs_count: 0 }, token });
});

// Role 2: Audit Manager (Active Settlement History)
router.post('/state-2', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000002';
  const token = generateToken({
    id: userId,
    email: 'manager@demo.com',
    username: 'audit_manager',
    display_name: 'Audit Manager',
    user_type: 'creator',
    onboarding_completed: true,
    total_rewards_earned: 1,
    verified_proofs_count: 1
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: true, total_rewards_earned: 1, verified_proofs_count: 1 }, token });
});

// Role 3: Protocol Lead (High-Credibility Node)
router.post('/state-3', (req, res) => {
  const userId = 'a0000000-0000-0000-0000-000000000003';
  const token = generateToken({
    id: userId,
    email: 'lead@demo.com',
    username: 'protocol_lead',
    display_name: 'Protocol Lead',
    user_type: 'creator',
    onboarding_completed: true,
    total_rewards_earned: 100,
    verified_proofs_count: 10
  });
  res.json({ success: true, user: { id: userId, onboarding_completed: true, total_rewards_earned: 100, verified_proofs_count: 10 }, token });
});

module.exports = router;
