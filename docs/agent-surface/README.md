# Agent Surface API

External API layer for AI agents and third-party integrations to interact with the Momentum Engine platform.

## Base URL
```
https://dnysosmscoceplvcejkv.supabase.co/functions/v1/agent-surface
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

## Public Endpoints (No Auth Required)

### Health Check
```
GET /health
```
Returns API status and available capabilities.

### List Moments
```
GET /moments?status=active&mode=pulse&limit=50&offset=0
```
Query parameters:
- `status`: active, scheduled, completed
- `mode`: pulse, scheduled, spontaneous, private
- `tags`: comma-separated tags
- `lat`, `lon`, `radius`: location filtering
- `limit`, `offset`: pagination

### Get Moment Details
```
GET /moments/:id
```

### Search Content
```
GET /content?q=search&creator=uuid&type=video&tags=tag1,tag2
```

## Protected Endpoints (Auth Required)

### Track Mission Attribution
```
POST /attributions
Content-Type: application/json

{
  "content_item_id": "uuid",
  "moment_id": "uuid",
  "user_id": "uuid",
  "event_type": "join|verify|engage"
}
```

### Submit Check-in
```
POST /checkins
Content-Type: application/json

{
  "moment_id": "uuid",
  "user_id": "uuid",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "proof_bundle": {}
}
```

### Get User Economy
```
GET /economy/:userId
```
Returns:
- Points, Keys, Gems balances
- Creator tier and earnings
- Catalyst status and viral rewards

### Claim Rewards
```
POST /rewards/claim
Content-Type: application/json

{
  "user_id": "uuid",
  "moment_id": "uuid",
  "claim_type": "early_mover|passive_yield"
}
```

### Get User Profile
```
GET /users/:id
```

## Response Format
All responses are JSON with the following structure:
```json
{
  "data": {},
  "meta": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

## Error Responses
```json
{
  "error": "Description of error"
}
```

## Capabilities
The Agent Surface provides machine-readable access to:
- **moments.discover** - Find and query moments
- **moments.query** - Get detailed moment information
- **economy.query** - Read user balances and earnings
- **users.profile** - Access public user profiles
- **content.search** - Search content items
- **attributions.track** - Record mission attributions
- **checkin.submit** - Submit proof-of-attendance
- **rewards.claim** - Claim early mover and passive yield rewards

## Deployment
The edge function is located at:
```
supabase/functions/agent-surface/index.ts
```

Deploy using Supabase CLI:
```bash
supabase functions deploy agent-surface
```
