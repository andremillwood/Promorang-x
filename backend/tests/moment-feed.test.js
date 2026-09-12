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
});
