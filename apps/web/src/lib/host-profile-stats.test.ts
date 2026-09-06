import { describe, expect, it } from "vitest";
import { translations } from "@/i18n/translations";
import { buildHostProfileStats, hasHostResponseRate } from "./host-profile-stats";

describe("host profile stats", () => {
  it("does not invent a hosted count or a rating", () => {
    expect(buildHostProfileStats({})).toEqual({ momentsHosted: 0, reviewCount: 0 });
    expect(buildHostProfileStats({ hostedCount: 3, ratings: [] })).toEqual({
      momentsHosted: 3,
      reviewCount: 0,
    });
  });

  it("averages real reviews to one decimal", () => {
    expect(buildHostProfileStats({ hostedCount: 3, ratings: [5, 4, 5] })).toEqual({
      momentsHosted: 3,
      rating: 4.7,
      reviewCount: 3,
    });
  });

  it("only treats a numeric response rate as present", () => {
    expect(hasHostResponseRate(undefined)).toBe(false);
    expect(hasHostResponseRate(null)).toBe(false);
    expect(hasHostResponseRate(0)).toBe(true);
    expect(hasHostResponseRate(94)).toBe(true);
  });
});

describe("squad invite copy", () => {
  it("stays grammatical when an event title is interpolated", () => {
    const title = "I Luv Hip Hop";

    for (const locale of ["en", "es-419", "pt-BR"] as const) {
      const connected = translations[locale]["squadJoin.sendConnected"].replaceAll("{{title}}", title);
      const generic = translations[locale]["squadJoin.sendGeneric"].replaceAll("{{title}}", title);

      expect(connected).toContain(title);
      expect(generic).toContain(title);
      expect(connected).not.toMatch(/^(Send|Envía|Envie) I Luv Hip Hop/);
      expect(generic).not.toMatch(/^(Send|Envía|Envie) I Luv Hip Hop/);
    }

    expect(translations.en["squadJoin.sendConnected"].replaceAll("{{title}}", title)).toBe(
      "Share I Luv Hip Hop with someone you want beside you. When they join, it will be connected to your invitation.",
    );
  });
});
