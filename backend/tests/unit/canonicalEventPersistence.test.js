const mockFrom = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: { from: mockFrom },
}));

const canonicalEvents = require('../../services/canonicalEventService');

function persistenceChain({ inserted = null, existing = null, writeError = null, existingError = null } = {}) {
  const chain = {};
  chain.upsert = jest.fn(() => chain);
  chain.select = jest.fn(() => chain);
  chain.maybeSingle = jest.fn()
    .mockResolvedValueOnce({ data: inserted, error: writeError })
    .mockResolvedValueOnce({ data: existing, error: existingError });
  chain.eq = jest.fn(() => chain);
  return chain;
}

describe('Canonical event persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('writes an already-built canonical envelope without re-normalizing field names', async () => {
    const chain = persistenceChain({ inserted: { id: 'event-1', event_name: 'proof.submission.observed' } });
    mockFrom.mockReturnValue(chain);
    const event = canonicalEvents.proofSubmissionEvent({
      submission: { id: 'proof-1', created_at: '2026-09-16T15:00:00.000Z' },
      momentId: 'moment-1',
      userId: 'participant-1',
    });

    const result = await canonicalEvents.recordBestEffort(event);

    expect(mockFrom).toHaveBeenCalledWith('canonical_events');
    expect(chain.upsert).toHaveBeenCalledWith(event, { onConflict: 'idempotency_key', ignoreDuplicates: true });
    expect(result).toMatchObject({ idempotent: false, event: { id: 'event-1' } });
  });

  test('returns the existing journal row when an idempotent duplicate is ignored', async () => {
    const existing = {
      id: 'event-existing',
      event_name: 'offer.redemption.verified',
      idempotency_key: 'canonical:offer-redemption:issuance-1',
    };
    const chain = persistenceChain({ inserted: null, existing });
    mockFrom.mockReturnValue(chain);
    const event = canonicalEvents.offerRedemptionEvent({
      actorUserId: 'merchant-1',
      issuance: { id: 'issuance-1', offer_id: 'offer-1', user_id: 'participant-1', offers: {} },
    });

    const result = await canonicalEvents.recordEvent(event);

    expect(chain.eq).toHaveBeenCalledWith('idempotency_key', event.idempotency_key);
    expect(result).toEqual({ event: existing, idempotent: true });
  });

  test('journal absence does not convert a committed domain write into an API failure', async () => {
    const chain = persistenceChain({ writeError: { code: '42P01', message: 'relation canonical_events does not exist' } });
    mockFrom.mockReturnValue(chain);
    const event = canonicalEvents.proofSubmissionEvent({
      submission: { id: 'proof-2' },
      momentId: 'moment-2',
      userId: 'participant-2',
    });

    const result = await canonicalEvents.recordBestEffort(event);

    expect(result).toMatchObject({ recorded: false, idempotent: false });
    expect(result.event).toEqual(event);
  });
});
