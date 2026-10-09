import { currentUiLocale } from "@/i18n/geo-locale";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import type { Scene } from "@promorang/shared";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Clock3, Gift, MapPin, MessageCircleQuestion, Radio, Rocket, Search, Sparkles, Store, Users } from "lucide-react";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { useNearbyBenefits } from "@/hooks/usePeopleExperience";
import { useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";
import { useScenes } from "@/hooks/useScenes";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { FindOrAskEntry } from "@/components/discovery/FindOrAskEntry";
import { livePerkHref } from "@/components/perks/LivePerkCard";
import { supabase } from "@/integrations/supabase/client";
import { trackGrowthEvent } from "@/lib/marketing-attribution";
import { rankParticipantFeed, type ParticipantFeedItem, type ParticipantFeedKind } from "@/lib/participant-feed";

type SceneMembershipRow = { scene_id: string; membership_state: string; scenes: Scene | null };
type MomentSceneLinkRow = { moment_id: string; scene_id: string };
// The generated client types lag these already-migrated market-construction tables.
const marketDb = supabase as any;

const kindLabel: Record<ParticipantFeedKind, string> = {
  moment: "Moment", offer: "Available now", drop: "Content drop", want: "People want this", scene: "Scene", find_or_ask: "Find or ask",
};
const consequenceLabel: Record<ParticipantFeedKind, string> = {
  moment: "What’s happening", offer: "What you can get", drop: "Help move it", want: "Shape what happens next", scene: "Find your people", find_or_ask: "Looking for something else?",
};
const kindIcon = { moment: CalendarDays, offer: Store, drop: Rocket, want: MessageCircleQuestion, scene: Radio, find_or_ask: Search };

function useCardImpression(item: ParticipantFeedItem) {
  const ref = useRef<HTMLAnchorElement>(null);
  const sent = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || sent.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || sent.current) return;
      sent.current = true;
      void trackGrowthEvent({ eventName: "participant_feed_card_impression", journey: "participant", stage: "acquired", entityType: item.kind, entityId: item.id, properties: { source: item.source, score: item.score } });
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [item.id, item.kind, item.score, item.source]);
  return ref;
}

function FeedCard({ item }: { item: ParticipantFeedItem }) {
  const { t: webT } = useWebI18n();
  const ref = useCardImpression(item);
  const Icon = kindIcon[item.kind];
  const hasImage = Boolean(item.imageUrl);
  return (
    <Link
      ref={ref}
      to={item.primaryAction.href}
      data-kind={item.kind}
      onClick={() => void trackGrowthEvent({ eventName: "participant_feed_card_open", journey: "participant", stage: "captured", entityType: item.kind, entityId: item.id, properties: { source: item.source, actionState: item.primaryAction.state, score: item.score } })}
      className={`pr-feed-card group relative isolate flex min-h-[390px] snap-start flex-col overflow-hidden rounded-[1.45rem] border transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a35] focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:min-h-[360px] lg:min-h-[310px] ${item.kind === "want" ? "border-[#ff6a00]/25 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,0,.18),transparent_38%),linear-gradient(145deg,#1a120e,#0d0d0e_72%)] hover:border-[#ff7a35]/65" : item.kind === "offer" ? "border-emerald-300/25 bg-[radial-gradient(circle_at_12%_12%,rgba(110,231,183,.15),transparent_34%),linear-gradient(145deg,#0d1914,#0a0a0b_70%)] hover:border-emerald-300/60" : item.kind === "drop" ? "border-[#d8ad54]/30 bg-[radial-gradient(circle_at_12%_12%,rgba(216,173,84,.18),transparent_34%),linear-gradient(145deg,#1a1510,#0a0a0b_70%)] hover:border-[#e9c568]/65" : item.kind === "moment" && !hasImage ? "border-[#ff6a00]/30 bg-[linear-gradient(135deg,rgba(255,101,0,.12),transparent_48%),repeating-linear-gradient(135deg,rgba(255,255,255,.025)_0,rgba(255,255,255,.025)_1px,transparent_1px,transparent_13px),#101011] hover:border-[#ff7a35]/65" : "border-white/12 bg-[#101011] hover:border-[#ff7a35]/55"}`}
    >
      {hasImage ? <img src={item.imageUrl || ""} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-85" /> : null}
      {hasImage ? <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.35)_38%,rgba(0,0,0,.96)_100%)]" /> : null}
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a45]"><Icon className="h-4 w-4" />{kindLabel[item.kind]}</span>
        {item.kind === "moment" && item.startsAt ? <span className="grid min-w-14 place-items-center rounded-xl border border-white/15 bg-black/55 px-2 py-2 text-center backdrop-blur-md"><strong className="font-['Anton'] text-2xl font-normal leading-none text-white">{new Date(item.startsAt).toLocaleDateString(currentUiLocale(), { day: "2-digit" })}</strong><span className="mt-1 text-[8px] font-black uppercase tracking-[.18em] text-[#ff9a62]">{new Date(item.startsAt).toLocaleDateString(currentUiLocale(), { month: "short" })}</span></span> : null}
        {item.kind === "drop" ? <span className="rounded-full border border-[#d8ad54]/35 bg-black/35 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-[#f2c761]">Verified moves count</span> : null}
        {item.kind === "scene" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-white/85 backdrop-blur"><Users className="h-3 w-3" />{item.primaryAction.state === "joined" ? webT("activity.scene") : webT("publicNav.discover")}</span> : null}
        {item.kind === "offer" ? <span className="rounded-full border border-emerald-300/25 bg-black/35 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-emerald-200">{item.primaryAction.state === "claimed" ? webT("people.claimed") : webT("web.available")}</span> : null}
      </div>
      <div className="mt-auto p-5 pt-12 sm:p-6 sm:pt-16 lg:mt-1 lg:pt-0">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/55">{consequenceLabel[item.kind]}</p>
        <h3 className={`mt-3 max-w-[18ch] font-serif text-[clamp(2rem,8vw,3.1rem)] font-bold leading-[.92] tracking-[-.045em] transition group-hover:text-[#ff9a62] lg:text-[2.35rem] xl:text-[2.65rem] ${item.kind === "drop" ? "text-[#f2c761]" : "text-white"}`}>{item.title}</h3>
        {item.subtitle ? <p className="mt-4 line-clamp-2 max-w-[56ch] text-sm leading-6 text-white/62">{item.subtitle}</p> : null}
        {item.kind === "want" && item.optionPreview?.length ? <div className="mt-5 flex flex-wrap gap-2" aria-label="Answer options">{item.optionPreview.slice(0, 2).map((option) => <span key={option} className="rounded-full border border-white/15 bg-white/[.055] px-3 py-2 text-xs font-semibold text-white/75">{option}</span>)}</div> : null}
        <div className="mt-6 flex min-h-12 items-end justify-between gap-4 border-t border-white/15 pt-4">
          <div className="min-w-0 space-y-1.5 text-[11px] font-medium text-white/58">
            {item.startsAt ? <p className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{new Date(item.startsAt).toLocaleString(currentUiLocale(), { weekday: "short", hour: "numeric", minute: "2-digit" })}</p> : null}
            {item.location ? <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.location}</span></p> : null}
            {item.socialProof ? <p>{item.socialProof}</p> : null}
            {item.availability ? <p className="text-emerald-200/75">{item.availability}</p> : null}
          </div>
          <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#ff6500] px-4 text-xs font-black text-black transition group-hover:bg-[#ff8240]">{item.primaryAction.label}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
        </div>
      </div>
    </Link>
  );
}

function FindOrAskCard({ city }: { city: string }) {
  return <article className="relative overflow-hidden rounded-[1.45rem] border border-dashed border-[#ff6a00]/35 bg-[radial-gradient(circle_at_90%_0%,rgba(255,106,0,.16),transparent_45%),#0d0d0e] p-5 sm:p-7"><Search className="h-5 w-5 text-[#ff8a45]" /><p className="mt-8 text-[10px] font-black uppercase tracking-[.18em] text-white/50">Can’t find it?</p><h3 className="mt-2 max-w-xl font-serif text-3xl font-bold leading-[.95] tracking-[-.04em]">Search first. Ask only if it’s missing.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/50">PROMORANG will show what already exists before turning your search into a Want.</p><FindOrAskEntry source="home" city={city} compact className="mt-6" /></article>;
}

export function ParticipationFeed() {
  const { t: webT } = useWebI18n();
  const { user } = useAuth();
  const { city } = useMarket();
  const moments = useCanonicalMomentFeed();
  const drops = useContentDrops("active");
  const nearby = useNearbyBenefits();
  const discoveries = useListingDiscoveryPolls(5);
  const scenes = useScenes({ city: city.id === "all-jamaica" ? undefined : city.name, limit: 6 });
  const feedImpressionSent = useRef(false);
  const sceneMemberships = useQuery<SceneMembershipRow[]>({ queryKey: ["movement-feed-scene-memberships", user?.id], enabled: Boolean(user?.id), queryFn: async () => { const { data, error } = await marketDb.from("scene_memberships").select("scene_id,membership_state,scenes(*)").eq("user_id", user!.id).eq("membership_state", "active"); if (error) throw error; return (data || []) as SceneMembershipRow[]; } });
  const joinedSceneIds = useMemo(() => (sceneMemberships.data || []).map((membership) => membership.scene_id), [sceneMemberships.data]);
  const momentIds = useMemo(() => (moments.data?.moments || []).map((moment) => moment.id).filter(Boolean), [moments.data?.moments]);
  const sceneMomentLinks = useQuery<MomentSceneLinkRow[]>({ queryKey: ["movement-feed-scene-moment-links", joinedSceneIds, momentIds], enabled: Boolean(joinedSceneIds.length && momentIds.length), queryFn: async () => { const { data, error } = await marketDb.from("moment_scene_links").select("moment_id,scene_id").in("scene_id", joinedSceneIds).in("moment_id", momentIds); if (error) throw error; return (data || []) as MomentSceneLinkRow[]; } });
  const joinedMomentIds = useMemo(() => new Set((sceneMomentLinks.data || []).map((link) => String(link.moment_id))), [sceneMomentLinks.data]);
  const membershipIds = useMemo(() => new Set(joinedSceneIds.map(String)), [joinedSceneIds]);
  const cityNeedle = city.name.toLowerCase();

  const feedItems = useMemo<ParticipantFeedItem[]>(() => {
    const momentItems = (moments.data?.moments || []).filter((moment) => moment.lifecycle !== "recently_ended").slice(0, 6).map((moment) => { const location = moment.venue_name || moment.location || null; const local = !location || location.toLowerCase().includes(cityNeedle); return { id: String(moment.id), kind: "moment" as const, source: "canonical_moment_feed", title: moment.title, subtitle: moment.description, imageUrl: moment.image_url, location, startsAt: moment.starts_at, primaryAction: { label: webT("auth.open"), href: `/moments/${moment.slug || moment.id}`, state: "available" as const }, signals: { local, joinedScene: joinedMomentIds.has(String(moment.id)), startsAt: moment.starts_at, available: true } }; });
    const offerItems = (nearby.data || []).slice(0, 4).map((perk) => { const remaining = perk.availableQuantity ?? perk.remainingQuantity ?? null; const claimed = Boolean(perk.redemption?.code || perk.redemption?.recorded || perk.fulfillmentState === "redeemed"); return { id: String(perk.id), kind: "offer" as const, source: "promocard_nearby", title: perk.title, subtitle: perk.detail || perk.description, location: perk.locationLabel || perk.merchantName || perk.issuer?.name, availability: remaining === null ? null : `${remaining} left`, primaryAction: { label: claimed ? "Open card" : "See offer", href: livePerkHref(perk), state: claimed ? "claimed" as const : "available" as const }, signals: { local: perk.availability !== "anywhere", available: !claimed && (remaining === null || remaining > 0), freshAt: perk.expiresAt } }; });
    const wantItems = (discoveries.data || []).slice(0, 5).map((discovery) => ({ id: String(discovery.id), kind: "want" as const, source: "listing_discovery_poll", title: discovery.question, subtitle: discovery.description || "Add your voice to a real signal.", socialProof: `${discovery.totalVotes || 0} recorded response${discovery.totalVotes === 1 ? "" : "s"}`, optionPreview: (discovery.options || []).map((option) => option.text), primaryAction: { label: discovery.userVotedOptionId ? webT("web.view") : webT("findOrAsk.route.answer"), href: discovery.detailUrl || (discovery.slug ? `/discover/${discovery.slug}` : "/discover"), state: discovery.userVotedOptionId ? "completed" as const : "available" as const }, signals: { local: true, socialProof: discovery.totalVotes || 0, available: !discovery.userVotedOptionId } }));
    const dropItems = (drops.data || []).slice(0, 4).map((drop) => ({ id: String(drop.id), kind: "drop" as const, source: "content_distribution", title: drop.title, subtitle: drop.description, imageUrl: drop.content_distribution_assets?.find((asset) => asset.media_url)?.media_url || null, startsAt: drop.starts_at, primaryAction: { label: webT("auth.open"), href: `/content-drops/${drop.id}`, state: "available" as const }, signals: { startsAt: drop.starts_at, available: true, freshAt: drop.starts_at } }));
    const followedScenes = (sceneMemberships.data || []).flatMap((membership) => membership.scenes?.status === "active" ? [membership.scenes] : []);
    const sceneCandidates = [...new Map([...followedScenes, ...(scenes.data || [])].map((scene) => [scene.id, scene])).values()];
    const sceneItems = sceneCandidates.map((scene) => { const joined = membershipIds.has(String(scene.id)); return { id: String(scene.id), kind: "scene" as const, source: "scenes", title: scene.title, subtitle: scene.metadata?.tagline || scene.description || (joined ? "See what your people are moving." : "Join the people shaping what happens next."), imageUrl: scene.image_url, location: [scene.city, scene.country].filter(Boolean).join(", ") || null, primaryAction: { label: joined ? webT("promorangPresentsPage.enter") : "See Scene", href: `/scenes/${scene.slug}`, state: joined ? "joined" as const : "available" as const }, signals: { local: !scene.city || scene.city.toLowerCase().includes(cityNeedle), joinedScene: joined, freshAt: scene.updated_at } }; });
    return rankParticipantFeed([...momentItems, ...offerItems, ...wantItems, ...dropItems, ...sceneItems], { limit: 11 });
  }, [cityNeedle, discoveries.data, drops.data, joinedMomentIds, membershipIds, moments.data?.moments, nearby.data, scenes.data, sceneMemberships.data, webT]);

  useEffect(() => { if (!feedItems.length || feedImpressionSent.current) return; feedImpressionSent.current = true; void trackGrowthEvent({ eventName: "participant_feed_impression", journey: "participant", stage: "acquired", entityType: "participant_feed", properties: { city: city.name, itemCount: feedItems.length, composition: feedItems.map((item) => item.kind) } }); }, [city.name, feedItems]);

  const isLoading = moments.isLoading || drops.isLoading || nearby.isLoading || discoveries.isLoading || scenes.isLoading || sceneMemberships.isLoading || sceneMomentLinks.isLoading;
  const hasError = moments.isError || drops.isError || nearby.isError || discoveries.isError || scenes.isError || sceneMemberships.isError || sceneMomentLinks.isError;
  return (
    <section aria-labelledby="movement-feed-title" className="pr-mobile-feed space-y-5">
      <div className="sticky top-[4.25rem] z-20 -mx-2 flex items-center justify-between gap-4 border-y border-white/10 bg-[#080808]/90 px-2 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none"><div><p className="pr-world-kicker">Today · {city.name}</p><h2 id="movement-feed-title" className="mt-1 font-serif text-3xl font-bold tracking-[-.04em] sm:text-4xl">Here’s what’s moving.</h2></div><Link to="/discover" className="pr-world-link shrink-0">{webT("publicHome.navExplore")} <ArrowRight className="h-4 w-4" /></Link></div>
      {hasError ? <div className="rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4 text-xs leading-5 text-white/55">Some live sources are unavailable. The feed is showing only real items it could load.</div> : null}
      {isLoading && !feedItems.length ? <div className="grid gap-3"><div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[.03]" /><div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[.02]" /></div> : null}
      {feedItems.length ? <div className="pr-mobile-feed-stream grid items-start gap-4 lg:grid-cols-2">{feedItems.flatMap((item, index) => {
        const card = <div key={`${item.kind}-${item.id}`} className={index === 0 && item.imageUrl ? "lg:col-span-2" : ""}><FeedCard item={item} /></div>;
        return index === 3 ? [card, <FindOrAskCard key="find-or-ask" city={city.name} />] : [card];
      })}{feedItems.length < 4 ? <FindOrAskCard city={city.name} /> : null}</div> : !isLoading ? <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-8"><Sparkles className="h-5 w-5 text-[#ff8a45]" /><h3 className="mt-5 font-serif text-2xl font-bold">Nothing live nearby yet.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-white/45">Search what PROMORANG already knows. If it is still missing, turn the search into a Want.</p><FindOrAskEntry source="home" city={city.name} compact className="mt-6 max-w-xl" /></div> : null}
      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4 text-xs"><Link to="/card" className="pr-world-chip"><Gift className="h-3.5 w-3.5" /> {webT("card.eyebrow")}</Link><Link to="/earn" className="pr-world-chip"><Rocket className="h-3.5 w-3.5" /> {webT("common.earn")}</Link></div>
    </section>
  );
}
