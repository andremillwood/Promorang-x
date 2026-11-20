import { describe, expect, it } from "vitest";
import { eventDateTimeInput, eventDateTimeInstant } from "./event-local-time";

describe("venue-local event editing", () => {
  it("keeps a New York evening unchanged when the viewer edits other fields", () => {
    const original = "2026-12-02T00:00:12.123Z";
    const input = eventDateTimeInput(original, "America/New_York");
    expect(input).toBe("2026-12-01T19:00");
    expect(eventDateTimeInstant(input, "America/New_York", original)).toBe(original);
  });
  it.each([
    ["2026-11-26T19:00", "Europe/London", "2026-11-26T19:00:00.000Z"],
    ["2026-07-01T19:00", "Europe/London", "2026-07-01T18:00:00.000Z"],
    ["2026-12-05T20:00", "America/Detroit", "2026-12-06T01:00:00.000Z"],
    ["2026-12-05T20:00", "America/Menominee", "2026-12-06T02:00:00.000Z"],
    ["2026-11-22T17:00", "America/Port_of_Spain", "2026-11-22T21:00:00.000Z"],
  ])("converts %s in %s without using the viewer timezone", (input, zone, expected) => {
    expect(eventDateTimeInstant(input, zone)).toBe(expected);
  });
  it("rejects a nonexistent spring-forward wall time", () => {
    expect(() => eventDateTimeInstant("2027-03-14T02:30", "America/New_York")).toThrow("nonexistent_time");
  });
  it("rejects a newly entered ambiguous fall-back hour", () => {
    expect(() => eventDateTimeInstant("2026-11-01T01:30", "America/New_York")).toThrow("ambiguous_time");
  });
  it("preserves the selected original occurrence of an ambiguous hour", () => {
    expect(eventDateTimeInstant("2026-11-01T01:30", "America/New_York", "2026-11-01T06:30:00Z")).toBe("2026-11-01T06:30:00.000Z");
  });
  it("rejects invalid dates and timezone identifiers", () => {
    expect(() => eventDateTimeInstant("2026-02-31T12:00", "Europe/London")).toThrow("invalid_time");
    expect(() => eventDateTimeInstant("2026-12-01T12:00", "Unknown/Zone")).toThrow("invalid_timezone");
  });
});
