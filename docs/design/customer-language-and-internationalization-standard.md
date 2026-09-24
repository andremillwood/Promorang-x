# Customer language and internationalization standard

This is the product-wide writing contract for public and participant-facing PROMORANG experiences.

## The five-question clarity test

Every screen must let a first-time visitor answer these questions without knowing PROMORANG vocabulary:

1. What is this?
2. What can I do here?
3. What happens after I act?
4. What do I get, if anything?
5. What is not guaranteed?

If a five-year-old could not point to the main action and describe what happens next in simple words, the screen is not ready.

## The core story

Use this causal sequence consistently:

1. Say what you want.
2. Other people can agree.
3. Shared demand becomes visible.
4. A business, host, creator, venue or brand may respond.
5. PromoCard keeps the person connected to what happens next.

A vote records demand. It is not a discount, reservation, reward or promise that supply will appear. State that distinction wherever a user could reasonably confuse interest with an outcome.

## Customer language rules

- Lead with the customer outcome, then explain the mechanism.
- Prefer familiar verbs: ask, choose, join, share, open, save, use and return.
- Introduce a branded term only when the object is visible and immediately explained.
- Use Want for a visible request shared by people. Use Moment for an experience a person can join. Use Offer for something with explicit terms and availability. Use PromoCard for the place that keeps a person's Wants, access and participation connected.
- Do not use internal system terms such as signal, inventory, lifecycle, activation, fulfillment or operator unless the audience is a business user and the term is explained.
- Do not promise money, savings, access, turnout or business performance unless the specific offer and its terms support that promise.
- Avoid idioms, wordplay and culture-specific metaphors in functional instructions.
- Do not use em dashes. Use a full stop, comma, colon or parentheses.
- One primary action per decision area. Labels must describe the action, not the interface.

## Internationalization rules

PROMORANG currently supports English, Latin American Spanish and Brazilian Portuguese.

- All new customer-facing strings must use the shared translation catalog. Do not place new English sentences directly in components.
- Translate meaning, not word order. Spanish and Portuguese should sound natural to a local customer.
- Keep variables independent of grammar where possible. Prefer `See what {{market}} wants` over splitting a sentence around a styled market name.
- Use the locale formatters for numbers, dates and times. Never hard-code the `en` locale.
- Provide complete singular and plural messages when count changes the grammar. The current catalog does not provide ICU plural rules, so select explicit singular and plural keys in code.
- Keep calls to action short enough for narrow mobile screens. A useful target is 32 characters or fewer.
- Do not rely on capitalization for meaning. Spanish and Portuguese generally use less title case than English.
- Allow text to wrap and containers to grow. Never fix a control height around English copy.
- Treat user-provided names, places and listing copy as content. Do not machine-translate them silently.
- Preserve PROMORANG and PromoCard as brand names. Translate explanatory text around them.
- Accessible names, share text, errors, empty states and loading messages require translation too.

## Review checklist

Before release, check each supported locale at mobile and desktop widths:

- The main promise and action are visible without scrolling.
- PromoCard is present when the page promises a return loop.
- Buttons do not truncate or overlap.
- Numbers, dates and times follow the selected locale.
- Empty, loading, error and post-action states explain what happens next.
- Share text makes sense outside the page where it was created.
- No action implies a guaranteed outcome unless the terms make it guaranteed.
- The same concept uses the same customer term across navigation, page copy and receipts.

## Migration order

Apply this standard in this order:

1. Homepage, navigation and sign-in continuity.
2. Wants, voting, sharing and the post-vote receipt.
3. PromoCard and its states.
4. Moments and Offers, including availability and terms.
5. Participant home, search and discovery.
6. Merchant, host, creator and brand entry pages.
7. Operational workspaces and admin surfaces.

The migration is complete only when hard-coded customer copy is removed from a surface, all supported locales have matching keys, and the translated layout has been checked.
