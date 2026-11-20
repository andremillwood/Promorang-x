import { supabase } from "@/integrations/supabase/client";

export type ClaimedVenueProfile = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  phone: string | null;
};

export type ClaimedVenueProfileUpdate = Omit<ClaimedVenueProfile, "id">;

export class ClaimedVenueError extends Error {
  constructor(public readonly code: "CLAIMED_VENUE_INVALID_RESPONSE" | "CLAIMED_VENUE_OWNERSHIP_UNAVAILABLE" | "CLAIMED_VENUE_INVALID_WEBSITE") {
    super(code);
    this.name = "ClaimedVenueError";
  }
}

// These RPCs verify an approved claim and current canonical ownership in the
// database. Keep the ungenerated RPC names isolated until types are refreshed.
const venueClient = supabase as any;

function readProfile(data: unknown, expectedId: string): ClaimedVenueProfile | null {
  if (data === null) return null;
  if (typeof data !== "object" || !data) throw new ClaimedVenueError("CLAIMED_VENUE_INVALID_RESPONSE");
  const record = data as Record<string, unknown>;
  if (record.id !== expectedId || typeof record.name !== "string") throw new ClaimedVenueError("CLAIMED_VENUE_INVALID_RESPONSE");
  return {
    id: expectedId,
    name: record.name,
    description: typeof record.description === "string" ? record.description : null,
    website: typeof record.website === "string" ? record.website : null,
    phone: typeof record.phone === "string" ? record.phone : null,
  };
}

export async function getMyClaimedVenueProfile(venueId: string): Promise<ClaimedVenueProfile | null> {
  const { data, error } = await venueClient.rpc("get_my_claimed_venue_profile", { p_venue_id: venueId });
  if (error) throw error;
  return readProfile(data, venueId);
}

export async function updateClaimedVenueProfile(venueId: string, update: ClaimedVenueProfileUpdate): Promise<ClaimedVenueProfile> {
  const { data, error } = await venueClient.rpc("update_claimed_venue_profile", {
    p_venue_id: venueId,
    p_name: update.name,
    p_description: update.description,
    p_website: update.website,
    p_phone: update.phone,
  });
  if (error) throw error;
  const profile = readProfile(data, venueId);
  if (!profile) throw new ClaimedVenueError("CLAIMED_VENUE_OWNERSHIP_UNAVAILABLE");
  return profile;
}
