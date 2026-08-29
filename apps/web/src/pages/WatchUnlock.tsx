import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, Sparkles, ExternalLink, MapPin, Activity, ArrowRight, KeyRound, Coins, ShieldCheck, Clock3 } from "lucide-react";
import { cultureEvents } from "@/data/culture-demo";
import SEO from "@/components/SEO";
import { CAMERA_CONSENT, MISSION_ARCHETYPES, type MissionArchetype } from "@/lib/mission-archetypes";
import { getSafeMediaUrl } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";
import { SwipeRail } from "@/components/ui/SwipeRail";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const pulseTone = {
  dormant: "bg-muted text-muted-foreground",
  forming: "bg-primary/10 text-primary border border-primary/20",
  live: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  cooling: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
} as const;

const formatMissionDate = (value: string, locale?: string) =>
  new Intl.DateTimeFormat(locale || undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

const WatchUnlock = () => {
  const { t, locale } = useI18n();
  const { user, session, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRole = searchParams.get("role") as MissionArchetype | null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["o2o-feed", user?.id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/feed`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load watch and unlock feed");
      }

      return payload?.feed || [];
    },
  });

  const allFeed = data || [];
  const feed = selectedRole ? allFeed.filter((item: any) => item.archetype === selectedRole) : allFeed;
  const points = Number(profile?.points_balance || 0);
  const keys = Number(profile?.keys_balance || 0);
  const pointsPerKey = 500;
  const keyProgress = Math.min((points / pointsPerKey) * 100, 100);
  const openMissions = feed.filter((item: any) => !item.is_sponsored);
  const keyMissions = feed.filter((item: any) => item.is_sponsored);

  return (
    <main className="mx-auto max-w-7xl space-y-6 text-white sm:space-y-8">
      <SEO
        title={selectedRole ? t("watchUnlock.seoRoleTitle", { role: MISSION_ARCHETYPES[selectedRole]?.label || "Role" }) : t("watchUnlock.seoDefaultTitle")}
        description={selectedRole ? (MISSION_ARCHETYPES[selectedRole]?.description || t("watchUnlock.seoRoleDesc")) : t("watchUnlock.seoDefaultDesc")}
        url={`https://promorang.co/missions${selectedRole ? `?role=${selectedRole}` : ""}`}
      />
      <section className="relative min-h-[460px] overflow-hidden rounded-3xl border border-white/10 bg-black">
        <img src={cultureEvents[1]?.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/20" />
        <div className="relative flex min-h-[460px] items-end p-6 sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <PlayCircle className="h-3.5 w-3.5" /> {t("watchUnlock.badge")}
            </div>
            <h1 className="mt-5 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.07em] sm:text-7xl">
              {t("watchUnlock.heroTitle1")}<br /><span className="text-primary">{t("watchUnlock.heroTitle2")}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">{t("watchUnlock.heroCopy")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><a href="#mission-board">{t("watchUnlock.browseMissions")} <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
              <Button asChild variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white">
                <Link to={user ? "/pulse" : "/auth"}>{user ? t("watchUnlock.seeLive") : t("watchUnlock.joinPromorang")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="mission-board" className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("watchUnlock.runwayBadge")}</p>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
              {[
                { icon: Activity, label: t("watchUnlock.runwayDoLabel"), value: t("watchUnlock.runwayDoValue") },
                { icon: Coins, label: t("watchUnlock.runwayBuildLabel"), value: t("watchUnlock.runwayBuildValue") },
                { icon: KeyRound, label: t("watchUnlock.runwayOpenLabel"), value: t("watchUnlock.runwayOpenValue") },
              ].map((step, index) => (
                <div className="contents" key={step.label}>
                  <div className={`rounded-2xl border p-3 sm:p-4 ${index === 2 ? "border-primary/30 bg-primary/10" : "border-white/10 bg-white/[0.04]"}`}>
                    <step.icon className={`h-4 w-4 ${index === 2 ? "text-primary" : "text-white/45"}`} />
                    <p className="mt-4 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{step.label}</p>
                    <p className="mt-1 text-xs font-bold sm:text-sm">{step.value}</p>
                  </div>
                  {index < 2 && <ArrowRight className="h-4 w-4 text-white/20" />}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-white/45">{t("watchUnlock.runwayCopy")}</p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">{t("watchUnlock.readyToUse")}</p>
                <p className="mt-2 flex items-center gap-2 text-4xl font-black"><KeyRound className="h-6 w-6 text-primary" />{user ? keys : "—"}</p>
                <p className="mt-1 text-xs text-white/40">{user ? t("watchUnlock.accessKeys") : t("watchUnlock.signInToSeeKeys")}</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">{t("watchUnlock.earnedAccess")}</div>
            </div>
            {user ? <div className="mt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">{t("watchUnlock.pointsCount", { count: points.toLocaleString() })}</span>
                <span className="text-white/35">{t("watchUnlock.toNextKey", { count: Math.max(pointsPerKey - points, 0).toLocaleString() })}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width: `${keyProgress}%` }} /></div>
            </div> : <Button asChild className="mt-6 w-full"><Link to="/auth">{t("watchUnlock.startOpenMission")} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("watchUnlock.statOpenMissions")}</p>
          <p className="mt-2 text-3xl font-black">{isLoading ? "..." : openMissions.length}</p>
          <p className="mt-1 text-sm text-white/45">{t("watchUnlock.statOpenMissionsCopy")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300/80">{t("watchUnlock.statKeyOpportunities")}</p>
          <p className="mt-2 text-3xl font-black">{isLoading ? "..." : keyMissions.length}</p>
          <p className="mt-1 text-sm text-white/45">{t("watchUnlock.statKeyOpportunitiesCopy")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">{t("watchUnlock.statPromise")}</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/65"><ShieldCheck className="h-4 w-4 text-emerald-400" /> {t("watchUnlock.statPromiseCopy")}</p>
        </div>
      </div>

      <SwipeRail compact fadeFrom="from-black" showDots={false} scrollerClassName="gap-2">
        <button onClick={() => setSearchParams({})} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${!selectedRole ? "border-primary bg-primary text-white" : "border-white/10 bg-white/[0.04] text-white/50"}`}>{t("watchUnlock.allRoles")}</button>
        {Object.entries(MISSION_ARCHETYPES).map(([id, role]) => {
          const RoleIcon = role.icon;
          return <button key={id} onClick={() => setSearchParams({ role: id })} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${selectedRole === id ? role.tone : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white"}`}><RoleIcon className="h-3.5 w-3.5" />{role.label}</button>;
        })}
      </SwipeRail>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-border bg-card p-5">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="mt-4 h-6 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-serif text-2xl font-bold">{selectedRole ? t("watchUnlock.noMissionsRole", { role: MISSION_ARCHETYPES[selectedRole]?.label || "" }) : t("watchUnlock.noMissionsDefault")}</h2>
          <p className="mt-2 text-muted-foreground">
            {selectedRole ? t("watchUnlock.noMissionsRoleCopy") : t("watchUnlock.noMissionsDefaultCopy")}
          </p>
          {selectedRole ? <Button className="mt-5" variant="outline" onClick={() => setSearchParams({})}>{t("watchUnlock.seeAllMissions")}</Button> : null}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {feed.map((item: any) => {
            const pulseClass = pulseTone[(item.moment?.pulse_state as keyof typeof pulseTone) || "dormant"];
            const isKeyMission = Boolean(item.is_sponsored);
            const archetype = MISSION_ARCHETYPES[(item.archetype as MissionArchetype) || "side_quest"];
            const ArchetypeIcon = archetype.icon;

            return (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-soft">
                <div className="relative h-56 overflow-hidden bg-muted">
                  <img
                    src={getSafeMediaUrl(item.content?.media_url) || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800"}
                    alt={item.content?.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge className={`border ${archetype.tone}`}><ArchetypeIcon className="mr-1 h-3 w-3" />{archetype.label}</Badge>
                    <Badge className={isKeyMission ? "border border-amber-300/30 bg-black/70 text-amber-200 backdrop-blur" : "border border-white/15 bg-black/70 text-white backdrop-blur"}>
                      {isKeyMission ? <><KeyRound className="mr-1 h-3 w-3" /> {t("watchUnlock.keyOpportunityBadge")}</> : t("watchUnlock.openMissionBadge")}
                    </Badge>
                    <Badge className="bg-black/60 text-white backdrop-blur">
                      {item.content?.platform || "content"}
                    </Badge>
                    <Badge className={pulseClass}>
                      {item.moment?.pulse_state || "forming"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
                      {item.content?.creator_name}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-bold text-white">
                      {item.content?.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <p className="text-sm leading-6 text-white/50">
                    {item.content?.description}
                  </p>

                  <div className="rounded-2xl border border-primary/20 bg-primary/[0.07] p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">
                        {t("watchUnlock.physicalUnlockBadge")}
                      </p>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      {item.action_text || item.physical_unlock_rules?.summary || t("watchUnlock.physicalUnlockDefault")}
                    </p>
                    {item.camera_consent ? <p className="mt-3 flex items-center gap-2 text-xs text-emerald-200/75"><ShieldCheck className="h-3.5 w-3.5" />{t("watchUnlock.cameraLabel")} {CAMERA_CONSENT[item.camera_consent as keyof typeof CAMERA_CONSENT]}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(item.entry_action_types || []).map((action: string) => (
                        <span key={action} className="rounded-full bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {item.moment?.venue_name || item.moment?.location}
                    </span>
                    <span className="font-medium text-white">
                      {item.moment?.reward || t("watchUnlock.memoryUnlock")}
                    </span>
                    {item.moment?.starts_at && <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-primary" />{formatMissionDate(item.moment.starts_at, locale)}</span>}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{t("watchUnlock.o2oConversion")}</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {Number(item.o2o_conversion_rate || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{t("watchUnlock.threshold")}</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {item.moment?.gathering_threshold || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline" className="sm:flex-1">
                      <a href={item.content?.platform_url || "#"} target="_blank" rel="noreferrer">
                        {t("watchUnlock.watchStory")}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="hero" className="sm:flex-1">
                      <Link to={`/missions/${item.id}`}>
                        {isKeyMission ? t("watchUnlock.viewKeyOpportunity") : t("watchUnlock.openMissionButton")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default WatchUnlock;
