# Growth Hub Overview

> Historical note: this document describes the original financial-product interpretation of Growth Hub. The canonical 2026 acquisition, activation, referral, outcome, retention, and experimentation model is defined in `docs/GROWTH_OPERATING_SYSTEM.md`.

_Last updated: 2025-10-29_

## Mission & Value Proposition
- Empower creators to finance growth through staking, community funding, and shield products.
- Reward performance with transparent, capped creator incentives (≤5% of Promorang revenue).
- Build trust via an auditable ledger aggregating all Growth Hub transactions.

## Pillars & User Segments
| Pillar | Primary User | Value | Key Metrics |
|--------|--------------|-------|-------------|
| Staking Liquidity | Supporters | Earn APY while supplying capital | TVL, average APY, retention |
| Project Funding | Creators & Supporters | Launch/pledge to initiatives with milestone tracking | Conversion %, pledge completion |
| Shield Protection | Creators | Mitigate downside risk via premiums | Active policies, claims ratio |
| Creator Rewards | Creators | Performance-tied monthly bonuses | View/share metrics, payout accuracy |
| Ledger Transparency | Ops, Compliance | Unified audit trail | Reconciliation time, discrepancy count |

## Domain Concepts
- **Gems**: In-app currency used for staking, pledges, premiums, and tips.
- **Channels**: Predefined staking opportunities with APY & duration rules.
- **Projects**: Creator-led funding campaigns, each with target amount and timeline.
- **Shield Policies**: Protection tiers with premium, coverage, and duration.
- **Rewards Cycle**: Monthly calculation based on verified performance metrics.
- **Ledger Entries**: Append-only record of all transactions (type, amount, entity IDs).

## Data Model Snapshot
```
Supabase Postgres
 ├─ staking_channels
 ├─ staking_positions
 ├─ staking_rewards
 ├─ funding_projects
 ├─ funding_pledges
 ├─ shield_policies
 ├─ shield_subscriptions
 ├─ creator_rewards
 ├─ creator_metrics
 └─ ledger_entries
```

## API Surface (Backend `/api/growth`)
| Endpoint | Purpose | Auth | Status |
|----------|---------|------|--------|
| GET `/staking/channels` | List active staking opportunities | Public | ✅ |
| GET `/staking/positions` | Fetch user staking positions | JWT | ✅ |
| POST `/staking/positions` | Create staking position | JWT | ✅ |
| POST `/staking/positions/:id/claim` | Claim staking rewards | JWT | ✅ |
| GET `/funding/projects` | List funding projects | Public | ✅ |
| POST `/funding/projects` | Create project | JWT | ✅ |
| POST `/funding/pledges` | Submit pledge | JWT | ✅ |
| GET `/shield/policies` | List shield policies | Public | ✅ |
| POST `/shield/subscriptions` | Subscribe to shield plan | JWT | ✅ |
| GET `/creator/rewards` | List creator rewards | JWT | ✅ |
| POST `/creator/rewards/calculate` | Trigger reward calculation | Admin JWT | 🚧 |
| GET `/ledger` | Filterable ledger entries | Admin JWT | 🚧 |

## Critical Business Rules
1. Creator rewards capped at ≤5% of Promorang monthly revenue.
2. Shield claims require active policy and verified incident report.
3. Staking claims unlocked only after duration-end + pending rewards.
4. Pledges reduce available balance immediately; refunds create ledger reversal entries.
5. All money-moving actions must record a ledger entry within the same transaction.

## Roadmap Highlights
- [ ] Automate reward calculation via Supabase functions.
- [ ] Add real-time notifications for staking/pledge updates.
- [ ] Publish public-facing API documentation for partners.
- [ ] Integrate analytics dashboards (creator + ops views).

## Related Documents
- `docs/architecture.md`
- `docs/backend/services.md`
- `docs/frontend/growth-hub-ui.md`
- `docs/operations/runbooks.md`
