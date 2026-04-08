/**
 * Roles API
 * Endpoints for role management and checking
 */

const express = require('express');
const router = express.Router();
const roleService = require('../services/roleService');
const { authenticateUser } = require('../middleware/auth');

/**
 * GET /api/roles/me
 * Get current user's roles
 */
router.get('/me', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const roles = await roleService.getUserRoles(userId);

        res.json({ roles });
    } catch (error) {
        console.error('[RolesAPI] Get user roles error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/roles/check/:role
 * Check if current user has a specific role
 */
router.get('/check/:role', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.params.role;

        const hasRole = await roleService.userHasRole(userId, role);

        res.json({ hasRole });
    } catch (error) {
        console.error('[RolesAPI] Check role error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/roles/requirements/:role
 * Get requirements for a specific role
 */
router.get('/requirements/:role', async (req, res) => {
    try {
        const role = req.params.role;
        const requirements = roleService.getRoleRequirements(role);

        if (!requirements) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.json(requirements);
    } catch (error) {
        console.error('[RolesAPI] Get requirements error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/roles/check-unlock
 * Check if user should auto-unlock Host role
 */
router.post('/check-unlock', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await roleService.checkHostUnlock(userId);

        res.json(result);
    } catch (error) {
        console.error('[RolesAPI] Check unlock error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/roles/grant
 * Grant a role to a user (master admin only)
 */
router.post('/grant', authenticateUser, async (req, res) => {
    try {
        const granterId = req.user.id;
        const { user_id, role } = req.body;

        // Check if granter is master admin
        const isMasterAdmin = await roleService.userHasRole(granterId, 'master_admin');

        if (!isMasterAdmin) {
            return res.status(403).json({ error: 'Master admin access required' });
        }

        if (!user_id || !role) {
            return res.status(400).json({ error: 'user_id and role are required' });
        }

        await roleService.grantRole(user_id, role, granterId);

        res.json({
            success: true,
            message: `${role} role granted to user`
        });
    } catch (error) {
        console.error('[RolesAPI] Grant role error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/roles/revoke
 * Revoke a role from a user (master admin only)
 */
router.post('/revoke', authenticateUser, async (req, res) => {
    try {
        const revokerId = req.user.id;
        const { user_id, role, reason } = req.body;

        // Check if revoker is master admin
        const isMasterAdmin = await roleService.userHasRole(revokerId, 'master_admin');

        if (!isMasterAdmin) {
            return res.status(403).json({ error: 'Master admin access required' });
        }

        if (!user_id || !role) {
            return res.status(400).json({ error: 'user_id and role are required' });
        }

        await roleService.revokeRole(user_id, role, reason);

        res.json({
            success: true,
            message: `${role} role revoked from user`
        });
    } catch (error) {
        console.error('[RolesAPI] Revoke role error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
