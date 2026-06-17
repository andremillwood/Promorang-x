/**
 * Compatibility wrapper for queued reward emails.
 *
 * Older queue processors import this module. Keep the same function names, but
 * send through resendService so all platform email activity appears in Resend.
 */

const resendService = require('./resendService');

async function sendCouponEarnedEmail(userEmail, userName, couponData) {
  return resendService.sendCouponEarnedEmail(userEmail, userName, couponData);
}

async function sendWeeklyRewardsDigest(userEmail, userName, stats) {
  return resendService.sendWeeklyDigestEmail(userEmail, userName, stats);
}

module.exports = {
  sendCouponEarnedEmail,
  sendWeeklyRewardsDigest,
};
