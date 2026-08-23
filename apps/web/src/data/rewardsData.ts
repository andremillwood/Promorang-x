export interface CommunityDealRequest {
  id: string;
  venue_name: string;
  location: string;
  brand_interest: string;
  requested_perk: string;
  category: "food" | "nightlife" | "retail" | "experience";
  category_label: string;
  votes_count: number;
  votes_threshold: number;
  has_voted?: boolean;
  requester_name: string;
  created_at: string;
}

export const INITIAL_DEAL_REQUESTS: CommunityDealRequest[] = [
  {
    id: "req-001",
    venue_name: "PriceSmart Kingston",
    location: "111 Red Hills Rd, Kingston",
    brand_interest: "Arla Foods / Dairy",
    requested_perk: "Culinary Cream Tasting & 15% Member Rebate",
    category: "food",
    category_label: "Food & Dining",
    votes_count: 42,
    votes_threshold: 50,
    requester_name: "Chef Andre & 41 others",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "req-002",
    venue_name: "Sweetwood Jerk Joint",
    location: "7 Drumblair Cres, Kingston",
    brand_interest: "Local Craft Cocktails",
    requested_perk: "Complimentary Rum Punch on Friday Dinner Combos",
    category: "food",
    category_label: "Food & Dining",
    votes_count: 38,
    votes_threshold: 50,
    requester_name: "Marcus T. & 37 others",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "req-003",
    venue_name: "Kingston Dub Club",
    location: "Skyline Dr, Jack's Hill",
    brand_interest: "Roots Sound & VIP Access",
    requested_perk: "PromoKey Skip-the-Line & Skyline Balcony Pass",
    category: "nightlife",
    category_label: "Nightlife & Music",
    votes_count: 76,
    votes_threshold: 100,
    requester_name: "Solomon K. & 75 others",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "req-004",
    venue_name: "Cafe Blue Sovereign",
    location: "Sovereign Centre, Liguanea",
    brand_interest: "Blue Mountain Coffee",
    requested_perk: "Free Size Upgrade on Single-Origin Pour-Overs",
    category: "food",
    category_label: "Food & Dining",
    votes_count: 24,
    votes_threshold: 40,
    requester_name: "Tanya M. & 23 others",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];
