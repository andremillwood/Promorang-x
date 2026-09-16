import { describe, expect, it } from "vitest";
import {
  PROMORANG_DEMAND_NORTH_STAR,
  evaluateActivationEconomics,
  getStakeholderSuccessContract,
  normalizeStakeholderSuccessRole,
  resolveStakeholderSuccess,
  type StakeholderSuccessRole,
} from "../src/stakeholder-success";

const ECONOMIC_ROLES: StakeholderSuccessRole[] = [
  "participant",
  "creator",
  "host",
  "merchant",
  "brand",
  "agency",
];

describe("stakeholder success contracts", () => {
  it("defines a measurable success contract for every economic stakeholder", () => {
    for (const role of ECONOMIC_ROLES) {
      const contract = getStakeholderSuccessContract(role);
      expect(contract).not.toBeNull();
      expect(contract?.role).toBe(role);
      expect(contract?.purpose.length).toBeGreaterThan(20);
      expect(contract?.outcome.length).toBeGreaterThan(10);
      expect(contract?.northStarMetric.length).toBeGreaterThan(5);
      expect(contract?.steps.length).toBeGreaterThanOrEqual(5);
      expect(new Set(contract?.steps.map((step) => step.signal)).size).toBe(contract?.steps.length);
    }
  });

  it("treats promoter and marketing as specializations instead of new marketplace economies", () => {
    expect(normalizeStakeholderSuccessRole("promoter")).toBe("creator");
    expect(normalizeStakeholderSuccessRole("marketing")).toBe("brand");
    expect(normalizeStakeholderSuccessRole("admin")).toBeNull();
  });

  it("resolves the next merchant success move from observed outcomes", () => {
    const initial = resolveStakeholderSuccess("merchant");
    expect(initial?.currentStep.signal).toBe("merchant_business_ready");
    expect(initial?.stages[0].status).toBe("current");

    const withSupply = resolveStakeholderSuccess("merchant", [
      "merchant_business_ready",
      "merchant_offer_live",
    ]);
    expect(withSupply?.currentStep.signal).toBe("merchant_customer_action_verified");
    expect(withSupply?.stages.slice(0, 2).every((step) => step.status === "done")).toBe(true);

    const sustainable = resolveStakeholderSuccess("merchant", [
      "merchant_business_ready",
      "merchant_offer_live",
      "merchant_customer_action_verified",
      "merchant_value_realized",
      "merchant_repeat_customer_verified",
      "merchant_positive_unit_economics",
    ]);
    expect(sustainable?.isComplete).toBe(true);
    expect(sustainable?.currentStep.signal).toBe("merchant_positive_unit_economics");
  });

  it("uses a platform north star centered on incremental verified demand", () => {
    expect(PROMORANG_DEMAND_NORTH_STAR).toMatch(/incremental verified demand/i);
  });
});

describe("activation economics guardrail", () => {
  it("marks an activation positive only when incremental value exceeds measured activation cost", () => {
    const result = evaluateActivationEconomics({
      incrementalValue: 10_000,
      incentiveCost: 2_000,
      distributionCost: 1_500,
      platformFee: 1_000,
      fulfillmentCost: 500,
    });

    expect(result.status).toBe("positive");
    expect(result.totalActivationCost).toBe(5_000);
    expect(result.netIncrementalContribution).toBe(5_000);
    expect(result.contributionMargin).toBe(0.5);
    expect(result.economicallySustainable).toBe(true);
  });

  it("marks loss-making demand as negative instead of celebrating activity", () => {
    const result = evaluateActivationEconomics({
      incrementalValue: 2_000,
      incentiveCost: 1_500,
      distributionCost: 1_000,
      platformFee: 500,
      fulfillmentCost: 250,
    });

    expect(result.status).toBe("negative");
    expect(result.netIncrementalContribution).toBe(-1_250);
    expect(result.economicallySustainable).toBe(false);
  });

  it("refuses to claim sustainability when incremental value is unknown", () => {
    const result = evaluateActivationEconomics({
      incentiveCost: 500,
      distributionCost: 250,
    });

    expect(result.status).toBe("unknown");
    expect(result.economicallySustainable).toBeNull();
    expect(result.netIncrementalContribution).toBeNull();
  });
});
