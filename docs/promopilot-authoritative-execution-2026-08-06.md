# PromoPilot authoritative execution

PromoPilot now moves a compiled demand plan beyond recommendations into an auditable execution manifest. Each selected Promorang system receives its own idempotent job, lifecycle, blocker, result, and artifact.

## What executes now

- **Pulse:** creates an active public campaign publication. Pulse reads these publications alongside Moments and routes people to the campaign entry path.
- **QR:** creates a signed, attributable public link. Only its hash is stored; scans resolve through the backend and add campaign attribution.
- **Creators and communities:** create open partner briefs that can be matched and accepted independently.
- **PromoPoints, PromoKeys, reviews, referrals, Memories, journeys and growth events:** create authoritative campaign rules with explicit triggers and configuration.
- **WhatsApp and email:** create message journeys in `awaiting_consent`. They do not send until a consented audience exists.
- **Gems and PromoShare:** create rules in `awaiting_funding`. They do not imply that value has been reserved.
- **Pieces:** creates a rule in `awaiting_approval`. It does not mint or allocate Pieces without approved terms.
- **PromoPush:** creates a draft only when a linked Moment, map coordinates and a distribution window exist. Otherwise the job exposes a precise blocker.

## Execution lifecycle

`draft → blocked|ready → queued → running → completed|failed`

Waiting on consent, funding or approval remains `running` with a visible `waiting_for` condition. Retryable failures and blockers remain separate per system so one optional integration cannot erase the rest of the campaign's progress.

## Required deployment order

Apply these migrations after the demand-plan core migration:

1. `202608060002_promopilot_execution_core.sql`
2. `202608060003_promopilot_authoritative_adapters.sql`

Set `PROMOPILOT_SIGNING_SECRET` in the backend environment for dedicated QR signing. Existing JWT signing secrets are accepted as a fallback, but a separate secret is preferred.

## Next infrastructure boundary

The next layer should consume consent, funding, approval, delivery and outcome events from each authoritative subsystem. Those events should advance waiting jobs and write normalized demand events, allowing cross-campaign attribution, benchmarks and prediction without flattening PromoPoints, Gems, Pieces, PromoKeys, Memories or PromoShare into one generic currency.
