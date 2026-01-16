/**
 * Advertiser Team API Routes
 * Handles team member management, invitations, and account switching
 */

const express = require('express');
const router = express.Router();
const teamService = require('../services/advertiserTeamService');

// Middleware to get auth user (should be applied by parent router)
const getAuthUser = (req) => req.user;

// Middleware to check permission
const requireTeamPermission = (requiredRole) => async (req, res, next) => {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const accountId = req.params.accountId || req.body.advertiserAccountId || req.advertiserAccountId;
        if (!accountId) {
            return res.status(400).json({ success: false, error: 'Advertiser account ID required' });
        }

        const permission = await teamService.checkPermission(user.id, accountId, requiredRole);
        if (!permission.allowed) {
            return res.status(403).json({ success: false, error: permission.reason });
        }

        req.teamRole = permission.userRole;
        req.advertiserAccountId = accountId;
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
 * GET /api/advertisers/accounts
 * Get all advertiser accounts the current user has access to
 */
router.get('/accounts', async (req, res) => {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const accounts = await teamService.getUserAdvertiserAccounts(user.id);

        return res.json({
            success: true,
            accounts,
            count: accounts.length,
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch accounts' });
    }
});

/**
 * POST /api/advertisers/accounts
 * Create a new advertiser account
 */
router.post('/accounts', async (req, res) => {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const { name, slug, description, website_url, industry, logo_url } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Account name is required' });
        }

        const account = await teamService.createAdvertiserAccount(user.id, {
            name,
            slug,
            description,
            website_url,
            industry,
            logo_url,
        });

        return res.json({
            success: true,
            account,
            message: 'Advertiser account created successfully',
        });
    } catch (error) {
        console.error('Error creating account:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to create account' });
    }
});

// =============================================================================
// TEAM MANAGEMENT
// =============================================================================

/**
 * GET /api/advertisers/:accountId/team
 * Get all team members for an advertiser account
 */
router.get('/:accountId/team', requireTeamPermission('viewer'), async (req, res) => {
    try {
        const members = await teamService.getTeamMembers(req.advertiserAccountId);

        return res.json({
            success: true,
            members,
            count: members.length,
            currentUserRole: req.teamRole,
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch team members' });
    }
});

/**
 * POST /api/advertisers/:accountId/team/invite
 * Invite a new team member
 */
router.post('/:accountId/team/invite', requireTeamPermission('admin'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        const { email, role, message } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        if (!role || !['admin', 'manager', 'viewer'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Valid role is required (admin, manager, viewer)' });
        }

        const result = await teamService.createInvitation(
            req.advertiserAccountId,
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
        console.error('Error sending invite:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to send invitation' });
    }
});

/**
 * GET /api/advertisers/:accountId/invitations
 * Get pending invitations for an account
 */
router.get('/:accountId/invitations', requireTeamPermission('admin'), async (req, res) => {
    try {
        const invitations = await teamService.getPendingInvitations(req.advertiserAccountId);

        return res.json({
            success: true,
            invitations,
            count: invitations.length,
        });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch invitations' });
    }
});

/**
 * DELETE /api/advertisers/:accountId/invitations/:invitationId
 * Cancel/revoke an invitation
 */
router.delete('/:accountId/invitations/:invitationId', requireTeamPermission('admin'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        await teamService.revokeInvitation(req.params.invitationId, user.id);

        return res.json({
            success: true,
            message: 'Invitation cancelled',
        });
    } catch (error) {
        console.error('Error revoking invitation:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to cancel invitation' });
    }
});

/**
 * DELETE /api/advertisers/:accountId/team/:memberId
 * Remove a team member
 */
router.delete('/:accountId/team/:memberId', requireTeamPermission('admin'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        await teamService.removeTeamMember(req.params.memberId, user.id, req.advertiserAccountId);

        return res.json({
            success: true,
            message: 'Team member removed',
        });
    } catch (error) {
        console.error('Error removing member:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to remove team member' });
    }
});

/**
 * PATCH /api/advertisers/:accountId/team/:memberId/role
 * Update a team member's role
 */
router.patch('/:accountId/team/:memberId/role', requireTeamPermission('owner'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        const { role } = req.body;

        if (!role || !['admin', 'manager', 'viewer'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Valid role is required (admin, manager, viewer)' });
        }

        await teamService.updateMemberRole(req.params.memberId, role, user.id, req.advertiserAccountId);

        return res.json({
            success: true,
            message: `Role updated to ${role}`,
        });
    } catch (error) {
        console.error('Error updating role:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to update role' });
    }
});

/**
 * POST /api/advertisers/:accountId/team/transfer-ownership
 * Transfer account ownership to another team member
 */
router.post('/:accountId/team/transfer-ownership', requireTeamPermission('owner'), async (req, res) => {
    try {
        const user = getAuthUser(req);
        const { newOwnerId } = req.body;

        if (!newOwnerId) {
            return res.status(400).json({ success: false, error: 'New owner ID is required' });
        }

        await teamService.transferOwnership(newOwnerId, user.id, req.advertiserAccountId);

        return res.json({
            success: true,
            message: 'Ownership transferred successfully',
        });
    } catch (error) {
        console.error('Error transferring ownership:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to transfer ownership' });
    }
});

// =============================================================================
// INVITATION ACCEPTANCE (Public routes - authenticated but not team-scoped)
// =============================================================================

/**
 * GET /api/advertisers/invitations/:token
 * Get invitation details by token (for accept flow)
 */
router.get('/invitations/:token', async (req, res) => {
    try {
        const invitation = await teamService.getInvitationByToken(req.params.token);

        if (!invitation) {
            return res.status(404).json({ success: false, error: 'Invitation not found or expired' });
        }

        if (invitation.expired) {
            return res.status(410).json({ success: false, error: 'Invitation has expired' });
        }

        return res.json({
            success: true,
            invitation,
        });
    } catch (error) {
        console.error('Error fetching invitation:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch invitation' });
    }
});

/**
 * POST /api/advertisers/invitations/:token/accept
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
            message: `You've joined ${result.account?.name || 'the team'} as ${result.role}!`,
        });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to accept invitation' });
    }
});

module.exports = router;
