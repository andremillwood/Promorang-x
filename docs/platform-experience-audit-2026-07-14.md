# Promorang Platform Experience Audit

Date: July 14, 2026

## Executive assessment

Promorang has a strong visual point of view on its public homepage and an unusually rich product model. The logged-in product does not yet express that model with the same confidence. Its recurring weakness is not color, typography, or card styling. It is composition: too many route-level components expose every available concept at once, so completeness overpowers focus.

The platform needs one shared experience grammar:

- One primary user intention per screen.
- Tabs for peer workflows or alternate lenses.
- Carousels and horizontal rails for browseable peer collections.
- Drawers, accordions, and expandable summaries for secondary configuration.
- Steppers for consequential creation workflows.
- Tables and command surfaces for operational density.
- Cards only when an item is independently actionable or meaningfully comparable.
- Role permissions should grant access without forcing every permitted tool into the primary view.

## Evidence from the implementation

- 169 registered routes are supported by 116 page files.
- 36 page or dashboard modules use deep `space-y-8` stacking patterns.
- Tabs exist in 34 modules, but they are applied inconsistently and often appear after several stacked summary panels.
- The shared carousel primitive is now in production on Moment media; collection rails remain the next expansion point.
- `MomentDetail.tsx` is approximately 1,800 lines and `CreateMoment.tsx` approximately 1,780 lines. Several other major product pages exceed 700 lines.
- The shared `StakeholderReturnPanel` has been removed from Creator, Host, Brand, and Merchant dashboard homes.
- Discovery, growth, commerce, organizer, and dashboard concerns are spread across several overlapping route families and legacy aliases.

These are signals of page-by-page accumulation rather than a deliberate system of screen archetypes.

## Implementation progress — July 14 release

- Added one shared, sticky role-workspace control across Creator, Host, Brand, Merchant, and Agency dashboards.
- Removed explanation-first return panels from the four dashboard homes that used them.
- Reframed Agency around Client accounts, Activations, and Impact instead of a stacked portfolio explanation.
- Preserved the existing guided Create Moment flow and converted Edit Moment from one long form into Promise, Place & timing, Proof & unlock, and Media workspaces with a persistent save action.
- Connected Wallet, Vault, Rewards, and Growth with one shared personal-value navigation layer.
- Consolidated the duplicate `/explore` entry point into the richer `/discover` system.
- Converted Admin Operations from three grids of mini-cards into a tabbed, row-based live queue for Gems holds, redemptions, and support escalations.

Remaining work is now concentrated in deeper route families: collection rails on role workspaces, shared discovery filters on all directory pages, additional admin tables and drawers, and decomposition of the largest route modules.

## Public participation boundary

Guests can browse and share the parts of Promorang that create discovery value: Moments, content drops, Scenes, creators, brands, venues, merchants, hosts, public commerce listings, and reward directories. Public Moment pages expose Overview, Participate, Activity, and Details so a visitor can understand the promise, place, proof, unlock, host, and current signal before registering.

Authentication begins where the action creates durable identity, attribution, money, access, or moderation state: joining, check-in, proof submission, reactions, comments, recorded content distribution, reward claims, saved state, Wallet activity, creation, editing, and management. Creation, Moment editing, and Moment check-in now use explicit route protection as well as their existing page/API authorization checks. Guest content-link opens no longer attempt to create attributed distribution records.

## Experience scorecard

| Surface | Current assessment | Primary issue | Recommended pattern |
| --- | --- | --- | --- |
| Public homepage | Strong | Quality drops after authentication | Preserve as the visual benchmark |
| Public role marketing | Good but verbose | Repeated explanation across long landing pages | Editorial chapters with focused proof rails |
| Participant home | Strong after July 14 redesign | Needs continued personalization and real-content QA | Cinematic home plus ranked mixed feed |
| Feed and Pulse | Stronger after July 14 redesign | Separate feed routes previously diverged | One shared mixed-content feed system |
| Moment detail | Improved in this pass | Previously combined guest, participant, host, economy, proof, and social states in one stack | Role-aware tabs plus media carousel |
| Discovery and Search | Promising but fragmented | Multiple parallel discovery routes and dense result compositions | Shared discovery shell, filter tabs, collection rails |
| Creator dashboard | Functionally rich, visually crowded | Hero, return explainer, onboarding, progress, stats, and tabs all compete | Studio tabs with a single next-action header |
| Host dashboard | Functionally rich, visually crowded | Summary and educational panels precede operational work | Control-room tabs with live Moment carousel |
| Brand dashboard | Dense | Strategy, proof, campaigns, education, and returns compete | Portfolio summary plus Campaign, Proof, Audience, Finance tabs |
| Merchant dashboard | Dense | Venue operations, rewards, visits, commerce, and explanation share one stack | Venue switcher plus Today, Customers, Offers, Commerce tabs |
| Agency dashboard | Dense and multi-tenant | Client context and platform context are not separated strongly enough | Persistent client switcher plus client-scoped workspaces |
| Create/Edit Moment | High structural risk | Very large forms and too much simultaneous configuration | Saved multi-step wizard with review screen |
| PromoShare | Rich but concept-heavy | Mechanics and education can overpower live opportunities | Opportunities, Active shares, Earnings, Learn tabs |
| Content Drops/Missions | Good foundation | Browse, create, proof, and reporting are inconsistently separated | Browse/Create/Active/Results workspace |
| Wallet, Vault, Growth | Fragmented personal value story | Balances, memories, access, earnings, and progress are split across many routes | Unified personal value hub with clear subnavigation |
| Marketplace and Pieces | Visually distinctive but separate | Commerce and ownership patterns diverge | Shared asset detail grammar and transaction drawer |
| Admin | Functionally mature, visually inconsistent | Cards used where tables, filters, and split panes would be faster | Operational tables, command bars, drawers, saved views |
| Settings and Support | Serviceable | Long forms and route-specific patterns | Category navigation, autosave sections, focused forms |

## Highest-priority platform changes

### P0 — Establish the product grammar

1. Adopt five reusable screen archetypes:
   - Editorial home
   - Ranked feed
   - Detail with tabs
   - Operational workspace
   - Guided creation flow
2. Define shared tab, rail, drawer, stepper, empty-state, and sticky-action behavior.
3. Require every page to identify its primary user intention and role before rendering secondary modules.
4. Stop adding explanatory panels to transactional screens. Move education into empty states, tooltips, Learn tabs, and contextual help.

### P1 — Correct the most visible logged-in surfaces

1. Recompose Creator, Host, Brand, Merchant, and Agency dashboards around their actual jobs.
2. Replace `StakeholderReturnPanel` on dashboard homes with compact, role-specific evidence visible inside the relevant workflow.
3. Convert Create Moment and Edit Moment into a resilient stepper:
   - Story
   - Time and place
   - Participation
   - Proof and reward
   - Access and capacity
   - Review and publish
4. Unify Wallet, Vault, Growth, and personal rewards into one understandable value architecture.
5. Standardize Discover, Search, Moments, Venues, Content, Rewards, Scenes, and Creators on a single discovery framework.

### P2 — Improve operational scale

1. Move admin and analytics pages from card grids toward tables, split panes, saved filters, batch actions, and detail drawers.
2. Consolidate duplicate and legacy routes once analytics confirms the active paths.
3. Break monolithic route components into domain-level panels with explicit loading, empty, error, and permission states.
4. Add visual regression coverage at participant, creator, host, brand, merchant, agency, and admin breakpoints.

## Where each interaction pattern belongs

### Tabs

Use for mutually exclusive peer views that users intentionally switch between:

- Moment: Overview, Participate, Activity, Details, Host tools
- Creator: Studio, Missions, Performance, Earnings
- Host: Moments, Live control, Proof review, Partners, Finance
- Brand: Campaigns, Audience, Proof, Spend
- Merchant: Today, Customers, Offers, Commerce

Tabs should not be placed below multiple summary sections. They should establish the page structure near the top.

### Carousels and horizontal rails

Use for finite, visual collections where seeing the next item is useful but not essential:

- Moment media
- Upcoming Moments
- People and Scenes to follow
- Related creator stories
- Rewards or access recently unlocked
- Products and offers connected to a Scene

Do not use carousels for instructions, essential actions, settings, analytics, or tables.

### Drawers and accordions

Use for contextual detail that should not interrupt the task:

- Proof requirements
- Funding rules
- Access eligibility
- Advanced filters
- Participant or customer detail
- Transaction detail

### Steppers

Use for creation and setup with dependencies:

- Create/Edit Moment
- Campaign creation
- Offer setup
- Onboarding and KYC
- Scene or proposal creation

### Tables and split panes

Use for repeated operational records:

- Participants
- Proof reviews
- Campaigns
- Transactions
- Payouts
- Offers
- KYC and moderation queues

## Moment page work completed in this pass

- Added a sticky, keyboard-operable tab system.
- Separated Overview, Participate, Activity, Details, and Host tools.
- Kept the primary join/check-in/manage action visible in the cinematic hero.
- Moved host economics, access controls, lineage, and funding away from the guest reading flow.
- Moved verification and mission content into Participate.
- Moved proof outcomes, social artifacts, conversation, reviews, and media into Activity.
- Added a real responsive media carousel with swipe and arrow navigation.
- Kept practical time, venue, capacity, and reward information in Details.
- Removed the mobile-only explanatory panel that described the interface rather than helping the user.

## Definition of world-class for the next phase

A logged-in Promorang screen should pass five questions within five seconds:

1. Where am I?
2. What matters now?
3. What can I do next?
4. What changed because of me?
5. Where can I go deeper without losing context?

If the screen answers those questions by displaying every available module, it has failed. The hierarchy, interaction model, and role context should answer them before explanatory copy is needed.
