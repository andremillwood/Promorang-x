import { supabase } from "@/integrations/supabase/client";
import type { CanonicalMoment } from "./moment-feed";

type PublicMomentRow = Partial<CanonicalMoment> & {
  id: string;
  title: string;
  starts_at: string;
  is_active?: boolean;
  status?: string | null;
  visibility?: string | null;
  associated_brand_ids?: string[] | null;
  associated_brand_slugs?: string[] | null;
};

export function normalizePublicMomentDetail(row: PublicMomentRow | null, now = Date.now()): CanonicalMoment | null {
  if (!row || row.is_active === false || ["demo", "platform_seed"].includes(row.content_origin || "")
    || ["private", "hidden"].includes(row.visibility || "")
    || ["cancelled", "canceled", "archived", "rejected"].includes(row.status || "")) return null;
  const start = Date.parse(row.starts_at);
  const suppliedEnd = row.ends_at ? Date.parse(row.ends_at) : null;
  if (!Number.isFinite(start) || (suppliedEnd !== null && (!Number.isFinite(suppliedEnd) || suppliedEnd < start))) return null;
  const end = suppliedEnd ?? start + 4 * 60 * 60 * 1000;
  const lifecycle = start <= now && end > now ? "live"
    : start > now ? (start - now <= 3 * 60 * 60 * 1000 ? "starting_soon" : "upcoming")
      : now - end <= 36 * 60 * 60 * 1000 ? "recently_ended" : "completed";
  const brandNames = row.associated_brand_names || [];
  return {
    ...row,
    recurrence_timezone: row.recurrence_timezone || row.timezone,
    effective_ends_at: new Date(end).toISOString(),
    lifecycle,
    participant_count: Number(row.participant_count || 0),
    associated_brand_names: brandNames,
    associated_brands: row.associated_brands || brandNames.map((name, index) => ({ name, id: row.associated_brand_ids?.[index] || null, slug: row.associated_brand_slugs?.[index] || null })),
    data_quality_issues: row.data_quality_issues || [],
    end_time_inferred: suppliedEnd === null,
    sponsorship_ready: Boolean(row.host_id || row.organizer_id),
  };
}

export async function getPublicMomentDetail(identifier: string): Promise<CanonicalMoment | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  // The public directory owns visibility policy. Never fall back to the raw
  // moments table or the service-role detail endpoint for an anonymous visitor.
  const { data, error } = await supabase.from("view_public_moment_directory")
    .select("*").eq(isUuid ? "id" : "slug", identifier).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return normalizePublicMomentDetail(data as PublicMomentRow | null);
}
