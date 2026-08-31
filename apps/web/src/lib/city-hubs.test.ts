import { describe, expect, it } from "vitest";
import {
  getDefaultCityHub,
  matchesCityHub,
  matchesWeeklyDropItem,
  resolveCityHub,
} from "./city-hubs";

const kingston = resolveCityHub("kingston")!;
const montego = resolveCityHub("montego-bay")!;
const ochoRios = resolveCityHub("ocho-rios")!;
const miami = resolveCityHub("miami")!;
const allJamaica = resolveCityHub("all-jamaica")!;

describe("city hub matching", () => {
  it("defaults to Kingston", () => {
    expect(getDefaultCityHub().id).toBe("kingston");
  });

  it("keeps Kingston moments in the Kingston hub", () => {
    expect(matchesCityHub({ location: "111 Red Hills Road, Kingston 19, Jamaica" }, kingston)).toBe(true);
    expect(matchesCityHub({ city_slug: "kingston" }, kingston)).toBe(true);
  });

  it("does not show Montego Bay moments in Kingston", () => {
    expect(matchesCityHub({ location: "Howard Cooke Blvd, Montego Bay, St. James" }, kingston)).toBe(false);
    expect(matchesCityHub({ city: "Montego Bay" }, kingston)).toBe(false);
  });

  it("shows parish Moments in their own hub and in All Jamaica", () => {
    const ocho = { location: "Plantation Cove, Priory, St. Ann, Jamaica" };
    expect(matchesCityHub(ocho, ochoRios)).toBe(true);
    expect(matchesCityHub(ocho, allJamaica)).toBe(true);
    expect(matchesCityHub(ocho, kingston)).toBe(false);
    expect(matchesCityHub({ city: "Montego Bay" }, montego)).toBe(true);
    expect(matchesCityHub({ city: "Montego Bay" }, allJamaica)).toBe(true);
  });

  it("does not leak Kingston content into other countries", () => {
    expect(matchesCityHub({ location: "Devon House, Kingston" }, miami)).toBe(false);
    expect(matchesCityHub({ city: "Miami", country_code: "US" }, miami)).toBe(true);
  });

  it("keeps weekly drop items inside their own hub", () => {
    const trinidad = resolveCityHub("trinidad")!;
    const accra = resolveCityHub("accra")!;
    expect(matchesWeeklyDropItem({ hub_id: "trinidad", city: "Port of Spain", country_code: "TT" }, trinidad)).toBe(true);
    expect(matchesWeeklyDropItem({ hub_id: "trinidad", city: "Port of Spain", country_code: "TT" }, kingston)).toBe(false);
    expect(matchesWeeklyDropItem({ hub_id: "accra", city: "Accra", country_code: "GH" }, accra)).toBe(true);
    expect(matchesWeeklyDropItem({ hub_id: "kingston", city: "Kingston", country_code: "JM" }, allJamaica)).toBe(true);
    expect(matchesWeeklyDropItem({ hub_id: "accra", city: "Accra", country_code: "GH" }, allJamaica)).toBe(false);
  });

  it("keeps untagged records in the live Kingston / All Jamaica hubs only", () => {
    expect(matchesCityHub({}, kingston)).toBe(true);
    expect(matchesCityHub({}, allJamaica)).toBe(true);
    expect(matchesCityHub({}, montego)).toBe(false);
    expect(matchesCityHub({}, miami)).toBe(false);
  });
});
