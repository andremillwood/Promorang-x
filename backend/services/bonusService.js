/**
 * PROMORANG BONUS SERVICE
 * Handle welcome bonuses and special claims
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Get user's bonus status
 */
async function getBonusStatus(userId) {
    if (!supabase) return { welcome_claimed: false, expires_at: new Date(Date.now() + 86400000).toISOString() };

    try {
        const { data: bonus } = await supabase
            .from('user_bonuses')
            .select('*')
            .eq('user_id', userId)
            .eq('bonus_type', 'welcome')
            .single();

        if (bonus) return { welcome_claimed: !!bonus.claimed_at, expires_at: bonus.expires_at };

        // Create a generic expiry if not found (usually set at signup)
        return { welcome_claimed: false, expires_at: new Date(Date.now() + 86400000).toISOString() };
    } catch (error) {
        console.error('[Bonus Service] Error:', error);
        return { welcome_claimed: false };
    }
}

/**
 * Claim welcome bonus
 */
async function claimWelcomeBonus(userId) {
    if (!supabase) return { success: true, amount: 100 };

    try {
        // Check if already claimed
        const { data: bonus } = await supabase
            .from('user_bonuses')
            .select('*')
            .eq('user_id', userId)
            .eq('bonus_type', 'welcome')
            .single();

        if (bonus?.claimed_at) throw new Error('Bonus already claimed');

        if (bonus && new Date(bonus.expires_at) < new Date()) {
            throw new Error('Bonus has expired');
        }

        // Mark as claimed
        await supabase
            .from('user_bonuses')
            .update({ claimed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('bonus_type', 'welcome');

        const amount = bonus?.amount || 100;

        // Award gems
        await supabase.rpc('add_gems', {
            p_user_id: userId,
            p_amount: amount,
            p_reason: 'Welcome Bonus',
        });

        return { success: true, amount };
    } catch (error) {
        console.error('[Bonus Service] Error claiming:', error);
        throw error;
    }
}

module.exports = {
    getBonusStatus,
    claimWelcomeBonus,
};
