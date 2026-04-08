const { supabase } = require('../config/supabase');
const emailService = require('./emailService');
const merchantAnalyticsService = require('./merchantAnalyticsService');

/**
 * Automated Workflow Service
 * 
 * Handles the business logic for scheduled tasks and automated workflows.
 * Used by the cron scheduler to perform recurring operations.
 */

/**
 * Log job execution start
 * @param {string} jobId - Job ID from scheduled_jobs table
 * @returns {Promise<string|null>} Execution log ID
 */
async function logJobStart(jobId) {
    if (!jobId) return null;
    try {
        const { data, error } = await supabase
            .from('job_execution_log')
            .insert({
                job_id: jobId,
                status: 'running',
                started_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error logging job start:', error);
        return null;
    }
}

/**
 * Log job execution completion
 * @param {string} executionLogId - Execution log ID
 * @param {string} status - Status ('success' or 'failed')
 * @param {object} result - Execution result summary
 */
async function logJobComplete(executionLogId, status, result = {}) {
    if (!executionLogId) return;
    try {
        const completedAt = new Date();
        const { data: execution } = await supabase
            .from('job_execution_log')
            .select('started_at')
            .eq('id', executionLogId)
            .single();

        const durationMs = execution ?
            new Date(completedAt) - new Date(execution.started_at) : 0;

        await supabase
            .from('job_execution_log')
            .update({
                status,
                completed_at: completedAt.toISOString(),
                duration_ms: durationMs,
                records_processed: result.recordsProcessed || 0,
                error_message: result.error || null,
                execution_data: result.data || {}
            })
            .eq('id', executionLogId);
    } catch (error) {
        console.error('Error logging job completion:', error);
    }
}

/**
 * Update job configuration status
 * @param {string} jobId - Job ID
 * @param {object} updates - Status and timestamp updates
 */
async function updateJobStatus(jobId, updates) {
    if (!jobId) return;
    try {
        await supabase
            .from('scheduled_jobs')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);
    } catch (error) {
        console.error('Error updating job status:', error);
    }
}

/**
 * WORKER: Process weekly payouts
 * Finds pending payouts over threshold and "processes" them.
 */
async function processWeeklyPayouts() {
    console.log('[Workflow] Running weekly payouts worker...');

    const { data: job } = await supabase
        .from('scheduled_jobs')
        .select('id')
        .eq('job_name', 'weekly_payouts')
        .single();

    const executionLogId = await logJobStart(job?.id);

    try {
        // Get pending payouts
        const { data: payouts, error } = await supabase
            .from('payouts')
            .select('*')
            .eq('status', 'pending')
            .gte('amount', 10); // Minimum payout threshold ($10)

        if (error) throw error;

        let processedCount = 0;

        for (const payout of payouts || []) {
            try {
                // TODO: Integrate with Stripe Connect actual transfer
                console.log(`[Workflow] Processing payout ${payout.id} for $${payout.amount}`);

                // Update payout status
                await supabase
                    .from('payouts')
                    .update({
                        status: 'completed',
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', payout.id);

                // Send confirmation email
                await emailService.sendPayoutConfirmation(payout.id);

                processedCount++;
            } catch (error) {
                console.error(`[Workflow] Error processing payout ${payout.id}:`, error);
            }
        }

        await logJobComplete(executionLogId, 'success', {
            recordsProcessed: processedCount,
            data: { total_eligible: payouts?.length || 0 }
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            error_count: 0
        });

        return { success: true, processed: processedCount };
    } catch (error) {
        console.error('[Workflow] Error in weekly payouts worker:', error);

        await logJobComplete(executionLogId, 'failed', {
            error: error.message
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            status: 'failed',
            error_count: (job?.error_count || 0) + 1,
            last_error: error.message
        });

        throw error;
    }
}

/**
 * WORKER: Check for low stock products
 * Scans merchant products and sends alerts if inventory < threshold.
 */
async function checkLowStockProducts() {
    console.log('[Workflow] Checking inventory levels...');

    const { data: job } = await supabase
        .from('scheduled_jobs')
        .select('id')
        .eq('job_name', 'daily_inventory_check')
        .single();

    const executionLogId = await logJobStart(job?.id);

    try {
        // Find products below their low stock threshold
        const { data: products, error } = await supabase
            .from('merchant_products')
            .select('merchant_id, id, name, inventory_count, low_stock_threshold')
            .not('inventory_count', 'is', null)
            .filter('inventory_count', 'lte', 'low_stock_threshold')
            .eq('is_active', true);

        if (error) throw error;

        // Group by merchant to send a single digest email
        const merchantGroups = (products || []).reduce((acc, p) => {
            if (!acc[p.merchant_id]) acc[p.merchant_id] = [];
            acc[p.merchant_id].push(p);
            return acc;
        }, {});

        let alertsSent = 0;

        for (const [merchantId, merchantProducts] of Object.entries(merchantGroups)) {
            try {
                await emailService.sendLowStockAlert(merchantId, merchantProducts);
                alertsSent++;
            } catch (error) {
                console.error(`[Workflow] Error sending low stock alert to merchant ${merchantId}:`, error);
            }
        }

        await logJobComplete(executionLogId, 'success', {
            recordsProcessed: alertsSent,
            data: { products_flagged: products?.length || 0, merchants_alerted: alertsSent }
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            error_count: 0
        });

        return { success: true, alerts_sent: alertsSent };
    } catch (error) {
        console.error('[Workflow] Error checking inventory:', error);

        await logJobComplete(executionLogId, 'failed', {
            error: error.message
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            status: 'failed',
            error_count: (job?.error_count || 0) + 1,
            last_error: error.message
        });

        throw error;
    }
}

/**
 * WORKER: Check campaign budgets
 * Monitors active campaigns and sends alerts when budget usage reaches threshold.
 */
async function checkBudgetThresholds() {
    console.log('[Workflow] Checking campaign budgets...');

    const { data: job } = await supabase
        .from('scheduled_jobs')
        .select('id, config')
        .eq('job_name', 'hourly_budget_alerts')
        .single();

    const executionLogId = await logJobStart(job?.id);
    const threshold = job?.config?.threshold_percent || 80;

    try {
        // Get active campaigns with budgets
        const { data: campaigns, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('status', 'active')
            .not('budget_total', 'is', null)
            .gt('budget_total', 0);

        if (error) throw error;

        let alertsSent = 0;

        for (const campaign of campaigns || []) {
            const percentUsed = (campaign.budget_spent / campaign.budget_total) * 100;

            // Alert if over threshold but not yet alerted for this level (could track in campaign meta)
            if (percentUsed >= threshold && percentUsed < 100) {
                try {
                    await emailService.sendBudgetAlert(campaign.id, Math.round(percentUsed));
                    alertsSent++;
                } catch (error) {
                    console.error(`[Workflow] Error sending budget alert for campaign ${campaign.id}:`, error);
                }
            }
        }

        await logJobComplete(executionLogId, 'success', {
            recordsProcessed: alertsSent,
            data: { active_campaigns: campaigns?.length || 0, alerts_sent: alertsSent }
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            error_count: 0
        });

        return { success: true, alerts_sent: alertsSent };
    } catch (error) {
        console.error('[Workflow] Error checking budgets:', error);

        await logJobComplete(executionLogId, 'failed', {
            error: error.message
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            status: 'failed',
            error_count: (job?.error_count || 0) + 1,
            last_error: error.message
        });

        throw error;
    }
}

/**
 * WORKER: Weekly Performance Reports
 * Generates and sends summarized performance data to platform stakeholders.
 */
async function sendWeeklyReports() {
    console.log('[Workflow] Generating weekly reports...');

    const { data: job } = await supabase
        .from('scheduled_jobs')
        .select('id')
        .eq('job_name', 'weekly_performance_reports')
        .single();

    const executionLogId = await logJobStart(job?.id);

    try {
        // TODO: In a real implementation, this would:
        // 1. Query merchant_sales_analytics for the past 7 days
        // 2. Query host_earnings_analytics for the past 7 days
        // 3. For each active user, generate a personalized summary
        // 4. Send via emailService

        await logJobComplete(executionLogId, 'success', {
            recordsProcessed: 0,
            data: { note: 'Template generated, worker logic TBD' }
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            error_count: 0
        });

        return { success: true };
    } catch (error) {
        console.error('[Workflow] Error generating weekly reports:', error);

        await logJobComplete(executionLogId, 'failed', {
            error: error.message
        });

        await updateJobStatus(job?.id, {
            last_run_at: new Date().toISOString(),
            status: 'failed',
            error_count: (job?.error_count || 0) + 1,
            last_error: error.message
        });

        throw error;
    }
}

module.exports = {
    processWeeklyPayouts,
    checkLowStockProducts,
    checkBudgetThresholds,
    sendWeeklyReports
};
