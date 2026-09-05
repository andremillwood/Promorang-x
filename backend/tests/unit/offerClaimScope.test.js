const mockFrom = jest.fn();
jest.mock('../../lib/supabase', () => ({ supabase: { from: mockFrom } }));
const offers = require('../../services/offerService');

test('a direct claim issues only the selected offer, even when other offers share its event', async () => {
  const inserted = [];
  const offer = (id) => ({
    id, status: 'active', starts_at: '2020-01-01', ends_at: null,
    per_user_limit: 1, quantity_total: 10, quantity_reserved: 0, quantity_redeemed: 0,
    claim_expires_days: 30,
    offer_distributions: [{ id: `dist-${id}`, channel: 'direct', is_active: true, trigger_event: 'drop_claim', source_id: null }],
  });
  mockFrom.mockImplementation((table) => {
    let filters = {};
    let payload;
    const chain = {
      select: () => chain,
      eq: (key, value) => { filters[key] = value; return chain; },
      is: () => chain,
      in: () => chain,
      update: () => chain,
      insert: (value) => { payload = value; if (table === 'offer_issuances') inserted.push(value); return chain; },
      single: () => chain,
      then(resolve) {
        if (table === 'offers') return Promise.resolve({ data: offer(filters.id), error: null }).then(resolve);
        if (table === 'offer_distributions') {
          const data = ['selected', 'unrelated'].filter((id) => !filters.offer_id || filters.offer_id === id)
            .map((id) => ({ id: `dist-${id}`, offers: offer(id), allocation_limit: null, allocation_count: 0, qualification_rules: {} }));
          return Promise.resolve({ data, error: null }).then(resolve);
        }
        return Promise.resolve({ data: payload ? { id: 'issued-1', ...payload } : null, count: 0, error: null }).then(resolve);
      },
    };
    return chain;
  });
  const result = await offers.directClaim('member-1', 'selected');
  expect(result.offer_id).toBe('selected');
  expect(inserted.map((item) => item.offer_id)).toEqual(['selected']);
});
