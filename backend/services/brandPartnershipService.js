/**
 * BRAND PARTNERSHIP MATCHING SERVICE
 * 
 * Matches creators with brands based on demographic alignment,
 * content compatibility, and partnership history
 */

const { supabase } = require('../lib/supabase');

// ============================================
// BRAND PARTNERSHIP SERVICE
// ============================================

const BrandPartnershipService = {
    
    /**
     * Calculate compatibility score between creator and brand/campaign
     */
    async calculateCompatibilityScore(creatorId, brandOrCampaignId, options = {}) {
        const { isCampaign = false, detailed = false } = options;
        
        try {
            // Fetch creator demographics and content data
            const { data: creator } = await supabase
                .from('users')
                .select(`
                    id,
                    display_name,
                    preferences,
                    location_data,
                    points_balance,
                    user_demographics(*),
                    content_stats:content_items(count)
                `)
                .eq('id', creatorId)
                .single();
            
            if (!creator) {
                return { score: 0, error: 'Creator not found' };
            }
            
            // Fetch brand/campaign data
            let targetData;
            if (isCampaign) {
                const { data: campaign } = await supabase
                    .from('advertiser_campaigns')
                    .select(`
                        *,
                        advertiser:advertiser_id(id, name, vertical, brand_values)
                    `)
                    .eq('id', brandOrCampaignId)
                    .single();
                targetData = campaign;
            } else {
                const { data: brand } = await supabase
                    .from('advertiser_profiles')
                    .select('*')
                    .eq('id', brandOrCampaignId)
                    .single();
                targetData = brand;
            }
            
            if (!targetData) {
                return { score: 0, error: 'Brand/Campaign not found' };
            }
            
            // Calculate individual compatibility scores
            const scores = {
                demographic: await this.calculateDemographicCompatibility(creator, targetData),
                content: await this.calculateContentCompatibility(creator, targetData),
                values: await this.calculateValuesCompatibility(creator, targetData),
                performance: await this.calculatePerformanceCompatibility(creator, targetData),
                history: await this.calculatePartnershipHistory(creatorId, targetData)
            };
            
            // Weighted total score
            const weights = {
                demographic: 0.25,
                content: 0.30,
                values: 0.15,
                performance: 0.20,
                history: 0.10
            };
            
            const totalScore = Math.round(
                scores.demographic * weights.demographic +
                scores.content * weights.content +
                scores.values * values.weights +
                scores.performance * weights.performance +
                scores.history * weights.history
            );
            
            const result = {
                score: totalScore,
                tier: this.getCompatibilityTier(totalScore),
                breakdown: scores
            };
            
            if (detailed) {
                result.recommendations = this.generateRecommendations(creator, targetData, scores);
                result.matchedAttributes = this.getMatchedAttributes(creator, targetData);
                result.mismatchedAttributes = this.getMismatchedAttributes(creator, targetData, scores);
            }
            
            return result;
            
        } catch (error) {
            console.error('[BrandPartnership] Error calculating compatibility:', error);
            return { score: 0, error: error.message };
        }
    },
    
    /**
     * Calculate demographic alignment score (0-100)
     */
    async calculateDemographicCompatibility(creator, target) {
        const demographics = creator.user_demographics || {};
        const targetAudience = target.target_audience || {};
        
        if (!targetAudience || Object.keys(targetAudience).length === 0) {
            return 50; // Neutral if no targeting set
        }
        
        let score = 0;
        let factors = 0;
        
        // Age match
        if (targetAudience.age_min || targetAudience.age_max) {
            factors++;
            if (demographics.birthday) {
                const age = this.calculateAge(demographics.birthday);
                if ((!targetAudience.age_min || age >= targetAudience.age_min) &&
                    (!targetAudience.age_max || age <= targetAudience.age_max)) {
                    score += 100;
                } else {
                    // Partial credit for near match
                    const minDiff = targetAudience.age_min ? Math.abs(age - targetAudience.age_min) : 0;
                    const maxDiff = targetAudience.age_max ? Math.abs(age - targetAudience.age_max) : 0;
                    const diff = Math.max(minDiff, maxDiff);
                    score += Math.max(0, 100 - (diff * 5));
                }
            }
        }
        
        // Gender match
        if (targetAudience.gender?.length > 0) {
            factors++;
            if (targetAudience.gender.includes(demographics.gender)) {
                score += 100;
            }
        }
        
        // Marital status match
        if (targetAudience.marital_status?.length > 0) {
            factors++;
            if (targetAudience.marital_status.includes(demographics.marital_status)) {
                score += 100;
            }
        }
        
        // Parent status
        if (targetAudience.has_children !== undefined) {
            factors++;
            if (demographics.has_children === targetAudience.has_children) {
                score += 100;
            }
        }
        
        // Location match
        if (targetAudience.countries?.length > 0) {
            factors++;
            const creatorCountry = creator.location_data?.country;
            if (creatorCountry && targetAudience.countries.includes(creatorCountry)) {
                score += 100;
            }
        }
        
        // Income match
        if (targetAudience.household_income?.length > 0) {
            factors++;
            if (targetAudience.household_income.includes(demographics.household_income)) {
                score += 100;
            }
        }
        
        return factors > 0 ? Math.round(score / factors) : 50;
    },
    
    /**
     * Calculate content niche alignment score (0-100)
     */
    async calculateContentCompatibility(creator, target) {
        const demographics = creator.user_demographics || {};
        const creatorNiches = demographics.content_niches || [];
        const targetNiches = target.target_audience?.content_niches || 
                            target.vertical ? [target.vertical] : [];
        
        if (targetNiches.length === 0) {
            return 50; // Neutral if no niches specified
        }
        
        if (creatorNiches.length === 0) {
            return 30; // Low score if creator has no niches defined
        }
        
        // Calculate overlap
        const matches = creatorNiches.filter(n => targetNiches.includes(n));
        const matchPercentage = (matches.length / targetNiches.length) * 100;
        
        // Bonus for primary niche match
        const primaryNiche = creatorNiches[0];
        const primaryMatch = targetNiches.includes(primaryNiche);
        
        let score = matchPercentage;
        if (primaryMatch) score += 20;
        
        return Math.min(100, Math.round(score));
    },
    
    /**
     * Calculate brand values alignment (0-100)
     */
    async calculateValuesCompatibility(creator, target) {
        const brandValues = target.advertiser?.brand_values || target.brand_values || [];
        
        if (brandValues.length === 0) {
            return 50;
        }
        
        // This would ideally check creator's past content for value alignment
        // For now, return neutral
        return 60;
    },
    
    /**
     * Calculate performance-based compatibility (0-100)
     */
    async calculatePerformanceCompatibility(creator, target) {
        const targetAudience = target.target_audience || {};
        let score = 50;
        
        // Check follower count requirements
        if (targetAudience.follower_count) {
            const followerCount = creator.preferences?.follower_count || 0;
            const tier = targetAudience.follower_count;
            
            const tierRanges = {
                'nano': [1000, 10000],
                'micro': [10000, 50000],
                'mid': [50000, 200000],
                'macro': [200000, 1000000],
                'mega': [1000000, Infinity]
            };
            
            const [min, max] = tierRanges[tier] || [0, Infinity];
            
            if (followerCount >= min && (max === Infinity || followerCount <= max)) {
                score = 100;
            } else if (followerCount >= min * 0.8) {
                score = 80; // Close but not quite
            } else {
                score = 40;
            }
        }
        
        // Check engagement rate
        if (targetAudience.engagement_rate) {
            const creatorER = creator.preferences?.engagement_rate || 0;
            if (creatorER >= targetAudience.engagement_rate) {
                score = Math.min(100, score + 20);
            }
        }
        
        return score;
    },
    
    /**
     * Calculate partnership history score (0-100)
     */
    async calculatePartnershipHistory(creatorId, target) {
        try {
            const advertiserId = target.advertiser_id || target.id;
            
            // Check for past partnerships
            const { data: pastPartnerships } = await supabase
                .from('drop_applications')
                .select('*')
                .eq('creator_id', creatorId)
                .eq('advertiser_id', advertiserId)
                .limit(5);
            
            if (!pastPartnerships || pastPartnerships.length === 0) {
                return 50; // No history - neutral
            }
            
            // Calculate average performance
            const approvedCount = pastPartnerships.filter(p => p.status === 'approved').length;
            const successRate = (approvedCount / pastPartnerships.length) * 100;
            
            if (successRate >= 80) {
                return 100; // Excellent history
            } else if (successRate >= 50) {
                return 80; // Good history
            } else {
                return 60; // Mixed history
            }
            
        } catch (error) {
            return 50;
        }
    },
    
    /**
     * Get compatibility tier
     */
    getCompatibilityTier(score) {
        if (score >= 90) return 'perfect';
        if (score >= 75) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    },
    
    /**
     * Find matching creators for a brand/campaign
     */
    async findMatchingCreators(brandOrCampaignId, options = {}) {
        const { 
            isCampaign = false,
            minScore = 60,
            limit = 20,
            offset = 0,
            sortBy = 'score'
        } = options;
        
        try {
            // Get target data
            let targetData;
            if (isCampaign) {
                const { data: campaign } = await supabase
                    .from('advertiser_campaigns')
                    .select(`*, advertiser:advertiser_id(*)`)
                    .eq('id', brandOrCampaignId)
                    .single();
                targetData = campaign;
            } else {
                const { data: brand } = await supabase
                    .from('advertiser_profiles')
                    .select('*')
                    .eq('id', brandOrCampaignId)
                    .single();
                targetData = brand;
            }
            
            if (!targetData) {
                return { creators: [], error: 'Brand/Campaign not found' };
            }
            
            // Get potential creators (those who match basic targeting)
            const targetAudience = targetData.target_audience || {};
            
            // Build query based on targeting
            let query = supabase
                .from('users')
                .select(`
                    id,
                    display_name,
                    username,
                    avatar_url,
                    bio,
                    preferences,
                    location_data,
                    user_demographics(*)
                `)
                .eq('is_active', true)
                .eq('is_creator', true);
            
            // Apply basic filters to reduce result set
            if (targetAudience.gender?.length > 0) {
                // Will filter in memory for complex cases
            }
            
            if (targetAudience.countries?.length > 0) {
                query = query.in('location_data->>country', targetAudience.countries);
            }
            
            const { data: potentialCreators, error } = await query.limit(200);
            
            if (error) throw error;
            
            // Calculate scores for each creator
            const scoredCreators = await Promise.all(
                (potentialCreators || []).map(async (creator) => {
                    const scoreResult = await this.calculateCompatibilityScore(
                        creator.id, 
                        brandOrCampaignId, 
                        { isCampaign, detailed: false }
                    );
                    return {
                        ...creator,
                        compatibility_score: scoreResult.score,
                        tier: scoreResult.tier,
                        breakdown: scoreResult.breakdown
                    };
                })
            );
            
            // Filter by minimum score and sort
            const filteredCreators = scoredCreators
                .filter(c => c.compatibility_score >= minScore)
                .sort((a, b) => {
                    if (sortBy === 'score') return b.compatibility_score - a.compatibility_score;
                    return 0;
                });
            
            const total = filteredCreators.length;
            const paginated = filteredCreators.slice(offset, offset + limit);
            
            return {
                creators: paginated,
                total,
                has_more: offset + limit < total
            };
            
        } catch (error) {
            console.error('[BrandPartnership] Error finding matching creators:', error);
            return { creators: [], error: error.message };
        }
    },
    
    /**
     * Find matching brands for a creator
     */
    async findMatchingBrands(creatorId, options = {}) {
        const { 
            minScore = 60,
            limit = 20,
            offset = 0,
            verticals = []
        } = options;
        
        try {
            // Get creator data
            const { data: creator } = await supabase
                .from('users')
                .select(`
                    id,
                    user_demographics(*)
                `)
                .eq('id', creatorId)
                .single();
            
            if (!creator) {
                return { brands: [], error: 'Creator not found' };
            }
            
            // Get active campaigns
            let query = supabase
                .from('advertiser_campaigns')
                .select(`
                    *,
                    advertiser:advertiser_id(id, name, logo_url, vertical)
                `)
                .eq('status', 'active');
            
            if (verticals.length > 0) {
                query = query.in('advertiser.vertical', verticals);
            }
            
            const { data: campaigns, error } = await query.limit(100);
            
            if (error) throw error;
            
            // Calculate scores
            const scoredCampaigns = await Promise.all(
                (campaigns || []).map(async (campaign) => {
                    const scoreResult = await this.calculateCompatibilityScore(
                        creatorId,
                        campaign.id,
                        { isCampaign: true, detailed: false }
                    );
                    return {
                        ...campaign,
                        compatibility_score: scoreResult.score,
                        tier: scoreResult.tier,
                        breakdown: scoreResult.breakdown
                    };
                })
            );
            
            // Filter and sort
            const filtered = scoredCampaigns
                .filter(c => c.compatibility_score >= minScore)
                .sort((a, b) => b.compatibility_score - a.compatibility_score);
            
            const total = filtered.length;
            const paginated = filtered.slice(offset, offset + limit);
            
            return {
                brands: paginated,
                total,
                has_more: offset + limit < total
            };
            
        } catch (error) {
            console.error('[BrandPartnership] Error finding matching brands:', error);
            return { brands: [], error: error.message };
        }
    },
    
    /**
     * Generate recommendations based on compatibility gaps
     */
    generateRecommendations(creator, target, scores) {
        const recommendations = [];
        const demographics = creator.user_demographics || {};
        
        if (scores.demographic < 60) {
            recommendations.push({
                type: 'demographic',
                priority: 'high',
                message: 'Update your demographic profile to match more opportunities',
                action: 'complete_profile'
            });
        }
        
        if (scores.content < 60) {
            const targetVertical = target.vertical || target.advertiser?.vertical;
            recommendations.push({
                type: 'content',
                priority: 'medium',
                message: `Consider adding ${targetVertical} to your content niches`,
                action: 'update_niches'
            });
        }
        
        if (scores.performance < 60 && scores.performance > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'low',
                message: 'Your follower count is below the ideal range for this opportunity',
                action: 'grow_audience'
            });
        }
        
        return recommendations;
    },
    
    /**
     * Get matched attributes
     */
    getMatchedAttributes(creator, target) {
        const matches = [];
        const demographics = creator.user_demographics || {};
        const targetAudience = target.target_audience || {};
        
        if (targetAudience.content_niches) {
            const nicheMatches = demographics.content_niches?.filter(n => 
                targetAudience.content_niches.includes(n)
            ) || [];
            if (nicheMatches.length > 0) {
                matches.push({ type: 'niche', values: nicheMatches });
            }
        }
        
        if (targetAudience.gender?.includes(demographics.gender)) {
            matches.push({ type: 'gender', value: demographics.gender });
        }
        
        if (targetAudience.has_children === demographics.has_children) {
            matches.push({ type: 'parent_status', value: demographics.has_children ? 'parent' : 'non-parent' });
        }
        
        return matches;
    },
    
    /**
     * Get mismatched attributes
     */
    getMismatchedAttributes(creator, target, scores) {
        const mismatches = [];
        
        if (scores.demographic < 80) {
            mismatches.push({
                type: 'demographic',
                message: 'Some demographic criteria do not align'
            });
        }
        
        if (scores.content < 80) {
            mismatches.push({
                type: 'content',
                message: 'Content niches do not fully overlap'
            });
        }
        
        return mismatches;
    },
    
    /**
     * Calculate age from birthday
     */
    calculateAge(birthDate) {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },
    
    /**
     * Record a partnership match view/interaction
     */
    async recordMatchInteraction(creatorId, campaignId, interactionType) {
        try {
            await supabase
                .from('brand_match_interactions')
                .insert({
                    creator_id: creatorId,
                    campaign_id: campaignId,
                    interaction_type: interactionType, // 'viewed', 'saved', 'applied', 'ignored'
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('[BrandPartnership] Error recording interaction:', error);
        }
    }
};

module.exports = BrandPartnershipService;
