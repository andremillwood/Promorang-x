import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClaimedVenueEditor } from "./ClaimedVenueEditor";

const mocks = vi.hoisted(() => ({
  user: { id: "approved-owner" } as { id: string } | null,
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: "en" }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/services/claimed-venue-profile", () => ({
  getMyClaimedVenueProfile: mocks.getProfile,
  updateClaimedVenueProfile: mocks.updateProfile,
}));

const venue = { id: "venue-id", name: "Orchestra Hall", description: "A concert venue.", website: "https://www.dso.org/", phone: null };
let client: QueryClient;
function mount() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><ClaimedVenueEditor venueId={venue.id} /></QueryClientProvider>);
}
beforeEach(() => {
  mocks.user = { id: "approved-owner" };
  mocks.getProfile.mockReset().mockResolvedValue(venue);
  mocks.updateProfile.mockReset();
  mocks.toast.mockReset();
});
afterEach(() => { cleanup(); client?.clear(); });

describe("approved venue owner editing", () => {
  it("does not request private editing fields while signed out", () => {
    mocks.user = null;
    const view = mount();
    expect(view.container).toBeEmptyDOMElement();
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("does not offer editing when the ownership RPC returns no approved owned profile", async () => {
    mocks.getProfile.mockResolvedValue(null);
    mount();
    await waitFor(() => expect(mocks.getProfile).toHaveBeenCalledWith(venue.id));
    expect(screen.queryByRole("heading", { name: "Manage this venue" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
  });

  it("saves approved owner's public fields and refreshes the public profile without changing identity or geography", async () => {
    mocks.updateProfile.mockResolvedValue({ ...venue, name: "Orchestra Hall at the Max", phone: "+1 313 576 5111" });
    mount();
    const name = await screen.findByLabelText("Venue name");
    fireEvent.change(name, { target: { value: "Orchestra Hall at the Max" } });
    fireEvent.change(screen.getByLabelText("Phone (optional)"), { target: { value: "+1 313 576 5111" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalledWith(venue.id, {
      name: "Orchestra Hall at the Max", description: venue.description, website: venue.website, phone: "+1 313 576 5111",
    }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ title: "Venue profile updated" }));
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(client.getQueryData(["my-claimed-venue-profile", "approved-owner", venue.id])).toEqual({ ...venue, name: "Orchestra Hall at the Max", phone: "+1 313 576 5111" });
  });

  it("keeps unsaved fields and reports an ownership refusal without announcing a successful update", async () => {
    mocks.updateProfile.mockRejectedValue({ message: "Venue ownership changed. Refresh before editing." });
    mount();
    fireEvent.change(await screen.findByLabelText("Venue name"), { target: { value: "Changed name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({
      title: "Could not update this venue", description: "Venue ownership changed. Refresh before editing.", variant: "destructive",
    }));
    expect(screen.getByLabelText("Venue name")).toHaveValue("Changed name");
    expect(mocks.toast).not.toHaveBeenCalledWith({ title: "Venue profile updated" });
  });
});
