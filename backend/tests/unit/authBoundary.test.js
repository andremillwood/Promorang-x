const mockGetUser = jest.fn();
const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));

let auth;
beforeAll(() => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = 'https://auth-test.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  auth = require('../../middleware/auth');
  if (previousUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
});

function query(data) {
  const chain = { data, error: null };
  for (const method of ['select', 'eq', 'single', 'maybeSingle']) chain[method] = jest.fn(() => chain);
  return chain;
}

function response() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), setHeader: jest.fn() };
}

beforeEach(() => {
  mockGetUser.mockReset();
  mockFrom.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid token' } });
  mockFrom.mockImplementation((table) => query(table === 'user_roles' ? [] : null));
});

test.each(['demo-creator-id', 'a0000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'])(
  'rejects an unverified demo-shaped identity: %s', async (id) => {
    const token = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: id, user_metadata: { role: 'master_admin' } })).toString('base64url')}.`;
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    const next = jest.fn();
    await auth.requireAuth(req, res, next);
    expect(mockGetUser).toHaveBeenCalledWith(token);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
    await auth.optionalAuth(req, response(), next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
  },
);

test.each(['requireAdmin', 'requirePlatformAdmin', 'requireMasterAdmin'])(
  '%s ignores self-asserted roles and editable metadata', async (guard) => {
    const req = { user: { id: 'user-1', role: 'master_admin', user_type: 'master_admin', token_payload: { user_metadata: { role: 'master_admin' } } } };
    const res = response();
    const next = jest.fn();
    await auth[guard](req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  },
);

test.each([
  ['requireAdmin', 'moderator', true],
  ['requirePlatformAdmin', 'moderator', false],
  ['requirePlatformAdmin', 'admin', true],
  ['requireMasterAdmin', 'admin', false],
  ['requireMasterAdmin', 'master_admin', true],
])('%s enforces the stored %s role', async (guard, role, allowed) => {
  mockFrom.mockImplementation((table) => query(table === 'user_roles' ? [{ role }] : null));
  const next = jest.fn();
  await auth[guard]({ user: { id: 'user-1' } }, response(), next);
  expect(next).toHaveBeenCalledTimes(allowed ? 1 : 0);
});

test('a verified user retains authenticated access without trusting metadata for roles', async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'member@example.test', user_metadata: { role: 'admin' } } }, error: null });
  mockFrom.mockImplementation((table) => query(table === 'user_roles' ? [{ role: 'participant' }] : { id: 'user-1', user_type: 'admin' }));
  for (const middleware of [auth.requireAuth, auth.optionalAuth]) {
    const req = { headers: { authorization: 'Bearer verified-token' } };
    const next = jest.fn();
    await middleware(req, response(), next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 'user-1', role: 'participant' });
  }
});
