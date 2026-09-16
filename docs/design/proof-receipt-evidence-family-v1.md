# PROMORANG Proof / Receipt / Evidence Family v1

## Thesis

**One truth family. Seven different artifacts.**

The shared semantic chain is:

`SOURCE → CLAIM → VERIFICATION → DECISION → RESIDUE`

The chain is canonical. The interface is not.

Participant, Merchant, Host, Creator, Brand, Agency and Admin must not share one generic evidence dashboard. Each role receives the artifact that matches its job, density and authority.

## Family expressions

### Participant — receipt / kept proof

Participant sees human-readable proof of what PROMORANG can truthfully say happened.

Primary artifact: `PaperReceipt`

Participant does not need reviewer queues, evidence-strength taxonomies or operator controls. The receipt can record a Moment, place, Scene, arrival and separately validated benefit. It must not infer purchase, spend, fulfillment or value without those records.

Review route:

`/participant-next.html#/proof/aftrhrs`

### Merchant — validation slip

Merchant proof begins at a successful redemption/validation write.

Primary artifact: narrow thermal validation slip tied to OfferIssuance and place.

Truth boundary:

`VALIDATION ≠ PURCHASE ≠ FULFILLMENT`

Production anchor:

`apps/web/src/components/merchant/MerchantScannerStation.tsx`

The existing scanner uses the real redemption mutation. The review should converge onto that capability rather than introduce a replacement validation backend.

Review route:

`/stakeholder-next.html#/merchant/validation-slip`

### Host — proof close

Host sees a close ledger for submitted proof, verified arrivals, rejected claims and open exceptions.

Primary artifact: run-close sheet / proof-close ledger.

Production anchor:

`apps/web/src/components/host/HostProofReviewPanel.tsx`

Existing behavior includes pending/history proof retrieval and review mutation. Approval and rejection remain explicit decisions. Rejection reasons stay in history; arrival truth is not erased by later proof decisions.

Review route:

`/stakeholder-next.html#/host/proof-close`

### Creator — proof dossier

Creator needs one dossier that separates release, attribution, verification and value.

Primary artifact: layered studio dossier / evidence folder.

Canonical stages:

`OBSERVED → ATTRIBUTED → VERIFIED → VALUE`

Production anchor:

`apps/web/src/components/creator/CreatorReleaseWorkspaceBridge.tsx`

Publishing proves a release exists. It does not prove attribution, approval or settlement. An approved proof state must never be presented as paid unless a settlement record exists.

Review route:

`/stakeholder-next.html#/creator/proof-dossier`

### Brand — evidence pack

Brand needs a source-distinct evidence pack for decisions.

Primary artifact: activation fieldbook / evidence binder.

Production anchor:

`apps/web/src/components/brand/BrandEvidencePack.tsx`

The real surface already combines authenticated O2O analytics and intelligence and refuses unsupported modeled ROI, projected footfall or yield. The canonical expression preserves that discipline.

Review route:

`/stakeholder-next.html#/brand/evidence-pack`

### Agency — managed result pack

Agency needs a client folio that packages results and recommendations without taking ownership of client truth.

Primary artifact: tabbed client result folio + recommendation slip.

Production anchor:

`apps/web/src/components/agency/AgencyManagedResultPack.tsx`

Agency can operate, package and recommend. The client owns the decision and underlying result. When an agency-side venue projection does not exist, the UX must hand off to Merchant rather than fabricate zeros or false completeness.

Review route:

`/stakeholder-next.html#/agency/result-pack`

### Admin — source / correction archive

Admin needs the authoritative source record, dispute evidence and any correction to remain separately inspectable.

Primary artifact: forensic source file + appended correction record.

Canonical rule:

**Corrections append. Originals remain.**

Review route:

`/stakeholder-next.html#/admin/archive`

## Truth gates

The family must never silently collapse these boundaries:

- RSVP intent into attendance
- claim into verification
- validation into purchase
- purchase into fulfillment
- submission into approval
- approval into settlement
- queued payout into paid payout
- evidence into ROI or incrementality without supporting records
- correction into deletion of the original source

## Visual divergence

Shared semantics must not create visual sameness.

- Participant: personal, emotional, collectible receipt / kept trail
- Merchant: counter output / thermal slip
- Host: backstage close sheet / ledger
- Creator: layered studio dossier
- Brand: fieldbook / evidence binder
- Agency: client folio / recommendation insert
- Admin: forensic archive / correction slip

The persistent PROMORANG operator shell provides continuity. Artifact geometry, material, density and authority provide role personality.

## Production migration sequence

1. Review all seven family expressions together.
2. Preserve the canonical truth gates and approved artifact language.
3. Migrate Merchant treatment into the real `MerchantScannerStation` and fulfillment surfaces.
4. Migrate Host treatment into `HostProofReviewPanel` without changing its real review API semantics.
5. Recompose Creator proof around real release/O2O/earnings data; do not revive mock Studio metrics.
6. Refine the existing Brand `BrandEvidencePack` and Agency `AgencyManagedResultPack` rather than replacing their data sources.
7. Connect Participant kept proof into Moment/Vault history using real receipt/proof records.
8. Recompose Admin case/review/archive surfaces around existing source records and append-only correction truth.

## Backend rule

No new proof/evidence architecture is justified by this design programme unless an existing production capability is conclusively unable to represent the intended truthful state. Reuse capability; replace weak presentation.
