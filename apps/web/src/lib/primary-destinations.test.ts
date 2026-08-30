import { describe, expect, it } from "vitest";
import {
  destinationHrefForSession,
  isPrimaryDestinationActive,
  isPrimaryDestinationHref,
  matchPrimaryDestination,
  PRIMARY_DESTINATIONS,
} from "./primary-destinations";

describe("primary destinations", () => {
  it("keeps the five-destination map in doctrine order", () => {
    expect(PRIMARY_DESTINATIONS.map((item) => item.id)).toEqual([
      "today",
      "discover",
      "create",
      "progress",
      "vault",
    ]);
  });

  it("does not treat Today as active on every route", () => {
    expect(isPrimaryDestinationActive("/", "/")).toBe(true);
    expect(isPrimaryDestinationActive("/discover", "/")).toBe(false);
    expect(isPrimaryDestinationActive("/vault", "/")).toBe(false);
  });

  it("treats Activity and notifications as Progress", () => {
    expect(matchPrimaryDestination("/progress")).toBe("progress");
    expect(matchPrimaryDestination("/activity")).toBe("progress");
    expect(matchPrimaryDestination("/notifications")).toBe("progress");
    expect(isPrimaryDestinationActive("/activity", "/progress")).toBe(true);
  });

  it("keeps Create children on the Create destination", () => {
    expect(matchPrimaryDestination("/create/moment")).toBe("create");
    expect(isPrimaryDestinationHref("/create/hosted")).toBe(true);
    expect(isPrimaryDestinationHref("/wallet")).toBe(false);
  });

  it("sends guests to sign in before Progress", () => {
    expect(destinationHrefForSession("/progress", false)).toBe("/auth?next=/progress");
    expect(destinationHrefForSession("/progress", true)).toBe("/progress");
  });
});
