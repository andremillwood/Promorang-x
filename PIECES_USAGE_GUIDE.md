# Pieces Trading - Full Implementation Guide

## ✅ What's Implemented

All SQL migrations have been applied successfully:
- ✅ 10 core pieces tables (dividends, governance, lockups, etc.)
- ✅ 5 AMM liquidity tables (pools, LP positions, swaps, circuit breakers)
- ✅ All RLS policies
- ✅ All indexes

Full implementation is now in **TypeScript/JavaScript** (reliable, no SQL parsing issues).

---

## 📁 Service Files Location

```
/Users/bumblebeecreative/Documents/GitHub/Promorang-x/apps/web/src/lib/pieces/
├── dividendService.ts          # Full dividend calculations
├── circuitBreakerService.ts    # AMM circuit breakers
└── index.ts                    # Exports
```

---

## 🎯 Quick Start Examples

### 1. Calculate & Distribute Dividends

```typescript
import { calculateAndDistributeDividends } from '@/lib/pieces';

// Calculate dividends for Q1 2025
const dividendId = await calculateAndDistributeDividends({
  pieceType: 'content',
  assetId: 'uuid-of-content-asset',
  periodStart: new Date('2025-01-01'),
  periodEnd: new Date('2025-03-31')
});

console.log('Dividend created:', dividendId);
```

### 2. Process User Dividend Claims

```typescript
import { processDividendClaims } from '@/lib/pieces';

// User claims all their dividends
const totalClaimed = await processDividendClaims(userId);
console.log(`Claimed $${totalClaimed} in dividends`);
```

### 3. Check Circuit Breaker Before Swap

```typescript
import { checkCircuitBreaker, calculateSwapOutput } from '@/lib/pieces';

// Check if trading is allowed
const breakerCheck = await checkCircuitBreaker(poolId, priceBefore, priceAfter);
if (breakerCheck.isTriggered) {
  console.error('Trading paused:', breakerCheck.reason);
  return;
}

// Calculate swap output
const outputAmount = calculateSwapOutput(
  amountIn,
  pool.pieces_reserve,
  pool.currency_reserve,
  pool.swap_fee_percent
);
```

### 4. Create AMM Pool

```typescript
// 1. Create liquidity pool
const { data: pool } = await supabase
  .from('piece_liquidity_pools')
  .insert({
    piece_type: 'content',
    asset_id: contentId,
    pieces_reserve: initialPieces,
    currency_reserve: initialCurrency,
    k_constant: initialPieces * initialCurrency,
    created_by: userId
  })
  .select()
  .single();

// 2. Create circuit breaker
import { createCircuitBreaker } from '@/lib/pieces';
await createCircuitBreaker(pool.id, {
  maxPriceChange1hPercent: 20,
  cooldownMinutes: 15
});
```

### 5. Execute AMM Swap

```typescript
// Create swap record
const { data: swap } = await supabase
  .from('piece_amm_swaps')
  .insert({
    pool_id: poolId,
    swap_type: 'pieces_to_currency',
    trader_id: userId,
    amount_in: piecesToSell,
    amount_out: currencyReceived,
    swap_fee: fee,
    protocol_fee: protocolFee,
    lp_fee: lpFee,
    price_before: pool.last_price,
    price_after: newPrice,
    price_impact_percent: impact,
    status: 'completed'
  })
  .select()
  .single();

// Pool reserves update automatically via trigger
```

---

## 🔄 Cron Job Setup (Optional)

Monitor all pools for circuit breakers:

```typescript
// In your cron job or scheduled function
import { monitorAllPools } from '@/lib/pieces';

// Run every minute
setInterval(monitorAllPools, 60000);
```

---

## 📊 Database Schema Summary

### Core Pieces Tables
| Table | Purpose |
|-------|---------|
| `piece_fee_structures` | Trading fees per piece type |
| `piece_revenue_sources` | Revenue tracking per asset |
| `piece_holdings` | Who owns what pieces |
| `piece_dividends` | Dividend distributions |
| `piece_dividend_claims` | Individual holder claims |
| `piece_governance_proposals` | Holder voting proposals |
| `piece_governance_votes` | Individual votes |
| `piece_issuances` | Initial piece minting |
| `piece_lockups` | Vesting/restrictions |
| `piece_price_oracles` | Price feeds |

### AMM Tables
| Table | Purpose |
|-------|---------|
| `piece_liquidity_pools` | AMM liquidity pools |
| `piece_lp_positions` | LP provider positions |
| `piece_amm_swaps` | Swap transactions |
| `piece_circuit_breakers` | Trading limits/cooldowns |
| `piece_price_alerts` | Alert history |

---

## 🎉 Status: FULLY OPERATIONAL

Your pieces trading system with AMM liquidity pools is ready for production!
