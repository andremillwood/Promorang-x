const { supabase } = require('../lib/supabase');

const DEFAULT_ELIGIBILITY_RULES = {
    min_verified_moves: 3,
    min_moments_joined: 1,
    min_referrals: 1,
    min_proofs_approved: 1,
    subscription_qualifies: true,
    min_activity_score: 10,
    min_streak_days: 0
};

const DEFAULT_WEIGHT_CONFIG = {
    base_entry: 1,
    move_weight: 1,
    moment_weight: 2,
    proof_weight: 1,
    referral_weight: 3,
    streak_weight: 2,
    subscription_multiplier: 1.5,
    free_tier_multiplier: 1.0,
    paid_tier_multiplier: 1.5,
    risk_penalty_per_flag: 10
};

const USER_STATES = {
    NOT_QUALIFIED: 'not_qualified',
    QUALIFIED: 'qualified',
    BOOSTED: 'boosted',
    WINNER: 'winner',
    SPOTLIGHTED: 'spotlighted',
    DISQUALIFIED: 'disqualified',
    UNDER_REVIEW: 'under_review'
};

const promoShareQualificationService = {
    DEFAULT_ELIGIBILITY_RULES,
    DEFAULT_WEIGHT_CONFIG,
    USER_STATES,

    calculateEligibility(stats, rules, isPaidSubscriber) {
        const hasMinMoves = stats.verified_moves_count >= rules.min_verified_moves;
        const hasMinMoments = stats.moments_joined_count >= rules.min_moments_joined;
        const hasMinReferrals = stats.referral_count >= rules.min_referrals;
        const hasSubscription = isPaidSubscriber && rules.subscription_qualifies;
        const hasMinProofs = stats.proofs_approved_count >= rules.min_proofs_approved;
        const hasActivityScore = (stats.verified_moves_count + stats.moments_joined_count + stats.referral_count) >= rules.min_activity_score;

        return hasMinMoves || hasMinMoments || hasMinReferrals || hasSubscription || hasMinProofs || hasActivityScore;
    },

    calculateWeight(stats, config, tierMultiplier) {
        let weight = config.base_entry;
        weight += stats.verified_moves_count * config.move_weight;
        weight += stats.moments_joined_count * config.moment_weight;
        weight += stats.proofs_approved_count * config.proof_weight;
        weight += stats.referral_count * config.referral_weight;
        return Math.floor(weight * tierMultiplier);
    },

    calculateProgressToQualify(stats, eligibilityConfig) {
        const rules = { ...DEFAULT_ELIGIBILITY_RULES, ...(eligibilityConfig || {}) };

        return {
            moves: {
                current: stats?.verified_moves_count || 0,
                required: rules.min_verified_moves,
                complete: (stats?.verified_moves_count || 0) >= rules.min_verified_moves
            },
            moments: {
                current: stats?.moments_joined_count || 0,
                required: rules.min_moments_joined,
                complete: (stats?.moments_joined_count || 0) >= rules.min_moments_joined
            },
            referrals: {
                current: stats?.referral_count || 0,
                required: rules.min_referrals,
                complete: (stats?.referral_count || 0) >= rules.min_referrals
            }
        };
    },

    async getOrCreateUserStats(cycleId, userId) {
        if (!supabase) return null;

        const { data: existing } = await supabase
            .from('promoshare_user_stats')
            .select('*')
            .eq('cycle_id', cycleId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) return existing;

        const { data: created, error } = await supabase
            .from('promoshare_user_stats')
            .insert({
                cycle_id: cycleId,
                user_id: userId,
                status: USER_STATES.NOT_QUALIFIED,
                first_activity_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('[PromoShare] Error creating user stats:', error);
            return null;
        }

        return created;
    },

    async recalculateUserStats(cycleId, userId) {
        if (!supabase) return null;

        const { data: cycle } = await supabase
            .from('promoshare_cycles')
            .select('eligibility_config, weight_config')
            .eq('id', cycleId)
            .single();

        const eligibilityRules = { ...DEFAULT_ELIGIBILITY_RULES, ...(cycle?.eligibility_config || {}) };
        const weightConfig = { ...DEFAULT_WEIGHT_CONFIG, ...(cycle?.weight_config || {}) };

        const { data: entries } = await supabase
            .from('promoshare_entries')
            .select('source_type, entry_count')
            .eq('cycle_id', cycleId)
            .eq('user_id', userId);

        const stats = {
            verified_moves_count: 0,
            moments_joined_count: 0,
            proofs_approved_count: 0,
            referral_count: 0,
            total_entries: 0
        };

        (entries || []).forEach((entry) => {
            stats.total_entries += entry.entry_count || 0;
            if (entry.source_type === 'move') stats.verified_moves_count += entry.entry_count;
            if (entry.source_type === 'moment') stats.moments_joined_count += entry.entry_count;
            if (entry.source_type === 'proof') stats.proofs_approved_count += entry.entry_count;
            if (entry.source_type === 'referral') stats.referral_count += entry.entry_count;
        });

        const { data: user } = await supabase
            .from('users')
            .select('user_tier, subscription_status')
            .eq('id', userId)
            .single();

        const isPaidSubscriber = user?.subscription_status === 'active' && user?.user_tier !== 'free';
        const tierMultiplier = isPaidSubscriber ? weightConfig.paid_tier_multiplier : weightConfig.free_tier_multiplier;
        const isEligible = this.calculateEligibility(stats, eligibilityRules, isPaidSubscriber);
        const weightScore = this.calculateWeight(stats, weightConfig, tierMultiplier);

        let status = isEligible ? USER_STATES.QUALIFIED : USER_STATES.NOT_QUALIFIED;

        const { data: userRecord } = await supabase
            .from('promoshare_user_stats')
            .select('risk_score, disqualified')
            .eq('cycle_id', cycleId)
            .eq('user_id', userId)
            .maybeSingle();

        if (userRecord?.disqualified || (userRecord?.risk_score || 0) > 50) {
            status = userRecord?.disqualified ? USER_STATES.DISQUALIFIED : USER_STATES.UNDER_REVIEW;
        }

        const { data: updated } = await supabase
            .from('promoshare_user_stats')
            .update({
                eligible: isEligible,
                status,
                verified_moves_count: stats.verified_moves_count,
                moments_joined_count: stats.moments_joined_count,
                proofs_submitted_count: stats.proofs_approved_count,
                referral_count: stats.referral_count,
                total_entries: stats.total_entries,
                base_entry_score: weightConfig.base_entry,
                activity_score: (stats.verified_moves_count * weightConfig.move_weight) +
                    (stats.moments_joined_count * weightConfig.moment_weight) +
                    (stats.proofs_approved_count * weightConfig.proof_weight),
                referral_bonus: stats.referral_count * weightConfig.referral_weight,
                tier_multiplier: tierMultiplier,
                final_weight: weightScore,
                last_activity_at: new Date().toISOString(),
                last_computed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('cycle_id', cycleId)
            .eq('user_id', userId)
            .select()
            .single();

        return updated;
    }
};

module.exports = promoShareQualificationService;
