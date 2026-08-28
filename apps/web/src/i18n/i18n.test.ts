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

  it("translates homepage marketing copy instead of falling back to English", () => {
    const homepageKeys = [
      "home.promoHeadline1",
      "home.promoGetCard",
      "home.pillarsTitle",
      "home.pillar2Title",
      "home.mobileNextOuting",
      "home.hostVenuePass",
      "home.brandsRetail",
    ] as const;

    homepageKeys.forEach((key) => {
      expect(translations["es-419"][key]).not.toEqual(translations.en[key]);
      expect(translations["pt-BR"][key]).not.toEqual(translations.en[key]);
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
});
