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
        externalLabel: 'Free: Earn from simple social actions',
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
        externalLabel: 'Pro: Get priority access and withdraw earnings',
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
        externalLabel: 'Power User: Maximize earnings and access high-value campaigns',
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
        name: 'Free (Launch Your Own)',
        externalLabel: 'Launch Your Own Campaign',
        price: 0,
        jmdAnchor: 'JMD $5K - $25K',
        billingInterval: 'monthly',
        purpose: 'Self-serve / Education and sandbox testing',
        moves: {
            amount: 50,
            period: 'month',
        },
        inventory: {
            proofDrops: 5,
            paidDrops: 0,
        },
        features: [
            '50 Actions from real people / month',
            '5 Proof Campaigns',
            'Basic analytics',
            'Self-serve campaign builder',
        ],
        restrictions: {
            promoShareEnabled: false,
            leaderboardPlacement: false,
        },
    },
    starter: {
        id: 'starter',
        name: 'Hero Offer (100 Real People)',
        externalLabel: '100 Real People Campaign',
        price: 50, // Approx $160 USD mapping to JMD $25K
        jmdAnchor: 'JMD $25,000',
        billingInterval: 'single', // Effectively a 5-day hero burst
        purpose: 'Hero Entry / 100 people in 5 days',
        moves: {
            amount: 100,
            period: 'campaign',
        },
        inventory: {
            proofDrops: 8,
            paidDrops: 2,
        },
        features: [
            '100 Verified actions (likes/comments/shares/visits)',
            '10-20 UGC pieces (optional)',
            '1 Digital Moment activation',
            'Verification Dashboard',
        ],
        restrictions: {
            promoShareEnabled: false,
            leaderboardPlacement: false,
        },
    },
    growth: {
        id: 'growth',
        name: 'Core Offer (Customer Activation)',
        externalLabel: 'Customer Activation Campaign',
        price: 750, // Approx JMD $120K
        jmdAnchor: 'JMD $120,000',
        billingInterval: 'monthly',
        purpose: 'Repeatable engine / 500-1,000 actions',
        moves: {
            amount: 500,
            period: 'week',
        },
        inventory: {
            proofDrops: 15,
            paidDrops: 8,
        },
        features: [
            '500-1,000 Verified actions',
            'UGC + Engagement mix',
            'Bounty Moment (Distributed)',
            'Location & Interest targeting',
            'Advanced performance reporting',
        ],
        restrictions: {
            promoShareEnabled: true,
            leaderboardPlacement: false,
        },
    },
    premium: {
        id: 'premium',
        name: 'High-Ticket (Attention System)',
        externalLabel: 'Always-On Attention System',
        price: 2500, // Approx starting at JMD $350K+
        jmdAnchor: 'JMD $350,000 - $900,000+',
        billingInterval: 'monthly',
        purpose: 'Attention dominance / Continuous engagement',
        moves: {
            amount: 2000,
            period: 'week',
        },
        inventory: {
            proofDrops: 25,
            paidDrops: 15,
        },
        features: [
            'Continuous "Always-On" social presence',
            'Recurring Merchant Moments',
            'Full Creator Network access',
            'Event & Digital ecosystem integration',
            'Dedicated Strategic Account Manager',
            'Monthly outcome-driven reporting',
        ],
        restrictions: {
            promoShareEnabled: true,
            leaderboardPlacement: true,
        },
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise Ecosystem',
        externalLabel: 'Custom Ecosystem Anchoring',
        price: null, // Custom pricing
        jmdAnchor: 'Custom Quote',
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
