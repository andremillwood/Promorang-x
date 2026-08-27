# Promorang Design Doctrine

This is the canonical design contract for Promorang.

Implementation is governed by [`docs/design/a-plus-platform-execution-plan.md`](docs/design/a-plus-platform-execution-plan.md). `DESIGN.md` defines the product law; the execution plan defines the workstreams, sequence, release gates, and evidence required to meet it.

It exists because "better dashboard sections" are not enough. Promorang must not become a polished stack of panels, metrics, and explanatory blocks. It should feel like a living social opportunity marketplace where real-world action creates proof, value, memory, and return behavior.

Every designer, engineer, and coding agent should treat this file as product law.

## Canonical Gem Economy

Promorang is Gem-native. **1 Gem equals 1 USD of platform value.** Gems secure activation funding and complete every paid action inside the ecosystem, including access, tickets, creator work, host compensation, promotion, rewards, marketplace activity, refunds, and eligible payouts.

- Users earn Gems or purchase Gems with external currency.
- External currency enters when Gems are purchased and exits only through approved settlement or withdrawal.
- Users do not pay one another directly in JMD or USD inside Promorang.
- Funding locks Gems in an activation reserve so the same balance cannot be committed more than once.
- Paid access issues only after the required Gems are atomically secured.
- Payouts release secured Gems to the recipient after the stated condition is earned.
- Refunds return secured Gems through the canonical ledger.
- Show Gems as the primary value. Where helpful, show the supporting equivalence: `250 Gems · US$250 platform value`.
- Keep available, secured, pending, earned, refunded, released, and withdrawn Gems visibly distinct.
- Promotional Gems can carry withdrawal restrictions, but their internal spending value remains 1 Gem = 1 USD.

Never present an offered contribution, client-side confirmation, or external payment intent as secured funding. The canonical economy ledger and activation Gem reserve are the financial truth.

## 0. Product North Star

Promorang is a cultural operating system. It helps people discover culture, show up, create and share content, prove participation, unlock value, and help the creators, scenes, venues, and organizers around them grow.

The product is organized as three connected layers:

### Culture Layer

The living, consumer-facing surface: Home, Discover, Live Now, Scenes, Creators, Inbox, moments, content, check-ins, saved items, and the personal scene graph. It should lead with people, imagery, movement, and what is happening now.

### Distribution Layer

The growth engine: Growth Hub, PromoShare, Content Drops, Missions, Referrals, Pieces, creator analytics, sharing, earning, audience growth, and campaign participation. These systems should appear contextually beside content and moments, not only as isolated destinations.

### Operations Layer

The working system: organizer home, moment management, check-ins, tickets and sales, promoters, scene operations, analytics, payouts, and venue workflows. It is denser than the Culture Layer, but still cinematic, legible, and outcome-led.

The three layers must feel connected:

`Culture creates attention -> Distribution turns attention into movement -> Operations makes movement repeatable`

## 0.1 Navigation Philosophy

Navigation is organized around the user's intent and success, not around Promorang's internal product inventory.

The canonical primary destinations across web and mobile are:

- **Today:** what needs my attention and what is the best move I can make now?
- **Discover:** what moments, actions, places, people, rewards, and opportunities are available?
- **Create:** what do I want to make happen?
- **Progress:** what happened because of me and how close am I to the result I want?
- **Vault:** what proof, rewards, earnings, access, memories, and assets have I kept?

These destinations remain stable across stakeholder roles. The content, recommendations, language, metrics, and available actions inside them adapt to the user's current intent, active role, permissions, and journey state.

Role personalization must change the experience more than it changes the map. A creator can see impact and earnings in Progress while a merchant sees visits and retention, but both should know that Progress is where results live.

Existing capabilities remain available as contextual or operational tools:

- **Culture and discovery tools:** Live Now, Scenes, Creators, Inbox, search, saved objects.
- **Distribution tools:** Content Drops, Growth Hub, PromoShare, PromoPush, Referrals, Pieces, Missions.
- **Operations tools:** organizer workspace, campaigns, events, check-ins, tickets, scanning, analytics, proof review, payouts.
- **Account and value utilities:** Wallet, settings, KYC, support, detailed activity, advanced economy.

The sidebar or account menu can provide reliable access to these tools. They must not compete equally with the five primary destinations. PromoShare, Pieces, proof, rewards, and distribution systems should appear beside the moments, content, creators, offers, and campaigns that give them meaning.

## 0.2 In-App Visual System & Layout Architecture

- Use a black and near-black obsidian (`#0D0D0E`) cinematic base with translucent charcoal glass surfaces (`backdrop-filter: blur(20px)`).
- **Promorang Orange (`#FF5500` / `#F97316`)** is the canonical primary color identifying primary actions, active state glows, and persuasion triggers. It anchors visual hierarchy across all screens.
- **Unified Hero Architecture**: Never stack separate disconnected banner boxes above a page heading. Always integrate headlines, subheadlines, live proof tickers, primary CTAs, and progress rings into a single, cohesive, high-impact hero container.
- **Accessible Everyman Language**: User-facing copy must avoid Wall-Street/crypto jargon ("Capital Pool", "Yield Multiplier", "Staking Ledger"). Use warm, everyday words ("Community Treat Vault", "Early Bird 3x Boost", "Post a Perk", "Saved Perks", "Your Wins").
- Use subtle white borders, controlled amber/orange glows (`box-shadow: 0 0 30px rgba(255, 85, 0, 0.3)`), and restrained status colors.
- Put editorial culture imagery in the product, not only on marketing pages.
- Prefer rails, feeds, media cards, compact lists, and active objects over explanatory panel stacks.
- Data should feel alive: connect numbers to people, moments, changes, proof, and next actions.
- Empty states must invite a useful action and explain what will unlock.
- Desktop can use a supporting right rail; mobile becomes one prioritized stream with horizontal shelves and persistent bottom navigation.

The signature visual differentiator is a **living scene feed**: cinematic content and moment objects connected to proof, status, distribution, and value without turning the experience into a financial dashboard.

## 0.3 Component System

- **Unified Hero Card:** single-container hero merging headline, live ticker pill, 1-tap CTA, and community vault progress ring.
- **Cultural feed card:** media-first post with identity, scene context, social actions, proof, and a relevant CTA.
- **Story/scene rail:** compact horizontal previews of people, scenes, moments, drops, and live activity.
- **Live Now rail:** active moments with visible attendance or check-in energy.
- **PromoShare spotlight:** earnings or activation state, top shared object, attribution signal, and one CTA.
- **Growth metrics card:** small trend-based indicators tied to distribution outcomes.
- **Piece value card:** the object, its cultural origin, unlock status, and one next action.
- **Mission progress card:** objective, progress, proof requirement, reward, and continuation action.
- **Content drop card:** creator identity, media, distribution state, and proof or sharing action.
- **Moment card:** date, place, social confidence, access state, and RSVP/check-in action.
- **Scene and creator cards:** identity and activity before statistics.
- **Organizer metric card:** operational number, change, implication, and direct action.
- **Wallet/Vault status card:** retained value and memories, separated from discovery.
- **Contextual CTA card:** one action that becomes relevant because of the object beside it.

## 0.4 In-App UX Principles

1. Lead with movement and show what is happening now.
2. Unify hero elements into clean, non-cluttered single containers.
3. Make content central; statistics support the content rather than replace it.
4. Evolve language to be accessible, everyman, and warm.
5. Make earning visible, credible, and contextual.
6. Hide complexity until the user has a reason to need it.
7. PromoShare is a distribution engine, not merely a page.
8. Pieces are contextual value objects, not first-run financial clutter.
9. Growth Hub is the command center for creators, promoters, and ambassadors.
10. Organizer surfaces prioritize operations and performance.
11. Preserve working systems and improve their hierarchy before inventing replacements.
12. Every zero state should offer a first useful move.

## 0.5 Product Success Contract

Promorang must be success-led, not feature-led.

Every primary experience must make seven things clear:

1. **Desired outcome:** what is the user trying to make happen?
2. **Current move:** what is the single best action to take now?
3. **Journey position:** what has been completed, what is current, and what comes next?
4. **Proof:** what counts as evidence that the action happened?
5. **Unlock:** what value, access, status, memory, earning, or business result follows?
6. **Success destination:** where will the result live after completion?
7. **Return:** what relevant action should the user take next?

A screen is not successful merely because an object was created, submitted, or viewed. It is successful when the user understands how that object moves them toward a human outcome.

Every journey should express this motivational rhythm:

`Notice -> Move -> Prove -> Unlock -> Grow -> Return`

This rhythm complements the platform loop:

`Discover -> Choose -> Act -> Prove -> Earn -> Keep -> Return`

## 0.5.1 Guided Activation Continuum

Activation creation and activation review are one continuous success journey. They must not feel like unrelated forms, dashboards, or administrative modules.

The canonical creation path is:

`Desired outcome -> Scene -> Moment -> Story -> People -> Shared value -> Activation review`

- **Desired outcome:** name the human change before selecting mechanics or metrics.
- **Scene:** choose the living community, places, rituals, creators, and relationships the activation should strengthen.
- **Moment:** give the Scene a timely reason to gather, participate, create, and contribute.
- **Story:** define invitation, creator perspective, live meaning, and after-story as part of the experience itself.
- **People:** make the roles and returns of hosts, creators, venues, merchants, brands, and supporters understandable.
- **Shared value:** define what participants leave with, what partners make possible, what success looks like, and which commitments require Gems.
- **Activation review:** present the plan as a single human story before it opens into invitations, assignments, funding, access, launch, and outcome review.

Each step should ask one consequential question, reveal only the choices needed for that decision, and immediately update a living activation preview. Progress should feel earned through clarity, not through form completion.

After launch, the same story returns as:

`People -> Content -> Contribution -> Value -> Commercial return -> Scene learning -> Next decision`

The final decision must be explicit: repeat, improve, invite, fund, or close. The review should explain why that is the next move and carry useful learning into the next activation.

Creation language must remain warmer than the underlying operations. Participant-facing and collaborative surfaces should prefer “what will tell us it worked,” “what people leave with,” “the story,” “the room,” and “what opens next.” Operational terms such as evidence, verification, reconciliation, eligibility, and attribution may appear only when the user needs their precision.

The platform loop describes what happens in Promorang. The motivational rhythm describes what the experience must help the user feel and understand.

### Notice

Show something relevant, timely, nearby, socially credible, or personally meaningful.

### Move

Recommend one clear action. Secondary actions must not compete visually with the current move.

### Prove

Explain the proof requirement before commitment. Capture proof with the least friction consistent with trust.

### Unlock

Immediately explain what changed, what was earned, who benefited, and where the result now lives.

### Grow

Connect the completed action to personal trust, access, skill, earnings, business results, or community momentum.

### Return

Offer the next relevant move based on real journey state. Do not manufacture urgency or meaningless activity.

## 0.6 Current Move And Today

Today is the authenticated center of Promorang on web and mobile.

It must answer:

**What is the most valuable thing I can do right now?**

The first viewport should prioritize:

1. One current move.
2. The active path it belongs to.
3. Anything waiting on the user.
4. The value or result close to unlock.
5. Relevant discovery after active responsibilities are clear.

Valid current moves include:

- check in to a joined Moment
- complete missing proof
- claim an unlocked reward
- continue an accepted creator brief
- review a partner proposal
- scan a customer redemption
- fund a campaign awaiting budget
- view and act on completed results

Points, balances, Keys, Pieces, generic metrics, and broad discovery must support the current journey rather than displace it.

If no active journey exists, Today should recommend one populated, achievable first action rather than display an empty dashboard.

## 0.7 Journey State Contract

Every active journey must have a shared state that can be read consistently by web, mobile, notifications, analytics, and support.

Required journey fields:

- stakeholder intent
- desired outcome
- source object
- current stage
- completed stages
- recommended next action
- proof requirement
- reward or business outcome
- deadline when genuine
- blocker or exception
- success destination
- return recommendation

Use these universal customer-facing statuses unless a domain requires a clearer specific label:

- Not started
- Ready
- In progress
- Waiting on you
- Under review
- Needs attention
- Verified
- Unlocked
- Completed
- Closed

Every status must include a plain-language consequence or next-action sentence.

Examples:

- **Under review:** The host is checking your proof. No action is needed.
- **Needs attention:** Add the missing post link before Friday.
- **Unlocked:** Your reward is ready in the Vault.

Internal states such as `pending`, `processed`, `active`, or `executed` must be translated before they reach users.

## 0.8 Success Destinations

Every important journey must end at an explicit result, not at object creation.

- **Participant:** verified participation, reward, memory, access, and the next relevant invitation.
- **Creator:** qualified action generated, proof accepted, impact recorded, and earnings or access delivered.
- **Host:** attendance verified, outcome reviewed, reputation strengthened, and a repeat path available.
- **Merchant:** visit or redemption verified, customer value delivered, and repeat behavior visible.
- **Brand:** funded action verified, cost and result understood, and a renewal decision supported.
- **Agency:** execution reconciled, evidence complete, and a client-ready result available.

Creation is a stage. Submission is a stage. Approval is a stage. The success destination explains what changed in the world because the journey was completed.

## 0.9 Progress And Motivation

Progress exists at four connected levels:

1. **Action progress:** completion of the immediate task.
2. **Journey progress:** movement toward a declared result.
3. **Personal growth:** accumulated proof, trust, access, capability, earnings, and reputation.
4. **Community momentum:** visible progress created by a scene, place, team, audience, or recurring group.

Promorang can learn from Duolingo's clarity, progression, small wins, feedback, and return rhythm without copying its visual personality or using manipulative gamification.

Use:

- one obvious next action
- visible paths
- meaningful intermediate milestones
- immediate state feedback
- participation rhythm
- repeat-attendance and repeat-contribution signals
- collective scene goals
- access and opportunity unlocked through verified contribution

Avoid:

- punitive streak loss
- artificial scarcity or urgency
- celebration for meaningless activity
- points that eclipse real value
- notification pressure disconnected from an active journey
- mechanics designed only to increase time in the app

The desired behavior is not endless screen engagement. It is repeated meaningful action online and in the real world.

## 0.10 Human Motivation, Psychographics, And Ethical Persuasion

Promorang must be built with real human psychology in mind. The platform is not trying to convince people to love "proof," "reputation," "ROI," "activation operations," or "attribution." Those are internal mechanisms. Humans respond to desire, belonging, status, safety, money, pleasure, identity, recognition, and opportunity.

Every major screen must answer:

1. What human desire is active here?
2. What fear, uncertainty, or friction could stop the user?
3. What immediate value can the user feel before they understand the system?
4. What social signal makes the action feel safe, desirable, or worth choosing?
5. What future self does this action help the user move toward?
6. What proof, value, or memory will make the action feel real after completion?

Do not design for generic "engagement." Design for motivated return: the user comes back because something meaningful opened, someone remembered them, value moved, or their place in a Scene became clearer.

### Core Human Desires

Promorang should serve these desires visibly:

- **Belonging:** "I found my people, my place, my Scene."
- **Recognition:** "People know I showed up, helped, created, hosted, or moved something."
- **Status:** "My place in the Scene is growing."
- **Access:** "Something opened for me that was not available before."
- **Money and value:** "My action produced Gems, savings, earnings, rewards, or commercial movement."
- **Pleasure and aliveness:** "This makes my life more interesting, fun, social, creative, and worth leaving home for."
- **Security and trust:** "The value is real, the rules are clear, and I will not be tricked."
- **Competence:** "I know what to do, what counts, and how to get better."
- **Identity:** "This reflects who I am becoming: participant, creator, host, merchant, brand, agency, scene lead."
- **Reciprocity:** "I helped make this happen, and the system recognizes what came back."

### Life-Force Mapping

Promorang should translate classic direct-response motivations into Promorang-native language:

- **Survival and security:** clear terms, held Gems, refunds, trust, visible eligibility, no fake scarcity.
- **Enjoyment of life:** music, food, sport, wellness, nightlife, family, local culture, travel, beauty, discovery, play.
- **Companionship and belonging:** Scenes, familiar faces, return visits, friend signals, hosts, creators, communities.
- **Social approval:** being invited back, visible contribution, creator/host credibility, status in a Scene.
- **Superiority and achievement:** better access, stronger profile, sponsor readiness, creator earnings, host momentum.
- **Care and protection:** proof review, dispute clarity, safety, transparent money movement, respectful reminders.
- **Better living conditions:** earning Gems, finding opportunities, growing a business, bringing customers back, building audience.
- **Food, drink, comfort, and reward:** merchant offers, access passes, return perks, ticket value, tangible unlocks.

These forces must be expressed through product objects and moments, not through manipulative copy. Show a real place, person, access path, reward, Gem movement, invitation, or return outcome.

### Psychographics By Stakeholder

#### Participants

Participants want a more interesting life with less social uncertainty. They ask:

- Where should I go?
- Will it be worth it?
- Will I know anyone or feel welcome?
- What do I get for showing up?
- Will this help me become part of something?

Design for: discovery confidence, social proof, simple current moves, visible access, memories, Gems, invitations, and return paths.

#### Creators

Creators want attention that becomes influence, income, status, bookings, collaboration, and proof that they move people.

They ask:

- Did my content make anyone act?
- Can brands, hosts, and Scenes see my value?
- Can I earn without being reduced to cheap labor?
- What should I create next?

Design for: creator identity, content movement, audience-to-action clarity, Gems earned, collaborations opened, and proof of influence.

#### Hosts

Hosts want rooms people want to enter and return to. They want recognition, turnout, operational confidence, sponsor readiness, and repeatable rituals.

They ask:

- Who is coming?
- Did people actually show up?
- What made the room work?
- Who should I invite back?
- Can this attract partners?

Design for: live room confidence, attendance clarity, access control, return invitations, Gems released, and sponsor-ready results.

#### Venues And Merchants

Venues and merchants want affection, foot traffic, purchases, redemptions, repeat customers, and cultural relevance without being treated like disposable deal inventory.

They ask:

- Did people come through the door?
- Did they buy, redeem, return, or talk about us?
- Which Scenes should we support?
- What offer or ritual should we repeat?

Design for: visits, return behavior, redemptions, creator-driven traffic, familiar customers, and "this place matters" language.

#### Brands

Brands want demand, relevance, cultural fit, attributable movement, creator output, and confidence that money funded something people valued.

They ask:

- Did our spend move real people?
- Did creators and hosts make the brand feel welcome?
- What should we renew, stop, or scale?
- Can we prove value without killing the culture?

Design for: funded movement, counted stories, commercial return, creator/venue fit, audience quality, and renewal decisions.

#### Agencies

Agencies want coordination, client confidence, evidence, margin, repeatable playbooks, and a clean way to show what changed.

They ask:

- What outcome are we responsible for?
- Who is doing what?
- Is the evidence client-ready?
- What should we repeat?

Design for: activation clarity, stakeholder responsibilities, evidence completeness, Gems secured/released, and client-ready return summaries.

### Persuasion Rules

Promorang can use strong persuasion, but it must remain ethical.

Use:

- specificity over hype
- concrete value over vague excitement
- social proof tied to real action
- scarcity only when inventory, time, or access is genuinely limited
- urgency only when a real deadline exists
- contrast before/after states: "before showing up" vs "after this opened"
- identity reinforcement: "people like you are becoming known here"
- reciprocal value: "you helped this happen; here is what came back"
- loss clarity without fearmongering: "this access closes tonight" rather than "you will miss everything"

Avoid:

- fake urgency
- fake scarcity
- vanity streak pressure
- guilt-based notifications
- manipulative gambling language
- making money movement feel guaranteed when it depends on review, settlement, or eligibility
- reducing people to price, rank, or output
- making participants feel surveilled
- making creators feel exploited
- making merchants feel like coupons
- making brands feel like they can buy culture without contributing to it

### Copy Translation Rules

Use system language in admin, contracts, disputes, audit logs, technical reports, and precise financial controls. Translate it everywhere else.

- "Proof" -> "You were there," "It counted," "Show what happened."
- "Reputation" -> "Become known," "Get invited back," "Your place in the Scene."
- "ROI" -> "What came back," "What moved," "People visited, bought, returned, and cared."
- "Payout" -> "Gems released," "Earnings ready," "Paid for the work."
- "Funding event" -> "Gems secured," "A partner helped make this possible."
- "Qualified action" -> "Someone acted because it mattered."
- "Conversion" -> "Interest became action."
- "Retention" -> "They came back."
- "Attribution" -> "See what your story set in motion."
- "Eligibility" -> "Something opened for you."

The user should feel the human benefit before they learn the Promorang mechanism.

## 0.11 Celebration And Feedback

Feedback must answer:

1. What happened?
2. What did it count toward?
3. What changed or unlocked?
4. Where can the result be found?
5. What is the next move?

Use three celebration levels:

### Acknowledgment

For saved, joined, updated, invited, or drafted states. Use a compact confirmation, restrained movement, and optional light haptic feedback.

### Meaningful Completion

For verified check-ins, accepted proof, published campaigns, completed referrals, and reward unlocks. Use a focused receipt, visible progress change, and the next action.

### Milestone

For first verified participation, first earnings, first repeat attendance, first successful hosted Moment, first commercial renewal, and community milestones. Use a dismissible cinematic recognition moment and an optional shareable proof card.

Never celebrate unverified activity as if it were a completed outcome. All motion must respect reduced-motion preferences, and all status changes must be available to assistive technologies.

## 0.12 Cross-Platform Continuity

Web and mobile have different responsibilities but share one user journey.

Web should lead in:

- public discovery and trust
- rich explanation
- creation and configuration
- coordination
- analytics and reporting
- administration
- detailed economic and Vault inspection

Mobile should lead in:

- the current move
- live and nearby discovery
- check-in, scanning, and redemption
- capture and proof submission
- quick publishing
- approvals and notifications
- claiming and using unlocked value
- live Moment operations

The following must remain identical across platforms:

- journey stages
- status meaning
- primary terminology
- proof state
- unlock state
- progress
- success destination
- deep-link destination

If a user joins on web, mobile must know that check-in is next. If proof is submitted on mobile, web must show that it is under review. Navigation may adapt to device constraints; journey meaning may not.

## 0.13 Surface Modes

Promorang has four intentional visual modes. Dark or light presentation must follow the job of the surface rather than habit.

### Culture Mode

Dark, cinematic, image-led, social, and kinetic. Use for public culture discovery, Pulse, live activity, creator launches, and immersive Moment presentation.

### Guided Action Mode

Focused and calm, using charcoal or warm cream according to context. Use for onboarding, check-in, proof submission, claiming, creation steps, and current-move experiences.

### Operations Mode

Efficient and restrained, usually warm cream or controlled charcoal. Use for organizer, brand, merchant, agency, moderation, reporting, and reconciliation work.

### Vault Mode

Dark, tactile, prestigious, and collectible. Use for memories, access, earned artifacts, proof receipts, and meaningful progression.

Do not interpret the cinematic direction as permission to make every surface black. Do not interpret operational clarity as permission to turn Promorang into generic light SaaS. The surface mode should clarify the user's state while preserving the shared typography, color meaning, object language, and brand gestures.

## 0.14 Human Social Return

Promorang's social promise is not that people will maintain a better proof record or optimize reputation.

The human promise is:

**Find your Scene. Show up. Become part of what happens next.**

Promorang should help people:

- find something worth leaving home for
- meet people they want to know
- feel recognized and included
- become part of a Scene
- be remembered for what they bring
- receive better invitations
- find friends, collaborators, creative partners, customers, and opportunities
- turn one good Moment into an ongoing social life
- see what their presence or story helped make possible

The underlying trust system can capture verification, attribution, reputation, eligibility, and return behavior. These are infrastructure concepts, not the emotional personality of the product.

Translate them for humans:

- **Proof** becomes "You were there," "You showed up," or "It counted."
- **Reputation** becomes "Become known," "People want you involved," or "Get invited back."
- **Attribution** becomes "See what your story set in motion."
- **Qualified action** becomes "Someone acted because it mattered."
- **Retention** becomes "They came back."
- **Conversion** becomes "Interest became action."
- **Eligibility** becomes "Something opened for you."
- **Status** becomes "Your place in the Scene."
- **Sponsor funding** becomes "A partner helped make this possible."
- **Commercial ROI** becomes "People visited, bought, returned, and cared."

Use the precise system language only when precision is necessary for administration, contracts, disputes, detailed reporting, trust and safety, or economic controls.

### Social Return By Stakeholder

- **Participants:** people, belonging, invitations, memories, access, and a more interesting life.
- **Creators:** attention that leads to relationships, bookings, collaboration, recognition, and real-world influence.
- **Hosts:** a returning crowd and recognition for creating rooms people want to enter.
- **Venues and merchants:** affection, word of mouth, familiar customers, repeat visits, and a meaningful place in relevant Scenes.
- **Brands:** cultural relevance earned by helping something people value happen, followed by attributable demand.
- **Scenes:** stronger connections, recurring rituals, supportive places, visible creators, capable hosts, and expanding opportunity.

Content participates before, during, and after a Moment:

- **Before:** create desire, context, and the invitation.
- **During:** capture identity, energy, participation, and connection.
- **After:** carry the memory, relationships, and next invitation forward.

The visible human loop is:

`Discover -> Connect -> Show up -> Belong -> Become known -> Open doors`

The system loop can remain underneath it:

`Signal -> Action -> Verification -> Attribution -> Return`

Never make the system loop do the emotional work of the human loop.

## 1. The Product Feeling

Promorang is:

- a live map of what is forming
- a discovery surface for moments, missions, places, rewards, and campaigns
- a proof engine for real-world participation
- a memory and value layer for what people helped create
- a workspace only when a user is operating, reconciling, or reporting

Promorang is not:

- a generic SaaS dashboard
- an explanatory landing page dressed up as product
- a crypto exchange
- a coupon grid
- an admin panel for participants
- a set of equal-weight cards and metric blocks

The default feeling should be: **there is something happening, I can choose my role, I know what action matters, and I understand what I keep if I move.**

## 2. The Core Loop

All user-facing surfaces should express some part of this loop:

`Discover -> Choose -> Act -> Prove -> Earn -> Keep -> Return`

Role emphasis changes:

- Participants discover, choose, act, prove, earn, keep, and return.
- Creators launch, recruit, convert attention, reward supporters, and reuse momentum.
- Hosts create rooms, verify turnout, build reputation, and become sponsor-ready.
- Venues and merchants convert attention into visits, redemptions, loyalty, and repeat demand.
- Brands sponsor behavior, capture proof, measure outcomes, and fund repeatable campaigns.
- Admins and operators monitor trust, abuse, liquidity, support, and system health.

If a screen does not clearly support one part of this loop, it should be simplified, moved, or reframed.

## 3. The Learning Ladder

Promorang should educate users into the platform without overwhelming them.

The journey should unfold as:

`Orientation -> First Value -> Proof -> Unlock -> Mastery`

Each stage has a job:

- Orientation: Promorang helps users turn real participation into proof, rewards, and retained value.
- First Value: The user finds one moment, mission, offer, creator drop, place, or campaign worth acting on.
- Proof: The user checks in, submits proof, shares, attends, completes, verifies, backs, or helps move something.
- Unlock: The action creates eligibility, reward, status, Vault memory, campaign proof, better access, or future opportunity.
- Mastery: The user can host, launch, sponsor, back, promote, build reputation, or create repeatable value.

This ladder should be visible enough that users know where they are going, but light enough that they can still act quickly.

Do not front-load the whole platform.

Teach through:

- journey markers
- object states
- progress language
- proof receipts
- unlock moments
- contextual education beside the action
- next-step prompts after value has been felt

Avoid:

- long educational blocks before the user sees an opportunity
- explaining every stakeholder before the user has a reason to care
- economy theory before the user has earned, unlocked, saved, or backed something
- sending new users into generic dashboards as their first lesson

The rule is: **educate toward the end goal, but reveal detail only when it helps the next action.**

## 4. Reference Intelligence

Promorang can learn from great platforms without imitating them.

The goal is not to look like Apple, Meta, YouTube, Amazon, legacy coupon directories, or Fiverr. The goal is to translate their strongest product instincts into Promorang's world of moments, missions, proof, rewards, status, and retained value.

### Apple

Borrow:

- calm hierarchy
- restraint
- premium object presentation
- confidence through spacing
- clear defaults
- product education that arrives at the moment of use
- emotional language around what the object lets a person become or do

Translate into Promorang:

- make moments, tickets, Vault artifacts, rewards, and proof receipts feel desirable
- use fewer competing controls per viewport
- let the primary action feel obvious and premium
- teach the platform through elegant state changes and guided progression

Avoid:

- sterile emptiness
- over-polished minimalism that hides the social/local energy
- beauty that slows access to value

### Meta

Borrow:

- social graph awareness
- lightweight creation
- feeds that feel alive
- identity, profile, and reputation loops
- reactions, sharing, following, saving, and community proof
- the sense that other people are moving through the same world

Translate into Promorang:

- show who is attending, claiming, backing, hosting, verifying, and unlocking
- make proof social without making it noisy
- let creators, hosts, promoters, and participants build visible reputation
- use activity and status to create confidence around action

Avoid:

- endless passive scrolling
- engagement without outcome
- social noise that buries the proof/action/reward loop
- vanity metrics disconnected from verified value

### YouTube

Borrow:

- creator-led surfaces
- strong thumbnails and titles
- watch/continue/save behavior
- creator identity as a trust signal
- recommendation shelves
- progression from casual discovery into subscription, community, and monetization

Translate into Promorang:

- make creator drops, moments, and missions visually browseable
- use shelves for "live near you," "worth proving," "creator launches," and "rewards close to unlock"
- make creator identity and proof history help users decide
- support a path from viewer/participant to promoter, host, creator, or backer

Avoid:

- passive media consumption as the end state
- clickbait hierarchy
- burying real-world action behind content browsing

### Amazon

Borrow:

- decision confidence
- search and filtering depth
- clear price/value comparison
- trust signals
- delivery/availability clarity
- saved lists, recommendations, and repeat purchase loops
- conversion discipline

Translate into Promorang:

- make offers, rewards, outcome packages, and sponsored actions easy to compare
- show eligibility, deadline, proof requirement, sponsor, reward, and availability clearly
- make claiming, saving, backing, sponsoring, and redeeming feel low-friction
- use recommendations based on role, location, past proof, and unlocked status

Avoid:

- marketplace clutter
- transactional coldness
- overwhelming rows of options before the user understands what matters

### Local Commerce & Collective Drops

Borrow:

- local deal clarity
- urgency
- redeemability
- merchant context
- simple value framing
- "this is available near me now" energy

Translate into Promorang:

- make local offers and moments feel immediate, concrete, and redeemable
- show what must be done to unlock or claim the value
- connect rewards to proof, return visits, and community memory
- help merchants understand how offers create verified relationships, not just discounts

Avoid:

- cheap coupon-bin feeling
- discount addiction
- value reduced to price savings only
- merchant experiences that feel extractive

### Fiverr

Borrow:

- task clarity
- service packaging
- creator/seller reputation
- tiers and packages
- brief-to-delivery workflow
- visible proof of capability

Translate into Promorang:

- make missions feel like clear contribution opportunities
- package brand/merchant outcomes into understandable tiers
- show proof history, completion quality, response time, and reputation where relevant
- help creators, promoters, hosts, and agencies present what they can reliably deliver

Avoid:

- commoditizing people
- race-to-the-bottom pricing
- cluttered service cards that hide quality and context

### Promorang Synthesis

Promorang should combine:

- Apple's clarity and desirability
- Meta's social proof and identity loops
- YouTube's creator discovery and recommendation shelves
- Amazon's decision confidence and conversion discipline
- Local commerce immediacy, collective tipping drops, and redeemable value
- Fiverr's task clarity, reputation, and package logic

But the final product should feel like none of them.

Promorang's distinct synthesis is:

**a social opportunity marketplace where real participation becomes proof, proof becomes status, and status unlocks rewards, access, memory, and repeatable value.**

### Specific UI And UX Cues To Translate

Use these as concrete design moves, not vague inspiration.

#### Apple-Inspired Cues

Use for onboarding, Vault, proof receipts, moment detail, and premium reward states.

UI cues:

- one dominant object per viewport with generous negative space
- large image or artifact above dense explanation
- soft, precise cards with minimal borders
- clear primary action fixed near the object
- short labels, not heavy instructional paragraphs
- progressive setup screens with one decision per step
- elegant empty states that show the next meaningful action

UX cues:

- default to the simplest recommended path
- reveal advanced settings only after the main action is understood
- use completion moments that feel earned, not merely confirmed
- make unlocks feel like the system recognizing the user

Promorang examples:

- Vault artifact page: large earned memory/pass, status line, proof trail, unlocks next.
- New user orientation: one sentence, one live object, one action.
- Proof verified state: visual recognition moment before operational details.

#### Meta-Inspired Cues

Use for Pulse, profiles, creator pages, community proof, comments, follows, and sharing.

UI cues:

- activity feed with clear human actors
- profile chips attached to actions
- "friends/people like you are going" social proof modules
- reactions that are secondary to verified action
- lightweight composer for moments, posts, drops, or updates
- follow/save/share controls that do not compete with claim/check-in
- notification language tied to progress and social movement

UX cues:

- make participation feel socially legible
- show who moved an opportunity and what changed
- let users build reputation through repeated verified action
- allow passive discovery, but always point toward an outcome

Promorang examples:

- Pulse item: "12 people saved, 4 checked in, 2 rewards left."
- Creator profile: recent proof trail, supporter movement, active missions.
- Participant status: visible signal built from verified actions, not likes.

#### YouTube-Inspired Cues

Use for creator drops, discovery shelves, recommendation modules, content missions, and watch-to-unlock flows.

UI cues:

- strong thumbnail-first cards
- title, creator, status, and action visible without opening detail
- horizontal shelves with meaningful labels
- watch/save/continue states
- creator identity and credibility next to the object
- detail page with primary media first, action panel nearby
- recommended next actions after completion

UX cues:

- let users browse before they commit
- convert content attention into mission/action/proof
- move users from viewer to supporter, promoter, host, creator, or backer
- keep recommendations tied to unlocked status and past proof

Promorang examples:

- "Creator launches near you" shelf.
- Content drop card: thumbnail, creator, task, reward, proof needed.
- After watching: "Share with proof," "Claim mission," "Save to Vault."

#### Amazon-Inspired Cues

Use for offers, rewards, packages, sponsorship buying, filters, comparison, and checkout-like flows.

UI cues:

- searchable/filterable lists with visible result counts
- comparison rows for packages and reward options
- trust blocks near conversion: sponsor, proof required, eligibility, deadline
- clear availability and scarcity states
- saved lists/watchlists
- sticky action summary on detail pages
- confirmation screens that restate value, proof, and next step

UX cues:

- reduce uncertainty before commitment
- show all conditions before claim/sponsor/back
- help users compare without reading long pages
- make repeat actions faster after the first successful one

Promorang examples:

- Offer card: value, location, proof, expiry, claim state.
- Brand package selector: verified actions, audience, proof type, timeline, price.
- Mission filters: location, reward, proof type, deadline, eligibility.

#### Community Drop & Local Commerce Cues

Use for local offers, merchant activations, redemption, limited-time campaigns, and place-based rewards.

UI cues:

- clear local value statement at the top of cards
- large redeem/claim affordance
- expiry and quantity remaining near the CTA
- merchant/location context visible early
- mobile redemption screen with code, QR, or check-in state
- simple before/after value framing where relevant
- map/list toggle for local discovery

UX cues:

- make "near me and available now" obvious
- make redemption feel simple and trustworthy
- connect the discount/perk to proof and return behavior
- avoid making merchants feel like disposable deal inventory

Promorang examples:

- Place card: "Check in tonight, unlock return drink."
- Merchant dashboard: offer redemptions as proof-backed relationships.
- Redemption receipt: visit verified, reward used, next return unlock visible.

#### Fiverr-Inspired Cues

Use for missions, creator services, promoter work, agency flows, and brand/merchant outcome packages.

UI cues:

- task cards with scope, deadline, reward, proof, and eligibility
- tiered packages with clear deliverables
- reputation indicators tied to completed proof
- brief form broken into steps
- order/request status timeline
- inbox or collaboration area attached to active work
- completion receipt with rating, proof, and next opportunity

UX cues:

- make the ask unambiguous
- make quality and reliability visible
- move work through clear states
- protect people from being reduced to price by showing proof, context, and fit

Promorang examples:

- Mission detail: ask, proof, deadline, reward, claim, submit, verified.
- Promoter profile: completed drops, verified reach, payout history, status.
- Brand package: Starter / Activation / Market Movement with proof and outcomes.

### Cross-Platform Pattern Rules

Use these patterns across Promorang:

- Feed for freshness and social motion.
- Shelf for browseable discovery.
- Ticket for claimable action.
- Receipt for proof and recognition.
- Package for brand/merchant buying decisions.
- Timeline for work, proof, disputes, and unlocks.
- Sticky action rail for complex detail pages.
- Save/watchlist for future intent.
- Profile/status chip for trust and identity.
- Map/list toggle for local opportunity.
- Comparison row for packages, rewards, and offers.

Avoid these mismatches:

- Do not use dashboard cards for discovery.
- Do not use feed mechanics for operational reconciliation.
- Do not use coupon layout for prestige Vault artifacts.
- Do not use marketplace density before orientation.
- Do not use creator-content browsing when the real goal is real-world action.

## 5. Dashboard Is A Mode, Not The Product

Dashboard design is allowed only when the user is doing dashboard work:

- managing campaigns
- reviewing proof
- configuring inventory
- reconciling payments
- moderating abuse
- comparing operational performance
- administering the platform

Dashboard design is not allowed as the default for:

- homepage
- Pulse
- Discover
- Moment detail
- missions
- participant experience
- creator launch discovery
- Vault
- public marketing

Dashboard symptoms to avoid:

- metric cards as the first impression
- four-column stat grids without an immediate action
- panels that explain value but do not let users choose or do anything
- dense borders everywhere
- same-size cards for everything
- internal product language used as customer-facing copy
- calculators presented as finance widgets instead of outcome tools

## 6. The Object Comes First

Promorang screens should be object-led, not section-led.

Primary objects:

- Moment
- Mission
- Offer
- Place
- Memory
- Reward
- Ticket
- Piece
- Campaign
- Creator drop
- Proof receipt

Every object should answer:

1. What is it?
2. Why does it matter now?
3. What action can I take?
4. What proof is required or captured?
5. What do I get or keep?
6. Who else benefits?

If a card cannot answer at least four of these, it is probably decorative or incomplete.

## 7. Surface Rules

### Homepage

The homepage should not be a dashboard, a product manual, or a wall of value maps.

It should:

- show the subject clearly in the first viewport: real moments, real action, real places, real rewards
- make the product feel scrollable and alive
- route visitors by intent without burying them in role theory
- preserve powerful marketing claims, calculators, proof, and stakeholder copy
- turn explanation into visible examples and choices

Avoid:

- internal critique copy
- abstract cards with no inspectable object
- giant dark modules stacked like dashboards
- calculators above emotional product clarity

### Pulse

Pulse is live formation.

It should feel like:

- what is forming now
- where attention is gathering
- what thresholds are close
- who can still act
- what proof and reward are attached

Use:

- feeds
- time urgency
- location or social density
- progress toward thresholds
- sticky action affordances
- compact receipts

Avoid:

- generic feed clones
- trading-board density
- dashboard summaries before live objects

### Discover

Discover is browsing with intent.

It should feel:

- visual
- filterable
- approachable
- local and social
- organized around moments, places, missions, rewards, and content

Use:

- browseable collections
- cards with images or concrete subject matter
- filters that change visible results
- saved/watchlisted states
- recommended paths

Avoid:

- explanatory grids
- empty category panels
- long preambles before browseable objects

### Moment Detail

Moment Detail is the canonical product screen.

It should unify:

- what is happening
- where and when it happens
- who is behind it
- why it matters now
- what action is required
- what proof is captured
- what reward, memory, or status can be kept

This should feel like an event page, community room, action ticket, proof trail, and reward path in one coherent experience.

### Mission Detail

Mission detail is a job surface, not a marketing panel.

Required states:

- Open
- Claimed
- In progress
- Proof submitted
- Verified
- Paid or rewarded
- Disputed or expired

Required clarity:

- ask
- eligibility
- deadline
- proof
- reward
- sponsor or creator
- next action

### Vault

Vault is retained value, not a ledger.

It should feel:

- personal
- earned
- collectible
- prestigious
- memory-rich

Vault can include wallet-like data, but the first impression should be what the user has become eligible for, unlocked, collected, remembered, or can return to.

Avoid making Vault feel like:

- a bank account
- an inventory table
- a crypto portfolio

### Wallet

Wallet is a utility surface.

It should be clear, trustworthy, and precise. It can be more functional, but it should still translate balances into user meaning:

- What can this unlock?
- What expires?
- What can be redeemed?
- What is pending?
- What is advanced/economy-only?

### Dashboard

Dashboard is role-aware operations.

It should:

- be efficient
- expose tasks
- make state and reporting clear
- keep analytics behind context
- preserve operational controls

It should not:

- become the mental model for the whole product
- leak admin language into participant flows
- use analytics as the first product story

## 8. Visual Direction

Promorang should feel:

- warm
- kinetic
- premium
- local
- alive
- social
- grounded in real places

Keep the existing brand foundation:

- warm cream backgrounds
- charcoal depth
- orange primary action
- gold/amber reward accent
- expressive serif headings
- clean sans UI text

Use dark surfaces sparingly. Dark should mean immersion, nighttime energy, Vault prestige, or focused action. It should not be the default container for every section.

Do not let the product become:

- blue enterprise SaaS
- purple AI-gradient software
- beige lifestyle vagueness
- black dashboard blocks everywhere

## 9. Cinematic Culture Marketplace Direction

The attached homepage drafts establish a strong direction for public discovery surfaces.

The direction is: **cinematic culture marketplace for real-world participation.**

This direction is good because it makes Promorang feel:

- cultural before corporate
- local before abstract
- alive before explanatory
- social before transactional
- mobile-native before desktop-resized
- desirable before instructional

### What To Preserve From The Drafts

Preserve these visual and UX moves:

- full-bleed hero photography with real people, crowds, light, venue energy, and cultural specificity
- dark immersive canvas for public culture/discovery pages
- Promorang orange as the main action and heat signal
- oversized compressed/condensed hero typography for emotional punch
- short navigation: Events, Communities, Creators, Live Now, Magazine
- hero CTA pair: one action to join, one action to discover
- "now trending" mini-list inside or near the hero
- persona/vibe selector near the top to personalize discovery
- horizontal shelves for discovery instead of explanatory panels
- event cards that feel like posters or flyers
- testimonial/story cards that show real outcomes from showing up
- community cards that feel like belonging, not categories
- live-now cards with attendance/check-in signals
- feed cards that feel social and current
- creator cards with portrait, role, following/status, and next action
- organizer CTA near the bottom, not before users understand the culture layer
- mobile layout with compact shelves, bottom navigation, and thumb-friendly primary actions

### Public Homepage Structure From The Drafts

Use this order as the preferred public homepage journey:

1. Cinematic Hero: culture image, emotional promise, primary CTA, discovery CTA, trending signals.
2. Vibe Selector: let users choose who they are or what they want before explaining mechanics.
3. Trending This Week: browseable event/moment posters.
4. Social Proof Stories: real people, real outcomes, "this is why we show up."
5. Communities: belonging and recurring identity, not just one-off events.
6. Live Right Now: urgency, location, attendance, check-ins, available action.
7. The Feed: current culture objects in one place.
8. Creators: people who make the culture move.
9. Organizer/Partner CTA: build, host, sponsor, track, and grow after the user has seen the world.

This structure works because it follows:

`Orientation -> First Value -> Proof -> Unlock -> Mastery`

The user first sees a world, then chooses a vibe, then sees opportunities, then sees proof/stories, then understands communities and creators, then gets invited to organize or build.

### How It Works Page Role

The previous explanatory homepage material belongs on a dedicated `How it works` page.

This page should be the education layer after the culture doorway:

- explain the participation loop
- show the learning ladder
- preserve calculators, value maps, tabs, stakeholder claims, and proof/reward logic
- teach how participants, creators, hosts, venues, brands, merchants, and admins win
- connect proof to status, access, rewards, Vault memory, and repeatable value
- keep users oriented without making the public homepage feel like a manual

The homepage earns curiosity. The How It Works page converts curiosity into understanding.

Do not move heavy explanatory modules back onto the homepage unless they are transformed into visible culture objects, tickets, receipts, shelves, or live proof.

### Homepage UI Requirements

The public homepage should use:

- black or charcoal cinematic base
- high-contrast white typography
- orange highlights for active words, CTAs, live states, and forward movement
- real or realistic photography as the primary visual material
- card imagery with strong poster-like crops
- minimal borders, mostly used to separate dark cards
- dense but breathable shelves
- small uppercase eyebrow labels for section context
- "View all" links on shelves, not heavy explanatory CTAs
- rounded image cards with clear labels and state badges
- mobile horizontal scrolling shelves where appropriate
- bottom mobile navigation for Home, Events, Create, Live Now, Profile

Avoid:

- large cream SaaS sections on the public homepage unless used as a deliberate contrast moment
- dashboard metric blocks above discovery
- generic icon-only category grids
- long paragraphs explaining Promorang before users see what is happening
- cards with no image, no action, and no social proof

### Required Promorang Layer

The draft direction is strong, but Promorang cannot become only an events or culture listing site.

Every major shelf should expose at least one Promorang-specific layer:

- proof required or proof captured
- reward, perk, access, or status unlocked
- community or creator signal
- attendance, check-in, or live movement
- saved/claimable/eligible state
- Vault or return value where relevant

Examples:

- Trending card: date, place, status, proof/reward hint.
- Story card: quote, person, outcome, proof trail.
- Community card: members, active moments, status or access level.
- Live card: attending/check-ins, location, claim/check-in CTA.
- Creator card: role, followers/supporters, verified movement or active drop.

The rule is: **culture gets attention; proof and unlocks make it Promorang.**

### Mobile Behavior From The Drafts

Mobile should not be a squeezed desktop page.

Mobile homepage rules:

- hero text must remain dramatic but readable
- show one primary CTA and one secondary CTA
- use horizontal shelves for vibe, trending, communities, feed, and creators
- keep cards large enough to inspect the image and state
- use sticky bottom navigation for core participant movement
- keep organizer CTA compact and late in the page
- avoid dense explanatory copy
- expose proof/reward/status in one short line per object

### Risks To Watch

This direction fails if:

- it becomes nightlife-only and excludes wellness, food, sport, creators, merchants, family, service, and community moments
- it hides proof/status/reward mechanics behind pretty event posters
- the orange/black palette reduces readability
- mobile shelves become too small to act on
- creators and communities become decorative instead of actionable
- organizers, brands, and merchants are pushed so far down that their path disappears

Use this as the homepage/discovery visual north star, while preserving role-aware depth deeper in the platform.

## 10. Aesthetic Standard

Promorang should have a recognizable look in five seconds.

The visual standard is: **editorial city guide meets social proof marketplace meets premium event pass.**

This means the product should borrow from:

- live event posters
- city guides
- collectible passes
- neighborhood noticeboards
- premium ticketing
- creator launch pages
- tasteful marketplace browsing

It should not borrow from:

- B2B analytics dashboards
- generic startup landing pages
- crypto trading terminals
- flat coupon grids
- AI SaaS gradient templates

### Signature Gestures

Every major surface should use at least one signature gesture:

- a full-bleed or large-format real moment image
- a ticket/pass shape for claimable action
- a live route or trail from attention to proof
- a receipt strip showing what changed
- a place/moment masthead with time, location, and action
- a collectible Vault treatment for retained value
- an editorial split with one strong object and a supporting action rail

Do not use all gestures at once. Pick the one that matches the surface.

### Texture And Depth

Use depth to create hierarchy, not decoration.

Good depth:

- image overlaid with readable action metadata
- cream base with charcoal focus panels
- soft paper/card shadows
- subtle borders that separate object states
- warm glow behind live or reward states

Bad depth:

- every section floating in a card
- nested cards inside nested cards
- huge black rectangles stacked vertically
- shadows used to make weak hierarchy look premium

### Color And Contrast

Every card must be readable in both light and dark contexts.

Rules:

- never place muted text on white inside a dark section without explicit contrast checks
- dark sections require white or near-white primary text
- cream sections require charcoal primary text
- orange should mark action or live movement, not decorate every edge
- gold should mean reward, rarity, or unlock
- green should mean verified, completed, or healthy
- blue should be rare and mostly reserved for links, maps, or operational trust

If a screenshot has to be explained, the contrast failed.

### Beauty Principles

Attractive does not mean more decoration. Promorang should look desirable because the product feels specific, tactile, and alive.

Use beauty through:

- strong real subjects: faces, places, food, venues, tickets, receipts, rewards, and scenes
- confident asymmetry: one dominant object, then supporting proof/action context
- tactile affordances: tickets, passes, receipts, stamps, rails, shelves, maps, and saved objects
- editorial pacing: quiet areas between energetic surfaces
- restrained drama: one visual climax per viewport
- clear state: live, claimed, verified, unlocked, saved, returned

Avoid basicness:

- identical rounded cards repeated down the page
- generic icon-plus-text feature grids
- abstract gradient hero sections with no inspectable subject
- dashboards pretending to be discovery
- bland centered sections that could belong to any startup
- visual polish that does not clarify action

The test is simple: a user should be able to screenshot a Promorang surface and say, "That looks like something happening near me that I can join, back, earn from, or remember."

### Signature Promorang Mechanics

The platform should repeatedly express this trail:

`Signal -> Action -> Proof -> Reward -> Upside`

This trail can appear as:

- a live feed item
- a ticket
- a receipt
- a moment timeline
- a reward unlock
- a creator launch path
- a sponsor outcome package
- a Vault memory

Do not explain the loop as theory when the interface can show the loop as an object.

## 11. Proof, Status, And Desire

Proof should not feel like paperwork.

Proof is the visible record of earned trust, status, access, and momentum.

Rewards and earnings are direct value. Proof is the deeper value layer that makes a user, creator, host, venue, merchant, or brand more credible inside the ecosystem.

Frame proof as:

- signal
- recognition
- eligibility
- reputation
- access
- status
- trail
- unlock power

Avoid framing proof only as:

- submission
- compliance
- approval
- admin review
- receipt of labor

Proof language should make users feel:

- I was there.
- I moved something.
- I can be trusted.
- I am now eligible for more.
- I have a visible trail.
- I have earned access that not everyone has.

Role-specific meaning:

- Participants: proof sharpens signal and unlocks better rewards, missions, access, memories, and status.
- Creators: proof reveals who moved the moment, not just who watched it.
- Hosts and venues: proof turns attendance into reputation, sponsor readiness, and repeat demand.
- Brands and merchants: proof turns spend into verified movement and repeatable outcomes.
- Platform and admins: proof creates trust, safety, attribution, and dispute clarity.

Design proof as something desirable:

- collectible receipts
- visible trails
- status badges
- eligibility doors
- verified memories
- access tiers
- unlock moments
- Vault artifacts

The rule is: **proof should feel like status becoming visible.**

## 12. Composition Recipes

Use these instead of generic page sections.

### Live Moment Masthead

Use for homepage, Pulse, Moment detail, and major campaign launches.

Required parts:

- large image or live scene
- title
- time/place
- status
- primary action
- proof/reward summary
- secondary context below, not beside everything

This should feel like a real thing a person can join.

### Discovery Shelf

Use for Discover, homepage modules, rewards, places, and missions.

Required parts:

- horizontal or responsive shelf of objects
- visible category/filter control
- object cards with image or concrete identity
- save/claim/watch state
- one clear "see all" path

This should feel browseable, not like a grid of explanations.

### Action Ticket

Use for missions, offers, check-ins, rewards, and claimable moments.

Required parts:

- ask
- eligibility
- deadline
- proof
- reward
- claim/start button
- state badge

This should feel like something the user can hold, claim, or complete.

### Proof Receipt

Use after completion, in Vault, in Wallet, and in detail pages.

Required parts:

- action completed
- proof captured
- reward or status gained
- stakeholder benefited
- next useful action

This should feel satisfying, not administrative.

### Stakeholder Lens

Use when multiple roles need to understand the same object.

Required parts:

- primary user benefit
- creator/host/brand benefit where relevant
- proof captured
- value retained

Keep it compact. Do not turn it into a value-map wall.

### Operator Workspace

Use only for dashboards and admin.

Required parts:

- task queue or operational state
- filters
- evidence
- controls
- reporting

Even here, analytics should follow the object or task.

### Marketplace Feed

Use for Momentum, Pulse, Content Drops, Discover, and public opportunity browsing.

Required parts:

- fresh object with image or concrete subject
- role-relevant action
- social or local signal
- proof requirement
- reward, status, or upside
- save/share/claim affordance

This should feel like opportunity moving through a social marketplace, not a blog feed and not a metrics list.

### Outcome Package

Use for brand, merchant, and sponsor pricing.

Required parts:

- desired outcome
- verified actions included
- audience or location context
- proof method
- delivery window
- price
- expected business result

This replaces calculator-as-widget with calculator-as-decision-tool.

## 13. Journey Choreography

Promorang should feel like a guided movement, not a collection of pages.

Each journey needs a first success:

- Participant: find a moment or mission, understand proof, claim or save it.
- Creator: launch a mission or moment and see how supporters can move it.
- Host: create a moment and understand what proof will make turnout visible.
- Brand: pick an outcome package and understand what verified action will be bought.
- Merchant: create an offer or activation and see how redemption will be captured.

Do not send new users to a generic dashboard as their first success.

### Journey Page Rules

For each journey, keep:

- one dominant action per viewport
- one visible object or example
- one proof/reward explanation
- one path deeper

Avoid:

- role theory before product examples
- three CTAs with equal weight
- metrics before the user understands the object
- forms before the user understands what they are launching

### Stakeholder Success Criteria

Every uplift should protect the success factor for each stakeholder.

Participant success:

- finds something worth doing quickly
- understands proof before committing
- sees what they earn, keep, redeem, or remember
- can return to saved value without confusion

Creator success:

- understands how to turn attention into action
- can launch without decoding platform mechanics
- sees who helped and what changed
- can reuse momentum for the next drop or moment

Host and venue success:

- sees how online attention becomes attendance
- can verify turnout or participation
- can show sponsors and creators credible local proof
- can drive return visits, not just one-time traffic

Brand and merchant success:

- buys outcomes, not vague exposure
- sees verified action volume, proof quality, and audience fit
- understands what campaign package to choose
- can repeat what worked

Platform and admin success:

- can monitor trust, abuse, liquidity, delivery, and support
- can intervene without breaking the participant experience
- keeps operational complexity out of public discovery surfaces

## 14. Imagery And Subject Matter

Promorang must show real or realistic subjects wherever the user needs to inspect the thing.

Use images for:

- moments
- places
- creators
- products
- food
- venues
- events
- memories
- rewards
- campaign examples

Do not replace inspectable subjects with:

- abstract gradients
- decorative blobs
- generic icon grids
- empty SVG illustrations
- overly dark cropped stock imagery

Image treatment:

- warm, human, local, specific
- readable overlays
- no heavy blur that hides the subject
- no purely atmospheric background when the object matters

If the product is about showing up, the UI must show what people are showing up to.

## 15. Interaction Quality

Interactions should help the user feel movement and consequence.

Use interaction for:

- claim state
- saved state
- check-in progress
- proof submitted
- reward unlocked
- threshold approaching
- ticket/receipt generated

Avoid interaction for:

- decorative hover wiggles
- random icon animation
- motion with no state change

Microcopy should change with state:

- "Claim mission" -> "Mission claimed"
- "Submit proof" -> "Proof submitted"
- "Reward pending" -> "Reward verified"
- "Save" -> "Saved to Vault"

## 16. Functional Excellence

Attractiveness cannot come at the cost of use.

Every major flow must preserve:

- loading states
- empty states
- error states
- disabled states
- success states
- mobile hit targets
- keyboard focus
- clear labels
- role permissions
- existing data logic

A beautiful screen that hides the next action is a failed screen.

## 17. Taste Bar

Before shipping a visual change, inspect it like a product director:

- Would a user understand what to do without reading a paragraph?
- Does the first viewport show a real object, place, moment, mission, or reward?
- Does the screen feel alive or merely arranged?
- Is there one clear next action?
- Is strong existing copy preserved or improved?
- Is the page more useful on mobile than before?
- Does it avoid generic SaaS dashboard structure?
- Does it feel like Promorang specifically?

If the answer is no, do not deploy it.

## 18. Typography Rules

Headings:

- editorial, sharp, memorable
- short enough to scan
- not generic value-prop sludge

Body copy:

- human and direct
- grounded in concrete action
- no internal critique language
- no explaining the design strategy to the user

Metadata:

- compact
- meaningful
- state-bearing
- not decorative

Use uppercase labels only for:

- state
- urgency
- role
- proof
- rarity
- category

## 19. Component Rules

### Cards

Cards must have a job.

A good Promorang card shows:

- object identity
- state
- action
- proof or requirement
- reward or retained value

Cards should not be mini dashboards.

### Receipts

Receipts are central to Promorang.

Receipt components should show:

- what the user did
- what proof was captured
- what changed because of the action
- what the user earned or unlocked
- what happens next

### Calculators

Calculators should not feel like isolated finance widgets.

They should be outcome tools:

- what package or commitment is being compared
- what action volume it produces
- what proof is included
- what delivery window applies
- what business or participant outcome follows

### Tabs

Tabs are useful when they change the user's decision lens.

Good tabs:

- Participants / Creators / Brands / Hosts
- Moments / Places / Missions / Rewards
- Open / Claimed / Submitted / Verified

Bad tabs:

- arbitrary content buckets
- hidden explanations
- dashboard sections that should be routes or filters

### Stats

Stats must be attached to action.

Every stat should answer:

- Does this create urgency?
- Does this build trust?
- Does this show value?
- Does this help the user decide?

If not, remove it or move it into analytics.

## 20. Language System

Introduce product meaning in four layers:

1. **Human objective:** what the person wants to accomplish.
2. **User action:** what the person should do next.
3. **Promorang mechanism:** the branded object or system that enables it.
4. **System detail:** attribution, funding, verification, governance, liquidity, or other advanced mechanics.

Always introduce these layers in order. A user should not have to understand a Promorang mechanism or its economic implementation before they can receive first value.

On first encounter, pair branded terms with their human meaning:

- **Moment:** a real-world event, experience, or action people can join.
- **Mission:** complete a defined action and submit the required proof.
- **PromoShare:** earn from verified action you help generate.
- **PromoPush:** promote a Moment, offer, or campaign toward a defined result.
- **Vault:** the proof, rewards, memories, access, earnings, and assets you keep.
- **Proposal:** a plan for making an activation or partnership happen.
- **Pieces:** a participation or ownership stake introduced only when relevant.

After users understand the meaning, the branded term can stand on its own.

Prefer:

- find
- join
- show up
- check in
- prove
- verify
- unlock
- earn
- keep
- collect
- return
- signal
- recognize
- become eligible
- unlock access
- build status
- host
- launch
- sponsor
- back

Use carefully:

- market
- shares
- investment
- asset
- trading
- liquidity

Avoid leading public or participant experiences with securities-adjacent language unless the surface is explicitly advanced economy.

Creation language should begin with intent rather than object type.

Prefer asking:

**What do you want to make happen?**

Then offer human choices such as:

- Bring people together
- Promote something
- Reward an action
- Share content
- Attract customers
- Find collaborators
- Propose a partnership

The system can translate the answer into the correct Moment, campaign, offer, mission, post, or proposal behind the scenes.

## 21. Preservation Rule

When uplifting an existing page, never remove strong substance just because the layout changes.

Before editing, inventory:

- powerful copy
- tabs
- calculators
- forms
- filters
- proof states
- reward logic
- role-specific claims
- conversion CTAs
- working user flows

Then improve:

- hierarchy
- visual feeling
- mobile behavior
- clarity of next action
- object/action framing
- stakeholder value clarity

## 22. Acceptance Test For Any New Screen

A screen passes only if a user can answer these within five seconds:

1. What is this screen for?
2. What object am I looking at?
3. What can I do next?
4. Why now?
5. What proof or trust signal matters?
6. What do I get, keep, or unlock?
7. Where am I in the Orientation -> First Value -> Proof -> Unlock -> Mastery ladder?
8. What outcome am I currently trying to reach?
9. Is one action clearly recommended?
10. Can I see what is complete, what is current, and what comes next?
11. Where will the result live after I complete this action?
12. Does the screen offer a relevant return action rather than a generic destination?

A screen fails if it primarily feels like:

- a report
- a pitch deck
- a dashboard module
- a generic SaaS template
- a set of abstract explanatory panels

A screen also fails if it is visually on-brand but requires the user to reconstruct the journey from navigation labels, disconnected metrics, or prior knowledge of Promorang terminology.

## 23. Aesthetic Acceptance Test

A screen passes aesthetically only if it has:

- one visually dominant subject
- one memorable Promorang gesture
- one clear action
- real or realistic subject matter where inspection matters
- enough whitespace for decisions to feel calm
- enough energy for the platform to feel alive
- stateful UI that shows what has happened or can happen next

A screen fails aesthetically if:

- it is merely neat
- it relies on icons where images or objects are needed
- it uses polish to hide weak hierarchy
- it looks like a template with brand colors applied
- it has no local, social, creator, reward, or proof texture

Pretty is not enough. It must be desirable, understandable, and usable.

## 24. Visual Acceptance Test

Before implementation is considered complete, capture or inspect the screen at:

- mobile width
- tablet-ish width
- desktop width

The design passes only if:

- text is readable without zooming
- primary action is visible without hunting
- there is no overlap or clipping
- cards have a clear hierarchy
- images or concrete objects are visible where needed
- dark sections do not swallow content
- calculators and tabs feel integrated into the journey
- the screen does not resemble a generic dashboard screenshot
- the surface mode matches the user's job: Culture, Guided Action, Operations, or Vault
- progress and status do not depend on color alone
- motion communicates state or consequence and respects reduced-motion preferences
- the cultural subject remains visible even when success guidance is added

## 24.1 Cross-Platform Success Test

Before a journey is considered complete, test it across web and mobile as one continuous experience.

Verify that:

- the same object has the same human meaning on both platforms
- the same status produces the same expectation
- the next action follows the user across devices
- notifications deep-link to the exact required action
- completed proof appears in Progress and the resulting value appears in Vault where appropriate
- no platform sends the user back to a generic dashboard after meaningful completion
- role permissions change available actions without changing the fundamental navigation model
- failure, review, dispute, expiry, and recovery states remain understandable on both platforms

## 24.2 Success Design Review

Every major release must include a journey review in addition to visual and functional QA.

For the primary scenario, document and inspect:

- starting intent
- entry point
- first recommended move
- active path
- proof requirement
- success receipt
- success destination
- next relevant return action
- analytics events for each stage

The release is not complete when all screens exist. It is complete when the intended user can reach the declared outcome without reconstructing the product model for themselves.

## 25. Implementation Priorities

Rebuild in this order:

1. Homepage as a living product doorway, not an explanatory dashboard.
2. Pulse as live formation and urgency.
3. Discover as browseable objects and filters.
4. Moment Detail as the canonical action/proof/reward page.
5. Vault as retained value and memory.
6. Create as guided launch flow.
7. Onboarding and role education as a lightweight journey ladder.
8. Dashboard as role operations only.

For each rebuild:

- preserve working functionality
- preserve strong claims and calculators
- replace dashboard framing with object/action/proof/return framing
- test mobile first
- run the production build

## 26. Uplift Method

When uplifting any existing surface, follow this sequence:

1. Inventory what works: copy, flows, data, calculators, tabs, states, and stakeholder value.
2. Identify the primary object and the user's first success.
3. Identify the ladder stage: Orientation, First Value, Proof, Unlock, or Mastery.
4. Pick one Promorang mechanic: feed, ticket, receipt, shelf, trail, masthead, package, or workspace.
5. Choose one signature aesthetic gesture.
6. Redesign mobile first around the dominant action.
7. Expand to desktop with depth, not dashboard sprawl.
8. Verify states: loading, empty, error, disabled, saved, claimed, verified, rewarded.
9. Run the aesthetic and journey acceptance tests before deploy.

Do not bolt uplift modules onto old pages. Recompose the page around the journey.

## 27. The Final Rule

If a design looks like it could belong to any SaaS dashboard, it is not Promorang yet.

Make it feel like people, places, moments, proof, and value are moving in the same world.
