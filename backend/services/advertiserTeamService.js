/**
 * Advertiser Team Service
 * Handles team member management, invitations, and permission checks for advertiser accounts
 */

const supabase = require('../lib/supabase');
const crypto = require('crypto');
const { sendTeamInvitationEmail, sendInvitationAcceptedEmail } = require('./resendService');

// Role hierarchy for permission checks (higher index = more permissions)
const ROLE_HIERARCHY = ['viewer', 'manager', 'admin', 'owner'];

// Mock data helpers
const isDemoMode = (userId) => String(userId).startsWith('demo-') || String(userId) === '00000000-0000-0000-0000-000000000002'; // Demo Advertiser ID

/**
 * Check if a role meets or exceeds a required role level
 */
function hasMinimumRole(userRole, requiredRole) {
    const userIndex = ROLE_HIERARCHY.indexOf(userRole);
    const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
    return userIndex >= requiredIndex;
}

/**
 * Get all advertiser accounts a user has access to
 */
async function getUserAdvertiserAccounts(userId) {
    const { data, error } = await supabase
        .from('advertiser_team_members')
        .select(`
      role,
      status,
      advertiser_accounts (
        id,
        name,
        slug,
        logo_url,
        description,
        website_url,
        industry
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'active');

    // Mock data for demo user
    if (isDemoMode(userId)) {
        // If supabase returned real data, merge it, otherwise return just mock
        const mockAccount = {
            id: 'demo-advertiser-account-id',
            name: 'Demo Account',
            slug: 'demo-account',
            logo_url: null,
            description: 'This is a demo advertiser account',
            website_url: 'https://promorang.com',
            industry: 'Technology',
            role: 'owner', // Give owner access
        };

        if (!data || data.length === 0) {
            return [mockAccount];
        } else {
            // Ensure mock account is included if not present
            const hasMock = data.some(d => d.advertiser_accounts.id === 'demo-advertiser-account-id');
            if (!hasMock) {
                return [...data.map((item) => ({ ...item.advertiser_accounts, role: item.role })), mockAccount];
            }
        }
    }

    if (error) {
        console.error('Error fetching user advertiser accounts:', error);
        throw new Error('Failed to fetch advertiser accounts');
    }

    return data.map(item => ({
        ...item.advertiser_accounts,
        role: item.role,
    }));
}

/**
 * Get a user's role for a specific advertiser account
 */
async function getUserRoleForAccount(userId, advertiserAccountId) {
    const { data, error } = await supabase
        .from('advertiser_team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('advertiser_account_id', advertiserAccountId)
        .eq('status', 'active')
        .single();

    if (error || !data) {
        return null;
    }

    return data.role;
}

/**
 * Check if a user has permission to perform an action on an advertiser account
 */
async function checkPermission(userId, advertiserAccountId, requiredRole) {
    const userRole = await getUserRoleForAccount(userId, advertiserAccountId);

    if ((advertiserAccountId === 'demo-advertiser-account-id' || advertiserAccountId === '00000000-0000-0000-0000-000000000002') && isDemoMode(userId)) {
        // Demo owner always has full permissions
        return { allowed: true, userRole: 'owner' };
    }

    if (!userRole) {
        return { allowed: false, reason: 'User is not a member of this account' };
    }

    if (!hasMinimumRole(userRole, requiredRole)) {
        return { allowed: false, reason: `Requires ${requiredRole} role or higher` };
    }

    return { allowed: true, userRole };
}

/**
 * Get all team members for an advertiser account
 */
async function getTeamMembers(advertiserAccountId) {
    const { data, error } = await supabase
        .from('advertiser_team_members')
        .select(`
      id,
      role,
      status,
      invited_at,
      accepted_at,
      last_active_at,
      users (
        id,
        email,
        username,
        display_name,
        avatar_url
      ),
      invited_by_user:users!advertiser_team_members_invited_by_fkey (
        id,
        username,
        display_name
      )
    `)
        .eq('advertiser_account_id', advertiserAccountId)
        .order('role', { ascending: false }); // owner first

    // Mock members for demo account
    if (advertiserAccountId === 'demo-advertiser-account-id' || advertiserAccountId === '00000000-0000-0000-0000-000000000002') {
        const mockMembers = [
            {
                id: 'mock-member-1',
                role: 'owner',
                status: 'active',
                invitedAt: new Date().toISOString(),
                acceptedAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
                user: {
                    id: '00000000-0000-0000-0000-000000000002',
                    email: 'advertiser@demo.com',
                    username: 'demo_advertiser',
                    display_name: 'Demo Advertiser',
                    avatar_url: null
                },
                invitedBy: null
            },
            {
                id: 'mock-member-2',
                role: 'manager',
                status: 'active',
                invitedAt: new Date().toISOString(),
                acceptedAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
                user: {
                    id: 'mock-user-2',
                    email: 'manager@demo.com',
                    username: 'demo_manager',
                    display_name: 'Sarah Manager',
                    avatar_url: null
                },
                invitedBy: { id: '00000000-0000-0000-0000-000000000002', username: 'demo_advertiser', display_name: 'Demo Advertiser' }
            }
        ];
        return mockMembers;
    }

    if (error) {
        console.error('Error fetching team members:', error);
        throw new Error('Failed to fetch team members');
    }

    return data.map(member => ({
        id: member.id,
        role: member.role,
        status: member.status,
        invitedAt: member.invited_at,
        acceptedAt: member.accepted_at,
        lastActiveAt: member.last_active_at,
        user: member.users,
        invitedBy: member.invited_by_user,
    }));
}

/**
 * Create an invitation for a new team member
 */
async function createInvitation(advertiserAccountId, email, role, invitedByUserId, message = null) {
    // Validate role
    if (!['admin', 'manager', 'viewer'].includes(role)) {
        throw new Error('Invalid role. Cannot invite as owner.');
    }

    // Check if user already exists and is a member
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        const { data: existingMember } = await supabase
            .from('advertiser_team_members')
            .select('id, status')
            .eq('advertiser_account_id', advertiserAccountId)
            .eq('user_id', existingUser.id)
            .single();

        if (existingMember) {
            if (existingMember.status === 'active') {
                throw new Error('User is already a team member');
            } else if (existingMember.status === 'revoked') {
                // Reactivate revoked member
                const { error } = await supabase
                    .from('advertiser_team_members')
                    .update({ status: 'pending', role, invited_by: invitedByUserId, invited_at: new Date().toISOString() })
                    .eq('id', existingMember.id);

                if (error) throw error;
                return { type: 'reactivated', memberId: existingMember.id };
            }
        }
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
        .from('advertiser_invitations')
        .select('id, expires_at')
        .eq('advertiser_account_id', advertiserAccountId)
        .eq('email', email)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .single();

    if (existingInvite) {
        if (new Date(existingInvite.expires_at) > new Date()) {
            throw new Error('An invitation has already been sent to this email');
        }
        // Delete expired invitation
        await supabase
            .from('advertiser_invitations')
            .delete()
            .eq('id', existingInvite.id);
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const { data: invitation, error } = await supabase
        .from('advertiser_invitations')
        .insert({
            advertiser_account_id: advertiserAccountId,
            email,
            role,
            message,
            invited_by: invitedByUserId,
            token,
            expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating invitation:', error);
        throw new Error('Failed to create invitation');
    }

    // Get account and inviter details for email
    const { data: account } = await supabase
        .from('advertiser_accounts')
        .select('name, logo_url')
        .eq('id', advertiserAccountId)
        .single();

    const { data: inviter } = await supabase
        .from('users')
        .select('display_name, email')
        .eq('id', invitedByUserId)
        .single();

    // Send invitation email
    try {
        await sendTeamInvitationEmail({
            to: email,
            accountName: account?.name || 'Unknown Brand',
            accountLogo: account?.logo_url,
            inviterName: inviter?.display_name || 'A team member',
            role,
            message,
            token,
            expiresAt,
        });
    } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the invitation creation, just log the error
    }

    return { type: 'created', invitation };
}

/**
 * Get pending invitations for an account
 */
async function getPendingInvitations(advertiserAccountId) {
    const { data, error } = await supabase
        .from('advertiser_invitations')
        .select(`
      id,
      email,
      role,
      message,
      token,
      expires_at,
      created_at,
      invited_by_user:users!advertiser_invitations_invited_by_fkey (
        id,
        username,
        display_name
      )
    `)
        .eq('advertiser_account_id', advertiserAccountId)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invitations:', error);
        throw new Error('Failed to fetch invitations');
    }

    return data.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        message: inv.message,
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
        invitedBy: inv.invited_by_user,
    }));
}

/**
 * Cancel/revoke an invitation
 */
async function revokeInvitation(invitationId, revokedByUserId) {
    const { error } = await supabase
        .from('advertiser_invitations')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', invitationId);

    if (error) {
        console.error('Error revoking invitation:', error);
        throw new Error('Failed to revoke invitation');
    }

    return { success: true };
}

/**
 * Accept an invitation
 */
async function acceptInvitation(token, userId) {
    // Get invitation
    const { data: invitation, error: invError } = await supabase
        .from('advertiser_invitations')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .single();

    if (invError || !invitation) {
        throw new Error('Invalid or expired invitation');
    }

    if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
    }

    // Get user email to verify match
    const { data: user } = await supabase
        .from('users')
        .select('email, display_name')
        .eq('id', userId)
        .single();

    // Note: We allow any authenticated user to accept - they don't need to match the email
    // This supports cases where a user registers with a different email

    // Check if already a member
    const { data: existingMember } = await supabase
        .from('advertiser_team_members')
        .select('id')
        .eq('advertiser_account_id', invitation.advertiser_account_id)
        .eq('user_id', userId)
        .single();

    if (existingMember) {
        throw new Error('You are already a member of this account');
    }

    // Create team membership
    const { error: memberError } = await supabase
        .from('advertiser_team_members')
        .insert({
            advertiser_account_id: invitation.advertiser_account_id,
            user_id: userId,
            role: invitation.role,
            invited_by: invitation.invited_by,
            invited_at: invitation.created_at,
            accepted_at: new Date().toISOString(),
            status: 'active',
        });

    if (memberError) {
        console.error('Error creating team member:', memberError);
        throw new Error('Failed to join team');
    }

    // Mark invitation as accepted
    await supabase
        .from('advertiser_invitations')
        .update({
            accepted_at: new Date().toISOString(),
            accepted_by: userId,
        })
        .eq('id', invitation.id);

    // Get account details
    const { data: account } = await supabase
        .from('advertiser_accounts')
        .select('id, name')
        .eq('id', invitation.advertiser_account_id)
        .single();

    // Notify inviter
    try {
        const { data: inviter } = await supabase
            .from('users')
            .select('email, display_name')
            .eq('id', invitation.invited_by)
            .single();

        if (inviter?.email) {
            await sendInvitationAcceptedEmail({
                to: inviter.email,
                newMemberName: user?.display_name || 'A new member',
                accountName: account?.name || 'your account',
            });
        }
    } catch (emailError) {
        console.error('Failed to send acceptance notification:', emailError);
    }

    return {
        success: true,
        account: { id: account?.id, name: account?.name },
        role: invitation.role,
    };
}

/**
 * Remove a team member
 */
async function removeTeamMember(memberId, removedByUserId, advertiserAccountId) {
    // Get member details
    const { data: member, error: memberError } = await supabase
        .from('advertiser_team_members')
        .select('user_id, role')
        .eq('id', memberId)
        .eq('advertiser_account_id', advertiserAccountId)
        .single();

    if (memberError || !member) {
        throw new Error('Team member not found');
    }

    // Can't remove the owner
    if (member.role === 'owner') {
        throw new Error('Cannot remove the account owner');
    }

    // Get remover's role
    const removerRole = await getUserRoleForAccount(removedByUserId, advertiserAccountId);

    // Admins can only remove managers and viewers
    if (removerRole === 'admin' && member.role === 'admin') {
        throw new Error('Admins cannot remove other admins');
    }

    // Revoke membership
    const { error } = await supabase
        .from('advertiser_team_members')
        .update({ status: 'revoked' })
        .eq('id', memberId);

    if (error) {
        console.error('Error removing team member:', error);
        throw new Error('Failed to remove team member');
    }

    return { success: true };
}

/**
 * Update a team member's role
 */
async function updateMemberRole(memberId, newRole, updatedByUserId, advertiserAccountId) {
    // Validate new role
    if (!['admin', 'manager', 'viewer'].includes(newRole)) {
        throw new Error('Invalid role');
    }

    // Get member details
    const { data: member, error: memberError } = await supabase
        .from('advertiser_team_members')
        .select('user_id, role')
        .eq('id', memberId)
        .eq('advertiser_account_id', advertiserAccountId)
        .single();

    if (memberError || !member) {
        throw new Error('Team member not found');
    }

    // Can't change owner's role
    if (member.role === 'owner') {
        throw new Error('Cannot change owner role');
    }

    // Only owner can change roles
    const updaterRole = await getUserRoleForAccount(updatedByUserId, advertiserAccountId);
    if (updaterRole !== 'owner') {
        throw new Error('Only the owner can change member roles');
    }

    const { error } = await supabase
        .from('advertiser_team_members')
        .update({ role: newRole })
        .eq('id', memberId);

    if (error) {
        console.error('Error updating member role:', error);
        throw new Error('Failed to update role');
    }

    return { success: true, newRole };
}

/**
 * Transfer ownership to another team member
 */
async function transferOwnership(newOwnerId, currentOwnerId, advertiserAccountId) {
    // Verify current user is owner
    const currentRole = await getUserRoleForAccount(currentOwnerId, advertiserAccountId);
    if (currentRole !== 'owner') {
        throw new Error('Only the current owner can transfer ownership');
    }

    // Verify new owner is an existing team member
    const { data: newOwnerMembership } = await supabase
        .from('advertiser_team_members')
        .select('id, role')
        .eq('advertiser_account_id', advertiserAccountId)
        .eq('user_id', newOwnerId)
        .eq('status', 'active')
        .single();

    if (!newOwnerMembership) {
        throw new Error('New owner must be an existing active team member');
    }

    // Transfer ownership in a transaction-like manner
    // 1. Demote current owner to admin
    const { error: demoteError } = await supabase
        .from('advertiser_team_members')
        .update({ role: 'admin' })
        .eq('advertiser_account_id', advertiserAccountId)
        .eq('user_id', currentOwnerId);

    if (demoteError) {
        throw new Error('Failed to transfer ownership');
    }

    // 2. Promote new owner
    const { error: promoteError } = await supabase
        .from('advertiser_team_members')
        .update({ role: 'owner' })
        .eq('id', newOwnerMembership.id);

    if (promoteError) {
        // Rollback - restore current owner
        await supabase
            .from('advertiser_team_members')
            .update({ role: 'owner' })
            .eq('advertiser_account_id', advertiserAccountId)
            .eq('user_id', currentOwnerId);

        throw new Error('Failed to transfer ownership');
    }

    return { success: true, newOwnerId };
}

/**
 * Create a new advertiser account
 */
async function createAdvertiserAccount(userId, accountData) {
    const { name, slug, description, website_url, industry, logo_url } = accountData;

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Create account
    const { data: account, error: accountError } = await supabase
        .from('advertiser_accounts')
        .insert({
            name,
            slug: finalSlug,
            description,
            website_url,
            industry,
            logo_url,
            created_by: userId,
        })
        .select()
        .single();

    if (accountError) {
        console.error('Error creating advertiser account:', accountError);
        if (accountError.code === '23505') {
            throw new Error('An account with this name already exists');
        }
        throw new Error('Failed to create account');
    }

    // Create owner membership
    const { error: memberError } = await supabase
        .from('advertiser_team_members')
        .insert({
            advertiser_account_id: account.id,
            user_id: userId,
            role: 'owner',
            status: 'active',
            accepted_at: new Date().toISOString(),
        });

    if (memberError) {
        // Rollback account creation
        await supabase.from('advertiser_accounts').delete().eq('id', account.id);
        throw new Error('Failed to create account');
    }

    return account;
}

/**
 * Get invitation details by token (for accept flow)
 */
async function getInvitationByToken(token) {
    const { data, error } = await supabase
        .from('advertiser_invitations')
        .select(`
      id,
      email,
      role,
      message,
      expires_at,
      advertiser_accounts (
        id,
        name,
        logo_url
      ),
      invited_by_user:users!advertiser_invitations_invited_by_fkey (
        display_name
      )
    `)
        .eq('token', token)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .single();

    if (error || !data) {
        return null;
    }

    if (new Date(data.expires_at) < new Date()) {
        return { expired: true };
    }

    return {
        id: data.id,
        email: data.email,
        role: data.role,
        message: data.message,
        expiresAt: data.expires_at,
        account: data.advertiser_accounts,
        invitedBy: data.invited_by_user?.display_name,
    };
}

module.exports = {
    ROLE_HIERARCHY,
    hasMinimumRole,
    getUserAdvertiserAccounts,
    getUserRoleForAccount,
    checkPermission,
    getTeamMembers,
    createInvitation,
    getPendingInvitations,
    revokeInvitation,
    acceptInvitation,
    removeTeamMember,
    updateMemberRole,
    transferOwnership,
    createAdvertiserAccount,
    getInvitationByToken,
};
