const { supabase } = require('../lib/supabase');
const resendService = require('./resendService');

const DEFAULT_ADMIN_EMAILS = ['andremillwood@gmail.com'];

function getAdminEmails() {
  const configured = (process.env.ADMIN_DIGEST_EMAILS || process.env.ADMIN_ALERT_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return configured.length ? configured : DEFAULT_ADMIN_EMAILS;
}

async function countRows(table, applyQuery = (query) => query) {
  try {
    const query = supabase.from(table).select('id', { count: 'exact', head: true });
    const { count, error } = await applyQuery(query);
    if (error) {
      return { count: null, error: error.message };
    }
    return { count: count || 0, error: null };
  } catch (error) {
    return { count: null, error: error.message };
  }
}

async function getAdminDigestData() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    users24h,
    emails24h,
    supportOpen,
    support24h,
    couponsPending,
  ] = await Promise.all([
    countRows('users', (query) => query.gte('created_at', since)),
    countRows('email_events', (query) => query.gte('created_at', since)),
    countRows('support_tickets', (query) => query.in('status', ['open', 'in_progress'])),
    countRows('support_tickets', (query) => query.gte('created_at', since)),
    countRows('email_notification_queue', (query) => query.eq('status', 'pending')),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    since,
    metrics: {
      users24h,
      emails24h,
      supportOpen,
      support24h,
      couponsPending,
    },
  };
}

function renderMetric(label, metric) {
  const value = metric.count === null ? 'n/a' : metric.count;
  const error = metric.error
    ? `<div style="margin-top:4px;color:#92400e;font-size:12px;">${metric.error}</div>`
    : '';
  return `
    <tr>
      <td class="metrics-table-label">${label}</td>
      <td class="metrics-table-value">${value}${error}</td>
    </tr>
  `;
}

async function sendAdminDailyDigest() {
  if (!supabase) return { success: false, error: 'Supabase unavailable' };

  const recipients = getAdminEmails();
  const digest = await getAdminDigestData();
  const dateLabel = new Date(digest.generatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = resendService.getBaseTemplate({
    title: 'Daily Admin Digest',
    preheader: `Promorang platform summary for ${dateLabel}`,
    content: `
      <p>Here is the last 24 hours of platform activity.</p>

      <div class="info-card">
        <table role="presentation" class="metrics-table">
          ${renderMetric('New users', digest.metrics.users24h)}
          ${renderMetric('Email events', digest.metrics.emails24h)}
          ${renderMetric('Open support tickets', digest.metrics.supportOpen)}
          ${renderMetric('New support tickets', digest.metrics.support24h)}
          ${renderMetric('Pending coupon emails', digest.metrics.couponsPending)}
        </table>
      </div>

      <p style="font-size:14px;">Generated at ${new Date(digest.generatedAt).toLocaleString('en-US')}.</p>
    `,
    ctaUrl: `${resendService.EMAIL_CONFIG.frontendUrl}/admin`,
    ctaText: 'Open Admin',
  });

  const result = await resendService.sendEmail({
    to: recipients,
    subject: `Promorang Daily Admin Digest - ${dateLabel}`,
    html,
    text: `Promorang daily admin digest: new users=${digest.metrics.users24h.count ?? 'n/a'}, email events=${digest.metrics.emails24h.count ?? 'n/a'}, open support=${digest.metrics.supportOpen.count ?? 'n/a'}, new support=${digest.metrics.support24h.count ?? 'n/a'}, pending coupon emails=${digest.metrics.couponsPending.count ?? 'n/a'}.`,
    tags: [{ name: 'type', value: 'admin-digest' }],
  });

  return { ...result, recipients, digest };
}

module.exports = {
  getAdminEmails,
  getAdminDigestData,
  sendAdminDailyDigest,
};
