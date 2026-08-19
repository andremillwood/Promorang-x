# Promorang Agentic Operating Layer — Phase 1 Implementation Plan

**Document:** `docs/agents/phase-1-plan.md`  
**Goal:** Build the foundational Promorang Campaign Operator Agent and Internal Campaign Intelligence UI.  

---

## 1. Phase 1 Goal & Deliverables

Phase 1 establishes the initial agentic foundation for Promorang. It delivers:
1. **Vercel AI SDK Architecture:** Integration of `ai` package into backend services.
2. **Controlled Tool Layer:** Read-only network inspection tools + 1 controlled draft creation tool.
3. **Promorang Campaign Operator Agent:** AI Agent that transforms raw merchant objectives into evidence-grounded campaign recommendations.
4. **Internal Campaign Intelligence UI:** Web interface in `apps/web` for operators to request campaign plans, inspect evidence, edit, and save drafts.
5. **Observability & Security Enforcement:** Authorized execution, trace logging, and strict draft-only write controls.

---

## 2. Capability Tool Matrix

| Capability | Exists in Service Layer? | Underlying Source | Phase 1 Agent Tool | Read/Write | Risk Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Inspect Merchant Profile | Yes | `merchantProductService.js` | `inspectMerchant` | Read | Low |
| Inspect Existing Campaign | Yes | `brandCampaignService.js` | `inspectCampaign` | Read | Low |
| Search Creators | Yes | `creatorEconomicsService.js`, `users` | `findCreators` | Read | Low |
| Search Moments & Venues | Yes | `momentService.js`, `moments` | `findMoments` | Read | Low |
| Search Communities / Hubs | Yes | `organizations.js`, `seasons` | `findCommunities` | Read | Low |
| Get Social & Audience Metrics | Yes | `socialService.js`, `demographicTargetingService.js` | `getAudienceSignals` | Read | Low |
| Estimate Economics & Reach | Yes | `demandPlanCompilerService.js`, `momentPricingService.js` | `estimateRewardCost` | Read | Low |
| Create Campaign Draft | Yes | `demandPlanCompilerService.js`, `brandCampaignService.js` | `createCampaignDraft` | Write | Low (Draft Only) |

---

## 3. Targeted Code Changes & Architecture

### Backend Workspace (`backend/`)
- Install `ai` package (Vercel AI SDK) and compatible provider adapter.
- New Directory: `backend/lib/agents/`
  - `types.ts` / `types.js`: Agent request, response, and trace types.
  - `tools.js`: Tool definitions wrapping service calls.
  - `campaignOperatorAgent.js`: Campaign Operator Agent runner using Vercel AI SDK.
  - `agentTraceService.js`: Execution trace logger.
- New API Router: `backend/api/agent.js`
  - `POST /api/agent/campaign-operator/plan`: Generates structured campaign recommendation.
  - `POST /api/agent/campaign-operator/draft`: Saves approved recommendation as official draft.
  - `GET /api/agent/traces`: Lists agent execution logs (for admin/audit).
- Mount `/api/agent` in `backend/api/index.js`.

### Frontend Web Workspace (`apps/web/`)
- New Page / Component: `apps/web/src/pages/CampaignIntelligence.tsx` (or operator view in Brand Dashboard).
- Features:
  - Form inputs: Objective statement, Target Audience, Budget, Location, Timeframe.
  - Action button: `[ BUILD CAMPAIGN PLAN ]`
  - Structured Report Output: Goal classification, Grounded platform evidence, Recommended Creators, Recommended Moments, Reward Economics, Risk & Missing Data, Next Actions.
  - Action button: `[ SAVE AS DRAFT ]`

---

## 4. Verification Plan

1. **Unit & Capability Tests:**
   - Test tool parameter validation (Zod schema checks).
   - Test empty network state handling (hallucination resistance).
   - Test draft compilation (`createCampaignDraft` creates `status = 'draft'`).
2. **Security & Authorization Tests:**
   - Verify unauthenticated requests return 401.
   - Verify non-organization members cannot query private organization details.
3. **Production Build Validation:**
   - Run typecheck (`tsc --noEmit`).
   - Run linter (`npm run lint`).
   - Run workspace build (`npm run build`).
