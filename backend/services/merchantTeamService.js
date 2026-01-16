/**
 * Merchant Team Service
 * Handles team member management, invitations, and permission checks for merchant accounts
 */

const supabase = require('../lib/supabase');
const crypto = require('crypto');
const { sendTeamInvitationEmail, sendInvitationAcceptedEmail } = require('./resendService');

// Role hierarchy for permission checks
const ROLE_HIERARCHY = ['staff', 'manager', 'admin', 'owner'];

/**
 * Check if a role meets or exceeds a required role level
 */
function hasMinimumRole(userRole, requiredRole) {
    const userIndex = ROLE_HIERARCHY.indexOf(userRole);
    const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
    return userIndex >= requiredIndex;
}

/**
 * Get all merchant accounts a user has access to
 */
async function getUserMerchantAccounts(userId) {
    const { data, error } = await supabase
        .from('merchant_team_members')
        .select(`
      role,
      status,
      merchant_accounts (
        id,
        name,
        slug,
        logo_url,
        description,
        website_url,
        contact_email
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching user merchant accounts:', error);
        throw new Error('Failed to fetch merchant accounts');
    }

    return data.map(item => ({
        ...item.merchant_accounts,
        role: item.role,
    }));
}

/**
 * Get a user's role for a specific merchant account
 */
async function getUserRoleForAccount(userId, merchantAccountId) {
    const { data, error } = await supabase
        .from('merchant_team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('merchant_account_id', merchantAccountId)
        .eq('status', 'active')
        .single();

    if (error || !data) {
        return null;
    }

    return data.role;
}

/**
 * Check if a user has permission to perform an action on a merchant account
 */
async function checkPermission(userId, merchantAccountId, requiredRole) {
    const userRole = await getUserRoleForAccount(userId, merchantAccountId);

    if (!userRole) {
        return { allowed: false, reason: 'User is not a member of this account' };
    }

    if (!hasMinimumRole(userRole, requiredRole)) {
        return { allowed: false, reason: `Requires ${requiredRole} role or higher` };
    }

    return { allowed: true, userRole };
}

/**
 * Get all team members for a merchant account
 */
async function getTeamMembers(merchantAccountId) {
    const { data, error } = await supabase
        .from('merchant_team_members')
        .select(`
      id,
      role,
      status,
      invited_at,
      accepted_at,
      users (
        id,
        email,
        username,
        display_name,
        avatar_url
      ),
      invited_by_user:users!merchant_team_members_invited_by_fkey (
        id,
        username,
        display_name
      )
    `)
        .eq('merchant_account_id', merchantAccountId)
        .order('role', { ascending: false })
        .order('accepted_at', { ascending: true });

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
        user: member.users,
        invitedBy: member.invited_by_user,
    }));
}

/**
 * Create an invitation for a new team member
 */
async function createInvitation(merchantAccountId, email, role, invitedByUserId, message = null) {
    // Validate role
    if (!['admin', 'manager', 'staff'].includes(role)) {
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
            .from('merchant_team_members')
            .select('id, status')
            .eq('merchant_account_id', merchantAccountId)
            .eq('user_id', existingUser.id)
            .single();

        if (existingMember) {
            if (existingMember.status === 'active') {
                throw new Error('User is already a team member');
            } else if (existingMember.status === 'revoked') {
                // Reactivate revoked member
                const { error } = await supabase
                    .from('merchant_team_members')
                    .update({ status: 'pending', role, invited_by: invitedByUserId, invited_at: new Date().toISOString() })
                    .eq('id', existingMember.id);

                if (error) throw error;
                return { type: 'reactivated', memberId: existingMember.id };
            }
        }
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
        .from('merchant_invitations')
        .select('id, expires_at')
        .eq('merchant_account_id', merchantAccountId)
        .eq('email', email)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .single();

    if (existingInvite) {
        if (new Date(existingInvite.expires_at) > new Date()) {
            throw new Error('An invitation has already been sent to this email');
        }
        await supabase
            .from('merchant_invitations')
            .delete()
            .eq('id', existingInvite.id);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { data: invitation, error } = await supabase
        .from('merchant_invitations')
        .insert({
            merchant_account_id: merchantAccountId,
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
        throw new Error('Failed to create invitation');
    }

    const { data: account } = await supabase
        .from('merchant_accounts')
        .select('name, logo_url')
        .eq('id', merchantAccountId)
        .single();

    const { data: inviter } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', invitedByUserId)
        .single();

    try {
        await sendTeamInvitationEmail({
            to: email,
            accountName: account?.name || 'Unknown Store',
            accountLogo: account?.logo_url,
            inviterName: inviter?.display_name || 'A team member',
            role,
            message,
            token,
            expiresAt,
        });
    } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
    }

    return { type: 'created', invitation };
}

/**
 * Get pending invitations for a merchant account
 */
async function getInvitations(merchantAccountId) {
    const { data, error } = await supabase
        .from('merchant_invitations')
        .select(`
            *,
            invited_by_user:users!merchant_invitations_invited_by_fkey (
                id,
                display_name,
                email
            )
        `)
        .eq('merchant_account_id', merchantAccountId)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invitations:', error);
        throw new Error('Failed to fetch invitations');
    }

    return data.map(invite => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        invitedBy: invite.invited_by_user?.display_name || 'Unknown',
        invitedAt: invite.created_at,
        expiresAt: invite.expires_at,
        status: 'pending' // Since we filtered for pending
    }));
}

/**
 * Revoke an invitation
 */
async function revokeInvitation(invitationId) {
    const { error } = await supabase
        .from('merchant_invitations')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', invitationId);

    if (error) {
        throw new Error('Failed to revoke invitation');
    }

    return { success: true };
}

/**
 * Accept an invitation
 */
async function acceptInvitation(token, userId) {
    const { data: invitation, error: invError } = await supabase
        .from('merchant_invitations')
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

    const { data: user } = await supabase
        .from('users')
        .select('email, display_name')
        .eq('id', userId)
        .single();

    const { data: existingMember } = await supabase
        .from('merchant_team_members')
        .select('id')
        .eq('merchant_account_id', invitation.merchant_account_id)
        .eq('user_id', userId)
        .single();

    if (existingMember) {
        throw new Error('You are already a member of this account');
    }

    const { error: memberError } = await supabase
        .from('merchant_team_members')
        .insert({
            merchant_account_id: invitation.merchant_account_id,
            user_id: userId,
            role: invitation.role,
            invited_by: invitation.invited_by,
            invited_at: invitation.created_at,
            accepted_at: new Date().toISOString(),
            status: 'active',
        });

    if (memberError) {
        throw new Error('Failed to join team');
    }

    await supabase
        .from('merchant_invitations')
        .update({
            accepted_at: new Date().toISOString(),
            accepted_by: userId,
        })
        .eq('id', invitation.id);

    const { data: account } = await supabase
        .from('merchant_accounts')
        .select('id, name')
        .eq('id', invitation.merchant_account_id)
        .single();

    try {
        const { data: inviter } = await supabase
            .from('users')
            .select('email')
            .eq('id', invitation.invited_by)
            .single();

        if (inviter?.email) {
            await sendInvitationAcceptedEmail({
                to: inviter.email,
                newMemberName: user?.display_name || 'A new member',
                accountName: account?.name || 'your store',
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
async function removeTeamMember(memberId, removedByUserId, merchantAccountId) {
    const { data: member, error: memberError } = await supabase
        .from('merchant_team_members')
        .select('user_id, role')
        .eq('id', memberId)
        .eq('merchant_account_id', merchantAccountId)
        .single();

    if (memberError || !member) {
        throw new Error('Team member not found');
    }

    if (member.role === 'owner') {
        throw new Error('Cannot remove the account owner');
    }

    const { error } = await supabase
        .from('merchant_team_members')
        .update({ status: 'revoked' })
        .eq('id', memberId);

    if (error) {
        throw new Error('Failed to remove team member');
    }

    return { success: true };
}

/**
 * Update a team member's role
 */
async function updateMemberRole(memberId, newRole, updatedByUserId, merchantAccountId) {
    // Basic validation
    if (!['admin', 'manager', 'staff'].includes(newRole)) {
        throw new Error('Invalid role');
    }

    const { data: member, error: memberError } = await supabase
        .from('merchant_team_members')
        .select('user_id, role')
        .eq('id', memberId)
        .eq('merchant_account_id', merchantAccountId)
        .single();

    if (memberError || !member) {
        throw new Error('Team member not found');
    }

    if (member.role === 'owner') {
        throw new Error('Cannot change role of the owner');
    }

    const { error } = await supabase
        .from('merchant_team_members')
        .update({ role: newRole })
        .eq('id', memberId);

    if (error) {
        throw new Error('Failed to update member role');
    }

    return { success: true, newRole };
}

/**
 * Get invitation details by token (public)
 */
async function getInvitationByToken(token) {
    const { data: invitation, error } = await supabase
        .from('merchant_invitations')
        .select(`
            id,
            email,
            role,
            created_at,
            expires_at,
            merchant_accounts (
                id,
                name,
                logo_url
            ),
            invited_by_user:users!merchant_invitations_invited_by_fkey (
                display_name
            )
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !invitation) {
        throw new Error('Invalid or expired invitation');
    }

    return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        account: invitation.merchant_accounts,
        invitedBy: invitation.invited_by_user?.display_name || 'A team member',
        expiresAt: invitation.expires_at
    };
}

/**
 * Create a new merchant account
 */
async function createMerchantAccount(userId, accountData) {
    const { name, slug, description, logo_url } = accountData;
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data: account, error: accountError } = await supabase
        .from('merchant_accounts')
        .insert({
            name,
            slug: finalSlug,
            description,
            logo_url,
            owner_id: userId,
        })
        .select()
        .single();

    if (accountError) {
        throw new Error('Failed to create account');
    }

    await supabase
        .from('merchant_team_members')
        .insert({
            merchant_account_id: account.id,
            user_id: userId,
            role: 'owner',
            status: 'active',
            accepted_at: new Date().toISOString(),
        });

    return account;
}

module.exports = {
    ROLE_HIERARCHY,
    hasMinimumRole,
    getUserMerchantAccounts,
    getUserRoleForAccount,
    checkPermission,
    getTeamMembers,
    createInvitation,
    acceptInvitation,
    removeTeamMember,
    updateMemberRole,
    createMerchantAccount,
    getInvitations,
    revokeInvitation,
    getInvitationByToken
};
