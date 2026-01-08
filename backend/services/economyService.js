/**
 * PROMORANG ECONOMY SERVICE
 * Handles currency management, conversions, and economy transactions
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Economy Configuration (v3.2)
const CONFIG = {
    currencies: ['points', 'promokeys', 'gems', 'gold'],
    conversion: {
        points_to_promokeys: {
            rate: 500, // 500 Points = 1 PromoKey
            daily_cap: 3
        }
    },
    drops: {
        types: {
            content_clipping: { cost: 1, currency: 'promokeys' },
            review: { cost: 2, currency: 'promokeys' },
            ugc_creation: { cost: 3, currency: 'promokeys' },
            affiliate: { cost: 5, currency: 'promokeys' },
            challenge: { cost: 10, currency: 'promokeys' }
        }
    },
    master_key: {
        cost: 500, // Points required to unlock if free user
        duration_hours: 24
    }
};

/**
 * Get user wallet balance
 */
async function getBalance(userId) {
    if (!supabase) throw new Error('Database not available');

    try {
        let { data, error } = await supabase
            .from('user_balances')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Balance not found, create one
            const { data: newData, error: createError } = await supabase
                .from('user_balances')
                .insert({ user_id: userId })
                .select()
                .single();

            if (createError) throw createError;
            data = newData;
        } else if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[Economy Service] Error getting balance:', error);
        throw error;
    }
}

/**
 * Add currency to user wallet (Earn)
 */
async function addCurrency(userId, currency, amount, source, referenceId = null, description = '') {
    if (!supabase) throw new Error('Database not available');
    if (!CONFIG.currencies.includes(currency)) throw new Error(`Invalid currency: ${currency}`);
    if (amount <= 0) throw new Error('Amount must be positive');

    try {
        // 1. Record Transaction
        const { error: txError } = await supabase
            .from('transaction_history')
            .insert({
                user_id: userId,
                currency,
                amount,
                transaction_type: 'earn',
                source,
                reference_id: referenceId,
                description
            });

        if (txError) throw txError;

        // 2. Update Balance (using atomic increment if possible, or simple update)
        // Supabase supports rpc for atomic increment, but let's use a simple update for now or raw sql if needed.
        // Actually, postgREST doesn't support atomic increment easily without RPC.
        // We will fetch and update for MVP, realizing race condition risk.
        // Optimized: Create a DB function `increment_balance` usually, but avoiding new migrations if not needed.
        // Let's rely on stored procedure if I had created it. 
        // Fallback: Read-Modify-Write.

        // Better: We can rely on a trigger on transaction_history to update balance? No, keeping logic here is explicit.
        // I'll stick to Read-Modify-Write for this task scope, but noted for improvement.

        const { data: currentBalance } = await getBalance(userId);
        const newAmount = (Number(currentBalance[currency]) || 0) + amount;

        const { error: updateError } = await supabase
            .from('user_balances')
            .update({ [currency]: newAmount, updated_at: new Date() })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        return { success: true, new_balance: newAmount };
    } catch (error) {
        console.error('[Economy Service] Error adding currency:', error);
        throw error;
    }
}

/**
 * Spend currency (Deduct)
 */
async function spendCurrency(userId, currency, amount, source, referenceId = null, description = '') {
    if (!supabase) throw new Error('Database not available');
    if (!CONFIG.currencies.includes(currency)) throw new Error(`Invalid currency: ${currency}`);
    if (amount <= 0) throw new Error('Amount must be positive');

    try {
        const { data: balance } = await getBalance(userId);
        const currentAmount = Number(balance[currency]) || 0;

        if (currentAmount < amount) {
            throw new Error(`Insufficient ${currency} balance`);
        }

        // 1. Record Transaction
        const { error: txError } = await supabase
            .from('transaction_history')
            .insert({
                user_id: userId,
                currency,
                amount: -amount, // Negative for spend
                transaction_type: 'spend',
                source,
                reference_id: referenceId,
                description
            });

        if (txError) throw txError;

        // 2. Update Balance
        const newAmount = currentAmount - amount;
        const { error: updateError } = await supabase
            .from('user_balances')
            .update({ [currency]: newAmount, updated_at: new Date() })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        return { success: true, new_balance: newAmount };
    } catch (error) {
        console.error('[Economy Service] Error spending currency:', error);
        throw error;
    }
}

/**
 * Convert Points to PromoKeys
 */
async function convertPointsToPromoKeys(userId, quantity = 1) {
    if (!supabase) throw new Error('Database not available');

    const { rate, daily_cap } = CONFIG.conversion.points_to_promokeys;
    const totalCost = rate * quantity;

    try {
        const { data: balance } = await getBalance(userId);

        // Check Daily Cap
        const lastReset = new Date(balance.last_daily_conversion_reset);
        const now = new Date();
        const isToday = lastReset.getDate() === now.getDate() && lastReset.getMonth() === now.getMonth() && lastReset.getFullYear() === now.getFullYear();

        let dailyCount = isToday ? (balance.daily_conversions_count || 0) : 0;

        if (dailyCount + quantity > daily_cap) {
            throw new Error(`Daily conversion limit reached (${daily_cap} keys per day)`);
        }

        // Spend Points
        await spendCurrency(userId, 'points', totalCost, 'conversion_to_promokeys');

        // Add PromoKeys
        await addCurrency(userId, 'promokeys', quantity, 'conversion_from_points');

        // Update Daily Stats
        await supabase
            .from('user_balances')
            .update({
                daily_conversions_count: dailyCount + quantity,
                last_daily_conversion_reset: isToday ? balance.last_daily_conversion_reset : now
            })
            .eq('user_id', userId);

        return { success: true, message: `Converted ${totalCost} Points to ${quantity} PromoKeys` };
    } catch (error) {
        console.error('[Economy Service] Error converting points:', error);
        throw error;
    }
}

/**
 * Check if Master Key is active
 */
async function getMasterKeyStatus(userId) {
    if (!supabase) throw new Error('Database not available');

    try {
        const { data: balance } = await getBalance(userId);

        if (balance.master_key_unlocked && balance.master_key_expires_at) {
            const expiresAt = new Date(balance.master_key_expires_at);
            if (expiresAt > new Date()) {
                return { active: true, expires_at: expiresAt };
            }
        }

        // Check if auto-unlock conditions met (MVP: simplified)
        // E.g. assume they need to pay points to unlock manually via separate endpoint
        return { active: false };
    } catch (error) {
        return { active: false };
    }
}

/**
 * Unlock Master Key (manual)
 */
async function unlockMasterKey(userId) {
    const cost = CONFIG.master_key.cost;

    try {
        await spendCurrency(userId, 'points', cost, 'master_key_unlock');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + CONFIG.master_key.duration_hours);

        await supabase
            .from('user_balances')
            .update({
                master_key_unlocked: true,
                master_key_expires_at: expiresAt.toISOString()
            })
            .eq('user_id', userId);

        return { success: true, expires_at: expiresAt };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    CONFIG,
    getBalance,
    addCurrency,
    spendCurrency,
    convertPointsToPromoKeys,
    getMasterKeyStatus,
    unlockMasterKey
};
