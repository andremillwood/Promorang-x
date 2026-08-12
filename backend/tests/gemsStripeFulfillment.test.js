const mockRpc = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: { rpc: mockRpc },
}));

const gemsService = require('../services/gemsService');

describe('Gem Stripe fulfillment', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockRpc.mockResolvedValue({
      data: { transaction_id: 'gem-fulfillment-1', purchased_available: 25, idempotent: false },
      error: null,
    });
  });

  const event = {
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_gems_123',
        status: 'succeeded',
        amount: 2500,
        amount_received: 2500,
        currency: 'usd',
        customer: 'cus_123',
        livemode: true,
        metadata: {
          type: 'gems_purchase',
          user_id: '00000000-0000-0000-0000-000000000001',
          gems_amount: '25',
          usd_amount: '25',
        },
      },
    },
  };

  it('uses the PaymentIntent ID as the stable database idempotency key', async () => {
    const first = await gemsService.handleStripeWebhook(event);
    const retry = await gemsService.handleStripeWebhook(event);

    expect(first.handled).toBe(true);
    expect(retry.handled).toBe(true);
    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc.mock.calls[0][0]).toBe('fulfill_purchased_gems');
    expect(mockRpc.mock.calls[0][1].p_payment_intent_id).toBe('pi_gems_123');
    expect(mockRpc.mock.calls[1][1].p_payment_intent_id).toBe('pi_gems_123');
    expect(mockRpc.mock.calls[0][1]).toMatchObject({
      p_gems_amount: 25,
      p_fiat_amount: 25,
      p_fiat_currency: 'USD',
      p_livemode: true,
    });
    expect(first.purchased_available).toBe(25);
  });

  it('rejects a paid amount that does not match the Gem quantity', async () => {
    const mismatched = structuredClone(event);
    mismatched.data.object.amount_received = 2400;
    await expect(gemsService.handleStripeWebhook(mismatched)).rejects.toThrow('amount mismatch');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('ignores unrelated successful PaymentIntents', async () => {
    const unrelated = structuredClone(event);
    unrelated.data.object.metadata.type = 'merchant_purchase';
    await expect(gemsService.handleStripeWebhook(unrelated)).resolves.toEqual({
      handled: false,
      reason: 'not_gems_purchase',
    });
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
