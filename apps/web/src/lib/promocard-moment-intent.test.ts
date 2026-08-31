import { describe, expect, it } from "vitest";
import {
  buildDiscoverIntentPath,
  momentMatchesIntent,
  normalizeDiscoverCategory,
  parseMomentIntent,
  shouldHideMomentPrompt,
} from "./promocard-moment-intent";

describe("PromoCard moment intent", () => {
  it("parses Lazyweb all-day mix ids and aliases", () => {
    expect(parseMomentIntent("Food")).toBe("food");
    expect(parseMomentIntent("music")).toBe("night");
    expect(parseMomentIntent("community")).toBe("culture");
    expect(parseMomentIntent("sports")).toBe("sport");
    expect(parseMomentIntent("unknown")).toBeNull();
  });

  it("builds a Discover deep-link that is pre-filtered", () => {
    expect(buildDiscoverIntentPath("food")).toBe("/discover?tab=moments&intent=food");
    expect(buildDiscoverIntentPath(null)).toBe("/discover?tab=moments");
  });

  it("matches moment copy against the selected intent", () => {
    expect(momentMatchesIntent("Food & Drinks", "food")).toBe(true);
    expect(momentMatchesIntent("Music & Nightlife", "night")).toBe(true);
    expect(momentMatchesIntent("Gatherings & Culture", "culture")).toBe(true);
    expect(momentMatchesIntent("Downtown boutique pop-up", "shops")).toBe(true);
    expect(momentMatchesIntent("Sunday football match", "sport")).toBe(true);
    expect(momentMatchesIntent("Food & Drinks", "night")).toBe(false);
    expect(momentMatchesIntent("Anything", "all")).toBe(true);
  });

  it("normalizes Discover category query values", () => {
    expect(normalizeDiscoverCategory("music")).toBe("night");
    expect(normalizeDiscoverCategory("all")).toBe("all");
    expect(normalizeDiscoverCategory(null)).toBe("all");
  });

  it("hides the prompt on Discover and auth routes, including locale prefixes", () => {
    expect(shouldHideMomentPrompt("/")).toBe(false);
    expect(shouldHideMomentPrompt("/pulse")).toBe(false);
    expect(shouldHideMomentPrompt("/discover")).toBe(true);
    expect(shouldHideMomentPrompt("/discover?tab=moments")).toBe(true);
    expect(shouldHideMomentPrompt("/es/discover/moments")).toBe(true);
    expect(shouldHideMomentPrompt("/pt-br/auth")).toBe(true);
    expect(shouldHideMomentPrompt("/onboarding")).toBe(true);
  });
});
