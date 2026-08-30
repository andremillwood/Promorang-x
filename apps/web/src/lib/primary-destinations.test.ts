import { describe, expect, it } from "vitest";
import {
  destinationHrefForSession,
  isPrimaryDestinationActive,
  isPrimaryDestinationHref,
  isSharedPrimaryNavHref,
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

  it("sends Today to /today, not the marketing homepage", () => {
    expect(PRIMARY_DESTINATIONS.find((item) => item.id === "today")?.href).toBe("/today");
    expect(matchPrimaryDestination("/today")).toBe("today");
    expect(matchPrimaryDestination("/")).toBeNull();
    expect(isPrimaryDestinationHref("/")).toBe(false);
    expect(isPrimaryDestinationHref("/today")).toBe(true);
  });

  it("does not treat Today as active on every route", () => {
    expect(isPrimaryDestinationActive("/today", "/today")).toBe(true);
    expect(isPrimaryDestinationActive("/", "/today")).toBe(false);
    expect(isPrimaryDestinationActive("/discover", "/today")).toBe(false);
    expect(isPrimaryDestinationActive("/vault", "/today")).toBe(false);
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

  it("keeps a leftover home link on Today for signed-in members", () => {
    expect(destinationHrefForSession("/", true)).toBe("/today");
    expect(destinationHrefForSession("/", false)).toBe("/");
  });

  it("keeps role workspace tools off the shared primary roots", () => {
    expect(isSharedPrimaryNavHref("/today")).toBe(true);
    expect(isSharedPrimaryNavHref("/discover")).toBe(true);
    expect(isSharedPrimaryNavHref("/create")).toBe(true);
    expect(isSharedPrimaryNavHref("/dashboard")).toBe(false);
    expect(isSharedPrimaryNavHref("/dashboard?tab=products")).toBe(false);
    expect(isSharedPrimaryNavHref("/create/campaign")).toBe(false);
    expect(isSharedPrimaryNavHref("/organizer/check-ins")).toBe(false);
  });
});
