import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { translations } from "@/i18n/translations";
import { HomeOpportunities } from "./HomeOpportunities";
import type { Offer } from "@/hooks/useOffers";
const state = vi.hoisted(() => ({ offers: [] as Offer[], error: false }));
vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [], isFetching: false, isError: false }) }));
vi.mock("@/hooks/useOffers", () => ({ usePublicOffers: () => ({ data: state.offers, isLoading: false, isError: state.error }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: "en", t: (key: keyof typeof translations.en) => translations.en[key] }) }));
beforeEach(() => { state.offers = []; state.error = false; });
afterEach(cleanup);
const show = () => render(<MemoryRouter><HomeOpportunities market="Kingston" moments={[]} momentsLoading={false} momentsError={false} retryMoments={vi.fn()} /></MemoryRouter>);
describe("homepage opportunities", () => {
  it("offers demand entry when inventory is empty", () => { show(); expect(screen.getByRole("heading", { name: "Make your next plan worth it." })).toBeInTheDocument(); });
  it("preserves the selected offer through activation and permits preview without login", () => {
    state.offers = [{ id: "dinner", title: "Dinner offer", status: "active", starts_at: "2020-01-01", quantity_reserved: 0, quantity_redeemed: 0, reward_type: "coupon", fulfillment_type: "code", offer_distributions: [{ channel: "direct", trigger_event: "claim", is_active: true }] }];
    show();
    expect(screen.getByRole("link", { name: /Explore this opportunity/ })).toHaveAttribute("href", "/offers/dinner");
    expect(screen.getByRole("link", { name: /Join to take part/ })).toHaveAttribute("href", "/auth?mode=signup&role=participant&next=%2Foffers%2Fdinner");
    fireEvent.click(screen.getByRole("button", { name: "Your next offer" }));
    expect(screen.getByRole("heading", { name: "Make your next plan worth it." })).toBeInTheDocument();
  });
  it("reports unavailable data while retaining the demand option", () => { state.error = true; show(); expect(screen.getByRole("status")).toHaveTextContent("couldn’t load"); expect(screen.getByRole("button", { name: "Eat out" })).toBeInTheDocument(); });
});
