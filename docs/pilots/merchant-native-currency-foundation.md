# Merchant-native settlement and global display currency

Status: **development only** on the Munchies branch. No checkout, database, FX feed, or UI integration is claimed.

## Invariants
- Merchant catalog prices, order value, tax, refunds, and partner commission remain denominated in the merchant's supported settlement currency.
- Customers may view approximate prices in another ISO 4217 currency using a server-provided, timestamped, source-attributed rate.
- A display conversion never changes a payment amount or implies the payment processor can charge/settle in the display currency.
- Checkout must independently validate merchant currency and payment-provider capability. Never infer payment support from a currency formatter.
- Rate provider must be connected server-side, with freshness limits, caching, fallback/error handling, and an explicit no-quote state. Do not silently use a fabricated or stale rate.
- Avoid double conversion: use original merchant amount as the source for every display quote.
- For future cross-currency payment, preserve actual provider charge currency, provider FX rate, fee, settlement amount, refund rate and source in immutable transaction records.

## Current code
`backend/services/currencyDisplay.js` is a pure display-quote primitive. It accepts a trusted FX rate and its provenance; it does not fetch rates, call a provider, change checkout, or write balances. The numerical FX rate in the test suite is a **synthetic fixture**, not a live rate.

## Release gates
1. Select and integrate a licensed/reliable rate source, establish update frequency and allowed stale interval.
2. Add a shared user currency preference and localize price formatting.
3. Confirm merchant-native currency support in each checkout and provider; current PromoCard checkout still restricts to USD.
4. Test JMD direct and online order flows with real merchant and payment provider configuration.
5. Verify displayed approximate totals, original charge currency, refunds, and commission accounting end-to-end.
6. Run automated tests and review the branch before merge/deployment.
