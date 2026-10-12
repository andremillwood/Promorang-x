import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { translations } from "@/i18n/translations";
import { HomeOpportunities } from "./HomeOpportunities";
import type { CanonicalMoment } from "@/services/moment-feed";
import type { HomeMission } from "./home-opportunities";
import type { Offer } from "@/hooks/useOffers";
const state = vi.hoisted(() => ({ offers: [] as Offer[], moments: [] as CanonicalMoment[], missions: [] as HomeMission[], error: false }));
vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: state.missions, isFetching: false, isError: false }) }));
vi.mock("@/hooks/useOffers", () => ({ usePublicOffers: () => ({ data: state.offers, isLoading: false, isError: state.error }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: "en", t: (key: keyof typeof translations.en) => translations.en[key] }) }));
beforeEach(() => { state.offers = []; state.moments = []; state.missions = []; state.error = false; });
afterEach(cleanup);
const show = () => render(<MemoryRouter><HomeOpportunities market="Kingston" moments={state.moments} momentsLoading={false} momentsError={false} retryMoments={vi.fn()} /></MemoryRouter>);
describe("homepage opportunities", () => {
  it("offers demand entry when inventory is empty", () => { show(); expect(screen.getByRole("heading", { name: "Make your next plan worth it." })).toBeInTheDocument(); });
  it("offers one public detail action and leaves participation to the detail route", () => {
    state.offers = [{ id: "dinner", title: "Dinner offer", status: "active", starts_at: "2020-01-01", quantity_reserved: 0, quantity_redeemed: 0, reward_type: "coupon", fulfillment_type: "code", offer_distributions: [{ channel: "direct", trigger_event: "claim", is_active: true }] }];
    show();
    expect(screen.getByRole("link", { name: /View offer/ })).toHaveAttribute("href", "/offers/dinner");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Your next offer" }));
    expect(screen.getByRole("heading", { name: "Make your next plan worth it." })).toBeInTheDocument();
  });
  it("reports unavailable data while retaining the demand option", () => { state.error = true; show(); expect(screen.getByRole("status")).toHaveTextContent("couldn’t load"); expect(screen.getByRole("button", { name: "Eat out" })).toBeInTheDocument(); });
});

const event = (id: string) => ({ id, slug: `event-${id}`, title: `Event ${id}`, category: "Music", description: "Full event description for detail browsing.", venue_name: "Kingston venue", starts_at: "2099-10-15T20:00:00Z", effective_ends_at: "2099-10-16T04:00:00Z", lifecycle: "upcoming", image_url: "/event.png" } as CanonicalMoment);
beforeAll(() => {
  vi.stubGlobal("PointerEvent", class extends MouseEvent {
    pointerId = 1;
    pointerType = "touch";
    isPrimary = true;
  });
  Element.prototype.setPointerCapture = vi.fn();
});
afterAll(() => { vi.unstubAllGlobals(); });
function swipe(target: Element, x = 100, y = 0) {
  fireEvent.pointerDown(target, { clientX: 200, clientY: 100 });
  fireEvent.pointerUp(target, { clientX: 200 - x, clientY: 100 + y });
}
describe("compact discovery navigation", () => {
  beforeEach(() => { state.moments = [event("one"), event("two")]; });
  it("shows actual identity and one event detail action", () => {
    show();
    expect(screen.getByText("Events · Music")).toBeInTheDocument();
    expect(screen.getByText("Kingston venue")).toBeInTheDocument();
    expect(document.querySelector("time")).toHaveAttribute("datetime", "2099-10-15T20:00:00.000Z");
    expect(screen.getByRole("link", { name: "View event" })).toHaveAttribute("href", "/moments/event-one");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByText(/Your account keeps/)).not.toBeInTheDocument();
  });
  it("wraps with buttons and keyboard without changing the selected category", () => {
    show();
    fireEvent.click(screen.getByRole("button", { name: "Next opportunity" }));
    expect(screen.getByRole("heading", { name: "Event two" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("group", { name: "Events" }), { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: "Event one" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("link", { name: "View event" }), { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: "Event one" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous opportunity" }));
    expect(screen.getByRole("heading", { name: "Event two" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Events" })).toHaveAttribute("aria-pressed", "true");
  });
  it("supports horizontal swipes but ignores vertical scrolling, short moves, canceled gestures and links", () => {
    show();
    const carousel = screen.getByRole("group", { name: "Events" });
    swipe(carousel);
    expect(screen.getByRole("heading", { name: "Event two" })).toBeInTheDocument();
    swipe(carousel, 20);
    swipe(carousel, 60, 100);
    swipe(screen.getByRole("link", { name: "View event" }));
    fireEvent.pointerDown(carousel, { clientX: 200, clientY: 100 });
    fireEvent.pointerCancel(carousel);
    fireEvent.pointerUp(carousel, { clientX: 100, clientY: 100 });
    expect(screen.getByRole("heading", { name: "Event two" })).toBeInTheDocument();
    swipe(carousel, -100);
    expect(screen.getByRole("heading", { name: "Event one" })).toBeInTheDocument();
  });
  it("preserves mission destinations and category selection while browsing", () => {
    state.missions = ["one", "two"].map(id => ({ id, moment: { id }, content: { title: `Mission ${id}`, description: "Share the experience" } }));
    show();
    fireEvent.click(screen.getByRole("button", { name: "Missions" }));
    expect(screen.getByRole("link", { name: "Explore mission" })).toHaveAttribute("href", "/missions/one");
    fireEvent.click(screen.getByRole("button", { name: "Next opportunity" }));
    expect(screen.getByRole("link", { name: "Explore mission" })).toHaveAttribute("href", "/missions/two");
    expect(screen.getByRole("button", { name: "Missions" })).toHaveAttribute("aria-pressed", "true");
  });
  it("has a sensible fallback for failed artwork", () => {
    show();
    fireEvent.error(document.querySelector(".home-discovery-media img")!);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next opportunity" }));
    expect(document.querySelector(".home-discovery-media img")).toBeInTheDocument();
  });
});
