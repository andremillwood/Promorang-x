import type { Tables } from "@/integrations/supabase/types";

export type CommerceListing = Tables<"view_public_commerce_directory">;

const PREVIEW_SKU = "preview-partner";

function previewListing(
  listing: Pick<
    CommerceListing,
    | "listing_id"
    | "source_id"
    | "name"
    | "description"
    | "category"
    | "price"
    | "points_cost"
    | "image_url"
    | "merchant_name"
    | "merchant_slug"
    | "venue_name"
    | "city"
    | "location"
    | "discount_value"
  >,
): CommerceListing {
  return {
    address: listing.location,
    auto_redeem_on_participation: false,
    booking_url: null,
    category: listing.category,
    category_slug: null,
    city: listing.city,
    city_slug: null,
    compare_at_price: null,
    country: "Jamaica",
    country_slug: "jamaica",
    created_at: new Date().toISOString(),
    currency: "USD",
    description: listing.description,
    discount_type: "fixed",
    discount_value: listing.discount_value,
    expires_at: null,
    fulfillment_mode: "in_person",
    image_url: listing.image_url,
    images: listing.image_url ? [listing.image_url] : [],
    inventory_quantity: null,
    is_active: true,
    is_redeemable_with_points: true,
    is_unlimited: true,
    listing_id: listing.listing_id,
    listing_kind: "product",
    linked_moment_id: null,
    linked_moment_slug: null,
    linked_moment_title: null,
    location: listing.location,
    low_stock_threshold: null,
    merchant_logo_url: null,
    merchant_name: listing.merchant_name,
    merchant_slug: listing.merchant_slug,
    merchant_user_id: null,
    merchant_website: null,
    moment_exclusive: false,
    name: listing.name,
    organization_id: null,
    points_cost: listing.points_cost,
    price: listing.price,
    service_capacity: null,
    service_duration_minutes: null,
    sku: PREVIEW_SKU,
    source_id: listing.source_id,
    source_table: "products",
    total_redemptions: 0,
    total_sales: 0,
    updated_at: null,
    variants: null,
    venue_id: null,
    venue_name: listing.venue_name,
    venue_slug: listing.merchant_slug,
    venue_type: listing.category,
    visibility: "public",
  };
}

/** Honest Kingston partner previews shown when live merchant inventory is empty. */
export const KINGSTON_EXPERIENCE_LISTINGS: CommerceListing[] = [
  previewListing({
    listing_id: "devon-house-tasting-passport",
    source_id: "devon-house-passport",
    name: "Devon House Tasting Passport",
    description: "The ultimate culinary sampler: 1 Devon House I Scream single scoop + 1 Tacbar signature street taco + 1 Gourmet Bakery pastry.",
    category: "Food & Dining",
    price: 18.5,
    points_cost: 250,
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800",
    merchant_name: "Devon House Courtyard Merchants",
    merchant_slug: "devon-house",
    venue_name: "Devon House Estate",
    city: "Kingston",
    location: "26 Hope Rd, Kingston",
    discount_value: 6,
  }),
  previewListing({
    listing_id: "fat-wednesday-vip-pack",
    source_id: "fat-wednesday-pack",
    name: "FAT Wednesday VIP Table Pack",
    description: "Midweek VIP lounge experience: 1 Signature Jerk Sampler Platter + 2 Bolt Craft Beers + reserved seating for live DJ sets.",
    category: "Nightlife & Dining",
    price: 24,
    points_cost: 320,
    image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    merchant_name: "Usain Bolt's Tracks & Records",
    merchant_slug: "tracks-and-records",
    venue_name: "Marketplace Kingston",
    city: "Kingston",
    location: "67 Constant Spring Rd, Kingston",
    discount_value: 8,
  }),
  previewListing({
    listing_id: "blue-mountain-coffee-flight",
    source_id: "blue-mountain-flight",
    name: "Blue Mountain Coffee & High Tea Flight",
    description: "100% Grade 1 Jamaica Blue Mountain Coffee cupping tasting flight with artisan fresh scones at Cafe Blue Irish Town.",
    category: "Beverage & Experiences",
    price: 16,
    points_cost: 220,
    image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
    merchant_name: "Cafe Blue & Strawberry Hill",
    merchant_slug: "cafe-blue",
    venue_name: "Cafe Blue Irish Town",
    city: "Irish Town",
    location: "Irish Town, St. Andrew",
    discount_value: 5,
  }),
  previewListing({
    listing_id: "downtown-artwalk-reggae-pass",
    source_id: "artwalk-reggae-pass",
    name: "Downtown Artwalk & Reggae Heritage Pass",
    description: "Guided street mural walking pass in Downtown Kingston Art District with official audio tour and Bob Marley Museum pass.",
    category: "Arts & Culture",
    price: 28,
    points_cost: 380,
    image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
    merchant_name: "Kingston Creative & Heritage Guild",
    merchant_slug: "kingston-creative",
    venue_name: "Water Lane Art District",
    city: "Kingston",
    location: "Water Lane, Downtown Kingston",
    discount_value: 10,
  }),
];

export const PREVIEW_PARTNER_IDS = new Set(
  KINGSTON_EXPERIENCE_LISTINGS.map((listing) => listing.listing_id).filter(Boolean) as string[],
);
