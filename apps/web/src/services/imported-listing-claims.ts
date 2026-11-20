import { supabase } from "@/integrations/supabase/client";
import type { ImportedListingType } from "@/lib/imported-listing-claims";

export type ImportedListingClaim = {
  id: string;
  entity_type: ImportedListingType;
  entity_id: string;
  display_name: string;
  status: string;
  claimant_note: string;
  evidence_url: string;
  created_at: string;
  review_note: string | null;
  claimant_id?: string;
};

export type ImportedListingClaimTarget = {
  entity_type: ImportedListingType;
  entity_id: string;
  display_name: string;
  public_path: string;
  claimable: boolean;
};

// These RPCs are shipped with the imported-listing ownership migration. Keep the
// ungenerated function names isolated here until the database types are refreshed.
const claimsClient = supabase as any;

export async function getImportedListingClaimTarget(entityType: ImportedListingType, entityId: string): Promise<ImportedListingClaimTarget | null> {
  const { data, error } = await claimsClient.rpc("get_imported_listing_claim_target", { p_entity_type: entityType, p_entity_id: entityId });
  if (error) throw error;
  return data;
}

export async function listMyImportedListingClaims(): Promise<ImportedListingClaim[]> {
  const { data, error } = await claimsClient.rpc("list_my_imported_listing_claims");
  if (error) throw error;
  return data || [];
}

export async function requestImportedListingClaim(entityType: ImportedListingType, entityId: string, note: string, evidenceUrl: string): Promise<string> {
  const { data, error } = await claimsClient.rpc("request_imported_listing_claim", {
    p_entity_type: entityType, p_entity_id: entityId, p_note: note, p_evidence_url: evidenceUrl,
  });
  if (error) throw error;
  return data;
}

export async function listAdminImportedListingClaims(): Promise<ImportedListingClaim[]> {
  const { data, error } = await claimsClient.rpc("admin_list_imported_listing_claims");
  if (error) throw error;
  return data || [];
}

export async function reviewImportedListingClaim(claimId: string, decision: "approved" | "rejected", reviewNote: string): Promise<void> {
  const { error } = await claimsClient.rpc("admin_review_imported_listing_claim", { p_claim_id: claimId, p_decision: decision, p_review_note: reviewNote });
  if (error) throw error;
}
