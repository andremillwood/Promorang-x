const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: { from: mockFrom, rpc: mockRpc },
}));
jest.mock('../../services/revenueFunnelService', () => ({ record: jest.fn().mockResolvedValue(null) }));
jest.mock('../../services/peopleExperienceService', () => ({ recordVerifiedAction: jest.fn().mockResolvedValue(null) }));

const offers = require('../../services/offerService');

function offerQuery(offer) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    single: () => Promise.resolve({ data: offer, error: null }),
  };
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFrom.mockImplementation((table) => {
    if (table === 'offers') return offerQuery({ id: 'offer-1', owner_user_id: 'merchant-1', value_amount: 25 });
    throw new Error(`Unexpected table ${table}`);
  });
});

test('redemption delegates the state transition and counters to one database transaction', async () => {
  mockRpc.mockResolvedValue({
    data: { id: 'issuance-1', offer_id: 'offer-1', user_id: 'member-1', metadata: {} },
    error: null,
  });

  const result = await offers.redeemByCode('merchant-1', 'pr-abc123', null, null);

  expect(mockRpc).toHaveBeenCalledWith('redeem_offer_atomic', {
    p_actor_user_id: 'merchant-1',
    p_redemption_code: 'PR-ABC123',
    p_venue_id: null,
    p_notes: null,
  });
  expect(result).toMatchObject({ id: 'issuance-1', offers: { id: 'offer-1' } });
});

test('QR payloads are normalized before the atomic redeem transaction', async () => {
  mockRpc.mockResolvedValue({
    data: { id: 'issuance-2', offer_id: 'offer-1', user_id: 'member-1', metadata: {} },
    error: null,
  });

  await offers.redeemByCode('merchant-1', 'promorang://offer/redeem/PR-QR99AA11', null, 'scanned');

  expect(mockRpc).toHaveBeenCalledWith('redeem_offer_atomic', {
    p_actor_user_id: 'merchant-1',
    p_redemption_code: 'PR-QR99AA11',
    p_venue_id: null,
    p_notes: 'scanned',
  });
});

test('a failed atomic redemption produces no application-side counter writes', async () => {
  mockRpc.mockResolvedValue({ data: null, error: new Error('Offer is not redeemable') });
  await expect(offers.redeemByCode('merchant-1', 'PR-USED', null, null)).rejects.toThrow('Offer is not redeemable');
  expect(mockFrom).not.toHaveBeenCalled();
});
