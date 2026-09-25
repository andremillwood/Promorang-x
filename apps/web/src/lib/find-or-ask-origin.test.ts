import { describe, expect, it } from "vitest";
import { stakeholderRoutes } from "@/lib/find-or-ask-stakeholder";

describe("find-or-ask origin handoff URLs", () => {
  it("carries the originating Discovery and action into a Moment workflow", () => {
    const route = stakeholderRoutes("host", "origin-123")[0];
    expect(route.href).toContain("origin_discovery=origin-123");
    expect(route.href).toContain("origin_action=create_moment");
  });

  it("carries the originating Discovery into Offer and Content workflows", () => {
    expect(stakeholderRoutes("merchant", "origin-123").find((row) => row.action === "create_offer")?.href).toContain("origin_discovery=origin-123");
    expect(stakeholderRoutes("creator", "origin-123").find((row) => row.action === "create_content")?.href).toContain("origin_discovery=origin-123");
  });
});
