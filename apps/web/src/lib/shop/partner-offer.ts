import { commerceCategorySlug, isSampleCommerceListing } from "@/lib/commerce-provenance";
import { PREVIEW_PARTNER_IDS, type CommerceListing } from "@/lib/shop/preview-partners";

export type ShopPlaceLens = "all" | "food" | "nights" | "experiences" | "services";

export const SHOP_PLACE_LENSES: ShopPlaceLens[] = ["all", "food", "nights", "experiences", "services"];

export type OfferFunding = "shop" | "brand";

export type PartnerOfferInput = {
  listing_id?: string | null;
  source_id?: string | null;
  price?: number | null;
  currency?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  listing_kind?: string | null;
  category?: string | null;
  name?: string | null;
  description?: string | null;
  sku?: string | null;
  funding?: OfferFunding | null;
  linked_moment_id?: string | null;
};

export const SHOP_RAIL_FEE_RATE = 0.029;
export const BRAND_POT_FEE_RATE = 0.1;
export const DEFAULT_SAVE_RATE = 0.12;
export const DEFAULT_SAVE_MIN = 2;
export const DEFAULT_SAVE_MAX = 8;

export type PartnerOfferTerms = {
  minSpend: number;
  allowance: number;
  applies: number;
  remainder: number;
  currency: string;
  cashPrice: number;
  gemPrice: number;
  memberSave: number;
  funding: OfferFunding;
  potCovers: number;
  platformFee: number;
  shopNets: number;
  merchantGets: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function shopRailFee(gemPrice: number) {
  if (gemPrice <= 0) return 0;
  return roundMoney(Math.max(0.25, gemPrice * SHOP_RAIL_FEE_RATE));
}

export function brandPotFee(memberSave: number) {
  if (memberSave <= 0) return 0;
  return roundMoney(Math.max(0.5, memberSave * BRAND_POT_FEE_RATE));
}

export function offerFundingSource(listing: PartnerOfferInput): OfferFunding {
  if (listing.funding === "brand" || listing.funding === "shop") return listing.funding;
  if (listing.linked_moment_id) return "brand";
  if (listing.listing_kind === "campaign") return "brand";
  if (isPreviewPartnerListing(listing)) {
    const lens = shopPlaceLens(listing);
    if (lens === "nights" || lens === "experiences") return "brand";
  }
  return "shop";
}

export function isPreviewPartnerListing(listing: PartnerOfferInput): boolean {
  const id = listing.listing_id || listing.source_id || "";
  return PREVIEW_PARTNER_IDS.has(id) || listing.sku === "preview-partner" || isSampleCommerceListing(listing);
}

export function shopIndexHref(options?: { from?: string | null; lens?: string | null; category?: string | null }) {
  const params = new URLSearchParams();
  if (options?.from) params.set("from", options.from);
  if (options?.lens && options.lens !== "all") params.set("lens", options.lens);

  const category = options?.category && options.category !== "all" ? options.category : "";
  const base = category ? `/shop/category/${commerceCategorySlug(category)}` : "/shop";
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function shopListingHref(listingId: string, from?: string | null) {
  const path = `/shop/${encodeURIComponent(listingId)}`;
  return from ? `${path}?from=${encodeURIComponent(from)}` : path;
}

export function partnerOfferTerms(
  listing: PartnerOfferInput,
  cardBalance?: number | null,
): PartnerOfferTerms {
  const price = Number(listing.price || 0);
  const currency = listing.currency || "USD";
  const minSpend = price > 0 ? price : 25;
  const discountValue = Number(listing.discount_value || 0);

  let allowance = 0;
  if (discountValue > 0) {
    allowance =
      listing.discount_type === "percentage"
        ? roundMoney(minSpend * (discountValue / 100))
        : discountValue;
  } else if (price > 0) {
    allowance = Math.min(DEFAULT_SAVE_MAX, Math.max(DEFAULT_SAVE_MIN, roundMoney(price * DEFAULT_SAVE_RATE)));
  }

  const applies =
    cardBalance == null ? allowance : Math.min(Math.max(0, Number(cardBalance) || 0), allowance);
  const cashPrice = minSpend;
  const memberSave = allowance;
  const gemPrice = roundMoney(Math.max(0, cashPrice - memberSave));
  const funding = offerFundingSource(listing);
  const potCovers = funding === "brand" ? memberSave : 0;
  const platformFee = funding === "brand" ? brandPotFee(memberSave) : shopRailFee(gemPrice);
  const shopNets = funding === "brand" ? cashPrice : roundMoney(Math.max(0, gemPrice - platformFee));

  return {
    minSpend,
    allowance,
    applies,
    remainder: Math.max(0, roundMoney(minSpend - applies)),
    currency,
    cashPrice,
    gemPrice,
    memberSave,
    funding,
    potCovers,
    platformFee,
    shopNets,
    merchantGets: shopNets,
  };
}

export function shopPlaceLens(listing: PartnerOfferInput): ShopPlaceLens {
  if (listing.listing_kind === "service") return "services";

  const hay = [listing.category, listing.name, listing.description].filter(Boolean).join(" ").toLowerCase();
  if (/(nightlife|night out|vip|dj|lounge|club|party)/.test(hay)) return "nights";
  if (/(food|dining|coffee|taco|pastry|taste|tea|jerk|restaurant|bakery|beverage|ice cream|scone)/.test(hay)) {
    return "food";
  }
  return "experiences";
}

export function listingMatchesShopLens(listing: PartnerOfferInput, lens: string): boolean {
  if (!lens || lens === "all") return true;
  if (SHOP_PLACE_LENSES.includes(lens as ShopPlaceLens)) {
    return shopPlaceLens(listing) === lens;
  }
  return commerceCategorySlug(listing.category) === commerceCategorySlug(lens);
}

export function formatShopMoney(amount: number, currency = "USD", locale = "en") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShopGems(amount: number, locale = "en") {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount)} Gems`;
}

export function resolveShopLens(categoryParam?: string | null, lensParam?: string | null): string {
  const lens = (lensParam || "").toLowerCase();
  if (SHOP_PLACE_LENSES.includes(lens as ShopPlaceLens)) return lens;
  const category = (categoryParam || "").toLowerCase();
  if (SHOP_PLACE_LENSES.includes(category as ShopPlaceLens)) return category;
  return category || "all";
}

export function isPromoCardShopIntent(from?: string | null) {
  return from === "promocard" || from === "card" || from === "wallet";
}

export function shopListingsForSurface(
  realListings: CommerceListing[],
  sampleListings: CommerceListing[],
): { listings: CommerceListing[]; showingPreviews: boolean } {
  if (realListings.length > 0) {
    return { listings: realListings, showingPreviews: false };
  }
  return { listings: sampleListings, showingPreviews: sampleListings.length > 0 };
}
