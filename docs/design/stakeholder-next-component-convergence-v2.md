# PROMORANG Stakeholder Next — Component Convergence v2

Status: active review contract

## Principle

Participant Next is the quality benchmark for product coherence. Other stakeholder experiences do not need to copy its layout, but they must reach the same level of consideration: clear job, one current move, strong object identity, meaningful state, truthful evidence, responsive behavior and unmistakable PROMORANG character.

The rule is:

> Reuse capability. Redesign interface whenever the existing interface belongs to the old dashboard model.

Underlying APIs, hooks and services remain the preferred capability source. A backend/product change is justified only when the approved UX requires a state or action the existing domain genuinely cannot represent.

## Classification

- **KEEP** — aligned enough to reuse substantially as-is.
- **REFINE** — good structure; needs visual, hierarchy or interaction refinement.
- **RECOMPOSE** — reuse data/actions but reorganize around the stakeholder job and object model.
- **REPLACE UI** — preserve underlying hooks/services, replace the old dashboard-era UI.
- **PRODUCT GAP** — capability genuinely absent; only then consider product/backend work.

## Creator Next

| Next destination | Existing capability | Treatment | New product expression |
| --- | --- | --- | --- |
| Today | Creator dashboard + mission state | REPLACE UI | Attention queue + active brief + current move |
| Work | `CreatorMissionsHub`, Discovery demand | RECOMPOSE | Opportunity desk + Creator Brief objects |
| Create | `CreatorStudioConsole` | REPLACE UI | Production workspace + deliverable tray + submission folder |
| Proof | `CreatorAttributionMap`, proof state | RECOMPOSE | Proof dossier + action chain + approval residue |
| Value | `CreatorEarningsVault`, `CreatorReputationDeck` | RECOMPOSE | Value ledger + settlement boundary + proven-work history |

Key redesign: Mission cards should become believable Brief/Opportunity objects. Submission should visibly move through draft → submitted → revision → approved without relying on a generic status pill.

## Host Next

| Next destination | Existing capability | Treatment | New product expression |
| --- | --- | --- | --- |
| Today | Host dashboard/current Moments | REPLACE UI | Run-of-day + current Moment + attention |
| Moments | `HostMomentsStagingConsole` | RECOMPOSE | Run Sheet / Moment file |
| Live | `HostLivePulseConsole`, guest operations | REPLACE UI | Door Board + Arrival Ledger + exception rail |
| Proof | `HostProofReviewConsole` | RECOMPOSE | Proof Close desk + review stack |
| Results | `HostImpactYieldConsole` | RECOMPOSE | Attendance close + return audience + next decision |

Key redesign: live operation must feel like a real door/room instrument, not analytics. RSVP intent, arrival, proof and attendance remain visibly different.

## Merchant / Venue Next

| Next destination | Existing capability | Treatment | New product expression |
| --- | --- | --- | --- |
| Today | Merchant dashboard | REPLACE UI | Counter brief + live commercial attention |
| Offers | `MerchantStorefrontConsole` | RECOMPOSE | Offer stock / publishable commercial artifacts |
| Verify | `MerchantScannerStation` | REPLACE UI | Validation instrument + durable Validation Slip |
| Orders | `MerchantOrdersHub` | RECOMPOSE | Paid-order / fulfillment objects |
| Places | `MerchantVenueStudio`, venue hooks | RECOMPOSE | Place record + active activity + repeat audience |

Key redesign: validation should feel like an instrument. Claim, validation, paid transaction and fulfillment remain separate states.

## Brand Next

| Next destination | Existing capability | Treatment | New product expression |
| --- | --- | --- | --- |
| Today | Brand dashboard / brand stats | REPLACE UI | Decision desk + outcome/current move |
| Activations | `BrandCampaignFlightDeck`, demand | RECOMPOSE | Activation Dossier |
| People | `BrandCreatorBureau`, hosts/places | RECOMPOSE | Delivery network / responsibility map |
| Evidence | `BrandCorrelationMap`, intelligence | REPLACE UI | Evidence Pack with observed/attributed/verified separation |
| Decisions | campaign/intelligence state | RECOMPOSE | Stop / change / scale decision record |

Key redesign: the Brand experience should feel like commissioning and judging customer movement, not operating a media dashboard.

## Agency Next

| Next destination | Existing capability | Treatment | New product expression |
| --- | --- | --- | --- |
| Today | `AgencyDashboard` attention | RECOMPOSE | Portfolio attention queue |
| Clients | agency relationships/context switch | REFINE | Client Ledger + explicit ownership/context |
| Work | client activations | RECOMPOSE | Managed work board with approval blockers |
| Proof | `BrandImpactDashboard` + client results | REPLACE UI | Managed Result Pack |
| Growth | result/proposal implications | RECOMPOSE | Expansion brief + next proposal |

Key redesign: every object must make the client owner and agency operator explicit. Agency context must never overwrite client truth.

## Admin Next

| Next destination | Existing capability | Treatment | New product expression |
| --- | --- | --- | --- |
| Today | `AdminDashboard` | REPLACE UI | Priority attention queue |
| Cases | support/admin exception surfaces | RECOMPOSE | Exception Case files |
| Review | Proof/KYC/moderation admin | RECOMPOSE | Evidence review desk |
| Economy | payout/economy admin | RECOMPOSE | Settlement exception ledger |
| Health | audit/system surfaces | RECOMPOSE | Operational health + audit traces |

Key redesign: admin navigation should be organized around exceptions and decisions, not internal subsystem names. Technical detail remains progressively disclosed.

## Shared components to redesign once, then reuse

1. **Attention item** — action-required work, not a notification.
2. **Identity/context strip** — person, organization, client/place and acting role.
3. **Lifecycle rail** — semantic step progression with non-color state cues.
4. **Evidence marker** — observed / attributed / verified / unresolved.
5. **Decision record** — approve/revise, validate/reject, stop/change/scale, resolve/escalate.
6. **Audit residue** — actor, time, source and consequence.
7. **Value boundary** — attributed / approved / queued / paid are never collapsed.
8. **Empty/cold-start state** — useful next move without fake activity.

## Visual convergence rules

- Do not use the same 3-card grid for every destination.
- Do not differentiate roles by accent color alone.
- One expressive serif moment per viewport is enough; operational work can be quieter and denser.
- Objects should have believable internal structure: serial, issuer/owner, state, time, proof, consequence where relevant.
- Dashboard KPIs should only appear when they support a decision.
- Use tables only where comparison or operational scanning genuinely benefits from rows/columns.
- Mobile should preserve the decision/action hierarchy, not shrink desktop.

## Production convergence gate

A Next surface can replace a production component only after:

1. existing hooks/services have been mapped;
2. loading/empty/error/offline states are accounted for;
3. role/context permissions are explicit;
4. truth boundaries are preserved;
5. keyboard/focus and responsive behavior pass review;
6. the redesigned component offers at least equal functional coverage;
7. any PRODUCT GAP is separately approved rather than smuggled into UI work.
