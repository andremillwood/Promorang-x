import { describe, expect, it } from "vitest";
import { normalizeLocale } from "./I18nContext";
import { supportedLocales, translations } from "./translations";
import { localeFromPath, localizePath, stripLocalePrefix } from "./locale-routing";
import { helpFaqTranslations, helpGuideTranslations } from "./help-content";

describe("localization", () => {
  it.each([
    ["en-US", "en"],
    ["es-MX", "es-419"],
    ["es-ES", "es-419"],
    ["pt-BR", "pt-BR"],
    ["pt-PT", "pt-BR"],
    ["fr-FR", "en"],
    [null, "en"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected);
  });

  it("keeps every locale catalog complete", () => {
    const englishKeys = Object.keys(translations.en).sort();
    supportedLocales.forEach((locale) => {
      expect(Object.keys(translations[locale]).sort()).toEqual(englishKeys);
      expect(Object.values(translations[locale]).every(Boolean)).toBe(true);
    });
  });

  it("recognizes and rewrites localized public paths", () => {
    expect(localeFromPath("/es/discover/moments")).toBe("es-419");
    expect(localeFromPath("/pt-br/scenes")).toBe("pt-BR");
    expect(stripLocalePrefix("/es/discover")).toBe("/discover");
    expect(localizePath("/es/discover", "pt-BR")).toBe("/pt-br/discover");
    expect(localizePath("/pt-br/scenes", "en")).toBe("/scenes");
  });

  it.each(["es-419", "pt-BR"] as const)("keeps %s Help editorial content complete", (locale) => {
    expect(Object.keys(helpGuideTranslations[locale] || {})).toHaveLength(7);
    expect(helpFaqTranslations[locale]).toHaveLength(10);
  });

  it("covers dashboard, footer, discover, vault, nodes, wallet, and acquisition chrome", () => {
    const required = [
      "common.skipToContent",
      "footer.linkSaveWin",
      "dashNav.today",
      "dashMobile.discover",
      "dashRole.participant",
      "discoverHub.title",
      "vaultPage.tabClaimed",
      "nodesHub.title",
      "wallet.pathTitle",
      "acquire.lockPick",
      "pwa.addToHomeScreen",
      "errors.appUpdated",
      "auth.continuePlan",
      "auth.personalMembership",
      "auth.demoWorkspaceNote",
      "settings.pushTitle",
      "settings.rankExplorer",
      "settings.guided",
      "submit.trigger",
      "submit.catFoodDining",
      "stripe.complete",
      "commerce.receiptReady",
      "kyc.formTitle",
      "kyc.underReview",
      "onboarding.alertsTitle",
      "onboarding.enableAlerts",
      "comments.posted",
      "joinBar.join",
      "feed.latest",
      "billing.confirmed",
      "moment.notFound",
      "search.noResults",
      "contact.openTickets",
      "home.findVibe",
      "home.liveBadge",
      "support.title",
      "support.generalContact",
      "support.appeal",
      "wallet.withdrawCancelled",
      "home.pillarsTitle",
      "perkHub.seoTitle",
      "perkHub.requestCta",
      "spin.title",
      "memory.title",
      "cardDrop.badge",
      "membership.order",
      "hostUnlock.startHosting",
      "offerDetail.claimWallet",
      "proofVault.title",
      "promoshare.seoTitle",
      "promoshare.youQualified",
      "momentum.hero1",
      "momentum.oppFeed",
      "pieceProfile.quickTrade",
      "pieceProfile.notFound",
      "pieceHoldings.archive",
      "forDev.seoTitle",
      "brandCases.title1",
      "valueNav.wallet",
      "psElig.title",
      "cause.treeTitle",
      "receipt.copyLink",
      "receipt.shareTweet",
      "merchantRoi.title",
      "guestPerk.title",
      "creatorEarn.title",
      "brandCamp.title",
      "hostSynd.title",
      "valueHub.title",
      "proofModal.title",
      "passport.badge",
      "markReceipt.captured",
      "valueJourney.whatChanged",
      "storyModal.title",
      "recStudio.psTitle",
      "earnCard.qualified",
      "valuePool.title",
      "earnDash.title",
      "valueStudio.seoTitle",
      "orgLand.seoTitle",
      "orgLand.getStarted",
      "venueTease.seoTitle",
      "venueTease.claimCta",
      "campLand.whyTitle",
      "pageClaim.title",
      "consPrev.navHome",
      "consMom.loopTitle",
      "consHome.welcome",
      "hostOps.doorList",
      "hostOps.confirmArrival",
    ] as const;

    supportedLocales.forEach((locale) => {
      required.forEach((key) => {
        expect(translations[locale][key]).toBeTruthy();
      });
    });
  });
});
