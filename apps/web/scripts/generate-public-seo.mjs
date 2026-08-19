import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

for (const filename of [".env.production", ".env"]) {
  try {
    const source = await readFile(join(process.cwd(), filename), "utf8");
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch { /* Environment files are optional in Vercel builds. */ }
}

const site = (process.env.VITE_SITE_URL || "https://www.promorang.co").replace(/\/$/, "");
const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const dist = join(process.cwd(), "dist");
const shell = await readFile(join(dist, "index.html"), "utf8");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const escapeXml = escapeHtml;
const slugify = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const absolute = (url) => !url ? `${site}/og-image.png` : url.startsWith("http") ? url : `${site}${url.startsWith("/") ? "" : "/"}${url}`;

async function fetchRows(table, query) {
  if (!supabaseUrl || !supabaseKey) return [];
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  return response.json();
}

function inject(page) {
  const title = `${page.title} | Promorang`;
  const description = (page.description || "Discover real-world Moments, Scenes, places, and local culture on Promorang.").slice(0, 200);
  const image = absolute(page.image);
  const canonical = `${site}${page.path}`;
  const meta = `
    <!-- public-seo:start -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="${page.type === "Event" ? "event" : "website"}">
    <meta property="og:site_name" content="Promorang">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(page.title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <script type="application/ld+json">${JSON.stringify(page.schema).replace(/</g, "\\u003c")}</script>
    <!-- public-seo:end -->`;
  const cleaned = shell
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta name="description"[^>]*>/i, "")
    .replace(/\s*<link rel="canonical"[^>]*>/i, "")
    .replace(/\s*<meta property="og:(?:type|site_name|url|title|description|image|image:alt)"[^>]*>/gi, "")
    .replace(/\s*<meta name="twitter:(?:card|site|title|description|image|image:alt)"[^>]*>/gi, "")
    .replace("</head>", `${meta}\n</head>`);
  const visible = `<main data-public-seo-snapshot><article><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(description)}</p>${page.location ? `<p>${escapeHtml(page.location)}</p>` : ""}<p><a href="${escapeHtml(canonical)}">View on Promorang</a></p></article></main>`;
  return cleaned.replace('<div id="root"></div>', `<div id="root">${visible}</div>`);
}

async function emit(page) {
  const destination = join(dist, page.path.replace(/^\//, ""), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, inject(page));
}

const staticUrls = ["/", "/discover", "/discover/moments", "/discover/venues", "/discover/content", "/scenes", "/brands", "/creators", "/merchants", "/for-communities", "/for-brands", "/for-creators", "/how-it-works", "/campaigns/arla-whip-and-cook", "/proposals/arla-pro"];
const pages = [
  { path: "/discover", title: "Discover what is happening around you", description: "Explore local Moments, Scenes, trusted Discoveries, venues, and creator stories on Promorang.", schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Discover on Promorang", url: `${site}/discover` } },
  { path: "/discover/moments", title: "Discover local Moments", description: "Find upcoming events and real-world experiences on Promorang.", schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Promorang Moments", url: `${site}/discover/moments` } },
  { path: "/discover/venues", title: "Discover local venues", description: "Explore venues and the Moments happening at them on Promorang.", schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Promorang Venues", url: `${site}/discover/venues` } },
  { path: "/discover/content", title: "Discover local stories", description: "Explore creator stories connected to real Moments and places on Promorang.", schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Promorang Stories", url: `${site}/discover/content` } },
  { path: "/scenes", title: "Promorang Scenes — Find your people", description: "Find the people, places, rituals, and Moments that feel like your world.", schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Promorang Scenes", url: `${site}/scenes` } },
  { path: "/campaigns/arla-whip-and-cook", title: "Arla Pro Whip & Cook @ PriceSmart Jamaica — Taste It. Whip It. Cook It.", description: "Experience Arla Pro Whip & Cook 28% live at PriceSmart Jamaica. Taste Rasta Pasta vs Chocolate Chip Mousse, vote in the live Taste-Off, and unlock the 5-Recipe Pack.", schema: { "@context": "https://schema.org", "@type": "WebPage", name: "Arla Pro Whip & Cook PriceSmart Campaign", url: `${site}/campaigns/arla-whip-and-cook` } },
  { path: "/proposals/arla-pro", title: "PROMORANG × ARLA PRO — Commercial Proposal", description: "Commercial proposal for Arla Pro Whip & Cook: Consumer Discovery, Sampling Amplification & Retail Conversion Pilot.", schema: { "@context": "https://schema.org", "@type": "WebPage", name: "Arla Pro Commercial Proposal", url: `${site}/proposals/arla-pro` } },
];

try {
  const [moments, scenes, discoveries, venues] = await Promise.all([
    fetchRows("view_public_moment_directory", "select=*&is_active=eq.true&order=starts_at.asc"),
    fetchRows("scenes", "select=*&visibility=eq.public&status=eq.active&order=updated_at.desc"),
    fetchRows("discoveries", "select=*&verification_status=eq.approved&order=updated_at.desc"),
    fetchRows("view_public_venue_directory", "select=*&order=name.asc"),
  ]);

  for (const moment of moments) {
    const path = `/moments/${moment.slug || moment.id}`;
    const hasValidEnd = moment.ends_at && (!moment.starts_at || new Date(moment.ends_at).getTime() > new Date(moment.starts_at).getTime());
    pages.push({ path, title: moment.seo_title || moment.title, description: moment.seo_description || moment.description, image: moment.image_url, type: "Event", location: [moment.venue_name || moment.location, moment.city, moment.country].filter(Boolean).join(", "), updated: moment.starts_at, schema: { "@context": "https://schema.org", "@type": "Event", name: moment.title, description: moment.description, image: [absolute(moment.image_url)], ...(moment.starts_at ? { startDate: moment.starts_at } : {}), ...(hasValidEnd ? { endDate: moment.ends_at } : {}), eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", location: { "@type": "Place", name: moment.venue_name || moment.location, address: { "@type": "PostalAddress", streetAddress: moment.location, addressLocality: moment.city, addressCountry: moment.country }, ...(moment.latitude != null && moment.longitude != null ? { geo: { "@type": "GeoCoordinates", latitude: moment.latitude, longitude: moment.longitude } } : {}) }, url: `${site}${path}` } });
  }
  for (const scene of scenes) {
    const path = `/scenes/${scene.slug}`;
    pages.push({ path, title: scene.title, description: scene.description, image: scene.image_url, location: [scene.city, scene.country].filter(Boolean).join(", "), updated: scene.updated_at, schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: scene.title, description: scene.description, image: absolute(scene.image_url), spatialCoverage: { "@type": "Place", name: [scene.city, scene.country].filter(Boolean).join(", ") }, url: `${site}${path}` } });
  }
  for (const discovery of discoveries) {
    const path = `/discoveries/${discovery.slug}`;
    pages.push({ path, title: discovery.title, description: discovery.description, image: discovery.cover_image, location: [discovery.location_address, discovery.city, discovery.country].filter(Boolean).join(", "), updated: discovery.updated_at, schema: { "@context": "https://schema.org", "@type": "TouristAttraction", name: discovery.title, description: discovery.description, image: absolute(discovery.cover_image), address: { "@type": "PostalAddress", streetAddress: discovery.location_address, addressLocality: discovery.city, addressCountry: discovery.country }, ...(discovery.latitude != null && discovery.longitude != null ? { geo: { "@type": "GeoCoordinates", latitude: discovery.latitude, longitude: discovery.longitude } } : {}), url: `${site}${path}` } });
  }
  for (const venue of venues) {
    const path = `/venues/${venue.slug || venue.id}`;
    pages.push({ path, title: venue.name, description: venue.description || `Discover ${venue.name} and upcoming Moments on Promorang.`, image: Array.isArray(venue.images) ? venue.images[0] : null, location: [venue.address || venue.location, venue.city, venue.country].filter(Boolean).join(", "), schema: { "@context": "https://schema.org", "@type": "LocalBusiness", name: venue.name, description: venue.description, address: { "@type": "PostalAddress", streetAddress: venue.address || venue.location, addressLocality: venue.city, addressCountry: venue.country }, url: `${site}${path}` } });
  }

  const locations = new Map();
  for (const item of [...moments, ...discoveries, ...venues, ...scenes]) {
    if (!item.country) continue;
    const countrySlug = item.country_slug || slugify(item.country);
    locations.set(`/locations/${countrySlug}`, item.country);
    if (item.city) locations.set(`/locations/${countrySlug}/${item.city_slug || slugify(item.city)}`, `${item.city}, ${item.country}`);
  }
  for (const [path, name] of locations) pages.push({ path, title: `Discover ${name}`, description: `Find Scenes, Moments, trusted Discoveries, venues, and local stories in ${name}.`, location: name, schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: `Discover ${name}`, url: `${site}${path}` } });
} catch (error) {
  console.warn(`[public-seo] Dynamic pages were skipped: ${error.message}`);
}

await Promise.all(pages.map(emit));
const uniqueUrls = [...new Set([...staticUrls, ...pages.map((page) => page.path)])];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueUrls.map((path) => `  <url><loc>${escapeXml(`${site}${path}`)}</loc><changefreq>${path === "/" ? "weekly" : "daily"}</changefreq><priority>${path === "/" ? "1.0" : path.split("/").length > 3 ? "0.7" : "0.8"}</priority></url>`).join("\n")}\n</urlset>\n`;
await writeFile(join(dist, "sitemap.xml"), sitemap);
console.log(`[public-seo] Generated ${pages.length} public snapshots and ${uniqueUrls.length} sitemap URLs.`);
