# Liquidity Provider Program
## Like Uniswap, But for Pieces

---

## What Is This?

Just like Uniswap lets people deposit tokens to earn trading fees, **Promorang lets users deposit Pieces + Gems to earn fees** from piece trading.

---

## How It Works (Simple Version)

### 1. Deposit
```
User has:
- 100 Pieces
- 100 Gems (at $1/piece)

User deposits into pool → Receives LP tokens
```

### 2. Earn
```
Every time someone trades:
- 0.25% fee goes to LPs
- Auto-compounds in the pool
- No claiming needed
```

### 3. Withdraw
```
User burns LP tokens → Gets back:
- Original deposit ± price changes
- + All earned fees
```

---

## Real Example

**Sarah the Liquidity Provider:**

### Day 1: Deposit
- Sarah deposits: 50 DJ Set Pieces + 50 Gems
- Pool total before: 1000 Pieces + 1000 Gems
- Sarah's share: 4.76% (50/1050)
- She receives: 52.4 LP tokens

### Day 2-30: Earning
- Trading volume: 10,000 Gems/day
- Fees: 25 Gems/day (0.25%)
- Sarah's share: 4.76% of 25 = 1.19 Gems/day
- 30 days: ~35.7 Gems earned

### Day 30: Check Position
- Pool now: 1035.7 Gems (earnings auto-compounded)
- Sarah's LP tokens still: 52.4
- Her share value: 52.4 LP tokens × current rate

### Day 30: Withdraw
- Sarah burns 52.4 LP tokens
- Receives: ~50.8 Pieces + 50.8 Gems
- Profit: ~0.8 Pieces + 0.8 Gems (from fees)

---

## APR Calculation

```
APR = (Daily Volume × Fee Rate × 365) / Total Pool Value × 100

Example:
- Daily Volume: 10,000 Gems
- Fee Rate: 0.25%
- Pool Value: 10,000 Gems (both sides)
- APR = (10,000 × 0.0025 × 365) / 10,000 × 100 = 91.25%
```

**Higher volume = Higher APR**

---

## Impermanent Loss (The Risk)

### What Is It?
If piece prices change while you're in the pool, you might get back less than if you just held the pieces.

### Example:
**Scenario: Piece price doubles**

**If you just held:**
- 50 Pieces × $2 = $100 value

**If you were in pool:**
- Pool rebalances
- You get back: ~35.4 Pieces + ~70.7 Gems
- Value: 35.4 × $2 + 70.7 × $1 = $141.40
- **Impermanent loss: ~$8.60** (vs holding)

### BUT:
If trading volume is high, fees earned can offset IL.

### When IL is Minimal:
- Piece price stays stable
- High trading volume (fees cover IL)
- Short time in pool

---

## Why Provide Liquidity?

### Benefits:
1. **Passive Income** - Earn while you sleep
2. **No Active Trading** - No need to time the market
3. **Support Ecosystem** - Help make pieces liquid
4. **Compound Growth** - Fees auto-reinvest
5. **Flexible** - Withdraw anytime

### Who Should:
- Long-term believers in a piece
- Want passive income vs active trading
- Have both pieces AND gems
- Understand IL risk

### Who Shouldn't:
- Short-term traders
- Only have pieces (no gems)
- Can't tolerate value fluctuations
- Need guaranteed returns

---

## Comparison to Uniswap

| Feature | Uniswap | Promorang Pieces |
|---------|---------|------------------|
| Deposit | Token A + Token B | Pieces + Gems |
| Fees | 0.3% to LPs | 0.25% to LPs |
| Token | UNI-V2 LP tokens | Custom LP tokens |
| Impermanent Loss | Yes | Yes |
| Governance | UNI token | Coming soon |
| Auto-compound | Yes | Yes |

---

## Pool Mechanics

### Constant Product Formula (x × y = k)
```
Pieces × Gems = Constant

Example:
- Pool: 1000 Pieces × 1000 Gems = 1,000,000
- Someone buys 10 pieces:
  - New Pieces: 990
  - New Gems needed: 1,000,000 / 990 = 1010.10
  - They pay: 10.10 Gems for 10 pieces
  - Price per piece: 1.01 Gems (slippage!)
```

### Slippage
- Small trades: Low slippage (near 1:1)
- Large trades: High slippage (worse price)
- Bigger pool = Less slippage = Better for traders

---

## Marketing Angle

### For Users:
```
"Don't just trade pieces - BE THE MARKET"

Deposit your pieces and gems into liquidity pools
and earn 0.25% on every trade. APRs range from 
20% to 200%+ depending on trading volume.

The more the piece trades, the more you earn.
Passive income for piece believers.
```

### For Platform:
```
"Community-Powered Liquidity"

Unlike traditional exchanges, Promorang liquidity
is provided by users. This means:
- Better prices
- Deeper markets  
- Shared success
- Decentralized resilience
```

---

## Implementation Notes

### Backend Already Supports:
- `addLiquidity()` - Deposit to pool
- `removeLiquidity()` - Withdraw from pool
- LP token tracking
- Fee distribution
- Position queries

### Frontend Components Built:
- `LiquidityProvider.tsx` - Add/remove modal
- `LiquidityDashboard.tsx` - Browse pools & positions

### Database:
- `piece_lp_positions` - Tracks user positions
- `piece_liquidity_pools` - Pool reserves
- `piece_amm_swaps` - Fee tracking

---

## Launch Strategy

### Phase 1: Bootstrap (You Fund)
1. Deploy market maker bot with 100K Gems
2. Seed initial pools for all pieces
3. Set competitive APRs (50-100%)

### Phase 2: Community LPs (Month 2+)
1. Announce LP program
2. Show live APRs
3. Highlight top earners
4. Educational content about IL

### Phase 3: LP Incentives (Month 3+)
1. Bonus rewards for early LPs
2. LP leaderboard
3. Reduced fees for large LPs
4. Governance rights for LP holders

---

## Risk Disclosures

**Required on LP page:**
```
⚠️ Important Risks:

1. Impermanent Loss: You may receive less value 
   than if you held pieces directly.

2. No Guarantees: APR fluctuates with trading volume.

3. Smart Contract Risk: Though audited, bugs could 
   theoretically cause loss.

4. Liquidity Risk: Large withdrawals may be delayed 
   if pool is small.

Only provide liquidity with funds you can afford to 
lose and understand these risks.
```

---

## FAQ

**Q: What's the minimum deposit?**  
A: No minimum, but tiny deposits may not cover gas costs (if on-chain). For database-only, $1+ is fine.

**Q: Can I lose money?**  
A: Yes, through impermanent loss if piece prices change significantly.

**Q: How often do I earn?**  
A: Every trade instantly - fees auto-compound in the pool.

**Q: Can I withdraw anytime?**  
A: Yes, but you might get different piece/gem ratio than deposited.

**Q: What's better: LP or just holding?**  
A: Depends on trading volume. High volume = LP wins. Low volume = Holding wins.

**Q: Do I get governance rights?**  
A: Coming in Phase 3 - LP tokens may grant voting power.

---

## Success Metrics

Track these to see if LP program is working:

1. **Total Value Locked (TVL)** - Target: $100K+ in pools
2. **Number of LPs** - Target: 50+ unique providers
3. **Average APR** - Target: 30%+ sustainable
4. **Pool Depth** - Target: <5% slippage on $100 trades
5. **LP Retention** - Target: 60%+ still in pools after 30 days

---

## Bottom Line

**You CAN have users fund your market maker bot - exactly like Uniswap!**

The infrastructure is already built. You just need to:
1. Explain the benefits clearly
2. Show real-time APRs
3. Educate about IL risk
4. Incentivize early adopters

This transforms your platform from "you providing liquidity" to "community-powered liquidity" - much more scalable and aligned with decentralized ethos.
