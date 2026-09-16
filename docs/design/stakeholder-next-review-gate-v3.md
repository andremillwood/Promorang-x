# PROMORANG Stakeholder Next — Current vs Next review gate v3

## Purpose

Participant Next is the quality benchmark for the wider PROMORANG product. Stakeholder Next should reach the same level of clarity, world coherence, object identity and interaction discipline without cloning Participant layouts.

This gate prevents two opposite mistakes:

1. preserving old dashboard UI merely because it exists;
2. rebuilding capability merely because one presentation of it is weak.

> **Reuse capability. Redesign the interface when the current presentation belongs to the old dashboard model.**

Use the paired review surfaces:

- `/stakeholder-next.html#/creator/today` — redesigned illustrative Next experience
- `/stakeholder-current.html#/creator` — authenticated current-product reference

Repeat for creator, host, merchant, brand, agency and admin.

## Classification vocabulary

- **KEEP** — already meets the new standard with little change.
- **REFINE** — sound structure/capability; improve hierarchy, language, states or responsive behavior.
- **RECOMPOSE** — useful capability exists across one or more surfaces but needs a new work-object flow.
- **REPLACE UI** — retain hooks/services/mutations and replace the interface model.
- **RETIRE SURFACE** — another existing surface already represents the capability more truthfully; remove the weaker duplicate from the role experience.
- **PRODUCT GAP** — the stakeholder job genuinely cannot be completed with existing capability.

## Migration gates

A Next surface must pass job clarity, object identity, functional parity, truth parity, loading/empty/error/blocked states, responsive fit, accessibility, context ownership and action-consequence review before replacing a production route.

## Creator

### Today — RECOMPOSE
Use real submission, opportunity, attribution and value states to create the current Brief + attention queue. No illustrative counters in production.

### Work — REPLACE UI / partial projection gap
`CreatorMissionsHub` is hard-coded illustrative bounty data. Sponsored content↔Moment links, mission attribution and creator revenue-share structures do exist, so the product does not need a second mission ontology. What is missing is a reliable opportunity projection that turns those records into eligibility, terms, proof requirements, deadline and acceptance state.

Next object: **Opportunity Desk + Creator Brief**.

### Create — REPLACE UI
`CreatorStudioConsole` is also hard-coded: story titles, views, conversions/“footfalls” and bounty values are illustrative. Preserve the real content/proof submission paths and rebuild the interface as a **Production Room + Submission Folder**.

### Proof — RECOMPOSE
Reuse mission attribution, proof review and O2O analytics. Preserve observed → attributed → verified. Approval does not imply settlement.

### Value — RECOMPOSE
Reuse creator earnings/reputation records. Never display “paid” unless an actual payment boundary exists.

## Host

### Today — RECOMPOSE
Use hosted Moments, proof queue, arrival state and sponsor obligations to produce a real Run Sheet + attention queue.

### Moments — REFINE / RECOMPOSE
Reuse Moment create/edit/staging capability and present it as **Moment Files + Run Sheet**.

### Live — RETIRE SURFACE + REFINE EXISTING CAPABILITY
Do **not** build another host arrival system.

The current dashboard `HostLivePulseConsole` should be retired from the primary role experience because it renders hard-coded attendee names, occupancy and “vibe” values.

However, `HostGuestOperations` already owns the important real capability:

- real Moment context;
- reservation summary;
- pass-code check-in mutation;
- already-checked-in feedback;
- searchable guest manifest;
- delivery failure visibility/retry;
- loading/error states;
- 30-second refresh.

Next object: **Door Board / Arrival Control Room**.

Treatment of `HostGuestOperations`: **REFINE / PROMOTE INTO HOST NEXT**.

Needed refinement: align its visual hierarchy/object language with Host Next, expose operator identity/offline state where available, and reconcile registered participant arrivals with guest-pass operations without collapsing RSVP into attendance.

### Proof — REFINE / RECOMPOSE
Reuse the real proof review APIs. Preserve pending/rejected/approved states, required reasons and per-record write state.

### Results — RECOMPOSE
Keep RSVP demand, verified attendance and returning audience distinct.

## Merchant / Venue

### Today — RECOMPOSE
Compose offers, validation, orders and place context into a Counter Brief.

### Offers — RECOMPOSE
Reuse current product/offer management and redesign the commercial object presentation.

### Verify — REFINE / RECOMPOSE
Do **not** replace `MerchantScannerStation` wholesale. It already uses:

- the real redemption mutation;
- QR scanning;
- manual code entry;
- pending/error handling;
- a durable `PromorangValidReceipt`;
- fulfillment queue linkage.

Next object: **Validation Device + Validation Slip**.

Refinement needs: stronger instrument framing, last-confirmed receipt persistence, duplicate/invalid/offline treatment and explicit language that validation ≠ purchase.

### Orders — RECOMPOSE
Reuse commerce orders/receipts. Payment, fulfillment, refund and cancellation remain separate.

### Places — RECOMPOSE
Reuse venue records, Moments and place activity; redesign as a Place Record.

## Brand

### Today — RECOMPOSE
Activation Dossier + attention using real campaign/evidence state.

### Activations — RECOMPOSE
Reuse campaign creation/data; reorganize around outcome → execution rather than dashboard tabs.

### People — RECOMPOSE
Reuse creator/host/place relationships and present them as a Delivery Network.

### Evidence — RECOMPOSE
Bring correlation/intelligence/results into an **Evidence Pack**. Observed, attributed, verified and unresolved must remain visibly different.

### Decisions — UX/PRODUCT GAP CANDIDATE
Stop / Change / Scale is the desired Next object. Confirm whether a durable decision record already exists before creating backend scope.

## Agency

### Today — REFINE / RECOMPOSE
Portfolio attention from real relationship, client-work and proof-readiness states.

### Clients — RECOMPOSE
Reuse agency relationships and active organization context. Client ownership and agency operator context remain explicit.

### Work — RECOMPOSE
Reuse client workspace switching and activation controls as Managed Work.

### Proof — RECOMPOSE
Reuse client impact/results as a Managed Result Pack.

### Growth — UX GAP CANDIDATE
Confirm existing proposal/follow-up capability before adding product scope for Expansion Briefs.

## Admin

### Today — RECOMPOSE
Priority Queue from existing subsystem queues.

### Cases — RECOMPOSE
Aggregate existing support/proof/KYC/moderation/payout records into Exception Cases without creating a generic mutation path that bypasses domain truth.

### Review — RECOMPOSE
Reuse proof, KYC and moderation surfaces as role-specific Review Desks.

### Economy — RECOMPOSE
Reuse payouts/commerce/dispute tools as a Settlement Exception Ledger.

### Health — REFINE / RECOMPOSE
Reuse diagnostics/audit surfaces as operational health and traceability.

## Updated migration sequence

1. **Host Live:** promote/refine `HostGuestOperations`; retire `HostLivePulseConsole` from the primary Host experience.
2. **Merchant Verify:** refine/recompose `MerchantScannerStation`; do not rebuild its scanner/mutation/receipt logic.
3. **Creator Create:** replace the hard-coded `CreatorStudioConsole` with a real Production Room using existing content/proof writes.
4. **Creator Work:** replace the hard-coded bounty board with a real opportunity projection over existing mission/content/Moment structures.
5. **Host Proof:** refine/recompose proof close.
6. **Creator Proof/Value:** Proof Dossier + Value Ledger.
7. **Merchant Orders:** Order Board.
8. **Brand Evidence:** Evidence Pack.
9. **Agency Clients/Proof:** Client Ledger + Managed Result Pack.
10. **Admin Cases/Economy:** Exception Case + Settlement Exception Ledger.
11. Recompose role Today/home surfaces only after their core work objects are proven.

## Review outcome vocabulary

For every destination record one of:

- Approved for live adapter
- Existing capability should be promoted/refined
- Existing surface should be retired
- Needs visual revision
- Needs interaction/state revision
- Existing capability not yet mapped
- Product gap confirmed

A production route should not be replaced until the destination has an explicit outcome and passes the migration gates above.
