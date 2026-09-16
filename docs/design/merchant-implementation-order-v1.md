# Merchant Overhaul — Implementation Order

## Ship first

1. Merchant role redirect -> Merchant Home
2. Merchant primary navigation simplification
3. Merchant Home outcome chooser + results + live promotions
4. Outcome-first Promotion Builder using existing offer hooks
5. Promotions list/detail

## Ship second

6. Customers
7. Sales & Results
8. Business consolidation
9. Legacy route redirects / deprecation banners

## Do not block v1 on

- redesigning the entire public storefront
- replacing the offer data model
- rebuilding QR verification
- changing PromoCard internals
- changing the reward economy
- creating new analytics infrastructure if existing data can support basic result cards

## Engineering rule

Prefer adapters and presentation-layer simplification over new domain primitives.

The current engine already supports enough low-level concepts. The merchant overhaul should reduce the number of concepts exposed, not create another competing layer of persisted objects.
