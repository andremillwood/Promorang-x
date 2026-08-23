#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { normalizeOsmResponse } from './lib/normalize-osm.mjs';
import { buildKingstonVenueQuery, fetchOverpass } from './lib/overpass.mjs';
import { uploadReviewBatch } from './lib/upload-review.mjs';

const { values } = parseArgs({
  options: {
    input: { type: 'string' },
    output: { type: 'string', default: 'data/inventory/kingston-osm-review.json' },
    endpoint: { type: 'string' },
    limit: { type: 'string' },
    upload: { type: 'boolean', default: false },
  },
});

const outputPath = resolve(values.output);
const checkedAt = new Date().toISOString();
let payload;
let collectionMode;

if (values.input) {
  payload = JSON.parse(await readFile(resolve(values.input), 'utf8'));
  collectionMode = 'fixture';
} else {
  payload = await fetchOverpass(buildKingstonVenueQuery(), { endpoint: values.endpoint });
  collectionMode = 'live';
}

let candidates = normalizeOsmResponse(payload, checkedAt);
if (values.limit) {
  const limit = Number.parseInt(values.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) throw new TypeError('--limit must be a positive integer.');
  candidates = candidates.slice(0, limit);
}

const reviewFile = {
  schema_version: 1,
  source: {
    key: 'openstreetmap',
    attribution: '© OpenStreetMap contributors',
    license: 'ODbL 1.0',
    license_url: 'https://opendatacommons.org/licenses/odbl/1-0/',
  },
  batch: {
    region: 'Kingston and St. Andrew, Jamaica',
    collected_at: checkedAt,
    collection_mode: collectionMode,
    publish_ready: false,
  },
  stats: {
    source_elements: payload.elements.length,
    candidates: candidates.length,
    pending_review: candidates.filter((item) => item.review_status === 'pending').length,
    needs_research: candidates.filter((item) => item.review_status === 'needs_research').length,
  },
  candidates,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(reviewFile, null, 2)}\n`, 'utf8');
console.log(`Created private review file with ${candidates.length} candidates: ${outputPath}`);

if (values.upload) {
  const result = await uploadReviewBatch(reviewFile);
  console.log(`Uploaded batch ${result.batchId} with ${result.candidateCount} candidates for operator review.`);
}
