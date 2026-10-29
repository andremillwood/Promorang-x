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
