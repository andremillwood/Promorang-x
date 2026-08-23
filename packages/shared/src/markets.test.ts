import { describe, expect, it } from "vitest";
import { formatMarketCurrency, getCityMarket, getCountryMarket, isMarketFeatureEnabled } from "./markets";

describe("market configuration", () => {
  it("resolves countries by code, slug, or name", () => {
    expect(getCountryMarket("GH").currency).toBe("GHS");
    expect(getCountryMarket("dominican-republic").locale).toBe("es-419");
    expect(getCountryMarket("Nigeria").timezone).toBe("Africa/Lagos");
  });

  it("keeps regulated economy features off in pilots", () => {
    expect(isMarketFeatureEnabled(getCountryMarket("GH"), "pieces")).toBe(false);
    expect(isMarketFeatureEnabled(getCountryMarket("JM"), "gemPurchases")).toBe(true);
  });

  it("resolves city timezone and formats local currency", () => {
    const ghana = getCountryMarket("GH");
    expect(getCityMarket(ghana, "accra")?.timezone).toBe("Africa/Accra");
    expect(formatMarketCurrency(25, ghana)).toContain("25");
  });

  it("includes the wider Caribbean directory", () => {
    expect(getCountryMarket("the-bahamas").currency).toBe("BSD");
    expect(getCountryMarket("guyana").cities[0]?.slug).toBe("georgetown");
    expect(getCountryMarket("saint-lucia").timezone).toBe("America/St_Lucia");
    expect(getCountryMarket("curacao").name).toBe("Curaçao");
    expect(getCountryMarket("puerto-rico").locale).toBe("es-419");
  });

  it("includes the full Latin American directory", () => {
    expect(getCountryMarket("panama").launchStage).toBe("pilot");
    expect(getCountryMarket("colombia").cities.map((city) => city.slug)).toEqual(["medellin", "bogota"]);
    expect(getCountryMarket("mexico").currency).toBe("MXN");
    expect(getCountryMarket("argentina").cities[0]?.slug).toBe("buenos-aires");
    expect(getCountryMarket("peru").timezone).toBe("America/Lima");
    expect(getCountryMarket("venezuela").locale).toBe("es-419");
  });
});
