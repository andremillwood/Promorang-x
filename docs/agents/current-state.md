# Promorang Current State & System Architecture Assessment

**Date:** August 8, 2026  
**Repository:** `Promorang-x`  
**Status:** Operational Production Application deployed on Vercel  

---

## 1. Executive Summary

Promorang is a production social investing and demand orchestration platform. It connects Brands/Merchants, Creators, Communities/Scenes, Hosts, and Users using economic incentives (PromoPoints, PromoKeys, Gems, USD/Stripe, Content Pieces, Drops, and Moments).

This audit evaluates the codebase to establish the baseline for the **Promorang Agentic Operating Layer (Phase 1)**.

---

## 2. Technical Stack Audit

| Dimension | Implementation Reality | Status |
| :--- | :--- | :--- |
| **Framework & Build System** | Frontend: Vite 5 + React 18 SPA (`apps/web`). Backend: Express 4 serverless app on Vercel (`backend`). *Note: React SPA + Express API serverless functions; NOT Next.js App Router.* | Implemented & Production-Ready |
| **TypeScript Config** | TypeScript 5.8 in `apps/web` (`tsconfig.app.json`), TS 5.9 in `backend` (`tsconfig.json`), shared types in `packages/shared`. | Implemented & Production-Ready |
| **Package Manager** | `npm` with root workspaces (`apps/*`, `packages/*`, `backend`). | Implemented & Production-Ready |
| **Vercel Config** | Monorepo deployment. Root `vercel.json` routes SPA & API; `backend/vercel.json` configures serverless handlers (`/api/*`). | Implemented & Production-Ready |
| **API Architecture** | Express API mounted in `backend/api/index.js` exporting 40+ domain routes (`/api/campaigns`, `/api/moments`, `/api/drops`, `/api/advertisers`, `/api/users`, etc.). | Implemented & Production-Ready |
| **Database Technology** | Supabase (PostgreSQL) with RLS policies, PL/pgSQL functions, triggers, and indices. | Implemented & Production-Ready |
| **Database Schema** | Comprehensive SQL schemas covering `users`, `wallets`, `transactions`, `content_pieces`, `drops`, `drop_applications`, `moments`, `campaigns`, `brand_budgets`, `sponsorships`, `organizations`, `relays`, `coupons`, `merchant_products`, etc. | Implemented & Production-Ready |
| **Authentication Architecture** | Supabase Auth (JWT in `Authorization: Bearer <token>`). Express middleware `requireAuth` (`backend/middleware/auth.js`) verifies Supabase JWTs. | Implemented & Production-Ready |
| **Authorization / Roles** | `user_type` (`regular`, `advertiser`, `admin`), `operators`, user role tables (`merchant`, `brand`, `host`, `pioneer`). | Implemented & Production-Ready |
| **Service Layer** | 130 modular services in `backend/services/` (`brandCampaignService.js`, `campaignCompilerService.js`, `demandPlanCompilerService.js`, `momentService.js`, `gemsService.js`, `resendService.js`, etc.). | Implemented & Production-Ready |
| **Data Access Pattern** | Supabase JS Client (`@supabase/supabase-js`) using Service Role Key server-side, RPC procedures, and PostgreSQL connection pool. | Implemented & Production-Ready |
| **Background Jobs** | `dailyLayerJob.js` (cron) and Vercel Cron endpoints (`/api/cron`). | Implemented & Production-Ready |
| **Analytics Infrastructure** | `merchantAnalyticsService.js`, `brandAnalyticsService.js`, `o2oAnalyticsService.js`, `analytics.js`. | Implemented & Production-Ready |
| **AI Infrastructure** | `aiVerificationService.js` (OCR simulation), `vectorService.js` (vector search stubs), `supabase/functions/agent-surface/index.ts`. Vercel AI SDK (`ai` package) is **absent**. | Partially Implemented / Stubs |

---

## 3. Core Business & Economic Logic Realities

1. **Campaign & Demand Logic:**
   - `demandPlanCompilerService.js` provides deterministic rule-based plan compilation (`classifyGoal`, target extraction, action/proof generation).
   - `campaignCompilerService.js` translates goals (`CONTENT`, `PURCHASE`, `REFERRAL`, `VISIT`) into Moment + Drop specifications.
   - `brandCampaignService.js` handles organization budget allocation (`brand_budgets`) and host discovery.

2. **Missions, Drops & Moments:**
   - **Drops (`drops`, `drop_applications`)**: Creator missions with difficulty tiers, key costs, gem rewards, proof validation requirements, and participant caps.
   - **Moments (`moments`, `moment_participations`)**: Physical or digital events with pricing tiers, attendance tracking, and host escrow pools.
   - **Missions (`missions.js`, `missionAttributionService.js`)**: Attribution tracking connecting user actions to rewards.

3. **Economic Tokens & Currency Mechanics:**
   - **PromoPoints**: XP and loyalty streak rewards (`dynamicPointsService.js`).
   - **PromoKeys**: Access keys required to unlock drops or moments (`masterKeyService.js`).
   - **Gems**: Primary reward/currency unit for commercial drops (`gemsService.js`).
   - **USD / Stripe**: Monetary transactions, sponsor payouts, escrow pools (`stripeService.js`, `payoutService.js`).

4. **Notifications & Email:**
   - `resendService.js`, `emailCampaignService.js`, `smartNotificationService.js`.
   - Messaging: ManyChat WhatsApp integration stubbed (`manychat.js`).

---

## 4. Current AI & Agent Capabilities Assessment

| System | Component | Current Reality | Action Required for Phase 1 |
| :--- | :--- | :--- | :--- |
| **AI SDK** | Vercel AI SDK (`ai`) | **Absent** from `package.json` and `backend/package.json`. | Install `ai` package in backend workspace. |
| **Model Provider** | LLM Integration | No LLM provider SDK wired to agent loops yet. | Configure Vercel AI Gateway / LLM provider via environment variables. |
| **Agent Foundation** | `lib/agents` | No central agent orchestration framework exists in `backend`. | Build clean `backend/lib/agents/` architecture. |
| **Agent Tools** | Controlled Tool Functions | Machine-readable API exists in Deno edge function `agent-surface`, but backend Express lacks typed agent tools. | Create typed, authorized read/write tool definitions wrapping service layer. |
| **Operator UI** | Campaign Intelligence Interface | Web app has Brand/Merchant dashboards, but no dedicated Campaign Intelligence Operator view. | Build internal operator experience in `apps/web`. |

---

## 5. Summary Matrix of Existing Capabilities

| Capability | Status | Source Module | Agent Tool Potential |
| :--- | :--- | :--- | :--- |
| Inspect Merchant Profile & Products | Implemented | `merchantProductService.js`, `merchantSalesService.js` | `inspectMerchant` (Read) |
| Inspect Campaign & Performance | Implemented | `brandCampaignService.js`, `brandAnalyticsService.js` | `inspectCampaign`, `getCampaignPerformance` (Read) |
| Search Relevant Users / Creators | Implemented | `demographicTargetingService.js`, `creatorEconomicsService.js` | `findCreators`, `findRelevantUsers` (Read) |
| Search Moments & Communities | Implemented | `momentService.js`, `organizations.js`, `seasons` | `findMoments`, `findCommunities`, `findScenes` (Read) |
| Social & Engagement Metrics | Implemented | `socialService.js`, `impactService.js` | `getSocialMetrics`, `getAudienceSignals` (Read) |
| Estimate Reach & Reward Economics | Implemented | `momentPricingService.js`, `demandPlanCompilerService.js` | `estimateReach`, `estimateRewardCost` (Read) |
| Create Draft Campaign | Implemented | `brandCampaignService.js`, `demandPlanCompilerService.js` | `createCampaignDraft` (Write - Draft Only) |
