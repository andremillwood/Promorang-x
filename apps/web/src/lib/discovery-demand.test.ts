import { describe, expect, it } from "vitest";
import {
  buildDiscoveryDemandInbox,
  closenessForPoll,
  normalizeIntentKey,
  optionShares,
  type DemandPoll,
} from "./discovery-demand";

const jerk: DemandPoll = {
  id: "jerk",
  slug: "kingston-jerk",
  question: "Which Kingston jerk spot is undisputed King on a Friday evening?",
  tags: ["Jerk Chicken", "Kingston Food"],
  targetUnlockPerk: "25% Off Jerk Platter",
  totalVotes: 112,
  thresholdForMoment: 120,
  options: [
    { text: "Sweetwood", votes: 48 },
    { text: "Scotchies", votes: 39 },
    { text: "Boston", votes: 16 },
  ],
};

const night: DemandPoll = {
  id: "night",
  question: "Which Wednesday after-work hangout needs exclusive table perks?",
  tags: ["Nightlife", "Cocktails"],
  targetUnlockPerk: "20% Tab Discount",
  totalVotes: 10,
  thresholdForMoment: 80,
  options: [{ text: "Yard", votes: 10 }],
};

describe("normalizeIntentKey", () => {
  it("collapses the same ask into one key", () => {
    expect(normalizeIntentKey("Cocktails after work")).toBe(normalizeIntentKey("after-work cocktails"));
  });
});

describe("optionShares", () => {
  it("ranks the leading choice and reports share", () => {
    const options = optionShares(jerk.options, 112);
    expect(options[0].text).toBe("Sweetwood");
    expect(options[0].share).toBe(43);
  });
});

describe("closenessForPoll", () => {
  it("marks a near-threshold poll as unlocking", () => {
    expect(closenessForPoll(jerk)).toBe("unlocking");
    expect(closenessForPoll(night)).toBe("early");
  });
});

describe("buildDiscoveryDemandInbox", () => {
  it("splits named asks into live matches and honest misses", () => {
    const inbox = buildDiscoveryDemandInbox({
      polls: [jerk, night],
      intents: [
        { query: "cocktails after work", count: 4 },
        { query: "hiking with kids", count: 2 },
        { query: "jerk on friday", count: 3 },
      ],
      city: "Kingston",
    });

    expect(inbox.asks.map((ask) => ask.query)).toEqual(["cocktails after work", "jerk on friday"]);
    expect(inbox.misses.map((ask) => ask.query)).toEqual(["hiking with kids"]);
    expect(inbox.asks[1].matchedPollIds).toEqual(["jerk"]);
    expect(inbox.unlocking[0].poll.id).toBe("jerk");
    expect(inbox.unlocking[0].leading?.text).toBe("Sweetwood");
    expect(inbox.namedAskCount).toBe(9);
    expect(inbox.liveVoteCount).toBe(122);
  });

  it("still shows live questions when nobody has written in yet", () => {
    const inbox = buildDiscoveryDemandInbox({ polls: [night], intents: [] });
    expect(inbox.asks).toEqual([]);
    expect(inbox.questions).toHaveLength(1);
    expect(inbox.questions[0].poll.id).toBe("night");
  });
});
