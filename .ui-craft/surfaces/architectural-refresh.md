# Architectural UI refresh — 2026-10-28

## References and direction
- [NCB Jamaica](https://www.jncb.com/): clear service routes, strong section hierarchy and rectangular product rows.
- [Sagicor Jamaica](https://www.sagicor.com/en-jm): task-oriented personal/business navigation. Content reviewed; Cloudflare prevented visual browser inspection.
- [Conlive](https://bracketweb.com/conlive-html/demo-landing.html?storefront=envato-elements): confident display scale, high-contrast sections and directional actions. References inform hierarchy; Promorang retains its fonts, imagery and identity.

## Implementation
Shared cards no longer receive rounded frames, blur and decorative shadows by default. Shared actions use 2px corners and filled/tonal hierarchy. Public opportunity previews, category routes, participant surfaces and Creator/Host/Merchant/Brand/Agency tools follow the same shape language. Role navigation uses an orange selection rule. Removed the homepage's animated decorative wave and gradient text. Role task behavior and URL navigation are preserved.

The header and its critical gradient detail are unchanged. Tangible PromoCards, avatars, accessible focus outlines, form controls and meaningful warning/selection states retain distinct affordances. This is a shared-system rollout; it does not claim every legacy screen has been individually redesigned.

## Verification
Public homepage rendered at desktop 1440px and phone 390px; no page overflow at 390px. Final production build passed, including 30 localized SEO snapshots and 54 sitemap URLs. Lint passed with no errors and the existing button export fast-refresh warning. DeepRolePanels (8 tests) and PublicMarketHome (5 tests) passed. Broader regression checks were still running at release preparation; no incomplete suite is counted as a pass. Local Chrome encountered launch timeouts and graphics initialization errors during role verification; homepage browser checks succeeded before this runner failure. Temporary fixture files are excluded from production.

## Completed verification
All 51 regression tests across 8 suites passed. Using an isolated compatible Chromium runtime, actual Participant, Creator, Host, Merchant, Brand and Agency components rendered at 390px and 1440px without page overflow or runtime errors. Empty fixture data exercised first-run/empty panels; this does not validate live authorization or real transactions. The participant preview initially lacked HelmetProvider; adding that provider to the temporary fixture resolved its render error. Visual review found and removed a remaining rounded/dashed feed empty-state frame and sharpened search controls.
