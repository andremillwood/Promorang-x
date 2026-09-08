jest.mock('../../lib/supabase', () => ({ supabase: null }));
const { toFacts, resolveForUser } = require('../../services/worldSystemService');

function database() {
  const writes = [];
  return {
    writes,
    from(table) {
      const result = {
        data: null,
        error: null,
        select() { return result; },
        eq() { return result; },
        maybeSingle() { return Promise.resolve({ data: null, error: null }); },
        upsert(value) {
          writes.push({ table, value });
          result.data = value;
          return result;
        },
        insert(value) {
          writes.push({ table, value });
          result.data = value;
          return result;
        },
      };
      return result;
    },
  };
}

describe('world system service', () => {
  test('does not write PromoCard or Gems tables', async () => {
    const db = database();
    const result = await resolveForUser('user-1', {
      ownActions: Array.from({ length: 10 }, (_, index) => ({
        id: `g${index}`,
        user_id: 'user-1',
        action_type: 'PERK_REDEMPTION',
        verified_at: new Date().toISOString(),
      })),
      attributedActions: [],
      pathTitle: 'Patron',
      memoriesKept: 0,
    }, db);
    expect(result.house?.key).toBe('grove');
    expect(db.writes.every((write) => write.table === 'world_player_state' || write.table === 'world_system_events')).toBe(true);
    expect(db.writes.some((write) => write.table === 'user_promo_cards' || write.table === 'gems_transactions')).toBe(false);
  });

  test('maps verified_actions columns without inventing money', () => {
    const facts = toFacts([{ id: '1', action_type: 'check_in', user_id: 'u', available_balance: 99 }]);
    expect(facts[0].actionType).toBe('check_in');
    expect(facts[0].available_balance).toBeUndefined();
  });
});
