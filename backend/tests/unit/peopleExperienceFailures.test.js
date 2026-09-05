jest.mock('../../services/offerService', () => ({ createOffer: jest.fn(), directClaim: jest.fn() }));
const offers = require('../../services/offerService');
const { createPeopleExperienceService } = require('../../services/peopleExperienceService');

function database(drop) {
  const writes = [];
  return {
    writes,
    rpc() { return Promise.resolve({ data: null, error: new Error('Out of stock') }); },
    from(table) {
      const result = { data: table === 'community_drops' ? drop : null, error: null };
      for (const method of ['select', 'eq', 'maybeSingle', 'single']) result[method] = () => result;
      for (const method of ['insert', 'update', 'upsert']) result[method] = (value) => {
        writes.push({ table, method, value });
        return result;
      };
      return result;
    },
  };
}

beforeEach(() => jest.resetAllMocks());

test('failed issuance does not claim, decrement inventory or record activity', async () => {
  const db = database({ id: 'drop-1', creator_id: 'owner-1', offer_id: 'offer-1', status: 'active', remaining: 1 });
  await expect(createPeopleExperienceService(db).claimDrop('member-1', 'perk')).rejects.toThrow('Out of stock');
  expect(db.writes).toEqual([]);
});

test('failed offer creation cannot publish a drop without its fulfillment record', async () => {
  const db = database(null);
  offers.createOffer.mockRejectedValue(new Error('Distribution unavailable'));
  await expect(createPeopleExperienceService(db).createDrop('owner-1', { title: 'Entry', kind: 'free_entry' })).rejects.toThrow('Distribution unavailable');
  expect(db.writes).toEqual([]);
});

test('failed inventory creation cannot bypass offer distribution creation', async () => {
  const db = database(null);
  offers.createOffer.mockRejectedValue(new Error('Distribution unavailable'));
  await expect(createPeopleExperienceService(db).provideInventory('owner-1', { title: 'Entry', quantity: 2 })).rejects.toThrow('Distribution unavailable');
  expect(db.writes).toEqual([]);
});
