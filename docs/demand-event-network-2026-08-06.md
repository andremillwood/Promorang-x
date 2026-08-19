# Promorang demand-event network

The demand-event network is the connective tissue between Promorang's authoritative systems. It does not replace commerce receipts, proof, reviews, PromoPoints, Gems, Pieces, PromoKeys, Memories, PromoShare or PromoPush. It records normalized signals after those systems act.

## Shared human journey

1. Discovery
2. Interest
3. Participation
4. Conversion
5. Review
6. Referral
7. Loyalty
8. Advocacy
9. Merchant growth
10. Community growth

Every normalized event identifies its source system, campaign, demand plan, stage, actor or privacy-preserving anonymous identity, verification state, confidence and source reference. Idempotency is campaign-aware, preventing retries from inflating results while keeping the same person's actions separate across campaigns.

## Trust boundaries

- Browser clients may publish only non-authoritative participation signals such as saves, joins and referral shares.
- Purchases, verified proof and reviews must come from their authoritative backend services.
- `verified=true` cannot be supplied through the participant event endpoint.
- QR scan identities are rotating privacy-preserving hashes, not stored IP addresses or user-agent strings.
- Verified monetary value is reported separately from unverified actions.

## Implemented producers

- Signed PromoPilot QR scan → `qr_scanned` → Interest
- Settled Promorang commerce receipt → `purchase_completed` → verified Conversion
- Second settled purchase by the same participant → `repeat_purchase` → Loyalty
- Moment join → `joined` → Participation
- Verified Moment or guest check-in → `checked_in` → Participation
- Proof submission → `proof_submitted` → Participation
- Accepted proof → `proof_verified` → verified Conversion
- PromoPush impression, click, scan, join and proof lifecycle → matching normalized stages
- Guest reservation → `rsvp_confirmed` → Participation
- Provider-confirmed message delivery → `message_delivered` → Discovery
- Explicit WhatsApp, SMS or email consent → `message_consent_granted` → Interest and message-journey readiness
- Activated platform or private-invitation referral → `referral_converted` → Referral
- Controlled authenticated participant endpoint → allowed discovery, interest and participation signals

## Merchant intelligence

The campaign page now shows the actual demand flight path, attributable event count, verified outcomes and verified value. Benchmarks remain locked until at least five prior campaigns with the same goal have demand events. The comparison uses the merchant's median participation-to-conversion rate, not a fabricated universal score.

## Required migration

Apply `202608060004_demand_event_network.sql` after migrations `001`, `002` and `003`.

## Next producers

Add a canonical review writer before emitting review events. Then connect offer redemption, booking settlement, community goals and longer-horizon return visits. Each adapter should publish only after its authoritative transaction succeeds.
