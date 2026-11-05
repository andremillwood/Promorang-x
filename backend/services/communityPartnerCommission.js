'use strict';

// Munchies pilot: pure quote calculation only. Never treats a quote as payable.
// The fulfillment system must separately verify settled payment, completed
// fulfillment, unique attribution, refund status, and operator approval.
const DEFAULT_RATE_BPS = 500; // 5% of eligible net order value
const MAX_RATE_BPS = 1000; // pilot hard ceiling, 10%
function calculateCommissionQuote({ eligibleOrderCents, contributionMarginCents, rateBps = DEFAULT_RATE_BPS }) {
  if (![eligibleOrderCents, contributionMarginCents, rateBps].every(Number.isSafeInteger)) {
    throw new TypeError('Amounts and rate must be safe integers');
  }
  if (eligibleOrderCents < 0 || contributionMarginCents < 0 || rateBps < 0 || rateBps > MAX_RATE_BPS) {
    throw new RangeError('Invalid amount or pilot commission rate');
  }
  if (contributionMarginCents > eligibleOrderCents) throw new RangeError('Margin cannot exceed eligible order value');
  // Protect merchant unit economics: cap commission at 25% of verified
  // contribution margin. If margin is unknown, do not calculate a quote.
  const rateQuote = Math.floor(eligibleOrderCents * rateBps / 10000);
  const marginCap = Math.floor(contributionMarginCents / 4);
  return {
    commissionCents: Math.min(rateQuote, marginCap),
    rateBps,
    eligibleOrderCents,
    contributionMarginCents,
    status: 'quote_only',
    currency: 'JMD',
  };
}
module.exports = { calculateCommissionQuote, DEFAULT_RATE_BPS, MAX_RATE_BPS };
