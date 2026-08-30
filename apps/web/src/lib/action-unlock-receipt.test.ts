import { describe, expect, it } from "vitest";
import { buildActionUnlockReceipt } from "./action-unlock-receipt";

describe("buildActionUnlockReceipt", () => {
  it("names the proof, the unlock, and the next keep", () => {
    const receipt = buildActionUnlockReceipt(
      { action: "check_in", momentName: "Open mic", perk: "House fries on the house" },
      {
        checkInHeading: "You're on the list",
        checkInProved: "You showed up in person",
        checkInUnlocked: "This night now counts",
        checkInNext: "Keep it in Vault",
        checkInCta: "Open Vault",
      },
    );

    expect(receipt.heading).toContain("Open mic");
    expect(receipt.proved).toBe("You showed up in person");
    expect(receipt.unlocked).toBe("House fries on the house");
    expect(receipt.nextHref).toBe("/vault");
  });
});
