/**
 * PROMORANG RELAY SERVICE
 * Lineage engine for tracking content propagation, status, and downstream impact.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * CORE CONSTANTS
 */
const OBJECT_TYPES = {
    CONTENT: 'content',
    PREDICTION: 'prediction',
    DROP: 'drop',
    CAMPAIGN: 'campaign',
    EVENT: 'event',
    COUPON: 'coupon',
    SEASON: 'season',
    PRODUCT: 'product',
    STORE: 'store',
    BLOG_POST: 'blog_post',
};

const TABLE_MAP = {
    content: 'content_pieces',
    prediction: 'predictions',
    drop: 'drops',
    campaign: 'advertiser_campaigns',
    event: 'events',
    coupon: 'coupons',
    season: 'seasons',
    product: 'products',
    store: 'merchant_stores',
    blog_post: 'blog_posts',
};

/**
 * Validate if a user can relay an object
 */
async function validateRelayEligibility(userId, objectType, objectId) {
    if (!supabase) {
        throw new Error('Database not available');
    }

    try {
        // 1. Check User Status
        const { data: user } = await supabase
            .from('users')
            .select('id, user_type, user_tier, trust_score, is_verified') // Assuming trust_score/is_verified exist or will be added
            .eq('id', userId)
            .single();

        if (!user) throw new Error('User not found');

        // 2. Fetch Object Metadata
        const tableName = TABLE_MAP[objectType];
        if (!tableName) throw new Error('Invalid object type for relay');

        const { data: object } = await supabase
            .from(tableName)
            .select('id, relay_enabled, relay_constraints')
            .eq('id', objectId)
            .single();

        if (!object) throw new Error('Object not found');

        // 3. Evaluate Constraints
        if (object.relay_enabled === false) {
            return { eligible: false, reason: 'Relay is disabled for this object.' };
        }

        const constraints = object.relay_constraints || {};

        // Check verification constraint
        if (constraints.verified_only && !user.is_verified) {
            return { eligible: false, reason: 'User must be verified to relay this object.' };
        }

        // Check trust score constraint
        if (constraints.min_trust_score && (user.trust_score || 0) < constraints.min_trust_score) {
            return { eligible: false, reason: `Trust score of ${constraints.min_trust_score} required.` };
        }

        // Check tier constraint
        if (constraints.min_tier && user.user_tier !== constraints.min_tier && user.user_tier !== 'super') {
            // Simple tier check logic - enhanced later
            return { eligible: false, reason: `Tier ${constraints.min_tier} required.` };
        }

        // Check loop prevention (User cannot relay if they are the originator, unless allowed?)
        // Typically originators don't "relay" their own content, they "share".
        // "No self-relay loops"
        // We need to check if user already relayed this object?
        const { count } = await supabase
            .from('relays')
            .select('id', { count: 'exact', head: true })
            .eq('relayer_user_id', userId)
            .eq('object_type', objectType)
            .eq('object_id', objectId);

        if (count > 0) {
            return { eligible: false, reason: 'You have already relayed this object.' };
        }

        return { eligible: true };

    } catch (error) {
        console.error('[Relay Service] Eligibility check failed:', error);
        return { eligible: false, reason: error.message };
    }
}

/**
 * Create a Relay Node (Propagate Object)
 */
async function createRelay(userId, objectType, objectId, parentRelayId = null, context = {}) {
    if (!supabase) throw new Error('Database not available');

    try {
        // 1. Validate Eligibility
        const eligibility = await validateRelayEligibility(userId, objectType, objectId);
        if (!eligibility.eligible) {
            throw new Error(eligibility.reason);
        }

        // 2. Resolve Originator (if needed for denormalization)
        const tableName = TABLE_MAP[objectType];
        let originatorId = null;

        // Try to get creator_id/operator_id/advertiser_id based on table
        const creatorField = objectType === 'season' ? 'operator_id' :
            objectType === 'coupon' ? 'created_by' :
                objectType === 'campaign' ? 'advertiser_id' :
                    objectType === 'product' ? 'store_id' :
                        objectType === 'blog_post' ? 'author_id' :
                            'creator_id';

        const selectQuery = objectType === 'product' ? `${creatorField}, merchant_stores(user_id)` : creatorField;

        const { data: objectData } = await supabase
            .from(tableName)
            .select(creatorField)
            .eq('id', objectId)
            .single();

        if (objectData) {
            if (objectType === 'product' && objectData.merchant_stores) {
                originatorId = objectData.merchant_stores.user_id;
            } else if (objectType === 'store') {
                const { data: storeData } = await supabase.from('merchant_stores').select('user_id').eq('id', objectId).single();
                originatorId = storeData?.user_id;
            } else {
                originatorId = objectData[creatorField];
            }
        }

        // 3. Determine Depth
        let depth = 1;
        if (parentRelayId) {
            const { data: parent } = await supabase
                .from('relays')
                .select('depth_level')
                .eq('id', parentRelayId)
                .single();
            if (parent) {
                depth = parent.depth_level + 1;
            }
        }

        // 4. Insert Relay
        const { data: relay, error } = await supabase
            .from('relays')
            .insert({
                object_type: objectType,
                object_id: objectId,
                originator_user_id: originatorId,
                relayer_user_id: userId,
                parent_relay_id: parentRelayId,
                depth_level: depth,
                context_data: context
            })
            .select()
            .single();

        if (error) throw error;

        return relay;

    } catch (error) {
        console.error('[Relay Service] Create relay failed:', error);
        throw error;
    }
}

/**
 * Get Relay Lineage (Tree or List)
 */
async function getRelayLineage(relayId) {
    // TODO: Implement recursive fetch if deep tree needed
    // For V1, just getting immediate children or the path?
    // Let's return the relay details and its immediate children
    if (!supabase) throw new Error('Database not available');

    const { data: relay, error } = await supabase
        .from('relays')
        .select(`
            *,
            relayer:relayer_user_id (id, username, avatar_url, trust_score),
            children:relays!parent_relay_id (
                id, relayer_user_id, depth_level, downstream_engagement_count
            )
        `)
        .eq('id', relayId)
        .single();

    if (error) throw error;
    return relay;
}

/**
 * Track downstream engagement on a relay (e.g., click, view)
 */
async function trackRelayEngagement(relayId, actionType = 'view') {
    if (!supabase) return;

    try {
        // Increment count - use RPC or direct update
        // Get current count first, then increment
        const { data: currentRelay } = await supabase
            .from('relays')
            .select('downstream_engagement_count')
            .eq('id', relayId)
            .single();

        const newCount = (currentRelay?.downstream_engagement_count || 0) + 1;

        const { error } = await supabase
            .from('relays')
            .update({
                downstream_engagement_count: newCount,
                updated_at: new Date().toISOString()
            })
            .eq('id', relayId);

        if (error) throw error;

        // TODO: Trigger rewards calculation here?
        // maybe call `distributeRelayRewards(relayId)`

    } catch (error) {
        console.error('[Relay Service] Track engagement failed:', error);
    }
}

module.exports = {
    validateRelayEligibility,
    createRelay,
    getRelayLineage,
    trackRelayEngagement,
    OBJECT_TYPES
};
