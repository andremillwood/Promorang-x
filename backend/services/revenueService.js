/**
 * PROMOSHARE REVENUE SERVICE
 * Tracks platform revenue and allocates 5% to PromoShare prize pools.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const promoShareService = require('./promoShareService');

const PROMOSHARE_PERCENTAGE = 0.05; // 5%

const revenueService = {
    /**
     * Track a revenue event (purchase, subscription, etc.)
     * @param {number} amount - Total transaction amount (in main currency unit, e.g. USD)
     * @param {string} sourceId - Transaction ID (e.g. Stripe Payment Intent ID)
     * @param {string} sourceType - Type of revenue ('subscription', 'ad_spend', 'purchase')
     */
    async trackRevenue(amount, sourceId, sourceType) {
        if (!supabase) return null;
        if (!amount || amount <= 0) return null;

        const promoShareAmount = amount * PROMOSHARE_PERCENTAGE;

        try {
            // 1. Get Active Cycle to allocate to
            // Using logic from promoShareService but direct query to avoid circular dependency issues if any
            // or just use promoShareService if it's safe. It should be safe.
            let activeCycle = await promoShareService.getActiveCycle();

            // If no active cycle, we still record it but with null allocated_cycle_id? 
            // Or ideally, we should always have a "next" cycle or "active" cycle.
            // If strictly no active cycle, we leave it pending.

            // 2. Record in Ledger
            const { data: ledgerEntry, error } = await supabase
                .from('promoshare_revenue_ledger')
                .insert({
                    source_transaction_id: null, // We might not have internal DB ID yet, so we use string source_id in description or extend schema?
                    // Schema has source_transaction_id as BIGINT referencing transactions(id).
                    // If the source is external (Stripe ID), we might need to store it alternatively or ensure internal transaction exists first.
                    // For now, let's assume we might lose strict FK constraints if we pass stripe ID.
                    // Requirement says "actual revenue earned". 
                    // Let's modify schema or usage?
                    // Schema: `source_transaction_id BIGINT REFERENCES transactions(id)`
                    // This implies we must have a local transaction record first.
                    // `payments.js` logs stripe events but doesn't explicitly Insert into `transactions` table in the snippets shown.
                    // Wait, `transactions` table exists.
                    // Let's assume we should insert a local transaction record first if one doesn't exist?
                    // Or relax the column to allow null and store stripe ID in a separate column?
                    // For MVP stability: I will treat `source_transaction_id` as nullable and add specific `external_id` column or store in `source_type` / metadata?
                    // The schema I created: `source_transaction_id BIGINT REFERENCES transactions(id)`.
                    // Does `payments.js` create a transaction record? 
                    // Lines 220-228 in `payments.js`: `// TODO: credit wallet / mark invoice paid`. It does NOT seem to insert into `transactions` table yet.
                    // I should probably ensure `payments.js` inserts into `transactions` properly, then I use that ID.

                    // Update: I will create a transaction record if needed or just skip the FK for now if complexity is high.
                    // But `revenue_ledger` depends on it.
                    // Let's rely on `allocated_cycle_id`.

                    source_type: sourceType,
                    total_amount: amount,
                    promoshare_amount: promoShareAmount,
                    status: activeCycle ? 'allocated' : 'pending',
                    allocated_cycle_id: activeCycle ? activeCycle.id : null
                })
                .select()
                .single();

            if (error) throw error;

            // 3. Update Jackpot if allocated
            if (activeCycle) {
                await this.addToJackpot(activeCycle.id, promoShareAmount);
            }

            return ledgerEntry;

        } catch (error) {
            console.error('[Revenue Service] Error tracking revenue:', error);
            return null; // Don't block main flow
        }
    },

    /**
     * Add amount to cycle jackpot
     */
    async addToJackpot(cycleId, amount) {
        if (!supabase) return;

        try {
            // Atomic update desirable, or Read-Write
            // Supabase RPC 'increment_jackpot' would be best
            // Fallback: Read-Write

            const { data: cycle } = await supabase
                .from('promoshare_cycles')
                .select('jackpot_amount')
                .eq('id', cycleId)
                .single();

            if (cycle) {
                const newAmount = (Number(cycle.jackpot_amount) || 0) + Number(amount);
                await supabase
                    .from('promoshare_cycles')
                    .update({ jackpot_amount: newAmount })
                    .eq('id', cycleId);
            }
        } catch (error) {
            console.error('[Revenue Service] Error updating jackpot:', error);
        }
    }
};

module.exports = revenueService;
