# PROMORANG Stakeholder Next — Current vs Next review gate v3

## Purpose

Participant Next is the quality benchmark for the wider PROMORANG product. Stakeholder Next should reach the same level of clarity, world coherence, object identity and interaction discipline without cloning Participant layouts.

This gate exists to prevent two opposite mistakes:

1. preserving old dashboard UI merely because it already exists;
2. rebuilding underlying capability merely because the old UI is weak.

The operating rule is:

> Reuse capability. Redesign interface whenever the current presentation belongs to the old dashboard model.

Use the review pair:

- `/stakeholder-next.html#/creator/today` — redesigned illustrative Next experience
- `/stakeholder-current.html#/creator` — authenticated current product reference

Repeat for creator, host, merchant, brand, agency and admin.

## Classification vocabulary

- **KEEP** — current component already meets the new standard and can be reused with little change.
- **REFINE** — current structure is sound; improve hierarchy, language, states or responsive behavior.
- **RECOMPOSE** — useful capabilities/data exist, but multiple existing components must become a new work-object flow.
- **REPLACE UI** — retain hooks/services/mutations, replace the interface because the component model itself belongs to the old dashboard era.
- **PRODUCT GAP** — the user job cannot be completed truthfully with existing capability. Only this classification permits new product/backend scope.

## Cross-role review gates

A surface cannot migrate merely because the Next version looks better. It must pass all of these:

1. **Job clarity** — a first-time stakeholder can tell what they should do next without understanding PROMORANG internals.
2. **Object identity** — the main work object is immediately recognizable and distinct from other stakeholder objects.
3. **Functional parity** — no useful production capability disappears during redesign.
4. **Truth parity or improvement** — the Next UI must not strengthen claims beyond source data.
5. **State completeness** — loading, empty, blocked, failure, revision, success and historical residue are accounted for.
6. **Responsive fit** — mobile operating context is designed, not shrunk desktop.
7. **Accessibility** — keyboard focus, semantic controls, non-color state cues, readable metadata and reduced motion.
8. **Context ownership** — actor, client, organization, venue or Moment context is explicit where actions could affect another stakeholder.
9. **Action consequence** — irreversible or consequential actions explain what changes.
10. **PROMORANG coherence** — it belongs to the same product world as Participant Next without becoming a cosmetic clone.

## Creator

### Today
Current source: `CreatorDashboardV2` summary + mission/studio/attribution/economics signals.
Next object: current brief + attention queue.
Treatment: **RECOMPOSE**.
Migration proof: attention items must come from actual submission/opportunity/economic states rather than illustrative counters.

### Work
Current source: `CreatorMissionsHub`, sponsored content/Moment links, mission attribution and creator revenue-share rules.
Next object: Opportunity Desk + Creator Brief.
Treatment: **REPLACE UI / partial PRODUCT GAP**.
Reason: current mission board is hard-coded illustrative bounty data. Underlying mission/attribution structures exist, but a reliable real opportunity projection is not yet the source of the current board.
Migration proof: real opportunity feed, eligibility, reward terms, proof requirements, deadline and acceptance state.

### Create
Current source: `CreatorStudioConsole` and existing content/proof submission paths.
Next object: Production Room + Submission Folder.
Treatment: **REPLACE UI**.
Migration proof: drafts, deliverables, links, requirements, revision requests, resubmission and upload failure all map to existing writes.

### Proof
Current source: `CreatorAttributionMap`, mission attribution, proof review and O2O analytics.
Next object: Proof Dossier.
Treatment: **RECOMPOSE**.
Migration proof: observed → attributed → verified states remain separate; approval does not imply settlement.

### Value
Current source: `CreatorEarningsVault`, `CreatorReputationDeck`, creator earnings ledger.
Next object: Value Ledger + reputation residue.
Treatment: **RECOMPOSE**.
Migration proof: pending/attributed/approved/settled language must match the real economic state. Never display paid unless the payment boundary exists.

## Host

### Today
Current source: hosted Moments, live arrival state, proof queue and sponsorship obligations.
Next object: Run Sheet + operational attention.
Treatment: **RECOMPOSE**.

### Moments
Current source: `HostMomentsStagingConsole`, Moment create/edit routes.
Next object: Moment Files + Run Sheet.
Treatment: **REFINE / RECOMPOSE**.

### Live
Current source: `HostLivePulseConsole`, `moment_participants.checked_in_at`, guest RSVP/check-in routes, hosted Moments.
Next object: Door Board + Arrival/Exception instrument.
Treatment: **REPLACE UI**.
Reason: authoritative arrival data exists, while the old component still renders hard-coded attendees/occupancy/vibe values.
Migration proof: selected Moment, RSVP intent, checked-in rows, guest check-ins, duplicate/mismatch handling, offline state and operator identity.

### Proof
Current source: `HostProofReviewConsole` and real proof review APIs.
Next object: Proof Close.
Treatment: **REFINE / RECOMPOSE**.
Migration proof: pending/rejected/approved decisions, reason capture, per-record write state and history.

### Results
Current source: `HostImpactYieldConsole`, checked-in participation and return calculations.
Next object: Attendance Close + Next Decision.
Treatment: **RECOMPOSE**.
Migration proof: RSVP demand, verified attendance and return audience remain distinct.

## Merchant / Venue

### Today
Current source: offers, scanner/validation state, orders, venue context.
Next object: Counter Brief.
Treatment: **RECOMPOSE**.

### Offers
Current source: `MerchantStorefrontConsole` and product/offer management.
Next object: Offer Stock / commercial object.
Treatment: **RECOMPOSE**.

### Verify
Current source: `MerchantScannerStation` and redemption mutation.
Next object: Validation Device + Validation Slip.
Treatment: **REPLACE UI**.
Migration proof: code/manual entry, checking, invalid, duplicate, confirmed receipt and offline behavior; validation must not imply purchase.

### Orders
Current source: `MerchantOrdersHub`, commerce orders/receipts.
Next object: Order Board.
Treatment: **RECOMPOSE**.
Migration proof: payment, fulfillment, refund and cancellation remain separate.

### Places
Current source: `MerchantVenueStudio`, venue records, hosted Moments and activity.
Next object: Place Record.
Treatment: **RECOMPOSE**.

## Brand

### Today
Current source: brand campaign state, demand, approvals and evidence summaries.
Next object: Activation Dossier + attention.
Treatment: **RECOMPOSE**.

### Activations
Current source: `BrandCampaignFlightDeck`, campaign creation and campaign data.
Next object: Activation Dossier.
Treatment: **RECOMPOSE / REPLACE UI** depending on final interaction audit.

### People
Current source: `BrandCreatorBureau`, Moment/venue relationships and creator links.
Next object: Delivery Network.
Treatment: **RECOMPOSE**.

### Evidence
Current source: `BrandCorrelationMap`, `BrandIntelligenceConsole`, campaign results.
Next object: Evidence Pack.
Treatment: **RECOMPOSE**.
Migration proof: observed/attributed/verified/unresolved are not collapsed into one success metric.

### Decisions
Current source: currently distributed across campaign controls and analytics.
Next object: Stop / Change / Scale decision record.
Treatment: **PRODUCT/UX GAP candidate**.
Migration proof: determine whether a durable decision object/state already exists before adding backend scope.

## Agency

### Today
Current source: relationship requests, client campaigns and impact readiness.
Next object: Portfolio Attention.
Treatment: **REFINE / RECOMPOSE**.

### Clients
Current source: `AgencyDashboard`, agency relationships, active organization context.
Next object: Client Ledger.
Treatment: **RECOMPOSE**.
Migration proof: client ownership, agency operator context and permission boundary remain explicit.

### Work
Current source: client workspace switching + activation controls.
Next object: Managed Work Board.
Treatment: **RECOMPOSE**.

### Proof
Current source: `BrandImpactDashboard` and client campaign results.
Next object: Managed Result Pack.
Treatment: **RECOMPOSE**.

### Growth
Current source: no single canonical expansion workflow found in the current dashboard.
Next object: Expansion Brief.
Treatment: **UX GAP candidate**; do not create backend scope until existing proposal/follow-up capability is fully checked.

## Admin

### Today
Current source: existing Admin dashboard and subsystem queues.
Next object: Priority Queue.
Treatment: **RECOMPOSE**.

### Cases
Current source: support, proof, KYC, moderation, payout and subsystem-specific admin records.
Next object: Exception Case + Resolution Record.
Treatment: **RECOMPOSE**.
Migration proof: case UI may aggregate existing records but must not invent a generic mutation path that bypasses authoritative domain state.

### Review
Current source: proof, KYC and moderation admin surfaces.
Next object: Review Desks.
Treatment: **RECOMPOSE**.

### Economy
Current source: payouts, queues, commerce and dispute/admin tools.
Next object: Settlement Exception Ledger.
Treatment: **RECOMPOSE**.

### Health
Current source: diagnostics/audit/admin monitoring surfaces.
Next object: Operational Health + audit trace.
Treatment: **REFINE / RECOMPOSE**.

## Recommended migration sequence

Do not migrate all role homes first. Prove the most operational objects first:

1. Host Live → Door Board
2. Merchant Verify → Validation Device + Slip
3. Creator Create → Production Room + Submission Folder
4. Host Proof → Proof Close
5. Creator Proof/Value → Proof Dossier + Value Ledger
6. Merchant Orders → Order Board
7. Brand Evidence → Evidence Pack
8. Agency Clients/Proof → Client Ledger + Managed Result Pack
9. Admin Cases/Economy → Exception Case + Settlement Exception Ledger
10. Only then recompose each role Today/home around proven objects.

## Review outcome

For each destination, record one of:

- Approved for live adapter
- Needs visual revision
- Needs interaction/state revision
- Existing capability not yet mapped
- Product gap confirmed

A production route should not be replaced until the destination has an explicit review outcome and passes the gates above.
