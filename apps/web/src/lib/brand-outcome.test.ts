import { describe, expect, it } from "vitest";
import { resolveBrandOutcome } from "./brand-outcome";
import type { Campaign } from "@/hooks/useCampaigns";

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "campaign-1",
    brand_id: "brand-1",
    title: "Store visits",
    description: null,
    budget: 100000,
    reward_type: "voucher",
    reward_value: null,
    target_categories: null,
    start_date: null,
    end_date: null,
    is_active: true,
    impressions: 200,
    redemptions: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    objective_type: "attendance",
    ...overrides,
  };
}

describe("resolveBrandOutcome", () => {
  it("starts with defining one customer outcome", () => {
    const result = resolveBrandOutcome({ campaigns: [] });
    expect(result.nextMove.href).toBe("/create/campaign");
    expect(result.signals.find((signal) => signal.id === "define")?.state).toBe("current");
  });

  it("does not treat recorded budget as proof of funding", () => {
    const result = resolveBrandOutcome({ campaigns: [campaign()] });
    expect(result.signals.find((signal) => signal.id === "fund")?.state).toBe("unknown");
  });

  it("does not infer incremental value from redemptions", () => {
    const result = resolveBrandOutcome({ campaigns: [campaign({ redemptions: 50 })] });
    expect(result.totalRedemptions).toBe(50);
    expect(result.signals.find((signal) => signal.id === "attribute")?.state).toBe("verified");
    expect(result.signals.find((signal) => signal.id === "value")?.state).toBe("unknown");
  });
});
