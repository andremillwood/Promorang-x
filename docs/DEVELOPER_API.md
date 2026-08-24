# Promorang Developer API Reference (v1)

Welcome to the **Promorang Developer Platform**. This document details how third-party developers, automated workflows, and backend microservices can programmatically interact with Promorang's promotion feed, coupon claiming engine, campaign operator, and merchant operations.

---

## 1. Authentication & API Keys

Promorang uses API keys with granular permission scopes.

### Getting an API Key
Generate keys from your Promorang Merchant or Developer dashboard or via the key creation endpoint:
- **Production Keys**: `pk_live_...`
- **Sandbox/Test Keys**: `pk_test_...`

### Sending the Key
Pass your key in the `x-api-key` header or as a Bearer token:

```http
GET /api/v1/feed HTTP/1.1
Host: api.promorang.co
x-api-key: pk_live_9f8e7d6c5b4a...
```

Or:

```http
Authorization: Bearer pk_live_9f8e7d6c5b4a...
```

### Permission Scopes
| Scope | Description |
|---|---|
| `feed:read` | Read active promotions, drops, and live moments. |
| `coupons:claim` | Claim coupons, drops, and execute redemption receipts. |
| `campaigns:read` | Inspect campaign statistics and live telemetry. |
| `campaigns:write` | Plan campaigns, generate agent drafts, mobilize creators. |
| `merchants:read` | View merchant live inventory, budget, and stats. |
| `*` | Full access. |

---

## 2. Using the Headless SDK (`@promorang/sdk`)

Install the official TypeScript/JavaScript SDK:

```bash
npm install @promorang/sdk
```

### Initializing the Client
```typescript
import { PromorangClient } from '@promorang/sdk';

const promorang = new PromorangClient({
  apiKey: process.env.PROMORANG_API_KEY, // or pk_live_...
  baseUrl: 'https://api.promorang.co/api/v1'
});

// 1. Search active promotions
const feed = await promorang.feed.search({
  category: 'dining',
  limit: 10,
  lat: 18.0179,
  lng: -76.8099,
  radiusKm: 15
});
console.log('Active deals:', feed.items);

// 2. Programmatically claim a coupon
const receipt = await promorang.coupons.claim({
  opportunityId: 'opp_12345',
  recipientUserId: 'usr_789'
});
console.log('Claim receipt:', receipt.claimCode, receipt.qrPayload);

// 3. Inspect Merchant Live-Ops
const liveOps = await promorang.merchants.getLiveOps('org_kingston_cafe');
console.log('Available budget:', liveOps.budget.availableBudget);
```

---

## 3. REST API Endpoints

### A. Feed & Discovery
- **Endpoint**: `GET /api/v1/feed`
- **Required Scope**: `feed:read`
- **Query Parameters**:
  - `category` (optional, string)
  - `limit` (optional, integer, default: 20, max: 50)
  - `offset` (optional, integer, default: 0)
  - `lat`, `lng` (optional, float)
  - `radiusKm` (optional, float)

### B. Claim Promotion
- **Endpoint**: `POST /api/v1/coupons/claim`
- **Required Scope**: `coupons:claim`
- **Request Body**:
  ```json
  {
    "opportunityId": "drop_uuid_here",
    "recipientUserId": "user_or_wallet_uuid",
    "metadata": {
      "source": "partner_app",
      "campaign_channel": "ai_agent"
    }
  }
  ```

### C. Campaign Planning & AI Operator
- **Endpoint**: `POST /api/v1/campaigns/generate-plan`
- **Required Scope**: `campaigns:write`
- **Request Body**:
  ```json
  {
    "objective": "Promote summer cocktail drop across Kingston nightlife",
    "targetMarket": "Kingston, Jamaica",
    "budget": 50000,
    "targetCount": 30
  }
  ```

### D. Merchant Live-Ops
- **Endpoint**: `GET /api/v1/merchants/:id/live-ops`
- **Required Scope**: `merchants:read`
