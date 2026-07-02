# Revenue funnel instrumentation

Promorang records commercial milestones in `revenue_funnel_events`. Server-side
Stripe webhooks are authoritative for payment success and failure; browser
redirects must never activate benefits or fulfill an order.

## Canonical sequence

`captured → qualified → checkout_started → payment_succeeded → fulfilled → outcome_measured → follow_up_sent → repeat_conversion`

Supported funnels are `campaign`, `membership`, `marketplace`, `gems`,
`sponsorship`, and `featured`.

## Stripe status

The backend contains Stripe subscription checkout, one-time checkout/payment
intents, signed webhooks, and Connect payout scaffolding. The active API router
now mounts `/api/payments`; production still requires:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET` (or `WEBHOOK_SECRET_STRIPE`)
- the required `STRIPE_PRICE_*` identifiers
- a Stripe webhook destination at `/api/payments/webhook/stripe`

Apply `202607020004_revenue_funnel_events.sql` before deploying the API.

## Operational queries

Admins can request:

`GET /api/revenue-funnels/summary?start_at=<ISO>&end_at=<ISO>&funnel=<name>`

Authenticated clients may record non-payment milestones at:

`POST /api/revenue-funnels/events`

Payment events must only be written from verified provider webhooks. Use a
stable `idempotencyKey` for fulfillment and follow-up jobs.

## Current safeguards

- Duplicate Stripe deliveries are deduplicated by provider event ID.
- Cash marketplace purchases are rejected until they pass through a verified
  Stripe checkout. The old path only logged a payment and was not safe to use.
- Offer claims and redemptions emit fulfillment milestones.
- Membership, PromoShare sponsorship, and featured-placement checkout starts
  are connected to their corresponding payment events.

## Next production adapters

- Build marketplace Stripe Checkout with an order reservation and webhook
  fulfillment.
- Emit `outcome_measured` from campaign conversion and ROI aggregation.
- Add the summary endpoint to the admin analytics surface.

## Revenue lifecycle email jobs

Apply `202607020005_revenue_lifecycle_email_jobs.sql`. Database triggers schedule
the six durable, idempotent jobs:

- abandoned checkout: one hour after checkout starts, automatically cancelled
  when a matching payment succeeds;
- confirmation: immediately after verified payment;
- replenishment: 21 days after Gems, campaign, or sponsorship payment;
- renewal: 25 days after a membership payment;
- review: three days after marketplace fulfillment;
- reorder: 30 days after marketplace fulfillment.

The authenticated cron endpoint is `/api/cron/revenue-lifecycle`; the daily
maintenance route also processes due jobs. Marketing opt-outs cancel every job
except the transactional payment confirmation. Failed sends retry with
exponential backoff and stop after five attempts. Successful delivery records
both the provider message ID and a canonical `follow_up_sent` funnel event.
