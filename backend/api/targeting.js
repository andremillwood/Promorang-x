/**
 * TARGETING API
 * 
 * Exposes demographic targeting, brand matching, and personalization services
 */

const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Import services
let demographicTargetingService;
let brandPartnershipService;
let personalizedQuestService;
let smartNotificationService;
let contentPromptService;
let dynamicPricingService;

try {
    demographicTargetingService = require('../services/demographicTargetingService');
} catch (e) {
    console.warn('[Targeting API] Demographic targeting service not available');
}

try {
    brandPartnershipService = require('../services/brandPartnershipService');
} catch (e) {
    console.warn('[Targeting API] Brand partnership service not available');
}

try {
    personalizedQuestService = require('../services/personalizedQuestService');
} catch (e) {
    console.warn('[Targeting API] Personalized quest service not available');
}

try {
    smartNotificationService = require('../services/smartNotificationService');
} catch (e) {
    console.warn('[Targeting API] Smart notification service not available');
}

try {
    contentPromptService = require('../services/contentPromptService');
} catch (e) {
    console.warn('[Targeting API] Content prompt service not available');
}

try {
    dynamicPricingService = require('../services/dynamicPricingService');
} catch (e) {
    console.warn('[Targeting API] Dynamic pricing service not available');
}

// ============================================
// DEMOGRAPHIC TARGETING ENDPOINTS
// ============================================

/**
 * GET /api/targeting/criteria
 * Get all available targeting criteria for advertisers
 */
router.get('/targeting/criteria', requireAuth, (req, res) => {
    if (!demographicTargetingService) {
        return res.status(503).json({ error: 'Targeting service unavailable' });
    }
    
    const criteria = demographicTargetingService.getTargetingCriteria();
    res.json({
        status: 'success',
        data: { criteria }
    });
});

/**
 * POST /api/targeting/audience-size
 * Calculate audience size based on targeting filters
 */
router.post('/targeting/audience-size', requireAuth, async (req, res) => {
    if (!demographicTargetingService) {
        return res.status(503).json({ error: 'Targeting service unavailable' });
    }
    
    try {
        const filters = req.body.filters || {};
        const result = await demographicTargetingService.calculateAudienceSize(filters);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error calculating audience size:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/targeting/validate
 * Validate targeting filters
 */
router.post('/targeting/validate', requireAuth, (req, res) => {
    if (!demographicTargetingService) {
        return res.status(503).json({ error: 'Targeting service unavailable' });
    }
    
    const filters = req.body.filters || {};
    const validation = demographicTargetingService.validateTargetingFilters(filters);
    
    res.json({
        status: 'success',
        data: validation
    });
});

/**
 * GET /api/campaigns/:id/targeting-score
 * Get targeting effectiveness score for a campaign
 */
router.get('/campaigns/:id/targeting-score', requireAuth, async (req, res) => {
    if (!demographicTargetingService) {
        return res.status(503).json({ error: 'Targeting service unavailable' });
    }
    
    try {
        const { id } = req.params;
        const result = await demographicTargetingService.calculateTargetingScore(id);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error calculating targeting score:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/targeting/recommendations
 * Get targeting recommendations for a brand/campaign
 */
router.post('/targeting/recommendations', requireAuth, async (req, res) => {
    if (!demographicTargetingService) {
        return res.status(503).json({ error: 'Targeting service unavailable' });
    }
    
    try {
        const brandInfo = req.body;
        const recommendations = await demographicTargetingService.generateTargetingRecommendations(brandInfo);
        
        res.json({
            status: 'success',
            data: { recommendations }
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// BRAND PARTNERSHIP MATCHING ENDPOINTS
// ============================================

/**
 * GET /api/brand-matches
 * Get matching brands/campaigns for current user
 */
router.get('/brand-matches', requireAuth, async (req, res) => {
    if (!brandPartnershipService) {
        return res.status(503).json({ error: 'Brand matching service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const {
            minScore = 60,
            limit = 20,
            offset = 0,
            verticals = []
        } = req.query;
        
        const result = await brandPartnershipService.findMatchingBrands(userId, {
            minScore: parseInt(minScore),
            limit: parseInt(limit),
            offset: parseInt(offset),
            verticals: verticals.length > 0 ? verticals.split(',') : []
        });
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error finding brand matches:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/brand-matches/:campaignId/compatibility
 * Get detailed compatibility score with a specific campaign
 */
router.get('/brand-matches/:campaignId/compatibility', requireAuth, async (req, res) => {
    if (!brandPartnershipService) {
        return res.status(503).json({ error: 'Brand matching service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { campaignId } = req.params;
        const detailed = req.query.detailed === 'true';
        
        const result = await brandPartnershipService.calculateCompatibilityScore(
            userId,
            campaignId,
            { isCampaign: true, detailed }
        );
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error calculating compatibility:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/campaigns/:id/find-creators
 * Find matching creators for a campaign (advertiser endpoint)
 */
router.post('/campaigns/:id/find-creators', requireAuth, async (req, res) => {
    if (!brandPartnershipService) {
        return res.status(503).json({ error: 'Brand matching service unavailable' });
    }
    
    try {
        const { id } = req.params;
        const {
            minScore = 60,
            limit = 20,
            offset = 0
        } = req.body;
        
        const result = await brandPartnershipService.findMatchingCreators(id, {
            isCampaign: true,
            minScore,
            limit,
            offset
        });
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error finding matching creators:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/brand-matches/:campaignId/interaction
 * Record a brand match interaction
 */
router.post('/brand-matches/:campaignId/interaction', requireAuth, async (req, res) => {
    if (!brandPartnershipService) {
        return res.status(503).json({ error: 'Brand matching service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { campaignId } = req.params;
        const { interactionType } = req.body;
        
        await brandPartnershipService.recordMatchInteraction(userId, campaignId, interactionType);
        
        res.json({
            status: 'success',
            message: 'Interaction recorded'
        });
    } catch (error) {
        console.error('Error recording interaction:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PERSONALIZED QUEST ENDPOINTS
// ============================================

/**
 * GET /api/quests/personalized
 * Get personalized quests for current user
 */
router.get('/quests/personalized', requireAuth, async (req, res) => {
    if (!personalizedQuestService) {
        return res.status(503).json({ error: 'Quest service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const {
            type = 'daily',
            count = 3,
            includeSeasonal = true,
            includeLifeEvents = true
        } = req.query;
        
        const result = await personalizedQuestService.generateQuests(userId, {
            questType: type,
            count: parseInt(count),
            includeSeasonal: includeSeasonal !== 'false',
            includeLifeEvents: includeLifeEvents !== 'false'
        });
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error generating personalized quests:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/quests/active
 * Get user's active quests
 */
router.get('/quests/active', requireAuth, async (req, res) => {
    if (!personalizedQuestService) {
        return res.status(503).json({ error: 'Quest service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const result = await personalizedQuestService.getActiveQuests(userId);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error getting active quests:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/quests/start
 * Start a quest
 */
router.post('/quests/start', requireAuth, async (req, res) => {
    if (!personalizedQuestService) {
        return res.status(503).json({ error: 'Quest service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { questId, questData } = req.body;
        
        const result = await personalizedQuestService.startQuest(userId, questId, questData);
        
        res.json({
            status: result.success ? 'success' : 'error',
            data: result
        });
    } catch (error) {
        console.error('Error starting quest:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/quests/:questId/complete
 * Complete a quest
 */
router.post('/quests/:questId/complete', requireAuth, async (req, res) => {
    if (!personalizedQuestService) {
        return res.status(503).json({ error: 'Quest service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { questId } = req.params;
        const { proof } = req.body;
        
        const result = await personalizedQuestService.completeQuest(userId, questId, proof);
        
        res.json({
            status: result.success ? 'success' : 'error',
            data: result
        });
    } catch (error) {
        console.error('Error completing quest:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SMART NOTIFICATION ENDPOINTS
// ============================================

/**
 * GET /api/notifications/optimal-time
 * Get optimal notification time for user
 */
router.get('/notifications/optimal-time', requireAuth, async (req, res) => {
    if (!smartNotificationService) {
        return res.status(503).json({ error: 'Notification service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { type = 'general' } = req.query;
        
        const result = await smartNotificationService.getOptimalNotificationTime(userId, type);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error getting optimal time:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/notifications/schedule
 * Get user's notification schedule
 */
router.get('/notifications/schedule', requireAuth, async (req, res) => {
    if (!smartNotificationService) {
        return res.status(503).json({ error: 'Notification service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const result = await smartNotificationService.getUserNotificationSchedule(userId);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error getting schedule:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/notifications/check-time
 * Check if a proposed time is good
 */
router.post('/notifications/check-time', requireAuth, async (req, res) => {
    if (!smartNotificationService) {
        return res.status(503).json({ error: 'Notification service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { proposedTime } = req.body;
        
        const result = await smartNotificationService.isGoodTimeForUser(userId, proposedTime);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error checking time:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/notifications/record-engagement
 * Record notification engagement
 */
router.post('/notifications/record-engagement', requireAuth, async (req, res) => {
    if (!smartNotificationService) {
        return res.status(503).json({ error: 'Notification service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { notificationId, action, timestamp } = req.body;
        
        await smartNotificationService.recordEngagement(userId, notificationId, action, timestamp);
        
        res.json({
            status: 'success',
            message: 'Engagement recorded'
        });
    } catch (error) {
        console.error('Error recording engagement:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CONTENT PROMPTS ENDPOINTS
// ============================================

/**
 * GET /api/content-prompts
 * Get personalized content prompts for user
 */
router.get('/content-prompts', requireAuth, async (req, res) => {
    if (!contentPromptService) {
        return res.status(503).json({ error: 'Content prompt service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const {
            count = 3,
            includeTrends = true,
            niche = null
        } = req.query;
        
        const result = await contentPromptService.generatePrompts(userId, {
            count: parseInt(count),
            includeTrends: includeTrends !== 'false',
            contentNiche: niche
        });
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error generating content prompts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/content-prompts/trending-themes
 * Get trending content themes
 */
router.get('/content-prompts/trending-themes', requireAuth, async (req, res) => {
    if (!contentPromptService) {
        return res.status(503).json({ error: 'Content prompt service unavailable' });
    }
    
    try {
        const themes = await contentPromptService.getTrendingThemes();
        
        res.json({
            status: 'success',
            data: { themes }
        });
    } catch (error) {
        console.error('Error getting trending themes:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/content-prompts/:promptId/engagement
 * Record content prompt engagement
 */
router.post('/content-prompts/:promptId/engagement', requireAuth, async (req, res) => {
    if (!contentPromptService) {
        return res.status(503).json({ error: 'Content prompt service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { promptId } = req.params;
        const { action } = req.body;
        
        await contentPromptService.recordPromptEngagement(userId, promptId, action);
        
        res.json({
            status: 'success',
            message: 'Engagement recorded'
        });
    } catch (error) {
        console.error('Error recording engagement:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// DYNAMIC PRICING ENDPOINTS
// ============================================

/**
 * POST /api/pricing/calculate
 * Calculate personalized price for a user
 */
router.post('/pricing/calculate', requireAuth, async (req, res) => {
    if (!dynamicPricingService) {
        return res.status(503).json({ error: 'Pricing service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { basePrice, productType = 'campaign_entry' } = req.body;
        
        if (!basePrice || basePrice <= 0) {
            return res.status(400).json({ error: 'Invalid base price' });
        }
        
        const result = await dynamicPricingService.calculatePersonalizedPrice(
            userId,
            basePrice,
            productType
        );
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pricing/promotions
 * Get available promotions for current user
 */
router.get('/pricing/promotions', requireAuth, async (req, res) => {
    if (!dynamicPricingService) {
        return res.status(503).json({ error: 'Pricing service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const result = await dynamicPricingService.getAvailablePromotions(userId);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error getting promotions:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/pricing/apply-code
 * Apply promotion code
 */
router.post('/pricing/apply-code', requireAuth, async (req, res) => {
    if (!dynamicPricingService) {
        return res.status(503).json({ error: 'Pricing service unavailable' });
    }
    
    try {
        const userId = req.user.id;
        const { code, basePrice } = req.body;
        
        if (!code || !basePrice) {
            return res.status(400).json({ error: 'Code and basePrice required' });
        }
        
        const result = await dynamicPricingService.applyPromotionCode(userId, code, basePrice);
        
        res.json({
            status: result.success ? 'success' : 'error',
            data: result
        });
    } catch (error) {
        console.error('Error applying code:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
