export type ContentStakeholder = {
  id: string;
  role: "creator" | "host" | "brand" | "merchant";
  name: string;
  image_url?: string | null;
};

export type ContentCommerceLink = {
  id: string;
  name: string;
  image_url?: string | null;
  price?: number | null;
  currency?: string | null;
};

export type ContentContext = {
  campaign_id: string;
  content_id?: string | null;
  original_url?: string | null;
  moment?: { id: string; title: string; location?: string | null; image_url?: string | null; starts_at?: string | null } | null;
  stakeholders: ContentStakeholder[];
  commerce: ContentCommerceLink[];
  piece?: { current_price?: number | null; change_24h?: number | null; volume_24h?: number | null; user_quantity?: number | null } | null;
  promoshare: { entries_per_action: number; enabled: boolean };
};
