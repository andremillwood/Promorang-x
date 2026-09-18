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
