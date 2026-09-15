# P0 Identity, Money, and Outcome Security Gate

**Status:** Implemented and locally verified; not deployed  
**Effective date:** 2026-09-14  
**Scope:** Identity, platform roles, balances, financial records, settlements, and verified outcomes

## Outcome

The highest-risk legacy tables now use explicit grants and row-level security. Anonymous access to private financial records is removed, signed-in members can read only records they own, and all financial mutations remain server-side operations.

The implementation is in `supabase/migrations/20260914193342_harden_p0_identity_money_and_outcomes.sql`. Authorization regression coverage is in `supabase/tests/p0_identity_money_rls_test.sql`.

## Protected surfaces

- identity and authorization: `users`, `user_roles`;
- account value: `transactions`, `gem_ledger_entries`, `growth_ledger`;
- creator and representative earnings: `creator_earnings_ledger`, `representatives`, `representative_commissions`;
- Pieces settlement: `piece_settlement_ledger`, `piece_escrow`, `piece_fee_reserves`;
- financial products: `staking_positions`, `shield_subscriptions`, `funding_pledges`;
- attribution and outcomes: `investor_content_shares`, `verified_actions`.

## Access contract

| Actor | Allowed | Not allowed |
|---|---|---|
| Signed-out visitor | Approved public profile fields and public-facing professional roles | Email, balances, KYC, ledgers, transactions, settlements, roles with platform authority |
| Signed-in member | Public profile fields, own financial/outcome records, approved self-selected non-privileged role | Another member's financial records; direct financial mutations; assigning Support, Reviewer, Operations, or Platform Owner authority |
| Trusted service | Required server reads and writes | Browser exposure of service credentials |

The `users` table uses both layers of protection: row policies govern eligible rows and column grants prevent public or member reads of email, balances, referral earnings, KYC state, and marketing fields. Public directory discovery remains available through the small approved field set.

## Verification evidence

- 22/22 pgTAP authorization assertions pass.
- All 16 P0 tables have row-level security enabled.
- Zero anonymous grants remain on private P0 financial/outcome tables.
- Zero authenticated mutation grants remain on those financial/outcome tables.
- Owner transaction isolation passes with two distinct users.
- Approved self-service role selection passes.
- Self-assignment of `master_admin` is rejected.
- Assignment of a role to another user is rejected.
- Database lint completes with zero errors; ten pre-existing function-quality warnings remain.
- The broader count of public tables without RLS fell from 109 to 93.
- Future public tables, sequences, and functions now fail closed until a migration explicitly grants the required Data API access.

## Product decisions preserved

- Creator and host discovery continues to work without exposing platform authority roles.
- A member can still choose a normal product role during signup.
- A member can still read their creator earnings and other owned records.
- Admin and financial writes continue through trusted backend/service paths.
- Piece fee reserves remain entirely service-only because they have no end-user owner.

## Remaining release work

This tranche materially reduces the highest-risk exposure but is not the complete database-security program. Before hosted release:

1. harden P1 operations, applications, organizations, campaigns, coupon activity, queues, and internal metrics;
2. review all exposed views, making them invoker-secure or narrowly granted;
3. replay the full current migration chain in a compatible staged Supabase stack;
4. run anonymous, member, Support, Reviewer, Operations Manager, and Platform Owner API/browser journeys;
5. test service-role jobs and payment/provider webhooks after client grants are removed;
6. verify session revocation and temporary admin-access expiry;
7. obtain Product and Security approval for intentionally public data.

## Platform compatibility note

Supabase is moving public-schema Data API exposure to explicit opt-in. New migrations must keep grants, RLS enablement, policies, and tests together. This migration follows that contract so behavior does not depend on project-age defaults.
