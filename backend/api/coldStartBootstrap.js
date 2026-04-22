/**
 * Cold Start Bootstrap API
 * 
 * Comprehensive API routes for:
 * 1. Monthly sampling provisions
 * 2. Host/operator tools
 * 3. Representative/ambassador system
 * 4. Founding member mechanics
 * 5. B2B venue import
 * 6. Referral incentives and cross-side unlocks
 */

const express = require('express');
const router = express.Router();

// Services
const monthlySamplingService = require('../services/monthlySamplingService');
const hostToolsService = require('../services/hostToolsService');
const representativeService = require('../services/representativeService');
const foundingMemberService = require('../services/foundingMemberService');
const referralIncentiveService = require('../services/referralIncentiveService');

// Middleware
const { requireAuth, requireRole } = require('../middleware/auth');

// =============================================================================
// PART 1: MONTHLY SAMPLING PROVISIONS
// =============================================================================

/**
 * GET /api/cold-start/sampling-allowance
 * Get current month's sampling allowance
 */
router.get('/sampling-allowance', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await monthlySamplingService.getCurrentMonthStats(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.stats
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error getting allowance:', error);
    res.status(500).json({ success: false, error: 'Failed to get allowance' });
  }
});

/**
 * GET /api/cold-start/sampling-eligibility
 * Check if user can create activation this month
 */
router.get('/sampling-eligibility', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tier = req.query.tier || 'free';
    
    const result = await monthlySamplingService.canCreateMonthlyActivation(userId, tier);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error checking eligibility:', error);
    res.status(500).json({ success: false, error: 'Failed to check eligibility' });
  }
});

/**
 * POST /api/cold-start/use-activation
 * Record usage of monthly activation
 */
router.post('/use-activation', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tier } = req.body;
    
    const result = await monthlySamplingService.useMonthlyActivation(userId, tier || 'free');
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error using activation:', error);
    res.status(500).json({ success: false, error: 'Failed to use activation' });
  }
});

/**
 * GET /api/cold-start/allowance-history
 * Get allowance history
 */
router.get('/allowance-history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;
    
    const result = await monthlySamplingService.getAllowanceHistory(userId, months);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.history
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error getting history:', error);
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
});

/**
 * GET /api/cold-start/tier-graduation
 * Check if merchant qualifies for tier graduation
 */
router.get('/tier-graduation', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTier = req.query.tier || 'free';
    
    const result = await monthlySamplingService.checkTierGraduation(userId, currentTier);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error checking graduation:', error);
    res.status(500).json({ success: false, error: 'Failed to check graduation' });
  }
});

/**
 * POST /api/cold-start/add-bonus-allowance
 * Add bonus allowance (for referrals, founding status, etc.)
 * Admin/Operator only
 */
router.post('/add-bonus-allowance', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const { merchantId, bonusCount, reason, source } = req.body;
    
    if (!merchantId || !bonusCount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: merchantId, bonusCount'
      });
    }
    
    const result = await monthlySamplingService.addBonusAllowance(
      merchantId,
      bonusCount,
      reason,
      source
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error adding bonus:', error);
    res.status(500).json({ success: false, error: 'Failed to add bonus' });
  }
});

// =============================================================================
// PART 2: HOST/OPERATOR TOOLS (Admin/Operator only)
// =============================================================================

/**
 * POST /api/cold-start/host/bulk-create-merchants
 * Bulk create merchant profiles
 */
router.post('/host/bulk-create-merchants', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { venues } = req.body;
    
    if (!venues || !Array.isArray(venues)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: venues (array)'
      });
    }
    
    const result = await hostToolsService.bulkCreateMerchantProfiles(operatorId, venues);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error bulk creating merchants:', error);
    res.status(500).json({ success: false, error: 'Failed to create merchants' });
  }
});

/**
 * POST /api/cold-start/host/fast-track
 * Fast-track a venue (skip sampling limits)
 */
router.post('/host/fast-track', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { merchantId, config } = req.body;
    
    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: merchantId'
      });
    }
    
    const result = await hostToolsService.fastTrackVenue(operatorId, merchantId, config || {});
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error fast-tracking:', error);
    res.status(500).json({ success: false, error: 'Failed to fast-track' });
  }
});

/**
 * POST /api/cold-start/host/co-branded
 * Create co-branded activation
 */
router.post('/host/co-branded', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { merchantId, partnershipConfig } = req.body;
    
    if (!merchantId || !partnershipConfig) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: merchantId, partnershipConfig'
      });
    }
    
    const result = await hostToolsService.createCoBrandedActivation(
      operatorId,
      merchantId,
      partnershipConfig
    );
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error creating co-branded:', error);
    res.status(500).json({ success: false, error: 'Failed to create co-branded' });
  }
});

/**
 * POST /api/cold-start/host/import-venues
 * Import venues from external source
 */
router.post('/host/import-venues', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { source, records, fileName, options } = req.body;
    
    if (!source || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: source, records (array)'
      });
    }
    
    const result = await hostToolsService.importVenues(operatorId, {
      source,
      records,
      fileName,
      options
    });
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error importing venues:', error);
    res.status(500).json({ success: false, error: 'Failed to import venues' });
  }
});

/**
 * POST /api/cold-start/host/process-import-record
 * Process a single import record
 */
router.post('/host/process-import-record', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { recordId, options } = req.body;
    
    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: recordId'
      });
    }
    
    const result = await hostToolsService.processImportRecord(operatorId, recordId, options || {});
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error processing record:', error);
    res.status(500).json({ success: false, error: 'Failed to process record' });
  }
});

/**
 * POST /api/cold-start/host/pre-populate
 * Pre-populate venue data
 */
router.post('/host/pre-populate', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const operatorId = req.user.id;
    const venueData = req.body;
    
    const result = await hostToolsService.prePopulateVenue(venueData, operatorId);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error pre-populating:', error);
    res.status(500).json({ success: false, error: 'Failed to pre-populate' });
  }
});

/**
 * POST /api/cold-start/host/claim-venue
 * Claim a pre-populated venue
 */
router.post('/host/claim-venue', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { claimToken } = req.body;
    
    if (!claimToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: claimToken'
      });
    }
    
    const result = await hostToolsService.claimPrePopulatedVenue(claimToken, userId);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error claiming venue:', error);
    res.status(500).json({ success: false, error: 'Failed to claim venue' });
  }
});

/**
 * GET /api/cold-start/host/import-status/:batchId
 * Get import batch status
 */
router.get('/host/import-status/:batchId', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const result = await hostToolsService.getImportBatchStatus(batchId);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting import status:', error);
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

/**
 * GET /api/cold-start/host/pre-populated-venues
 * Get all pre-populated venues
 */
router.get('/host/pre-populated-venues', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const filters = {
      unclaimedOnly: req.query.unclaimed === 'true',
      city: req.query.city,
      category: req.query.category
    };
    
    const result = await hostToolsService.getPrePopulatedVenues(filters);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting venues:', error);
    res.status(500).json({ success: false, error: 'Failed to get venues' });
  }
});

// =============================================================================
// PART 3: REPRESENTATIVE/AMBASSADOR SYSTEM
// =============================================================================

/**
 * POST /api/cold-start/representative/apply
 * Submit application to become representative
 */
router.post('/representative/apply', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationData = req.body;
    
    const result = await representativeService.submitApplication(userId, applicationData);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error submitting application:', error);
    res.status(500).json({ success: false, error: 'Failed to submit application' });
  }
});

/**
 * GET /api/cold-start/representative/dashboard
 * Get representative dashboard
 */
router.get('/representative/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get representative ID from user ID
    const { data: rep } = await supabase
      ?.from('representatives')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!rep) {
      return res.status(404).json({
        success: false,
        error: 'Not a representative'
      });
    }
    
    const result = await representativeService.getRepresentativeDashboard(rep.id);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard' });
  }
});

/**
 * POST /api/cold-start/representative/record-onboarding
 * Record venue onboarding by representative
 */
router.post('/representative/record-onboarding', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId, metadata } = req.body;
    
    // Get representative ID
    const { data: rep } = await supabase
      ?.from('representatives')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!rep) {
      return res.status(403).json({
        success: false,
        error: 'Not a representative'
      });
    }
    
    const result = await representativeService.recordOnboarding(
      rep.id,
      venueId,
      metadata || {}
    );
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error recording onboarding:', error);
    res.status(500).json({ success: false, error: 'Failed to record onboarding' });
  }
});

/**
 * GET /api/cold-start/representative/performance
 * Get representative performance (admin view)
 */
router.get('/representative/performance', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const filters = {
      territory: req.query.territory,
      niche: req.query.niche,
      status: req.query.status
    };
    
    const result = await representativeService.getRepresentativePerformance(filters);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting performance:', error);
    res.status(500).json({ success: false, error: 'Failed to get performance' });
  }
});

/**
 * GET /api/cold-start/representative/applications
 * Get all applications (admin review)
 */
router.get('/representative/applications', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const status = req.query.status || null;
    
    const result = await representativeService.getApplications(status);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting applications:', error);
    res.status(500).json({ success: false, error: 'Failed to get applications' });
  }
});

/**
 * POST /api/cold-start/representative/review-application
 * Review and approve/reject application
 */
router.post('/representative/review-application', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { applicationId, status, notes, commissionRateNew, commissionRateRecurring } = req.body;
    
    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: applicationId, status'
      });
    }
    
    const result = await representativeService.reviewApplication(applicationId, {
      reviewerId,
      status,
      notes,
      commissionRateNew,
      commissionRateRecurring
    });
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error reviewing application:', error);
    res.status(500).json({ success: false, error: 'Failed to review application' });
  }
});

/**
 * GET /api/cold-start/representative/territories
 * Get territories overview
 */
router.get('/representative/territories', requireAuth, async (req, res) => {
  try {
    const result = await representativeService.getTerritoriesOverview();
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting territories:', error);
    res.status(500).json({ success: false, error: 'Failed to get territories' });
  }
});

// =============================================================================
// PART 4: FOUNDING MEMBER MECHANICS
// =============================================================================

/**
 * GET /api/cold-start/founding-member/check-qualification
 * Check if user qualifies for founding member
 */
router.get('/founding-member/check-qualification', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await foundingMemberService.checkQualification(userId);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error checking qualification:', error);
    res.status(500).json({ success: false, error: 'Failed to check qualification' });
  }
});

/**
 * POST /api/cold-start/founding-member/enroll
 * Enroll user as founding member
 */
router.post('/founding-member/enroll', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberType, source } = req.body;
    
    const result = await foundingMemberService.enrollFoundingMember(
      userId,
      memberType || 'user',
      source || 'application'
    );
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error enrolling:', error);
    res.status(500).json({ success: false, error: 'Failed to enroll' });
  }
});

/**
 * GET /api/cold-start/founding-member/profile
 * Get founding member profile
 */
router.get('/founding-member/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await foundingMemberService.getFoundingMemberProfile(userId);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting profile:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

/**
 * POST /api/cold-start/founding-member/check-unlocks
 * Check and award unlocks
 */
router.post('/founding-member/check-unlocks', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get founding member ID
    const { data: member } = await supabase
      ?.from('founding_members')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Not a founding member'
      });
    }
    
    const result = await foundingMemberService.checkAndAwardUnlocks(member.id);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error checking unlocks:', error);
    res.status(500).json({ success: false, error: 'Failed to check unlocks' });
  }
});

/**
 * POST /api/cold-start/founding-member/record-referral
 * Record founding member referral
 */
router.post('/founding-member/record-referral', requireAuth, async (req, res) => {
  try {
    const referrerId = req.user.id;
    const { referredId, codeUsed } = req.body;
    
    if (!referredId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: referredId'
      });
    }
    
    // Get founding member ID
    const { data: member } = await supabase
      ?.from('founding_members')
      .select('id')
      .eq('user_id', referrerId)
      .single();
    
    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'Not a founding member'
      });
    }
    
    const result = await foundingMemberService.recordReferral(
      member.id,
      referredId,
      codeUsed
    );
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error recording referral:', error);
    res.status(500).json({ success: false, error: 'Failed to record referral' });
  }
});

/**
 * GET /api/cold-start/founding-member/all
 * Get all founding members (admin view)
 */
router.get('/founding-member/all', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const filters = {
      wave: req.query.wave ? parseInt(req.query.wave) : null,
      type: req.query.type,
      status: req.query.status
    };
    
    const result = await foundingMemberService.getAllFoundingMembers(filters);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting members:', error);
    res.status(500).json({ success: false, error: 'Failed to get members' });
  }
});

/**
 * GET /api/cold-start/founding-member/current-wave
 * Get current founding wave info
 */
router.get('/founding-member/current-wave', async (req, res) => {
  try {
    const currentWave = await foundingMemberService.getCurrentWave();
    const waveConfig = foundingMemberService.WAVE_CONFIG[currentWave];
    
    res.json({
      success: true,
      data: {
        currentWave,
        waveConfig,
        isOpen: !!waveConfig
      }
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error getting wave:', error);
    res.status(500).json({ success: false, error: 'Failed to get wave info' });
  }
});

// =============================================================================
// PART 5: REFERRAL INCENTIVES & CROSS-SIDE UNLOCKS
// =============================================================================

/**
 * POST /api/cold-start/referral/create-code
 * Create referral code
 */
router.post('/referral/create-code', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { codeType, options } = req.body;
    
    if (!codeType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: codeType'
      });
    }
    
    const result = await referralIncentiveService.createReferralCode(
      userId,
      codeType,
      options || {}
    );
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error creating code:', error);
    res.status(500).json({ success: false, error: 'Failed to create code' });
  }
});

/**
 * POST /api/cold-start/referral/track
 * Track referral action
 */
router.post('/referral/track', async (req, res) => {
  try {
    const { code, actionType, metadata } = req.body;
    
    if (!code || !actionType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, actionType'
      });
    }
    
    const result = await referralIncentiveService.trackReferral(
      code,
      actionType,
      metadata || {}
    );
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error tracking referral:', error);
    res.status(500).json({ success: false, error: 'Failed to track referral' });
  }
});

/**
 * GET /api/cold-start/referral/my-stats
 * Get user's referral stats
 */
router.get('/referral/my-stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await referralIncentiveService.getUserReferralStats(userId);
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

/**
 * GET /api/cold-start/platform-unlocks
 * Get platform-wide unlock status
 */
router.get('/platform-unlocks', async (req, res) => {
  try {
    const result = await referralIncentiveService.getPlatformUnlockStatus();
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error getting unlocks:', error);
    res.status(500).json({ success: false, error: 'Failed to get unlocks' });
  }
});

/**
 * POST /api/cold-start/check-cross-side-unlocks
 * Check and trigger cross-side unlocks (admin/scheduled)
 */
router.post('/check-cross-side-unlocks', requireAuth, requireRole('operator'), async (req, res) => {
  try {
    const result = await referralIncentiveService.checkCrossSideUnlocks();
    
    res.json(result);
  } catch (error) {
    console.error('[ColdStartAPI] Error checking unlocks:', error);
    res.status(500).json({ success: false, error: 'Failed to check unlocks' });
  }
});

// =============================================================================
// PART 6: PLATFORM PROGRESS & ANALYTICS
// =============================================================================

/**
 * GET /api/cold-start/platform-progress
 * Get cold start progress metrics
 */
router.get('/platform-progress', async (req, res) => {
  try {
    const { data: progress, error } = await supabase
      ?.from('cold_start_progress')
      .select('*')
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('[ColdStartAPI] Error getting progress:', error);
    res.status(500).json({ success: false, error: 'Failed to get progress' });
  }
});

module.exports = router;
