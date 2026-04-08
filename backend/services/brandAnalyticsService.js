const { supabase } = require('../config/supabase');

/**
 * Brand Analytics Service
 * Provides campaign performance, ROI, and engagement analytics for brands
 */

/**
 * Get campaign performance metrics
 * @param {string} campaignId - Campaign ID
 * @returns {object} Campaign performance data
 */
async function getCampaignPerformance(campaignId) {
    try {
        const { data, error } = await supabase
            .from('brand_campaign_analytics')
            .select('*')
            .eq('campaign_id', campaignId)
            .single();

        if (error) throw error;
        return data || {};
    } catch (error) {
        console.error('Error fetching campaign performance:', error);
        throw error;
    }
}

/**
 * Get campaign ROI metrics
 * @param {string} campaignId - Campaign ID
 * @returns {object} ROI metrics
 */
async function getCampaignROI(campaignId) {
    try {
        const { data, error } = await supabase
            .rpc('get_campaign_roi', {
                p_campaign_id: campaignId
            });

        if (error) throw error;
        return data[0] || {};
    } catch (error) {
        console.error('Error fetching campaign ROI:', error);
        throw error;
    }
}

/**
 * Get all campaigns for a brand with analytics
 * @param {string} brandId - Brand ID
 * @returns {array} Campaigns with analytics
 */
async function getBrandCampaignsAnalytics(brandId) {
    try {
        const { data, error } = await supabase
            .from('brand_campaign_analytics')
            .select('*')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching brand campaigns analytics:', error);
        throw error;
    }
}

/**
 * Get engagement funnel for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {object} Engagement funnel data
 */
async function getEngagementFunnel(campaignId) {
    try {
        // Get campaign sponsorships
        const { data: sponsorships, error: sponsorError } = await supabase
            .from('campaign_sponsorships')
            .select(`
        *,
        moments (
          id,
          participant_count,
          redemptions (count)
        )
      `)
            .eq('campaign_id', campaignId);

        if (sponsorError) throw sponsorError;

        // Calculate funnel metrics
        const totalMoments = sponsorships?.length || 0;
        const totalParticipants = sponsorships?.reduce((sum, s) =>
            sum + (s.moments?.participant_count || 0), 0) || 0;
        const totalRedemptions = sponsorships?.reduce((sum, s) =>
            sum + (s.moments?.redemptions?.[0]?.count || 0), 0) || 0;

        return {
            moments_sponsored: totalMoments,
            total_participants: totalParticipants,
            total_redemptions: totalRedemptions,
            participation_rate: totalMoments > 0 ? (totalParticipants / totalMoments).toFixed(2) : 0,
            redemption_rate: totalParticipants > 0 ? (totalRedemptions / totalParticipants * 100).toFixed(2) : 0
        };
    } catch (error) {
        console.error('Error fetching engagement funnel:', error);
        throw error;
    }
}

/**
 * Get top performing moments for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {number} limit - Number of results
 * @returns {array} Top moments
 */
async function getTopMoments(campaignId, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('campaign_sponsorships')
            .select(`
        *,
        moments (
          id,
          title,
          participant_count,
          reward_pool_usd,
          organizer_id,
          users!moments_organizer_id_fkey (email)
        )
      `)
            .eq('campaign_id', campaignId)
            .order('amount_usd', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data?.map(s => ({
            moment_id: s.moments?.id,
            moment_title: s.moments?.title,
            host_email: s.moments?.users?.email,
            participants: s.moments?.participant_count,
            sponsorship_amount: s.amount_usd,
            reward_pool: s.moments?.reward_pool_usd,
            cost_per_participant: s.moments?.participant_count > 0
                ? (s.amount_usd / s.moments.participant_count).toFixed(2)
                : 0
        })) || [];
    } catch (error) {
        console.error('Error fetching top moments:', error);
        throw error;
    }
}

/**
 * Get campaign spending over time
 * @param {string} campaignId - Campaign ID
 * @returns {array} Spending timeline
 */
async function getSpendingTimeline(campaignId) {
    try {
        const { data, error } = await supabase
            .from('campaign_sponsorships')
            .select('created_at, amount_usd')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by day and calculate cumulative spend
        const timeline = [];
        let cumulativeSpend = 0;

        data?.forEach(sponsorship => {
            cumulativeSpend += parseFloat(sponsorship.amount_usd);
            const date = new Date(sponsorship.created_at).toISOString().split('T')[0];

            const existing = timeline.find(t => t.date === date);
            if (existing) {
                existing.daily_spend += parseFloat(sponsorship.amount_usd);
                existing.cumulative_spend = cumulativeSpend;
            } else {
                timeline.push({
                    date,
                    daily_spend: parseFloat(sponsorship.amount_usd),
                    cumulative_spend: cumulativeSpend
                });
            }
        });

        return timeline;
    } catch (error) {
        console.error('Error fetching spending timeline:', error);
        throw error;
    }
}

/**
 * Export campaign report
 * @param {string} campaignId - Campaign ID
 * @returns {object} Report data
 */
async function exportCampaignReport(campaignId) {
    try {
        const [performance, roi, funnel, topMoments] = await Promise.all([
            getCampaignPerformance(campaignId),
            getCampaignROI(campaignId),
            getEngagementFunnel(campaignId),
            getTopMoments(campaignId, 20)
        ]);

        return {
            campaign_overview: performance,
            roi_metrics: roi,
            engagement_funnel: funnel,
            top_moments: topMoments,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error exporting campaign report:', error);
        throw error;
    }
}

module.exports = {
    getCampaignPerformance,
    getCampaignROI,
    getBrandCampaignsAnalytics,
    getEngagementFunnel,
    getTopMoments,
    getSpendingTimeline,
    exportCampaignReport
};
