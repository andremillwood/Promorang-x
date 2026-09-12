import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { momentLifecycleLabel } from "@/services/moment-feed";

export function BrandOpportunityRadar() {
  const feed = useCanonicalMomentFeed();
  const [activeCategory, setActiveCategory] = useState("all");
  const readyMoments = useMemo(() => (feed.data?.moments || []).filter((moment) => moment.sponsorship_ready), [feed.data]);
  const opportunities = useMemo(() => readyMoments.filter((moment) => activeCategory === "all" || String(moment.category || "").toLowerCase() === activeCategory), [activeCategory, readyMoments]);
  const categories = useMemo(() => Array.from(new Set(readyMoments.map((moment) => String(moment.category || "")).filter(Boolean))), [readyMoments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-black shadow-lg shadow-primary/20"><Target className="h-7 w-7" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-white">Current moments to activate</h2>
              <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">Live inventory</Badge>
            </div>
            <p className="mt-1 text-xs text-white/60">Real, time-bound moments with a host and location—not speculative recommendations.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
          <p className="text-2xl font-black text-white">{opportunities.length}</p>
          <p className="text-[10px] font-black uppercase tracking-wider text-white/45">Ready to review</p>
        </div>
      </div>

      {categories.length > 1 ? <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory("all")} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${activeCategory === "all" ? "bg-primary text-black" : "border border-white/10 bg-white/5 text-white/70"}`}>All</button>
        {categories.map((category) => <button key={category} onClick={() => setActiveCategory(category.toLowerCase())} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${activeCategory === category.toLowerCase() ? "bg-primary text-black" : "border border-white/10 bg-white/5 text-white/70"}`}>{category}</button>)}
      </div> : null}

      {feed.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />)}</div>
      ) : feed.isError ? (
        <div role="alert" className="rounded-3xl border border-amber-500/25 bg-amber-500/5 p-8 text-center">
          <h3 className="text-lg font-black text-white">Current inventory could not be verified</h3>
          <p className="mt-2 text-sm text-white/55">No sample sponsorship opportunities have been substituted.</p>
          <Button variant="outline" className="mt-5" onClick={() => feed.refetch()}>Try again</Button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-4 text-lg font-black text-white">No activation-ready moments yet</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/55">Moments appear here only after they have a valid upcoming time, location, and accountable host.</p>
          <Button asChild variant="outline" className="mt-5"><Link to="/discover/moments">Review the public calendar</Link></Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {opportunities.map((moment) => (
            <article key={moment.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0e1015] shadow-xl transition-colors hover:border-primary/40">
              <div className="relative h-44 bg-black">
                {moment.image_url ? <img src={moment.image_url} alt={moment.title} className="h-full w-full object-cover opacity-65" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-transparent to-black/20" />
                <Badge className="absolute left-3 top-3 bg-primary text-black hover:bg-primary">{momentLifecycleLabel(moment.lifecycle)}</Badge>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="line-clamp-2 text-lg font-black leading-tight text-white">{moment.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/70"><MapPin className="h-3 w-3 text-primary" />{moment.venue_name || moment.location}</p>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3 text-xs text-white/65">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{new Date(moment.starts_at).toLocaleString("en-JM", { timeZone: "America/Jamaica", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  <span className="flex items-center justify-end gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{moment.participant_count} interested</span>
                </div>
                {moment.associated_brand_names.length > 0 ? <p className="text-xs text-white/50">Already associated: {moment.associated_brand_names.join(", ")}</p> : <p className="text-xs text-emerald-300">No brand association recorded yet</p>}
                <div className="flex gap-2 border-t border-white/5 pt-4">
                  <Button asChild variant="outline" size="sm" className="flex-1"><Link to={`/moments/${moment.slug || moment.id}`}>View</Link></Button>
                  <Button asChild size="sm" className="flex-1 font-bold"><Link to={`/create/campaign?moment=${encodeURIComponent(moment.id)}`}>Build activation <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrandOpportunityRadar;
