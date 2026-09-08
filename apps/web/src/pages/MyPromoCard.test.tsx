import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyPromoCard from "./MyPromoCard";

const { query } = vi.hoisted(() => ({
  query: {
    data: undefined as Record<string, unknown> | undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  },
}));
vi.mock("@/hooks/usePeopleExperience", () => ({
  useMyPromoCard: () => query,
  useExperienceHome: () => ({ data: undefined, isLoading: false, isError: false, isFetching: false, refetch: vi.fn() }),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-member" }, profile: {} }),
}));
vi.mock("@/components/SEO", () => ({ default: () => null }));
let root: Root;
let container: HTMLDivElement;
const button = (label: string) => {
  const result = Array.from(document.querySelectorAll("button")).find(
    (item) =>
      item.getAttribute("aria-label") === label || item.textContent === label,
  );
  if (!result) throw new Error(`Button not found: ${label}`);
  return result;
};
const click = async (label: string) => {
  await act(async () => {
    button(label).click();
  });
};
const renderCard = async () => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={["/app-preview/card"]}>
        <MyPromoCard />
      </MemoryRouter>,
    );
  });
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Object.assign(query, {
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
  });
  vi.clearAllMocks();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

describe("PromoCard journey", () => {
  it("does not present loading as an empty card or zero balance", async () => {
    query.isLoading = true;
    await renderCard();
    expect(document.querySelector('[role="status"]')).toHaveTextContent(
      "Getting your card ready",
    );
    expect(container).not.toHaveTextContent("0 pts");
    expect(container).not.toHaveTextContent("Find your first perk");
  });

  it("offers recovery when loading fails", async () => {
    query.isError = true;
    await renderCard();
    await click("Try again");
    expect(query.refetch).toHaveBeenCalledOnce();
    expect(container).not.toHaveTextContent("0 pts");
  });

  it("opens a claimed perk, copies its code and restores focus after Escape", async () => {
    query.data = {
      points: 120,
      keys: 2,
      perks: [
        {
          id: "one",
          title: "Coffee on us",
          detail: "Valid at the counter",
          fulfillmentState: "claimed",
          redemptionCode: "COFFEE-TEST",
        },
      ],
    };
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    await renderCard();
    expect(document.body).not.toHaveTextContent("COFFEE-TEST");
    await click("Show code for Coffee on us");
    expect(document.querySelector('[role="dialog"]')).toHaveTextContent(
      "COFFEE-TEST",
    );
    await click("Copy code");
    expect(button("Copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("COFFEE-TEST");
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    // Radix restores focus on the tick after the dialog unmounts.
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });
    expect(button("Show code for Coffee on us")).toHaveFocus();
  });

  it("keeps expired perks out of the redeemable list", async () => {
    query.data = {
      perks: [
        {
          id: "old",
          title: "Past offer",
          expiresAt: "2000-01-01",
          redemptionCode: "EXPIRED",
        },
      ],
    };
    await renderCard();
    expect(container).toHaveTextContent("Expired perks (1)");
    expect(
      document.querySelector('button[aria-label="Show code for Past offer"]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('a[href="/discover?tab=perks"]'),
    ).toBeInTheDocument();
  });

  it("keeps the code readable when clipboard access fails", async () => {
    query.data = {
      perks: [
        { id: "one", title: "Coffee on us", fulfillmentState: "claimed", redemptionCode: "COFFEE-TEST" },
      ],
    };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    await renderCard();
    await click("Show code for Coffee on us");
    await click("Copy code");
    expect(document.querySelector('[role="status"]')).toHaveTextContent(
      "Couldn’t copy",
    );
    expect(document.querySelector('[role="dialog"]')).toHaveTextContent(
      "COFFEE-TEST",
    );
  });

  it("preserves preview navigation and uses membership language", async () => {
    query.data = { points: 120, keys: 2 };
    await renderCard();
    expect(
      Array.from(container.querySelectorAll("a")).find(
        (link) => link.textContent === "Back to your home",
      ),
    ).toHaveAttribute("href", "/app-preview");
    expect(container).toHaveTextContent("This is your PromoCard");
    expect(container).not.toHaveTextContent("Available to spend");
    expect(container).not.toHaveTextContent("PR · 0842");
    expect(container).not.toHaveTextContent("$24");
  });
});
