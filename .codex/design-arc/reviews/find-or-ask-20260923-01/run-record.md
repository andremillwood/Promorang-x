# Design Arc review: Find or ask

## Setup

- Runtime: Codex
- Workflow version: 0.3.0
- Saved evidence mode: Guidelines + Benchmarks (Mobbin)
- Active evidence mode: Guidelines only
- Evidence provenance: user-approved one-review override to use Pen.dev instead of external benchmark research
- Saved and active approval mode: Guided
- Approval provenance: saved project setting
- Graph assistance: active
- Graph provenance: saved project setting
- Visualization: Pen.dev MCP, user selected

## Objective — confirmed

Create one simple “Find or ask” journey across the homepage hero, marketing header and signed-in experience. A person should immediately understand whether Promorang will find an answer or help them ask for something missing. The next step must adapt appropriately for participants, merchants, hosts, creators and brands.

### Evaluation criteria

- A five-year-old can explain what each main button does.
- Search never silently becomes a poll or demand request.
- Stakeholder experiences remain connected to the same underlying person need.
- Every new user-facing phrase exists in English, Latin American Spanish and Brazilian Portuguese.
- Translations can expand without breaking layouts.
- Loading, no-results, error, request, response and success states are included.
- Pen.dev contains the editable visual journey before production implementation.

## Gates

- Objective Confirmation: passed on 2026-09-23.
- Direction Gate: passed. User approved Direction A — one search with explicit recovery.
- Visual Proposal Gate: pending.

## Current journey audit

- Platform: responsive React web application.
- Inspected viewport: 958px-wide Pen.dev integrated browser. Mobile behavior is source-inspected but remains runtime-unverified because the integrated browser does not expose viewport controls.
- Public entry: the homepage hero leads with “What should Kingston & St. Andrew have more of?” and two demand-oriented actions. It does not offer search.
- Marketing header: contains navigation, market, language, authentication and PromoCard actions, but no search entry.
- Public Discover: contains a prominent search field and interest filters. Search capability therefore exists, but one navigation step away from the homepage promise.
- URL continuity: loading `/discover?q=24-hour%20kids%20cafe` left the rendered public Discover input empty in the inspected state. Query continuity is not currently visible.
- Result semantics: factual questions such as “Is D&R Beauty Supplies still operating in Spanish Town?” render as “People want this,” “I want this too,” and a target meter. This turns verification into demand.
- Signed-in header: `HeaderSearchPreview` supports initial, loading, result and no-result states. No-result routes to the full Search Hub, not to an explicit find-versus-request decision.
- Full Search Hub: supports initial, loading, categorized results and no-results. Several visible category labels and suggested searches are hard-coded in English.
- Existing request flow: `AskQuestionModal` now separates “Find something” from “Ask for something,” but it is reached contextually rather than acting as the shared search recovery path.
- Merchant public entry: starts from concrete business outcomes and offers “See what people nearby want,” but does not connect those wants back to a shared classified source.
- Other stakeholder in-app paths expose role-specific tools, but there is no single intent object that preserves whether the originating person sought a fact, recommendation, group choice, coordination or unmet demand.

### Material states

- Entry: homepage hero, marketing header, public Discover, signed-in header.
- Search: untouched, typing/suggestions, loading, results, no exact result, error.
- Classification: factual lookup, recommendation, group choice, coordination and unmet demand.
- Request: review classification, sign-in boundary, submit, success, error, cancel and correction.
- Response: stakeholder match, response available, person notified, outcome opened, no response yet.
- Internationalization: English, Latin American Spanish and Brazilian Portuguese; long-label and text-expansion layouts require explicit validation.

## Evidence

- Inspected live local Promorang render through Pen.dev browser: homepage hero, public header, public Discover and merchant landing hero on 2026-09-23.
- Inspected current source: public and signed-in header search, Search Hub, public Discover, homepage demand entry, global search and request modal.
- W3C WAI-ARIA combobox pattern: accessible editable search suggestions, focus, keyboard interaction and explicit accessible naming.
- WCAG Labels or Instructions: choices and input controls require labels that explain what the person is selecting.
- W3C Internationalization Quick Tips: keep text separate from presentation, use Unicode and design for translation expansion.
- Google Search Central Event and LocalBusiness guidance: describe actual entities accurately; business hours are not events, and structured data must match the real page subject.
- Evidence limitation: Guidelines-only review; no real-product benchmark or benchmark motion was inspected.

## Observed friction

- Search exists but is not the public entry promise.
- The same natural-language form can imply both lookup and demand without a visible classification boundary.
- Factual verification questions are shown as Wants, producing false merchant opportunity signals.
- Search recovery, public request creation and stakeholder response are separate journeys with weak continuity.
- Internal words such as “signal,” “target,” “activation” and “market” ask ordinary people to understand Promorang’s machinery.
- Hard-coded English in search suggestions and categories weakens localization completeness.

## Approved direction

Direction A — one search with explicit recovery.

1. A person enters a need from the homepage hero, marketing header, Discover or signed-in header.
2. Promorang searches real places, events, offers and existing answers first.
3. Results explain what was found.
4. When no exact result exists, the person explicitly chooses to ask people, ask for something new or try another search.
5. Promorang previews the classification and outcome before saving.
6. Only genuine unmet requests enter stakeholder opportunity tools.
7. A stakeholder response returns to the originating person.

### Motion scope

- Retain native dialog, focus and result-list behavior.
- Use only a small continuity transition between results and confirmation.
- Reduced motion uses an immediate content replacement plus persistent status text.
- Exact timing and runtime behavior remain unverified until implementation measurement.

## Authority

Design review only. No additional production implementation, staging, deployment or release is authorized by this review.

## Visual proposal — Pen.dev

- Editable file: `/Users/bumblebeecreative/.pencil/documents/122da1d7-5dc5-43f4-9e66-43b7d7c4354d/pencil-new.pen`
- `Journey 01 — Homepage Find or Ask`: marketing header entry plus a hero search promise written in child-clear language.
- `Journey 02 — Search Results`: found entities remain answers; a factual lookup is not presented as a vote or demand signal.
- `Journey 03 — No Result and Choice`: explicit recovery choices are “Ask people,” “Ask for something new,” and “Try another search.”
- `Journey 04 — Confirm the Ask`: previews the exact question, audience and classification before anything is posted.
- `Journey 05 — Stakeholder Response and Return`: person, merchant, host, creator and brand actions remain connected to the same originating need.
- `Journey 06 — Mobile, I18n and States`: mobile sequence, EN/es-419/pt-BR expansion examples, loading, no-result, error, posted, answered and no-answer states.
- `Journey 07 — Canonical Object Routing`: maps plain-language lookup, recommendation, question and unmet-need intents onto the existing Place, Moment, Content/Person, Discovery, Offer/Opportunity and Proof/Receipt objects, followed by the appropriate role lens.

### Conformance matrix

| Material screen or state | Direction A | Classification | Notes |
| --- | --- | --- | --- |
| Homepage hero | Search first, ask second | match | Primary action is “Find it”; promise explains recovery. |
| Marketing header | Shared entry | match | “Find or ask” is visible as a first-class destination. |
| Results | Explain what was found | match | Entity status and freshness are shown without voting language. |
| No exact result | Explicit recovery | match | Three choices are separate and named by outcome. |
| Ask confirmation | Preview before saving | match | The person sees the question, audience and “not a poll” classification. |
| Stakeholder response | Role-aware action | match | Each role gets a different action, tied to the same need. |
| Person return | Close the loop | match | Answer source and freshness return to the person. |
| Mobile | Same mental model | match | Start, recovery and confirmation remain distinct. |
| EN / es-419 / pt-BR | Expansion tolerance | repairable drift | Copy is represented and fits this proposal; final translations require native-speaker review. |
| Loading / error / success / no answer | Plain-language status | match | All material system states have explicit words. |
| Reduced motion | Immediate understandable change | match | State text remains; continuity animation is optional. |

### Validation and corrections

- Pen.dev structural validation found no clipped or overflowing nodes in the six final journey boards.
- Pen.dev structural validation found no clipped or overflowing nodes in the canonical-object routing board.
- Visual screenshots were inspected for the homepage, results, recovery, confirmation, stakeholder and mobile/i18n boards.
- Correction round 1: removed flex-layout defaults that displaced absolute-positioned content.
- Correction round 2: corrected nested-frame offsets and rebuilt final boards with explicit layout rules.
- Correction round 3: shortened one brand-action label and one results helper to remove right-edge overflow.
- Runtime keyboard behavior, real translation catalogs and narrow-device rendering remain implementation-stage proof items.

## Visual verdict

**Meets with corrections.** Direction A is coherent and child-clear in the editable Pen.dev proposal. Before production release, the localized copy needs native-speaker review and the implemented search must be tested for keyboard, screen-reader, query continuity and narrow-screen behavior.

## Visual Proposal Gate

Passed. User approved proceeding with production implementation.

## Production implementation — slice 1

- Added a shared `FindOrAskIntent` contract and URL helpers without introducing a new canonical consumer object.
- Added a reusable, accessible `FindOrAskEntry` search form.
- Repositioned the public homepage hero around search-first language and the explicit promise that a search is never silently posted.
- Added “Find or ask” to the public marketing header.
- Added explicit no-result recovery choices to the full Search experience.
- Updated signed-in header-search recovery to lead into the same choice flow.
- Preserved the query when moving from Search into public Discover.
- Added complete EN, es-419 and pt-BR copy for every new phrase.
- Verification: i18n parity tests passed; shared intent URL tests passed; web production build passed. The shared package build remains blocked by unrelated pre-existing type failures in Moment participation, PromoCard fulfillment and browser-global declarations.


## Production implementation — completion record

- Implementation authority: separately authorized by the user after the Visual Proposal Gate; this does not change Design Arc's design-only authority boundary.
- Persistence: reused `discovery_questions` and added explicit `semantic_kind` (`question` or `demand`), origin context, moderation state, canonical outcomes and per-user demand support. No parallel consumer object family was introduced.
- Database invariants: the creation function requires an explicit recovery choice; questions cannot enter demand support; listing/event verification is classified as question; support RLS only permits active explicit demand; proposed outcomes must begin with pending moderation and pending verification.
- Continuity: query, city, language, source, recovery action and originating discovery are preserved across search, confirmation, stakeholder creation and person-return flows.
- Posting boundary: no Search recovery action becomes public until the person explicitly chooses a path and confirms posting.
- Canonical response routing: merchant → Place/Offer, host → Moment, creator → Content/Opportunity, brand → Offer/sponsorship/commission route, verified result → Proof/Receipt. Created canonical objects can attach back to the originating discovery.
- Originator return: outcomes expose source, freshness and verification state, and a database notification returns the person to the posted Search recovery state.
- Public semantics: Community questions and verification asks remain questions without a demand target; only explicit unmet needs appear in demand rails/inboxes and support counts.
- Public Search is now treated as a public route during auth hydration, preventing the recovery UI from being hidden behind an authenticated-app initialization state on slow or anonymous mobile sessions.
- Localization: all new journey copy is present for EN, es-419 and pt-BR, and i18n parity is part of the PR CI gate.
- Accessibility: recovery choices are native buttons with focus-visible treatment; demand progress uses progressbar semantics and ARIA values; confirmation/error/posted states use explicit status or alert text; the browser gate covers mobile and desktop recovery/confirmation rendering.
- Responsive browser proof: the production preview passed the Search/recovery browser script at 390×844 and 1440×1000.
- Automated verification on Web Build run #586:
  - public market continuity: 2 files / 9 tests passed;
  - shared Find-or-Ask contract: 1 file / 4 tests passed;
  - web Find-or-Ask + i18n: 6 files / 22 tests passed, including 11 i18n parity tests and the journey integration test;
  - production web build passed;
  - public SEO generation completed with 30 localized snapshots and 54 sitemap URLs;
  - Find-or-Ask browser verification passed at both required viewports.
- SEO boundary: no new structured-data snapshot is generated for unmoderated Find-or-Ask question/demand objects. Existing canonical public-object SEO generation remains unchanged.
- Remaining release limitation: the Supabase migration is committed and reviewed but is not claimed as applied to the live database by this run record.
- External deployment status: prior Vercel status failures were quota/resource-limit responses rather than application build failures; the repository's own Web Build gate is green.
- Tooling limitation: repository writes were performed through the authenticated GitHub connector because a local network clone was unavailable, so the requested local `apply_patch` edit mechanism could not be used. No reset, overwrite of unrelated history, or force push was used.

## Final validation status

- Visual proposal: approved.
- Production implementation: complete for the approved Find-or-Ask scope.
- Repository CI: green on the implementation head before this documentation-only update.
- Merge gate: eligible once the documentation update is present on the PR head and required GitHub checks remain green.
