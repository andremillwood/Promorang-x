# Gems Architecture Guide
## Using Gems as a Branded USD Ledger

This document explains the current Gems ledger model, including cash-redemption controls.

---

## The Problem Gems Solves

### Before Gems:
```
User pays $50 → Stripe → Buy Pieces
                    ↓
            [PROBLEM: This looks like securities trading]
            [Stripe will shut this down]
```

### With Gems:
```
User pays $50 → Stripe → Gets 50 Gems
                              ↓
                    [Gems are internal branded USD value]
                              ↓
               Trade 50 Gems → Get 10 Pieces
                    ↓
            [No Stripe involvement - just internal exchange]
```

**Current product rule:** `1 Gem = $1.00 USD`. Purchased Gems may be redeemed for cash only after a 30-day hold. Objective-based bonus Gems remain locked for cash redemption until the objective is completed.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                            │
│  • Sees Gems balance                                     │
│  • Sees Piece portfolio                                  │
│  • Trades Gems ↔ Pieces                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 GEMS LEDGER (Internal)                   │
│  Table: user_balances                                    │
│  • type: 'gems'                                          │
│  • balance: 500.00                                       │
│  • Completely free - just database rows                  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   DEPOSIT    │  │    TRADE     │  │  WITHDRAWAL  │
│              │  │              │  │              │
│ Buy Gems     │  │ Gems→Pieces  │  │ Sell Gems    │
│ $50 → 50G    │  │ (Internal)   │  │ (Cash out)   │
│              │  │              │  │              │
│ Uses Stripe  │  │ NO Stripe!   │  │ Uses Stripe  │
│ ✅ Safe      │  │ ✅ Safe      │  │ ✅ Safe      │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Cost Breakdown

### Wallet Infrastructure Costs:

| Approach | Monthly Cost | Complexity |
|----------|--------------|------------|
| **Internal Ledger (Gems)** | **$0** | Low |
| Custodial Crypto Wallet | $500-2000 | High |
| Self-Custody (MetaMask) | $0 | Medium |
| Coinbase Custody | $10K+ | Medium |

**Gems uses internal ledger = $0 cost, zero blockchain fees.**

---

## How It Works

### 1. Buying Gems (Fiat On-Ramp)

```javascript
// User clicks "Buy Gems"
POST /api/gems/purchase
{
  amount_usd: 50,
  payment_method: 'card'
}

// Server creates Stripe PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000, // $50.00 in cents
  currency: 'usd',
  metadata: { 
    user_id: userId,
    gems_amount: 50,  // 50 Gems at $1.00 each
    type: 'gems_purchase'  // NOT piece_trading!
  }
});

// Webhook on success:
// Credit 50 Gems to user's internal balance
await creditGemsBalance(userId, 50);
```

**Stripe sees:** Virtual currency purchase (like buying V-Bucks)  
**Stripe does NOT see:** Piece trading

### 2. Trading Gems for Pieces

```javascript
// User trades 50 Gems for Pieces
POST /api/pieces/pools/:id/swap
{
  type: 'gems_to_pieces',  // NOT currency!
  gems_amount: 50,
  min_pieces_out: 9.5
}

// Server:
// 1. Deduct 50 Gems from user balance (database update)
// 2. Execute AMM swap
// 3. Credit 10 Pieces to user's position
// 4. Stripe not involved AT ALL
```

**Key:** Trading happens entirely on internal database. Zero blockchain fees. Zero Stripe involvement.

### 3. Selling Pieces for Gems

```javascript
// User sells 10 Pieces
POST /api/pieces/pools/:id/swap
{
  type: 'pieces_to_gems',
  pieces_amount: 10,
  min_gems_out: 450
}

// Server:
// 1. Execute AMM swap (10 Pieces → 480 Gems)
// 2. Credit 480 Gems to user balance
// 3. Deduct 10 Pieces from position
```

User now has 48 Gems they can:
- Use to buy other pieces
- Hold for future trading
- Withdraw to fiat (via Stripe)

### 4. Withdrawing Gems (Fiat Off-Ramp)

```javascript
// User wants to cash out 48 Gems
POST /api/gems/withdraw
{
  gems_amount: 48,
  withdrawal_method: 'bank_transfer'
}

// Server:
// 1. Verify at least 48 Gems are withdrawable
//    - purchased Gems older than 30 days
//    - bonus Gems with completed objectives
// 2. Deduct 48 Gems from balance
// 3. Convert: 48 Gems × $1.00 = $48.00
// 4. Create Stripe transfer or PayPal payout
// 5. User receives $48.00 in bank account
```

**Stripe sees:** Payout to user (standard merchant payout)  
**Stripe does NOT see:** Piece trading proceeds

---

## Database Schema

### Gems Balance Table:
```sql
CREATE TABLE user_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  
  balance_type text NOT NULL CHECK (balance_type IN ('gems', 'fiat', 'crypto')),
  currency text NOT NULL DEFAULT 'GEMS',
  
  balance numeric(14,2) NOT NULL DEFAULT 0,
  
  -- Gems specific
  gems_purchased_total numeric(14,2) DEFAULT 0,    -- Total gems ever bought
  gems_traded_total numeric(14,2) DEFAULT 0,     -- Total gems used in trading
  gems_withdrawn_total numeric(14,2) DEFAULT 0,  -- Total gems cashed out
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Gems Transaction Ledger:
```sql
CREATE TABLE gems_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  
  transaction_type text NOT NULL CHECK (transaction_type IN (
    'purchase',      -- Bought with fiat
    'trade_in',      -- Got from selling pieces
    'trade_out',     -- Used to buy pieces
    'withdrawal',    -- Converted to fiat
    'bonus',         -- Promotional credits
    'refund'         -- Reversed transaction
  )),
  
  amount numeric(14,2) NOT NULL,  -- Positive = credit, Negative = debit
  
  -- For purchases
  fiat_amount numeric(14,2),
  fiat_currency text DEFAULT 'USD',
  stripe_payment_intent_id text,

  -- Redemption controls
  redemption_status text,
  redeemable_after timestamptz,
  objective_code text,
  objective_status text,
  objective_completed_at timestamptz,
  
  -- For trades
  piece_type text,
  asset_id uuid,
  pieces_amount numeric(24,8),
  
  -- Running balance
  balance_after numeric(14,2) NOT NULL,
  
  description text,
  
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## Redemption Model

- `Purchased Gems`: spendable immediately in-app, cash redeemable after 30 days.
- `Bonus Gems`: spendable in-app, cash redeemable only if the linked objective is completed.
- `Withdrawable balance`: derived from the transaction ledger, not just the raw wallet total.
- `Wallet UI`: shows total Gems, withdrawable Gems, Gems still in the 30-day hold, and bonus Gems locked to objectives.

### Admin Objective Unlock Workflow

- `GET /api/pieces/admin/gems/objectives/pending`: lists grouped objective-locked bonus grants that are still waiting to be unlocked.
- `POST /api/pieces/admin/gems/objectives/unlock`: unlocks all pending bonus grants for a given `user_id` and `objective_code`.
- Unlocking creates an `adjustment` ledger event for audit visibility and preserves the original bonus grant rows.

---

## Why This Is Compliance-Safe

### Regulatory Perspective:

| Activity | Classification | Risk Level |
|----------|------------------|------------|
| **Gems purchase** | Virtual currency sale (like game tokens) | Low |
| **Gems trading** | Internal barter/credits system | Low |
| **Gems withdrawal** | Merchant payout | Low |
| **Pieces trading** | ??? (still unclear) | Unknown |

**The key:** Stripe never touches pieces. They only see Gems transactions.

### Stripe's View:

```
Stripe Dashboard shows:
├── $50 payment from User A (gems_purchase)
├── $200 payment from User B (gems_purchase)
├── $48 payout to User A (gems_withdrawal)
└── $150 payout to User C (gems_withdrawal)

Stripe does NOT see:
├── User A traded 50 Gems → 10 Pieces
├── User B bought 20 Pieces for 100 Gems
└── Pieces prices fluctuated
```

---

## Gems Pricing Strategy

### Fixed Exchange Rate (Simplest):
```
1 Gem = $1.00 USD (simple 1:1)
$5 = 5 Gems
$50 = 50 Gems
$100 = 100 Gems
```

**Pros:** Simple, predictable  
**Cons:** No flexibility, exchange rate risk on platform

**Canonical rule:** Promorang should communicate a fixed `1 Gem = $1.00 USD` exchange rate anywhere users buy, hold, or redeem Gems. Avoid public floating-rate language unless the product and settlement systems actually support it.

---

## Implementation Checklist

### Database:
- [ ] Create `user_balances` table (gems type)
- [ ] Create `gems_transactions` table
- [ ] Add gems balance to user profile

### API Endpoints:
- [ ] `POST /api/gems/purchase` - Buy gems with Stripe
- [ ] `GET /api/gems/balance` - Check gems balance
- [ ] `POST /api/gems/withdraw` - Cash out gems
- [ ] `GET /api/gems/transactions` - Transaction history

### Integration:
- [ ] Update AMM service to accept gems instead of USD
- [ ] Update piece trading to use gems as currency
- [ ] Stripe webhook handler for gems purchases

### Admin:
- [ ] Dashboard to monitor gems supply
- [ ] Ability to issue bonus gems (promotions)
- [ ] Gems purchase analytics

---

## Example User Journey

### Day 1: Sign Up
1. User signs up for Promorang
2. Gets 10 bonus Gems (signup reward)
3. KYC pending

### Day 2: KYC Approved
1. User submits KYC documents
2. Admin approves next day
3. User can now trade

### Day 3: First Purchase
1. User buys 50 Gems for $50 (Stripe)
2. User now has 60 Gems total

### Day 4: Trading
1. User browses piece marketplace
2. Sees "DJ Set Piece" priced at 50 Gems
3. Executes swap: 50 Gems → 1 DJ Set Piece
4. Balance: 10 Gems, 1 DJ Set Piece

### Day 5: Price Goes Up
1. DJ Set Piece now worth 75 Gems
2. User sells: 1 DJ Set Piece → 75 Gems
3. Balance: 625 Gems
4. Made 25 Gems profit!

### Day 6: Cash Out
1. User wants to cash out 50 Gems
2. Gets $50 in bank account (Stripe payout)
3. Keeps 125 Gems for future trading

---

## FAQ

**Q: Is Gems a cryptocurrency?**  
A: No. Gems are internal platform credits stored in a database. No blockchain, no tokens, no crypto.

**Q: Can users transfer Gems to each other?**  
A: Not recommended for compliance. Keep Gems non-transferable except through trading pieces.

**Q: What if user has Gems left but wants to quit?**  
A: They can withdraw Gems to fiat anytime (subject to KYC and minimums).

**Q: Is there a minimum Gems purchase?**  
A: Recommend $5 minimum (5 Gems) to avoid micro-transaction fees eating profit.

**Q: Do Gems expire?**  
A: No. Gems are stored indefinitely like a gift card balance.

---

## Cost Summary

| Component | Cost | Notes |
|-----------|------|-------|
| Database storage | $0 | Included in Supabase |
| Transaction fees | $0 | Internal ledger |
| Stripe fees | 2.9% + 30¢ | Only on gems purchase/withdrawal |
| KYC verification | $0 | Manual review |
| Blockchain gas | $0 | Not using blockchain |
| **Total infrastructure** | **~$0** | Just Stripe processing |

---

## Bottom Line

**Gems architecture gives you:**
✅ Zero wallet infrastructure costs  
✅ Stripe compliance (they only see gems, not pieces)  
✅ Instant transactions (no blockchain confirmation)  
✅ Simple implementation (just database updates)  
✅ Regulatory clarity (gems ≠ securities)  

**Market making:** Yes, fully internal/automated via the bot service.
