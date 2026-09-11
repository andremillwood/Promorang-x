const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: { from: mockFrom, rpc: mockRpc },
}));

jest.mock('../../services/resendService', () => ({
  sendTicketPurchaseEmail: jest.fn().mockResolvedValue(null),
  sendAftrHrsRsvpEmail: jest.fn().mockResolvedValue(null),
  sendAftrHrsAdminDraftEmail: jest.fn().mockResolvedValue(null),
}));

const service = require('../../services/aftrHrsService');
const { AFTRHRS_CLAIM_ERRORS, aftrHrsClaimFriday } = require('../../lib/aftrHrsRules');

function table(result) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    or: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: () => Promise.resolve(result),
    single: () => Promise.resolve(result),
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => chain,
  };
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFrom.mockImplementation(() => table({ data: null, error: null, count: 0 }));
});

test('claim Friday stays tonight until Saturday 6am Jamaica, then opens next week', () => {
  expect(aftrHrsClaimFriday(new Date('2026-09-11T21:00:00-05:00'))).toBe('2026-09-11');
  expect(aftrHrsClaimFriday(new Date('2026-09-12T05:59:00-05:00'))).toBe('2026-09-11');
  expect(aftrHrsClaimFriday(new Date('2026-09-12T06:00:00-05:00'))).toBe('2026-09-18');
  expect(aftrHrsClaimFriday(new Date('2026-09-16T10:00:00-05:00'))).toBe('2026-09-18');
});

test('unauthorized users cannot open administrative controls', async () => {
  await expect(service.adminOverview({ id: 'member-1', role: 'participant', roles: [] }))
    .rejects.toMatchObject({ status: 403, code: 'forbidden', message: AFTRHRS_CLAIM_ERRORS.forbidden });
  expect(mockFrom).not.toHaveBeenCalled();
});

test('claim delegates issuance to the atomic database function', async () => {
  mockRpc.mockResolvedValue({
    data: { pass: { id: 'pass-1', unique_code: 'AH-TEST0001' }, remaining: 19 },
    error: null,
  });
  mockFrom.mockImplementation((name) => table({
    data: name === 'event_analytics_events' ? null : null,
    error: null,
  }));

  const result = await service.claimDigitalPass(
    { id: 'user-1', email: 'one@promorang.co', display_name: 'One' },
    { termsAccepted: true, source: 'landing' },
  );

  expect(mockRpc).toHaveBeenCalledWith('claim_aftrhrs_digital_pass', expect.objectContaining({
    p_user_id: 'user-1',
    p_terms_accepted: true,
  }));
  expect(result.remaining).toBe(19);
  const { sendAftrHrsRsvpEmail } = require('../../services/resendService');
  expect(sendAftrHrsRsvpEmail).toHaveBeenCalledWith(
    'one@promorang.co',
    'One',
    expect.objectContaining({ kind: 'pass', activationCode: 'AH-TEST0001' }),
  );
});

test('sold-out RPC errors surface the ambassador pathway code', async () => {
  mockRpc.mockResolvedValue({ data: null, error: new Error('SOLD_OUT') });
  await expect(service.claimDigitalPass({ id: 'user-2', email: 'two@promorang.co' }, { termsAccepted: true }))
    .rejects.toMatchObject({ status: 409, code: 'sold_out' });
});

test('QR redemption cannot be applied twice', async () => {
  mockRpc.mockResolvedValue({ data: null, error: new Error('ALREADY_REDEEMED') });
  await expect(service.redeemPass({ id: 'staff-1' }, { code: 'promorang://aftrhrs/redeem/AH-USED0001' }))
    .rejects.toMatchObject({ status: 409, code: 'already_redeemed' });
  expect(mockRpc).toHaveBeenCalledWith('redeem_aftrhrs_pass', expect.objectContaining({
    p_code: 'AH-USED0001',
  }));
});

test('public read enables weekly Friday recurrence and keeps claims open', async () => {
  const editionRow = {
    id: 'ed-1',
    slug: 'aftrhrs',
    moment_id: '00000000-0000-0000-0002-000000000080',
    venue_id: '00000000-0000-0000-0003-000000000080',
    digital_allocation: 30,
    digital_claimed: 2,
    week_friday: '2026-09-11',
    claim_closes_at: '2026-09-11T22:00:00-05:00',
    claims_open: true,
    faqs: [{ question: 'Where is Sea Deck?', answer: 'Orchid Village, 20 Barbican Road, Kingston.' }],
    venue_policies: {},
    moments: {
      id: '00000000-0000-0000-0002-000000000080',
      starts_at: '2026-09-11T22:00:00-05:00',
      recurrence_enabled: false,
    },
  };
  const updates = [];
  mockFrom.mockImplementation((name) => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      or: () => chain,
      order: () => chain,
      limit: () => chain,
      maybeSingle: () => Promise.resolve({
        data: name === 'event_editions' ? editionRow : null,
        error: null,
      }),
      single: () => {
        if (name === 'event_editions') {
          const patch = [...updates].reverse().find((item) => item.name === 'event_editions')?.patch || {};
          return Promise.resolve({ data: { ...editionRow, ...patch, moments: editionRow.moments }, error: null });
        }
        if (name === 'moments') {
          const patch = [...updates].reverse().find((item) => item.name === 'moments')?.patch || {};
          return Promise.resolve({ data: { ...editionRow.moments, ...patch }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
      insert: () => chain,
      update: (patch) => {
        updates.push({ name, patch });
        return chain;
      },
      upsert: () => chain,
      delete: () => chain,
    };
    return chain;
  });

  const snap = await service.publicSnapshot(null);
  const momentPatch = updates.find((item) => item.name === 'moments')?.patch;
  const editionPatch = updates.find((item) => item.name === 'event_editions')?.patch;
  expect(momentPatch).toMatchObject({
    recurrence_enabled: true,
    recurrence_frequency: 'weekly',
    recurrence_by_weekday: [5],
    recurrence_timezone: 'America/Jamaica',
  });
  expect(editionPatch.claim_closes_at).toBeNull();
  expect(editionPatch.faqs.some((faq) => /every friday/i.test(`${faq.question} ${faq.answer}`))).toBe(true);
  expect(snap.edition.claim_closes_at).toBeNull();
});

test('guest RSVP is captured without a Promorang account', async () => {
  mockRpc.mockResolvedValue({
    data: { entry: { id: 'g1', unique_code: 'AH-GUEST001', full_name: 'Ada Hall', kind: 'rsvp' }, kind: 'rsvp', remaining: 29 },
    error: null,
  });
  const result = await service.guestRsvp({
    name: 'Ada Hall',
    email: 'ada@example.com',
    phone: '8765550101',
    kind: 'rsvp',
    termsAccepted: true,
  });
  expect(mockRpc).toHaveBeenCalledWith('aftrhrs_guest_rsvp', expect.objectContaining({
    p_kind: 'rsvp',
    p_email: 'ada@example.com',
  }));
  expect(result.kind).toBe('rsvp');
  expect(result.ticketPath).toBeNull();
  const { sendAftrHrsRsvpEmail } = require('../../services/resendService');
  expect(sendAftrHrsRsvpEmail).toHaveBeenCalledWith(
    'ada@example.com',
    'Ada Hall',
    expect.objectContaining({ kind: 'rsvp' }),
  );
});

test('unauthenticated claimers are rejected before any write', async () => {
  await expect(service.claimDigitalPass(null, { termsAccepted: true }))
    .rejects.toMatchObject({ status: 401, code: 'unauthenticated' });
  expect(mockRpc).not.toHaveBeenCalled();
});
