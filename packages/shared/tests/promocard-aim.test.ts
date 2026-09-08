import { describe, expect, it } from "vitest";
import {
  aimMatchesBenefit,
  aimedEmptyPresentation,
  discoverHrefForAim,
  inferPromoCardAim,
  inferPromoCardAimFromText,
  ownedBenefitKicker,
  ownedBenefitStatus,
  ownedCardCopy,
  promoCardAimPath,
  promoCardUnlockHref,
  resolvePromoCardAim,
  selectAimedBenefit,
  selectOwnedUseThis,
  sortBenefitsByAim,
} from "../src/promocard-aim";

const barbicanOffer = {
  id: "offer-sea-deck",
  offerId: "offer-sea-deck",
  issuanceId: null,
  dropId: null,
  title: "Sea Deck weekend",
  detail: "Spend $3,000 or more",
  issuer: { id: "m1", type: "merchant", name: "Sea Deck" },
  eligibility: { who: "everyone", perUserLimit: 1, startsAt: null, endsAt: null, remaining: 23 },
  availableQuantity: 23,
  budget: null,
  expiresAt: null,
  fulfillmentState: "available" as const,
  fulfillmentType: "merchant_validation",
  redemption: { recorded: false, code: null, redeemedAt: null, redeemedBy: null },
  sharedBy: null,
  href: "/drop/sea-deck",
  locationLabel: "Barbican",
};

const nightlifeOffer = {
  ...barbicanOffer,
  id: "offer-tab",
  title: "20% tab after dark",
  locationLabel: "New Kingston",
  issuer: { id: "m2", type: "merchant", name: "Tracks" },
};

const claimed = {
  ...nightlifeOffer,
  id: "iss-1",
  fulfillmentState: "claimed" as const,
  redemption: { recorded: false, code: "PR-LIVE01", redeemedAt: null, redeemedBy: null },
};

describe("PromoCard aim", () => {
  it("resolves the customer scenes that turn the card on", () => {
    expect(resolvePromoCardAim("Kingston After Dark")?.id).toBe("kingston-after-dark");
    expect(resolvePromoCardAim("barbican")?.label).toBe("Barbican");
    expect(resolvePromoCardAim("food")?.lens).toBe("eat");
    expect(resolvePromoCardAim("tonight")?.preferredTimes).toContain("evening");
    expect(resolvePromoCardAim("wallet")).toBeNull();
  });

  it("sends guests to signup that lands on the aimed card", () => {
    const aim = resolvePromoCardAim("food")!;
    expect(promoCardAimPath(aim)).toBe("/card?aim=food");
    expect(promoCardUnlockHref({ aim })).toBe("/auth?mode=signup&next=%2Fcard%3Faim%3Dfood");
    expect(promoCardUnlockHref({ authenticated: true, aim })).toBe("/card?aim=food");
  });

  it("matches and features the aimed live benefit without inventing credit", () => {
    const barbican = resolvePromoCardAim("barbican")!;
    const afterDark = resolvePromoCardAim("kingston-after-dark")!;
    expect(aimMatchesBenefit(barbican, barbicanOffer)).toBe(true);
    expect(aimMatchesBenefit(afterDark, nightlifeOffer)).toBe(true);
    expect(inferPromoCardAim(barbicanOffer)?.id).toBe("barbican");
    expect(selectAimedBenefit({ aim: afterDark, nearby: [barbicanOffer, nightlifeOffer] })?.id).toBe("offer-tab");
    expect(selectAimedBenefit({ aim: afterDark, useThis: claimed, nearby: [barbicanOffer] })?.id).toBe("iss-1");
    expect(sortBenefitsByAim([barbicanOffer, nightlifeOffer], afterDark)[0].id).toBe("offer-tab");
  });

  it("aims the empty card instead of showing fake money", () => {
    const aim = resolvePromoCardAim("tonight")!;
    const empty = aimedEmptyPresentation({ aim, authenticated: false });
    expect(empty.headline).toBe("SET FOR TONIGHT");
    expect(empty.ctaLabel).toBe("Unlock this");
    expect(empty.description).toContain("tonight");
    expect(empty.href).toContain("aim%3Dtonight");
    expect(empty.headline).not.toContain("$");
  });

  it("treats a claimed aimed perk as owned on the card", () => {
    const afterDark = resolvePromoCardAim("kingston-after-dark")!;
    const food = resolvePromoCardAim("food")!;
    expect(inferPromoCardAimFromText("aim:food jerk on friday")?.id).toBe("food");
    expect(discoverHrefForAim(food)).toContain("lens=eat");
    expect(discoverHrefForAim(food)).toContain("aim=food");
    expect(selectOwnedUseThis({ aim: afterDark, benefits: [claimed, { ...barbicanOffer, fulfillmentState: "claimed", redemption: claimed.redemption }] })?.id).toBe("iss-1");
    expect(ownedBenefitKicker({ fromDiscover: true }, afterDark)).toBe("On your card · Kingston After Dark");
    expect(ownedBenefitStatus(claimed)).toBe("Ready to use");
    expect(ownedCardCopy({ aim: afterDark, owned: true, holder: "Nia" }).title).toContain("Kingston After Dark");
    expect(ownedCardCopy({ aim: afterDark, owned: true }).description).toContain("Show it where it works");
    expect(ownedCardCopy({ owned: false }).description).not.toContain("merchant supplied");
  });
});
