import { describe, expect, it } from "vitest";
import {
  isPublicObjectPath,
  publicObjectReturnPath,
  shouldCapturePublicObjectAuthReturn,
} from "./public-object-continuity";

describe("public object continuity", () => {
  it("recognizes public object detail routes but not protected subroutes", () => {
    expect(isPublicObjectPath("/discoveries/night-market")).toBe(true);
    expect(isPublicObjectPath("/d/what-should-open-next")).toBe(true);
    expect(isPublicObjectPath("/moments/encore")).toBe(true);
    expect(isPublicObjectPath("/shop/item-123")).toBe(true);
    expect(isPublicObjectPath("/moments/encore/checkin")).toBe(false);
    expect(isPublicObjectPath("/dashboard")).toBe(false);
  });

  it("preserves query and hash context in the return path", () => {
    expect(publicObjectReturnPath({
      pathname: "/moments/encore",
      search: "?campaign=abc&channel=xyz",
      hash: "#access",
    })).toBe("/moments/encore?campaign=abc&channel=xyz#access");
  });

  it("captures object-to-auth transitions only when auth has no explicit next", () => {
    expect(shouldCapturePublicObjectAuthReturn({
      previous: { pathname: "/moments/encore", search: "?campaign=abc" },
      next: { pathname: "/auth", search: "" },
    })).toBe(true);

    expect(shouldCapturePublicObjectAuthReturn({
      previous: { pathname: "/moments/encore", search: "?campaign=abc" },
      next: { pathname: "/auth", search: "?next=%2Fcard" },
    })).toBe(false);

    expect(shouldCapturePublicObjectAuthReturn({
      previous: { pathname: "/for-brands" },
      next: { pathname: "/auth", search: "" },
    })).toBe(false);
  });
});
