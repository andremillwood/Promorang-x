# Promorang A+ Platform Execution Plan

Status: canonical execution blueprint
Design authority: [`DESIGN.md`](../../DESIGN.md)
Applies to: web, mobile, public experience, stakeholder workspaces, content, Moments, Scenes, Gems, PromoShare, notifications, analytics, operations, and support

## 1. The Outcome

Promorang reaches A+ when a new person can enter with no insider knowledge and quickly understand:

1. what is happening in a Scene;
2. which Moment, story, place, person, or opportunity is for them;
3. the one move they should make now;
4. what they will feel, receive, keep, or unlock;
5. how their action benefits other people in the ecosystem;
6. where the result lives afterward; and
7. why returning is personally worthwhile.

For stakeholders, A+ additionally means they can move from a desired human or commercial outcome to a funded, operated, and measurable activation without needing to understand Promorang's internal architecture.

The canonical stakeholder creation path is:

`Choose desired outcome -> Choose the Scene -> Choose or create the Moment -> Define the content needed -> Select creators, hosts, venues, and partners -> Define what counts -> Define participant value -> Secure Gems and launch -> Operate -> Review social and commercial return -> Repeat, improve, or close`

The canonical participant path is:

`Discover -> Connect -> Choose -> Show up or contribute -> See that it counted -> Unlock value -> Keep the memory/value -> Become known -> Return`

## 2. Non-Negotiable Product Laws

### 2.1 Scenes are the social container

A Scene is not a category tag. It is the living network around shared taste, place, people, rituals, stories, and recurring Moments.

Every relevant Moment, content object, creator contribution, venue, host action, campaign, reward, and return signal must be capable of belonging to a Scene. The interface must reveal Scene context wherever that context helps a person decide, belong, or return.

### 2.2 Content is the connective tissue

Content is not a side feature. It performs a different job across the lifecycle:

- Before: creates desire, context, trust, invitation, and social confidence.
- During: captures presence, energy, participation, identity, and live movement.
- After: carries memory, recognition, results, relationships, and the next invitation.

Content must connect to Scenes, Moments, contributors, intended outcomes, usage rights, calls to action, counted actions, Gems, and downstream return.

### 2.3 Human outcomes lead; system mechanisms support

Participant-facing language leads with belonging, access, recognition, enjoyment, opportunity, value, and becoming known. Precise terms such as proof, verification, attribution, qualification, conversion, reputation, eligibility, payout, and ROI remain available where trust, finance, moderation, contracts, or reporting require them.

### 2.4 Gems are the only in-platform money language

- 1 Gem = 1 USD of platform value.
- Gems secure all funded work, access, tickets, rewards, creator/host compensation, merchant value, promotion, refunds, and eligible withdrawals.
- Users earn or buy Gems.
- Available, secured, pending, earned, released, refundable, restricted, and withdrawable Gems must never be visually conflated.
- No activation is described as funded until Gems are atomically secured in the canonical ledger/reserve.

### 2.5 One journey exists across web and mobile

Web and mobile may use different layouts, but journey stage, status, current move, what counts, value, blockers, success destination, and next recommendation must remain identical.

### 2.6 Social return and commercial return are one graph

Promorang must show how culture and commerce support one another without reducing culture to ad inventory:

- participant: belonging, memories, invitations, access, recognition, Gems, and opportunity;
- creator: audience movement, relationships, bookings, collaboration, recognition, and Gems;
- host: turnout, room quality, returning people, sponsor confidence, and Gems;
- venue/merchant: visits, purchases, redemptions, affection, repeat behavior, and Scene relevance;
- brand: cultural contribution, creator output, audience action, demand, and renewal confidence;
- agency: coordinated execution, evidence completeness, margin, client confidence, and reusable playbooks;
- Scene: stronger connections, recurring rituals, supported places, visible talent, and expanding opportunity.

## 3. Canonical Information Architecture

The authenticated product has five stable destinations:

| Destination | Human question | Primary contents |
| --- | --- | --- |
| Today | What is my best move now? | current move, waiting items, near unlocks, live responsibilities, relevant next discovery |
| Discover | What is worth joining, watching, supporting, or creating? | Scenes, Moments, stories, people, places, opportunities, offers |
| Create | What do I want to make happen? | story, Moment, campaign/activation, mission, offer, Scene contribution |
| Progress | What happened because of me or us? | journey paths, social return, commercial return, earnings, learning, next decisions |
| Vault | What have I kept? | memories, access, rewards, Gems, tickets, saved value, collectible artifacts |

Supporting tools—search, inbox/activity, saved, wallet detail, settings, help, KYC, advanced Pieces, liquidity, administration—remain accessible but do not compete with the five destinations.

Role changes the contents and recommended actions, not the overall map.

## 4. The Shared Object Model

Every primary object must expose enough information to support a coherent journey.

### Scene

- identity, place or affinity, promise, imagery, people, hosts, venues, active Moments, recurring rituals, recent stories, ways to participate, health/momentum, and next gathering;
- belonging signals: friends/familiar faces, who welcomes newcomers, accessibility, vibe, and community expectations;
- return signals: upcoming ritual, people met, invitation, contribution opportunity, and what is growing.

### Moment

- Scene, host, venue, time, place, visual story, intended feeling/outcome, access, participant value, content plan, current energy, what counts, funding state, and return path;
- lifecycle: draft, ready, funded, live, awaiting wrap-up, completed, returning/recurring, closed.

### Content/story

- creator, Scene, Moment/campaign context, lifecycle phase, audience promise, call to action, rights/usage, counted movement, value generated, Gems attached, and next related object;
- formats may vary, but every item must make its context and useful action clear.

### Activation/campaign

- desired outcome, Scene, Moment(s), content need, stakeholders, participant value, rules for what counts, secured Gems, schedule, risks, live progress, social return, commercial return, and repeat decision.

### Journey

- stakeholder intent, desired outcome, source object, current stage, completed stages, current move, what counts, value, genuine deadline, blocker, success destination, and return recommendation.

### Value receipt

- what happened, who contributed, what counted, what changed, Gems moved, what opened, where the result lives, and the next move.

## 5. Experience Standards by Surface

### Today

- First viewport contains exactly one dominant current move.
- Shows its Scene/Moment context, why now, what the user receives, and the journey path.
- Waiting items and near-unlocks follow; broad discovery comes later.
- If the user has no active journey, present one achievable, populated first move.

### Discover

- Opens with living Scenes and timely Moments, supported by people, stories, places, and opportunities.
- Supports browse, search, place, time, interest, social confidence, accessibility, value, and role filters without making filters the main experience.
- Every result answers: why this, why now, who is involved, what can I do, and what might come back?

### Create

- Begins with desired outcome, not object type or database fields.
- Uses progressive disclosure through the canonical stakeholder creation path.
- Shows a persistent launch-readiness summary: Scene, Moment, content, people, participant value, what counts, Gems, risks, and missing decisions.
- Supports draft collaboration, preview as each stakeholder, funding, launch, and post-launch iteration.

### Progress

- Begins with human return and current decisions, not generic metric grids.
- Connects individual actions to people, Scene movement, content, visits, purchases, returns, and Gems.
- Provides stakeholder-specific detail and precise reporting in deeper layers.
- Always ends in a decision: repeat, invite back, improve, fund more, resolve, or close.

### Vault

- Feels retained, personal, and valuable.
- Separates memories, access/perks, Gems, PromoShare tickets/wins, saved items, and advanced assets.
- Explains how each item was earned, what it can do, and whether action is required.

### Moment detail

- Becomes the best demonstration of the product model.
- Before: desire, Scene, social confidence, access, participant value, relevant content, one CTA.
- During: live state, check-in/current move, people, content capture, venue/offer, safety and support.
- After: memory, who/what moved, Gems/reward, relationships, stories, invitation back, next Scene/Moment.

### Stakeholder workspace

- Home prioritizes decisions and active activations rather than a wall of metrics.
- Creation follows the canonical path.
- Operations exposes assignments, deadlines, live status, review, exceptions, and Gem movement.
- Results connect social return, commercial return, content performance, and the next investment decision.

## 6. Language System

### Three language layers

1. Human layer: public, participant, creator, host, merchant, and top-level stakeholder experience.
2. Professional layer: workspace reporting and decision support; clear commercial language is acceptable when paired with meaning.
3. System layer: finance, trust, legal, audit, moderation, data exports, and administration; precision takes priority.

### Required translations

| System concept | Preferred human expression |
| --- | --- |
| proof | it counted; show what happened; you were there |
| verification | confirmed; checked; accepted; counted, according to context |
| reputation | become known; get invited back; your place in the Scene |
| attribution | what your story set in motion |
| qualified action | someone acted because it mattered |
| conversion | interest became action |
| retention | they came back |
| eligibility | something opened for you |
| payout | Gems released; earnings ready |
| ROI | what came back; what moved; social and commercial return |

Every user-facing string must be inventoried by surface, role, and language layer. Replacement must be contextual, never a blind global rename.

## 7. Visual and Interaction Standard

Promorang's direction remains cinematic, editorial, warm, and culturally alive:

- near-black/charcoal Culture and Vault modes;
- warm cream or controlled charcoal for Guided Action and Operations modes;
- Promorang orange reserved for movement, focus, and primary action;
- editorial imagery showing real people, places, texture, and energy;
- serif for meaningful cultural/editorial emphasis, legible sans for action and operations;
- rails, trails, tickets, receipts, maps, shelves, and editorial compositions instead of repeated generic card grids;
- one memorable signature: the living Scene trail connecting story, Moment, people, action, value, and return;
- purposeful state motion and receipt reveals with reduced-motion support;
- WCAG 2.2 AA contrast, keyboard operation, focus visibility, logical headings, screen-reader status updates, 44px minimum touch targets, scalable text, and captions/alternatives for media.

Mobile prioritizes one-handed action, live use, capture, check-in, redemption, and approvals. Web prioritizes discovery depth, creation, coordination, reporting, and administration.

## 8. Psychological and Ethical Quality Bar

Every major screen must document:

- active human desire;
- likely fear/uncertainty;
- immediate felt value;
- credible social signal;
- future self or stakeholder outcome;
- post-action recognition/value;
- genuine reason to return.

Use concrete value, real social evidence, honest deadlines, real scarcity, identity reinforcement, reciprocity, progress, autonomy, competence, and belonging.

Reject fake urgency, punitive streaks, guilt notifications, dark patterns, hidden costs, ambiguous Gem states, exploitative creator framing, surveillance tone, vanity engagement, and gambling-first PromoShare presentation.

## 9. Measurement Framework

### North-star behavior

Meaningful return: a person completes a valuable action and later returns for a related Moment, Scene, relationship, opportunity, or retained value.

### Journey measures

- time to first understood value;
- time to first meaningful action;
- current-move completion rate;
- check-in/contribution completion;
- submission acceptance and revision rate;
- value unlock and claim/use rate;
- next-relevant-action rate;
- seven-, thirty-, and ninety-day meaningful return;
- cross-platform continuation success;
- support/contact rate caused by confusion.

### Social-return measures

- repeat Scene participation;
- return invitations accepted;
- new meaningful connections or collaborations where users choose to signal them;
- creator bookings/collaborations opened;
- repeat host/venue participation;
- content that led to attendance, contribution, or return;
- saved memories and post-Moment sharing;
- participant-reported belonging, welcome, and value.

### Commercial-return measures

- Gems secured, released, refunded, restricted, and withdrawn;
- cost per counted action;
- visits, check-ins, purchases, redemptions, and repeat visits;
- creator content delivered and downstream movement;
- participant value funded and used;
- activation completion and exception rates;
- sponsor/merchant renewal and increased funding;
- margin and operational cost by activation.

Metrics must include definitions, source events, owner, privacy classification, and validation tests. No dashboard metric ships without a trustworthy data contract.

## 10. Workstreams

### WS1 — Governance and source of truth

Deliver:

- make this plan and `DESIGN.md` the canonical pair;
- reconcile older Pulse/Dashboard-first route documents with Today/Progress;
- create a decision log, controlled vocabulary, journey-state dictionary, and route registry;
- classify every route: production, limited, hidden, experimental, redirect, or retire;
- assign product/design/engineering/data owner fields even when one person currently fills several roles.

Exit gate: no active implementation document contradicts the canonical navigation, Gems rule, Scene model, or journey language.

### WS2 — Foundations and shared contracts

Deliver:

- shared Scene, Moment, Content, Activation, Journey, Value Receipt, Stakeholder Return, and Gem State contracts;
- backend aggregation endpoints where direct frontend queries are fragile;
- shared web/mobile status and copy mappings;
- analytics event taxonomy and identity/role/permission rules;
- feature flags and migration/backfill plan.

Exit gate: contract tests prove web and mobile resolve the same journey and value state from the same fixtures.

### WS3 — Navigation and shell

Deliver:

- Today, Discover, Create, Progress, Vault on web and mobile;
- role-aware content without role-specific navigation fragmentation;
- contextual access to Inbox, Search, Saved, Wallet detail, Settings, Help, and operational tools;
- redirects and deep-link continuity from legacy routes;
- route readiness guards so incomplete surfaces are not promoted.

Exit gate: five-person usability test participants can locate their current move, create entry, results, and retained value without instruction.

### WS4 — Scenes and discovery

Deliver:

- canonical Scene profile and Scene-aware discovery;
- Scene context on Moment, content, creator, venue, and campaign objects;
- social confidence, welcome/vibe, live/next ritual, and return invitations;
- Scene follow/join/save and durable persistence;
- place/time/accessibility filters and meaningful empty states.

Exit gate: a new user can explain what a Scene is, find one that fits, identify its next Moment, and take a first action.

### WS5 — Moment lifecycle and participant success

Deliver:

- coherent before/during/after Moment experience;
- join/access/ticket, check-in, live current move, contribution/capture, offer/redemption, memory, value receipt, invitation back;
- failure recovery for location, camera, upload, network, sold-out, review, refund, and accessibility cases;
- consistent celebration levels and notifications.

Exit gate: the full journey works on real devices and survives interruption, retry, and web-to-mobile continuation.

### WS6 — Content system

Deliver:

- content lifecycle and content-to-Scene/Moment/activation relationships;
- creator briefs, deliverables, rights, review, publishing, distribution, counted movement, and reuse;
- before/during/after content shelves in Moment and Scene experiences;
- creator portfolio expressed as influence, relationships, work, and value—not only output counts;
- clear participant creation and sharing paths.

Exit gate: every activation can state what content is needed, who makes it, when it is used, what action it invites, what counted, and what value returned.

### WS7 — Stakeholder activation builder and operations

Deliver:

- desired-outcome-first builder through all canonical creation steps;
- Scene selection/creation, Moment selection/creation, content plan, collaborator marketplace/selection, what-counts rules, participant value, Gem reserve, preview, launch;
- role assignments, proposals, approvals, operational timeline, review queues, exceptions, disputes, and closeout;
- stakeholder-specific previews before launch.

Exit gate: a brand, merchant, host, or agency can configure a coherent funded activation without internal Promorang terminology or staff intervention.

### WS8 — Gems, tickets, PromoShare, and retained value

Deliver:

- one canonical Gem wallet/ledger experience and reserve lifecycle;
- 1 Gem = 1 USD supporting equivalence everywhere material;
- purchase, earn, secure, release, refund, restrict, withdraw, and failure states;
- PromoShare tickets clearly tied to counted actions and funded pools;
- draws separated from performance leaderboards; rules, odds logic, caps, and results visible;
- Vault distinctions among Gems, tickets, memories, perks/access, saved items, and Pieces.

Exit gate: participants and sponsors can independently explain where value came from, what is guaranteed, what is chance-based, what is restricted, and what happens next.

### WS9 — Progress, social return, and commercial return

Deliver:

- stakeholder return summaries connected to real event contracts;
- human summary first, professional analysis second, system/audit detail third;
- participant, creator, host, venue/merchant, brand, agency, and Scene lenses;
- activation comparison and repeat/improve/stop recommendations;
- exportable client-ready results with definitions and limitations.

Exit gate: each stakeholder can answer “what came back, for whom, because of what, at what Gem cost, and what should we do next?”

### WS10 — Onboarding, language, notifications, and support

Deliver:

- outcome/interest/Scene-led onboarding into first value;
- route-by-route language inventory and contextual rewrite;
- notification matrix tied only to active journeys, real deadlines, relationships, value movement, and meaningful return;
- help content that teaches human outcomes before mechanism definitions;
- support visibility into journey, Gem, and review state.

Exit gate: comprehension testing reaches at least 90% for next action, value, and destination across representative roles; no critical notification uses ambiguous or manipulative language.

### WS11 — Accessibility, performance, trust, privacy, and safety

Deliver:

- WCAG 2.2 AA audit and remediation;
- performance budgets and media strategy for culture-heavy surfaces;
- consent and privacy rules for location, contacts, social connection, content rights, and stakeholder reporting;
- fraud, moderation, dispute, refund, and responsible PromoShare controls;
- graceful offline/intermittent-network behavior for live Moment tasks.

Exit gate: zero critical accessibility or security findings, agreed performance budgets met, and trust-sensitive journeys tested end to end.

### WS12 — Quality, rollout, and learning

Deliver:

- unit, contract, integration, end-to-end, visual regression, accessibility, and migration tests;
- seeded representative Scenes/Moments/activations for QA;
- role/device/browser matrix;
- staged flags: internal -> pilot Scene -> limited stakeholders -> broader release;
- baseline metrics, experiment rules, feedback interviews, release notes, rollback plan, and operational runbooks.

Exit gate: all release gates pass with monitored production evidence, not only local demos.

## 11. Execution Sequence

### Phase 0 — Freeze the standard and establish baselines

Complete WS1. Inventory routes, strings, data sources, journey states, events, and current performance/accessibility. Capture screenshots and baseline funnel measures. Do not begin broad visual rebuilding until contradictions are resolved.

### Phase 1 — Build the shared spine

Complete critical WS2 contracts, then WS3 shells and shared signature components:

- Current Move;
- Journey Path;
- Scene Context;
- Content Story;
- Moment State;
- Value Receipt;
- Gem State;
- Stakeholder Return;
- Success Destination;
- Return Invitation.

### Phase 2 — Deliver the participant golden journey

Implement WS4 and WS5 around one real pilot Scene and one representative Moment:

`Today/Discover -> Scene -> Moment -> Join -> Check in/contribute -> It counted -> Unlock -> Vault -> Invitation back`

This becomes the reference implementation for language, state, accessibility, analytics, and mobile/web continuity.

### Phase 3 — Make content truly central

Complete WS6 across the same pilot: invitation content before, live content during, memory/result content after, and creator return visible throughout.

### Phase 4 — Deliver the stakeholder golden journey

Implement WS7 and WS8 around a real activation:

`Outcome -> Scene -> Moment -> Content -> People/places -> What counts -> Participant value -> Secure Gems -> Launch -> Operate -> Close`

### Phase 5 — Close the return loop

Complete WS9 so the pilot activation resolves into credible social return, commercial return, Gem reconciliation, learning, and a repeat/improve/stop decision.

### Phase 6 — Propagate and harden

Apply the proven patterns to every remaining route, role, notification, email, help surface, and edge case. Complete WS10–WS12, then retire or redirect legacy surfaces.

## 12. Slice Definition and Order

Every implementation slice must be vertical and include:

1. user/stakeholder scenario;
2. human desire and fear;
3. web and mobile experience;
4. Scene, Moment, and content context where relevant;
5. journey/status contract;
6. Gems/value behavior where relevant;
7. success destination and return action;
8. analytics events and data source;
9. loading, empty, error, permission, offline, and accessibility states;
10. tests, screenshots, copy review, and rollout flag.

Recommended slice order:

1. canonical vocabulary and journey-state package;
2. navigation/readiness registry;
3. Current Move + Journey Path;
4. Scene Context + Scene profile;
5. Discover -> Moment detail;
6. join/access -> check-in/contribution;
7. counted receipt -> Vault -> return invitation;
8. content lifecycle and creator return;
9. stakeholder activation builder;
10. Gem reserve/release/refund and participant value;
11. PromoShare tickets/draw clarity;
12. Progress and stakeholder return;
13. onboarding/notifications/help propagation;
14. route retirement, performance, accessibility, trust, and production hardening.

## 13. Definition of Ready

A slice may start only when it has:

- named user and stakeholder scenario;
- desired outcome and success destination;
- current move and return move;
- approved terminology/language layer;
- states and edge cases;
- web/mobile responsibilities;
- data/API owner and stable contract or explicit contract work;
- privacy/trust implications;
- analytics and acceptance criteria;
- representative content and test data.

## 14. Definition of Done

A slice is done only when:

- it is functional on supported web and real mobile devices;
- web/mobile state meaning matches;
- no placeholder, fake-local, or silent failure remains in the primary path;
- content, Scene, Moment, value, and stakeholder context are present where promised;
- copy passes the three-layer language standard;
- loading, empty, error, retry, expired, permission, and interrupted states work;
- WCAG 2.2 AA and reduced-motion requirements pass;
- performance stays within budget;
- analytics events are validated against source data;
- unit/contract/integration/e2e/visual tests pass as applicable;
- product/design review and representative-user comprehension test pass;
- documentation, migration, rollback, monitoring, and support notes are updated;
- the result leads to an explicit success destination and meaningful next move.

## 15. A+ Release Scorecard

Each category scores 0–4. Release requires every category at 4; no average can conceal a weak category.

| Category | A+ / score 4 standard |
| --- | --- |
| Strategy | surface clearly advances the Promorang human and commercial promise |
| Journey clarity | first-time users identify purpose, current move, value, destination, and return without coaching |
| Human language | human benefit leads; system precision appears only where needed |
| Scenes | relevant social/place context and belonging/return are visible |
| Content | content has a clear lifecycle job and connection to action/return |
| Social return | appropriate people/relationship/belonging/opportunity value is visible |
| Commercial return | value movement and stakeholder outcome are credible and actionable |
| Gems | all monetary states are correct, clear, reconciled, and use 1 Gem = 1 USD |
| Cross-platform | web/mobile states, deep links, and journey continuation agree |
| Visual quality | distinctive Promorang hierarchy, imagery, typography, interaction, and responsive composition |
| Accessibility | WCAG 2.2 AA and assistive interaction pass |
| Trust/safety | consent, rules, review, disputes, refunds, privacy, and chance-based mechanics are clear |
| Data integrity | metrics and statuses use stable contracts and validated events |
| Reliability | primary and edge paths survive failures, retries, interruption, and duplication |
| Performance | agreed budgets pass on representative devices/networks |
| Operability | monitoring, support context, auditability, rollback, and ownership are ready |

## 16. Required Execution Ledger

Track every slice with these fields:

| Field | Purpose |
| --- | --- |
| ID and title | stable reference |
| Primary scenario | the human journey being improved |
| Stakeholders | direct and downstream beneficiaries |
| Scene/Moment/content relationship | prevents ecosystem context from disappearing |
| Desired outcome/current move | prevents feature-led implementation |
| Success destination/return | closes the loop |
| Language layer | human, professional, or system |
| Web/mobile surfaces | parity and device responsibility |
| Contracts/migrations | source-of-truth changes |
| Gem impact | funding/value implications |
| Analytics | events, definitions, expected movement |
| Accessibility/trust risks | non-functional obligations |
| Dependencies/owner/status | execution control |
| Acceptance evidence | tests, screenshots, research, telemetry |
| Rollout/rollback | safe release |

Statuses: `Not ready`, `Ready`, `In progress`, `In review`, `Pilot`, `Released`, `Measured`, `Closed`.

## 17. First Execution Package

The first package should make later work mechanical:

1. reconcile the older route/experience documents with this plan;
2. create the controlled vocabulary and shared journey-state mapping;
3. create the route readiness registry for web and mobile;
4. inventory user-facing copy by language layer;
5. inventory every direct/fragile frontend data source behind the five destinations;
6. implement the shared Current Move, Journey Path, Scene Context, and Value Receipt contracts/components;
7. wire one pilot participant journey across web and mobile;
8. validate comprehension, state parity, analytics, accessibility, and performance;
9. use the pilot as the pattern for stakeholder creation, Gems, content, and return.

## 18. Final Test

Before calling Promorang A+, ask a participant, creator, host, merchant/venue, brand, and agency representative to use it from a cold start.

Each must be able to explain, in their own words:

- what Promorang helps them become or accomplish;
- what a Scene means to them;
- what they should do next;
- how Moments and content work together;
- what counts and why;
- what they receive or create for others;
- how Gems move and what 1 Gem means;
- where their result lives;
- what came back socially and commercially; and
- why they would return.

If any stakeholder needs Promorang's internal vocabulary to make sense of the experience, the work is not finished.
