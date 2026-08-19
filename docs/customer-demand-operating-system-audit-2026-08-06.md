# Promorang Customer Demand Operating System Audit

Date: 2026-08-06  
Evaluation lens: infrastructure for customer demand across cities, communities, and commerce

## Executive verdict

Promorang is **not yet a Customer Demand Operating System**. It is a broad, unusually ambitious multi-sided marketplace with a potentially powerful infrastructure kernel: verified participation, campaign-linked real-world actions, attribution, rewards, identity, and reusable outcome records.

The distinction matters. An operating system is not defined by how many stakeholder dashboards or feature families it contains. It is defined by whether every actor can use a small set of stable primitives to create, distribute, fulfill, measure, learn from, and repeat demand—and whether every completed cycle makes the system more useful for the next participant.

Today Promorang has many of those primitives, but they are split across competing ontologies and product narratives:

- Moment, campaign, activation, mission, bounty, drop, offer, event, and discovery overlap.
- Gems, Points, Pioneer Points, Pieces, Memories, perks, coupons, keys, and PromoShare entries overlap in perceived value.
- Discover, Search, Pulse, For You, Moments, Scenes, Marketplace, rewards, content, and directories overlap in discovery.
- Brand, merchant, host, organizer, creator, sponsor, agency, and community workspaces split what should often be one organization-level demand workspace.

The current product is best described as **a campaign-enabled local participation marketplace in transition toward a demand orchestration platform**.

Its credible category destination is bigger:

> **Promorang is the demand coordination layer for places and communities: an open system that turns local intent into attributable participation, transactions, reputation, and repeat demand.**

That is more precise and more defensible than “city operating system.” A city has public safety, mobility, identity, payments, regulation, utilities, and governance responsibilities that Promorang does not and should not claim to operate. Promorang can become a **Demand OS for the city**, not the OS of the city.

## The non-negotiable platform model

Everything may be marketed as a campaign, but everything should not be stored as the same campaign record. A campaign is a coordination envelope, not the atomic object.

The canonical hierarchy should be:

1. **Organization** — business, creator studio, church, community, agency, government body, venue, charity.
2. **Place** — venue, service area, neighborhood, route, digital location.
3. **Campaign** — objective, audience, budget, timeframe, owner, governance, success definition.
4. **Experience** — the public promise or thing people can discover: event, offer, product launch, visit, cause, service, content, program.
5. **Action** — save, RSVP, visit, buy, watch, refer, review, share, volunteer, donate, scan, check in.
6. **Proof** — transaction, QR, POS event, ticket, receipt, geofence, media, API event, human approval.
7. **Outcome** — verified attendance, purchase, qualified lead, content publication, donation, review, repeat visit.
8. **Relationship** — person-to-organization, person-to-place, person-to-community, creator-to-audience affinity.
9. **Incentive** — monetary value, points, access, status, perk, collectible, recognition.
10. **Distribution** — organic feed, search, map, creator, referral, WhatsApp, QR, partner embed, paid PromoPush, agent/API.
11. **Learning** — attribution, incrementality, cohort behavior, benchmark, prediction, next-best action.

“Moment” can remain the consumer-facing brand for a time-bound or participatory Experience. It should not be forced to represent every business, offer, campaign, or evergreen place.

The canonical lifecycle is:

`Discover → Consider → Commit → Participate → Convert → Verify → Review → Refer → Return → Advocate`

Merchant Growth and Community Growth are aggregate outcomes of this lifecycle, not additional stages in an individual customer journey.

The north star should evolve from “weekly verified outcomes per active Moment” to:

> **Weekly incremental verified demand generated per active organization.**

Supporting measures must include cost per incremental outcome, participant repeat rate, campaign repeat rate, time to first outcome, and demand retained after incentives end.

## Forty-area audit

Priority scale: **P0** = existential/current foundation; **P1** = required for repeatable market fit; **P2** = scale advantage; **P3** = defer or remove.

| # | Area | Current state and strengths | Weaknesses and missed opportunities | Network/demand contribution | Strategic risks | Priority and recommended improvements |
|---:|---|---|---|---|---|---|
| 1 | Vision | The repository contains strong language around verified outcomes, real-world momentum, attribution, loyalty, and memory. This is a credible infrastructure seed. | Several visions compete: participant economy, Momentum Engine, event/experience platform, growth OS, marketplace, and speculative economy. The customer problem is obscured by internal mechanics. | A single demand thesis can coordinate every side and improve ecosystem legibility. | Category confusion raises CAC, slows onboarding, and causes teams to build parallel products. | **P0.** Adopt “demand coordination layer for places and communities.” Use one north star and one canonical demand loop. |
| 2 | Positioning | Verified digital-to-physical action is differentiated from passive ad impressions and generic listings. | “Real-world momentum,” “community and legacy engine,” events language, rewards, and commerce compete. “Everything is a campaign” is useful internally but too abstract for customers. | Strong positioning can attract merchants, creators, venues, and public-interest organizations into one network. | Claiming “city OS” too early creates credibility and government-sales risk. | **P0.** Sell outcomes by wedge: “fill the next 20 seats,” “bring back last month’s guests,” “prove creator-driven visits.” Category name follows demonstrated behavior. |
| 3 | Marketplace architecture | Many sides exist and there are real transaction, sponsorship, participation, proof, and settlement concepts. | It behaves like several marketplaces sharing login and currency. Liquidity is not concentrated around one high-frequency exchange. | Cross-side matching can compound supply, demand, and data. | Multi-sided cold start; subsidy leakage; actors do not know whom the platform is primarily for. | **P0.** Use an organization graph and one campaign exchange: demand owners publish outcome contracts; distributors/creators/communities supply reach; venues fulfill; consumers act. Launch city by city and category cluster by category cluster. |
| 4 | Network effects | Referrals, creator attribution, Memories, reputation, reviews, campaigns, venues, and discovery can all compound. | Most are currently engagement features, not closed network loops. More users do not automatically improve matching or merchant ROI. | Highest possible contribution if outcomes improve recommendations, benchmarks, and supply quality. | Rewards can create a paid-acquisition treadmill mistaken for a network effect. | **P0.** Instrument five explicit loops: data, content, creator distribution, merchant cross-promotion, and identity/reputation. Report network lift separately from paid lift. |
| 5 | Merchant experience | Merchant products, sales, redemptions, QR, team, analytics, offers, integrations, and venue operations exist. | Too many surfaces; merchant and host concepts overlap; daily job is unclear. CRM, customer segments, win-back, schedule-based demand, and margin-aware campaign creation are weak. | Merchants are the recurring economic anchor and source of inventory/outcomes. | A $499/month plan precedes proven recurring ROI; complexity drives churn. | **P0.** Replace feature dashboard with Today, Customers, Campaigns, Fulfillment, Results. Default to three jobs: create demand, serve arrivals, bring customers back. |
| 6 | Consumer experience | Public browsing, RSVP, guest passes, participation, proof, rewards, referrals, reviews, saves, Vault, and location concepts exist. | The user must understand Promorang’s vocabulary and multiple value systems. Discovery is still event-heavy and not a universal answer engine. | Consumer actions generate demand, content, proof, preference, and reputation data. | Incentive hunters, notification fatigue, privacy concerns, and low organic habit. | **P0.** Build an intent-first home: “Tonight,” “Eat,” “Shop,” “Help,” “With friends,” “Near me,” plus a conversational query. Show reason, distance, total cost, trust, availability, and next action. |
| 7 | Creator experience | Content missions, attribution, O2O metrics, ambassador management, funding, proofs, and economics are meaningful foundations. | Creators are treated partly as workers completing tasks and partly as campaign partners. Audience ownership, media kit, pricing, briefs, rights, approvals, payout predictability, and reusable performance profile are fragmented. | Creator audiences are a major distribution network and produce discovery inventory. | Low-quality UGC, rights disputes, opaque compensation, follower fraud, and disintermediation. | **P1.** Create a Creator Demand Passport: audience graph, category/place authority, verified conversion history, rates, rights, availability, and repeat partnerships. Pay for outcomes without making every experience piecework. |
| 8 | Community experience | Scenes, communities, hosts, sub-moments, guest groups, collective memories, and community impact concepts exist. | Community is often a content taxonomy or host role, not a governed graph with membership, leaders, norms, calendars, funds, and portable reputation. | Communities reduce acquisition cost and coordinate repeat participation. | Extraction by advertisers can destroy trust; unclear governance and ownership. | **P1.** Make Community a first-class entity with membership, roles, consent, treasury/fund, recurring programs, moderation, sponsor rules, and community-level analytics. |
| 9 | Campaign architecture | Draft campaigns can link to Moments/activations; attribution and reward pools exist. | Multiple campaign tables and legacy advertiser models appear. Objectives, experiences, actions, proof, audiences, budgets, distribution, and outcome contracts are not one clean aggregate. | This is the orchestration core of the entire OS. | Schema drift, double counting, incompatible analytics, and irreversible reporting debt. | **P0.** Introduce Campaign vNext as an aggregate with versioned objective, audience, offer, action graph, proof policy, budget ledger, distribution plan, experiment, and outcome contract. Migrate adapters; do not rewrite all domains at once. |
| 10 | Campaign builder | Create Moment is rich; Flash compiler creates four basic draft types; funding is deliberately separated from publishing. | Creation is long and concept-heavy. Flash uses rules and fixed estimates, not business context or learned performance. No complete distribution/CRM/creative/testing/fulfillment plan. | Reducing time to first live campaign directly increases marketplace liquidity. | Easy creation can generate low-quality or unsafe supply and unfunded promises. | **P0.** One progressive builder: desired outcome → audience → experience/action → proof → incentive economics → distribution → fulfillment → forecast → review → launch. AI fills defaults; humans approve obligations. |
| 11 | AI opportunities | Agent API thinking, simple semantic search, proof verification, compiler, recaps, and optimization concepts exist. | Most “AI” is rules, hashed text matching, or planned interfaces. No unified feature store, model governance, feedback loop, causal optimization, or confidence reporting. | AI can lower campaign expertise barriers and improve matching with every outcome. | Hallucinated forecasts, bias, unsafe recommendations, privacy violations, automated spam. | **P1.** Build AI on governed data products: intent parser, campaign copilot, proof-risk scoring, next-best action, creative variants, pacing, anomaly detection, and postmortems. Always expose evidence/confidence. |
| 12 | Landing pages | Strong public visual quality, SEO pages, public Moment pages, role pages, city/category routes, and guest conversion paths. | Landing pages are route-specific rather than generated campaign acquisition surfaces with variants, attribution, inventory, and conversion testing. Copy remains event-centric in key discovery paths. | Every indexed page can recruit both consumers and supply. | Thin/duplicate SEO pages and inconsistent promises erode trust. | **P1.** Create a campaign page renderer from structured blocks, schema markup, localized inventory, social proof, FAQs, offer terms, deep links, and experiment variants. |
| 13 | CRM | Profiles, preferences, referrals, journeys, notifications, guest RSVP contacts, and email lifecycle jobs form partial CRM ingredients. | No canonical customer record for each organization, relationship timeline, segments, consent ledger surfaced to merchants, cohort tools, or lifecycle campaigns. | Relationship history is the retention/data moat. | Promorang could become a lead reseller instead of trusted infrastructure; data-controller obligations grow sharply. | **P0.** Build a permissioned Customer Graph. Merchants see customers and interactions they lawfully earned; consumers control channel and relationship consent; platform maintains identity resolution and suppression. |
| 14 | WhatsApp | Guest RSVP sharing and channel consent exist; ManyChat integration appears. This matches local behavior well. | WhatsApp is mostly a share link/notification preference, not a complete conversational discovery, RSVP, reminder, support, referral, and merchant reactivation channel. | Strong distribution and group coordination loop, especially where app-install friction is high. | Spam, template fees, consent violations, platform dependency, channel bans. | **P1.** Treat WhatsApp as a first-class client: opt-in assistant, structured menus, campaign deep links, group invite attribution, reminders, QR handoff, support, and STOP/consent controls. Never export unrestricted contact lists. |
| 15 | Rewards | Gems, perks, coupons, Memories, reward receipts, shops, and campaign pools exist. | Too many reward types and unclear liability/value. Rewards are often designed before incrementality or merchant margin. | Can accelerate cold start and encode reciprocal value. | Adverse selection, fraud, breakage liability, regulatory exposure, and subsidized behavior that disappears. | **P0.** Define a reward constitution. Cash-like value, merchant-funded benefit, status, access, and collectible must have separate ledgers and language. Reward incremental behavior, not actions likely to happen anyway. |
| 16 | Loyalty | Tiers, merchant loyalty builder, Memories/perks, return journeys, and memberships exist. | Loyalty is platform-economy centric rather than relationship centric. No robust frequency, recency, category cadence, household/group, or merchant-owned lifecycle loop. | Repeat behavior creates durable demand and lowers CAC. | Points liability and shallow discount loyalty. | **P1.** Make loyalty a programmable relationship: visit stamps, memberships, access, streaks only where natural, recognition, cross-merchant Scene passes, and next-best-return offers. Measure incentive-free retention. |
| 17 | Referrals | Referral codes, earnings, qualified activation, guest group links, and attribution exist with recent reliability work. | Referral object appears user/platform centric rather than campaign-scoped and merchant-configurable. Limited multi-hop or group influence analysis. | Direct invitation is one of the strongest local trust loops. | Self-referral, collusion, spam, last-click conflict, high reward cost. | **P1.** Support campaign and organization referral programs, group invites, delayed qualification, fraud graph, dual-sided/non-monetary rewards, and downstream value rather than signup-only payout. |
| 18 | Discovery engine | Public Discover, Pulse, category/location pages, directories, feeds, submissions, and SEO are substantial. | Discovery is fragmented and the primary page still reads as upcoming events. Evergreen places, products, offers, campaigns, content, causes, and communities do not rank together. | Discovery is the consumer-side liquidity engine and data collector. | Empty feeds destroy perceived value; paid placement can undermine relevance. | **P0.** One Opportunity Index across all experience types. Rank by intent relevance, availability, distance/travel time, trust, social context, novelty, expected utility, business constraints, and diversity. |
| 19 | Search | Global RPC search and a separate vector API exist across several object types. | Search paths disagree; vector matching is lexical hashing, not meaningfully semantic; no typo tolerance, facets, intent parsing, query analytics, availability, geography, or action-oriented answers. | Search captures explicit demand—the highest-value intent signal. | Poor results train users to leave; sponsored distortion breaks trust. | **P0.** Build hybrid retrieval: lexical + geo + structured filters + embeddings + behavioral ranking. Return answer modules, not links: best options, why, open now, price, trust, next action. Log zero-result and reformulation data. |
| 20 | Maps | Coordinates, venues, geofencing, location routes, QR/check-in, and nearby concepts exist. | No clear first-class consumer map, map search, travel-time ranking, live density visualization, service areas, or merchant territory planning. | Spatial density is central to local network effects. | Exact movement privacy, unsafe crowding, inaccurate locations, map-provider cost. | **P1.** Create privacy-preserving map tiles/aggregates, “search this area,” walking time, open-now inventory, Pulse bands, accessibility, transit/parking, and merchant heatmaps. Never expose individual live locations. |
| 21 | Recommendation engine | For You lenses, user recommendations, preferences, taxonomy, matchmaking, Pulse, and simple vector services exist. | There is no observable unified recommender with candidate generation, ranking, exploration, feedback, and business constraints. | Personalized success makes more supply valuable and produces a data effect. | Filter bubbles, cold start, pay-to-rank corruption, discriminatory targeting. | **P1.** Build a two-sided recommender: user utility plus marketplace health. Add explicit controls, explanations, diversity, cold-start onboarding, contextual bandits only after reliable feedback, and sponsored separation. |
| 22 | Campaign analytics | Growth events, attribution, role analytics, O2O panels, proof, revenue funnels, and scorecards are advanced relative to stage. | Contracts are inconsistent; some dashboards degrade; client-side aggregation and multiple source tables create fragility. Incrementality, margin, spend ingestion, cohorts, and confidence are missing. | Transparent ROI drives campaign reinvestment and marketplace trust. | Vanity attribution, double counting, selection bias, and unverifiable ROI claims. | **P0.** Establish an event contract and semantic metrics layer. Separate observed, attributed, verified, and incremental outcomes. Add holdouts, baseline comparisons, cohort retention, gross margin, and data-quality flags. |
| 23 | Merchant dashboard | Broad operational capabilities exist and merchant analytics may be among the most production-ready. | It is a feature showroom rather than a daily operating cockpit. Customer and campaign lifecycle are split. | Daily merchant use creates supply freshness and operational lock-in. | Overload and empty states make the system feel unfinished. | **P0.** Home = demand forecast, arrivals/redemptions needing action, campaign pacing, customer return risks, cash/reward liability, and one recommended action. Hide advanced economy systems by default. |
| 24 | Creator dashboard | Missions, performance, economics, proof, content, partners, and studio concepts exist. | Too many explanations and competing jobs; no clean pipeline from opportunity to brief to content approval to outcomes to payment. | Better creators attract campaigns and customers; performance records reduce matching friction. | Creators multi-home and leave if payment/rights are unclear. | **P1.** Build Opportunities, Active Work, Content & Rights, Audience, Results, Earnings. Make verified conversion portable as a credential while keeping private customer data protected. |
| 25 | Community management | Scenes, roles, guest operations, hosts, proposals, sponsorship, moderation, and sub-moment governance exist. | Membership, ownership, rules, calendars, communication, chapter structure, elections/approvals, community CRM, and sponsor consent are not one product. | Organized communities create repeat demand at low marginal distribution cost. | Community capture, moderation burden, political/religious sensitivity, sponsor backlash. | **P1.** Create Community OS primitives: membership graph, role permissions, programs, calendar, communications, funds, sponsor policy, moderation, and exportability. |
| 26 | Reviews | Moment reviews/sentiment, review prompts, trust concepts, business profiles, and discovery ratings exist. | Reviews appear attached to Moments more than durable place/product/service relationships. No verified purchase/visit weighting, recency, structured attributes, response workflow, or reputation portability. | Reviews improve conversion, search ranking, trust, and data quality. | Extortion, brigading, incentives corrupting opinions, defamation, cold-start bias. | **P0.** Create Verified Experience Reviews linked to proof but voluntary and never conditioned on positivity. Add structured context, merchant response, fraud detection, recency decay, reviewer category authority, and appeals. |
| 27 | Gamification | Streaks, ranks, badges, leaderboards, rarity, quests, Gems, and unlocks are extensive. | Mechanics exceed demonstrated core utility and contribute to cognitive load. Many are extrinsic overlays rather than natural progress. | Selective status and contribution recognition can increase participation and community identity. | Gaming, addiction patterns, status inequality, regulatory scrutiny, trivialization of civic/faith activities. | **P2/P3.** Keep only mechanics tied to mastery, trustworthy contribution, collective goals, or retention. Remove generic streaks and leaderboards where they do not predict healthy repeat demand. |
| 28 | PromoPoints | Multiple point concepts and ledgers exist; Pioneer Points has stronger governance and contribution logic. | “PromoPoints” is not clearly canonical; Gems, dynamic points, Pioneer Points, tiers, and rewards overlap. | A non-cash contribution score can support reputation and access. | Accounting confusion, perceived monetary promises, inflation, insider advantage. | **P0.** Do not launch another point. Consolidate into: Reputation (non-spendable), Reward Credit (funded liability), and Access/Status. Pioneer can be a seasonal reputation program, not a universal currency. |
| 29 | PromoPush | Tracking, creator/promoter portal, entry codes, distribution, admin controls, and campaign links form a meaningful product. | It risks being a branded paid-promotion silo rather than the distribution layer of every campaign. Channel mix, frequency caps, spend pacing, incrementality, creative variants, and audience consent need unification. | Paid and partner distribution can solve cold start and recruit supply. | Spam, fraudulent promoters, attribution capture, regulatory ad disclosures, dependence on incentives. | **P1.** Make PromoPush the distribution planner/exchange under Campaign vNext: channel allocation, creator/community partners, tracked assets, frequency, budget, experiments, brand safety, and incremental lift. |
| 30 | PromoKeys | Access rules, key gating, daily master key, QR and unlock animations exist. | The user-facing purpose and relationship to coupons, passes, proof, and access is unclear. A universal “key” risks becoming ornamental jargon. | Scarce/earned access can create sharing, loyalty, and partner interoperability. | Fraud, resale, exclusion, support load, security-by-obscurity. | **P2.** Reduce to an interoperable **Entitlement** primitive with signed token, issuer, holder, scope, transfer policy, expiry, redemption, and audit. “PromoKey” can be a branded presentation. |
| 31 | Business profiles | Brand, merchant, storefront, venue, claimable pages, products, reviews, moments, and SEO surfaces exist. | Business identity is split among advertiser, merchant, brand, host, venue, organization, and user-owned records. Duplicate pages and claim logic weaken graph quality. | Canonical profiles create SEO supply, trust, CRM, analytics, and cross-campaign history. | Identity collisions, false claims, stale hours/inventory, fragmented reputation. | **P0.** Create Organization + Place as canonical entities with verified ownership, roles, branches, hours, categories, service areas, catalog, integrations, reputation, campaigns, and change history. |
| 32 | Event pages | Public event/Moment pages, RSVP, guest passes, check-in, proof, reviews, media, recurrence, and organizer tools are strong. | They are among the best-developed verticals, which biases the whole system toward events. Campaign/experience language and page contracts remain inconsistent. | Events seed dense local interactions and multi-party adoption. | Product becomes categorized as event software and competes in a crowded segment. | **P1.** Treat event as one Experience template. Keep its rich fulfillment flow, but extract reusable blocks for reservations, access, proof, commerce, review, referral, and return. |
| 33 | QR ecosystem | QR display, guest passes, venue QR, check-in, coupon onboarding, redemption validation, and codes exist. | QR artifacts may be generated by separate domains without one registry, signing policy, offline behavior, rotation, or universal resolver. | QR bridges physical surfaces to identity, attribution, redemption, review, and referral. | Code cloning, phishing, venue fraud, broken links, staff friction. | **P0.** One signed QR/Link Resolver. Every code maps to an issuer, campaign, place, action, policy, expiry, and attribution context; support offline nonce batches, staff mode, fraud scoring, and recovery. |
| 34 | Automation | Email scheduler, cron, workflows, journey notifications, experience automation, recurring Moments, and lifecycle events exist. | Automation is service-specific, not a visible trigger-condition-action platform. No safe simulation, approval gates, versioning, or organization recipes. | Automation lowers merchant labor and creates everyday use. | Accidental spam, duplicate rewards, runaway costs, silent failures. | **P1.** Add a Campaign Automation Engine: triggers, segments, conditions, actions, budgets, caps, approvals, retries, audit log, dry run, and templates. Start with reminders, waitlists, win-back, review requests, and pacing alerts. |
| 35 | APIs | A broad Express API, agent-surface docs/functions, integrations, webhooks, and shared types exist. | APIs are numerous and domain-specific; versioning, public auth scopes, idempotency, webhooks, rate limits, SDKs, developer portal, and stable contracts are incomplete. | APIs make Promorang infrastructure rather than a destination app. | Security/permission fragmentation and breaking partner integrations. | **P0.** Define a versioned public Demand API around organizations, places, campaigns, experiences, actions, proofs, outcomes, entitlements, and webhooks. OAuth scopes, idempotency, audit, sandbox, and event schemas are mandatory. |
| 36 | Data network | Rich potential data spans identity, intent, location, content, participation, proof, commerce, referrals, reviews, relationships, and outcomes. | Data is spread across overlapping tables/events; semantic definitions and consent boundaries are immature. There is not yet a learning loop that demonstrably improves outcomes. | This is the primary long-term moat if quality, density, and governance are strong. | Surveillance perception, sensitive-location inference, breach impact, biased scores, low-quality data compounding. | **P0.** Build a governed Demand Graph plus event lake/warehouse and metrics layer. Minimize collection, separate PII, use purpose-based access, retention rules, lineage, data-quality tests, and user/organization exports. |
| 37 | Distribution model | Web/PWA, mobile, public SEO, creator sharing, referrals, WhatsApp, QR, email, PromoPush, and planned agent APIs create strong channel optionality. | No explicit channel hierarchy or wedge. Trying to populate every surface spreads local liquidity thin. Embeds, POS partners, publishers, tourism portals, and messaging distribution are underdeveloped. | Ubiquitous distribution is necessary to become default infrastructure. | Platform dependency and channel conflict; app-install focus can slow adoption. | **P0.** Be headless-first and destination-optional: campaign pages, widgets, QR, WhatsApp, partner feeds, POS/ticketing connectors, Google/Apple calendar, creator links, and APIs. Concentrate inventory city/category by city/category. |
| 38 | Revenue model | Memberships, campaign funding, sponsored placements, PromoShare, commerce, subscriptions, marketplace economics, and fees exist. | Too many monetization candidates before one repeatable value meter. Some advanced financial mechanics add regulatory and trust burden without strengthening core demand. | Revenue can reinforce the network when charged on verified value. | Monetization complexity, adverse incentives, merchant skepticism, securities/gambling/payment exposure. | **P0.** Primary: SaaS base + usage fee per verified outcome/attributed transaction + optional managed distribution. Secondary: payments/booking take rate and enterprise/API. Avoid selling rank; defer Pieces/liquidity until core demand PMF and legal clarity. |
| 39 | Flywheels | Components exist for participant, commercial, creator, content, reputation, referral, and data loops. | They are documented more than economically closed. Rewards are often the bridge, making loops subsidy-dependent. | Properly closed loops can create local density and decreasing CAC. | False flywheels obscure linear paid growth. | **P0.** Measure each loop’s coefficient: new useful supply per outcome, organic participants per participant, repeat campaigns per verified outcome, recommendation lift per data cohort, and cross-merchant demand transfer. Kill loops that do not compound. |
| 40 | Defensibility | Potential assets are verified outcome graph, place/community identity, creator conversion reputation, local density, integrations, workflows, and benchmarks. | Features, dashboards, currencies, and campaign builders are copyable. Data is not a moat without density, permission, quality, and better decisions. | Strong if Promorang becomes the system of record and coordination protocol for demand. | Larger maps, social, payments, POS, CRM, and event platforms can bundle adjacent functions. | **P0.** Defend through embedded workflows, canonical local graph, trusted proof, cross-organization benchmarks, interoperable identity/reputation, developer ecosystem, and dense city operations—not feature count. |

## What Promorang is becoming

Promorang is not merely an app. The app is one client.

It is not yet a true marketplace because the central exchange, unit of supply, liquidity mechanism, and repeated transaction are not sufficiently singular.

It is partly a campaign operating system, but campaign architecture is not yet canonical enough to control distribution, fulfillment, measurement, and learning end to end.

It is partly a customer acquisition platform, but acquisition is too narrow because Promorang can also create retention, reputation, loyalty, community coordination, and demand planning.

It should not call itself a city operating system. That claim is too broad and institutionally risky.

The bigger and more accurate destination is:

> **A Demand Coordination Network and protocol for local life.**

The operating system serves organizations. The network serves consumers, creators, communities, and places. The protocol lets third parties publish and consume opportunities, actions, proofs, outcomes, and entitlements.

This has three product layers:

- **Demand Cloud:** campaign planning, CRM, automation, fulfillment, measurement, learning.
- **Demand Network:** discovery, creators, communities, referrals, reputation, reviews, cross-merchant participation.
- **Demand Protocol:** APIs, event schemas, QR/link resolver, identity, consent, proof, entitlement, attribution.

## FlashCreate assessment

FlashCreate, as represented by the Flash Campaign Compiler and Create Campaign flow, is a valuable prototype of the correct interaction model: a business states an outcome and receives an executable plan. It is not yet an intelligent campaign creation system.

| Question | Verdict | Why |
|---|---|---|
| Can FlashCreate build campaigns inside Promorang? | **Partially** | It can create an unfunded draft campaign/Moment for four actions: content, purchase, referral, visit. It does not compose the full campaign aggregate. |
| Can businesses execute campaigns? | **Partially** | Promorang has proof, funding, distribution, participation, rewards, guest, commerce, and analytics components, but execution spans multiple workspaces and contracts. |
| Can creators participate? | **Yes, but fragmented** | Missions, promoter tools, content attribution, and economics exist; brief, rights, approval, and payout should be one lifecycle. |
| Can customers discover? | **Yes, unevenly** | Public discovery exists, but Flash-created supply is not guaranteed to enter a unified ranked opportunity index with correct eligibility and locality. |
| Can campaigns be measured? | **Observed and attributed, partly** | Growth events and verified outcomes are strong; contract inconsistency and lack of incrementality limit trustworthy ROI. |
| Can AI optimize campaigns? | **Not yet** | Current compilation is deterministic rules and fixed estimates. No trained outcome model, causal policy, pacing model, or closed feedback loop is evident. |
| Can campaigns become reusable templates? | **Technically plausible, not canonical** | Moment recurrence/cloning and plan metadata exist, but a versioned campaign-template object with parameters, provenance, performance, and safety constraints is needed. |
| Can success become predictive? | **Eventually** | Only after consistent outcome definitions, sufficient density, spend/cost ingestion, cohorts, contextual features, and avoidance of selection bias. |
| Can merchants benchmark themselves? | **Not reliably today** | Role analytics exist, but there is no governed anonymized benchmark product with comparable cohorts and confidence thresholds. |
| Can Promorang become daily merchant infrastructure? | **Yes, if simplified radically** | It must own demand planning, customer relationships, arrivals/redemptions, return automation, and ROI—not require merchants to navigate the platform economy. |

### FlashCreate vNext

FlashCreate should become a compiler from business intent into a versioned campaign program:

1. **Intent:** “Fill 15 empty lunch seats Tuesday–Thursday without discounting more than 10%.”
2. **Context retrieval:** business hours, capacity, margin bands, customer cohorts, past campaigns, place demand, weather/calendar, consented audience, creator/community supply.
3. **Plan generation:** target cohort, experience, actions, proof, incentive, creative, landing page, WhatsApp flow, QR assets, staff script, distribution, budget, experiment, forecast.
4. **Policy validation:** funding, capacity, claims, age restrictions, privacy, brand safety, reward liability, staff ability, creator rights.
5. **Human approval:** every cost, public claim, automated message, and real-world commitment is explicit.
6. **Execution:** publish through the Opportunity Index and selected channels; issue tracked links/QRs; assign creators; alert staff.
7. **Control loop:** pacing, fraud, capacity, conversion, cost, sentiment, and inventory adapt within approved limits.
8. **Postmortem:** observed versus expected, incremental lift, cohort quality, contribution margin, review/referral/return effects.
9. **Template learning:** successful structure becomes a parameterized playbook, not a copied page.

Prediction must begin as ranges and comparable-case evidence, not false precision. A useful forecast says: “Among 18 similar weekday restaurant activations in this area, the median verified visit rate was X; confidence is low because your business has only two prior campaigns.”

## Feature challenge: the deletion and demotion test

Every feature must name one primary outcome and one measurable causal pathway. If it cannot, it is not a product feature; it is inventory for the backlog.

Use this gate before development:

1. Which demand-loop stage does it improve?
2. For which actor and constrained job?
3. What behavior changes?
4. What verified outcome proves that change?
5. Does it improve with network size or merely consume subsidy?
6. What is the fraud, privacy, safety, and support cost?
7. What existing primitive can express it?
8. What will be removed or hidden if this ships?

Recommended challenges:

- **Defer or isolate Pieces, AMM, liquidity provision, dividends, and trading.** They do not currently strengthen the shortest path to trusted local demand and introduce severe cognitive, regulatory, and operational cost.
- **Collapse currencies and status systems.** Do not add PromoPoints. Keep funded reward credit, non-spendable reputation, and entitlements distinct.
- **Turn PromoKeys into entitlements, not a standalone economy.**
- **Make PromoPush a channel layer, not a destination product.**
- **Make PromoShare a campaign mechanic inside referrals/distribution unless it proves an independent recurring job.**
- **Retain Memories only where they cause return, access, identity, or sharing.** A collectible without downstream utility is decoration.
- **Remove generic gamification that does not correlate with healthy retention or verified demand.**
- **Collapse role dashboards into an organization workspace with role-based permissions and saved views.** A merchant may also be a venue, host, brand, creator, and community sponsor.
- **Stop creating parallel discovery routes.** All public supply should enter one Opportunity Index and render through appropriate views: answer, feed, map, calendar, directory, or embed.
- **Stop using feature brands as domain boundaries.** Product names may remain in marketing; the backend should use stable primitives.

## Target architecture

### 1. System of record

- Organization and Place graph
- Person and consented Relationship graph
- Campaign aggregate and version history
- Experience catalog and availability
- Action/Proof/Outcome ledger
- Incentive funding and liability ledger
- Entitlement and redemption ledger
- Content/rights/provenance graph
- Reputation and review graph

### 2. Event and intelligence plane

Every event follows one versioned envelope:

- actor and organization context
- object and campaign lineage
- channel and attribution context
- location precision class, not raw coordinates by default
- consent/purpose
- event time and ingestion time
- idempotency key
- observed/verified/reversed state
- monetary and incentive value

Above it sit a semantic metrics layer, feature store, experimentation service, anomaly/fraud service, recommender, forecasting service, and benchmark service.

### 3. Orchestration plane

- Campaign compiler
- Audience/relationship segmentation
- Distribution planner
- Workflow automation
- Proof and fulfillment policies
- Budget/reward pacing
- Experiment allocation
- Safety and capacity rules
- Notifications and channel adapters

### 4. Distribution plane

- Consumer app/PWA
- Search, answer engine, feed, map, calendar
- Campaign landing pages
- WhatsApp and email
- Creator/community links
- Signed QR and universal resolver
- Merchant widgets and embeds
- POS, ticketing, booking, commerce, and CRM connectors
- Public APIs, webhooks, SDKs, and agent tools

### 5. Trust plane

- Organization/place verification
- Staff and role permissions
- Proof confidence
- Review integrity
- Reward/referral fraud graph
- Creator rights and disclosure
- Consent ledger and suppression
- Appeals and reversals
- Audit logs and data lineage

## The six flywheels that matter

1. **Outcome data flywheel:** more campaigns → more verified outcomes → better matching/forecasting → higher ROI → more campaigns.
2. **Place graph flywheel:** more claimed places → more accurate inventory/trust → better discovery → more visits/reviews → more places claim and update.
3. **Creator conversion flywheel:** more creator campaigns → stronger verified demand passports → lower matching risk → better campaigns and payouts → better creators join.
4. **Community coordination flywheel:** more useful community programs → stronger membership/attendance graph → lower distribution cost → more sponsors/resources → better programs.
5. **Consumer utility flywheel:** better answers → more actions and feedback → better personalization and coverage → more habitual queries.
6. **Integration flywheel:** more APIs/connectors → lower merchant work and richer outcome data → higher ROI and retention → more partners integrate.

Each must be measured for organic coefficient and quality. A loop powered primarily by Gems is a promotion, not yet a flywheel.

## Distribution and market-entry doctrine

Do not launch “all local commerce” everywhere. Network effects require density.

Choose a beachhead where:

- demand expires quickly,
- capacity is visible,
- participation is easy to verify,
- discovery is socially influenced,
- merchants repeat campaigns frequently,
- WhatsApp/QR distribution is natural,
- one city has enough operational reach.

A plausible wedge is **time-bound hospitality and cultural demand in Kingston**: restaurants with perishable capacity, recurring nightlife/cultural events, creators, campuses/communities, and tourism experiences. The product promise is not “list your event.” It is “fill a measured capacity gap and bring the right people back.”

Expand by adjacency only after density:

1. hospitality + culture
2. retail/product launches
3. tourism routes and destination programs
4. community/faith/civic participation
5. public-interest campaigns

Public-interest and government campaigns need separate procurement, accessibility, neutrality, safety, audit, and data-governance modes. Do not treat them as branded promotions with different copy.

## Revenue doctrine

The meter should follow verified customer value:

- Free/low-cost organization record and basic publishing to grow the graph.
- Subscription for CRM, automation, staff, templates, benchmarks, and integrations.
- Usage fee for verified outcomes or attributable transactions, with category-specific pricing.
- Optional managed distribution budget and transparent channel fees.
- Payment/booking take rate only when Promorang owns meaningful checkout value.
- Enterprise/API contracts for multi-location organizations, tourism bodies, agencies, and public programs.

Never charge for positive reviews, undisclosed ranking, or access to customer data the merchant did not earn. Sponsored distribution must be visually and algorithmically separated from organic relevance.

## Roadmap

### Phase 0 — Subtract and define (0–90 days)

- Ratify canonical ontology, event contract, metric definitions, and reward constitution.
- Select the city/category wedge and 20–40 design-partner organizations.
- Hide or isolate speculative economy and non-core surfaces.
- Merge business identities into Organization/Place mapping.
- Make every existing feature map to the demand loop or enter deprecation review.
- Establish baseline: time to launch, verified outcomes, incremental lift where measurable, merchant repeat, consumer repeat, reward cost, fraud.

### Phase 1 — Close one demand loop (3–9 months)

- Campaign vNext and FlashCreate vNext.
- Unified Opportunity Index and hybrid search.
- Merchant Today/Customers/Campaigns/Results cockpit.
- Signed QR/link resolver and staff fulfillment mode.
- WhatsApp RSVP/reminder/referral/review journeys.
- Verified Experience Reviews.
- Stable campaign analytics with observed/verified/attributed distinctions.

### Phase 2 — Make learning compound (9–18 months)

- Customer Graph and lifecycle automation.
- Creator Demand Passport and campaign exchange.
- Template registry with performance provenance.
- Comparable cohort benchmarks and evidence-based forecasts.
- Recommendation engine and marketplace health controls.
- POS/ticketing/booking connectors and public Demand API.

### Phase 3 — Become local infrastructure (18–36 months)

- Multi-merchant Scene programs and entitlements.
- Tourism/community distribution partnerships.
- Agent-ready discovery and execution APIs.
- Privacy-preserving city demand insights.
- Cross-city template transfer with local calibration.
- Enterprise governance and public-interest campaign mode.

## Final answer

What would make Promorang the default infrastructure for local commerce, events, and community participation rather than another marketplace?

Not more listings, rewards, dashboards, or branded mechanics.

Promorang becomes default infrastructure when it does five things better than any alternative:

1. **Understands demand:** it captures what people want now, in context, without requiring them to know which marketplace category to browse.
2. **Coordinates supply:** it lets any legitimate organization convert an outcome into a safe, funded, distributable, fulfillable campaign in minutes.
3. **Proves causality and trust:** it distinguishes impressions from actions, actions from verified outcomes, attribution from incrementality, and rewards from genuine loyalty.
4. **Owns the return loop:** it turns each transaction or participation event into a permissioned relationship, review, referral, and next-best return—not a one-off conversion.
5. **Works everywhere:** it reaches people through search, maps, WhatsApp, creators, communities, QR, embeds, partners, and agents; the Promorang app is useful but never mandatory.

The decisive strategic move is to stop treating Promorang’s named features as the architecture. Build one Demand Graph, one Campaign compiler, one Opportunity Index, one Outcome ledger, one Relationship graph, and one Distribution plane. Let events, restaurants, churches, festivals, tourism programs, launches, charities, governments, and retailers become templates on top.

If Promorang does that—and concentrates geographically until the data and coordination loops genuinely compound—it can become the demand layer used every day by local organizations and queried naturally by consumers.

If it continues adding parallel economies, routes, dashboards, and campaign-like objects, it will remain an impressive collection of marketplaces that never achieves infrastructure status.
