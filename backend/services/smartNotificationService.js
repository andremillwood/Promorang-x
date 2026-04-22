/**
 * SMART NOTIFICATION SERVICE
 * 
 * Optimizes notification timing based on user demographics, schedule, and engagement patterns
 */

const { supabase } = require('../lib/supabase');

// ============================================
// USER SEGMENT DEFINITIONS
// ============================================

const USER_SEGMENTS = {
    parents: {
        label: 'Parents',
        identifiers: {
            has_children: true
        },
        optimal_times: [
            { start: '09:00', end: '14:00', label: 'school_hours', weight: 1.0 },
            { start: '20:00', end: '22:00', label: 'after_bedtime', weight: 0.9 },
            { start: '06:00', end: '08:00', label: 'morning_rush', weight: 0.6 }
        ],
        avoid_times: [
            { start: '15:00', end: '19:00', label: 'after_school_chaos' },
            { start: '17:00', end: '18:30', label: 'dinner_prep' }
        ]
    },
    
    students: {
        label: 'Students',
        identifiers: {
            education_level: ['high_school', 'some_college', 'bachelors', 'masters', 'doctorate'],
            work_schedule: ['flexible', 'unemployed']
        },
        optimal_times: [
            { start: '12:00', end: '14:00', label: 'lunch_break', weight: 1.0 },
            { start: '18:00', end: '23:00', label: 'evening_free_time', weight: 0.95 },
            { start: '08:00', end: '10:00', label: 'morning_classes', weight: 0.7 }
        ],
        avoid_times: [
            { start: '08:00', end: '16:00', label: 'class_hours_high' }
        ]
    },
    
    '9_to_5_workers': {
        label: '9-5 Workers',
        identifiers: {
            work_schedule: ['day_shift', 'remote']
        },
        optimal_times: [
            { start: '07:00', end: '08:30', label: 'morning_commute', weight: 0.9 },
            { start: '12:00', end: '13:00', label: 'lunch_break', weight: 0.85 },
            { start: '17:30', end: '19:00', label: 'evening_commute', weight: 0.9 },
            { start: '20:00', end: '22:00', label: 'evening_relaxation', weight: 1.0 }
        ],
        avoid_times: [
            { start: '09:00', end: '17:00', label: 'work_hours' }
        ]
    },
    
    night_shift: {
        label: 'Night Shift Workers',
        identifiers: {
            work_schedule: 'night_shift'
        },
        optimal_times: [
            { start: '14:00', end: '17:00', label: 'pre_work_afternoon', weight: 1.0 },
            { start: '02:00', end: '04:00', label: 'night_break', weight: 0.7 },
            { start: '09:00', end: '12:00', label: 'post_work_morning', weight: 0.9 }
        ],
        avoid_times: [
            { start: '18:00', end: '02:00', label: 'work_hours' }
        ]
    },
    
    fitness_enthusiasts: {
        label: 'Fitness Enthusiasts',
        identifiers: {
            fitness_level: ['active', 'athlete']
        },
        optimal_times: [
            { start: '05:30', end: '07:30', label: 'early_workout', weight: 1.0 },
            { start: '17:00', end: '19:00', label: 'post_work_workout', weight: 0.95 },
            { start: '12:00', end: '13:30', label: 'lunch_workout', weight: 0.8 }
        ],
        avoid_times: []
    },
    
    remote_workers: {
        label: 'Remote Workers',
        identifiers: {
            work_schedule: 'remote'
        },
        optimal_times: [
            { start: '09:00', end: '11:00', label: 'morning_focus', weight: 0.7 },
            { start: '12:00', end: '14:00', label: 'lunch_break', weight: 1.0 },
            { start: '15:00', end: '16:00', label: 'afternoon_break', weight: 0.8 },
            { start: '18:00', end: '21:00', label: 'post_work', weight: 0.9 }
        ],
        avoid_times: [
            { start: '10:00', end: '12:00', label: 'deep_work_morning' },
            { start: '14:00', end: '16:00', label: 'deep_work_afternoon' }
        ]
    },
    
    retirees: {
        label: 'Retirees',
        identifiers: {
            work_schedule: 'retired'
        },
        optimal_times: [
            { start: '09:00', end: '11:00', label: 'morning_leisure', weight: 1.0 },
            { start: '14:00', end: '16:00', label: 'afternoon_relaxation', weight: 0.95 },
            { start: '19:00', end: '21:00', label: 'evening', weight: 0.8 }
        ],
        avoid_times: [
            { start: '12:00', end: '14:00', label: 'lunch_nap_time' },
            { start: '22:00', end: '06:00', label: 'sleep_hours' }
        ]
    }
};

// ============================================
// SMART NOTIFICATION SERVICE
// ============================================

const SmartNotificationService = {
    
    /**
     * Determine optimal notification time for a user
     */
    async getOptimalNotificationTime(userId, notificationType = 'general', options = {}) {
        try {
            // Fetch user context
            const { data: context } = await supabase
                .from('user_context_snapshots')
                .select(`
                    demographics,
                    engagement_patterns
                `)
                .eq('user_id', userId)
                .order('calculated_at', { ascending: false })
                .limit(1)
                .single();
            
            const demographics = context?.demographics || {};
            const engagementPatterns = context?.engagement_patterns || {};
            
            // Determine user segments
            const segments = this.identifyUserSegments(demographics);
            
            // Get optimal times based on segments
            let optimalTimes = [];
            for (const segment of segments) {
                const segmentData = USER_SEGMENTS[segment];
                if (segmentData) {
                    optimalTimes.push(...segmentData.optimal_times);
                }
            }
            
            // Merge with personal engagement patterns
            if (engagementPatterns.optimal_hours) {
                optimalTimes = this.mergeEngagementPatterns(optimalTimes, engagementPatterns.optimal_hours);
            }
            
            // Apply notification type weights
            optimalTimes = this.applyNotificationTypeWeights(optimalTimes, notificationType);
            
            // Sort by weight and return best times
            optimalTimes.sort((a, b) => b.weight - a.weight);
            
            // Get next available slot
            const nextSlot = this.getNextAvailableSlot(optimalTimes, options);
            
            return {
                optimal_time: nextSlot,
                alternative_times: optimalTimes.slice(1, 4),
                segments: segments,
                confidence: this.calculateConfidence(segments, engagementPatterns)
            };
            
        } catch (error) {
            console.error('[SmartNotification] Error getting optimal time:', error);
            return { 
                optimal_time: null, 
                error: error.message,
                fallback: this.getDefaultTime()
            };
        }
    },
    
    /**
     * Identify which user segments a user belongs to
     */
    identifyUserSegments(demographics) {
        const segments = [];
        
        for (const [segmentKey, segmentData] of Object.entries(USER_SEGMENTS)) {
            const identifiers = segmentData.identifiers;
            let matches = true;
            
            for (const [key, value] of Object.entries(identifiers)) {
                const userValue = demographics[key];
                
                if (Array.isArray(value)) {
                    if (!value.includes(userValue)) {
                        matches = false;
                        break;
                    }
                } else {
                    if (userValue !== value) {
                        matches = false;
                        break;
                    }
                }
            }
            
            if (matches) {
                segments.push(segmentKey);
            }
        }
        
        return segments;
    },
    
    /**
     * Merge segment-based times with personal engagement patterns
     */
    mergeEngagementPatterns(segmentTimes, personalPatterns) {
        const merged = [...segmentTimes];
        
        for (const pattern of personalPatterns) {
            const existingIndex = merged.findIndex(t => 
                t.start === pattern.hour + ':00'
            );
            
            if (existingIndex >= 0) {
                // Boost weight if personal pattern aligns with segment recommendation
                merged[existingIndex].weight = Math.min(1.0, 
                    merged[existingIndex].weight + (pattern.engagement_rate * 0.3)
                );
            } else if (pattern.engagement_rate > 0.3) {
                // Add personal pattern if engagement rate is high
                merged.push({
                    start: pattern.hour + ':00',
                    end: (pattern.hour + 1) + ':00',
                    label: 'personal_optimal',
                    weight: pattern.engagement_rate,
                    source: 'personal_pattern'
                });
            }
        }
        
        return merged;
    },
    
    /**
     * Apply notification type-specific weights
     */
    applyNotificationTypeWeights(times, notificationType) {
        const typeMultipliers = {
            'birthday_reminder': { morning: 1.2, afternoon: 1.0, evening: 0.9 },
            'event_alert': { morning: 0.8, afternoon: 1.1, evening: 1.0 },
            'new_drop': { morning: 0.9, afternoon: 1.0, evening: 1.2 },
            'quest_reminder': { morning: 0.7, afternoon: 1.0, evening: 1.1 },
            'weekly_digest': { morning: 1.0, afternoon: 0.9, evening: 1.0 },
            'urgent': { morning: 1.0, afternoon: 1.0, evening: 1.0 } // No adjustment for urgent
        };
        
        const multipliers = typeMultipliers[notificationType] || typeMultipliers['general'];
        
        return times.map(time => {
            const hour = parseInt(time.start.split(':')[0]);
            let multiplier = 1.0;
            
            if (hour >= 6 && hour < 12) {
                multiplier = multipliers.morning || 1.0;
            } else if (hour >= 12 && hour < 18) {
                multiplier = multipliers.afternoon || 1.0;
            } else {
                multiplier = multipliers.evening || 1.0;
            }
            
            return {
                ...time,
                weight: time.weight * multiplier
            };
        });
    },
    
    /**
     * Get the next available time slot
     */
    getNextAvailableSlot(times, options = {}) {
        const { 
            minDelayMinutes = 30,
            maxDelayHours = 48,
            respectQuietHours = true 
        } = options;
        
        const now = new Date();
        const minTime = new Date(now.getTime() + minDelayMinutes * 60000);
        const maxTime = new Date(now.getTime() + maxDelayHours * 3600000);
        
        for (const timeSlot of times) {
            const [startHour, startMin] = timeSlot.start.split(':').map(Number);
            
            // Try today
            let candidateTime = new Date(now);
            candidateTime.setHours(startHour, startMin, 0, 0);
            
            if (candidateTime > minTime && candidateTime < maxTime) {
                if (!respectQuietHours || !this.isQuietHours(candidateTime)) {
                    return candidateTime.toISOString();
                }
            }
            
            // Try tomorrow
            candidateTime = new Date(now);
            candidateTime.setDate(candidateTime.getDate() + 1);
            candidateTime.setHours(startHour, startMin, 0, 0);
            
            if (candidateTime < maxTime) {
                if (!respectQuietHours || !this.isQuietHours(candidateTime)) {
                    return candidateTime.toISOString();
                }
            }
        }
        
        // Fallback: return time in 2 hours
        const fallback = new Date(now.getTime() + 2 * 3600000);
        return fallback.toISOString();
    },
    
    /**
     * Check if time is in quiet hours (10 PM - 8 AM)
     */
    isQuietHours(date) {
        const hour = date.getHours();
        return hour >= 22 || hour < 8;
    },
    
    /**
     * Calculate confidence score for recommendation
     */
    calculateConfidence(segments, engagementPatterns) {
        let confidence = 0.5;
        
        // More segments = higher confidence
        confidence += segments.length * 0.1;
        
        // Personal patterns increase confidence
        if (engagementPatterns?.optimal_hours?.length > 0) {
            confidence += 0.2;
        }
        
        return Math.min(0.95, confidence);
    },
    
    /**
     * Get default notification time
     */
    getDefaultTime() {
        const now = new Date();
        const defaultTime = new Date(now.getTime() + 2 * 3600000); // 2 hours from now
        return defaultTime.toISOString();
    },
    
    /**
     * Schedule a batch of notifications with optimal timing
     */
    async scheduleNotificationBatch(notifications, options = {}) {
        const scheduled = [];
        
        for (const notification of notifications) {
            const optimalTime = await this.getOptimalNotificationTime(
                notification.user_id,
                notification.type,
                options
            );
            
            scheduled.push({
                ...notification,
                scheduled_at: optimalTime.optimal_time || this.getDefaultTime(),
                scheduling_confidence: optimalTime.confidence || 0.5,
                segments_matched: optimalTime.segments || []
            });
        }
        
        // Sort by scheduled time
        scheduled.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
        
        return scheduled;
    },
    
    /**
     * Record notification engagement for learning
     */
    async recordEngagement(userId, notificationId, action, timestamp) {
        try {
            await supabase
                .from('notification_engagement')
                .insert({
                    user_id: userId,
                    notification_id: notificationId,
                    action: action, // 'opened', 'dismissed', 'converted'
                    timestamp: timestamp || new Date().toISOString()
                });
            
            // Update engagement patterns
            await this.updateEngagementPatterns(userId);
        } catch (error) {
            console.error('[SmartNotification] Error recording engagement:', error);
        }
    },
    
    /**
     * Update user engagement patterns based on history
     */
    async updateEngagementPatterns(userId) {
        try {
            // Get last 30 days of engagement
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: engagements } = await supabase
                .from('notification_engagement')
                .select('*')
                .eq('user_id', userId)
                .gte('timestamp', thirtyDaysAgo.toISOString());
            
            if (!engagements || engagements.length < 5) {
                return; // Not enough data
            }
            
            // Calculate engagement by hour
            const hourlyEngagement = {};
            for (let i = 0; i < 24; i++) {
                hourlyEngagement[i] = { opened: 0, total: 0 };
            }
            
            for (const engagement of engagements) {
                const hour = new Date(engagement.timestamp).getHours();
                hourlyEngagement[hour].total++;
                if (engagement.action === 'opened' || engagement.action === 'converted') {
                    hourlyEngagement[hour].opened++;
                }
            }
            
            // Calculate rates
            const optimalHours = Object.entries(hourlyEngagement)
                .map(([hour, data]) => ({
                    hour: parseInt(hour),
                    engagement_rate: data.total > 0 ? data.opened / data.total : 0,
                    total_notifications: data.total
                }))
                .filter(h => h.total_notifications >= 3) // Minimum sample size
                .sort((a, b) => b.engagement_rate - a.engagement_rate)
                .slice(0, 5);
            
            // Update user context
            await supabase
                .from('user_context_snapshots')
                .update({
                    engagement_patterns: { optimal_hours: optimalHours },
                    calculated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
            
        } catch (error) {
            console.error('[SmartNotification] Error updating patterns:', error);
        }
    },
    
    /**
     * Get optimal notification times for a user (for display)
     */
    async getUserNotificationSchedule(userId) {
        try {
            const { data: context } = await supabase
                .from('user_context_snapshots')
                .select('demographics, engagement_patterns')
                .eq('user_id', userId)
                .order('calculated_at', { ascending: false })
                .limit(1)
                .single();
            
            const segments = this.identifyUserSegments(context?.demographics || {});
            
            const schedule = {
                segments: segments.map(s => USER_SEGMENTS[s]?.label || s),
                optimal_windows: [],
                avoid_windows: [],
                personal_patterns: context?.engagement_patterns?.optimal_hours || []
            };
            
            // Aggregate windows from all segments
            for (const segment of segments) {
                const segmentData = USER_SEGMENTS[segment];
                if (segmentData) {
                    schedule.optimal_windows.push(...segmentData.optimal_times);
                    schedule.avoid_windows.push(...segmentData.avoid_times);
                }
            }
            
            // Deduplicate and sort
            schedule.optimal_windows = this.deduplicateTimeWindows(schedule.optimal_windows)
                .sort((a, b) => b.weight - a.weight);
            
            return schedule;
            
        } catch (error) {
            console.error('[SmartNotification] Error getting schedule:', error);
            return { error: error.message };
        }
    },
    
    /**
     * Deduplicate time windows
     */
    deduplicateTimeWindows(windows) {
        const seen = new Set();
        return windows.filter(w => {
            const key = `${w.start}-${w.end}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },
    
    /**
     * Check if a specific time is good for a user
     */
    async isGoodTimeForUser(userId, proposedTime) {
        const optimal = await this.getOptimalNotificationTime(userId);
        const proposed = new Date(proposedTime);
        
        // Check if proposed time aligns with any optimal window
        for (const window of optimal.alternative_times || []) {
            const [startHour] = window.start.split(':').map(Number);
            const [endHour] = window.end.split(':').map(Number);
            const proposedHour = proposed.getHours();
            
            if (proposedHour >= startHour && proposedHour < endHour) {
                return { isGood: true, confidence: window.weight };
            }
        }
        
        return { isGood: false, suggestedTime: optimal.optimal_time };
    }
};

module.exports = SmartNotificationService;
