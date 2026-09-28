import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CreateSomething from "./CreateSomething";
import GiveSomething from "./GiveSomething";

const mocks = vi.hoisted(() => ({ ask: vi.fn(), drop: vi.fn(), toast: vi.fn() }));
vi.mock("@/hooks/usePeopleExperience", () => ({
  useExperienceActions: () => ({ ask: { mutateAsync: mocks.ask }, createDrop: { mutateAsync: mocks.drop } }),
  useGiveablePerks: () => ({ data: [] }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "person-1" }, activeRole: "participant" }) }));
vi.mock("@/components/people/ExperienceShell", () => ({ ExperienceShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, QuietEmpty: () => null }));
vi.mock("@/components/people/StakeholderLoop", () => ({ StakeholderHowLead: () => null }));
vi.mock("@/components/discovery/DiscoveryDemandInbox", () => ({ DiscoveryDemandInbox: () => null }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/lib/marketing-attribution", () => ({ trackGrowthEvent: vi.fn() }));
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

function showWant() {
  render(<MemoryRouter initialEntries={["/create?intent=answer&hub=scene-1&scene_slug=night-walks"]}><CreateSomething /></MemoryRouter>);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "More night walks" } });
  fireEvent.click(screen.getByRole("button", { name: "create.askThem" }));
}
it("shows the saved Want and links to the exact record without another submit button", async () => {
  mocks.ask.mockResolvedValue({ id: "want-1" });
  showWant();
  expect(await screen.findByRole("status")).toHaveTextContent("launch.wantSaved");
  expect(screen.getByText("More night walks")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "launch.viewWant" })).toHaveAttribute("href", "/scenes/night-walks?want=want-1#want-want-1");
  expect(screen.queryByRole("button", { name: "create.askThem" })).not.toBeInTheDocument();
});
it("preserves the question and allows retry when saving fails", async () => {
  mocks.ask.mockRejectedValue(new Error("offline"));
  showWant();
  await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })));
  expect(screen.getByRole("textbox")).toHaveValue("More night walks");
  expect(screen.queryByRole("link", { name: "launch.viewWant" })).not.toBeInTheDocument();
});
it("replaces the Offer form with its published destination even without clipboard access", async () => {
  mocks.drop.mockResolvedValue({ id: "offer-1", slug: "walking-pass" });
  render(<MemoryRouter initialEntries={["/give?scene_id=scene-1&scene_slug=night-walks&title=Walking%20pass"]}><GiveSomething /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "give.dropIt" }));
  expect(await screen.findByRole("status")).toHaveTextContent("launch.offerSaved");
  expect(screen.getByRole("link", { name: "launch.viewOffer" })).toHaveAttribute("href", "/drop/walking-pass");
  expect(screen.queryByRole("button", { name: "give.dropIt" })).not.toBeInTheDocument();
  expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" }));
});
