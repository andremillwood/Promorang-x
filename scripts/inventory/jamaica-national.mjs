#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { buildParishVenueQuery, fetchOverpass } from './lib/overpass.mjs';
import { normalizeOsmResponse } from './lib/normalize-osm.mjs';
import { uploadReviewBatch } from './lib/upload-review.mjs';

export const JAMAICA_PARISHES = [
  ['JM-01', 'Kingston'], ['JM-02', 'Saint Andrew'], ['JM-03', 'Saint Thomas'],
  ['JM-04', 'Portland'], ['JM-05', 'Saint Mary'], ['JM-06', 'Saint Ann'],
  ['JM-07', 'Trelawny'], ['JM-08', 'Saint James'], ['JM-09', 'Hanover'],
  ['JM-10', 'Westmoreland'], ['JM-11', 'Saint Elizabeth'], ['JM-12', 'Manchester'],
  ['JM-13', 'Clarendon'], ['JM-14', 'Saint Catherine'],
].map(([isoCode, parish]) => ({ isoCode, parish }));

const { values } = parseArgs({ options: {
  parish: { type: 'string', multiple: true }, output: { type: 'string', default: 'data/inventory/jamaica' },
  endpoint: { type: 'string' }, upload: { type: 'boolean', default: false },
  resume: { type: 'boolean', default: false }, limit: { type: 'string' },
} });

const selected = values.parish?.length
  ? JAMAICA_PARISHES.filter((item) => values.parish.some((value) => [item.isoCode, item.parish.toLowerCase()].includes(value.toLowerCase())))
  : JAMAICA_PARISHES;
if (!selected.length) throw new TypeError('No parish matched --parish. Use a name such as Portland or an ISO code such as JM-04.');
const perParishLimit = values.limit ? Number.parseInt(values.limit, 10) : null;
if (perParishLimit !== null && (!Number.isInteger(perParishLimit) || perParishLimit < 1)) throw new TypeError('--limit must be a positive integer.');

const summary = { started_at: new Date().toISOString(), parishes: [], total_candidates: 0, failures: [] };
for (const place of selected) {
  const slug = place.parish.toLowerCase().replace(/\s+/g, '-');
  const outputPath = resolve(values.output, `${slug}-osm-review.json`);
  try {
    let reviewFile;
    if (values.resume) {
      try { reviewFile = JSON.parse(await readFile(outputPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (!reviewFile) {
      const checkedAt = new Date().toISOString();
      const payload = await fetchOverpass(buildParishVenueQuery(place.isoCode), { endpoint: values.endpoint, timeoutMs: 240_000 });
      let candidates = normalizeOsmResponse(payload, checkedAt, { parish: place.parish });
      if (perParishLimit) candidates = candidates.slice(0, perParishLimit);
      reviewFile = {
        schema_version: 1,
        source: { key: 'openstreetmap', attribution: '© OpenStreetMap contributors', license: 'ODbL 1.0', license_url: 'https://opendatacommons.org/licenses/odbl/1-0/' },
        batch: { region: `${place.parish}, Jamaica`, parish: place.parish, iso_code: place.isoCode, collected_at: checkedAt, collection_mode: 'live', publish_ready: false },
        stats: { source_elements: payload.elements.length, candidates: candidates.length, pending_review: candidates.filter((item) => item.review_status === 'pending').length, needs_research: candidates.filter((item) => item.review_status === 'needs_research').length },
        candidates,
      };
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(reviewFile, null, 2)}\n`, 'utf8');
    }
    const result = values.upload ? await uploadReviewBatch(reviewFile) : null;
    summary.parishes.push({ parish: place.parish, candidates: reviewFile.candidates.length, batch_id: result?.batchId || null, output: outputPath });
    summary.total_candidates += reviewFile.candidates.length;
    console.log(`${place.parish}: ${reviewFile.candidates.length} candidates${result ? ` uploaded in ${result.batchId}` : ''}`);
  } catch (error) {
    summary.failures.push({ parish: place.parish, error: error.message });
    console.error(`${place.parish}: ${error.message}`);
  }
}
summary.completed_at = new Date().toISOString();
const summaryPath = resolve(values.output, 'national-summary.json');
await mkdir(dirname(summaryPath), { recursive: true });
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`National collection: ${summary.total_candidates} candidates across ${summary.parishes.length} parishes; ${summary.failures.length} failures.`);
if (summary.failures.length) process.exitCode = 1;
