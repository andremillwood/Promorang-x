const { supabase } = require('../lib/supabase');
const notificationPreferencesService = require('./notificationPreferencesService');
const resendService = require('./resendService');

const EMAIL_TYPE_LABELS = {
  low_stock: 'Low stock alert',
  redemption: 'Redemption update',
  payout: 'Payout update',
  budget_alert: 'Budget alert',
  weekly_summary: 'Weekly summary',
  featured_booking_confirmation: 'Featured placement booked',
  featured_payment_receipt: 'Featured placement payment receipt',
  featured_campaign_started: 'Featured campaign started',
  featured_campaign_ending: 'Featured campaign ending soon',
  featured_campaign_completed: 'Featured campaign completed',
  featured_daily_analytics: 'Featured daily analytics',
  featured_low_balance: 'Featured campaign low balance',
  featured_cpc_depleted: 'Featured campaign budget depleted',
};

function formatLabel(value) {
  if (!value) return 'Notification';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTemplateValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function buildGenericEmailContent({ emailType, subject, templateData = {} }) {
  const heading = EMAIL_TYPE_LABELS[emailType] || formatLabel(emailType);
  const details = Object.entries(templateData)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      const label = formatLabel(key);
      const formattedValue = formatTemplateValue(value);
      return `
        <tr>
          <td style="padding: 10px 0; color: #8c8f98; font-size: 13px; vertical-align: top;">${label}</td>
          <td style="padding: 10px 0; color: #111318; font-size: 14px; text-align: right; vertical-align: top;">${formattedValue}</td>
        </tr>
      `;
    })
    .join('');

  const html = resendService.getBaseTemplate({
    title: heading,
    preheader: subject,
    content: `
      <p>This is an automated Promorang update.</p>
      ${details ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
          ${details}
        </table>
      ` : `
        <p>No additional details were provided for this update.</p>
      `}
    `,
    ctaUrl: resendService.EMAIL_CONFIG.frontendUrl,
    ctaText: 'Open Promorang',
  });

  const textLines = [
    heading,
    '',
    subject,
    '',
    ...Object.entries(templateData)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${formatLabel(key)}: ${formatTemplateValue(value)}`),
    '',
    `Open Promorang: ${resendService.EMAIL_CONFIG.frontendUrl}`,
  ];

  return {
    html,
    text: textLines.join('\n').trim(),
  };
}

async function logEmail(emailData) {
  const {
    userId,
    emailType,
    recipientEmail,
    subject,
    templateId,
    templateData,
    status = 'pending',
    errorMessage = null,
  } = emailData;

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('email_logs')
    .insert({
      user_id: userId,
      email_type: emailType,
      recipient_email: recipientEmail,
      subject,
      template_id: templateId,
      template_data: templateData,
      status,
      error_message: errorMessage,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateEmailStatus(emailLogId, status, updates = {}) {
  if (!supabase || !emailLogId) {
    return null;
  }

  const payload = {
    status,
    ...updates,
  };

  if (status === 'sent' && !payload.sent_at) {
    payload.sent_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('email_logs')
    .update(payload)
    .eq('id', emailLogId);

  if (error) throw error;
  return true;
}

async function sendEmail(emailData) {
  const {
    userId,
    emailType = 'transactional',
    recipientEmail,
    subject,
    templateData = {},
    html,
    text,
    replyTo,
  } = emailData;

  let emailLog = null;

  try {
    if (userId) {
      const shouldSend = await notificationPreferencesService.shouldSendNotification(userId, emailType);
      if (!shouldSend) {
        emailLog = await logEmail({
          userId,
          emailType,
          recipientEmail,
          subject,
          templateId: `template_${emailType}`,
          templateData,
          status: 'skipped',
        });

        return { success: true, skipped: true, reason: 'user_preference', emailLogId: emailLog?.id || null };
      }
    }

    emailLog = await logEmail({
      userId,
      emailType,
      recipientEmail,
      subject,
      templateId: `template_${emailType}`,
      templateData,
      status: 'pending',
    });

    const content = html || text
      ? { html, text }
      : buildGenericEmailContent({ emailType, subject, templateData });

    const result = await resendService.sendEmail({
      to: recipientEmail,
      subject,
      html: content.html,
      text: content.text,
      replyTo,
      tags: [{ name: 'type', value: emailType }],
      userId,
      emailType,
      metadata: templateData,
    });

    if (!result.success) {
      await updateEmailStatus(emailLog?.id, 'failed', {
        error_message: result.error || 'Failed to send email',
      });
      return {
        success: false,
        error: result.error || 'Failed to send email',
        emailLogId: emailLog?.id || null,
      };
    }

    await updateEmailStatus(emailLog?.id, 'sent', {
      error_message: null,
    });

    return {
      success: true,
      messageId: result.messageId,
      emailLogId: emailLog?.id || null,
    };
  } catch (error) {
    if (emailLog?.id) {
      await updateEmailStatus(emailLog.id, 'failed', {
        error_message: error.message,
      }).catch(() => null);
    }

    console.error('Error sending email:', error);
    return { success: false, error: error.message, emailLogId: emailLog?.id || null };
  }
}

async function sendLowStockAlert(merchantId, products) {
  const { data: merchant, error } = await supabase
    .from('users')
    .select('email, display_name, username')
    .eq('id', merchantId)
    .single();

  if (error) throw error;

  return sendEmail({
    userId: merchantId,
    emailType: 'low_stock',
    recipientEmail: merchant.email,
    subject: `Low Stock Alert: ${products.length} product(s) running low`,
    templateData: {
      merchant_name: merchant.display_name || merchant.username || 'Merchant',
      product_count: products.length,
      products: products.map((product) => `${product.name || product.product_name} (${product.inventory_count}/${product.low_stock_threshold})`),
    },
  });
}

async function sendRedemptionNotification(redemptionId) {
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

  const customerResult = await sendEmail({
    userId: sale.user_id,
    emailType: 'redemption',
    recipientEmail: sale.users.email,
    subject: `Your redemption code: ${sale.redemption_code}`,
    templateData: {
      product_name: sale.merchant_products.name,
      redemption_code: sale.redemption_code,
      amount_paid: sale.amount_paid,
      points_paid: sale.points_paid,
    },
  });

  const { data: merchant } = await supabase
    .from('users')
    .select('email')
    .eq('id', sale.merchant_products.merchant_id)
    .single();

  if (merchant?.email) {
    await sendEmail({
      userId: sale.merchant_products.merchant_id,
      emailType: 'redemption',
      recipientEmail: merchant.email,
      subject: `New redemption: ${sale.merchant_products.name}`,
      templateData: {
        product_name: sale.merchant_products.name,
        redemption_code: sale.redemption_code,
        customer_email: sale.users.email,
      },
    });
  }

  return customerResult;
}

async function sendPayoutConfirmation(payoutId) {
  const { data: payout, error } = await supabase
    .from('payouts')
    .select(`
      *,
      users (email)
    `)
    .eq('id', payoutId)
    .single();

  if (error) throw error;

  return sendEmail({
    userId: payout.user_id,
    emailType: 'payout',
    recipientEmail: payout.users.email,
    subject: `Payout Processed: $${payout.amount}`,
    templateData: {
      amount: payout.amount,
      status: payout.status,
      stripe_transfer_id: payout.stripe_transfer_id,
      processed_at: payout.processed_at,
    },
  });
}

async function sendBudgetAlert(campaignId, percentUsed) {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      users!campaigns_advertiser_id_fkey (email)
    `)
    .eq('id', campaignId)
    .single();

  if (error) throw error;

  return sendEmail({
    userId: campaign.advertiser_id,
    emailType: 'budget_alert',
    recipientEmail: campaign.users.email,
    subject: `Budget Alert: ${campaign.name} at ${percentUsed}%`,
    templateData: {
      campaign_name: campaign.name,
      budget_total: campaign.budget_total,
      budget_spent: campaign.budget_spent,
      percent_used: percentUsed,
    },
  });
}

module.exports = {
  sendEmail,
  logEmail,
  updateEmailStatus,
  sendLowStockAlert,
  sendRedemptionNotification,
  sendPayoutConfirmation,
  sendBudgetAlert,
};
