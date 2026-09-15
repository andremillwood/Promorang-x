import { describe, expect, it } from "vitest";
import {
  exactManagingAgency,
  managedClientForRoleChange,
  resolveManagedWorkspaceResume,
} from "../src/managed-workspace";

const agencyA = { id: "agency-a", type: "agency" };
const agencyB = { id: "agency-b", type: "agency" };
const ownedBrand = { id: "owned-brand", type: "brand" };
const clientBrand = { id: "client-brand", type: "brand", managing_agency_id: "agency-a" };
const clientMerchant = { id: "client-merchant", type: "merchant", managing_agency_id: "agency-a" };

describe("managed workspace contract", () => {
  it("keeps a newly selected managed client authoritative during an immediate same-role switch", () => {
    const selected = managedClientForRoleChange({
      activeOrgId: "agency-a",
      pendingManagedClientId: "client-brand",
      clients: [clientBrand],
    });

    expect(selected?.id).toBe("client-brand");
    expect(selected?.id).not.toBe(ownedBrand.id);
  });

  it("restores the same managed client on refresh when access remains valid", () => {
    expect(resolveManagedWorkspaceResume({
      savedOrgId: "client-brand",
      savedManagingAgencyId: "agency-a",
      directOrganizations: [agencyA, ownedBrand],
      clientsByAgency: { "agency-a": [clientBrand, clientMerchant] },
    })).toEqual({ kind: "managed", orgId: "client-brand", agencyId: "agency-a" });
  });

  it("recovers to the exact managing agency when managed-client access is revoked", () => {
    expect(resolveManagedWorkspaceResume({
      savedOrgId: "client-brand",
      savedManagingAgencyId: "agency-a",
      directOrganizations: [agencyA, ownedBrand],
      clientsByAgency: { "agency-a": [] },
    })).toEqual({ kind: "agency", orgId: "agency-a" });
  });

  it("does not fall through to an owned brand when a managed client disappears", () => {
    const resume = resolveManagedWorkspaceResume({
      savedOrgId: "client-brand",
      savedManagingAgencyId: "agency-a",
      directOrganizations: [agencyA, ownedBrand],
      clientsByAgency: { "agency-a": [] },
    });

    expect(resume).not.toEqual({ kind: "direct", orgId: "owned-brand" });
    expect(resume).toEqual({ kind: "agency", orgId: "agency-a" });
  });

  it("requires explicit agency context when multiple agencies make legacy state ambiguous", () => {
    expect(resolveManagedWorkspaceResume({
      savedOrgId: "missing-client",
      directOrganizations: [agencyA, agencyB, ownedBrand],
      clientsByAgency: { "agency-a": [], "agency-b": [] },
    })).toEqual({ kind: "ambiguous" });

    expect(exactManagingAgency({
      organizations: [agencyA, agencyB],
      managingAgencyId: null,
    })).toBeNull();
  });

  it("uses the recorded agency instead of an arbitrary first agency", () => {
    expect(exactManagingAgency({
      organizations: [agencyA, agencyB],
      managingAgencyId: "agency-b",
    })?.id).toBe("agency-b");
  });
});
