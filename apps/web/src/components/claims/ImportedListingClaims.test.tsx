import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ getImportedListingClaimTarget: vi.fn(), listMyImportedListingClaims: vi.fn(), requestImportedListingClaim: vi.fn(), listAdminImportedListingClaims: vi.fn(), reviewImportedListingClaim: vi.fn(), toast: vi.fn() }));
vi.mock("@/services/imported-listing-claims", () => api);
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "claimant-1" } }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: "en", formatDate: (date: string) => date }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: api.toast }) }));

import { ImportedListingClaims } from "./ImportedListingClaims";
import { AdminImportedListingClaims } from "../admin/AdminImportedListingClaims";
import { ImportedMomentClaim } from "../moments/ImportedMomentClaim";

const entityId = "11111111-2222-4333-8444-555555555555";
const target = { entity_type: "venue", entity_id: entityId, display_name: "Exact imported venue", public_path: "/venues/exact-imported-venue", claimable: true };
const claim = { id: "claim-1", entity_type: "venue", entity_id: entityId, display_name: target.display_name, status: "requested", claimant_id: "claimant-1", claimant_note: "I own and operate this venue.", evidence_url: "https://venue.example/about", created_at: "2026-11-20T12:00:00Z", review_note: null };

function renderClaims(element: React.ReactElement = <ImportedListingClaims />, route = `/claim-pages?entity_type=venue&entity_id=${entityId}`) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[route]}>{element}</MemoryRouter></QueryClientProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getImportedListingClaimTarget.mockResolvedValue(target);
  api.listMyImportedListingClaims.mockResolvedValue([]);
  api.requestImportedListingClaim.mockResolvedValue(claim.id);
  api.listAdminImportedListingClaims.mockResolvedValue([claim]);
  api.reviewImportedListingClaim.mockResolvedValue(undefined);
});

describe("imported listing claim UI", () => {
  it("submits an evidence-backed request for the exact venue without granting ownership", async () => {
    renderClaims();
    const submit = await screen.findByRole("button", { name: "Submit ownership claim" });
    expect(screen.getByRole("heading", { name: target.display_name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View listing" })).toHaveAttribute("href", target.public_path);
    fireEvent.change(screen.getByLabelText("Your relationship to this listing"), { target: { value: claim.claimant_note } });
    fireEvent.change(screen.getByLabelText("Supporting public link"), { target: { value: claim.evidence_url } });
    api.listMyImportedListingClaims.mockResolvedValue([claim]);
    fireEvent.submit(submit.closest("form")!);
    await waitFor(() => expect(api.requestImportedListingClaim).toHaveBeenCalledWith("venue", entityId, claim.claimant_note, claim.evidence_url));
    expect(await screen.findByText("Your ownership claim is awaiting review.")).toBeInTheDocument();
    expect(api.reviewImportedListingClaim).not.toHaveBeenCalled();
  });

  it("rejects HTTP evidence before making a request", async () => {
    renderClaims();
    const submit = await screen.findByRole("button", { name: "Submit ownership claim" });
    fireEvent.change(screen.getByLabelText("Your relationship to this listing"), { target: { value: claim.claimant_note } });
    fireEvent.change(screen.getByLabelText("Supporting public link"), { target: { value: "http://venue.example" } });
    fireEvent.submit(submit.closest("form")!);
    expect(api.requestImportedListingClaim).not.toHaveBeenCalled();
    expect(api.toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Provide a public link beginning with https://." }));
  });

  it("does not offer a request for an already claimed target", async () => {
    api.getImportedListingClaimTarget.mockResolvedValue({ ...target, claimable: false });
    renderClaims();
    expect(await screen.findByText("This listing is already claimed or is not eligible for an ownership request.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit ownership claim" })).not.toBeInTheDocument();
  });

  it("preserves the exact Moment ID in the guest claim entry", () => {
    renderClaims(<ImportedMomentClaim moment={{ id: entityId, content_origin: "imported", ownership_status: "unclaimed", claim_status: "unclaimed" }} />);
    expect(screen.getByRole("link", { name: "Claim this Moment" })).toHaveAttribute("href", `/claim-pages?entity_type=moment&entity_id=${entityId}`);
  });

  it("requires a review note and uses the approved RPC decision contract", async () => {
    renderClaims(<AdminImportedListingClaims />);
    const approve = await screen.findByRole("button", { name: "Approve ownership" });
    expect(approve).toBeDisabled();
    const note = "Verified official website ownership and business representative.";
    fireEvent.change(screen.getByLabelText("Review note"), { target: { value: note } });
    fireEvent.click(approve);
    await waitFor(() => expect(api.reviewImportedListingClaim).toHaveBeenCalledWith(claim.id, "approved", note));
  });
});
