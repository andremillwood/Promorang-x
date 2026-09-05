# PromoCard readiness — September 5, 2026

PromoCard should turn distributed benefits into verified use and repeat participation. This change makes the existing offer-based path honest and actionable. It does not introduce a payment processor, issue promotional money, or establish an ambassador payout program.

## Implemented in this change

- Remove browser-local split-tender checkout, merchant margin pools, cash top-ups, group unlocks and bulk-pass purchase simulations. Existing commerce payment/reservation paths remain.
- Remove blanket PromoCard acceptance badges from commerce and discovery listings.
- Replace the amount-based gift-link generator with the existing Give flow. Old `/claim-drop?amount=...` links explain that they do not identify an issued benefit; they cannot credit an account.
- Stop announcing a $15 recharge when a Moment is published.
- Present actual offers on the card and member home, with issuer name where available, conditions, expiry, readiness and history. No placeholder balance or QR icon is presented as a spendable credential.
- Separate claimed code-based benefits from unclaimed issuances, pending fulfillment and expired/used benefits. Only a claimed, unexpired code-based benefit can show its credential. Claiming an issuance refreshes the card.
- Propagate card-ledger read errors instead of silently presenting an empty account. Refresh card data every 15 seconds while the page is active.
- Keep linked community claims from appearing a second time when their issuance is already used or absent from active results.
- Scope offer-wallet caches to the signed-in user and normalize the offer API base URL. Offer mutations refresh card, home and activity queries.
- Replace activity-derived “Earned” tiles with verified redemption counts. Preserve attributed offer value by its recorded unit; do not add currencies or infer earnings from face value. Remove double counting of redeemed community claims in inventory outcomes.

## Existing pilot path

1. Supplier creates an offer through Put inventory up or Offer Studio, with fulfillment terms and a quantity.
2. Contributor uses an available offer in Give and shares the server-created `/drop/:slug` link.
3. Member signs in, claims through the atomic community-drop endpoint and receives the issuance on PromoCard.
4. Issuing business validates the redemption code using Offer Studio's existing redemption endpoint.
5. Card moves the benefit to history on refresh. Activity retains the contributor/drop/scene attribution where recorded, without labeling the offer's value as commission.
6. Member follows “Find your next benefit” or their community from the card.

A live pilot must confirm the entire sequence with separate supplier, contributor and member accounts. A source-code test does not establish that merchants honor inventory or that production migrations and deployments match the repository.

## Verification performed

- `node --test backend/__tests__/promoCardTrust.test.js`: 20 passing regression tests covering credential visibility, expiry, pending fulfillment, missing offer records, failed ledger reads, duplicate claim display and activity/earnings separation.
- 144 combinations of status, fulfillment type and expiry compared between the actual server projection and TypeScript client rules using Node's type stripping; all agreed.
- Shared contributor outcome projection checked with the same local TypeScript execution.
- Backend JavaScript syntax and Git whitespace checks passed.
- Frontend regression cases added in `apps/web/src/lib/promocard/benefits.test.ts` for the regular Vitest suite.
- Dependency installation was blocked before network approval completed. Full web build, full test suites, typecheck and browser verification were not executed in this environment.

## Reconcile before release

PR #56 (fulfillment journeys) and PR #57 (web/native presentation) were open drafts at assessment time. This branch targets current main and deliberately does not merge either draft. They overlap `MyPromoCard`, `DigitalPromoCard`, offer hooks, and the card service. Rebase and reconcile behavior rather than choosing one side of conflicts wholesale.

Preserve these boundaries during integration:

- #56's real issuance pass, QR scanner, shipping and manual confirmation can replace the corresponding pending sections once integrated and verified.
- Automatic value delivery in #56 must have a recoverable failure path: a failed Gems credit must not leave the customer with only a redeemed receipt. This change does not modify that draft's implementation.
- #57's shared web/native design must use real offer credentials and eligibility. A QR icon or placeholder serial is not a redemption pass.
- Do not restore static recharge amounts, simulated successful payments, arbitrary gifted balances, or “earned” totals based on attributed offer value.
- Do not display promotional money as universally spendable until issuer backing, merchant eligibility, currency, debits, reversals and reconciliation are implemented and verified.

## Commercial and operational gates

Use an existing event relationship and a small set of explicitly participating suppliers. Record who supplies each benefit, what staff validate, inventory, expiry, and the action that counts as redemption. Benefits funded through discounts and benefits funded through cash require different accounting; no common cash value should be invented.

Before promising compensation, define contributor eligibility, the qualifying event, commission, who pays, reversals and payout timing. The activity view is not a payable ledger.

Measure first redemption, second use, referred members who redeem, actual merchant outcomes and separately recorded contributor rewards. These measures require live pilot records; this change neither fabricates a dashboard nor claims market validation.
