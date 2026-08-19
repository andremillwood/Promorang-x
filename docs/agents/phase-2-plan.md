# Promorang Agentic Operating Layer — Phase 2 Implementation Plan

**Document:** `docs/agents/phase-2-plan.md`  
**Phase:** Phase 2: Controlled Activation, Mobilization & Performance Diagnostics  
**Architectural Goal:** Extend the agent loop from DRAFT into CONTROLLED ACTIVATION, CREATOR/HOST MOBILIZATION, and TELEMETRY DIAGNOSTICS.

---

## 1. Operating Loop Evolution in Phase 2

Phase 1 established:
`OBSERVE → REASON → RECOMMEND → CREATE DRAFT`

Phase 2 completes the human-in-the-loop operational cycle:
```
DRAFT CAMPAIGN
      │
      v
HUMAN REVIEW & BUDGET LOCK (Human Approval Boundary)
      │
      v
CONTROLLED ACTIVATION (approveAndPublishCampaign)
      │
      v
CREATOR & MOMENT MOBILIZATION (mobilizeCreators / activateMoment)
      │
      v
REAL-TIME TELEMETRY (getCampaignTelemetry)
      │
      v
AGENT DIAGNOSTICS & OPTIMIZATION RECOMMENDATIONS (diagnoseCampaignPerformance)
```

---

## 2. Phase 2 Tools Matrix

| Tool | Type | Underlying Capabilities / Services | Risk Level & Safety Controls |
| :--- | :--- | :--- | :--- |
| `approveAndPublishCampaign` | Controlled Write | `brandCampaignService.js`, `brandBudgetService.js` | **High Risk:** Requires human confirmation, organization access check, and verified brand budget balance before changing status from `draft` to `active`. |
| `mobilizeCreators` | Controlled Write (Outreach) | `contentDistributionService.js`, `notificationService.js` | **Medium Risk:** Creates targeted drop invitations / notifications for eligible creators. |
| `activateMoment` | Controlled Write | `momentService.js`, `momentEscrowService.js` | **Medium Risk:** Binds moment event to campaign and initializes escrow pool. |
| `getCampaignTelemetry` | Read Tool | `proofOutcomeService.js`, `brandAnalyticsService.js` | **Low Risk:** Reads verified check-in velocity, drop submissions, and reward burn. |
| `diagnoseCampaignPerformance` | Agent Reasoning | `campaignLearningService.js`, Vercel AI SDK | **Low Risk:** Diagnoses root causes of performance bottlenecks (under-rewarding, poor reach, proof friction). |
| `recommendOptimization` | Agent Reasoning | `demandPlanCompilerService.js` | **Low Risk:** Generates optimization draft recommendations for human approval. |

---

## 3. Human Approval & Activation Safeguards

1. **Explicit Budget Verification:** `approveAndPublishCampaign` verifies that `availableBudget >= totalGemsPool + platformFee` before publishing.
2. **Organization Access Control:** Only users with `advertiser` or `brand` role belonging to the campaign's organization ID can trigger activation.
3. **Reversibility:** Active campaigns can be paused controlledly via emergency pause guardrails.
4. **Audit Logging:** Every activation, creator mobilization, and optimization application generates a non-repudiable trace record in `agent_traces`.

---

## 4. UI Enhancements (`apps/web`)

1. **Campaign Intelligence Operator Panel (`/campaign-intelligence`):**
   - **Draft Activation Workspace:** View all compiled campaign drafts, inspect missing requirements, confirm budget lock, and execute `[ APPROVE & PUBLISH ]`.
   - **Live Campaign Telemetry Dashboard:** View real-time participation velocity, verified check-ins, reward burn rate, and ROI.
   - **Agent Performance Diagnostic Console:** Trigger `[ RUN DIAGNOSTICS ]` to get agent analysis on active campaigns and review optimization proposals.
