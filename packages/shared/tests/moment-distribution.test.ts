import { describe, expect, it } from "vitest";
import {
  distributeMoments,
  interestSlugsForText,
  tasteProfileFromPreferences,
} from "../src/moment-distribution";

const now = new Date("2026-08-31T18:00:00.000Z");

function moment(overrides: Record<string, unknown>) {
  return {
    id: "m1",
    title: "Untitled",
    description: "",
    category: "Community Gathering",
    city: "Kingston",
    country: "Jamaica",
    location: "Downtown",
    venue_name: "Room One",
    host_id: "host-a",
    starts_at: "2026-08-31T22:00:00.000Z",
    created_at: "2026-08-30T12:00:00.000Z",
    ...overrides,
  };
}

describe("moment distribution", () => {
  it("maps onboarding slugs onto the categories hosts actually type", () => {
    expect(interestSlugsForText("Music & Parties", "Kingston Skyline Sound Clash")).toContain("music");
    expect(interestSlugsForText("Food & Beverage", "Culinary pop-up")).toContain("food");
    expect(interestSlugsForText("Workshops & Learning")).toContain("workshop");
  });

  it("reads the real user_preferences columns instead of invented interests", () => {
    const profile = tasteProfileFromPreferences({
      preferred_categories: ["music", "food"],
      lifestyle_tags: ["foodie"],
      age_range: "25-34",
      city: "Kingston",
    });
    expect(profile.preferredCategories).toEqual(["music", "food"]);
    expect(profile.lifestyleTags).toEqual(["foodie"]);
    expect(profile.ageRange).toBe("25-34");
    expect(profile.city).toBe("Kingston");
  });

  it("puts a music night above a workshop when the guest asked for music", () => {
    const ranked = distributeMoments(
      [
        moment({ id: "workshop", category: "Workshops & Learning", title: "Spreadsheet clinic", host_id: "a" }),
        moment({ id: "dj", category: "Music & Parties", title: "Sound clash", host_id: "b" }),
      ],
      { preferredCategories: ["music"] },
      { now },
    );
    expect(ranked.map((item) => item.id)).toEqual(["dj", "workshop"]);
    expect(ranked[0].distributionReasons.join(" ")).toMatch(/music/i);
  });

  it("uses lifestyle as the psychographic signal", () => {
    const ranked = distributeMoments(
      [
        moment({ id: "talk", category: "Workshops & Learning", title: "Career talk", host_id: "a" }),
        moment({ id: "supper", category: "Food & Beverage", title: "Supper club", host_id: "b" }),
      ],
      { lifestyleTags: ["foodie"] },
      { now },
    );
    expect(ranked[0].id).toBe("supper");
  });

  it("prefers the same city over a matching category far away", () => {
    const ranked = distributeMoments(
      [
        moment({
          id: "montego",
          category: "Music & Parties",
          title: "MoBay DJ",
          city: "Montego Bay",
          location: "Gloucester Ave",
          host_id: "a",
        }),
        moment({
          id: "kingston",
          category: "Community Gathering",
          title: "Neighbourhood hang",
          city: "Kingston",
          location: "New Kingston",
          host_id: "b",
        }),
      ],
      { preferredCategories: ["music"], city: "Kingston" },
      { now },
    );
    expect(ranked[0].id).toBe("kingston");
    expect(ranked[0].distributionReasons.join(" ")).toMatch(/Kingston/i);
  });

  it("boosts nightlife for 18-24 without hiding other ages out", () => {
    const younger = distributeMoments(
      [
        moment({ id: "class", category: "Workshops & Learning", title: "Morning class", host_id: "a" }),
        moment({ id: "party", category: "Music & Parties", title: "Late set", host_id: "b" }),
      ],
      { ageRange: "18-24" },
      { now },
    );
    const older = distributeMoments(
      [
        moment({ id: "class", category: "Workshops & Learning", title: "Morning class", host_id: "a" }),
        moment({ id: "party", category: "Music & Parties", title: "Late set", host_id: "b" }),
      ],
      { ageRange: "55+" },
      { now },
    );
    expect(younger[0].id).toBe("party");
    expect(older[0].id).toBe("class");
  });

  it("does not let one host monopolize the first slots", () => {
    const ranked = distributeMoments(
      [
        moment({ id: "a1", category: "Music & Parties", title: "Set one", host_id: "same", starts_at: "2026-08-31T20:00:00.000Z" }),
        moment({ id: "a2", category: "Music & Parties", title: "Set two", host_id: "same", starts_at: "2026-08-31T21:00:00.000Z" }),
        moment({ id: "a3", category: "Music & Parties", title: "Set three", host_id: "same", starts_at: "2026-08-31T22:00:00.000Z" }),
        moment({ id: "other", category: "Food & Beverage", title: "Kitchen pop-up", host_id: "other", starts_at: "2026-09-01T20:00:00.000Z" }),
      ],
      { preferredCategories: ["music"] },
      { now, take: 3 },
    );
    expect(ranked.map((item) => item.id)).toContain("other");
    expect(ranked.filter((item) => item.host_id === "same")).toHaveLength(2);
  });

  it("gives a newly posted moment a chance against an older same-category listing", () => {
    const ranked = distributeMoments(
      [
        moment({
          id: "old",
          category: "Music & Parties",
          title: "Last week's flyer",
          created_at: "2026-08-24T12:00:00.000Z",
          starts_at: "2026-09-02T22:00:00.000Z",
          host_id: "a",
        }),
        moment({
          id: "fresh",
          category: "Music & Parties",
          title: "Just named tonight",
          created_at: "2026-08-31T16:00:00.000Z",
          starts_at: "2026-09-02T23:00:00.000Z",
          host_id: "b",
        }),
      ],
      { preferredCategories: ["music"] },
      { now },
    );
    expect(ranked[0].id).toBe("fresh");
  });

  it("changes order when the guest changes interests", () => {
    const inventory = [
      moment({ id: "food", category: "Food & Beverage", title: "Supper", host_id: "a" }),
      moment({ id: "music", category: "Music & Parties", title: "DJ", host_id: "b" }),
    ];
    const asFood = distributeMoments(inventory, { preferredCategories: ["food"] }, { now });
    const asMusic = distributeMoments(inventory, { preferredCategories: ["music"] }, { now });
    expect(asFood[0].id).toBe("food");
    expect(asMusic[0].id).toBe("music");
  });

  it("weights a host toward nearby tonight over a distant taste match", () => {
    const ranked = distributeMoments(
      [
        moment({
          id: "far-music",
          category: "Music & Parties",
          title: "Festival two towns over",
          city: "Montego Bay",
          location: "MoBay",
          starts_at: "2026-09-06T22:00:00.000Z",
          host_id: "a",
        }),
        moment({
          id: "near-now",
          category: "Community Gathering",
          title: "Happy hour next door",
          city: "Kingston",
          location: "New Kingston",
          starts_at: "2026-08-31T20:30:00.000Z",
          host_id: "b",
        }),
      ],
      { role: "host", preferredCategories: ["music"], city: "Kingston" },
      { now },
    );
    expect(ranked[0].id).toBe("near-now");
  });
});
