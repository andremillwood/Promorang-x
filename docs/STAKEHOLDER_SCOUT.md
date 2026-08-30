# Stakeholder scout

Research and shortlist restaurants, stores, brands, and products for a live or pilot hub. A steward or admin decides who gets invited, and a person records the walk-in or send. The agent never emails anyone.

## Why this exists

Promorang grows city by city through City Stewards, not cold outreach. The scout exists so operators can:

1. Map public places that fit a dated Moment.
2. Score them against hub, Moment, category, evidence, and a concrete job.
3. Queue at most **10** candidates per hub per week.
4. Draft a claim-page invite a steward can walk in.
5. Keep a do-not-contact list.

It does **not** scrape inboxes, send offers, or invite people to “become a stakeholder.”

## Surfaces

| Surface | Path | Job |
|---|---|---|
| Admin queue | `/admin?tab=scout` | Ingest catalog, approve, draft, record a human send |
| Steward queue | `/steward/dashboard` | Approve or pass this week’s shortlist |
| Claim page | `/claim-pages` | Owner takes the page after a human invite |
| Weekly job | Mondays 10:00 America/Jamaica | Score and queue only |

## Scoring

A candidate can be shortlisted only when all of these are true:

- Hub is live or pilot.
- A dated Moment in that hub sits inside the 90-day window.
- There is a concrete job (`dessert stop`, `dinner check-in`, `fund one verified action`).
- There is a public source to verify before a visit.
- They are not suppressed or already claimed.

Preferred channel is walk-in for venues and merchants, steward intro for brands and products. Email is never the default and is never sent by the job.

## Status path

`sourced → scored → queued → approved → invite_ready → sent_by_human`

Watch and reject are valid exits. `sent_by_human` can only be set by a signed-in person after the draft exists.

## Production

1. Apply `supabase/migrations/20260828180000_stakeholder_scout.sql`.
2. Deploy the backend so `/api/stakeholder-scout` and `/api/cron/stakeholder-scout` are mounted.
3. Deploy the web application.
4. After the Monday weekly Moment drop, open `/admin?tab=scout` and score the founding catalog, or wait for the 10:00 job.
5. Steward approves at most ten Kingston (or other live hub) invites and walks them in.
