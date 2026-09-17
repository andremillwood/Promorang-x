import { Link } from "react-router-dom";
import { Bell, Compass, Radio, Sparkles } from "lucide-react";
import { useSavedMarketObjects } from "@/hooks/useSavedMarketObjects";

function hrefFor(item: ReturnType<typeof useSavedMarketObjects>["items"][number]) {
  const metadataHref = typeof item.metadata?.href === "string" ? item.metadata.href : null;
  if (metadataHref) return metadataHref;
  if (item.object_type === "discovery") return `/discoveries/${item.object_id}`;
  if (item.object_type === "moment") return `/moments/${item.object_id}`;
  if (item.object_type === "offer" || item.object_type === "product") return `/shop/${item.object_id}`;
  return "/discover/rewards#wanted";
}

function iconFor(type: string) {
  if (type === "demand") return Radio;
  if (type === "discovery") return Compass;
  return Sparkles;
}

export function PromoCardWatchShelf() {
  const watched = useSavedMarketObjects();
  const relationships = watched.items.filter((item) => ["discovery", "demand", "moment", "offer", "product"].includes(item.object_type));

  return (
    <section className="border-t border-white/10 pt-9">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Watching</p>
          <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em] text-white">What you want to hear about again.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">Watching is a relationship, not an entitlement. It keeps Discoveries, Demand and live market objects visible on your PromoCard while supply and outcomes remain separate states.</p>
        </div>
        <Link to="/discover" className="text-sm font-bold text-primary">Find something to watch →</Link>
      </div>

      {watched.isLoading ? <p className="mt-6 text-sm text-white/35">Loading watched market objects…</p> : relationships.length ? (
        <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {relationships.slice(0, 8).map((item) => {
            const Icon = iconFor(item.object_type);
            return (
              <Link key={item.id} to={hrefFor(item)} className="group grid gap-3 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03]"><Icon className="h-4 w-4 text-primary" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/32">{item.object_type}</p>
                  <p className="mt-1 truncate font-serif text-2xl font-bold text-white transition group-hover:text-primary">{item.title}</p>
                  {item.subtitle ? <p className="mt-1 truncate text-xs text-white/38">{item.subtitle}</p> : null}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-white/35"><Bell className="h-3.5 w-3.5" />Watching</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.4rem] border border-dashed border-white/10 p-6">
          <Bell className="h-5 w-5 text-primary" />
          <p className="mt-3 font-serif text-2xl font-bold text-white">Nothing watched yet.</p>
          <p className="mt-2 text-sm leading-6 text-white/40">Watch an approved Discovery, a Demand signal, a Moment or eligible market object. PROMORANG will keep the relationship here without pretending anything has been supplied to you.</p>
        </div>
      )}
    </section>
  );
}

export default PromoCardWatchShelf;
