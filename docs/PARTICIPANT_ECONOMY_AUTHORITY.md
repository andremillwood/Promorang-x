# Participant Economy Authority

Status: canonical product contract  
Effective: 2026-07-14

This document is the authority for participant Points, PromoKeys, the daily Master Key, Gems, PromoShare Tickets, and subscription-level advantages. Conflicting legacy copy or code must resolve to this contract.

## Economic promise

Promorang rewards useful contribution without allowing users to extract funded value indefinitely without contributing.

`verified free contribution -> Points + eligible Tickets -> PromoKeys -> daily Master Key -> funded opportunities -> verified outcome -> Gems or committed reward`

## The five instruments

| Instrument | Sole primary job | Earned from | Used for |
|---|---|---|---|
| Points | Measure useful participation and progress | Verified organic and Proof activity, after tier multiplier | Convert to PromoKeys; rank and selected milestones |
| PromoKeys | Ration access to individual gated opportunities | 500 Points per Key, verified milestones, Community Draws, disclosed subscription allowances | Apply to or enter a specific gated opportunity |
| Master Key | Prove the user has completed today's required free contribution | Complete the subscription tier's daily verified Proof requirement | Permission to spend PromoKeys on funded or premium opportunities that day |
| Gems | Represent funded platform value | Successfully complete funded activity, win a funded allocation, or receive a disclosed allowance | Approved platform utility and eligible redemption flows |
| PromoShare Tickets | Create chances in a named draw | Actions matching that draw's published rules | Participate only in the draw shown on the ticket |

Points never purchase or activate the Master Key. Points convert to PromoKeys. The Master Key is activated only by verified free contribution.

Owning PromoKeys does not bypass the Master Key. The two locks answer different questions:

1. Master Key: has this person contributed enough today to enter the funded opportunity economy?
2. PromoKey: how many individual gated opportunities may this person pursue?

## Participant subscription levels

| Canonical level | Accepted legacy aliases | Point multiplier | Verified free Proofs required daily |
|---|---|---:|---:|
| Starter | free | 1x | 5 |
| Professional | premium, plus, pro | 1.5x | 2 |
| Power User | super, elite, power | 2x | 1 |

The daily Master Key lasts until the daily reset. Implementations may represent this as a maximum 24-hour expiry, but must not carry activation into a second platform day.

Upgrading provides two connected benefits: faster Point accumulation and less free work required to activate daily funded access. Every level still makes a verified contribution.

## Point and PromoKey rules

- Default conversion: 500 Points to 1 PromoKey.
- Maximum conversion: 3 PromoKeys per user per platform day.
- Conversion debits Points and credits PromoKeys atomically.
- PromoKeys may also be granted by verified milestones, Community Draws, or disclosed subscription benefits.
- A PromoKey is consumed only when the opportunity's published access rule requires one.
- A failed or reversed application follows the opportunity's disclosed refund rule.

## Master Key rules

- Progress resets daily using one declared platform timezone.
- Only completed, verified, unpaid Proof contributions count.
- Organic likes or views do not count unless packaged inside an approved free Proof mission.
- The API, not the client, resolves the user's tier and required count.
- Activation occurs automatically when verified completions meet the tier requirement; no Point charge or manual purchase is allowed.
- Funded opportunities check current Master Key status before consuming PromoKeys.
- Coupons, samples, discounts, products, Gem campaigns, and other committed-value opportunities may require the Master Key even when their PromoKey cost is zero.

## PromoShare rules

PromoShare has two participant-facing draw families:

### Funded Draws

Committed value exists before launch. Rewards may include Gems, cash-equivalent prizes, products, coupons, discounts, experiences, or VIP access.

### Community Draws

Rewards create progression rather than open-ended payout liability. Rewards may include Points, PromoKeys, boosts, badges, rank, status, or early access.

Every Ticket names its eligible draw. A Ticket is not Points, weight, or a guaranteed reward. More eligible Tickets improve a user's chance in a random draw. Leaderboard Points remain separate from random selection.

## Earning receipt

One verified contribution may legitimately advance several systems. The receipt must state each result separately:

- `+30 Points (20 base x 1.5 Professional multiplier)`
- `Master Key: 1 of 2 verified Proofs completed today`
- `+1 Ticket: Weekly Community Draw`
- `+1 Ticket: Sponsor Summer Draw`, when rules match

This is one action producing several transparent receipts, not one currency being silently transformed into another.

## Funding boundary

- Organic activity may create Points, Tickets for eligible pools, Master Key progress, and non-cash progression.
- Gems and other committed-value rewards require an identifiable funded pool, sponsor commitment, platform budget, or revenue-backed allocation.
- Subscription multipliers apply to Points unless a funded campaign explicitly publishes another eligible boost.
- A multiplier must never mint unfunded Gems.

## Required user-facing daily state

Every participant home, wallet, and opportunity surface should be able to show:

- canonical subscription level and Point multiplier;
- today's Master Key progress, requirement, status, and reset;
- Points balance and progress toward the next PromoKey;
- PromoKey balance;
- active Tickets grouped by draw;
- funded opportunities available after activation;
- recent receipts explaining base amount, multiplier, and eligibility.

## Implementation authority

- Backend tier authority: `backend/constants/pricing.js`.
- Shared client constants and alias resolution: `packages/shared/src/index.ts`.
- Economy ledger authority: `economy_wallets` and `economy_transactions`.
- PromoShare rules: `docs/promoshare-pools-and-draws.md`, subordinate to this document where participant instruments overlap.
- Daily Master Key persistence: `daily_master_key_progress` with idempotent source receipts in `master_key_proof_credits`.
- A Proof must carry `master_key_eligible: true`, `is_free_proof: true`, or `proof_economy: free_contribution` before verification can advance the daily Master Key.

No screen should hard-code tier multipliers, daily Proof requirements, Point conversion rates, or aliases independently.
