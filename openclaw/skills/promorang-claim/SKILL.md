---
name: promorang-claim
description: Manage the lifecycle of unclaimed moments and venues — create from scraped data, track claim status, handle ownership transfers.
---

# Promorang Claim Skill

Manage unclaimed moments and venues that were discovered through event scraping or venue discovery. Handles the "Claim Your Moment" lifecycle.

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key

## Available Actions

### Create Unclaimed Moment
Create a moment from scraped event data (Eventbrite, Partiful, etc.).
```bash
node ~/openclaw/skills/promorang-claim/claim.js --action create-unclaimed \
  --title "Kingston Food Fest 2026" \
  --description "Annual food festival..." \
  --source eventbrite \
  --source-url "https://eventbrite.com/e/..." \
  --start-date "2026-03-15T18:00:00" \
  --city Kingston
```

### Create Unclaimed Venue
Create a venue profile from discovered data (Google Maps, etc.).
```bash
node ~/openclaw/skills/promorang-claim/claim.js --action create-unclaimed-venue \
  --name "Jerk Pit BBQ" \
  --address "12 Hope Road, Kingston" \
  --city Kingston \
  --type restaurant \
  --source google_maps \
  --source-url "https://maps.google.com/..."
```

### List Unclaimed Moments
```bash
node ~/openclaw/skills/promorang-claim/claim.js --action list-unclaimed [--city <city>] [--limit 20]
```

### Get Claim Stats
```bash
node ~/openclaw/skills/promorang-claim/claim.js --action claim-stats
```
Returns: total unclaimed, total claimed, conversion rate, by source.

### Generate Outreach Draft
Generate "Claim Your Moment" email copy for an unclaimed moment.
```bash
node ~/openclaw/skills/promorang-claim/claim.js --action outreach-draft --moment-id <uuid>
```

### Mark as Claimed
```bash
node ~/openclaw/skills/promorang-claim/claim.js --action mark-claimed --moment-id <uuid> --claimed-by <user-id>
```

## Lifecycle

```
Scraped → unclaimed → outreach sent → owner signs up → claimed → verified
```

## Notes
- Never create duplicate moments — check title + date + city before creating
- Outreach drafts need Andre's approval before sending
- The ops agent runs daily scraping; the advisor agent handles claim requests from users
