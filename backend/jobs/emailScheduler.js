/**
 * PROMORANG EMAIL SCHEDULER
 * Cron jobs for proactive email campaigns
 */

const cron = require('node-cron');
const emailCampaignService = require('../services/emailCampaignService');
const adminDigestService = require('../services/adminDigestService');
const revenueLifecycleEmailService = require('../services/revenueLifecycleEmailService');
const { supabase } = require('../lib/supabase');

async function runOnboardingJob() {
    console.log('[Email Scheduler] Running onboarding email job...');
    const result = await emailCampaignService.processOnboardingEmails();
    console.log(`[Email Scheduler] Onboarding: ${result.processed || 0} emails sent`);
    return result;
}

async function runReEngagementJob() {
    console.log('[Email Scheduler] Running re-engagement job...');
    const result = await emailCampaignService.processReEngagementEmails();
    console.log(`[Email Scheduler] Re-engagement: ${result.processed || 0} emails sent`);
    return result;
}

async function runStreakWarningJob() {
    console.log('[Email Scheduler] Running streak warning job...');

    if (!supabase) return { warned: 0, skipped: true, reason: 'supabase_unavailable' };

    const today = new Date().toISOString().split('T')[0];

    const { data: atRiskUsers, error } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak')
        .neq('last_login_date', today)
        .gte('current_streak', 3);

    if (error) throw error;

    let warned = 0;
    for (const streak of atRiskUsers || []) {
        const result = await emailCampaignService.sendStreakWarning(streak.user_id);
        if (result.success) warned += 1;
    }

    console.log(`[Email Scheduler] Streak warnings: ${warned} emails sent`);
    return { warned };
}

async function runWeeklyDigestJob() {
    console.log('[Email Scheduler] Running weekly digest job...');

    if (!supabase) return { sent: 0, skipped: true, reason: 'supabase_unavailable' };

    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, display_name, username, user_type')
        .eq('email_digest_enabled', true)
        .not('email', 'is', null);

    if (error) throw error;

    let sent = 0;
    const emailNotifications = require('../services/emailNotifications');

    for (const user of users || []) {
        try {
            await emailNotifications.sendWeeklyRewardsDigest(
                user.email,
                user.display_name || user.username,
                {
                    earned_this_week: 0,
                    available_count: 0,
                    expiring_soon: 0,
                    total_gems: 0,
                    streak_days: 0,
                    user_name: user.display_name || user.username,
                }
            );
            sent += 1;
        } catch (err) {
            console.error(`Failed to send digest to ${user.id}:`, err);
        }
    }

    console.log(`[Email Scheduler] Weekly digest: ${sent} emails sent`);
    return { sent };
}

async function runAdminDigestJob() {
    console.log('[Email Scheduler] Running admin digest job...');
    const result = await adminDigestService.sendAdminDailyDigest();
    console.log(`[Email Scheduler] Admin digest: ${result.success ? 'sent' : 'skipped'}`);
    return result;
}

async function runRevenueLifecycleJob() {
    console.log('[Email Scheduler] Running revenue lifecycle job...');
    const result = await revenueLifecycleEmailService.processDueJobs();
    console.log(`[Email Scheduler] Revenue lifecycle: ${result.sent || 0} sent, ${result.cancelled || 0} cancelled`);
    return result;
}

async function runDailyMaintenance(options = {}) {
    const now = options.now ? new Date(options.now) : new Date();
    const shouldRunWeeklyDigest = options.forceWeeklyDigest || now.getUTCDay() === 0;
    const results = {};

    const steps = [
        ['onboarding', runOnboardingJob],
        ['reengagement', runReEngagementJob],
        ['streakWarning', runStreakWarningJob],
        ['revenueLifecycle', runRevenueLifecycleJob],
        ['adminDigest', runAdminDigestJob],
    ];

    for (const [name, task] of steps) {
        try {
            results[name] = { success: true, result: await task() };
        } catch (error) {
            console.error(`[Email Scheduler] ${name} job error:`, error);
            results[name] = { success: false, error: error.message };
        }
    }

    if (shouldRunWeeklyDigest) {
        try {
            results.weeklyDigest = { success: true, result: await runWeeklyDigestJob() };
        } catch (error) {
            console.error('[Email Scheduler] weeklyDigest job error:', error);
            results.weeklyDigest = { success: false, error: error.message };
        }
    } else {
        results.weeklyDigest = { success: true, skipped: true, reason: 'not_scheduled_today' };
    }

    return results;
}

// =============================================================================
// SCHEDULED JOBS
// =============================================================================

/**
 * Process daily onboarding emails
 * Runs every hour to catch users at appropriate times
 */
const onboardingJob = cron.schedule('0 * * * *', async () => {
    try {
        await runOnboardingJob();
    } catch (error) {
        console.error('[Email Scheduler] Onboarding job error:', error);
    }
}, { scheduled: false });

/**
 * Process re-engagement emails
 * Runs once daily at 10 AM
 */
const reEngagementJob = cron.schedule('0 10 * * *', async () => {
    try {
        await runReEngagementJob();
    } catch (error) {
        console.error('[Email Scheduler] Re-engagement job error:', error);
    }
}, { scheduled: false });

/**
 * Send streak warning emails
 * Runs at 8 PM to warn users before midnight
 */
const streakWarningJob = cron.schedule('0 20 * * *', async () => {
    try {
        await runStreakWarningJob();
    } catch (error) {
        console.error('[Email Scheduler] Streak warning job error:', error);
    }
}, { scheduled: false });

/**
 * Weekly digest emails
 * Runs Sunday at 9 AM
 */
const weeklyDigestJob = cron.schedule('0 9 * * 0', async () => {
    try {
        await runWeeklyDigestJob();
    } catch (error) {
        console.error('[Email Scheduler] Weekly digest job error:', error);
    }
}, { scheduled: false });

/**
 * Admin platform digest
 * Runs daily at 8 AM
 */
const adminDigestJob = cron.schedule('0 8 * * *', async () => {
    try {
        await runAdminDigestJob();
    } catch (error) {
        console.error('[Email Scheduler] Admin digest job error:', error);
    }
}, { scheduled: false });

// =============================================================================
// SCHEDULER CONTROL
// =============================================================================

let isRunning = false;

/**
 * Start all scheduled jobs
 */
function start() {
    if (isRunning) {
        console.log('[Email Scheduler] Already running');
        return;
    }

    console.log('[Email Scheduler] Starting scheduled jobs...');

    onboardingJob.start();
    reEngagementJob.start();
    streakWarningJob.start();
    weeklyDigestJob.start();
    adminDigestJob.start();

    isRunning = true;
    console.log('[Email Scheduler] All jobs started (5 scheduled jobs)');
}

/**
 * Stop all scheduled jobs
 */
function stop() {
    if (!isRunning) {
        console.log('[Email Scheduler] Not running');
        return;
    }

    console.log('[Email Scheduler] Stopping scheduled jobs...');

    onboardingJob.stop();
    reEngagementJob.stop();
    streakWarningJob.stop();
    weeklyDigestJob.stop();
    adminDigestJob.stop();

    isRunning = false;
    console.log('[Email Scheduler] All jobs stopped');
}

/**
 * Get scheduler status
 */
function getStatus() {
    return {
        isRunning,
        jobs: {
            onboarding: { schedule: '0 * * * *', description: 'Every hour' },
            reEngagement: { schedule: '0 10 * * *', description: 'Daily at 10 AM' },
            streakWarning: { schedule: '0 20 * * *', description: 'Daily at 8 PM' },
            weeklyDigest: { schedule: '0 9 * * 0', description: 'Sundays at 9 AM' },
            adminDigest: { schedule: '0 8 * * *', description: 'Daily at 8 AM' },
            hobbyFallback: { schedule: 'single daily cron', description: 'Runs all due jobs via /api/cron/daily' },
        },
    };
}

/**
 * Run a job manually (for testing)
 */
async function runManually(jobName) {
    const jobs = {
        onboarding: runOnboardingJob,
        reengagement: runReEngagementJob,
        streakwarning: runStreakWarningJob,
        weeklydigest: runWeeklyDigestJob,
        admindigest: runAdminDigestJob,
        revenuelifecycle: runRevenueLifecycleJob,
        daily: () => runDailyMaintenance({ forceWeeklyDigest: false }),
    };

    const normalizedJobName = String(jobName || '').toLowerCase();

    if (!jobs[normalizedJobName]) {
        return { success: false, error: `Unknown job: ${jobName}` };
    }

    try {
        const result = await jobs[normalizedJobName]();
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    start,
    stop,
    getStatus,
    runManually,
    runDailyMaintenance,
};
