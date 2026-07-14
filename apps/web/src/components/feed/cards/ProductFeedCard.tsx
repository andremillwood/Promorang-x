import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, ShoppingBag, Store } from "lucide-react";
import { FeedItem } from "@/services/feed";

export function ProductFeedCard({ item }: { item: FeedItem }) {
  const raw = item.raw || {};
  const price = typeof raw.price === "number" ? new Intl.NumberFormat(undefined, { style: "currency", currency: String(raw.currency || "USD") }).format(raw.price) : "View options";
  return <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#11100f] text-white shadow-2xl md:grid md:grid-cols-[.85fr_1.15fr]">
    <div className="relative min-h-64 overflow-hidden bg-white/5">
      {item.image_url ? <img src={item.image_url} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <ShoppingBag className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-white/20" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-black">In the mix</span>
    </div>
    <div className="flex flex-col justify-between p-6">
      <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-primary"><Store className="h-3.5 w-3.5" /> {item.context.brand_name || "Promorang merchant"}</p><h3 className="mt-4 text-3xl font-black tracking-[-.04em]">{item.title}</h3>{item.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/60">{item.description}</p> : null}</div>
      <div className="mt-7 flex items-end justify-between gap-4"><div><p className="text-2xl font-black">{price}</p>{item.context.location_name ? <p className="mt-1 flex items-center gap-1 text-xs text-white/45"><MapPin className="h-3 w-3" />{item.context.location_name}</p> : null}</div><Link to={item.primary_cta.href || "/shop"} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-black transition hover:bg-primary">Shop <ArrowUpRight className="h-4 w-4" /></Link></div>
    </div>
  </article>;
}
