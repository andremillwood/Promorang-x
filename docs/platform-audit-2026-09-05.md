# PROMORANG platform audit — September 5, 2026

This audit expands PR #52 from an entry-point cleanup into a cross-platform review. It covers the active web and mobile applications, backend authentication and transaction boundaries, shared rules, SDK/MCP packages, deployment configuration, and legacy-code reachability. A separate owner-facing report records read-only live database findings and the prioritized remediation plan.

## First-principles test

PROMORANG must let a person discover a real benefit, claim or participate, use it successfully, and leave attributable evidence that helps a merchant or host justify repeating the offer. Contributors must be able to distribute that value without becoming platform administrators. Features that do not help that loop need evidence of use before additional investment.

## Changes in this PR

- Delete 60 disconnected frontend modules after tracing static imports from the application entry point and tests, then verifying that no retained source imports the deletion set. These are mostly obsolete radar UI copies, plus unused node barrels and a malformed modal. Keep the radar components used by Discover, OpportunityRadar and MomentDetail.
- Delete the ineffective landing-preference hook and label. Navigation remains direct.
- Remove redundant home counters and empty opportunities; put member PromoCard/discovery before contributor tooling.
- Remove six post-login count queries and forced first-action/profile redirects. Preserve requested destinations, admin routing, onboarding and brand onboarding. Completed onboarding goes to the dashboard.
- Remove the duplicate homepage receipt/role simulation section and hard-coded live pulse badge. The dedicated Value Studio remains available.
- Delete the hard-coded savings page and mock PulseFeed. Preserve URLs as redirects to the existing Value Studio and live feed. Remove savings links from the footer.
- Delete the shared middleware's unverified demo identity bypass and local-token fallback. Required and optional auth now verify with Supabase. Privileged roles come from `user_roles`, not editable profile/token metadata. Nonprivileged account categories remain usable for workflow context.
- Delete the mounted demo-token route and request-body/header debug dump.
- Delete failed-offer creation and issuance fallbacks that published incomplete inventory or recorded claims despite issuance failure.
- Restrict direct offer claims to the selected offer instead of all offers sharing a trigger.
- Verify Stripe webhooks against the preserved original payload; await processing and return a retryable error on failure.
- Correct the SDK test command that previously ran zero tests. Include the existing Node developer-API suite in the backend test command.

## What remains deliberately intact

The canonical wallet, payment fulfillment, merchant settlement, participation/proof records, referral attribution, core offers, operational studio tools, shared domain rules, mobile application, and dedicated simulations remain. They have actual consumers or meaningful domain responsibilities. The three large legacy application trees are retained pending dependency isolation; deleting archives is not a substitute for establishing that active deployments do not depend on their packages.

## Validation and limitations

- Production web build: passed after deletions.
- Web tests: 31 passed.
- Backend Jest tests: 116 passed; 4 existing TODO tests. Developer API Node tests: 2 passed.
- Shared rules: 56 passed during the audit; shared code was not modified.
- SDK tests: 3 passed; SDK and MCP TypeScript builds passed.
- Native TypeScript check passed. Release configuration fails for missing Expo owner/project identity; native exports and store submission were not attempted.
- Full web TypeScript checking remains failing. Removing the initial syntax blocker exposed 558 diagnostics in the intermediate check; this is not a final post-change count.
- Lint remains failing with 8 errors and 81 warnings. These are tracked as existing issues, not suppressed.
- Live browser inspection covered the public homepage and its merchant discovery link, not an authenticated purchase/redemption.
- Production migration `contain_public_financial_access` was applied after the audit: RLS is now enabled on `payments`, `payment_events`, and `subscriptions`; anonymous user-table access and authenticated financial writes were removed. No customer data, payments, messages, or application deployments were changed.

Build success is not production certification. Atomic claim/redemption functions and the missing offer/drop schema remain staged pending a migration rehearsal. The owner report identifies the remaining schema, transaction, redemption, and operational evidence prerequisites before launch.

## Release review

Review authentication/role compatibility, execute the database remediation plan in staging, verify a real claim-to-redemption path, replay payment events safely, and then deploy backend and web in the required order. Synthetic demo tokens intentionally stop working against protected APIs. Administrative accounts must have authoritative `user_roles` records.
