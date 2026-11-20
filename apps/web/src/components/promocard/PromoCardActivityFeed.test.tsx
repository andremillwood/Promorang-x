import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nContext";
import type { PromoCardActivityEntry } from "@/hooks/usePromoCard";
import { PromoCardActivityFeed } from "./PromoCardActivityFeed";

const ledger = vi.hoisted(() => ({
  current: {
    data: [] as PromoCardActivityEntry[],
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  },
}));

vi.mock("@/hooks/usePromoCard", () => ({
  usePromoCardLedger: () => ledger.current,
}));

const spend: PromoCardActivityEntry = {
  id: "entry-1",
  entryType: "spend",
  amount: -10,
  currency: "USD",
  balanceAfter: 35,
  businessNight: "2026-11-20",
  cycleId: "2026-11",
  momentId: "11111111-1111-4111-8111-111111111111",
  orderId: "22222222-2222-4222-8222-222222222222",
  createdAt: "2026-11-21T06:30:00.000Z",
  isTest: false,
  title: "Coffee on us",
};

function show(userId?: string) {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <PromoCardActivityFeed userId={userId} limit={1} />
      </MemoryRouter>
    </I18nProvider>,
  );
}

describe("PromoCard activity", () => {
  it("says when nothing has changed", () => {
    ledger.current = { data: [], isLoading: false, isError: false, isFetching: false, refetch: vi.fn() };
    show("member-1");
    expect(screen.getByRole("region", { name: "PromoCard activity" })).toHaveTextContent("Nothing has changed your PromoCard yet");
    expect(screen.queryByText(/ledger/i)).not.toBeInTheDocument();
  });

  it("shows a checkout spend as a receipt for that night", () => {
    ledger.current = { data: [spend, { ...spend, id: "entry-2", title: "Second" }], isLoading: false, isError: false, isFetching: false, refetch: vi.fn() };
    show("member-1");
    expect(screen.getByRole("heading", { name: "Coffee on us" })).toBeInTheDocument();
    expect(screen.getByText("Saved at checkout")).toBeInTheDocument();
    expect(screen.getByText("Nov 20, 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open the night" })).toHaveAttribute("href", "/moments/11111111-1111-4111-8111-111111111111");
    expect(screen.queryByRole("heading", { name: "Second" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show the rest" })).toBeInTheDocument();
    expect(screen.queryByText(/ledger/i)).not.toBeInTheDocument();
  });

  it("offers another try when the activity cannot load", () => {
    const refetch = vi.fn();
    ledger.current = { data: [], isLoading: false, isError: true, isFetching: false, refetch };
    show("member-1");
    screen.getByRole("button", { name: "Try again" }).click();
    expect(refetch).toHaveBeenCalledOnce();
  });
});
