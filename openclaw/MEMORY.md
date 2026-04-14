# MEMORY.md — Hard Facts

## Platform

- **Name:** Promorang
- **URL:** https://promorang.co
- **API:** https://api.promorang.co
- **Database:** Supabase (PostgreSQL)
- **Frontend:** React + Vite, deployed on Vercel
- **Backend:** Express.js, deployed on Vercel (serverless)
- **Auth:** Supabase Auth (email + social)

## Stakeholder Types

| Role | What they do |
|------|-------------|
| Participant | Attend moments, earn rewards, upload UGC, rank up |
| Host | Create and manage moments (events/experiences) |
| Merchant | Own venues, manage products, connect POS/e-commerce |
| Brand | Sponsor moments, run campaigns, track ROI |

## Database Tables (Key)

- `profiles` — user profiles with `maturity_state` (rank system)
- `moments` — events/experiences created by hosts
- `moment_participants` — who joined which moment
- `venues` — physical locations owned by merchants
- `merchant_products` — products in the Promorang marketplace
- `merchant_integrations` — Shopify/Square/WooCommerce connections
- `synced_products` — products pulled from external platforms
- `campaigns` — brand sponsorship campaigns
- `organizations` — team/org structure

## Supabase Credentials

- URL: (loaded from env — SUPABASE_URL)
- Service Key: (loaded from env — SUPABASE_SERVICE_KEY)

## E-commerce Integrations

- **Shopify:** OAuth 2.0 flow via `/api/integrations/shopify/*`
- **Square:** OAuth 2.0 flow via `/api/integrations/square/*`
- **WooCommerce:** API key connection via `/api/integrations/woocommerce/*`
- Product sync pulls into `synced_products` table

## Rank System

| Rank | Name | Unlock |
|------|------|--------|
| 0 | Newcomer | Basic access |
| 1 | Explorer | Profile features |
| 2 | Regular | Social features |
| 3 | Creator | Can create moments |
| 4 | Influencer | Premium features |
| 5 | Ambassador | Full platform access |

## Key Decisions

- 2 OpenClaw agents only: `advisor` (stakeholder-facing) and `ops` (platform growth)
- MiniMax M2.5 as primary model, Ollama for heartbeats
- Pre-built skills preferred over custom builds where possible
- "Claim Your Moment" model for scraped events — unclaimed → outreach → claimed
- Resend as transactional email provider (outreach, surveys, digests, NPS)
