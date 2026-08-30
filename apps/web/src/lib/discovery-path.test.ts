import { describe, expect, it } from "vitest";
import {
  buildDiscoveryPath,
  discoverPathHref,
  inferLensesFromPreferences,
  isDiscoverLensId,
  scorePollForLenses,
  whyForPoll,
  type PathablePoll,
} from "./discovery-path";

const eatPoll: PathablePoll = {
  id: "jerk",
  question: "Which Kingston jerk spot is undisputed King on a Friday evening?",
  category: "Cultural Showdown",
  categorySlug: "cultural-debate",
  description: "Vote to back your spot and unlock a tasting pass.",
  targetUnlockPerk: "25% Off Jerk Platter",
  tags: ["Jerk Chicken", "Kingston Food", "Foodies"],
  totalVotes: 112,
  thresholdForMoment: 120,
};

const nightPoll: PathablePoll = {
  id: "night",
  question: "Which Wednesday after-work hangout spot needs exclusive table perks?",
  category: "Kingston After Dark",
  categorySlug: "after-dark",
  description: "Vote for the venue that deserves VIP table reservations.",
  targetUnlockPerk: "20% Tab Discount",
  tags: ["Nightlife", "Cocktails", "Kingston Bars"],
  totalVotes: 58,
  thresholdForMoment: 60,
};

const farEatPoll: PathablePoll = {
  id: "arla",
  question: "Rasta Pasta or Chocolate Chip Mousse?",
  category: "Arla Taste-Off",
  tags: ["Taste-Off", "Dessert"],
  targetUnlockPerk: "Chef Recipe Pack",
  totalVotes: 10,
  thresholdForMoment: 200,
};

describe("inferLensesFromPreferences", () => {
  it("maps saved taste into discovery lenses", () => {
    expect(inferLensesFromPreferences(["Food", "Music", "Community"])).toEqual([
      "eat",
      "go_out",
      "hang",
    ]);
  });

  it("returns nothing when taste has not been named yet", () => {
    expect(inferLensesFromPreferences([])).toEqual([]);
    expect(inferLensesFromPreferences(null)).toEqual([]);
  });
});

describe("isDiscoverLensId", () => {
  it("accepts only the four human paths", () => {
    expect(isDiscoverLensId("eat")).toBe(true);
    expect(isDiscoverLensId("polls")).toBe(false);
    expect(isDiscoverLensId(null)).toBe(false);
  });
});

describe("scorePollForLenses", () => {
  it("scores food questions higher on the eat path than nightlife", () => {
    expect(scorePollForLenses(eatPoll, ["eat"])).toBeGreaterThan(scorePollForLenses(nightPoll, ["eat"]));
  });

  it("scores nightlife higher on the go-out path", () => {
    expect(scorePollForLenses(nightPoll, ["go_out"])).toBeGreaterThan(scorePollForLenses(eatPoll, ["go_out"]));
  });
});

describe("buildDiscoveryPath", () => {
  it("puts the closest matching poll first instead of dumping every poll", () => {
    const path = buildDiscoveryPath({
      polls: [farEatPoll, nightPoll, eatPoll],
      lenses: ["eat"],
      cityName: "Kingston",
    });

    expect(path.map((item) => item.poll.id)).toEqual(["jerk", "arla"]);
    expect(path[0].why.kind).toBe("close");
    expect(path[0].why.votesRemaining).toBe(8);
  });

  it("leaves already-answered and skipped polls out of the path", () => {
    const path = buildDiscoveryPath({
      polls: [eatPoll, farEatPoll],
      lenses: ["eat"],
      votedIds: ["jerk"],
      skippedIds: ["arla"],
    });

    expect(path).toEqual([]);
  });

  it("returns no path when a named lens matches nothing live", () => {
    const unknown: PathablePoll = {
      id: "other",
      question: "Which mural should get the next wall?",
      category: "Arts",
      tags: ["mural"],
      totalVotes: 4,
      thresholdForMoment: 20,
    };

    expect(
      buildDiscoveryPath({
        polls: [unknown],
        lenses: ["eat"],
        cityName: "Kingston",
      }),
    ).toEqual([]);
  });

  it("ranks a write-in intent over the four starter lenses", () => {
    const path = buildDiscoveryPath({
      polls: [eatPoll, nightPoll],
      lenses: [],
      query: "cocktails after work",
      cityName: "Kingston",
    });

    expect(path.map((item) => item.poll.id)).toEqual(["night"]);
    expect(path[0].why.kind).toBe("query");
  });

  it("returns no path when a write-in matches nothing live", () => {
    expect(
      buildDiscoveryPath({
        polls: [eatPoll, nightPoll],
        lenses: [],
        query: "hiking with kids",
      }),
    ).toEqual([]);
  });

  it("keeps the path short", () => {
    const polls = Array.from({ length: 8 }, (_, index) => ({
      ...eatPoll,
      id: `eat-${index}`,
    }));

    expect(buildDiscoveryPath({ polls, lenses: ["eat"] })).toHaveLength(4);
  });
});

describe("discoverPathHref", () => {
  it("keeps a matching write-in on the Discover path so we can use it again", () => {
    expect(discoverPathHref("cocktails after work")).toBe(
      "/discover?tab=discoveries&q=cocktails%20after%20work",
    );
    expect(discoverPathHref("")).toBe("/discover?tab=discoveries");
  });
});

describe("whyForPoll", () => {
  it("explains closeness when a matching poll is about to unlock", () => {
    const why = whyForPoll(eatPoll, ["eat"], "Kingston");
    expect(why.kind).toBe("close");
    expect(why.lens).toBe("eat");
    expect(why.perk).toContain("Jerk");
    expect(why.query).toBe("");
  });
});
