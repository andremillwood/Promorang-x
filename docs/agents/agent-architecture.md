# Promorang Agent Architecture & Execution Framework

**Document:** `docs/agents/agent-architecture.md`  
**Phase:** Phase 1 Foundation  
**System Role:** Intelligence and Orchestration Layer operating Promorang  

---

## 1. Core Architectural Principle

> **Promorang remains the system of record and execution. Agents become an intelligence/orchestration layer operating Promorang through explicit, controlled tools.**

LLMs do NOT replace deterministic business logic, financial calculations, database constraints, or permission rules.

```
+-----------------------------------------------------------------------------------+
|                              HUMAN OPERATOR / MERCHANT                            |
|                 Provides Objectives, Reviews Drafts, Gives Approvals              |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         PROMORANG AGENTIC LAYER (Vercel AI SDK)                   |
|  - Promorang Campaign Operator Agent                                              |
|  - Structured Reasoning & Network Matching                                        |
|  - Context Assembly & Tool Orchestration                                          |
+-----------------------------------------------------------------------------------+
                                          |
                        Executes Authorized Tools Only
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                          EXPLICIT CONTROLLED TOOL LAYER                           |
|  Read Tools: inspectMerchant, inspectCampaign, findCreators, findMoments, etc.    |
|  Write Tools: createCampaignDraft (DRAFT ONLY)                                    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                      DETERMINISTIC APPLICATION & SERVICE LAYER                    |
|  Auth, RLS Policies, Financial Balances, Verification Rules, Database Schema       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Three Execution Boundaries

### Category A: Deterministic Application Logic (Pure TypeScript / Service Code)
- **Scope:**
  - Authentication verification (`requireAuth`, Supabase JWT validation).
  - Financial calculations, balance checks, wallet updates (`wallets`, `transactions`).
  - Budget allocations (`brand_budgets`) and escrow locking (`momentEscrowService`).
  - Reward issuance (PromoPoints, PromoKeys, Gems).
  - Validation of inputs, DB integrity constraints, RLS policies.
  - Verification execution (OCR proof checking, QR scanning, link matching).
  - Rate limiting and API quota enforcement.
- **Rule:** LLMs MUST NOT execute or override this logic.

### Category B: Agent Reasoning (Vercel AI SDK Agent)
- **Scope:**
  - Interpreting merchant/brand objective statements.
  - Analyzing target audience and category alignment.
  - Searching network inventory (Creators, Moments, Scenes, Communities).
  - Recommending optimal mission structures, proof mechanisms, and reward amounts.
  - Constructing structured campaign plans based on verified platform data.
  - Diagnosing missing information or insufficient network data.
- **Rule:** Agents act strictly through declared tools and return structured evidence-based recommendations.

### Category C: Human Approval Boundary
- **Scope (Phase 1):**
  - Publishing campaigns to live network.
  - Transferring real currency / debiting Stripe or brand wallets.
  - Issuing material rewards or releasing escrow.
  - Mass notifications, WhatsApp messages, or bulk email blasts.
  - Changing merchant budget thresholds or reward economics.
- **Rule:** Phase 1 stops at `createCampaignDraft`. Human approval is MANDATORY for publication and expenditure.

---

## 3. Tool Boundary & API Architecture

Agents receive NO direct database query tool (`queryDatabaseAnything` is strictly forbidden).

All capabilities are exposed as typed, authorization-enforced functions:

```typescript
// Example Tool Signature Structure
export const inspectMerchantTool = tool({
  description: 'Retrieve verified details, products, and campaign history for a merchant organization.',
  parameters: z.object({
    organizationId: z.string().describe('The organization UUID of the merchant'),
  }),
  execute: async ({ organizationId }, { context }) => {
    // 1. Enforce Auth & Tenant Access
    enforceTenantAccess(context.user, organizationId);
    // 2. Execute Service Function
    const merchantData = await merchantService.getOrganizationDetails(organizationId);
    // 3. Return Filtered, Non-Sensitive Data
    return sanitizeMerchantOutput(merchantData);
  }
});
```

---

## 4. Security & Safety Requirements

1. **Authentication & Authorization:**
   - Every agent execution requires a valid authenticated user context (`req.user`).
   - Every tool call evaluates authorization against the user's role and organization ID.

2. **Data Minimization:**
   - PII (emails, payment tokens, phone numbers) is sanitized out of tool return payloads before being passed to model context.

3. **Hallucination Protection:**
   - System prompts strictly instruct the agent to distinguish between ground-truth retrieved platform data and assumptions.
   - If zero creators or moments match a query, the tool returns an empty list, and the agent explicitly reports data absence rather than fabricating entities.

4. **Write Control:**
   - The only write tool implemented in Phase 1 is `createCampaignDraft`.
   - Created drafts are assigned `status: 'draft'` and `readiness.state: 'needs_approval'`.

---

## 5. Observability & Agent Tracing

Every agent execution logs an immutable trace record storing:
- `agentName`: `promorang-campaign-operator`
- `requestedBy`: User ID
- `organizationId`: Tenant ID
- `objectiveInput`: Original input prompt and filters
- `toolCalls`: List of tools invoked, arguments passed, success/failure status, and execution duration
- `resultingDraftId`: ID of the compiled campaign draft (if saved)
- `timestamp`: ISO timestamp
