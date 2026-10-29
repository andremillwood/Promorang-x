# Role dashboard cleanup

Reviewed and updated Creator, Host, Merchant, Brand and Agency operational workspaces. Extends the direction in `../brief.md`; preserves existing data panels and Promorang imagery.

| Before | After | Why |
| --- | --- | --- |
| Large photo introductions and repeated navigation cards | Compact shared heroes and one visible, keyboard-accessible tab row | Bring working content into view sooner |
| Local tab state could drift from the URL | Validated URL-backed selection preserving other parameters and browser Back | Reliable navigation and shareable workspace states |
| Repeated pitches, decorative status and vague empty copy | Task-specific headings, real counts and concise recovery guidance | Make actions and status trustworthy |
| New-brand guide replaced the workspace navigation | Guide lives inside Campaigns; demand remains accessible | Keep first-time users able to explore |
| Merchant venue action selected its current tab | Action opens the event creation route | Remove a dead end |
| Long populated merchant table widened the mobile grid | Shrinkable grid children and contained table scrolling | Keep the offer form visible at 320px |
| Dark workspace panels inherited incompatible light tokens | Local dark token scope within each role workspace | Restore readable cards without changing the global theme preference |
| Agency section controls implied missing tab panels | Native section buttons focus and scroll to actual sections | Honest semantics and usable keyboard navigation |

## Verification

- Targeted Vitest suite: **10 tests passed** across URL navigation and five role dashboard integration cases. Covers browser Back, query preservation, connected panels, invalid tab fallback, new-brand demand navigation, failed campaign recovery and merchant event routing.
- App-configured ESLint: passed for changed implementation and test files.
- Browser matrix: actual role components and work panels rendered at **320, 390, 768 and 1440px**. No document-level horizontal overflow; tab/panel connectivity and keyboard arrow navigation verified.
- Populated stress cases at **320 and 1440px** for all five roles, including long organization/product names: no overflowing containers or uncaught page errors after fixes.
- Fresh mobile and desktop screenshots captured for every role; visually inspected, including final agency and merchant contrast fixes.
- Production build and material import-isolation check: passed. Existing large-chunk warning remains. SEO generation completed with 30 localized snapshots; dynamic SEO pages were skipped because their fetch failed.

Browser checks used isolated fixture sessions and intercepted data responses. They validate responsive role interfaces, not live account permissions, production transactions or physical-device browser behavior. No publishing, payment or client-access changes were performed.

Screenshots are available in `/tmp/role-{creator,host,merchant,brand,agency}-{390,1440}.png` for this local session. Temporary preview entrypoints and fixture auth wiring were removed from the project.

Verdict: ready for review of these five operational workspaces. Deeper role panels outside the exercised states retain their existing implementation.
