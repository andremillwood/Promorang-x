# Admin and Public-Schema Security Remediation Backlog

**Status:** Required before hosted migration  
**Effective date:** 2026-09-14  
**Owner:** Security and Platform Engineering, with Product approval for intended public access

## Release decision

Do not deploy the repaired migration chain to a hosted environment yet.

The admin capability foundation passed its clean-database checks, but a catalog review of the complete historical schema found:

- 109 `public` tables without row-level security;
- 31 `public` views without `security_invoker`;
- zero admin capability tables without row-level security;
- zero direct `authenticated` grants on admin capability tables;
- zero public execute grants on admin capability functions.

Absence of row-level security is not proof of an exploit by itself: effective exposure also depends on grants, API schema settings, functions, and view ownership. It is nevertheless a release blocker because intended access has not been proven for each object.

## Remediation order

### P0 — Identity, money, roles, and irreversible outcomes

Review first and fail closed. This group includes `users`, `user_roles`, `transactions`, `gem_ledger_entries`, `growth_ledger`, `creator_earnings_ledger`, `representative_commissions`, `piece_settlement_ledger`, `piece_escrow`, `piece_fee_reserves`, `staking_positions`, `shield_subscriptions`, `funding_pledges`, `investor_content_shares`, and tables that record verified actions or account restrictions.

Required evidence for every object:

1. named data owner and documented audience;
2. explicit table grants;
3. row-level security enabled and forced where appropriate;
4. deny-by-default policies with owner, organization, or named capability scope;
5. service-role path tested separately from user access;
6. anonymous, ordinary member, support, reviewer, operations, and owner tests;
7. mutation audit evidence and rollback procedure.

### P1 — Private operations, applications, and commercial data

Review next: applications, organization membership, brand and advertiser records, campaigns, sponsorship requests, host operations, coupon assignments/redemptions, notification queues, internal metrics, sampling operations, and imported venue batches.

The default should be no anonymous access. Reads and writes must be limited to the owning organization, assigned operator, or a specific platform capability. Aggregated reporting should use narrowly scoped views or functions instead of broad table reads.

### P2 — Community and marketplace records

Review actions, discoveries, votes, content, categories, event series, scene membership, watchlists, referrals, and marketplace records. Separate genuinely public discovery fields from private creator, participant, moderation, and attribution fields. Public directories should expose an explicit column allowlist.

### P3 — Intended public reference data

Reference catalogs and public discovery surfaces may remain broadly readable only after Product confirms the audience and Security verifies that no private columns or joins leak through. Use explicit `anon`/`authenticated` `SELECT` grants plus read-only policies; never treat placement in the `public` schema as the access decision.

## View hardening

The 31 views requiring review include public directories, review queues, reconciliation summaries, economy statistics, profile-completion summaries, and operational scorecards.

For each view:

- set `security_invoker = true` when caller policies should apply;
- otherwise replace it with a narrowly granted function or move it to a non-exposed schema;
- revoke implicit access, then grant only the intended roles;
- test that underlying private columns cannot be inferred through filters, joins, or aggregates.

Review queues and reconciliation/operational views are P0/P1 even when the view name does not contain personal data.

## Delivery slices

| Slice | Scope | Exit evidence |
|---|---|---|
| 1 | P0 identity, roles, ledgers, settlements, and verified outcomes | Zero unintended anonymous/member reads or writes; privileged paths pass capability matrix |
| 2 | P1 operations, applications, organizations, campaigns, and queues | Organization isolation and admin responsibility tests pass |
| 3 | All 31 views | Every view is invoker-secure, moved out of the exposed schema, or explicitly justified and narrowly granted |
| 4 | P2/P3 community and public data | Public field allowlists approved; private/member boundaries tested |
| 5 | Full staged rehearsal | Fresh restore, migration, advisors, API tests, browser journeys, monitoring, and rollback drill pass |

## Required release gate

A staged deployment may proceed only when:

- no P0 or P1 object lacks an approved access contract;
- database advisors and lint have no security errors;
- the anonymous/member/admin matrix tests both reads and mutations;
- Support, Reviewer, Operations Manager, and Platform Owner complete representative browser journeys;
- final-owner protection, temporary-access expiry, session revocation, and audit visibility pass;
- Security and Product sign off on every intentionally public surface;
- rollback and incident owners are named.

## Non-security follow-ups observed during verification

- Remove the duplicate `/discover` navigation key warning on the public homepage.
- Reduce the oversized primary production bundle through additional route or feature splitting.
- Refresh Browserslist data in routine dependency maintenance.
- Re-run dynamic public SEO generation in an environment with its required data service available.
