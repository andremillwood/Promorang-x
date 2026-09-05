const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: { from: mockFrom, rpc: mockRpc },
}));
jest.mock('../../services/revenueFunnelService', () => ({ record: jest.fn().mockResolvedValue(null) }));
jest.mock('../../services/peopleExperienceService', () => ({ recordVerifiedAction: jest.fn().mockResolvedValue(null) }));
jest.mock('../../services/gemsService', () => ({ creditGems: jest.fn().mockResolvedValue({ success: true }) }));

const offers = require('../../services/offerService');

function issuanceQuery(issuance) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    update: () => chain,
    insert: () => chain,
    single: () => Promise.resolve({ data: issuance, error: null }),
  };
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('claiming an automatic offer redeems it and credits gems', async () => {
  const issuance = {
    id: 'iss-1',
    offer_id: 'offer-1',
    user_id: 'member-1',
    status: 'issued',
    redemption_code: 'PR-AUTO01',
    fulfillment_data: {},
    offers: { id: 'offer-1', owner_user_id: 'merchant-1', fulfillment_type: 'automatic', reward_type: 'gems', value_amount: 250 },
  };
  let reads = 0;
  mockFrom.mockImplementation((table) => {
    if (table === 'offers') return issuanceQuery(issuance.offers);
    reads += 1;
    return issuanceQuery(reads === 1 ? issuance : { ...issuance, status: 'claimed', offers: issuance.offers });
  });
  mockRpc.mockResolvedValue({
    data: { ...issuance, status: 'redeemed', fulfillment_data: {} },
    error: null,
  });

  const result = await offers.claimIssuance('member-1', 'iss-1');
  expect(mockRpc).toHaveBeenCalledWith('redeem_offer_atomic', expect.objectContaining({
    p_actor_user_id: 'member-1',
    p_redemption_code: 'PR-AUTO01',
  }));
  expect(require('../../services/gemsService').creditGems).toHaveBeenCalledWith('member-1', 250, 'bonus', expect.objectContaining({ issuance_id: 'iss-1' }));
  expect(result).toBeTruthy();
});

test('shipping address updates stay pending until the merchant ships', async () => {
  const issuance = {
    id: 'iss-2',
    user_id: 'member-1',
    status: 'issued',
    fulfillment_data: {},
    offers: { fulfillment_type: 'shipping', owner_user_id: 'merchant-1' },
  };
  mockFrom.mockImplementation(() => issuanceQuery({
    ...issuance,
    status: 'fulfillment_pending',
    fulfillment_data: { shipping_stage: 'ready_to_ship' },
  }));

  const result = await offers.updateShippingAddress('member-1', 'iss-2', {
    name: 'Ada Lovelace',
    line1: '1 Harbour Street',
    city: 'Kingston',
    postal_code: 'JMAAW01',
    country: 'JM',
  });
  expect(result.status).toBe('fulfillment_pending');
  expect(result.fulfillment_data.shipping_stage).toBe('ready_to_ship');
  expect(mockRpc).not.toHaveBeenCalled();
});
