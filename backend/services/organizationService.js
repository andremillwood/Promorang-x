/**
 * Organization creation and membership access.
 * The browser uses the atomic database RPC; this service is retained for API
 * clients and mirrors the same canonical organization fields.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const roleService = require('./roleService');

function normalizeDomain(website) {
    if (!website) return null;
    try {
        const value = /^https?:\/\//i.test(website) ? website : `https://${website}`;
        return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return null;
    }
}

async function createOrganization(userId, data) {
    if (!supabase) throw new Error('Database not available');

    const { name, type, industry, website, contact_email } = data;
    const cleanName = String(name || '').trim();
    if (!cleanName || !type) throw new Error('Name and Type are required');
    if (!['brand', 'merchant', 'agency'].includes(type)) throw new Error('Invalid organization type');

    const normalizedDomain = normalizeDomain(website);
    let duplicateQuery = supabase.from('organizations').select('id,name,slug').eq('type', type);
    duplicateQuery = normalizedDomain
        ? duplicateQuery.or(`name.ilike.${cleanName},normalized_domain.eq.${normalizedDomain}`)
        : duplicateQuery.ilike('name', cleanName);
    const { data: duplicate, error: duplicateError } = await duplicateQuery.limit(1).maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) {
        const error = new Error('An organization with this name or website already exists. Request access or claim the existing page.');
        error.code = 'ORGANIZATION_ALREADY_EXISTS';
        throw error;
    }

    const slugBase = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'organization';
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;
    let organizationId = null;

    try {
        const { data: org, error: orgError } = await supabase.from('organizations').insert({
            name: cleanName,
            slug,
            type,
            industry: industry || null,
            website: website || null,
            contact_email: contact_email || null,
            billing_email: contact_email || null,
            owner_id: userId,
            created_by: userId,
            status: 'active',
            claim_status: 'claimed',
            verification_status: 'pending',
            normalized_domain: normalizedDomain
        }).select().single();
        if (orgError) throw orgError;
        organizationId = org.id;

        const { error: memberError } = await supabase.from('organization_members').insert({
            organization_id: org.id,
            user_id: userId,
            role: 'owner'
        });
        if (memberError) throw new Error(`Could not provision organization owner: ${memberError.message}`);

        await roleService.grantRole(userId, type, 'system_onboarding');

        if (type === 'brand') {
            const { error: accountError } = await supabase
                .from('brand_accounts')
                .upsert({ organization_id: org.id }, { onConflict: 'organization_id' });
            if (accountError) throw new Error(`Could not provision brand account: ${accountError.message}`);
        }

        return { success: true, organization: org };
    } catch (error) {
        // Compensating cleanup for API clients. The browser path uses the fully
        // transactional create_organization_workspace RPC.
        if (organizationId) await supabase.from('organizations').delete().eq('id', organizationId);
        console.error('[OrgService] Creation error:', error);
        throw error;
    }
}

async function getUserOrganizations(userId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('organization_members')
        .select('role, organizations(*)')
        .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((row) => ({ ...row.organizations, user_role: row.role }));
}

module.exports = { createOrganization, getUserOrganizations };
