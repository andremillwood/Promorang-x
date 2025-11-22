# 🎁 Coupons & Giveaways in Home Feed - User Guide

## Overview
Users now see **coupons and giveaways** prominently displayed in their home feed to incentivize participation in drops and campaigns.

---

## 📍 Where Users See Coupons

### 1. **"For You" Tab** (Personalized Feed)
Coupons are mixed into the personalized content stream alongside:
- Content posts
- Drop opportunities
- Sponsored content

**Display:** Coupons appear as `CouponCard` components with eye-catching badges and value displays.

### 2. **"Rewards" Tab** (Dedicated Section)
All available coupons and giveaways in one place:
- Active marketplace coupons
- User-earned rewards
- Campaign-linked offers
- Platform-wide promotions

### 3. **Drop Detail Pages**
When viewing a drop, users see:
- Associated coupon rewards
- "Complete this drop to unlock X% off" messaging
- Countdown timers for limited offers

---

## 🎫 Demo Coupons Created

### **1. 🎉 WELCOME50 - New Creator Welcome Bonus**
- **Value:** 50% OFF
- **Description:** Get 50% off your first marketplace purchase!
- **Requirement:** Complete any drop to unlock
- **Badge:** NEW
- **Max Uses:** 100 total
- **Expires:** 30 days

**Incentive:** Encourages new users to complete their first drop

---

### **2. ⚡ FLASH100 - Flash Sale**
- **Value:** $100 OFF
- **Description:** Limited time! Get $100 off orders over $200
- **Requirement:** Minimum $200 purchase
- **Badge:** FLASH
- **Max Uses:** Only 25 redemptions!
- **Expires:** 3 days
- **Urgency:** HIGH

**Incentive:** Creates FOMO and urgency to participate NOW

---

### **3. 💎 GEMS500 - Gem Spender Reward**
- **Value:** 500 💎 (gems)
- **Description:** Spent gems on content? Get 500 gems back!
- **Requirement:** Active gem user
- **Badge:** GEMS
- **Max Uses:** 50
- **Expires:** 14 days

**Incentive:** Rewards users who engage with platform currency

---

### **4. 🚚 FREESHIP - Free Shipping Weekend**
- **Value:** FREE SHIPPING
- **Description:** All weekend long - free shipping on any order
- **Requirement:** None
- **Badge:** WEEKEND
- **Max Uses:** 200 (2 per user)
- **Expires:** 2 days

**Incentive:** Low barrier, encourages immediate purchases

---

### **5. 👑 TOP10REWARD - Leaderboard Elite Discount**
- **Value:** 75% OFF
- **Description:** Exclusive for top 10 performers!
- **Requirement:** Top 10 on leaderboard
- **Badge:** ELITE
- **Max Uses:** Only 10 (1 per user)
- **Expires:** 7 days
- **Exclusivity:** HIGH

**Incentive:** Drives competitive participation in drops/campaigns

---

### **6. 🎨 CREATOR25 - Creator Appreciation**
- **Value:** 25% OFF
- **Description:** Thank you for being a creator!
- **Requirement:** None
- **Badge:** CREATOR
- **Max Uses:** 500 (3 per user)
- **Expires:** 60 days

**Incentive:** General goodwill and creator retention

---

## 🎯 How Coupons Drive Drop Participation

### **Visual Flow:**

```
User Opens App
    ↓
Sees Home Feed
    ↓
"For You" Tab Shows:
    - Content Post
    - 🎉 WELCOME50 Coupon (50% OFF!)
    - Drop Opportunity
    - ⚡ FLASH100 Coupon ($100 OFF - 3 days left!)
    - Another Content Post
    ↓
User Clicks Coupon
    ↓
Sees: "Complete any drop to unlock this discount"
    ↓
User Navigates to "Opportunities" Tab
    ↓
Completes Drop
    ↓
Coupon Unlocked!
    ↓
User Goes to Marketplace
    ↓
Applies Coupon at Checkout
    ↓
Gets Discount
    ↓
Advertiser Tracks Conversion
```

---

## 🎨 UI Components

### **CouponCard Display**
Each coupon shows:
- **Badge** (NEW, FLASH, ELITE, etc.) - Top right corner
- **Icon** (🎫 🎁 💎) - Based on reward type
- **Title** - Bold, attention-grabbing
- **Value Display** - Large, prominent (e.g., "50% OFF", "$100 OFF")
- **Description** - What they get
- **Requirement** - What they need to do (if any)
- **Expiry** - Countdown timer or date
- **Progress Bar** - Shows how many redemptions left
- **CTA Button** - "Claim Now" or "View Details"

### **Visual Hierarchy:**
```
┌─────────────────────────────────────┐
│ 🎉 WELCOME50              [NEW] 🔥  │
│                                     │
│ New Creator Welcome Bonus           │
│                                     │
│         50% OFF                     │
│     ════════════                    │
│                                     │
│ Get 50% off your first marketplace │
│ purchase! Complete any drop to     │
│ unlock this exclusive discount.    │
│                                     │
│ 📅 Expires in 30 days              │
│ 👥 85/100 uses remaining           │
│                                     │
│ ┌─────────────────────────────┐   │
│ │    🎯 Complete Drop to Unlock│   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 📊 Analytics & Tracking

### **What Gets Tracked:**
1. **Coupon Impressions** - How many times shown in feed
2. **Coupon Clicks** - User interest
3. **Drop Completions** - From coupon CTAs
4. **Redemptions** - Actual usage at checkout
5. **Revenue Attribution** - Which campaign drove the sale

### **Advertiser Dashboard Shows:**
- Coupon performance metrics
- Drop completion rate from coupon viewers
- Conversion funnel: View → Click → Complete Drop → Redeem
- ROI per coupon campaign

---

## 🔄 Integration Points

### **1. Drops → Coupons**
- Drop detail page shows available coupon rewards
- "Complete this drop and get 50% off!" messaging
- Auto-unlock coupons on drop completion

### **2. Campaigns → Coupons**
- Advertisers create coupons as campaign incentives
- Coupons auto-linked to campaigns
- Campaign dashboard shows coupon performance

### **3. Leaderboard → Coupons**
- Top performers get exclusive coupons
- Rank-based rewards (Top 10, Top 25, etc.)
- Competitive incentive

### **4. Marketplace → Coupons**
- Coupons apply at checkout
- Clear savings display
- One-click redemption

---

## 💡 User Psychology

### **Why This Works:**

1. **FOMO (Fear of Missing Out)**
   - Limited quantities (25 uses left!)
   - Time pressure (Expires in 3 days!)
   - Exclusivity (Top 10 only!)

2. **Immediate Value**
   - Clear savings displayed upfront
   - No hidden requirements
   - Easy to understand

3. **Gamification**
   - Unlock rewards by completing tasks
   - Progress bars show scarcity
   - Badges create status

4. **Social Proof**
   - "85/100 uses remaining" shows others are claiming
   - Leaderboard rewards show achievement
   - Campaign-linked shows brand trust

---

## 🚀 Next Steps for Users

### **To See Coupons:**
1. Open app
2. Go to Home Feed
3. Check "For You" or "Rewards" tab
4. Scroll to see available offers

### **To Unlock a Coupon:**
1. Click on coupon card
2. Read requirements (e.g., "Complete any drop")
3. Navigate to Opportunities tab
4. Complete a drop
5. Coupon auto-unlocked!

### **To Redeem:**
1. Go to Marketplace
2. Add items to cart
3. Enter coupon code at checkout
4. See instant discount
5. Complete purchase

---

## 📈 Expected Impact

### **User Engagement:**
- ↑ Drop completion rate (incentivized by coupons)
- ↑ Marketplace purchases (discounts drive sales)
- ↑ Daily active users (check for new offers)
- ↑ Time in app (browsing coupons and drops)

### **Advertiser Value:**
- Direct attribution (campaign → coupon → sale)
- Measurable ROI
- Flexible targeting (drops, leaderboard, etc.)
- Cross-promotion opportunities

### **Platform Revenue:**
- More transactions (coupons drive purchases)
- Higher advertiser spend (proven ROI)
- User retention (ongoing rewards)

---

## ✅ Summary

**Coupons and giveaways are now:**
- ✅ Visible in home feed
- ✅ Linked to drops and campaigns
- ✅ Tracked across systems
- ✅ Easy to discover and redeem
- ✅ Incentivizing user participation

**Users will see:**
- 🎁 6 demo coupons immediately
- 💰 Clear value propositions
- 🎯 Simple unlock requirements
- ⏰ Urgency indicators
- 🏆 Exclusive rewards for top performers

**Result:** Users are **motivated to participate in drops** because they can see the **tangible rewards** (discounts, free shipping, exclusive offers) waiting for them!

---

**Status:** ✅ Live in production
**Demo Coupons:** ✅ Seeded in database
**API:** ✅ Updated to fetch marketplace coupons
**Feed:** ✅ Displaying coupons in For You and Rewards tabs
