import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { withI18n } from "@/test/withI18n";
import { useContext, type ReactNode } from "react";
import { MobileNavigationOwner } from "@/components/navigation/MobileNavigationOwner";
import AppLayout from "./AppLayout";

const auth = vi.hoisted(() => ({ user: null as null | { id: string }, roles: [], activeRole: "participant", loading: false, profile: null }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/components/culture/PublicHomeBar", () => ({ PublicHomeBar: () => <header>Public header</header> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Public footer</footer> }));
vi.mock("@/components/Header", () => ({ default: () => <header>Fallback header</header> }));
vi.mock("@/components/RankCelebrationModal", () => ({ RankCelebrationModal: () => null }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children, currentRole }: { children: ReactNode; currentRole: string }) => <section aria-label={`Workspace ${currentRole}`}>{children}</section> }));
vi.mock("@/components/layouts/ParticipantWorldLayout", () => ({ ParticipantWorldLayout: ({ children }: { children: ReactNode }) => <section aria-label="Participant shell">{children}</section> }));
afterEach(() => { cleanup(); auth.user = null; auth.activeRole = "participant"; });
function OwnershipProbe() { return <p>{useContext(MobileNavigationOwner) ? "Shell owns navigation" : "Page owns navigation"}</p>; }
function mount(path: string) { render(withI18n(<MemoryRouter initialEntries={[path]}><AppLayout><OwnershipProbe /></AppLayout></MemoryRouter>)); }

it.each(["/", "/shop", "/shop/item", "/discover?tab=wants", "/discoveries/local", "/live", "/business/start?resume=1"])("provides public navigation and footer clearance on %s", path => {
  mount(path);
  expect(screen.getAllByRole("navigation")).toHaveLength(1);
  expect(screen.getByRole("contentinfo").closest(".public-navigation-shell")).not.toBeNull();
  expect(screen.getByText("Shell owns navigation")).toBeInTheDocument();
});
it.each(["/auth", "/onboarding", "/drop/sample", "/aftrhrs"])("does not add navigation to focused flow %s", path => {
  mount(path); expect(screen.queryByRole("navigation")).toBeNull(); expect(screen.queryByRole("contentinfo")).toBeNull();
});
it("preserves the authenticated participant shell", () => {
  auth.user = { id: "test-user" }; mount("/discover");
  expect(screen.getByRole("region", { name: "Participant shell" })).toBeInTheDocument();
  expect(screen.getByText("Shell owns navigation")).toBeInTheDocument();
  expect(screen.queryByRole("contentinfo")).toBeNull();
});
it.each(["merchant", "brand", "agency"])("preserves active %s role on a workspace direct link", role => {
  auth.user = { id: "test-user" }; auth.activeRole = role; mount("/dashboard");
  expect(screen.getByRole("region", { name: `Workspace ${role}` })).toBeInTheDocument();
  expect(auth.activeRole).toBe(role);
  expect(screen.queryByRole("contentinfo")).toBeNull();
});
