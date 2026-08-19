export type BrandOpportunityKind = "moment" | "content" | "venue" | "host" | "creator";

export type BrandMatchProfile = {
  name?: string | null;
  industries?: string[];
  interests?: string[];
  geographies?: string[];
  objectives?: string[];
};

export type BrandOpportunityCandidate<T = Record<string, unknown>> = {
  id: string;
  kind: BrandOpportunityKind;
  title: string;
  description?: string | null;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  starts_at?: string | null;
  momentum?: number | null;
  verified?: boolean;
  already_connected?: boolean;
  data: T;
};

export type RankedBrandOpportunity<T = Record<string, unknown>> = BrandOpportunityCandidate<T> & {
  match_score: number;
  match_tier: "strong" | "promising" | "explore";
  reasons: string[];
};

const words = (values: Array<string | null | undefined>) => new Set(values.flatMap((value) => String(value || "").toLowerCase().split(/[^a-z0-9]+/)).filter((value) => value.length > 2));

export function rankBrandOpportunities<T>(profile: BrandMatchProfile, candidates: BrandOpportunityCandidate<T>[], now = new Date()): RankedBrandOpportunity<T>[] {
  const affinity = words([...(profile.industries || []), ...(profile.interests || []), ...(profile.objectives || [])]);
  const geographies = words(profile.geographies || []);
  const objectives = words(profile.objectives || []);
  return candidates.map((candidate) => {
    let score = 18;
    const reasons: string[] = [];
    if (candidate.already_connected) { score += 30; reasons.push("Already connected to your brand graph"); }
    const candidateGeo = words([candidate.city, candidate.country]);
    const geoMatches = [...candidateGeo].filter((word) => geographies.has(word));
    if (geoMatches.length) { score += Math.min(22, 12 + geoMatches.length * 5); reasons.push(`Matches your ${candidate.city || candidate.country} market`); }
    const candidateWords = words([candidate.title, candidate.description, candidate.category]);
    const affinityMatches = [...candidateWords].filter((word) => affinity.has(word));
    if (affinityMatches.length) { score += Math.min(24, affinityMatches.length * 6); reasons.push(`Aligns with ${affinityMatches.slice(0, 2).join(" and ")}`); }
    const momentum = Math.max(0, Number(candidate.momentum || 0));
    if (momentum > 0) { score += Math.min(18, Math.round(Math.log10(momentum + 1) * 7)); reasons.push(`${momentum.toLocaleString()} visible participation signals`); }
    if (candidate.verified) { score += 6; reasons.push("Verified operating context"); }
    if (candidate.starts_at) {
      const days = (new Date(candidate.starts_at).getTime() - now.getTime()) / 86400000;
      if (days >= 0 && days <= 30) { score += 9; reasons.push("Activates within the next 30 days"); }
    }
    if ((candidate.kind === "moment" || candidate.kind === "venue") && ([...objectives].some((word) => ["visit", "visits", "attendance", "sales", "activation"].includes(word)))) { score += 8; reasons.push("Supports physical visits and activation"); }
    if (candidate.kind === "content" && ([...objectives].some((word) => ["awareness", "content", "reach", "engagement"].includes(word)))) { score += 8; reasons.push("Supports content reach and engagement"); }
    const match_score = Math.max(0, Math.min(100, score));
    return { ...candidate, match_score, match_tier: match_score >= 75 ? "strong" as const : match_score >= 55 ? "promising" as const : "explore" as const, reasons: reasons.slice(0, 3).length ? reasons.slice(0, 3) : ["Available for brand evaluation"] };
  }).sort((a, b) => b.match_score - a.match_score || a.title.localeCompare(b.title));
}
