/**
 * PROMORANG DAILY LAYER CRON JOBS
 * 
 * Scheduled jobs for the Daily Layer system.
 * 
 * Schedule:
 * - 10:00 UTC: Day reset - Initialize headline + draw for new Promorang Day
 * - 09:59 UTC: Day close - Snapshot leaderboard + execute draw
 * 
 * Note: 10:00 UTC = 5:00 AM Jamaica (primary market)
 */

const cron = require('node-cron');
const dailyLayerService = require('../services/dailyLayerService');

// =============================================
// JOB 1: DAY RESET (10:00 UTC)
// =============================================

/**
 * Initialize new Promorang Day
 * - Create daily_featured headline
 * - Create daily_draw with Phase 0 prizes
 */
async function runDayReset() {
    console.log('====================================');
    console.log('[CRON] PROMORANG DAY RESET - 10:00 UTC');
    console.log('====================================');

    const startTime = Date.now();

    try {
        // Initialize headline
        console.log('[CRON] Initializing daily headline...');
        const headline = await dailyLayerService.initDailyHeadline();
        console.log(`[CRON] Headline created: ${headline?.headline_type || 'none'}`);

        // Initialize draw
        console.log('[CRON] Initializing daily draw...');
        const draw = await dailyLayerService.initDailyDraw();
        console.log(`[CRON] Draw created: ${draw?.id || 'none'}`);

        const duration = Date.now() - startTime;
        console.log(`[CRON] Day reset complete in ${duration}ms`);
        return { success: true, headlineId: headline?.id || null, drawId: draw?.id || null };
    } catch (error) {
        console.error('[CRON] Day reset failed:', error);
        return { success: false, error: error.message };
    }
}

const dayResetJob = cron.schedule('0 10 * * *', async () => {
    await runDayReset();
}, {
    scheduled: false,
    timezone: 'UTC'
});

// =============================================
// JOB 2: DAY CLOSE (09:59 UTC)
// =============================================

/**
 * Close current Promorang Day
 * - Snapshot leaderboard (for "yesterday's final rank")
 * - Execute draw and award prizes
 */
async function runDayClose(date = null) {
    console.log('====================================');
    console.log('[CRON] PROMORANG DAY CLOSE - 09:59 UTC');
    console.log('====================================');

    const startTime = Date.now();
    const currentDate = date || dailyLayerService.getPromorangDate();

    try {
        // Snapshot leaderboard
        console.log(`[CRON] Creating leaderboard snapshot for ${currentDate}...`);
        const snapshot = await dailyLayerService.snapshotLeaderboard(currentDate);
        console.log(`[CRON] Snapshot created: ${snapshot?.total_users || 0} users`);

        // Execute draw
        console.log(`[CRON] Executing draw for ${currentDate}...`);
        const winners = await dailyLayerService.executeDailyDraw(currentDate);
        console.log(`[CRON] Draw complete: ${winners?.length || 0} winners`);

        const duration = Date.now() - startTime;
        console.log(`[CRON] Day close complete in ${duration}ms`);
        return { success: true, date: currentDate, winners: winners?.length || 0, snapshotUsers: snapshot?.total_users || 0 };
    } catch (error) {
        console.error('[CRON] Day close failed:', error);
        return { success: false, error: error.message };
    }
}

const dayCloseJob = cron.schedule('59 9 * * *', async () => {
    await runDayClose();
}, {
    scheduled: false,
    timezone: 'UTC'
});

// =============================================
// MANUAL TRIGGER FUNCTIONS (for testing)
// =============================================

/**
 * Manually trigger day reset
 * Used for testing or recovery
 */
async function triggerDayReset() {
    console.log('[MANUAL] Triggering day reset...');
    return runDayReset();
}

/**
 * Manually trigger day close
 * Used for testing or recovery
 */
async function triggerDayClose(date = null) {
    const targetDate = date || dailyLayerService.getPromorangDate();
    console.log(`[MANUAL] Triggering day close for ${targetDate}...`);
    return runDayClose(targetDate);
}

async function runDailyLayerMaintenance() {
    const closeResult = await runDayClose();
    const resetResult = await runDayReset();
    return {
        close: closeResult,
        reset: resetResult,
    };
}

function start() {
    dayCloseJob.start();
    dayResetJob.start();
    console.log('[DailyLayerJob] Started local cron jobs');
}

function stop() {
    dayCloseJob.stop();
    dayResetJob.stop();
}

// =============================================
// STARTUP
// =============================================

console.log('[DailyLayerJob] Cron jobs registered:');
console.log('  - Day Reset: 10:00 UTC (init headline + draw)');
console.log('  - Day Close: 09:59 UTC (snapshot leaderboard + execute draw)');

// =============================================
// EXPORTS
// =============================================

module.exports = {
    dayResetJob,
    dayCloseJob,
    triggerDayReset,
    triggerDayClose,
    runDailyLayerMaintenance,
    start,
    stop,
};
