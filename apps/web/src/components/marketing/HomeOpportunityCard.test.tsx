import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { withI18n } from "@/test/withI18n";
import { HomeOpportunityCard } from "./HomeOpportunityCard";
import type { HomeOpportunity } from "./home-opportunities";
const item: HomeOpportunity = { id: "offer", kind: "offers", title: "Dinner", href: "/offers/offer", description: "Dinner description" };
const show = (value: HomeOpportunity) => render(<MemoryRouter>{withI18n(<HomeOpportunityCard item={value} />)}</MemoryRouter>);
describe("compact card data boundaries", () => {
  it("does not invent artwork, dates, locations or availability", () => {
    show(item);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
    expect(document.querySelector("time")).toBeNull();
    expect(document.querySelector(".home-discovery-meta")).toBeNull();
    expect(screen.getByRole("link", { name: "View offer" })).toHaveAttribute("href", item.href);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
  it("omits invalid timestamps instead of crashing or presenting an invented date", () => {
    show({ ...item, date: "invalid" });
    expect(document.querySelector("time")).toBeNull();
    expect(screen.getByRole("link", { name: "View offer" })).toBeInTheDocument();
  });
  it("formats the offer deadline and keeps the original ISO timestamp", () => {
    show({ ...item, date: "2099-10-15T20:00:00Z" });
    expect(document.querySelector("time")).toHaveAttribute("datetime", "2099-10-15T20:00:00.000Z");
    expect(document.querySelector("time")).toHaveTextContent(/Available until/);
  });
  it("replaces failed artwork with a fallback while preserving the action", () => {
    show({ ...item, image: "/missing.png" });
    fireEvent.error(document.querySelector("img")!);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View offer" })).toHaveAttribute("href", item.href);
  });
});
