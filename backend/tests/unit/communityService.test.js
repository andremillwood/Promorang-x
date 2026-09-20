const request = require('supertest');
const express = require('express');
const { createCommunityService, roleState } = require('../../services/communityService');
const { createCommunityRouter } = require('../../api/community');
const { parseCommand } = require('../../community/validation');
const framework = require('../../community/framework');
const id = '00000000-0000-4000-8000-000000000001';

function deniedDb(status) {
  const db = { from: jest.fn(), rpc: jest.fn() };
  const query = { select: jest.fn(() => query), eq: jest.fn(() => query), maybeSingle: jest.fn(async () => ({ data: status ? { id, user_id: id, status, can_manage: false } : null, error: null })) };
  db.from.mockImplementation(table => { if (table !== 'community_memberships') throw new Error('Private data must not be read'); return query; });
  return db;
}
describe('community membership boundary', () => {
  test.each([null, 'pending', 'paused', 'removed'])('%s membership cannot load private work or mutate it', async status => {
    const db = deniedDb(status); const service = createCommunityService(db);
    await expect(service.workspace({ id })).rejects.toMatchObject({ status: 403 });
    await expect(service.command({ id }, 'claim', { move_id: id })).rejects.toMatchObject({ status: 403 });
    expect(db.rpc).not.toHaveBeenCalled();
    expect(db.from.mock.calls.every(([table]) => table === 'community_memberships')).toBe(true);
  });
  test('a database error fails closed', async () => {
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: null, error: { code: '42P01' } }) };
    await expect(createCommunityService({ from: () => query }).workspace({ id })).rejects.toMatchObject({ status: 503 });
  });
  test('self-declared administrator metadata does not grant lead access', async () => {
    const db = deniedDb('active');
    await expect(createCommunityService(db).command({ id, roles: [], user_metadata: { role: 'admin' } }, 'bootstrap', {})).rejects.toMatchObject({ status: 403 });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  test('verified actor overrides extra client identity and privilege fields', async () => {
    const db = deniedDb(null); db.rpc.mockResolvedValue({ data: { status: 'pending' }, error: null });
    await createCommunityService(db).command({ id, display_name: 'Verified name' }, 'apply', {
      user_id: 'attacker', p_actor: 'attacker', display_name: 'Impersonation', can_manage: true, tier: 'super',
      career_path: 'YouTube Creator', personal_goal: 'Publish a useful original video series.',
    });
    expect(db.rpc).toHaveBeenCalledWith('community_command', { p_actor: id, p_action: 'apply', p_data: {
      display_name: 'Verified name', career_path: 'YouTube Creator', personal_goal: 'Publish a useful original video series.',
    } });
  });
  test('every HTTP endpoint requires authentication and prevents private response caching', async () => {
    const community = { access: jest.fn(async () => ({ membership: null, paths: framework.paths })), workspace: jest.fn(), command: jest.fn() };
    const app = express(); app.use(express.json());
    app.use('/community', createCommunityRouter({ community, auth: (req, res, next) => {
      if (req.headers.authorization !== 'test-member') return res.status(401).json({ error: 'Authentication required' });
      req.user = { id }; next();
    } }));
    for (const url of ['/community/access', '/community/workspace']) await request(app).get(url).expect(401);
    await request(app).post('/community/actions/claim').send({ move_id: id }).expect(401);
    const response = await request(app).get('/community/access').set('Authorization', 'test-member').expect(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(community.workspace).not.toHaveBeenCalled(); expect(community.command).not.toHaveBeenCalled();
  });
});
describe('community inputs and role standing', () => {
  test.each(['javascript:alert(1)', '//evil.example', '/\\evil.example', 'https://user:pass@example.com'])('rejects unsafe link %s', proof_url => {
    expect(() => parseCommand('submit', { move_id: id, submission_id: id, proof: 'Here is the original work.', proof_url })).toThrow();
  });
  test('rejects invalid dates and negative verified results', () => {
    expect(() => parseCommand('goal', { title: 'A real goal', why: 'A worthwhile member outcome.', starts_on: '2026-02-30', ends_on: '2026-03-30', results: [{ title: 'Accepted work', unit: 'members', target: 5 }] })).toThrow();
    expect(() => parseCommand('review', { move_id: id, submission_id: id, decision: 'approved', feedback: 'Verified the original work.', verified_value: -1 })).toThrow();
  });
  test('role state moves through review grace and expiry without changing earned balances', () => {
    const now = Date.parse('2026-09-14T12:00:00Z'); const def = { grace_days: 7 };
    const seat = { status: 'active', term_ends_at: '2026-11-30T00:00:00Z', review_at: '2026-09-10T00:00:00Z' };
    expect(roleState(seat, def, now)).toBe('grace');
    expect(roleState({ ...seat, review_at: '2026-09-01T00:00:00Z' }, def, now)).toBe('paused');
    expect(roleState({ ...seat, term_ends_at: '2026-09-01T00:00:00Z' }, def, now)).toBe('term_complete');
  });
  test('the supplied schedule, role structure, and career paths are retained', () => {
    expect(framework.paths).toHaveLength(11); expect(framework.pods).toHaveLength(5);
    expect(framework.roles).toHaveLength(6); expect(framework.daily).toHaveLength(7);
    expect(framework.weeks.map(w => w.sessions.length)).toEqual([6, 6, 7, 5]);
    expect(framework.timezone).toBe('America/Jamaica');
  });
});
