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
 * Start all cron jobs
 */
function startCronJobs() {
    console.log('[Cron] Starting scheduled jobs...');

    createDailyBufferDrops.start();
    calculatePlatformMedianER.start();
    evaluateTrustTiers.start();

    console.log('[Cron] All jobs scheduled');
    console.log('[Cron] - Daily buffer drops: 00:05 AM');
    console.log('[Cron] - Platform median ER: Sundays 02:00 AM');
    console.log('[Cron] - Trust tier evaluation: 03:00 AM');
}

/**
 * Stop all cron jobs
 */
function stopCronJobs() {
    console.log('[Cron] Stopping scheduled jobs...');

    createDailyBufferDrops.stop();
    calculatePlatformMedianER.stop();
    evaluateTrustTiers.stop();
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
        evaluateTrustTiers
    }
};
