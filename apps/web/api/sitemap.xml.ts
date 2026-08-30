import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://promorang.co";

type SitemapUrl = {
  loc: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
  lastmod?: string;
};

type PublicMomentRow = {
  slug: string | null;
  category_slug: string | null;
  city_slug: string | null;
  country_slug: string | null;
  starts_at: string | null;
  is_active: boolean | null;
};

type PublicBrandRow = {
  slug: string | null;
};

type PublicVenueRow = {
  slug: string | null;
  city_slug: string | null;
  country_slug: string | null;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toXml(urls: SitemapUrl[]) {
  const body = urls
    .map((url) => {
      const tags = [
        `<loc>${escapeXml(url.loc)}</loc>`,
        url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : "",
        url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : "",
        url.priority ? `<priority>${url.priority}</priority>` : "",
      ]
        .filter(Boolean)
        .join("");

      return `<url>${tags}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

function addUniqueUrl(target: Map<string, SitemapUrl>, url: SitemapUrl) {
  if (!target.has(url.loc)) {
    target.set(url.loc, url);
  }
}

export default async function handler(_: unknown, res: any) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(500).send(
      toXml([
        {
          loc: `${SITE_URL}/discover`,
          changefreq: "daily",
          priority: "0.9",
        },
      ])
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [momentsResult, brandsResult, venuesResult] = await Promise.all([
    supabase
      .from("view_public_moment_directory")
      .select("slug, category_slug, city_slug, country_slug, starts_at, is_active")
      .eq("is_active", true)
      .limit(5000),
    supabase
      .from("view_public_brand_directory")
      .select("slug")
      .limit(5000),
    supabase
      .from("view_public_venue_directory")
      .select("slug, city_slug, country_slug")
      .limit(5000),
  ]);

  const urls = new Map<string, SitemapUrl>();

  const staticUrls: SitemapUrl[] = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE_URL}/discover`, changefreq: "daily", priority: "0.9" },
    { loc: `${SITE_URL}/promocard`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_URL}/brands`, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_URL}/watch-unlock`, changefreq: "weekly", priority: "0.8" },
  ];

  staticUrls.forEach((entry) => addUniqueUrl(urls, entry));

  const moments = (momentsResult.data || []) as PublicMomentRow[];
  const brands = (brandsResult.data || []) as PublicBrandRow[];
  const venues = (venuesResult.data || []) as PublicVenueRow[];

  for (const moment of moments) {
    if (moment.slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/moments/${moment.slug}`,
        changefreq: "weekly",
        priority: "0.8",
        lastmod: moment.starts_at ? new Date(moment.starts_at).toISOString() : undefined,
      });
    }

    if (moment.category_slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/categories/${moment.category_slug}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }

    if (moment.country_slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/locations/${moment.country_slug}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }

    if (moment.country_slug && moment.city_slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/locations/${moment.country_slug}/${moment.city_slug}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  }

  for (const brand of brands) {
    if (brand.slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/brands/${brand.slug}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  }

  for (const venue of venues) {
    if (venue.slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/venues/${venue.slug}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }

    if (venue.country_slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/locations/${venue.country_slug}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }

    if (venue.country_slug && venue.city_slug) {
      addUniqueUrl(urls, {
        loc: `${SITE_URL}/locations/${venue.country_slug}/${venue.city_slug}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(toXml(Array.from(urls.values())));
}
