# Product compression pass

## Implementation map

The actual public tree is `App → AppLayout → PublicHomeBar + Index → PublicMarketHome`, with the existing Footer. The unrelated Header is used on other surfaces; it is not the homepage navigation. `Index` retains the consumer Moment preview branch.

| Surface | Arrival intent / first understanding | Primary action | Information that can wait |
| --- | --- | --- | --- |
| `/` | Find something worth doing locally | Existing FindOrAsk search or a real listing | Demand, shared interests, PromoCard |
| `/discover` | Explore events, places and offers | Search/filter/open inventory | Questions, requests, taste calibration, card explanation |
| `/home`, `/today`, participant preview | Find a useful action now | Recommended action or personalized feed | Release signals and world invitation behind disclosure |
| `/scenes` | Find people with shared interests | Explore existing groups | Starting and operating a group |
| `/card`, `/vault` | Use or revisit things retained | Existing card/vault actions | Preserved unchanged |
| `/solutions` | Get people to act and see outcomes | Existing business outcome intake | Alternative ways into the system behind disclosure |
| Brand / merchant landings | Customer action / visits and repeat business | Existing role-specific outcome intake | Programmes and operational infrastructure |
| Host / creator / agency / community landings | Attendance / worthwhile work / client results / coordinated participation | Existing role-specific CTA | Detailed demand, proof and PromoCard relationships |

### Changes

- Removed the launch Scene/start proposition from the homepage hero. Kept the dominant consumer title, real market context, search and existing interests. Replaced the separate large category rail with wrapping touch targets; retained one compact feed navigation rail.
- Kept real event/discovery/request/Scene data hooks. Excluded ended events from homepage recommendations. Added an explicit loading status and retained truthful sparse state; no fabricated listings or activity.
- Simplified public desktop navigation from seven entries to Explore, Events, Offers and For business. Signed-out header offers login; PromoCard education and signup remain after inventory. Card destinations use `/card`, preserving access and auth return paths.
- Fixed mobile Events navigation to `/live` instead of an absent `#moments` anchor. Requests retain their existing demand flows and login continuation. Added the human request escape hatch and restored the existing `#ask` target.
- Public Discover honors incoming event/offer/request tabs and interest categories. Inventory now precedes demand/questions and optional calibration. No API or object changes.
- Participant home retains its personalized feed and recommended action. Removed the placeholder Scene pitch when membership does not exist; kept actual group links, card, vault and latest receipt. Optional release/world explanation is disclosed progressively. Operator work remains in the separate existing branch.
- Commercial entry copy shares an action/outcome proposition while retaining distinct jobs, role CTAs, business intake and workspaces.
- Updated existing `publicHome.*`, `publicNav.*`, `publicDiscover.*`, `discover.*`, `search.*`, `scenes.*` and selected `nav.*` labels; added `compression.*` copy and two existing-interest category labels in English, Latin American Spanish and Brazilian Portuguese.

### Route audit and preserved behavior

No router rewrite or route deletion. Existing aliases such as `/welcome → /`, `/communities → /scenes`, and `/join/venue → /for-merchants` remain. `/home` and `/today` share PeopleHome; keeping both preserves existing links and query strings. Public Discover's incoming tabs previously were ignored; the fix is inside its existing component. Homepage `/scenes` is no longer a competing primary navigation destination but real group tiles and canonical detail routes remain.

Canonical Moment IDs/slugs, discovery and Scene detail links, PromoCard, demand voting, auth transitions, role storage, permissions, commercial intake, business workspaces, currencies, rewards, databases, APIs, PWA registration and native app code are untouched. No dependencies, systems or pages added. Safe-area bottom navigation remains; search suggestions are now bounded and scrollable.

## Validation

- Web build passes. Existing chunk-size warning remains; SEO snapshot generation reports dynamic fetch unavailable locally and generates static localized snapshots.
- Lint passes with existing warnings and no errors.
- Final full web suite: 253/254 tests pass. The unchanged AftrHrs scene test expects `sceneMomentsWithAftrHrs` in CommunityDetail; that assertion fails on the existing source. New homepage sparse/navigation regression and locale parity checks pass. Shared suite: 227/228 tests pass; its unchanged AftrHrs monthly batch closure assertion also fails.
- Type check remains blocked by existing repository errors. Comparison against a copied HEAD source tree confirms existing `contextNotes` and `details.defaultOpen` errors; previous homepage translation-key errors were removed. Normalized diagnostic comparison: 571 errors in copied HEAD, 560 in the changed source, with no new diagnostics.
- Local headless browser at 390×844, 320×900 and 1440×900: homepage, Discover event/request filters, participant and host/merchant/brand previews, business hub, Scenes, Card login redirect, Spanish and Portuguese homepages render without JS page errors or horizontal page overflow. Homepage scroll reaches the bottom. Browser tooling used bundled Playwright because agent-browser was unavailable and the embedded browser kernel failed to initialize.
- Live populated inventory and authenticated business transactions cannot be verified visually without available backend data and an authenticated session. Existing auth/role/continuation and Scene/Card regression suites provide code-level coverage; no transaction was fabricated or submitted.
- No deployment performed.


## Follow-up compression implementation — October 8, 2026

### Decisions and requirement map

| Requirement | Follow-up implementation | Verification still needed |
| --- | --- | --- |
| Inventory before explanation | Homepage inventory state depends on events/discoveries, independently of requests/groups. Sparse state precedes demand and groups. | Populated local-market inventory and failed-fetch behavior |
| Understandable demand entry | Commercial links open the persistent Discover request tab. The request section embeds existing FindOrAsk search and explains search-before-request. Signed-in visitors open demand without another login entry. | Live search recovery, support submission and authenticated continuation |
| Commercial value before ontology | Shared host/creator/agency/community template leads with role action, explains recorded results, then introduces demand and retained access. Result distinctions are disclosed. Merchant/brand heroes use customer outcomes; programmes and economy explanations are disclosed. | First-time comprehension and authenticated role workspaces |
| Internationalization | All newly introduced follow-up copy has English, Latin American Spanish and Brazilian Portuguese entries. Participant refresh and Discover empty-view messages are localized. | Older role-detail, commercial intake and detail-page English copy remains outside this follow-up |
| Preserve capability | Existing APIs, role destinations, routes, canonical objects, rewards and demand mechanisms are reused. No migrations or dependencies. | End-to-end populated/backend-backed workflows |
| Mobile/PWA | Existing shells and safe areas retained; new actions/disclosures use minimum touch heights. | Rendered small-screen layout, keyboard and scroll verification |

### Persuasion review

- Context and uncertainty: show usable inventory or its actual absence; do not use empty demand as the main commercial proposition.
- Demand: real requests inform offers, without equating votes with purchases or guaranteed availability.
- Offer value: role copy identifies the action/outcome; creator copy explicitly makes reward terms depend on the opportunity.
- Effort: reuse existing search and commercial intake, reduce navigation bounces, and disclose secondary system explanations.

### Scope and release status

This follow-up improves existing surfaces. It does not establish a completed visual audit or a proven conversion improvement. The in-app browser kernel failed to initialize twice. The local preview server starts at port 8080 with sandbox approval; no deployment was performed. Full localization of older commercial text and populated/authenticated visual verification remain outstanding.

### Follow-up validation

- Final web build passes. Existing large-chunk warning remains; dynamic SEO fetch is unavailable locally, while 30 localized static snapshots and 54 sitemap URLs are generated.
- Web lint passes with no errors (117 existing warnings). Final scoped lint from the web workspace passes without diagnostics.
- Full web suite with two workers: 254 passed, 1 failed. The failure is the unchanged AftrHrs source assertion for `sceneMomentsWithAftrHrs`; that symbol is also absent from HEAD CommunityDetail. After the final failed-fetch state change, homepage regression and locale suites pass all 14 tests. Earlier auth continuation/journey plus homepage/locale checks passed all 23 tests.
- New regression coverage proves groups do not suppress the sparse inventory state and failed requests do not masquerade as a quiet market.
- Diff whitespace check passes. No deployment, migrations, API changes or dependency additions.
- Browser control could not initialize; the local preview is running on port 8080 and opening it in Codex is queued. Rendered mobile/accessibility and populated/authenticated flow verification remain incomplete.

- Current full TypeScript check was stopped after remaining active without diagnostics; it is unverified for this follow-up. The earlier report records existing type errors, but no fresh baseline comparison is claimed.


## Commercial localization and completed TypeScript verification — October 8, 2026

### Completed

- Localized rendered copy in Hosts, Creators, Agencies, Communities, Brands, Merchants, Solutions and Business Start, including role explanations, result distinctions, SEO copy, empty states and CTAs.
- Localized the existing business outcome intake: goal/context/success choices, planning labels, examples, recommendation and saved brief summary. Canonical IDs and persisted user inputs remain unchanged.
- Added presentation translations for existing outcome, business-type, success-action and programme data, including programme steps. Canonical data objects and selection logic are unchanged.
- Localized the existing ParticipationEconomy disclosure and merchant demand preview. Dynamic user content is preserved rather than automatically translated.
- Replaced the nonexistent demand `contextNotes` access with its typed `description`; replaced invalid native `details.defaultOpen` with controlled `open` state while retaining local preference persistence.

### Verification evidence

- Full TypeScript baseline completed: 560 diagnostics. After the two surface fixes: 558 diagnostics. Counts by file and diagnostic code have no additions; one error each was removed from PublicDiscoverExperience and PeopleHome. Generic union display order varies and concurrent unrelated edits moved some line numbers, so exact diagnostic strings/positions are not claimed to be stable. No diagnostics remain in this pass's edited surfaces. Repository-wide TypeScript is still failing, primarily outside the scope of this presentation pass.
- Focused localization/homepage/auth helper tests: 29 passed. New Spanish and Portuguese intake tests complete a saved brief and prove canonical outcome, business type, success action, programme IDs and login continuation are preserved.
- Final full web suite: 258 passed, one existing AftrHrs assertion failed. The assertion expects `sceneMomentsWithAftrHrs` in unchanged CommunityDetail source.
- Final build retry passes. A preceding concurrent build crashed in Vite with a segmentation fault; the retry after TypeScript completion passed. Existing large-chunk and unavailable dynamic SEO fetch warnings remain.
- Full lint passes with 117 warnings and no errors; final scoped lint passes without diagnostics. Diff whitespace check passes.

### Still pending

- The in-app browser kernel could not start. Permission was requested for the Product Design skill's local Playwright fallback and has not yet been received, so no new mobile screenshots or visual flow claims are made.
- No local QA/test login variables were configured in the inspected environment files. Actual authenticated live journeys require an available test session; code-level auth/intake coverage is not represented as a substitute.
- Unrelated concurrent PromoCard, OfferStudio and inventory edits were preserved. No deployment or backend migration was performed.
