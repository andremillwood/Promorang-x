/**
 * PROMORANG WEB PUSH NOTIFICATION SERVICE
 * Dispatches real-time web push payloads to user devices (lock screen & notification tray)
 */

let webpush;
try {
  webpush = require('web-push');
} catch {
  webpush = null;
}

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'mock-vapid-private-key';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@promorang.co';

if (webpush && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Send push notification to a specific subscription
 * @param {Object} subscription - { endpoint, keys: { p256dh, auth } }
 * @param {Object} payload - { title, body, data: { url } }
 */
async function sendPushNotification(subscription, payload) {
  if (!webpush || !process.env.VAPID_PRIVATE_KEY) {
    console.log('---------------------------------------------------');
    console.log('🔔 MOCK WEB PUSH SEND:');
    console.log('To Endpoint:', subscription?.endpoint?.slice(0, 40) + '...');
    console.log('Title:', payload.title);
    console.log('Body:', payload.body);
    console.log('Target URL:', payload.data?.url || '/');
    console.log('---------------------------------------------------');
    return { success: true, mock: true };
  }

  try {
    const formattedPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      data: payload.data || { url: '/' },
    });

    const result = await webpush.sendNotification(subscription, formattedPayload);
    return { success: true, result };
  } catch (error) {
    console.error('Push notification dispatch error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify user of upcoming RSVP Moment
 */
async function sendMomentReminderPush(subscription, { momentTitle, startsIn, url }) {
  return sendPushNotification(subscription, {
    title: `⏰ Starting soon: ${momentTitle}`,
    body: `Your moment begins in ${startsIn}. Tap to access your door pass.`,
    data: { url: url || '/discover/moments' },
  });
}

/**
 * Notify user of Gem payout from PromoShare or check-in
 */
async function sendGemPayoutPush(subscription, { gemsAmount, reason, url }) {
  return sendPushNotification(subscription, {
    title: `💎 +${gemsAmount} Gems Received!`,
    body: `You just earned ${gemsAmount} Gems from ${reason}. Tap to view wallet balance.`,
    data: { url: url || '/wallet' },
  });
}

module.exports = {
  sendPushNotification,
  sendMomentReminderPush,
  sendGemPayoutPush,
  VAPID_PUBLIC_KEY,
};
