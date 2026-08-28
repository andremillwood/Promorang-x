---
name: promorang-weekly-moments
description: Weekly Moment catalog and announcement job. Use when adding dated Jamaica events, running the Monday drop, or listing the 90-day planning horizon.
---

# Weekly Moments Skill

Keeps Promorang announcing new Moments every week, and only publishes events whose calendar date is inside a **90-day lead window**.

## Environment Variables Required

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

## Cadence

Monday 9:00 AM America/Jamaica (`0 14 * * 1` UTC).

1. Research official calendars for events dated now → +90 days.
2. Add new dated events to the catalog.
3. Run the weekly drop so queued events become live Moments.
4. Draft the announcement. Do not post socially without Andre's approval.

## Allowed sources

Facts and links only:

- Visit Jamaica events calendar
- Kingston Creative
- Government holiday calendar
- Official organizer or venue pages

Do not invent dates. If only a month is known, set `schedule_precision` to `month` or `weekend`.

## Actions

```bash
node ~/openclaw/skills/promorang-weekly-moments/weekly-moments.js --action run-drop
node ~/openclaw/skills/promorang-weekly-moments/weekly-moments.js --action list-horizon
node ~/openclaw/skills/promorang-weekly-moments/weekly-moments.js --action current-drop
node ~/openclaw/skills/promorang-weekly-moments/weekly-moments.js --action add-event \
  --event-key "kingston-creative-artwalk-2026-12-27" \
  --title "Kingston Creative Artwalk — December" \
  --description "Downtown Kingston public arts festival." \
  --category arts \
  --city Kingston \
  --starts-at "2026-12-27T16:00:00.000Z" \
  --source-name "Kingston Creative" \
  --source-url "https://kingstoncreative.org/artwalk/"
```

## Lead window

- Publish events dated **today through +90 days**.
- Keep later events queued. They enter a future Monday drop when they cross the 90-day line.
- Deduplicate on `event_key`.

## Report format

`Published 4, announced 4 new this week, 8 still inside the 90-day horizon.`
