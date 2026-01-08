/**
 * PROMORANG PRICING AUTHORITY — v2
 * Central source of truth for all subscription tiers, Move limits, and economic rules.
 * No feature, copy, or workflow may bypass these rules.
 */

// ============================================================================
// CREATOR (USER) SUBSCRIPTION TIERS
// ============================================================================

const CREATOR_TIERS = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 0,
        billingInterval: 'monthly',
        purpose: 'Liquidity and habit formation',
        features: [
            'Access to public Drops',
            'Limited daily Move participation',
            'Earn Gems via interactions, Proof Drops, challenges, PromoShare',
            'Basic analytics',
        ],
        constraints: {
            promoKeysLimited: true,
            monthlyGemCeiling: 300,
            withdrawalsEnabled: false,
        },
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        price: 10,
        billingInterval: 'monthly',
        purpose: 'Higher participation velocity',
        features: [
            'Increased daily participation',
            'Weekly PromoKeys',
            'Priority Drop access',
            'Improved Proof weight',
            'Advanced analytics',
        ],
        constraints: {
            promoKeysLimited: false,
            monthlyGemCeiling: null,
            withdrawalsEnabled: true,
        },
    },
    power_user: {
        id: 'power_user',
        name: 'Power User',
        price: 30,
        billingInterval: 'monthly',
        purpose: 'System drivers',
        features: [
            'Maximum participation limits',
            'Full PromoKey access',
            'Master Key eligibility after Proof thresholds',
            'Leaderboard multipliers',
            'Highest PromoShare yield',
        ],
        constraints: {
            promoKeysLimited: false,
            monthlyGemCeiling: null,
            withdrawalsEnabled: true,
            masterKeyEligible: true,
        },
    },
};

// ============================================================================
// ADVERTISER SUBSCRIPTION TIERS (Move-Based)
// ============================================================================

const ADVERTISER_TIERS = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        billingInterval: 'monthly',
        purpose: 'Education and sandbox testing',
        moves: {
            amount: 50,
            period: 'month',
        },
        inventory: {
            proofDrops: 5,
            paidDrops: 0,
        },
        features: [
            '50 Moves / month',
            '5 Proof Drops',
            'Basic analytics',
        ],
        restrictions: {
            promoShareEnabled: false,
            leaderboardPlacement: false,
        },
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 50,
        billingInterval: 'monthly',
        purpose: 'Micro-activation',
        moves: {
            amount: 100,
            period: 'month',
        },
        inventory: {
            proofDrops: 8,
            paidDrops: 2,
        },
        features: [
            '100 Moves / month',
            '8 Proof Drops',
            '2 Paid Drops',
        ],
        restrictions: {
            promoShareEnabled: false,
            leaderboardPlacement: false,
        },
    },
    growth: {
        id: 'growth',
        name: 'Growth',
        price: 300,
        billingInterval: 'monthly',
        purpose: 'Repeatable engagement',
        moves: {
            amount: 200,
            period: 'week',
        },
        inventory: {
            proofDrops: 15,
            paidDrops: 8,
        },
        features: [
            '200 Moves / week',
            '15 Proof Drops',
            '8 Paid Drops',
            'Advanced analytics',
            'Audience targeting tools',
        ],
        restrictions: {
            promoShareEnabled: true,
            leaderboardPlacement: false,
        },
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        price: 900,
        billingInterval: 'monthly',
        purpose: 'Attention dominance',
        moves: {
            amount: 500,
            period: 'week',
        },
        inventory: {
            proofDrops: 25,
            paidDrops: 15,
        },
        features: [
            '500 Moves / week',
            '25 Proof Drops',
            '15 Paid Drops',
            'Premium analytics + reporting',
            'Dedicated success manager',
            'Priority PromoKey distribution',
            'Leaderboard incentive targeting',
        ],
        restrictions: {
            promoShareEnabled: true,
            leaderboardPlacement: true,
        },
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: null, // Custom pricing
        billingInterval: 'custom',
        purpose: 'Ecosystem anchoring',
        moves: {
            amount: null, // Custom-defined
            period: 'custom',
        },
        inventory: {
            proofDrops: null, // Custom
            paidDrops: null, // Custom
        },
        features: [
            'Custom-defined Move pools',
            'Custom Drop limits',
            'Dedicated account team',
            'Custom integrations',
            'API access',
            'White-label options',
        ],
        restrictions: {
            promoShareEnabled: true,
            leaderboardPlacement: true,
        },
        isCustom: true,
    },
};

// ============================================================================
// ESCROW & VERIFICATION RULES
// ============================================================================

const ESCROW_RULES = {
    // All Drops require Gem escrow at creation. No exceptions.
    escrowRequired: true,

    // Verification window in days
    verificationWindowDays: {
        min: 3,
        max: 5,
        default: 5,
    },

    // Promorang assumes verification authority if advertiser fails to verify
    autoVerificationEnabled: true,
};

// ============================================================================
// MOVE ENFORCEMENT RULES
// ============================================================================

const MOVE_RULES = {
    // Every engagement-requesting action consumes ≥1 Move
    minMoveCost: 1,

    // When Moves = 0, engagement campaigns are disabled
    hardBlockOnDepletion: true,

    // Moves reset only on billing cycle renewal or subscription upgrade
    resetTriggers: ['billing_renewal', 'subscription_upgrade', 'enterprise_override'],

    // Actions that CONSUME Moves (engagement on campaign content)
    moveConsumingActions: [
        'like',
        'comment',
        'share',
        'follow',
        'subscribe',
        'view',
        'engagement',
        'social_engagement',
    ],

    // Actions that do NOT consume Moves
    nonMoveActions: [
        'content_creation',
        'ugc_request',
        'content_clipping',
        'review',
        'affiliate_promotion',
        'product_promotion',
        'proof_drop', // unless it requires engagement
        'paid_drop',  // unless it requires engagement
    ],
};

// ============================================================================
// HELPERS
// ============================================================================

const getCreatorTier = (tierId) => CREATOR_TIERS[tierId] || CREATOR_TIERS.starter;
const getAdvertiserTier = (tierId) => ADVERTISER_TIERS[tierId] || ADVERTISER_TIERS.free;

const getCreatorTierList = () => Object.values(CREATOR_TIERS);
const getAdvertiserTierList = () => Object.values(ADVERTISER_TIERS);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    CREATOR_TIERS,
    ADVERTISER_TIERS,
    ESCROW_RULES,
    MOVE_RULES,
    getCreatorTier,
    getAdvertiserTier,
    getCreatorTierList,
    getAdvertiserTierList,
};
