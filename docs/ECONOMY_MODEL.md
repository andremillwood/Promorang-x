# Promorang Economy Model

## Stakeholder value

- Participants earn **Points** for useful activity and reputation-building actions.
- Participants convert earned Points into scarce **PromoKeys**, which unlock funded opportunities.
- Creators and participants earn **Gems** from funded platform activity; Gems are not presented as guaranteed cash.
- **USD** records real payable earnings and winnings. Withdrawal eligibility remains subject to verification, fraud review, and payout rules.
- **Gold** is reserved for long-term status or collectible utility until a concrete sink is approved.
- Referrers receive 5% of eligible earnings in the currency earned. The referred user's reward is never reduced.
- Brands buy measurable participation and outcomes; their funding must be traceable to issued rewards.
- Merchants and hosts receive auditable conversion and settlement records.

## Canonical storage

`economy_wallets` is the sole current-balance authority.

`economy_transactions` is the immutable movement ledger. Every balance change requires:

- currency and signed amount;
- transaction type and source;
- a stable idempotency key;
- optional source record and metadata;
- the resulting balance.

Legacy `users.*_balance`, `user_balances`, `transaction_history`, and feature-specific ledgers remain compatibility/read models only. New code must not mutate them.

## Currency rules

| Currency | Purpose | Earn | Spend |
|---|---|---|---|
| Points | Engagement/reputation | Verified actions | Convert to PromoKeys, selected unlocks |
| PromoKeys | Scarce access | Point conversion, verified milestones | Enter funded drops/opportunities |
| Gems | Funded platform utility | Drops, quests, staking, referrals | Funding, boosts, platform purchases |
| USD | Payable value | Sales, approved earnings, winnings, referrals | Withdrawals/refunds |
| Gold | Long-term status | Explicit campaigns only | No general sink until product approval |

Default Point conversion is 500 Points → 1 PromoKey, capped at 3 PromoKeys daily.

## Daily Master Key and participant levels

The Master Key is a renewable daily contribution gate, not a lifetime achievement and not a Point purchase. Points create PromoKeys; verified free Proof contribution activates the Master Key. A participant needs both an active Master Key and the opportunity's required PromoKeys to enter gated funded work.

Canonical participant levels are Starter (1x Points, 5 daily verified free Proofs), Professional (1.5x, 2 Proofs), and Power User (2x, 1 Proof). Historical account labels resolve through the aliases defined in `PARTICIPANT_ECONOMY_AUTHORITY.md`.

`PARTICIPANT_ECONOMY_AUTHORITY.md` governs all overlapping participant-facing rules in this document.

## Growth Hub products

- Paid membership periods issue disclosed Gem allowances: Plus 5, Pro 15, Elite 30. Allowances are benefits, not returns.
- Subscription revenue continues to allocate disclosed percentages to PromoShare, liquidity, local impact, allowance reserves, and platform operations.
- Holding Gems alone earns no return.
- Funded reward programs must predeclare their reserve, reward rate, lock period, commitment limits, capacity, and dates. Enrollment cannot exceed the reward reserve.
- Creator Resilience is a capped assistance fund. Claims require evidence and review; it is not insurance and does not guarantee replacement income.
- Kickstart pledges are escrowed. Milestone proof must be approved before release; cancelled projects refund the unreleased proportion to backers.
- Piece-holder distributions remain tied to actual Piece-related revenue and are not a general Gem-holder entitlement.

## Pieces settlement

- Transactional Pieces surfaces default to suspended after migration. An administrator enables order-book trading, AMM swaps, and distributions separately after reconciliation.
- Sell listings remove Pieces from the holder and place them in escrow.
- Order execution atomically debits canonical Gems, releases escrowed Pieces, credits seller proceeds and creator royalty, captures platform/liquidity fees, and writes the trade.
- AMM swaps lock the pool, enforce minimum output, move canonical Gems and Piece positions, update reserves, and preserve the constant-product record in one transaction.
- Piece distributions credit canonical Gems exactly once per holder claim.
- Demo mode never reports a simulated trade or distribution as successful.
- `piece_supply_reconciliation` must return zero difference before a market is enabled.
- `piece_market_controls` is the operational circuit breaker for trading, AMM swaps, and distributions.

## Engagement reward policy

Organic engagement is rewarded once per user, action, and content target:

| Action | Points | Daily rewarded cap | PromoShare |
|---|---:|---:|---|
| View | 0.25 | 5 | No |
| Like | 1 | 20 | No |
| Save | 1 | 10 | No |
| Comment | 2 | 10 | Campaign-configured only |
| Attributed share | 3 | 10 | 1 entry |

Campaigns may override Point and PromoShare amounts. UGC, clipping, conversions, purchases, and verified proof are high-trust actions. They may receive funded Gems only when an active campaign has a Gems-denominated committed budget and an explicit `gems_by_action` rule. The allocation is locked and decremented atomically; unfunded engagement never mints Gems.

## Safety requirements

- Earn, spend, conversion, refund, and commission operations run in database transactions.
- Repeated requests return the original transaction instead of moving value twice.
- A debit cannot create a negative wallet.
- Client applications have read-only wallet and ledger access.
- Service-role database functions are the only general write path.
- `economy_reconciliation` must show zero difference after migration opening entries are recorded.

## Deployment

1. Back up production economy tables.
2. Apply `202607010002_canonical_economy.sql`.
3. Apply `202607010001_reliable_referral_earnings.sql`.
4. Verify wallet counts and inspect `economy_reconciliation`.
5. Smoke-test earn, spend, Point conversion, drop reward, PromoShare payout, and referral commission.
6. Deploy backend and web together.
7. Monitor failed RPC calls and non-zero reconciliation differences before enabling withdrawals.
