# Promorang city inventory

This pipeline collects reusable public facts into a private operator review queue. It never creates a user account, verifies a business, or publishes a candidate automatically.

## Local review file

```sh
npm run inventory:kingston
```

For a deterministic smoke test:

```sh
npm run inventory:kingston -- --input scripts/inventory/fixtures/overpass-kingston.sample.json
npm run test:inventory
```

The default output is `data/inventory/kingston-osm-review.json`. Review files are deliberately excluded from source control because live exports may be large and need operator review.

## All 14 parishes

Collect every parish into an independent review file:

```sh
npm run inventory:jamaica
```

Collect or upload selected parishes, or safely resume a partial national run:

```sh
npm run inventory:jamaica -- --parish Portland --parish JM-08 --upload
npm run inventory:jamaica -- --resume --upload
```

Parish boundaries are selected with their Jamaica ISO 3166-2 codes. Separate batches make retrying, measuring coverage, and publishing in controlled waves possible.

## Upload to the private review queue

Apply `supabase/migrations/202608210003_inventory_ingestion_pipeline.sql`, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run:

```sh
npm run inventory:kingston -- --upload
```

An operator must change a candidate from `pending` to `approved`. The service role can then call `publish_approved_inventory_venue(candidate_id)`. Publication creates an explicitly unclaimed, unverified listing in `pre_populated_venues` and preserves its source and attribution.

OpenStreetMap data is © OpenStreetMap contributors and is made available under ODbL 1.0.

## Multi-country pilot cities

Pilot-city definitions live in `data/markets/pilot-cities.json`. Each definition contains the market identity, currency, timezone, collection boundary, launch targets, and four draft poll prompts.

Create a private review file for any configured city:

```sh
npm run inventory:city -- --city accra
npm run inventory:city -- --city santo-domingo --limit 50
npm run inventory:city -- --city colombia/bogota --upload
```

Supported first-wave cities are Kingston, Port of Spain, Bridgetown, Nassau, Georgetown, Accra, Santo Domingo, Medellín, Bogotá, and Panama City.

`--upload` requires `202608220001_multi_market_city_inventory.sql`. It uploads venue candidates into the existing private review queue, creates the city inventory target, and creates draft discovery-poll templates. It does not approve venues, publish polls, create Moments, or mark anything verified.

## Launch gates

A city is not launch-ready merely because records were collected. The default operating targets are:

- 30 published, source-attributed venue candidates
- 20 Steward-reviewed Discoveries
- 10 current, sourced Moments
- 4 approved and published city polls
- 3 active Scenes
- at least one active City Steward

Use `view_city_inventory_health` to track progress. Operators must explicitly set `public_launch_ready` after checking source quality, local review, safety, and sufficient density.

Imported Moments receive an expiry timestamp and can be retired with `expire_stale_imported_moments()`. City poll templates remain private drafts until reviewed, approved, and published with `publish_city_poll_template()`.
