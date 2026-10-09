import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  countryCodeToLocale,
  currentUiLocale,
  getCookie,
  localeRequestHeaders,
  getSavedLocalePreference,
  hasExplicitLocaleChoice,
  markExplicitLocaleChoice,
  saveLocalePreference,
  shouldApplyMarketLocale,
} from "./geo-locale";

describe("geo-locale mapping and persistence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
    document.cookie = "promorang_locale_explicit=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "promorang_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });

  afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });

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
  it("uses the URL locale for API requests and formatters ahead of a saved preference", () => {
    saveLocalePreference("en");
    window.history.replaceState({}, "", "/pt-br/moments/example");
    expect(currentUiLocale()).toBe("pt-BR");
    expect(localeRequestHeaders()).toEqual({ "X-Promorang-Locale": "pt-BR" });
    window.history.replaceState({}, "", "/es/discover");
    expect(currentUiLocale()).toBe("es-419");
  });

  it("reads a cookie even when it is not first in the cookie string", () => {
    document.cookie = "another_cookie=example; path=/;";
    document.cookie = "promorang_locale=pt-BR; path=/;";
    expect(getCookie("promorang_locale")).toBe("pt-BR");
    document.cookie = "another_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });

  it("keeps language selection usable when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    saveLocalePreference("es-419");
    markExplicitLocaleChoice();
    expect(getSavedLocalePreference()).toBe("es-419");
    expect(hasExplicitLocaleChoice()).toBe(true);
    expect(shouldApplyMarketLocale()).toBe(false);
  });

});
