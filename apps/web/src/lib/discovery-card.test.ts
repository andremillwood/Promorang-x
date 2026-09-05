import { describe, expect, it } from "vitest";
import {
  cardsOnAsk,
  mergeUnlockTallies,
  perkTitleForPoll,
  tallyCardUnlocks,
  unlockFromPoll,
} from "./discovery-card";

const poll = {
  id: "jerk",
  question: "Which Kingston jerk spot is undisputed King on a Friday evening?",
  targetUnlockPerk: "25% Off Jerk Platter",
};

describe("perkTitleForPoll", () => {
  it("strips emoji and keeps the perk words", () => {
    expect(perkTitleForPoll({ targetUnlockPerk: "🎁 25% Off Jerk Platter" })).toBe("25% Off Jerk Platter");
  });

  it("falls back to a city perk when nothing is named", () => {
    expect(perkTitleForPoll({ question: "Any night?" })).toBe("City perk");
  });
});

describe("unlockFromPoll", () => {
  it("lands one perk per poll and reuses the existing slip", () => {
    const first = unlockFromPoll({ poll, city: "Kingston" });
    expect(first.perkTitle).toBe("25% Off Jerk Platter");
    expect(first.redemptionCode.startsWith("PR-")).toBe(true);
    const again = unlockFromPoll({ poll, city: "Kingston", existing: first });
    expect(again.redemptionCode).toBe(first.redemptionCode);
  });
});

describe("tallyCardUnlocks", () => {
  it("counts spendable cards separately from used ones", () => {
    const tallies = tallyCardUnlocks([
      { pollId: "jerk", status: "claimed" },
      { pollId: "jerk", status: "claimed" },
      { pollId: "jerk", status: "used" },
      { pollId: "night", status: "claimed" },
    ]);
    expect(tallies[0]).toEqual({ pollId: "jerk", onCards: 2, used: 1 });
    expect(cardsOnAsk(["jerk", "night"], tallies)).toBe(3);
  });
});

describe("mergeUnlockTallies", () => {
  it("keeps the stronger city count when local and remote overlap", () => {
    const merged = mergeUnlockTallies(
      [{ pollId: "jerk", onCards: 1, used: 0 }],
      [{ pollId: "jerk", onCards: 6, used: 2 }],
    );
    expect(merged).toEqual([{ pollId: "jerk", onCards: 6, used: 2 }]);
  });
});
