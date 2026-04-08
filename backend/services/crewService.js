/**
 * PROMORANG CREW SERVICE
 * Handles social scoring and Crew identity
 */
const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Calculate the Crew Score for a user
 * Heuristic: (Followers * 1) + (Active Referrals * 10)
 */
async function getCrewScore(userId) {
    if (!supabase) return 0;

    try {
        // Get followers count
        const { count: followersCount } = await supabase
            .from('user_follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

        // Get active referrals count
        const { count: activeReferralsCount } = await supabase
            .from('user_referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', userId)
            .eq('status', 'active');

        return (followersCount || 0) * 1 + (activeReferralsCount || 0) * 10;
    } catch (error) {
        console.error('[Crew Service] Error calculating crew score:', error);
        return 0;
    }
}

/**
 * Get Crew stats for a user
 */
async function getCrewStats(userId) {
    if (!supabase) return { crew_size: 0, active_members: 0, crew_score: 0 };

    try {
        const { count: followersCount } = await supabase
            .from('user_follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

        const { count: activeReferralsCount } = await supabase
            .from('user_referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', userId)
            .eq('status', 'active');

        const { count: totalReferralsCount } = await supabase
            .from('user_referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', userId);

        return {
            crew_size: followersCount || 0,
            active_members: activeReferralsCount || 0,
            total_referrals: totalReferralsCount || 0,
            crew_score: (followersCount || 0) * 1 + (activeReferralsCount || 0) * 10
        };
    } catch (error) {
        console.error('[Crew Service] Error getting crew stats:', error);
        return { crew_size: 0, active_members: 0, crew_score: 0 };
    }
}

/**
 * Get Guild hierarchy for a user (upline + downline)
 * Returns 3 levels of upline (who referred you) and direct referrals (downline)
 */
async function getGuildStats(userId) {
    if (!supabase) return { upline: [], downline: [], guild_level: 0, total_commission_earned: 0 };

    try {
        // Build upline chain (up to 3 levels)
        const upline = [];
        let currentUserId = userId;

        for (let level = 1; level <= 3; level++) {
            const { data: referral } = await supabase
                .from('user_referrals')
                .select(`
                    referrer_id,
                    referrer:users!user_referrals_referrer_id_fkey(id, username, display_name, profile_image)
                `)
                .eq('referred_id', currentUserId)
                .single();

            if (!referral || !referral.referrer) break;

            upline.push({
                level,
                user_id: referral.referrer.id,
                username: referral.referrer.username,
                display_name: referral.referrer.display_name,
                profile_image: referral.referrer.profile_image,
                role: level === 1 ? 'Referrer' : level === 2 ? 'Upline' : 'Guild Master'
            });

            currentUserId = referral.referrer.id;
        }

        // Get direct referrals (downline)
        const { data: downlineData } = await supabase
            .from('user_referrals')
            .select(`
                referred_id,
                status,
                referred:users!user_referrals_referred_id_fkey(id, username, display_name, profile_image)
            `)
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        const downline = (downlineData || []).map(r => ({
            user_id: r.referred?.id,
            username: r.referred?.username,
            display_name: r.referred?.display_name,
            profile_image: r.referred?.profile_image,
            status: r.status
        }));

        // Get total commissions earned from Guild
        const { data: commissions } = await supabase
            .from('referral_commissions')
            .select('commission_amount')
            .eq('referrer_id', userId)
            .eq('status', 'paid');

        const totalCommission = (commissions || []).reduce((sum, c) => sum + (c.commission_amount || 0), 0);

        return {
            upline,
            downline,
            guild_level: upline.length > 0 ? upline.length : 0,
            total_commission_earned: parseFloat(totalCommission.toFixed(2))
        };
    } catch (error) {
        console.error('[Crew Service] Error getting guild stats:', error);
        return { upline: [], downline: [], guild_level: 0, total_commission_earned: 0 };
    }
}

module.exports = {
    getCrewScore,
    getCrewStats,
    getGuildStats
};
