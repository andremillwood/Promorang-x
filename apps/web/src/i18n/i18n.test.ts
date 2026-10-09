import { describe, expect, it } from "vitest";
import { normalizeLocale } from "./I18nContext";
import { supportedLocales, translations } from "./translations";
import { localeFromPath, localizePath, routerBasename, stripLocalePrefix } from "./locale-routing";
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

  it("preserves interpolation variables in every translation", () => {
    const variables = (value: string) => [...value.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();
    for (const [key, value] of Object.entries(translations.en)) {
      for (const locale of supportedLocales) expect(variables(translations[locale][key as keyof typeof translations.en]), key).toEqual(variables(value));
    }
  });

  it("recognizes and rewrites localized public paths", () => {
    expect(localeFromPath("/es/discover/moments")).toBe("es-419");
    expect(localeFromPath("/pt-br/scenes")).toBe("pt-BR");
    expect(stripLocalePrefix("/es/discover")).toBe("/discover");
    expect(localizePath("/es/discover", "pt-BR")).toBe("/pt-br/discover");
    expect(localizePath("/pt-br/scenes", "en")).toBe("/scenes");
  });

  it.each([["/es-419/discover", "/es-419"], ["/pt/moments/example", "/pt"], ["/pt-br/discover", "/pt-br"]])("matches the real router prefix for %s", (pathname, basename) => {
    window.history.replaceState({}, "", pathname);
    try { expect(routerBasename()).toBe(basename); }
    finally { window.history.replaceState({}, "", "/"); }
  });

  it.each(["es-419", "pt-BR"] as const)("keeps %s Help editorial content complete", (locale) => {
    const spanishGuides = Object.keys(helpGuideTranslations["es-419"] || {}).sort();
    expect(Object.keys(helpGuideTranslations[locale] || {}).sort()).toEqual(spanishGuides);
    expect(spanishGuides.length).toBeGreaterThanOrEqual(7);
    expect(helpFaqTranslations[locale].length).toBeGreaterThanOrEqual(10);
  });
});
