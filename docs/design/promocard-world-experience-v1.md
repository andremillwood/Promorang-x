# PromoCard-Centered World Experience V1

Status: product/UX specification for the first playable Promorang vertical slice.

This document extends `DESIGN.md`. It does not replace the canonical navigation, economy, proof, Scene, Moment, Mission, Piece, Vault, or PromoCard systems.

## 1. Product thesis

Promorang is the world. PromoCard is the person's persistent passport through it.

The world layer exists to make PromoCard more useful, personal, social, and integral. It must never create a parallel game home, wallet, identity, inventory, or economy.

The first release must prove one loop:

`notice -> choose -> move -> prove/use PromoCard -> consequence -> keep -> return`

The real world is the playfield. Promorang supplies context, rules, story, progression, proof, retained value, and the next move.

## 2. The law of the world: The Return

The name Promorang comes from promotion + boomerang. Use that as product physics, not decorative lore.

- **Throw:** a person puts attention, presence, an invitation, content, money, support, an introduction, or another useful action into the world.
- **Flight:** that action moves through people, Places, Moments, Crews, merchants, creators, and Scenes.
- **Impact:** something verifiable changes.
- **Return:** useful value comes back as access, PromoCard value, proof, a Piece, reputation, a relationship, an opportunity, or progress.

The Current is the movement of culture through the world. The Return is what comes back after meaningful movement.

Do not turn `Throw` into mandatory jargon on every button. Use it only where sharing/inviting/sending is naturally understood.

## 3. PromoCard protection rules

Every world/progression mechanic must improve at least one of these questions:

1. What can my PromoCard access?
2. What can my PromoCard earn or refill?
3. What can my PromoCard prove?
4. What can my PromoCard reveal?
5. What can my PromoCard unlock?
6. How did my PromoCard change because of what I did?

Never create:
- a second wallet or game currency to compete with Gems/PromoCard value
- a second player inventory to compete with Vault
- a separate game homepage
- an RPG-only navigation tree
- XP for meaningless app activity
- progression that rewards taps, scrolling, or compulsive retention rather than useful real-world/social action

PromoCard remains an economic object first: available promotional value, accepted Places, use/scan, eligibility, refill/recharge, and retained benefit must remain immediately legible.

## 4. Canonical world grammar

These concepts have different jobs and must not be collapsed:

- **Scene:** the cultural ecosystem being strengthened. Example: Kingston After Dark.
- **Season:** the current narrative arc that gives connected activity temporal meaning.
- **Faction:** an optional later-stage philosophy about how a Scene is strengthened. Do not require factions in the first playable slice.
- **Crew:** a small group of people who move together. Target 3–8 people.
- **Player class/path:** demonstrated capability. It emerges from verified behavior; it is not chosen in first-run onboarding.
- **Role:** temporary responsibility during a Crew Run.
- **Signal:** contextual indication that something worth noticing/doing has appeared.
- **Mission:** a bounded useful action with proof and consequence.
- **Run:** a coordinated sequence of objectives for a Crew. This is the consumer-facing form of a raid mechanic.
- **Moment:** something happening in time.
- **Place:** the physical or cultural location where the world becomes tangible.
- **Piece/Memory:** retained proof that something meaningful happened.
- **Vault:** what the person keeps.
- **Return:** the visible consequence of a verified action.

## 5. Mastery model

Promorang should teach mechanics the way strong adventure games teach: introduce one rule through use, give immediate feedback, remix it in new contexts, and grant more agency after demonstrated competence.

Never explain the entire ontology during onboarding.

Mastery has four layers:

1. **World mastery** — understanding Places, Scenes, people, timing, routes, and patterns.
2. **System mastery** — understanding Signals, Missions, PromoCard, Pieces, Runs, proof, and Returns.
3. **Role mastery** — becoming demonstrably effective at a capability such as scouting, connecting, creating, hosting, collecting, or supporting.
4. **Social mastery** — coordinating people, teaching newcomers, leading Runs, and improving Scene outcomes.

Later creative mastery may allow trusted players to author Runs, trails, Missions, and other bounded experiences for others.

Progression should unlock information and agency more often than percentage bonuses.

## 6. V1 playable vertical slice

### Scene
Kingston After Dark.

### Season frame
Working title: **The City Wakes**.

The story is light atmospheric context, not a mandatory fiction campaign. Kingston has a visible surface and a cultural layer made of people, Places, rituals, invitations, Moments, and stories. Signals help people notice where that layer is moving.

### Required content density
Launch only when operations can support:
- 3–5 real participating Places/Moments in a coherent area
- at least one usable PromoCard benefit
- one Piece/Memory set
- one Crew Run
- one verified-action/proof path
- enough real activity that `Today` can recommend a truthful current move

Do not manufacture fake live density.

### First Run example
**Barbican Run**

A Crew completes a small set of real objectives, for example:
- show up at one participating Moment
- support one participating Place/merchant
- bring one newcomer or complete one connection objective
- retain one verified Memory/Piece

The exact objective mix must be operationally verifiable. Do not ship objectives that depend on data Promorang cannot prove.

## 7. First-time player journey

### Step 1 — Value before lore
The first promise is still practical: get/use PromoCard, find something worth doing, receive useful value.

Do not ask for class, faction, Crew, or lore comprehension.

### Step 2 — First Signal
After the person has a relevant Scene or interest, surface one truthful Signal: a Moment, Place, perk, or useful action.

Copy pattern:
- `A Signal appeared`
- human explanation immediately beneath it
- one CTA

### Step 3 — First verified action
The person attends, checks in, redeems, purchases, contributes, or completes another proof-backed action.

### Step 4 — Consequence receipt
Never stop at `Success`.

Show a receipt-like consequence object:
- what happened
- what counted
- what changed on PromoCard
- what Crew/Scene objective moved, if relevant
- what was kept in Vault
- what opened next

### Step 5 — First retained object
If eligible, reveal a Piece/Memory with cultural origin and provenance. The reveal should feel significant but remain fast and dismissible.

### Step 6 — Path begins to emerge
After repeated verified behavior, show an observation such as `A path is forming`. Do not prematurely lock the person into a class.

### Step 7 — Social play
Invite or join a Crew only after the person understands at least one useful individual loop. Crew play should make a known mechanic richer, not introduce the whole product at once.

## 8. Screen-by-screen UX

### 8.1 Today / member home

Current code anchor: `apps/web/src/pages/PeopleHome.tsx`.

For members, replace the passive `For you` composition with a prioritized adventure stream while retaining the PromoCard as a dominant object.

First viewport must contain:
1. one truthful `Your move` / Signal object
2. PromoCard summary or immediately accessible PromoCard face
3. enough social/contextual proof to explain why the move matters

Suggested hierarchy:

**Context line**
`Tonight in Kingston` or a neutral time-aware equivalent.

**Current move**
- Scene
- Signal/Moment/Place
- why now
- relevant Crew/social state when real
- one CTA

**PromoCard**
- available promotional value/points according to canonical live model
- Keys/access if relevant
- one near-term unlock/refill cue
- use/open card

**After activity**
- `Last Return` receipt summarizing what changed

Do not make Today a quest log. One dominant move beats five equal missions.

### 8.2 Discover

Discover remains a cultural discovery surface, not a game menu.

V1 should add `Signal` state/context to existing Moment, Place, perk, creator, and Scene objects rather than creating a separate Signal database unless required by backend truth.

A future World/map mode is allowed only when there is sufficient geocoded density and current data. Do not block V1 on a map.

Objects can communicate:
- active now / forming / upcoming
- known vs not yet discovered where that distinction is real
- PromoCard accepted/value available
- Crew interest/activity
- collection/Memory availability

### 8.3 Place

A Place should feel like a location in a living Scene, not a generic directory listing.

Prioritize:
- identity and imagery
- what is happening now/next
- Scene membership/context
- PromoCard usefulness here
- people/social confidence when privacy-safe
- current Signal/Mission if applicable
- retained Memories/Pieces associated with the Place

### 8.4 Moment

Keep the existing `Your move` pattern. Extend the before/during/after loop:

**Before** — access, PromoCard value, intent, Crew context.

**During** — proof/check-in/use, active objective, useful live state.

**After** — consequence receipt, Return, Memory/Piece, next opening.

### 8.5 PromoCard

Current code anchors:
- `apps/web/src/pages/MyPromoCard.tsx`
- `apps/web/src/components/promocard/DigitalPromoCard.tsx`
- `apps/web/src/components/promorang/SignatureObjects.tsx`

PromoCard must remain visually and semantically dominant.

Keep above the fold:
- holder
- available promotional value/points according to the canonical card implementation
- accepted Places / eligibility
- use/scan action
- refill/recharge state

Add progressively, below or around the economic core:
- primary Scene
- emerging/earned path title
- Crew
- current Run
- closest meaningful unlock
- latest Return

Do not turn the physical-card face into a crowded character sheet. The face should carry at most one or two identity marks beyond economic essentials. Deeper progression belongs in the expanded PromoCard page/Progress.

### 8.6 Progress

Progress answers: `What happened because of me, and what am I learning to do well?`

Use consequences, receipts, trails, and before/after state rather than generic XP dashboards.

V1 sections:
- recent Returns
- current/ emerging path
- contribution to current Crew Run
- Scene contribution in plain language
- next capability or permission that can be earned

A class/path level must correspond to demonstrated behavior and an understandable benefit. No level exists solely for status.

### 8.7 Vault

Current code anchor: `apps/web/src/pages/Vault.tsx`.

The current Vault uses a four-dimension metric grid and tab-heavy economic presentation. This conflicts with the newer object-surface rule that bans generic SaaS metric grids on Vault/culture surfaces.

Refactor direction:
- lead with `What you keep`
- show active PromoCard-relevant perks as physical/useful objects
- show Memories/Pieces as collectible relics with provenance
- show collection/set progress as a trail/shelf rather than a KPI dashboard
- retain tickets and Gems/economic detail, but demote detailed liquidity/advanced economy away from the member-first cultural surface

Do not delete working economy functionality. Change hierarchy and presentation first.

### 8.8 Crew

V1 Crew screen is a small-party surface, not a social network.

Show:
- 3–8 members
- each person's useful demonstrated strength/path when available
- current Run
- completed and remaining objectives
- each person's contribution
- one coordination CTA (invite, continue, or choose next objective)

Do not require faction membership for Crew formation.

## 9. Consequence UX: the core game-feel primitive

The most important new UX primitive is not a page. It is the **Consequence Receipt** after a verified action.

Use the existing `PaperReceipt` visual language where appropriate.

A receipt may show:

`YOU SHOWED UP`

- Moment: AftrHrs
- Place: Sea Deck
- PromoCard: +eligible refill/value if earned
- Crew Run: 68% -> 72%
- Path: Connector progress
- Kept: First Current Memory

Footer: `What you put into the Scene changed what came back.`

Only show consequences actually supported by server truth. Never fabricate progress for delight.

## 10. Piece/Memory reveal

Use `CollectibleRelic` as the starting visual object.

Required fields:
- title
- origin Moment/Place/Scene
- verified date/time context
- rarity only when rarity has a real issuance rule
- retained perk/access if one exists

Unknown/locked collection slots may tease a clue, but never imply a reward exists if operations have not configured it.

## 11. Player paths/classes V1

Do not build a large class tree.

Start by tracking a small number of demonstrated behavior dimensions, potentially:
- discover
- connect
- create
- host
- keep
- support

A path is surfaced only after enough evidence exists.

Examples of future earned capabilities:
- earlier/more precise discovery context for proven Scouts
- larger or more capable invitation tools for proven Connectors
- ability to propose a Crew Run after demonstrated social mastery

These are examples, not automatic V1 entitlements. Every capability requires abuse/safety review.

## 12. Factions

Factions are intentionally not required for V1.

When introduced, a faction is a philosophy of contribution, not a Scene and not a Crew. Mixed-faction Crews should be valid and often useful.

Potential philosophical dimensions:
- Seekers: discovery
- Weavers: connection
- Makers: creation
- Keepers: memory
- Stewards: sustainable support

Do not ask a new user to choose one. Faction invitations/alignment should arrive only after behavior and story give the choice meaning.

## 13. Story and lore rules

Lore must reveal product truth rather than conceal it.

Canonical concepts:
- **The Return:** what comes back after useful action moves through the world.
- **The Current:** cultural movement through people, Places, Moments, and Scenes.
- **The Static:** optional narrative language for stagnation/fragmentation; never imply supernatural truth.
- **Signal:** something worth noticing now.

Use lore in chapter headings, transitions, collection clues, Scene copy, seasonal dispatches, and occasional guide characters. Do not replace practical labels such as price, place, time, eligibility, or proof requirements.

Story must be skippable and subordinate to utility.

## 14. Data/event architecture

The implementation should converge on one canonical server-trusted verified-action/event model rather than embedding progression rules in every page.

Conceptual fields:
- actor
- action type
- proof/completion record
- Scene
- Moment
- Place/merchant
- Crew/Run when relevant
- season when relevant
- attributable source/Throw when relevant
- economic value/spend when relevant
- occurred/verified timestamps

Downstream consequence processors can derive:
- PromoCard refill/recharge eligibility
- Mission completion
- Crew Run progress
- path/class evidence
- Scene contribution
- Piece/Memory issuance
- access/unlock eligibility
- attribution/analytics

Financial consequences must continue to use the canonical Gem/PromoCard/economy ledger as financial truth. The world event model does not become a second ledger.

## 15. Visual rules

Follow `.cursor/rules/promorang-object-surfaces.mdc` and `DESIGN.md`.

Prefer tangible Promorang objects:
- PromoCard
- ticket/pass
- paper consequence receipt
- collectible relic
- night trail
- editorial Place/Moment media

Avoid:
- grids of RPG stat cards
- fantasy HUD chrome
- health bars for people
- neon game-console treatment unrelated to Promorang's cinematic visual system
- excessive badges
- fake map pins/data

Game feel comes from state, reveal, consequence, mastery, social coordination, and temporal change — not from making the UI look like a game.

## 16. Success instrumentation

The playable slice succeeds only if it improves real behavior relative to a useful baseline.

Track at minimum:
- PromoCard acquisition/activation
- PromoCard opens and verified uses
- Signal/current-move -> verified action conversion
- Crew invite -> activated participant conversion
- Run start -> completion
- first verified action -> second verified action retention
- Memory/Piece holder -> repeat Moment/Place participation
- PromoCard refill earned -> later use
- merchant attributable visits/redemptions/spend where available
- creator/host attributable movement where available

Do not optimize for raw game-screen time.

## 17. Build sequence

### Cut 0 — Protect the doctrine
Add this specification and reference it from `DESIGN.md`/execution planning before large implementation.

### Cut 1 — Consequence loop
Use existing proof/completion data to show a server-truth consequence receipt and retained Memory/Piece where already supported.

### Cut 2 — PromoCard context
Add current move, latest Return, and one progression/Scene cue around the existing economic PromoCard without crowding the face.

### Cut 3 — Kingston After Dark slice
Configure the real Scene, participating Places/Moments, one collection, and one operationally verifiable Crew Run.

### Cut 4 — Emerging mastery
Track a small set of behavior dimensions and surface `A path is forming` only after evidence exists.

### Cut 5 — Evaluate
Do not proceed to factions, trading, territory, companions, guild hierarchies, or elaborate raids unless the measured loop improves acquisition, verified action, PromoCard use, social invitation, or return behavior.

## 18. Explicitly deferred

Do not build yet:
- trading economy
- collectible marketplace
- AR
- virtual pets/companions
- territory control
- large guild hierarchy
- global faction war
- elaborate NPC/chat system
- dozens of classes/skill trees
- random paid loot
- punitive streak systems

The first job is to make one real night in Kingston feel more legible, consequential, social, collectible, and worth returning to — with PromoCard at the center.
