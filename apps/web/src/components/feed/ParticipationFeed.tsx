import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Gift, MapPin, MessageCircleQuestion, PlayCircle, Rocket, Sparkles } from "lucide-react";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { useNearbyBenefits } from "@/hooks/usePeopleExperience";
import { useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";
import { LivePerkCard } from "@/components/perks/LivePerkCard";

type FeedKind = "moment" | "drop" | "discovery";

type FeedItem = {
  id: string;
  kind: FeedKind;
  title: string;
  copy?: string | null;
  href: string;
  meta?: string | null;
  startsAt?: string | null;
};

const kindLabel: Record<FeedKind, string> = {
  moment: "Moment",
  drop: "Move this",
  discovery: "Discovery",
};

const kindIcon = {
  moment: CalendarDays,
  drop: Rocket,
  discovery: MessageCircleQuestion,
};

export function ParticipationFeed() {
  const moments = useCanonicalMomentFeed();
  const drops = useContentDrops("active");
  const nearby = useNearbyBenefits();
  const discoveries = useListingDiscoveryPolls(4);

  const momentItems: FeedItem[] = (moments.data?.moments || [])
    .filter((moment) => moment.lifecycle !== "recently_ended")
    .slice(0, 4)
    .map((moment) => ({
      id: `moment-${moment.id}`,
      kind: "moment",
      title: moment.title,
      copy: moment.description,
      href: `/moments/${moment.slug || moment.id}`,
      meta: moment.venue_name || moment.location,
      startsAt: moment.starts_at,
    }));

  const dropItems: FeedItem[] = (drops.data || []).slice(0, 4).map((drop) => ({
    id: `drop-${drop.id}`,
    kind: "drop",
    title: drop.title,
    copy: drop.description,
    href: `/content-drops/${drop.id}`,
    meta: drop.objective_type === "share" ? "Share and prove movement" : "Open the move",
    startsAt: drop.starts_at,
  }));

  const discoveryItems: FeedItem[] = (discoveries.data || []).slice(0, 4).map((discovery) => ({
    id: `discovery-${discovery.id}`,
    kind: "discovery",
    title: discovery.question,
    copy: "Your answer becomes a recorded demand signal.",
    href: discovery.detailUrl || (discovery.slug ? `/discover/${discovery.slug}` : "/discover"),
    meta: `${discovery.totalVotes || 0} recorded responses`,
  }));

  const mixed = [...momentItems, ...dropItems, ...discoveryItems].sort((a, b) => {
    if (a.startsAt && b.startsAt) return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    if (a.startsAt) return -1;
    if (b.startsAt) return 1;
    return a.kind.localeCompare(b.kind);
  });

  const isLoading = moments.isLoading || drops.isLoading || nearby.isLoading || discoveries.isLoading;
  const hasError = moments.isError || drops.isError || nearby.isError || discoveries.isError;
  const perks = (nearby.data || []).slice(0, 3);

  return (
    <section aria-labelledby="movement-feed-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="pr-world-kicker">Your movement feed</p>
          <h2 id="movement-feed-title" className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">See it. Move it. Unlock what comes next.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">Moments, content moves, Discoveries and live perks belong in one stream. Every card tells you what it is, what you can do, and what happens next.</p>
        </div>
        <Link to="/discover" className="pr-world-link">Explore everything <ArrowRight className="h-4 w-4" /></Link>
      </div>

      {hasError ? <div className="rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4 text-xs leading-5 text-white/55">Some live sources are unavailable. PROMORANG leaves them empty rather than filling the feed with sample activity.</div> : null}

      {isLoading && !mixed.length && !perks.length ? <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[.03]" /> : null}

      {(mixed.length || perks.length) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {mixed.slice(0, 7).map((item) => {
            const Icon = kindIcon[item.kind];
            return (
              <Link key={item.id} to={item.href} className="group rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:border-[#ff6500]/45 hover:bg-white/[.04] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#ff8a45]"><Icon className="h-4 w-4" />{kindLabel[item.kind]}</span>
                  {item.kind === "drop" ? <span className="rounded-full border border-[#d8ad54]/30 bg-[#d8ad54]/[.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-[#f2c761]">Counts when verified</span> : null}
                </div>
                <h3 className="mt-5 font-serif text-2xl font-bold leading-[1] tracking-[-.035em] text-white transition group-hover:text-[#ff9a62]">{item.title}</h3>
                {item.copy ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/45">{item.copy}</p> : null}
                <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                  <div className="space-y-1 text-[10px] text-white/38">
                    {item.startsAt ? <p className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(item.startsAt).toLocaleString("en-JM", { timeZone: "America/Jamaica", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p> : null}
                    {item.meta ? <p className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{item.meta}</p> : null}
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-black text-[#ff8a45]">{item.kind === "discovery" ? "Answer" : item.kind === "drop" ? "Do the move" : "Open Moment"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            );
          })}

          {perks.map((perk) => <LivePerkCard key={perk.id} perk={perk} />)}
        </div>
      ) : !isLoading ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-8">
          <Sparkles className="h-5 w-5 text-[#ff8a45]" />
          <h3 className="mt-5 font-serif text-2xl font-bold">Nothing live in your feed yet.</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">When a real Moment, content move, Discovery or perk is published, it will appear here. Empty stays honest.</p>
          <Link to="/discover" className="pr-world-link mt-5 inline-flex">Explore PROMORANG <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/content-drops" className="rounded-xl border border-white/10 bg-white/[.025] p-4 transition hover:border-[#ff6500]/40"><PlayCircle className="h-4 w-4 text-[#ff8a45]" /><p className="mt-3 text-sm font-black">Content & Drops</p><p className="mt-1 text-xs leading-5 text-white/40">Help move something worth moving.</p></Link>
        <Link to="/card" className="rounded-xl border border-white/10 bg-white/[.025] p-4 transition hover:border-[#d8ad54]/40"><Gift className="h-4 w-4 text-[#f2c761]" /><p className="mt-3 text-sm font-black">PromoCard</p><p className="mt-1 text-xs leading-5 text-white/40">Keep what you claimed, earned or unlocked.</p></Link>
        <Link to="/earn" className="rounded-xl border border-white/10 bg-white/[.025] p-4 transition hover:border-emerald-300/40"><Rocket className="h-4 w-4 text-emerald-300" /><p className="mt-3 text-sm font-black">Earn</p><p className="mt-1 text-xs leading-5 text-white/40">Open funded work when you qualify.</p></Link>
      </div>
    </section>
  );
}
