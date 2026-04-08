/**
 * Organizations API
 * Endpoints for B2B onboarding and management
 */

const express = require('express');
const router = express.Router();
const organizationService = require('../services/organizationService');
const { authenticateUser } = require('../middleware/auth');

/**
 * POST /api/organizations
 * Create a new organization (Onboarding)
 */
router.post('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const orgData = req.body;

        const result = await organizationService.createOrganization(userId, orgData);

        res.json(result);
    } catch (error) {
        console.error('[OrgAPI] Create error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/organizations
 * Get user's organizations
 */
router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const orgs = await organizationService.getUserOrganizations(userId);

        res.json({ organizations: orgs });
    } catch (error) {
        console.error('[OrgAPI] Get error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
