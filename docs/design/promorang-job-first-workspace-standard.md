# PROMORANG Job-First Workspace Standard

**Status:** Canonical product and UX rule  
**Applies to:** All PROMORANG roles, dashboards, workspaces, onboarding flows, empty states, managed-client views, operational consoles, and major feature surfaces  
**Purpose:** Ensure a user understands the job PROMORANG is helping them accomplish before they are asked to understand PROMORANG itself.

---

## 1. The Rule

> **A user should never have to understand the platform before they understand their job.**

Every workspace must answer, in plain language and in this order:

1. **Why am I here?**
2. **What am I trying to accomplish?**
3. **What should I do now?**
4. **What proof will show that it worked?**
5. **What happens next if it works?**

If a user cannot answer those five questions within the first meaningful screen, the workspace is not finished.

PROMORANG may contain sophisticated mechanics, infrastructure, terminology, rewards, attribution, campaigns, Moments, creators, Scenes, PromoKeys, wallets, intelligence layers, and operational tools. None of those are the user's job.

They are mechanisms PROMORANG uses to help the user complete a job.

---

## 2. Product Principle

PROMORANG should be **outcome-first, mechanism-second**.

The interface should introduce complexity only after the user understands the commercial, cultural, operational, or personal outcome being pursued.

The intended sequence is:

**Job → Outcome → Next Action → Proof → Decision → Tools**

Not:

**Dashboard → Features → Terminology → Metrics → User figures out why any of it matters**

A workspace is successful when the user can say:

> "I know why I am here, I know the result I am trying to create, I know the next thing to do, and I know how PROMORANG will prove whether it worked."

---

## 3. The Five Required Questions

### 3.1 Why am I here?

The workspace must identify the user's role in human terms and explain why this particular workspace exists.

Good:

> "This Manchester Hills workspace exists so Pandxtra can create measurable customer movement for the brand and show the client what happened."

Weak:

> "Manchester Hills Flight Command"

The first explains purpose. The second assumes the user already understands the product model.

### 3.2 What am I trying to accomplish?

Every workspace needs a primary outcome.

Examples:

- Brand: create attributable customer actions.
- Agency: produce and package a measurable client result.
- Merchant: cause visits, redemptions, purchases, repeat visits, reviews, or referrals.
- Host: fill an experience with the right people and know who actually participated.
- Creator: find worthwhile opportunities, perform the agreed action, submit proof, and get rewarded.
- Participant: discover something worth doing, act, receive value, and build a useful PromoCard history.
- Community operator: turn member attention into coordinated participation and visible outcomes.
- Admin: identify what requires intervention and resolve it.

Do not substitute a feature for an outcome.

"Create a campaign" is an action.  
"Get 50 attributable product trials" is an outcome.

### 3.3 What should I do now?

Every workspace must have an obvious **current move**.

The user should not be presented with six equally weighted navigation choices when only one or two actions make sense at their current stage.

The system should infer the next useful move from state where possible.

Examples:

- No client connected → connect or create the first client.
- Client exists but no activation → define the first outcome and build the pilot.
- Activation drafted but missing assets → collect the missing inputs.
- Activation live → monitor execution and remove blockers.
- Results collected → review proof.
- Proof reviewed → decide whether to repeat, change, stop, or scale.

Navigation can remain available, but the current move must dominate the screen.

### 3.4 What proof will show that it worked?

PROMORANG must tell the user what evidence is being collected and what the platform can honestly claim.

Examples of proof:

- verified attendance
- QR claim
- offer redemption
- purchase proof
- direct checkout
- retailer/POS confirmation
- review submitted
- referral completed
- repeat visit
- creator deliverable approved
- attributable signup

Do not imply sales, conversion, footfall, purchase, or ROI unless the available evidence supports that claim.

Prefer:

> "37 verified offer redemptions"

Over:

> "37 customers generated"

unless customer generation is actually proven.

### 3.5 What happens next if it works?

The workspace must connect proof to a decision.

PROMORANG is not merely a reporting interface. The result should tell the user what to do next.

Examples:

- repeat the same activation
- increase the audience target
- fund a larger campaign
- change the offer
- activate a different product
- recruit more creators
- expand to another location
- retarget verified participants
- build a repeat/referral loop
- stop an activity that did not produce enough evidence

The ideal loop is:

**Launch → Move People → Prove → Decide → Repeat / Improve / Scale**

---

## 4. Workspace State Model

A workspace should change according to the user's maturity and the available data.

### State A — New / Empty

The user needs orientation, not a command center.

The primary screen should contain:

1. Workspace purpose
2. First meaningful outcome
3. Recommended first activation or task
4. Required inputs / blockers
5. One primary CTA
6. Explanation of what proof will be collected
7. What happens after the first result

Do **not** show fake activity, placeholder business metrics, invented performance, or "live" language when nothing is live.

Do **not** lead with advanced tooling.

### State B — Preparing

The user has chosen an outcome but is not ready to launch.

Lead with:

- readiness
- missing information
- approvals
- assets
- budget/incentive requirements
- channels
- launch conditions

The dominant question is:

> "What is preventing this from going live?"

### State C — Live

The activity is underway.

Lead with:

- what is currently happening
- progress toward the target
- quality of participation
- operational blockers
- spend/reward usage where relevant
- evidence collected so far

The dominant question is:

> "Is this producing the intended movement, and what requires attention now?"

### State D — Proof Ready

Enough evidence exists to evaluate the result.

Lead with:

- outcome vs target
- verified evidence
- attribution confidence
- cost / incentive context
- notable segments or patterns
- what can and cannot be concluded

The dominant question is:

> "What did we prove?"

### State E — Decision / Scale

The result has been reviewed.

Lead with:

- repeat
- change
- stop
- scale
- retarget
- expand

The dominant question is:

> "What is the highest-value next move based on the evidence?"

---

## 5. Standard Workspace Anatomy

Every major role workspace should follow this hierarchy unless there is a strong documented reason not to.

### 5.1 Context

**Who / what am I operating?**

Examples:

- Pandxtra
- Manchester Hills Foods
- Sea Deck
- Kingston After Dark
- a creator account
- a participant PromoCard

### 5.2 Purpose

**Why does this workspace exist?**

One or two sentences. No product jargon required.

### 5.3 Outcome

**What are we trying to make happen?**

Prefer an observable result over an activity.

### 5.4 Current Move

**What should I do now?**

There should be one visually dominant next action whenever possible.

### 5.5 Inputs / Blockers

**What is missing before I can do it?**

Make dependencies explicit rather than letting the user discover errors later.

### 5.6 Proof

**How will PROMORANG know whether the desired action happened?**

Make the measurement contract visible.

### 5.7 Progress

**How far are we from the outcome?**

Metrics must be real and contextual.

Zero is acceptable. Fabricated placeholders are not.

### 5.8 Decision

**What should happen after the result?**

The interface should convert evidence into the next decision.

### 5.9 Tools

Only after the above is clear should deeper tools, modules, intelligence consoles, configuration, wallets, directories, and advanced controls take visual priority.

---

## 6. Progressive Disclosure Rule

Advanced capabilities should appear when they become relevant.

A first-time brand with no campaign does not need to begin with:

- creator bureau
- correlation maps
- escrow terminology
- intelligence consoles
- six operational arenas
- advanced attribution language

Those may become valuable later.

The interface should earn complexity.

### Principle

> **Do not expose the organizational complexity of PROMORANG when the user only needs the next useful move.**

---

## 7. Language Rule

Use the user's job language before PROMORANG's internal vocabulary.

### Prefer

- Get 50 people to try the product
- Fill 30 remaining spots
- Bring previous customers back
- Collect purchase proof
- Review creator submissions
- See which offer produced redemptions
- Choose the client you want to activate

### Avoid as first-contact language

- Flight Command
- Omni-Channel Flight
- Correlation Map
- Treasury
- Escrow
- Bounty Engine
- Activation Graph
- Momentum Layer

Internal terminology can remain available where it helps expert users, but it should not be required to understand the job.

### Test

If the copy only makes sense to someone who already understands PROMORANG, rewrite it.

---

## 8. Managed Workspace Rule

When one organization is operating another organization — for example an agency managing a brand — the interface must always make the relationship clear.

The user should know:

- **which organization they are currently operating**
- **on whose behalf they are acting**
- **which agency / manager has access**
- **where results will be attributed**
- **how to return to the parent portfolio**

Example:

> **Manchester Hills Foods**  
> Client workspace · Managed by Pandxtra

The interface should not make the agency feel that switching into a client workspace has changed their identity or removed their context.

---

## 9. Empty-State Rule

An empty state is not an absence of content. It is a decision surface.

Every empty state should explain:

1. Why this area matters
2. Why it is empty
3. What the first useful action is
4. What the user will gain from doing it

Bad:

> "No campaigns yet."

Better:

> "No customer activation has been launched for Manchester Hills yet. Start with a small measurable test so you can show the client which products people choose and what actions they take."

CTA:

> **Build the free pilot**

---

## 10. Metrics Integrity Rule

PROMORANG must never create confidence through invented data.

### Prohibited

- fake fallback impressions
- fake redemptions
- synthetic live status on empty accounts
- placeholder ROI presented as actual performance
- demo values without an explicit Demo label

### Required

- use `0`, `—`, `No data yet`, or equivalent when no evidence exists
- clearly label modeled / estimated / projected values
- distinguish verified, self-reported, inferred, and unverified outcomes
- do not upgrade an action into a stronger commercial claim without evidence

Truthful emptiness is better than impressive fiction.

---

## 11. Role-Level Job Contracts

These are starting contracts for the platform-wide audit. They can be refined, but each role must retain an explicit job contract.

| Role | Why am I here? | Primary outcome | Typical current move | Proof | If it works |
|---|---|---|---|---|---|
| Participant | Find worthwhile things and receive value for meaningful participation | Complete useful actions and build a valuable PromoCard history | Choose today's best move | check-in, claim, redemption, proof, referral | unlock more value / return / refer |
| Brand | Create measurable customer movement | attributable trial, purchase, visit, review, referral, repeat | launch or improve one activation | verified action evidence | repeat, change, scale |
| Agency | Produce measurable outcomes for clients | first undeniable managed result | choose client and launch the next useful activation | client-attributed proof | package result and expand account |
| Merchant | Turn attention into customers and repeat behavior | visits, redemptions, purchases, returns | publish/serve the next offer or experience | redemption / transaction / visit proof | retarget and increase frequency |
| Host | Fill and operate experiences with the right people | attendance and participation | publish, invite, manage arrivals | RSVP, check-in, participation | build returning audience |
| Creator | Earn from useful distribution and participation | complete paid/valuable brand actions | choose an opportunity and submit work | approved deliverable / attributable action | earn, improve reputation, unlock work |
| Community | Coordinate members toward useful shared outcomes | participation and member value | publish/organize the next move | participation / completion | retain and deepen community |
| Admin | Keep the system trustworthy and moving | resolve risks, failures, disputes and operational blockers | address highest-priority exception | resolution / audit record | restore healthy operation |

---

## 12. Platform Audit Scorecard

Every major screen/workspace should be audited against the following ten questions.

Score each item:

- `0` = absent / confusing
- `1` = partially present
- `2` = clear and actionable

Maximum score: **20**.

### Audit

1. Can the user tell which identity / organization they are operating?
2. Does the screen explain why this workspace exists?
3. Is the desired outcome stated in user language?
4. Is there an obvious next action?
5. Are prerequisites and blockers visible?
6. Is the proof / measurement contract explicit?
7. Are all displayed metrics real and appropriately qualified?
8. Does the screen explain what happens after success?
9. Is platform jargon subordinate to the user's job?
10. Is advanced complexity progressively disclosed rather than front-loaded?

### Quality thresholds

- **17–20:** Strong job-first experience
- **13–16:** Usable but needs simplification
- **9–12:** Feature-led; user must infer too much
- **0–8:** Fails the Job-First Workspace Standard

A workspace scoring below **13** should not be considered product-complete.

---

## 13. Red Flags

A workspace should be flagged for redesign if any of these are true:

- the title is a product metaphor rather than a user job
- the page opens with more than three equally prominent actions for a new user
- the user must know PROMORANG vocabulary to decide what to do
- a dashboard looks "live" when nothing has happened
- metrics appear without evidence or source context
- the user sees tools before being told the outcome
- the first CTA creates an object but does not explain why
- switching organizations removes management context
- empty states only say that data does not exist
- the interface reports activity but does not help the user make a decision
- success is expressed as platform usage rather than real-world movement

---

## 14. Design Review Questions

Before shipping a new workspace or major surface, product/design/engineering should answer:

### User
- Who is arriving here?
- What do they believe they are responsible for?
- What do they probably **not** know about PROMORANG?

### Job
- What real-world job are they trying to complete?
- What result would make them say this was useful?

### Action
- What is the highest-value next move?
- Can the system determine it from current state?

### Proof
- What evidence will PROMORANG collect?
- What claims can that evidence honestly support?

### Decision
- What decision should become easier after the result?

### Complexity
- Which controls can remain hidden until later?
- Which terminology can be translated into job language?

If these questions do not have crisp answers, implementation should not begin with UI composition.

---

## 15. Engineering Definition of Done

A workspace is not complete merely because its routes, API calls, tables, forms, and components function.

For a workspace to be considered complete:

- [ ] Current identity / organization is explicit
- [ ] Purpose is visible
- [ ] Primary outcome is visible
- [ ] Current move is obvious
- [ ] Missing prerequisites are surfaced
- [ ] Proof method is explained
- [ ] Metrics are truthful
- [ ] Empty state is actionable
- [ ] Success leads to a decision
- [ ] Advanced features are progressively disclosed
- [ ] Managed-workspace context is preserved where relevant
- [ ] Copy can be understood without prior PROMORANG knowledge
- [ ] Mobile layout preserves the same decision hierarchy
- [ ] Loading/error/zero states preserve the job context

---

## 16. Platform Rollout Order

Apply this standard across PROMORANG in the following order because these surfaces are closest to commercial value and user activation:

1. **Agency workspace**
2. **Brand workspace**
3. **Merchant workspace**
4. **Host workspace**
5. **Participant / PromoCard home**
6. **Creator workspace**
7. **Community workspace**
8. **Admin / operator surfaces**
9. **Creation flows** — Campaign, Moment, offer, mission, bounty, product
10. **Secondary surfaces** — wallet, analytics, directories, settings, intelligence tools

For each role:

1. Identify the job contract.
2. Audit the current experience using the 20-point scorecard.
3. Record the biggest comprehension failures.
4. Redesign the first meaningful screen.
5. Correct empty / loading / zero states.
6. Remove fabricated or contextless metrics.
7. Make the next action state-aware.
8. Verify proof language.
9. Test switching and managed-account context.
10. Re-score before considering the role complete.

---

## 17. Relationship to PROMORANG's Operating Model

This UX standard should reinforce the broader PROMORANG demand system:

**Distribution → Participation → Proof → Revenue → Retention → Network Growth**

A user-facing workspace should not expose that entire system as theory.

Instead, each user should see the portion relevant to their current job.

For example:

- a participant sees **a worthwhile next move**
- a creator sees **an opportunity worth completing**
- a merchant sees **a customer action to generate**
- a brand sees **an outcome to prove**
- an agency sees **a client result to deliver**
- PROMORANG connects those actions underneath the interface

The platform architecture may be a network.

The user experience should feel like a clear next decision.

---

## 18. Canonical Product Test

For any PROMORANG screen, ask:

> **If we removed every PROMORANG-specific noun from this screen, would the user still understand why they are here, what they are trying to accomplish, what they should do next, how success will be proven, and what happens after success?**

If the answer is **no**, the screen is too dependent on the platform explaining itself.

The product should first explain the user's job.

---

## 19. Short Form Rule for Designers and Engineers

Use this sequence at the top of every workspace design task:

```text
WHY AM I HERE?
→ WHAT OUTCOME AM I TRYING TO CREATE?
→ WHAT SHOULD I DO NOW?
→ WHAT PROOF WILL SHOW IT WORKED?
→ WHAT HAPPENS NEXT?
```

Then—and only then—design the tools required to support that sequence.

---

## 20. Non-Negotiable

PROMORANG should never make adoption depend on a user becoming a PROMORANG expert.

The platform can be sophisticated underneath.

The experience must remain legible on top.

**The user learns the job first. PROMORANG reveals the machinery only as the job requires it.**
