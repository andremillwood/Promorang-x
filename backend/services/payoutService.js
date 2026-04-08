/**
 * PAYOUT SERVICE
 * Handles host withdrawal requests and payout methods.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const economyService = require('./economyService');

// Minimum withdrawal amount in USD
const MIN_WITHDRAWAL_AMOUNT = 250.00;

/**
 * Add a payout method for a user
 */
async function addPayoutMethod(userId, type, details, isDefault = false) {
    if (!supabase) throw new Error('Database not available');

    // Basic validation
    if (!['bank_transfer', 'paypal', 'venmo', 'other'].includes(type)) {
        throw new Error('Invalid payout method type');
    }

    // Encrypt details in production! Storing raw for MVP/Demo
    const secureDetails = details;

    // If setting as default, unset others
    if (isDefault) {
        await supabase
            .from('user_payout_methods')
            .update({ is_default: false })
            .eq('user_id', userId);
    }

    const { data, error } = await supabase
        .from('user_payout_methods')
        .insert({
            user_id: userId,
            method_type: type,
            details: secureDetails,
            is_default: isDefault
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get user's payout methods
 */
async function getPayoutMethods(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('user_payout_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Request a manual withdrawal
 */
async function requestWithdrawal(userId, amount, payoutMethodId) {
    if (!supabase) throw new Error('Database not available');

    // 1. Validate Threshold
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
        throw new Error(`Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`);
    }

    // 2. Validate Balance
    // Assuming 'gems' or 'cash' balance in economyService
    // For this implementation, let's assume we check 'usd_balance' or calculate from Gems
    // Using economyService to get balance
    const balance = await economyService.getBalance(userId);

    // Check Gems converted to USD or direct USD balance
    // Let's assume user_balances has 'gems' and we use rate
    const gemRate = await economyService.getGemUSDRate(); // e.g. 0.01
    const availableUSD = (balance.gems || 0) * (gemRate || 0.01);

    if (availableUSD < amount) {
        throw new Error(`Insufficient balance. Available: $${availableUSD.toFixed(2)}`);
    }

    // 3. Create Withdrawal Request
    const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
            user_id: userId,
            amount: amount,
            currency: 'USD',
            payout_method_id: payoutMethodId,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;

    // 4. Deduct Funds (Hold)
    // We deduct the gems equivalent immediately to prevent double spending
    const gemsToDeduct = Math.ceil(amount / gemRate);
    await economyService.spendCurrency(
        userId,
        'gems',
        gemsToDeduct,
        'withdrawal_request',
        data.id,
        `Withdrawal Request for $${amount}`
    );

    return data;
}

/**
 * Get withdrawal history
 */
async function getWithdrawalHistory(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
            *,
            payout_method:payout_method_id (method_type, details)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Admin: Get pending withdrawals
 */
async function getPendingWithdrawals() {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
            *,
            user:user_id (email, raw_user_meta_data),
            payout_method:payout_method_id (method_type, details)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Admin: Update withdrawal status (Approve/Reject)
 */
async function updateWithdrawalStatus(requestId, status, note, adminId) {
    if (!['completed', 'rejected', 'processing'].includes(status)) {
        throw new Error('Invalid status');
    }

    const { data, error } = await supabase
        .from('withdrawal_requests')
        .update({
            status,
            admin_note: note,
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw error;

    // If rejected, refund the gems
    if (status === 'rejected') {
        const gemRate = await economyService.getGemUSDRate();
        const gemsToRefund = Math.ceil(data.amount / gemRate);

        await economyService.addCurrency(
            data.user_id,
            'gems',
            gemsToRefund,
            'withdrawal_rejected',
            data.id,
            `Refund for rejected withdrawal: ${note}`
        );
    }

    return data;
}

module.exports = {
    addPayoutMethod,
    getPayoutMethods,
    requestWithdrawal,
    getWithdrawalHistory,
    getPendingWithdrawals,
    updateWithdrawalStatus
};
