import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Clock3, Gift, MapPin, MessageCircleQuestion, Radio, Rocket, Sparkles, Users } from "lucide-react";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { useNearbyBenefits } from "@/hooks/usePeopleExperience";
import { useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";
import { LivePerkCard } from "@/components/perks/LivePerkCard";
import { useScenes } from "@/hooks/useScenes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type FeedKind = "moment" | "drop" | "discovery" | "scene";

type FeedItem = {
  id: string;
  kind: FeedKind;
  title: string;
  copy?: string | null;
  href: string;
  meta?: string | null;
  startsAt?: string | null;
  sceneState?: "joined" | "discover";
  imageUrl?: string | null;
  optionPreview?: string[];
};

const kindLabel: Record<FeedKind, string> = {
  moment: "Moment",
  drop: "Move this",
  discovery: "Discovery",
  scene: "Scene",
};

const consequenceLabel: Record<FeedKind, string> = {
  moment: "Show up",
  drop: "Help move it",
  discovery: "Say what you want",
  scene: "Find your people",
};

const kindIcon = {
  moment: CalendarDays,
  drop: Rocket,
  discovery: MessageCircleQuestion,
  scene: Radio,
};

const interleaveFeedItems = (groups: FeedItem[][], limit: number) => {
  const queues = groups.map((group) => [...group]);
  const result: FeedItem[] = [];
  while (result.length < limit && queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      const item = queue.shift();
      if (item) result.push(item);
      if (result.length === limit) break;
    }
  }
  return result;
};

function FeedCard({ item }: { item: FeedItem }) {
  const Icon = kindIcon[item.kind];
  const hasImage = Boolean(item.imageUrl);
  const action = item.kind === "discovery"
    ? "Answer"
    : item.kind === "drop"
      ? "Do the move"
      : item.kind === "scene"
        ? item.sceneState === "joined" ? "Open Scene" : "See Scene"
        : "Open Moment";

  return (
    <Link
      to={item.href}
      data-kind={item.kind}
      className={`pr-feed-card group relative isolate flex min-h-[420px] snap-start flex-col overflow-hidden rounded-[1.6rem] border transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a35] focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:min-h-[360px] ${
        item.kind === "discovery"
          ? "border-[#ff6a00]/25 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,0,.18),transparent_38%),linear-gradient(145deg,#1a120e,#0d0d0e_72%)] hover:border-[#ff7a35]/65"
          : item.kind === "drop"
            ? "border-[#d8ad54]/30 bg-[radial-gradient(circle_at_12%_12%,rgba(216,173,84,.18),transparent_34%),linear-gradient(145deg,#1a1510,#0a0a0b_70%)] hover:border-[#e9c568]/65"
            : item.kind === "moment" && !hasImage
              ? "border-[#ff6a00]/30 bg-[linear-gradient(135deg,rgba(255,101,0,.12),transparent_48%),repeating-linear-gradient(135deg,rgba(255,255,255,.025)_0,rgba(255,255,255,.025)_1px,transparent_1px,transparent_13px),#101011] hover:border-[#ff7a35]/65"
              : "border-white/12 bg-[#101011] hover:border-[#ff7a35]/55"
      }`}
    >
      {hasImage ? <img src={item.imageUrl || ""} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-85" /> : null}
      {hasImage ? <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.35)_38%,rgba(0,0,0,.96)_100%)]" /> : null}

      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a45]"><Icon className="h-4 w-4" />{kindLabel[item.kind]}</span>
        {item.kind === "moment" && item.startsAt ? (
          <span className="grid min-w-14 place-items-center rounded-xl border border-white/15 bg-black/55 px-2 py-2 text-center backdrop-blur-md">
            <strong className="font-['Anton'] text-2xl font-normal leading-none text-white">{new Date(item.startsAt).toLocaleDateString("en-JM", { day: "2-digit", timeZone: "America/Jamaica" })}</strong>
            <span className="mt-1 text-[8px] font-black uppercase tracking-[.18em] text-[#ff9a62]">{new Date(item.startsAt).toLocaleDateString("en-JM", { month: "short", timeZone: "America/Jamaica" })}</span>
          </span>
        ) : null}
        {item.kind === "drop" ? <span className="rounded-full border border-[#d8ad54]/35 bg-black/35 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-[#f2c761]">Counts when verified</span> : null}
        {item.kind === "scene" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-white/85 backdrop-blur"><Users className="h-3 w-3" />{item.sceneState === "joined" ? "Your Scene" : "Find your people"}</span> : null}
      </div>

      <div className="mt-auto p-5 pt-12 sm:p-6 sm:pt-16">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/55">{consequenceLabel[item.kind]}</p>
        <h3 className={`mt-3 max-w-[18ch] font-serif text-[clamp(2rem,5vw,3.1rem)] font-bold leading-[.92] tracking-[-.045em] transition group-hover:text-[#ff9a62] ${item.kind === "drop" ? "text-[#f2c761]" : "text-white"}`}>{item.title}</h3>
        {item.copy ? <p className="mt-4 max-w-[56ch] text-sm leading-6 text-white/62 line-clamp-2">{item.copy}</p> : null}

        {item.kind === "discovery" && item.optionPreview?.length ? (
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Answer options">
            {item.optionPreview.slice(0, 2).map((option) => <span key={option} className="rounded-full border border-white/15 bg-white/[.055] px-3 py-2 text-xs font-semibold text-white/75">{option}</span>)}
          </div>
        ) : null}

        <div className="mt-6 flex min-h-12 items-end justify-between gap-4 border-t border-white/15 pt-4">
          <div className="space-y-1.5 text-[11px] font-medium text-white/58">
            {item.startsAt ? <p className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{new Date(item.startsAt).toLocaleString("en-JM", { timeZone: "America/Jamaica", weekday: "short", hour: "numeric", minute: "2-digit" })}</p> : null}
            {item.meta ? <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{item.meta}</span></p> : null}
          </div>
          <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#ff6500] px-4 text-xs font-black text-black transition group-hover:bg-[#ff8240]">{action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
        </div>
      </div>
    </Link>
  );
}

export function ParticipationFeed() {
  const { user } = useAuth();
  const moments = useCanonicalMomentFeed();
  const drops = useContentDrops("active");
  const nearby = useNearbyBenefits();
  const discoveries = useListingDiscoveryPolls(4);
  const scenes = useScenes({ limit: 6 });
  const sceneMemberships = useQuery({
    queryKey: ["movement-feed-scene-memberships", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("scene_memberships")
        .select("scene_id,membership_state")
        .eq("user_id", user!.id)
        .eq("membership_state", "active");
      if (error) throw error;
      return data || [];
    },
  });
  const joinedSceneIds = (sceneMemberships.data || []).map((membership: any) => membership.scene_id);
  const momentIds = (moments.data?.moments || []).map((moment) => moment.id).filter(Boolean);
  const sceneMomentLinks = useQuery({
    queryKey: ["movement-feed-scene-moment-links", joinedSceneIds, momentIds],
    enabled: Boolean(joinedSceneIds.length && momentIds.length),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("moment_scene_links")
        .select("moment_id,scene_id")
        .in("scene_id", joinedSceneIds)
        .in("moment_id", momentIds);
      if (error) throw error;
      return data || [];
    },
  });
  const joinedMomentIds = new Set((sceneMomentLinks.data || []).map((link: any) => link.moment_id));

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
      imageUrl: moment.image_url,
    }));

  const dropItems: FeedItem[] = (drops.data || []).slice(0, 4).map((drop) => ({
    id: `drop-${drop.id}`,
    kind: "drop",
    title: drop.title,
    copy: drop.description,
    href: `/content-drops/${drop.id}`,
    meta: drop.objective_type === "share" ? "Share and prove movement" : "Open the move",
    startsAt: drop.starts_at,
    imageUrl: drop.content_distribution_assets?.find((asset) => asset.media_url)?.media_url || null,
  }));

  const discoveryItems: FeedItem[] = (discoveries.data || []).slice(0, 4).map((discovery) => ({
    id: `discovery-${discovery.id}`,
    kind: "discovery",
    title: discovery.question,
    copy: "Your answer becomes a recorded demand signal.",
    href: discovery.detailUrl || (discovery.slug ? `/discover/${discovery.slug}` : "/discover"),
    meta: `${discovery.totalVotes || 0} recorded responses`,
    optionPreview: (discovery.options || []).map((option) => option.text),
  }));

  const membershipIds = new Set((sceneMemberships.data || []).map((membership: any) => membership.scene_id));
  const sceneItems: FeedItem[] = (scenes.data || []).slice(0, 4).map((scene) => {
    const joined = membershipIds.has(scene.id);
    return {
      id: `scene-${scene.id}`,
      kind: "scene",
      title: scene.title,
      copy: joined
        ? scene.metadata?.tagline || scene.description || "See what your Scene wants, what is happening, and what you can help move."
        : scene.metadata?.tagline || scene.description || "Join the people shaping what happens next.",
      href: `/scenes/${scene.slug}`,
      meta: joined ? "You are part of this Scene" : [scene.city, scene.country].filter(Boolean).join(", ") || "Find your people",
      sceneState: joined ? "joined" : "discover",
      imageUrl: scene.image_url,
    };
  });

  const relevance = (item: FeedItem) => {
    if (item.kind === "scene" && item.sceneState === "joined") return 0;
    if (item.kind === "moment" && joinedMomentIds.has(item.id.replace("moment-", ""))) return 1;
    if (item.kind === "discovery") return 2;
    if (item.kind === "drop") return 3;
    if (item.kind === "scene") return 4;
    return 5;
  };
  const mixed = [...momentItems, ...dropItems, ...discoveryItems, ...sceneItems].sort((a, b) => {
    const relevanceDelta = relevance(a) - relevance(b);
    if (relevanceDelta) return relevanceDelta;
    if (a.startsAt && b.startsAt) return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    if (a.startsAt) return -1;
    if (b.startsAt) return 1;
    return a.kind.localeCompare(b.kind);
  });

  const isLoading = moments.isLoading || drops.isLoading || nearby.isLoading || discoveries.isLoading || scenes.isLoading || sceneMemberships.isLoading || sceneMomentLinks.isLoading;
  const hasError = moments.isError || drops.isError || nearby.isError || discoveries.isError || scenes.isError || sceneMemberships.isError || sceneMomentLinks.isError;
  const perks = (nearby.data || []).slice(0, 3);
  const primaryItems = interleaveFeedItems([
    momentItems,
    sceneItems.filter((item) => item.sceneState === "joined"),
    discoveryItems,
    dropItems,
    sceneItems.filter((item) => item.sceneState !== "joined"),
  ], 10);

  return (
    <section aria-labelledby="movement-feed-title" className="pr-mobile-feed space-y-5">
      <div className="sticky top-[4.25rem] z-20 -mx-2 flex items-center justify-between gap-4 border-y border-white/10 bg-[#080808]/90 px-2 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div>
          <p className="pr-world-kicker">Today · Your movement feed</p>
          <h2 id="movement-feed-title" className="mt-1 font-serif text-3xl font-bold tracking-[-.04em] sm:text-4xl">What’s moving?</h2>
        </div>
        <Link to="/discover" className="pr-world-link shrink-0">Explore <ArrowRight className="h-4 w-4" /></Link>
      </div>

      {hasError ? <div className="rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4 text-xs leading-5 text-white/55">Some live sources are unavailable. PROMORANG leaves them empty rather than filling the feed with sample activity.</div> : null}

      {isLoading && !mixed.length && !perks.length ? <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[.03]" /> : null}

      {(mixed.length || perks.length) ? (
        <div className="pr-mobile-feed-stream grid gap-4 lg:grid-cols-2">
          {primaryItems.map((item, index) => <div key={item.id} className={index === 0 && item.imageUrl ? "lg:col-span-2" : ""}><FeedCard item={item} /></div>)}

          {perks.map((perk) => <LivePerkCard key={perk.id} perk={perk} />)}
        </div>
      ) : !isLoading ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-8">
          <Sparkles className="h-5 w-5 text-[#ff8a45]" />
          <h3 className="mt-5 font-serif text-2xl font-bold">Nothing live in your feed yet.</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">When a real Scene, Moment, content move, Discovery or perk is available, it will appear here. Empty stays honest.</p>
          <Link to="/discover" className="pr-world-link mt-5 inline-flex">Explore PROMORANG <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4 text-xs">
        <Link to="/card" className="pr-world-chip"><Gift className="h-3.5 w-3.5" /> PromoCard</Link>
        <Link to="/earn" className="pr-world-chip"><Rocket className="h-3.5 w-3.5" /> Earn</Link>
      </div>
    </section>
  );
}
