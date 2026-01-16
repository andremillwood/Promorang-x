/**
 * Merchant Team API Routes
 * Handles team member management, invitations, and account switching for merchants
 */

const express = require('express');
const router = express.Router();
const teamService = require('../services/merchantTeamService');

// Middleware to get auth user (should be applied by parent router)
const getAuthUser = (req) => req.user;

// Middleware to check permission
const requireTeamPermission = (requiredRole) => async (req, res, next) => {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const accountId = req.params.accountId || req.body.merchantAccountId || req.merchantAccountId;
        if (!accountId) {
            return res.status(400).json({ success: false, error: 'Merchant account ID required' });
        }

        const permission = await teamService.checkPermission(user.id, accountId, requiredRole);
        if (!permission.allowed) {
            return res.status(403).json({ success: false, error: permission.reason });
        }

        req.teamRole = permission.userRole;
        req.merchantAccountId = accountId;
        next();
    } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({ success: false, error: 'Failed to verify permissions' });
    }
};

// =============================================================================
// ACCOUNT MANAGEMENT
// =============================================================================

/**
 * GET /api/merchant-team/accounts
 * Get all merchant accounts the current user has access to
 */
router.get('/accounts', async (req, res) => {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const accounts = await teamService.getUserMerchantAccounts(user.id);

        return res.json({
            success: true,
            accounts,
            count: accounts.length,
        });
    } catch (error) {
        console.error('Error fetching merchant accounts:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch accounts' });
    }
});

/**
 * POST /api/merchant-team/accounts
 * Create a new merchant account
 */
router.post('/accounts', async (req, res) => {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const { name, slug, description, website_url, logo_url } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Account name is required' });
        }

        const account = await teamService.createMerchantAccount(user.id, {
            name,
            slug,
            description,
            website_url,
            logo_url,
        });

        return res.json({
            success: true,
            account,
            message: 'Merchant account created successfully',
        });
    } catch (error) {
        console.error('Error creating merchant account:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to create account' });
    }
});

// =============================================================================
// TEAM MANAGEMENT
// =============================================================================

/**
 * GET /api/merchant-team/:accountId/team
 * Get all team members for a merchant account
 */
router.get('/:accountId/team', requireTeamPermission('staff'), async (req, res) => {
    try {
        const members = await teamService.getTeamMembers(req.merchantAccountId);

        return res.json({
            success: true,
            members,
            count: members.length,
            currentUserRole: req.teamRole,
        });
    } catch (error) {
        console.error('Error fetching merchant team:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch team members' });
    }
});

/**
 * POST /api/merchant-team/:accountId/team/invite
 * Invite a new team member
 */
router.post('/:accountId/team/invite', requireTeamPermission('admin'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        const { email, role, message } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        if (!role || !['admin', 'manager', 'staff'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Valid role is required (admin, manager, staff)' });
        }

        const result = await teamService.createInvitation(
            req.merchantAccountId,
            email,
            role,
            user.id,
            message
        );

        return res.json({
            success: true,
            result,
            message: result.type === 'created'
                ? `Invitation sent to ${email}`
                : 'Team member reactivated',
        });
    } catch (error) {
        console.error('Error sending merchant invite:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to send invitation' });
    }
});

/**
 * GET /api/merchant-team/:accountId/invitations
 * Get pending invitations
 */
router.get('/:accountId/invitations', requireTeamPermission('admin'), async (req, res) => {
    try {
        const invitations = await teamService.getInvitations(req.merchantAccountId);
        return res.json({ success: true, invitations });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return res.status(400).json({ success: false, error: 'Failed to fetch invitations' });
    }
});

/**
 * DELETE /api/merchant-team/:accountId/invitations/:invitationId
 * Revoke an invitation
 */
router.delete('/:accountId/invitations/:invitationId', requireTeamPermission('admin'), async (req, res) => {
    try {
        await teamService.revokeInvitation(req.params.invitationId);
        return res.json({ success: true, message: 'Invitation revoked' });
    } catch (error) {
        console.error('Error revoking invitation:', error);
        return res.status(400).json({ success: false, error: 'Failed to revoke invitation' });
    }
});

/**
 * DELETE /api/merchant-team/:accountId/team/:memberId
 * Remove a team member
 */
router.delete('/:accountId/team/:memberId', requireTeamPermission('admin'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        // Additional check: Cannot remove yourself
        if (req.params.memberId === user.id) {
            // Actually, maybe you can leave? But usually leave is a different endpoint.
            // For now, allow removal. Logic in service prevents removing owner.
        }

        await teamService.removeTeamMember(req.params.memberId, user.id, req.merchantAccountId);
        return res.json({ success: true, message: 'Team member removed' });
    } catch (error) {
        console.error('Error removing team member:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to remove team member' });
    }
});

/**
 * PATCH /api/merchant-team/:accountId/team/:memberId/role
 * Update member role
 */
router.patch('/:accountId/team/:memberId/role', requireTeamPermission('admin'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, error: 'Role is required' });
        }

        await teamService.updateMemberRole(req.params.memberId, role, user.id, req.merchantAccountId);
        return res.json({ success: true, message: 'Role updated' });
    } catch (error) {
        console.error('Error updating role:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to update role' });
    }
});

/**
 * GET /api/merchant-team/invitations/:token
 * Get invitation details (Public)
 */
router.get('/invitations/:token', async (req, res) => {
    try {
        const invitation = await teamService.getInvitationByToken(req.params.token);
        return res.json({ success: true, invitation });
    } catch (error) {
        console.error('Error fetching invitation:', error);
        return res.status(404).json({ success: false, error: 'Invalid or expired invitation' });
    }
});

/**
 * POST /api/merchant-team/invitations/:token/accept
 * Accept an invitation
 */
router.post('/invitations/:token/accept', async (req, res) => {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Please log in or create an account to accept this invitation',
                requiresAuth: true,
            });
        }

        const result = await teamService.acceptInvitation(req.params.token, user.id);

        return res.json({
            success: true,
            ...result,
            message: `You've joined ${result.account?.name || 'the store'} as ${result.role}!`,
        });
    } catch (error) {
        console.error('Error accepting merchant invitation:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to accept invitation' });
    }
});

module.exports = router;
