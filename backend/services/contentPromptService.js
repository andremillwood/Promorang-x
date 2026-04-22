/**
 * CONTENT PROMPTS SERVICE
 * 
 * AI-generated content suggestions based on user context, life events, and trends
 */

const { supabase } = require('../lib/supabase');

// ============================================
// PROMPT TEMPLATES BY CONTEXT
// ============================================

const PROMPT_TEMPLATES = {
    // Birthday prompts
    birthday: {
        pre_event: [
            {
                type: 'wishlist',
                template: 'It\'s almost your birthday! Create a wishlist video showing {count} products you\'re hoping to receive. Tag the brands and use #BirthdayWishlist',
                variables: { count: [3, 5, 10] }
            },
            {
                type: 'prep',
                template: 'Birthday prep mode activated! Share your {activity} routine as you get ready to celebrate another year.',
                variables: { activity: ['self-care', 'fitness', 'skincare', 'hair'] }
            },
            {
                type: 'reflection',
                template: 'As you approach your birthday, share {number} things you learned this past year. What wisdom are you carrying forward?',
                variables: { number: [3, 5] }
            }
        ],
        during: [
            {
                type: 'celebration',
                template: '🎉 It\'s your special day! Document your birthday celebration and show off any gifts you received.',
                bonus: 'birthday_reward'
            },
            {
                type: 'gratitude',
                template: 'Birthday gratitude post! Thank your community and share what their support means to you.',
                bonus: 'engagement_boost'
            }
        ],
        post_event: [
            {
                type: 'haul',
                template: 'Birthday haul time! Unbox and review the gifts you received. What was your favorite?',
                bonus: 'high_engagement'
            }
        ]
    },
    
    // Fitness prompts
    fitness: {
        daily: [
            {
                type: 'workout',
                template: 'Morning workout check-in! Share your {workout_type} routine and the gear that powers you through.',
                variables: { workout_type: ['HIIT', 'yoga', 'strength', 'cardio', 'run'] }
            },
            {
                type: 'gear_review',
                template: 'Quick review: What\'s one piece of workout gear you can\'t live without?',
                format: 'short_video'
            },
            {
                type: 'progress',
                template: 'Progress check! Share a win from this week - even small victories count.',
                engagement: 'community_support'
            }
        ],
        seasonal: {
            summer: [
                {
                    type: 'outdoor',
                    template: 'Summer sweat session! Take your workout outside and show us your outdoor fitness setup.',
                    tags: ['#OutdoorWorkout', '#SummerFitness']
                },
                {
                    type: 'hydration',
                    template: 'Beat the heat! Share your hydration routine and favorite water bottle.',
                    product_focus: true
                }
            ],
            winter: [
                {
                    type: 'indoor',
                    template: 'Cozy winter workout at home. Show us your indoor setup and favorite workout app.',
                    tags: ['#HomeWorkout', '#WinterFitness']
                }
            ]
        }
    },
    
    // Food/Cooking prompts
    food: {
        daily: [
            {
                type: 'meal',
                template: 'What\'s for {meal}? Share your plate and tag the ingredients!',
                variables: { meal: ['breakfast', 'lunch', 'dinner'] }
            },
            {
                type: 'recipe',
                template: 'Quick {recipe_type} that takes under 30 minutes. Perfect for busy days!',
                variables: { recipe_type: ['recipe', 'meal prep', 'snack idea'] },
                format: 'carousel_or_video'
            },
            {
                type: 'restaurant',
                template: 'Found a hidden gem! Quick review of {restaurant_type} you tried recently.',
                variables: { restaurant_type: ['that restaurant', 'the cafe', 'this food truck'] }
            }
        ],
        seasonal: {
            summer: [
                {
                    type: 'bbq',
                    template: 'Summer BBQ essentials! What are your must-haves for the grill?',
                    seasonal_boost: true
                }
            ],
            fall: [
                {
                    type: 'cozy',
                    template: 'Cozy fall recipes incoming! Share your favorite comfort food for chilly days.',
                    seasonal_boost: true
                }
            ]
        }
    },
    
    // Parenting prompts
    parenting: {
        daily: [
            {
                type: 'moment',
                template: 'Capture a candid moment with your little one. Real parenting > perfect parenting.',
                tone: 'authentic'
            },
            {
                type: 'hack',
                template: 'Parenting hack that saved your sanity: {hack_topic}',
                variables: { hack_topic: ['meal times', 'bedtime routine', 'organization', 'travel'] }
            },
            {
                type: 'product_review',
                template: 'Mom/Dad approved! Review a product that actually made parenting easier.',
                engagement: 'high'
            }
        ],
        milestones: [
            {
                type: 'first',
                template: 'First {milestone}! Document this precious moment.',
                variables: { milestone: ['steps', 'words', 'day of school', 'birthday'] }
            }
        ]
    },
    
    // Travel prompts
    travel: {
        general: [
            {
                type: 'local',
                template: 'Be a tourist in your own city! Show us a hidden gem within 30 minutes of home.',
                accessibility: 'easy'
            },
            {
                type: 'packing',
                template: 'Packing essentials for a {trip_type} trip. What\'s in your bag?',
                variables: { trip_type: ['weekend', 'business', 'beach', 'hiking'] }
            },
            {
                type: 'memory',
                template: 'Throwback to {location}! Share your favorite memory from this trip.',
                variables: { location: 'user_travel_history' }
            }
        ]
    },
    
    // Pet prompts
    pet: {
        daily: [
            {
                type: 'cute_moment',
                template: 'Pet content break! Share a cute moment with {pet_name}.',
                variables: { pet_name: 'user_pet_name' }
            },
            {
                type: 'product',
                template: '{pet_name} approved! Review a pet product your furry friend loves.',
                engagement: 'high'
            }
        ]
    },
    
    // Tech/Gaming prompts
    tech: {
        daily: [
            {
                type: 'setup',
                template: 'Desk setup tour! Show off your workspace and must-have tech.',
                format: 'video_or_carousel'
            },
            {
                type: 'app_review',
                template: 'App that changed the game: {app_type} you can\'t live without.',
                variables: { app_type: ['productivity', 'fitness', 'photo editing', 'finance'] }
            },
            {
                type: 'unboxing',
                template: 'Unboxing time! New {product_type} just arrived.',
                variables: { product_type: ['gadget', 'tech accessory', 'device'] }
            }
        ]
    },
    
    // Fashion/Beauty prompts
    fashion: {
        daily: [
            {
                type: 'ootd',
                template: 'OOTD featuring pieces from {brand_type}. Mix of high and low!',
                variables: { brand_type: ['affordable brands', 'sustainable labels', 'local designers'] }
            },
            {
                type: 'haul',
                template: 'Mini haul: {count} pieces that are perfect for {season}',
                variables: { count: [3, 5], season: 'current_season' }
            }
        ]
    },
    
    // Trend-jacking prompts
    trends: {
        seasonal: {
            back_to_school: 'Back to school prep! Show your {category} haul.',
            summer_prep: 'Getting summer ready! Share your essentials for {activity}.',
            holiday_gift: 'Holiday gift guide for {recipient}. What\'s on your list?',
            new_year: 'New year, new {focus}. What are you investing in this year?'
        },
        
        events: {
            super_bowl: 'Super Bowl Sunday setup! Share your game day essentials.',
            world_cup: 'World Cup fever! Show your team spirit and viewing setup.',
            coachella: 'Festival season prep! What\'s in your Coachella survival kit?',
            olympics: 'Olympics watch party! Share your setup for cheering on team {country}.'
        }
    }
};

// ============================================
// CONTENT PROMPT SERVICE
// ============================================

const ContentPromptService = {
    
    /**
     * Generate content prompts for a user
     */
    async generatePrompts(userId, options = {}) {
        const {
            count = 3,
            includeTrends = true,
            contentNiche = null
        } = options;
        
        try {
            // Fetch user context
            const { data: userData } = await supabase
                .from('users')
                .select(`
                    id,
                    display_name,
                    preferences,
                    user_demographics(*)
                `)
                .eq('id', userId)
                .single();
            
            const demographics = userData?.user_demographics || {};
            const preferences = userData?.preferences || {};
            
            // Get active global events
            const { data: activeEvents } = await supabase
                .from('active_global_events')
                .select('*')
                .limit(5);
            
            // Generate prompts
            let prompts = [];
            
            // 1. Life event prompts
            const lifeEventPrompts = await this.getLifeEventPrompts(userId);
            prompts.push(...lifeEventPrompts);
            
            // 2. Demographic-based prompts
            const demographicPrompts = this.getDemographicPrompts(demographics, preferences);
            prompts.push(...demographicPrompts);
            
            // 3. Trend-based prompts
            if (includeTrends) {
                const trendPrompts = this.getTrendPrompts(activeEvents, demographics);
                prompts.push(...trendPrompts);
            }
            
            // 4. Niche-specific prompts
            if (contentNiche || demographics.content_niches) {
                const nichePrompts = this.getNichePrompts(
                    contentNiche || demographics.content_niches?.[0],
                    demographics
                );
                prompts.push(...nichePrompts);
            }
            
            // Score and sort prompts by relevance
            prompts = prompts.map(prompt => ({
                ...prompt,
                relevance_score: this.calculateRelevanceScore(prompt, demographics, preferences)
            })).sort((a, b) => b.relevance_score - a.relevance_score);
            
            // Deduplicate and limit
            prompts = this.deduplicatePrompts(prompts).slice(0, count);
            
            return {
                prompts,
                total: prompts.length,
                generated_at: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[ContentPrompt] Error generating prompts:', error);
            return { prompts: [], error: error.message };
        }
    },
    
    /**
     * Get prompts based on life events
     */
    async getLifeEventPrompts(userId) {
        const prompts = [];
        
        try {
            // Check for upcoming personal events
            const { data: upcomingEvents } = await supabase
                .from('user_calendar')
                .select('*')
                .eq('user_id', userId)
                .gte('event_date', new Date().toISOString().split('T')[0])
                .lte('event_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
            
            for (const event of upcomingEvents || []) {
                const daysUntil = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));
                
                if (event.event_type === 'my_birthday') {
                    if (daysUntil <= 14 && daysUntil > 0) {
                        prompts.push(...PROMPT_TEMPLATES.birthday.pre_event.map(p => ({
                            ...p,
                            context: 'upcoming_birthday',
                            urgency: daysUntil <= 3 ? 'high' : 'medium',
                            days_until: daysUntil
                        })));
                    } else if (daysUntil === 0) {
                        prompts.push(...PROMPT_TEMPLATES.birthday.during.map(p => ({
                            ...p,
                            context: 'birthday_today',
                            urgency: 'high'
                        })));
                    }
                }
                
                if (event.event_type === 'anniversary' && daysUntil <= 7) {
                    prompts.push(...PROMPT_TEMPLATES.birthday.pre_event.map(p => ({
                        ...p,
                        context: 'upcoming_anniversary',
                        urgency: 'medium'
                    })));
                }
            }
            
            // Check for new parent status
            const { data: demoData } = await supabase
                .from('user_demographics')
                .select('has_children, children_ages')
                .eq('user_id', userId)
                .single();
            
            if (demoData?.has_children && demoData.children_ages) {
                const hasYoungChild = demoData.children_ages.some(age => age <= 1);
                if (hasYoungChild) {
                    prompts.push(...PROMPT_TEMPLATES.parenting.milestones);
                }
            }
            
        } catch (error) {
            console.error('[ContentPrompt] Error getting life event prompts:', error);
        }
        
        return prompts;
    },
    
    /**
     * Get demographic-based prompts
     */
    getDemographicPrompts(demographics, preferences) {
        const prompts = [];
        
        // Fitness prompts
        if (['moderate', 'active', 'athlete'].includes(demographics.fitness_level)) {
            prompts.push(...PROMPT_TEMPLATES.fitness.daily);
        }
        
        // Food prompts
        if (demographics.content_niches?.includes('food')) {
            prompts.push(...PROMPT_TEMPLATES.food.daily);
        }
        
        // Parenting prompts
        if (demographics.has_children) {
            prompts.push(...PROMPT_TEMPLATES.parenting.daily);
        }
        
        // Pet prompts
        if (demographics.has_pets) {
            prompts.push(...PROMPT_TEMPLATES.pet.daily);
        }
        
        // Travel prompts
        if (demographics.travel_frequency && demographics.travel_frequency !== 'rarely') {
            prompts.push(...PROMPT_TEMPLATES.travel.general);
        }
        
        // Tech prompts
        if (demographics.content_niches?.includes('tech')) {
            prompts.push(...PROMPT_TEMPLATES.tech.daily);
        }
        
        // Fashion prompts
        if (demographics.content_niches?.includes('fashion')) {
            prompts.push(...PROMPT_TEMPLATES.fashion.daily);
        }
        
        return prompts;
    },
    
    /**
     * Get trend-based prompts
     */
    getTrendPrompts(activeEvents, demographics) {
        const prompts = [];
        const month = new Date().getMonth() + 1;
        
        // Seasonal trends
        if (month >= 8 && month <= 9) {
            prompts.push({
                template: PROMPT_TEMPLATES.trends.seasonal.back_to_school,
                context: 'seasonal',
                trend: 'back_to_school'
            });
        }
        
        if (month >= 11 || month === 12) {
            prompts.push({
                template: PROMPT_TEMPLATES.trends.seasonal.holiday_gift,
                context: 'seasonal',
                trend: 'holiday_season'
            });
        }
        
        if (month === 1) {
            prompts.push({
                template: PROMPT_TEMPLATES.trends.seasonal.new_year,
                context: 'seasonal',
                trend: 'new_year'
            });
        }
        
        // Event-based trends
        for (const event of activeEvents || []) {
            if (event.event_type === 'sports' && event.name?.toLowerCase().includes('super bowl')) {
                prompts.push({
                    template: PROMPT_TEMPLATES.trends.events.super_bowl,
                    context: 'event',
                    event_id: event.id
                });
            }
            
            if (event.event_type === 'sports' && event.name?.toLowerCase().includes('world cup')) {
                prompts.push({
                    template: PROMPT_TEMPLATES.trends.events.world_cup,
                    context: 'event',
                    event_id: event.id,
                    variables: { country: demographics.country_origin || 'USA' }
                });
            }
            
            if (event.event_type === 'music' && event.name?.toLowerCase().includes('coachella')) {
                prompts.push({
                    template: PROMPT_TEMPLATES.trends.events.coachella,
                    context: 'event',
                    event_id: event.id
                });
            }
        }
        
        return prompts;
    },
    
    /**
     * Get niche-specific prompts
     */
    getNichePrompts(niche, demographics) {
        const prompts = [];
        
        const nicheTemplates = {
            fitness: PROMPT_TEMPLATES.fitness.daily,
            food: PROMPT_TEMPLATES.food.daily,
            parenting: PROMPT_TEMPLATES.parenting.daily,
            pets: PROMPT_TEMPLATES.pet.daily,
            travel: PROMPT_TEMPLATES.travel.general,
            tech: PROMPT_TEMPLATES.tech.daily,
            fashion: PROMPT_TEMPLATES.fashion.daily
        };
        
        if (nicheTemplates[niche]) {
            prompts.push(...nicheTemplates[niche]);
        }
        
        return prompts;
    },
    
    /**
     * Calculate relevance score for a prompt
     */
    calculateRelevanceScore(prompt, demographics, preferences) {
        let score = 50; // Base score
        
        // Boost for life events (highest priority)
        if (prompt.context?.includes('birthday') || prompt.context?.includes('anniversary')) {
            score += 30;
            if (prompt.urgency === 'high') score += 20;
        }
        
        // Boost for trending events
        if (prompt.context === 'event') score += 15;
        if (prompt.context === 'seasonal') score += 10;
        
        // Boost for personal alignment
        if (prompt.bonus) score += 10;
        
        // Penalize if too similar to recent content (would need content history)
        
        return Math.min(100, score);
    },
    
    /**
     * Deduplicate prompts
     */
    deduplicatePrompts(prompts) {
        const seen = new Set();
        return prompts.filter(p => {
            const key = p.template?.substring(0, 50) || p.type;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },
    
    /**
     * Render a prompt with variables
     */
    renderPrompt(prompt, userData = {}) {
        let template = prompt.template;
        
        // Replace variables
        if (prompt.variables) {
            for (const [key, value] of Object.entries(prompt.variables)) {
                const replacement = Array.isArray(value) 
                    ? value[Math.floor(Math.random() * value.length)]
                    : value;
                template = template.replace(new RegExp(`{${key}}`, 'g'), replacement);
            }
        }
        
        // Replace user-specific variables
        template = template.replace(/{user_name}/g, userData.display_name || 'there');
        
        return template;
    },
    
    /**
     * Record prompt engagement (for learning)
     */
    async recordPromptEngagement(userId, promptId, action) {
        try {
            await supabase
                .from('content_prompt_engagement')
                .insert({
                    user_id: userId,
                    prompt_id: promptId,
                    action: action, // 'viewed', 'used', 'dismissed', 'completed'
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('[ContentPrompt] Error recording engagement:', error);
        }
    },
    
    /**
     * Get trending prompt themes
     */
    async getTrendingThemes() {
        const month = new Date().getMonth() + 1;
        
        const themes = [];
        
        // Seasonal themes
        if (month >= 3 && month <= 5) {
            themes.push('spring_refresh', 'spring_fashion', 'outdoor_fitness');
        } else if (month >= 6 && month <= 8) {
            themes.push('summer_vibes', 'beach_content', 'travel_diaries', 'festival_season');
        } else if (month >= 9 && month <= 11) {
            themes.push('fall_aesthetic', 'cozy_season', 'back_to_routine');
        } else {
            themes.push('winter_wonderland', 'holiday_prep', 'new_year_goals');
        }
        
        // Current events (would integrate with events API)
        themes.push('sports_season', 'music_festival_season');
        
        return themes;
    }
};

module.exports = ContentPromptService;
