const { supabase } = require('../lib/supabase');
const notificationPreferencesService = require('./notificationPreferencesService');

/**
 * Email Service
 * Handles email sending, logging, and template management
 * Note: This is a placeholder implementation. In production, integrate with SendGrid or AWS SES
 */

/**
 * Log an email to the database
 * @param {object} emailData - Email details
 * @returns {object} Email log record
 */
async function logEmail(emailData) {
    const { userId, emailType, recipientEmail, subject, templateId, templateData, status = 'pending' } = emailData;

    try {
        const { data, error } = await supabase
            .from('email_logs')
            .insert({
                user_id: userId,
                email_type: emailType,
                recipient_email: recipientEmail,
                subject,
                template_id: templateId,
                template_data: templateData,
                status
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error logging email:', error);
        throw error;
    }
}

/**
 * Update email log status
 * @param {string} emailLogId - Email log ID
 * @param {string} status - New status
 * @param {object} updates - Additional updates
 */
async function updateEmailStatus(emailLogId, status, updates = {}) {
    try {
        const updateData = {
            status,
            ...updates
        };

        if (status === 'sent') {
            updateData.sent_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('email_logs')
            .update(updateData)
            .eq('id', emailLogId);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating email status:', error);
        throw error;
    }
}

/**
 * Send email (placeholder - integrate with SendGrid/SES in production)
 * @param {object} emailData - Email details
 * @returns {object} Send result
 */
async function sendEmail(emailData) {
    const { userId, emailType, recipientEmail, subject, templateData } = emailData;

    try {
        // Check user preferences
        if (userId) {
            const shouldSend = await notificationPreferencesService.shouldSendNotification(userId, emailType);
            if (!shouldSend) {
                console.log(`User ${userId} has disabled ${emailType} notifications`);
                return { skipped: true, reason: 'user_preference' };
            }
        }

        // Log the email
        const emailLog = await logEmail({
            userId,
            emailType,
            recipientEmail,
            subject,
            templateId: `template_${emailType}`,
            templateData,
            status: 'pending'
        });

        // TODO: Integrate with SendGrid or AWS SES
        // For now, just simulate sending
        console.log(`[EMAIL] To: ${recipientEmail}, Subject: ${subject}, Type: ${emailType}`);
        console.log(`[EMAIL] Data:`, templateData);

        // Update status to sent
        await updateEmailStatus(emailLog.id, 'sent');

        return {
            success: true,
            emailLogId: emailLog.id
        };
    } catch (error) {
        console.error('Error sending email:', error);

        // Log the failure
        if (emailData.emailLogId) {
            await updateEmailStatus(emailData.emailLogId, 'failed', {
                error_message: error.message
            });
        }

        throw error;
    }
}

/**
 * Send low stock alert to merchant
 * @param {string} merchantId - Merchant ID
 * @param {array} products - Low stock products
 */
async function sendLowStockAlert(merchantId, products) {
    try {
        // Get merchant email
        const { data: merchant, error } = await supabase
            .from('users')
            .select('email')
            .eq('id', merchantId)
            .single();

        if (error) throw error;

        await sendEmail({
            userId: merchantId,
            emailType: 'low_stock',
            recipientEmail: merchant.email,
            subject: `Low Stock Alert: ${products.length} product(s) running low`,
            templateData: {
                products: products.map(p => ({
                    name: p.product_name,
                    inventory: p.inventory_count,
                    threshold: p.low_stock_threshold
                }))
            }
        });
    } catch (error) {
        console.error('Error sending low stock alert:', error);
        throw error;
    }
}

/**
 * Send redemption notification
 * @param {string} redemptionId - Redemption/sale ID
 */
async function sendRedemptionNotification(redemptionId) {
    try {
        // Get redemption details
        const { data: sale, error } = await supabase
            .from('product_sales')
            .select(`
        *,
        merchant_products (name, merchant_id),
        users!product_sales_user_id_fkey (email)
      `)
            .eq('id', redemptionId)
            .single();

        if (error) throw error;

        // Send to customer
        await sendEmail({
            userId: sale.user_id,
            emailType: 'redemption',
            recipientEmail: sale.users.email,
            subject: `Your redemption code: ${sale.redemption_code}`,
            templateData: {
                product_name: sale.merchant_products.name,
                redemption_code: sale.redemption_code,
                amount_paid: sale.amount_paid,
                points_paid: sale.points_paid
            }
        });

        // Send to merchant
        const { data: merchant } = await supabase
            .from('users')
            .select('email')
            .eq('id', sale.merchant_products.merchant_id)
            .single();

        if (merchant) {
            await sendEmail({
                userId: sale.merchant_products.merchant_id,
                emailType: 'redemption',
                recipientEmail: merchant.email,
                subject: `New redemption: ${sale.merchant_products.name}`,
                templateData: {
                    product_name: sale.merchant_products.name,
                    redemption_code: sale.redemption_code,
                    customer_email: sale.users.email
                }
            });
        }
    } catch (error) {
        console.error('Error sending redemption notification:', error);
        throw error;
    }
}

/**
 * Send payout confirmation
 * @param {string} payoutId - Payout ID
 */
async function sendPayoutConfirmation(payoutId) {
    try {
        // Get payout details
        const { data: payout, error } = await supabase
            .from('payouts')
            .select(`
        *,
        users (email)
      `)
            .eq('id', payoutId)
            .single();

        if (error) throw error;

        await sendEmail({
            userId: payout.user_id,
            emailType: 'payout',
            recipientEmail: payout.users.email,
            subject: `Payout Processed: $${payout.amount}`,
            templateData: {
                amount: payout.amount,
                status: payout.status,
                stripe_transfer_id: payout.stripe_transfer_id,
                processed_at: payout.processed_at
            }
        });
    } catch (error) {
        console.error('Error sending payout confirmation:', error);
        throw error;
    }
}

/**
 * Send budget alert to brand
 * @param {string} campaignId - Campaign ID
 * @param {number} percentUsed - Percentage of budget used
 */
async function sendBudgetAlert(campaignId, percentUsed) {
    try {
        // Get campaign details
        const { data: campaign, error } = await supabase
            .from('campaigns')
            .select(`
        *,
        users!campaigns_advertiser_id_fkey (email)
      `)
            .eq('id', campaignId)
            .single();

        if (error) throw error;

        await sendEmail({
            userId: campaign.advertiser_id,
            emailType: 'budget_alert',
            recipientEmail: campaign.users.email,
            subject: `Budget Alert: ${campaign.name} at ${percentUsed}%`,
            templateData: {
                campaign_name: campaign.name,
                budget_total: campaign.budget_total,
                budget_spent: campaign.budget_spent,
                percent_used: percentUsed
            }
        });
    } catch (error) {
        console.error('Error sending budget alert:', error);
        throw error;
    }
}

module.exports = {
    sendEmail,
    logEmail,
    updateEmailStatus,
    sendLowStockAlert,
    sendRedemptionNotification,
    sendPayoutConfirmation,
    sendBudgetAlert
};
