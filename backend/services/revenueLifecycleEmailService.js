const { supabase } = require('../lib/supabase');
const resendService = require('./resendService');
const revenueFunnels = require('./revenueFunnelService');

const MAX_ATTEMPTS = 5;
const MARKETING_JOBS = new Set(['abandoned_checkout', 'replenishment', 'renewal', 'review', 'reorder']);

const COPY = {
  abandoned_checkout: {
    subject: 'You left something worth finishing',
    title: 'Your checkout is still waiting',
    body: 'Your Promorang checkout was not completed. You can return whenever you are ready—nothing has been charged.',
    cta: 'Return to checkout',
  },
  confirmation: {
    subject: 'Your Promorang payment is confirmed',
    title: 'Payment confirmed',
    body: 'We received your payment and recorded it successfully. Your purchased benefit or placement is now moving into fulfillment.',
    cta: 'View your account',
  },
  replenishment: {
    subject: 'Keep your momentum funded',
    title: 'Ready to replenish?',
    body: 'Your last funded activity may be nearing its natural stopping point. Review results and replenish only if the value is working for you.',
    cta: 'Review and replenish',
  },
  renewal: {
    subject: 'Your membership renewal is approaching',
    title: 'A quick renewal reminder',
    body: 'Your Promorang membership may renew soon. Review your plan, benefits, and billing details before the next period.',
    cta: 'Review membership',
  },
  review: {
    subject: 'How did your purchase go?',
    title: 'Share your experience',
    body: 'Your feedback helps the merchant improve and helps other people choose with confidence.',
    cta: 'Leave a review',
  },
  reorder: {
    subject: 'Want to order it again?',
    title: 'A familiar favorite',
    body: 'It has been a little while since your purchase. If it delivered value, you can find it again in the marketplace.',
    cta: 'Visit the marketplace',
  },
};

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function destination(job) {
  if (job.job_type === 'renewal') return '/settings/subscription';
  if (job.job_type === 'review' || job.job_type === 'reorder') return '/marketplace';
  if (job.funnel === 'sponsorship' || job.funnel === 'campaign') return '/brand';
  if (job.funnel === 'gems') return '/wallet';
  return '/dashboard';
}

function shouldCancelAbandoned(job, events) {
  return events.some((event) =>
    event.stage === 'payment_succeeded' &&
    event.funnel === job.funnel &&
    event.entity_type === job.entity_type &&
    String(event.entity_id || '') === String(job.entity_id || '') &&
    new Date(event.occurred_at) >= new Date(job.created_at)
  );
}

async function processDueJobs({ limit = 100, now = new Date() } = {}) {
  if (!supabase) return { processed: 0, sent: 0, cancelled: 0, failed: 0, skipped: true };
  const { data: jobs, error } = await supabase
    .from('revenue_lifecycle_email_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('due_at', now.toISOString())
    .order('due_at', { ascending: true })
    .limit(limit);
  if (error) throw error;

  const result = { processed: 0, sent: 0, cancelled: 0, failed: 0 };
  for (const job of jobs || []) {
    result.processed += 1;
    const claim = await supabase.from('revenue_lifecycle_email_jobs')
      .update({ status: 'processing', attempts: job.attempts + 1, updated_at: now.toISOString() })
      .eq('id', job.id).eq('status', 'pending').select('id').maybeSingle();
    if (claim.error || !claim.data) continue;

    try {
      const [{ data: user }, { data: matchingEvents }] = await Promise.all([
        supabase.from('users').select('id,email,display_name,username,email_marketing_enabled').eq('id', job.user_id).maybeSingle(),
        job.job_type === 'abandoned_checkout'
          ? supabase.from('revenue_funnel_events').select('stage,funnel,entity_type,entity_id,occurred_at')
            .eq('funnel', job.funnel).eq('entity_type', job.entity_type).eq('entity_id', job.entity_id)
          : Promise.resolve({ data: [] }),
      ]);

      if (!user?.email || (MARKETING_JOBS.has(job.job_type) && user.email_marketing_enabled === false) ||
          (job.job_type === 'abandoned_checkout' && shouldCancelAbandoned(job, matchingEvents || []))) {
        await supabase.from('revenue_lifecycle_email_jobs').update({
          status: 'cancelled', updated_at: new Date().toISOString(),
          last_error: !user?.email ? 'missing_email' : user.email_marketing_enabled === false ? 'marketing_opt_out' : 'checkout_completed',
        }).eq('id', job.id);
        result.cancelled += 1;
        continue;
      }

      const content = COPY[job.job_type];
      const url = `${resendService.EMAIL_CONFIG.frontendUrl}${destination(job)}`;
      const name = escapeHtml(user.display_name || user.username || 'there');
      const html = resendService.getBaseTemplate({
        title: content.title,
        preheader: content.subject,
        content: `<p>Hi ${name},</p><p>${content.body}</p>`,
        ctaUrl: url,
        ctaText: content.cta,
      });
      const delivery = await resendService.sendEmail({
        to: user.email, subject: content.subject, html,
        text: `${content.title}\n\n${content.body}\n\n${url}`,
        userId: user.id, emailType: `revenue_${job.job_type}`,
        metadata: { lifecycle_job_id: job.id, funnel: job.funnel, entity_id: job.entity_id },
        tags: [{ name: 'type', value: `revenue-${job.job_type}` }],
      });
      if (!delivery.success) throw new Error(delivery.error || 'Email provider rejected message');

      await supabase.from('revenue_lifecycle_email_jobs').update({
        status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        provider_message_id: delivery.messageId || null, last_error: null,
      }).eq('id', job.id);
      await revenueFunnels.record({
        userId: user.id, funnel: job.funnel, stage: 'follow_up_sent',
        entityType: job.entity_type, entityId: job.entity_id,
        provider: 'resend', providerEventId: delivery.messageId,
        idempotencyKey: `lifecycle-email:${job.id}:sent`,
        metadata: { job_type: job.job_type, lifecycle_job_id: job.id },
      });
      result.sent += 1;
    } catch (sendError) {
      const attempts = job.attempts + 1;
      const terminal = attempts >= MAX_ATTEMPTS;
      const retryAt = new Date(now.getTime() + Math.min(24, 2 ** attempts) * 60 * 60 * 1000);
      await supabase.from('revenue_lifecycle_email_jobs').update({
        status: terminal ? 'failed' : 'pending',
        due_at: terminal ? job.due_at : retryAt.toISOString(),
        last_error: sendError.message, updated_at: new Date().toISOString(),
      }).eq('id', job.id);
      result.failed += 1;
    }
  }
  return result;
}

module.exports = { processDueJobs, shouldCancelAbandoned, destination, escapeHtml, COPY };
