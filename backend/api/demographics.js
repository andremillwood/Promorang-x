/**
 * User Demographics & Personal Context API
 * 
 * Manages user demographic data, life events, and personal context
 * for personalized content targeting and recommendations.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// ============================================
// DEMOGRAPHICS
// ============================================

/**
 * GET /api/users/me/demographics
 * Get current user's demographic profile
 */
router.get('/me/demographics', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const { data, error } = await supabase
            .from('user_demographics')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            throw error;
        }

        res.json({
            success: true,
            demographics: data || null,
            is_complete: data?.profile_completion_score >= 50
        });
    } catch (error) {
        console.error('Error fetching demographics:', error);
        res.status(500).json({ error: 'Failed to fetch demographics' });
    }
});

/**
 * POST /api/users/me/demographics
 * Create or update user demographic profile
 */
router.post('/me/demographics', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            gender,
            gender_identity,
            marital_status,
            relationship_type,
            birthday,
            has_children,
            children_count,
            children_ages,
            household_size,
            living_situation,
            has_pets,
            pet_types,
            country_origin,
            languages_spoken,
            religion,
            cultural_background,
            industry_sector,
            work_schedule,
            remote_work,
            commute_type,
            fitness_level,
            dietary_preferences,
            drinking_habits,
            smoking_status,
            primary_platforms,
            content_niches,
            creator_ambitions
        } = req.body;

        // Build update object with only provided fields
        const demographics = {
            user_id: userId,
            ...(gender !== undefined && { gender }),
            ...(gender_identity !== undefined && { gender_identity }),
            ...(marital_status !== undefined && { marital_status }),
            ...(relationship_type !== undefined && { relationship_type }),
            ...(birthday !== undefined && { birthday }),
            ...(has_children !== undefined && { has_children }),
            ...(children_count !== undefined && { children_count }),
            ...(children_ages !== undefined && { children_ages }),
            ...(household_size !== undefined && { household_size }),
            ...(living_situation !== undefined && { living_situation }),
            ...(has_pets !== undefined && { has_pets }),
            ...(pet_types !== undefined && { pet_types }),
            ...(country_origin !== undefined && { country_origin }),
            ...(languages_spoken !== undefined && { languages_spoken }),
            ...(religion !== undefined && { religion }),
            ...(cultural_background !== undefined && { cultural_background }),
            ...(industry_sector !== undefined && { industry_sector }),
            ...(work_schedule !== undefined && { work_schedule }),
            ...(remote_work !== undefined && { remote_work }),
            ...(commute_type !== undefined && { commute_type }),
            ...(fitness_level !== undefined && { fitness_level }),
            ...(dietary_preferences !== undefined && { dietary_preferences }),
            ...(drinking_habits !== undefined && { drinking_habits }),
            ...(smoking_status !== undefined && { smoking_status }),
            ...(primary_platforms !== undefined && { primary_platforms }),
            ...(content_niches !== undefined && { content_niches }),
            ...(creator_ambitions !== undefined && { creator_ambitions })
        };

        // Upsert demographics
        const { data, error } = await supabase
            .from('user_demographics')
            .upsert(demographics, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;

        // Award points for completing profile sections
        const { data: userData } = await supabase
            .from('users')
            .select('points_balance')
            .eq('id', userId)
            .single();

        const basePoints = 50;
        const completionBonus = data.profile_completion_score >= 80 ? 100 : 0;
        const totalPoints = basePoints + completionBonus;

        if (totalPoints > 0) {
            await supabase
                .from('users')
                .update({ 
                    points_balance: (userData?.points_balance || 0) + totalPoints 
                })
                .eq('id', userId);
        }

        res.json({
            success: true,
            demographics: data,
            points_awarded: totalPoints,
            completion_score: data.profile_completion_score,
            message: completionBonus > 0 
                ? `Profile updated! +${totalPoints} points for detailed profile`
                : `Profile updated! +${totalPoints} points`
        });
    } catch (error) {
        console.error('Error updating demographics:', error);
        res.status(500).json({ error: 'Failed to update demographics' });
    }
});

/**
 * GET /api/users/me/demographics/completion
 * Get profile completion status
 */
router.get('/me/demographics/completion', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const { data, error } = await supabase
            .from('user_profile_completion')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        // Calculate next suggested field to fill
        const missingFields = [];
        if (!data.has_birthday) missingFields.push('birthday');
        if (!data.has_gender) missingFields.push('gender');
        if (!data.has_marital_status) missingFields.push('marital_status');
        if (!data.has_children_info) missingFields.push('children_info');
        if (!data.has_fitness_info) missingFields.push('fitness_level');
        if (!data.has_content_niches) missingFields.push('content_niches');

        res.json({
            success: true,
            completion: {
                score: data.completion_score,
                is_complete: data.completion_score >= 50,
                fields_filled: {
                    birthday: data.has_birthday,
                    gender: data.has_gender,
                    marital_status: data.has_marital_status,
                    children_info: data.has_children_info,
                    fitness_info: data.has_fitness_info,
                    content_niches: data.has_content_niches
                },
                calendar_events: data.calendar_events_count,
                missing_fields: missingFields,
                next_suggestion: missingFields[0] || null
            }
        });
    } catch (error) {
        console.error('Error fetching completion:', error);
        res.status(500).json({ error: 'Failed to fetch completion status' });
    }
});

// ============================================
// PERSONAL CALENDAR
// ============================================

/**
 * GET /api/users/me/calendar
 * Get user's personal calendar events
 */
router.get('/me/calendar', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { upcoming } = req.query; // 'true' to get only upcoming events
        
        let query = supabase
            .from('user_calendar')
            .select('*')
            .eq('user_id', userId)
            .order('event_date', { ascending: true });

        if (upcoming === 'true') {
            query = query.gte('event_date', new Date().toISOString().split('T')[0]);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Add days_until for each event
        const eventsWithContext = data?.map(event => {
            const eventDate = new Date(event.event_date);
            const today = new Date();
            const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            
            return {
                ...event,
                days_until: daysUntil,
                is_upcoming: daysUntil >= 0 && daysUntil <= 30,
                is_today: daysUntil === 0
            };
        }) || [];

        res.json({
            success: true,
            events: eventsWithContext,
            upcoming_count: eventsWithContext.filter(e => e.is_upcoming).length
        });
    } catch (error) {
        console.error('Error fetching calendar:', error);
        res.status(500).json({ error: 'Failed to fetch calendar' });
    }
});

/**
 * POST /api/users/me/calendar
 * Add event to personal calendar
 */
router.post('/me/calendar', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            event_type,
            title,
            description,
            event_date,
            is_recurring,
            notify_days_before,
            gift_hints,
            relation_to_user
        } = req.body;

        // Validation
        if (!event_type || !title || !event_date) {
            return res.status(400).json({ 
                error: 'event_type, title, and event_date are required' 
            });
        }

        const validTypes = ['my_birthday', 'partner_birthday', 'anniversary', 'child_birthday',
            'friend_birthday', 'pet_birthday', 'work_anniversary', 'subscribed_global', 'custom'];
        
        if (!validTypes.includes(event_type)) {
            return res.status(400).json({ 
                error: 'Invalid event_type',
                valid_types: validTypes
            });
        }

        // Check for duplicate my_birthday
        if (event_type === 'my_birthday') {
            const { data: existing } = await supabase
                .from('user_calendar')
                .select('id')
                .eq('user_id', userId)
                .eq('event_type', 'my_birthday')
                .single();

            if (existing) {
                return res.status(409).json({ 
                    error: 'Birthday already exists. Use PUT to update.' 
                });
            }
        }

        const { data, error } = await supabase
            .from('user_calendar')
            .insert({
                user_id: userId,
                event_type,
                title,
                description,
                event_date,
                is_recurring: is_recurring !== false, // Default true
                notify_days_before: notify_days_before || [7, 1],
                gift_hints,
                relation_to_user
            })
            .select()
            .single();

        if (error) throw error;

        // Award points for adding life events
        await supabase
            .from('users')
            .update({ 
                points_balance: supabase.rpc('increment_points', { amount: 25 })
            })
            .eq('id', userId);

        res.json({
            success: true,
            event: data,
            points_awarded: 25,
            message: 'Event added to your calendar! +25 points'
        });
    } catch (error) {
        console.error('Error adding calendar event:', error);
        res.status(500).json({ error: 'Failed to add calendar event' });
    }
});

/**
 * PUT /api/users/me/calendar/:id
 * Update calendar event
 */
router.put('/me/calendar/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;
        const updates = req.body;

        // Verify ownership
        const { data: existing } = await supabase
            .from('user_calendar')
            .select('*')
            .eq('id', eventId)
            .eq('user_id', userId)
            .single();

        if (!existing) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const { data, error } = await supabase
            .from('user_calendar')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', eventId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            event: data,
            message: 'Event updated'
        });
    } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ error: 'Failed to update calendar event' });
    }
});

/**
 * DELETE /api/users/me/calendar/:id
 * Remove calendar event
 */
router.delete('/me/calendar/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;

        const { error } = await supabase
            .from('user_calendar')
            .delete()
            .eq('id', eventId)
            .eq('user_id', userId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Event removed from calendar'
        });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ error: 'Failed to delete calendar event' });
    }
});

// ============================================
// GLOBAL EVENTS
// ============================================

/**
 * GET /api/global-events
 * Get global events with filtering
 */
router.get('/global-events', optionalAuth, async (req, res) => {
    try {
        const { 
            type, 
            upcoming, 
            country, 
            category,
            limit = 20,
            offset = 0 
        } = req.query;

        let query = supabase
            .from('active_global_events')
            .select('*');

        if (type) {
            query = query.eq('event_type', type);
        }

        if (country) {
            query = query.or(`global.eq.true,countries.cs.{${country}}`);
        }

        if (category) {
            query = query.contains('categories', [category]);
        }

        const { data, error } = await query
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (error) throw error;

        res.json({
            success: true,
            events: data || [],
            count: data?.length || 0,
            filters: { type, upcoming, country, category }
        });
    } catch (error) {
        console.error('Error fetching global events:', error);
        res.status(500).json({ error: 'Failed to fetch global events' });
    }
});

/**
 * GET /api/global-events/:id
 * Get specific global event
 */
router.get('/global-events/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('global_events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is subscribed
        let isSubscribed = false;
        if (req.user) {
            const { data: sub } = await supabase
                .from('user_event_subscriptions')
                .select('id')
                .eq('user_id', req.user.id)
                .eq('event_id', id)
                .single();
            isSubscribed = !!sub;
        }

        res.json({
            success: true,
            event: {
                ...data,
                is_subscribed: isSubscribed
            }
        });
    } catch (error) {
        console.error('Error fetching global event:', error);
        res.status(500).json({ error: 'Failed to fetch global event' });
    }
});

/**
 * POST /api/global-events/:id/subscribe
 * Subscribe to global event notifications
 */
router.post('/global-events/:id/subscribe', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;
        const { notification_days_before, notification_channels } = req.body;

        // Check if event exists
        const { data: event } = await supabase
            .from('global_events')
            .select('id, name')
            .eq('id', eventId)
            .single();

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Add to calendar as subscribed_global event
        const { data, error } = await supabase
            .from('user_event_subscriptions')
            .upsert({
                user_id: userId,
                event_id: eventId,
                notification_days_before: notification_days_before || [7, 1],
                notification_channels: notification_channels || ['push', 'email']
            }, { onConflict: 'user_id,event_id' })
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            subscription: data,
            message: `You'll be notified about ${event.name}`
        });
    } catch (error) {
        console.error('Error subscribing to event:', error);
        res.status(500).json({ error: 'Failed to subscribe to event' });
    }
});

/**
 * DELETE /api/global-events/:id/subscribe
 * Unsubscribe from global event
 */
router.delete('/global-events/:id/subscribe', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;

        const { error } = await supabase
            .from('user_event_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('event_id', eventId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Unsubscribed from event notifications'
        });
    } catch (error) {
        console.error('Error unsubscribing from event:', error);
        res.status(500).json({ error: 'Failed to unsubscribe from event' });
    }
});

// ============================================
// PROFILING QUESTIONS
// ============================================

/**
 * GET /api/profiling-questions
 * Get profiling questions for progressive data collection
 */
router.get('/profiling-questions', requireAuth, async (req, res) => {
    try {
        const { category, priority } = req.query;
        const userId = req.user.id;

        // Get all active questions
        let query = supabase
            .from('profiling_questions')
            .select('*')
            .eq('active', true)
            .order('priority', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        const { data: questions, error } = await query;

        if (error) throw error;

        // Get user's current demographics to filter out completed questions
        const { data: demographics } = await supabase
            .from('user_demographics')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Filter out questions for fields already filled
        const unansweredQuestions = questions?.filter(q => {
            if (!demographics) return true;
            
            const field = q.field_mapping;
            if (!field) return true;
            
            const value = demographics[field];
            
            // Check if value exists and is not empty
            if (value === null || value === undefined) return true;
            if (Array.isArray(value) && value.length === 0) return true;
            if (value === '') return true;
            
            return false;
        }) || [];

        res.json({
            success: true,
            questions: unansweredQuestions,
            total_available: questions?.length || 0,
            remaining: unansweredQuestions.length,
            next_question: unansweredQuestions[0] || null
        });
    } catch (error) {
        console.error('Error fetching profiling questions:', error);
        res.status(500).json({ error: 'Failed to fetch profiling questions' });
    }
});

// ============================================
// USER CONTEXT
// ============================================

/**
 * GET /api/users/me/context
 * Get current contextual data for personalization
 */
router.get('/me/context', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get or calculate user context
        const { data: existingContext } = await supabase
            .from('user_context_snapshots')
            .select('*')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (existingContext) {
            return res.json({
                success: true,
                context: existingContext,
                cached: true
            });
        }

        // Calculate fresh context
        const { data: demographics } = await supabase
            .from('user_demographics')
            .select('*')
            .eq('user_id', userId)
            .single();

        const { data: calendar } = await supabase
            .from('user_calendar')
            .select('*')
            .eq('user_id', userId)
            .gte('event_date', new Date().toISOString().split('T')[0])
            .lte('event_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        // Calculate age and age group
        let currentAge = null;
        let ageGroup = null;
        if (demographics?.birthday) {
            const birthDate = new Date(demographics.birthday);
            const today = new Date();
            currentAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            
            if (currentAge < 26) ageGroup = 'gen_z';
            else if (currentAge < 42) ageGroup = 'millennial';
            else if (currentAge < 58) ageGroup = 'gen_x';
            else ageGroup = 'boomer';
        }

        // Get upcoming global events
        const { data: globalEvents } = await supabase
            .from('active_global_events')
            .select('*')
            .limit(10);

        // Determine current season based on user's likely hemisphere
        // (This is a simple approximation - could be improved with actual geolocation)
        const month = new Date().getMonth() + 1;
        let currentSeason = 'spring';
        if (month >= 6 && month <= 8) currentSeason = 'summer';
        if (month >= 9 && month <= 11) currentSeason = 'fall';
        if (month === 12 || month <= 2) currentSeason = 'winter';

        // Find next holiday
        const nextHoliday = globalEvents?.find(e => e.event_type === 'holiday');

        const context = {
            user_id: userId,
            current_season: currentSeason,
            hemisphere: 'northern', // Could be determined from user location
            local_weather: null, // Would need weather API integration
            temperature: null,
            upcoming_personal_events: calendar || [],
            upcoming_global_events: globalEvents || [],
            next_holiday_name: nextHoliday?.name || null,
            next_holiday_date: nextHoliday?.start_date || null,
            days_until_holiday: nextHoliday ? 
                Math.ceil((new Date(nextHoliday.start_date) - new Date()) / (1000 * 60 * 60 * 24)) : null,
            current_age: currentAge,
            age_group: ageGroup,
            calculated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour cache
        };

        // Save context snapshot
        await supabase
            .from('user_context_snapshots')
            .upsert(context, { onConflict: 'user_id' });

        res.json({
            success: true,
            context,
            cached: false
        });
    } catch (error) {
        console.error('Error fetching user context:', error);
        res.status(500).json({ error: 'Failed to fetch user context' });
    }
});

// ============================================
// TARGETING & RECOMMENDATIONS
// ============================================

/**
 * GET /api/users/me/targeting-profile
 * Get compiled targeting profile for ad/content matching
 */
router.get('/me/targeting-profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all relevant data
        const [{ data: demographics }, { data: calendar }, { data: preferences }] = await Promise.all([
            supabase.from('user_demographics').select('*').eq('user_id', userId).single(),
            supabase.from('user_calendar').select('*').eq('user_id', userId),
            supabase.from('users').select('preferences, location_data').eq('id', userId).single()
        ]);

        // Build targeting profile
        const targetingProfile = {
            // Demographics
            age: demographics?.birthday ? 
                Math.floor((new Date() - new Date(demographics.birthday)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
            gender: demographics?.gender,
            marital_status: demographics?.marital_status,
            has_children: demographics?.has_children,
            household_size: demographics?.household_size,
            
            // Location
            country: preferences?.location_data?.country,
            city: preferences?.location_data?.city,
            timezone: preferences?.location_data?.timezone,
            
            // Interests
            interests: preferences?.preferences?.interests || [],
            content_niches: demographics?.content_niches || [],
            fitness_level: demographics?.fitness_level,
            dietary_preferences: demographics?.dietary_preferences,
            
            // Life stage
            life_events_30d: calendar?.filter(e => {
                const daysUntil = Math.ceil((new Date(e.event_date) - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntil >= 0 && daysUntil <= 30;
            }).map(e => ({
                type: e.event_type,
                title: e.title,
                days_until: Math.ceil((new Date(e.event_date) - new Date()) / (1000 * 60 * 60 * 24))
            })) || [],
            
            // Seasonal context
            current_season: (() => {
                const month = new Date().getMonth() + 1;
                if (month >= 3 && month <= 5) return 'spring';
                if (month >= 6 && month <= 8) return 'summer';
                if (month >= 9 && month <= 11) return 'fall';
                return 'winter';
            })(),
            
            // Platform usage
            primary_platforms: demographics?.primary_platforms || [],
            creator_ambitions: demographics?.creator_ambitions
        };

        res.json({
            success: true,
            targeting_profile: targetingProfile,
            segments: generateAudienceSegments(targetingProfile)
        });
    } catch (error) {
        console.error('Error generating targeting profile:', error);
        res.status(500).json({ error: 'Failed to generate targeting profile' });
    }
});

// Helper function to generate audience segments
function generateAudienceSegments(profile) {
    const segments = [];
    
    // Age segments
    if (profile.age !== null) {
        if (profile.age < 25) segments.push('young_adults');
        else if (profile.age < 35) segments.push('millennials');
        else if (profile.age < 50) segments.push('gen_x');
        else segments.push('mature_audience');
    }
    
    // Life stage segments
    if (profile.marital_status === 'single') segments.push('singles');
    if (profile.marital_status === 'married' || profile.marital_status === 'partnership') segments.push('couples');
    if (profile.has_children) segments.push('parents');
    
    // Interest segments
    if (profile.content_niches?.includes('parenting')) segments.push('family_content_creators');
    if (profile.content_niches?.includes('fitness')) segments.push('fitness_enthusiasts');
    if (profile.content_niches?.includes('fashion')) segments.push('fashion_creators');
    if (profile.content_niches?.includes('tech')) segments.push('tech_enthusiasts');
    
    // Event-based segments
    const hasBirthdaySoon = profile.life_events_30d?.some(e => e.type === 'my_birthday');
    if (hasBirthdaySoon) segments.push('birthday_coming_up');
    
    const hasAnniversarySoon = profile.life_events_30d?.some(e => e.type === 'anniversary');
    if (hasAnniversarySoon) segments.push('anniversary_coming_up');
    
    return segments;
}

module.exports = router;
