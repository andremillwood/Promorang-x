# PROMORANG Public Experience Convergence — Handoff Log

**Purpose:** canonical handoff and continuity document for the public UI/UX convergence work. Read this before starting another redesign or continuing this work in another chat.

**Repository:** `andremillwood/Promorang-x`  
**Working branch:** `andre/public-experience-convergence-v2`  
**Pull request:** #131 — Public market convergence: Discovery, Demand, Watch + PromoCard  
**PR state checked 2026-09-18:** open, draft, currently not mergeable against its moving base. Do not merge/rebase/retarget without explicit instruction.  
**Head when this handoff was created:** `a6e3c4bae2a802be90138319b821fb82779d5df6`

---

## 1. Mission

PROMORANG's public experience is being converged from a mixture of marketing pages, application dashboards, generic cards, and disconnected object pages into one coherent market/cultural world.

The working design direction is:

- **WORLD > DASHBOARD**
- **OBJECTS > GENERIC CARDS**
- **ONE CLEAR MOVE > MANY EQUAL ACTIONS**
- **UTILITY IS QUIET**
- **MEDIA + CULTURE + CONTEXT SHOULD DOMINATE PUBLIC PRODUCT PAGES**
- **PROMORANG EXPLAINS ITSELF THROUGH CONSEQUENCE, NOT CONSTANT DOCTRINE**
- **DISCOVER → ACT → PROVE → KEEP → RETURN**

The public visual reference used during this work is useful for atmosphere, density, photography, editorial hierarchy, cultural browsing, and the feeling that every page leads somewhere else. It is **not** a product specification. Do not copy another product's event journeys, data model, or ticketing semantics into PROMORANG.

PROMORANG's own canonical objects and market mechanics remain authoritative.

---

## 2. Product model we are protecting

PROMORANG is being treated as a **market construction and activation system**, not merely an events directory.

Core object families currently relevant to the public graph:

- **Discovery** — something worth knowing / noticing.
- **Demand / Interest** — a recorded expression of what someone is looking for or wants.
- **Moment** — actual time/place/action supply.
- **Offer / Perk** — actual value/access supply.
- **Scene** — persistent cultural/community context around recurring interests, rituals, places, people, and Moments.
- **Place / Venue** — physical destination.
- **Merchant** — economic actor/storefront.
- **Creator / Person** — public actor/distributor/host/participant identity as appropriate.
- **PromoCard** — retained continuity/access/history layer for the participant.

The intended connective graph is increasingly:

```text
Discovery ↔ Scene ↔ Moment ↔ Place
    ↘         ↘       ↘       ↘
    Demand    Creator  Host    Merchant
        ↘                 ↘       ↘
          Response          Offer / Perk
                 ↘          ↙
                    PromoCard
```

The graph should be source-backed. Missing relationships stay missing rather than being invented.

---

## 3. Truth boundaries — non-negotiable

Do not collapse these states:

- Discovery ≠ Demand.
- Demand ≠ Moment.
- Moment ≠ Offer.
- Interest / RSVP ≠ attendance.
- Check-in ≠ purchase.
- Offer displayed ≠ Offer issued.
- Claim ≠ redemption.
- Proof submitted ≠ proof verified.
- Reward text on a Moment ≠ a verified redemption.
- PromoCard ≠ guaranteed supply.

If the public source fails, do not render the failure as “nothing available.”  
If the market is genuinely empty, say so honestly.  
Do not inject demo/example inventory merely to make a public market surface look alive.

Participant-facing language should be human. Avoid exposing internal language such as **“ask the market.”** Prefer language such as:

- “Looking for something?”
- “Tell PROMORANG what you're looking for.”
- “Keep this.”
- “Keep on PromoCard.”
- “Come back when something changes.”

Internal Demand semantics may remain Demand.

---

## 4. Public Object System v2

The canonical public destination anatomy established during this convergence is:

```text
MEDIA → IDENTITY → CONTEXT → ACTION → DEPTH → RELATIONSHIPS → MORE
```

Each object answers a different human question:

| Object | Primary public question |
| --- | --- |
| Discovery | Why should I know about this? |
| Moment | Why should I show up / care now? |
| Offer / Perk | Why should I claim or use this? |
| Merchant | Why should I visit, buy, book, or follow? |
| Place | Why should I go here? |
| Creator | Why should I follow what this person moves? |
| Scene | Why should I become part of this? |

### Signature-object semantic rule

Signature objects should represent actual product state whenever practical.

- **TicketPass** is strongest when a real pass/access state exists.
- **PaperReceipt** is strongest when a real consequence can truthfully be receipted.
- **PromoCard** is strongest when showing retained participant relationship/access/history.

Do not use TicketPass, PaperReceipt, or PromoCard merely as decorative containers for explanatory copy on consumer object pages.

A major lesson from the Moment review was:

> **Marketing pages explain PROMORANG. Product pages let people experience PROMORANG.**

---

## 5. Visual direction established

The public world is moving toward:

- near-black / black foundation;
- orange as movement/signal rather than indiscriminate decoration;
- cinematic photography and media-forward heroes;
- dense cultural/editorial rails;
- large, confident typography;
- Current/Return/boomerang visual language from Design Lab;
- stronger square/rectilinear object language rather than excessive generic rounded SaaS cards;
- sticky contextual object tabs where useful;
- responsive mobile feed behavior;
- reduced-motion support;
- more content and relationships per scroll on product destinations;
- less giant empty space occupied by product doctrine.

The Current/Return visual grammar should support movement and continuity. It must not become decorative noise.

---

## 6. PromoCard decision

PromoCard remains a primary PROMORANG object, but its public-page role has changed.

Do **not** make every public page into a giant PromoCard advertisement.

Instead, PromoCard is the persistent personal layer behind public objects:

- Discovery → **Keep / Watch**
- Moment → **Keep on PromoCard**
- Offer → **Claim to PromoCard**
- Scene → **Join / Keep**
- Merchant → **Follow / return**
- Creator → **Follow**
- verified consequences → retained history where supported

The world should dominate the page. PromoCard quietly remembers the participant's relationship with that world.

PromoCard is continuity, not a promise that supply will exist.

---

## 7. Work completed

### 7.1 Public Discovery browse

Primary implementation:
- `apps/web/src/components/discovery/PublicDiscoverExperience.tsx`
- `apps/web/src/pages/Discover.tsx`
- public Discovery/Moment styling in `apps/web/src/index.css`

Anonymous `/discover` was rebuilt as a media-rich public market surface using:
- approved Discoveries;
- canonical Moment feed;
- real public Offers/perks;
- recorded shared interest/Demand;
- search across available public object types;
- honest editorial atmosphere fallback clearly distinguished from live inventory;
- participant-facing “Looking for something?” language;
- PromoCard continuity.

Logged-in participant behavior was intentionally preserved rather than blindly overwritten.

### 7.2 Public Moments browse

Primary implementation:
- `apps/web/src/components/discovery/PublicMomentsExperience.tsx`
- `apps/web/src/pages/ExploreMoments.tsx`

Anonymous Moments use canonical Moment supply only.

Lifecycle groupings include:
- live;
- starting soon;
- upcoming;
- recently ended where supported.

No curated/demo Moment is substituted as live canonical supply.

### 7.3 Public Moment detail

Primary implementation:
- `apps/web/src/components/moments/PublicMomentDetail.tsx`
- wrapper behavior in `apps/web/src/pages/MomentDetail.tsx`

The first version over-explained PROMORANG with TicketPass/PaperReceipt/PromoCard doctrine. That was corrected.

Current anonymous Moment direction:
- cinematic Moment media;
- category/lifecycle;
- title/description;
- real date/time/place;
- recorded participant count only when present;
- recorded reward/access copy only when present;
- one clear continuation;
- About;
- Place & time;
- Access when actually recorded;
- related canonical Moments;
- additional Moments;
- compact PromoCard continuation.

Important: **do not reintroduce the three explanatory tickets or giant “Return” education section to the consumer Moment page.**

### 7.4 Discovery detail

Primary implementation:
- `apps/web/src/pages/DiscoveryDetail.tsx`

Direction:
- editorial knowledge destination;
- approved public Discovery;
- cinematic hero/Current treatment;
- Watch/keep relationship;
- real Scene/place/contributor context;
- related Moment where supported;
- gallery/source links where present;
- related approved Discoveries;
- compact PromoCard continuation.

Removed/reduced:
- “What this object means” doctrine;
- oversized truth-boundary education;
- giant PromoCard marketing treatment.

Desired reaction: **“I found something interesting; show me more.”**

### 7.5 Offer / Perk detail

Primary implementation:
- `apps/web/src/pages/OfferDetail.tsx`

Rebuilt as an actual access destination:
- real benefit;
- media;
- availability;
- claim action;
- explicit `Available → Claim → Use` state progression;
- eligibility before code issuance where supported;
- claim remains distinct from redemption;
- merchant relationship links back to storefront when known;
- compact PromoCard/access continuation.

### 7.6 Merchant storefront

Primary implementation:
- `apps/web/src/pages/MerchantStorefront.tsx`

Moved away from generic commerce directory behavior toward a living public storefront:
- merchant identity/media;
- location/context when available;
- featured current item;
- Offers/perks;
- bookable services;
- products;
- onward exploration.

Inventory remains driven by the public commerce source. Missing inventory is not fabricated.

### 7.7 Scene detail

Canonical public route:
- `/scenes/:slug`
- implementation: `apps/web/src/pages/CommunityDetail.tsx`

This was converged toward:
- atmosphere/identity;
- participation/keep action;
- contextual tabs;
- Moments;
- Discoveries;
- retained Scene relationship;
- denser square/rectilinear visual language.

**Important:** `apps/web/src/pages/SceneDetail.tsx` contains an older demo-oriented `DEMO_SCENES` implementation. It is not the canonical public Scene graph. Do not promote its demo state into production public supply.

### 7.8 Scene collection

Primary implementation:
- `apps/web/src/pages/Communities.tsx`

Collection now behaves more as an entrance into a cultural world rather than a terminating directory.

Relationship exits were added toward:
- Moments;
- Places;
- Creators/people.

### 7.9 Place / Venue detail

Primary implementation:
- `apps/web/src/pages/VenueProfile.tsx`

Converged toward:
- place identity;
- contextual public tabs;
- what is happening here;
- Moments;
- commerce/available value;
- gallery;
- linked content/updates.

A Place is not treated as inventory. It is a physical destination with real activity/relationships attached.

### 7.10 Places browse

Primary implementation:
- `apps/web/src/pages/ExploreVenues.tsx`

Moved away from conventional generic directory styling toward:
- stronger cultural/place hero;
- “Where things happen” positioning;
- less rounded SaaS-card language;
- routes onward to Scenes, Moments, and available value.

### 7.11 Creator/person profile

Primary implementation:
- `apps/web/src/pages/UserProfile.tsx`

Public profile visual system was converged toward:
- identity-first hero;
- Current treatment;
- follow/share actions;
- source-backed activity/history;
- denser contextual navigation;
- public object destination visual grammar.

### 7.12 Creators browse

Primary implementation:
- `apps/web/src/pages/Creators.tsx`

Removed the generic “4 Pillars of Creator Success” SaaS-explainer direction from the public browse experience.

Added relationship exits toward:
- Discoveries;
- Moments;
- Scenes.

### 7.13 Rewards browse

Primary implementation:
- `apps/web/src/pages/ExploreRewards.tsx`

Converged to preserve:
- Offers as distinct supply;
- reward-bearing Moments as distinct responses;
- source failures distinct from genuinely empty market;
- PromoCard state progression;
- Current visual language.

### 7.14 Marketing role pages

Relevant files include:
- `apps/web/src/pages/ForBrands.tsx`
- `apps/web/src/pages/ForMerchants.tsx`
- `apps/web/src/pages/HowItWorks.tsx`
- `apps/web/src/pages/WhatIsPromorang.tsx`

These remain explanatory surfaces and may use more explicit system explanation than consumer object destinations.

Notable language correction:
- participant-facing “ask the market” was replaced with human “looking for / tell PROMORANG what you're looking for” language in relevant public copy.

### 7.15 Public shell

Primary implementation:
- `apps/web/src/components/layouts/AppLayout.tsx`

Anonymous public object routes have progressively been kept inside the public marketing/object shell to avoid the jarring transition from cinematic public experience into old application chrome.

Routes covered during convergence include Discovery/Moment detail and additional public object families such as Offer, Storefront, Scene, Venue/Place, Creator/Profile where route structure supports it.

Always inspect this file when adding another public destination.

### 7.16 Shared styling

Primary implementation:
- `apps/web/src/index.css`

Added/extended:
- public Discovery/Moment world;
- public object destination system;
- object hero media;
- lifecycle/state labels;
- sticky object tabs;
- related-object grids;
- merchant object grids;
- hover/motion behavior;
- responsive layouts;
- reduced-motion behavior.

---

## 8. Collection-page law

Collection pages are not merely card directories.

A public collection should help someone enter the graph and continue moving.

Established examples:

- **Scenes** → Moment / Place / Person
- **Places** → Scene / Moment / Available value
- **Creators** → Discovery / Moment / Scene
- **Moments** → detail → Place / related Moment / access
- **Discover** → Discovery / Moment / Offer / recorded interest
- **Rewards** → Offer / reward-bearing Moment / Merchant

A collection page should provide at least one meaningful onward route even when inventory is sparse.

This is not permission to fabricate objects. Sparse states should route toward adjacent real object families.

---

## 9. Current frontier

Do **not** begin with another giant homepage redesign.

The current frontier is:

### A. Eliminate remaining dead ends

Audit every canonical destination for outgoing relationships:

- Discovery → Scene / Moment / Place / contributor / related Discovery
- Moment → Place / Scene / Host / Offer / related Moment
- Scene → Moment / Discovery / Place / Creator
- Place → Moment / Scene / Merchant / Offer / content
- Merchant → Offer / Product / Service / Place / Moment where supported
- Offer → Merchant / Place / PromoCard
- Creator → Moment / Scene / Discovery / Place where supported

Only expose relationships supported by actual data.

### B. Improve relationship rails

The relationship rail should not be a generic “recommendation widget.” It should explain why the next object is relevant:

- “Happening here”
- “More from this host”
- “In this Scene”
- “Available here”
- “More worth knowing”
- “People moving this”
- “Around this place”

### C. Audit responsive/mobile behavior

The visual reference was especially strong as a mobile cultural feed. Inspect:
- hero cropping;
- sticky tabs;
- horizontal rails;
- typography;
- action hierarchy;
- PromoCard continuation;
- long titles;
- missing imagery;
- empty states.

### D. Resolve branch/PR integration separately

PR #131 is currently draft and not mergeable against its moving base.

Do not claim a clean build or merge until it is actually verified.

When instructed to integrate:
1. fetch the current base/head;
2. inspect conflicts;
3. reconcile intentionally rather than choosing ours/theirs wholesale;
4. run the web build;
5. inspect anonymous public routes;
6. then update PR status.

---

## 10. Known validation limitation

At an earlier point, an independent clean runtime build could not be completed because the runtime could not resolve GitHub/network dependencies, and fresh GitHub Actions were not scheduling normally on the conflicted stacked PR.

Therefore:

> **Do not state that the exact current branch head passes build unless a current build has actually been run and verified.**

Recommended local validation:

```bash
git fetch origin
git switch andre/public-experience-convergence-v2
git pull --ff-only origin andre/public-experience-convergence-v2

npm install
npm run build --workspace apps/web
```

For local development, inspect `package.json` scripts if the generic command differs. A previously used repo command was `npm run dev:web`; another session used `npm run dev`. Verify rather than assume.

---

## 11. High-value manual review journey

Review anonymous/incognito first.

Suggested journey:

```text
/
↓
/discover
↓
Discovery detail
↓
Scene / Place / related Discovery
↓
Moment
↓
Place
↓
Offer
↓
Merchant
```

Also:

```text
/discover/rewards
↓
Offer
↓
Merchant storefront
```

and:

```text
/scenes
↓
Scene
↓
Moment / Discovery / Place
```

and:

```text
/creators
↓
Creator profile
↓
public activity / adjacent object
```

The key review question is no longer just “does this page look good?”

Ask:

> **Can I continuously move through real PROMORANG objects without falling into old UI, hitting unexplained dead ends, or being shown invented supply?**

---

## 12. Instructions for a future ChatGPT session

If this work continues in another chat, use the following operating instruction:

> Read `docs/design/PUBLIC-EXPERIENCE-CONVERGENCE-HANDOFF.md`, `DESIGN.md`, and `docs/design/public-experience-convergence-v1.md` before modifying the public PROMORANG experience. Fetch the current state of branch `andre/public-experience-convergence-v2` and PR #131; do not assume the SHA in this handoff is still current. Continue the established convergence rather than starting a parallel redesign. Preserve canonical truth boundaries. Use reference imagery for aesthetic/density inspiration only. Inspect existing implementation before replacing it. Do not manufacture public inventory. Do not use signature objects as decorative explanatory containers. When asked to “proceed,” implement on the active convergence branch rather than only describing recommendations.

Before coding, check:
1. current PR/head/base/conflict status;
2. current version of the target file;
3. whether the object already has a canonical implementation;
4. whether a similarly named older/demo page exists;
5. actual data relationships available before designing a rail.

---

## 13. Living work log

### 2026-09-18 — Public Moment correction

**Problem:** anonymous Moment detail looked polished but behaved like a product explainer. Large black space and signature objects were teaching PROMORANG rather than making the Moment desirable.

**Decision:** consumer Moment pages must lead with the Moment. Marketing pages can explain the system.

**Implemented:** media-first hero, time/place, access only when real, related Moments, onward exploration, compact PromoCard continuation. Removed explanatory TicketPass/PaperReceipt doctrine.

---

### 2026-09-19 — Offer relationship and availability continuation

**Problem:** Offer detail could terminate after claim guidance even when the canonical public reward read model carried a linked Place or Brand. Expired or exhausted Offers also continued to present an active claim action.

**Decision:** Offer availability must control the claim action, while source-backed Place and Brand records should provide clearly explained onward routes.

**Implemented:** linked Place and Brand relationship cards sourced from `view_public_reward_directory`; explicit ended and fully claimed states; current-perk exits when an Offer is unavailable; PromoCard language in the successful claim receipt.

**Validation:** `npm run build --workspace apps/web` passed. Dynamic SEO source fetching was unavailable in the local environment, so the generator skipped dynamic pages and completed the static/localized snapshots and sitemap output.

---

### 2026-09-19 — Moment to Brand relationship continuation

**Problem:** canonical Moment supply retained associated Brand names but discarded the Brand slugs required for a real public relationship route. Moment detail could display attribution text without letting a visitor continue into the linked Brand.

**Decision:** canonical feeds should preserve the minimum identity required to traverse a source-backed relationship; display-only names are insufficient when the public object already has a canonical destination.

**Implemented:** the Moment feed now returns deduplicated associated Brand identity (`id`, `name`, `slug`) while preserving the existing name list for compatibility. Anonymous Moment detail renders linked Brands in the relationship rail as “Made possible by.”

**Validation:** focused Moment feed tests pass, including a regression test for Brand identity preservation. `npm run build --workspace apps/web` passes; dynamic SEO fetching remained unavailable locally and was skipped by the generator.

---

### 2026-09-19 — Creator relationship continuation

**Problem:** the canonical `/creators/:handle` destination exposed public work, hosted Moments and approved Discoveries, but it did not provide the primary follow action or let visitors continue into the real Places and Scenes connected through those Moments.

**Decision:** Creator relationships should be derived from public activity already attached to the person. A profile must not invent a Scene or Place merely from biography or location text.

**Implemented:** Creator detail now exposes the existing follow action; deduplicates linked Places from canonical hosted Moment records; resolves linked Scenes through `moment_scene_links`; and labels both relationship families by why they are relevant to the creator.

**Validation:** `npm run build --workspace apps/web` passes. Dynamic SEO fetching remained unavailable locally and was skipped by the generator.

---

### 2026-09-19 — Follow authentication continuity

**Problem:** anonymous Watch, Claim, Join and Save actions preserved their originating object through authentication, but Follow only displayed a sign-in error and abandoned the action context.

**Decision:** authentication remains a checkpoint. Following must return the visitor to the exact Creator/person destination and require the person to explicitly finish the action after sign-in.

**Implemented:** the shared `FollowButton` now stores a resumable relationship intent and sends anonymous visitors through the canonical `next` return path. This fixes continuity on both Creator detail and public person profiles without auto-following anyone.

**Validation:** all six resumable-intent tests pass. `npm run build --workspace apps/web` passes; dynamic SEO fetching remained unavailable locally and was skipped by the generator.

---

### 2026-09-18 — Public Object System v2

**Problem:** public object pages risked becoming unrelated bespoke designs.

**Decision:** adopt common anatomy:

`MEDIA → IDENTITY → CONTEXT → ACTION → DEPTH → RELATIONSHIPS → MORE`

**Implemented:** Moment, Discovery, Offer, Merchant destinations brought toward this system. Design law documented.

---

### 2026-09-18 — Scene / Place / Creator convergence

**Problem:** the cultural graph would break if only Discovery/Moment/Offer/Merchant looked coherent.

**Decision:** Scene, Place/Venue, and public Creator/person should inherit the same destination language without erasing their distinct functions.

**Implemented:** canonical Scene detail, Venue detail, public profile, and associated collection surfaces converged. Older demo Scene implementation explicitly kept non-canonical.

---

### 2026-09-18 — Collection surfaces and relationship rails

**Problem:** strong detail pages still produced a disconnected site if collection pages ended in grids.

**Decision:** collections are entrances into the graph, not directories.

**Implemented:** Scenes, Places, and Creators collection surfaces gained deliberate onward routes into adjacent object families and reduced generic SaaS/card language.

**Next:** systematically audit every destination's real outgoing relationships and eliminate remaining dead ends.

---

### 2026-09-18 — Relationship dead-end repair

**Problem:** canonical destinations still had real graph edges rendered as dead labels, mismatched routes, and one public person surface showing fabricated trust/social values. Iterating file-by-file also risks unnecessary Vercel preview builds on the Hobby plan.

**Decision:** relationship rails expose only source-backed adjacency, route names must round-trip canonically, public trust metrics must be sourced or absent, and convergence changes should be batched before moving the branch ref.

**Implemented:** Discovery now exits to linked Place/Creator; Moment feed/detail carries real Place/Scene/Host relationships; Offer↔Merchant and commerce routes were repaired; Merchant exits to connected Place/Moment; Creator exits to real Moments/Discoveries; Scene now resolves Place/Person adjacency from linked Moments; Venue gains approved Discovery and Merchant exits; public Person stats are sourced and the nonfunctional Saved tab is removed.

**Validation:** source/data relationships and routes were inspected against current repository schema and route definitions. No Vercel deployment was intentionally requested. Existing Vercel status failures were build-rate-limit failures, not successful build verification.

**Remaining:** perform responsive/mobile review, then reconcile PR #131 with its moving base and run a real build only when preparing an intentional integration/release candidate.

---

### 2026-09-18 — Mobile public-object density pass

**Problem:** canonical object grids still collapsed into long single-column mobile stacks, sticky object tabs retained visible scroll chrome, and long object titles could become oversized or fragile on narrow screens.

**Decision:** mobile public object destinations should behave like cultural shelves: compact hero media, horizontally inspectable related inventory, scrollable sticky context tabs, and resilient title wrapping.

**Implemented:** shared public-object CSS now gives mobile relationship/storefront rails horizontal snap behavior, hides tab/rail scrollbars, reduces mobile hero-media minimum height, removes inherited Scene hero minimum height on small screens, and clamps/wraps long object titles across public destinations.

**Validation:** source-level CSS and selector inspection only. No Vercel deployment was intentionally requested; branch updates remain batched.

**Remaining:** manual device/incognito review when an intentional preview/build budget is available, then PR/base reconciliation.

---

## 14. Update protocol

After each meaningful convergence pass, append a dated entry to this file using:

```md
### YYYY-MM-DD — [surface/object]

**Problem:** what was wrong.

**Decision:** product/design rule chosen.

**Implemented:** concrete files/surfaces changed.

**Validation:** what was actually verified.

**Remaining:** what should happen next.
```

Update the top-of-file branch/PR/head information when materially useful, but never treat an old SHA as current truth.

This file is the continuity log. `DESIGN.md` remains the broader design-system law; `docs/design/public-experience-convergence-v1.md` remains the deeper convergence specification.


### 2026-09-18 — Canonical base reconciliation

- Reconciled the public convergence branch against the current `design/canonical-object-system-v1` base after it moved 201 commits beyond the original merge base.
- Preserved the newer product-completion / production-truth work from the canonical branch, including the participant-world shell, DEV-only fixture boundaries, checked-in-only attendance semantics, and the admin Moment record lens.
- Preserved Public Object System v2, anonymous public object destinations, source-backed relationship rails, real follower/review stats, and the public mobile object pass.
- Marketing/help rewrites remained authoritative where they already superseded legacy pages and already removed the claims the newer truth sweep was correcting.
- Reconciliation was staged as an unreferenced merge candidate before moving the PR branch.
- No direct Vercel deployment was invoked. Preview builds remain reserved for an intentional integration checkpoint.


### 2026-09-18 — Build repair + latest canonical truth

**Problem:** the first post-reconciliation Web Build exposed malformed JSX nesting in `VenueProfile.tsx`, while the canonical completion branch advanced eight more commits and touched four files also changed by public convergence.

**Decision:** repair the parser failure first, then merge the newer completion/truth behavior into the current public layouts rather than replacing the public object work wholesale.

**Implemented:** closed the missing Venue hero/body wrappers; carried forward Activity source-failure handling; tightened Creator directory truth/error behavior; adopted the latest Discover cleanup; and merged UserProfile privacy/error rules with the public object design, real follower counts, recorded ratings, checked-in attendance, and source-backed Saved state.

**Validation:** continuity tests had already passed 9/9 before this repair. The new integration candidate is staged before the PR branch moves. No manual Vercel deployment is being used for iterative validation.

**Remaining:** advance the branch once, run the normal GitHub Web Build, then address only concrete build/runtime findings and complete anonymous/mobile + real-record watch validation.


### 2026-09-18 — User-facing copy convergence

**Problem:** production-truth work correctly removed fabricated state, but some of the enforcement language leaked into visible UI. Participants and stakeholders were being shown implementation phrases such as “source-backed,” “recorded state,” “authoritative,” “production state,” “inventory source,” and “truth gate.”

**Decision:** preserve all truth/state behavior while rewriting visible copy around the human job. Truth stays in the data and transitions; the UI speaks in participant, creator, merchant, brand, host, community, agency and enterprise language.

**Implemented:** rewrote Activity, Creators, Discover place labels, UserProfile errors, Venue merchant relationships, Wanted/Responses, Brand, Merchant, Creator, Community, Agency, Enterprise, Hosting, Join, Help, How It Works, What Is PROMORANG, Offer detail, Merchant storefront, plus the shared MarketRoleLanding stakeholder shell.

**Copy law:** added DESIGN.md section 0.2.1 — “Truth belongs in product behavior. Humanity belongs in the copy.” Internal state-machine and database terminology must not leak into ordinary persuasion or participant copy.

**Release posture:** copy-only convergence layered on top of the green public convergence build. No product mechanics, data sources, eligibility rules, RLS, reward logic, or route structure intentionally changed. Stage and validate before moving the PR branch once.


### 2026-09-18 — Homepage copy cleanup

**Trigger:** localhost screenshot showed remaining developer-facing microcopy on the homepage after the broader copy convergence pass.

**Problem phrases:** “editorial atmosphere only,” “source-backed market state,” “editorial lenses,” “recorded market state,” “canonical Moment feed,” “source-backed consequence,” and similar implementation language.

**Implemented:** rewrote the visible homepage copy in PublicMarketHome, EditorialWorldRail, PromoCardValueShowcase and MarketingPhysics. The underlying real-data/empty-state behavior is unchanged; only the customer-facing language changed.

**Copy direction:** discovery should feel curious, PromoCard should feel useful, demand should feel like shared interest, and return should feel personal. Internal rigor remains in the product behavior rather than being narrated to the user.


### 2026-09-18 — Shared Moments + demand-ticket copy cleanup

**Trigger:** localhost screenshots exposed remaining internal language in the anonymous Moments experience and the shared demand-ticket component.

**Implemented:** rewrote PublicMomentsExperience around what is happening and what is worth showing up for; rewrote DemandSignalObject around people, votes, targets and what could happen next; removed the literal escaped newline on Wanted; and simplified Offer-loading/availability copy.

**Shared-component effect:** the beige demand tickets now use human language everywhere they appear, including Wanted, Brand and Merchant surfaces.

**No mechanics changed:** canonical Moment sourcing, demand counts, thresholds, routes, availability rules and write paths remain unchanged.


### 2026-09-18 — Branch-wide voice convergence audit

**Trigger:** repeated localhost screenshots showed internal product/data language surviving outside the routes already rewritten.

**Audit scope:** all TS/TSX files changed by PR #131 were scanned for user-visible phrases associated with implementation voice: source-backed, authoritative, recorded object/market, canonical feed, truth gate/boundary, supply/inventory framing, state-transition language, and literal escaped-newline artifacts.

**Decision:** public participant and stakeholder surfaces must speak in the human job: what is happening, what people want, what can be done, and what happened next. Technical precision remains appropriate in developer surfaces, admin record views, internal identifiers and code-only state names.

**Implemented:** rewrote the remaining shared/public/stakeholder copy in DiscoveryDemandInbox, PublicDiscoverExperience, MarketOpportunityInbox, PublicMomentDetail, PromoCardWatchShelf, DiscoveryDetail, DemandInbox, signed-in ExploreMoments, ExploreVenues, ForCauses, ForMerchants, Help, How It Works, MyPromoCard, Pricing, SolutionsHub, What Is PROMORANG and the participant Moment perk empty state. Removed escaped-newline UI artifacts in Communities and ExploreVenues.

**Intentional exceptions:** developer-facing technical copy in ForDevelopers; admin-only canonical record language; internal variable/type names such as threshold/state/taxonomy that are not rendered to users.

**Release posture:** no product mechanics, source queries, writes, thresholds, authorization, reward logic or routes are intentionally changed. Validate the candidate against the same branch-wide voice scan and normal Web Build before treating the pass as complete.

**Validation result:** final strict scan across public/shared participant and stakeholder surfaces returned zero user-visible hits for the targeted internal-language patterns and zero escaped-newline artifacts. Technical terminology remains only in intentional developer/admin/internal-code contexts.


### 2026-09-19 — Public object relationships, action continuity, and comprehensive verification

**Problem:** the Offer, Moment and Creator destinations still had incomplete relationship context; unavailable Offers could continue presenting a claim action; anonymous Creator follow lost the user's intended destination; and several PromoCard tests described an older wallet/gold-card contract.

**Decision:** only render relationships supported by canonical records, preserve the exact destination across authentication without automatically completing the action, make Offer availability explicit, and remove the unused legacy Scene implementation rather than leave two competing detail surfaces.

**Implemented:** added source-backed Place and Brand relationships plus expired/fully-claimed handling to Offer detail; carried structured Brand identities through the public Moment feed and linked them from Moment detail; added hosted Place and linked Scene relationships to Creator detail; made anonymous Follow store a resumable intent and return to the Creator; aligned claim language and PromoCard tests with the current product contract; and deleted the unreferenced legacy `SceneDetail` while retaining `CommunityDetail` as the canonical `/scenes/:slug` destination.

**Validation:** the complete web test suite passed 205/205 tests across 45 files; Moment feed backend regressions passed 5/5; the resumable-intent suite passed 6/6; lint completed with zero errors (122 existing warnings remain); the production build passed and generated 30 localized snapshots plus 54 sitemap URLs; and the local application responded successfully. Data-connected dynamic SEO pages were skipped because their source was unreachable from the local build environment. Visual mobile traversal could not be completed because the available browser automation runtime failed to start.

**Remaining:** perform a real narrow-screen journey from Discover through Scene, Moment, Place, Offer and Merchant; verify Watch, Keep Moment, Join Scene, Claim Offer, Follow Creator and commerce Save through a real login; verify dynamic SEO with connected data; add a canonical Moment-to-Offer identifier before exposing that relationship; reconcile and recheck PR #131 against its base with authenticated GitHub access; and triage dependency audit findings separately rather than applying an unsafe blanket upgrade.


### 2026-09-19 — Connected SEO, Moment-to-Offer identity, and integration triage

**Problem:** dynamic SEO ignored Vite's local production environment files, Moment rewards had descriptive text but no routable Offer identity in the public feed, the checked-in lockfile was not valid JSON, and the earlier audit count understated the full monorepo result.

**Decision:** use the existing `offer_distributions` ledger as the canonical Moment-to-Offer relationship; load environment files with Vite-compatible production precedence; regenerate rather than hand-edit a corrupted lockfile; and separate safe dependency patches from framework/tooling major upgrades.

**Implemented:** the SEO generator now reads `.env.production.local` and `.env.local`; the canonical Moment feed exposes active unified Offer IDs sourced only from `channel = 'moment'` distributions; Moment detail links those Offers; Offer detail supports both unified Offers and legacy coupons; and dependency findings are recorded in `docs/security/DEPENDENCY-AUDIT-2026-09-19.md`.

**Validation:** connected production build passed and generated 3,249 localized snapshots plus 3,273 sitemap URLs; Moment feed tests passed 6/6, including the canonical Offer identity regression; and the regenerated lockfile parses as valid lockfile v3 with 2,280 package records. The remote branch's lockfile begins with a captured truncation warning and is invalid JSON, so the large replacement is a necessary repair rather than ordinary dependency churn.

**PR state:** remote refs and GitHub's public API confirm PR #131 is open, draft, mergeable and clean at remote head `de982ea05`; both Vercel status contexts are successful. The refreshed feature branch is 3 commits behind and 192 commits ahead of `design/canonical-object-system-v1`. A non-checkout merge-tree calculation found no committed-tree conflicts. The actual merge was intentionally not performed because the working tree contains overlapping uncommitted work, including files changed by those three base commits. GitHub CLI authentication was initiated but not completed during this pass.

**Remaining:** preserve or commit the current work in correctly scoped changes, merge the three base commits, then rerun the full suite and push the reconciled PR head; complete real-browser authenticated journeys; and execute dependency upgrades in the staged groups documented by the security triage rather than using `npm audit fix --force`.
