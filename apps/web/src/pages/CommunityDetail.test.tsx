import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CommunityDetail from "./CommunityDetail";
const mocks = vi.hoisted(() => ({ join: vi.fn(), toast: vi.fn(), track: vi.fn(), membership: null as unknown }));
vi.mock("@/hooks/useScenes", () => ({
  useScene: () => ({ data: { scene: { id: "scene-1", slug: "kingston-after-dark", title: "After dark", description: "Night culture", city: "Kingston", status: "active", metadata: { tagline: "Find nights worth leaving home for" } }, membership: mocks.membership, moments: [], discoveries: [], demand: [], demandResponses: [], offers: [], places: [], people: [] } }),
  useJoinScene: () => ({ mutateAsync: mocks.join, isPending: false }),
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "person-1" } }) }));
vi.mock("@/hooks/usePeopleExperience", () => ({ useExperienceActions: () => ({ invite: { mutateAsync: vi.fn() } }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/components/culture/CultureCards", () => ({ MobileBottomNav: () => null }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ t: (key: string) => key, formatNumber: String, formatDate: String }) }));
vi.mock("@/lib/marketing-attribution", () => ({ trackGrowthEvent: mocks.track }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.membership = null; });
it("leads with the Promise and does not inject a promotional Moment into an empty Scene", () => {
  render(<MemoryRouter><CommunityDetail /></MemoryRouter>);
  expect(screen.getByText("Find nights worth leaving home for")).toBeInTheDocument();
  expect(document.querySelector("#scene-moments")).toBeNull();
  expect(document.querySelector("#scene-discoveries")).toBeNull();
  expect(screen.getByText("launch.empty")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /launch.want/ })).toHaveAttribute("href", "/create?intent=answer&hub=scene-1&scene_slug=kingston-after-dark");
});
it("does not report following after a failed membership write", async () => {
  mocks.join.mockRejectedValue(new Error("offline"));
  render(<MemoryRouter><CommunityDetail /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole("button", { name: "launch.follow" })[0]);
  await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })));
  expect(mocks.track).not.toHaveBeenCalledWith(expect.objectContaining({ properties: { action: "scene_followed" } }));
});
it("confirms a successful follow and prevents repeat follows for an active member", async () => {
  mocks.join.mockResolvedValue(undefined);
  const view = render(<MemoryRouter><CommunityDetail /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole("button", { name: "launch.follow" })[0]);
  await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ title: "launch.followed", description: "launch.consequence" }));
  mocks.membership = { membership_state: "active" };
  view.rerender(<MemoryRouter><CommunityDetail /></MemoryRouter>);
  expect(screen.getAllByRole("button", { name: "launch.following" }).every((button) => button.hasAttribute("disabled"))).toBe(true);
});
