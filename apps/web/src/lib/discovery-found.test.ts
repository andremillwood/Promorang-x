import { describe, expect, it } from "vitest";
import {
  canonicalFoundId,
  claimFoundListing,
  defaultFinderPerk,
  draftFoundListing,
  FOUND_SEED_IDS,
  foundListingHits,
  foundWorkspacePath,
  isProspectClaim,
  mergeFoundListings,
  normalizeFoundKey,
  seededFoundListings,
  unlockFromFoundListing,
  type FoundListing,
} from "./discovery-found";

const hike: FoundListing = {
  id: FOUND_SEED_IDS.hike,
  city: "Kingston & St. Andrew",
  kind: "moment",
  title: "Hiking with kids",
  words: "hiking with kids",
  whereHint: "Blue Mountains",
  perkToFinder: "First family table when a host claims this",
  status: "unclaimed",
  namedCount: 3,
  finderAnonId: "seed:hiking-kids",
  createdAt: "2026-09-05T12:00:00.000Z",
};

describe("normalizeFoundKey", () => {
  it("collapses the same find into one key", () => {
    expect(normalizeFoundKey("Hiking with kids")).toBe(normalizeFoundKey("kids hiking"));
  });
});

describe("foundListingHits", () => {
  it("matches the named miss and ignores unrelated words", () => {
    expect(foundListingHits(hike, "hiking with kids")).toBeGreaterThan(0);
    expect(foundListingHits(hike, "cocktails after work")).toBe(0);
  });
});

describe("defaultFinderPerk", () => {
  it("names a real keep, not points", () => {
    expect(defaultFinderPerk("place")).toMatch(/table/i);
    expect(defaultFinderPerk("moment")).toMatch(/door|pass/i);
  });
});

describe("draftFoundListing", () => {
  it("bumps the count when the same words are already up", () => {
    const first = draftFoundListing({ city: hike.city, kind: "moment", title: "Hiking with kids" });
    const again = draftFoundListing({
      city: hike.city,
      kind: "moment",
      title: "kids hiking",
      existing: first,
    });
    expect(again.id).toBe(first.id);
    expect(again.namedCount).toBe(2);
  });
});

describe("claimFoundListing", () => {
  it("gives the house the listing and the finder a card slip", () => {
    const claimed = claimFoundListing(hike, { userId: "host-1", anonId: "browser-host" });
    expect(claimed.keep).toBe("slip");
    expect(claimed.listing.status).toBe("claimed");
    expect(claimed.slip?.source).toBe("finder");
    expect(claimed.slip?.perkTitle).toBe(hike.perkToFinder);
    expect(claimed.slip?.pollId).toBe(`found:${FOUND_SEED_IDS.hike}`);
  });

  it("lets a prospect keep the listing instead of a second slip", () => {
    const own: FoundListing = { ...hike, finderAnonId: "me", finderUserId: "me" };
    expect(isProspectClaim(own, { userId: "me", anonId: "me" })).toBe(true);
    const claimed = claimFoundListing(own, { userId: "me", anonId: "me" });
    expect(claimed.keep).toBe("workspace");
    expect(claimed.slip).toBeNull();
    expect(claimed.listing.status).toBe("claimed");
  });

  it("does not mint a second slip after the house already claimed", () => {
    const once = claimFoundListing(hike, { userId: "host-1" });
    const twice = claimFoundListing(once.listing, { userId: "other-host" });
    expect(twice.alreadyClaimed).toBe(true);
    expect(twice.slip).toBeNull();
  });
});

describe("unlockFromFoundListing", () => {
  it("writes a show-this code onto the card", () => {
    const slip = unlockFromFoundListing(hike);
    expect(slip.redemptionCode.startsWith("PR-")).toBe(true);
    expect(slip.source).toBe("finder");
  });
});

describe("foundWorkspacePath", () => {
  it("sends a night to the host stage and a place to the perk table", () => {
    expect(foundWorkspacePath(hike, "host")).toContain(`/create/moment?found=${encodeURIComponent(FOUND_SEED_IDS.hike)}`);
    expect(foundWorkspacePath({ ...hike, kind: "place" }, "creator")).toContain("/give?found=");
    expect(foundWorkspacePath(hike, "merchant")).toContain("/give?found=");
  });
});

describe("mergeFoundListings", () => {
  it("keeps a claim and the stronger named count", () => {
    const merged = mergeFoundListings(
      seededFoundListings(),
      [{ ...hike, namedCount: 8, status: "claimed", claimantUserId: "host-1" }],
    );
    const row = merged.find((item) => item.id === hike.id);
    expect(row?.status).toBe("claimed");
    expect(row?.namedCount).toBe(8);
  });

  it("folds the old local alias into the live listing id", () => {
    const merged = mergeFoundListings(
      [{ ...hike, id: "found:hiking-kids" }],
      [{ ...hike, namedCount: 3 }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(FOUND_SEED_IDS.hike);
    expect(canonicalFoundId("found:hiking-kids")).toBe(FOUND_SEED_IDS.hike);
  });
});
