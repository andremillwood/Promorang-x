/**
 * Role Management Service
 * Handles role assignment, validation, and unlock logic
 */

const { supabase } = require('../lib/supabase');

/**
 * Check if user has a specific role
 */
async function userHasRole(userId, role) {
    const { data, error } = await supabase
        .rpc('user_has_role', { p_user_id: userId, p_role: role });

    if (error) throw new Error(`Failed to check role: ${error.message}`);
    return data;
}

/**
 * Get all active roles for a user
 */
async function getUserRoles(userId) {
    const { data, error } = await supabase
        .rpc('get_user_roles', { p_user_id: userId });

    if (error) throw new Error(`Failed to get user roles: ${error.message}`);
    return data.map(r => r.role);
}

/**
 * Grant a role to a user
 */
async function grantRole(userId, role, grantedBy = null) {
    const { error } = await supabase
        .rpc('grant_user_role', {
            p_user_id: userId,
            p_role: role,
            p_granted_by: grantedBy
        });

    if (error) throw new Error(`Failed to grant role: ${error.message}`);

    console.log(`[RoleService] Granted ${role} to user ${userId}`);
    return { success: true };
}

/**
 * Revoke a role from a user
 */
async function revokeRole(userId, role, reason = null) {
    const { error } = await supabase
        .rpc('revoke_user_role', {
            p_user_id: userId,
            p_role: role,
            p_reason: reason
        });

    if (error) throw new Error(`Failed to revoke role: ${error.message}`);

    console.log(`[RoleService] Revoked ${role} from user ${userId}`);
    return { success: true };
}

/**
 * Check if user should auto-unlock Host role based on Access Rank
 */
async function checkHostUnlock(userId) {
    // Get user's maturity state (Access Rank)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('maturity_state')
        .eq('user_id', userId)
        .single();

    if (profileError) throw new Error(`Failed to get profile: ${profileError.message}`);

    // Access Rank 3+ unlocks Host role
    if (profile.maturity_state >= 3) {
        const hasHost = await userHasRole(userId, 'host');

        if (!hasHost) {
            await grantRole(userId, 'host', null); // Auto-granted
            return { unlocked: true, reason: 'access_rank_3' };
        }
    }

    return { unlocked: false };
}

/**
 * Get role requirements for display
 */
function getRoleRequirements(role) {
    const requirements = {
        participant: {
            description: 'Default role for all users',
            auto_granted: true
        },
        host: {
            description: 'Create and manage Moments',
            requirements: [
                'Access Rank 3+ (7 consecutive days)',
                'OR approved fast-track application'
            ]
        },
        brand: {
            description: 'Fund Moments and create Activations',
            requirements: [
                'Complete brand onboarding',
                'Verify company information',
                'Set up payment method'
            ]
        },
        merchant: {
            description: 'List venue and host Moments',
            requirements: [
                'Complete merchant onboarding',
                'Verify venue location',
                'Upload venue photos'
            ]
        },
        admin: {
            description: 'Platform moderation and management',
            requirements: ['Designated by master admin']
        },
        master_admin: {
            description: 'Full platform control',
            requirements: ['Platform owner designation']
        }
    };

    return requirements[role] || null;
}

module.exports = {
    userHasRole,
    getUserRoles,
    grantRole,
    revokeRole,
    checkHostUnlock,
    getRoleRequirements
};
