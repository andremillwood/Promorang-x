const { buildMomentFeed, classifyMomentLifecycle } = require('../services/momentFeedService');

const NOW = new Date('2026-09-12T12:00:00.000Z');
const base = {
  id: 'moment-1', title: 'A real moment', is_active: true, status: 'draft',
  content_origin: 'stakeholder_created', visibility: 'open', venue_name: 'Sea Deck', host_id: 'host-1',
};

describe('canonical moment lifecycle', () => {
  test('derives live from timestamps instead of a contradictory draft status', () => {
    expect(classifyMomentLifecycle({ ...base, starts_at: '2026-09-12T10:00:00Z', ends_at: '2026-09-12T14:00:00Z' }, NOW).lifecycle).toBe('live');
  });

  test('infers a bounded live window when an end time is missing', () => {
    const state = classifyMomentLifecycle({ ...base, starts_at: '2026-09-12T10:00:00Z', ends_at: null }, NOW);
    expect(state.lifecycle).toBe('live');
    expect(state.endTimeInferred).toBe(true);
    expect(state.issues).toContain('missing_end');
  });

  test('rejects invalid ranges and demo inventory from public feed', () => {
    const feed = buildMomentFeed([
      { ...base, id: 'bad-range', starts_at: '2026-09-12T12:00:00Z', ends_at: '2026-09-11T12:00:00Z' },
      { ...base, id: 'demo', content_origin: 'demo', starts_at: '2026-09-12T12:00:00Z' },
    ], {}, NOW);
    expect(feed.moments).toHaveLength(0);
  });

  test('groups upcoming and recently ended inventory', () => {
    const feed = buildMomentFeed([
      { ...base, id: 'soon', starts_at: '2026-09-12T14:00:00Z', ends_at: '2026-09-12T18:00:00Z' },
      { ...base, id: 'recent', starts_at: '2026-09-11T22:00:00Z', ends_at: '2026-09-12T02:00:00Z' },
    ], {}, NOW);
    expect(feed.counts.starting_soon).toBe(1);
    expect(feed.counts.recently_ended).toBe(1);
  });

  test('preserves source-backed brand identity for public relationship routes', () => {
    const feed = buildMomentFeed([
      { ...base, id: 'sponsored', starts_at: '2026-09-12T14:00:00Z', ends_at: '2026-09-12T18:00:00Z' },
    ], {
      sponsored: [{ id: 'brand-1', name: 'Midas', slug: 'midas' }],
    }, NOW);

    expect(feed.moments[0].associated_brands).toEqual([
      { id: 'brand-1', name: 'Midas', slug: 'midas' },
    ]);
    expect(feed.moments[0].associated_brand_names).toEqual(['Midas']);
  });

  test('preserves canonical offer ids from Moment distributions', () => {
    const feed = buildMomentFeed([
      { ...base, id: 'rewarded', starts_at: '2026-09-12T14:00:00Z', ends_at: '2026-09-12T18:00:00Z' },
    ], {}, NOW, {
      rewarded: [{ id: 'offer-1', title: 'First drink included', reward_type: 'voucher' }],
    });

    expect(feed.moments[0].associated_offers).toEqual([
      { id: 'offer-1', title: 'First drink included', reward_type: 'voucher' },
    ]);
  });
});

test('keeps I Luv Hip Hop on Thursdays in Jamaica and includes the current occurrence', () => {
  const recurring = { ...base, id: 'weekly', title: 'I Luv Hip Hop', starts_at: '2026-07-10T02:00:00Z', ends_at: '2026-07-10T07:59:00Z', recurrence_enabled: true, recurrence_frequency: 'weekly', recurrence_interval: 1, recurrence_by_weekday: [4], recurrence_timezone: 'America/Jamaica' };
  const current = buildMomentFeed([recurring], {}, new Date('2026-10-09T03:00:00Z'));
  expect(current.moments[0].starts_at).toBe('2026-10-09T02:00:00.000Z');
  expect(current.moments[0].lifecycle).toBe('live');
  const next = buildMomentFeed([recurring], {}, new Date('2026-10-09T12:00:00Z'));
  expect(next.moments[0].starts_at).toBe('2026-10-16T02:00:00.000Z');
  expect(buildMomentFeed([{...recurring,is_active:false}],{},new Date('2026-10-09T12:00:00Z')).moments).toHaveLength(0);
});
