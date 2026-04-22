/**
 * PERSONALIZED QUEST SERVICE
 * 
 * Generates quests tailored to user demographics, life events, and context
 */

const { supabase } = require('../lib/supabase');

// ============================================
// QUEST TEMPLATES BY DEMOGRAPHIC
// ============================================

const DEMOGRAPHIC_QUEST_TEMPLATES = {
    // Parent-focused quests
    parent: {
        daily: [
            {
                title: 'Family Moment Creator',
                description: 'Share a photo of your family enjoying a product together',
                reward: { gems: 25, points: 50 },
                category: 'family',
                difficulty: 'easy'
            },
            {
                title: 'Parent Review',
                description: 'Write a quick review of a product your kids love',
                reward: { gems: 30, points: 60 },
                category: 'review',
                difficulty: 'easy'
            },
            {
                title: 'Back to School Prep',
                description: 'Share your back-to-school shopping haul',
                reward: { gems: 40, points: 80 },
                category: 'shopping',
                difficulty: 'medium',
                seasonal: ['august', 'september']
            }
        ],
        weekly: [
            {
                title: 'Weekend Family Adventure',
                description: 'Document a family outing and tag 3 relevant brands',
                reward: { gems: 100, points: 200 },
                category: 'content',
                difficulty: 'medium'
            },
            {
                title: 'Parenting Hack Share',
                description: 'Share a parenting tip that saved you time or money',
                reward: { gems: 75, points: 150 },
                category: 'tips',
                difficulty: 'easy'
            }
        ]
    },
    
    // Fitness enthusiast quests
    fitness: {
        daily: [
            {
                title: 'Morning Workout Check-in',
                description: 'Share your pre or post-workout routine',
                reward: { gems: 20, points: 40 },
                category: 'fitness',
                difficulty: 'easy',
                time_window: { start: '05:00', end: '09:00' }
            },
            {
                title: 'Gear Review',
                description: 'Quick review of your favorite workout equipment',
                reward: { gems: 35, points: 70 },
                category: 'review',
                difficulty: 'easy'
            },
            {
                title: 'Fitness Progress',
                description: 'Share your fitness journey milestone',
                reward: { gems: 50, points: 100 },
                category: 'progress',
                difficulty: 'medium'
            }
        ],
        weekly: [
            {
                title: 'Week Workout Recap',
                description: 'Summarize your week of workouts and tag fitness brands',
                reward: { gems: 100, points: 200 },
                category: 'recap',
                difficulty: 'medium'
            },
            {
                title: 'Gym Partner Shoutout',
                description: 'Feature your workout buddy and your favorite gym',
                reward: { gems: 75, points: 150 },
                category: 'social',
                difficulty: 'easy'
            }
        ]
    },
    
    // Food/Cooking quests
    food: {
        daily: [
            {
                title: 'What\'s for Dinner?',
                description: 'Share your meal and tag the ingredients/brands',
                reward: { gems: 25, points: 50 },
                category: 'food',
                difficulty: 'easy'
            },
            {
                title: 'Quick Recipe Share',
                description: 'Post a 60-second recipe video or carousel',
                reward: { gems: 40, points: 80 },
                category: 'recipe',
                difficulty: 'medium'
            },
            {
                title: 'Restaurant Review',
                description: 'Quick review of a dining experience',
                reward: { gems: 30, points: 60 },
                category: 'review',
                difficulty: 'easy'
            }
        ],
        weekly: [
            {
                title: 'Meal Prep Sunday',
                description: 'Document your meal prep and share containers/tools used',
                reward: { gems: 80, points: 160 },
                category: 'meal_prep',
                difficulty: 'medium',
                day_of_week: 0 // Sunday
            },
            {
                title: 'Grocery Haul',
                description: 'Share your grocery shopping and favorite finds',
                reward: { gems: 60, points: 120 },
                category: 'shopping',
                difficulty: 'easy'
            }
        ]
    },
    
    // Pet owner quests
    pet: {
        daily: [
            {
                title: 'Pet of the Day',
                description: 'Share a cute moment with your pet and their favorite product',
                reward: { gems: 20, points: 40 },
                category: 'pet',
                difficulty: 'easy'
            },
            {
                title: 'Pet Product Review',
                description: 'Review a pet product your furry friend loves',
                reward: { gems: 35, points: 70 },
                category: 'review',
                difficulty: 'easy'
            }
        ],
        weekly: [
            {
                title: 'Pet Adventure',
                description: 'Document a pet-friendly outing or activity',
                reward: { gems: 75, points: 150 },
                category: 'adventure',
                difficulty: 'medium'
            },
            {
                title: 'Pet Care Tips',
                description: 'Share pet care advice that has worked for you',
                reward: { gems: 60, points: 120 },
                category: 'tips',
                difficulty: 'easy'
            }
        ]
    },
    
    // Student quests
    student: {
        daily: [
            {
                title: 'Study Session Setup',
                description: 'Share your study space and productivity tools',
                reward: { gems: 20, points: 40 },
                category: 'productivity',
                difficulty: 'easy'
            },
            {
                title: 'Campus Life',
                description: 'Document something interesting about your campus',
                reward: { gems: 25, points: 50 },
                category: 'lifestyle',
                difficulty: 'easy'
            },
            {
                title: 'Budget Find',
                description: 'Share a great student deal or discount you found',
                reward: { gems: 30, points: 60 },
                category: 'deals',
                difficulty: 'easy'
            }
        ],
        weekly: [
            {
                title: 'Week in Review',
                description: 'Share highlights from your student week',
                reward: { gems: 50, points: 100 },
                category: 'recap',
                difficulty: 'easy'
            },
            {
                title: 'Study Tips',
                description: 'Share your best study hack or technique',
                reward: { gems: 45, points: 90 },
                category: 'tips',
                difficulty: 'easy'
            }
        ]
    },
    
    // Travel enthusiast quests
    travel: {
        daily: [
            {
                title: 'Travel Memory',
                description: 'Share a favorite travel moment and tag the location',
                reward: { gems: 30, points: 60 },
                category: 'travel',
                difficulty: 'easy'
            },
            {
                title: 'Local Discovery',
                description: 'Highlight a hidden gem in your area',
                reward: { gems: 35, points: 70 },
                category: 'local',
                difficulty: 'easy'
            }
        ],
        weekly: [
            {
                title: 'Weekend Getaway',
                description: 'Document a short trip or staycation',
                reward: { gems: 100, points: 200 },
                category: 'travel',
                difficulty: 'medium'
            },
            {
                title: 'Travel Tips',
                description: 'Share packing or travel planning advice',
                reward: { gems: 60, points: 120 },
                category: 'tips',
                difficulty: 'easy'
            }
        ]
    },
    
    // Tech/Gaming quests
    tech: {
        daily: [
            {
                title: 'Tech Setup Tour',
                description: 'Share your desk/gaming setup and gear',
                reward: { gems: 25, points: 50 },
                category: 'tech',
                difficulty: 'easy'
            },
            {
                title: 'App Review',
                description: 'Quick review of an app that helps your daily life',
                reward: { gems: 30, points: 60 },
                category: 'review',
                difficulty: 'easy'
            },
            {
                title: 'Unboxing',
                description: 'Share an unboxing of a recent tech purchase',
                reward: { gems: 40, points: 80 },
                category: 'unboxing',
                difficulty: 'medium'
            }
        ],
        weekly: [
            {
                title: 'Tech Tutorial',
                description: 'Create a quick how-to for a tech skill',
                reward: { gems: 80, points: 160 },
                category: 'tutorial',
                difficulty: 'medium'
            },
            {
                title: 'Gadget Comparison',
                description: 'Compare two similar products and share your preference',
                reward: { gems: 70, points: 140 },
                category: 'comparison',
                difficulty: 'medium'
            }
        ]
    }
};

// ============================================
// LIFE EVENT QUESTS
// ============================================

const LIFE_EVENT_QUESTS = {
    birthday: {
        pre_event: [
            {
                title: 'Birthday Wishlist',
                description: 'Share your birthday wishlist and dream gifts',
                reward: { gems: 50, points: 100 },
                trigger_days_before: 14
            },
            {
                title: 'Birthday Prep',
                description: 'Document your birthday celebration planning',
                reward: { gems: 40, points: 80 },
                trigger_days_before: 7
            }
        ],
        during: [
            {
                title: 'Birthday Celebration',
                description: 'Share moments from your special day',
                reward: { gems: 75, points: 150, bonus: 'birthday_badge' },
                trigger: 'same_day'
            }
        ],
        post_event: [
            {
                title: 'Gift Haul',
                description: 'Show off what you received for your birthday',
                reward: { gems: 60, points: 120 },
                trigger_days_after: 1
            }
        ]
    },
    
    anniversary: {
        pre_event: [
            {
                title: 'Anniversary Planning',
                description: 'Share your anniversary celebration plans',
                reward: { gems: 40, points: 80 },
                trigger_days_before: 7
            }
        ],
        during: [
            {
                title: 'Love Celebration',
                description: 'Document your anniversary celebration',
                reward: { gems: 75, points: 150 },
                trigger: 'same_day'
            }
        ]
    },
    
    new_parent: {
        ongoing: [
            {
                title: 'Baby Essentials',
                description: 'Share must-have baby products for new parents',
                reward: { gems: 50, points: 100 },
                trigger: 'first_year'
            },
            {
                title: 'Parenting Milestone',
                description: 'Document a milestone moment with your little one',
                reward: { gems: 60, points: 120 },
                trigger: 'any_milestone'
            }
        ]
    },
    
    new_homeowner: {
        ongoing: [
            {
                title: 'Home Transformation',
                description: 'Share before/after of a home project',
                reward: { gems: 70, points: 140 },
                trigger: 'first_6_months'
            },
            {
                title: 'Housewarming Finds',
                description: 'Show off your favorite new home items',
                reward: { gems: 50, points: 100 },
                trigger: 'first_3_months'
            }
        ]
    }
};

// ============================================
// SEASONAL QUESTS
// ============================================

const SEASONAL_QUESTS = {
    spring: [
        {
            title: 'Spring Refresh',
            description: 'Share your spring cleaning or refresh routine',
            reward: { gems: 40, points: 80 }
        },
        {
            title: 'Outdoor Ready',
            description: 'Show your spring outdoor gear and activities',
            reward: { gems: 35, points: 70 }
        }
    ],
    summer: [
        {
            title: 'Summer Essentials',
            description: 'Share your must-have summer products',
            reward: { gems: 40, points: 80 }
        },
        {
            title: 'Beach Day',
            description: 'Document a beach or pool day',
            reward: { gems: 50, points: 100 }
        },
        {
            title: 'Festival Season',
            description: 'Share festival fashion or experiences',
            reward: { gems: 60, points: 120 }
        }
    ],
    fall: [
        {
            title: 'Cozy Season',
            description: 'Share your cozy fall essentials',
            reward: { gems: 40, points: 80 }
        },
        {
            title: 'Fall Fashion',
            description: 'Show off your autumn style',
            reward: { gems: 45, points: 90 }
        },
        {
            title: 'Halloween Prep',
            description: 'Share costume ideas or decorations',
            reward: { gems: 50, points: 100 },
            month: 10
        }
    ],
    winter: [
        {
            title: 'Winter Wonderland',
            description: 'Document winter activities or cozy moments',
            reward: { gems: 45, points: 90 }
        },
        {
            title: 'Gift Guide',
            description: 'Create a holiday gift guide',
            reward: { gems: 80, points: 160 },
            month: [11, 12]
        },
        {
            title: 'New Year Goals',
            description: 'Share your resolutions or goals for the new year',
            reward: { gems: 50, points: 100 },
            month: 1
        }
    ]
};

// ============================================
// PERSONALIZED QUEST SERVICE
// ============================================

const PersonalizedQuestService = {
    
    /**
     * Generate personalized quests for a user
     */
    async generateQuests(userId, options = {}) {
        const { 
            questType = 'daily', // 'daily', 'weekly', 'monthly'
            count = 3,
            includeSeasonal = true,
            includeLifeEvents = true
        } = options;
        
        try {
            // Fetch user context
            const { data: userContext } = await supabase
                .from('user_context_snapshots')
                .select('*')
                .eq('user_id', userId)
                .order('calculated_at', { ascending: false })
                .limit(1)
                .single();
            
            const demographics = userContext?.demographics || {};
            const upcomingEvents = userContext?.upcoming_personal_events || [];
            const season = this.getCurrentSeason();
            
            let quests = [];
            
            // 1. Demographic-based quests
            const demographicQuests = this.getDemographicQuests(demographics, questType);
            quests.push(...demographicQuests);
            
            // 2. Life event quests
            if (includeLifeEvents) {
                const lifeEventQuests = this.getLifeEventQuests(upcomingEvents);
                quests.push(...lifeEventQuests);
            }
            
            // 3. Seasonal quests
            if (includeSeasonal) {
                const seasonalQuests = this.getSeasonalQuests(season);
                quests.push(...seasonalQuests);
            }
            
            // 4. Time-based quests (based on user schedule)
            const timeQuests = this.getTimeBasedQuests(demographics.work_schedule);
            quests.push(...timeQuests);
            
            // Shuffle and limit
            quests = this.shuffleArray(quests).slice(0, count);
            
            // Add quest metadata
            quests = quests.map((quest, index) => ({
                id: `quest_${userId}_${questType}_${index}_${Date.now()}`,
                ...quest,
                user_id: userId,
                type: questType,
                status: 'available',
                expires_at: this.getExpirationTime(questType),
                created_at: new Date().toISOString()
            }));
            
            return { quests, total: quests.length };
            
        } catch (error) {
            console.error('[PersonalizedQuest] Error generating quests:', error);
            return { quests: [], error: error.message };
        }
    },
    
    /**
     * Get demographic-based quests
     */
    getDemographicQuests(demographics, questType) {
        const quests = [];
        
        // Check each demographic category
        if (demographics.has_children && demographics.content_niches?.includes('parenting')) {
            const parentQuests = DEMOGRAPHIC_QUEST_TEMPLATES.parent[questType] || [];
            quests.push(...parentQuests);
        }
        
        if (demographics.fitness_level && ['moderate', 'active', 'athlete'].includes(demographics.fitness_level)) {
            const fitnessQuests = DEMOGRAPHIC_QUEST_TEMPLATES.fitness[questType] || [];
            quests.push(...fitnessQuests);
        }
        
        if (demographics.content_niches?.includes('food')) {
            const foodQuests = DEMOGRAPHIC_QUEST_TEMPLATES.food[questType] || [];
            quests.push(...foodQuests);
        }
        
        if (demographics.has_pets) {
            const petQuests = DEMOGRAPHIC_QUEST_TEMPLATES.pet[questType] || [];
            quests.push(...petQuests);
        }
        
        if (demographics.education_level === 'some_college' || demographics.content_niches?.includes('lifestyle')) {
            const studentQuests = DEMOGRAPHIC_QUEST_TEMPLATES.student[questType] || [];
            quests.push(...studentQuests);
        }
        
        if (demographics.travel_frequency && demographics.travel_frequency !== 'rarely') {
            const travelQuests = DEMOGRAPHIC_QUEST_TEMPLATES.travel[questType] || [];
            quests.push(...travelQuests);
        }
        
        if (demographics.content_niches?.includes('tech')) {
            const techQuests = DEMOGRAPHIC_QUEST_TEMPLATES.tech[questType] || [];
            quests.push(...techQuests);
        }
        
        return quests;
    },
    
    /**
     * Get life event-based quests
     */
    getLifeEventQuests(upcomingEvents) {
        const quests = [];
        
        for (const event of upcomingEvents) {
            const eventQuests = LIFE_EVENT_QUESTS[event.type];
            if (!eventQuests) continue;
            
            // Check timing
            if (event.days_until <= 14 && event.days_until > 0) {
                // Pre-event quests
                const preQuests = eventQuests.pre_event?.filter(q => 
                    !q.trigger_days_before || event.days_until <= q.trigger_days_before
                ) || [];
                quests.push(...preQuests);
            } else if (event.days_until === 0) {
                // Same-day quests
                const duringQuests = eventQuests.during || [];
                quests.push(...duringQuests);
            } else if (event.days_until >= -3 && event.days_until < 0) {
                // Post-event quests
                const postQuests = eventQuests.post_event?.filter(q =>
                    !q.trigger_days_after || Math.abs(event.days_until) <= q.trigger_days_after
                ) || [];
                quests.push(...postQuests);
            }
        }
        
        return quests;
    },
    
    /**
     * Get seasonal quests
     */
    getSeasonalQuests(season) {
        return SEASONAL_QUESTS[season] || [];
    },
    
    /**
     * Get time-based quests
     */
    getTimeBasedQuests(workSchedule) {
        const quests = [];
        const hour = new Date().getHours();
        
        // Morning quests (6-10 AM)
        if (hour >= 6 && hour <= 10) {
            quests.push({
                title: 'Morning Routine Share',
                description: 'Share your morning routine products or habits',
                reward: { gems: 25, points: 50 },
                category: 'routine',
                time_relevance: 'morning'
            });
        }
        
        // Lunch quests (11 AM - 2 PM)
        if (hour >= 11 && hour <= 14) {
            quests.push({
                title: 'Lunch Break Content',
                description: 'Quick content during your lunch break',
                reward: { gems: 20, points: 40 },
                category: 'quick',
                time_relevance: 'lunch'
            });
        }
        
        // Evening quests (5-9 PM)
        if (hour >= 17 && hour <= 21) {
            quests.push({
                title: 'Evening Wind Down',
                description: 'Share your evening routine or relaxation products',
                reward: { gems: 25, points: 50 },
                category: 'routine',
                time_relevance: 'evening'
            });
        }
        
        // Late night quests (10 PM - 2 AM) - for night shift workers
        if ((hour >= 22 || hour <= 2) && workSchedule === 'night_shift') {
            quests.push({
                title: 'Night Owl Content',
                description: 'Late night thoughts or finds',
                reward: { gems: 30, points: 60 },
                category: 'lifestyle',
                time_relevance: 'night'
            });
        }
        
        return quests;
    },
    
    /**
     * Get current season
     */
    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'fall';
        return 'winter';
    },
    
    /**
     * Get expiration time for quest type
     */
    getExpirationTime(questType) {
        const now = new Date();
        switch (questType) {
            case 'daily':
                return new Date(now.setHours(23, 59, 59, 999)).toISOString();
            case 'weekly':
                const endOfWeek = new Date(now);
                endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
                endOfWeek.setHours(23, 59, 59, 999);
                return endOfWeek.toISOString();
            case 'monthly':
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);
                return endOfMonth.toISOString();
            default:
                return new Date(now.setHours(23, 59, 59, 999)).toISOString();
        }
    },
    
    /**
     * Start a quest for a user
     */
    async startQuest(userId, questId, questData) {
        try {
            const { data, error } = await supabase
                .from('user_quests')
                .insert({
                    user_id: userId,
                    quest_id: questId,
                    quest_data: questData,
                    status: 'active',
                    started_at: new Date().toISOString(),
                    expires_at: questData.expires_at
                })
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, quest: data };
        } catch (error) {
            console.error('[PersonalizedQuest] Error starting quest:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Complete a quest
     */
    async completeQuest(userId, questId, proof = {}) {
        try {
            // Get quest data
            const { data: quest } = await supabase
                .from('user_quests')
                .select('*')
                .eq('user_id', userId)
                .eq('quest_id', questId)
                .single();
            
            if (!quest) {
                return { success: false, error: 'Quest not found' };
            }
            
            // Update quest status
            const { error: updateError } = await supabase
                .from('user_quests')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    proof: proof
                })
                .eq('id', quest.id);
            
            if (updateError) throw updateError;
            
            // Award rewards
            const rewards = quest.quest_data?.reward || {};
            await this.awardQuestRewards(userId, rewards);
            
            return { 
                success: true, 
                rewards,
                message: `Quest completed! +${rewards.gems || 0} gems, +${rewards.points || 0} points`
            };
        } catch (error) {
            console.error('[PersonalizedQuest] Error completing quest:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Award quest rewards
     */
    async awardQuestRewards(userId, rewards) {
        try {
            if (rewards.gems) {
                await supabase.rpc('increment_user_gems', {
                    user_id: userId,
                    amount: rewards.gems
                });
            }
            
            if (rewards.points) {
                await supabase.rpc('increment_user_points', {
                    user_id: userId,
                    amount: rewards.points
                });
            }
        } catch (error) {
            console.error('[PersonalizedQuest] Error awarding rewards:', error);
        }
    },
    
    /**
     * Get user's active quests
     */
    async getActiveQuests(userId) {
        try {
            const { data: quests, error } = await supabase
                .from('user_quests')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['active', 'available'])
                .gte('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return { quests: quests || [], total: quests?.length || 0 };
        } catch (error) {
            console.error('[PersonalizedQuest] Error getting active quests:', error);
            return { quests: [], error: error.message };
        }
    },
    
    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

module.exports = PersonalizedQuestService;
