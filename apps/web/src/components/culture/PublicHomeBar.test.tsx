import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { withI18n } from "@/test/withI18n";
import { PublicHomeBar } from "./PublicHomeBar";

const auth = vi.hoisted(() => ({ user: null as null | { id: string } }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/components/location/CityQuickSwitcher", () => ({ CityQuickSwitcher: () => <button>Kingston &amp; St. Andrew</button> }));
vi.mock("@/components/LanguageSelector", () => ({ LanguageSelector: () => <button>Language</button> }));
beforeEach(() => { auth.user = null; });

function header(route: string) {
  return render(<MemoryRouter initialEntries={[route]}>{withI18n(<PublicHomeBar />)}</MemoryRouter>);
}

describe("public navigation destinations", () => {
  it("keeps offers distinct from discovery when a search is present", () => {
    header("/discover?tab=perks&q=coffee");
    for (const link of screen.getAllByRole("link", { name: "Offers" })) expect(link).toHaveAttribute("aria-current", "page");
    for (const link of screen.getAllByRole("link", { name: "Discover" })) expect(link).not.toHaveAttribute("aria-current");
    expect(screen.getAllByRole("link", { name: "For business" })[0]).toHaveAttribute("href", "/solutions");
  });
  it("retains the shop active state on category pages", () => {
    header("/shop/category/services");
    for (const link of screen.getAllByRole("link", { name: "Shop" })) expect(link).toHaveAttribute("aria-current", "page");
  });
  it("keeps anonymous sign-in and signed-in card entry separate", () => {
    const view = header("/");
    expect(document.querySelector('a[href="/auth?mode=login&role=participant"]')).toBeInTheDocument();
    view.unmount(); auth.user = { id: "test-user" }; header("/");
    expect(document.querySelector('a[href="/card"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/auth?mode=login&role=participant"]')).not.toBeInTheDocument();
  });
});
