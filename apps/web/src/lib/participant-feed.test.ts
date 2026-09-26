import { describe, expect, it } from "vitest";
import { rankParticipantFeed, scoreParticipantFeedItem, type ParticipantFeedItem } from "./participant-feed";

const base = (id: string, kind: ParticipantFeedItem["kind"]): ParticipantFeedItem => ({
  id,
  kind,
  source: "test",
  title: id,
  primaryAction: { label: "Open", href: `/${id}` },
});

describe("participant feed ranking", () => {
  it("prioritizes useful, local and time-sensitive inventory", () => {
    const now = Date.parse("2026-09-26T12:00:00Z");
    const soon = { ...base("soon", "moment"), signals: { local: true, available: true, startsAt: "2026-09-26T18:00:00Z" } };
    const generic = base("generic", "scene");
    expect(scoreParticipantFeedItem(soon, now)).toBeGreaterThan(scoreParticipantFeedItem(generic, now));
  });

  it("prevents one object type from occupying three consecutive positions", () => {
    const items = [
      { ...base("moment-1", "moment"), signals: { local: true } },
      { ...base("moment-2", "moment"), signals: { local: true } },
      { ...base("moment-3", "moment"), signals: { local: true } },
      base("want-1", "want"),
      base("scene-1", "scene"),
    ];
    const ranked = rankParticipantFeed(items, { now: Date.parse("2026-09-26T12:00:00Z") });
    expect(ranked.slice(0, 3).filter((item) => item.kind === "moment")).toHaveLength(2);
  });

  it("keeps Find or Ask behind immediately actionable inventory", () => {
    const ranked = rankParticipantFeed([
      base("ask", "find_or_ask"),
      { ...base("offer", "offer"), signals: { available: true } },
      base("want", "want"),
    ]);
    expect(ranked[0].kind).toBe("offer");
    expect(ranked.at(-1)?.kind).toBe("find_or_ask");
  });
});
