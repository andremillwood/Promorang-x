import { describe, expect, it } from "vitest";

import {
  PARTICIPANT_ECONOMY,
  resolveParticipantEconomyTier,
} from "../src/index";

describe("participant economy authority", () => {
  it("preserves Point conversion without allowing it to define Master Key activation", () => {
    expect(PARTICIPANT_ECONOMY.pointsPerPromoKey).toBe(500);
    expect(PARTICIPANT_ECONOMY.maxDailyPromoKeyConversions).toBe(3);
  });

  it("preserves the 1x/1.5x/2x and 5/2/1 level structure", () => {
    expect(PARTICIPANT_ECONOMY.tiers.starter).toMatchObject({ pointsMultiplier: 1, dailyMasterKeyProofs: 5 });
    expect(PARTICIPANT_ECONOMY.tiers.professional).toMatchObject({ pointsMultiplier: 1.5, dailyMasterKeyProofs: 2 });
    expect(PARTICIPANT_ECONOMY.tiers.power_user).toMatchObject({ pointsMultiplier: 2, dailyMasterKeyProofs: 1 });
  });

  it("maps historical subscription names to one economic level", () => {
    expect(resolveParticipantEconomyTier("free").id).toBe("starter");
    expect(resolveParticipantEconomyTier("premium").id).toBe("professional");
    expect(resolveParticipantEconomyTier("pro").id).toBe("professional");
    expect(resolveParticipantEconomyTier("super").id).toBe("power_user");
    expect(resolveParticipantEconomyTier("elite").id).toBe("power_user");
  });
});
