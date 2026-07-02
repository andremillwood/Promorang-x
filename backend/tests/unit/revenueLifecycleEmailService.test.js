const lifecycle = require('../../services/revenueLifecycleEmailService');

describe('revenue lifecycle email decisions', () => {
  const job = {
    job_type: 'abandoned_checkout',
    funnel: 'membership',
    entity_type: 'membership_plan',
    entity_id: 'PRO',
    created_at: '2026-07-01T10:00:00.000Z',
  };

  test('cancels abandoned checkout when matching payment completed later', () => {
    expect(lifecycle.shouldCancelAbandoned(job, [{
      stage: 'payment_succeeded',
      funnel: 'membership',
      entity_type: 'membership_plan',
      entity_id: 'PRO',
      occurred_at: '2026-07-01T10:10:00.000Z',
    }])).toBe(true);
  });

  test('does not cancel for a different entity or earlier payment', () => {
    expect(lifecycle.shouldCancelAbandoned(job, [{
      stage: 'payment_succeeded',
      funnel: 'membership',
      entity_type: 'membership_plan',
      entity_id: 'PLUS',
      occurred_at: '2026-07-01T10:10:00.000Z',
    }])).toBe(false);
    expect(lifecycle.shouldCancelAbandoned(job, [{
      stage: 'payment_succeeded',
      funnel: 'membership',
      entity_type: 'membership_plan',
      entity_id: 'PRO',
      occurred_at: '2026-07-01T09:00:00.000Z',
    }])).toBe(false);
  });

  test('maps lifecycle jobs to useful destinations', () => {
    expect(lifecycle.destination({ job_type: 'renewal' })).toBe('/settings/subscription');
    expect(lifecycle.destination({ job_type: 'review', funnel: 'marketplace' })).toBe('/marketplace');
    expect(lifecycle.destination({ job_type: 'replenishment', funnel: 'gems' })).toBe('/wallet');
  });

  test('defines copy for every requested lifecycle message', () => {
    expect(Object.keys(lifecycle.COPY).sort()).toEqual([
      'abandoned_checkout', 'confirmation', 'renewal', 'reorder', 'replenishment', 'review',
    ]);
  });

  test('escapes user-controlled names in HTML emails', () => {
    expect(lifecycle.escapeHtml('<Andre & Co>')).toBe('&lt;Andre &amp; Co&gt;');
  });
});
