/**
 * FLASHCREATE EVENT SERVICE
 * Standardizes how Promorang signals high-intent advertiser actions to FlashCreate.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Signal Types
 */
const SIGNAL_TYPES = {
    CAMPAIGN_STUCK: 'campaign_stuck',           // User started builder but didn't finish
    HIGH_ROI_CONTENT_FOUND: 'high_roi_found',   // Scout found content with >15% ROI potential
    BUDGET_EXHAUSTED: 'budget_exhausted',       // Managed account or recurring pack is low
    TIER_UPGRADE_INTENT: 'tier_upgrade_intent', // User clicked "Upgrade" but didn't pay
    DFY_INQUIRY: 'dfy_inquiry'                  // User clicked FlashCreate bridge
};

/**
 * Log a signal for FlashCreate
 * @param {string} userId 
 * @param {string} type - From SIGNAL_TYPES
 * @param {object} metadata - Contextual data (e.g., sku_id, content_id)
 */
async function logSignal(userId, type, metadata = {}) {
    if (!supabase) {
        console.error('[FlashCreateEvent] Database not available for signal logging');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('flash_create_signals')
            .insert({
                user_id: userId,
                signal_type: type,
                metadata: metadata,
                captured_at: new Date().toISOString(),
                status: 'pending' // pending, acknowledged, processed
            })
            .select()
            .single();

        if (error) {
            // Fallback: log to console if table doesn't exist yet
            console.warn(`[FlashCreateEvent] Could not log to table: ${error.message}`);
            console.log(`[SIGNAL] User: ${userId} | Type: ${type} | Meta:`, metadata);
            return null;
        }

        console.log(`[FlashCreateEvent] Signal captured: ${type} for user ${userId}`);
        return data;
    } catch (err) {
        console.error('[FlashCreateEvent] Critical error logging signal:', err);
        return null;
    }
}

module.exports = {
    SIGNAL_TYPES,
    logSignal
};
