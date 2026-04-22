# Crypto Payment Integration Guide
## Safe Integration Without Violating Stripe's Policies

⚠️ **CRITICAL WARNING**: Using Stripe for trading "pieces" (which function like securities) will likely violate Stripe's Terms of Service and risk account termination.

---

## Stripe's Crypto Policies

### ✅ What Stripe ALLOWS:
1. **Crypto payouts** - Send crypto to customer wallets (limited countries)
2. **Fiat on-ramp** - Buy crypto with credit cards (through approved partners)
3. **Deposit-only** - Accept payments for goods/services, then convert to crypto
4. **Stablecoin payouts** - USDC payouts to wallets

### ❌ What Stripe PROHIBITS:
1. **Trading platforms** - Facilitating buying/selling of crypto assets
2. **Investment products** - Anything resembling securities or commodities trading
3. **ICOs/Token sales** - Initial coin offerings
4. **Unregistered exchanges** - Operating without proper licenses
5. **High-risk businesses** - Anything that could be considered gambling, securities, etc.

### 🚨 Why Pieces Trading Would Violate Stripe:
- Pieces function like **tokenized securities**
- The system is essentially an **unregistered exchange**
- Users are **trading investment products**
- This falls under Stripe's **"Prohibited Businesses"** category

---

## Safe Integration Strategy

### Option 1: Hybrid Approach (RECOMMENDED)

```
USER FLOW:
1. User deposits FIAT via Stripe (SAFE ✅)
   - Use Stripe for USD deposits only
   - Clear separation from trading
   
2. Fiat converted to USDC (internal)
   - Platform handles conversion
   - User sees USD balance
   
3. Trading happens in USDC (off Stripe)
   - Use internal ledger or blockchain
   - No Stripe involvement
   
4. Withdrawal options:
   - Fiat: Stripe payout (SAFE ✅)
   - Crypto: Direct to wallet (no Stripe)
```

**Implementation:**
- `/services/cryptoPaymentService.js` (already created) uses this approach
- Stripe only for fiat deposits/withdrawals
- Trading balances tracked internally

### Option 2: Full Crypto (No Stripe)

```
USER FLOW:
1. User connects wallet (MetaMask, etc.)
2. All trading in USDC/ETH on-chain
3. No Stripe involved at all
4. Lower fees, more decentralized
```

**Best for:** 
- Users comfortable with crypto wallets
- Regulatory uncertainty around pieces
- Lower compliance burden

### Option 3: Coinbase Commerce

```
USER FLOW:
1. User clicks "Buy Pieces"
2. Redirect to Coinbase Commerce checkout
3. Pay with crypto (BTC, ETH, USDC)
4. Webhook confirms payment
5. Credit internal balance
```

**Implementation:**
- Use Coinbase Commerce API
- Stripe account completely safe
- Supports major cryptocurrencies

---

## Regulatory-Safe Architecture

### The Separation Principle

```
┌─────────────────────────────────────────────────┐
│           STRIPE (Fiat Layer)                   │
│  • Deposits (USD → Platform)                    │
│  • Withdrawals (Platform → USD Bank)          │
│  • KYC/AML handled by Stripe                    │
└─────────────────────────────────────────────────┘
                    │
                    ▼ (Internal conversion)
┌─────────────────────────────────────────────────┐
│        PLATFORM LEDGER (Trading Layer)          │
│  • USD balance displayed to user                │
│  • Actually backed by USDC in treasury          │
│  • Trading happens here                        │
│  • Piece purchases/sales                        │
└─────────────────────────────────────────────────┘
                    │
                    ▼ (Optional)
┌─────────────────────────────────────────────────┐
│      BLOCKCHAIN (Settlement Layer)              │
│  • USDC on Ethereum/Polygon                     │
│  • On-chain custody (optional)                   │
│  • Withdrawals to external wallets              │
└─────────────────────────────────────────────────┘
```

**Key Point:** Stripe never touches anything related to piece trading.

---

## Implementation Details

### Environment Variables Needed:

```bash
# Stripe (Fiat only)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Coinbase Commerce (Crypto payments)
COINBASE_COMMERCE_API_KEY=...
COINBASE_COMMERCE_WEBHOOK_SECRET=...

# Market Maker (Liquidity bot)
MARKET_MAKER_USER_ID=uuid-of-bot-account

# Treasury Wallet (Holds USDC reserves)
TREASURY_WALLET_ADDRESS=0x...
TREASURY_PRIVATE_KEY=...(encrypted)
```

### Database Tables Required:

Already created in migrations:
- `user_balances` - Fiat and crypto balances
- `fiat_transactions` - Stripe transaction records
- `crypto_charges` - Coinbase Commerce charges
- `user_wallets` - Connected wallet addresses

### API Flow for Deposits:

```javascript
// 1. User initiates deposit
POST /api/payments/deposit
{
  amount: 100,
  currency: 'USD'
}

// 2. Server creates Stripe PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // $100 in cents
  currency: 'usd',
  metadata: { user_id: userId, type: 'deposit' }
});

// 3. User completes payment via Stripe.js
// 4. Webhook received:
//    - Credit user balance
//    - Convert to USDC internally
//    - User can now trade pieces
```

### API Flow for Trading:

```javascript
// User buys pieces with USD balance (no Stripe!)
POST /api/pieces/pools/:id/swap
{
  type: 'currency_to_pieces',
  amount_in: 50, // $50 USD
  min_amount_out: 9.5 // Minimum pieces expected
}

// Server:
// 1. Deduct from user's USD balance
// 2. Execute AMM swap
// 3. Credit pieces to user's position
// 4. Stripe never involved!
```

---

## Compliance Checklist

### If Using Stripe for Fiat:
- [ ] Register as Money Services Business (MSB) with FinCEN
- [ ] Implement KYC verification (minimum: ID + selfie)
- [ ] Maintain transaction records for 5 years
- [ ] File Suspicious Activity Reports (SARs) if needed
- [ ] State money transmitter licenses (if applicable)

### For Crypto Trading:
- [ ] Terms of Service clearly state pieces are not securities
- [ ] Risk disclosures ("You may lose money")
- [ ] No investment advice or promises of returns
- [ ] Restricted jurisdictions (US states, countries)

### Recommended Disclaimers:

```
"Pieces are digital collectibles, not securities or investment contracts.
They do not represent ownership in any entity. Trading pieces involves 
significant risk of loss. Past performance does not guarantee future results.
"
```

---

## Testing the Integration

### 1. Stripe Test Mode:
```bash
# Use test keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Test card: 4242 4242 4242 4242
```

### 2. Coinbase Commerce Test Mode:
```bash
# Create test charge
POST https://api.commerce.coinbase.com/charges
X-CC-Api-Key: your_test_key

# Use testnet for crypto payments
```

### 3. Internal Balance Tests:
```javascript
// Verify balance updates correctly
await creditFiatBalance(userId, 100, 'USD');
const balance = await getUserBalance(userId, 'USD', 'fiat');
assert(balance.balance === 100);
```

---

## Risk Mitigation

### If Regulators Come Knocking:
1. **Clear Records:** All transactions logged with user IDs
2. **KYC Data:** Verified identities for all traders
3. **Compliance Officer:** Designate someone responsible
4. **Legal Opinion:** Get securities lawyer review
5. **Insurance:** Consider E&O (Errors & Omissions) insurance

### If Stripe Closes Account:
1. Have backup payment processor ready (Square, PayPal)
2. Migrate users seamlessly
3. Don't hold user funds in Stripe for more than 24 hours

---

## Summary

| Component | Stripe Involved? | Risk Level |
|-----------|------------------|------------|
| Fiat Deposits | ✅ Yes | LOW |
| Fiat Withdrawals | ✅ Yes | LOW |
| Piece Trading | ❌ No | MEDIUM (regulatory) |
| Crypto Deposits | ❌ No (Coinbase) | LOW |
| Crypto Withdrawals | ❌ No | LOW |

**Bottom Line:** The architecture I've built keeps Stripe safe by only using it for fiat deposits/withdrawals. All trading happens on an internal ledger that settles in USDC, completely separate from Stripe.

This is the **same model used by Coinbase, Binance, and other exchanges**: Fiat processor for on/off ramps, internal system for trading.
