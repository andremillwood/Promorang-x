export type ManagedWorkspaceOrg = {
  id: string;
  type?: string | null;
};

export type ManagedWorkspaceClient = ManagedWorkspaceOrg & {
  managing_agency_id: string;
};

export type ManagedWorkspaceResume =
  | { kind: "direct"; orgId: string }
  | { kind: "managed"; orgId: string; agencyId: string }
  | { kind: "agency"; orgId: string }
  | { kind: "ambiguous" }
  | { kind: "none" };

export function workspaceRoleFromOrgType(type?: string | null) {
  if (type === "brand") return "brand" as const;
  if (type === "merchant") return "merchant" as const;
  if (type === "agency") return "agency" as const;
  return null;
}

export function managedClientForRoleChange<T extends ManagedWorkspaceClient>(input: {
  activeOrgId?: string | null;
  pendingManagedClientId?: string | null;
  clients: T[];
}): T | null {
  const selectedId = input.pendingManagedClientId || input.activeOrgId;
  if (!selectedId) return null;
  return input.clients.find((client) => client.id === selectedId) || null;
}

export function exactManagingAgency<T extends ManagedWorkspaceOrg>(input: {
  organizations: T[];
  managingAgencyId?: string | null;
}): T | null {
  const agencies = input.organizations.filter((organization) => organization.type === "agency");
  if (input.managingAgencyId) {
    return agencies.find((agency) => agency.id === input.managingAgencyId) || null;
  }
  return agencies.length === 1 ? agencies[0] : null;
}

export function resolveManagedWorkspaceResume(input: {
  savedOrgId?: string | null;
  savedManagingAgencyId?: string | null;
  directOrganizations: ManagedWorkspaceOrg[];
  clientsByAgency: Record<string, ManagedWorkspaceClient[]>;
}): ManagedWorkspaceResume {
  const savedOrgId = input.savedOrgId || null;
  if (!savedOrgId) return { kind: "none" };

  const direct = input.directOrganizations.find((organization) => organization.id === savedOrgId);
  if (direct) return { kind: "direct", orgId: direct.id };

  const agencies = input.directOrganizations.filter((organization) => organization.type === "agency");
  if (input.savedManagingAgencyId) {
    const agency = agencies.find((candidate) => candidate.id === input.savedManagingAgencyId);
    if (!agency) return agencies.length > 1 ? { kind: "ambiguous" } : { kind: "none" };

    const client = (input.clientsByAgency[agency.id] || []).find((candidate) => candidate.id === savedOrgId);
    if (client) return { kind: "managed", orgId: client.id, agencyId: agency.id };
    return { kind: "agency", orgId: agency.id };
  }

  const matches = agencies.flatMap((agency) =>
    (input.clientsByAgency[agency.id] || [])
      .filter((client) => client.id === savedOrgId)
      .map((client) => ({ agency, client })),
  );

  if (matches.length === 1) {
    return { kind: "managed", orgId: matches[0].client.id, agencyId: matches[0].agency.id };
  }
  if (matches.length > 1 || agencies.length > 1) return { kind: "ambiguous" };
  if (agencies.length === 1) return { kind: "agency", orgId: agencies[0].id };
  return { kind: "none" };
}
