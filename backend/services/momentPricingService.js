/**
 * MOMENT PRICING SERVICE
 * 
 * Implements the Promorang SKU-based pricing architecture.
 * Pricing is per-Moment, not per-user. Participation is always free.
 * 
 * SKU Types:
 * - A1: Community Moment ($0-$150)
 * - A2: Activation Moment ($250-$750)
 * - A3: Bounty Moment ($500-$2,500)
 * - A4: Merchant Moment ($300-$1,000/mo)
 * - A5: Digital Moment ($150-$500)
 * - S1: Moment Bundles (10-20% discount)
 * - S2: Multi-Location Replication
 * - S3: Priority Matching & SLA
 */

const { supabase } = require('../lib/supabase');

// SKU Definitions
const SKU_CATALOG = {
    A1_COMMUNITY: {
        id: 'A1',
        name: 'Community Reach Campaign',
        description: 'Culture seeding, community building, and brand density',
        brandCostRange: { min: 0, max: 150 },
        platformFeeRange: { min: 0, max: 30 },
        rewardPoolOptional: true,
        unlockConditions: null, // Always available
        grossMarginTarget: 0.20, // 20%
        use_cases: ['community_building', 'cold_start', 'culture_seeding'],
        marketing_copy: 'Run a Community Reach Campaign. Build trust with local creators.'
    },

    A2_ACTIVATION: {
        id: 'A2',
        name: 'In-Store Traffic Campaign',
        description: 'Drive real foot traffic and product trials at a single location',
        brandCostRange: { min: 250, max: 750 },
        rewardPoolRange: { min: 150, max: 500 },
        platformFeeRange: { min: 75, max: 150 },
        opsBufferRange: { min: 25, max: 100 },
        grossMarginTarget: 0.275, // 25-30%
        unlockConditions: null,
        use_cases: ['foot_traffic', 'product_trial', 'local_awareness'],
        marketing_copy: 'A high-impact In-Store Traffic Campaign. Verified presence.'
    },

    A3_BOUNTY: {
        id: 'A3',
        name: 'UGC Explosion Campaign',
        description: 'Multi-location creator activation and content blitz',
        brandCostRange: { min: 500, max: 2500 },
        platformFeePercent: 0.20, // 15-25% of total
        grossMarginTarget: 0.30, // 25-35%
        unlockConditions: null,
        use_cases: ['ugc_creation', 'distributed_activation', 'creator_network'],
        marketing_copy: 'The Ultimate UGC Explosion. Verify outcomes across the map.'
    },

    A4_MERCHANT: {
        id: 'A4',
        name: 'Venue Anchor System (Recurring)',
        description: 'Consistent foot traffic, loyalty, and engagement for venues',
        monthlyCostRange: { min: 300, max: 1000 },
        momentsIncludedRange: { min: 4, max: 12 },
        unlockConditions: null,
        use_cases: ['recurring_traffic', 'loyalty', 'venue_anchor'],
        marketing_copy: 'Turn your venue into a verified Anchor. People show up every week.',
        notes: 'Margin improves over time due to template reuse'
    },

    A5_DIGITAL: {
        id: 'A5',
        name: 'Digital Engagement Campaign',
        description: 'Verified remote activations and online social blitz',
        brandCostRange: { min: 150, max: 500 },
        platformFeeRange: { min: 75, max: 200 },
        rewardPoolOptional: true,
        grossMarginTarget: 0.425, // 35-50%
        unlockConditions: null,
        use_cases: ['remote_activation', 'online_engagement', 'digital_only'],
        marketing_copy: 'Verified digital outcomes at scale. No physical limits.'
    },

    // Scale & Escalation SKUs (Earned, not default)
    S1_BUNDLE: {
        id: 'S1',
        name: 'Moment Bundles',
        description: 'Discounted bundles for brands with proven success',
        tiers: {
            bundle_5: { quantity: 5, costRange: { min: 1000, max: 3500 }, discount: 0.10 },
            bundle_10: { quantity: 10, costRange: { min: 2000, max: 6500 }, discount: 0.15 },
            bundle_50: { quantity: 50, discount: 0.20, custom_pricing: true }
        },
        unlockConditions: {
            min_successful_moments: 1,
            verified_outcomes_required: true
        },
        marketing_copy: 'Scale with confidence. Lower per-Moment cost.'
    },

    S2_REPLICATION: {
        id: 'S2',
        name: 'Multi-Location Replication',
        description: 'Scale proven Moments across multiple locations',
        replicationFeeRange: { min: 500, max: 2000 },
        perLocationDiscount: true,
        unlockConditions: {
            min_successful_moments: 1,
            proven_format_required: true
        },
        use_cases: ['multi_location_rollout', 'franchise_activation'],
        marketing_copy: 'Proven format. Faster rollout. Lower coordination cost.'
    },

    S3_PRIORITY: {
        id: 'S3',
        name: 'Priority Matching & SLA',
        description: 'Speed + certainty, faster workflow',
        priorityMatchingFeeRange: { min: 100, max: 500 },
        verificationSLAFeeRange: { min: 50, max: 200 },
        unlockConditions: null,
        notes: 'Cannot bypass Access Rank. Only accelerates workflow.',
        marketing_copy: 'Faster matching. Guaranteed SLA. No shortcuts.'
    }
};

/**
 * Get SKU pricing details
 */
function getSKUPricing(skuType) {
    const sku = SKU_CATALOG[skuType];
    if (!sku) {
        throw new Error(`Invalid SKU type: ${skuType}`);
    }
    return sku;
}

/**
 * Calculate total Moment cost based on SKU and options
 */
function calculateMomentCost(skuType, options = {}) {
    const sku = getSKUPricing(skuType);

    const {
        participants = 50,
        rewardPerParticipant = 0,
        location = 'single',
        duration_days = 1,
        priority = false,
        bundle_quantity = 1
    } = options;

    let breakdown = {
        sku_type: sku.id,
        sku_name: sku.name,
        brand_cost: 0,
        reward_pool: 0,
        platform_fee: 0,
        ops_buffer: 0,
        total: 0,
        gross_margin_percent: 0
    };

    // Calculate based on SKU type
    switch (skuType) {
        case 'A1_COMMUNITY':
            breakdown.brand_cost = Math.min(sku.brandCostRange.max, participants * 2); // $2 per participant, capped
            breakdown.platform_fee = Math.min(sku.platformFeeRange.max, breakdown.brand_cost * 0.20);
            breakdown.reward_pool = rewardPerParticipant * participants;
            break;

        case 'A2_ACTIVATION':
            // Base cost scales with participants
            const baseCost = Math.min(sku.brandCostRange.max, 250 + (participants * 5));
            breakdown.brand_cost = baseCost;
            breakdown.reward_pool = Math.max(sku.rewardPoolRange.min, Math.min(sku.rewardPoolRange.max, rewardPerParticipant * participants));
            breakdown.platform_fee = baseCost * 0.25; // 25% platform fee
            breakdown.ops_buffer = baseCost * 0.10; // 10% ops buffer
            break;

        case 'A3_BOUNTY':
            // Distributed model - scales with executions
            const executionCost = participants * (rewardPerParticipant + 10); // $10 overhead per execution
            breakdown.brand_cost = Math.max(sku.brandCostRange.min, Math.min(sku.brandCostRange.max, executionCost));
            breakdown.platform_fee = breakdown.brand_cost * sku.platformFeePercent;
            breakdown.reward_pool = participants * rewardPerParticipant;
            break;

        case 'A4_MERCHANT':
            // Monthly recurring
            const momentsIncluded = Math.max(sku.momentsIncludedRange.min, Math.min(sku.momentsIncludedRange.max, bundle_quantity));
            breakdown.brand_cost = sku.monthlyCostRange.min + (momentsIncluded * 50); // $50 per additional moment
            breakdown.platform_fee = 0; // Included in monthly cost
            breakdown.reward_pool = rewardPerParticipant * participants * momentsIncluded;
            breakdown.moments_included = momentsIncluded;
            break;

        case 'A5_DIGITAL':
            // Digital has lower overhead
            breakdown.brand_cost = Math.min(sku.brandCostRange.max, 150 + (participants * 3));
            breakdown.platform_fee = breakdown.brand_cost * 0.40; // Higher margin for digital
            breakdown.reward_pool = rewardPerParticipant * participants;
            break;

        case 'S1_BUNDLE':
            // Bundle discount logic
            const tier = bundle_quantity >= 50 ? 'bundle_50' : bundle_quantity >= 10 ? 'bundle_10' : 'bundle_5';
            const bundleConfig = sku.tiers[tier];
            const basePerMoment = 500; // Average Moment cost
            breakdown.brand_cost = basePerMoment * bundle_quantity * (1 - bundleConfig.discount);
            breakdown.platform_fee = breakdown.brand_cost * 0.25;
            breakdown.discount_applied = bundleConfig.discount;
            breakdown.quantity = bundle_quantity;
            break;

        case 'S2_REPLICATION':
            // Replication fee + discounted per-location
            breakdown.brand_cost = sku.replicationFeeRange.min + (participants * 8); // $8 per location
            breakdown.platform_fee = breakdown.brand_cost * 0.20;
            break;

        case 'S3_PRIORITY':
            // Add-on pricing
            breakdown.brand_cost = 0; // Base Moment cost calculated separately
            breakdown.priority_matching_fee = sku.priorityMatchingFeeRange.min;
            breakdown.verification_sla_fee = sku.verificationSLAFeeRange.min;
            breakdown.platform_fee = (breakdown.priority_matching_fee + breakdown.verification_sla_fee) * 0.30;
            break;

        default:
            throw new Error(`Unsupported SKU type: ${skuType}`);
    }

    // Calculate total
    breakdown.total = breakdown.brand_cost + breakdown.reward_pool + breakdown.platform_fee + (breakdown.ops_buffer || 0);

    // Calculate gross margin
    const revenue = breakdown.platform_fee + (breakdown.ops_buffer || 0);
    breakdown.gross_margin_percent = breakdown.total > 0 ? (revenue / breakdown.total * 100).toFixed(2) : 0;

    return breakdown;
}

/**
 * Validate if brand is eligible for a SKU
 */
async function validateSKUEligibility(brandId, skuType) {
    const sku = getSKUPricing(skuType);

    // If no unlock conditions, always eligible
    if (!sku.unlockConditions) {
        return { eligible: true };
    }

    if (!supabase) {
        // Mock mode - always eligible
        return { eligible: true };
    }

    try {
        const conditions = sku.unlockConditions;

        // Check minimum successful moments
        if (conditions.min_successful_moments) {
            const { count, error } = await supabase
                .from('moments')
                .select('*', { count: 'exact', head: true })
                .eq('sponsor_id', brandId)
                .eq('status', 'closed')
                .gte('participant_count', 1);

            if (error) throw error;

            if (count < conditions.min_successful_moments) {
                return {
                    eligible: false,
                    reason: `Requires at least ${conditions.min_successful_moments} successful Moment(s). You have ${count}.`,
                    unlock_requirement: 'Complete more Moments to unlock this SKU.'
                };
            }
        }

        // Check verified outcomes
        if (conditions.verified_outcomes_required) {
            const { data: moments, error } = await supabase
                .from('moments')
                .select('id, record_hash')
                .eq('sponsor_id', brandId)
                .not('record_hash', 'is', null);

            if (error) throw error;

            if (!moments || moments.length === 0) {
                return {
                    eligible: false,
                    reason: 'Requires verified outcomes from previous Moments.',
                    unlock_requirement: 'Complete and verify at least one Moment.'
                };
            }
        }

        return { eligible: true };
    } catch (error) {
        console.error('[Moment Pricing] Error validating SKU eligibility:', error);
        // Fail open for now
        return { eligible: true };
    }
}

/**
 * Apply bundle discount based on quantity
 */
function applyBundleDiscount(basePrice, quantity) {
    let discount = 0;

    if (quantity >= 50) {
        discount = 0.20; // 20% for 50+
    } else if (quantity >= 10) {
        discount = 0.15; // 15% for 10-49
    } else if (quantity >= 5) {
        discount = 0.10; // 10% for 5-9
    }

    const discountedPrice = basePrice * (1 - discount);

    return {
        original_price: basePrice,
        discount_percent: discount * 100,
        discount_amount: basePrice - discountedPrice,
        final_price: discountedPrice,
        quantity
    };
}

/**
 * Get all available SKUs for a brand
 */
async function getAvailableSKUs(brandId) {
    const available = [];

    for (const [key, sku] of Object.entries(SKU_CATALOG)) {
        const eligibility = await validateSKUEligibility(brandId, key);

        available.push({
            sku_type: key,
            ...sku,
            eligible: eligibility.eligible,
            unlock_requirement: eligibility.unlock_requirement || null
        });
    }

    return available;
}

/**
 * Estimate Moment ROI for brand
 */
function estimateMomentROI(skuType, options = {}) {
    const pricing = calculateMomentCost(skuType, options);
    const { participants = 50, estimated_conversion_rate = 0.10 } = options;

    const estimated_conversions = Math.floor(participants * estimated_conversion_rate);
    const cost_per_conversion = pricing.total / estimated_conversions;

    return {
        total_cost: pricing.total,
        estimated_participants: participants,
        estimated_conversions,
        cost_per_conversion: cost_per_conversion.toFixed(2),
        cost_per_participant: (pricing.total / participants).toFixed(2),
        breakdown: pricing
    };
}

/**
 * Map technical SKUs to high-conversion commercial packages
 * This implements the FlashCreate Alignment Layer.
 */
function getCommercialPackages() {
    return [
        {
            id: 'hero',
            name: '100 Real People Campaign',
            headline: '100 Real People in 5 Days',
            description: 'We get 100 verified locals to interact with your brand.',
            price_anchor_jmd: 25000,
            usd_equivalent: 160,
            duration_days: 5,
            includes: [
                '100 Verified actions (Actions/Moves)',
                '10-20 UGC pieces (optional)',
                '1 Structured campaign (A5 Digital)',
                'Proof dashboard'
            ],
            internal_mapping: {
                sku_type: 'A5_DIGITAL',
                participants: 100
            }
        },
        {
            id: 'core',
            name: 'Customer Activation Campaign',
            headline: 'Drive Foot Traffic & Trials',
            description: 'Intensive activation to drive real people to your location.',
            price_anchor_jmd: 120000,
            usd_equivalent: 750,
            duration_days: 14,
            includes: [
                '500-1,000 Verified actions',
                'Multi-day activation',
                'UGC + Engagement mix',
                'Location targeting',
                'Advanced reporting'
            ],
            internal_mapping: {
                sku_type: 'A2_ACTIVATION',
                participants: 500
            }
        },
        {
            id: 'enterprise',
            name: 'Always-On Attention System',
            headline: 'Dominant Market Presence',
            description: 'Recurring growth engine for venues and established brands.',
            price_anchor_jmd: 350000, // Starting at
            usd_equivalent: 2200,
            duration_days: 30,
            includes: [
                'Weekly recurring activations',
                'Strategic account manager',
                'Premium creator matching',
                'Full outcome verification'
            ],
            internal_mapping: {
                sku_type: 'A4_MERCHANT',
                bundle_quantity: 4
            }
        }
    ];
}

module.exports = {
    SKU_CATALOG,
    getSKUPricing,
    calculateMomentCost,
    validateSKUEligibility,
    applyBundleDiscount,
    getAvailableSKUs,
    estimateMomentROI,
    getCommercialPackages
};
