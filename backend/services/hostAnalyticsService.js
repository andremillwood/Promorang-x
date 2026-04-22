const { supabase } = require('../lib/supabase');

/**
 * Host Analytics Service
 * Provides earnings, moment performance, and engagement analytics for hosts
 */

/**
 * Get host earnings summary
 * @param {string} hostId - Host ID
 * @param {object} dateRange - Start and end dates
 * @returns {object} Earnings summary
 */
async function getHostEarningsSummary(hostId, dateRange = {}) {
    const { startDate, endDate } = dateRange;

    try {
        let query = supabase
            .from('host_earnings_analytics')
            .select('*')
            .eq('host_id', hostId)
            .single();

        const { data, error } = await query;
        if (error) throw error;

        return data || {};
    } catch (error) {
        console.error('Error fetching host earnings summary:', error);
        throw error;
    }
}

/**
 * Get moment performance for a host
 * @param {string} hostId - Host ID
 * @returns {array} Moment performance data
 */
async function getMomentPerformance(hostId) {
    try {
        const { data, error } = await supabase
            .from('moment_performance_analytics')
            .select('*')
            .eq('host_id', hostId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching moment performance:', error);
        throw error;
    }
}

/**
 * Get earnings breakdown by time period
 * @param {string} hostId - Host ID
 * @param {object} options - Filter options
 * @returns {array} Earnings timeline
 */
async function getEarningsBreakdown(hostId, options = {}) {
    const { startDate, endDate, groupBy = 'day' } = options;

    try {
        let query = supabase
            .from('moments')
            .select('created_at, reward_pool_usd, participant_count, title')
            .eq('organizer_id', hostId)
            .order('created_at', { ascending: true });

        if (startDate) {
            query = query.gte('created_at', startDate);
        }

        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Group by specified period
        const grouped = {};
        data?.forEach(moment => {
            const date = new Date(moment.created_at);
            let key;

            if (groupBy === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (groupBy === 'week') {
                const weekNum = Math.ceil(date.getDate() / 7);
                key = `${date.getFullYear()}-W${weekNum}`;
            } else {
                key = date.toISOString().split('T')[0];
            }

            if (!grouped[key]) {
                grouped[key] = {
                    period: key,
                    moments_count: 0,
                    total_rewards: 0,
                    total_participants: 0
                };
            }

            grouped[key].moments_count++;
            grouped[key].total_rewards += parseFloat(moment.reward_pool_usd || 0);
            grouped[key].total_participants += moment.participant_count || 0;
        });

        return Object.values(grouped);
    } catch (error) {
        console.error('Error fetching earnings breakdown:', error);
        throw error;
    }
}

/**
 * Get engagement metrics for a host
 * @param {string} hostId - Host ID
 * @returns {object} Engagement metrics
 */
async function getEngagementMetrics(hostId) {
    try {
        const { data: moments, error } = await supabase
            .from('moments')
            .select(`
        id,
        participant_count,
        created_at,
        redemptions (count)
      `)
            .eq('organizer_id', hostId);

        if (error) throw error;

        const totalMoments = moments?.length || 0;
        const totalParticipants = moments?.reduce((sum, m) => sum + (m.participant_count || 0), 0) || 0;
        const totalRedemptions = moments?.reduce((sum, m) => sum + (m.redemptions?.[0]?.count || 0), 0) || 0;

        // Calculate growth rate (last 30 days vs previous 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentMoments = moments?.filter(m => new Date(m.created_at) >= thirtyDaysAgo).length || 0;
        const previousMoments = moments?.filter(m => {
            const date = new Date(m.created_at);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        }).length || 0;

        const growthRate = previousMoments > 0
            ? ((recentMoments - previousMoments) / previousMoments * 100).toFixed(2)
            : 0;

        return {
            total_moments: totalMoments,
            total_participants: totalParticipants,
            total_redemptions: totalRedemptions,
            avg_participants_per_moment: totalMoments > 0 ? (totalParticipants / totalMoments).toFixed(2) : 0,
            redemption_rate: totalParticipants > 0 ? (totalRedemptions / totalParticipants * 100).toFixed(2) : 0,
            moments_last_30_days: recentMoments,
            growth_rate: growthRate
        };
    } catch (error) {
        console.error('Error fetching engagement metrics:', error);
        throw error;
    }
}

/**
 * Get payout history for a host
 * @param {string} hostId - Host ID
 * @returns {array} Payout history
 */
async function getPayoutHistory(hostId) {
    try {
        const { data, error } = await supabase
            .from('payouts')
            .select('*')
            .eq('user_id', hostId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching payout history:', error);
        throw error;
    }
}

async function getMomentumMetrics(hostId) {
    try {
        const { data: moments, error: momentsError } = await supabase
            .from('moments')
            .select('id, title, pulse_state, gathering_threshold, capacity_limit, cooldown_minutes, is_active, starts_at')
            .eq('host_id', hostId);

        if (momentsError) throw momentsError;

        const momentIds = (moments || []).map((moment) => moment.id);
        let participantRows = [];
        let proofRows = [];

        if (momentIds.length > 0) {
            const [{ data: participants, error: participantError }, { data: proofs, error: proofError }] = await Promise.all([
                supabase
                    .from('moment_participants')
                    .select('moment_id, status')
                    .in('moment_id', momentIds),
                supabase
                    .from('proof_submissions')
                    .select('moment_id, submission_state')
                    .in('moment_id', momentIds),
            ]);

            if (participantError) throw participantError;
            if (proofError) throw proofError;
            participantRows = participants || [];
            proofRows = proofs || [];
        }

        const participantCountByMoment = participantRows.reduce((acc, row) => {
            acc[row.moment_id] = (acc[row.moment_id] || 0) + 1;
            return acc;
        }, {});

        const totals = (moments || []).reduce((acc, moment) => {
            const participantCount = participantCountByMoment[moment.id] || 0;
            if (moment.pulse_state === 'forming') acc.forming_count += 1;
            if (moment.pulse_state === 'live') acc.live_count += 1;
            if (moment.pulse_state === 'cooling') acc.cooling_count += 1;
            if ((moment.gathering_threshold || 0) > 0 && participantCount >= (moment.gathering_threshold || 0)) {
                acc.threshold_crossed_count += 1;
            }
            if ((moment.capacity_limit || 0) > 0 && participantCount >= (moment.capacity_limit || 0)) {
                acc.capacity_risk_count += 1;
            }
            return acc;
        }, {
            total_moments: moments?.length || 0,
            forming_count: 0,
            live_count: 0,
            cooling_count: 0,
            threshold_crossed_count: 0,
            capacity_risk_count: 0,
        });

        const verifiedProofs = proofRows.filter((row) => row.submission_state === 'verified').length;
        const pendingProofs = proofRows.filter((row) => row.submission_state === 'pending').length;

        return {
            ...totals,
            pending_proofs: pendingProofs,
            verified_proofs: verifiedProofs,
            proof_conversion_rate: proofRows.length > 0 ? Number(((verifiedProofs / proofRows.length) * 100).toFixed(2)) : 0,
        };
    } catch (error) {
        console.error('Error fetching momentum metrics:', error);
        throw error;
    }
}

/**
 * Export earnings report
 * @param {string} hostId - Host ID
 * @param {object} options - Export options
 * @returns {object} Report data
 */
async function exportEarningsReport(hostId, options = {}) {
    try {
        const [summary, moments, engagement, payouts] = await Promise.all([
            getHostEarningsSummary(hostId),
            getMomentPerformance(hostId),
            getEngagementMetrics(hostId),
            getPayoutHistory(hostId)
        ]);

        return {
            host_summary: summary,
            moment_performance: moments,
            engagement_metrics: engagement,
            payout_history: payouts,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error exporting earnings report:', error);
        throw error;
    }
}

module.exports = {
    getMomentumMetrics,
    getHostEarningsSummary,
    getMomentPerformance,
    getEarningsBreakdown,
    getEngagementMetrics,
    getPayoutHistory,
    exportEarningsReport
};
