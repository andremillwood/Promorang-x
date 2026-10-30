# Public homepage verification — 2026-10-15

Scope: `/` → Index → PublicMarketHome; local Vite app, headless Chrome using the installed browser. This is viewport emulation, not physical iOS/Android or Safari verification.

## Findings and changes

| Before | After | Rule |
| --- | --- | --- |
| Fixed-height event media also contained absolutely positioned titles and metadata | Event details grow in normal flow below the media | Responsive content must handle long text without clipping |
| Missing photos reserved a full image-sized blank area | Missing-photo media is a compact 96px status area | Every section earns its space |
| Event headings inherited a serif display treatment | DM Sans heading with tighter tracking and medium emphasis | Preserve the homepage typography hierarchy |
| Conflicting card min-width utilities and rail CSS | Rail controls card width in one place | Respect container width and prevent accidental overflow |
| Section titles and links shared an inflexible row | Headings can wrap while actions retain their touch target | Content-driven responsive layout |
| Mobile navigation lacked explicit bottom safe-area padding | Safe-area padding and 44px targets | Touch and safe-area requirements |

Below-fold listing images load lazily with asynchronous decoding. Existing data, routes, brand materials, loading/error distinction and authentication behavior remain intact.

## Browser evidence

- Widths 320, 390, 768, 1024, 1440 and 1920: document width equals viewport width.
- Rail card widths: approximately 230px at 320, 287px at 390 and 320px at larger widths.
- Mobile nav: 50×44px targets at 320; 64×44px at 390.
- Focus on sixth event: active element is the card, visible solid outline, card scrolled into view.
- Reduced motion: decorative current reports animation-name none; image zoom is gated behind no-preference and a fine pointer.
- A browser-only fixture with a long event title, long venue and participant count passes at 320px with normal and doubled text sizes: title remains below the badge, inside the card, and the page stays 320px wide.
- Opportunity request tab opens; next-event control changes title; See all navigates to /live.
- No uncaught page errors observed during the viewport matrix.
- Inspected actual desktop hero and mobile event-section screenshots. Full-page mobile capture produced a tiling artifact, so viewport captures were used for visual QA.

## Checks

- PublicMarketHome.test.tsx: 5/5 passed after functional changes.
- Scoped ESLint: passed.
- Scoped git diff --check: passed.
- Production build: passed on final code, including material budget/import-isolation gate and SEO snapshot generation. Existing large-chunk warning remains; dynamic SEO pages were skipped because their fetch failed.

## Limits

Only the public homepage and its tested interactions were verified. No logged-in dashboards, native app, checkout, real-device Safari or Firefox checks were run. Existing materials and other in-progress changes were preserved.

## Integrated hero showcase and full-page composition — 2026-10-29

| Before | After | Why |
| --- | --- | --- |
| Approved photo hero separated from inventory | Offers, events, missions and request tabs inside the hero | Connect the brand opening to an immediate action |
| Static inventory preview | Eight-second rotation through real available entries, pause/resume, hover/focus hold, manual-selection pause | Restore requested showcase behavior without disrupting reading or request editing |
| Partner routes before browsing | Photographic category gallery before partner information | Let visitors discover something first |
| Repeated small event cards | Leading poster with supporting events; swipe rail on phones | Give actual artwork and event hierarchy room |
| Plain shop and account panels | Photographic shop feature and real noninteractive PromoCard | Carry product identity through the page without fabricated benefits |
| Low contrast warm-surface inputs | Scoped input, placeholder and request-option contrast | Keep browsing and request creation legible |

Verification: 21 targeted tests pass (public entrance, inventory card truth boundaries, rotation and interaction safeguards). Changed React components pass ESLint. Production build passes. Browser fixture checks at 320, 390, 768 and 1440 pixels show no horizontal overflow or page errors; request text remains editable and its recovery URL retains query, city, language and source. Event fixtures are local verification only, never published. Existing imagery is reused for illustrative category/partner/shop navigation; actual inventory artwork remains sourced from its record. Reduced motion disables automatic rotation. Empty, loading and failed-inventory paths retain truthful messaging and recovery. Shared footer and operator dashboards are outside this change. Existing large-bundle build warning remains.

Final tablet correction: event posters use a horizontal browsing rail through 1023px; this avoids squeezing full event metadata into the desktop supporting column. Re-rendered at 768px without overflow or browser errors; production build passes after the correction.
