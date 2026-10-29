# Deeper role dashboard panels — Craft Report

## Checked
Creator work/create, proof dossier, attribution, earnings and standing; Host arrivals, proof review, sponsorships and results; Merchant scanner, orders, locations and results; Brand opportunities, creator distribution, proof and economics; Agency activations and client results; shared demand inboxes. React/Vite/Tailwind, existing DM Sans and semantic tokens preserved.

Review dimensions: task clarity, repeated introductions, typography, accent hierarchy, failure versus empty states, form labels, keyboard-operable controls, long content and responsive layouts. This continues the constraints in `../brief.md` and the outer-shell pass in `role-dashboards.md`.

## Changed

| Before | After | Rule and evidence |
| --- | --- | --- |
| Creator proof stacked introductory cards and nested promotional headings | Work/attribution/earnings sections with in-page links; each tool owns its heading | Brief: prioritize the next decision and show content once. `CreatorProofDossier` renders the existing real work panels directly. |
| Earnings reads could fall through to empty figures and a starter tier | Failed reads show retry; absent profile has no assigned tier | Brief: failed requests must differ from empty inventory. `CreatorEarningsTab` checks all four query results before deriving figures. |
| Attribution repeated economics and earnings blocks, using several competing colors | Link form plus focused activity summary; earnings stay in the dedicated ledger | Brief: show each metric once and keep working copy specific. `CreatorAttributionMap` → `O2OLinkManager` / `CreatorO2OSummaryPanel`. |
| Host and Brand result panels repeated generic decision-framework cards | Compact summaries of actual available metrics, unavailable values and retries | Brief: every section must answer a user question. `HostImpactYieldConsole` and `BrandIntelligenceConsole`. |
| Sponsorship “Negotiate” accepted the offer, with an uncontrolled dialog | “Accept with message” explains acceptance; message stays until save succeeds; decline is labelled | Value/ease of use: action labels match their consequence. `HostSponsorshipRequests` mutation and dialog. |
| Large proof header, dense fixed desktop columns and unwrapped decision controls | Compact review heading, shrinkable columns and wrapping actions; retry and required reason preserved | Responsive and state floor. `HostProofReviewPanel` is rendered directly by the Host review tab. |
| Merchant panels used gradients, repeated headings, false Live badges and silent failed reads | Neutral working surfaces, clearer titles, error recovery, period label and readable long records | Brief: reserve orange for actions; statuses need data. Scanner, commerce, venue and sales components reached from Merchant tabs. |
| Brand distribution and Agency evidence described internal implementation limits | Direct commission/discovery/evidence actions and understandable client results | Brief: no internal design claims in product copy. `BrandCreatorBureau`, `BrandEvidencePack`, `AgencyManagedResultPack`. |

## Verification

- **24 deeper tabs × 4 widths** (320, 390, 768, 1440px): no document overflow or out-of-bounds content in the final viewport checks. Long stories, event names, product names, orders, proof cards and client names were exercised.
- Targeted tests: **18 unique tests passed** (10 existing role/URL tests plus 8 deeper-panel tests). Covers recovery, unavailable values, absence of a fabricated starter tier, campaign totals and sponsorship acceptance/message retention.
- Browser interactions: retry available and clickable in 12 failure cases (including fulfillment, which no longer shows a false empty queue); creator story/event selects work at 320 and 1440px; removing all tracked actions disables link creation; rejection requires a reason and can be cancelled; offline scanner entry is disabled.
- App-configured ESLint passed for changed files with no warnings after the sales-fetch dependency cleanup.
- Final screenshots reviewed for creator attribution/earnings/standing, host proof/sponsorships, merchant scanner/orders/analytics, brand opportunities/distribution/proof and agency results. Screenshot files are `/tmp/deep-{role}-{tab}-{390,1440}.png` for this local session.
- The initial orders fixture had the wrong response shape and was corrected to match the existing list contract before the successful populated run. The initial preview was missing stakeholder CSS; final checks include it.
- Production build and material import-isolation check passed. Existing large-bundle warning remains. SEO generated 30 localized snapshots and 54 sitemap URLs; dynamic pages were skipped because their fetch failed.
- Temporary preview entrypoints and fixture-session wiring were removed. Diff whitespace check passed.

 Browser harness uses actual role components with isolated session/data fixtures and production stakeholder styles, rather than live accounts. External write requests are intercepted; no real payment, publication, approval, redemption or client access changes are performed.

## Left alone

- Existing data contracts, approval/payment semantics, permissions and role-shell navigation remain in place.
- Product imagery and the public/consumer material system remain outside this pass.
- Shared demand copy was simplified because the role tabs all render `MarketOpportunityInbox`; response URLs preserve request context.
- Camera capture, live authorization, the full account shell, backend financial correctness, physical devices and all possible modal/transaction states are not covered by this UI verification.

## Verdict

Ready for review of the exercised deeper panels. Live account and transaction checks remain outside this fixture-based UI pass.
