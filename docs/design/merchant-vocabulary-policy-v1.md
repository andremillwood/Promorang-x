# Merchant Vocabulary Policy v1

## Principle

Merchant-facing copy must describe business intent, customer behavior, and measurable outcomes. Internal Promorang object names should not be required to understand or operate the product.

## Default merchant terms

Use these terms in primary navigation, dashboards, onboarding, builders, empty states, and reporting:

- Promotion
- Customer
- Customer visit
- Sale
- Redemption
- Return visit
- Booking
- Offer value
- Staff scan
- Results
- Business
- Storefront
- Location
- Product / Service
- Active / Scheduled / Draft / Completed

## Terms that require translation

| Internal term | Merchant-facing translation |
| --- | --- |
| Action | Promotion activity / customer action |
| Activation | Promotion / campaign |
| Moment | Time/location promotion context |
| Mission | Customer task / promotion requirement |
| Offer | Promotion unless the offer object itself is being edited |
| Trigger event | When this promotion activates |
| Proof required | How the customer is verified |
| Fulfillment type | How the customer receives the value |
| Funding source | How this promotion is funded |
| Committed value | Maximum promotion budget/value |
| Max liability | Maximum value you could issue |
| PromoShare allocation | Advanced network distribution setting |

## Branded mechanics

### PromoCard

Allowed in merchant-facing UI when function is made explicit.

Preferred explanatory copy:

> PromoCard is the customer's Promorang pass. Staff can scan it to verify eligible visits and redemptions.

Avoid assuming merchants understand PromoCard before this explanation.

### Gems

Do not use Gems as a default merchant metric or require Gems in the standard promotion builder. Show them only when the merchant explicitly chooses a Gems-funded reward or loyalty mechanism.

### Points

Do not display Points by default on the merchant dashboard. Points may be shown in advanced loyalty settings or promotion detail when relevant.

### Keys

Do not make Keys a primary merchant concept. Translate into access, unlock, return offer, or eligibility where possible.

### PromoShare

Do not show PromoShare configuration in the standard merchant flow. Keep it in advanced distribution settings and explain its business function before its branded mechanics.

## CTA policy

Prefer verbs that match merchant intent:

- Create promotion
- Publish promotion
- Get more customers
- Bring customers back
- Promote a product
- Fill a slow period
- View results
- Share promotion
- Open staff scanner
- Edit business

Avoid as primary CTAs:

- Create Merchant Action
- Launch Activation
- Launch Zero-Risk Perk Drop
- Configure Trigger
- Create Moment
- Fund PromoShare Cycle

## Dashboard metric policy

Primary metrics must answer whether Promorang produced economic or customer value.

Priority order:

1. Attributed sales
2. Customers brought in
3. Returning customers
4. Redemptions
5. Conversion rate
6. Active promotions

Secondary/advanced metrics may include scans, issued value, Gems, Points, network distribution, and verification events.

## Copy test

Before shipping merchant-facing copy, ask:

1. Would a restaurant or retail operator understand this without a Promorang explanation?
2. Does it describe a business outcome or an internal mechanism?
3. Can the branded/internal term be hidden until it becomes necessary?
4. Does the CTA tell the merchant what happens next?

If the merchant must understand the product ontology before acting, rewrite the copy.
