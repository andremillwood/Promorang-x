/**
 * DEMOGRAPHIC TARGETING SERVICE
 * 
 * Extends campaign targeting with demographic filters
 * Provides audience matching, compatibility scoring, and targeting recommendations
 */

const { supabase } = require('../lib/supabase');

// ============================================
// TARGETING CRITERIA DEFINITIONS
// ============================================

const TARGETING_CRITERIA = {
    // Demographics
    age_range: {
        label: 'Age Range',
        type: 'range',
        min: 13,
        max: 100,
        description: 'Target users within a specific age range'
    },
    gender: {
        label: 'Gender',
        type: 'multi_select',
        options: [
            { value: 'male', label: 'Male', emoji: '♂️' },
            { value: 'female', label: 'Female', emoji: '♀️' },
            { value: 'non_binary', label: 'Non-binary', emoji: '⚧' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say', emoji: '🤐' }
        ]
    },
    marital_status: {
        label: 'Relationship Status',
        type: 'multi_select',
        options: [
            { value: 'single', label: 'Single', emoji: '💃' },
            { value: 'dating', label: 'Dating', emoji: '💕' },
            { value: 'engaged', label: 'Engaged', emoji: '💍' },
            { value: 'married', label: 'Married', emoji: '👰' },
            { value: 'partnership', label: 'Domestic Partnership', emoji: '🤝' },
            { value: 'divorced', label: 'Divorced', emoji: '💔' },
            { value: 'widowed', label: 'Widowed', emoji: '🕊️' }
        ]
    },
    has_children: {
        label: 'Has Children',
        type: 'boolean',
        description: 'Target parents'
    },
    children_age_range: {
        label: 'Children Age Range',
        type: 'multi_select',
        options: [
            { value: '0-2', label: 'Infants (0-2)', emoji: '👶' },
            { value: '3-5', label: 'Toddlers (3-5)', emoji: '🧸' },
            { value: '6-12', label: 'Kids (6-12)', emoji: '🎮' },
            { value: '13-17', label: 'Teens (13-17)', emoji: '📱' },
            { value: '18+', label: 'Adult Children (18+)', emoji: '🎓' }
        ]
    },
    household_income: {
        label: 'Household Income',
        type: 'range',
        options: [
            { value: 'under_25k', label: 'Under $25,000', emoji: '💵' },
            { value: '25k_50k', label: '$25,000 - $50,000', emoji: '💵' },
            { value: '50k_75k', label: '$50,000 - $75,000', emoji: '💵💵' },
            { value: '75k_100k', label: '$75,000 - $100,000', emoji: '💵💵' },
            { value: '100k_150k', label: '$100,000 - $150,000', emoji: '💵💵💵' },
            { value: '150k_250k', label: '$150,000 - $250,000', emoji: '💵💵💵' },
            { value: 'over_250k', label: 'Over $250,000', emoji: '💰' }
        ]
    },
    education_level: {
        label: 'Education Level',
        type: 'multi_select',
        options: [
            { value: 'high_school', label: 'High School', emoji: '📚' },
            { value: 'some_college', label: 'Some College', emoji: '🎒' },
            { value: 'bachelors', label: 'Bachelor\'s Degree', emoji: '🎓' },
            { value: 'masters', label: 'Master\'s Degree', emoji: '🎓' },
            { value: 'doctorate', label: 'Doctorate', emoji: '🎓' },
            { value: 'trade_school', label: 'Trade School', emoji: '🔧' }
        ]
    },
    
    // Lifestyle & Interests
    fitness_level: {
        label: 'Fitness Level',
        type: 'multi_select',
        options: [
            { value: 'sedentary', label: 'Sedentary', emoji: '🛋️' },
            { value: 'light', label: 'Light Activity', emoji: '🚶' },
            { value: 'moderate', label: 'Moderate', emoji: '🏃' },
            { value: 'active', label: 'Active', emoji: '💪' },
            { value: 'athlete', label: 'Athlete', emoji: '🏆' }
        ]
    },
    dietary_preferences: {
        label: 'Dietary Preferences',
        type: 'multi_select',
        options: [
            { value: 'none', label: 'No Restrictions', emoji: '🍽️' },
            { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
            { value: 'vegan', label: 'Vegan', emoji: '🌱' },
            { value: 'keto', label: 'Keto', emoji: '🥩' },
            { value: 'gluten_free', label: 'Gluten-Free', emoji: '🌾' },
            { value: 'halal', label: 'Halal', emoji: '🥗' },
            { value: 'kosher', label: 'Kosher', emoji: '🍷' },
            { value: 'paleo', label: 'Paleo', emoji: '🍖' }
        ]
    },
    has_pets: {
        label: 'Pet Owner',
        type: 'boolean',
        description: 'Target pet owners'
    },
    pet_types: {
        label: 'Pet Types',
        type: 'multi_select',
        options: [
            { value: 'dog', label: 'Dog', emoji: '🐕' },
            { value: 'cat', label: 'Cat', emoji: '🐈' },
            { value: 'bird', label: 'Bird', emoji: '🦜' },
            { value: 'fish', label: 'Fish', emoji: '🐠' },
            { value: 'reptile', label: 'Reptile', emoji: '🦎' },
            { value: 'small_animal', label: 'Small Animal', emoji: '🐹' },
            { value: 'horse', label: 'Horse', emoji: '🐴' }
        ]
    },
    work_schedule: {
        label: 'Work Schedule',
        type: 'multi_select',
        options: [
            { value: 'day_shift', label: 'Day Shift', emoji: '☀️' },
            { value: 'night_shift', label: 'Night Shift', emoji: '🌙' },
            { value: 'weekends', label: 'Weekends', emoji: '📅' },
            { value: 'flexible', label: 'Flexible', emoji: '🔄' },
            { value: 'remote', label: 'Remote', emoji: '🏠' },
            { value: 'unemployed', label: 'Unemployed', emoji: '⏸️' },
            { value: 'retired', label: 'Retired', emoji: '🏖️' }
        ]
    },
    travel_frequency: {
        label: 'Travel Frequency',
        type: 'single_select',
        options: [
            { value: 'rarely', label: 'Rarely', emoji: '🏠' },
            { value: 'occasionally', label: 'Occasionally', emoji: '✈️' },
            { value: 'frequently', label: 'Frequently', emoji: '🌍' },
            { value: 'digital_nomad', label: 'Digital Nomad', emoji: '💻' }
        ]
    },
    
    // Content Creator Specific
    content_niches: {
        label: 'Content Niches',
        type: 'multi_select',
        options: [
            { value: 'fashion', label: 'Fashion', emoji: '👗' },
            { value: 'beauty', label: 'Beauty', emoji: '💄' },
            { value: 'fitness', label: 'Fitness', emoji: '💪' },
            { value: 'food', label: 'Food', emoji: '🍔' },
            { value: 'travel', label: 'Travel', emoji: '✈️' },
            { value: 'tech', label: 'Tech', emoji: '💻' },
            { value: 'gaming', label: 'Gaming', emoji: '🎮' },
            { value: 'lifestyle', label: 'Lifestyle', emoji: '🌟' },
            { value: 'parenting', label: 'Parenting', emoji: '👶' },
            { value: 'diy', label: 'DIY/Crafts', emoji: '🛠️' },
            { value: 'finance', label: 'Finance', emoji: '💰' },
            { value: 'education', label: 'Education', emoji: '📚' },
            { value: 'sports', label: 'Sports', emoji: '⚽' },
            { value: 'music', label: 'Music', emoji: '🎵' },
            { value: 'pets', label: 'Pets', emoji: '🐾' }
        ]
    },
    follower_count: {
        label: 'Follower Count',
        type: 'range',
        description: 'Target creators by audience size',
        options: [
            { value: 'nano', label: 'Nano (1K-10K)', min: 1000, max: 10000 },
            { value: 'micro', label: 'Micro (10K-50K)', min: 10000, max: 50000 },
            { value: 'mid', label: 'Mid (50K-200K)', min: 50000, max: 200000 },
            { value: 'macro', label: 'Macro (200K-1M)', min: 200000, max: 1000000 },
            { value: 'mega', label: 'Mega (1M+)', min: 1000000, max: null }
        ]
    },
    engagement_rate: {
        label: 'Engagement Rate',
        type: 'range',
        description: 'Minimum engagement rate %',
        min: 0,
        max: 20
    },
    
    // Location & Context
    countries: {
        label: 'Countries',
        type: 'multi_select',
        description: 'Target specific countries'
    },
    cities: {
        label: 'Cities',
        type: 'multi_select',
        description: 'Target specific cities'
    },
    timezone: {
        label: 'Timezone',
        type: 'multi_select',
        description: 'Target users in specific timezones'
    },
    languages: {
        label: 'Languages',
        type: 'multi_select',
        description: 'Target users by language'
    },
    
    // Life Events & Context
    upcoming_events: {
        label: 'Upcoming Life Events',
        type: 'multi_select',
        options: [
            { value: 'birthday_soon', label: 'Birthday in next 30 days', emoji: '🎂' },
            { value: 'anniversary_soon', label: 'Anniversary in next 30 days', emoji: '💕' },
            { value: 'new_parent', label: 'New Parent (0-1 year)', emoji: '👶' },
            { value: 'expecting', label: 'Expecting', emoji: '🤰' },
            { value: 'recently_married', label: 'Recently Married (< 1 year)', emoji: '💍' },
            { value: 'new_homeowner', label: 'New Homeowner', emoji: '🏠' }
        ]
    },
    seasonal_relevance: {
        label: 'Seasonal Relevance',
        type: 'multi_select',
        options: [
            { value: 'spring', label: 'Spring', emoji: '🌸' },
            { value: 'summer', label: 'Summer', emoji: '☀️' },
            { value: 'fall', label: 'Fall', emoji: '🍂' },
            { value: 'winter', label: 'Winter', emoji: '❄️' },
            { value: 'back_to_school', label: 'Back to School', emoji: '🎒' },
            { value: 'holiday_season', label: 'Holiday Season', emoji: '🎄' }
        ]
    }
};

// ============================================
// DEMOGRAPHIC TARGETING SERVICE
// ============================================

const DemographicTargetingService = {
    
    /**
     * Get all available targeting criteria
     */
    getTargetingCriteria() {
        return TARGETING_CRITERIA;
    },
    
    /**
     * Calculate audience size based on targeting filters
     */
    async calculateAudienceSize(filters = {}) {
        try {
            let query = supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true);
            
            // Apply filters
            if (filters.age_min || filters.age_max) {
                // Join with demographics for age
                const { data: matchingUsers } = await this.findMatchingUsers(filters, { limit: 10000 });
                return { 
                    size: matchingUsers?.length || 0,
                    isEstimate: matchingUsers?.length >= 10000
                };
            }
            
            // Add other filters...
            
            const { count, error } = await query;
            
            if (error) throw error;
            
            return { size: count || 0, isEstimate: false };
        } catch (error) {
            console.error('[DemographicTargeting] Error calculating audience size:', error);
            return { size: 0, error: error.message };
        }
    },
    
    /**
     * Find users matching targeting criteria
     */
    async findMatchingUsers(filters = {}, options = {}) {
        const { 
            limit = 100,
            offset = 0,
            includeDemographics = true 
        } = options;
        
        try {
            let query = supabase
                .from('users')
                .select(`
                    id,
                    display_name,
                    email,
                    preferences,
                    location_data,
                    points_balance,
                    created_at,
                    ${includeDemographics ? 'user_demographics(*)' : ''}
                `)
                .eq('is_active', true);
            
            // Apply demographic filters
            if (Object.keys(filters).length > 0) {
                // We'll need to filter in memory or use a more complex query
                // For now, fetch and filter
                const { data: users, error } = await query.limit(limit * 2); // Fetch extra for filtering
                
                if (error) throw error;
                
                // Filter users based on criteria
                const matchingUsers = (users || []).filter(user => {
                    return this.matchesTargetingCriteria(user, filters);
                }).slice(0, limit);
                
                return { users: matchingUsers, total: matchingUsers.length };
            }
            
            const { data: users, error } = await query.range(offset, offset + limit - 1);
            
            if (error) throw error;
            
            return { users: users || [], total: users?.length || 0 };
        } catch (error) {
            console.error('[DemographicTargeting] Error finding matching users:', error);
            return { users: [], error: error.message };
        }
    },
    
    /**
     * Check if a user matches targeting criteria
     */
    matchesTargetingCriteria(user, filters) {
        const demographics = user.user_demographics || {};
        const prefs = user.preferences || {};
        
        // Age check
        if (filters.age_min || filters.age_max) {
            if (!demographics.birthday) return false;
            const age = this.calculateAge(demographics.birthday);
            if (filters.age_min && age < filters.age_min) return false;
            if (filters.age_max && age > filters.age_max) return false;
        }
        
        // Gender check
        if (filters.gender?.length > 0) {
            if (!filters.gender.includes(demographics.gender)) return false;
        }
        
        // Marital status check
        if (filters.marital_status?.length > 0) {
            if (!filters.marital_status.includes(demographics.marital_status)) return false;
        }
        
        // Has children check
        if (filters.has_children !== undefined) {
            if (demographics.has_children !== filters.has_children) return false;
        }
        
        // Children age range
        if (filters.children_age_range?.length > 0) {
            if (!demographics.children_ages) return false;
            const hasMatchingChild = demographics.children_ages.some((age) => 
                filters.children_age_range.some((range) => {
                    const [min, max] = range.split('-').map(Number);
                    return age >= min && age <= max;
                })
            );
            if (!hasMatchingChild) return false;
        }
        
        // Income check
        if (filters.household_income?.length > 0) {
            if (!filters.household_income.includes(demographics.household_income)) return false;
        }
        
        // Education check
        if (filters.education_level?.length > 0) {
            if (!filters.education_level.includes(demographics.education_level)) return false;
        }
        
        // Fitness level
        if (filters.fitness_level?.length > 0) {
            if (!filters.fitness_level.includes(demographics.fitness_level)) return false;
        }
        
        // Dietary preferences
        if (filters.dietary_preferences?.length > 0) {
            if (!demographics.dietary_preferences) return false;
            const hasMatchingDiet = demographics.dietary_preferences.some(d => 
                filters.dietary_preferences.includes(d)
            );
            if (!hasMatchingDiet) return false;
        }
        
        // Pet owner
        if (filters.has_pets !== undefined) {
            if (demographics.has_pets !== filters.has_pets) return false;
        }
        
        // Pet types
        if (filters.pet_types?.length > 0) {
            if (!demographics.pet_types) return false;
            const hasMatchingPet = demographics.pet_types.some(p => 
                filters.pet_types.includes(p)
            );
            if (!hasMatchingPet) return false;
        }
        
        // Work schedule
        if (filters.work_schedule?.length > 0) {
            if (!filters.work_schedule.includes(demographics.work_schedule)) return false;
        }
        
        // Content niches
        if (filters.content_niches?.length > 0) {
            if (!demographics.content_niches) return false;
            const hasMatchingNiche = demographics.content_niches.some(n => 
                filters.content_niches.includes(n)
            );
            if (!hasMatchingNiche) return false;
        }
        
        // Location checks
        if (filters.countries?.length > 0) {
            const userCountry = user.location_data?.country;
            if (!userCountry || !filters.countries.includes(userCountry)) return false;
        }
        
        if (filters.cities?.length > 0) {
            const userCity = user.location_data?.city;
            if (!userCity || !filters.cities.includes(userCity)) return false;
        }
        
        return true;
    },
    
    /**
     * Calculate targeting effectiveness score
     */
    async calculateTargetingScore(campaignId) {
        try {
            // Get campaign targeting
            const { data: campaign } = await supabase
                .from('advertiser_campaigns')
                .select('target_audience')
                .eq('id', campaignId)
                .single();
            
            if (!campaign?.target_audience) {
                return { score: 0, reasons: ['No targeting criteria set'] };
            }
            
            const filters = campaign.target_audience;
            const { size: audienceSize } = await this.calculateAudienceSize(filters);
            const totalUsers = await this.getTotalActiveUsers();
            
            // Calculate scores
            const reachScore = Math.min((audienceSize / totalUsers) * 100, 100);
            const specificityScore = Object.keys(filters).length * 10; // 10 points per filter
            
            // Recommendations
            const recommendations = [];
            if (reachScore > 80) {
                recommendations.push('Audience is very broad - consider adding more specific filters');
            } else if (reachScore < 5) {
                recommendations.push('Audience is very narrow - you may want to expand targeting');
            }
            
            if (!filters.content_niches) {
                recommendations.push('Adding content niches can improve creator matching');
            }
            
            return {
                score: Math.round((reachScore + specificityScore) / 2),
                reach_percentage: Math.round(reachScore),
                audience_size: audienceSize,
                total_users: totalUsers,
                specificity_score: specificityScore,
                recommendations
            };
        } catch (error) {
            console.error('[DemographicTargeting] Error calculating targeting score:', error);
            return { score: 0, error: error.message };
        }
    },
    
    /**
     * Get total active users count
     */
    async getTotalActiveUsers() {
        const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        return count || 1;
    },
    
    /**
     * Generate targeting recommendations for a brand/campaign
     */
    async generateTargetingRecommendations(brandInfo = {}) {
        const recommendations = [];
        
        // Brand vertical-based recommendations
        const verticalRecommendations = {
            'beauty': {
                niches: ['beauty', 'fashion', 'lifestyle'],
                demographics: { gender: ['female', 'non_binary'] },
                age_range: { min: 18, max: 45 }
            },
            'fitness': {
                niches: ['fitness', 'lifestyle'],
                demographics: { fitness_level: ['moderate', 'active', 'athlete'] }
            },
            'parenting': {
                niches: ['parenting', 'lifestyle'],
                demographics: { has_children: true }
            },
            'pet': {
                niches: ['pets', 'lifestyle'],
                demographics: { has_pets: true }
            },
            'food': {
                niches: ['food', 'lifestyle'],
                demographics: {}
            },
            'tech': {
                niches: ['tech'],
                age_range: { min: 18, max: 45 }
            },
            'fashion': {
                niches: ['fashion', 'beauty', 'lifestyle']
            },
            'travel': {
                niches: ['travel', 'lifestyle'],
                demographics: { travel_frequency: ['occasionally', 'frequently', 'digital_nomad'] }
            }
        };
        
        if (brandInfo.vertical && verticalRecommendations[brandInfo.vertical]) {
            const rec = verticalRecommendations[brandInfo.vertical];
            recommendations.push({
                type: 'vertical_based',
                title: `Recommended for ${brandInfo.vertical} brands`,
                filters: rec,
                reason: 'Based on industry vertical performance data'
            });
        }
        
        // Seasonal recommendations
        const month = new Date().getMonth() + 1;
        if (month >= 11 || month <= 1) {
            recommendations.push({
                type: 'seasonal',
                title: 'Holiday Season Targeting',
                filters: { seasonal_relevance: ['holiday_season', 'winter'] },
                reason: 'Holiday season is peak engagement period'
            });
        }
        if (month >= 6 && month <= 8) {
            recommendations.push({
                type: 'seasonal',
                title: 'Summer Campaign Targeting',
                filters: { seasonal_relevance: ['summer'] },
                reason: 'Summer is peak for outdoor/travel content'
            });
        }
        
        // Add performance-based recommendations if we have campaign data
        // (This would require analytics integration)
        
        return recommendations;
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
     * Validate targeting filters
     */
    validateTargetingFilters(filters) {
        const errors = [];
        const warnings = [];
        
        // Check for conflicting filters
        if (filters.gender?.includes('male') && filters.gender?.includes('female')) {
            // This is fine - multi-select
        }
        
        // Check for overly broad targeting
        const filterCount = Object.keys(filters).length;
        if (filterCount === 0) {
            warnings.push('No targeting filters set - campaign will reach all users');
        }
        
        // Check for overly specific targeting
        if (filterCount > 8) {
            warnings.push('Many targeting filters may result in very small audience');
        }
        
        // Validate age ranges
        if (filters.age_min && filters.age_max && filters.age_min > filters.age_max) {
            errors.push('Age minimum cannot be greater than age maximum');
        }
        
        return { isValid: errors.length === 0, errors, warnings };
    }
};

module.exports = DemographicTargetingService;
