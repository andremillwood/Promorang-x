import { describe, expect, it } from "vitest";
import {
  offerMatchesPlace,
  rankOffersForPlace,
  resolveOfferReach,
  selectOffersForPlace,
} from "./offer-availability";

const kingston = { city: "Kingston", citySlug: "kingston", country: "Jamaica", countryCode: "JM" };
const miami = { city: "Miami", citySlug: "miami", country: "United States", countryCode: "US" };
const allJamaica = { city: "All Jamaica", citySlug: "all-jamaica", country: "Jamaica", countryCode: "JM" };

describe("resolveOfferReach", () => {
  it("treats venue check-ins as local Kingston-style place offers", () => {
    const reach = resolveOfferReach({
      fulfillment_type: "merchant_validation",
      metadata: { city: "Kingston", city_slug: "kingston", location: "Barbican" },
    });
    expect(reach).toMatchObject({
      availability: "local",
      surface: "place",
      city: "Kingston",
      locationLabel: "Barbican",
    });
  });

  it("treats shipping and shop language as anywhere commerce", () => {
    const reach = resolveOfferReach({
      fulfillment_type: "shipping",
      title: "Limited merch drop",
      description: "Ships worldwide from the Shopify store.",
    });
    expect(reach.availability).toBe("anywhere");
    expect(reach.surface).toBe("commerce");
    expect(reach.locationLabel).toBe("Shop anywhere");
  });

  it("treats DSP and streaming language as anywhere music releases", () => {
    const reach = resolveOfferReach({
      fulfillment_type: "automatic",
      title: "Pre-save the new single",
      description: "Unlock when the track hits Spotify and Apple Music.",
    });
    expect(reach).toMatchObject({
      availability: "anywhere",
      surface: "release",
      locationLabel: "On streaming",
    });
  });

  it("treats livestreams as anywhere digital events", () => {
    const reach = resolveOfferReach({
      fulfillment_type: "code",
      title: "Watch the livestream",
      metadata: { availability: "anywhere", surface: "digital" },
    });
    expect(reach.availability).toBe("anywhere");
    expect(reach.surface).toBe("digital");
  });
});

describe("offerMatchesPlace", () => {
  it("always includes anywhere offers", () => {
    const release = resolveOfferReach({
      fulfillment_type: "automatic",
      metadata: { availability: "anywhere", surface: "release" },
    });
    expect(offerMatchesPlace(release, kingston)).toBe(true);
    expect(offerMatchesPlace(release, miami)).toBe(true);
  });

  it("keeps Kingston venue offers in Kingston and hides them in Miami", () => {
    const local = resolveOfferReach({
      fulfillment_type: "merchant_validation",
      metadata: { city: "Kingston", city_slug: "kingston", location: "New Kingston" },
    });
    expect(offerMatchesPlace(local, kingston)).toBe(true);
    expect(offerMatchesPlace(local, miami)).toBe(false);
  });

  it("keeps untagged local inventory on the Kingston / Jamaica hubs only", () => {
    const untagged = resolveOfferReach({ fulfillment_type: "merchant_validation", title: "First drink" });
    expect(untagged.availability).toBe("local");
    expect(offerMatchesPlace(untagged, kingston)).toBe(true);
    expect(offerMatchesPlace(untagged, allJamaica)).toBe(true);
    expect(offerMatchesPlace(untagged, miami)).toBe(false);
  });

  it("ranks matching local offers ahead of anywhere drops", () => {
    const ranked = rankOffersForPlace([
      { id: "dsp", reach: resolveOfferReach({ metadata: { availability: "anywhere", surface: "release" } }) },
      { id: "drink", reach: resolveOfferReach({ metadata: { availability: "local", city: "Kingston", city_slug: "kingston" } }) },
    ], kingston);
    expect(ranked.map((item) => item.id)).toEqual(["drink", "dsp"]);
  });

  it("selects Kingston locals plus anywhere offers for a Kingston visitor", () => {
    const selected = selectOffersForPlace(
      [
        { id: "kgn", offer: { fulfillment_type: "qr", metadata: { city_slug: "kingston" } } },
        { id: "mobay", offer: { fulfillment_type: "qr", metadata: { city: "Montego Bay", city_slug: "montego-bay" } } },
        { id: "shop", offer: { fulfillment_type: "shipping", metadata: { availability: "anywhere", surface: "commerce" } } },
      ],
      (item) => resolveOfferReach(item.offer),
      kingston,
    );
    expect(selected.map((item) => item.id)).toEqual(["kgn", "shop"]);
  });
});
