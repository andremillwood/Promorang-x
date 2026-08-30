const rules = require('../../lib/stakeholderScout');
const service = require('../../services/stakeholderScoutService');

const dinnerMoment = {
  id: 'moment-food-crawl',
  title: 'New Kingston Thursday Food Crawl',
  hubId: 'kingston',
  city: 'Kingston',
  startsAt: '2026-09-03T23:00:00.000Z',
  category: 'food',
};

function createClient() {
  const candidates = new Map();
  const reviews = [];
  const suppressions = [];

  function from(table) {
    const ctx = { table, op: 'select', payload: null, filters: {}, inKey: null, inValues: null };
    const result = () => {
      if (table === 'stakeholder_scout_suppressions') {
        if (ctx.op === 'upsert') {
          suppressions.push(ctx.payload);
          return { data: ctx.payload, error: null };
        }
        return { data: suppressions, error: null };
      }
      if (table === 'stakeholder_scout_reviews') {
        if (ctx.op === 'insert') {
          reviews.push(ctx.payload);
          return { data: ctx.payload, error: null };
        }
        const rows = reviews.filter((row) => !ctx.filters.candidate_id || row.candidate_id === ctx.filters.candidate_id);
        return { data: rows, error: null };
      }
      if (table === 'cultural_calendar_events') {
        return { data: [dinnerMoment], error: null };
      }

      if (ctx.op === 'upsert') {
        const row = { id: ctx.payload.candidate_key, ...ctx.payload };
        candidates.set(row.candidate_key, row);
        return { data: row, error: null };
      }
      if (ctx.op === 'update') {
        const current = [...candidates.values()].find((row) => row.id === ctx.filters.id);
        if (!current) return { data: null, error: { message: 'not found' } };
        const next = { ...current, ...ctx.payload };
        candidates.set(next.candidate_key, next);
        return { data: next, error: null };
      }

      let rows = [...candidates.values()];
      if (ctx.inKey === 'candidate_key') {
        rows = rows.filter((row) => ctx.inValues.includes(row.candidate_key));
      }
      Object.entries(ctx.filters).forEach(([key, value]) => {
        rows = rows.filter((row) => row[key] === value);
      });
      return { data: rows, error: null, count: rows.length };
    };

    const api = {
      select() { return api; },
      eq(key, value) { ctx.filters[key] = value; return api; },
      in(key, values) { ctx.inKey = key; ctx.inValues = values; return api; },
      order() { return api; },
      limit() { return api; },
      gte() { return api; },
      lt() { return api; },
      upsert(payload) { ctx.op = 'upsert'; ctx.payload = payload; return api; },
      insert(payload) { ctx.op = 'insert'; ctx.payload = payload; return api; },
      update(payload) { ctx.op = 'update'; ctx.payload = payload; return api; },
      single: async () => {
        const resolved = result();
        if (Array.isArray(resolved.data)) {
          return { data: resolved.data[0] || null, error: resolved.data[0] ? null : { message: 'not found' } };
        }
        return resolved;
      },
      then(resolve, reject) {
        return Promise.resolve(result()).then(resolve, reject);
      },
    };
    return api;
  }

  return { from, _candidates: candidates, _reviews: reviews };
}

describe('stakeholder scout rules', () => {
  const asOf = new Date('2026-08-28T21:10:00.000Z');
  const dessert = rules.FOUNDING_SCOUT_CATALOG.find((row) => row.candidateKey === 'kingston-devon-house-ice-cream');

  test('never allows the agent to send', () => {
    expect(rules.canAutoSendScoutInvite()).toBe(false);
    const draft = rules.draftClaimPageInvite(dessert, dinnerMoment);
    expect(draft.sendAllowed).toBe(false);
    expect(draft.autoSend).toBe(false);
    expect(draft.requiresHumanApproval).toBe(true);
  });

  test('shortlists a Kingston dessert stop against a food Moment', () => {
    const score = rules.scoreStakeholderCandidate(dessert, dinnerMoment, asOf);
    expect(score.recommendation).toBe('shortlist');
    expect(score.nextStatus).toBe('queued');
    expect(score.preferredChannel).toBe('walk_in');
  });

  test('blocks sending before an invite is approved and drafted', () => {
    expect(() => rules.transitionScoutStatus('queued', 'sent_by_human')).toThrow(/Cannot move/);
    expect(rules.transitionScoutStatus('invite_ready', 'sent_by_human')).toBe('sent_by_human');
  });
});

describe('stakeholder scout service', () => {
  beforeEach(() => {
    global.supabase = createClient();
  });

  afterEach(() => {
    delete global.supabase;
  });

  test('ingests the founding catalog without sending anything', async () => {
    const result = await service.ingest({
      moments: [dinnerMoment],
      asOf: new Date('2026-08-28T21:10:00.000Z'),
    });
    expect(result.autoSend).toBe(false);
    expect(result.sent).toBe(0);
    expect(result.scored).toBeGreaterThan(0);
    expect(result.queued).toBeGreaterThan(0);
    expect(result.queued).toBeLessThanOrEqual(10);
  });

  test('requires a person to record a walk-in or send', async () => {
    await expect(service.recordHumanSend('missing', null, 'walk_in')).rejects.toThrow(/person must record/);
  });

  test('nominations in planned hubs are rejected', async () => {
    await expect(service.nominate({
      kind: 'venue',
      displayName: 'Imaginary Bar',
      hubId: 'london',
    }, 'steward-1')).rejects.toThrow(/live or pilot/);
  });
});
