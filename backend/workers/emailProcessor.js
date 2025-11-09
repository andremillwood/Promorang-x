/**
 * Email processor worker
 * Processes queued email notifications from the database
 * Run this as a separate process or cron job
 */

const { supabase } = require('../config/supabase');
const { sendCouponEarnedEmail, sendWeeklyRewardsDigest } = require('../services/emailNotifications');

const BATCH_SIZE = 50;
const POLL_INTERVAL_MS = 30000; // 30 seconds

async function processEmailQueue() {
  if (!supabase) {
    console.log('Supabase not configured, skipping email processing');
    return;
  }

  try {
    console.log('[EmailProcessor] Checking for pending emails...');

    // Get pending emails
    const { data: emails, error } = await supabase.rpc('get_pending_email_notifications', {
      p_limit: BATCH_SIZE,
    });

    if (error) {
      console.error('[EmailProcessor] Error fetching emails:', error);
      return;
    }

    if (!emails || emails.length === 0) {
      console.log('[EmailProcessor] No pending emails');
      return;
    }

    console.log(`[EmailProcessor] Processing ${emails.length} emails...`);

    for (const email of emails) {
      try {
        let result;

        switch (email.email_type) {
          case 'coupon_earned':
            result = await sendCouponEarnedEmail(
              email.recipient_email,
              email.template_data.user_name,
              email.template_data
            );
            break;

          case 'weekly_digest':
            result = await sendWeeklyRewardsDigest(
              email.recipient_email,
              email.template_data.user_name,
              email.template_data
            );
            break;

          case 'expiry_warning':
            // Use coupon earned template with warning message
            result = await sendCouponEarnedEmail(
              email.recipient_email,
              email.template_data.user_name,
              {
                ...email.template_data,
                title: `⚠️ ${email.template_data.coupon_title} Expires Soon!`,
                description: `Your reward expires in ${email.template_data.days_until_expiry} days. Redeem it now!`,
              }
            );
            break;

          default:
            console.warn(`[EmailProcessor] Unknown email type: ${email.email_type}`);
            continue;
        }

        if (result.success) {
          // Mark as sent
          await supabase.rpc('mark_email_sent', { p_email_id: email.id });
          console.log(`[EmailProcessor] ✓ Sent ${email.email_type} to ${email.recipient_email}`);
        } else {
          // Mark as failed
          await supabase.rpc('mark_email_failed', {
            p_email_id: email.id,
            p_error_message: result.error || 'Unknown error',
          });
          console.error(`[EmailProcessor] ✗ Failed to send ${email.email_type} to ${email.recipient_email}:`, result.error);
        }
      } catch (error) {
        console.error(`[EmailProcessor] Error processing email ${email.id}:`, error);
        
        // Mark as failed
        try {
          await supabase.rpc('mark_email_failed', {
            p_email_id: email.id,
            p_error_message: error.message,
          });
        } catch (markError) {
          console.error('[EmailProcessor] Error marking email as failed:', markError);
        }
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[EmailProcessor] Batch complete. Processed ${emails.length} emails.`);
  } catch (error) {
    console.error('[EmailProcessor] Fatal error:', error);
  }
}

// Run processor in a loop
async function startEmailProcessor() {
  console.log('[EmailProcessor] Starting email processor worker...');
  console.log(`[EmailProcessor] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`[EmailProcessor] Batch size: ${BATCH_SIZE}`);

  // Process immediately on start
  await processEmailQueue();

  // Then poll at intervals
  setInterval(async () => {
    await processEmailQueue();
  }, POLL_INTERVAL_MS);
}

// If run directly
if (require.main === module) {
  startEmailProcessor().catch(error => {
    console.error('[EmailProcessor] Failed to start:', error);
    process.exit(1);
  });
}

module.exports = {
  processEmailQueue,
  startEmailProcessor,
};
