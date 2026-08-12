export type DiscoveryCategory =
  | "restaurant"
  | "beach"
  | "trail"
  | "hidden_gem"
  | "attraction"
  | "nightlife"
  | "media"
  | "culture"
  | "music";

export type DiscoveryVerificationStatus = "pending" | "approved" | "rejected";

export type DiscoveryMetadata = {
  vibe?: string[];
  best_time?: string;
  price_range?: "$" | "$$" | "$$$" | "$$$$";
  highlights?: string[];
  tips?: string[];
  website_url?: string;
  instagram_handle?: string;
};

export type Discovery = {
  id: string | number;
  slug: string;
  title: string;
  category: DiscoveryCategory | string;
  description: string | null;
  cover_image: string | null;
  gallery: string[] | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  venue_id: string | null;
  creator_id: string | null;
  scene_id?: string | null;
  verification_status: DiscoveryVerificationStatus;
  checkin_count: number;
  save_count: number;
  average_rating: number;
  metadata?: DiscoveryMetadata;
  created_at?: string;
  updated_at?: string;
  // Joined relation fields
  creator_profile?: {
    id: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    reputation_title?: string;
  };
  scene?: {
    id: string;
    slug: string;
    title: string;
    city?: string;
  };
  venue?: {
    id: string;
    name: string;
    city?: string;
  };
};

export type ReputationScore = {
  id: string | number;
  user_id: string;
  category: string;
  score: number;
  title_level: "Novice" | "Scout" | "Insider" | "Specialist" | "Master";
  last_updated?: string;
};

export function formatDiscoveryCategory(category: string): string {
  const map: Record<string, string> = {
    restaurant: "Food & Dining",
    beach: "Beaches & Coastlines",
    trail: "Hiking & Outdoors",
    hidden_gem: "Hidden Gem",
    attraction: "Attractions & Culture",
    nightlife: "Nightlife & Bars",
    media: "Media & Drops",
    culture: "Culture & Arts",
    music: "Music & Sounds",
  };
  return map[category] || category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function discoveryLocation(d: Pick<Discovery, "city" | "country" | "location_address">): string {
  if (d.location_address && d.city) return `${d.location_address}, ${d.city}`;
  return [d.city, d.country].filter(Boolean).join(", ") || "Somewhere special";
}
