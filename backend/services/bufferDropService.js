/**
 * PROMORANG BUFFER DROP SERVICE
 * 
 * Manages platform-funded buffer drops to maintain PromoKey floor value
 * and ensure consistent drop availability regardless of advertiser activity.
 * 
 * Buffer drops are:
 * - Always available (funded by platform)
 * - Lower payout (0.6-0.8 Gems vs advertiser drops)
 * - Cost 1 PromoKey
 * - Set minimum floor value for PromoKeys
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Default buffer drop configuration
const DEFAULT_BUFFER_CONFIG = {
    dailyDropCount: 5,
    gemRewardMin: 0.6,
    gemRewardMax: 0.8,
    keyCost: 1,
    fundingSources: ['key_sales', 'subscription_revenue', 'advertiser_fees']
};

/**
 * Get buffer pool status
 */
async function getBufferPool() {
    if (!supabase) {
        return {
            id: 'demo-buffer-pool',
            pool_type: 'buffer',
            name: 'Platform Buffer Pool',
            total_funded: 10000,
            available_balance: 8500,
            spent_amount: 1500,
            is_active: true
        };
    }

    try {
        const { data, error } = await supabase
            .from('platform_funding_pools')
            .select('*')
            .eq('pool_type', 'buffer')
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('[Buffer Drop] Error fetching pool:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('[Buffer Drop] Error:', error);
        return null;
    }
}

/**
 * Get buffer drop configuration
 */
async function getBufferConfig() {
    if (!supabase) {
        return DEFAULT_BUFFER_CONFIG;
    }

    try {
        const { data } = await supabase
            .from('economy_config')
            .select('value')
            .eq('key', 'buffer_drop_config')
            .single();

        if (data && data.value) {
            const config = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            return {
                dailyDropCount: config.daily_count || DEFAULT_BUFFER_CONFIG.dailyDropCount,
                gemRewardMin: config.gem_min || DEFAULT_BUFFER_CONFIG.gemRewardMin,
                gemRewardMax: config.gem_max || DEFAULT_BUFFER_CONFIG.gemRewardMax,
                keyCost: config.key_cost || DEFAULT_BUFFER_CONFIG.keyCost,
                fundingSources: config.funding_sources || DEFAULT_BUFFER_CONFIG.fundingSources
            };
        }
    } catch (error) {
        console.error('[Buffer Drop] Error loading config:', error);
    }

    return DEFAULT_BUFFER_CONFIG;
}

/**
 * Get active buffer drops
 */
async function getActiveBufferDrops() {
    if (!supabase) {
        // Return demo buffer drops
        return Array.from({ length: 5 }, (_, i) => ({
            id: `buffer-${i + 1}`,
            title: `Platform Daily Drop #${i + 1}`,
            description: 'Complete this simple task to earn Gems. Platform-guaranteed payout.',
            drop_type: 'engagement',
            difficulty: 'easy',
            key_cost: 1,
            gem_reward_base: 0.7,
            gem_pool_total: 100,
            gem_pool_remaining: 85,
            drop_source: 'platform',
            is_buffer_drop: true,
            status: 'active',
            platform: 'any',
            created_at: new Date().toISOString()
        }));
    }

    try {
        const { data, error } = await supabase
            .from('drops')
            .select('*')
            .eq('is_buffer_drop', true)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[Buffer Drop] Error fetching buffer drops:', error);
        return [];
    }
}

/**
 * Create daily buffer drops
 * This should be called by a cron job daily
 */
async function createDailyBufferDrops() {
    if (!supabase) {
        console.log('[Buffer Drop] Demo mode - skipping buffer drop creation');
        return { success: true, drops_created: 0, demo: true };
    }

    try {
        const config = await getBufferConfig();
        const pool = await getBufferPool();

        if (!pool || pool.available_balance <= 0) {
            console.log('[Buffer Drop] No buffer pool available or insufficient funds');
            return { success: false, error: 'Insufficient buffer pool funds' };
        }

        // Check how many buffer drops already exist today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: existingCount } = await supabase
            .from('drops')
            .select('id', { count: 'exact', head: true })
            .eq('is_buffer_drop', true)
            .eq('status', 'active')
            .gte('created_at', today.toISOString());

        const dropsToCreate = Math.max(0, config.dailyDropCount - (existingCount || 0));

        if (dropsToCreate === 0) {
            console.log('[Buffer Drop] Daily buffer drops already created');
            return { success: true, drops_created: 0, message: 'Already created today' };
        }

        // Create buffer drops
        const dropTitles = [
            'Quick Engagement Drop',
            'Daily Platform Task',
            'Simple Share Challenge',
            'Community Boost Drop',
            'Platform Appreciation Drop'
        ];

        const drops = [];
        for (let i = 0; i < dropsToCreate; i++) {
            const gemReward = Number((
                config.gemRewardMin +
                Math.random() * (config.gemRewardMax - config.gemRewardMin)
            ).toFixed(2));

            drops.push({
                title: dropTitles[i % dropTitles.length],
                description: 'Complete this task to earn guaranteed Gems from the platform pool. Low effort, consistent payout.',
                drop_type: 'engagement',
                difficulty: 'easy',
                key_cost: config.keyCost,
                gem_reward_base: gemReward,
                gem_pool_total: 50,
                gem_pool_remaining: 50,
                max_participants: 50,
                current_participants: 0,
                drop_source: 'platform',
                is_buffer_drop: true,
                is_proof_drop: false,
                is_paid_drop: true,
                status: 'active',
                funding_pool_id: pool.id,
                platform: 'any',
                requirements: 'Engage with platform content',
                deliverables: 'Screenshot of completed action',
                time_commitment: '5 minutes'
            });
        }

        const { data: createdDrops, error } = await supabase
            .from('drops')
            .insert(drops)
            .select();

        if (error) throw error;

        console.log(`[Buffer Drop] Created ${createdDrops.length} buffer drops`);
        return {
            success: true,
            drops_created: createdDrops.length,
            drops: createdDrops
        };
    } catch (error) {
        console.error('[Buffer Drop] Error creating daily drops:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add funds to buffer pool
 */
async function fundBufferPool(amount, source, description = '') {
    if (!supabase) throw new Error('Database not available');

    try {
        const pool = await getBufferPool();
        if (!pool) throw new Error('Buffer pool not found');

        const { error } = await supabase
            .from('platform_funding_pools')
            .update({
                total_funded: pool.total_funded + amount,
                available_balance: pool.available_balance + amount
            })
            .eq('id', pool.id);

        if (error) throw error;

        // Log the funding transaction
        console.log(`[Buffer Drop] Pool funded: ${amount} from ${source}. ${description}`);

        return { success: true, new_balance: pool.available_balance + amount };
    } catch (error) {
        console.error('[Buffer Drop] Error funding pool:', error);
        throw error;
    }
}

/**
 * Deduct from buffer pool when drop is completed
 */
async function deductFromBufferPool(amount, dropId) {
    if (!supabase) return;

    try {
        const pool = await getBufferPool();
        if (!pool) return;

        await supabase
            .from('platform_funding_pools')
            .update({
                available_balance: Math.max(0, pool.available_balance - amount),
                spent_amount: pool.spent_amount + amount
            })
            .eq('id', pool.id);
    } catch (error) {
        console.error('[Buffer Drop] Error deducting from pool:', error);
    }
}

/**
 * Get pool availability status for UI
 */
async function getPoolAvailability() {
    const pool = await getBufferPool();
    const bufferDrops = await getActiveBufferDrops();

    return {
        buffer: {
            available: pool ? pool.available_balance > 0 : false,
            drops_count: bufferDrops.length,
            pool_balance: pool?.available_balance || 0
        },
        message: pool?.available_balance > 0
            ? 'Platform drops always available'
            : 'Buffer pool depleted - advertiser drops only'
    };
}

module.exports = {
    getBufferPool,
    getBufferConfig,
    getActiveBufferDrops,
    createDailyBufferDrops,
    fundBufferPool,
    deductFromBufferPool,
    getPoolAvailability
};
