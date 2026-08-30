---
name: weekly-moments-drop
description: Weekly Promorang Moment catalog and announcement. Use when the Monday weekly-moments timer fires, or when adding dated events with up to 90 days of lead time in any live or pilot hub.
---

# Weekly Moments Drop

Announce new Things every Monday, **per hub**. Only publish events whose **calendar date is within 90 days**.

## Hubs in scope

Use `getWeeklyDropHubs()` from `@promorang/shared` — **live and pilot only**:

- Jamaica: Kingston, Montego Bay (plus parish events already in the Jamaica catalog)
- Caribbean pilots: Port of Spain, Bridgetown, Nassau, Georgetown, Santo Domingo
- LatAm pilots: Medellín, Bogotá, Panama City
- Africa pilot: Accra

Do **not** invent calendars for planned/beta hubs (Havana, London, Lagos, Miami, etc.) until that market is live or pilot.

## On each Monday tick

1. Read `data/cultural-calendar/jamaica-90-day.json`, `data/cultural-calendar/hubs-90-day.json`, and the latest drop.
2. Research official sources for events dated **today → +90 days**:
   - Always cover Jamaica.
   - Deep-dive **2–3 other live/pilot hubs** each week so every hub gets fresh dates over a month.
   - Use the `sources` on `getWeeklyDropHubs()` plus public holiday calendars.
3. Add only dated, attributable events. Tag `country_code`, `city_slug`, `hub_id`, and `timezone`.
4. Upsert into `cultural_calendar_events`.
5. Run `run_weekly_moment_drop`.
6. Confirm Explore filters the announcement to the selected city hub.
7. Run the stakeholder scout score/queue pass. Do **not** send email. Cap 10 invites per hub.
8. Commit catalog updates on `cursor/weekly-moments-agent-5d54` and update the PR.

## Lead window

- 0–90 days: publish and announce in that hub.
- Beyond 90 days: keep queued.

## Dedup

Match on `event_key`. Never create a second Moment for the same dated event in the same hub.

## Report

`Published N across H hubs, announced N new this week, M still inside the 90-day horizon.`
