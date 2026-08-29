import { describe, expect, it } from "vitest";
import {
  buildPeopleMomentInsert,
  originTypeLabel,
  sharePathForMoment,
  sharePathForPlan,
} from "@promorang/shared";

describe("people-first create contract", () => {
  it("lets an ordinary person start a Here now Moment", () => {
    const row = buildPeopleMomentInsert(
      {
        title: "We're at Dulce",
        location: "Dulce",
        hereNow: true,
        privacy: "public",
      },
      "user-42",
    );

    expect(row.origin_type).toBe("community");
    expect(row.here_now).toBe(true);
    expect(row.status).toBe("active");
    expect(row.claim_status).toBe("unclaimed");
    expect(originTypeLabel(row.origin_type)).toBe("Open Moment");
  });

  it("keeps invite attribution on Moment and Plan links", () => {
    expect(sharePathForMoment("abc", "friend-1")).toContain("invitedBy=friend-1");
    expect(sharePathForPlan("plan-1", "friend-1")).toBe("/plans/plan-1?invitedBy=friend-1");
  });
});
