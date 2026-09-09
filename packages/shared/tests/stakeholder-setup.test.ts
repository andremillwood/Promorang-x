import { describe, expect, it } from "vitest";
import { getStakeholderHowLead, getStakeholderSetup } from "../src/stakeholder-setup";

describe("stakeholder setup playbook", () => {
  it("sends a merchant through venue, inventory, share, then the scanner", () => {
    const setup = getStakeholderSetup("merchant");
    expect(setup.steps.map((step) => step.href)).toEqual([
      "/dashboard/venues/add",
      "/stock",
      "/give",
      "/staff/scanner",
    ]);
    expect(setup.steps[0].youPutIn).toMatch(/place/i);
    expect(setup.steps[1].youPutIn).toMatch(/benefit/i);
  });

  it("makes a brand fund a perk before launching a campaign", () => {
    const setup = getStakeholderSetup("brand");
    expect(setup.steps.map((step) => step.href)).toEqual([
      "/stock",
      "/create/campaign",
      "/earn",
      "/happened",
    ]);
    expect(setup.why).toMatch(/inventory/i);
  });

  it("lets a creator take a live perk or publish a drop brands can sponsor", () => {
    const setup = getStakeholderSetup("creator");
    expect(setup.steps.map((step) => step.href)).toEqual([
      "/earn",
      "/content-drops",
      "/give",
      "/card",
    ]);
    expect(setup.why).toMatch(/do not invent inventory/i);
  });

  it("keeps host gatherings attached to a merchant-validated perk", () => {
    const setup = getStakeholderSetup("host");
    expect(setup.steps[0].href).toBe("/create/moment");
    expect(setup.steps[1].href).toBe("/give");
    expect(setup.steps[2].href).toBe("/staff/scanner");
  });

  it("sends a member to live perks, not polls or Earn jargon", () => {
    const setup = getStakeholderSetup("participant");
    expect(setup.steps.map((step) => step.href)).toEqual([
      "/discover?tab=perks",
      "/discover?tab=perks",
      "/card",
    ]);
    expect(setup.why).toMatch(/perk is a real offer/i);
    expect(getStakeholderHowLead("participant", "earn").nextHref).toBe("/discover?tab=perks");
  });

  it("names the how on setup surfaces", () => {
    expect(getStakeholderHowLead("merchant", "stock").nextHref).toBe("/dashboard/venues/add");
    expect(getStakeholderHowLead("brand", "stock").nextHref).toBe("/create/campaign");
    expect(getStakeholderHowLead("brand", "campaign").nextHref).toBe("/stock");
    expect(getStakeholderHowLead("creator", "earn").nextHref).toBe("/content-drops");
    expect(getStakeholderHowLead("creator", "drops").body).toMatch(/live perk/i);
  });
});
