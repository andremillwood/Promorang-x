import { describe, expect, it } from "vitest";

import {
  FOUNDING_SCOUT_CATALOG,
  SCOUT_QUEUE_CAP_PER_HUB_WEEK,
  canAutoSendScoutInvite,
  canTransitionScoutStatus,
  draftClaimPageInvite,
  matchMomentForCandidate,
  scoreStakeholderCandidate,
  selectWeeklyShortlist,
  transitionScoutStatus,
} from "../src/stakeholder-scout";

const friday = new Date("2026-08-28T21:10:00.000Z");

const kingstonDinner = {
  id: "moment-food-crawl",
  title: "New Kingston Thursday Food Crawl",
  hubId: "kingston",
  city: "Kingston",
  startsAt: "2026-09-03T23:00:00.000Z",
  category: "food",
  clusters: ["dinner", "dessert"] as const,
};

const dessertShop = FOUNDING_SCOUT_CATALOG.find((row) => row.candidateKey === "kingston-devon-house-ice-cream")!;

describe("stakeholder scout scoring", () => {
  it("shortlists a Kingston dessert stop against a dated food Moment", () => {
    const score = scoreStakeholderCandidate(dessertShop, kingstonDinner, friday);
    expect(score.recommendation).toBe("shortlist");
    expect(score.nextStatus).toBe("queued");
    expect(score.total).toBeGreaterThanOrEqual(70);
    expect(score.reasons.join(" ")).toMatch(/dessert|Devon House|two weeks|claimable/i);
    expect(score.preferredChannel).toBe("walk_in");
  });

  it("refuses planned hubs and harvested inboxes as a reason to send", () => {
    const score = scoreStakeholderCandidate(
      {
        ...dessertShop,
        hubId: "london",
        publicContactEmail: "info@example.com",
      },
      { ...kingstonDinner, hubId: "london" },
      friday,
    );
    expect(score.recommendation).toBe("reject");
    expect(score.blockers.join(" ")).toMatch(/not live or pilot/i);
    expect(canAutoSendScoutInvite()).toBe(false);
  });

  it("keeps candidates without a Moment on watch or reject, never queued", () => {
    const score = scoreStakeholderCandidate(dessertShop, null, friday);
    expect(score.nextStatus).not.toBe("queued");
    expect(score.blockers.join(" ")).toMatch(/No dated Moment/i);
  });

  it("honors do-not-contact even when the Moment fit is strong", () => {
    const score = scoreStakeholderCandidate({ ...dessertShop, doNotContact: true }, kingstonDinner, friday);
    expect(score.nextStatus).toBe("suppressed");
    expect(score.recommendation).toBe("reject");
  });
});

describe("stakeholder scout invites and queue", () => {
  it("drafts a claim-page invite that a machine is never allowed to send", () => {
    const draft = draftClaimPageInvite(dessertShop, kingstonDinner, { hubName: "Kingston" });
    expect(draft.sendAllowed).toBe(false);
    expect(draft.autoSend).toBe(false);
    expect(draft.requiresHumanApproval).toBe(true);
    expect(draft.preferredChannel).toBe("walk_in");
    expect(draft.claimPath).toContain("/claim-pages");
    expect(draft.body).toContain("dessert stop");
    expect(draft.body).toContain("New Kingston Thursday Food Crawl");
    expect(draft.body).toMatch(/Nothing is sent until a person decides/i);
    expect(draft.body).not.toMatch(/become a stakeholder|join Promorang today/i);
  });

  it("caps each hub at ten shortlisted invites per week", () => {
    const extras = Array.from({ length: 12 }, (_, index) => ({
      ...dessertShop,
      candidateKey: `kingston-dessert-${index}`,
      displayName: `Dessert ${index}`,
    }));
    const selected = selectWeeklyShortlist(extras, [kingstonDinner], friday);
    const queued = selected.filter((row) => row.score.nextStatus === "queued");
    const overflow = selected.filter((row) => row.score.blockers.some((item) => /cap of 10/i.test(item)));
    expect(queued).toHaveLength(SCOUT_QUEUE_CAP_PER_HUB_WEEK);
    expect(overflow.length).toBeGreaterThan(0);
  });

  it("matches a product to the Moment it can actually serve", () => {
    const product = FOUNDING_SCOUT_CATALOG.find((row) => row.candidateKey === "kingston-walkerswood-jerk")!;
    const musicOnly = {
      id: "music",
      title: "Downtown Vinyl Night",
      hubId: "kingston",
      startsAt: "2026-09-04T01:00:00.000Z",
      clusters: ["music"] as const,
    };
    const matched = matchMomentForCandidate(product, [kingstonDinner, musicOnly], friday);
    expect(matched?.title).toBe(kingstonDinner.title);
  });

  it("blocks automatic jumps to sent_by_human", () => {
    expect(canTransitionScoutStatus("queued", "sent_by_human")).toBe(false);
    expect(canTransitionScoutStatus("invite_ready", "sent_by_human")).toBe(true);
    expect(transitionScoutStatus("queued", "approved")).toBe("approved");
    expect(transitionScoutStatus("approved", "invite_ready")).toBe("invite_ready");
    expect(() => transitionScoutStatus("queued", "sent_by_human")).toThrow(/Cannot move/i);
  });

  it("keeps the founding catalog inside live Jamaica hubs with no emails", () => {
    expect(FOUNDING_SCOUT_CATALOG.length).toBeGreaterThanOrEqual(10);
    expect(FOUNDING_SCOUT_CATALOG.every((row) => row.hubId === "kingston" || row.hubId === "montego-bay")).toBe(true);
    expect(FOUNDING_SCOUT_CATALOG.every((row) => !row.publicContactEmail)).toBe(true);
  });
});
