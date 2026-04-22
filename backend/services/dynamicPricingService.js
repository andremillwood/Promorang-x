/**
 * DYNAMIC PRICING SERVICE
 * 
 * Adjusts pricing and promotions based on user demographics and context
 */

const { supabase } = require('../lib/supabase');

// ============================================
// PRICING RULES BY SEGMENT
// ============================================

const PRICING_RULES = {
    // Student discounts
    student: {
        identifiers: {
            education_level: ['high_school', 'some_college', 'bachelors', 'masters', 'doctorate'],
            work_schedule: ['unemployed', 'flexible']
        },
        discounts: {
            campaign_entry: 0.20, // 20% off
            product_purchase: 0.15,
            subscription: 0.25
        },
        labels: ['Student Discount', '🎓 Student Special'],
        max_discount: 0.30
    },
    
    // Military/Veteran discounts (if we had that data)
    // New parent discounts
    new_parent: {
        identifiers: {
            has_children: true,
            children_ages: [0, 1] // Has child 0-1 years
        },
        discounts: {
            campaign_entry: 0.15,
            product_purchase: 0.20,
            subscription: 0.10
        },
        labels: ['New Parent Special', '👶 Parent Perk'],
        max_discount: 0.25
    },
    
    // Birthday month special
    birthday_month: {
        identifiers: {
            birthday_in_next_30_days: true
        },
        discounts: {
            campaign_entry: 0.25,
            product_purchase: 0.20,
            subscription: 0.15
        },
        labels: ['Birthday Month Special', '🎂 Birthday Perk'],
        max_discount: 0.30,
        bonus_gems: 50
    },
    
    // Loyalty tier bonuses
    loyalty: {
        tiers: {
            bronze: { min_points: 0, discount: 0.05, bonus_gems: 0 },
            silver: { min_points: 1000, discount: 0.10, bonus_gems: 25 },
            gold: { min_points: 5000, discount: 0.15, bonus_gems: 50 },
            platinum: { min_points: 15000, discount: 0.20, bonus_gems: 100 },
            diamond: { min_points: 50000, discount: 0.25, bonus_gems: 250 }
        }
    },
    
    // Seasonal promotions
    seasonal: {
        back_to_school: {
            months: [8, 9],
            applicable_niches: ['parenting', 'education'],
            discount: 0.15,
            label: '🎒 Back to School Special'
        },
        black_friday: {
            months: [11],
            days: [20, 30], // Nov 20-30
            discount: 0.30,
            label: '🛍️ Black Friday Deal'
        },
        summer_sale: {
            months: [6, 7, 8],
            discount: 0.20,
            label: '☀️ Summer Sale'
        },
        new_year: {
            months: [1],
            days: [1, 15],
            discount: 0.25,
            label: '🎆 New Year, New You'
        }
    },
    
    // First-time user bonuses
    new_user: {
        identifiers: {
            account_age_days: { max: 7 }
        },
        discounts: {
            first_campaign: 0.50, // 50% off first campaign
            first_purchase: 0.25
        },
        bonus_gems: 100,
        label: '🌟 Welcome Offer'
    },
    
    // High-value creator bonuses
    high_value_creator: {
        identifiers: {
            follower_count: { min: 100000 },
            engagement_rate: { min: 0.05 }
        },
        bonuses: {
            gems_per_campaign: 50,
            exclusive_access: true
        },
        label: '⭐ VIP Creator'
    }
};

// ============================================
// DYNAMIC PRICING SERVICE
// ============================================

const DynamicPricingService = {
    
    /**
     * Calculate personalized price for a user
     */
    async calculatePersonalizedPrice(userId, basePrice, productType, options = {}) {
        try {
            // Fetch user context
            const { data: userData } = await supabase
                .from('users')
                .select(`
                    id,
                    points_balance,
                    created_at,
                    preferences,
                    user_demographics(*)
                `)
                .eq('id', userId)
                .single();
            
            if (!userData) {
                return { price: basePrice, discount: 0, reason: 'User not found' };
            }
            
            const demographics = userData.user_demographics || {};
            const userContext = {
                ...demographics,
                points_balance: userData.points_balance,
                account_age_days: Math.floor((Date.now() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24)),
                follower_count: userData.preferences?.follower_count || 0,
                engagement_rate: userData.preferences?.engagement_rate || 0
            };
            
            // Calculate applicable discounts
            const applicableRules = this.findApplicableRules(userContext, productType);
            
            // Find best discount
            let bestDiscount = 0;
            let appliedRules = [];
            let bonusGems = 0;
            
            for (const rule of applicableRules) {
                const discount = rule.discount || 0;
                if (discount > bestDiscount) {
                    bestDiscount = discount;
                }
                appliedRules.push(rule);
                
                if (rule.bonus_gems) {
                    bonusGems += rule.bonus_gems;
                }
            }
            
            // Apply maximum discount cap
            const maxDiscount = Math.max(...applicableRules.map(r => r.max_discount || 0.50));
            bestDiscount = Math.min(bestDiscount, maxDiscount);
            
            // Calculate final price
            const discountAmount = basePrice * bestDiscount;
            const finalPrice = Math.max(0, basePrice - discountAmount);
            
            return {
                base_price: basePrice,
                final_price: finalPrice,
                discount_amount: discountAmount,
                discount_percentage: Math.round(bestDiscount * 100),
                applied_rules: appliedRules.map(r => ({
                    label: r.label,
                    discount: r.discount,
                    bonus_gems: r.bonus_gems
                })),
                bonus_gems: bonusGems,
                savings_message: this.generateSavingsMessage(bestDiscount, appliedRules),
                urgency: this.checkUrgency(appliedRules)
            };
            
        } catch (error) {
            console.error('[DynamicPricing] Error calculating price:', error);
            return { price: basePrice, discount: 0, error: error.message };
        }
    },
    
    /**
     * Find all applicable pricing rules for a user
     */
    findApplicableRules(userContext, productType) {
        const rules = [];
        
        // Check student discount
        if (this.matchesIdentifiers(userContext, PRICING_RULES.student.identifiers)) {
            const discount = PRICING_RULES.student.discounts[productType] || 0.10;
            rules.push({
                ...PRICING_RULES.student,
                discount,
                rule_type: 'segment'
            });
        }
        
        // Check new parent discount
        if (this.matchesIdentifiers(userContext, PRICING_RULES.new_parent.identifiers)) {
            const hasYoungChild = userContext.children_ages?.some(age => age <= 1);
            if (hasYoungChild) {
                const discount = PRICING_RULES.new_parent.discounts[productType] || 0.15;
                rules.push({
                    ...PRICING_RULES.new_parent,
                    discount,
                    rule_type: 'segment'
                });
            }
        }
        
        // Check birthday month
        if (userContext.birthday) {
            const birthday = new Date(userContext.birthday);
            const today = new Date();
            const daysUntil = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 30 && daysUntil >= 0) {
                const discount = PRICING_RULES.birthday_month.discounts[productType] || 0.20;
                rules.push({
                    ...PRICING_RULES.birthday_month,
                    discount,
                    rule_type: 'life_event',
                    days_until: daysUntil
                });
            }
        }
        
        // Check loyalty tier
        const loyaltyTier = this.getLoyaltyTier(userContext.points_balance);
        if (loyaltyTier) {
            rules.push({
                label: `${loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1)} Member`,
                discount: PRICING_RULES.loyalty.tiers[loyaltyTier].discount,
                bonus_gems: PRICING_RULES.loyalty.tiers[loyaltyTier].bonus_gems,
                rule_type: 'loyalty',
                tier: loyaltyTier
            });
        }
        
        // Check new user
        if (userContext.account_age_days <= 7) {
            const discount = PRICING_RULES.new_user.discounts[`first_${productType}`] || 0.25;
            rules.push({
                ...PRICING_RULES.new_user,
                discount,
                rule_type: 'new_user'
            });
        }
        
        // Check seasonal promotions
        const seasonalPromo = this.getSeasonalPromotion(userContext);
        if (seasonalPromo) {
            rules.push({
                ...seasonalPromo,
                rule_type: 'seasonal'
            });
        }
        
        // Check high-value creator
        if (this.matchesIdentifiers(userContext, PRICING_RULES.high_value_creator.identifiers)) {
            rules.push({
                ...PRICING_RULES.high_value_creator,
                discount: 0, // No discount but bonuses
                rule_type: 'creator_tier'
            });
        }
        
        return rules;
    },
    
    /**
     * Check if user matches rule identifiers
     */
    matchesIdentifiers(userContext, identifiers) {
        for (const [key, condition] of Object.entries(identifiers)) {
            const userValue = userContext[key];
            
            if (Array.isArray(condition)) {
                if (!condition.includes(userValue)) return false;
            } else if (typeof condition === 'object') {
                if (condition.min !== undefined && userValue < condition.min) return false;
                if (condition.max !== undefined && userValue > condition.max) return false;
            } else {
                if (userValue !== condition) return false;
            }
        }
        return true;
    },
    
    /**
     * Get loyalty tier based on points
     */
    getLoyaltyTier(points) {
        const tiers = PRICING_RULES.loyalty.tiers;
        
        if (points >= tiers.diamond.min_points) return 'diamond';
        if (points >= tiers.platinum.min_points) return 'platinum';
        if (points >= tiers.gold.min_points) return 'gold';
        if (points >= tiers.silver.min_points) return 'silver';
        return 'bronze';
    },
    
    /**
     * Get current seasonal promotion
     */
    getSeasonalPromotion(userContext) {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        for (const [key, promo] of Object.entries(PRICING_RULES.seasonal)) {
            // Check month
            if (promo.months && !promo.months.includes(month)) continue;
            
            // Check days
            if (promo.days) {
                const [startDay, endDay] = promo.days;
                if (day < startDay || day > endDay) continue;
            }
            
            // Check applicable niches
            if (promo.applicable_niches) {
                const userNiches = userContext.content_niches || [];
                const hasMatchingNiche = promo.applicable_niches.some(n => 
                    userNiches.includes(n)
                );
                if (!hasMatchingNiche) continue;
            }
            
            return promo;
        }
        
        return null;
    },
    
    /**
     * Generate savings message
     */
    generateSavingsMessage(discount, rules) {
        if (discount === 0) return null;
        
        const percentage = Math.round(discount * 100);
        
        if (rules.some(r => r.rule_type === 'new_user')) {
            return `🌟 Welcome! You're saving ${percentage}% as a new user!`;
        }
        
        if (rules.some(r => r.rule_type === 'birthday_month')) {
            return `🎂 Birthday month special! Save ${percentage}% on us!`;
        }
        
        if (rules.some(r => r.rule_type === 'loyalty')) {
            const tier = rules.find(r => r.rule_type === 'loyalty').tier;
            return `⭐ ${tier.charAt(0).toUpperCase() + tier.slice(1)} member discount: ${percentage}% off!`;
        }
        
        if (rules.some(r => r.rule_type === 'seasonal')) {
            const seasonal = rules.find(r => r.rule_type === 'seasonal');
            return `${seasonal.label}: ${percentage}% off!`;
        }
        
        return `💰 You're saving ${percentage}%!`;
    },
    
    /**
     * Check if discount creates urgency
     */
    checkUrgency(rules) {
        // New user offers expire
        if (rules.some(r => r.rule_type === 'new_user')) {
            return {
                is_urgent: true,
                reason: 'New user discount expires soon',
                expires_in_days: 7
            };
        }
        
        // Birthday month discount
        const birthdayRule = rules.find(r => r.rule_type === 'birthday_month');
        if (birthdayRule && birthdayRule.days_until !== undefined) {
            return {
                is_urgent: birthdayRule.days_until <= 3,
                reason: `Birthday in ${birthdayRule.days_until} days`,
                expires_in_days: birthdayRule.days_until
            };
        }
        
        // Seasonal offers
        if (rules.some(r => r.rule_type === 'seasonal')) {
            return {
                is_urgent: true,
                reason: 'Limited-time seasonal offer'
            };
        }
        
        return { is_urgent: false };
    },
    
    /**
     * Get available promotions for a user
     */
    async getAvailablePromotions(userId) {
        try {
            const { data: userData } = await supabase
                .from('users')
                .select(`
                    id,
                    points_balance,
                    created_at,
                    preferences,
                    user_demographics(*)
                `)
                .eq('id', userId)
                .single();
            
            const demographics = userData?.user_demographics || {};
            const userContext = {
                ...demographics,
                points_balance: userData?.points_balance || 0,
                account_age_days: Math.floor((Date.now() - new Date(userData?.created_at)) / (1000 * 60 * 60 * 24))
            };
            
            const promotions = [];
            
            // Check each promotion type
            if (this.matchesIdentifiers(userContext, PRICING_RULES.student.identifiers)) {
                promotions.push({
                    type: 'student_discount',
                    label: '🎓 Student Discount',
                    description: 'Save up to 20% on all campaigns',
                    discount: 0.20,
                    expires: null
                });
            }
            
            if (userContext.account_age_days <= 7) {
                promotions.push({
                    type: 'welcome_offer',
                    label: '🌟 Welcome Offer',
                    description: '50% off your first campaign entry',
                    discount: 0.50,
                    expires_in_days: 7 - userContext.account_age_days,
                    urgency: 'high'
                });
            }
            
            // Loyalty tier
            const tier = this.getLoyaltyTier(userContext.points_balance);
            if (tier !== 'bronze') {
                const tierData = PRICING_RULES.loyalty.tiers[tier];
                promotions.push({
                    type: 'loyalty_reward',
                    label: `⭐ ${tier.charAt(0).toUpperCase() + tier.slice(1)} Member`,
                    description: `${Math.round(tierData.discount * 100)}% off + ${tierData.bonus_gems} bonus gems`,
                    discount: tierData.discount,
                    bonus_gems: tierData.bonus_gems,
                    expires: null
                });
            }
            
            // Seasonal
            const seasonal = this.getSeasonalPromotion(userContext);
            if (seasonal) {
                promotions.push({
                    type: 'seasonal',
                    label: seasonal.label,
                    description: `Limited time: ${Math.round(seasonal.discount * 100)}% off`,
                    discount: seasonal.discount,
                    urgency: 'medium'
                });
            }
            
            return { promotions, count: promotions.length };
            
        } catch (error) {
            console.error('[DynamicPricing] Error getting promotions:', error);
            return { promotions: [], error: error.message };
        }
    },
    
    /**
     * Apply promotion code
     */
    async applyPromotionCode(userId, code, basePrice) {
        try {
            // Check if code exists and is valid
            const { data: promoCode } = await supabase
                .from('promotion_codes')
                .select('*')
                .eq('code', code.toUpperCase())
                .eq('is_active', true)
                .single();
            
            if (!promoCode) {
                return { success: false, error: 'Invalid promotion code' };
            }
            
            // Check expiration
            if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
                return { success: false, error: 'Promotion code has expired' };
            }
            
            // Check usage limits
            if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
                return { success: false, error: 'Promotion code limit reached' };
            }
            
            // Check user eligibility
            if (promoCode.target_demographics) {
                const { data: userDemo } = await supabase
                    .from('user_demographics')
                    .select('*')
                    .eq('user_id', userId)
                    .single();
                
                // Would need to implement eligibility check based on target_demographics
            }
            
            // Calculate discount
            let discount = 0;
            if (promoCode.discount_type === 'percentage') {
                discount = basePrice * (promoCode.discount_value / 100);
            } else {
                discount = promoCode.discount_value;
            }
            
            const finalPrice = Math.max(0, basePrice - discount);
            
            return {
                success: true,
                code: promoCode.code,
                discount_amount: discount,
                discount_percentage: promoCode.discount_type === 'percentage' ? promoCode.discount_value : null,
                final_price: finalPrice,
                message: promoCode.success_message || 'Promotion applied!'
            };
            
        } catch (error) {
            console.error('[DynamicPricing] Error applying code:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = DynamicPricingService;
