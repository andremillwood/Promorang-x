import { describe, expect, it } from "vitest";
import { DISCOVERY_POLLS, getActiveDiscoveryPolls, getDiscoveryPollByIdOrSlug } from "./discoveriesData";
import { pollHasRedeemablePerk } from "@/lib/discovery-signal";

describe("Kingston Friday jerk poll", () => {
  const poll = getDiscoveryPollByIdOrSlug("kingston-jerk-spot-undisputed-king-friday");

  it("is a city vote, not a live house discount", () => {
    expect(poll).toBeTruthy();
    expect(pollHasRedeemablePerk(poll)).toBe(false);
    expect(poll?.targetUnlockPerk.toLowerCase()).not.toMatch(/25%|discount|tasting pass|voucher/);
    expect(`${poll?.description} ${poll?.contextNotes}`.toLowerCase()).not.toMatch(/secret 25%/);
  });

  it("only lists mapped Kingston spots, not invented names or wrong streets", () => {
    const labels = (poll?.options || []).map((option) => option.text).join(" ");
    expect(labels).toContain("Sweetwood (New Kingston)");
    expect(labels).toContain("Scotchies (152 Constant Spring Rd)");
    expect(labels).toContain("Jo Jo's Jerk Pit (12 Waterloo Rd)");
    expect(labels).toContain("Andy's Jerk Centre (49 Mannings Hill Rd)");
    expect(labels).not.toMatch(/Pepperwood|Liguanea|Chelsea Ave|Downtown Waterfront|Boston Jerk Table/);
  });

  it("keeps every seeded poll as demand unless a house offer is marked live", () => {
    expect(DISCOVERY_POLLS.every((item) => !pollHasRedeemablePerk(item))).toBe(true);
  });

  it("hides the ended Arla roadshow from the live Discover path", () => {
    expect(getActiveDiscoveryPolls().some((item) => item.id.startsWith("disc-arla"))).toBe(false);
    expect(DISCOVERY_POLLS.filter((item) => item.id.startsWith("disc-arla")).every((item) => item.retired)).toBe(true);
    expect(getDiscoveryPollByIdOrSlug("arla-tasteoff-rasta-pasta-vs-mousse")?.retired).toBe(true);
  });
});
