import { describe, expect, it } from "vitest";
import { DEMAND_PLAN_VERSION, getDemandPlanReadiness, validateDemandPlan, type DemandPlan } from "../src/demand-plan";

const plan: DemandPlan = {
  version: DEMAND_PLAN_VERSION,
  status: "draft",
  title: "Bring Tuesday lunch back to life",
  promise: "A welcoming lunch worth returning for",
  intent: { statement: "Bring 20 people on quiet Tuesdays", goal: "bring_people", businessName: "Pat's Place", targetCount: 20, timeframe: "Tuesday lunch", location: "Kingston", constraints: [] },
  people: { audience: "Nearby lunch guests", participantLimit: 20, eligibility: [] },
  experience: { publicType: "moment", invitation: "Join us for Tuesday lunch", actions: [{ id: "visit", type: "visit", label: "Visit for lunch", required: true, proof: "qr" }] },
  sharedValue: [{ type: "promopoints", reason: "Recognize verified participation", amount: 50, unit: "points", fundingRequired: false }],
  distribution: [{ channel: "pulse", reason: "Reach nearby people", enabled: true }],
  returnPath: { reviewPrompt: true, referralPrompt: true, loyaltyFollowUp: true, nextInvitation: "Come back next Tuesday" },
  measurement: { primaryOutcome: "Verified visits", successEvent: "verified_visit", supportingEvents: ["campaign_view", "campaign_joined"], guardrails: ["capacity_exceeded"], forecast: { low: 10, expected: 20, high: 25, unit: "verified visits", confidence: "low", basis: "Intent target; no comparable campaign data yet" } },
  readiness: { state: "ready", missing: [], warnings: [] },
  generatedAt: new Date(0).toISOString(),
};

describe("Demand plan contract", () => {
  it("keeps human intent, proof, value, distribution, return, and measurement together", () => {
    expect(validateDemandPlan(plan)).toEqual([]);
    expect(plan.sharedValue[0].type).toBe("promopoints");
    expect(plan.returnPath.loyaltyFollowUp).toBe(true);
  });

  it("does not confuse funded value with contribution recognition", () => {
    const withGems: DemandPlan = { ...plan, sharedValue: [...plan.sharedValue, { type: "gems", reason: "Fund a customer benefit", amount: 10, unit: "gems", fundingRequired: true }] };
    expect(getDemandPlanReadiness(withGems).state).toBe("needs_funding");
    expect(getDemandPlanReadiness(plan).state).toBe("ready");
  });
});
