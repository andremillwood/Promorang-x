const {
  offerMatchesPlace,
  placeFromQuery,
  resolveOfferReach,
  selectOffersForPlace,
} = require('../../services/offerAvailability');

test('venue offers stay local to Kingston and anywhere drops travel', () => {
  const drink = resolveOfferReach({
    fulfillment_type: 'merchant_validation',
    metadata: { city: 'Kingston', city_slug: 'kingston', location: 'Barbican' },
  });
  const release = resolveOfferReach({
    fulfillment_type: 'automatic',
    title: 'Pre-save on Spotify',
    metadata: { availability: 'anywhere', surface: 'release' },
  });
  const kingston = placeFromQuery({ city: 'kingston', cityName: 'Kingston', country: 'JM' });
  const miami = placeFromQuery({ city: 'miami', cityName: 'Miami', country: 'US' });

  expect(drink.availability).toBe('local');
  expect(release.availability).toBe('anywhere');
  expect(offerMatchesPlace(drink, kingston)).toBe(true);
  expect(offerMatchesPlace(drink, miami)).toBe(false);
  expect(offerMatchesPlace(release, miami)).toBe(true);

  const selected = selectOffersForPlace(
    [{ id: 'drink', offer: { fulfillment_type: 'qr', metadata: { city_slug: 'kingston' } } }, { id: 'dsp', offer: { fulfillment_type: 'automatic', metadata: { availability: 'anywhere', surface: 'release' } } }],
    (item) => resolveOfferReach(item.offer),
    kingston,
  );
  expect(selected.map((item) => item.id)).toEqual(['drink', 'dsp']);
});
