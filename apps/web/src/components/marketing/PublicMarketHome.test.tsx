import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { translations } from "@/i18n/translations";
import type { CanonicalMoment } from "@/services/moment-feed";
import PublicMarketHome from "./PublicMarketHome";

const inventory = vi.hoisted(() => ({ moments: [] as CanonicalMoment[], scenes: [] as { id: string; slug: string; title: string; description: string }[], error: false }));

vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [], isFetching: false, isError: false }) }));
vi.mock("@/hooks/useOffers", () => ({ usePublicOffers: () => ({ data: [], isLoading: false, isError: false }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/contexts/MarketContext", () => ({ useMarket: () => ({ city: { id: "kingston", name: "Kingston & St. Andrew" }, country: { slug: "jamaica" } }) }));
vi.mock("@/hooks/useCanonicalMomentFeed", () => ({ useCanonicalMomentFeed: () => ({ data: { moments: inventory.moments }, isLoading: false, isError: inventory.error, refetch: vi.fn() }) }));
vi.mock("@/hooks/useDiscoveries", () => ({ useDiscoveries: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }) }));
vi.mock("@/hooks/useScenes", () => ({ useScenes: () => ({ data: inventory.scenes, isLoading: false }) }));
vi.mock("@/hooks/useDiscoveryDemand", () => ({ useDiscoveryDemand: () => ({ inbox: { questions: [] }, isLoading: false }) }));
vi.mock("@/components/discovery/FindOrAskEntry", () => ({ FindOrAskEntry: () => <input aria-label="Find or ask" /> }));
vi.mock("@/components/promorang/SignatureObjects", () => ({ PromoCardFace: () => null }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: "en", t: (key: keyof typeof translations.en, vars: Record<string, string> = {}) => translations.en[key].replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] || name) }) }));

beforeEach(() => { inventory.scenes = []; inventory.moments = []; inventory.error = false; });
beforeAll(() => vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }));
afterAll(() => vi.unstubAllGlobals());

describe("public entrance", () => {
  it("surfaces Kingston listings under the composite city label and excludes other cities", () => {
    inventory.moments = [
      { id: "local", title: "Kingston live music", location: "Dulce Lounge, Kingston", lifecycle: "upcoming", starts_at: "2099-10-15T20:00:00Z", effective_ends_at: "2099-10-16T04:00:00Z" },
      { id: "away", title: "Miami music", location: "Miami", lifecycle: "upcoming", starts_at: "2099-10-15T20:00:00Z", effective_ends_at: "2099-10-16T04:00:00Z" },
    ] as CanonicalMoment[];
    render(<MemoryRouter><PublicMarketHome /></MemoryRouter>);
    expect(document.querySelector(".home-opportunities")).toHaveTextContent("Kingston live music");
    expect(screen.queryByText("Miami music")).not.toBeInTheDocument();
  });
  it("provides a distinct next step for each stakeholder alongside the hero opportunities", () => {
    render(<MemoryRouter><PublicMarketHome /></MemoryRouter>);
    for (const href of ["/scenes", "/for-merchants", "/for-creators", "/for-brands", "/hosting", "/for-communities", "/for-agencies"]) {
      expect(document.querySelector(`.home-introduction a[href="${href}"]`)).toBeInTheDocument();
    }
    const paths = screen.getByRole("heading", { name: "What brings you here?" });
    const request = screen.getByRole("heading", { name: "Make your next plan worth it." });
    expect(request.compareDocumentPosition(paths) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it("does not present a failed request as an empty market", () => {
    inventory.error = true;
    render(<MemoryRouter><PublicMarketHome /></MemoryRouter>);
    expect(screen.getByText("We couldn’t load listings for this area.")).toBeInTheDocument();
    expect(screen.queryByText("Find your next thing in Kingston & St. Andrew.")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Try again" }).length).toBeGreaterThan(0);
  });
  it("keeps the sparse inventory state when only shared-interest groups exist", () => {
    inventory.scenes = [{ id: "group-1", slug: "food-lovers", title: "Food lovers", description: "Local food interests" }];
    render(<MemoryRouter><PublicMarketHome /></MemoryRouter>);
    const sparse = screen.getByText("Find your next thing in Kingston & St. Andrew.");
    const group = screen.getByRole("heading", { name: "Food lovers" });
    expect(sparse.compareDocumentPosition(group) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("link", { name: /Food lovers/ })).toHaveAttribute("href", "/scenes/food-lovers");
  });
  it("offers discovery and a truthful sparse state before card education", () => {
    render(<MemoryRouter><PublicMarketHome /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("Go out. Discover more. Make it rewarding.");
    expect(screen.getByText("Find your next thing in Kingston & St. Andrew.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /start.*scene/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Make your next plan worth it." })).toBeInTheDocument();
    const mobile = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(mobile.querySelector('a[href="/live"]')).toHaveTextContent("Events");
    expect(mobile.querySelector('a[href="/discover?tab=wants"]')).toHaveTextContent("Ask");
    expect(screen.getByRole("link", { name: "Create my account" })).toHaveAttribute("href", "/auth?mode=signup&role=participant&next=/card");
  });
});
