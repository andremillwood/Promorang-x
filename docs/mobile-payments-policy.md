# Mobile payments policy

Status: launch policy for the first iOS and Android submission.

This is a product implementation policy, not legal advice. Store rules and regional entitlements must be rechecked immediately before submission.

## Release classification

| Item | Classification | Version 1 mobile behavior |
| --- | --- | --- |
| Physical merchant goods | Physical good | Stripe/card checkout is allowed; fulfillment and refund terms must be shown. |
| In-person services and real-world event access | Real-world service | Stripe/card checkout is allowed when the listing clearly identifies the venue, time, or offline fulfillment. |
| Digital products or digital-only access | Digital content/functionality | Do not expose Stripe, hosted checkout, or Gem redemption in the native app. Add StoreKit/Play Billing before enabling. |
| Gems earned through verified participation | Earned value | May be displayed and used only for eligible real-world goods/services or non-purchased rewards. |
| Purchased Gems | In-app virtual currency | Do not sell or link to an external Gem purchase flow in version 1. Native sale requires StoreKit and Play Billing. |
| Pieces | Earned participation/ownership record | Display and consumption only. No native purchase or cash-out promise. |
| Funded participation and sponsor pools | Business funding workflow that creates platform value | Creation, review, and reporting may remain available; payment/funding must not be initiated or linked from the consumer native build until store counsel confirms treatment or native billing is implemented. |
| Membership or premium digital features | Digital functionality | Use StoreKit/Play Billing before exposing purchase in the native app. Existing web memberships are not linked from the native app. |

## Catalog enforcement

Every commerce listing offered in mobile must carry an authoritative type (`physical`, `service`, or `digital`) and a fulfillment mode. Missing or ambiguous classification is treated as digital and is not purchasable in the native app.

Release QA must prove:

- Digital listings have no card, Stripe, hosted-web, or Gem purchase action.
- Physical/service listings show what is delivered, where/how it is fulfilled, price, cancellation/refund terms, and a receipt.
- Gems have no “buy,” “top up,” external purchase link, or misleading cash-equivalent claim.
- Sponsor funding and paid digital access have no native external-purchase link.
- Server endpoints reject a disallowed native purchase even if a client is modified.

## Required follow-up

Client-side hiding is not a security boundary. Before submission, add or confirm server-side validation of listing type and fulfillment mode for every payment and Gem-redemption endpoint. Any later decision to sell digital items must ship with Apple/Google billing and server-side receipt verification.

