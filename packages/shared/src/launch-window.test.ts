import { describe, expect, it } from "vitest";
import {
  DEFAULT_CAPPED_DROP_CAP,
  LAUNCH_WINDOW_END,
  isOnOrBeforeLaunchWindowEnd,
  launchWindowEndInstant,
} from "./launch-window";

describe("launch window config", () => {
  it("ends on 31 January 2027 and defaults a capped drop to 100", () => {
    expect(LAUNCH_WINDOW_END).toBe("2027-01-31");
    expect(DEFAULT_CAPPED_DROP_CAP).toBe(100);
    expect(launchWindowEndInstant().toISOString()).toBe("2027-02-01T04:59:59.000Z");
  });

  it("treats the end date as inclusive in Jamaica and rejects the next day", () => {
    expect(isOnOrBeforeLaunchWindowEnd("2027-01-31T23:30:00-05:00")).toBe(true);
    expect(isOnOrBeforeLaunchWindowEnd("2027-02-01T00:30:00-05:00")).toBe(false);
  });
});
