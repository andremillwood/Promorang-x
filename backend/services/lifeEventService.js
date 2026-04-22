/**
 * Life Event & Contextual Notification Service
 * 
 * Delivers timely, relevant notifications based on user context:
 * - Birthday reminders and celebrations
 * - Seasonal recommendations
 * - Sports/Music event alerts
 * - Holiday campaigns
 * - Weather-based suggestions
 */

const { supabase } = require('../lib/supabase');

// ============================================
// NOTIFICATION SERVICE INTEGRATION
// ============================================

// Placeholder for notification service - integrate with your actual service
const notificationService = {
    async send({ user_id, type, title, body, data, channels = ['push'] }) {
        // Log for now - integrate with your actual notification service
        console.log(`[Notification] ${type} to ${user_id}: ${title}`);
        
        // Store in notification queue
        try {
            await supabase.from('notifications').insert({
                user_id,
                type,
                title,
                body,
                data,
                channels,
                read: false,
                created_at: new Date().toISOString()
            });
        } catch (e) {
            console.error('Failed to store notification:', e);
        }
    },
    
    async sendBatch(notifications) {
        for (const notification of notifications) {
            await this.send(notification);
        }
    }
};

// ============================================
// LIFE EVENT SERVICE
// ============================================

const LifeEventService = {
    
    // ============================================
    // BIRTHDAY REMINDERS
    // ============================================
    
    /**
     * Check for upcoming birthdays and send appropriate notifications
     * Run daily at 9 AM
     */
    async checkBirthdayReminders() {
        console.log('[LifeEventService] Checking birthday reminders...');
        
        try {
            // Get all users with birthdays in the next 30 days
            const { data: birthdayEvents, error } = await supabase
                .from('user_calendar')
                .select(`
                    *,
                    user:users(id, display_name, email, fcm_token, notification_preferences)
                `)
                .in('event_type', ['my_birthday', 'partner_birthday', 'child_birthday'])
                .eq('is_recurring', true);

            if (error) {
                console.error('Error fetching birthday events:', error);
                return;
            }

            const today = new Date();
            const currentYear = today.getFullYear();
            const notifications = [];

            for (const event of birthdayEvents || []) {
                // Calculate next occurrence of this birthday
                const eventMonth = new Date(event.event_date).getMonth();
                const eventDay = new Date(event.event_date).getDate();
                
                let nextBirthday = new Date(currentYear, eventMonth, eventDay);
                if (nextBirthday < today) {
                    nextBirthday = new Date(currentYear + 1, eventMonth, eventDay);
                }
                
                const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
                
                // Check if we should send notification based on notify_days_before
                if (event.notify_days_before?.includes(daysUntil)) {
                    const notification = this.buildBirthdayNotification(event, daysUntil);
                    if (notification) {
                        notifications.push(notification);
                    }
                }
                
                // Special handling for birthday day
                if (daysUntil === 0) {
                    const dayOfNotification = this.buildBirthdayDayNotification(event);
                    notifications.push(dayOfNotification);
                    
                    // Also trigger special birthday drops/offers
                    await this.createBirthdayOffers(event.user_id);
                }
            }

            // Send all notifications
            await notificationService.sendBatch(notifications);
            
            console.log(`[LifeEventService] Sent ${notifications.length} birthday notifications`);
            return { sent: notifications.length };
            
        } catch (error) {
            console.error('[LifeEventService] Error in checkBirthdayReminders:', error);
        }
    },
    
    buildBirthdayNotification(event, daysUntil) {
        const templates = {
            'my_birthday': {
                7: {
                    title: '🎂 Your birthday is in 1 week!',
                    body: 'Get ready to celebrate! We\'ve got special drops coming your way.'
                },
                1: {
                    title: '🎉 Your birthday is tomorrow!',
                    body: 'One more sleep! Check out your birthday surprise waiting for you.'
                }
            },
            'partner_birthday': {
                7: {
                    title: `💕 ${event.title} is in 1 week`,
                    body: 'Need gift ideas? Check out these experiences perfect for your partner.'
                },
                1: {
                    title: `🎁 ${event.title} is tomorrow!`,
                    body: 'Last minute gift ideas and experiences available now.'
                }
            },
            'child_birthday': {
                7: {
                    title: `🎈 ${event.title} is in 1 week`,
                    body: 'Plan the perfect celebration with these family-friendly experiences.'
                },
                1: {
                    title: `🎂 ${event.title} is tomorrow!`,
                    body: 'Make their day special with these last-minute options.'
                }
            }
        };
        
        const template = templates[event.event_type]?.[daysUntil];
        if (!template) return null;
        
        return {
            user_id: event.user_id,
            type: 'birthday_reminder',
            title: template.title,
            body: template.body,
            data: {
                event_id: event.id,
                event_type: event.event_type,
                days_until,
                screen: 'calendar'
            }
        };
    },
    
    buildBirthdayDayNotification(event) {
        const templates = {
            'my_birthday': {
                title: '🎂 Happy Birthday!',
                body: 'It\'s your special day! Claim your birthday reward now 🎁'
            },
            'partner_birthday': {
                title: `🎉 It's ${event.title} today!`,
                body: 'Make today unforgettable with these celebration ideas.'
            },
            'child_birthday': {
                title: `🎈 Happy Birthday to ${event.title}!`,
                body: 'Capture the memories and share the joy!'
            }
        };
        
        const template = templates[event.event_type];
        
        return {
            user_id: event.user_id,
            type: 'birthday_today',
            title: template.title,
            body: template.body,
            data: {
                event_id: event.id,
                event_type: event.event_type,
                screen: 'calendar',
                action: 'claim_birthday_reward'
            }
        };
    },
    
    async createBirthdayOffers(userId) {
        // Create special birthday drops/offers for the user
        try {
            // This would integrate with your drop creation system
            console.log(`[LifeEventService] Creating birthday offers for user ${userId}`);
            
            // Example: Create a special coupon or drop
            // await dropService.createSpecialDrop({
            //     user_id: userId,
            //     type: 'birthday_reward',
            //     gems: 100,
            //     expires_in_days: 7
            // });
            
        } catch (error) {
            console.error('Error creating birthday offers:', error);
        }
    },
    
    // ============================================
    // SEASONAL RECOMMENDATIONS
    // ============================================
    
    /**
     * Send seasonal content recommendations
     * Run weekly on Mondays at 10 AM
     */
    async sendSeasonalRecommendations() {
        console.log('[LifeEventService] Sending seasonal recommendations...');
        
        try {
            // Get current seasonal config
            const month = new Date().getMonth() + 1;
            let currentSeason = 'spring';
            if (month >= 6 && month <= 8) currentSeason = 'summer';
            if (month >= 9 && month <= 11) currentSeason = 'fall';
            if (month === 12 || month <= 2) currentSeason = 'winter';
            
            const { data: seasonalConfig } = await supabase
                .from('seasonal_config')
                .select('*')
                .eq('season', currentSeason)
                .eq('hemisphere', 'northern') // Could determine from user location
                .eq('active', true)
                .single();

            if (!seasonalConfig) {
                console.log('No seasonal config found');
                return;
            }
            
            // Get active users
            const { data: activeUsers, error } = await supabase
                .from('users')
                .select('id, display_name, preferences')
                .eq('is_active', true)
                .limit(1000); // Batch processing

            if (error) throw error;
            
            const notifications = [];
            
            for (const user of activeUsers || []) {
                const notification = this.buildSeasonalNotification(user, seasonalConfig);
                if (notification) {
                    notifications.push(notification);
                }
            }
            
            await notificationService.sendBatch(notifications);
            
            console.log(`[LifeEventService] Sent ${notifications.length} seasonal notifications`);
            return { sent: notifications.length };
            
        } catch (error) {
            console.error('[LifeEventService] Error in sendSeasonalRecommendations:', error);
        }
    },
    
    buildSeasonalNotification(user, config) {
        const seasonEmojis = {
            spring: '🌸',
            summer: '☀️',
            fall: '🍂',
            winter: '❄️'
        };
        
        const seasonTitles = {
            spring: 'Spring into action!',
            summer: 'Summer vibes incoming!',
            fall: 'Fall for these opportunities!',
            winter: 'Winter is here!'
        };
        
        // Personalize based on user interests
        const interests = user.preferences?.interests || [];
        let personalizedBody = config.content_opportunities?.[0] || 'Check out this week\'s opportunities!';
        
        if (interests.includes('fitness') && config.outdoor_activity_weight > 50) {
            personalizedBody = 'Perfect weather for outdoor fitness content! 🏃‍♀️';
        } else if (interests.includes('fashion')) {
            personalizedBody = `New ${config.season} fashion trends to feature in your content! 👗`;
        } else if (interests.includes('food')) {
            personalizedBody = `Seasonal recipes and food experiences trending now! 🍽️`;
        }
        
        return {
            user_id: user.id,
            type: 'seasonal_recommendations',
            title: `${seasonEmojis[config.season]} ${seasonTitles[config.season]}`,
            body: personalizedBody,
            data: {
                season: config.season,
                themes: config.themes,
                screen: 'feed',
                filter: 'seasonal'
            }
        };
    },
    
    // ============================================
    // GLOBAL EVENT ALERTS
    // ============================================
    
    /**
     * Alert users about relevant global events
     * Run weekly on Mondays at 11 AM
     */
    async alertEventOpportunities() {
        console.log('[LifeEventService] Alerting event opportunities...');
        
        try {
            // Get upcoming events in next 30 days
            const { data: upcomingEvents, error } = await supabase
                .from('global_events')
                .select('*')
                .in('status', ['upcoming', 'active'])
                .lte('start_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .gte('start_date', new Date().toISOString().split('T')[0])
                .eq('active', true);

            if (error) throw error;
            
            const notifications = [];
            
            for (const event of upcomingEvents || []) {
                // Find users interested in this event type
                const targetUsers = await this.findInterestedUsers(event);
                
                for (const user of targetUsers) {
                    const notification = this.buildEventNotification(user, event);
                    notifications.push(notification);
                }
            }
            
            await notificationService.sendBatch(notifications);
            
            console.log(`[LifeEventService] Sent ${notifications.length} event notifications`);
            return { sent: notifications.length };
            
        } catch (error) {
            console.error('[LifeEventService] Error in alertEventOpportunities:', error);
        }
    },
    
    async findInterestedUsers(event) {
        // Find users with matching interests, demographics, or subscriptions
        let query = supabase
            .from('users')
            .select('id, display_name, preferences, location_data')
            .eq('is_active', true);
        
        // Filter by country if event is country-specific
        if (event.countries && event.countries.length > 0 && !event.global) {
            // This is a simplified filter - in production you'd use proper geolocation
            query = query.filter('location_data->>country', 'in', `(${event.countries.join(',')})`);
        }
        
        // Could also join with user_event_subscriptions
        const { data: subscribers } = await supabase
            .from('user_event_subscriptions')
            .select('user_id')
            .eq('event_id', event.id);
        
        const subscriberIds = subscribers?.map(s => s.user_id) || [];
        
        // Get users by interests
        const { data: interestUsers } = await supabase
            .from('user_demographics')
            .select('user_id, content_niches, primary_platforms')
            .overlaps('content_niches', event.interests || []);
        
        const interestUserIds = interestUsers?.map(u => u.user_id) || [];
        
        // Combine and deduplicate
        const allUserIds = [...new Set([...subscriberIds, ...interestUserIds])];
        
        if (allUserIds.length === 0) return [];
        
        const { data: users } = await supabase
            .from('users')
            .select('id, display_name, preferences, location_data')
            .in('id', allUserIds)
            .limit(500);
        
        return users || [];
    },
    
    buildEventNotification(user, event) {
        const eventTypeEmojis = {
            sports: '🏆',
            music: '🎵',
            entertainment: '🎬',
            holiday: '🎉',
            cultural: '🌟'
        };
        
        const daysUntil = Math.ceil((new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24));
        
        let body = `${event.name} is coming up!`;
        
        // Personalize based on event type
        if (event.event_type === 'sports') {
            body = `Get paid to create ${event.categories?.[0] || 'sports'} content around ${event.short_name || event.name}!`;
        } else if (event.event_type === 'music') {
            body = `Music content opportunities for ${event.name} - trending now! 🎤`;
        } else if (event.event_type === 'entertainment') {
            body = `Share your ${event.name} reactions and earn rewards! 🎭`;
        }
        
        // Add urgency for close events
        if (daysUntil <= 3) {
            body += ` Starting in ${daysUntil} days!`;
        }
        
        return {
            user_id: user.id,
            type: 'event_opportunity',
            title: `${eventTypeEmojis[event.event_type] || '📅'} ${event.short_name || event.name}`,
            body: body,
            data: {
                event_id: event.id,
                event_type: event.event_type,
                days_until: daysUntil,
                screen: 'global_events',
                suggested_hashtags: event.suggested_hashtags
            }
        };
    },
    
    // ============================================
    // HOLIDAY CAMPAIGNS
    // ============================================
    
    /**
     * Trigger holiday-specific campaigns
     * Run daily during holiday seasons
     */
    async triggerHolidayCampaigns() {
        console.log('[LifeEventService] Triggering holiday campaigns...');
        
        try {
            // Get upcoming holidays in next 14 days
            const { data: upcomingHolidays, error } = await supabase
                .from('global_events')
                .select('*')
                .eq('event_type', 'holiday')
                .lte('start_date', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .gte('start_date', new Date().toISOString().split('T')[0])
                .eq('active', true);

            if (error) throw error;
            
            for (const holiday of upcomingHolidays || []) {
                await this.processHolidayCampaign(holiday);
            }
            
            console.log(`[LifeEventService] Processed ${upcomingHolidays?.length || 0} holiday campaigns`);
            return { processed: upcomingHolidays?.length || 0 };
            
        } catch (error) {
            console.error('[LifeEventService] Error in triggerHolidayCampaigns:', error);
        }
    },
    
    async processHolidayCampaign(holiday) {
        const daysUntil = Math.ceil((new Date(holiday.start_date) - new Date()) / (1000 * 60 * 60 * 24));
        
        // Find users who celebrate this holiday
        // Based on country, cultural background, or past engagement
        let targetQuery = supabase
            .from('users')
            .select('id, display_name, preferences');
        
        if (holiday.countries) {
            // Simplified country targeting
            const { data: countryUsers } = await supabase
                .from('user_demographics')
                .select('user_id')
                .in('country_origin', holiday.countries);
            
            const userIds = countryUsers?.map(u => u.user_id) || [];
            if (userIds.length > 0) {
                targetQuery = targetQuery.in('id', userIds);
            }
        }
        
        const { data: targetUsers } = await targetQuery.limit(1000);
        
        const notifications = [];
        
        for (const user of targetUsers || []) {
            const notification = this.buildHolidayNotification(user, holiday, daysUntil);
            notifications.push(notification);
        }
        
        await notificationService.sendBatch(notifications);
        
        // Also create holiday-specific drops/campaigns
        await this.createHolidayDrops(holiday);
    },
    
    buildHolidayNotification(user, holiday, daysUntil) {
        const holidayEmojis = {
            'Christmas': '🎄',
            'New Year': '🎆',
            'Thanksgiving': '🦃',
            'Valentine': '💕',
            'Halloween': '🎃',
            'Diwali': '🪔',
            'Lunar New Year': '🧧',
            'Eid': '🌙'
        };
        
        const emoji = Object.entries(holidayEmojis).find(([key]) => 
            holiday.name.includes(key)
        )?.[1] || '🎉';
        
        let body;
        if (daysUntil === 0) {
            body = `Happy ${holiday.short_name || holiday.name}! Enjoy special holiday drops today!`;
        } else if (daysUntil === 1) {
            body = `${holiday.short_name || holiday.name} is tomorrow! Get ready with these opportunities.`;
        } else {
            body = `${daysUntil} days until ${holiday.short_name || holiday.name}! Plan your content now.`;
        }
        
        return {
            user_id: user.id,
            type: 'holiday_campaign',
            title: `${emoji} ${holiday.short_name || holiday.name} ${daysUntil === 0 ? 'is here!' : 'coming up!'}`,
            body: body,
            data: {
                holiday_id: holiday.id,
                holiday_name: holiday.name,
                days_until: daysUntil,
                screen: 'holiday_drops',
                suggested_hashtags: holiday.suggested_hashtags
            }
        };
    },
    
    async createHolidayDrops(holiday) {
        // Create targeted drops for this holiday
        console.log(`[LifeEventService] Creating holiday drops for ${holiday.name}`);
        
        // This would integrate with your campaign/drop creation system
        // Example: Create holiday-themed drops
    },
    
    // ============================================
    // WEATHER-BASED TARGETING
    // ============================================
    
    /**
     * Send weather-based recommendations
     * Run daily at 8 AM (after weather data update)
     */
    async sendWeatherBasedRecommendations() {
        console.log('[LifeEventService] Sending weather recommendations...');
        
        // This would integrate with a weather API
        // For now, we'll use seasonal data as a proxy
        
        try {
            const month = new Date().getMonth() + 1;
            const isSummer = month >= 6 && month <= 8;
            const isWinter = month === 12 || month <= 2;
            
            const { data: users, error } = await supabase
                .from('users')
                .select('id, display_name, preferences, location_data')
                .eq('is_active', true)
                .limit(500);

            if (error) throw error;
            
            const notifications = [];
            
            for (const user of users || []) {
                // Get seasonal config for user's location
                const hemisphere = user.location_data?.latitude > 0 ? 'northern' : 'southern';
                
                const { data: seasonalConfig } = await supabase
                    .from('seasonal_config')
                    .select('*')
                    .eq('hemisphere', hemisphere)
                    .eq('active', true)
                    .single();
                
                if (seasonalConfig) {
                    const notification = this.buildWeatherNotification(user, seasonalConfig);
                    if (notification) {
                        notifications.push(notification);
                    }
                }
            }
            
            await notificationService.sendBatch(notifications);
            
            console.log(`[LifeEventService] Sent ${notifications.length} weather-based notifications`);
            return { sent: notifications.length };
            
        } catch (error) {
            console.error('[LifeEventService] Error in sendWeatherBasedRecommendations:', error);
        }
    },
    
    buildWeatherNotification(user, config) {
        const interests = user.preferences?.interests || [];
        
        // Only send if there are relevant opportunities
        if (config.outdoor_activity_weight > 70 && interests.includes('fitness')) {
            return {
                user_id: user.id,
                type: 'weather_recommendation',
                title: '☀️ Perfect day for outdoor content!',
                body: 'Great weather for outdoor fitness and adventure content. Capture the moment!',
                data: {
                    recommendation_type: 'outdoor',
                    screen: 'feed',
                    filter: 'outdoor'
                }
            };
        }
        
        if (config.indoor_activity_weight > 70) {
            return {
                user_id: user.id,
                type: 'weather_recommendation',
                title: '🏠 Great day for indoor content',
                body: 'Perfect weather to focus on indoor activities and cozy content creation.',
                data: {
                    recommendation_type: 'indoor',
                    screen: 'feed',
                    filter: 'indoor'
                }
            };
        }
        
        return null;
    },
    
    // ============================================
    // ANNIVERSARY REMINDERS
    // ============================================
    
    /**
     * Check for upcoming anniversaries
     */
    async checkAnniversaryReminders() {
        console.log('[LifeEventService] Checking anniversary reminders...');
        
        try {
            const { data: anniversaryEvents, error } = await supabase
                .from('user_calendar')
                .select(`
                    *,
                    user:users(id, display_name, email)
                `)
                .eq('event_type', 'anniversary')
                .eq('is_recurring', true);

            if (error) throw error;
            
            const today = new Date();
            const notifications = [];
            
            for (const event of anniversaryEvents || []) {
                const eventMonth = new Date(event.event_date).getMonth();
                const eventDay = new Date(event.event_date).getDate();
                const currentYear = today.getFullYear();
                
                let nextAnniversary = new Date(currentYear, eventMonth, eventDay);
                if (nextAnniversary < today) {
                    nextAnniversary = new Date(currentYear + 1, eventMonth, eventDay);
                }
                
                const daysUntil = Math.ceil((nextAnniversary - today) / (1000 * 60 * 60 * 24));
                
                if (event.notify_days_before?.includes(daysUntil)) {
                    notifications.push({
                        user_id: event.user_id,
                        type: 'anniversary_reminder',
                        title: daysUntil === 0 ? '💕 Happy Anniversary!' : `💕 Anniversary in ${daysUntil} days`,
                        body: daysUntil === 0 
                            ? 'Celebrate your special day with these romantic experiences!'
                            : `Plan something special for your ${event.title}. Check out these ideas!`,
                        data: {
                            event_id: event.id,
                            days_until: daysUntil,
                            screen: 'calendar'
                        }
                    });
                }
            }
            
            await notificationService.sendBatch(notifications);
            
            console.log(`[LifeEventService] Sent ${notifications.length} anniversary notifications`);
            return { sent: notifications.length };
            
        } catch (error) {
            console.error('[LifeEventService] Error in checkAnniversaryReminders:', error);
        }
    },
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
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
     * Get current season for a location
     */
    getCurrentSeason(latitude = 40) {
        const month = new Date().getMonth() + 1;
        const isNorthern = latitude >= 0;
        
        if (isNorthern) {
            if (month >= 3 && month <= 5) return 'spring';
            if (month >= 6 && month <= 8) return 'summer';
            if (month >= 9 && month <= 11) return 'fall';
            return 'winter';
        } else {
            if (month >= 3 && month <= 5) return 'fall';
            if (month >= 6 && month <= 8) return 'winter';
            if (month >= 9 && month <= 11) return 'spring';
            return 'summer';
        }
    }
};

module.exports = LifeEventService;
