# PROMORANG Proof / Receipt / Evidence Family v1

## Thesis

**One truth family. Seven different artifacts.**

The shared semantic chain is:

`SOURCE → CLAIM → VERIFICATION → DECISION → RESIDUE`

The chain is canonical. The interface is not.

Participant, Merchant, Host, Creator, Brand, Agency and Admin must not share one generic evidence dashboard. Each role receives the artifact that matches its job, density and authority.

## Production convergence status

The family has moved beyond review-only expression into production adoption while preserving existing data sources and mutations.

| Lens | Live production expression | Truth source / status |
| --- | --- | --- |
| Participant | Vault → **Kept proof** rendered as `PaperReceipt` | Authenticated `/api/vault` memories only. Demo-memory fallback removed. |
| Merchant | `MerchantScannerStation` → **validation boundary + validation slip** | Existing `useRedeemOffer` mutation, QR/manual validation and fulfillment queue retained. |
| Host | `HostProofReviewPanel` → **proof-close ledger** | Existing pending/history APIs, approve/reject mutation, rejection reason and audit trail retained. |
| Creator | `CreatorProofDossier` in `CreatorDashboardV2` | Composes existing release records, attribution map and earnings ledger; no new evidence backend. |
| Brand | Existing `BrandEvidencePack` | Already connected to authenticated O2O analytics and source-aware evidence. |
| Agency | Existing `AgencyManagedResultPack` | Already connected to client workspaces, campaigns and recorded redemptions. |
| Admin | `AdminAuditTab` → **forensic archive** | Reads the real master-admin audit stream. It deliberately does **not** claim a unified cross-object proof-correction ledger where none exists. |

The review routes remain useful as a design comparison harness. They are not a substitute for the production components above.

## Family expressions

### Participant — receipt / kept proof

Participant sees human-readable proof of what PROMORANG can truthfully say happened.

Primary artifact: `PaperReceipt`

Participant does not need reviewer queues, evidence-strength taxonomies or operator controls. The receipt can record a Moment, place, Scene, arrival and separately validated benefit. It must not infer purchase, spend, fulfillment or value without those records.

Production anchor:

`apps/web/src/pages/Vault.tsx`

The production Vault now renders kept proof only from authenticated retained-memory data. An empty retained history remains empty rather than being populated with illustrative/demo memories.

Review route:

`/participant-next.html#/proof/aftrhrs`

### Merchant — validation slip

Merchant proof begins at a successful redemption/validation write.

Primary artifact: narrow thermal validation slip tied to the real validation write.

Truth boundary:

`VALIDATION ≠ PURCHASE ≠ FULFILLMENT`

Production anchor:

`apps/web/src/components/merchant/MerchantScannerStation.tsx`

The scanner preserves the real redemption mutation, QR/manual validation, duplicate/error non-write behavior and separate fulfillment queue. Successful validation now resolves into a merchant-native validation slip while explicitly leaving purchase and fulfillment unresolved unless separately recorded.

Review route:

`/stakeholder-next.html#/merchant/validation-slip`

### Host — proof close

Host sees a close ledger for submitted proof, verified decisions, rejected claims and open exceptions.

Primary artifact: run-close sheet / proof-close ledger.

Production anchor:

`apps/web/src/components/host/HostProofReviewPanel.tsx`

Existing behavior remains authoritative: pending/history proof retrieval, review mutation, rejection reason and audit trail. Approval is a verification decision. Any memory, reward, Piece or queued payout created downstream remains its own state; queued is not paid.

Review route:

`/stakeholder-next.html#/host/proof-close`

### Creator — proof dossier

Creator needs one dossier that separates release, attribution, verification and value.

Primary artifact: layered studio dossier / evidence folder.

Canonical stages:

`OBSERVED → ATTRIBUTED → VERIFIED → VALUE`

Production anchors:

- `apps/web/src/components/creator/CreatorProofDossier.tsx`
- `apps/web/src/components/creator/CreatorReleaseWorkspaceBridge.tsx`
- `apps/web/src/components/creator/CreatorAttributionMap.tsx`
- `apps/web/src/components/creator/CreatorEarningsVault.tsx`
- `apps/web/src/components/dashboards/CreatorDashboardV2.tsx`

The live dossier composes those existing capabilities rather than creating a synthetic performance model. Publishing proves a release exists. It does not prove attribution, verification, approval or settlement. Pending, approved, settled and reversed earnings remain distinct.

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

Admin needs authoritative source history and corrections to remain separately inspectable.

Primary artifact: forensic archive.

Canonical rule:

**Corrections append. Originals remain.**

Production anchors:

- `apps/web/src/components/admin/AdminAuditTab.tsx`
- `GET /api/admin/audit`
- `public.admin_audit_log`

The current production source is a real immutable administrative audit stream containing actor, action, target, reason, metadata and timestamp. Object-specific systems can retain richer review/reversal history separately. PROMORANG does not yet have one canonical cross-object correction source spanning all proof families, so the Admin artifact explicitly states that boundary instead of manufacturing parity.

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
- Admin: forensic archive / correction record

The persistent PROMORANG operator shell provides continuity. Artifact geometry, material, density and authority provide role personality.

## Production adoption sequence

Completed or already present:

1. Reviewed all seven family expressions together.
2. Preserved the canonical truth gates and role-specific artifact language.
3. Migrated Merchant treatment into real validation/fulfillment surfaces.
4. Migrated Host treatment into the real proof review flow without changing API semantics.
5. Recomposed Creator proof around real release, attribution and earnings capability.
6. Confirmed Brand and Agency already use real evidence/result components and retained their data sources.
7. Connected Participant kept proof to authenticated Vault history and removed illustrative fallback memories.
8. Recomposed Admin audit history into a forensic archive while explicitly preserving the current source limitation.

Remaining family-level backend/product gap:

- A unified append-only correction/dispute source spanning every canonical proof family does not yet exist. Do not invent one merely for visual parity. Introduce it only when a concrete correction workflow cannot be represented by the existing authoritative sources.

Next design/product family after this production slice is accepted:

- Discovery + Scene market-construction convergence
- then Piece + Vault + PromoShare + Save & Win + retained value/history

## Backend rule

No new proof/evidence architecture is justified by this design programme unless an existing production capability is conclusively unable to represent the intended truthful state. Reuse capability; replace weak presentation.