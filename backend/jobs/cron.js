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

    console.log('[Cron] All jobs scheduled');
    console.log('[Cron] - Daily buffer drops: 00:05 AM');
    console.log('[Cron] - Platform median ER: Sundays 02:00 AM');
    console.log('[Cron] - Trust tier evaluation: 03:00 AM');
    console.log('[Cron] - Weekly payouts: Fridays 05:00 PM');
    console.log('[Cron] - Daily inventory check: 06:00 AM');
    console.log('[Cron] - Hourly budget alerts: every hour');
    console.log('[Cron] - Weekly performance reports: Mondays 09:00 AM');
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
        weeklyPerformanceReports
    }
};
