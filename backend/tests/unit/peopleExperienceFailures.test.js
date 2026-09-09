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

test('nearby includes merchant inventory even before a drop exists', async () => {
  const offer = {
    id: 'offer-9',
    title: 'First drink',
    status: 'active',
    fulfillment_type: 'merchant_validation',
    owner_user_id: 'merchant-1',
    quantity_total: 10,
    quantity_reserved: 0,
    quantity_redeemed: 0,
  };
  const db = {
    from(table) {
      const result = {
        data: table === 'offers' ? [offer] : table === 'community_drops' ? [] : null,
        error: null,
      };
      for (const method of ['select', 'eq', 'in', 'not', 'order', 'limit', 'maybeSingle']) {
        result[method] = () => result;
      }
      return result;
    },
  };
  const nearby = await createPeopleExperienceService(db).getNearbyBenefits();
  expect(nearby).toHaveLength(1);
  expect(nearby[0].offerId).toBe('offer-9');
  expect(nearby[0].title).toBe('First drink');
  expect(nearby[0].dropSlug).toBe(null);
});

test('nearby keeps Kingston locals and anywhere drops, not another city venue', async () => {
  const offers = [
    {
      id: 'offer-kgn',
      title: 'First drink',
      status: 'active',
      fulfillment_type: 'merchant_validation',
      owner_user_id: 'merchant-1',
      metadata: { city: 'Kingston', city_slug: 'kingston' },
      quantity_total: 10,
      quantity_reserved: 0,
      quantity_redeemed: 0,
    },
    {
      id: 'offer-mia',
      title: 'Wynwood pour',
      status: 'active',
      fulfillment_type: 'merchant_validation',
      owner_user_id: 'merchant-2',
      metadata: { city: 'Miami', city_slug: 'miami' },
      quantity_total: 10,
      quantity_reserved: 0,
      quantity_redeemed: 0,
    },
    {
      id: 'offer-dsp',
      title: 'Pre-save on Spotify',
      status: 'active',
      fulfillment_type: 'automatic',
      owner_user_id: 'brand-1',
      metadata: { availability: 'anywhere', surface: 'release' },
      quantity_total: 50,
      quantity_reserved: 0,
      quantity_redeemed: 0,
    },
  ];
  const db = {
    from(table) {
      const result = {
        data: table === 'offers' ? offers : table === 'community_drops' ? [] : null,
        error: null,
      };
      for (const method of ['select', 'eq', 'in', 'not', 'order', 'limit', 'maybeSingle']) {
        result[method] = () => result;
      }
      return result;
    },
  };
  const nearby = await createPeopleExperienceService(db).getNearbyBenefits({
    city: 'Kingston',
    citySlug: 'kingston',
    countryCode: 'JM',
  });
  expect(nearby.map((row) => row.offerId)).toEqual(['offer-kgn', 'offer-dsp']);
  expect(nearby.find((row) => row.offerId === 'offer-dsp').availability).toBe('anywhere');
});

test('createDrop stores the host moment on drop attribution', async () => {
  const db = database({ id: 'drop-1', slug: 'door-perk', creator_id: 'host-1', title: 'Door perk' });
  await createPeopleExperienceService(db).createDrop('host-1', {
    title: 'Door perk',
    offerId: 'offer-9',
    momentId: 'moment-4',
  });
  const inserted = db.writes.find((row) => row.table === 'community_drops' && row.method === 'insert');
  expect(inserted.value.attribution.moment_id).toBe('moment-4');
  expect(inserted.value.offer_id).toBe('offer-9');
});
