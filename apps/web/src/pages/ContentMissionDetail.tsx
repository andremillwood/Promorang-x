import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, MapPin, ExternalLink, Heart, Share2, MessageSquare, ArrowRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { CAMERA_CONSENT, MISSION_ARCHETYPES, type MissionArchetype } from "@/lib/mission-archetypes";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const pulseTone = {
  dormant: "bg-muted text-muted-foreground",
  forming: "bg-primary/10 text-primary border border-primary/20",
  live: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  cooling: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
} as const;

export default function ContentMissionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const missionQuery = useQuery({
    queryKey: ["o2o-mission", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/missions/${id}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load mission");
      }
      return payload?.mission;
    },
  });

  const metricsQuery = useQuery({
    queryKey: ["content-metrics", missionQuery.data?.content?.id],
    enabled: !!missionQuery.data?.content?.id,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/content/${missionQuery.data.content.id}/metrics`);
      const payload = await response.json();
      return payload?.data || payload || null;
    },
  });

  const engage = useMutation({
    mutationFn: async (eventType: "view" | "like" | "share" | "comment" | "click") => {
      const contentId = missionQuery.data?.content?.id;
      if (!contentId || !session) throw new Error("Mission not ready");

      const response = await fetch(`${API_URL}/api/content/${contentId}/engage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          event_type: eventType,
          metadata: {
            source: "content_mission_detail",
            mission_id: missionQuery.data?.id,
            moment_id: missionQuery.data?.moment?.id,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || `Failed to record ${eventType}`);
      }
      return { eventType, payload };
    },
    onSuccess: ({ eventType }) => {
      queryClient.invalidateQueries({ queryKey: ["content-metrics", missionQuery.data?.content?.id] });
      toast({
        title: "Action recorded",
        description: `Your ${eventType} helped strengthen the mission signal.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const mission = missionQuery.data;
  const metrics = metricsQuery.data;
  const heroImage =
    mission?.content?.banner_image_url ||
    mission?.content?.thumbnail_url ||
    mission?.content?.media_url ||
    mission?.moment?.banner_image_url ||
    mission?.moment?.image_url;
  const galleryImages = Array.isArray(mission?.content?.gallery_images) ? mission.content.gallery_images : [];
  const actionCount = useMemo(() => {
    if (!metrics) return 0;
    return Number(metrics.total_engagement || 0);
  }, [metrics]);
  const archetype = MISSION_ARCHETYPES[(mission?.archetype as MissionArchetype) || "side_quest"];
  const ArchetypeIcon = archetype.icon;

  if (missionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-80 w-full rounded-[2rem]" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </main>
    );
  }

  if (missionQuery.error || !mission) {
    return (
      <main className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {(missionQuery.error as Error)?.message || "Mission not found"}
        </div>
      </main>
    );
  }

  const pulseClass = pulseTone[(mission.moment?.pulse_state as keyof typeof pulseTone) || "dormant"];

  return (
    <main className="mx-auto max-w-6xl space-y-6 text-white sm:space-y-8">
      <SEO
        title={`${mission.content?.title || "Mission"} · ${archetype.label}`}
        description={mission.action_text || mission.content?.description || archetype.description}
        image={heroImage}
        url={`https://promorang.co/missions/${mission.id}`}
        type="article"
      />
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-soft">
        <div className="relative min-h-[560px] overflow-hidden bg-black">
          {heroImage ? (
            <img src={heroImage} alt={mission.content?.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <Badge className={`border ${archetype.tone}`}><ArchetypeIcon className="mr-1 h-3 w-3" />{archetype.label}</Badge>
            <Badge className="bg-black/60 text-white backdrop-blur">
              {mission.content?.platform}
            </Badge>
            <Badge className={pulseClass}>
              {mission.moment?.pulse_state || "forming"}
            </Badge>
          </div>
          <div className="absolute bottom-8 left-6 right-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
              {mission.content?.creator_name}
            </p>
            <h1 className="mt-2 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.86] tracking-[-0.06em] text-white sm:text-7xl">
              {mission.content?.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
              {mission.content?.description}
            </p>
          </div>
        </div>
      </section>

      {galleryImages.length > 0 ? (
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-serif text-2xl font-bold">Mission Gallery</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image: { url: string; alt?: string; caption?: string }, index: number) => (
              <figure key={`${image.url}-${index}`} className="overflow-hidden rounded-2xl border border-border bg-background">
                <img src={image.url} alt={image.alt || image.caption || ""} className="aspect-video w-full object-cover" />
                {image.caption ? <figcaption className="p-3 text-sm text-muted-foreground">{image.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Mission Flow</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { step: "Watch", detail: "Consume the creator story and pick up the unlock signal." },
                { step: "Move", detail: "Travel to the linked venue or moment location." },
                { step: "Verify", detail: "Check in and mint the memory when the task is complete." },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">{item.step}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Physical Unlock Rules</p>
            <p className="mt-3 text-sm font-medium text-foreground">
              {mission.physical_unlock_rules?.summary || "Complete the linked moment to unlock the hybrid mission reward."}
            </p>
            {mission.physical_unlock_rules?.perk_hint && (
              <p className="mt-3 text-sm text-muted-foreground">
                {mission.physical_unlock_rules.perk_hint}
              </p>
            )}
            {mission.camera_consent ? <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3 text-sm text-emerald-200"><Activity className="h-4 w-4" />Camera boundary: {CAMERA_CONSENT[mission.camera_consent as keyof typeof CAMERA_CONSENT]}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {(mission.entry_action_types || []).map((action: string) => (
                <span key={action} className="rounded-full bg-background px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                  {action}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Promorang Engagement</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Strengthen the mission signal</h2>
              </div>
              <span className="text-sm font-semibold text-primary">{actionCount} tracked actions</span>
            </div>
            {user ? <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Button variant="outline" onClick={() => engage.mutate("like")} disabled={engage.isPending}>
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
              <Button variant="outline" onClick={() => engage.mutate("share")} disabled={engage.isPending}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={() => engage.mutate("comment")} disabled={engage.isPending}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Comment Intent
              </Button>
            </div> : (
              <Button asChild variant="hero" className="mt-5 w-full">
                <Link to="/auth">Join to take this mission <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Linked Moment</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">{mission.moment?.title}</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {mission.moment?.venue_name || mission.moment?.location}
              </p>
              <p>
                Reward: <span className="font-semibold text-foreground">{mission.moment?.reward || "Memory unlock"}</span>
              </p>
              <p>
                O2O conversion: <span className="font-semibold text-foreground">{Number(mission.o2o_conversion_rate || 0).toFixed(1)}%</span>
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <Button asChild variant="hero">
                <Link to={`/moments/${mission.moment?.id}?missionId=${mission.id}&contentId=${mission.content?.id}`}>
                  Open Linked Moment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href={mission.content?.platform_url || "#"} target="_blank" rel="noreferrer">
                  Watch on Source Platform
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Why this matters</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This mission is part of the attribution loop. Promorang can measure story engagement, linked moment participation, proof verification, and memory creation inside one system.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
