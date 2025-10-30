const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
      id: user.id,
      email: user.email,
      username: user.username,
      user_type: user.user_type
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
      user_tier: 'free'
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
        user_tier: 'free'
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

module.exports = router;
