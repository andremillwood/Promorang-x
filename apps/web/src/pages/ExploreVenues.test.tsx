import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCountryMarket } from "@promorang/shared";
import { resolveCityHub } from "@/lib/city-hubs";
import { venueDirectoryMarket } from "@/lib/venue-directory-market";

const state = vi.hoisted(() => ({ market: {} as any, fetch: vi.fn() }));
vi.mock("@/contexts/MarketContext", () => ({ useMarket: () => state.market }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/i18n/I18nContext", async () => {
  const { translations } = await import("@/i18n/translations");
  return { useI18n: () => ({ locale: "en", formatNumber: String, t: (key: keyof typeof translations.en, params?: Record<string, string>) => Object.entries(params || {}).reduce((text, [name, value]) => text.replace(`{{${name}}}`, value), translations.en[key]) }) };
});
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return { supabase: createClient("https://project.supabase.co", "public-anon-test-key", { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: state.fetch } }) };
});

import ExploreVenues from "./ExploreVenues";

function selectMarket(id: string) {
  const city = resolveCityHub(id)!;
  state.market = { country: getCountryMarket(city.countryCode), city };
}

function lastRequest() {
  const [input, options] = state.fetch.mock.calls.at(-1)!;
  return { url: new URL(String(input)), headers: new Headers(options.headers) };
}

function renderDirectory() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>;
  return render(<ExploreVenues />, { wrapper });
}

beforeEach(() => {
  vi.clearAllMocks();
  selectMarket("us-michigan");
  state.fetch.mockImplementation(async (input) => {
    const url = new URL(String(input));
    const jamaica = url.searchParams.get("country_slug")?.includes("jamaica");
    return new Response(JSON.stringify([{ id: "venue-1", name: jamaica ? "Jamaican Venue" : "Michigan Hall", city: jamaica ? "Montego Bay" : "Grand Rapids", country: jamaica ? "Jamaica" : "United States" }]), { status: 200, headers: { "content-type": "application/json", "content-range": `0-0/${jamaica ? 49 : 2}` } });
  });
});

describe("venue directory market boundaries", () => {
  it("requests a counted Michigan page from the server without Jamaican parish controls", async () => {
    renderDirectory();
    expect(await screen.findByText("Michigan Hall")).toBeInTheDocument();
    expect(screen.getByText("2 venues")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Jamaican Venue")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search venues by name, type, or city...")).toBeInTheDocument();
    const { url, headers } = lastRequest();
    expect(url.pathname).toBe("/rest/v1/view_public_venue_directory");
    expect(url.searchParams.get("country_slug")).toBe("in.(united-states,us)");
    expect(url.searchParams.get("or")).toBe('(market_key.eq.us-michigan,state.in.("Michigan","US-MI","MI"))');
    expect(url.searchParams.get("offset")).toBe("0");
    expect(url.searchParams.get("limit")).toBe("48");
    expect(headers.get("prefer")).toBe("count=exact");
  });

  it("preserves all Jamaica's parish filters and resets parish and page when switching markets", async () => {
    selectMarket("all-jamaica");
    const view = renderDirectory();
    expect(await screen.findByText("Jamaican Venue")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(15);
    fireEvent.change(screen.getByRole("combobox", { name: "All 14 parishes" }), { target: { value: "Saint James" } });
    await waitFor(() => expect(lastRequest().url.searchParams.get("parish")).toBe("eq.Saint James"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Next" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(lastRequest().url.searchParams.get("offset")).toBe("48"));

    selectMarket("us-michigan");
    view.rerender(<ExploreVenues />);
    expect(await screen.findByText("Michigan Hall")).toBeInTheDocument();
    expect(screen.getByText("2 venues")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Jamaican Venue")).not.toBeInTheDocument();
    expect(lastRequest().url.searchParams.get("parish")).toBeNull();
    expect(lastRequest().url.searchParams.get("offset")).toBe("0");
  });

  it("keeps search within the selected market in the same counted request", async () => {
    renderDirectory();
    await screen.findByText("Michigan Hall");
    fireEvent.change(screen.getByPlaceholderText("Search venues by name, type, or city..."), { target: { value: "music" } });
    await waitFor(() => expect(lastRequest().url.searchParams.getAll("or")).toHaveLength(2));
    expect(lastRequest().url.searchParams.getAll("or")[0]).toContain("market_key.eq.us-michigan");
    expect(lastRequest().url.searchParams.getAll("or")[1]).toContain("name.ilike.%music%");
    expect(lastRequest().url.searchParams.get("country_slug")).toBe("in.(united-states,us)");
  });

  it("shows a request error without presenting a false zero count", async () => {
    state.fetch.mockResolvedValue(new Response(JSON.stringify({ message: "unavailable" }), { status: 500, headers: { "content-type": "application/json" } }));
    renderDirectory();
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not load venues for this area.");
    expect(screen.queryByText("0 venues")).not.toBeInTheDocument();
  });

  it.each(["us-florida", "us-georgia", "us-new-york", "us-michigan"])("uses the full state rather than one city for %s", (id) => {
    const city = resolveCityHub(id)!;
    const market = venueDirectoryMarket(getCountryMarket("US"), city);
    expect(market.countrySlugs).toContain("united-states");
    expect(market.placeFilter).toContain(`market_key.eq.${id}`);
    expect(market.placeFilter).toContain(`"${city.region}"`);
    expect(market.placeFilter).not.toContain("city_slug");
    expect(market.parishes).toEqual([]);
  });

  it("distinguishes New York City from New York state and limits London to the UK", () => {
    const nyc = venueDirectoryMarket(getCountryMarket("US"), resolveCityHub("new-york")!);
    expect(nyc.placeFilter).toContain('"new-york-city"');
    expect(nyc.placeFilter).not.toContain("state.in");
    const london = venueDirectoryMarket(getCountryMarket("GB"), resolveCityHub("london")!);
    expect(london.countrySlugs).toContain("united-kingdom");
    expect(london.placeFilter).toContain('city_slug.in.("london")');
    expect(london.placeFilter).toContain("market_key.eq.gb-london");
  });

  it("limits Kingston's parish options to its area while keeping the country boundary", () => {
    const market = venueDirectoryMarket(getCountryMarket("JM"), resolveCityHub("kingston")!);
    expect(market.countrySlugs).toContain("jamaica");
    expect(market.parishes).toEqual(["Kingston", "Saint Andrew"]);
    expect(market.placeFilter).toContain('parish.in.("Kingston","Saint Andrew")');
  });
});
