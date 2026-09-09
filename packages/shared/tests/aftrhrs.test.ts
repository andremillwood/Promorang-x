import { describe, expect, it } from "vitest";
import {
  AFTRHRS_COPY,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_PATHS,
  SEA_DECK_VENUE_ID,
  aftrHrsDigitalReleaseView,
  authPathForAftrHrsClaim,
  decodeAftrHrsPassPayload,
  encodeAftrHrsPassPayload,
  evaluateDigitalPassClaim,
  formatPublicRemainingLabel,
  isAftrHrsClaimReturn,
  nextParticipationState,
  publicRemainingPercent,
} from "../src/aftrhrs";
import { createAftrHrsInventory, defaultAftrHrsEdition } from "../src/aftrhrs-inventory";

const edition = defaultAftrHrsEdition();

describe("AftrHrs digital pass inventory", () => {
  it("lets the first authenticated user claim a digital pass", async () => {
    const store = createAftrHrsInventory();
    const result = await store.claimDigitalPass({
      userId: "user-1",
      email: "one@promorang.co",
      authenticated: true,
      termsAccepted: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pass.eventId).toBe(AFTRHRS_MOMENT_ID);
      expect(result.pass.passType).toBe("digital-free");
      expect(result.pass.qrPayload).toBe(encodeAftrHrsPassPayload(result.pass.uniqueCode));
    }
    expect(store.snapshot().remaining).toBe(AFTRHRS_DIGITAL_PASS_LIMIT - 1);
  });

  it("rejects a second digital claim from the same user", async () => {
    const store = createAftrHrsInventory();
    await store.claimDigitalPass({ userId: "user-1", email: "one@promorang.co", authenticated: true, termsAccepted: true });
    const second = await store.claimDigitalPass({
      userId: "user-1",
      email: "one@promorang.co",
      authenticated: true,
      termsAccepted: true,
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe("already_claimed");
    expect(store.snapshot().passes).toHaveLength(1);
  });

  it("blocks repeat claims on the same verified email or telephone", async () => {
    const store = createAftrHrsInventory();
    await store.claimDigitalPass({
      userId: "user-1",
      email: "shared@promorang.co",
      phone: "+18765550100",
      authenticated: true,
      termsAccepted: true,
    });
    const emailDup = await store.claimDigitalPass({
      userId: "user-2",
      email: "shared@promorang.co",
      authenticated: true,
      termsAccepted: true,
    });
    const phoneDup = await store.claimDigitalPass({
      userId: "user-3",
      phone: "876-555-0100",
      authenticated: true,
      termsAccepted: true,
    });
    expect(emailDup.ok).toBe(false);
    expect(phoneDup.ok).toBe(false);
  });

  it("issues the digital allocation and rejects the next claim", async () => {
    const store = createAftrHrsInventory();
    const claims = await Promise.all(
      Array.from({ length: AFTRHRS_DIGITAL_PASS_LIMIT + 1 }, (_, index) =>
        store.claimDigitalPass({
          userId: `user-${index}`,
          email: `user-${index}@promorang.co`,
          authenticated: true,
          termsAccepted: true,
        }),
      ),
    );
    expect(claims.filter((item) => item.ok)).toHaveLength(AFTRHRS_DIGITAL_PASS_LIMIT);
    expect(claims[AFTRHRS_DIGITAL_PASS_LIMIT]?.ok).toBe(false);
    if (!claims[AFTRHRS_DIGITAL_PASS_LIMIT]?.ok) expect(claims[AFTRHRS_DIGITAL_PASS_LIMIT].code).toBe("sold_out");
    expect(store.snapshot().remaining).toBe(0);
    expect(store.snapshot().edition.digitalClaimed).toBe(AFTRHRS_DIGITAL_PASS_LIMIT);
  });

  it("cannot over-allocate when the last pass is claimed concurrently", async () => {
    const store = createAftrHrsInventory({ edition: { digitalClaimed: AFTRHRS_DIGITAL_PASS_LIMIT - 1 } });
    const [first, second] = await Promise.all([
      store.claimDigitalPass({ userId: "final-a", email: "a@promorang.co", authenticated: true, termsAccepted: true }),
      store.claimDigitalPass({ userId: "final-b", email: "b@promorang.co", authenticated: true, termsAccepted: true }),
    ]);
    const wins = [first, second].filter((item) => item.ok);
    const losses = [first, second].filter((item) => !item.ok);
    expect(wins).toHaveLength(1);
    expect(losses).toHaveLength(1);
    expect(store.snapshot().edition.digitalClaimed).toBe(AFTRHRS_DIGITAL_PASS_LIMIT);
  });

  it("shows a remaining percentage skewed 10 points higher until actual remaining is 70%", () => {
    expect(publicRemainingPercent(30, 30)).toBe(100);
    expect(publicRemainingPercent(27, 30)).toBe(100);
    expect(publicRemainingPercent(24, 30)).toBe(90);
    expect(publicRemainingPercent(22, 30)).toBe(83);
    expect(publicRemainingPercent(21, 30)).toBe(70);
    expect(publicRemainingPercent(15, 30)).toBe(50);
    expect(formatPublicRemainingLabel(24, 30)).toBe("90% remaining");
    expect(formatPublicRemainingLabel(0, 30, true)).toBe("Digital release claimed");
    expect(AFTRHRS_COPY.confirmation).toContain("11:30 PM");
    expect(AFTRHRS_COPY.metaDescription).not.toMatch(/\b30\b/);
    expect(AFTRHRS_COPY.soldOutBody).not.toMatch(/\b30\b/);
  });

  it("closes claims after the configured deadline", async () => {
    const store = createAftrHrsInventory({ edition: { claimClosesAt: "2026-09-11T22:00:00-05:00" } });
    const result = await store.claimDigitalPass({
      userId: "late",
      email: "late@promorang.co",
      authenticated: true,
      termsAccepted: true,
      now: "2026-09-11T22:00:00-05:00",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("deadline");
  });

  it("moves sold-out visitors onto the ambassador pathway without closing the night", () => {
    const release = aftrHrsDigitalReleaseView({ soldOut: true, hasPass: false });
    expect(release.kind).toBe("sold_out");
    if (release.kind === "sold_out") {
      expect(release.headline).toBe(AFTRHRS_COPY.soldOutHeadline);
      expect(release.primaryCta).toBe("Find an AftrHrs Ambassador");
      expect(release.secondaryCta).toBe("Join the AftrHrs Waitlist");
      expect(release.eventUnavailable).toBe(false);
    }
  });

  it("builds an authenticated return into the claim flow", () => {
    const path = authPathForAftrHrsClaim();
    expect(path).toContain("/auth?");
    expect(path).toContain("next=%2Faftrhrs%3Fclaim%3D1");
    expect(path).toContain("intent=aftrhrs_claim");
    expect(AFTRHRS_PATHS.landing).toBe("/aftrhrs");
    expect(isAftrHrsClaimReturn("/aftrhrs?claim=1")).toBe(true);
    expect(isAftrHrsClaimReturn("/moments/aftrhrs?claim=1")).toBe(true);
    expect(evaluateDigitalPassClaim({
      edition,
      identity: {},
      authenticated: false,
      termsAccepted: true,
    }).code).toBe("unauthenticated");
  });

  it("lets sold-out visitors request an ambassador", async () => {
    const store = createAftrHrsInventory({ edition: { digitalClaimed: AFTRHRS_DIGITAL_PASS_LIMIT } });
    const claim = await store.claimDigitalPass({
      userId: "sold-out",
      email: "sold@promorang.co",
      authenticated: true,
      termsAccepted: true,
    });
    expect(claim.ok).toBe(false);
    const request = await store.requestAmbassador({ userId: "sold-out", ambassadorId: "amb-1" });
    expect(request.status).toBe("assigned");
    expect(store.snapshot().participations[0]?.state).toBe("ambassador_request_submitted");
  });

  it("will not let ambassador allocation fall below zero", async () => {
    const store = createAftrHrsInventory({
      ambassadors: [{
        ambassadorUserId: "amb-1",
        eventId: AFTRHRS_MOMENT_ID,
        name: "Field",
        allocation: 1,
        distributed: 1,
        trackingCode: "AH-FIELD",
        approved: true,
        active: true,
        contactPreference: "promorang",
        publicContactHandle: null,
        contactConsent: false,
      }],
    });
    const result = await store.fulfillInvitation({ ambassadorId: "amb-1", userId: "guest-1" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("allocation");
  });

  it("attributes a fulfilled physical invitation to the ambassador", async () => {
    const store = createAftrHrsInventory({
      ambassadors: [{
        ambassadorUserId: "amb-2",
        eventId: AFTRHRS_MOMENT_ID,
        name: "Door",
        allocation: 5,
        distributed: 0,
        trackingCode: "AH-DOOR",
        approved: true,
        active: true,
        contactPreference: "whatsapp",
        publicContactHandle: "AftrHrsDoor",
        contactConsent: true,
      }],
    });
    const request = await store.requestAmbassador({ userId: "guest-9", ambassadorId: "amb-2" });
    const result = await store.fulfillInvitation({
      ambassadorId: "amb-2",
      requestId: request.id,
      userId: "guest-9",
      phone: "8765550199",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pass.ambassadorId).toBe("amb-2");
      expect(result.pass.campaign).toBe("AH-DOOR");
      expect(result.pass.passType).toBe("physical-invitation");
    }
    expect(store.snapshot().requests[0]?.status).toBe("fulfilled");
    expect(store.snapshot().ambassadors[0]?.distributed).toBe(1);
  });

  it("rejects a second QR redemption", async () => {
    const store = createAftrHrsInventory();
    const claim = await store.claimDigitalPass({
      userId: "scan-me",
      email: "scan@promorang.co",
      authenticated: true,
      termsAccepted: true,
    });
    expect(claim.ok).toBe(true);
    if (!claim.ok) return;
    const first = await store.redeemPass(claim.pass.qrPayload);
    const second = await store.redeemPass(`promorang://aftrhrs/redeem/${claim.pass.uniqueCode}`);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe("already_redeemed");
    expect(decodeAftrHrsPassPayload(claim.pass.qrPayload)).toBe(claim.pass.uniqueCode);
  });

  it("links the event to Sea Deck and advances Moment participation", async () => {
    const store = createAftrHrsInventory();
    expect(store.snapshot().edition.venueId).toBe(SEA_DECK_VENUE_ID);
    expect(store.snapshot().edition.momentId).toBe(AFTRHRS_MOMENT_ID);
    await store.joinMoment("lifecycle", "landing", "sea-deck");
    expect(store.snapshot().participations[0]?.state).toBe("interested");
    await store.claimDigitalPass({
      userId: "lifecycle",
      email: "life@promorang.co",
      authenticated: true,
      termsAccepted: true,
    });
    expect(store.snapshot().participations[0]?.state).toBe("digital_pass_claimed");
    const pass = store.snapshot().passes[0];
    await store.redeemPass(pass.uniqueCode);
    expect(store.snapshot().participations[0]?.state).toBe("checked_in");
    await store.markAttended("lifecycle");
    expect(store.snapshot().participations[0]?.state).toBe("attended");
    expect(nextParticipationState("attended", "interested")).toBe("attended");
  });
});
