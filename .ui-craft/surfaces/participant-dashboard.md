# Participant dashboard review — 2026-10-15

Scope: `/dashboard` → Dashboard → PeopleHome, with ParticipantWorldLayout and ParticipationFeed. Role-specific Studio dashboards are outside this pass.

## Findings and changes

| Before | After | Why |
| --- | --- | --- |
| Local calendar required a literal `Kingston & St. Andrew` match in venue text | Calendar uses selected MarketContext city and existing matchesCityHub rules; feed ranking uses the same rules | Show actual local opportunities, including Kingston aliases, and respect city selection |
| Oversized uppercase marketing heading | Smaller sentence-case DM Sans heading | Put next steps and feed content closer to the fold |
| Recommended event title and explanation truncated to one line | Naturally wrapping title and explanation with stronger secondary contrast | Users can understand the proposed action before opening it |
| Calendar failure had no recovery action | Localized Retry button; disabled with progress text during retry | Error states need a next step |
| Event card details absolutely positioned inside fixed-height media | Text participates in layout; card grows with content; consistent sans-serif title | Long titles and enlarged text must remain readable |
| Feed Explore link could wrap its icon onto another line | Inline layout with a 44px minimum height; heading row wraps | Clear action affordance and touch access |
| Feed metadata and CTA shared an inflexible row | Action row wraps; grid children allow shrinking and long-word wrapping | Prevent overflow on narrow phones |

Below-fold category/event images use lazy loading and async decoding. Their hover effect is limited to fine pointers without reduced motion. Existing header materials, photographic assets, account routes and Studio views were preserved.

## Verification method

Headless installed Chrome against the local Vite app. A temporary browser route replaced AuthContext only inside this isolated test session with a fixture participant. API/data requests received fixture responses; no real account session, account mutation, or production auth change was used. Fonts and local assets loaded normally.

## Browser results

- Widths 320, 390, 768, 1024, 1440 and 1920: document scroll width equals viewport width.
- Kingston fixture listing appears in the calendar under the composite selected-market label.
- Mobile/desktop viewport screenshots inspected at 390×844 and 1440×844.
- At 320px, bottom navigation targets measured 76×48px.
- Event link keyboard focus has a visible solid outline.
- Reduced-motion event image transform is none on hover.
- Long event title at 48px (double the narrow-screen title size): card grows to 1039px, title stays inside, no page overflow.
- Simulated calendar 503 recovers to an event through Retry.
- Simulated dashboard-home 503 recovers to the dashboard through Retry.
- No uncaught browser page errors observed.

## Automated checks

- Scoped ESLint using apps/web configuration: passed.
- Production build: passed, including material budget/import-isolation checks and SEO snapshots. Existing large-chunk warning remains; dynamic SEO pages were skipped because their fetch failed.
- Dashboard regression tests: 3/3 passed (city aliases and exclusion, market switching, retry progress). The first run exceeded the host's default timeout; the final run allowed 20 seconds and all tests completed in 731ms.
- Scoped diff whitespace check: passed.

## Limits

This validates the production UI with fixture account/data boundaries, not live authentication or backend authorization. No real-device Safari, Firefox, Studio-role, or account-transaction checks were performed.
