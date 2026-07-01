# PromoShare Pools, Entries, Draws, and Leaderboards

Last updated: 2026-06-17

## Product Principle

PromoShare should make verified participation feel valuable without turning Promorang into an open-ended payout liability.

The operating rule is:

`stakeholder chooses outcome -> Promorang generates safe pool rules -> users complete verified actions -> entries match eligible pools -> random draws and leaderboard rewards settle from capped value`

## Core Concepts

### Pools

A pool is a governed reward or progression context. A pool may be funded or status-only.

Common pool scopes:

- `platform`: Promorang-funded boost pool for cold start or strategic activation.
- `sponsor`: brand, merchant, partner, or advertiser-funded pool.
- `moment`: pool attached to one Moment.
- `campaign`: pool attached to a campaign or PromoPush activation.
- `venue`: pool attached to a place or group of places.
- `creator`: pool attached to creator-led missions.
- `referral`: pool attached to verified referral actions.

### Entries / Tickets

Use "entry" in backend and governance language. Use "ticket" in participant-facing copy when a draw exists.

An entry should always have:

- user
- pool/cycle
- source action
- source record
- proof status
- entry count
- weight value
- earned time
- eligibility expiry
- rule snapshot

Entries are not prizes. They are receipts that can participate in eligible draw cycles.

### Draw Cycles

Draw cycles are time windows inside a pool.

- Daily: entries earned that day.
- Weekly: entries earned during that week.
- Grand: entries earned during the campaign or pool period.

One verified action may create an entry that is eligible across multiple cycle windows if the pool rules allow it. The user-facing explanation is:

> You earned one ticket. It counts for today's draw, this week's draw, and the grand draw.

### Leaderboards

Leaderboards are separate from random draws.

- Entries/tickets improve odds in random draws.
- Points/weight determine leaderboard rank.
- Leaderboard prizes are performance-based, not random.

Default rule: a user can win one random draw and one leaderboard prize only when the pool explicitly allows both.

## Winner Rules

Default draw policy:

- Winner selection is random among eligible entries.
- More entries improve odds.
- One user can win once per draw cycle.
- If a user wins with one entry, their other entries stop competing in that same draw.
- Those entries may still count in other eligible cycles, such as weekly or grand.

This keeps casual participants hopeful while rewarding stronger activity.

## Funding Rules

Reward-bearing pools require committed value before launch.

Reward-bearing examples:

- Gems
- cash-equivalent prizes
- products
- coupons
- merchant perks
- VIP access
- sponsored rewards

Always-on progression may run without a funded pool:

- Points
- Keys
- Marks
- badges
- streaks
- leaderboard rank
- access eligibility

Gems must come only from funded pools, revenue-backed allocations, or explicitly approved platform budgets.

## Sponsor Rule Builder

Sponsors should not configure raw rules. They answer simple questions:

- What do you want people to do?
- Where and when should it happen?
- Who is eligible?
- What reward or perk is committed?
- How many winners or claims can you support?
- Should content, referrals, or repeat visits improve chances?

Promorang generates:

- eligible actions
- eligible moments, venues, campaigns, or creators
- proof requirements
- entry weights
- entry caps
- daily/weekly/grand cycle eligibility
- winner caps
- fraud controls
- reward liability cap

## Fraud Controls

Every pool should define:

- max entries per user per day
- max entries per user per cycle
- duplicate source blocking
- check-in cooldown
- proof requirement
- referral verification
- content approval requirement
- manual review threshold

High-risk entries can still be recorded as receipts, but should not become reward-eligible until verified.

## Audit Requirements

Every executed draw should record:

- draw/cycle ID
- selection method
- eligible entry count
- eligible user count
- requested winners
- selected winners
- one-win-per-user setting
- excluded users
- selected users
- selected entries when available
- rules snapshot
- actor/system executor
- timestamp

This is required for user trust, partner reporting, and dispute handling.

## Marketing Translation

Participant copy:

> Every verified action can earn entries into matching PromoShare pools. More entries improve your chances. Daily, weekly, and grand draws are random among eligible entries. Leaderboards reward top contributors separately.

Sponsor copy:

> You choose the outcome and committed reward. Promorang turns it into capped, proof-backed entries, draws, and reporting.

Operator copy:

> PromoShare lets you use platform-funded boosts sparingly while pushing most reward value into sponsor, merchant, creator, and campaign-backed pools.
