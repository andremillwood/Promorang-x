import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, ExternalLink, MapPin, Share2, UserRound } from "lucide-react";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { WatchMarketObjectButton } from "@/components/market/WatchMarketObjectButton";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useDiscovery } from "@/hooks/useDiscoveries";
import { getSiteUrl } from "@/lib/discovery";
import { generateDiscoverySchema } from "@/lib/seo-schemas";
import { trackGrowthEvent } from "@/lib/marketing-attribution";

function realLocation(discovery: { location_address?: string | null; city?: string | null; country?: string | null }) {
  if (!discovery.location_address && !discovery.city && !discovery.country) return "Location not yet recorded";
  return discoveryLocation(discovery as any);
}

export default function DiscoveryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const query = useDiscovery(slug);\n  const relatedQuery = useDiscoveries({ limit: 12 });

  if (query.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-black text-white"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></main>;
  }

  if (query.isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div className="max-w-lg"><Compass className="mx-auto h-9 w-9 text-primary" /><h1 className="mt-5 font-serif text-4xl font-bold">Discovery unavailable</h1><p className="mt-3 text-sm leading-6 text-white/50">The approved Discovery source could not be loaded. No curated or demo record is being substituted.</p><Link to="/discover" className="mt-6 inline-flex items-center gap-2 font-bold text-primary"><ArrowLeft className="h-4 w-4" />Back to Discover</Link></div>
      </main>
    );
  }

  const discovery = query.data;
  if (!discovery) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div className="max-w-lg"><Compass className="mx-auto h-9 w-9 text-primary" /><h1 className="mt-5 font-serif text-4xl font-bold">No approved Discovery here</h1><p className="mt-3 text-sm leading-6 text-white/50">This URL does not resolve to an approved public Discovery. A submitted or pending proposal is not published as market knowledge.</p><Link to="/discover" className="mt-6 inline-flex items-center gap-2 font-bold text-primary"><ArrowLeft className="h-4 w-4" />Browse approved Discoveries</Link></div>
      </main>
    );
  }

  const metadata = discovery.metadata || {};
  const gallery = Array.isArray(discovery.gallery) ? discovery.gallery.filter(Boolean) : [];
  const images = [discovery.cover_image, ...gallery].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);
  const website = metadata.website_url || null;
  const instagram = metadata.instagram_handle || null;
  const location = realLocation(discovery);
  const discoveryHref = `/discoveries/${discovery.slug}`;\n  const relatedDiscoveries = (relatedQuery.data || []).filter((item) => item.id !== discovery.id && (item.category === discovery.category || item.city === discovery.city || item.scene_id === discovery.scene_id)).slice(0, 4);
  const share = () => {
    void trackGrowthEvent({ eventName: "market_object_shared", journey: "participant", stage: "amplified", entityType: "discovery", entityId: String(discovery.id) });
    return navigator.share?.({ title: discovery.title, text: discovery.description || undefined, url: window.location.href }).catch(() => undefined);
  };

  return (
    <main data-canonical-family="discovery-market" className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={`${discovery.title} — Promorang Discovery`}
        description={discovery.description || `${discovery.title} is an approved Promorang Discovery.`}
        image={discovery.cover_image || undefined}
        url={getSiteUrl(discoveryHref)}
        schema={generateDiscoverySchema(discovery)}
      />

      <section className="marketing-cinematic-hero relative min-h-[660px] overflow-hidden border-b border-white/10 pt-24">\n        <CurrentArc variant="hero" className="marketing-hero-current" />
        {discovery.cover_image ? <img src={discovery.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,.22),transparent_32%),#080808]" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.76)_55%,rgba(0,0,0,.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />
        <div className="container relative flex min-h-[564px] items-end px-6 pb-12">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <Link to="/discover" className="inline-flex items-center gap-2 text-xs font-bold text-white/50 transition hover:text-white"><ArrowLeft className="h-4 w-4" />All Discoveries</Link>
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200"><CheckCircle2 className="h-3.5 w-3.5" />Approved Discovery</span>
                <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">{formatDiscoveryCategory(discovery.category)}</span>
              </div>
              <h1 className="mt-5 max-w-5xl font-serif text-6xl font-bold leading-[.86] tracking-[-.055em] sm:text-8xl lg:text-[7rem]">{discovery.title}</h1>
              <p className="mt-6 flex max-w-2xl items-start gap-2 text-sm leading-6 text-white/55"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{location}</p>
              {discovery.description ? <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">{discovery.description}</p> : null}
            </div>

            <aside className="border-t border-white/20 pt-6 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-primary">Found something?</p>
              <h2 className="mt-3 font-serif text-3xl font-bold">Keep it close.</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Watch this Discovery so PROMORANG can bring you back if something real changes around it.</p>
              <div className="mt-6 grid gap-2">
                <WatchMarketObjectButton
                  type="discovery"
                  id={String(discovery.id)}
                  title={discovery.title}
                  subtitle={location}
                  image={discovery.cover_image || null}
                  href={discoveryHref}
                  metadata={{ category: discovery.category || null, city: discovery.city || null }}
                />
                {discovery.scene ? <Link to={`/scenes/${discovery.scene.slug}`} className="inline-flex min-h-12 items-center justify-between rounded-full bg-primary px-5 text-sm font-black text-black">Open {discovery.scene.title}<ArrowRight className="h-4 w-4" /></Link> : <Link to="/scenes" className="inline-flex min-h-12 items-center justify-between rounded-full bg-primary px-5 text-sm font-black text-black">Explore Scenes<ArrowRight className="h-4 w-4" /></Link>}
                <button type="button" onClick={share} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-bold text-white"><Share2 className="h-4 w-4" />Share Discovery</button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="container px-6 py-12">
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-4">
          {[
            ["01", "Discovery", "Approved local knowledge"],
            ["02", "Interest", discovery.save_count > 0 ? `${discovery.save_count} aggregate signal${discovery.save_count === 1 ? "" : "s"}` : "No recorded aggregate interest"],
            ["03", "Scene", discovery.scene?.title || "No Scene linked yet"],
            ["04", "Action", discovery.checkin_count > 0 ? `${discovery.checkin_count} recorded check-in${discovery.checkin_count === 1 ? "" : "s"}` : "No attendance implied"],
          ].map(([step, title, copy]) => <article key={step} className="bg-black p-5"><p className="text-[10px] font-black text-primary">{step}</p><h3 className="mt-5 font-serif text-xl font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-white/42">{copy}</p></article>)}
        </div>
      </section>

      <section className="container px-6 py-8">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Around this Discovery</p>
            <h2 className="mt-3 font-serif text-4xl font-bold">Go deeper.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/50">Open the real Scene, place or contributor already connected to this Discovery. Missing relationships stay missing rather than being invented.</p>
          </div>
          <div className="space-y-3">
            {discovery.scene ? <Link to={`/scenes/${discovery.scene.slug}`} className="group flex items-center justify-between rounded-[1.6rem] border border-white/10 p-5 transition hover:border-primary/40"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Scene</p><h3 className="mt-2 font-serif text-2xl font-bold">{discovery.scene.title}</h3><p className="mt-1 text-xs text-white/45">Persistent context for related people, places, knowledge and Moments.</p></div><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-primary" /></Link> : <div className="rounded-[1.6rem] border border-dashed border-white/10 p-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Scene</p><h3 className="mt-2 font-serif text-2xl font-bold">Not linked yet</h3><p className="mt-1 text-xs text-white/45">The platform is not inventing a Scene relationship for this record.</p></div>}
            {discovery.venue ? <Link to={`/venues/${discovery.venue.slug || discovery.venue.id}`} className="group flex items-center justify-between rounded-[1.6rem] border border-white/10 p-5 transition hover:border-primary/40"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Around this place</p><h3 className="mt-2 font-serif text-2xl font-bold">{discovery.venue.name}</h3><p className="mt-1 text-xs text-white/45">{discovery.venue.city || "Location held on the linked place record"}</p></div><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-primary" /></Link> : null}
            {discovery.creator_profile ? <Link to={`/creators/${discovery.creator_profile.username || discovery.creator_profile.id}`} className="group flex items-center justify-between rounded-[1.6rem] border border-white/10 p-5 transition hover:border-primary/40"><div className="flex items-center gap-4"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-white/10">{discovery.creator_profile.avatar_url ? <img src={discovery.creator_profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5 text-white/40" />}</div><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">People moving this</p><p className="mt-1 text-sm font-bold text-white">{discovery.creator_profile.display_name || discovery.creator_profile.username || "Community contributor"}</p></div></div><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-primary" /></Link> : null}
          </div>
        </div>
      </section>

      {images.length > 1 ? (
        <section className="container px-6 py-12">
          <div className="mb-6 border-b border-white/10 pb-5"><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Recorded media</p><h2 className="mt-2 font-serif text-3xl font-bold">Images on this Discovery</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map((image) => <div key={image} className="aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-white/10"><img src={image} alt="" className="h-full w-full object-cover" /></div>)}</div>
        </section>
      ) : null}

      {(website || instagram) ? (
        <section className="container px-6 py-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Source links</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {website ? <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/75 hover:text-white">Website <ExternalLink className="h-3.5 w-3.5" /></a> : null}
              {instagram ? <a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/75 hover:text-white">Instagram <ExternalLink className="h-3.5 w-3.5" /></a> : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container px-6 py-14">
        <div className="mb-7 flex items-end justify-between border-b border-white/10 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Keep exploring</p><h2 className="mt-2 font-serif text-4xl font-bold">More worth knowing.</h2></div><Link to="/discover" className="hidden items-center gap-2 text-sm font-bold text-primary sm:flex">All Discoveries<ArrowRight className="h-4 w-4"/></Link></div>
        {relatedDiscoveries.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{relatedDiscoveries.map((item) => <Link key={item.id} to={`/discoveries/${item.slug}`} className="group overflow-hidden border border-white/10 bg-white/[.025]"><div className="aspect-[4/3] overflow-hidden bg-white/[.04]">{item.cover_image ? <img src={item.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Compass className="h-7 w-7 text-white/20"/></div>}</div><div className="p-4"><p className="text-[9px] font-black uppercase tracking-[.14em] text-primary">{formatDiscoveryCategory(item.category)}</p><h3 className="mt-2 font-serif text-xl font-bold leading-tight">{item.title}</h3><p className="mt-2 text-[11px] text-white/42">{realLocation(item)}</p></div></Link>)}</div> : <p className="text-sm text-white/45">No related approved Discoveries are available yet.</p>}
      </section>
      <section className="border-t border-white/10 bg-white/[.02]"><div className="container flex flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">PromoCard</p><h2 className="mt-2 font-serif text-2xl font-bold">Want to remember this?</h2><p className="mt-2 text-xs text-white/42">Watch it now. Come back when something real changes.</p></div><WatchMarketObjectButton type="discovery" id={String(discovery.id)} title={discovery.title} subtitle={location} image={discovery.cover_image || null} href={discoveryHref} metadata={{ category: discovery.category || null, city: discovery.city || null }} /></div></section>
      <MobileBottomNav />
    </main>
  );
}
