# Shared Studio cleanup — 2026-10-20

Reference: [Maya Brennan, How to de-slopify your designs](https://uxdesign.cc/how-to-de-slopify-your-designs-4c40c57c1dc9).

This applies a specific critique-and-iteration approach to existing Promorang components. It does not copy the article's sample aesthetic or claim a platform-wide redesign is complete.

## Scope

- DashboardSurface: DashboardHero and DashboardQuickRoutesCard. Current production consumers include ParticipantDashboardV2 and AgencyDashboard.
- ExperienceShell: QuietEmpty, shared across participant experience screens.
- Platform direction recorded in .ui-craft/brief.md for subsequent work.

## Findings

| Before | After | Why |
| --- | --- | --- |
| Primary action appears both in the main CTA and command list | One primary CTA; secondary actions appear once in a neutral list | Clear action priority |
| First two metrics appear again above the full metric strip | One responsive metric strip with tabular figures | Reduce repetition and reading effort |
| Live workspace label has no status input | Removed unsupported live-status claim | Status should describe data |
| Large display type, fixed 390–440px main panel and heavy shadows | Content-sized panel, DM Sans working title, restrained elevation | Let actual work follow the header sooner |
| Command suite / Your focus today / Recommended next move repeat context | Role label plus actual title and action | Remove labels that add no information |
| Route index numbers imply an order that does not exist | Icons, route names and arrows | Keep navigation meaning explicit |
| Empty-state eyebrow says Nothing invented | Actual empty/error title leads | Product copy should explain the user's situation |

Preserved: static brand material, existing supplied photographs, semantic metric colors, link destinations, callback actions, accessible loading status, and genuine numbered next-step sequences.

## Validation

- Isolated temporary component preview using actual components, I18nProvider, app CSS and production stakeholder CSS. Illustrative data; no real account activity.
- Browser matrix: 320, 390, 768, 1024, 1440, 1920px. No horizontal document overflow.
- Primary action and metric occurrence counts: one each.
- Secondary callback executes and updates visible feedback.
- Long primary-action label fits at 320px.
- Keyboard focus: verified with Tab/Shift+Tab; active secondary action has a 2px orange outline.
- Mobile/desktop screenshot inspection: final 390px and 1440px previews checked; mobile metrics share a compact row.
- Regression tests: 6/6 passed (shared hero and participant dashboard).
- Scoped ESLint: passed.
- Production build: passed, including material budget/import-isolation checks and SEO snapshot generation. Existing large-chunk warning remains; dynamic SEO pages were skipped because their fetch failed.

## Next surfaces

Review the remaining role-owned Studio headers, dense merchant/brand tools, directory pages, wallet/PROMOCARD and discovery cards individually before extending these rules. Preserve scannable data, QR codes and semantic status indicators. No blanket removal of radii, gradients or brand color.
