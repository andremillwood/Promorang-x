---
name: weekly-moments-drop
description: Weekly Promorang Moment catalog and announcement. Use when the Monday weekly-moments timer fires, or when adding dated Jamaica events with up to 90 days of lead time.
---

# Weekly Moments Drop

Announce new Things every Monday. Only publish events whose **calendar date is within 90 days**.

## On each Monday tick

1. Read `data/cultural-calendar/jamaica-90-day.json` and the latest `weekly_moment_drops` row.
2. Research official sources for events dated **today → +90 days**:
   - https://www.visitjamaica.com/experiences/events/
   - https://www.visitjamaica.com/experiences/events/events-calendar/
   - https://kingstoncreative.org/artwalk/
   - Jamaica public holiday calendar
3. Add only dated, attributable events. Do not invent dates.
4. Upsert new rows into `cultural_calendar_events` (or extend the catalog JSON + migration).
5. Call `run_weekly_moment_drop` via `/api/cron/weekly-moments` or the OpenClaw skill.
6. Confirm Explore shows the new tickets under "This week on Promorang".
7. Commit catalog updates on `cursor/weekly-moments-agent-5d54` and update the PR.
8. Draft the announcement. Do not post to social without approval.

## Lead window

- `this_week` / `near` / `horizon` (0–90 days): publish and announce.
- Beyond 90 days: keep queued. They enter a later Monday drop when they cross the line.

## Dedup

Match on `event_key` (`slug-plus-date`). Never create a second Moment for the same dated event.

## Report

`Published N, announced N new this week, M still inside the 90-day horizon.`
