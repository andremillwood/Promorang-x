import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { withI18n } from "@/test/withI18n";
import ForCreators from "@/pages/ForCreators";
import Hosting from "@/pages/Hosting";
import ForCommunities from "@/pages/ForCommunities";
import ForAgencies from "@/pages/ForAgencies";
import ForEnterprise from "@/pages/ForEnterprise";
import ForCauses from "@/pages/ForCauses";
import Join from "@/pages/Join";

const demand = vi.hoisted(() => ({ loading: false }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/contexts/MarketContext", () => ({ useMarket: () => ({ city: { id: "kingston", name: "Kingston" }, country: { slug: "jamaica" } }) }));
vi.mock("@/hooks/useDiscoveryDemand", () => ({ useDiscoveryDemand: () => ({ inbox: { questions: [] }, isLoading: demand.loading }) }));
vi.mock("@/components/promorang/SignatureObjects", () => ({ PromoCardFace: () => <div>PromoCard product</div> }));
afterEach(() => { cleanup(); demand.loading = false; });
const mount = (page: JSX.Element) => render(withI18n(<MemoryRouter>{page}</MemoryRouter>));

describe("role-specific marketing journeys", () => {
  it.each([
    ["creator", ForCreators, "/dashboard?view=studio"],
    ["host", Hosting, "/propose/new?from=hosting&role=host"],
  ] as const)("preserves the %s signup role and exact destination", (role, Page, next) => {
    const { container } = mount(<Page />);
    const link = container.querySelector<HTMLAnchorElement>(".marketing-story-primary")!;
    const url = new URL(link.getAttribute("href")!, "https://promorang.co");
    expect(url.pathname).toBe("/auth");
    expect(url.searchParams.get("role")).toBe(role);
    expect(url.searchParams.get("next")).toBe(next);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
  it.each([
    [ForCommunities, "/propose"],
    [ForAgencies, "/auth?mode=signup&role=brand&next=/dashboard"],
    [ForEnterprise, "/contact"],
    [ForCauses, "/contact"],
  ] as const)("keeps the configured operating route", (Page, href) => {
    const { container } = mount(<Page />);
    const primary = container.querySelectorAll(".marketing-story-primary");
    expect(primary).toHaveLength(2);
    primary.forEach(link => expect(link).toHaveAttribute("href", href));
  });
  it("distinguishes demand loading from a quiet market", () => {
    demand.loading = true;
    const { unmount } = mount(<ForCreators />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(document.querySelector(".marketing-story-quiet")).toBeNull();
    unmount(); demand.loading = false;
    mount(<ForCreators />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.querySelector(".marketing-story-quiet")).toHaveTextContent("Kingston");
  });
  it("retains the localized route action in Spanish", () => {
    render(withI18n(<MemoryRouter><ForCreators /></MemoryRouter>, "es-419"));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Haz que tu influencia cuente.");
    expect(document.querySelector(".marketing-story-primary")).toHaveAttribute("href", expect.stringContaining("role=creator"));
  });
});

describe("specialist entry tabs", () => {
  it("supports arrow, home and end keys with a linked panel and one keyboard stop", () => {
    mount(<Join />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.filter(tab => tab.tabIndex === 0)).toHaveLength(1);
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "End" });
    expect(tabs.at(-1)).toHaveFocus();
    expect(tabs.at(-1)).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs.at(-1)!.id);
    expect(screen.getByRole("link", { name: "Explore agency tools" })).toHaveAttribute("href", "/for-agencies");
    fireEvent.keyDown(tabs.at(-1)!, { key: "ArrowRight" });
    expect(tabs[0]).toHaveFocus();
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(tabs[1]).toHaveFocus();
    fireEvent.keyDown(tabs[1], { key: "Home" });
    expect(tabs[0]).toHaveFocus();
  });
});
