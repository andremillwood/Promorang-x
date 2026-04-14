---
name: promorang-supabase
description: Query Promorang's Supabase database for moments, venues, products, users, and analytics.
---

# Promorang Supabase Skill

Query the Promorang platform database to answer stakeholder questions about moments, venues, products, users, and analytics.

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key (server-side only)

## Available Actions

### Get User Profile
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action get-profile --user-id <uuid>
```

### List Moments (by host)
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action list-moments --host-id <uuid> [--status active|completed|cancelled]
```

### Get Moment Stats
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action moment-stats --moment-id <uuid>
```
Returns: participant count, UGC uploads, check-ins, shares.

### List Venues (by merchant)
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action list-venues --merchant-id <uuid>
```

### Get Merchant Analytics
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action merchant-analytics --merchant-id <uuid> [--period 7d|30d|90d]
```
Returns: views, redemptions, attributed sales, product sync status.

### List Integrations
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action list-integrations --user-id <uuid>
```

### List Synced Products
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action synced-products --provider shopify|square|woocommerce --user-id <uuid>
```

### Get Platform Stats (ops agent only)
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action platform-stats
```
Returns: total users, active moments, total venues, signups this week, engagement metrics.

### Search Users
```bash
node ~/openclaw/skills/promorang-supabase/query.js --action search-users --query "<name or email>"
```

## Notes
- Always use `--user-id` for scoped queries — never fetch all users' data at once
- Platform-wide stats are only for the ops agent (Pulse)
- Results are returned as JSON — format them nicely for chat responses
