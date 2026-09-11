import { describe, expect, it } from "vitest";
import {
  AFTRHRS_COPY,
  AFTRHRS_DIGITAL_PASS_BATCH,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_RSVP_LIMIT,
  AFTRHRS_OG_IMAGE,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_PATHS,
  AFTRHRS_RECURRENCE,
  AFTRHRS_WEEKDAY,
  DEFAULT_AFTRHRS_FAQS,
  SEA_DECK_VENUE_ID,
  hasAftrHrsFridayRecurrence,
  aftrHrsClaimFriday,
  aftrHrsEditionSlug,
  aftrHrsDigitalReleaseView,
  authPathForAftrHrsClaim,
  authPathForAftrHrsPass,
  isAftrHrsPassPath,
  decodeAftrHrsPassPayload,
  encodeAftrHrsPassPayload,
  evaluateDigitalPassClaim,
  evaluateGuestEntry,
  formatPublicRemainingLabel,
  guestGoingLine,
  guestLaneCopy,
  remainingCapacityMood,
  guestPassStatus,
  guestPassType,
  adminPassStatus,
  ambassadorInviteProgress,
  normalizeAftrHrsFaqs,
  readAftrHrsAdminEdition,
  AFTRHRS_ADMIN_COPY,
  AFTRHRS_ADMIN_FUNNEL,
  isAftrHrsClaimReturn,
  isAftrHrsAuthIntent,
  hrefForSceneMoment,
  isAftrHrsMoment,
  isAftrHrsSceneSlug,
  sceneMomentsWithAftrHrs,
  shouldResumeAftrHrsClaim,
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
    expect(formatPublicRemainingLabel(90)).toBe("90%");
    expect(formatPublicRemainingLabel(0, true)).toBe("Digital release claimed");
    expect(AFTRHRS_COPY.confirmation).toContain("11:30 PM");
    expect(AFTRHRS_COPY.metaDescription).not.toMatch(/\b30\b/);
    expect(AFTRHRS_COPY.soldOutBody).not.toMatch(/\b30\b/);
    expect(JSON.stringify(AFTRHRS_COPY)).not.toMatch(/percentage/i);
    expect(JSON.stringify(DEFAULT_AFTRHRS_FAQS)).not.toMatch(/percentage|shown as|page reading|claim button|page counter/i);
    expect(guestPassStatus("active")).toBe("Ready");
    expect(guestPassStatus("redeemed")).toBe("Used");
    expect(guestPassType("digital-free")).toBe("Digital free pass");
    expect(guestPassType("physical-invitation")).toBe("Physical invitation");
    expect(adminPassStatus("active")).toBe("Ready for the door");
    expect(adminPassStatus("redeemed")).toBe("Already used at the door");
    expect(ambassadorInviteProgress(0, 15)).toBe("None of 15 invitations given out yet.");
    expect(ambassadorInviteProgress(3, 15)).toBe("3 of 15 invitations given out · 12 left");
    expect(AFTRHRS_ADMIN_COPY.claimsLabel).toMatch(/free digital pass/i);
    expect(AFTRHRS_ADMIN_COPY.pageModeLive).toMatch(/tonight is on/i);
    expect(JSON.stringify(AFTRHRS_ADMIN_COPY)).not.toMatch(/FAQ JSON|page mode|Claims open|Export CSV|Reinstate|admin-editable/i);
    expect(AFTRHRS_ADMIN_FUNNEL.every((item) => !item.label.includes("_"))).toBe(true);
    expect(AFTRHRS_OG_IMAGE.path).toBe("/og/aftrhrs.jpg");
    expect(AFTRHRS_OG_IMAGE.alt).toBe("AftrHrs at Sea Deck");
    expect(AFTRHRS_COPY.when).toBe("Every Friday");
    expect(AFTRHRS_COPY.whenLine).toContain("Every Friday");
    expect(AFTRHRS_COPY.metaDescription).toMatch(/every Friday/i);
    expect(DEFAULT_AFTRHRS_FAQS.some((faq) => /every friday/i.test(`${faq.question} ${faq.answer}`))).toBe(true);
    expect(hasAftrHrsFridayRecurrence(AFTRHRS_RECURRENCE)).toBe(true);
    expect(AFTRHRS_WEEKDAY).toBe(5);
    expect(hasAftrHrsFridayRecurrence({ ...AFTRHRS_RECURRENCE, recurrence_enabled: false })).toBe(false);
    expect(defaultAftrHrsEdition().claimClosesAt).toBeNull();
  });

  it("keeps digital claims open after the first Friday when no deadline is set", async () => {
    const store = createAftrHrsInventory();
    const result = await store.claimDigitalPass({
      userId: "week-two",
      email: "week-two@promorang.co",
      authenticated: true,
      termsAccepted: true,
      now: "2026-09-18T21:00:00-05:00",
    });
    expect(result.ok).toBe(true);
  });

  it("opens a new Friday edition, expires unused passes, and lets guests claim again", async () => {
    const store = createAftrHrsInventory();
    const first = await store.claimDigitalPass({
      userId: "return-guest",
      email: "return@promorang.co",
      authenticated: true,
      termsAccepted: true,
      now: "2026-09-11T21:00:00-05:00",
    });
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.pass.weekFriday).toBe("2026-09-11");

    const stillTonight = await store.redeemPass(first.ok ? first.pass.uniqueCode : "", "2026-09-12T05:30:00-05:00");
    expect(stillTonight.ok).toBe(true);

    const nextWeek = await store.claimDigitalPass({
      userId: "return-guest",
      email: "return@promorang.co",
      authenticated: true,
      termsAccepted: true,
      now: "2026-09-12T06:00:00-05:00",
    });
    expect(nextWeek.ok).toBe(true);
    if (nextWeek.ok) {
      expect(nextWeek.pass.weekFriday).toBe("2026-09-18");
      expect(nextWeek.remaining).toBe(AFTRHRS_DIGITAL_PASS_LIMIT - 1);
    }
    expect(store.snapshot().edition.weekFriday).toBe("2026-09-18");
    expect(store.snapshot().edition.digitalClaimed).toBe(1);
    expect(store.snapshot().passes.filter((pass) => pass.status === "expired")).toHaveLength(0);

    const unused = await store.claimDigitalPass({
      userId: "no-show",
      email: "noshow@promorang.co",
      authenticated: true,
      termsAccepted: true,
      now: "2026-09-18T12:00:00-05:00",
    });
    expect(unused.ok).toBe(true);
    const afterNight = await store.redeemPass(unused.ok ? unused.pass.uniqueCode : "", "2026-09-19T06:00:00-05:00");
    expect(afterNight.ok).toBe(false);
    if (!afterNight.ok) expect(afterNight.code).toBe("not_redeemable");
    expect(store.snapshot().passes.find((pass) => pass.userId === "no-show")?.status).toBe("expired");
    expect(aftrHrsClaimFriday("2026-09-11T21:00:00-05:00")).toBe("2026-09-11");
    expect(aftrHrsClaimFriday("2026-09-12T05:59:00-05:00")).toBe("2026-09-11");
    expect(aftrHrsClaimFriday("2026-09-12T06:00:00-05:00")).toBe("2026-09-18");
    expect(aftrHrsClaimFriday("2026-09-14T12:00:00-05:00")).toBe("2026-09-18");
    expect(aftrHrsEditionSlug("2026-09-11")).toBe("aftrhrs");
    expect(aftrHrsEditionSlug("2026-09-18")).toBe("aftrhrs-2026-09-18");
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
    expect(path).toContain("next=%2Fmoments%2Faftrhrs%3Fclaim%3D1");
    expect(path).toContain("intent=aftrhrs_claim");
    expect(AFTRHRS_PATHS.landing).toBe("/aftrhrs");
    expect(isAftrHrsClaimReturn("/aftrhrs?claim=1")).toBe(true);
    expect(isAftrHrsClaimReturn("/moments/aftrhrs?claim=1")).toBe(true);
    expect(AFTRHRS_PATHS.passAlias).toBe("/aftrhrs/pass");
    expect(AFTRHRS_PATHS.ticket).toBe("/aftrhrs/ticket");
    expect(AFTRHRS_PATHS.claimReturn).toBe("/moments/aftrhrs?claim=1");
    expect(authPathForAftrHrsPass()).toContain("next=%2Faftrhrs%2Fpass");
    expect(authPathForAftrHrsPass()).toContain("intent=aftrhrs_pass");
    expect(isAftrHrsPassPath("/aftrhrs/pass")).toBe(true);
    expect(isAftrHrsPassPath("/moments/aftrhrs/pass")).toBe(true);
    expect(isAftrHrsAuthIntent("aftrhrs_claim", "/dashboard")).toBe(true);
    expect(isAftrHrsAuthIntent(null, "/aftrhrs?claim=1")).toBe(true);
    expect(isAftrHrsAuthIntent(null, "/wallet")).toBe(false);
    expect(shouldResumeAftrHrsClaim({
      authenticated: true,
      hasPass: false,
      pendingTermsAccepted: true,
    })).toBe(true);
    expect(shouldResumeAftrHrsClaim({
      authenticated: true,
      hasPass: false,
      pendingTermsAccepted: false,
    })).toBe(false);
    expect(shouldResumeAftrHrsClaim({
      authenticated: true,
      hasPass: true,
      pendingTermsAccepted: true,
    })).toBe(false);
    expect(AFTRHRS_COPY.findPass).toMatch(/wallet/);
    expect(AFTRHRS_COPY.authBody).toMatch(/automatically/);
    expect(DEFAULT_AFTRHRS_FAQS.some((faq) => faq.question.includes("signed up for Promorang"))).toBe(true);
    expect(DEFAULT_AFTRHRS_FAQS.some((faq) => faq.question.includes("Kingston After Dark"))).toBe(true);
    expect(DEFAULT_AFTRHRS_FAQS.find((faq) => faq.question.includes("Kingston After Dark"))?.answer).toMatch(/inside that scene/);
    expect(isAftrHrsSceneSlug("kingston-after-dark")).toBe(true);
    expect(isAftrHrsSceneSlug("food-and-taste")).toBe(false);
    expect(isAftrHrsMoment({ id: AFTRHRS_MOMENT_ID })).toBe(true);
    expect(hrefForSceneMoment({ id: AFTRHRS_MOMENT_ID })).toBe("/aftrhrs");
    expect(sceneMomentsWithAftrHrs("kingston-after-dark", [{ id: "other", title: "Other" }])[0].title).toBe("AftrHrs");
    expect(AFTRHRS_COPY.homepageHeroBody).toMatch(/Friday moment in Kingston After Dark/);
    expect(AFTRHRS_COPY.homepageHeroBody).toMatch(/no account/);
    expect(AFTRHRS_COPY.sceneCta).toBe("RSVP for Friday");
    expect(AFTRHRS_COPY.guestRsvpCta).toBe("RSVP for Friday");
    expect(guestGoingLine(0)).toBeNull();
    expect(guestGoingLine(1)).toBe("1 already going");
    expect(guestGoingLine(12)).toBe("12 already going");
    expect(AFTRHRS_COPY.guestMomentLine).toMatch(/PROMORANG/);
    expect(AFTRHRS_COPY.guestMomentLine).toMatch(/going/);
    expect(JSON.stringify(DEFAULT_AFTRHRS_FAQS)).not.toMatch(/30 digital|30 RSVP|30 passes|only 30/i);
    expect(JSON.stringify(DEFAULT_AFTRHRS_FAQS)).not.toMatch(/\b50\b/);
    expect(AFTRHRS_COPY.homepageHeroEyebrow).toBe("Friday night");
    expect(AFTRHRS_COPY.sceneMomentLine).toMatch(/AftrHrs at Sea Deck/);
    expect(AFTRHRS_COPY.sceneListBody).toMatch(/Friday moment in this scene/);
    expect(AFTRHRS_COPY.sceneAsideBody).toMatch(/This is Kingston After Dark/);
    expect(AFTRHRS_COPY.sceneFeaturedLine).toBe("AftrHrs at Sea Deck");
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

describe("AftrHrs public guest RSVP", () => {
  it("captures a Friday RSVP without a Promorang account", async () => {
    const store = createAftrHrsInventory();
    const result = await store.guestRsvp({
      kind: "rsvp",
      name: "Ada Hall",
      email: "ada@example.com",
      phone: "8765550101",
      termsAccepted: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.kind).toBe("rsvp");
      expect(result.entry.email).toBe("ada@example.com");
      expect(result.remaining).toBe(AFTRHRS_RSVP_LIMIT - 1);
    }
    expect(store.snapshot().edition.rsvpClaimed).toBe(1);
  });

  it("issues a monthly digital pass in batches and closes the drop when it fills", async () => {
    const store = createAftrHrsInventory();
    const first = await store.guestRsvp({
      kind: "digital-pass",
      name: "Ben Cole",
      email: "ben@example.com",
      phone: "8765550102",
      termsAccepted: true,
    });
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.remaining).toBe(AFTRHRS_DIGITAL_PASS_BATCH - 1);

    const repeat = await store.guestRsvp({
      kind: "digital-pass",
      name: "Ben Cole",
      email: "ben@example.com",
      phone: "8765550102",
      termsAccepted: true,
    });
    expect(repeat.ok).toBe(false);
    if (!repeat.ok) expect(repeat.code).toBe("already_claimed");

    const filled = await Promise.all(
      Array.from({ length: AFTRHRS_DIGITAL_PASS_BATCH }, (_, index) =>
        store.guestRsvp({
          kind: "digital-pass",
          name: `Guest ${index}`,
          email: `guest${index}@example.com`,
          phone: `8765551${String(index).padStart(3, "0")}`,
          termsAccepted: true,
        }),
      ),
    );
    expect(filled.filter((item) => item.ok)).toHaveLength(AFTRHRS_DIGITAL_PASS_BATCH - 1);
    expect(store.snapshot().digitalRelease.claimsOpen).toBe(false);

    const closed = await store.guestRsvp({
      kind: "digital-pass",
      name: "Late Guest",
      email: "late@example.com",
      phone: "8765550199",
      termsAccepted: true,
    });
    expect(closed.ok).toBe(false);
    if (!closed.ok) expect(closed.code).toBe("closed");

    await store.openDigitalRelease();
    const nextDrop = await store.guestRsvp({
      kind: "digital-pass",
      name: "Next Drop",
      email: "next@example.com",
      phone: "8765550200",
      termsAccepted: true,
    });
    expect(nextDrop.ok).toBe(true);
  });

  it("lets the door scan a guest digital pass and a Friday RSVP code", async () => {
    const store = createAftrHrsInventory();
    const pass = await store.guestRsvp({
      kind: "digital-pass",
      name: "Cara",
      email: "cara@example.com",
      phone: "8765550103",
      termsAccepted: true,
    });
    expect(pass.ok).toBe(true);
    if (!pass.ok) return;
    const first = await store.redeemPass(`promorang://aftrhrs/redeem/${pass.entry.uniqueCode}`);
    expect(first.ok).toBe(true);
    const second = await store.redeemPass(pass.entry.uniqueCode);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe("already_redeemed");
  });

  it("opens a fresh Friday RSVP list after Saturday morning without touching the digital drop", async () => {
    const store = createAftrHrsInventory();
    const friday = await store.guestRsvp({
      kind: "rsvp",
      name: "Dana",
      email: "dana@example.com",
      phone: "8765550104",
      termsAccepted: true,
      now: "2026-09-11T21:00:00-05:00",
    });
    expect(friday.ok).toBe(true);
    const pass = await store.guestRsvp({
      kind: "digital-pass",
      name: "Eli",
      email: "eli@example.com",
      phone: "8765550105",
      termsAccepted: true,
      now: "2026-09-11T21:00:00-05:00",
    });
    expect(pass.ok).toBe(true);

    const nextWeek = await store.guestRsvp({
      kind: "rsvp",
      name: "Dana",
      email: "dana@example.com",
      phone: "8765550104",
      termsAccepted: true,
      now: "2026-09-12T06:00:00-05:00",
    });
    expect(nextWeek.ok).toBe(true);
    expect(store.snapshot().edition.rsvpClaimed).toBe(1);
    expect(store.snapshot().digitalRelease.claimed).toBe(1);
  });

  it("describes remaining room without naming the caps", () => {
    expect(remainingCapacityMood(100).label).toBe("Still room");
    expect(remainingCapacityMood(60).label).toBe("Filling up");
    expect(remainingCapacityMood(30).label).toBe("Going fast");
    expect(remainingCapacityMood(10).label).toBe("Almost gone");
    expect(guestLaneCopy("rsvp", 0, true).title).toBe("The list is full");
    expect(guestLaneCopy("digital-pass", 0, true).title).toBe("This drop is closed");
    expect(guestLaneCopy("rsvp", 90, false).body).not.toMatch(/30 RSVP|30 spots|only 30/i);
    expect(guestLaneCopy("digital-pass", 90, false).body).not.toMatch(/\b50\b/);
    expect(evaluateGuestEntry({
      kind: "rsvp",
      name: "A",
      email: "bad",
      phone: "8765550101",
      termsAccepted: true,
    }).ok).toBe(false);
  });
});

describe("AftrHrs admin language", () => {
  it("reads edition settings without asking staff to type JSON", () => {
    const edition = readAftrHrsAdminEdition({
      digital_allocation: 30,
      claims_open: false,
      published: true,
      page_mode: "post-event",
      venue_policies: { entry_policy: "Arrive before 11:30 PM." },
      faqs: JSON.stringify([{ question: "When?", answer: "Every Friday." }]),
    });
    expect(edition.allocation).toBe("30");
    expect(edition.claimsOpen).toBe(false);
    expect(edition.pageMode).toBe("post-event");
    expect(edition.policy).toContain("11:30");
    expect(normalizeAftrHrsFaqs(edition.faqs)).toEqual([{ question: "When?", answer: "Every Friday." }]);
    expect(AFTRHRS_ADMIN_COPY.faqsHelp).toMatch(/question/i);
    expect(AFTRHRS_ADMIN_COPY.downloadList).toBe("Download guest list");
  });
});
