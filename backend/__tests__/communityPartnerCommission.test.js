'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateCommissionQuote } = require('../services/communityPartnerCommission');
test('5% standard commission when margin permits', () => {
  const q = calculateCommissionQuote({ eligibleOrderCents: 350000, contributionMarginCents: 100000 });
  assert.equal(q.commissionCents, 17500);
  assert.equal(q.status, 'quote_only');
});
test('margin protection caps payout at 25% of contribution margin', () => {
  const q = calculateCommissionQuote({ eligibleOrderCents: 350000, contributionMarginCents: 40000 });
  assert.equal(q.commissionCents, 10000);
});
test('no margin yields no commission', () => {
  assert.equal(calculateCommissionQuote({ eligibleOrderCents: 350000, contributionMarginCents: 0 }).commissionCents, 0);
});
test('rejects invalid rates and amounts', () => {
  for (const args of [
    { eligibleOrderCents: -1, contributionMarginCents: 0 },
    { eligibleOrderCents: 100, contributionMarginCents: 101 },
    { eligibleOrderCents: 100, contributionMarginCents: 10, rateBps: 1001 },
    { eligibleOrderCents: 1.5, contributionMarginCents: 1 },
  ]) assert.throws(() => calculateCommissionQuote(args));
});
