import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Gift, MapPin, MessageCircleQuestion, Radio, Rocket, Sparkles, Users } from "lucide-react";
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
  const primaryItems = mixed.slice(0, 10);

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
          {primaryItems.map((item) => {
            const Icon = kindIcon[item.kind];
            return (
              <Link key={item.id} to={item.href} className="pr-mobile-feed-card group relative flex min-h-[min(68dvh,560px)] snap-start flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:border-[#ff6500]/45 hover:bg-white/[.04] sm:min-h-0 sm:p-6">{item.kind === "scene" && item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-30" /> : null}<div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#ff8a45]"><Icon className="h-4 w-4" />{kindLabel[item.kind]}</span>
                  {item.kind === "drop" ? <span className="rounded-full border border-[#d8ad54]/30 bg-[#d8ad54]/[.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-[#f2c761]">Counts when verified</span> : null}{item.kind === "scene" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-white/70"><Users className="h-3 w-3" />{item.sceneState === "joined" ? "Your Scene" : "Find your people"}</span> : null}
                </div>
                <p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-white/45">{consequenceLabel[item.kind]}</p><h3 className="mt-2 font-serif text-[clamp(2rem,9vw,2.75rem)] font-bold leading-[.94] tracking-[-.045em] text-white transition group-hover:text-[#ff9a62] sm:mt-3 sm:text-2xl sm:leading-[1]">{item.title}</h3>
                {item.copy ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/45">{item.copy}</p> : null}
                <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                  <div className="space-y-1 text-[10px] text-white/38">
                    {item.startsAt ? <p className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(item.startsAt).toLocaleString("en-JM", { timeZone: "America/Jamaica", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p> : null}
                    {item.meta ? <p className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{item.meta}</p> : null}
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-black text-[#ff8a45]">{item.kind === "discovery" ? "Answer" : item.kind === "drop" ? "Do the move" : item.kind === "scene" ? (item.sceneState === "joined" ? "Open Scene" : "See Scene") : "Open Moment"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
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
