import { describe, expect, it } from "vitest";
import { getNearestSwipeIndex, getSwipeOverflowState } from "./swipe-overflow";

describe("getSwipeOverflowState", () => {
  it("treats a fitting row as non-swipeable", () => {
    expect(getSwipeOverflowState(0, 360, 360)).toEqual({
      canScrollLeft: false,
      canScrollRight: false,
      overflows: false,
    });
  });

  it("shows more to the right at the start of an overflowing row", () => {
    expect(getSwipeOverflowState(0, 360, 900)).toMatchObject({
      canScrollLeft: false,
      canScrollRight: true,
      overflows: true,
    });
  });

  it("shows both edges after a partial swipe", () => {
    expect(getSwipeOverflowState(180, 360, 900)).toEqual({
      canScrollLeft: true,
      canScrollRight: true,
      overflows: true,
    });
  });
});

describe("getNearestSwipeIndex", () => {
  it("picks the card closest to the viewport center", () => {
    expect(getNearestSwipeIndex([80, 260, 440], 250)).toBe(1);
  });
});
