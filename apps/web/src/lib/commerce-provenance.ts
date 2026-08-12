export type CommerceProvenanceFields = {
  listing_id?: string | null;
  source_id?: string | null;
  name?: string | null;
  description?: string | null;
  merchant_name?: string | null;
  merchant_slug?: string | null;
  venue_name?: string | null;
  linked_moment_title?: string | null;
  sku?: string | null;
};

export const isSampleCommerceListing = (listing: CommerceProvenanceFields) => {
  const searchable = [
    listing.listing_id,
    listing.source_id,
    listing.name,
    listing.description,
    listing.merchant_name,
    listing.merchant_slug,
    listing.venue_name,
    listing.linked_moment_title,
    listing.sku,
  ].filter(Boolean).join(" ").toLowerCase();

  return /(^|[\s_./@-])(demo|sample|example|mock|test|preview)([\s_./@-]|$)/i.test(searchable);
};

export const commerceCategorySlug = (category?: string | null) =>
  String(category || "uncategorized")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
