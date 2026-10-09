jest.mock('../../lib/supabase', () => ({ supabase: { from: jest.fn() } }));
const { supabase } = require('../../lib/supabase');
const funnels = require('../../services/platformFunnelService');
const { validateBusinessBrief } = require('../../services/businessBrief');

describe('three funnel contracts', () => {
  test('a later checkpoint does not silently complete earlier missing stages', () => {
    const progress = funnels.progress('brand', [{ funnel: 'brand', stage: 'funded' }]);
    expect(progress.nextStage).toBe('brief_captured');
    expect(progress.stages.find(stage => stage.stage === 'pilot_scoped').complete).toBe(false);
    expect(progress.stages.find(stage => stage.stage === 'funded').complete).toBe(true);
  });
  test('counts people once per checkpoint and keeps the three cohorts distinct', () => {
    const events = [
      { user_id: 'person1', anonymous_id: 'guest1', funnel: 'participant', stage: 'reserved' },
      { user_id: 'person1', anonymous_id: 'guest2', funnel: 'participant', stage: 'reserved' },
      { user_id: 'person1', funnel: 'participant', stage: 'verified' },
      { user_id: 'person1', funnel: 'brand', stage: 'funded' },
    ];
    const summary = funnels.summarize(events);
    expect(summary.find(item => item.funnel === 'participant')).toMatchObject({ entered: 1, completed: 0 });
    expect(summary.find(item => item.funnel === 'participant').checkpoints[0].people).toBe(1);
    expect(summary.find(item => item.funnel === 'brand').entered).toBe(1);
  });
  test('reports accepted evidence separately from intent and duplicate event receipts', () => {
    const metrics = funnels.reportMetrics([
      { event_type: 'checked_in', actor_user_id: 'a', verified: true, occurred_at: '2026-10-09' },
      { event_type: 'checked_in', actor_user_id: 'a', verified: true },
      { event_type: 'offer_redeemed', actor_user_id: 'b', verified: false },
      { event_type: 'joined', anonymous_id: 'guest1', verified: true },
      { event_type: 'proof_verified', actor_user_id: 'c', verified: true },
    ]);
    expect(metrics).toMatchObject({ attendance: 1, redemptions: 0, acceptedProofs: 1, reservations: 1 });
    expect(metrics.lastOutcomeAt).toBe('2026-10-09');
  });
  test('invites only to future public Moments with an actual city or interest match', () => {
    const source = { id: 'source', city: 'Kingston', category: 'music' };
    const moments = [
      { id: 'both', city: 'Kingston', category: 'music', status: 'scheduled', starts_at: '2026-11-01' },
      { id: 'interest', city: 'Toronto', category: 'music', status: 'scheduled', starts_at: '2026-10-20' },
      { id: 'unrelated', city: 'Toronto', category: 'food', status: 'scheduled', starts_at: '2026-10-20' },
      { id: 'draft', city: 'Kingston', category: 'music', status: 'draft', starts_at: '2026-10-20' },
      { id: 'ended', city: 'Kingston', category: 'music', status: 'scheduled', starts_at: '2025-10-20' },
      { id: 'hidden', city: 'Kingston', category: 'music', status: 'active', is_active: false, starts_at: '2026-10-20' },
    ];
    expect(funnels.chooseInvitations(source, moments, Date.parse('2026-10-09')).map(moment => moment.id)).toEqual(['both', 'interest']);
    expect(funnels.chooseInvitations({}, moments, Date.parse('2026-10-09'))).toEqual([]);
  });
  test('does not link another contact using a browser-supplied or unverified email', async () => {
    await expect(funnels.linkLeads({ id: 'user', email: 'contact@example.com', is_verified: false })).resolves.toEqual({ linked: 0 });
    expect(supabase.from).not.toHaveBeenCalled();
  });
  test('enforces campaign ownership before querying private report evidence', async () => {
    const query = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }) };
    supabase.from.mockReturnValue(query);
    await expect(funnels.campaignReport('campaign-id', 'owner-id')).rejects.toMatchObject({ status: 404 });
    expect(query.eq).toHaveBeenCalledWith('brand_id', 'owner-id');
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});

describe('commercial brief validation', () => {
  const brief = { outcomeId: 'bring-people-in', businessType: 'place', successAction: 'visits', target: 25 };
  test.each([['place','merchant','demand'],['service','merchant','demand'],['event','host','moment'],['consumer-brand','brand','sponsor']])('routes %s to its actual funnel', (businessType, role, funnelKey) => {
    expect(validateBusinessBrief({ ...brief, businessType })).toMatchObject({ role, funnelKey });
  });
  test('rejects unsupported outcomes and impossible targets', () => {
    expect(() => validateBusinessBrief({ ...brief, outcomeId: 'guaranteed-sales' })).toThrow();
    expect(() => validateBusinessBrief({ ...brief, target: Infinity })).toThrow();
    expect(() => validateBusinessBrief({ ...brief, target: -5 })).toThrow();
  });
  test('does not persist user-supplied funding, consent, ownership or qualification claims', () => {
    const { brief: result } = validateBusinessBrief({ ...brief, user_id: 'another-user', funded: true, qualification_score: 100, programmeId: 'fake' });
    expect(result.user_id).toBeUndefined(); expect(result.funded).toBeUndefined();
    expect(result.qualification_score).toBeUndefined(); expect(result.programmeId).toBe('first-50');
  });
});
