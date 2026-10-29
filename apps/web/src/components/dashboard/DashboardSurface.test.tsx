import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Compass } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { DashboardHero } from "./DashboardSurface";

vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ t: (key: string) => key === "common.loading" ? "Loading…" : "Quick actions" }) }));
const stats = [{ label: "Recorded visits", value: "123", helper: "This month", icon: Compass }];

describe("shared dashboard hierarchy", () => {
  it("shows each action and metric once while retaining callback actions", () => {
    const callback = vi.fn();
    render(<MemoryRouter><DashboardHero badge="Host studio" title="Your next event" description="Manage recorded arrivals." actions={[{ label: "Create event", href: "/create", icon: Compass }, { label: "Review arrivals", onClick: callback, icon: Compass }]} stats={stats} /></MemoryRouter>);
    expect(screen.getAllByRole("link", { name: "Create event" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Create event" })).toHaveAttribute("href", "/create");
    expect(screen.getAllByText("Recorded visits")).toHaveLength(1);
    expect(screen.getAllByText("123")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Review arrivals" }));
    expect(callback).toHaveBeenCalledOnce();
    expect(screen.queryByText("Live workspace")).not.toBeInTheDocument();
  });
  it("does not reserve an empty secondary action column", () => {
    render(<MemoryRouter><DashboardHero badge="Studio" title="Start here" description="Create an event." actions={[{ label: "Create", href: "/create", icon: Compass }]} /></MemoryRouter>);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create" })).toBeInTheDocument();
  });
  it("announces metric loading without presenting stale figures", () => {
    render(<MemoryRouter><DashboardHero badge="Studio" title="Overview" description="Recorded activity." actions={[]} stats={stats} isLoading /></MemoryRouter>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(screen.queryByText("123")).not.toBeInTheDocument();
  });
});
