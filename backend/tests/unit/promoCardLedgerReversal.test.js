jest.mock('../../lib/supabase', () => ({ supabase: null }));
const { mergeCommerceOrderMetadata } = require('../../lib/commerceOrderMetadata');
const { promoCardReversalTarget, postPromoCardSpendReversal } = require('../../services/promoCardLedger');

describe('PromoCard refund reversal', () => {
  test('a full refund returns the whole benefit spend', () => {
    expect(promoCardReversalTarget({
      spendAmount: -10,
      orderTotal: 40,
      refundedAmount: 40,
      fullyRefunded: true,
    })).toBe(10);
  });

  test('a partial refund returns the same share of the spend', () => {
    expect(promoCardReversalTarget({
      spendAmount: '-10.00',
      orderTotal: 40,
      refundedAmount: 10,
    })).toBe(2.5);
  });

  test('dispute metadata keeps the night that checkout stored', () => {
    expect(mergeCommerceOrderMetadata(
      { moment_id: '11111111-1111-4111-8111-111111111111', promocard_title: 'Coffee' },
      { stripe_dispute_id: 'dp_1', stripe_dispute_status: 'needs_response' },
    )).toEqual({
      moment_id: '11111111-1111-4111-8111-111111111111',
      promocard_title: 'Coffee',
      stripe_dispute_id: 'dp_1',
      stripe_dispute_status: 'needs_response',
    });
  });

  test('posts one reversal for the refund delta and ignores a replay', async () => {
    const calls = [];
    const db = {
      from(table) {
        const result = {
          select() { return result; },
          eq(column, value) {
            result.filters.push([column, value]);
            return result;
          },
          maybeSingle() {
            return Promise.resolve({
              data: { id: 'spend-1', user_id: 'buyer', amount: -10, is_test: false, moment_id: 'moment-1', venue_id: null, issuance_id: 'iss-1' },
              error: null,
            });
          },
          then(resolve, reject) {
            return Promise.resolve({ data: [], error: null }).then(resolve, reject);
          },
          filters: [],
        };
        return result;
      },
      rpc(name, args) {
        calls.push({ name, args });
        return Promise.resolve({ data: { id: 'rev-1' }, error: null });
      },
    };
    const order = { id: 'order-1', total_amount: 40 };
    const first = await postPromoCardSpendReversal({ db, order, refundedAmount: 40, fullyRefunded: true });
    expect(first.posted).toBe(true);
    expect(first.delta).toBe(10);
    expect(calls[0].args.p_entry_type).toBe('reversal_refund');
    expect(calls[0].args.p_idempotency_key).toBe('reversal_refund:order-1:4000');
    expect(calls[0].args.p_related_entry_id).toBe('spend-1');
    expect(calls[0].args.p_moment_id).toBe('moment-1');

    db.from = () => {
      const result = {
        select() { return result; },
        eq() { return result; },
        maybeSingle() {
          return Promise.resolve({
            data: { id: 'spend-1', user_id: 'buyer', amount: -10, is_test: false, moment_id: 'moment-1', venue_id: null, issuance_id: 'iss-1' },
            error: null,
          });
        },
        then(resolve, reject) {
          return Promise.resolve({ data: [{ amount: 10 }], error: null }).then(resolve, reject);
        },
      };
      return result;
    };
    const again = await postPromoCardSpendReversal({ db, order, refundedAmount: 40, fullyRefunded: true });
    expect(again.posted).toBe(false);
    expect(again.reason).toBe('already_reversed');
    expect(calls).toHaveLength(1);
  });

  test('does not invent a reversal when the order never spent PromoCard value', async () => {
    const db = {
      from() {
        const result = {
          select() { return result; },
          eq() { return result; },
          maybeSingle() { return Promise.resolve({ data: null, error: null }); },
        };
        return result;
      },
      rpc() { throw new Error('should not post'); },
    };
    const result = await postPromoCardSpendReversal({
      db,
      order: { id: 'order-2', total_amount: 20 },
      refundedAmount: 20,
      fullyRefunded: true,
    });
    expect(result).toEqual({ posted: false, reason: 'no_spend' });
  });
});
