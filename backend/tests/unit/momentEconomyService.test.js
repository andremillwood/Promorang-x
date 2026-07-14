function createSupabaseMock(inserts) {
  return {
    from(table) {
      return {
        insert(payload) {
          inserts.push({ table, payload });
          return {
            select() {
              return {
                single: async () => {
                  if (table === 'moments') {
                    return { data: { id: 'moment-1', ...payload }, error: null };
                  }
                  if (table === 'moment_economics') {
                    return { data: { id: 'economy-1', ...payload }, error: null };
                  }
                  return { data: payload, error: null };
                },
              };
            },
          };
        },
      };
    },
  };
}

function basePayload(overrides = {}) {
  return {
    title: 'Launch test moment',
    description: 'A test moment used to verify proof type normalization.',
    category: 'community',
    location: '22 Barbican Road',
    starts_at: '2026-09-07T21:00:00.000Z',
    money_source: 'host',
    reward_pool_jmd: 0,
    total_funded_jmd: 0,
    moves: [
      {
        title: 'Check in and prove attendance',
        proof_type: 'code',
        reward_amount_jmd: 0,
        max_completions: 10,
      },
    ],
    payout_rules: [
      {
        rule_type: 'per_action',
        amount_jmd: 0,
        cap_jmd: 0,
      },
    ],
    ...overrides,
  };
}

describe('momentEconomyService', () => {
  beforeEach(() => {
    jest.resetModules();
    delete global.supabase;
  });

  afterEach(() => {
    delete global.supabase;
  });

  it('stores AMI enum proof types on moments while keeping move proof types lowercase', async () => {
    const inserts = [];
    global.supabase = createSupabaseMock(inserts);
    const { createMomentWithEconomy } = require('../../services/momentEconomyService');

    await createMomentWithEconomy('user-1', basePayload({ proof_type: 'QR' }));

    const momentInsert = inserts.find((insert) => insert.table === 'moments');
    const moveInsert = inserts.find((insert) => insert.table === 'moment_moves');

    expect(momentInsert.payload.proof_type).toBe('QR');
    expect(moveInsert.payload[0].proof_type).toBe('code');
  });

  it('maps legacy lowercase moment proof values to the AMI enum', async () => {
    const inserts = [];
    global.supabase = createSupabaseMock(inserts);
    const { createMomentWithEconomy } = require('../../services/momentEconomyService');

    await createMomentWithEconomy('user-1', basePayload({ proof_type: 'code' }));

    const momentInsert = inserts.find((insert) => insert.table === 'moments');

    expect(momentInsert.payload.proof_type).toBe('Code');
  });

  it('keeps Promorang-backed reward pools pending until allocation is funded', async () => {
    const inserts = [];
    global.supabase = createSupabaseMock(inserts);
    const { createMomentWithEconomy } = require('../../services/momentEconomyService');

    await createMomentWithEconomy('user-1', basePayload({
      money_source: 'platform',
      reward_pool_jmd: 1000,
      total_funded_jmd: 0,
      moves: [
        {
          title: 'Check in and prove attendance',
          proof_type: 'code',
          reward_amount_jmd: 100,
          max_completions: 10,
        },
      ],
      payout_rules: [
        {
          rule_type: 'per_action',
          amount_jmd: 100,
          cap_jmd: 1000,
        },
      ],
    }));

    const momentInsert = inserts.find((insert) => insert.table === 'moments');
    const economyInsert = inserts.find((insert) => insert.table === 'moment_economics');

    expect(momentInsert.payload.status).toBe('funding');
    expect(economyInsert.payload.money_source).toBe('platform');
    expect(economyInsert.payload.funding_status).toBe('pending');
    expect(economyInsert.payload.total_funded_jmd).toBe(0);
  });
});
