# PROMORANG Participant World UI Overhaul v1

## Thesis

PROMORANG should not feel like a collection of SaaS dashboards with entertainment content inside them.

The participant experience should feel like a living cultural and commercial world with a small number of tactile objects:

`TODAY → DISCOVER → SCENE → MOMENT → PROMOCARD → PROVE → VAULT → RETURN`

The UI should answer one question at a time:

- **Today:** What is the one useful move right now?
- **Discover:** What is moving and what are people asking for?
- **Scene:** What persistent context am I entering?
- **Moment:** What can I do here now?
- **PromoCard:** What access do I possess and present?
- **Prove:** Did the action count yet?
- **Vault:** What actually stayed with me?
- **Return:** What opened because of verified history?

## Visual direction

### Not this

- admin dashboard chrome
- repeated metric cards
- interchangeable rounded SaaS panels
- dense tab forests
- every object rendered as the same card
- financial-wallet metaphors for cultural history
- fake activity added to make empty surfaces feel populated
- game UI pasted over real-world utility

### This

- nocturnal editorial city-guide energy
- large asymmetric typography
- full-bleed cultural imagery when a real image exists
- restrained dark surfaces with orange/amber signal color
- tactile object types that look materially different from each other
- PromoCard as credential
- Piece / memory as receipt or relic
- Moment as a place/action poster
- Discovery as a demand signal
- Scene as a doorway into persistent context
- perk as something usable, not a marketing tile
- strong whitespace and one dominant action per viewport

## Participant hierarchy

### Today / Home

The first screen should not summarize the whole account.

Priority:

1. **One move today**
2. **PromoCard**
3. **Now & next** from verified Moment supply
4. **Your world** — Scene + Vault
5. **Latest verified consequence**
6. optional live cultural release
7. operator-workspace switch only when the same person has stakeholder roles

Participant setup/playbook/operator modules do not lead the member home.

### Discover

Discover is a market-construction surface, not a content dump.

Objects should remain visibly distinct:

- Discovery = signal / question
- Moment = scheduled action
- perk = usable supply
- Scene = persistent context
- place = geographic anchor
- release/content = cultural distribution object

No object should inherit transactional language from another object.

### Scene

Scene is one of PROMORANG's strongest differentiated surfaces.

It should feel like entering a persistent cultural market/context rather than opening a category page. Existing full-bleed Scene detail is directionally correct and should not be flattened into the generic participant shell for consistency.

### Moment

Moment should move away from a large event-SaaS detail page.

Above the fold should answer:

- what is this?
- where / when?
- what access do I need?
- what is my current state?
- what is the next action?

Secondary information belongs lower in the page. Synthetic missions, point economics or rewards must never be used as decorative UI.

### PromoCard

PromoCard is the participant credential and should be a visual anchor.

It should feel:

- presentable
- ownable
- contextual
- tied to issuer / Scene / return history
- distinct from a payment card

Primary state is what the person can do with it now. The reverse side is presentation / validation.

### Prove

Proof UI should be procedural and confident, not gamified.

States:

`READY → SUBMITTED → UNDER REVIEW → VERIFIED | REJECTED`

Submission is not attendance. Verification is the transition that creates downstream consequences.

### Vault

Vault is retained world/history, not a crypto or fintech wallet.

Information architecture:

- **Use** — possessed perks / entitlements
- **Chance** — PromoShare entries
- **Keep** — verified memories / Pieces
- **Backing** — explicit value/reserve inspection where applicable

Truth lines remain visible:

`MEMORY ≠ MONEY`
`ENTRY ≠ WIN`
`CLAIM ≠ REDEMPTION`

## Shared visual system

Implemented in `apps/web/src/styles/participant-world.css`.

Core primitives:

- `.participant-world`
- `.pr-world-wrap`
- `.pr-world-header`
- `.pr-world-canvas`
- `.pr-world-hero`
- `.pr-world-panel`
- `.pr-world-object`
- `.pr-world-object-grid`
- `.pr-world-strip`
- `.pr-world-chip`
- `.pr-world-primary`
- `.pr-world-ledger`
- `.pr-world-empty`

This is a participant visual grammar, not a universal stakeholder theme. Merchant, host, creator, brand, agency and admin should keep role-appropriate information density and operating metaphors.

## Implemented in this pass

- new participant-world CSS system loaded globally
- ExperienceShell converted from narrow SaaS content column to wider editorial world frame
- participant Today/Home rebuilt around one move + PromoCard + verified Now & Next + Scene/Vault/Return
- operator mode separated from participant Home composition
- PromoCard object enlarged and made more credential-like
- Vault rebuilt as **Use / Chance / Keep / Backing**
- MomentCard rebuilt as an editorial action object
- DiscoveryWidget rebuilt as an editorial demand signal
- Discovery vote UI no longer claims local points/tickets were issued
- LivePerkCard rebuilt as a usable object
- Community link rebuilt as a Scene doorway

## Preserve

The UI overhaul must not undo the canonical truth work already landed in this branch:

- static/editorial fixtures are not actionable production inventory
- vote != attendance
- demand != supply
- RSVP != attendance
- proof submission != verified attendance
- validation != purchase
- purchase != fulfillment
- entry != win
- memory != money
- browser-local state != durable issuance

## Remaining UI migration

1. **Discover page composition**
   - reduce top-level tabs and utility controls
   - create a stronger primary editorial feed
   - keep demand / supply / Moments visually distinct

2. **Moment detail**
   - simplify above-the-fold hierarchy
   - collapse secondary SaaS/event-management UI
   - center participant state and next action

3. **PromoCard page composition**
   - make the credential the hero object
   - move filters/settings/context below the card
   - reduce stacked explanatory panels

4. **Proof/check-in**
   - visually align procedural states with participant world system
   - keep pending state calm and explicit

5. **Navigation / transitions**
   - make Today → Discover → Scene → Moment → Card → Vault feel continuous
   - preserve accessibility and reduced-motion behavior

## Acceptance criteria

The participant experience is ready when a first-time user can look at each screen and answer, without product explanation:

1. Where am I?
2. What is the main object here?
3. What can I do next?
4. What will happen if I do it?
5. What has actually happened already?

If a screen requires dashboard literacy or internal PROMORANG terminology before those questions are clear, the overhaul is not finished.
