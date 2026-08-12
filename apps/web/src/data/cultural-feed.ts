import type { FeedItem } from "@/services/feed";
import type { FeedIntent } from "@/services/feed";
import { cultureCreators, cultureEvents, cultureImages } from "@/data/culture-demo";

const [market, barber, recovery, streetwear] = cultureEvents;

export const culturalFeedFallback: FeedItem[] = [
  {
    id: "feed:moment:market-ritual",
    object_type: "moment",
    entity_id: market.momentId,
    title: market.title,
    subtitle: market.host,
    description: market.description,
    image_url: market.image,
    reason_labels: ["Near you", "Popular in your scene"],
    primary_cta: { label: "See the moment", action: "view", href: `/moments/${market.momentId}` },
    context: {
      starts_at: "2026-08-20T12:00:00Z",
      location_name: market.place,
      participants_count: Number(market.attending),
      reward_label: market.reward,
    },
  },
  {
    id: "feed:content:dj-mac-recap",
    object_type: "content",
    entity_id: "dj-mac-recap",
    title: "The room changed when the riddim dropped.",
    subtitle: cultureCreators[0].name,
    description: "A sixty-second look back at the faces, movement, and moments that made the night worth remembering.",
    image_url: cultureImages.jazzNight,
    reason_labels: ["From a creator you follow", "New story"],
    primary_cta: { label: "Watch the story", action: "view", href: `/creators/${cultureCreators[0].handle}` },
    secondary_cta: { label: "Share", action: "share", href: "/promoshare" },
    context: { host_name: cultureCreators[0].name },
  },
  {
    id: "feed:drop:recovery-proof",
    object_type: "drop",
    entity_id: "recovery-proof",
    title: "Watch. Arrive. Unlock your recovery pass.",
    subtitle: "Creator Fit",
    description: "Complete the coach’s recovery drop, then verify at the sunrise session to keep the memory and class access.",
    image_url: recovery.image,
    reason_labels: ["Proof opportunity", "20% class access"],
    primary_cta: { label: "Start the drop", action: "view", href: "/content-drops" },
    context: { reward_label: recovery.reward, location_name: recovery.place },
  },
  {
    id: "feed:offer:dinner-bundle",
    object_type: "offer",
    entity_id: "dinner-bundle",
    title: "Dinner is handled—and dessert is on them.",
    subtitle: "City Food Collective",
    description: "Pick up the featured bundle in-store and keep a dessert voucher for your next visit.",
    image_url: cultureImages.cookingClass,
    reason_labels: ["Brand-funded", "Expires soon"],
    primary_cta: { label: "See the offer", action: "view", href: `/moments/${market.momentId}` },
    context: { reward_label: "Free dessert", expires_soon: true, brand_name: "City Food Collective" },
  },
  {
    id: "feed:product:founders-rack",
    object_type: "product",
    entity_id: "founders-rack",
    title: "The Founder’s Rack lands this weekend.",
    subtitle: "North Block Supply",
    description: "A limited streetwear capsule with first-access priority for people who show up early.",
    image_url: streetwear.image,
    reason_labels: ["Limited release", "In your scene"],
    primary_cta: { label: "View the capsule", action: "view", href: `/moments/${streetwear.momentId}` },
    context: { brand_name: "North Block Supply", location_name: streetwear.place },
    raw: { price: 85, currency: "USD" },
  },
  {
    id: "feed:piece:market-founders",
    object_type: "piece",
    entity_id: "market-founders",
    title: "Market Rituals — Founder Piece",
    subtitle: "A piece of the movement",
    description: "A limited Piece connected to the people and repeat rituals growing around the market scene.",
    image_url: cultureImages.streetArt,
    reason_labels: ["New Piece", "Scene-backed"],
    primary_cta: { label: "Open the Piece", action: "view", href: "/portfolio" },
    context: {},
    raw: { current_price: 12.5, available_pieces: 48, holder_count: 126, change_24h: 8.4 },
  },
  {
    id: "feed:moment:first-chair",
    object_type: "moment",
    entity_id: barber.momentId,
    title: barber.title,
    subtitle: barber.host,
    description: barber.description,
    image_url: barber.image,
    reason_labels: ["Recommended ritual", "Limited spaces"],
    primary_cta: { label: "Book your chair", action: "view", href: `/moments/${barber.momentId}` },
    context: {
      starts_at: "2026-08-21T09:00:00Z",
      location_name: barber.place,
      participants_count: Number(barber.attending),
    },
  },
];

export const getCulturalFeedFallback = (intent: FeedIntent | null) => {
  if (intent === "nearby") return culturalFeedFallback.filter((item) => ["moment", "product", "content"].includes(item.object_type));
  if (intent === "tonight") return culturalFeedFallback.filter((item) => ["moment", "content"].includes(item.object_type));
  if (intent === "earn") return culturalFeedFallback.filter((item) => ["drop", "offer", "product", "piece"].includes(item.object_type));
  return culturalFeedFallback;
};
