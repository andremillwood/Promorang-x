import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeOpportunities } from "./HomeOpportunities";
import type { CanonicalMoment } from "@/services/moment-feed";
import { translations } from "@/i18n/translations";

vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [], isFetching: false, isError: false }) }));
vi.mock("@/hooks/useOffers", () => ({ usePublicOffers: () => ({ data: [], isLoading: false, isError: false }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: "en", t: (key: keyof typeof translations.en) => translations.en[key] }) }));
const moments = ["First event", "Second event"].map((title, i) => ({ id: `event-${i}`, title, lifecycle: "upcoming", starts_at: "2099-10-30T20:00:00Z", effective_ends_at: "2099-10-31T02:00:00Z" })) as CanonicalMoment[];
const show = () => render(<MemoryRouter><HomeOpportunities market="Kingston" moments={moments} momentsLoading={false} momentsError={false} retryMoments={vi.fn()} /></MemoryRouter>);
const advance = () => act(() => vi.advanceTimersByTime(8100));
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
describe("hero inventory rotation", () => {
  it("rotates existing inventory and supports a persistent pause", () => {
    show();
    expect(screen.getByRole("heading", { name: "First event" })).toBeInTheDocument();
    advance();
    expect(screen.getByRole("heading", { name: "Second event" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pause automatic browsing" }));
    advance();
    expect(screen.getByRole("heading", { name: "Second event" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume automatic browsing" }));
    advance();
    expect(screen.getByRole("heading", { name: "First event" })).toBeInTheDocument();
  });
  it("holds the current listing during hover and keyboard focus", () => {
    const { container } = show();
    const root = container.querySelector(".home-opportunities")!;
    fireEvent.mouseEnter(root); advance();
    expect(screen.getByRole("heading", { name: "First event" })).toBeInTheDocument();
    fireEvent.mouseLeave(root);
    fireEvent.focus(screen.getByRole("link", { name: "View event" })); advance();
    expect(screen.getByRole("heading", { name: "First event" })).toBeInTheDocument();
  });
  it("never replaces a selected request form", () => {
    show();
    fireEvent.click(screen.getByRole("button", { name: "Your next offer" }));
    advance(); advance();
    expect(screen.getByRole("heading", { name: "Make your next plan worth it." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Second event" })).not.toBeInTheDocument();
  });
  it("disables automatic rotation for reduced motion", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList);
    show(); advance();
    expect(screen.getByRole("heading", { name: "First event" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pause automatic browsing" })).not.toBeInTheDocument();
  });
});
