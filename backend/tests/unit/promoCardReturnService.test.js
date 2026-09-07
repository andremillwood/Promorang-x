jest.mock('../../lib/supabase', () => ({ supabase: null }));
const { recordEligibleReturn } = require('../../services/promoCardReturnService');

function database({ card = { id: 'card-1', available_balance: 15, monthly_limit: 40 }, existing = null, insertError = null } = {}) {
  const writes = [];
  return {
    writes,
    from(table) {
      const result = {
        data: null,
        error: null,
        select() { return result; },
        eq() { return result; },
        maybeSingle() {
          if (table === 'user_promo_cards') return Promise.resolve({ data: card, error: card ? null : { message: 'missing' } });
          if (table === 'attention_recharge_events' && !writes.length) return Promise.resolve({ data: existing, error: null });
          return Promise.resolve({ data: writes[writes.length - 1]?.value || null, error: insertError });
        },
        insert(value) {
          writes.push({ table, value });
          result.data = insertError ? null : { id: 'evt-1', ...value };
          result.error = insertError;
          return result;
        },
      };
      return result;
    },
  };
}

describe('PromoCard return eligibility', () => {
  test('does not invent a dollar refill', async () => {
    const db = database();
    const result = await recordEligibleReturn({ userId: 'user-1', actionType: 'check_in', referenceEntityId: 'moment-1', db });
    expect(result.eligible).toBe(true);
    expect(result.event.recharge_amount).toBe(0);
    expect(db.writes[0].table).toBe('attention_recharge_events');
  });

  test('is idempotent for the same user and moment', async () => {
    const db = database({ existing: { id: 'evt-existing', action_type: 'check_in' } });
    const result = await recordEligibleReturn({ userId: 'user-1', actionType: 'check_in', referenceEntityId: 'moment-1', db });
    expect(result.alreadyRecorded).toBe(true);
    expect(db.writes).toEqual([]);
  });

  test('stays silent when the person has no PromoCard', async () => {
    const db = database({ card: null });
    const result = await recordEligibleReturn({ userId: 'user-1', db });
    expect(result.eligible).toBe(false);
    expect(db.writes).toEqual([]);
  });
});
