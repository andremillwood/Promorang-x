import { describe, expect, it } from "vitest";

import {
  WEEKLY_MOMENT_LEAD_DAYS,
  buildWeeklyAnnouncement,
  classifyLeadWindow,
  getIsoWeekStart,
  getLeadHorizonEnd,
  shouldPublishCalendarEvent,
} from "../src/weekly-moment-drop";

describe("weekly moment drop windows", () => {
  const friday = new Date("2026-08-28T21:10:00.000Z");

  it("uses a 90-day planning horizon", () => {
    expect(WEEKLY_MOMENT_LEAD_DAYS).toBe(90);
    expect(getLeadHorizonEnd(friday).toISOString()).toBe("2026-11-26T21:10:00.000Z");
  });

  it("anchors the announcement week to Monday", () => {
    expect(getIsoWeekStart(friday).toISOString()).toBe("2026-08-24T00:00:00.000Z");
  });

  it("keeps events dated up to three months on the calendar", () => {
    expect(classifyLeadWindow(new Date("2026-08-30T16:00:00.000Z"), friday)).toBe("this_week");
    expect(classifyLeadWindow(new Date("2026-09-06T11:00:00.000Z"), friday)).toBe("near");
    expect(classifyLeadWindow(new Date("2026-11-06T17:00:00.000Z"), friday)).toBe("horizon");
    expect(classifyLeadWindow(new Date("2026-12-15T17:00:00.000Z"), friday)).toBe("too_far");
    expect(shouldPublishCalendarEvent(new Date("2026-11-06T17:00:00.000Z"), friday)).toBe(true);
    expect(shouldPublishCalendarEvent(new Date("2026-12-15T17:00:00.000Z"), friday)).toBe(false);
  });

  it("writes a weekly announcement from newly dated events", () => {
    const copy = buildWeeklyAnnouncement({
      weekStart: getIsoWeekStart(friday),
      newMoments: [
        { title: "Treasure Beach Food, Rum & Reggae Festival", starts_at: "2026-11-06T17:00:00.000Z", city: "Treasure Beach" },
        { title: "National Heroes Day", starts_at: "2026-10-19T14:00:00.000Z", city: "Kingston" },
      ],
      horizonCount: 7,
    });

    expect(copy).toContain("This week on Promorang");
    expect(copy).toContain("Newly announced (2)");
    expect(copy).toContain("Treasure Beach Food, Rum & Reggae Festival");
    expect(copy).toContain("7 more dated events sit inside the 90-day planning window.");
  });
});
