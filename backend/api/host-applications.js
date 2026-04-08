/**
 * Host Applications API
 * Endpoints for managing host role applications
 */

const express = require('express');
const router = express.Router();
const hostApplicationService = require('../services/hostApplicationService');
const roleService = require('../services/roleService');
const { authenticateUser } = require('../middleware/auth');

/**
 * POST /api/host-applications
 * Submit a host application
 */
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { motivation, moment_idea } = req.body;
        const userId = req.user.id;

        if (!motivation || !moment_idea) {
            return res.status(400).json({
                error: 'Motivation and moment idea are required'
            });
        }

        const application = await hostApplicationService.submitApplication(
            userId,
            motivation,
            moment_idea
        );

        res.json({
            success: true,
            application,
            message: 'Application submitted! We\'ll review it within 24 hours.'
        });
    } catch (error) {
        console.error('[HostApplicationsAPI] Submit error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/host-applications/me
 * Get current user's application status
 */
router.get('/me', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const application = await hostApplicationService.getUserApplication(userId);

        res.json({ application });
    } catch (error) {
        console.error('[HostApplicationsAPI] Get user application error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/host-applications
 * Get all pending applications (admin only)
 */
router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user is admin
        const isAdmin = await roleService.userHasRole(userId, 'admin') ||
            await roleService.userHasRole(userId, 'master_admin');

        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const applications = await hostApplicationService.getPendingApplications();
        res.json({ applications });
    } catch (error) {
        console.error('[HostApplicationsAPI] Get applications error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/host-applications/:id/approve
 * Approve a host application (admin only)
 */
router.patch('/:id/approve', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const applicationId = req.params.id;

        // Check if user is admin
        const isAdmin = await roleService.userHasRole(userId, 'admin') ||
            await roleService.userHasRole(userId, 'master_admin');

        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        await hostApplicationService.approveApplication(applicationId, userId);

        res.json({
            success: true,
            message: 'Application approved and host role granted'
        });
    } catch (error) {
        console.error('[HostApplicationsAPI] Approve error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * PATCH /api/host-applications/:id/reject
 * Reject a host application (admin only)
 */
router.patch('/:id/reject', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const applicationId = req.params.id;
        const { reason } = req.body;

        // Check if user is admin
        const isAdmin = await roleService.userHasRole(userId, 'admin') ||
            await roleService.userHasRole(userId, 'master_admin');

        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        await hostApplicationService.rejectApplication(applicationId, userId, reason);

        res.json({
            success: true,
            message: 'Application rejected'
        });
    } catch (error) {
        console.error('[HostApplicationsAPI] Reject error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
