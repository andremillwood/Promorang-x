import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { I18nProvider, translate } from "./I18nContext";
import { translations, type Locale } from "./translations";
import { saveLocalePreference } from "./geo-locale";
import { PublicMomentDetail } from "@/components/moments/PublicMomentDetail";
import { commerceReceiptType, commerceStatus } from "./commerce-status";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { formatCompactNumber, formatPercent } from "@/components/analytics/utils";

const feed = vi.hoisted(() => ({ data: { moments: [] as any[] }, isLoading: false, isError: false }));
vi.mock("@/hooks/useCanonicalMomentFeed", () => ({ useCanonicalMomentFeed: () => feed }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/components/marketing/MarketingPhysics", () => ({ CurrentArc: () => null }));

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
  feed.isError = false;
  feed.data.moments = [{ id: "test", slug: "test", title: "Artist original title", description: "Host original description", lifecycle: "live", participant_count: 2, starts_at: "2026-10-09T18:00:00Z" }];
});
afterEach(() => { cleanup(); window.history.replaceState({}, "", "/"); });

function renderMoment(locale: Locale) {
  saveLocalePreference(locale);
  return render(<I18nProvider><MemoryRouter initialEntries={["/moments/test"]}><Routes><Route path="/moments/:id" element={<PublicMomentDetail />} /></Routes></MemoryRouter></I18nProvider>);
}

describe.each(["en", "es-419", "pt-BR"] as const)("web presentation in %s", (locale) => {
  const copy = translations[locale];
  it("translates public Moment actions and statuses while preserving host-authored content", () => {
    renderMoment(locale);
    expect(screen.getByRole("heading", { name: "Artist original title" })).toBeInTheDocument();
    expect(screen.getAllByText("Host original description").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: copy["web.shareMoment"] })).toBeInTheDocument();
    expect(screen.getByText(copy["web.liveNow"])).toBeInTheDocument();
    expect(screen.getByText(copy["web.participantCount"].replace("{{count}}", "2"))).toBeInTheDocument();
    expect(screen.getByText(copy["web.keepPlace"])).toBeInTheDocument();
  });
  it("translates the unavailable state", () => {
    feed.isError = true;
    renderMoment(locale);
    expect(screen.getByRole("heading", { name: copy["web.momentUnavailable"] })).toBeInTheDocument();
    expect(screen.getByText(copy["web.momentLoadError"])).toBeInTheDocument();
  });
  it("formats money, compact counts and percentages using the UI language", () => {
    saveLocalePreference(locale);
    expect(formatCurrency(1234.5, "USD")).toBe(new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1234.5));
    expect(formatNumber(1200)).toBe(new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(1200));
    expect(formatCompactNumber(1200)).toBe(formatNumber(1200));
    expect(formatPercent(12.5)).toBe(new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(0.125));
  });
  it("translates receipt protocol values without changing the values themselves", () => {
    const t = (key: keyof typeof translations.en) => translate(key, undefined, locale);
    expect(commerceReceiptType(t, "purchase")).toBe(copy["web.receiptType.purchase"]);
    expect(commerceStatus(t, "issued")).toBe(copy["web.status.issued"]);
    expect(commerceStatus(t, "requires_payment")).toBe(copy["web.status.requires_payment"]);
    expect(commerceStatus(t, "not-a-status")).toBe(copy["cart.status.unknown"]);
  });
});

it("does not round small numeric values while applying locale separators", () => {
  saveLocalePreference("pt-BR");
  expect(formatNumber(0.12345)).toBe("0,12345");
});
