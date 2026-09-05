import { describe, it, expect, beforeEach } from "vitest";
import {
  countryCodeToLocale,
  getSavedLocalePreference,
  hasExplicitLocaleChoice,
  markExplicitLocaleChoice,
  saveLocalePreference,
  shouldApplyMarketLocale,
} from "./geo-locale";

describe("geo-locale mapping and persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "promorang_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });

  it("maps Latin American countries to es-419", () => {
    expect(countryCodeToLocale("MX")).toBe("es-419");
    expect(countryCodeToLocale("CO")).toBe("es-419");
    expect(countryCodeToLocale("AR")).toBe("es-419");
    expect(countryCodeToLocale("CL")).toBe("es-419");
    expect(countryCodeToLocale("DO")).toBe("es-419");
    expect(countryCodeToLocale("ES")).toBe("es-419");
  });

  it("maps Portuguese-speaking countries to pt-BR", () => {
    expect(countryCodeToLocale("BR")).toBe("pt-BR");
    expect(countryCodeToLocale("PT")).toBe("pt-BR");
    expect(countryCodeToLocale("AO")).toBe("pt-BR");
    expect(countryCodeToLocale("MZ")).toBe("pt-BR");
  });

  it("maps other countries to en fallback", () => {
    expect(countryCodeToLocale("JM")).toBe("en");
    expect(countryCodeToLocale("US")).toBe("en");
    expect(countryCodeToLocale("GB")).toBe("en");
    expect(countryCodeToLocale("CA")).toBe("en");
    expect(countryCodeToLocale(null)).toBe("en");
  });

  it("saves and retrieves user locale preference from localStorage and cookies", () => {
    expect(getSavedLocalePreference()).toBeNull();
    saveLocalePreference("es-419");
    expect(getSavedLocalePreference()).toBe("es-419");
    expect(window.localStorage.getItem("promorang:locale")).toBe("es-419");

    saveLocalePreference("pt-BR");
    expect(getSavedLocalePreference()).toBe("pt-BR");
  });

  it("blocks market locale overrides after an explicit language choice", () => {
    expect(hasExplicitLocaleChoice()).toBe(false);
    expect(shouldApplyMarketLocale()).toBe(true);

    markExplicitLocaleChoice();

    expect(hasExplicitLocaleChoice()).toBe(true);
    expect(shouldApplyMarketLocale()).toBe(false);
  });
});
