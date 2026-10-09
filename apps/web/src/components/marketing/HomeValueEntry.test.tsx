import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { translations } from "@/i18n/translations";
import { HomeValueEntry } from "./HomeValueEntry";
import type { Offer } from "@/hooks/useOffers";
const state = vi.hoisted(() => ({ data: [] as Offer[], isError: false, refetch: vi.fn() }));
vi.mock("@/hooks/useOffers", () => ({ usePublicOffers: () => ({ ...state, isLoading: false }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: "en", t: (key: keyof typeof translations.en, vars: Record<string, string> = {}) => translations.en[key].replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] || name) }) }));
const offer = (overrides: Partial<Offer> = {}): Offer => ({ id: "meal", title: "Dinner for two", description: "Dinner at a participating restaurant", reward_type: "coupon", fulfillment_type: "code", status: "active", offer_distributions: [{ channel: "direct", trigger_event: "claim", is_active: true }], starts_at: "2020-01-01", quantity_reserved: 2, quantity_redeemed: 3, quantity_total: 10, ...overrides });
beforeEach(() => { state.data = []; state.isError = false; });
afterEach(cleanup);
const show = () => render(<MemoryRouter><HomeValueEntry market="Kingston" /></MemoryRouter>);
describe("home value and demand entry", () => {
  it("excludes expired, future and exhausted offers", () => {
    state.data = [offer({ ends_at: "2020-01-02" }), offer({ starts_at: "2999-01-01" }), offer({ quantity_total: 5 }), offer({ offer_distributions: [{ channel: "direct", trigger_event: "claim", is_active: false }] })];
    show();
    expect(screen.queryByText("Dinner for two")).not.toBeInTheDocument();
    expect(screen.getByText("Help shape the next offer")).toBeInTheDocument();
  });
  it("links a current offer to its terms with recorded availability", () => {
    state.data = [offer()]; show();
    expect(screen.getByRole("link", { name: /See where to use it/ })).toHaveAttribute("href", "/offers/meal");
    expect(screen.getByText("5 remaining in this offer")).toBeInTheDocument();
  });
  it("preserves the edited request, city and locale into confirmation without posting", () => {
    show(); fireEvent.click(screen.getByRole("button", { name: "Eat out" }));
    fireEvent.click(screen.getByRole("button", { name: "A dining offer for two" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Dinner for two under J$5,000" } });
    const href = screen.getByRole("link", { name: "Review my request" }).getAttribute("href")!;
    const params = new URL(href, "https://example.com").searchParams;
    expect(params.get("q")).toBe("Dinner for two under J$5,000");
    expect(params.get("city")).toBe("Kingston");
    expect(params.get("lang")).toBe("en");
    expect(params.get("recovery")).toBe("request_something");
  });
  it("does not describe a failed offer request as empty inventory", () => {
    state.isError = true; show();
    expect(screen.getByText("We couldn’t check current offers.")).toBeInTheDocument();
    expect(screen.queryByText("Help shape the next offer")).not.toBeInTheDocument();
  });
});
