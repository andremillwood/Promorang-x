const { RECONCILIATION_SPECS, evaluateRow } = require('../../services/canonicalReconciliationService');

describe('Canonical reconciliation semantics', () => {
  test('tracks the current production event families', () => {
    expect(RECONCILIATION_SPECS.map((item) => item.event)).toEqual(expect.arrayContaining([
      'offer.redemption.verified',
      'proof.submission.observed',
      'proof.review.verified',
      'proof.review.rejected',
      'settlement.payout.queued',
      'settlement.payout.paid',
      'attendance.rsvp.observed',
      'attendance.guest.verified',
      'commerce.purchase.fulfilled',
    ]));
  });

  test('marks equal source and canonical counts reconciled', () => {
    expect(evaluateRow({ key: 'proof_verified', event: 'proof.review.verified' }, 4, 4)).toMatchObject({
      status: 'reconciled',
      delta: 0,
      coverage: 1,
    });
  });

  test('marks canonical shortfall as missing events', () => {
    expect(evaluateRow({ key: 'payout_paid', event: 'settlement.payout.paid' }, 5, 3)).toMatchObject({
      status: 'missing_events',
      delta: -2,
      coverage: 0.6,
    });
  });

  test('marks canonical surplus as extra events rather than hiding it', () => {
    expect(evaluateRow({ key: 'commerce_purchase', event: 'commerce.purchase.fulfilled' }, 2, 3)).toMatchObject({
      status: 'extra_events',
      delta: 1,
      coverage: 1,
    });
  });

  test('does not call a non-empty canonical family reconciled when source count is zero', () => {
    expect(evaluateRow({ key: 'guest_rsvp', event: 'attendance.rsvp.observed' }, 0, 1)).toMatchObject({
      status: 'extra_events',
      coverage: 0,
    });
  });
});
