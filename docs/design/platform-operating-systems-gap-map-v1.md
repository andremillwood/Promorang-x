# PROMORANG Platform Operating Systems Gap Map v1

Status: Design / product architecture backlog

## Purpose

The Design Lab now covers participant objects, economy systems, stakeholder work objects, lifecycle states, cross-role proof, resilience, and canonical event architecture. This document captures the platform systems still required so the product does not mature visually while remaining operationally incomplete.

## Priority model

### P0 — foundation before broad production convergence

#### Multi-role identity + organization graph
One person may operate as participant, creator, host, merchant staff, brand staff, agency operator, and admin.

Required:
- explicit active context
- organization membership and role grants
- seat/invite lifecycle
- delegation
- temporary staff access
- context switching without data leakage
- clear ownership vs management

#### Universal attention/inbox system
Notifications are not enough.

Need one actionable queue for:
- creator revision
- host door exception
- merchant validation conflict
- expiring PromoKey
- draw closing/result
- brand approval
- agency client blocker
- settlement issue
- admin escalation

Each attention item references a canonical object/event and has urgency, owner, due time, and resolution state.

#### Event contract + semantic metrics
Defined in `canonical-object-event-architecture-v1.md`.

Must distinguish observed / attributed / verified / incremental outcomes.

#### Reversal / dispute / correction architecture
Every irreversible-looking state needs a correction path.

Examples:
- reverse redemption
- reopen proof
- revoke access
- cancel Moment
- reschedule draw
- return Gems
- invalidate duplicate ticket
- withdraw Piece listing
- correct attendance
- reverse settlement where permitted

#### Economy constitution + ledger boundaries
Separate ledgers for Gems, Points, Tickets, benefits/access, Pieces, principal reservations, prize commitments, and payouts.

Need explicit issuance, expiry, transferability, reversal, liability and reconciliation rules.

#### Permissions and organization policy
Actions require explicit capability rather than only role labels.

Examples:
- `offer.publish`
- `offer.validate`
- `moment.checkin`
- `proof.approve`
- `creator.settle`
- `campaign.fund`
- `campaign.publish`
- `admin.override`

### P1 — required for reliable market operation

#### Fraud / abuse / anomaly layer
Threat models:
- self-referral
- collusive merchant validation
- duplicate scans
- fabricated creator proof
- fake attendance
- ticket farming
- multiple-account farming
- Piece wash trading / fake liquidity
- agency permission abuse
- compromised staff accounts

Need risk flags, rate limits, evidence requirements, hold/review states, and appeal flows.

#### Search / command / object navigation
Global search should understand object types and active role context.

Search targets:
- people
- organizations
- places
- Moments/Experiences
- offers
- Pieces
- draws
- briefs
- campaigns
- cases

Operational roles also need command-style navigation to actions, not only content.

#### Notification policy
Channels: in-app, push, email, WhatsApp/SMS where consented.

Classes:
- informational
- action required
- expiring
- live operational
- financial/value
- security
- system/service

Avoid duplicate cross-channel noise. Respect quiet hours, urgency and user control.

#### Content / moderation / appeals
For Moments, Discovery, creator content, offers, communities and profiles.

Need:
- report
- hide/restrict
- moderation state
- appeal
- restoration
- provenance of moderation action

#### Device + offline operating model
Particularly for Host and Merchant.

Need:
- poor connectivity
- camera denial
- QR scanner failure
- shared device
- battery interruption
- stale data
- queued write
- server reconciliation
- offline-safe read model

#### Stakeholder-specific onboarding
First success differs by role.

Participant: use/keep one valuable thing.
Creator: accept and complete one brief.
Host: publish and verify one attendee.
Merchant: publish one offer and validate one use.
Brand: launch one outcome contract and receive evidence.
Agency: manage one client approval/result cycle.
Admin: resolve one case with audit residue.

### P2 — scale / defensibility

#### Relationship / CRM graph
Permissioned customer relationship history for organizations.

Need consent, earned relationship scope, suppression, frequency/recency, cohorts, return journeys and next-best-action.

#### Recommendation / opportunity index
Unified ranking across Moments, places, offers, Pieces, polls, communities and content.

Must disclose sponsored placement and balance user utility with marketplace health.

#### Localization / cultural portability
Separate PROMORANG core grammar from configurable local culture.

Need:
- locale/date/currency
- address formats
- language
- regional content patterns
- regulatory feature flags
- cultural art packs / Scene skins without changing object truth

#### Experiment / feature-flag governance
Economy and ranking changes require versioning and rollback.

Need:
- feature flags
- experiment assignment
- configuration history
- reward-rule version
- draw-rule version
- auditability

#### Data export / exit / portability
Define what happens to:
- participant history
- Pieces
- Gems
- proof
- creator performance
- brand evidence
- organization records
- shared audit history

Personal deletion must not erase business/audit records that lawfully need to persist; views may instead anonymize or detach identity where appropriate.

## Cold-start design gate

Every major product destination must be reviewed under sparse-network conditions.

Examples:
- only 3 worthwhile offers
- no active Piece listings
- one upcoming Moment
- no current PromoShare draw
- new participant with zero history
- new merchant with zero redemptions
- brand with no previous campaigns

Do not fill empty states with fabricated network density.

## Marketplace liquidity gate

Piece Marketplace must support honest low-liquidity states:
- no ask
- stale listing
- sold/unavailable
- no recent comparable transfers
- unknown market depth
- utility expired

Ask price != market value.

## Compliance boundary map

Before broad release, obtain jurisdiction-specific review for mechanics involving:
- named promotional draws
- Save & Win
- internal spendable value
- transferable collectibles
- marketplace fees
- prize funding
- cash-like settlement
- creator/affiliate compensation

The UI should preserve semantic distinctions so compliance changes can disable or constrain one mechanic without collapsing the entire product model.

## Measurement of user success

Participant:
- useful action completed
- value used
- return rate
- incentive-independent retention

Creator:
- approved work
- settlement predictability
- attributable outcome history
- repeat partnerships

Host:
- verified attendance
- exception rate
- proof close time
- return audience

Merchant:
- verified redemptions
- verified transactions where available
- repeat visits
- incremental demand where methodologically supported

Brand:
- verified outcome vs target
- evidence confidence
- cost per verified/incremental outcome
- decision/repeat rate

Agency:
- client approval cycle time
- managed verified outcomes
- result-pack quality/completeness
- client expansion/retention

Admin:
- time to resolve
- reopen rate
- unresolved aging
- audit completeness

## Design programme consequence

The next Design Lab additions should focus on platform systems, not more visual styling:

1. Multi-role / organization context study
2. Attention / inbox study
3. Reversal / dispute study
4. Permission / delegation study
5. Fraud-risk / hold / appeal study
6. Cold-start / sparse-network study
7. Offline/shared-device operational study
8. Search / command study

These should reuse the existing object grammar rather than create new decorative systems.
