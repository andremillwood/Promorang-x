import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PromoCardGateway } from "./PromoCardGateway";

const { nearbyQuery, cardQuery, auth } = vi.hoisted(() => ({
  nearbyQuery: {
    data: undefined as Record<string, unknown>[] | undefined,
    isLoading: false,
    isError: false,
  },
  cardQuery: {
    data: undefined as Record<string, unknown> | undefined,
    isLoading: false,
    isError: false,
  },
  auth: { user: null as { id: string } | null },
}));

vi.mock("@/hooks/usePeopleExperience", () => ({
  useNearbyBenefits: () => nearbyQuery,
  useMyPromoCard: () => cardQuery,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => auth,
}));
vi.mock("@/hooks/useVisitorLocation", () => ({
  useVisitorLocation: () => "Kingston",
}));

const liveBenefit = {
  id: "offer-sea-deck",
  offerId: "offer-sea-deck",
  issuanceId: null,
  dropId: null,
  title: "Sea Deck weekend",
  detail: "Spend $3,000 or more",
  issuer: { id: "m1", type: "merchant", name: "Sea Deck" },
  eligibility: { who: "everyone", perUserLimit: 1, startsAt: null, endsAt: null, remaining: 23 },
  availableQuantity: 23,
  budget: null,
  expiresAt: null,
  fulfillmentState: "available",
  fulfillmentType: "merchant_validation",
  redemption: { recorded: false, code: null, redeemedAt: null, redeemedBy: null },
  sharedBy: null,
  href: "/drop/sea-deck",
  rewardType: "coupon",
  valueAmount: 500,
  valueCurrency: "JMD",
  locationLabel: "Barbican",
};

let root: Root;
let container: HTMLDivElement;

async function renderGateway() {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <PromoCardGateway />
      </MemoryRouter>,
    );
  });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  auth.user = null;
  window.localStorage.clear();
  Object.assign(nearbyQuery, { data: undefined, isLoading: false, isError: false });
  Object.assign(cardQuery, { data: undefined, isLoading: false, isError: false });
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

describe("PromoCardGateway", () => {
  it("leads with customer value and a real featured benefit", async () => {
    nearbyQuery.data = [liveBenefit];
    await renderGateway();
    expect(container).toHaveTextContent("There’s something");
    expect(container).toHaveTextContent("for you.");
    expect(container).toHaveTextContent("$500 OFF");
    expect(container).toHaveTextContent("Sea Deck");
    expect(container).toHaveTextContent("Barbican");
    expect(container).toHaveTextContent("23 remaining");
    expect(container).toHaveTextContent("Unlock this");
    expect(container).toHaveTextContent("Get my AftrHrs pass");
    expect(container).toHaveTextContent("What should your card open?");
    expect(container).toHaveTextContent("Kingston After Dark");
    expect(container).not.toHaveTextContent("Claim $500 Off");
    expect(
      Array.from(container.querySelectorAll("a")).some((link) => link.getAttribute("href") === "/aftrhrs"),
    ).toBe(true);
    expect(
      Array.from(container.querySelectorAll("a")).some((link) =>
        (link.getAttribute("href") || "").includes("next=%2Fcard%3Faim%3Dbarbican"),
      ),
    ).toBe(true);
    expect(container).toHaveTextContent("See What’s Available in Kingston");
    expect(container).not.toHaveTextContent("Use this");
    expect(container).not.toHaveTextContent("Verified use");
    expect(container).not.toHaveTextContent("Ambassador audience");
    expect(container).not.toHaveTextContent("A merchant supplies a benefit");
  });

  it("keeps mechanics behind How PromoCard works", async () => {
    nearbyQuery.data = [liveBenefit];
    await renderGateway();
    expect(container).toHaveTextContent("How PromoCard works");
    expect(container.querySelector("details")).toHaveTextContent("The business confirms the redemption");
    expect(container.querySelector("h1")).not.toHaveTextContent("recorded redemption");
  });

  it("shows an honest empty state instead of fake money", async () => {
    nearbyQuery.data = [];
    await renderGateway();
    expect(container).toHaveTextContent("NEW BENEFITS ARE LANDING");
    expect(container).toHaveTextContent("Get My PromoCard");
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
    expect(container).not.toHaveTextContent("$500");
    expect(container).not.toHaveTextContent("Use this");
  });

  it("uses View My PromoCard when signed in without a claimed benefit", async () => {
    auth.user = { id: "member-1" };
    nearbyQuery.data = [liveBenefit];
    cardQuery.data = { nearby: [liveBenefit], useThis: null };
    await renderGateway();
    expect(container).toHaveTextContent("View My PromoCard");
    expect(container).not.toHaveTextContent("Use this");
    expect(
      Array.from(container.querySelectorAll("a")).some((link) => link.getAttribute("href") === "/card"),
    ).toBe(true);
  });

  it("uses a stronger card CTA for a claimed usable benefit", async () => {
    auth.user = { id: "member-1" };
    const claimed = {
      ...liveBenefit,
      id: "iss-1",
      fulfillmentState: "claimed",
      redemption: { recorded: false, code: "PR-500OFF", redeemedAt: null, redeemedBy: null },
      href: "/card",
    };
    nearbyQuery.data = [liveBenefit];
    cardQuery.data = { useThis: claimed, nearby: [liveBenefit] };
    await renderGateway();
    expect(container).toHaveTextContent("Redeem Benefit");
    expect(container).toHaveTextContent("$500 OFF");
    expect(container).not.toHaveTextContent("Use this");
  });

  it("lets a guest aim the card before signup", async () => {
    nearbyQuery.data = [];
    await renderGateway();
    const food = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Food");
    expect(food).toBeTruthy();
    await act(async () => {
      food!.click();
    });
    expect(food).toHaveAttribute("aria-pressed", "true");
    expect(container).toHaveTextContent("SET FOR FOOD");
    expect(container).toHaveTextContent("Unlock this");
    expect(container).not.toHaveTextContent("Get My PromoCard");
    expect(
      Array.from(container.querySelectorAll("a")).some((link) =>
        (link.getAttribute("href") || "").includes("next=%2Fcard%3Faim%3Dfood"),
      ),
    ).toBe(true);
  });
});
