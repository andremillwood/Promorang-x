jest.mock('../../lib/supabase', () => {
  const from = jest.fn();
  return { supabase: { from } };
});

const { supabase } = require('../../lib/supabase');
const { findEligibleMoments } = require('../../lib/agents/promoShareTools');

function queryChain(result) {
  const api = {};
  api.select = jest.fn(() => api);
  api.eq = jest.fn(() => api);
  api.neq = jest.fn(() => api);
  api.not = jest.fn(() => api);
  api.or = jest.fn(() => api);
  api.order = jest.fn(() => api);
  api.limit = jest.fn(() => Promise.resolve(result));
  return api;
}

describe('findEligibleMoments', () => {
  beforeEach(() => {
    supabase.from.mockReset();
  });

  test('does not invent Thursday New Kingston tasting when the live query fails', async () => {
    supabase.from.mockReturnValue(queryChain({ data: null, error: { message: 'column moments.name does not exist' } }));

    const result = await findEligibleMoments({ location: 'Kingston' });

    expect(result.moments).toEqual([]);
    expect(result.source).toBe('error');
    expect(JSON.stringify(result)).not.toMatch(/m-kingston-tasting|Thursday New Kingston tasting/);
  });

  test('does not invent a Moment when the catalog is empty', async () => {
    supabase.from.mockReturnValue(queryChain({ data: [], error: null }));

    const result = await findEligibleMoments({ location: 'Kingston' });

    expect(result.moments).toEqual([]);
    expect(result.source).toBe('live');
  });

  test('returns only linkable live Moments', async () => {
    supabase.from.mockReturnValue(queryChain({
      data: [
        { id: 'm-kingston-tasting', title: 'Thursday New Kingston tasting', location: 'New Kingston' },
        {
          id: '11111111-1111-4111-8111-111111111111',
          slug: 'harbour-set',
          title: 'Harbour View late set',
          location: 'Kingston',
        },
      ],
      error: null,
    }));

    const result = await findEligibleMoments({ location: 'Kingston' });

    expect(result.moments).toHaveLength(1);
    expect(result.moments[0].slug).toBe('harbour-set');
    expect(result.moments[0].id).toBe('11111111-1111-4111-8111-111111111111');
  });
});
