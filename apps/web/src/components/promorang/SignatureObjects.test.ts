import { describe, expect, it } from "vitest";
import { formatPromoPassId } from "./SignatureObjects";

describe("formatPromoPassId", () => {
  it("formats a member id into a proprietary pass number", () => {
    expect(formatPromoPassId("user-abc-123")).toBe("PROMO • USER • ABC1 • 2300");
  });

  it("uses the same fallback pass number as the wallet card", () => {
    expect(formatPromoPassId()).toBe("PROMO • 8760 • 4921 • 0038");
  });
});
