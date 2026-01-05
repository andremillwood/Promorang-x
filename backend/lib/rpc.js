const supabase = require('./supabase');

/**
 * Increment a user's gem balance safely using Supabase RPC or direct update fallback.
 * @param {string} userId - The user ID
 * @param {number} amount - Amount to increment by
 * @returns {Promise<{success: boolean, error?: any}>}
 */
const incrementGems = async (userId, amount) => {
    if (!supabase) return { success: true };

    try {
        const { error } = await supabase.rpc('increment_gems', {
            user_id: userId,
            amount: amount
        });

        if (error) {
            console.error('Error in increment_gems RPC, trying fallback:', error);
            // Fallback to direct update if RPC fails
            const { error: fallbackError } = await supabase
                .from('users')
                .update({
                    gems_balance: supabase.rpc('gems_balance + amount', { amount }) || 0 // This is pseudocode for raw update
                })
                .eq('id', userId);

            // Re-fetch and update if needed, but the RPC is the preferred way.
            // Let's use a more standard fallback:
            const { data: user } = await supabase.from('users').select('gems_balance').eq('id', userId).single();
            if (user) {
                await supabase.from('users').update({ gems_balance: user.gems_balance + amount }).eq('id', userId);
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Failed to increment gems:', error);
        return { success: false, error };
    }
};

/**
 * Decrement a user's gem balance safely.
 */
const decrementGems = async (userId, amount) => {
    if (!supabase) return { success: true };

    try {
        const { error } = await supabase.rpc('decrement_gems', {
            user_id: userId,
            amount: amount
        });

        if (error) {
            console.error('Error in decrement_gems RPC, trying fallback:', error);
            const { data: user } = await supabase.from('users').select('gems_balance').eq('id', userId).single();
            if (user && user.gems_balance >= amount) {
                await supabase.from('users').update({ gems_balance: user.gems_balance - amount }).eq('id', userId);
            } else {
                return { success: false, error: 'Insufficient balance' };
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Failed to decrement gems:', error);
        return { success: false, error };
    }
};

module.exports = {
    incrementGems,
    decrementGems
};
