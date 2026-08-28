---
name: promorang-weekly-moments
description: Weekly Moment catalog and announcement job. Use when adding dated events for any live or pilot hub, running the Monday drop, or listing the 90-day planning horizon.
---

# Weekly Moments Skill

Keeps Promorang announcing new Moments every week, per hub, for events whose calendar date is inside a **90-day lead window**.

## Hubs

Live + pilot only (from `getWeeklyDropHubs()`): Kingston, Montego Bay, Port of Spain, Bridgetown, Nassau, Georgetown, Santo Domingo, Medellín, Bogotá, Panama City, Accra.

Planned hubs stay out until launch stage changes.

## Cadence

Monday 9:00 AM America/Jamaica.

1. Cover Jamaica every week.
2. Deep-dive 2–3 other live/pilot hubs.
3. Add dated events with `country_code`, `city_slug`, `hub_id`, `timezone`.
4. Run the drop.
5. Draft the announcement. No social posts without approval.

## Allowed sources

Facts and links only. Use official tourism boards and public holiday calendars for that hub. Do not invent dates.

## Actions

```bash
node ~/openclaw/skills/promorang-weekly-moments/weekly-moments.js --action run-drop
node ~/openclaw/skills/promorang-weekly-moments/weekly-moments.js --action list-horizon
node ~/openclaw/skills/promorang-weekly-moments/weekly-moments.js --action add-event \
  --event-key "gh-founders-day-2026-09-21" \
  --title "Ghana Founders' Day" \
  --city Accra \
  --country Ghana \
  --country-code GH \
  --city-slug accra \
  --hub-id accra \
  --timezone Africa/Accra \
  --starts-at "2026-09-21T09:00:00.000Z" \
  --source-name "Ghana Tourism Authority" \
  --source-url "https://visitghana.com/"
```

## Report

`Published N across H hubs, announced N new this week, M still inside the 90-day horizon.`
