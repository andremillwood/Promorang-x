# PROMORANG Job-First Platform Audit — 2026-09-14

**Status:** Active implementation audit  
**Standard:** `docs/design/promorang-job-first-workspace-standard.md`  
**Scope:** Primary role homes, managed workspaces, admin, Community, and the highest-value creation / activation flows.

---

## 1. Executive Finding

PROMORANG has strong underlying mechanics for verified participation, attribution, managed client work, rewards, Moments, creator distribution, and real-world activation. The main UX problem was not lack of capability. It was **sequence**.

Too many workspaces asked users to understand PROMORANG's internal model before they understood the job they were there to accomplish.

The platform-wide corrective rule is:

> **A user should never have to understand the platform before they understand their job.**

The required information order is:

**Why am I here? → What am I trying to accomplish? → What should I do now? → What will prove it worked? → What happens next? → Tools**

This audit found a second systemic problem: some surfaces used synthetic fallback data, seeded content, or "live" language to make empty workspaces look populated. That violates the metrics-integrity rule and weakens the product's central promise of proof.

The current refactor therefore has two goals:

1. **Job clarity before platform complexity.**
2. **Truthful emptiness before synthetic activity.**

---

## 2. Audit Score Method

Each surface is scored against the ten questions in the Job-First Workspace Standard.

Each question receives:

- `0` — absent / misleading / confusing
- `1` — partially present
- `2` — clear and actionable

Maximum score: **20**.

Thresholds:

- **17–20:** strong job-first experience
- **13–16:** usable but still needs simplification
- **9–12:** feature-led; user must infer too much
- **0–8:** fails the standard

Scores below are product/design audit scores, not automated test results.

---

## 3. Platform-Wide Changes Already Implemented

### 3.1 Canonical job-first doctrine

Created:

`docs/design/promorang-job-first-workspace-standard.md`

The document is now the canonical product rule for dashboards, workspaces, onboarding, empty states, managed client views, and major feature surfaces.

### 3.2 Shared job-first UI primitive

Created:

`apps/web/src/components/dashboard/JobFirstWorkspaceGuide.tsx`

This component forces a workspace to make visible:

- context / identity
- purpose
- primary outcome
- next move
- proof contract
- what happens next
- real progress and milestones where available

It is powered by the existing `useRoleSuccessProgress()` hook rather than invented dashboard figures.

### 3.3 Role contracts

Created:

`apps/web/src/components/dashboard/RoleJobFirstGuide.tsx`

Role contracts currently cover:

- Participant
- Creator
- Host
- Merchant
- Brand
- Agency

### 3.4 Routed dashboard enforcement

Updated:

`apps/web/src/pages/Dashboard.tsx`

The shared job-first guide now appears before commercial role dashboards. The participant home also receives the job-first context before the people experience.

The participant studio route was changed from `CulturalCommandHome` to the more grounded `ParticipantDashboardV2` so the platform does not lead participants into "Ops Theatre" language when they intentionally open a dashboard view.

---

# 4. Role Workspace Audit

## 4.1 Agency

### Job contract

**Why:** operate client work and return with evidence rather than activity reports.  
**Outcome:** produce one undeniable managed result for a client.  
**Proof:** client-attributed verified actions.  
**Decision:** package the result, repeat/change/scale, expand the account.

### Before

**Score: 14/20 — usable, but the job had to be inferred.**

Strengths already present:

- real client portfolio
- actual agency/client relationships
- dynamic client campaign counts
- "Add first client → Launch first activation → Export first result" progression
- client workspace switching

Weaknesses:

- purpose was spread across several cards instead of being the dominant orientation
- user could enter a client workspace and lose parent-agency context
- no platform-wide five-question structure

### After current refactor

**Score: 18/20 — strong.**

Implemented:

- shared Agency job-first contract appears before the portfolio tools
- actual `useRoleSuccessProgress('agency')` determines milestones and next action
- agency portfolio data remains real
- Manchester Hills is connected to Pandxtra as an active full-service managed client

### Remaining

- Make the parent agency / "return to portfolio" context persistent on **all** managed client workspaces, not only the Manchester Hills empty state.

---

## 4.2 Brand

### Job contract

**Why:** turn marketing activity into attributable customer movement.  
**Outcome:** measurable trial, visit, purchase, review, referral or return.  
**Proof:** verified customer action appropriate to the campaign.  
**Decision:** repeat, improve, retarget, stop or scale.

### Before

**New / empty brand score: 6/20 — failed.**

The brand dashboard opened with concepts such as:

- Flight Command
- Omni-Channel Flight Live
- Brand Escrow
- Creator Bureau
- Correlation Map
- multiple operational arenas

It also used fallback performance numbers even when the brand had not run a campaign.

### After current refactor

**New / empty brand score: 19/20 — strong.**  
**Existing / live brand score: 16/20 — usable, needs language simplification.**

Implemented:

- new brand workspace now leads with purpose and measurable outcome
- generic first activation: `First 50 for [Brand]`
- Manchester Hills-specific activation: `Find Your Manchester Hills Flavour`
- first target: 50 attributable customer actions
- explicit required client inputs
- explicit Launch → Move People → Prove → Decide sequence
- fake fallback impressions / redemptions removed
- shared Brand job-first guide precedes the broader toolset

### Remaining

For brands with active campaigns, rename or subordinate residual platform metaphors such as:

- Flight Command
- Flight Deck
- Correlation Map
- Intelligence Console
- Brand Escrow

Those tools may remain, but user-job language should be primary.

---

## 4.3 Merchant

### Job contract

**Why:** turn attention into customers and repeat behavior.  
**Outcome:** verified visits, claims, redemptions, purchases, reviews or returns.  
**Proof:** visit, redemption and transaction records.  
**Decision:** bring customers back, improve the offer, increase frequency or expand.

### Before

**Score: 6/20 — failed.**

Problems included:

- "Merchant Command Station"
- synthetic live-shift status
- fallback venue count of 1 when no venue existed
- fake weekly traffic
- modeled revenue presented as if actual
- "12.5%" yield / APY language without evidence
- advanced operations shown before setup / purpose

### After current refactor

**Score: 18/20 — strong.**

Implemented:

- shared Merchant job-first guide
- real progress via `useRoleSuccessProgress('merchant')`
- truthful venue count, including zero
- removed fake traffic, revenue, APY and live status
- simplified tool labels:
  - Customer demand
  - Offers & products
  - Verify actions
  - Orders
  - Places
  - Results
- tools explicitly described as secondary to the customer job

### Remaining

- Audit individual Merchant consoles for empty-state quality.
- Verify all merchant proof paths distinguish visit, redemption and paid order correctly.

---

## 4.4 Host

### Job contract

**Why:** fill and operate experiences with the right people.  
**Outcome:** attendance and participation.  
**Proof:** RSVP, verified arrival/check-in, participation and return.  
**Decision:** improve the next Moment and build a returning audience.

### Before

**Score: 5/20 — failed.**

Problems included:

- "Host Stage Command & Pulse"
- default 85 participants
- fallback "2 staged" Moments
- "2 pending" proof reviews
- `$1.4k Escrow`
- `14.8% APY`
- live-stage language when no live event existed

### After current refactor

**Score: 18/20 — strong.**

Implemented:

- shared Host job-first guide
- actual hosted Moment count, including zero
- removed fake participants, pending reviews, escrow and APY values
- simplified tools:
  - Audience demand
  - Moments
  - Live arrivals
  - Proof review
  - Sponsors
  - Results
- primary operating idea is now: **Fill it. Run it. Prove who came.**

### Remaining

- `CreateMoment` still requires a separate integrity cleanup; see Creation Flows.

---

## 4.5 Creator

### Job contract

**Why:** use creative work and distribution to produce useful, attributable actions and earn when the outcome is proven.  
**Outcome:** approved work plus verified supporter / customer action.  
**Proof:** accepted deliverable and attribution / verified consequence.  
**Decision:** earn, improve reputation and unlock better work.

### Before

**Score: 5/20 — failed.**

Problems included:

- "Creator Command Studio"
- "Vanguard Creator Active"
- fake `3 Live`
- fake `$1.2k Pool`
- fake `158 Visits`
- fake `$465 Ready`
- fake `L2 Vanguard`

The page made the creator ecosystem appear mature even when the account had no evidence.

### After current refactor

**Score: 18/20 — strong.**

Implemented:

- shared Creator job-first guide
- default workspace starts on Opportunities
- simplified sequence:
  - Audience demand
  - Opportunities
  - Create & submit
  - Attributed actions
  - Earnings
  - Reputation
- fake earnings, visitor, bounty pool and tier metrics removed
- proof progress is sourced through `useRoleSuccessProgress('creator')`

### Remaining

- Audit each mission / submission detail page so the proof requirement and settlement terms are visible before a creator accepts work.

---

## 4.6 Participant / PromoCard

### Job contract

**Why:** find worthwhile things and receive value for meaningful participation.  
**Outcome:** complete useful real-world / digital moves and build a valuable PromoCard history.  
**Proof:** joined Moment, check-in, claim, redemption, proof or referral.  
**Decision:** unlock more value, return or refer.

### Before

**Default PeopleHome score: 15/20 — already relatively strong.**  
**CulturalCommandHome studio score: 10/20 — jargon-heavy.**

Positive findings in `PeopleHome`:

- current next move is resolved from user state
- verified calendar is explicit
- if live timing fails, the page refuses to substitute unconfirmed listings
- receipts only display when real movement exists
- PromoCard is presented as a useful personal object

Problem:

- the participant studio route pointed at a more theatrical `CulturalCommandHome` with Ops Theatre / level language and curated fallback behavior.

### After current refactor

**Score: 18/20 — strong.**

Implemented:

- shared participant job contract appears above PeopleHome
- participant studio route now points to `ParticipantDashboardV2`
- existing real current-move / journey system is retained

### Remaining

- Continue reducing game-system vocabulary when it does not clarify participant value.
- Audit Vault / Missions / PromoCard sub-surfaces against the same five questions.

---

## 4.7 Community

### Job contract

**Why:** coordinate members toward useful shared outcomes.  
**Outcome:** meaningful participation and member value.  
**Proof:** claimed/completed moves, accepted proof, roles, points and community receipts.  
**Decision:** deepen participation, maintain roles, fund another move or change the rhythm.

### Current score

**Score: 18/20 — strong; no major rewrite required in this pass.**

Positive findings:

- private access state is explicit and fail-closed
- membership purpose is explained before entry
- active members land on "Your next community move"
- one next move is selected from actual work / eligibility state
- shared goals are visible
- role/progress and next session are visible
- lead room is separated from ordinary member jobs
- test fixture is explicitly marked test-only and not returned by API

### Remaining

- Add the canonical job-first component only if it improves rather than duplicates the existing purpose-led hero.
- Audit Lead Room exception queues separately because lead jobs differ from member jobs.

---

## 4.8 Admin

### Job contract

**Why:** keep the system trustworthy and moving.  
**Outcome:** resolve risks, failures, disputes and operational blockers.  
**Proof:** closed support / verification / payout / moderation / audit records.  
**Decision:** move to the next exception and improve systems that create repeat failures.

### Before

**Score: 4/20 — failed.**

The old command center contained large amounts of telemetry theater, including hardcoded fallback values and live-system claims such as:

- `99.98% SLA`
- `22ms`
- `412 active` peers
- synthetic recent activity
- fallback total users / Moments
- fake support / proof / payout counts

This was especially damaging because Admin should be the most trustworthy surface in the product.

### After current refactor

**Score: 18/20 — strong.**

Implemented:

- Admin now opens with a job-first intervention contract
- highest current exception becomes the primary next action
- actual queries power:
  - users
  - Moments
  - verified check-ins
  - support escalations
  - proof / moderation queue
  - payout and KYC blockers
  - Moment supply
- zero is displayed as zero
- synthetic SLA, latency, peers and fake recent activity were removed
- explicit copy states that no synthetic live status is used

### Remaining

- Audit secondary admin tabs for fake badges / hardcoded queue counts in navigation labels.
- Replace static badges such as `3 New` where they are not query-backed.

---

# 5. Creation and Activation Flow Audit

## 5.1 Create Campaign / PromoPilot

**Current score: 18/20 — strong.**

Positive findings:

- begins with desired activation intent
- campaign compiler translates intent into a plan
- saved campaign explicitly records:
  - desired outcome
  - what people will do
  - what counts as proof
  - what follows
  - expected movement
- `StakeholderHowLead` provides role context
- generated plan remains draft / unfunded until explicitly advanced

### Remaining

- Reword "Proven Blueprints" unless every blueprint is backed by documented evidence. Prefer `Starter patterns` or `Example activation patterns` where appropriate.

---

## 5.2 Creator Releases / Content Drops

### Before

**Score: 8/20 — failed metrics integrity.**

Critical issue:

When the live query returned no releases, the page substituted `seededContentDrops` and displayed them as the live feed. Those examples also contributed to active / asset / linked counts.

Defaults also created rewards / PromoShare entries before the publisher deliberately configured them.

### After current refactor

**Score: 18/20 — strong.**

Implemented:

- live feed uses actual query data only
- empty feed explicitly says no release opportunities are live
- seeded/demo data is no longer substituted into production live inventory
- reward defaults are `0`
- PromoShare entries default to `0`
- PromoShare is enabled only when explicitly funded/configured
- creation asks what the release should cause
- creator sequence is: choose useful work → publish → prove consequence

---

## 5.3 Merchant Inventory / Offer Creation

`PutInventoryUp.tsx`

**Current score: 16/20 — usable.**

Strengths:

- `StakeholderHowLead` explains role and purpose
- asks what people receive
- asks how fulfillment happens
- shows next actions after publishing
- does not fabricate redemption results

### Remaining

- default quantity currently begins at `50`; blank is more honest unless 50 is explicitly labelled as a recommendation
- improve proof wording before publish: what specific action will be recorded as success?
- show an explicit post-launch decision: repeat, change, close or replenish

---

## 5.4 Create Moment

`CreateMoment.tsx`

**Current score: 10/20 — still feature-led and has integrity risks.**

Strengths:

- can inherit an explicit create intent
- has authentication / role context
- collects venue, time, admission, collaborators and capacity
- can claim user-discovered listings

### Critical issues

Starter templates currently look like configured real-world opportunities and include specific venues / rewards such as:

- Kingston Skyline Sound Clash / Kingston Dub Club
- PriceSmart Culinary Studio
- Sovereign Cultural Centre
- Plantation Cove
- default rewards such as `100 Points + Verified Mark`

Even if these are intended only as starter examples, they are not sufficiently distinguished from live production data.

### Required fix

- label all templates `Example` / `Starter pattern`, or replace them with clearly fictional generic templates
- do not prefill reward amounts as if funded
- default rewards to blank / `No funded reward configured`
- default capacity should be blank or explicitly `Suggested: 100`, not silently asserted
- first step should ask:
  1. Who should come?
  2. Why should they come?
  3. What will count as participation?
  4. What happens after they attend?

**Create Moment remains the highest-priority unresolved creation-flow issue from this pass.**

---

# 6. Managed Workspace Audit

The Pandxtra → Manchester Hills flow exposed an important product rule.

An agency switching into a client workspace must never wonder:

- Did I become the client?
- Am I still operating as the agency?
- Whose data will this campaign belong to?
- How do I return to my portfolio?

The canonical pattern should be visible on every managed workspace:

> **Manchester Hills Foods**  
> Brand workspace · Managed by Pandxtra  
> Results belong to Manchester Hills Foods · Return to Pandxtra portfolio

Current implementation is partially compliant. The Manchester Hills new-brand state identifies its managed context, but this should become a reusable cross-workspace pattern.

---

# 7. Metrics and Evidence Integrity Findings

## Fixed in this pass

- Brand fake fallback impressions / redemptions
- Merchant fake traffic / revenue / APY / live status
- Host fake participants / pending proof / escrow / APY / Moment count
- Creator fake live releases / visits / pool / earnings / tier
- Admin fake telemetry / SLA / latency / peers / recent activity / fallback queues
- ContentDrops seeded/demo inventory masquerading as live opportunities

## Rule going forward

When evidence does not exist, use:

- `0`
- `—`
- `No data yet`
- `Nothing live right now`
- `Not measured yet`

Never use fabricated activity to make the platform look alive.

PROMORANG's differentiation depends on trust in proof. A visually impressive false metric is more damaging than an honest zero.

---

# 8. Current Compliance Matrix

| Surface | Before | Current | Status | Highest remaining issue |
|---|---:|---:|---|---|
| Agency | 14 | 18 | Strong | Persistent managed-client parent context |
| Brand — new | 6 | 19 | Strong | Generalize managed context |
| Brand — active | 11 | 16 | Usable | Platform metaphors / advanced jargon |
| Merchant | 6 | 18 | Strong | Secondary-console empty states |
| Host | 5 | 18 | Strong | Create Moment integrity |
| Creator | 5 | 18 | Strong | Mission-detail proof clarity |
| Participant / PeopleHome | 15 | 18 | Strong | Subsurface audit |
| Community member | 18 | 18 | Strong | Lead-room audit |
| Admin command | 4 | 18 | Strong | Static badges in secondary nav |
| Create Campaign | 18 | 18 | Strong | Blueprint wording |
| Content Drops | 8 | 18 | Strong | Release-detail audit |
| Merchant inventory | 16 | 16 | Usable | Default quantity + proof contract |
| Create Moment | 10 | 10 | Needs work | Example/live-data ambiguity |

---

# 9. Platform Rollout Order From Here

## P0 — Integrity

1. Fix `CreateMoment` example / reward defaults.
2. Audit all remaining hardcoded numbers on production-facing surfaces.
3. Remove static "live" / "active" labels unless they resolve from actual state.
4. Audit secondary Admin navigation badges.

## P1 — Managed client continuity

1. Create reusable `ManagedWorkspaceContext` component.
2. Display parent agency, active client, attribution owner and return-to-portfolio action.
3. Use it in Brand and Merchant client workspaces.

## P2 — Creation flows

Audit and refactor:

- Create Moment
- Put Inventory Up
- Create Campaign details / campaign detail
- Creator mission acceptance
- Release publishing
- Proposal creation

Every create flow should begin with **the result being created**, not the database object being created.

## P3 — Secondary role surfaces

### Participant

- PromoCard
- Discover
- Moment Detail
- Missions
- Vault
- Rewards

### Agency / Brand

- campaign detail
- proposal workspace
- impact / reporting
- creator selection
- attribution views

### Merchant / Host

- offer detail
- redemption scanner
- orders
- venue detail
- check-ins
- proof review

### Community

- Lead Room
- Move detail
- role application / review
- funding and proof settlement

### Admin

- verification hub
- payouts
- support
- moderation
- audit ledger
- growth / CRM

---

# 10. Definition of Done for Any Surface

A surface is not complete because it renders, has navigation, or exposes all backend capabilities.

It is complete when a first-time eligible user can answer, without documentation:

1. **Where am I / whose workspace is this?**
2. **Why should I care about this page?**
3. **What real-world result am I trying to create?**
4. **What is the single best next action?**
5. **What am I missing before I can take that action?**
6. **What exact evidence will PROMORANG capture?**
7. **Are every number and status on screen real or explicitly qualified?**
8. **What decision will I make after the result?**
9. **Can I understand the page without knowing PROMORANG vocabulary?**
10. **Are advanced controls subordinate to the job?**

Target: **17/20 or better** before a primary workspace is considered product-complete.

---

# 11. Product Principle to Preserve

PROMORANG should not win because it has more dashboards.

It should win because it can make this sentence true for every stakeholder:

> **I know what I am trying to make happen, I know what to do next, and I will be able to prove whether it worked.**

That is the standard the rest of the platform should now be audited and rebuilt against.
