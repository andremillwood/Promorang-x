import { expect, it } from "vitest";
import { DEFAULT_CAPPED_DROP_CAP, CAPPED_DROP_POLL_MS, cappedDropPollInterval, cappedDropView } from "./cappedDrop";

it("polls about every 5 seconds only while the page is visible", () => {
  expect(CAPPED_DROP_POLL_MS).toBe(5000);
  expect(cappedDropPollInterval(true)).toBe(5000);
  expect(cappedDropPollInterval(false)).toBe(false);
});

it("uses the server remaining count and withholds almost-gone until 10 percent", () => {
  expect(DEFAULT_CAPPED_DROP_CAP).toBe(100);
  expect(cappedDropView({ cap: 100, remaining: 37, status: "live" })).toMatchObject({
    remaining: 37,
    full: false,
    almostGone: false,
  });
  expect(cappedDropView({ cap: 100, remaining: 10, status: "live" }).almostGone).toBe(true);
  expect(cappedDropView({ cap: 100, remaining: 0, status: "full" })).toMatchObject({
    full: true,
    almostGone: false,
  });
});
