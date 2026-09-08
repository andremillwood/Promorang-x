import { describe, expect, it } from "vitest";
import { stakeholderMobileNav, stakeholderNavItems } from "./stakeholderNav";

describe("stakeholder navigation", () => {
  it("gives host, merchant, and participant different put-in destinations", () => {
    const putIn = (role: "participant" | "host" | "merchant") =>
      stakeholderMobileNav(role).find((item) => item.accent)?.href;

    expect(putIn("participant")).toBe("/earn");
    expect(putIn("host")).toBe("/create/moment");
    expect(putIn("merchant")).toBe("/stock");
  });

  it("keeps World, Activity, and Card in the primary loop", () => {
    const labels = stakeholderMobileNav("merchant").map((item) => item.label);
    expect(labels).toEqual(["Today", "World", "Used", "Put up", "Card"]);
  });

  it("shows merchant redeem tools after the host-only manage bug", () => {
    const manage = stakeholderNavItems("merchant")
      .filter((item) => item.group === "manage")
      .map((item) => item.label);
    expect(manage).toContain("Redeem");
    expect(manage).toContain("Storefront");
  });
});
