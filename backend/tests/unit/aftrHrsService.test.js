const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: { from: mockFrom, rpc: mockRpc },
}));

jest.mock('../../services/resendService', () => ({
  sendTicketPurchaseEmail: jest.fn().mockResolvedValue(null),
}));

const service = require('../../services/aftrHrsService');
const { AFTRHRS_CLAIM_ERRORS } = require('../../lib/aftrHrsRules');

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

test('unauthenticated claimers are rejected before any write', async () => {
  await expect(service.claimDigitalPass(null, { termsAccepted: true }))
    .rejects.toMatchObject({ status: 401, code: 'unauthenticated' });
  expect(mockRpc).not.toHaveBeenCalled();
});
