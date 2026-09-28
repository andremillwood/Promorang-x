import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StartCommunity from "./StartCommunity";
const mocks = vi.hoisted(() => ({ start: vi.fn(), toast: vi.fn(), track: vi.fn() }));
vi.mock("@/hooks/usePeopleExperience", () => ({ useExperienceActions: () => ({ start: { mutateAsync: mocks.start, isPending: false } }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/people/ExperienceShell", () => ({ ExperienceShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/lib/marketing-attribution", () => ({ trackGrowthEvent: mocks.track }));
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());
function preview() {
  render(<MemoryRouter><StartCommunity /></MemoryRouter>);
  expect(screen.getByRole("button", { name: "launch.next" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("launch.idea"), { target: { value: "Night walks" } });
  fireEvent.change(screen.getByLabelText("launch.audience"), { target: { value: "People who love walking" } });
  fireEvent.click(screen.getByText("launch.next"));
  fireEvent.change(screen.getByLabelText("launch.promise"), { target: { value: "Find a walk worth taking" } });
  fireEvent.click(screen.getByText("launch.next"));
  expect(screen.getByLabelText("start.where")).toHaveValue("");
  fireEvent.change(screen.getByLabelText("start.nameLabel"), { target: { value: "Night walks" } });
  fireEvent.change(screen.getByLabelText("start.where"), { target: { value: "Lisboa" } });
  fireEvent.change(screen.getByLabelText("launch.country"), { target: { value: "Portugal" } });
  fireEvent.click(screen.getByText("launch.next"));
}
it("previews before publishing and sends the Promise and international context to the existing flow", async () => {
  mocks.start.mockResolvedValue({ scene: { id: "scene-1", slug: "night-walks", title: "Night walks", metadata: { tagline: "Find a walk worth taking" } } });
  preview();
  expect(mocks.start).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("launch.publish"));
  await waitFor(() => expect(mocks.start).toHaveBeenCalledWith(expect.objectContaining({ promise: "Find a walk worth taking", audience: "People who love walking", city: "Lisboa", country: "Portugal" })));
  expect(await screen.findByRole("link", { name: /launch.want/ })).toHaveAttribute("href", "/create?intent=answer&hub=scene-1&scene_slug=night-walks");
  expect(screen.getByRole("link", { name: /launch.offer/ })).toHaveAttribute("href", "/give?scene_id=scene-1&scene_slug=night-walks");
});
it("keeps the preview and does not announce publication when saving fails", async () => {
  mocks.start.mockRejectedValue(new Error("offline"));
  preview(); fireEvent.click(screen.getByText("launch.publish"));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })));
  expect(screen.getByText("launch.publish")).toBeInTheDocument();
  expect(mocks.track).not.toHaveBeenCalledWith(expect.objectContaining({ properties: { action: "scene_published" } }));
});
