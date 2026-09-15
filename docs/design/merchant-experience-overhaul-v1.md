# Merchant Experience Overhaul v1

## Objective

Rebuild the merchant-facing Promorang experience around merchant business outcomes rather than Promorang's internal product vocabulary.

The merchant should not need to understand Actions, Offers, Perks, Moments, PromoShare, Gems, funding sources, trigger events, proof requirements, or fulfillment modes in order to get value from the platform.

The operating question is: **What business outcome does the merchant want, and what is the shortest path to launching it and seeing proof?**

## Product rule

A merchant who has never heard the words Gem, PromoShare, Moment, Mission, Activation, or Offer should be able to sign up and launch a first promotion without explanation.

Promorang remains sophisticated underneath. The merchant interface becomes simple above it.

## Merchant information architecture

Primary merchant navigation:

1. **Home**
   - Business health summary
   - Recommended next action
   - Active promotions
   - Recent customer activity
   - Merchant onboarding/status

2. **Promotions**
   - All active, scheduled, draft, completed promotions
   - Create promotion
   - Promotion performance
   - Distribution/share tools
   - Redemption/verification settings hidden behind sensible defaults

3. **Customers**
   - New customers
   - Returning customers
   - Repeat rate
   - Customer activity timeline
   - Audience export/engagement surfaces where permitted

4. **Sales & Results**
   - Attributed sales
   - Redemptions
   - Conversion
   - Cost/value issued
   - Promotion-level ROI

5. **Business**
   - Business profile/storefront
   - Locations
   - Products/services
   - Staff access/scanner
   - Settings

Orders may become a sixth primary surface only if native commerce volume justifies it.

## Merchant Home

Merchant Home should answer four questions immediately:

- What is happening?
- Is Promorang producing business value?
- What should I do next?
- What promotions are currently live?

Suggested top-level structure:

### Business header

Merchant name, current location/business context, public storefront link, account state.

### Outcome chooser

Heading: **What would you like to do?**

Four default actions:

- Get more customers
- Bring customers back
- Promote something
- Fill a slow period

Secondary options can include:

- Get more bookings
- Increase spending
- Get reviews/content
- Reward existing customers

These selections open the Promotion Builder with an appropriate template and defaults.

### Results strip

Use business language only:

- Customers brought in
- Attributed sales
- Returning customers
- Active promotions

Avoid Gems, Points, scans, keys, PromoShare or internal mechanism labels here.

### Recommended next move

One primary recommendation derived from merchant state. Examples:

- Launch your first promotion
- Your Wednesday afternoon is underperforming. Create a slow-period offer.
- 38 customers visited in the last 30 days; create a return offer for them.
- Your current promotion ends tomorrow; extend or duplicate it.

### Live promotions

Show title, customer-facing value, schedule, redemptions, attributed sales and status.

## Promotion Builder

Do not begin with channel, trigger, fulfillment or funding source.

### Step 1 — Goal

Ask: **What are you trying to achieve?**

Options:

- Bring people into my business
- Sell a specific item
- Get customers to return
- Get more bookings
- Increase spending
- Get reviews or customer content
- Reward existing customers

### Step 2 — Timing

Ask only if relevant:

- When do you want this to happen?
- Always available / date range / days & hours

### Step 3 — Customer value

Ask:

- What will customers get?

Common presets:

- Percentage off
- Fixed amount off
- Free item
- Buy X get Y
- Complimentary upgrade
- Bonus/reward
- Custom offer

### Step 4 — Capacity / limit

Ask:

- How many customers can use this?

### Step 5 — Review

Render a customer-facing preview and an operational explanation in plain language.

Example:

> 20% off lunch  
> Tuesday–Thursday · 2–5 PM  
> Limited to 50 customers
>
> Customers show this promotion at your business. Your staff scans their PromoCard to confirm the visit.

Primary CTA: **Publish promotion**

### Advanced settings

Advanced settings can expose:

- Verification method
- Fulfillment behavior
- Distribution channel
- Funding source
- Liability controls
- PromoShare participation

They should be collapsed by default and never required for the common merchant path.

## Internal mapping

The builder translates merchant intent into existing offer infrastructure.

Example: `Fill a slow period` + in-store discount can map to:

```text
channel = moment
trigger_event = checkin
funding_source = merchant_inventory
proof_required = qr_gps
fulfillment_type = merchant_validation
availability = local
surface = place
```

A merchant should not need to select these fields manually in the standard flow.

## Vocabulary policy

### Preferred merchant language

Use:

- Promotion
- Customer
- Visit
- Sale
- Redemption
- Return visit
- Offer value
- Staff scan
- Results
- Business
- Storefront

### Internal or advanced-only language

Hide from normal merchant paths:

- Action
- Activation
- Moment
- Mission
- PromoShare allocation
- Trigger event
- Funding source
- Proof required
- Fulfillment type
- Max liability

### Branded concepts

PromoCard may remain visible because it is a customer-facing object, but explain it by function: **customer pass / identity used to claim and verify promotions**.

Gems, Points and Keys should appear only where they are actually relevant to a merchant's promotion economics or loyalty strategy, not as default dashboard metrics.

## Existing surface treatment

### MerchantActionStudio

Deprecate as a merchant-facing primary destination.

Its useful mechanics should move into Promotion Builder and staff verification flows.

### MerchantCouponHub

Replace as a standalone concept.

Its ROI/performance elements belong in Sales & Results. Its `PostPerkModal` launch behavior should become one Promotion Builder entry point.

### OfferStudio

Keep the existing offer engine and advanced controls, but move standard merchant creation to a guided outcome-first layer. OfferStudio can remain an expert/admin/advanced mode.

### MerchantStorefront

Preserve and improve. It already presents business-facing customer content rather than internal mechanics.

## Migration strategy

1. Add new merchant Home and merchant navigation.
2. Add outcome-first Promotion Builder that maps to existing offer creation hooks.
3. Redirect merchant entry points from Action Studio/Coupon Hub/Offer Studio to the new merchant surfaces.
4. Keep old surfaces accessible to admin/advanced users during migration.
5. Move ROI/reporting into Sales & Results.
6. Move storefront/location/staff setup into Business.
7. Instrument the merchant funnel.
8. Remove deprecated merchant routes only after equivalent functionality is covered.

## Success metrics

Primary activation funnel:

`merchant signup -> business configured -> promotion created -> promotion published -> first claim -> first verified redemption -> attributed sale -> second promotion`

Track:

- Time to first published promotion
- Merchant signup-to-publish conversion
- Promotion publish-to-first-claim rate
- Claim-to-redemption rate
- Time to first verified redemption
- Merchants with a second promotion within 30 days
- Repeat customer rate
- Attributed merchant sales

The target is not feature usage. The target is repeated merchant business outcomes.
