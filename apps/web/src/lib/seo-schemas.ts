/**
 * Programmatic SEO (pSEO) & Structured Data (JSON-LD) Generators for Promorang
 * Conforms to schema.org specifications for Google Events, LocalBusiness, and Offers.
 */

export interface SchemaMoment {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  venue_name?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  image_url?: string | null;
  banner_image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  entry_fee_jmd?: number | null;
  reward?: string | number | null;
  host_name?: string | null;
  city?: string | null;
  country?: string | null;
  slug?: string | null;
}

export interface SchemaMerchant {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  phone?: string | null;
  website_url?: string | null;
}

export interface SchemaOffer {
  id: string;
  title: string;
  description?: string | null;
  discount_value?: string | number | null;
  merchant_name?: string | null;
  valid_until?: string | null;
}

/**
 * Generates schema.org/Event structured JSON-LD for rich Google Search results
 */
export function generateEventSchema(moment: SchemaMoment, siteUrl = "https://www.promorang.co") {
  const imageUrl = moment.banner_image_url || moment.image_url || `${siteUrl}/og-image.png`;
  const locationName = moment.venue_name || moment.location || "Venue Location";
  const hasValidEnd = Boolean(moment.ends_at && (!moment.starts_at || new Date(moment.ends_at).getTime() > new Date(moment.starts_at).getTime()));

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": moment.title,
    "description": moment.description || `Join ${moment.title} on Promorang. Discover rewards, verified participation, and local moments.`,
    "image": [imageUrl],
    ...(moment.starts_at ? { "startDate": moment.starts_at } : {}),
    ...(hasValidEnd ? { "endDate": moment.ends_at } : {}),
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": locationName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": moment.location || locationName,
        ...(moment.city ? { "addressLocality": moment.city } : {}),
        ...(moment.country ? { "addressCountry": moment.country } : {}),
      },
      ...(moment.latitude && moment.longitude ? {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": moment.latitude,
          "longitude": moment.longitude
        }
      } : {})
    },
    "offers": {
      "@type": "Offer",
      "price": moment.entry_fee_jmd || 0,
      "priceCurrency": "JMD",
      "availability": "https://schema.org/InStock",
      "url": `${siteUrl}/moments/${moment.slug || moment.id}`,
      ...(moment.starts_at ? { "validThrough": moment.starts_at } : {})
    },
    "organizer": {
      "@type": "Organization",
      "name": moment.host_name || "Promorang Host",
      "url": siteUrl
    }
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
}

export function generateSceneSchema(scene: any, moments: any[] = [], discoveries: any[] = [], siteUrl = "https://www.promorang.co") {
  const url = `${siteUrl}/scenes/${scene.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#scene`,
        "url": url,
        "name": scene.title,
        "description": scene.description || `Discover the ${scene.title} Scene on Promorang.`,
        ...(scene.image_url ? { "image": scene.image_url } : {}),
        ...(scene.city || scene.country ? { "spatialCoverage": { "@type": "Place", "name": [scene.city, scene.country].filter(Boolean).join(", ") } } : {}),
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": moments.length + discoveries.length,
          "itemListElement": [...moments.map((item) => ({ name: item.title, url: `${siteUrl}/moments/${item.slug || item.id}` })), ...discoveries.map((item) => ({ name: item.title, url: `${siteUrl}/discoveries/${item.slug}` }))].map((item, index) => ({ "@type": "ListItem", "position": index + 1, ...item })),
        },
      },
      generateBreadcrumbSchema([{ name: "Promorang", url: siteUrl }, { name: "Scenes", url: `${siteUrl}/scenes` }, { name: scene.title, url }]),
    ],
  };
}

export function generateDiscoverySchema(discovery: any, siteUrl = "https://www.promorang.co") {
  const url = `${siteUrl}/discoveries/${discovery.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        "@id": `${url}#discovery`,
        "url": url,
        "name": discovery.title,
        "description": discovery.description || `Explore ${discovery.title} on Promorang.`,
        ...(discovery.cover_image ? { "image": discovery.cover_image } : {}),
        "address": {
          "@type": "PostalAddress",
          ...(discovery.location_address ? { "streetAddress": discovery.location_address } : {}),
          ...(discovery.city ? { "addressLocality": discovery.city } : {}),
          ...(discovery.country ? { "addressCountry": discovery.country } : {}),
        },
        ...(discovery.latitude != null && discovery.longitude != null ? { "geo": { "@type": "GeoCoordinates", "latitude": Number(discovery.latitude), "longitude": Number(discovery.longitude) } } : {}),
        ...(discovery.average_rating > 0 ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": discovery.average_rating, "ratingCount": Math.max(1, discovery.checkin_count || 1) } } : {}),
      },
      generateBreadcrumbSchema([{ name: "Promorang", url: siteUrl }, { name: "Discover", url: `${siteUrl}/discover` }, { name: discovery.title, url }]),
    ],
  };
}

export function generateLocationCollectionSchema(pageTitle: string, pageUrl: string, items: Array<{ title: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${pageUrl}#collection`, "url": pageUrl, "name": `Discover ${pageTitle}`, "description": `Scenes, moments, discoveries, venues, and local stories in ${pageTitle}.`, "mainEntity": { "@type": "ItemList", "numberOfItems": items.length, "itemListElement": items.map((item, index) => ({ "@type": "ListItem", "position": index + 1, "name": item.title, "url": item.url })) } },
      generateBreadcrumbSchema([{ name: "Promorang", url: "https://www.promorang.co" }, { name: pageTitle, url: pageUrl }]),
    ],
  };
}

/**
 * Generates schema.org/LocalBusiness structured JSON-LD for local venue SEO
 */
export function generateLocalBusinessSchema(merchant: SchemaMerchant, siteUrl = "https://promorang.co") {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": merchant.name,
    "description": merchant.description || `${merchant.name} partner venue on Promorang.`,
    "image": merchant.image_url || `${siteUrl}/promorang-og.jpg`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": merchant.address || merchant.name,
      "addressLocality": merchant.city || "Kingston",
      "addressCountry": merchant.country || "JM"
    },
    ...(merchant.latitude && merchant.longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": merchant.latitude,
        "longitude": merchant.longitude
      }
    } : {}),
    "url": merchant.website_url || `${siteUrl}/merchants/${merchant.id}`,
    "telephone": merchant.phone || ""
  };
}

/**
 * Generates schema.org/Offer structured JSON-LD for discounts & perks
 */
export function generateOfferSchema(offer: SchemaOffer, siteUrl = "https://promorang.co") {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": offer.title,
    "description": offer.description || `Claim ${offer.title} on Promorang.`,
    "offeredBy": {
      "@type": "Organization",
      "name": offer.merchant_name || "Promorang Partner"
    },
    "url": `${siteUrl}/offers/${offer.id}`,
    "priceCurrency": "JMD",
    "availability": "https://schema.org/InStock"
  };
}
