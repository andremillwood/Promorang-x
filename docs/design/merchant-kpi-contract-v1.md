# Merchant KPI Contract v1

Merchant Home primary KPIs should be defined semantically before wiring data:

- `customers_brought_in`: unique customers with a verified merchant-attributed redemption/visit in the selected period.
- `attributed_sales`: merchant sales value attributable to verified Promorang promotion activity where transaction value is available.
- `returning_customers`: unique customers with more than one verified merchant interaction in the selected period or a verified return after a prior interaction.
- `active_promotions`: merchant-owned promotions currently in active state and within their availability window.

Do not substitute scan counts, claims, Gems issued, or raw offer issuances under these labels.

When source data is unavailable, render an explicit unavailable/empty state rather than fabricated values.
