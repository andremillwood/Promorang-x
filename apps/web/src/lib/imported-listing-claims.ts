export type ImportedListingType = "moment" | "venue";

export type ImportedMomentOwnership = {
  id: string;
  content_origin?: string | null;
  ownership_status?: string | null;
  claim_status?: string | null;
  host_id?: string | null;
  organizer_id?: string | null;
  claimed_by?: string | null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function canClaimImportedMoment(moment: ImportedMomentOwnership): boolean {
  return UUID_PATTERN.test(moment.id)
    && moment.content_origin === "imported"
    && moment.ownership_status === "unclaimed"
    && !["claimed", "verified"].includes(moment.claim_status || "")
    && !moment.host_id && !moment.organizer_id && !moment.claimed_by;
}

export function importedListingClaimPath(entityType: ImportedListingType, entityId: string): string {
  return `/claim-pages?${new URLSearchParams({ entity_type: entityType, entity_id: entityId })}`;
}

export function parseImportedListingClaimTarget(params: URLSearchParams): { entityType: ImportedListingType; entityId: string } | null {
  const entityType = params.get("entity_type");
  const entityId = params.get("entity_id") || "";
  if ((entityType !== "moment" && entityType !== "venue") || !UUID_PATTERN.test(entityId)) return null;
  return { entityType, entityId };
}

export function safeEvidenceUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
