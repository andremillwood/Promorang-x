import { describe, expect, it } from "vitest";
import { ISO_COUNTRIES, resolveIsoCountry, searchIsoCountries } from "./iso-countries";
import { isAdultDob, legacyPreferenceCountryCode, validateSignupEligibility } from "./signup-eligibility";

describe("signup country and age", () => {
  it("maps a typed Jamaica to JM and does not invent a selection from an empty query", () => {
    expect(resolveIsoCountry("Jamaica")?.code).toBe("JM");
    expect(resolveIsoCountry("jm")?.code).toBe("JM");
    expect(searchIsoCountries("jam").map((country) => country.code)).toContain("JM");
    expect(searchIsoCountries("")).toEqual([]);
    expect(resolveIsoCountry("")).toBeNull();
    expect(resolveIsoCountry("US")?.code).toBe("US");
  });

  it("treats the legacy US default as unknown and keeps Jamaica", () => {
    expect(legacyPreferenceCountryCode("US")).toBeNull();
    expect(legacyPreferenceCountryCode("usa")).toBeNull();
    expect(legacyPreferenceCountryCode("Jamaica")).toBe("JM");
    expect(legacyPreferenceCountryCode("JM")).toBe("JM");
    expect(legacyPreferenceCountryCode(null)).toBeNull();
    expect(legacyPreferenceCountryCode("United States")).toBe("US");
    expect(ISO_COUNTRIES.filter((country) => country.code === "JM")).toHaveLength(1);
    expect(new Set(ISO_COUNTRIES.map((country) => country.code)).size).toBe(ISO_COUNTRIES.length);
  });

  it("blocks anyone under 18 in Jamaica local time and allows an 18th birthday", () => {
    const now = new Date("2026-11-21T03:30:00.000Z");
    expect(isAdultDob("2008-11-20", now)).toBe(true);
    expect(isAdultDob("2008-11-21", now)).toBe(false);
    expect(validateSignupEligibility({ countryCode: "JM", dob: "2008-11-21" }, now)).toBe("UNDERAGE");
    expect(validateSignupEligibility({ countryCode: "JM", dob: "2008-11-20" }, now)).toBeNull();
    expect(validateSignupEligibility({ countryCode: "", dob: "1990-01-01" }, now)).toBe("COUNTRY_REQUIRED");
    expect(validateSignupEligibility({ countryCode: "XX", dob: "1990-01-01" }, now)).toBe("INVALID_COUNTRY");
  });
});

