/**
 * Promorang Matrix MLM API
 * Handles all Matrix-related endpoints for the MLM subscription compensation system
 */

const express = require('express');
const router = express.Router();

// Demo Matrix user ID
const DEMO_MATRIX_USER_ID = 'a0000000-0000-0000-0000-000000000100';
const DEMO_MATRIX_INSTANCE_ID = 'b0000000-0000-0000-0000-000000000001';

// Subscription tier requirements for Matrix access
const MATRIX_ELIGIBLE_TIERS = ['user_50', 'user_100', 'user_200', 'user_500'];
const MATRIX_MIN_AMOUNT_CENTS = 5000; // $50 minimum

// ============================================================================
// MIDDLEWARE: Check Matrix eligibility
// ============================================================================

const requireMatrixAccess = async (req, res, next) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // For demo user, always allow access
  if (userId === DEMO_MATRIX_USER_ID || req.user?.email === 'matrix_demo@promorang.co') {
    req.matrixUser = {
      id: DEMO_MATRIX_USER_ID,
      subscription: { tier: 'user_100', status: 'active', amount_cents: 10000 },
      isDemo: true
    };
    return next();
  }

  // Check subscription status
  try {
    const supabase = req.app.get('supabase');
    if (supabase) {
      const { data: subscription } = await supabase
        .from('matrix_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ 
          error: 'Matrix access requires an active $50+ subscription',
          code: 'SUBSCRIPTION_REQUIRED'
        });
      }

      if (!MATRIX_ELIGIBLE_TIERS.includes(subscription.tier)) {
        return res.status(403).json({ 
          error: 'Matrix access requires a $50+ subscription tier',
          code: 'TIER_INSUFFICIENT'
        });
      }

      req.matrixUser = { id: userId, subscription, isDemo: false };
      return next();
    }
  } catch (err) {
    console.error('Matrix access check error:', err);
  }

  // Fallback: allow for demo purposes
  req.matrixUser = { id: userId, subscription: null, isDemo: true };
  next();
};

// ============================================================================
// DEMO DATA GENERATORS
// ============================================================================

const generateDemoDashboard = () => {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + (7 - periodEnd.getDay())); // Next Sunday
  
  return {
    user: {
      id: DEMO_MATRIX_USER_ID,
      username: 'matrix_builder',
      display_name: 'Matrix Builder Demo',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=matrixbuilder'
    },
    rank: {
      current: {
        key: 'entered_apprentice',
        name: 'Entered Apprentice',
        badge_icon: '⭐',
        badge_color: '#8b5cf6',
        weekly_cap_cents: 1000000,
        eligible_depth: 2
      },
      next: {
        key: 'fellow_craft',
        name: 'Fellow Craft',
        badge_icon: '🌙',
        requirements: {
          min_active_recruits: 5,
          min_team_size: 15,
          min_retention_rate: 0.55
        },
        progress: {
          active_recruits: { current: 6, required: 5, met: true },
          team_size: { current: 12, required: 15, met: false },
          retention_rate: { current: 0.75, required: 0.55, met: true }
        }
      }
    },
    subscription: {
      tier: 'user_100',
      tier_name: '$100/month',
      status: 'active',
      amount_cents: 10000,
      current_period_end: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      days_remaining: 25
    },
    qualification: {
      current_period: {
        id: 'e0000000-0000-0000-0000-000000000004',
        status: 'pending',
        period_start: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: periodEnd.toISOString(),
        days_remaining: Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))
      },
      status: 'on_track',
      requirements: {
        active_subscription: { met: true, value: true },
        min_active_recruits: { met: true, current: 6, required: 2 },
        support_actions: { met: true, current: 4, required: 3 },
        retention_rate: { met: true, current: 0.75, required: 0.50 }
      },
      reasons: ['All requirements currently met']
    },
    earnings: {
      current_period: {
        pending: 1000,
        eligible: 0,
        total: 1000
      },
      last_period: {
        earned: 4750,
        paid: 4750
      },
      lifetime: {
        total_earned: 18500,
        total_paid: 13750,
        pending: 4750
      },
      weekly_cap: 1000000,
      cap_used_percent: 0.475
    },
    team: {
      direct_recruits: 8,
      active_recruits: 6,
      total_team_size: 12,
      retention_rate: 0.75,
      new_this_period: 0,
      at_risk: 2
    },
    next_payout: {
      date: periodEnd.toISOString(),
      estimated_amount: 4750,
      status: 'processing'
    },
    activity: {
      recent_events: [
        { type: 'support_logged', message: 'Check-in with Sarah Johnson', time: '1 hour ago' },
        { type: 'support_logged', message: 'Training session with Mike Chen', time: '2 hours ago' },
        { type: 'earning', message: 'Residual commission: $5.00 from sarah_recruit', time: '1 hour ago' },
        { type: 'earning', message: 'Residual commission: $5.00 from mike_recruit', time: '1 hour ago' },
        { type: 'renewal', message: 'Amy Taylor renewed subscription', time: '3 days ago' },
        { type: 'at_risk', message: 'James Brown payment failed', time: '5 days ago' }
      ]
    }
  };
};

const generateDemoRecruits = (status = 'all') => {
  const recruits = [
    {
      id: 'a0000000-0000-0000-0000-000000000101',
      username: 'sarah_recruit',
      display_name: 'Sarah Johnson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      subscription: { tier: 'user_50', status: 'active', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 2,
      onboarding_complete: true,
      their_recruits: 2,
      earnings_generated: 3500
    },
    {
      id: 'a0000000-0000-0000-0000-000000000102',
      username: 'mike_recruit',
      display_name: 'Mike Chen',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      subscription: { tier: 'user_50', status: 'active', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 1,
      onboarding_complete: true,
      their_recruits: 0,
      earnings_generated: 2500
    },
    {
      id: 'a0000000-0000-0000-0000-000000000103',
      username: 'emma_recruit',
      display_name: 'Emma Williams',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      subscription: { tier: 'user_100', status: 'active', amount_cents: 10000 },
      linked_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 1,
      onboarding_complete: true,
      their_recruits: 1,
      earnings_generated: 4000
    },
    {
      id: 'a0000000-0000-0000-0000-000000000104',
      username: 'james_recruit',
      display_name: 'James Brown',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      subscription: { tier: 'user_50', status: 'past_due', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 1,
      onboarding_complete: true,
      their_recruits: 0,
      earnings_generated: 1500,
      at_risk: true,
      risk_reason: 'Payment failed 5 days ago'
    },
    {
      id: 'a0000000-0000-0000-0000-000000000105',
      username: 'lisa_recruit',
      display_name: 'Lisa Davis',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      subscription: { tier: 'user_100', status: 'active', amount_cents: 10000 },
      linked_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 1,
      onboarding_complete: true,
      their_recruits: 1,
      earnings_generated: 5500
    },
    {
      id: 'a0000000-0000-0000-0000-000000000106',
      username: 'david_recruit',
      display_name: 'David Wilson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      subscription: { tier: 'user_50', status: 'canceled', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 1,
      onboarding_complete: true,
      their_recruits: 0,
      earnings_generated: 500,
      churned: true,
      churn_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'a0000000-0000-0000-0000-000000000107',
      username: 'amy_recruit',
      display_name: 'Amy Taylor',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amy',
      subscription: { tier: 'user_50', status: 'active', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 0,
      onboarding_complete: true,
      their_recruits: 0,
      earnings_generated: 1500
    },
    {
      id: 'a0000000-0000-0000-0000-000000000108',
      username: 'chris_recruit',
      display_name: 'Chris Martinez',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris',
      subscription: { tier: 'user_50', status: 'active', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      level: 1,
      support_actions_this_period: 0,
      onboarding_complete: false,
      their_recruits: 0,
      earnings_generated: 1000
    }
  ];

  // Second level recruits
  const level2Recruits = [
    {
      id: 'a0000000-0000-0000-0000-000000000111',
      username: 'alex_l2',
      display_name: 'Alex Thompson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      subscription: { tier: 'user_50', status: 'active', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      level: 2,
      sponsor: 'sarah_recruit',
      onboarding_complete: true,
      earnings_generated: 250
    },
    {
      id: 'a0000000-0000-0000-0000-000000000112',
      username: 'nina_l2',
      display_name: 'Nina Garcia',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
      subscription: { tier: 'user_50', status: 'active', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      level: 2,
      sponsor: 'sarah_recruit',
      onboarding_complete: true,
      earnings_generated: 250
    },
    {
      id: 'a0000000-0000-0000-0000-000000000113',
      username: 'ryan_l2',
      display_name: 'Ryan Lee',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
      subscription: { tier: 'user_50', status: 'past_due', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      level: 2,
      sponsor: 'emma_recruit',
      onboarding_complete: true,
      earnings_generated: 0,
      at_risk: true
    },
    {
      id: 'a0000000-0000-0000-0000-000000000114',
      username: 'olivia_l2',
      display_name: 'Olivia Moore',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
      subscription: { tier: 'user_50', status: 'active', amount_cents: 5000 },
      linked_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      level: 2,
      sponsor: 'lisa_recruit',
      onboarding_complete: true,
      earnings_generated: 250
    }
  ];

  let allRecruits = [...recruits, ...level2Recruits];

  if (status === 'active') {
    allRecruits = allRecruits.filter(r => r.subscription.status === 'active');
  } else if (status === 'past_due') {
    allRecruits = allRecruits.filter(r => r.subscription.status === 'past_due');
  } else if (status === 'at_risk') {
    allRecruits = allRecruits.filter(r => r.at_risk);
  } else if (status === 'churned') {
    allRecruits = allRecruits.filter(r => r.churned);
  }

  return allRecruits;
};

const generateDemoEarnings = (periodId = null) => {
  const earnings = [
    // Current period (pending)
    { id: 'earn-001', period: 'current', source_type: 'residual_commission', amount_cents: 500, status: 'pending', recruit: 'sarah_recruit', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-002', period: 'current', source_type: 'residual_commission', amount_cents: 500, status: 'pending', recruit: 'mike_recruit', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    
    // Last period (eligible/paid)
    { id: 'earn-003', period: 'last', source_type: 'residual_commission', amount_cents: 500, status: 'eligible', recruit: 'sarah_recruit', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-004', period: 'last', source_type: 'residual_commission', amount_cents: 500, status: 'eligible', recruit: 'mike_recruit', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-005', period: 'last', source_type: 'residual_commission', amount_cents: 1000, status: 'eligible', recruit: 'emma_recruit', created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-006', period: 'last', source_type: 'residual_commission', amount_cents: 1000, status: 'eligible', recruit: 'lisa_recruit', created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-007', period: 'last', source_type: 'residual_commission', amount_cents: 500, status: 'eligible', recruit: 'amy_recruit', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-008', period: 'last', source_type: 'residual_commission', amount_cents: 500, status: 'eligible', recruit: 'chris_recruit', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-009', period: 'last', source_type: 'residual_commission', amount_cents: 250, status: 'eligible', recruit: 'alex_l2', level: 2, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-010', period: 'last', source_type: 'residual_commission', amount_cents: 250, status: 'eligible', recruit: 'nina_l2', level: 2, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-011', period: 'last', source_type: 'residual_commission', amount_cents: 250, status: 'eligible', recruit: 'olivia_l2', level: 2, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    
    // Older periods (paid)
    { id: 'earn-012', period: 'week-2', source_type: 'direct_commission', amount_cents: 1000, status: 'paid', recruit: 'chris_recruit', created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-013', period: 'week-2', source_type: 'residual_commission', amount_cents: 500, status: 'paid', recruit: 'sarah_recruit', created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-014', period: 'week-2', source_type: 'residual_commission', amount_cents: 500, status: 'paid', recruit: 'mike_recruit', created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-015', period: 'week-2', source_type: 'residual_commission', amount_cents: 1000, status: 'paid', recruit: 'emma_recruit', created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-016', period: 'week-2', source_type: 'residual_commission', amount_cents: 1000, status: 'paid', recruit: 'lisa_recruit', created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-017', period: 'week-2', source_type: 'residual_commission', amount_cents: 500, status: 'paid', recruit: 'amy_recruit', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    
    { id: 'earn-018', period: 'week-3', source_type: 'direct_commission', amount_cents: 1000, status: 'paid', recruit: 'amy_recruit', created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-019', period: 'week-3', source_type: 'residual_commission', amount_cents: 500, status: 'paid', recruit: 'sarah_recruit', created_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-020', period: 'week-3', source_type: 'residual_commission', amount_cents: 500, status: 'paid', recruit: 'mike_recruit', created_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-021', period: 'week-3', source_type: 'residual_commission', amount_cents: 1000, status: 'paid', recruit: 'emma_recruit', created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'earn-022', period: 'week-3', source_type: 'residual_commission', amount_cents: 1000, status: 'paid', recruit: 'lisa_recruit', created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  return earnings;
};

const generateDemoPayouts = () => {
  return [
    {
      id: 'payout-001',
      period: 'Week of Jan 6-12',
      requested_amount_cents: 4750,
      approved_amount_cents: 4750,
      status: 'processing',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_payment_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'payout-002',
      period: 'Week of Dec 30 - Jan 5',
      requested_amount_cents: 5000,
      approved_amount_cents: 5000,
      status: 'paid',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'payout-003',
      period: 'Week of Dec 23-29',
      requested_amount_cents: 4000,
      approved_amount_cents: 4000,
      status: 'paid',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

const generateDemoRanks = () => {
  return [
    { key: 'promoranger', name: 'Promoranger', badge_icon: '🌟', badge_color: '#6366f1', order: 1, weekly_cap: '$50', eligible_depth: 1, requirements: { recruits: 0, team: 0, retention: '0%' } },
    { key: 'entered_apprentice', name: 'Entered Apprentice', badge_icon: '⭐', badge_color: '#8b5cf6', order: 2, weekly_cap: '$100', eligible_depth: 2, requirements: { recruits: 3, team: 5, retention: '50%' }, current: true },
    { key: 'fellow_craft', name: 'Fellow Craft', badge_icon: '🌙', badge_color: '#a855f7', order: 3, weekly_cap: '$150', eligible_depth: 3, requirements: { recruits: 5, team: 15, retention: '55%' }, next: true },
    { key: 'master_mason', name: 'Master Mason', badge_icon: '🔮', badge_color: '#d946ef', order: 4, weekly_cap: '$200', eligible_depth: 4, requirements: { recruits: 8, team: 30, retention: '60%' } },
    { key: 'presidential', name: 'Presidential', badge_icon: '👑', badge_color: '#ec4899', order: 5, weekly_cap: '$250', eligible_depth: 5, requirements: { recruits: 12, team: 50, retention: '70%' } },
    { key: 'diamond', name: 'Diamond', badge_icon: '💎', badge_color: '#f43f5e', order: 6, weekly_cap: '$500', eligible_depth: 6, requirements: { recruits: 20, team: 100, retention: '80%' } },
    { key: 'blue_diamond', name: 'Blue Diamond', badge_icon: '💠', badge_color: '#0ea5e9', order: 7, weekly_cap: '$1000', eligible_depth: 7, requirements: { recruits: 35, team: 250, retention: '90%' } }
  ];
};

const generateDemoSupportLogs = () => {
  return [
    { id: 'log-001', recruit: 'sarah_recruit', action_type: 'check_in', notes: 'Weekly progress check-in call', verified: true, created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: 'log-002', recruit: 'mike_recruit', action_type: 'training_attended', notes: 'Advanced training session', verified: true, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'log-003', recruit: 'emma_recruit', action_type: 'message_sent', notes: 'Growth tips shared', verified: true, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: 'log-004', recruit: 'lisa_recruit', action_type: 'check_in', notes: 'Performance review', verified: true, created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 'log-005', recruit: 'james_recruit', action_type: 'check_in', notes: 'Retention outreach - payment issue', verified: true, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-006', recruit: 'chris_recruit', action_type: 'onboarding_complete', notes: 'Completed onboarding walkthrough', verified: true, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-007', recruit: 'amy_recruit', action_type: 'activation_help', notes: 'Helped set up first campaign', verified: true, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
  ];
};

const generateDemoTraining = () => {
  return {
    modules: [
      { id: 'mod-001', title: 'Matrix Fundamentals', description: 'Learn the basics of the Promorang Matrix compensation system', duration: 30, required: true, completed: true, score: 95 },
      { id: 'mod-002', title: 'Recruiting Best Practices', description: 'How to effectively recruit and onboard new team members', duration: 45, required: true, completed: true, score: 88 },
      { id: 'mod-003', title: 'Support & Retention', description: 'Strategies for supporting your team and maintaining retention', duration: 40, required: false, completed: true, score: 92, rank_required: 'entered_apprentice' },
      { id: 'mod-004', title: 'Leadership Development', description: 'Advanced leadership skills for building a successful team', duration: 60, required: false, completed: false, rank_required: 'presidential' },
      { id: 'mod-005', title: 'Compliance & Ethics', description: 'Understanding compliance requirements and ethical practices', duration: 25, required: true, completed: true, score: 100 }
    ],
    progress: {
      completed: 4,
      total: 5,
      required_completed: 3,
      required_total: 3
    }
  };
};

// ============================================================================
// API ROUTES
// ============================================================================

// GET /api/matrix/status - Check Matrix access status (no auth required)
router.get('/status', (req, res) => {
  res.json({
    available: true,
    min_subscription: '$50/month',
    eligible_tiers: ['user_50', 'user_100', 'user_200', 'user_500'],
    features: [
      'Direct sponsor commissions (20%)',
      'Residual renewal commissions (10%)',
      'Multi-level depth earnings',
      'Rank advancement bonuses',
      'Team retention bonuses',
      'Weekly payouts'
    ]
  });
});

// GET /api/matrix/dashboard - Main Matrix dashboard
router.get('/dashboard', requireMatrixAccess, async (req, res) => {
  try {
    // Return demo data
    const dashboard = generateDemoDashboard();
    res.json(dashboard);
  } catch (err) {
    console.error('Matrix dashboard error:', err);
    res.status(500).json({ error: 'Failed to load Matrix dashboard' });
  }
});

// GET /api/matrix/team/recruits - Get recruits list
router.get('/team/recruits', requireMatrixAccess, async (req, res) => {
  try {
    const { status = 'all', level } = req.query;
    let recruits = generateDemoRecruits(status);
    
    if (level) {
      recruits = recruits.filter(r => r.level === parseInt(level));
    }
    
    res.json({
      recruits,
      summary: {
        total: recruits.length,
        active: recruits.filter(r => r.subscription.status === 'active').length,
        past_due: recruits.filter(r => r.subscription.status === 'past_due').length,
        churned: recruits.filter(r => r.churned).length,
        at_risk: recruits.filter(r => r.at_risk).length
      }
    });
  } catch (err) {
    console.error('Matrix recruits error:', err);
    res.status(500).json({ error: 'Failed to load recruits' });
  }
});

// GET /api/matrix/team/recruits/:recruitId - Get single recruit details
router.get('/team/recruits/:recruitId', requireMatrixAccess, async (req, res) => {
  try {
    const { recruitId } = req.params;
    const recruits = generateDemoRecruits('all');
    const recruit = recruits.find(r => r.id === recruitId);
    
    if (!recruit) {
      return res.status(404).json({ error: 'Recruit not found' });
    }
    
    // Add detailed info
    recruit.support_history = generateDemoSupportLogs().filter(l => l.recruit === recruit.username);
    recruit.earnings_history = generateDemoEarnings().filter(e => e.recruit === recruit.username);
    
    res.json(recruit);
  } catch (err) {
    console.error('Matrix recruit detail error:', err);
    res.status(500).json({ error: 'Failed to load recruit details' });
  }
});

// POST /api/matrix/support/log - Log a support action
router.post('/support/log', requireMatrixAccess, async (req, res) => {
  try {
    const { recruit_user_id, action_type, notes, evidence_url } = req.body;
    
    if (!recruit_user_id || !action_type) {
      return res.status(400).json({ error: 'recruit_user_id and action_type are required' });
    }
    
    const validActions = ['onboarding_complete', 'check_in', 'training_attended', 'module_completed', 'activation_help', 'call_logged', 'message_sent', 'other'];
    if (!validActions.includes(action_type)) {
      return res.status(400).json({ error: 'Invalid action_type', valid_actions: validActions });
    }
    
    // In production, this would insert into matrix_support_logs
    const newLog = {
      id: `log-${Date.now()}`,
      sponsor_user_id: req.matrixUser.id,
      recruit_user_id,
      action_type,
      notes: notes || '',
      evidence_url: evidence_url || null,
      verified: false,
      created_at: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      log: newLog,
      message: 'Support action logged successfully'
    });
  } catch (err) {
    console.error('Matrix support log error:', err);
    res.status(500).json({ error: 'Failed to log support action' });
  }
});

// GET /api/matrix/support/logs - Get support logs
router.get('/support/logs', requireMatrixAccess, async (req, res) => {
  try {
    const logs = generateDemoSupportLogs();
    res.json({ logs });
  } catch (err) {
    console.error('Matrix support logs error:', err);
    res.status(500).json({ error: 'Failed to load support logs' });
  }
});

// GET /api/matrix/earnings - Get earnings ledger
router.get('/earnings', requireMatrixAccess, async (req, res) => {
  try {
    const { period_id, status } = req.query;
    let earnings = generateDemoEarnings(period_id);
    
    if (status) {
      earnings = earnings.filter(e => e.status === status);
    }
    
    const summary = {
      total_pending: earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount_cents, 0),
      total_eligible: earnings.filter(e => e.status === 'eligible').reduce((sum, e) => sum + e.amount_cents, 0),
      total_paid: earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount_cents, 0),
      total_all: earnings.reduce((sum, e) => sum + e.amount_cents, 0)
    };
    
    res.json({ earnings, summary });
  } catch (err) {
    console.error('Matrix earnings error:', err);
    res.status(500).json({ error: 'Failed to load earnings' });
  }
});

// GET /api/matrix/payouts - Get payout history
router.get('/payouts', requireMatrixAccess, async (req, res) => {
  try {
    const payouts = generateDemoPayouts();
    res.json({ payouts });
  } catch (err) {
    console.error('Matrix payouts error:', err);
    res.status(500).json({ error: 'Failed to load payouts' });
  }
});

// POST /api/matrix/payouts/request - Request a payout
router.post('/payouts/request', requireMatrixAccess, async (req, res) => {
  try {
    const { period_id, amount_cents } = req.body;
    
    // In production, this would create a payout request
    const newRequest = {
      id: `payout-${Date.now()}`,
      user_id: req.matrixUser.id,
      period_id: period_id || 'current',
      requested_amount_cents: amount_cents || 4750,
      status: 'requested',
      created_at: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      payout_request: newRequest,
      message: 'Payout request submitted successfully'
    });
  } catch (err) {
    console.error('Matrix payout request error:', err);
    res.status(500).json({ error: 'Failed to submit payout request' });
  }
});

// GET /api/matrix/rank/history - Get rank history
router.get('/rank/history', requireMatrixAccess, async (req, res) => {
  try {
    const ranks = generateDemoRanks();
    const history = [
      { rank: 'promoranger', achieved_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { rank: 'entered_apprentice', achieved_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), current: true }
    ];
    
    res.json({ ranks, history, current_rank: 'entered_apprentice' });
  } catch (err) {
    console.error('Matrix rank history error:', err);
    res.status(500).json({ error: 'Failed to load rank history' });
  }
});

// GET /api/matrix/qualification/history - Get qualification history
router.get('/qualification/history', requireMatrixAccess, async (req, res) => {
  try {
    const history = [
      { period: 'Week of Jan 6-12', status: 'pending', reasons: ['Period in progress'] },
      { period: 'Week of Dec 30 - Jan 5', status: 'pass', reasons: ['All requirements met'] },
      { period: 'Week of Dec 23-29', status: 'pass', reasons: ['All requirements met'] },
      { period: 'Week of Dec 16-22', status: 'pass', reasons: ['All requirements met'] }
    ];
    
    res.json({ history });
  } catch (err) {
    console.error('Matrix qualification history error:', err);
    res.status(500).json({ error: 'Failed to load qualification history' });
  }
});

// GET /api/matrix/training - Get training modules and progress
router.get('/training', requireMatrixAccess, async (req, res) => {
  try {
    const training = generateDemoTraining();
    res.json(training);
  } catch (err) {
    console.error('Matrix training error:', err);
    res.status(500).json({ error: 'Failed to load training' });
  }
});

// GET /api/matrix/ranks - Get all ranks info
router.get('/ranks', requireMatrixAccess, async (req, res) => {
  try {
    const ranks = generateDemoRanks();
    res.json({ ranks });
  } catch (err) {
    console.error('Matrix ranks error:', err);
    res.status(500).json({ error: 'Failed to load ranks' });
  }
});

// GET /api/matrix/referral-link - Get user's Matrix referral link
router.get('/referral-link', requireMatrixAccess, async (req, res) => {
  try {
    const userId = req.matrixUser.id;
    const referralCode = `MTX-${userId.substring(0, 8).toUpperCase()}`;
    
    res.json({
      referral_code: referralCode,
      referral_link: `https://promorang.co/join?ref=${referralCode}&matrix=true`,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://promorang.co/join?ref=${referralCode}`
    });
  } catch (err) {
    console.error('Matrix referral link error:', err);
    res.status(500).json({ error: 'Failed to generate referral link' });
  }
});

// GET /api/matrix/network-graph - Get network visualization data
router.get('/network-graph', requireMatrixAccess, async (req, res) => {
  try {
    const recruits = generateDemoRecruits('all');
    
    // Build graph nodes and edges
    const nodes = [
      { id: DEMO_MATRIX_USER_ID, label: 'You', level: 0, type: 'self' },
      ...recruits.map(r => ({
        id: r.id,
        label: r.display_name,
        level: r.level,
        type: r.subscription.status === 'active' ? 'active' : r.at_risk ? 'at_risk' : 'inactive'
      }))
    ];
    
    const edges = recruits.filter(r => r.level === 1).map(r => ({
      from: DEMO_MATRIX_USER_ID,
      to: r.id
    }));
    
    // Add level 2 edges
    recruits.filter(r => r.level === 2).forEach(r => {
      const sponsor = recruits.find(rec => rec.username === r.sponsor);
      if (sponsor) {
        edges.push({ from: sponsor.id, to: r.id });
      }
    });
    
    res.json({ nodes, edges });
  } catch (err) {
    console.error('Matrix network graph error:', err);
    res.status(500).json({ error: 'Failed to load network graph' });
  }
});

module.exports = router;
