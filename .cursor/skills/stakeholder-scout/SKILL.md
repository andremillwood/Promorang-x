---
name: stakeholder-scout
description: Score restaurants, stores, brands, and products for a live Promorang hub and queue steward invites. Never send email.
---

# Stakeholder scout

Use after the weekly Moments drop, or when a steward asks who to invite this week.

## Hard rules

- Identify and score only. **Never send email.**
- Invite to a dated Moment and a concrete job, not to “join Promorang.”
- Live and pilot hubs only.
- Cap **10** queued invites per hub per week.
- Honor suppressions and do-not-contact.

## Steps

1. Read the current weekly drop and 90-day calendar.
2. Run `runWeeklyScout` / `POST /api/stakeholder-scout/ingest` or ask an admin to click **Score founding catalog**.
3. Review `/admin?tab=scout` or `/steward/dashboard`.
4. Steward approves or passes.
5. Draft the claim-page invite and copy it. A person walks it in or records the send.

## Report

`Scored N, queued N, sent 0. Auto-send remains off.`
