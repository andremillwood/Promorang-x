# Marketing Audit and Rewrite Roadmap

Last updated: 2026-04-29

This document turns the current marketing audit into an execution plan for Promorang's public-facing pages.

It is based on the current app routes and the current strategic direction emerging in the codebase:

- Moments and real-world participation
- Marks and progression
- Points, Keys, Pieces
- PromoShare and Gems
- network growth across participants, creators, hosts, venues, and brands

It intentionally de-emphasizes older Growth Hub and generic event-tool positioning where those concepts conflict with the current product story.

## Executive judgment

Promorang's marketing is stronger in brand feel than product clarity.

Current rough scores:

- Brand feel: 8/10
- Product clarity: 5/10
- Conversion readiness: 6/10
- Economic credibility: 5/10
- Message consistency: 6/10

The product appears more sophisticated than the site currently explains.

That is the central problem.

## Canonical product story

Every public page should reinforce this loop:

`Find a moment -> show up -> leave a Mark -> earn Points / Keys / Pieces -> qualify for PromoShare -> use Gems -> grow your network and standing`

Supporting rules:

- Marks prove participation.
- Points track engagement and progression.
- Keys unlock access and tier movement.
- Pieces represent participation-linked or performance-linked upside.
- PromoShare is the recurring qualified reward layer.
- Gems are the spendable and payout-safe unit.
- Network growth compounds value for both the user and the platform.

## Strategic problems to solve

### 1. The product loop is not explained once, simply, in one place

The homepage introduces many ideas, but users still have to assemble the system themselves.

### 2. Public pages are unevenly aligned

Some pages reflect the newer model:

- homepage value sections
- creators
- brands
- communities

Other pages still reflect older language or generic product positioning:

- why join
- hosting
- older rewards surfaces

### 3. Economic messaging has historically been too brittle

Public cash-per-Mark language creates a trust problem unless backed by a fully stable and defensible rewards engine.

Public messaging should center:

- qualified rewards
- funded pools
- PromoShare cycles
- Gems denomination

and avoid:

- fixed earnings-per-Mark promises
- vague real-money claims
- unstable or conflicting exchange-rate language

### 4. Network growth is present in the product but under-presented in the story

Promorang has referral and growth graph mechanics, but the marketing does not consistently explain why growing your crew benefits:

- participants
- creators
- hosts
- venues
- brands
- Promorang itself

## Page scorecard

### Tier 1: Core acquisition pages

#### Homepage `/`

Files:

- `apps/web/src/pages/Index.tsx`
- `apps/web/src/components/Hero.tsx`
- `apps/web/src/components/StakeholderPaths.tsx`
- `apps/web/src/components/ValueProposition.tsx`
- `apps/web/src/components/HowItWorks.tsx`

Score: 7/10

What works:

- Distinct visual identity
- Better emotional framing than most platforms in this category
- Increasingly clear references to Pieces, PromoShare, and Gems
- Strong role segmentation entry point

What is weak:

- Too many concepts arrive before one simple system explanation
- No single canonical economy diagram
- Still slightly dense for a first-touch page

Primary objective:

- Make Promorang legible in under 60 seconds

#### For Creators `/for-creators`

File:

- `apps/web/src/pages/ForCreators.tsx`

Score: 7.5/10

What works:

- Strongest current articulation of O2O movement
- Good explanation of creator utility
- Better network framing than most other pages

What is weak:

- Creator economics still need clearer separation from participant economics
- Needs a crisper explanation of what creators earn versus what their audience earns

Primary objective:

- Make creator-led conversion measurable and desirable without sounding like affiliate software

#### For Brands `/for-brands`

File:

- `apps/web/src/pages/ForBrands.tsx`

Score: 7/10

What works:

- Strong commercial tone
- Good shift away from passive impressions
- Clearer than most pages on why verified participation matters

What is weak:

- Some metrics and claims may feel ahead of proof
- Needs an even clearer explanation of what brands are buying

Primary objective:

- Make sponsorship feel like funded behavior infrastructure, not ads

#### For Communities `/for-communities`

File:

- `apps/web/src/pages/ForCommunities.tsx`

Score: 6.5/10

What works:

- Good tone
- Good community identity
- Strong instinct around network effects and host reputation

What is weak:

- Reach multipliers and bonus logic arrive before the base model is fully grounded
- Can feel aspirational before concrete

Primary objective:

- Make community growth feel measurable, trusted, and reward-linked

### Tier 2: Trust and conversion support pages

#### Why Join `/why-join`

File:

- `apps/web/src/pages/WhyJoin.tsx`

Score: 5.5/10

What works:

- Emotional participant framing
- Good understanding of belonging, access, and regular status

What is weak:

- Still reflects older economy language
- Too many reward references that are no longer the cleanest public story
- Best candidate for a full rewrite

Primary objective:

- Become the clearest participant explainer on the site

#### Hosting `/host`

File:

- `apps/web/src/pages/Hosting.tsx`

Score: 5.5/10

What works:

- Practical host tooling benefits are visible

What is weak:

- Reads too much like generic event software
- Undersells Promorang's signal-building and sponsorship unlock model

Primary objective:

- Reframe hosting as reputation and sponsor-readiness infrastructure

#### Pricing `/pricing`

File:

- `apps/web/src/pages/Pricing.tsx`

Score: 6.5/10

What works:

- Practical
- Concrete
- Gives usable budget ranges

What is weak:

- Pricing currently explains numbers better than the site explains the system behind them

Primary objective:

- Support trust after the product story is already understood

#### For Merchants `/for-merchants`

File:

- `apps/web/src/pages/ForMerchants.tsx`

Score: 6.5/10

What works:

- Warm, neighborhood-friendly positioning
- Merchant flow is easy to picture

What is weak:

- Still too light on the long-term value of repeat movement, recognition, and network effects

Primary objective:

- Show merchants why Promorang creates better repeat local behavior than generic discovery apps

#### PromoShare `/promoshare`

File:

- `apps/web/src/pages/PromoShare.tsx`

Score: 6/10 as an explanatory surface

What works:

- Strong as a signed-in product destination

What is weak:

- Behaves more like a dashboard than an explainer
- Users may still not understand PromoShare before landing there

Primary objective:

- Add explanatory framing before operational dashboard detail

## Rewrite priority order

### Priority 1

- Homepage
- Why Join
- Hosting

Reason:

These pages most directly control first-touch understanding.

### Priority 2

- For Communities
- PromoShare
- Pricing

Reason:

These pages shape trust, retention of attention, and category understanding after first interest.

### Priority 3

- For Merchants
- consistency pass across remaining CTAs, SEO descriptions, and support surfaces

## Homepage information architecture

The homepage should tell the entire product story in this order:

### 1. Hero: emotional hook

Goal:

- Make the platform feel culturally alive and useful

Keep:

- distinct visual identity
- real-world moments framing
- role-aware energy

Must answer:

- what is Promorang at the highest level?

Suggested headline:

- `Show up. Get known. Unlock more from real life.`

Suggested subheadline:

- `Promorang turns real-world participation into Marks, access, Pieces, PromoShare eligibility, Gems, and stronger network value.`

### 2. One-line system explainer

Goal:

- Remove ambiguity immediately

Suggested module title:

- `How the system works`

Suggested content:

- `Find a moment`
- `Leave a Mark when you show up`
- `Earn Points, Keys, and eligible Pieces`
- `Qualify for PromoShare cycles`
- `Use Gems across the platform`

This should be visual, simple, and non-poetic.

### 3. What a Mark means

Goal:

- Turn the abstract term into a concrete concept

Suggested title:

- `A Mark means you were really there`

Suggested subheadline:

- `Promorang remembers where you show up, who you support, and how consistently you move.`

### 4. Value layers

Goal:

- Explain Points, Keys, Pieces, PromoShare, Gems in one clean block

Suggested title:

- `One action can unlock multiple layers of value`

Suggested structure:

- Points: progression
- Keys: access
- Pieces: complementary early-participant and power-performer upside
- PromoShare: recurring qualified reward cycles
- Gems: the spendable unit

### 5. Early participants and power performers

Goal:

- Explain the most differentiating part of the system

Suggested title:

- `Two participant paths can compound fastest`

Suggested breakdown:

- Early participants: show up first, verify early, qualify for complementary pieces and better access
- Power performers: move people, refer others, create repeat action, qualify for stronger weight and upside

### 6. Role paths

Goal:

- Let people self-select without losing the canonical story

Existing `StakeholderPaths` can remain, but copy should align strictly to the same loop.

### 7. Network growth

Goal:

- Make the referral/crew/graph logic explicit

Suggested title:

- `Your network should compound your value`

Suggested subheadline:

- `Inviting the right people, creating repeat movement, and building trusted connections should increase standing, eligibility, and opportunity.`

### 8. Final CTA

Goal:

- Push users to a first action, not abstract exploration

Best CTA hierarchy:

- Primary: `Find your first moment`
- Secondary: `See how rewards work`

## Headline and subheadline replacements

These are suggested directionally, not as mandatory final copy.

### Homepage

Current need:

- clearer system explanation

Suggested headline:

- `Show up. Get known. Unlock more from real life.`

Suggested subheadline:

- `Find moments worth joining, leave Marks when you arrive, and turn participation into access, Pieces, PromoShare eligibility, Gems, and stronger local standing.`

### Why Join

Current issue:

- emotionally strong but strategically outdated

Suggested headline:

- `Why join? Because real life should add up.`

Suggested subheadline:

- `Promorang helps you find better plans, become known where you return, and turn consistent participation into real progression across Points, Keys, Pieces, PromoShare, and Gems.`

### Hosting

Current issue:

- sounds too much like event software

Suggested headline:

- `Host the room people return to.`

Suggested subheadline:

- `Promorang helps hosts build signal, prove community momentum, and unlock sponsor support when participation becomes real and repeatable.`

### For Communities

Current issue:

- network effect logic arrives too abstractly

Suggested headline:

- `Build a scene people want to come back to.`

Suggested subheadline:

- `Gather people, let them leave Marks, and turn repeat participation into trust, reputation, PromoShare relevance, and partner opportunity.`

### For Creators

Current issue:

- needs sharper economic separation

Suggested headline:

- `Turn stories into real-world movement.`

Suggested subheadline:

- `Link content to places, missions, and moments so your audience can watch, show up, unlock, and create measurable action you can prove to brands.`

### For Brands

Current issue:

- needs clearer unit of purchase

Suggested headline:

- `Fund moments people actually want.`

Suggested subheadline:

- `Promorang gives brands a way to sponsor verified participation, repeat movement, and recurring reward loops instead of buying passive attention.`

## Section outlines by page

### Rewrite outline: Why Join

This page should become the participant onboarding explainer.

Recommended sections:

1. Hero
2. What is a moment?
3. What is a Mark?
4. What do you earn?
5. How early participants and power performers benefit
6. How PromoShare works
7. Why Gems exist
8. Find your first moment CTA

Sections to remove or rewrite heavily:

- older cash reward framing
- generic “qualified earnings” copy
- any section that sounds like gamified points without explaining the larger system

### Rewrite outline: Hosting

Recommended sections:

1. Hero: host signal, not just event creation
2. What hosts build: rhythm, trust, repeat movement
3. How Marks make host value measurable
4. When sponsorship unlocks
5. What hosts can fund or reward
6. Host dashboard and analytics
7. CTA to host first moment

Sections to de-emphasize:

- generic feature grid language that could belong to any event platform
- subscription-style SaaS framing if it conflicts with the current go-to-market model

### Rewrite outline: For Communities

Recommended sections:

1. Hero
2. Build a repeatable scene
3. Let attendees leave Marks
4. Why network growth matters
5. How community leaders become more valuable over time
6. Partner and sponsor readiness
7. CTA

### Rewrite outline: PromoShare

Recommended sections above the dashboard:

1. What PromoShare is
2. What increases your eligibility
3. How cycles work
4. Why rewards are qualified
5. Then dashboard tabs

## Message rules

All future public copy should follow these rules.

### Use these ideas often

- verified participation
- real-world movement
- become known where you show up
- early participant pieces
- power performer pieces
- qualified rewards
- PromoShare cycles
- Gems as the spendable value unit
- network growth that compounds

### Avoid these ideas unless strictly necessary

- fixed earnings per Mark
- real money just for showing up
- generic influencer/affiliate language
- generic event software language
- floating or ambiguous Gem value

## Concrete implementation plan

### Phase 1: clarity foundation

- Add canonical economy explainer section to homepage
- Rewrite Why Join completely
- Rewrite Hosting around host signal and sponsor unlock

Success condition:

- New visitor can explain the product loop after one homepage session

### Phase 2: role coherence

- Tighten For Communities
- Tighten For Merchants
- Add explanatory intro to PromoShare
- Align Pricing language with the clarified system

Success condition:

- Each stakeholder page feels like a specialization of the same platform, not a separate product

### Phase 3: trust polish

- standardize SEO descriptions
- standardize CTA language
- remove remaining legacy economy phrasing
- ensure nav labels and product labels match marketing labels

Success condition:

- No meaningful copy conflict remains between public pages

## Recommended CTA system

To reduce copy sprawl, default to this CTA stack:

- Participants: `Find Moments`
- Creators: `Start as a Creator`
- Hosts: `Start Hosting`
- Communities: `Create Your First Moment`
- Brands: `Explore Outcomes` or `Fund a Moment`
- Merchants: `Register Your Spot`
- Economy explainers: `See how rewards work`

## Final judgment

Promorang does not have a weak marketing problem.

It has a coherence problem.

The visual system, tone, and ambition are already stronger than average.
The next leap comes from making the economy and participation model much easier to understand, trust, and repeat across every page.
