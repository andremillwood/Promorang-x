const { supabase } = require('../lib/supabase');

/**
 * Brand Campaign Service
 * Handles campaign creation, management, and host discovery for brand organizations
 */

/**
 * Create a new brand campaign
 * @param {string} organizationId - Brand organization ID
 * @param {object} campaignData - Campaign details
 * @returns {Promise<object>} Created campaign
 */
async function createCampaign(organizationId, campaignData) {
    const {
        title,
        description,
        goals,
        targetAudience,
        budget,
        duration,
        categories,
        locations
    } = campaignData;

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
            advertiser_id: organizationId,
            name: title,
            description,
            maturity: 'active',
            metadata: {
                goals,
                targetAudience,
                categories,
                locations,
                duration
            }
        })
        .select()
        .single();

    if (campaignError) throw campaignError;

    // Allocate budget if provided
    if (budget && budget > 0) {
        await allocateBudget(campaign.id, organizationId, budget);
    }

    return campaign;
}

/**
 * Allocate budget to a campaign
 * @param {string} campaignId - Campaign ID
 * @param {string} organizationId - Organization ID
 * @param {number} amount - Budget amount
 */
async function allocateBudget(campaignId, organizationId, amount) {
    // Get or create brand budget
    let { data: budget, error: budgetError } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

    if (budgetError && budgetError.code !== 'PGRST116') {
        throw budgetError;
    }

    if (!budget) {
        // Create new budget if none exists
        const { data: newBudget, error: createError } = await supabase
            .from('brand_budgets')
            .insert({
                organization_id: organizationId,
                total_budget: amount,
                allocated_budget: amount
            })
            .select()
            .single();

        if (createError) throw createError;
        return newBudget;
    }

    // Check if enough budget available
    const availableBudget = budget.total_budget - budget.allocated_budget;
    if (availableBudget < amount) {
        throw new Error(`Insufficient budget. Available: $${availableBudget}, Requested: $${amount}`);
    }

    // Update allocated budget
    const { error: updateError } = await supabase
        .from('brand_budgets')
        .update({
            allocated_budget: budget.allocated_budget + amount
        })
        .eq('id', budget.id);

    if (updateError) throw updateError;

    return budget;
}

/**
 * Discover hosts based on brand preferences
 * @param {object} filters - Discovery filters
 * @returns {Promise<array>} Matching hosts with their moments
 */
async function discoverHosts(filters = {}) {
    const {
        categories = [],
        locations = [],
        minAudienceSize = 0,
        maxCostPerMoment = null,
        limit = 20
    } = filters;

    // Build query for moments with host info
    let query = supabase
        .from('moments')
        .select(`
            *,
            host:auth.users!moments_host_id_fkey (
                id,
                email,
                user_metadata
            ),
            participations:moment_participations(count)
        `)
        .eq('is_active', true)
        .gte('starts_at', new Date().toISOString());

    // Apply category filter
    if (categories.length > 0) {
        query = query.in('category', categories);
    }

    // Apply location filter (simplified - would need geocoding in production)
    if (locations.length > 0) {
        // For now, just filter by location string contains
        query = query.or(locations.map(loc => `location.ilike.%${loc}%`).join(','));
    }

    query = query.limit(limit);

    const { data: moments, error } = await query;

    if (error) throw error;

    // Group by host and calculate metrics
    const hostMap = new Map();

    moments.forEach(moment => {
        const hostId = moment.host_id;
        if (!hostMap.has(hostId)) {
            hostMap.set(hostId, {
                hostId,
                hostEmail: moment.host?.email,
                hostName: moment.host?.user_metadata?.full_name || 'Anonymous Host',
                moments: [],
                totalAudience: 0,
                avgCostPerMoment: 0
            });
        }

        const hostData = hostMap.get(hostId);
        const audienceSize = moment.participations?.[0]?.count || 0;

        hostData.moments.push({
            id: moment.id,
            title: moment.title,
            category: moment.category,
            location: moment.location,
            startsAt: moment.starts_at,
            audienceSize,
            estimatedCost: calculateMomentCost(moment, audienceSize)
        });

        hostData.totalAudience += audienceSize;
    });

    // Convert map to array and filter by criteria
    let hosts = Array.from(hostMap.values());

    // Filter by minimum audience size
    if (minAudienceSize > 0) {
        hosts = hosts.filter(h => h.totalAudience >= minAudienceSize);
    }

    // Calculate average cost per moment
    hosts.forEach(host => {
        const totalCost = host.moments.reduce((sum, m) => sum + m.estimatedCost, 0);
        host.avgCostPerMoment = host.moments.length > 0 ? totalCost / host.moments.length : 0;
    });

    // Filter by max cost per moment
    if (maxCostPerMoment) {
        hosts = hosts.filter(h => h.avgCostPerMoment <= maxCostPerMoment);
    }

    // Sort by total audience (descending)
    hosts.sort((a, b) => b.totalAudience - a.totalAudience);

    return hosts;
}

/**
 * Calculate estimated sponsorship cost for a moment
 * @param {object} moment - Moment data
 * @param {number} audienceSize - Expected audience size
 * @returns {number} Estimated cost in USD
 */
function calculateMomentCost(moment, audienceSize) {
    // Base cost per participant
    const baseCostPerParticipant = 5;

    // Category multipliers
    const categoryMultipliers = {
        'fitness': 1.2,
        'food': 1.1,
        'networking': 1.3,
        'music': 1.4,
        'default': 1.0
    };

    const multiplier = categoryMultipliers[moment.category] || categoryMultipliers.default;

    return Math.round(audienceSize * baseCostPerParticipant * multiplier);
}

/**
 * Sponsor a specific moment
 * @param {string} campaignId - Campaign ID
 * @param {string} momentId - Moment ID
 * @param {number} amount - Sponsorship amount
 * @returns {Promise<object>} Sponsorship record
 */
async function sponsorMoment(campaignId, momentId, amount) {
    // Check if already sponsored
    const { data: existing } = await supabase
        .from('campaign_sponsorships')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('moment_id', momentId)
        .single();

    if (existing) {
        throw new Error('This moment is already sponsored by this campaign');
    }

    // Create sponsorship
    const { data: sponsorship, error } = await supabase
        .from('campaign_sponsorships')
        .insert({
            campaign_id: campaignId,
            moment_id: momentId,
            sponsorship_amount: amount,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;

    // Update campaign budget spent
    await recordSpend(campaignId, amount);

    return sponsorship;
}

/**
 * Record campaign spending
 * @param {string} campaignId - Campaign ID
 * @param {number} amount - Amount spent
 */
async function recordSpend(campaignId, amount) {
    // Get campaign to find organization
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('advertiser_id')
        .eq('id', campaignId)
        .single();

    if (!campaign) throw new Error('Campaign not found');

    // Update budget spent
    const { data: budget } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('organization_id', campaign.advertiser_id)
        .eq('status', 'active')
        .single();

    if (!budget) throw new Error('No active budget found');

    const { error } = await supabase
        .from('brand_budgets')
        .update({
            spent_budget: budget.spent_budget + amount
        })
        .eq('id', budget.id);

    if (error) throw error;
}

/**
 * Get campaign performance metrics
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<object>} Performance data
 */
async function getCampaignPerformance(campaignId) {
    // Get all sponsorships for this campaign
    const { data: sponsorships, error } = await supabase
        .from('campaign_sponsorships')
        .select(`
            *,
            moment:moments (
                title,
                participations:moment_participations(count)
            )
        `)
        .eq('campaign_id', campaignId);

    if (error) throw error;

    // Calculate metrics
    const totalSpent = sponsorships.reduce((sum, s) => sum + parseFloat(s.sponsorship_amount), 0);
    const totalReach = sponsorships.reduce((sum, s) => {
        const participations = s.moment?.participations?.[0]?.count || 0;
        return sum + participations;
    }, 0);

    const costPerParticipant = totalReach > 0 ? totalSpent / totalReach : 0;

    return {
        totalSponsored: sponsorships.length,
        totalSpent,
        totalReach,
        costPerParticipant,
        sponsorships: sponsorships.map(s => ({
            momentTitle: s.moment?.title,
            amount: s.sponsorship_amount,
            status: s.status,
            reach: s.moment?.participations?.[0]?.count || 0
        }))
    };
}

/**
 * Get brand's campaigns
 * @param {string} organizationId - Organization ID
 * @returns {Promise<array>} Campaigns
 */
async function getBrandCampaigns(organizationId) {
    const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select(`
            *,
            sponsorships:campaign_sponsorships(count)
        `)
        .eq('advertiser_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return campaigns;
}

module.exports = {
    createCampaign,
    allocateBudget,
    discoverHosts,
    sponsorMoment,
    getCampaignPerformance,
    getBrandCampaigns,
    calculateMomentCost
};
