# PROMORANG Job-First Platform Audit — 2026-09-14

**Status:** Active implementation audit  
**Canonical standard:** `docs/design/promorang-job-first-workspace-standard.md`  
**Scope:** Primary role homes, managed workspaces, admin, Community, and major creation / activation flows.

---

## Executive finding

PROMORANG's main UX problem was not lack of capability. It was sequence.

Too many surfaces asked people to understand PROMORANG's internal model before understanding the job they were there to accomplish. Several surfaces also used seeded content, fallback numbers, or "live" language to make empty states look active. That conflicts directly with a platform whose differentiation depends on trustworthy proof.

The corrective rule is:

> **A user should never have to understand the platform before they understand their job.**

Every important surface should answer, in order:

1. **Why am I here?**
2. **What am I trying to accomplish?**
3. **What should I do now?**
4. **What proof will show it worked?**
5. **What happens next if it works?**
6. Only then: deeper tools.

Product sequence:

**Job → Outcome → Next Action → Proof → Decision → Tools**

Second rule:

> **Truthful emptiness is better than impressive fiction.**

Use `0`, `—`, `No data yet`, or `Nothing live right now` when evidence does not exist.

---

## Score method

Each surface is scored against the ten questions in the canonical standard, `0–2` each, maximum **20**.

- **17–20:** strong job-first experience
- **13–16:** usable but needs simplification
- **9–12:** feature-led; user must infer too much
- **0–8:** fails the standard

Scores are product/design audit judgments, not automated test results.

---

# Platform-wide enforcement now implemented

## Canonical doctrine

`docs/design/promorang-job-first-workspace-standard.md`

Defines the five required questions, workspace state model, progressive disclosure, managed workspace context, empty-state behavior, metrics integrity, role contracts, and the 20-point scorecard.

## Shared job-first UI

`apps/web/src/components/dashboard/JobFirstWorkspaceGuide.tsx`

Shows active context, purpose, outcome, next move, proof contract, next decision, and verified progress. It uses the real `useRoleSuccessProgress()` hook rather than invented dashboard figures.

`apps/web/src/components/dashboard/RoleJobFirstGuide.tsx`

Maps the doctrine to Participant, Creator, Host, Merchant, Brand, and Agency jobs.

## Managed-client continuity

`apps/web/src/components/dashboard/ManagedWorkspaceContext.tsx`

When an agency operator enters a connected client workspace, PROMORANG now explicitly shows:

- active client
- client type
- managing agency
- attribution ownership
- one-click return to the agency portfolio

This is mounted at the dashboard level, so the context is not Manchester-Hills-specific.

## Routed dashboard enforcement

`apps/web/src/pages/Dashboard.tsx`

The job-first guide and managed-client context now precede commercial workspaces. Participant home receives the same orientation before the people experience. The participant studio route uses `ParticipantDashboardV2` instead of the more theatrical `CulturalCommandHome`.

---

# Role audit

## Agency

**Before: 14/20**  
**Current: 19/20 — Strong**

Job:

- operate client work
- create measurable client movement
- package proof for the client
- decide what to repeat, change, or scale

Implemented:

- shared Agency job contract
- real client/campaign progress from `useRoleSuccessProgress('agency')`
- real portfolio / relationship counts
- persistent managed-client context when entering a client
- one-click return to the agency workspace
- Pandxtra → Manchester Hills Foods is an active full-service managed relationship

Remaining:

- support multiple managing agencies explicitly if a client can later have more than one agency relationship

---

## Brand

**New/empty before: 6/20**  
**New/empty current: 20/20 — Strong**  
**Active current: 17/20 — Strong, still jargon-heavy**

Before, an empty brand could see Flight Command, Omni-Channel Flight Live, Brand Escrow, Creator Bureau, Correlation Map, and fake fallback performance figures.

Implemented:

- empty brands begin with purpose and customer outcome
- generic first experiment: `First 50 for [Brand]`
- Manchester Hills: `Find Your Manchester Hills Flavour`
- first target: **50 attributable customer actions**
- required client inputs are explicit
- fake fallback impressions/redemptions removed
- shared Brand job-first guide precedes the broader toolset
- managed agency/client context remains visible when an agency is operating the brand

Remaining:

- simplify active-state metaphors such as Flight Command, Flight Deck, Correlation Map, Intelligence Console, and Escrow
- preserve expert tools while making customer-outcome language primary

---

## Merchant

**Before: 6/20**  
**Current: 18/20 — Strong**

Before:

- Merchant Command Station
- synthetic live-shift status
- fake weekly traffic / revenue / APY
- fallback venue count of 1

Implemented:

- truthful zero-capable venue count
- removed fake revenue, traffic, APY, and live status
- real progress via `useRoleSuccessProgress('merchant')`
- tools renamed around the customer job:
  - Customer demand
  - Offers & products
  - Verify actions
  - Orders
  - Places
  - Results
- managed client context is visible when an agency operates a merchant client

Remaining:

- audit individual Merchant consoles and their empty states
- verify every proof path correctly distinguishes visit, redemption, and paid order

---

## Host

**Before: 5/20**  
**Current: 18/20 — Strong**

Before:

- Host Stage Command & Pulse
- fake 85 participants
- fallback Moment counts
- fake pending proof / escrow / APY

Implemented:

- job contract: **Fill it. Run it. Prove who came.**
- actual hosted Moment count only
- fake proof, money, and attendance metrics removed
- tools simplified to Audience demand, Moments, Live arrivals, Proof review, Sponsors, and Results
- Create Moment was rewritten around audience, outcome, and verified attendance proof

Remaining:

- secondary proof / arrival consoles should receive the same empty-state audit

---

## Creator

**Before: 5/20**  
**Current: 18/20 — Strong**

Before:

- Creator Command Studio
- Vanguard Creator Active
- fake live jobs, bounty pool, visits, earnings, and tier

Implemented:

- default starts on Opportunities
- creator sequence: choose useful work → create/submit → cause attributable action → earn / build reputation
- fake performance figures removed
- real progress via `useRoleSuccessProgress('creator')`

Remaining:

- audit mission acceptance/detail pages so proof and settlement are visible before work is accepted

---

## Participant / PromoCard

**PeopleHome before: 15/20**  
**Current: 18/20 — Strong**

Positive existing behavior:

- current move resolves from actual user state
- verified calendar refuses to substitute unconfirmed listings when timing cannot be loaded
- outcome receipts only appear when real movement exists
- PromoCard is a personal value/proof object

Implemented:

- shared participant job contract precedes PeopleHome
- participant studio route uses `ParticipantDashboardV2`

Remaining:

- audit PromoCard, Vault, Missions, and Rewards sub-surfaces
- reduce game vocabulary wherever it obscures practical value

---

## Community

**Current: 18/20 — Strong; no major rewrite required**

Positive findings:

- access is explicit and fail-closed
- membership purpose is explained before entry
- active members land on **Your next community move**
- next move is selected from actual eligible work
- goals, role progress, and next session are visible
- Lead Room is separated from ordinary member work
- test fixtures are explicitly test-only and not returned by the API

Remaining:

- audit Lead Room as its own operator role
- do not add duplicate job-first UI merely for visual consistency

---

## Admin

**Before: 4/20**  
**Current: 18/20 — Strong**

Before, the default command surface contained telemetry theater and hardcoded fallback claims including `99.98% SLA`, `22ms`, `412 active`, fake recent activity, and fallback queue counts.

Implemented:

- Admin now opens around exception resolution
- highest current exception becomes the next action
- actual queries power users, Moments, verified check-ins, support, proof/moderation, payouts/KYC, and supply
- zero displays as zero
- fake SLA, latency, peers, and recent activity removed

Remaining:

- audit static badges and counts in secondary Admin navigation
- run the same integrity pass through Verification Hub, Payouts, Support, Moderation, Audit, and CRM

---

# Creation and activation flows

## Create Campaign / PromoPilot

**Current: 18/20 — Strong**

Already job-led:

- begins with desired activation intent
- compiler turns intent into a plan
- saved record states desired outcome, action, proof, value, and expected movement
- remains draft / unfunded until deliberately advanced

Remaining:

- replace `Proven Blueprints` with `Starter patterns` / `Example activation patterns` unless each blueprint's proof basis is documented

---

## Creator Releases / Content Drops

**Before: 8/20**  
**Current: 18/20 — Strong**

Old critical problem:

When no live release existed, `seededContentDrops` was substituted into the production live feed and counted as active inventory.

Implemented:

- real query data only
- no seeded/demo fallback in live inventory
- honest empty state
- default Points = 0
- default PromoShare entries = 0
- PromoShare only enabled when deliberately configured
- creation asks what the release should cause

---

## Merchant Inventory / Offer Creation

**Before: 16/20**  
**Current: 19/20 — Strong**

Implemented:

- removed silent quantity default of 50
- quantity is blank until the operator enters a real available amount
- no mover/distributor reward is implied unless explicitly configured
- explicit proof contract distinguishes a claim from stronger downstream proof
- post-result decision is visible: replenish, change, close, or repeat
- post-publish review points to what actually happened rather than projected success

Remaining:

- eventually derive fulfillment-specific proof copy from structured proof types rather than generic copy

---

## Create Moment

**Before: 10/20**  
**Current: 19/20 — Strong**

Old integrity problems:

- realistic fictional starter events and venues looked like production data
- fake/default rewards were prefilled
- capacity silently defaulted to 100
- UI implied admission configuration that was not part of the saved Moment insert
- preview could look more live than it was

Implemented:

- removed event/venue starter templates entirely
- stock photography is explicitly optional visual example material
- no default cover selected
- capacity starts blank
- perk/reward starts blank
- first step asks:
  - Who should come?
  - What are you inviting them to?
  - Why is it worth showing up?
  - What will count as success?
- attendance proof is explicit: **verified check-in; RSVP alone is intent**
- intended audience and proof contract are saved into the Moment description
- time/place must be real before continuing
- collaborator split copy requires a real agreement
- draft preview says **Not live until you publish**
- post-publish decision loop is explained

Remaining:

- eventually model audience/proof as structured fields rather than embedding them in description
- persist explicit admission/ticket configuration only when schema and checkout support it end-to-end

---

# Managed workspace rule — now implemented at dashboard level

When an agency enters a connected client workspace, the interface now makes clear:

- who the client is
- who is managing it
- who owns the resulting work/data
- how to return to the agency portfolio

Example target experience:

> **Manchester Hills Foods**  
> Brand · Managed by Pandxtra  
> Work and results created here belong to Manchester Hills Foods  
> **Return to Pandxtra**

The remaining future edge case is choosing the correct parent when one client has multiple agency relationships.

---

# Metrics integrity — fixed in this pass

Removed or corrected:

- Brand fake fallback impressions/redemptions
- Merchant fake traffic/revenue/APY/live status
- Host fake participants/proof/escrow/APY/Moment count
- Creator fake live jobs/visits/pool/earnings/tier
- Admin fake telemetry/SLA/latency/peers/recent activity/fallback queues
- Content Drops seeded inventory masquerading as live inventory
- Create Moment fictional starter venue/event/reward defaults
- Merchant inventory's assumed quantity/reward behavior

Rule:

**No evidence → show no evidence.**

Do not upgrade:

- RSVP → attendance
- claim → purchase
- redemption → customer lifetime value
- click → conversion
- impression → demand

unless the evidence supports the stronger claim.

---

# Current compliance matrix

| Surface | Before | Current | Status | Highest remaining issue |
|---|---:|---:|---|---|
| Agency | 14 | 19 | Strong | Multi-agency edge case later |
| Brand — new | 6 | 20 | Strong | Active-state terminology |
| Brand — active | 11 | 17 | Strong | Advanced jargon/metaphors |
| Merchant | 6 | 18 | Strong | Secondary-console empty states |
| Host | 5 | 18 | Strong | Secondary proof/arrival surfaces |
| Creator | 5 | 18 | Strong | Mission-detail proof clarity |
| Participant / PeopleHome | 15 | 18 | Strong | PromoCard/Vault/Missions subsurfaces |
| Community member | 18 | 18 | Strong | Lead Room audit |
| Admin command | 4 | 18 | Strong | Secondary static badges/tabs |
| Create Campaign | 18 | 18 | Strong | Blueprint wording |
| Content Drops | 8 | 18 | Strong | Release-detail audit |
| Merchant inventory | 16 | 19 | Strong | Structured fulfillment proof later |
| Create Moment | 10 | 19 | Strong | Structured audience/proof fields later |

---

# Next implementation order

## P0 — Remaining truth/integrity search

1. Search production-facing code for hardcoded performance figures and unsupported `Live` / `Active` labels.
2. Audit seeded/demo fallback imports across production feeds.
3. Audit static Admin badges and secondary queues.

## P1 — Secondary job surfaces

Participant:

- PromoCard
- Discover
- Moment detail
- Missions
- Vault
- Rewards

Commercial:

- campaign detail
- proposals
- impact reporting
- creator selection
- merchant offer detail
- redemption scanner
- orders
- venue detail
- host check-ins
- proof review

Community:

- Lead Room
- Move detail
- role review
- funding/settlement

Admin:

- Verification Hub
- Payouts
- Support
- Moderation
- Audit Ledger
- CRM / Growth

## P2 — Data-model hardening

Move job/proof concepts from presentation copy into structured data where needed:

- intended audience
- primary outcome
- proof type
- attribution confidence
- post-result decision
- funded/approved reward state

This makes the UX standard enforceable by data rather than copy alone.

---

# Definition of done

A surface is product-complete when a first-time eligible user can answer without documentation:

1. Where am I and whose workspace is this?
2. Why should I care about this page?
3. What real-world result am I trying to create?
4. What is the single best next action?
5. What is missing before I can take it?
6. What exact evidence will PROMORANG capture?
7. Are every number and status real or explicitly qualified?
8. What decision follows the result?
9. Can I understand the page without PROMORANG vocabulary?
10. Are advanced controls subordinate to the job?

Target: **17/20 or better** before a primary workspace is considered product-complete.

---

# Product principle to preserve

PROMORANG should not win because it has more dashboards.

It should win because every stakeholder can say:

> **I know what I am trying to make happen, I know what to do next, and I will be able to prove whether it worked.**
