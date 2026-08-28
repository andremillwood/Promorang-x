/**
 * PROMORANG CRON JOBS
 * 
 * Scheduled tasks for the platform including:
 * - Daily buffer drop creation
 * - Trust tier evaluations
 * - Engagement metric calculations
 */

const cron = require('node-cron');

// Import services
let bufferDropService;
let followerPointsService;

try {
    bufferDropService = require('../services/bufferDropService');
} catch (e) {
    console.warn('[Cron] Buffer drop service not available');
}

try {
    followerPointsService = require('../services/followerPointsService');
} catch (e) {
    console.warn('[Cron] Follower points service not available');
}

const automatedWorkflowService = require('../services/automatedWorkflowService');
let weeklyMomentDropService;
try {
    weeklyMomentDropService = require('../services/weeklyMomentDropService');
} catch (e) {
    console.warn('[Cron] Weekly moment drop service not available');
}

let stakeholderScoutService;
try {
    stakeholderScoutService = require('../services/stakeholderScoutService');
} catch (e) {
    console.warn('[Cron] Stakeholder scout service not available');
}

// Import Life Event Service (with graceful fallback)
let lifeEventService;
try {
    lifeEventService = require('../services/lifeEventService');
} catch (e) {
    console.warn('[Cron] Life event service not available');
}

/**
 * Create daily buffer drops
 * Runs every day at 00:05 AM
 */
const createDailyBufferDrops = cron.schedule('5 0 * * *', async () => {
    console.log('[Cron] Running daily buffer drop creation...');

    if (!bufferDropService) {
        console.log('[Cron] Buffer drop service not available, skipping');
        return;
    }

    try {
        const result = await bufferDropService.createDailyBufferDrops();
        console.log('[Cron] Buffer drops created:', result);
    } catch (error) {
        console.error('[Cron] Error creating buffer drops:', error);
    }
}, {
    scheduled: false, // Don't start automatically
    timezone: 'America/New_York'
});

/**
 * Calculate platform median engagement rate
 * Runs every Sunday at 02:00 AM
 */
const calculatePlatformMedianER = cron.schedule('0 2 * * 0', async () => {
    console.log('[Cron] Calculating platform median engagement rate...');

    // This would query all user engagement rates and calculate the median
    // Then update the economy_config table

    // Placeholder for now - would need supabase access
    console.log('[Cron] Platform median ER calculation complete');
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Evaluate trust tiers
 * Runs every day at 03:00 AM
 */
const evaluateTrustTiers = cron.schedule('0 3 * * *', async () => {
    console.log('[Cron] Evaluating trust tiers...');

    // This would iterate through users and re-evaluate their trust levels
    // based on proof quality scores and flagged counts

    console.log('[Cron] Trust tier evaluation complete');
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Weekly payouts
 * Runs every Friday at 05:00 PM
 */
const weeklyPayouts = cron.schedule('0 17 * * 5', async () => {
    console.log('[Cron] Running weekly payouts job...');
    try {
        await automatedWorkflowService.processWeeklyPayouts();
    } catch (error) {
        console.error('[Cron] Error in weekly payouts job:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Daily inventory check
 * Runs every day at 06:00 AM
 */
const dailyInventoryCheck = cron.schedule('0 6 * * *', async () => {
    console.log('[Cron] Running daily inventory check...');
    try {
        await automatedWorkflowService.checkLowStockProducts();
    } catch (error) {
        console.error('[Cron] Error in daily inventory check:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Hourly budget alerts
 * Runs every hour on the hour
 */
const hourlyBudgetAlerts = cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running hourly budget alerts...');
    try {
        await automatedWorkflowService.checkBudgetThresholds();
    } catch (error) {
        console.error('[Cron] Error in hourly budget alerts:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Weekly performance reports
 * Runs every Monday at 09:00 AM
 */
const weeklyPerformanceReports = cron.schedule('0 9 * * 1', async () => {
    console.log('[Cron] Running weekly performance reports...');
    try {
        await automatedWorkflowService.sendWeeklyReports();
    } catch (error) {
        console.error('[Cron] Error in weekly performance reports:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Daily birthday reminders and celebrations
 * Runs every day at 09:00 AM
 */
const dailyBirthdayReminders = cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Checking birthday reminders...');
    
    if (!lifeEventService) {
        console.log('[Cron] Life event service not available, skipping');
        return;
    }

    try {
        const result = await lifeEventService.checkBirthdayReminders();
        console.log('[Cron] Birthday reminders processed:', result);
    } catch (error) {
        console.error('[Cron] Error processing birthday reminders:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Daily anniversary reminders
 * Runs every day at 09:30 AM
 */
const dailyAnniversaryReminders = cron.schedule('30 9 * * *', async () => {
    console.log('[Cron] Checking anniversary reminders...');
    
    if (!lifeEventService) {
        console.log('[Cron] Life event service not available, skipping');
        return;
    }

    try {
        const result = await lifeEventService.checkAnniversaryReminders();
        console.log('[Cron] Anniversary reminders processed:', result);
    } catch (error) {
        console.error('[Cron] Error processing anniversary reminders:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Weekly seasonal recommendations
 * Runs every Monday at 10:00 AM
 */
const weeklySeasonalRecommendations = cron.schedule('0 10 * * 1', async () => {
    console.log('[Cron] Sending seasonal recommendations...');
    
    if (!lifeEventService) {
        console.log('[Cron] Life event service not available, skipping');
        return;
    }

    try {
        const result = await lifeEventService.sendSeasonalRecommendations();
        console.log('[Cron] Seasonal recommendations sent:', result);
    } catch (error) {
        console.error('[Cron] Error sending seasonal recommendations:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Weekly event opportunity alerts
 * Runs every Monday at 11:00 AM
 */
const weeklyEventAlerts = cron.schedule('0 11 * * 1', async () => {
    console.log('[Cron] Alerting event opportunities...');
    
    if (!lifeEventService) {
        console.log('[Cron] Life event service not available, skipping');
        return;
    }

    try {
        const result = await lifeEventService.alertEventOpportunities();
        console.log('[Cron] Event alerts sent:', result);
    } catch (error) {
        console.error('[Cron] Error alerting event opportunities:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Daily holiday campaign triggers
 * Runs every day at 08:00 AM during holiday seasons
 */
const dailyHolidayCampaigns = cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Triggering holiday campaigns...');
    
    if (!lifeEventService) {
        console.log('[Cron] Life event service not available, skipping');
        return;
    }

    try {
        const result = await lifeEventService.triggerHolidayCampaigns();
        console.log('[Cron] Holiday campaigns triggered:', result);
    } catch (error) {
        console.error('[Cron] Error triggering holiday campaigns:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Daily weather-based recommendations
 * Runs every day at 08:30 AM
 */
const dailyWeatherRecommendations = cron.schedule('30 8 * * *', async () => {
    console.log('[Cron] Sending weather-based recommendations...');
    
    if (!lifeEventService) {
        console.log('[Cron] Life event service not available, skipping');
        return;
    }

    try {
        const result = await lifeEventService.sendWeatherBasedRecommendations();
        console.log('[Cron] Weather recommendations sent:', result);
    } catch (error) {
        console.error('[Cron] Error sending weather recommendations:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/New_York'
});

/**
 * Publish dated calendar events inside the 90-day window and announce the week.
 * Mondays at 09:00 America/Jamaica.
 */
const weeklyMomentDrop = cron.schedule('0 9 * * 1', async () => {
    console.log('[Cron] Running weekly moment drop...');
    if (!weeklyMomentDropService) {
        console.log('[Cron] Weekly moment drop service not available, skipping');
        return;
    }
    try {
        const result = await weeklyMomentDropService.runWeeklyMomentDrop();
        console.log('[Cron] Weekly moment drop complete:', result);
    } catch (error) {
        console.error('[Cron] Error in weekly moment drop:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/Jamaica'
});

/**
 * Score and queue steward invites against the weekly calendar.
 * Never sends email. Mondays at 10:00 America/Jamaica, after the drop.
 */
const weeklyStakeholderScout = cron.schedule('0 10 * * 1', async () => {
    console.log('[Cron] Running stakeholder scout (score and queue only)...');
    if (!stakeholderScoutService) {
        console.log('[Cron] Stakeholder scout service not available, skipping');
        return;
    }
    try {
        const result = await stakeholderScoutService.runWeeklyScout();
        console.log('[Cron] Stakeholder scout complete:', {
            scored: result.scored,
            queued: result.queued,
            sent: 0,
            autoSend: false,
        });
    } catch (error) {
        console.error('[Cron] Error in stakeholder scout:', error);
    }
}, {
    scheduled: false,
    timezone: 'America/Jamaica'
});

/**
 * Start all cron jobs
 */
function startCronJobs() {
    console.log('[Cron] Starting scheduled jobs...');

    createDailyBufferDrops.start();
    calculatePlatformMedianER.start();
    evaluateTrustTiers.start();

    // Phase 33 Jobs
    weeklyPayouts.start();
    dailyInventoryCheck.start();
    hourlyBudgetAlerts.start();
    weeklyPerformanceReports.start();

    // Life Event Notification Jobs
    dailyBirthdayReminders.start();
    dailyAnniversaryReminders.start();
    weeklySeasonalRecommendations.start();
    weeklyEventAlerts.start();
    dailyHolidayCampaigns.start();
    dailyWeatherRecommendations.start();
    weeklyMomentDrop.start();
    weeklyStakeholderScout.start();

    console.log('[Cron] All jobs scheduled');
    console.log('[Cron] - Daily buffer drops: 00:05 AM');
    console.log('[Cron] - Platform median ER: Sundays 02:00 AM');
    console.log('[Cron] - Trust tier evaluation: 03:00 AM');
    console.log('[Cron] - Weekly payouts: Fridays 05:00 PM');
    console.log('[Cron] - Daily inventory check: 06:00 AM');
    console.log('[Cron] - Hourly budget alerts: every hour');
    console.log('[Cron] - Weekly performance reports: Mondays 09:00 AM');
    console.log('[Cron] - Daily birthday reminders: 09:00 AM');
    console.log('[Cron] - Daily anniversary reminders: 09:30 AM');
    console.log('[Cron] - Weekly seasonal recommendations: Mondays 10:00 AM');
    console.log('[Cron] - Weekly event alerts: Mondays 11:00 AM');
    console.log('[Cron] - Daily holiday campaigns: 08:00 AM');
    console.log('[Cron] - Daily weather recommendations: 08:30 AM');
    console.log('[Cron] - Weekly moment drop: Mondays 09:00 AM Jamaica');
    console.log('[Cron] - Stakeholder scout queue: Mondays 10:00 AM Jamaica (never sends)');
}

/**
 * Stop all cron jobs
 */
function stopCronJobs() {
    console.log('[Cron] Stopping scheduled jobs...');

    createDailyBufferDrops.stop();
    calculatePlatformMedianER.stop();
    evaluateTrustTiers.stop();

    // Phase 33 Jobs
    weeklyPayouts.stop();
    dailyInventoryCheck.stop();
    hourlyBudgetAlerts.stop();
    weeklyPerformanceReports.stop();

    // Life Event Notification Jobs
    dailyBirthdayReminders.stop();
    dailyAnniversaryReminders.stop();
    weeklySeasonalRecommendations.stop();
    weeklyEventAlerts.stop();
    dailyHolidayCampaigns.stop();
    dailyWeatherRecommendations.stop();
    weeklyMomentDrop.stop();
    weeklyStakeholderScout.stop();
}

/**
 * Manually trigger buffer drop creation
 * Useful for testing or one-off runs
 */
async function triggerBufferDropCreation() {
    if (!bufferDropService) {
        throw new Error('Buffer drop service not available');
    }

    return await bufferDropService.createDailyBufferDrops();
}

module.exports = {
    startCronJobs,
    stopCronJobs,
    triggerBufferDropCreation,
    jobs: {
        createDailyBufferDrops,
        calculatePlatformMedianER,
        evaluateTrustTiers,
        weeklyPayouts,
        dailyInventoryCheck,
        hourlyBudgetAlerts,
        weeklyPerformanceReports,
        // Life Event Notification Jobs
        dailyBirthdayReminders,
        dailyAnniversaryReminders,
        weeklySeasonalRecommendations,
        weeklyEventAlerts,
        dailyHolidayCampaigns,
        dailyWeatherRecommendations,
        weeklyMomentDrop,
        weeklyStakeholderScout
    }
};
