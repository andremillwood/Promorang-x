jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { performance } = require('perf_hooks');
const { createClient } = require('@supabase/supabase-js');

/**
 * Build a lightweight Supabase client mock that captures chained calls and
 * returns queued responses in the order they are requested.
 */
const createSupabaseStub = () => {
  let queue = [];
  const operations = [];

  const dequeue = () => {
    if (queue.length === 0) {
      return { data: null, error: null };
    }
    return queue.shift();
  };

  const buildQueryBuilder = (table) => {
    const record = { table, steps: [] };
    operations.push(record);

    const builder = {
      select: jest.fn((...args) => {
        record.steps.push({ action: 'select', args });
        return builder;
      }),
      insert: jest.fn((payload) => {
        record.steps.push({ action: 'insert', args: [payload] });
        return builder;
      }),
      update: jest.fn((payload) => {
        record.steps.push({ action: 'update', args: [payload] });
        return builder;
      }),
      delete: jest.fn(() => {
        record.steps.push({ action: 'delete' });
        return builder;
      }),
      eq: jest.fn((column, value) => {
        record.steps.push({ action: 'eq', args: [column, value] });
        return builder;
      }),
      neq: jest.fn((column, value) => {
        record.steps.push({ action: 'neq', args: [column, value] });
        return builder;
      }),
      gt: jest.fn((column, value) => {
        record.steps.push({ action: 'gt', args: [column, value] });
        return builder;
      }),
      lt: jest.fn((column, value) => {
        record.steps.push({ action: 'lt', args: [column, value] });
        return builder;
      }),
      gte: jest.fn((column, value) => {
        record.steps.push({ action: 'gte', args: [column, value] });
        return builder;
      }),
      lte: jest.fn((column, value) => {
        record.steps.push({ action: 'lte', args: [column, value] });
        return builder;
      }),
      in: jest.fn((column, values) => {
        record.steps.push({ action: 'in', args: [column, values] });
        return builder;
      }),
      contains: jest.fn((column, values) => {
        record.steps.push({ action: 'contains', args: [column, values] });
        return builder;
      }),
      containsAny: jest.fn(() => builder),
      containsAll: jest.fn(() => builder),
      not: jest.fn((column, operator, value) => {
        record.steps.push({ action: 'not', args: [column, operator, value] });
        return builder;
      }),
      or: jest.fn((clause) => {
        record.steps.push({ action: 'or', args: [clause] });
        return builder;
      }),
      filter: jest.fn((column, operator, value) => {
        record.steps.push({ action: 'filter', args: [column, operator, value] });
        return builder;
      }),
      order: jest.fn((column, options) => {
        record.steps.push({ action: 'order', args: [column, options] });
        return builder;
      }),
      limit: jest.fn((value) => {
        record.steps.push({ action: 'limit', args: [value] });
        return builder;
      }),
      range: jest.fn((from, to) => {
        record.steps.push({ action: 'range', args: [from, to] });
        return builder;
      }),
      single: jest.fn(() => {
        record.steps.push({ action: 'single' });
        return Promise.resolve(dequeue());
      }),
      maybeSingle: jest.fn(() => {
        record.steps.push({ action: 'maybeSingle' });
        return Promise.resolve(dequeue());
      }),
      then: (onFulfilled, onRejected) => {
        record.steps.push({ action: 'then' });
        return Promise.resolve(dequeue()).then(onFulfilled, onRejected);
      },
      catch: (onRejected) => {
        record.steps.push({ action: 'catch' });
        return Promise.resolve(dequeue()).catch(onRejected);
      },
      finally: (onFinally) => {
        record.steps.push({ action: 'finally' });
        return Promise.resolve().finally(onFinally);
      },
    };

    return builder;
  };

  const client = {
    from: jest.fn((table) => buildQueryBuilder(table)),
    rpc: jest.fn(() => Promise.resolve(dequeue())),
    __queueResponse: (response) => {
      const normalized = {};
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        normalized.data = Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;
        normalized.error = Object.prototype.hasOwnProperty.call(response, 'error') ? response.error : null;
        if (Object.prototype.hasOwnProperty.call(response, 'count')) {
          normalized.count = response.count;
        }
        Object.entries(response).forEach(([key, value]) => {
          if (!['data', 'error', 'count'].includes(key)) {
            normalized[key] = value;
          }
        });
      } else {
        normalized.data = response ?? null;
        normalized.error = null;
      }
      queue.push(normalized);
    },
    __setResponses: (responses = []) => {
      queue = [];
      responses.forEach((resp) => client.__queueResponse(resp));
    },
    __reset: () => {
      queue = [];
      operations.length = 0;
      client.from.mockClear();
      client.rpc.mockClear();
    },
    __getOperations: () => operations,
  };

  return client;
};

const mockSupabase = createSupabaseStub();
createClient.mockReturnValue(mockSupabase);
global.supabase = mockSupabase;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'growth-test-secret';

const growthRouter = require('../../api/growth');

const app = express();
app.use(express.json());
app.use('/api/growth', growthRouter);

const now = new Date();
const toISOStringDaysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  username: 'growth_user',
  display_name: 'Growth Tester',
  gems_balance: 10_000,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const mockStakingChannel = {
  id: 'staking-channel-1',
  name: 'Super Growth Staking',
  status: 'active',
  min_stake: 100,
  max_stake: 10_000,
  lock_period_days: 30,
  base_apr: 12.5,
  bonus_multipliers: { premium: 1.2 },
  description: 'Earn boosted yields by locking gems.',
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const mockStakingPosition = {
  id: 'staking-position-1',
  user_id: mockUser.id,
  channel_id: mockStakingChannel.id,
  amount: 750,
  multiplier: 1.1,
  lock_until: toISOStringDaysFromNow(30),
  status: 'active',
  earned_so_far: 25,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
  staking_channels: {
    id: mockStakingChannel.id,
    name: mockStakingChannel.name,
    base_apr: mockStakingChannel.base_apr,
    lock_period_days: mockStakingChannel.lock_period_days,
  },
};

const mockFundingProject = {
  id: 'funding-project-1',
  creator_id: mockUser.id,
  title: 'Growth Hub Launch Film',
  description: 'A cinematic intro highlighting Growth Hub success stories.',
  target_amount: 25_000,
  amount_raised: 2_500,
  status: 'active',
  start_date: now.toISOString(),
  end_date: toISOStringDaysFromNow(45),
  rewards: {
    tiers: [
      { id: 'tier-1', name: 'Supporter', amount: 50, perks: ['Early access'] },
      { id: 'tier-2', name: 'Champion', amount: 500, perks: ['Executive producer credit'] },
    ],
  },
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const mockFundingPledge = {
  id: 'funding-pledge-1',
  project_id: mockFundingProject.id,
  backer_id: mockUser.id,
  amount: 500,
  reward_tier: 'tier-2',
  status: 'pledged',
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const mockShieldPolicy = {
  id: 'shield-policy-1',
  name: 'Creator Shield Plus',
  premium_amount: 250,
  coverage_amount: 5_000,
  duration_days: 30,
  is_active: true,
  category: 'content',
  coverage_details: { includes: ['DMCA support', 'PR response'], exclusions: ['Intentional violations'] },
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const mockShieldSubscription = {
  id: 'shield-subscription-1',
  user_id: mockUser.id,
  policy_id: mockShieldPolicy.id,
  premium_paid: mockShieldPolicy.premium_amount,
  coverage_amount: mockShieldPolicy.coverage_amount,
  started_at: now.toISOString(),
  expires_at: toISOStringDaysFromNow(30),
  status: 'active',
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const mockCreatorReward = {
  id: 'creator-reward-1',
  creator_id: mockUser.id,
  amount: 325,
  period: '2025-10',
  status: 'pending',
  metrics: {
    views: 128_000,
    unique_viewers: 92_000,
    watch_time_minutes: 540_000,
    shares: 2_450,
    comments: 9_800,
    saves: 12_500,
    engagement_score: 87.5,
    revenue_generated: 6_500,
    conversion_rate: 4.2,
  },
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const mockLedgerEntry = {
  id: 'ledger-entry-1',
  user_id: mockUser.id,
  source_type: 'staking_reward',
  source_id: mockStakingPosition.id,
  amount: 42.5,
  currency: 'gems',
  status: 'completed',
  metadata: {
    channel_id: mockStakingChannel.id,
    description: 'Monthly staking reward payout',
  },
  created_at: now.toISOString(),
};

/**
 * Generate a signed JWT for the supplied user id.
 * @param {string} userId - The user identifier to embed in the token.
 * @param {Partial<typeof mockUser>} [overrides] - Optional claims overrides.
 * @returns {string} Signed JWT ready for Authorization header usage.
 */
const generateAuthToken = (userId, overrides = {}) => {
  const payload = {
    ...mockUser,
    ...overrides,
    id: userId,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Queue a mocked Supabase response for the next call.
 * @param {*} data - Data payload to return.
 * @param {Object|null} [error=null] - Error payload to return.
 * @param {Object} [extras={}] - Additional fields such as count totals.
 */
const mockSupabaseResponse = (data, error = null, extras = {}) => {
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    (Object.prototype.hasOwnProperty.call(data, 'data') || Object.prototype.hasOwnProperty.call(data, 'error') || Object.prototype.hasOwnProperty.call(data, 'count')) &&
    error == null &&
    Object.keys(extras).length === 0
  ) {
    mockSupabase.__queueResponse(data);
  } else {
    mockSupabase.__queueResponse({ data, error, ...extras });
  }
};

/**
 * Validate a successful JSON API response.
 * @param {import('supertest').Response} res - Supertest response.
 * @param {Object} [expected={}] - Expected key/value pairs.
 * @param {number} [expectedStatus] - Optional status code override.
 */
const expectSuccessfulResponse = (res, expected = {}, expectedStatus) => {
  if (expectedStatus) {
    expect(res.status).toBe(expectedStatus);
  } else {
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
  }
  expect(res.body).toHaveProperty('success', true);
  Object.entries(expected).forEach(([key, value]) => {
    if (typeof value === 'function') {
      value(res.body[key], res.body);
    } else {
      expect(res.body[key]).toEqual(value);
    }
  });
};

/**
 * Validate an error JSON API response.
 * @param {import('supertest').Response} res - Supertest response.
 * @param {number} status - Expected HTTP status code.
 * @param {RegExp|string} [messageMatcher] - Optional message matcher.
 */
const expectErrorResponse = (res, status, messageMatcher) => {
  expect(res.status).toBe(status);
  expect(res.body).toHaveProperty('success', false);
  if (messageMatcher) {
    if (messageMatcher instanceof RegExp) {
      expect(res.body.error || res.body.message).toMatch(messageMatcher);
    } else {
      expect(res.body.error || res.body.message).toBe(messageMatcher);
    }
  }
};

describe('Growth Hub API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.__reset();
    global.supabase = mockSupabase;
  });

  afterEach(() => {
    mockSupabase.__reset();
  });

  describe('Staking', () => {
    describe('GET /growth/channels', () => {
      it('returns active staking channels', async () => {
        mockSupabaseResponse([mockStakingChannel]);

        const res = await request(app)
          .get('/api/growth/channels')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          channels: [mockStakingChannel],
        });

        const operations = mockSupabase.__getOperations();
        expect(operations[0].table).toBe('staking_channels');
        expect(operations[0].steps.some((step) => step.action === 'eq' && step.args[0] === 'status' && step.args[1] === 'active')).toBe(true);
      });

      it('handles empty result sets gracefully', async () => {
        mockSupabaseResponse([]);

        const res = await request(app)
          .get('/api/growth/channels')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          channels: [],
        });
      });

      it('returns 500 when Supabase errors', async () => {
        mockSupabaseResponse(null, { message: 'database failed' });

        const res = await request(app)
          .get('/api/growth/channels')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 500, /failed to fetch staking channels/i);
      });

      it('rejects missing authentication', async () => {
        const res = await request(app).get('/api/growth/channels');
        expectErrorResponse(res, 401, /unauthorized/i);
      });

      it('supports concurrent channel requests', async () => {
        mockSupabaseResponse([mockStakingChannel]);
        mockSupabaseResponse([mockStakingChannel]);

        const [first, second] = await Promise.all([
          request(app).get('/api/growth/channels').set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`),
          request(app).get('/api/growth/channels').set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`),
        ]);

        expectSuccessfulResponse(first, { channels: [mockStakingChannel] });
        expectSuccessfulResponse(second, { channels: [mockStakingChannel] });
        expect(mockSupabase.__getOperations()).toHaveLength(2);
      });
    });

    describe('GET /growth/staking', () => {
      it('returns staking positions for the authenticated user', async () => {
        mockSupabaseResponse([mockStakingPosition]);

        const res = await request(app)
          .get('/api/growth/staking')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          positions: [mockStakingPosition],
        });

        const operations = mockSupabase.__getOperations();
        expect(operations[0].table).toBe('staking_positions');
        expect(operations[0].steps.some((step) => step.action === 'eq' && step.args[0] === 'user_id' && step.args[1] === mockUser.id)).toBe(true);
      });

      it('propagates database errors', async () => {
        mockSupabaseResponse(null, { message: 'query timeout' });

        const res = await request(app)
          .get('/api/growth/staking')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 500, /failed to fetch staking positions/i);
      });

      test.todo('filters positions by status (pending API support)');
      test.todo('supports pagination parameters for staking positions');
    });

    describe('POST /growth/staking', () => {
      const validPayload = {
        channel_id: mockStakingChannel.id,
        amount: 500,
      };

      it('creates a staking position when payload is valid', async () => {
        mockSupabaseResponse(mockStakingChannel);
        mockSupabaseResponse({ gems_balance: 1_000 });
        mockSupabaseResponse({ ...mockStakingPosition, amount: validPayload.amount });
        mockSupabaseResponse({ data: null, error: null });
        mockSupabaseResponse({ data: null, error: null });

        const res = await request(app)
          .post('/api/growth/staking')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send(validPayload);

        expectSuccessfulResponse(res, {
          position: expect.objectContaining({ channel_id: mockStakingChannel.id, amount: validPayload.amount }),
          user: expect.objectContaining({ gems_balance: mockUser.gems_balance - validPayload.amount }),
        });
      });

      it('validates required payload fields', async () => {
        const res = await request(app)
          .post('/api/growth/staking')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({});

        expectErrorResponse(res, 400, /invalid staking request/i);
      });

      it('rejects insufficient balances', async () => {
        mockSupabaseResponse(mockStakingChannel);
        mockSupabaseResponse({ gems_balance: 50 });

        const res = await request(app)
          .post('/api/growth/staking')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send(validPayload);

        expectErrorResponse(res, 400, /insufficient balance/i);
      });

      it('rejects invalid channel identifiers', async () => {
        mockSupabaseResponse(null, { message: 'not found' });

        const res = await request(app)
          .post('/api/growth/staking')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ ...validPayload, channel_id: 'unknown' });

        expectErrorResponse(res, 400, /invalid or inactive staking channel/i);
      });

      it('accepts boundary values at minimum stake', async () => {
        mockSupabaseResponse({ ...mockStakingChannel, min_stake: 500 });
        mockSupabaseResponse({ gems_balance: 1_000 });
        mockSupabaseResponse({ ...mockStakingPosition, amount: 500 });
        mockSupabaseResponse({ data: null, error: null });
        mockSupabaseResponse({ data: null, error: null });

        const res = await request(app)
          .post('/api/growth/staking')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ channel_id: mockStakingChannel.id, amount: 500 });

        expectSuccessfulResponse(res, {
          position: expect.objectContaining({ amount: 500 }),
        });
      });
    });

    describe('POST /growth/staking/:id/claim', () => {
      it('claims staking rewards successfully', async () => {
        mockSupabaseResponse({ ...mockStakingPosition, status: 'withdrawable' });
        mockSupabaseResponse({ ...mockStakingPosition, earned_so_far: mockStakingPosition.earned_so_far + 7.5 });
        mockSupabaseResponse({ data: null, error: null });
        mockSupabaseResponse({ data: null, error: null });

        const res = await request(app)
          .post(`/api/growth/staking/${mockStakingPosition.id}/claim`)
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          payout: expect.any(Number),
          position: expect.objectContaining({ id: mockStakingPosition.id }),
          user: expect.objectContaining({ gems_balance: expect.any(Number) }),
        });
      });

      it('blocks premature claims', async () => {
        mockSupabaseResponse({ ...mockStakingPosition, status: 'locked' });

        const res = await request(app)
          .post(`/api/growth/staking/${mockStakingPosition.id}/claim`)
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 400, /not eligible for rewards/i);
      });

      it('rejects already-claimed positions', async () => {
        mockSupabaseResponse({ ...mockStakingPosition, status: 'completed' });

        const res = await request(app)
          .post(`/api/growth/staking/${mockStakingPosition.id}/claim`)
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 400, /not eligible for rewards/i);
      });
    });
  });

  describe('Funding', () => {
    describe('GET /growth/funding/projects', () => {
      it('lists active funding projects with totals', async () => {
        mockSupabaseResponse({ data: [mockFundingProject], error: null, count: 1 });

        const res = await request(app)
          .get('/api/growth/funding/projects')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          projects: [mockFundingProject],
          total: 1,
          limit: 10,
          offset: 0,
        });
      });

      it('supports filtering and pagination', async () => {
        mockSupabaseResponse({ data: [mockFundingProject], error: null, count: 42 });

        const res = await request(app)
          .get('/api/growth/funding/projects?status=completed&limit=5&offset=10')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          total: 42,
          limit: 5,
          offset: 10,
        });

        const [operation] = mockSupabase.__getOperations();
        expect(operation.steps.some((step) => step.action === 'eq' && step.args[0] === 'status' && step.args[1] === 'completed')).toBe(true);
        expect(operation.steps.some((step) => step.action === 'range' && step.args[0] === 10 && step.args[1] === 14)).toBe(true);
      });

      it('returns 500 on fetch errors', async () => {
        mockSupabaseResponse({ data: null, error: { message: 'DB offline' } });

        const res = await request(app)
          .get('/api/growth/funding/projects')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 500, /failed to fetch funding projects/i);
      });
    });

    describe('POST /growth/funding/projects', () => {
      const payload = {
        title: mockFundingProject.title,
        description: mockFundingProject.description,
        target_amount: mockFundingProject.target_amount,
        rewards: mockFundingProject.rewards,
      };

      it('creates a funding project', async () => {
        mockSupabaseResponse({ ...mockFundingProject });

        const res = await request(app)
          .post('/api/growth/funding/projects')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send(payload);

        expectSuccessfulResponse(res, {
          project: expect.objectContaining({ title: payload.title }),
        }, 201);
      });

      it('validates required fields', async () => {
        const res = await request(app)
          .post('/api/growth/funding/projects')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ title: 'Missing description' });

        expectErrorResponse(res, 400, /missing required fields/i);
      });

      it('requires authorization', async () => {
        const res = await request(app)
          .post('/api/growth/funding/projects')
          .send(payload);

        expectErrorResponse(res, 401, /unauthorized/i);
      });
    });

    describe('POST /growth/funding/projects/:id/pledge', () => {
      it('creates a pledge when the project is active', async () => {
        mockSupabaseResponse({ ...mockFundingPledge });
        mockSupabaseResponse({ data: null, error: null });
        mockSupabaseResponse({ data: null, error: null });

        const res = await request(app)
          .post(`/api/growth/funding/projects/${mockFundingProject.id}/pledge`)
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ amount: mockFundingPledge.amount, reward_tier: mockFundingPledge.reward_tier });

        expectSuccessfulResponse(res, {
          pledge: expect.objectContaining({ amount: mockFundingPledge.amount }),
          user: expect.objectContaining({ gems_balance: mockUser.gems_balance - mockFundingPledge.amount }),
        });
      });

      it('validates pledge amounts', async () => {
        const res = await request(app)
          .post(`/api/growth/funding/projects/${mockFundingProject.id}/pledge`)
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ amount: 0 });

        expectErrorResponse(res, 400, /invalid pledge amount/i);
      });

      it('handles project-level errors', async () => {
        mockSupabaseResponse({ data: null, error: { message: 'Project closed' } });

        const res = await request(app)
          .post(`/api/growth/funding/projects/${mockFundingProject.id}/pledge`)
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ amount: 100 });

        expectErrorResponse(res, 400, /failed to create pledge/i);
      });
    });
  });

  describe('Shield', () => {
    describe('GET /growth/shield/policies', () => {
      it('returns active shield policies', async () => {
        mockSupabaseResponse({ data: [mockShieldPolicy], error: null });

        const res = await request(app)
          .get('/api/growth/shield/policies')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          policies: [mockShieldPolicy],
        });

        const [operation] = mockSupabase.__getOperations();
        expect(operation.table).toBe('shield_policies');
        expect(operation.steps.some((step) => step.action === 'eq' && step.args[0] === 'is_active' && step.args[1] === true)).toBe(true);
      });

      it('propagates Supabase errors', async () => {
        mockSupabaseResponse({ data: null, error: { message: 'Shield table missing' } });

        const res = await request(app)
          .get('/api/growth/shield/policies')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 500, 'Shield table missing');
      });
    });

    describe('POST /growth/shield/subscribe', () => {
      const buildSubscriptionQueue = ({ balance = 1_000, existingSub = null } = {}) => {
        mockSupabaseResponse({ ...mockShieldPolicy });
        mockSupabaseResponse(existingSub, null);
        mockSupabaseResponse({ gems_balance: balance });
        mockSupabaseResponse({ ...mockShieldSubscription });
        mockSupabaseResponse({ data: null, error: null });
        mockSupabaseResponse({ data: null, error: null });
        mockSupabaseResponse({ data: null, error: null });
      };

      it('creates shield subscriptions when requirements are satisfied', async () => {
        buildSubscriptionQueue();

        const res = await request(app)
          .post('/api/growth/shield/subscribe')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ policy_id: mockShieldPolicy.id, payment_method: 'wallet' });

        expectSuccessfulResponse(res, {
          subscription: expect.objectContaining({ policy_id: mockShieldPolicy.id }),
        });
      });

      it('validates required policy identifiers', async () => {
        const res = await request(app)
          .post('/api/growth/shield/subscribe')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({});

        expectErrorResponse(res, 400, /policy id is required/i);
      });

      it('rejects inactive or missing policies', async () => {
        mockSupabaseResponse({ data: null, error: { message: 'Not found' } });

        const res = await request(app)
          .post('/api/growth/shield/subscribe')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ policy_id: 'missing' });

        expectErrorResponse(res, 404, /policy not found/i);
      });

      it('prevents duplicate active subscriptions', async () => {
        buildSubscriptionQueue({ existingSub: mockShieldSubscription });

        const res = await request(app)
          .post('/api/growth/shield/subscribe')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ policy_id: mockShieldPolicy.id });

        expectErrorResponse(res, 400, /already have an active shield subscription/i);
      });

      it('rejects insufficient balances for premiums', async () => {
        mockSupabaseResponse({ ...mockShieldPolicy });
        mockSupabaseResponse(null, null);
        mockSupabaseResponse({ gems_balance: 0 });

        const res = await request(app)
          .post('/api/growth/shield/subscribe')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`)
          .send({ policy_id: mockShieldPolicy.id });

        expectErrorResponse(res, 400, /insufficient gems/i);
      });
    });
  });

  describe('Creator Rewards', () => {
    describe('GET /growth/creator/rewards', () => {
      it('lists rewards for the authenticated creator', async () => {
        mockSupabaseResponse([mockCreatorReward]);

        const res = await request(app)
          .get('/api/growth/creator/rewards')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          rewards: [mockCreatorReward],
        });
      });

      it('filters by status when provided', async () => {
        mockSupabaseResponse([mockCreatorReward]);

        const res = await request(app)
          .get('/api/growth/creator/rewards?status=pending')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          rewards: [mockCreatorReward],
        });

        const [operation] = mockSupabase.__getOperations();
        expect(operation.steps.some((step) => step.action === 'eq' && step.args[0] === 'status' && step.args[1] === 'pending')).toBe(true);
      });

      it('handles Supabase errors', async () => {
        mockSupabaseResponse(null, { message: 'Reward view missing' });

        const res = await request(app)
          .get('/api/growth/creator/rewards')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 500, /failed to fetch creator rewards/i);
      });
    });

    test.todo('POST /growth/creator/rewards/calculate applies 5% revenue cap');
    test.todo('POST /growth/creator/rewards/calculate validates metrics payload');
  });

  describe('Ledger', () => {
    describe('GET /growth/ledger', () => {
      it('returns transaction history with totals', async () => {
        mockSupabaseResponse({ data: [mockLedgerEntry], error: null, count: 1 });

        const res = await request(app)
          .get('/api/growth/ledger')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          entries: [mockLedgerEntry],
          total: 1,
        });
      });

      it('supports pagination parameters', async () => {
        mockSupabaseResponse({ data: [mockLedgerEntry], error: null, count: 5 });

        const res = await request(app)
          .get('/api/growth/ledger?limit=2&offset=2')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectSuccessfulResponse(res, {
          limit: 2,
          offset: 2,
        });

        const [operation] = mockSupabase.__getOperations();
        expect(operation.steps.some((step) => step.action === 'range' && step.args[0] === 2 && step.args[1] === 3)).toBe(true);
      });

      it('propagates Supabase errors gracefully', async () => {
        mockSupabaseResponse({ data: null, error: { message: 'Ledger read error' } });

        const res = await request(app)
          .get('/api/growth/ledger')
          .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

        expectErrorResponse(res, 500, /failed to fetch ledger entries/i);
      });
    });
  });

  describe('Edge Cases', () => {
    it('rejects invalid JWT tokens', async () => {
      mockSupabaseResponse([mockStakingChannel]);

      const res = await request(app)
        .get('/api/growth/channels')
        .set('Authorization', 'Bearer invalid-token');

      expectErrorResponse(res, 401, /unauthorized/i);
    });

    it('handles missing query parameters with defaults', async () => {
      mockSupabaseResponse({ data: [mockFundingProject], error: null, count: 1 });

      const res = await request(app)
        .get('/api/growth/funding/projects')
        .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);

      expectSuccessfulResponse(res, {
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('Performance', () => {
    it('handles large ledger datasets within reasonable time', async () => {
      const largeDataset = Array.from({ length: 750 }, (_, index) => ({
        ...mockLedgerEntry,
        id: `ledger-${index}`,
        amount: Math.random() * 100,
      }));

      mockSupabaseResponse({ data: largeDataset, error: null, count: largeDataset.length });

      const start = performance.now();
      const res = await request(app)
        .get('/api/growth/ledger?limit=750')
        .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);
      const elapsed = performance.now() - start;

      expectSuccessfulResponse(res, {
        entries: largeDataset,
        total: largeDataset.length,
      });
      expect(elapsed).toBeLessThan(750);
    });

    it('measures staking channel response time under load', async () => {
      const channels = Array.from({ length: 50 }, (_, index) => ({
        ...mockStakingChannel,
        id: `channel-${index}`,
        name: `Channel ${index}`,
      }));
      mockSupabaseResponse(channels);

      const start = performance.now();
      const res = await request(app)
        .get('/api/growth/channels')
        .set('Authorization', `Bearer ${generateAuthToken(mockUser.id)}`);
      const elapsed = performance.now() - start;

      expectSuccessfulResponse(res, {
        channels,
      });
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('Documentation', () => {
    it('notes pending coverage gaps for Growth Hub endpoints', () => {
      const pending = [
        'POST /growth/creator/rewards/calculate – awaiting implementation',
        'GET /growth/staking filters & pagination – awaiting service update',
      ];
      expect(pending).toHaveLength(2);
    });
  });
});
