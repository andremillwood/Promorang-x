/**
 * MOMENT ESCROW SERVICE
 * 
 * Manages reward pools for Moments as escrow accounts.
 * Funds are locked when Moment is created, distributed to participants,
 * and unused funds are returned to the brand when Moment closes.
 */

const { supabase } = require('../lib/supabase');

/**
 * Create an escrow pool for a Moment
 */
async function createEscrowPool(momentId, totalAmountUSD, metadata = {}) {
    if (!supabase) {
        console.log('[Escrow] Mock mode - skipping escrow pool creation');
        return {
            id: `mock-escrow-${momentId}`,
            moment_id: momentId,
            total_amount_usd: totalAmountUSD,
            remaining_amount_usd: totalAmountUSD,
            status: 'active'
        };
    }

    try {
        const { data: pool, error } = await supabase
            .from('moment_escrow_pools')
            .insert({
                moment_id: momentId,
                total_amount_usd: totalAmountUSD,
                distributed_amount_usd: 0,
                remaining_amount_usd: totalAmountUSD,
                status: 'active',
                metadata
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`[Escrow] Created pool for Moment ${momentId}: $${totalAmountUSD}`);
        return pool;
    } catch (error) {
        console.error('[Escrow] Error creating escrow pool:', error);
        throw error;
    }
}

/**
 * Distribute reward from escrow pool to participant
 */
async function distributeReward(momentId, userId, amountUSD, metadata = {}) {
    if (!supabase) {
        console.log(`[Escrow] Mock mode - distributing $${amountUSD} to user ${userId}`);
        return {
            success: true,
            amount: amountUSD,
            remaining: 0
        };
    }

    try {
        // 1. Get escrow pool
        const { data: pool, error: poolError } = await supabase
            .from('moment_escrow_pools')
            .select('*')
            .eq('moment_id', momentId)
            .eq('status', 'active')
            .single();

        if (poolError || !pool) {
            throw new Error('Escrow pool not found or inactive');
        }

        // 2. Check sufficient funds
        if (pool.remaining_amount_usd < amountUSD) {
            throw new Error(`Insufficient funds in escrow pool. Requested: $${amountUSD}, Available: $${pool.remaining_amount_usd}`);
        }

        // 3. Update pool balances
        const newDistributed = parseFloat(pool.distributed_amount_usd) + parseFloat(amountUSD);
        const newRemaining = parseFloat(pool.remaining_amount_usd) - parseFloat(amountUSD);

        const { error: updateError } = await supabase
            .from('moment_escrow_pools')
            .update({
                distributed_amount_usd: newDistributed,
                remaining_amount_usd: newRemaining,
                status: newRemaining <= 0 ? 'depleted' : 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', pool.id);

        if (updateError) throw updateError;

        // 4. Credit user's wallet (using economyService)
        const economyService = require('./economyService');
        await economyService.addCurrency(
            userId,
            'gems',
            amountUSD,
            'moment_reward',
            momentId,
            `Reward from Moment ${momentId}`
        );

        // 5. Record distribution transaction
        await supabase
            .from('escrow_distributions')
            .insert({
                escrow_pool_id: pool.id,
                moment_id: momentId,
                user_id: userId,
                amount_usd: amountUSD,
                metadata,
                distributed_at: new Date().toISOString()
            });

        console.log(`[Escrow] Distributed $${amountUSD} to user ${userId} from Moment ${momentId}`);

        return {
            success: true,
            amount: amountUSD,
            remaining: newRemaining,
            pool_status: newRemaining <= 0 ? 'depleted' : 'active'
        };
    } catch (error) {
        console.error('[Escrow] Error distributing reward:', error);
        throw error;
    }
}

/**
 * Release unused funds back to brand when Moment closes
 */
async function releaseUnusedFunds(momentId, brandId) {
    if (!supabase) {
        console.log(`[Escrow] Mock mode - releasing unused funds for Moment ${momentId}`);
        return {
            success: true,
            refunded_amount: 0
        };
    }

    try {
        // 1. Get escrow pool
        const { data: pool, error: poolError } = await supabase
            .from('moment_escrow_pools')
            .select('*')
            .eq('moment_id', momentId)
            .single();

        if (poolError || !pool) {
            throw new Error('Escrow pool not found');
        }

        const remainingAmount = parseFloat(pool.remaining_amount_usd);

        // If no remaining funds, nothing to refund
        if (remainingAmount <= 0) {
            console.log(`[Escrow] No unused funds to release for Moment ${momentId}`);
            return {
                success: true,
                refunded_amount: 0
            };
        }

        // 2. Update pool status to refunded
        const { error: updateError } = await supabase
            .from('moment_escrow_pools')
            .update({
                status: 'refunded',
                updated_at: new Date().toISOString()
            })
            .eq('id', pool.id);

        if (updateError) throw updateError;

        // 3. Credit brand account (or process refund via payment processor)
        // For now, we'll add to brand account balance
        const { data: brandAccount, error: accountError } = await supabase
            .from('brand_accounts')
            .select('*')
            .eq('brand_id', brandId)
            .single();

        if (!accountError && brandAccount) {
            const newBalance = parseFloat(brandAccount.account_balance_usd) + remainingAmount;

            await supabase
                .from('brand_accounts')
                .update({
                    account_balance_usd: newBalance,
                    updated_at: new Date().toISOString()
                })
                .eq('id', brandAccount.id);
        }

        // 4. Record refund transaction
        await supabase
            .from('escrow_refunds')
            .insert({
                escrow_pool_id: pool.id,
                moment_id: momentId,
                brand_id: brandId,
                amount_usd: remainingAmount,
                refunded_at: new Date().toISOString()
            });

        console.log(`[Escrow] Released $${remainingAmount} unused funds for Moment ${momentId} to brand ${brandId}`);

        return {
            success: true,
            refunded_amount: remainingAmount
        };
    } catch (error) {
        console.error('[Escrow] Error releasing unused funds:', error);
        throw error;
    }
}

/**
 * Get escrow pool status for a Moment
 */
async function getPoolStatus(momentId) {
    if (!supabase) {
        return {
            total_amount: 0,
            distributed_amount: 0,
            remaining_amount: 0,
            status: 'active'
        };
    }

    try {
        const { data: pool, error } = await supabase
            .from('moment_escrow_pools')
            .select('*')
            .eq('moment_id', momentId)
            .single();

        if (error || !pool) {
            return null;
        }

        return {
            id: pool.id,
            total_amount: parseFloat(pool.total_amount_usd),
            distributed_amount: parseFloat(pool.distributed_amount_usd),
            remaining_amount: parseFloat(pool.remaining_amount_usd),
            status: pool.status,
            created_at: pool.created_at,
            updated_at: pool.updated_at
        };
    } catch (error) {
        console.error('[Escrow] Error getting pool status:', error);
        return null;
    }
}

/**
 * Batch distribute rewards to multiple participants
 */
async function batchDistributeRewards(momentId, distributions) {
    const results = [];

    for (const dist of distributions) {
        try {
            const result = await distributeReward(
                momentId,
                dist.userId,
                dist.amount,
                dist.metadata || {}
            );
            results.push({ ...result, userId: dist.userId });
        } catch (error) {
            results.push({
                success: false,
                userId: dist.userId,
                error: error.message
            });
        }
    }

    return results;
}

/**
 * Calculate remaining capacity for a Moment's escrow pool
 */
async function getRemainingCapacity(momentId, rewardPerParticipant) {
    const status = await getPoolStatus(momentId);

    if (!status || status.remaining_amount <= 0) {
        return 0;
    }

    const remainingParticipants = Math.floor(status.remaining_amount / rewardPerParticipant);
    return remainingParticipants;
}

/**
 * Check if escrow pool has sufficient funds for a reward
 */
async function hasSufficientFunds(momentId, amountUSD) {
    const status = await getPoolStatus(momentId);

    if (!status) {
        return false;
    }

    return status.remaining_amount >= amountUSD;
}

module.exports = {
    createEscrowPool,
    distributeReward,
    releaseUnusedFunds,
    getPoolStatus,
    batchDistributeRewards,
    getRemainingCapacity,
    hasSufficientFunds
};
