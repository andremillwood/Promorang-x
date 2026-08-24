import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ConsumerShell from "@/components/consumer/ConsumerShell";
import ConsumerObjectCard from "@/components/consumer/ConsumerObjectCard";
import type { DiscoveryObject, MomentObject, SceneObject } from "@/lib/consumer-canonical";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const fallbackMoment: MomentObject = {
  id: "preview-ilhh",
  kind: "moment",
  eyebrow: "Tonight · Because you like nightlife",
  title: "I Luv Hip Hop",
  subtitle: "Dulce · Barbican. A weekly hip-hop night with enough signal around it to deserve your attention.",
  imageUrl: "/events/sophisticated-flyer.jpg",
  href: "/discover",
  startsAt: "Thu · 9:00 PM",
  venueName: "Dulce Lounge",
  participantCount: 126,
  accessLabel: "Member access available",
};

const scenes: SceneObject[] = [
  { id: "scene-kad", kind: "scene", title: "Kingston After Dark", subtitle: "Nightlife, selectors, late food and after-hours culture.", href: "/scenes/kingston-after-dark", signalCount: 8, trendingCount: 3 },
  { id: "scene-food", kind: "scene", title: "Food & Taste", subtitle: "Places worth trying, tastings and food moments.", href: "/scenes/food-and-taste", signalCount: 4, trendingCount: 1 },
  { id: "scene-move", kind: "scene", title: "Move Jamaica", subtitle: "Weekend movement, outdoors and worth-the-drive discoveries.", href: "/scenes/move-jamaica", signalCount: 2, trendingCount: 1 },
];

const discovery: DiscoveryObject = {
  id: "preview-poll",
  kind: "discovery",
  eyebrow: "Quick signal",
  title: "Help shape what surfaces next",
  question: "Would you go to a live dancehall set at Devon House this Friday?",
  options: [
    { id: "yes", label: "Yes" },
    { id: "maybe", label: "Maybe" },
    { id: "no", label: "Not for me" },
  ],
  totalSignals: 342,
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
  const { user, profile } = useAuth();
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
    const live = (liveMoments.data || []).find((moment) => {
      const startsAt = moment.starts_at ? new Date(moment.starts_at).getTime() : Number.NaN;
      return Number.isFinite(startsAt) && startsAt >= now;
    }) || liveMoments.data?.[0];

    if (!live) return fallbackMoment;

    return {
      id: live.id,
      kind: "moment",
      eyebrow: "Live from Promorang · Happening next",
      title: live.title,
      subtitle: live.description || [live.venue_name, live.location].filter(Boolean).join(" · ") || "A live Moment currently surfaced by Promorang.",
      imageUrl: live.image_url || fallbackMoment.imageUrl,
      href: `/moments/${live.slug || live.id}`,
      startsAt: formatMomentTime(live.starts_at),
      venueName: live.venue_name || undefined,
      location: live.location || undefined,
      accessLabel: "Open Moment",
    };
  }, [liveMoments.data]);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ConsumerShell
      locationLabel="Kingston"
      actions={<div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-xs font-black text-background">{initial}</div>}
    >
      <section className="pb-7 pt-2 md:pb-10 md:pt-6">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Consumer system preview · Kingston</p>
        <h1 className="mt-2 max-w-4xl font-serif text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-7xl">
          {user ? `Welcome back, ${displayName}.` : "Your Promorang should start with what matters now."}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Personalized discovery, live signals, your Scenes and useful access—without turning the home screen into a map of every mechanic in the system.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,.7fr)] lg:gap-10">
        <div>
          <ConsumerObjectCard item={featuredMoment} emphasis="feature" />
          {liveMoments.isLoading ? <p className="mt-3 text-xs text-muted-foreground">Looking for live Moments…</p> : null}

          <div className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your Scenes</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.035em] md:text-4xl">Where your signals are moving</h2>
              </div>
              <a href="/discover" className="hidden text-sm font-semibold text-muted-foreground hover:text-primary sm:block">Explore all</a>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {scenes.map((scene) => <ConsumerObjectCard key={scene.id} item={scene} />)}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="border-t border-border pt-5 lg:sticky lg:top-24">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{discovery.eyebrow}</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-[-0.035em]">{discovery.question}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{discovery.totalSignals} people have signaled so far.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {discovery.options.map((option) => (
                <button key={option.id} type="button" className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:border-primary hover:text-primary">
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your value</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div><strong className="text-4xl tracking-[-0.05em]">420</strong><p className="mt-1 text-sm text-muted-foreground">PromoPoints</p></div>
              <a href="/rewards" className="rounded-full bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground">See rewards</a>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Preview value state · live reward balances will replace this placeholder in the next pass.</p>
          </section>
        </aside>
      </section>
    </ConsumerShell>
  );
};

export default ConsumerHomePreview;
