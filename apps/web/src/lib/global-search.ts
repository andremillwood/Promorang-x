import { supabase } from "@/integrations/supabase/client";

export type GlobalSearchResultType = "moment" | "discovery" | "venue" | "offer" | "product" | "brand" | "merchant" | "host" | "user";

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  result_type: GlobalSearchResultType;
  image_url: string;
  path: string;
  relevance_score: number;
}

const foodTerms = ["food", "drink", "restaurant", "dining", "cuisine", "dish", "menu", "cafe", "coffee", "brunch", "lunch", "dinner", "chinese", "rice", "eatery"];

function normalize(value: unknown) {
  return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function score(values: unknown[], query: string) {
  const haystack = normalize(values.filter(Boolean).join(" "));
  const normalized = normalize(query);
  const tokens = normalized.split(" ").filter(Boolean);
  if (!tokens.length) return 0;
  const aliases: Record<string, string[]> = { food: foodTerms, restaurant: foodTerms, event: ["event", "moment", "party", "concert", "show", "gathering"] };
  if (!tokens.every((token) => haystack.includes(token) || aliases[token]?.some((alias) => haystack.includes(alias)))) return -1;
  return (haystack.includes(normalized) ? 50 : 0) + tokens.reduce((total, token) => total + (haystack.startsWith(token) ? 12 : 5), 0);
}

function result(row: any, type: GlobalSearchResultType, query: string): GlobalSearchResult | null {
  const isMoment = type === "moment";
  const isDiscovery = type === "discovery";
  const isVenue = type === "venue";
  const isProduct = type === "product";
  const title = row.title || row.name || "Untitled";
  const subtitle = row.venue_name || row.location || row.address || row.city || row.category || row.reward_type || "PROMORANG";
  const description = row.description || row.detail || row.reward || row.context_notes || "";
  const relevance = score([title, subtitle, description, row.category, row.venue_type, row.reward_type, row.fulfillment_type], query);
  if (relevance < 0) return null;
  return {
    id: String(row.id), title, subtitle, description,
    result_type: type,
    image_url: row.image_url || row.cover_image || "",
    path: isMoment ? `/moments/${row.slug || row.id}` : isDiscovery ? `/discoveries/${row.slug || row.id}` : isVenue ? `/venues/${row.slug || row.id}` : isProduct ? `/shop/${encodeURIComponent(row.listing_id || row.id)}` : type === "offer" ? `/offers/${row.id}` : row.path || "/discover",
    relevance_score: relevance,
  };
}

export async function searchPromorang(query: string): Promise<GlobalSearchResult[]> {
  const term = query.trim();
  if (term.length < 2) return [];
  const client = supabase as any;
  const safe = async (promise: PromiseLike<{ data?: any[] | null; error?: unknown }>) => {
    try { const response = await promise; return response.error ? [] : response.data || []; } catch { return []; }
  };
  const [legacy, moments, discoveries, venues, offers, products] = await Promise.all([
    safe(client.rpc("fn_global_search", { search_term: term })),
    safe(client.from("moments").select("id,slug,title,description,category,location,venue_name,reward,image_url").eq("is_active", true).limit(200)),
    safe(client.from("discoveries").select("id,slug,title,description,category,city,country,cover_image").eq("verification_status", "approved").limit(200)),
    safe(client.from("view_public_venue_directory").select("id,slug,name,description,location,address,city,venue_type,image_url").limit(200)),
    safe(client.from("offers").select("id,title,description,reward_type,fulfillment_type,status").in("status", ["active", "published", "live"]).limit(200)),
    safe(client.from("view_public_commerce_directory").select("listing_id,name,description,category,merchant_name,venue_name,city,location,listing_kind,image_url,is_active").eq("is_active", true).limit(200)),
  ]);
  const richer = [
    ...moments.map((row) => result(row, "moment", term)),
    ...discoveries.map((row) => result(row, "discovery", term)),
    ...venues.map((row) => result(row, "venue", term)),
    ...offers.map((row) => result(row, "offer", term)),
    ...products.map((row) => result({ ...row, id: row.listing_id }, "product", term)),
  ].filter(Boolean) as GlobalSearchResult[];
  const combined = [...(legacy as GlobalSearchResult[]), ...richer];
  const unique = new Map<string, GlobalSearchResult>();
  combined.forEach((item) => {
    const key = `${item.result_type}:${item.id}`;
    const current = unique.get(key);
    if (!current || item.relevance_score > current.relevance_score) unique.set(key, item);
  });
  return [...unique.values()].sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 80);
}
