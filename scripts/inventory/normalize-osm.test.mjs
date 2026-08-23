import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { normalizeOsmElement, normalizeOsmResponse, normalizeText } from './lib/normalize-osm.mjs';
import { uploadReviewBatch } from './lib/upload-review.mjs';
import { buildCityVenueQuery, buildParishVenueQuery } from './lib/overpass.mjs';

test('normalizes names for matching', () => {
  assert.equal(normalizeText("Café & Grill's"), 'cafe and grill s');
});

test('normalizes a complete OSM venue and assigns high confidence', () => {
  const candidate = normalizeOsmElement({
    type: 'node', id: 22, lat: 18.01, lon: -76.8,
    tags: {
      name: 'Test Venue', amenity: 'restaurant', 'addr:street': 'Hope Road',
      website: 'venue.example', phone: '876-555-0100', opening_hours: 'Mo-Fr 09:00-17:00',
    },
  }, '2026-08-21T00:00:00.000Z');

  assert.equal(candidate.normalized_data.category, 'restaurant');
  assert.equal(candidate.normalized_data.website, 'https://venue.example/');
  assert.equal(candidate.normalized_data.listing_status, 'unclaimed');
  assert.equal(candidate.confidence, 0.95);
  assert.equal(candidate.review_status, 'pending');
});

test('drops nameless records and flags duplicates for research', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/overpass-kingston.sample.json', import.meta.url)));
  const candidates = normalizeOsmResponse(fixture, '2026-08-21T00:00:00.000Z');

  assert.equal(candidates.length, 3);
  assert.equal(candidates[1].review_status, 'needs_research');
  assert.equal(candidates[1].duplicate_source_record_id, 'node/1001');
});

test('upload helper remains importable without database credentials', () => {
  assert.equal(typeof uploadReviewBatch, 'function');
});

test('builds a parish-scoped query and applies parish fallback labels', () => {
  const query = buildParishVenueQuery('JM-04');
  assert.match(query, /ISO3166-2"="JM-04/);
  const candidate = normalizeOsmElement({
    type: 'node', id: 99, lat: 18.17, lon: -76.45,
    tags: { name: 'Local Spot', amenity: 'restaurant' },
  }, '2026-08-21T00:00:00.000Z', { parish: 'Portland' });
  assert.equal(candidate.normalized_data.parish, 'Portland');
  assert.equal(candidate.normalized_data.city, 'Portland');
  assert.match(candidate.normalized_data.address, /Portland, Jamaica/);
});

test('rejects non-Jamaica parish identifiers', () => {
  assert.throws(() => buildParishVenueQuery('US-NY'), /Jamaica ISO/);
});

test('normalizes a non-Jamaica pilot city without inheriting Jamaica defaults', () => {
  const query = buildCityVenueQuery('5.5000,-0.3000,5.7000,0.0000');
  assert.match(query, /5\.5000,-0\.3000,5\.7000,0\.0000/);
  const candidate = normalizeOsmElement({ type: 'node', id: 101, lat: 5.56, lon: -0.2, tags: { name: 'Accra Arts Space', tourism: 'gallery' } },
    '2026-08-21T00:00:00.000Z', { city: 'Accra', region: 'Greater Accra', country: 'Ghana', country_code: 'GH' });
  assert.equal(candidate.normalized_data.country, 'Ghana');
  assert.equal(candidate.normalized_data.country_code, 'GH');
  assert.equal(candidate.normalized_data.city, 'Accra');
  assert.match(candidate.normalized_data.address, /Accra, Ghana/);
});
