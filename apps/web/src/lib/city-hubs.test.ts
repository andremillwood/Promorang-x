import { describe, expect, it } from "vitest";
import {
  firstCityHubForPlace,
  getDefaultCityHub,
  matchesCityHub,
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

  it("maps a detected Kingston IP onto the Kingston hub", () => {
    expect(firstCityHubForPlace({ city: "Kingston", countryCode: "JM" })?.id).toBe("kingston");
    expect(firstCityHubForPlace({ city: "Miami", countryCode: "US" })?.id).toBe("miami");
  });

  it("keeps untagged records in the live Kingston / All Jamaica hubs only", () => {
    expect(matchesCityHub({}, kingston)).toBe(true);
    expect(matchesCityHub({}, allJamaica)).toBe(true);
    expect(matchesCityHub({}, montego)).toBe(false);
    expect(matchesCityHub({}, miami)).toBe(false);
  });

  it("includes each actual city in its statewide scope without relabelling it as the hub city", () => {
    const florida = resolveCityHub("us-florida")!;
    const michigan = resolveCityHub("us-michigan")!;
    const newYorkState = resolveCityHub("us-new-york")!;
    const detroit = resolveCityHub("detroit")!;
    const nyc = resolveCityHub("new-york")!;
    const pensacola = { city: "Pensacola", city_slug: "pensacola", state: "Florida", country_code: "US" };
    const grandRapids = { city: "Grand Rapids", state: "Michigan", country_code: "US" };
    const buffalo = { city: "Buffalo", location: "Buffalo, New York", state: "New York", country_code: "US" };
    expect(matchesCityHub(pensacola, florida)).toBe(true);
    expect(matchesCityHub(pensacola, miami)).toBe(false);
    expect(matchesCityHub(grandRapids, michigan)).toBe(true);
    expect(matchesCityHub(grandRapids, detroit)).toBe(false);
    expect(matchesCityHub(buffalo, newYorkState)).toBe(true);
    expect(matchesCityHub(buffalo, nyc)).toBe(false);
    expect(firstCityHubForPlace({ city: "Detroit", countryCode: "US" })?.id).toBe("detroit");
  });

  it("matches structured state codes and keeps country and event-title collisions out", () => {
    expect(matchesCityHub({ state_code: "US-GA", country_code: "US" }, resolveCityHub("us-georgia")!)).toBe(true);
    expect(matchesCityHub({ market_key: "us-michigan", country_code: "US" }, resolveCityHub("us-michigan")!)).toBe(true);
    expect(matchesCityHub({ city: "Kingston", title: "Michigan music night" }, resolveCityHub("us-michigan")!)).toBe(false);
    expect(matchesCityHub({ city: "London", country_code: "CA" }, resolveCityHub("london")!)).toBe(false);
    expect(matchesCityHub({ city: "London", country_code: "GB" }, resolveCityHub("london")!)).toBe(true);
  });
});
