import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { withI18n } from "@/test/withI18n";
import { PublicMobileNavigation } from "./PublicMobileNavigation";
import { MobileNavigationOwner } from "./MobileNavigationOwner";
import { MobileBottomNav } from "@/components/culture/CultureCards";

afterEach(cleanup);

function History() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate(-1)}>Back</button><button onClick={() => navigate(1)}>Forward</button></>;
}

it.each([
  ["/", "Home"], ["/shop/item-1", "Shop"], ["/storefront/local-shop", "Shop"],
  ["/discover?tab=perks", "Offers"], ["/offers/offer-1", "Offers"],
  ["/discover?tab=wants", "Discover"], ["/moments/event-1", "Discover"],
  ["/live", "Discover"], ["/business/start?resume=1", "For business"], ["/pricing", "For business"],
])("marks exactly one destination for direct link %s", (path, label) => {
  render(withI18n(<MemoryRouter initialEntries={[path]}><PublicMobileNavigation /></MemoryRouter>));
  const current = screen.getAllByRole("link").filter(link => link.getAttribute("aria-current") === "page");
  expect(current).toHaveLength(1);
  expect(current[0]).toHaveTextContent(label);
});

it("updates query-based selection on click and Back/Forward", () => {
  render(withI18n(<MemoryRouter initialEntries={["/discover"]}><PublicMobileNavigation /><History /></MemoryRouter>));
  const offers = screen.getByRole("link", { name: "Offers" });
  fireEvent.click(offers);
  expect(offers).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Discover" })).not.toHaveAttribute("aria-current");
  fireEvent.click(screen.getByText("Back"));
  expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("aria-current", "page");
  fireEvent.click(screen.getByText("Forward"));
  expect(offers).toHaveAttribute("aria-current", "page");
});

it("suppresses page-owned legacy navigation when a shell already provides it", () => {
  render(withI18n(<MemoryRouter><MobileNavigationOwner.Provider value={true}><PublicMobileNavigation /><MobileBottomNav /></MobileNavigationOwner.Provider></MemoryRouter>));
  expect(screen.getAllByRole("navigation")).toHaveLength(1);
  expect(within(screen.getByRole("navigation")).getAllByRole("link")).toHaveLength(5);
});

it.each(["es-419", "pt-BR"] as const)("uses existing translated navigation labels in %s", locale => {
  render(withI18n(<MemoryRouter><PublicMobileNavigation /></MemoryRouter>, locale));
  expect(screen.getAllByRole("link")).toHaveLength(5);
  expect(screen.queryByRole("link", { name: "For business" })).toBeNull();
});
