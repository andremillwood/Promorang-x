const express = require('express');
const router = express.Router();

const emailScheduler = require('../jobs/emailScheduler');
const { processEmailQueue } = require('../workers/emailProcessor');
const adminDigestService = require('../services/adminDigestService');
const dailyLayerJob = require('../jobs/dailyLayerJob');
const promoShareScheduler = require('../jobs/promoShareScheduler');
const journeyNotificationScheduler = require('../services/journeyNotificationScheduler');
const guestRsvpMessagingService = require('../services/guestRsvpMessagingService');

function requireCronAuth(req, res, next) {
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret && process.env.NODE_ENV !== 'production') {
    return next();
  }

  const providedSecret =
    req.headers['x-cron-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.query.secret;

  if (!configuredSecret || providedSecret !== configuredSecret) {
    return res.status(401).json({ success: false, error: 'Unauthorized cron request' });
  }

  return next();
}

router.use(requireCronAuth);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    scheduler: emailScheduler.getStatus(),
    adminRecipients: adminDigestService.getAdminEmails(),
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    hobbyCronPath: '/api/cron/daily',
  });
});

async function runDailyEmailMaintenance() {
  const results = {};

  try {
    await processEmailQueue();
    results.emailQueue = { success: true };
  } catch (error) {
    results.emailQueue = { success: false, error: error.message };
  }

  try {
    results.scheduler = await emailScheduler.runDailyMaintenance();
  } catch (error) {
    results.scheduler = { success: false, error: error.message };
  }

  try {
    results.dailyLayer = await dailyLayerJob.runDailyLayerMaintenance();
  } catch (error) {
    results.dailyLayer = { success: false, error: error.message };
  }

  try {
    results.promoShare = await promoShareScheduler.runMaintenance(new Date());
  } catch (error) {
    results.promoShare = { success: false, error: error.message };
  }

  try {
    results.journeyNotifications = await journeyNotificationScheduler.runDueJourneyNotifications();
  } catch (error) {
    results.journeyNotifications = { success: false, error: error.message };
  }

  try {
    results.guestRsvpUpdates = await guestRsvpMessagingService.processMomentChanges();
  } catch (error) {
    results.guestRsvpUpdates = { success: false, error: error.message };
  }

  try {
    results.guestRsvpRetries = await guestRsvpMessagingService.retryFailedDeliveries();
  } catch (error) {
    results.guestRsvpRetries = { success: false, error: error.message };
  }

  try {
    results.guestRsvpReminders = await guestRsvpMessagingService.processUpcomingReminders();
  } catch (error) {
    results.guestRsvpReminders = { success: false, error: error.message };
  }

  try {
    const marketplaceService = require('../services/marketplaceService');
    const settlementService = require('../services/merchantSettlementService');
    results.expiredCommerceReservations = await marketplaceService.releaseExpiredReservations();
    results.merchantSettlements = await settlementService.processDueSettlements();
  } catch (error) {
    results.merchantSettlements = { success: false, error: error.message };
  }

  return results;
}

router.post('/daily', async (req, res) => {
  const results = await runDailyEmailMaintenance();
  res.json({ success: true, job: 'daily', results });
});

router.get('/daily', async (req, res) => {
  const results = await runDailyEmailMaintenance();
  res.json({ success: true, job: 'daily', results });
});

router.post('/email-queue', async (req, res) => {
  await processEmailQueue();
  res.json({ success: true, job: 'email-queue' });
});

router.get('/email-queue', async (req, res) => {
  await processEmailQueue();
  res.json({ success: true, job: 'email-queue' });
});

router.all('/journey-notifications', async (req, res) => {
  const results = await journeyNotificationScheduler.runDueJourneyNotifications();
  res.json({ success: true, job: 'journey-notifications', results });
});

router.all('/guest-rsvp-updates', async (req, res) => {
  const [changes, retries, reminders] = await Promise.all([guestRsvpMessagingService.processMomentChanges(), guestRsvpMessagingService.retryFailedDeliveries(), guestRsvpMessagingService.processUpcomingReminders()]);
  res.json({ success: true, job: 'guest-rsvp-updates', results: { changes, retries, reminders } });
});

router.post('/revenue-lifecycle', async (req, res) => {
  const result = await require('../services/revenueLifecycleEmailService').processDueJobs({
    limit: Number(req.body?.limit || 100),
  });
  res.json({ success: true, job: 'revenue-lifecycle', result });
});

router.get('/revenue-lifecycle', async (req, res) => {
  const result = await require('../services/revenueLifecycleEmailService').processDueJobs({
    limit: Number(req.query.limit || 100),
  });
  res.json({ success: true, job: 'revenue-lifecycle', result });
});

router.post('/admin-digest', async (req, res) => {
  const result = await adminDigestService.sendAdminDailyDigest();
  res.status(result.success ? 200 : 500).json({ success: result.success, result });
});

router.get('/admin-digest', async (req, res) => {
  const result = await adminDigestService.sendAdminDailyDigest();
  res.status(result.success ? 200 : 500).json({ success: result.success, result });
});

router.post('/daily-layer/reset', async (req, res) => {
  const result = await dailyLayerJob.triggerDayReset();
  res.status(result.success ? 200 : 500).json(result);
});

router.post('/daily-layer/close', async (req, res) => {
  const result = await dailyLayerJob.triggerDayClose(req.body?.date || req.query?.date || null);
  res.status(result.success ? 200 : 500).json(result);
});

router.get('/daily-layer/reset', async (req, res) => {
  const result = await dailyLayerJob.triggerDayReset();
  res.status(result.success ? 200 : 500).json(result);
});

router.get('/daily-layer/close', async (req, res) => {
  const result = await dailyLayerJob.triggerDayClose(req.query?.date || null);
  res.status(result.success ? 200 : 500).json(result);
});

router.post('/promoshare/maintenance', async (req, res) => {
  const result = await promoShareScheduler.runMaintenance(new Date());
  res.status(200).json({ success: true, result });
});

router.get('/promoshare/maintenance', async (req, res) => {
  const result = await promoShareScheduler.runMaintenance(new Date());
  res.status(200).json({ success: true, result });
});

router.post('/email-campaigns/:job', async (req, res) => {
  const result = await emailScheduler.runManually(req.params.job);
  res.status(result.success ? 200 : 400).json(result);
});

router.get('/email-campaigns/:job', async (req, res) => {
  const result = await emailScheduler.runManually(req.params.job);
  res.status(result.success ? 200 : 400).json(result);
});

module.exports = router;
