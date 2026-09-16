# PROMORANG Stakeholder Next — Convergence Map v1

Status: integrated UI/UX review shell

## Purpose

Participant Next proved that PROMORANG's participant experience is easier to judge when the product is experienced as one coherent interface rather than a collection of isolated Design Lab studies.

Stakeholder Next applies the same method to the other stakeholder roles:

- Creator
- Host
- Merchant / Venue
- Brand
- Agency
- Admin

This is a UI/UX convergence exercise, not a rewrite of the underlying products.

> Design Lab defines the visual/object language. Existing production capabilities define what the Next experience is allowed to claim and do.

## Review entry point

`/stakeholder-next.html#/creator/today`

All six roles are available from the review header.

## Shared shell rule

Every role receives:

1. a clear current job;
2. a small persistent navigation model;
3. a current move;
4. attention items;
5. evidence / result context;
6. one signature work object;
7. explicit truth language where intent, validation, approval, transaction, settlement or correction could otherwise be confused.

The shell may be shared. The work object and operating rhythm must remain role-specific.

## Creator Next

Destinations:

- Today
- Work
- Create
- Proof
- Value

Existing production capability reused conceptually:

- `DiscoveryDemandInbox role="creator"`
- `CreatorMissionsHub`
- `CreatorStudioConsole`
- `CreatorAttributionMap`
- `CreatorEarningsVault`
- `CreatorReputationDeck`

Signature object: **Creator Brief**

Important boundaries:

- opportunity ≠ accepted work;
- submitted ≠ approved;
- attributed value ≠ paid settlement.

## Host Next

Destinations:

- Today
- Moments
- Live
- Proof
- Results

Existing production capability reused conceptually:

- `DiscoveryDemandInbox role="host"`
- `HostMomentsStagingConsole`
- `HostLivePulseConsole`
- `HostProofReviewConsole`
- `HostSponsorshipConsole`
- `HostImpactYieldConsole`

Signature object: **Run Sheet / Arrival Ledger**

Important boundaries:

- RSVP ≠ attendance;
- check-in record ≠ reviewed proof;
- unresolved door exception ≠ verified arrival.

## Merchant / Venue Next

Destinations:

- Today
- Offers
- Verify
- Orders
- Places

Existing production capability reused conceptually:

- `DiscoveryDemandInbox role="merchant"`
- `MerchantStorefrontConsole`
- `MerchantScannerStation`
- `MerchantOrdersHub`
- `MerchantVenueStudio`
- `MerchantYieldAnalytics`

Signature object: **Validation Slip**

Important boundaries:

- claim ≠ validation;
- validation/redemption ≠ purchase;
- paid order ≠ fulfillment;
- refund does not erase the original purchase.

## Brand Next

Destinations:

- Today
- Activations
- People
- Evidence
- Decisions

Existing production capability reused conceptually:

- existing Brand first-activation empty state;
- campaign / activation workspace;
- Brand opportunity / creator / attribution / intelligence consoles;
- organization and managed-client context already exposed through Auth workspace state.

Signature object: **Activation Dossier / Evidence Pack**

Important boundaries:

- attributed ≠ verified;
- verified ≠ incremental;
- unresolved evidence remains visible;
- the product supports stop / change / scale decisions rather than automatically framing activity as success.

## Agency Next

Destinations:

- Today
- Clients
- Work
- Proof
- Growth

Existing production capability reused conceptually:

- agency-client relationships;
- client portfolio;
- explicit active organization context switching;
- managed activation workspace;
- Brand impact / result packaging.

Signature object: **Client Ledger / Managed Result Pack**

Important boundaries:

- agency operator ≠ client owner;
- client approval remains client-owned;
- agency packaging may interpret proof but may not rewrite source facts.

## Admin Next

Destinations:

- Today
- Cases
- Review
- Economy
- Health

Existing production capability reused conceptually:

- `/admin` main surface;
- proof review;
- KYC admin;
- PromoShare admin;
- Pieces admin;
- featured placements / moderation and other retained admin tools documented by the UI consolidation matrix.

Signature object: **Exception Case / Resolution Record**

Important boundaries:

- Admin opens on intervention rather than telemetry theatre;
- a correction appends audit history rather than deleting source history;
- queued ≠ paid;
- role and permission boundaries remain visible.

## What the review shell is not

Stakeholder Next must not:

- introduce new backend tables merely to make a mockup work;
- create duplicate stakeholder-only truth streams;
- replace production components before the integrated UX is approved;
- imply production data exists where the shell is using illustrative review data;
- claim a state that existing production records cannot support.

## Production convergence sequence

After visual/interaction approval, converge by role and surface rather than replacing entire dashboards at once.

Recommended order:

1. Creator Today + Work
2. Host Today + Live
3. Merchant Today + Verify
4. Brand Today + Evidence
5. Agency Today + Clients
6. Admin Today + Cases
7. remaining secondary surfaces
8. role home/dashboard route recomposition last

For each slice:

1. inspect current component and data source;
2. reuse existing production hooks/services;
3. migrate only the approved layout/object grammar;
4. add the smallest backend change only if the intended UX is impossible with existing truth;
5. validate mobile, empty, error, permission and loading states before route replacement.

## Review questions

For every stakeholder:

- Can the person tell what deserves attention within five seconds?
- Does the main object feel like something produced by real work?
- Is the next action obvious without exposing every tool at once?
- Are important truth boundaries visible?
- Does the interface feel like PROMORANG rather than generic SaaS?
- Does mobile preserve the actual job rather than merely compress desktop?
- Can we map every claimed capability back to an existing production surface or clearly illustrative state?
