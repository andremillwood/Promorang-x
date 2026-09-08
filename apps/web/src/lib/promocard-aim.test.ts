import { describe, expect, it } from "vitest";
import { resolvePromoCardAim } from "@promorang/shared";
import { matchPollForAim, promoCardAimFromNext, promoCardAimFromSearch } from "./promocard-aim";

describe("PromoCard aim helpers", () => {
  it("reads aim from card and signup next paths", () => {
    expect(promoCardAimFromSearch("aim=barbican")?.id).toBe("barbican");
    expect(promoCardAimFromNext("/card?aim=tonight")?.id).toBe("tonight");
    expect(promoCardAimFromNext("https://evil.example/card?aim=food")).toBeNull();
  });

  it("picks a live Discover poll for the aim instead of inventing one", () => {
    const aim = resolvePromoCardAim("kingston-after-dark")!;
    const match = matchPollForAim(aim, [
      {
        id: "jerk",
        question: "Which Kingston jerk spot is undisputed King on a Friday evening?",
        category: "Food",
        targetUnlockPerk: "25% Off Jerk Platter",
        tags: ["Jerk Chicken"],
      },
      {
        id: "night",
        question: "Which Wednesday after-work hangout spot needs exclusive table perks?",
        category: "Kingston After Dark",
        targetUnlockPerk: "20% Tab Discount",
        tags: ["Nightlife", "Cocktails"],
      },
    ]);
    expect(match?.id).toBe("night");
    expect(matchPollForAim(aim, [])).toBeNull();
  });
});
