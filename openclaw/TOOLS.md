# TOOLS.md — Available APIs and Services

## Promorang API (Internal)

Base URL: `https://api.promorang.co`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/integrations/status` | GET | List connected integrations for a user |
| `/api/integrations/shopify/connect` | POST | Initiate Shopify OAuth |
| `/api/integrations/square/connect` | GET | Initiate Square OAuth |
| `/api/integrations/woocommerce/connect` | POST | Connect WooCommerce via API keys |
| `/api/integrations/:provider/sync` | POST | Sync products from provider |
| `/api/integrations/:provider/disconnect` | DELETE | Disconnect integration |
| `/api/integrations/:provider/products` | GET | List synced products |

## Supabase (Database)

- Direct access via `@supabase/supabase-js` with service key
- All tables queryable: `profiles`, `moments`, `venues`, `merchant_products`, `synced_products`, `merchant_integrations`, `campaigns`, `organizations`
- RPC functions available for complex queries

## External Services

| Service | Purpose | Auth |
|---------|---------|------|
| Resend | Transactional email (outreach, surveys, digests, NPS) | API key |
| Exa AI | Free web search | API key |
| Brave Search | Web search (fallback) | API key |
| Eventbrite | Event discovery (scraping) | Public pages |
| Google Maps | Venue discovery (scraping) | Public pages |
| Gmail | Outreach emails | OAuth via `clawemail` skill |
| X/Twitter | Social posting | Via `bird` skill |
| Grok (xAI) | Real-time X/Twitter data, social monitoring, creator discovery | API key via OpenRouter |
| Shopify Admin API | Product management | OAuth token (per merchant) |
| Square Connect API | Catalog management | OAuth token (per merchant) |

## Local Tools

| Tool | Purpose |
|------|---------|
| Ollama (llama3.2:1b) | Heartbeat checks, simple classifications ($0) |
| QMD | Local vector search over Promorang docs (zero tokens) |
| Cron scheduler | Daily event scraping, weekly digests |

## Model Tier

| Tier | Model | Use Case | Cost |
|------|-------|----------|------|
| Primary | MiniMax M2.5 | Complex reasoning, all main queries | $50/mo flat |
| Local | Ollama llama3.2:1b | Heartbeats, repetitive checks | $0 |
| Social | Grok (xAI) | X/Twitter data, social monitoring, creator discovery | ~$5-10/mo |
| Fallback | Gemini Flash | Simple classifications if MiniMax is down | Per-token |
