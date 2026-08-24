import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ConsumerShell from "@/components/consumer/ConsumerShell";
import ConsumerObjectCard from "@/components/consumer/ConsumerObjectCard";
import type { DiscoveryObject, MomentObject, SceneObject } from "@/lib/consumer-canonical";
import { supabase } from "@/integrations/supabase/client";
import { useConsumerHomeLiveData } from "@/hooks/useConsumerHomeLiveData";
import { useConsumerInteractions } from "@/hooks/useConsumerInteractions";

const fallbackMoment: MomentObject = {
  id: "preview-ilhh",
  kind: "moment",
  eyebrow: "Because you like nightlife",
  title: "I Luv Hip Hop",
  subtitle: "Dulce · Barbican. A weekly hip-hop night with enough signal around it to deserve your attention.",
  imageUrl: "/events/sophisticated-flyer.jpg",
  href: "/discover",
  startsAt: "Thu · 9:00 PM",
  venueName: "Dulce Lounge",
  participantCount: 126,
  accessLabel: "Member access available",
};

const formatMomentTime = (value?: string | null) => {
  if (!value) return undefined;
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return undefined;
  }
};

const ConsumerHomePreview = () => {
  const live = useConsumerHomeLiveData();
  const interactions = useConsumerInteractions();
  const { user, profile } = live;

  const liveMoments = useQuery({
    queryKey: ["consumer-home-preview-moments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("id,title,description,image_url,venue_name,location,starts_at,slug,is_active")
        .eq("is_active", true)
        .order("starts_at", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const featuredMoment = useMemo<MomentObject>(() => {
    const now = Date.now();
    const next = (liveMoments.data || []).find((moment) => {
      const startsAt = moment.starts_at ? new Date(moment.starts_at).getTime() : Number.NaN;
      return Number.isFinite(startsAt) && startsAt >= now;
    }) || liveMoments.data?.[0];

    if (!next) return fallbackMoment;

    return {
      id: next.id,
      kind: "moment",
      eyebrow: "Happening next",
      title: next.title,
      subtitle: next.description || [next.venue_name, next.location].filter(Boolean).join(" · ") || "A live Moment surfaced by Promorang.",
      imageUrl: next.image_url || fallbackMoment.imageUrl,
      href: `/moments/${next.slug || next.id}`,
      startsAt: formatMomentTime(next.starts_at),
      venueName: next.venue_name || undefined,
      location: next.location || undefined,
      accessLabel: "Open Moment",
    };
  }, [liveMoments.data]);

  const rawScenes = live.scenes.data || [];
  const sceneObjects = useMemo<SceneObject[]>(() => {
    if (!rawScenes.length) {
      return [
        { id: "scene-kad", kind: "scene", title: "Kingston After Dark", subtitle: "Nightlife, selectors, late food and after-hours culture.", href: "/scenes/kingston-after-dark" },
        { id: "scene-food", kind: "scene", title: "Food & Taste", subtitle: "Places worth trying, tastings and food moments.", href: "/scenes/food-and-taste" },
        { id: "scene-move", kind: "scene", title: "Move Jamaica", subtitle: "Weekend movement, outdoors and worth-the-drive discoveries.", href: "/scenes/move-jamaica" },
      ];
    }
    return rawScenes.map((scene: any) => ({
      id: scene.id,
      kind: "scene" as const,
      title: scene.title,
      subtitle: scene.description || `${scene.city || "Kingston"} culture and activity.`,
      imageUrl: scene.image_url || null,
      href: `/scenes/${scene.slug}`,
      memberCount: Number(scene.member_count || 0),
      signalCount: Number(scene.signal_count || 0),
      trendingCount: Number(scene.trending_count || 0),
    }));
  }, [rawScenes]);

  const discoveryObjects = useMemo<DiscoveryObject[]>(() => {
    return (live.discoveries.data || []).slice(0, 3).map((item: any) => ({
      id: item.id,
      kind: "discovery" as const,
      eyebrow: item.category ? String(item.category).replaceAll("_", " ") : "Discovery",
      title: item.title || item.name || "Worth a closer look",
      subtitle: item.description || item.location_address || item.city || undefined,
      imageUrl: item.cover_image || item.image_url || null,
      href: `/discoveries/${item.slug || item.id}`,
      question: item.title || "Would you explore this?",
      options: [],
      totalSignals: Number(item.checkin_count || item.save_count || 0),
    }));
  }, [live.discoveries.data]);

  const poll = live.polls.data?.[0] as any;
  const pollOptions = (poll?.discovery_options || []).map((option: any) => ({
    id: option.id,
    label: option.option_text,
    votes: Number(option.votes_count || 0),
  }));

  const displayName =
    (profile as any)?.display_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";
  const initial = displayName.charAt(0).toUpperCase();
  const referralStats = live.referralStats.data;
  const referralCode = live.referralCodes.data?.[0]?.code;
  const piecePositions = live.pieces.data?.positions || [];
  const activeKeys = live.activePromoKeys.data || [];

  return (
    <ConsumerShell
      locationLabel="Kingston"
      actions={<div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-xs font-black text-background">{initial}</div>}
    >
      <section className="pb-7 pt-2 md:pb-10 md:pt-6">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Kingston · Live consumer preview</p>
        <h1 className="mt-2 max-w-4xl font-serif text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-7xl">
          {user ? `Welcome back, ${displayName}.` : "Find what is worth moving for."}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Moments, discoveries, Scenes, access, social distribution and cultural proof—surfaced when useful instead of exposed as a wall of mechanics.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,.7fr)] lg:gap-10">
        <div>
          <ConsumerObjectCard item={featuredMoment} emphasis="feature" />
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={featuredMoment.href || "/discover"} className="rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground">Open Moment</a>
            <button
              type="button"
              onClick={() => interactions.shareInvite(referralCode)}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-black hover:border-primary hover:text-primary"
            >
              Invite someone
            </button>
          </div>

          {live.plans.length > 0 && (
            <section className="mt-8 border-y border-border py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your plans</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {live.plans.map((moment: any) => (
                  <a key={moment.id} href={`/moments/${moment.id}`} className="group block border-l-2 border-primary/40 pl-3">
                    <strong className="block text-sm group-hover:text-primary">{moment.title}</strong>
                    <span className="mt-1 block text-xs text-muted-foreground">{formatMomentTime(moment.starts_at)} · {moment.venue_name || moment.location || "Location TBA"}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your Scenes</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.035em] md:text-4xl">Where culture is moving</h2>
              </div>
              <a href="/scenes" className="hidden text-sm font-semibold text-muted-foreground hover:text-primary sm:block">Explore all</a>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {sceneObjects.map((scene, index) => {
                const rawScene = rawScenes[index];
                return (
                  <div key={scene.id}>
                    <ConsumerObjectCard item={scene} />
                    {rawScene && (
                      <button
                        type="button"
                        disabled={interactions.joinScene.isPending}
                        onClick={() => interactions.joinScene.mutate(rawScene)}
                        className="mt-2 w-full rounded-full border border-border bg-card px-3 py-2 text-xs font-black hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        Join Scene
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {discoveryObjects.length > 0 && (
            <section className="mt-12">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Fresh discoveries</p>
                  <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.035em] md:text-4xl">Worth noticing</h2>
                </div>
                <a href="/discover" className="text-sm font-semibold text-muted-foreground hover:text-primary">Open Discover</a>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {discoveryObjects.map((item) => <ConsumerObjectCard key={item.id} item={item} />)}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-7">
          <section className="border-t border-border pt-5 lg:sticky lg:top-24">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Quick signal</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-[-0.035em]">
              {poll?.question || "Would you go to a live dancehall set at Devon House this Friday?"}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{Number(poll?.total_votes || 342).toLocaleString()} people have signaled so far.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(pollOptions.length ? pollOptions : [
                { id: "yes", label: "Yes" },
                { id: "maybe", label: "Maybe" },
                { id: "no", label: "Not for me" },
              ]).map((option: any) => (
                poll?.id ? (
                  <button
                    key={option.id}
                    type="button"
                    disabled={interactions.votePoll.isPending}
                    onClick={() => interactions.votePoll.mutate({ pollId: poll.id, optionId: option.id })}
                    className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:border-primary hover:text-primary disabled:opacity-50"
                  >
                    {option.label}{option.votes ? ` · ${option.votes}` : ""}
                  </button>
                ) : (
                  <a key={option.id} href="/discover?tab=polls" className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:border-primary hover:text-primary">
                    {option.label}
                  </a>
                )
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your value</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div><strong className="text-4xl tracking-[-0.05em]">{live.pointsBalance.toLocaleString()}</strong><p className="mt-1 text-sm text-muted-foreground">PromoPoints</p></div>
              <a href="/rewards" className="rounded-full bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground">Rewards</a>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{activeKeys.length} active access {activeKeys.length === 1 ? "perk" : "perks"}{activeKeys[0] ? ` · ${activeKeys[0].venue_name}` : ""}.</p>
            {activeKeys[0] && (
              <a href="/access" className="mt-3 inline-flex rounded-full border border-primary/30 px-3 py-2 text-xs font-black text-primary">Open access pass →</a>
            )}
          </section>

          <section className="border-t border-border pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Bring your people</p>
            <h3 className="mt-2 text-xl font-black tracking-[-0.03em]">Your network should compound.</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-card p-3"><strong className="block text-xl">{referralStats?.referrals.totalClicks || 0}</strong><span className="text-[10px] text-muted-foreground">Clicks</span></div>
              <div className="bg-card p-3"><strong className="block text-xl">{referralStats?.referrals.totalSignups || 0}</strong><span className="text-[10px] text-muted-foreground">Joined</span></div>
              <div className="bg-card p-3"><strong className="block text-xl">{referralStats?.referrals.totalConversions || 0}</strong><span className="text-[10px] text-muted-foreground">Active</span></div>
            </div>
            <button
              type="button"
              onClick={() => interactions.shareInvite(referralCode)}
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground"
            >
              {referralCode ? `Invite with ${referralCode}` : "Invite friends"}
            </button>
          </section>

          <section className="border-t border-border pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your cultural proof</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div><strong className="text-3xl tracking-[-0.04em]">{piecePositions.length}</strong><p className="text-sm text-muted-foreground">Piece positions</p></div>
              <div className="text-right"><strong className="text-lg">{Number(live.pieces.data?.total_value || 0).toFixed(0)}</strong><p className="text-xs text-muted-foreground">Gems value</p></div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Verified participation can surface here as durable cultural proof instead of as another onboarding concept.</p>
            <a href="/portfolio" className="mt-4 inline-flex text-sm font-black text-primary">Open your Pieces →</a>
          </section>
        </aside>
      </section>
    </ConsumerShell>
  );
};

export default ConsumerHomePreview;
