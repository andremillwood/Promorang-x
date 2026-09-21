import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Compass, Gift, MapPin, Search, ShoppingBag, Sparkles, Store, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { deslugifySegment, getSiteUrl } from "@/lib/discovery";
import { searchPromorang, type GlobalSearchResult, type GlobalSearchResultType } from "@/lib/global-search";

type CategoryFilter = "all" | GlobalSearchResultType;
const typeMeta: Record<GlobalSearchResultType, { label: string; Icon: typeof Compass; tone: string }> = {
  moment: { label: "Moments", Icon: CalendarDays, tone: "text-orange-300" },
  discovery: { label: "Discoveries", Icon: Compass, tone: "text-amber-300" },
  venue: { label: "Places", Icon: MapPin, tone: "text-cyan-300" },
  offer: { label: "Offers", Icon: Gift, tone: "text-emerald-300" },
  product: { label: "Products", Icon: ShoppingBag, tone: "text-fuchsia-300" },
  brand: { label: "Brands", Icon: Sparkles, tone: "text-blue-300" },
  merchant: { label: "Merchants", Icon: Store, tone: "text-teal-300" },
  host: { label: "Hosts", Icon: Users, tone: "text-rose-300" },
  user: { label: "People", Icon: Users, tone: "text-white/70" },
};

function ObjectCard({ item, featured = false }: { item: GlobalSearchResult; featured?: boolean }) {
  const meta = typeMeta[item.result_type] || typeMeta.discovery;
  const Icon = meta.Icon;
  return <Link to={item.path} className={`group relative flex overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#111113] transition hover:-translate-y-0.5 hover:border-orange-400/45 ${featured ? "min-h-[25rem] items-end" : "min-h-[15rem] flex-col"}`}>
    {item.image_url ? <img src={item.image_url} alt="" className={`object-cover transition duration-700 group-hover:scale-[1.03] ${featured ? "absolute inset-0 h-full w-full" : "h-36 w-full"}`} /> : <div className={`${featured ? "absolute inset-0" : "h-36"} grid place-items-center bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,.17),transparent_45%),#151516]`}><Icon className={`h-8 w-8 ${meta.tone}`} /></div>}
    {featured ? <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" /> : null}
    <div className={`relative z-10 p-5 ${featured ? "max-w-2xl sm:p-7" : "flex flex-1 flex-col"}`}>
      <p className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] ${meta.tone}`}><Icon className="h-3.5 w-3.5" />{meta.label}</p>
      <h2 className={`mt-3 font-serif font-bold leading-[.95] tracking-[-.035em] group-hover:text-orange-200 ${featured ? "text-4xl sm:text-5xl" : "text-2xl"}`}>{item.title}</h2>
      {item.subtitle ? <p className="mt-3 text-xs font-bold text-white/50">{item.subtitle}</p> : null}
      {item.description ? <p className={`mt-3 text-sm leading-6 text-white/55 ${featured ? "max-w-xl line-clamp-3" : "line-clamp-2"}`}>{item.description}</p> : null}
      {!featured ? <span className="mt-auto flex items-center gap-2 pt-5 text-xs font-black text-orange-300">Open {meta.label.replace(/s$/, "")} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span> : null}
    </div>
  </Link>;
}

export default function CategoryArchive() {
  const { categorySlug = "" } = useParams<{ categorySlug: string }>();
  const categoryLabel = deslugifySegment(categorySlug);
  const [activeType, setActiveType] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const catalogue = useQuery({ queryKey: ["canonical-category-archive", categorySlug], queryFn: () => searchPromorang(categoryLabel), enabled: Boolean(categorySlug) });
  const counts = useMemo(() => (catalogue.data || []).reduce<Record<string, number>>((acc, item) => { acc[item.result_type] = (acc[item.result_type] || 0) + 1; return acc; }, {}), [catalogue.data]);
  const visible = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return (catalogue.data || []).filter((item) => (activeType === "all" || item.result_type === activeType) && (!tokens.length || tokens.every((token) => `${item.title} ${item.subtitle} ${item.description}`.toLowerCase().includes(token))));
  }, [activeType, catalogue.data, query]);
  const filters = (["moment", "discovery", "venue", "offer", "product", "brand", "merchant", "host", "user"] as GlobalSearchResultType[]).filter((type) => counts[type]);

  return <main className="min-h-screen bg-[#080809] text-white selection:bg-orange-500 selection:text-black">
    <SEO title={`${categoryLabel} — Explore PROMORANG`} description={`Explore ${categoryLabel.toLowerCase()} Moments, places, products, offers and people on PROMORANG.`} url={getSiteUrl(`/categories/${categorySlug}`)} schema={{ "@context": "https://schema.org", "@type": "CollectionPage", name: `${categoryLabel} on PROMORANG` }} />
    <header className="relative overflow-hidden border-b border-white/10 px-5 pb-10 pt-14 sm:px-7 sm:pb-14 lg:px-10"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,106,0,.22),transparent_36%),radial-gradient(circle_at_90%_25%,rgba(76,198,240,.1),transparent_28%)]" /><div className="relative mx-auto max-w-[1440px]"><p className="text-[10px] font-black uppercase tracking-[.22em] text-orange-400">PROMORANG · Category current</p><h1 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[6.4rem]">{categoryLabel}.<br /><span className="text-white/38">Across the whole world.</span></h1><p className="mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">Moments, places, products, offers and people connected by one interest—not separated into disconnected directories.</p></div></header>
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#080809]/95 px-5 py-3 backdrop-blur-xl sm:px-7 lg:px-10"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center"><label className="relative min-w-0 flex-1 lg:max-w-sm"><span className="sr-only">Search within {categoryLabel}</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search within ${categoryLabel}`} className="h-11 w-full rounded-full border border-white/10 bg-white/[.04] pl-11 pr-4 text-sm outline-none focus:border-orange-400/60" /></label><nav aria-label="Object type" className="flex gap-2 overflow-x-auto [scrollbar-width:none]"><button onClick={() => setActiveType("all")} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold ${activeType === "all" ? "border-[#eadcc6] bg-[#eadcc6] text-black" : "border-white/10 text-white/55"}`}>All <span className="ml-1 opacity-55">{catalogue.data?.length || 0}</span></button>{filters.map((type) => { const meta = typeMeta[type]; return <button key={type} onClick={() => setActiveType(type)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold ${activeType === type ? "border-orange-400 bg-orange-400/12 text-orange-200" : "border-white/10 text-white/55"}`}>{meta.label} <span className="ml-1 opacity-55">{counts[type]}</span></button>; })}</nav></div></div>
    <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-7 sm:py-12 lg:px-10">{catalogue.isLoading ? <div className="grid gap-5 lg:grid-cols-3"><div className="h-[25rem] animate-pulse rounded-[1.7rem] bg-white/[.04] lg:col-span-2" /><div className="h-[25rem] animate-pulse rounded-[1.7rem] bg-white/[.04]" /></div> : visible.length ? <><div aria-live="polite" className="mb-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">{visible.length} things found</p><h2 className="mt-2 font-serif text-3xl font-bold">Worth entering from here.</h2></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><div className="md:col-span-2"><ObjectCard item={visible[0]} featured /></div>{visible.slice(1).map((item) => <ObjectCard key={`${item.result_type}-${item.id}`} item={item} />)}</div></> : <div className="rounded-[1.7rem] border border-dashed border-white/15 px-6 py-16 text-center"><Compass className="mx-auto h-8 w-8 text-orange-400" /><h2 className="mt-4 font-serif text-3xl font-bold">Nothing fits this view yet.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">Try all object types, clear the search, or explore the broader Discover world.</p><Link to="/discover" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#eadcc6] px-5 text-sm font-black text-black">Open Discover <ArrowRight className="h-4 w-4" /></Link></div>}</section>
  </main>;
}
