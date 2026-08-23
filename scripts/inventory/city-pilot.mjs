#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { buildCityVenueQuery, fetchOverpass } from './lib/overpass.mjs';
import { normalizeOsmResponse } from './lib/normalize-osm.mjs';
import { uploadCityLaunchMetadata, uploadReviewBatch } from './lib/upload-review.mjs';

const { values } = parseArgs({ options: {
  city: { type: 'string' }, manifest: { type: 'string', default: 'data/markets/pilot-cities.json' },
  input: { type: 'string' }, output: { type: 'string' }, endpoint: { type: 'string' },
  limit: { type: 'string' }, upload: { type: 'boolean', default: false },
} });

if (!values.city) throw new TypeError('--city is required, for example --city accra.');
const manifest = JSON.parse(await readFile(resolve(values.manifest), 'utf8'));
const city = manifest.cities.find((item) => item.city_slug === values.city || `${item.country_slug}/${item.city_slug}` === values.city);
if (!city) throw new TypeError(`Unknown pilot city: ${values.city}.`);

const checkedAt = new Date().toISOString();
const payload = values.input
  ? JSON.parse(await readFile(resolve(values.input), 'utf8'))
  : await fetchOverpass(buildCityVenueQuery(city.bbox), { endpoint: values.endpoint, timeoutMs: 240_000 });
let candidates = normalizeOsmResponse(payload, checkedAt, {
  city: city.city, region: city.region, parish: null, country: city.country, country_code: city.country_code,
});
if (values.limit) {
  const limit = Number.parseInt(values.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) throw new TypeError('--limit must be a positive integer.');
  candidates = candidates.slice(0, limit);
}

const reviewFile = {
  schema_version: 2,
  source: { key: 'openstreetmap', attribution: '© OpenStreetMap contributors', license: 'ODbL 1.0', license_url: 'https://opendatacommons.org/licenses/odbl/1-0/' },
  batch: {
    region: `${city.city}, ${city.country}`, country_code: city.country_code, country_slug: city.country_slug,
    city_slug: city.city_slug, collected_at: checkedAt, collection_mode: values.input ? 'fixture' : 'live', publish_ready: false,
  },
  rules: manifest.rules,
  city,
  poll_templates: city.poll_templates.map((question, index) => ({
    key: `${city.country_code.toLowerCase()}-${city.city_slug}-${index + 1}`, question, status: 'draft',
    category: index === 3 ? 'City Direction' : 'Local Discovery', threshold_for_moment: 25,
  })),
  stats: {
    source_elements: payload.elements.length, candidates: candidates.length,
    pending_review: candidates.filter((item) => item.review_status === 'pending').length,
    needs_research: candidates.filter((item) => item.review_status === 'needs_research').length,
  },
  candidates,
};
const outputPath = resolve(values.output || `data/inventory/pilots/${city.country_slug}/${city.city_slug}-osm-review.json`);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(reviewFile, null, 2)}\n`, 'utf8');
console.log(`Created private ${city.city} review file with ${candidates.length} venue candidates and ${reviewFile.poll_templates.length} draft polls: ${outputPath}`);
if (values.upload) {
  const result = await uploadReviewBatch(reviewFile);
  const metadata = await uploadCityLaunchMetadata(reviewFile);
  console.log(`Uploaded batch ${result.batchId} and ${metadata.pollTemplateCount} draft polls; all candidates and polls still require review.`);
}
