import { describe, expect, it } from "vitest";
import { DISCOVER_TAB_IDS, DISCOVER_TABS, isDiscoverTab } from "./discover-tabs";

describe("Discover market tabs", () => {
  it("keeps short labels that fit the shared Tabs control", () => {
    expect(DISCOVER_TABS.map((tab) => tab.id)).toEqual([...DISCOVER_TAB_IDS]);
    expect(DISCOVER_TABS.every((tab) => tab.label.length <= 12)).toBe(true);
    expect(DISCOVER_TABS.some((tab) => /acquire signal|earn tickets/i.test(tab.label))).toBe(false);
  });

  it("accepts only the Discover decision lenses", () => {
    expect(isDiscoverTab("discoveries")).toBe(true);
    expect(isDiscoverTab("perks")).toBe(true);
    expect(isDiscoverTab("swipe")).toBe(false);
    expect(isDiscoverTab(null)).toBe(false);
  });
});
