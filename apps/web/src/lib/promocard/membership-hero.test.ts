import { describe, expect, it } from "vitest";
import {
  FALLBACK_MEMBERSHIP_HIGHLIGHTS,
  MEMBERSHIP_LANES,
  membershipHighlightKicker,
  membershipHighlightsFromDiscovery,
} from "./membership-hero";

describe("membership hero", () => {
  it("keeps PromoCard spend first, then Moments, shares and access", () => {
    expect(MEMBERSHIP_LANES.map((lane) => [lane.kicker, lane.href])).toEqual([
      ["Places", "/shop?from=promocard"],
      ["Moments", "/discover/moments"],
      ["Shares", "/promoshare"],
      ["Access", "/discover/rewards"],
    ]);
  });

  it("uses live places and Moments when the homepage has them", () => {
    const highlights = membershipHighlightsFromDiscovery({
      places: [
        {
          id: "devon",
          title: "Devon House tasting",
          merchant: "Devon House",
          href: "/shop/devon?from=promocard",
          price: "$18.50",
        },
      ],
      moments: [
        {
          id: "jazz",
          title: "Jazz on the lawn",
          venue: "Emancipation Park",
          href: "/moments/jazz",
          when: "Fri 7pm",
        },
      ],
    });

    expect(highlights).toHaveLength(2);
    expect(highlights[0]).toMatchObject({
      kind: "place",
      title: "Devon House tasting",
      href: "/shop/devon?from=promocard",
      stub: "$18.50",
    });
    expect(highlights[1]).toMatchObject({
      kind: "moment",
      title: "Jazz on the lawn",
      stub: "Fri 7pm",
    });
  });

  it("falls back to membership objects when discovery is empty", () => {
    expect(membershipHighlightsFromDiscovery({})).toEqual(FALLBACK_MEMBERSHIP_HIGHLIGHTS);
    expect(membershipHighlightKicker("place")).toBe("Use the card here");
    expect(membershipHighlightKicker("moment")).toBe("Show up with membership");
  });
});
