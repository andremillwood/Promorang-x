# Public Experience Convergence v1

Status: stacked on `design/canonical-object-system-v1`.

Authoritative dependencies:
- `DESIGN.md`
- `docs/design/discovery-scene-market-construction-v1.md`
- `docs/design/promocard-world-experience-v1.md`
- `docs/design/design-lab-canonical-production-bridge-v1.md`
- `docs/design/a-plus-platform-execution-plan.md`
- `docs/design/marketing-current-return-visual-system-v1.md`
- `.cursor/rules/promorang-object-surfaces.mdc`

## Thesis

Public PROMORANG is the first usable layer of the same canonical market, not a brochure for a different signed-in application.

The public product must work for two kinds of people:

1. people who already know what they want,
2. people who recognize what they want only after they encounter something.

A visitor should therefore be able to **discover**, **recognize**, **express**, **join** or **keep** a legitimate market object before authentication becomes the dominant concern.

Human-facing loop:

**Discover → Recognize / Want → Signal → Keep → Respond / Act → Prove → Return**

Canonical truth underneath remains:

`PROPOSAL → REVIEW → APPROVED DISCOVERY → INTEREST / DEMAND → SCENE CONTEXT → MOMENT / OFFER / PERSON → VERIFIED ACTION → RETAINED HISTORY`

The public layer may compress explanation. It must not collapse those states.

## Discovery and Demand are complementary, not competing

### Discovery

A Discovery is approved public knowledge: something PROMORANG is willing to publish as real or worth knowing.

Discovery answers:

**What exists / what should I know?**

Its public job is larger than content. Discovery can help a person recognize a want they did not arrive with.

Examples:
- a place that recently opened,
- an overlooked local option,
- a cultural pattern,
- a useful service,
- something new or changing in a market.

### Demand

Demand answers:

**What are people asking for / moving toward?**

Demand is a market signal, not supply.

The product should allow both paths:

`DISCOVERY → REACTION / INTEREST → DEMAND`

and

`RAW WANT → DISCOVERY MATCH → EXISTING DEMAND MATCH → UNRESOLVED WANT`

This means PROMORANG should not treat every open-text ask as an immediate new public Signal.

## Discovery-first resolution law

When a person expresses a want, PROMORANG should attempt to resolve it against known market state before manufacturing another public object.

Preferred resolution order:

1. approved Discoveries that may already satisfy the want,
2. existing recorded Demand that the person may join,
3. unresolved want retained for matching / later aggregation,
4. a new public Demand question only when the product has a legitimate reason and authoritative path to create one.

The public UX may say:
- **We found something**
- **Others are asking for this**
- **You are early**
- **Nothing matches yet**

It must not say a market exists merely because one local browser submitted a sentence.

### Current implementation

The homepage now performs a conservative client-side related-object check over the approved Discoveries and recorded Demand already loaded from production sources.

If related objects are found:
- the user sees them first,
- the interface says they are **related**, not exact semantic matches,
- a new ask is not recorded automatically,
- the user must explicitly choose **None of these — keep looking for this** to continue.

If no useful match is found, the existing authoritative demand-recording path runs as before.

This is a pragmatic first-pass resolver, not a claim that PROMORANG already has a complete semantic intent graph. A stronger server-backed matching / clustering system can replace it later without changing the public interaction law.

## Demand Signal is a presentation, not a new data family

The canonical object already exists as the **Demand question** defined in `discovery-scene-market-construction-v1.md`.

`DemandSignalObject.tsx` is its public presentation.

Underlying chain:

`QUESTION → OPTION → RECORDED VOTE → AGGREGATE SIGNAL → HUMAN / OPERATOR RESPONSE`

The visual presentation should make these legible:

1. question / want,
2. market or city,
3. real recorded votes,
4. configured threshold when present,
5. possible response when explicitly recorded/configured,
6. one next action.

Truth gates:
- `VOTE ≠ ATTENDANCE`
- `DEMAND ≠ SUPPLY`
- `THRESHOLD ≠ AUTOMATIC MOMENT`
- `SIGNAL ≠ OFFER`
- `OFFER ≠ PURCHASE`

A threshold being met must therefore render as **threshold met**, never **unlocked**, unless a separate supply/offer/Moment record actually exists.

Implementation anchor:

`apps/web/src/components/promorang/DemandSignalObject.tsx`

## PromoCard is central continuity, not an after-the-fact rewards page

PromoCard answers:

**What does any of this mean for me over time?**

Public messaging should position PromoCard as the participant continuity layer across the market lifecycle.

Conceptually it can organize relationships such as:

- **Want** — things I am looking for,
- **Behind** — legitimate signals / interests I joined,
- **Open** — access, Offer or Moment consequences actually made available to me,
- **Kept** — verified / issued history I legitimately retained.

Not every one of these states requires a new backend family. They are participant lenses over canonical truth.

PromoCard must never invent access or retained value merely because a person expressed demand.

`WANT ≠ ACCESS`

`SIGNAL ≠ ENTITLEMENT`

`CLAIM ≠ VERIFIED CONSEQUENCE`

The signup / authentication reason should increasingly be continuity:

**Keep your place in what happens next.**

Authentication should preserve the object / action that gave the person a reason to stay.

## People do not always know what they want

A blank input is not the whole acquisition product.

PROMORANG should support three states of desire:

1. **Explicit demand** — the person can already state the want.
2. **Recognized demand** — the person encounters a Discovery or Signal and says, effectively, “I want that too.”
3. **Emergent preference** — repeated interactions suggest possible relevance, but PROMORANG asks the person to confirm rather than claiming to know their hidden desire.

Public copy should therefore use both:

- **Looking for something? Tell PROMORANG.**
- **Not sure? See what is moving / worth knowing.**

PROMORANG may infer relevance. The participant confirms whether it matters.

## Cold-start operating mode

PROMORANG must remain useful before network effects exist.

When there are few or no production Discoveries / Demand questions / Moments / Offers, the system should not fabricate social proof.

Cold-start responsibilities are:

### Curate

PROMORANG operators / approved contributors can publish legitimate Discoveries from verifiable market knowledge.

### Ask

PROMORANG may publish clearly framed market-research / demand questions that begin at zero recorded votes.

A platform-authored question is not evidence that a crowd already wants the thing.

### Recruit

When a person is early, the UX can make that useful:

- **You are early.**
- **You started this.**
- **Bring in people who would want this too.**

Do not display `0 people want this` as manufactured failure theatre. Make the next legitimate action clear.

### Search / source

An unresolved want can become a sourcing problem:

**We do not have a good answer yet. Want PROMORANG to help find one?**

This can later feed operator, scout, creator or AI-assisted discovery workflows without pretending the requested thing already exists.

## Production absence is part of the experience

The public experience must not seed fake market activity.

Use:
- approved production Discoveries,
- production listing demand questions,
- production city demand questions,
- their recorded vote counts,
- confirmed writes,
- real linked Scene / Moment / Offer context.

If there are no recorded questions, say so.

If there are no approved Discoveries, say so.

If there is no response supply, do not imply one.

Empty market state is useful information because it tells PROMORANG what sourcing and distribution work remains.

## Failed write law

A public ask is not confirmed merely because the browser stored it locally.

- successful authoritative write → may say **recorded**,
- failed authoritative write → must say recording could not be confirmed,
- local/browser state must not be counted or presented as durable public market activity.

This follows PR #129's broader rule:

`LOCAL CLIENT STATE ≠ DURABLE PLATFORM HISTORY`

## Authentication continuity

Authentication is a checkpoint, not a product reset.

A public action should preserve its object and return path whenever the current infrastructure supports it.

Examples:
- open a Discovery → authenticate → return to that Discovery,
- open / join a Demand signal → authenticate → return to that signal,
- begin a Moment / claim flow → authenticate → resume the same object,
- choose to keep a relationship → authenticate → continue into PromoCard rather than generic home.

Use existing `next` / return-path infrastructure.

## Public information architecture

Primary public mental model:

- **Explore** — approved market knowledge and current legitimate opportunities.
- **Wanted** — recorded Demand questions and signals.
- **Moments** — concrete things people can actually join or do.
- **For business** — understand market evidence, then create a distinct response.
- **Build with PROMORANG** — choose a path by job-to-be-done.

Do not make internal modules the primary navigation model.

## Object continuity

Public and signed-in surfaces should use the same canonical vocabulary while respecting different role lenses.

### Discovery
Approved public knowledge.

### Demand question / Signal
Recorded expressed interest. Not supply.

### Scene
Persistent cultural / market context.

### Moment / Offer / Person
A concrete response or opportunity.

### Ticket / Pass
Access when access actually exists.

### Receipt / proof artifact
Evidence that a state transition or verified action actually occurred.

### PromoCard
Participant continuity for legitimate wants / relationships plus actually issued access, returns and retained history. Presentation must still preserve source truth.

### Piece / Memory
Retained consequence only when durably issued.

## Public homepage

Implementation anchor:

`apps/web/src/components/marketing/PublicMarketHome.tsx`

The homepage should:

1. support both **explore** and **express** entry modes,
2. lead with a human benefit rather than internal market terminology,
3. show approved Discoveries when legitimate records exist,
4. show recorded Demand when legitimate signals exist,
5. preserve honest empty state when either source is absent,
6. resolve open-text Wants against related loaded Discovery / Demand before recording another ask,
7. require explicit user confirmation when related objects exist but do not satisfy the person,
8. allow a visitor to record an ask without pretending a failed write succeeded,
9. make PromoCard a central continuity reason to stay,
10. show only production-backed state as public market evidence,
11. separate demand from operator response and response from verified outcome.

Recommended public proposition:

**Discover what moves you. Help shape what happens next.**

Supporting explanation:

**Find something worth knowing. Show what you want. Join what other people are asking for. Keep your place in what happens next with PromoCard.**

## Marketing physics

The public suite should feel like PROMORANG, not merely explain PROMORANG.

Canonical visual grammar:

`Current → Signal → action → consequence → Return`

The name's boomerang logic is expressed as trajectory and consequence:

`Throw → Flight → Impact → Return`

This is primarily a composition and motion system, not participant jargon.

Use:
- curved trajectories through hero/media compositions,
- trails behind Discovery / Moment / Offer rails,
- state-aware Signal motion,
- consequence receipts,
- Return arcs that visually land back at PromoCard,
- editorial photography as atmosphere only when clearly separated from production inventory.

Do not:
- use a literal boomerang icon as repeated decoration,
- animate objects in ways that imply unsupported live state,
- replace participant actions with lore terms,
- hide empty production state behind editorial imagery.

Participant CTAs remain human:
- Explore
- Tell PROMORANG
- See what’s out there
- Keep this
- Join
- Use perk
- Check in
- See what changed

## Operator marketing suite

Operator pages must not describe a different product from the participant homepage.

Every role lens should answer:

1. **What is true?** — Discovery / approved context.
2. **What do people want?** — recorded Demand.
3. **What can this operator legitimately add?** — Moment / Offer / creator response / Scene / governed program.
4. **What can be proven afterward?** — verified evidence / retained consequence.

Shared implementation anchor for non-merchant / non-brand role pages:

`apps/web/src/components/marketing/MarketRoleLanding.tsx`

Role-specific meaning:

- **Creator** — move attention toward legitimate objects; keep attention distinct from verified action.
- **Host** — convert justified demand into a real Moment; RSVP remains distinct from attendance.
- **Community / Scene lead** — create persistent context; Scene membership remains distinct from attendance.
- **Agency** — orchestrate client responses; observed / attributed / verified / value states remain separate.
- **Enterprise** — govern the same definitions across teams and markets; local state does not rewrite durable truth.
- **Merchant** — see demand, release actual supply, validate consequences.
- **Brand** — see demand before spending, choose a response, then evaluate source-backed outcomes.

## Design Lab role

Design Lab should develop PROMORANG's proprietary **presentation and interaction vocabulary** on top of canonical truth, not invent parallel product state.

Every experiment should answer:
- Which canonical object/state is this rendering?
- What is the authoritative source?
- Which state transitions are real?
- Which equivalences are forbidden?
- What should the object look like before and after a verified transition?
- Can the same object survive public → auth → signed-in continuation?
- Is there one dominant next action?

When a presentation proves durable, promote the visual pattern without creating a new data family unless a separate canonical architecture decision explicitly requires one.

## Migration status

Completed in this public convergence slice:

1. Homepage framing and public Demand presentation.
2. Approved Discovery + recorded Demand are both first-class public entry surfaces.
3. Lightweight resolve-before-record behavior checks related loaded Discovery / Demand before recording another ask.
4. `/for-brands` and `/for-merchants` converge around `demand → response → verified outcome`.
5. `/how-it-works` and `/what-is-promorang` tell the canonical human journey.
6. `/join` preserves job-first routing while using the shared market model.
7. Creator, host, community, agency and enterprise marketing lenses use the same object / truth model.
8. PromoCard is positioned centrally as participant continuity rather than an unrelated rewards wallet.

Next:

1. move resolve-before-record from lightweight client matching toward a stronger authoritative matching / clustering service when real usage justifies it,
2. preserve object / return-path continuity through authentication for public Discovery / Demand / Moment / Offer journeys,
3. migrate public creator / merchant / venue / offer profile pages where they contradict canonical semantics,
4. migrate campaign / activation landing pages to preserve `signal → response → verified consequence` boundaries,
5. test cold-start behavior against truly empty production markets,
6. measure whether Discoveries and Demand produce PromoCard retention rather than optimizing only for signup count.

## Acceptance test

A new participant should answer within ten seconds:

1. Is there something real here worth discovering?
2. If I know what I want, where do I express it?
3. If I do not know what I want, can PROMORANG help me recognize something relevant?
4. What does my action mean — and what does it **not** mean?
5. Why should I keep this relationship on PromoCard?

A new operator should answer within ten seconds:

1. What is true in this market?
2. What recorded demand exists?
3. What can I legitimately put into market?
4. What can I prove afterward?
5. Which states must never be collapsed in reporting?

If either journey requires a feature matrix, invents activity to look alive, or makes PromoCard feel like an unrelated rewards wallet, the surface has failed convergence.


## Anonymous Discovery and Moments

`/discover` and `/discover/moments` are public product surfaces, not reduced versions of a signed-in dashboard.

### Anonymous `/discover`

Public Discovery should compose:
1. editorial ways into the world,
2. approved Discoveries,
3. canonical current / upcoming Moments,
4. real public Offers / perks,
5. recorded shared interest,
6. a plain-language “Looking for something?” path,
7. PromoCard continuity.

Truth boundaries:
- editorial lens ≠ approved Discovery,
- editorial hero fallback ≠ live Moment,
- public Offer ≠ issuance / claim / redemption,
- recorded interest ≠ supply,
- quiet inventory remains visibly quiet.

Implementation anchor:
`apps/web/src/components/discovery/PublicDiscoverExperience.tsx`

### Anonymous `/discover/moments`

The public Moment directory is the action/calendar layer of the world.

It must use the canonical Moment feed for current inventory and organize production records by lifecycle:
- live,
- starting soon,
- upcoming,
- recently happened.

Demo Moments / example playbooks must not be substituted into the anonymous calendar. Editorial imagery may be used only as clearly identified atmosphere when no production Moment can supply the hero image.

Implementation anchor:
`apps/web/src/components/discovery/PublicMomentsExperience.tsx`

### Signed-in continuity

Authentication should personalize the same world rather than visually teleporting the participant into unrelated software.

For this slice, signed-in participants continue to receive the existing richer Discovery / Moment surfaces while the anonymous layer is overhauled. Future convergence should bring the same world-first visual language and participant semantics into signed-in Discovery without removing role-specific utility.


## Public object destinations

Public acquisition does not end at the collection rail. Clicking a real object must deepen the world rather than dropping the visitor into legacy application chrome.

### Discovery detail

`/discoveries/:slug` remains source-backed approved knowledge and now carries:
- Current trajectory through the hero,
- Watch / return continuity,
- linked Scene / place / contributor context only when those records exist,
- PromoCard as the place the relationship can return,
- explicit truth boundaries.

### Moment detail

Logged-out `/moments/:id` now uses `PublicMomentDetail` rather than the legacy signed-in Moment workspace.

The anonymous detail reads the canonical public Moment feed and presents:
- lifecycle,
- recorded time and place,
- recorded reward/access copy when present,
- authentication that returns to the same Moment,
- PromoCard continuity,
- Moment ≠ attendance / RSVP ≠ attendance / perk shown ≠ issuance.

Demo / curated Moment fallback is not allowed in this anonymous path.

Signed-in participants continue into the richer existing Moment detail in this slice.

### Rewards / responses

`/discover/rewards` is a public supply-and-response surface:
- Demand remains recorded interest,
- public Offers are distinct supply,
- reward-bearing Moments are distinct responses,
- source failures are not rendered as empty inventory,
- PromoCard explains watching → issued access → used / verified consequence.


## Public Object System v2

The public reference model is not “make everything an event page.” It is:

`MEDIA → IDENTITY → CONTEXT → ACTION → DEPTH → RELATIONSHIPS → MORE`

Public product destinations should answer the object's human question before explaining PROMORANG:
- Moment → Why should I show up?
- Discovery → Why should I know about this?
- Offer → Why should I claim / use this?
- Merchant → Why should I visit / buy / book here?
- Scene → Why should I become part of this?

### Moment
Media-first destination with real lifecycle, time, place, recorded access/perk, one primary continuation, then related and additional canonical Moments. The old explanatory TicketPass / receipt / giant PromoCard education sections are removed from the anonymous Moment destination.

### Discovery
Editorial knowledge destination. Watching is the primary retained relationship. Scene, place, contributor, gallery and source links deepen the object only when those records exist. Related approved Discoveries create onward exploration. Public doctrine / truth-boundary cards are not consumer content.

### Offer
Access destination with the actual benefit, availability window, merchant relationship when known, and a visible `Available → Claim → Use` progression. Claim remains distinct from redemption.

### Merchant
Living storefront driven by public commerce inventory. The merchant hero is followed by actual Offers, bookable services and products. Missing inventory remains missing. Storefront is not an operator dashboard.

### PromoCard
PromoCard is the persistent personal layer behind public objects. It should usually appear as a compact “keep / claim / return” continuation on public object pages rather than dominating the page as a large marketing mockup.

### Signature objects
Use a TicketPass when a pass-like state exists. Use a PaperReceipt when a receiptable consequence exists. Use PromoCard prominently when showing retained personal state. Do not use signature objects as decorative containers for explanatory product doctrine.
