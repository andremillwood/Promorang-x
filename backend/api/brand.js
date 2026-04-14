const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const brandCampaignService = require('../services/brandCampaignService');
const brandBudgetService = require('../services/brandBudgetService');

// Apply authentication to all routes
router.use(requireAuth);

/**
 * POST /api/brand/campaigns
 * Create a new brand campaign
 */
router.post('/campaigns', async (req, res) => {
    try {
        const { organizationId, ...campaignData } = req.body;

        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }

        // TODO: Verify user has permission to create campaigns for this organization
        // This would check organization_members table

        const campaign = await brandCampaignService.createCampaign(organizationId, campaignData);

        res.status(201).json({
            success: true,
            campaign
        });
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create campaign'
        });
    }
});

/**
 * GET /api/brand/campaigns
 * Get all campaigns for a brand organization
 */
router.get('/campaigns', async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }

        const campaigns = await brandCampaignService.getBrandCampaigns(organizationId);

        res.json({
            success: true,
            campaigns
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch campaigns'
        });
    }
});

/**
 * GET /api/brand/campaigns/:id/performance
 * Get performance metrics for a specific campaign
 */
router.get('/campaigns/:id/performance', async (req, res) => {
    try {
        const { id } = req.params;

        const performance = await brandCampaignService.getCampaignPerformance(id);

        res.json({
            success: true,
            performance
        });
    } catch (error) {
        console.error('Error fetching campaign performance:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch performance data'
        });
    }
});

/**
 * POST /api/brand/budgets
 * Create a new budget for a brand organization
 */
router.post('/budgets', async (req, res) => {
    try {
        const { organizationId, ...budgetData } = req.body;

        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }

        const budget = await brandBudgetService.createBudget(organizationId, budgetData);

        res.status(201).json({
            success: true,
            budget
        });
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create budget'
        });
    }
});

/**
 * GET /api/brand/budgets
 * Get current active budget for an organization
 */
router.get('/budgets', async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }

        const funds = await brandBudgetService.checkAvailableFunds(organizationId);

        res.json({
            success: true,
            budget: funds
        });
    } catch (error) {
        console.error('Error fetching budget:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch budget'
        });
    }
});

/**
 * GET /api/brand/budgets/:id/utilization
 * Get budget utilization metrics
 */
router.get('/budgets/:id/utilization', async (req, res) => {
    try {
        const { id } = req.params;

        const utilization = await brandBudgetService.getBudgetUtilization(id);

        res.json({
            success: true,
            utilization
        });
    } catch (error) {
        console.error('Error fetching budget utilization:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch utilization data'
        });
    }
});

/**
 * POST /api/brand/budgets/:id/increase
 * Increase total budget amount
 */
router.post('/budgets/:id/increase', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const budget = await brandBudgetService.increaseBudget(id, amount);

        res.json({
            success: true,
            budget
        });
    } catch (error) {
        console.error('Error increasing budget:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to increase budget'
        });
    }
});

/**
 * GET /api/brand/hosts/discover
 * Discover hosts based on filters
 */
router.get('/hosts/discover', async (req, res) => {
    try {
        const {
            categories,
            locations,
            minAudienceSize,
            maxCostPerMoment,
            limit
        } = req.query;

        const filters = {
            categories: categories ? categories.split(',') : [],
            locations: locations ? locations.split(',') : [],
            minAudienceSize: minAudienceSize ? parseInt(minAudienceSize) : 0,
            maxCostPerMoment: maxCostPerMoment ? parseFloat(maxCostPerMoment) : null,
            limit: limit ? parseInt(limit) : 20
        };

        const hosts = await brandCampaignService.discoverHosts(filters);

        res.json({
            success: true,
            hosts,
            count: hosts.length
        });
    } catch (error) {
        console.error('Error discovering hosts:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to discover hosts'
        });
    }
});

/**
 * POST /api/brand/hosts/sponsor
 * Sponsor a specific moment
 */
router.post('/hosts/sponsor', async (req, res) => {
    try {
        const { campaignId, momentId, amount } = req.body;

        if (!campaignId || !momentId || !amount) {
            return res.status(400).json({
                error: 'Campaign ID, Moment ID, and amount are required'
            });
        }

        const sponsorship = await brandCampaignService.sponsorMoment(
            campaignId,
            momentId,
            amount
        );

        res.status(201).json({
            success: true,
            sponsorship
        });
    } catch (error) {
        console.error('Error sponsoring moment:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to sponsor moment'
        });
    }
});

/**
 * GET /api/brand/hosts/sponsored
 * Get all sponsored moments for a campaign
 */
router.get('/hosts/sponsored', async (req, res) => {
    try {
        const { campaignId } = req.query;

        if (!campaignId) {
            return res.status(400).json({ error: 'Campaign ID is required' });
        }

        const performance = await brandCampaignService.getCampaignPerformance(campaignId);

        res.json({
            success: true,
            sponsorships: performance.sponsorships
        });
    } catch (error) {
        console.error('Error fetching sponsored moments:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch sponsored moments'
        });
    }
});

module.exports = router;
