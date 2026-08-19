const { stageFor, stableEventKey, normalizeEvent, executionTransitionFor, summarize, benchmarkAgainst } = require('../../services/demandEventService');

describe('Demand event network', () => {
  test('maps source events into the shared demand loop', () => {
    expect(stageFor('qr_scanned')).toBe('interest');
    expect(stageFor('checked_in')).toBe('participation');
    expect(stageFor('purchase_completed')).toBe('conversion');
    expect(stageFor('review_verified')).toBe('review');
    expect(stageFor('message_delivered')).toBe('discovery');
    expect(stageFor('message_consent_granted')).toBe('interest');
  });

  test('consent advances only its matching message journey', () => {
    expect(executionTransitionFor({ event_type: 'message_consent_granted', channel: 'whatsapp' })).toMatchObject({ systemName: 'whatsapp', journeyStatus: 'ready', jobStatus: 'completed' });
    expect(executionTransitionFor({ event_type: 'message_delivered', channel: 'whatsapp' })).toBeNull();
  });

  test('rejects invented event types instead of polluting intelligence', () => {
    expect(() => normalizeEvent({ eventType: 'clicked_something', sourceSystem: 'test', sourceReference: '1' })).toThrow('Unsupported demand event');
  });

  test('keeps the same person’s actions separate across campaigns', () => {
    const event = { sourceSystem: 'promorang_web', eventType: 'saved', actorUserId: 'u1' };
    expect(stableEventKey({ ...event, campaignId: 'campaign-a' })).not.toBe(stableEventKey({ ...event, campaignId: 'campaign-b' }));
  });

  test('deduplicates people within each stage and separates verified value', () => {
    const events = [
      { stage: 'discovery', anonymous_id: 'a', occurred_at: '2026-08-06T10:00:00Z' },
      { stage: 'discovery', anonymous_id: 'a', occurred_at: '2026-08-06T09:00:00Z' },
      { stage: 'discovery', source_reference: 'system-only-impression' },
      { stage: 'interest', anonymous_id: 'a' },
      { stage: 'participation', actor_user_id: 'u1' },
      { stage: 'conversion', actor_user_id: 'u1', verified: true, value_amount: 40 },
      { stage: 'conversion', actor_user_id: 'u2', verified: false, value_amount: 90 },
      { stage: 'review', actor_user_id: 'u1' },
    ];
    const result = summarize(events);
    expect(result.counts.discovery).toBe(1);
    expect(result.counts.conversion).toBe(2);
    expect(result.verified_conversions).toBe(1);
    expect(result.verified_value).toBe(40);
    expect(result.rates.conversion_to_review).toBe(50);
  });

  test('withholds benchmarks until the merchant has a credible cohort', () => {
    const current = { rates: { participation_to_conversion: 30 } };
    expect(benchmarkAgainst(current, Array.from({ length: 4 }, () => ({ total_events: 10, rates: { participation_to_conversion: 20 } }))).eligible).toBe(false);
    expect(benchmarkAgainst(current, Array.from({ length: 5 }, () => ({ total_events: 10, rates: { participation_to_conversion: 20 } })))).toMatchObject({ eligible: true, cohort_median: 20, difference_points: 10 });
  });
});
