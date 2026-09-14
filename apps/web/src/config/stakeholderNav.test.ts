import { describe, expect, it } from "vitest";
import { stakeholderMobileNav, stakeholderNavItems } from "./stakeholderNav";

describe("stakeholder navigation", () => {
  it("keeps participant and host put-in destinations role-specific", () => {
    const putIn = (role: "participant" | "host") =>
      stakeholderMobileNav(role).find((item) => item.accent)?.href;

    expect(putIn("participant")).toBe("/discover?tab=perks");
    expect(putIn("host")).toBe("/create/moment");
  });

  it("gives merchants a business-outcome primary navigation", () => {
    const labels = stakeholderMobileNav("merchant").map((item) => item.label);
    expect(labels).toEqual(["Home", "Promotions", "Customers", "Sales & Results", "Business"]);
  });

  it("routes merchant destinations through the consolidated workspace", () => {
    const items = stakeholderMobileNav("merchant");
    expect(items.map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard?tab=promotions",
      "/dashboard?tab=customers",
      "/dashboard?tab=results",
      "/dashboard?tab=business",
    ]);
    expect(items.find((item) => item.accent)?.label).toBe("Promotions");
  });

  it("keeps merchant settings available without exposing legacy manage surfaces", () => {
    const items = stakeholderNavItems("merchant");
    expect(items.filter((item) => item.group === "manage")).toHaveLength(0);
    expect(items.find((item) => item.group === "utility")?.href).toBe("/dashboard/settings");
  });

  it("surfaces brand campaign launch and creator content drops in manage", () => {
    expect(stakeholderNavItems("brand").map((item) => item.href)).toContain("/create/campaign");
    expect(stakeholderNavItems("creator").map((item) => item.href)).toContain("/content-drops");
  });
});
