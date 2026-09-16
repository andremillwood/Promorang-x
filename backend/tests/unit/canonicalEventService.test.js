const {
  buildCanonicalEvent,
  offerRedemptionEvent,
  proofSubmissionEvent,
  proofReviewEvent,
} = require('../../services/canonicalEventService');

describe('Canonical event contract', () => {
  test('requires an explicit truth class from the supported vocabulary', () => {
    expect(() => buildCanonicalEvent({
      eventName: 'test.event',
      objectType: 'test',
      objectId: '1',
      source: 'test',
      idempotencyKey: 'test:1',
      truthClass: 'successful',
    })).toThrow('Unsupported canonical truth class');
  });

  test('maps merchant redemption to verified truth without copying the redemption code', () => {
    const event = offerRedemptionEvent({
      actorUserId: 'merchant-1',
      venueId: 'venue-1',
      issuance: {
        id: 'issuance-1',
        offer_id: 'offer-1',
        user_id: 'participant-1',
        redemption_code: 'PR-SECRET',
        redeemed_at: '2026-09-16T15:00:00.000Z',
        offers: { id: 'offer-1', venue_id: 'venue-1', fulfillment_type: 'qr', reward_type: 'perk' },
      },
    });

    expect(event).toMatchObject({
      event_name: 'offer.redemption.verified',
      truth_class: 'verified',
      actor_user_id: 'merchant-1',
      subject_user_id: 'participant-1',
      object_type: 'offer_issuance',
      object_id: 'issuance-1',
      aggregate_type: 'offer',
      aggregate_id: 'offer-1',
      place_id: 'venue-1',
      idempotency_key: 'canonical:offer-redemption:issuance-1',
    });
    expect(JSON.stringify(event)).not.toContain('PR-SECRET');
  });

  test('proof submission is observed, not verified', () => {
    const event = proofSubmissionEvent({
      submission: { id: 'proof-1', created_at: '2026-09-16T15:00:00.000Z' },
      momentId: 'moment-1',
      userId: 'participant-1',
    });
    expect(event).toMatchObject({
      event_name: 'proof.submission.observed',
      truth_class: 'observed',
      experience_id: 'moment-1',
      subject_user_id: 'participant-1',
    });
  });

  test('approval and rejection remain different canonical events', () => {
    const submission = { id: 'proof-1', moment_id: 'moment-1', user_id: 'participant-1' };
    const approved = proofReviewEvent({ submission, reviewerId: 'host-1', action: 'approve', result: { submission: { submission_state: 'verified' } } });
    const rejected = proofReviewEvent({ submission, reviewerId: 'host-1', action: 'reject', result: { submission: { submission_state: 'rejected' } } });

    expect(approved).toMatchObject({ event_name: 'proof.review.verified', truth_class: 'verified' });
    expect(rejected).toMatchObject({ event_name: 'proof.review.rejected', truth_class: 'administrative' });
    expect(approved.idempotency_key).not.toBe(rejected.idempotency_key);
  });
});
