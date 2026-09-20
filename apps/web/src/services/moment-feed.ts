import { API_BASE_URL } from "@/lib/api";

export type MomentLifecycle = "live" | "starting_soon" | "upcoming" | "recently_ended";

export interface CanonicalMoment {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  venue_name?: string | null;
  venue_id?: string | null;
  venue_slug?: string | null;
  scene_id?: string | null;
  scene_slug?: string | null;
  scene_title?: string | null;
  starts_at: string;
  ends_at?: string | null;
  effective_ends_at: string;
  lifecycle: MomentLifecycle;
  image_url?: string | null;
  reward?: string | null;
  host_id?: string | null;
  organizer_id?: string | null;
  max_participants?: number | null;
  participant_count: number;
  associated_brands?: Array<{ id: string | null; name: string; slug: string | null }>;
  associated_brand_names: string[];
  associated_offers?: Array<{
    id: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
    reward_type?: string | null;
    value_amount?: number | null;
    value_currency?: string | null;
    source_label?: string | null;
  }>;
  data_quality_issues: string[];
  end_time_inferred: boolean;
  sponsorship_ready: boolean;
  content_origin?: string | null;
  recurrence_enabled?: boolean | null;
  recurrence_frequency?: "daily" | "weekly" | "monthly" | null;
  recurrence_interval?: number | null;
}

export interface CanonicalMomentFeed {
  moments: CanonicalMoment[];
  buckets: Record<MomentLifecycle, CanonicalMoment[]>;
  counts: Record<MomentLifecycle, number>;
  generated_at: string;
  timezone: string;
  health: { assessed: number; surfaced: number; needs_attention: number };
}

export async function getCanonicalMomentFeed(): Promise<CanonicalMomentFeed> {
  const response = await fetch(`${API_BASE_URL}/moments/feed`, { credentials: "include" });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error || "Current moments are unavailable");
  }
  return payload.data as CanonicalMomentFeed;
}

export function momentLifecycleLabel(lifecycle: MomentLifecycle) {
  if (lifecycle === "live") return "Live now";
  if (lifecycle === "starting_soon") return "Starting soon";
  if (lifecycle === "recently_ended") return "Last night";
  return "Coming up";
}
