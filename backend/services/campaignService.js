/**
 * CAMPAIGN SERVICE
 * Handles campaign lifecycle, maturity levels, and automated creation.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

const MaturityLevel = {
    SEED: 'seed',
    ACTIVATED: 'activated',
    FUNDED: 'funded',
    DOMINANT: 'dominant'
};

/**
 * Create a new campaign
 */
async function createCampaign(data) {
    if (!supabase) throw new Error('Database not available');

    const {
        advertiser_id,
        user_id,
        title,
        description,
        maturity = MaturityLevel.SEED,
        metadata = {}
    } = data;

    try {
        const { data: campaign, error } = await supabase
            .from('advertiser_campaigns')
            .insert({
                advertiser_id,
                creator_id: user_id,
                title,
                description,
                campaign_maturity: maturity,
                metadata,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`[CampaignService] Created ${maturity} campaign: ${title} (${campaign.id})`);
        return campaign;
    } catch (error) {
        console.error('[CampaignService] Error creating campaign:', error);
        throw error;
    }
}

/**
 * Handle automated creation from Scouting (Genesis Engine)
 */
async function createFromScout(scoutRecord) {
    const { scout_id, external_metadata, source_platform } = scoutRecord;

    // Determine a title from metadata
    const title = external_metadata?.title || `New ${source_platform} Content`;
    const brandName = external_metadata?.author_name || 'Generic Brand';

    return createCampaign({
        user_id: scout_id,
        title: `Core: ${brandName}`,
        description: `Genesis campaign for ${brandName}. Proof of purchase required to scale.`,
        maturity: MaturityLevel.SEED,
        metadata: {
            scout_record_id: scoutRecord.id,
            source: 'genesis_engine',
            external_brand_name: brandName,
            platform: source_platform
        }
    });
}

/**
 * Check and advance campaign maturity
 */
async function checkMaturityTransition(campaignId) {
    if (!supabase) return;

    try {
        const { data: campaign, error } = await supabase
            .from('advertiser_campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (error || !campaign) return;

        let nextLevel = null;

        // SEED -> ACTIVATED (Requirement: 100 verified purchases)
        if (campaign.campaign_maturity === MaturityLevel.SEED) {
            const { count, error: countError } = await supabase
                .from('drop_applications')
                .select('*', { count: 'exact', head: true })
                .eq('campaign_id', campaignId)
                .eq('verification_status', 'verified')
                .eq('status', 'approved');

            // Threshold is 100 for production, but maybe lower for testing? 
            // We'll stick to 100 as per audit.
            if (!countError && count >= 100) {
                nextLevel = MaturityLevel.ACTIVATED;
            }
        }

        // ACTIVATED -> FUNDED (Requirement: Campaign Escrow is Funded)
        if (campaign.campaign_maturity === MaturityLevel.ACTIVATED) {
            const { data: escrow, error: escrowError } = await supabase
                .from('campaign_escrow')
                .select('status')
                .eq('campaign_id', campaignId)
                .single();

            if (!escrowError && escrow && escrow.status === 'funded') {
                nextLevel = MaturityLevel.FUNDED;
            }
        }

        // FUNDED -> DOMINANT (Requirement: High performance/Manual review)
        // For now, this might be manual or based on high-vol engagement
        if (campaign.campaign_maturity === MaturityLevel.FUNDED) {
            // Logic for dominant could be 1000+ verified participants or manual operator flag
        }

        if (nextLevel) {
            const { error: updateError } = await supabase
                .from('advertiser_campaigns')
                .update({
                    campaign_maturity: nextLevel,
                    updated_at: new Date().toISOString()
                })
                .eq('id', campaignId);

            if (!updateError) {
                console.log(`[CampaignService] Campaign ${campaignId} matured to ${nextLevel}`);

                // Track maturity event
                await supabase.from('campaign_maturity_log').insert({
                    campaign_id: campaignId,
                    previous_maturity: campaign.campaign_maturity,
                    new_maturity: nextLevel,
                    reason: `Automated requirement met`
                }).catch(() => { });
            }
        }
    } catch (error) {
        console.error('[CampaignService] Maturity check error:', error);
    }
}

/**
 * Force check maturity (helper for UI/Admin)
 */
async function advanceMaturityOnPurchase(campaignId) {
    return checkMaturityTransition(campaignId);
}

module.exports = {
    MaturityLevel,
    createCampaign,
    createFromScout,
    checkMaturityTransition,
    advanceMaturityOnPurchase
};
