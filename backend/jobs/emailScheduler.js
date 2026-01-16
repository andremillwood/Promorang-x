/**
 * PROMORANG EMAIL SCHEDULER
 * Cron jobs for proactive email campaigns
 */

const cron = require('node-cron');
const emailCampaignService = require('../services/emailCampaignService');
const streakService = require('../services/streakService');
const { supabase } = require('../lib/supabase');

// =============================================================================
// SCHEDULED JOBS
// =============================================================================

/**
 * Process daily onboarding emails
 * Runs every hour to catch users at appropriate times
 */
const onboardingJob = cron.schedule('0 * * * *', async () => {
    console.log('[Email Scheduler] Running onboarding email job...');
    try {
        const result = await emailCampaignService.processOnboardingEmails();
        console.log(`[Email Scheduler] Onboarding: ${result.processed} emails sent`);
    } catch (error) {
        console.error('[Email Scheduler] Onboarding job error:', error);
    }
}, { scheduled: false });

/**
 * Process re-engagement emails
 * Runs once daily at 10 AM
 */
const reEngagementJob = cron.schedule('0 10 * * *', async () => {
    console.log('[Email Scheduler] Running re-engagement job...');
    try {
        const result = await emailCampaignService.processReEngagementEmails();
        console.log(`[Email Scheduler] Re-engagement: ${result.processed} emails sent`);
    } catch (error) {
        console.error('[Email Scheduler] Re-engagement job error:', error);
    }
}, { scheduled: false });

/**
 * Send streak warning emails
 * Runs at 8 PM to warn users before midnight
 */
const streakWarningJob = cron.schedule('0 20 * * *', async () => {
    console.log('[Email Scheduler] Running streak warning job...');

    if (!supabase) return;

    try {
        const today = new Date().toISOString().split('T')[0];

        // Find users with active streaks who haven't checked in today
        const { data: atRiskUsers, error } = await supabase
            .from('user_streaks')
            .select('user_id, current_streak')
            .neq('last_login_date', today)
            .gte('current_streak', 3); // Only warn for 3+ day streaks

        if (error) throw error;

        let warned = 0;
        for (const streak of atRiskUsers || []) {
            const result = await emailCampaignService.sendStreakWarning(streak.user_id);
            if (result.success) warned++;
        }

        console.log(`[Email Scheduler] Streak warnings: ${warned} emails sent`);
    } catch (error) {
        console.error('[Email Scheduler] Streak warning job error:', error);
    }
}, { scheduled: false });

/**
 * Weekly digest emails
 * Runs Sunday at 9 AM
 */
const weeklyDigestJob = cron.schedule('0 9 * * 0', async () => {
    console.log('[Email Scheduler] Running weekly digest job...');

    if (!supabase) return;

    try {
        // Get all active users who opted in to digest
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
                await emailNotifications.sendWeeklyDigest({
                    id: user.id,
                    email: user.email,
                    display_name: user.display_name || user.username,
                });
                sent++;
            } catch (err) {
                console.error(`Failed to send digest to ${user.id}:`, err);
            }
        }

        console.log(`[Email Scheduler] Weekly digest: ${sent} emails sent`);
    } catch (error) {
        console.error('[Email Scheduler] Weekly digest job error:', error);
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

    isRunning = true;
    console.log('[Email Scheduler] All jobs started');
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
        },
    };
}

/**
 * Run a job manually (for testing)
 */
async function runManually(jobName) {
    const jobs = {
        onboarding: () => emailCampaignService.processOnboardingEmails(),
        reEngagement: () => emailCampaignService.processReEngagementEmails(),
        streakWarning: async () => {
            // Simplified manual run
            console.log('[Manual] Running streak warning check...');
            return { success: true };
        },
    };

    if (!jobs[jobName]) {
        return { success: false, error: `Unknown job: ${jobName}` };
    }

    try {
        const result = await jobs[jobName]();
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
};
