import { describe, expect, it } from "vitest";
import {
  AFTRHRS_COPY,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_OG_IMAGE,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_PATHS,
  AFTRHRS_RECURRENCE,
  AFTRHRS_WEEKDAY,
  DEFAULT_AFTRHRS_FAQS,
  SEA_DECK_VENUE_ID,
  hasAftrHrsFridayRecurrence,
  aftrHrsDigitalReleaseView,
  authPathForAftrHrsClaim,
  authPathForAftrHrsPass,
  isAftrHrsPassPath,
  decodeAftrHrsPassPayload,
  encodeAftrHrsPassPayload,
  evaluateDigitalPassClaim,
  formatPublicRemainingLabel,
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
    expect(AFTRHRS_PATHS.passAlias).toBe("/aftrhrs/pass");
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
    expect(AFTRHRS_COPY.sceneMomentLine).toMatch(/Kingston After Dark/);
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
