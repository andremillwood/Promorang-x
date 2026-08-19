import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gem,
  Layers3,
  MapPin,
  Play,
  Share2,
  ShoppingBag,
  Sparkles,
  Users,
  Compass,
} from "lucide-react";
import type { FeedItem } from "@/services/feed";
import { cn } from "@/lib/utils";

const typeMeta = {
  moment: { label: "Moment", icon: CalendarDays, accent: "text-primary" },
  discovery: { label: "Discovery", icon: Compass, accent: "text-cyan-300" },
  content: { label: "Creator story", icon: Play, accent: "text-sky-300" },
  drop: { label: "Proof drop", icon: CheckCircle2, accent: "text-emerald-300" },
  offer: { label: "Offer", icon: Gem, accent: "text-amber-300" },
  product: { label: "Shop", icon: ShoppingBag, accent: "text-rose-300" },
  piece: { label: "Piece", icon: Layers3, accent: "text-violet-300" },
} as const;

const formatDate = (value?: string) => {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
};

export function EditorialFeedCard({ item, featured = false, wide = false }: { item: FeedItem; featured?: boolean; wide?: boolean }) {
  const meta = typeMeta[item.object_type];
  const Icon = meta.icon;
  const href = item.primary_cta.href || "/discover";
  const raw = item.raw || {};

  if (item.object_type === "drop") {
    return (
      <article className={cn("group relative isolate flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-emerald-300/15 bg-[#07130e] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/30 sm:p-8", wide && "lg:min-h-[360px]")}>
        {item.image_url ? <img src={item.image_url} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 transition duration-700 group-hover:scale-105" /> : null}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,rgba(4,20,12,.95),rgba(2,8,5,.72)),radial-gradient(circle_at_80%_10%,rgba(52,211,153,.25),transparent_38%)]" />
        <FeedLabel icon={Icon} label={meta.label} accent={meta.accent} />
        <div>
          <p className="mb-5 text-xs font-bold text-emerald-200/60">{item.subtitle}</p>
          <h3 className="max-w-3xl font-serif text-4xl font-semibold leading-[1.02] sm:text-5xl">{item.title}</h3>
          {item.description ? <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">{item.description}</p> : null}
          <ReasonRail labels={item.reason_labels} />
          <Link to={href} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-emerald-300 px-6 text-sm font-black text-emerald-950 transition hover:bg-white">
            {item.primary_cta.label} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    );
  }

  if (item.object_type === "offer") {
    return (
      <article className={cn("group flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-amber-200/15 bg-[radial-gradient(circle_at_90%_0%,rgba(251,191,36,.16),transparent_36%),#141006] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-amber-200/30 sm:p-8", wide && "lg:min-h-[360px]")}>
        <div className="flex items-start justify-between gap-4">
          <FeedLabel icon={Icon} label={meta.label} accent={meta.accent} />
          {item.context.expires_soon ? <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-200/60"><Clock3 className="h-3.5 w-3.5" /> Ending soon</span> : null}
        </div>
        <div>
          {item.context.reward_label ? <p className="font-sans text-5xl font-semibold tracking-[-0.06em] text-amber-200">{item.context.reward_label}</p> : <Gem className="h-14 w-14 text-amber-200" />}
          <h3 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight">{item.title}</h3>
          {item.description ? <p className="mt-3 text-sm leading-6 text-white/55">{item.description}</p> : null}
          <ReasonRail labels={item.reason_labels} />
          <Link to={href} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-amber-200 hover:text-white">{item.primary_cta.label} <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </article>
    );
  }

  if (item.object_type === "piece") {
    return (
      <article className="group relative isolate overflow-hidden rounded-3xl border border-violet-300/15 bg-[#0e0918] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-violet-300/30 sm:p-8 lg:min-h-[360px]">
        {item.image_url ? <img src={item.image_url} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20 mix-blend-luminosity" /> : null}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(139,92,246,.32),transparent_32%),linear-gradient(90deg,#0e0918_10%,rgba(14,9,24,.78))]" />
        <FeedLabel icon={Icon} label={meta.label} accent={meta.accent} />
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h3 className="max-w-2xl font-serif text-4xl font-semibold leading-none sm:text-5xl">{item.title}</h3>
            {item.description ? <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">{item.description}</p> : null}
            <Link to={href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-violet-300 hover:text-white">{item.primary_cta.label} <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10">
            <PieceMetric label="Price" value={`$${Number(raw.current_price || 0).toFixed(2)}`} />
            <PieceMetric label="Available" value={String(raw.available_pieces || 0)} />
            <PieceMetric label="Holders" value={String(raw.holder_count || 0)} />
          </div>
        </div>
      </article>
    );
  }

  const isProduct = item.object_type === "product";

  return (
    <article className={cn("group", featured && "lg:col-span-2")}>
      <Link to={href} className={cn("relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-white/20", featured ? "aspect-[16/8.5] min-h-[420px]" : wide ? "aspect-[16/7] min-h-[340px]" : "aspect-[4/3] min-h-[320px]") }>
        {item.image_url ? <img src={item.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.94)_0%,rgba(0,0,0,.48)_42%,rgba(0,0,0,.08)_76%)]" />
        <div className="absolute left-5 top-5"><FeedLabel icon={Icon} label={meta.label} accent={meta.accent} solid /></div>
        {isProduct && typeof raw.price === "number" ? <span className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-black text-black">${Number(raw.price).toFixed(0)}</span> : null}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          {item.subtitle ? <p className="mb-3 text-xs font-bold text-white/55">{item.subtitle}</p> : null}
          <h3 className={cn("max-w-3xl font-serif font-semibold leading-[1.02]", featured ? "text-4xl sm:text-6xl" : wide ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>{item.title}</h3>
          {featured && item.description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">{item.description}</p> : null}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
            {formatDate(item.context.starts_at) ? <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(item.context.starts_at)}</span> : null}
            {item.context.location_name ? <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{item.context.location_name}</span> : null}
            {item.context.participants_count ? <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{item.context.participants_count} moving</span> : null}
          </div>
          <span className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-black text-white backdrop-blur-md transition group-hover:border-white group-hover:bg-white group-hover:text-black">
            {item.primary_cta.label} <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-5 px-1 pt-4">
        <ReasonRail labels={item.reason_labels} compact />
        <div className="flex shrink-0 items-center gap-4 text-white/35">
          {item.object_type === "content" ? <Link to={item.secondary_cta?.href || "/promoshare"} aria-label="Share this story" className="hover:text-primary"><Share2 className="h-4 w-4" /></Link> : null}
          <Link to="/saved" aria-label="Save this item" className="hover:text-white"><Bookmark className="h-4 w-4" /></Link>
        </div>
      </div>
    </article>
  );
}

function FeedLabel({ icon: Icon, label, accent, solid = false }: { icon: typeof Sparkles; label: string; accent: string; solid?: boolean }) {
  return <span className={cn("inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em]", accent, solid && "rounded-full border border-white/15 bg-black/65 px-3 py-2 text-white backdrop-blur-md")}><Icon className="h-3.5 w-3.5" />{label}</span>;
}

function ReasonRail({ labels, compact = false }: { labels: string[]; compact?: boolean }) {
  if (!labels.length) return null;
  return <div className={cn("flex flex-wrap gap-2", compact ? "mt-0" : "mt-5")}>{labels.map((label) => <span key={label} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/45">{label}</span>)}</div>;
}

function PieceMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-24 bg-black/40 p-4"><p className="font-serif text-xl font-bold">{value}</p><p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/35">{label}</p></div>;
}
