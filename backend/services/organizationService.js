/**
 * ORGANIZATION SERVICE
 * Handles organization creation, team management, and B2B onboarding.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const roleService = require('./roleService');
const economyService = require('./economyService');

/**
 * Create a new Organization (Brand/Merchant)
 * @param {string} userId - UUID of the creator (will be Owner)
 * @param {object} data - Organization details
 */
async function createOrganization(userId, data) {
    if (!supabase) throw new Error('Database not available');

    const { name, type, industry, website, contact_email } = data;

    if (!name || !type) throw new Error('Name and Type are required');
    if (!['brand', 'merchant', 'agency'].includes(type)) throw new Error('Invalid organization type');

    try {
        // 1. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name,
                type,
                industry,
                website,
                contact_email,
                owner_id: userId,
                status: 'active'
            })
            .select()
            .single();

        if (orgError) throw orgError;

        // 2. Add User as Member (Owner)
        // Check if organization_members exists or is needed, usually Owner is enough for MVP
        // But let's check for 'organization_members' table existence via insertion attempt
        // If it fails, we might just rely on owner_id on organizations table for now.
        // Assuming typical M2M relationship:

        const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
                organization_id: org.id,
                user_id: userId,
                role: 'owner'
            });

        if (memberError) {
            console.warn('[OrgService] Failed to add member (might not exist yet):', memberError.message);
            // Continue, as owner_id on org table is strict reference usually
        }

        // 3. Grant User Role (Brand or Merchant)
        // This unlocks the dashboard for them
        await roleService.grantRole(userId, type, 'system_onboarding');

        // 4. Initialize Economy Account (if Brand)
        if (type === 'brand') {
            await economyService.getBrandAccount(org.id); // Creates if missing
        }

        return { success: true, organization: org };

    } catch (error) {
        console.error('[OrgService] Creation error:', error);
        throw error;
    }
}

/**
 * Get user's organizations
 */
async function getUserOrganizations(userId) {
    if (!supabase) return [];

    // Fetch orgs where user is owner OR member
    // Simplified MVP: Fetch where owner_id = userId
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userId);

    if (error) throw error;
    return data;
}

module.exports = {
    createOrganization,
    getUserOrganizations
};
