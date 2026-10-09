import { useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Compass, Heart, MapPin, Share2, Sparkles, Users } from "lucide-react";
import {
  getSceneHumanState,
  hrefForSceneMoment,
  sceneLocation,
} from "@promorang/shared";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { useScene } from "@/hooks/useScenes";
import { useJoinScene } from "@/hooks/useScenes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { getSiteUrl } from "@/lib/discovery";
import { generateSceneSchema } from "@/lib/seo-schemas";
import { useI18n } from "@/i18n/I18nContext";
import { SceneWantSupport } from "@/components/people/SceneWantSupport";
import { SceneContributionLinks } from "@/components/people/SceneContributionLinks";
import { shareSceneLink } from "@/lib/scene-share";
import { trackGrowthEvent } from "@/lib/marketing-attribution";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function CommunityDetail() {
  const { t, formatDate, formatNumber } = useI18n();
  const { slug } = useParams();
  const [params] = useSearchParams();
  const wantId = params.get("want") || undefined;
  const query = useScene(slug, wantId);
  const { invite } = useExperienceActions();
  const { user } = useAuth();
  const { toast } = useToast();
  const joinScene = useJoinScene(query.data?.scene);
  const viewed = useRef<string>();
  const focusedWant = useRef<string>();
  useEffect(() => {
    if (!wantId || focusedWant.current === wantId || !query.data) return;
    const element = document.getElementById(`want-${wantId}`);
    if (element) {
      focusedWant.current = wantId;
      element.focus({ preventScroll: true });
      element.scrollIntoView({ block: "center" });
    }
  }, [wantId, query.data]);
  useEffect(() => {
    if (!query.data?.scene.id || viewed.current === query.data.scene.id) return;
    viewed.current = query.data.scene.id;
    void trackGrowthEvent({ eventName: "page_view", properties: { action: "scene_viewed" }, journey: "participant", stage: "acquired", entityType: "scene", entityId: query.data.scene.id });
  }, [query.data?.scene.id]);
  if (query.isLoading) return <main className="grid min-h-screen place-items-center bg-black text-white"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></main>;
  if (!query.data) return <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white"><div><Heart className="mx-auto h-9 w-9 text-primary"/><h1 className="mt-5 font-serif text-4xl font-bold">{t("sceneDetail.unavailable")}</h1><Link to="/scenes" className="mt-6 inline-flex items-center gap-2 text-primary"><ArrowLeft className="h-4 w-4"/>{t("sceneDetail.browse")}</Link></div></main>;
  const { scene, membership, discoveries, demand, demandResponses, offers, places, people } = query.data;
  const moments = query.data.moments;
  const state = getSceneHumanState(scene, membership);
  const metadata = scene.metadata || {};
  const share = async () => {
    let url = window.location.href;
    if (user) {
      try {
        const result = await invite.mutateAsync(scene.slug);
        url = result.shareUrl || url;
      } catch {
        // Sharing remains available without claiming attribution if invite creation is unavailable.
      }
    }
    try {
      const result = await shareSceneLink(scene.title, url, metadata.tagline || scene.description || undefined);
      if (result === "cancelled") return;
      if (result === "copied") toast({ title: t("launch.copied") });
      void trackGrowthEvent({ eventName: "cta_clicked", journey: "participant", stage: "amplified", entityType: "scene", entityId: scene.id, properties: { action: "scene_shared", method: result } });
    } catch { toast({ title: t("launch.shareError"), variant: "destructive" }); }
  };
  const handleJoin = async () => {
    if (!user) { window.location.assign(`/auth?next=${encodeURIComponent(`/scenes/${scene.slug}`)}`); return; }
    try {
      await joinScene.mutateAsync();
      void trackGrowthEvent({ eventName: "cta_clicked", properties: { action: "scene_followed" }, journey: "participant", stage: "activated", entityType: "scene", entityId: scene.id });
      toast({ title: t("launch.followed", { scene: scene.title }), description: t("launch.consequence") });
    }
    catch (error) { toast({ title: t("sceneDetail.joinError"), description: (error as Error).message, variant: "destructive" }); }
  };
  return (
    <main className="marketing-cinematic public-object-page min-h-screen bg-black pb-24 text-white">
      <SEO title={`${scene.title} — ${t("sceneDetail.seoSuffix")}`} description={scene.metadata?.tagline || scene.description || state.body} image={scene.image_url || undefined} url={getSiteUrl(`/scenes/${scene.slug}`)} schema={generateSceneSchema(scene, moments, discoveries)} />
      <section className="public-object-hero relative min-h-[640px] overflow-hidden border-b border-white/10 pt-24">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        {scene.image_url ? <img src={scene.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.76)_52%,rgba(0,0,0,.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        <div className="container relative flex min-h-[544px] items-end px-6 pb-12">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div><Link to="/scenes" className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4"/>{t("sceneDetail.all")}</Link><p className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.28em] text-primary"><MapPin className="h-3.5 w-3.5"/>{sceneLocation(scene)}</p>{metadata.season_title ? <p className="mt-3 text-[10px] font-black uppercase tracking-[.28em] text-white/55">{metadata.season_title}{metadata.test_area ? ` · ${metadata.test_area}` : ""}</p> : null}{metadata.season_line ? <p className="mt-2 max-w-xl text-sm text-white/55">{metadata.season_line}</p> : null}<h1 className="mt-5 max-w-4xl font-serif text-[clamp(2.5rem,12vw,3.75rem)] break-words font-bold leading-[.96] tracking-[-.055em] sm:text-8xl lg:text-[7rem]">{scene.title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">{metadata.tagline || scene.description}</p><div className="mt-6 flex flex-wrap gap-2">{(metadata.vibe || []).map((vibe) => <span key={vibe} className="border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/70 backdrop-blur">{vibe}</span>)}</div></div>
            <aside className="border-t border-white/20 pt-6"><p className="text-sm font-bold text-primary">{t("launch.stay")}</p><p className="mt-3 text-sm leading-6 text-white/70">{t("launch.consequence")}</p><div className="mt-6 flex gap-2">
              <button type="button" disabled={joinScene.isPending || membership?.membership_state === "active"} onClick={handleJoin} className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center bg-primary px-4 py-3 text-sm font-bold text-black disabled:opacity-70">{membership?.membership_state === "active" ? t("launch.following") : joinScene.isPending ? t("sceneDetail.joining") : t("launch.follow")}</button>
              <button type="button" aria-label={t("sceneDetail.share")} onClick={share} className="grid h-12 w-12 shrink-0 place-items-center border border-white/20"><Share2 className="h-4 w-4"/></button>
            </div>{membership?.membership_state === "active" ? <Link to="/today" className="mt-3 inline-flex min-h-11 items-center text-sm text-primary">{t("launch.today")} <ArrowRight className="ml-2 h-4 w-4" /></Link> : null}</aside>
          </div>
        </div>
      </section>

      <nav className="public-object-tabs border-b border-white/10 bg-black/92 px-6"><div className="container flex gap-7 whitespace-nowrap overflow-x-auto py-4 text-[10px] font-black uppercase tracking-[.12em] text-white/48"><a href="#scene-about" className="text-primary">{t("launch.about")}</a>{moments.length ? <a href="#scene-moments">{t("launch.moments")}</a> : null}{demand.length ? <a href="#scene-demand">{t("launch.wants")}</a> : null}{discoveries.length ? <a href="#scene-discoveries">{t("launch.knowledge")}</a> : null}{places.length || people.length ? <a href="#scene-around">{t("launch.around")}</a> : null}<a href="#scene-join">{t("launch.follow")}</a></div></nav>
      {query.data.hasContentError ? <div role="alert" className="container px-6 py-6"><p>{t("launch.loadError")}</p><button type="button" onClick={() => void query.refetch()} className="mt-3 min-h-12 border border-white/20 px-5">{t("common.tryAgain")}</button></div> : null}
      <section id="scene-about" className="container px-6 py-10">
        {scene.description && metadata.tagline ? <p className="max-w-3xl text-base leading-7 text-white/70">{scene.description}</p> : null}
        {metadata.audience ? <p className="mt-4 text-sm text-white/65">{t("launch.audience")} {metadata.audience}</p> : null}
        {!query.data.hasContentError && !moments.length && !discoveries.length && !demand.length && !offers.length ? <p className="mt-4 text-white/65">{t("launch.empty")}</p> : null}
        <h2 className="mt-8 font-serif text-3xl font-bold">{t("launch.help")}</h2>
        <div className="mt-6"><SceneContributionLinks sceneId={scene.id} sceneSlug={scene.slug} /></div>
      </section>

      {moments.length ? <section id="scene-moments" className="container px-6 py-8"><div className="mb-8 flex items-end justify-between border-b border-white/10 pb-6"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("launch.around")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("sceneDetail.moments")}</h2></div><Link to="/discover" className="hidden items-center gap-2 text-sm text-white/50 hover:text-primary sm:flex">{t("sceneDetail.exploreAll")}<ArrowRight className="h-4 w-4"/></Link></div>{moments.length ? <div className="grid gap-5 md:grid-cols-2">{moments.slice(0,4).map((moment:any) => <Link key={moment.id} to={hrefForSceneMoment(moment)} className="group relative min-h-[380px] overflow-hidden border border-white/10">{moment.image_url ? <img src={moment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 motion-safe:group-hover:scale-105"/> : null}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-7"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-primary"><CalendarDays className="h-3.5 w-3.5"/>{moment.starts_at ? formatDate(moment.starts_at,{month:"short",day:"numeric"}) : t("sceneDetail.coming")}</p><h3 className="mt-3 font-serif text-3xl font-bold">{moment.title}</h3><p className="mt-2 flex items-center gap-2 text-xs text-white/55"><MapPin className="h-3.5 w-3.5"/>{moment.venue_name || moment.location}</p></div></Link>)}</div> : <div className="border-y border-white/10 py-12"><Sparkles className="h-6 w-6 text-primary"/><h3 className="mt-4 font-serif text-3xl font-bold">{t("sceneDetail.noGathering")}</h3><p className="mt-3 text-sm text-white/45">{t("sceneDetail.noGatheringCopy")}</p></div>}</section> : null}
      {demand.length ? <section id="scene-demand" className="container px-6 py-14"><div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("launch.wantsHeading")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("launch.demandTitle")}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">{t("launch.demandCopy")}</p></div>{membership?.membership_state === "active" ? <Link to={`/create?intent=answer&hub=${encodeURIComponent(scene.id)}&scene_slug=${encodeURIComponent(scene.slug)}`} className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-primary">{t("launch.addVoice")} <ArrowRight className="h-4 w-4"/></Link> : null}</div><div className="grid gap-4 lg:grid-cols-2">{demand.map((item:any) => { const options=[...(item.discovery_options || [])].sort((a:any,b:any)=>Number(b.votes_count||0)-Number(a.votes_count||0)); const leading=options[0]; const response=demandResponses.find((candidate:any)=>candidate.discovery_id===item.id); return <article key={item.id} id={`want-${item.id}`} tabIndex={-1} className="scroll-mt-24 break-words border border-white/10 bg-white/[.025] p-6 focus:outline focus:outline-2 focus:outline-primary"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">{item.category || t("launch.wants")}</p><span className="text-xs font-black text-white/50">{t("launch.voices", { count: formatNumber(Number(item.total_votes || 0)) })}</span></div><h3 className="mt-4 font-serif text-2xl font-bold leading-tight">{item.question}</h3>{leading && Number(leading.votes_count) > 0 ? <p className="mt-3 text-sm leading-6 text-white/50"><strong className="text-white/75">{leading.option_text}</strong> · {t("launch.voices", { count: formatNumber(Number(leading.votes_count || 0)) })}</p> : null}{response ? <div className="mt-4 border-l-2 border-emerald-300/60 pl-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-300">{t("launch.responseReady")}</p><p className="mt-2 text-sm leading-6 text-white/60">{response.response_summary}</p><Link to={response.route} className="mt-2 inline-flex items-center gap-2 text-xs font-black text-emerald-300">{t("launch.seeResponse")} <ArrowRight className="h-3.5 w-3.5"/></Link></div> : null}<div className="mt-5 flex flex-wrap gap-2">{item.semantic_kind === "demand" ? <SceneWantSupport id={item.id} sceneSlug={scene.slug} /> : null}<Link to={`/dashboard?view=studio&tab=demand&scene_id=${scene.id}&demand_id=${item.id}&want=${encodeURIComponent(item.question)}`} className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-xs font-black text-black">{t("launch.respond")} <ArrowRight className="h-3.5 w-3.5"/></Link></div></article>; })}</div></section> : null}
      {discoveries.length ? <section id="scene-discoveries" className="container px-6 py-14"><div className="mb-8 border-b border-white/10 pb-6"><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("sceneDetail.localKnowledge")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("sceneDetail.discoveries")}</h2></div>{discoveries.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{discoveries.map((discovery:any) => <Link key={discovery.id} to={`/discoveries/${discovery.slug}`} className="group overflow-hidden border border-white/10 bg-white/[.03]"><div className="h-52 bg-white/5">{discovery.cover_image ? <img src={discovery.cover_image} alt={discovery.title} className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-white/20"/></div>}</div><div className="p-6"><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("sceneDetail.discovery")}</p><h3 className="mt-2 font-serif text-2xl font-bold group-hover:text-primary">{discovery.title}</h3><p className="mt-2 flex items-center gap-2 text-xs text-white/50"><MapPin className="h-3.5 w-3.5"/>{[discovery.city,discovery.country].filter(Boolean).join(", ")}</p></div></Link>)}</div> : <p className="text-sm text-white/45">{t("sceneDetail.noDiscoveries")}</p>}</section> : null}
      {offers.length ? <section className="container px-6 py-10"><h2 className="mb-6 font-serif text-3xl font-bold">{t("launch.offersHeading")}</h2><div className="grid gap-4 sm:grid-cols-2">{offers.map((offer: { id: string; slug: string; title: string; description?: string }) => <Link key={offer.id} to={`/drop/${offer.slug}`} className="border-t border-white/20 py-5"><h3 className="font-serif text-2xl font-bold">{offer.title}</h3>{offer.description ? <p className="mt-3 text-sm leading-6 text-white/65">{offer.description}</p> : null}<ArrowRight className="mt-4 h-5 w-5 text-primary" /></Link>)}</div></section> : null}
      {places.length || people.length ? <section id="scene-around" className="container px-6 py-14"><div className="mb-8 border-b border-white/10 pb-6"><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("launch.around")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("launch.peoplePlaces")}</h2></div><div className="grid gap-4 md:grid-cols-2">{places.slice(0,4).map((place:any) => <Link key={place.id} to={`/venues/${place.slug || place.id}`} className="group flex items-center justify-between border border-white/10 bg-white/[.025] p-5 transition hover:border-primary/40"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">{t("launch.place")}</p><h3 className="mt-2 font-serif text-2xl font-bold">{place.name}</h3><p className="mt-1 text-xs text-white/45">{[place.city,place.country].filter(Boolean).join(", ")}</p></div><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-primary"/></Link>)}{people.slice(0,4).map((person:any) => <Link key={person.user_id || person.id} to={`/profile/${person.user_id || person.id}`} className="group flex items-center justify-between border border-white/10 bg-white/[.025] p-5 transition hover:border-primary/40"><div className="flex items-center gap-4"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-white/10">{person.avatar_url ? <img src={person.avatar_url} alt="" className="h-full w-full object-cover"/> : <Users className="h-5 w-5 text-white/35"/>}</div><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">{t("launch.people")}</p><h3 className="mt-1 text-lg font-bold">{person.display_name || person.full_name || person.username || t("launch.contributor")}</h3><p className="mt-1 text-xs text-white/45">{person.location || t("launch.connectedMoment")}</p></div></div><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-primary"/></Link>)}</div></section> : null}
      <section id="scene-join" className="container border-t border-white/10 px-6 py-10"><h2 className="font-serif text-2xl font-bold">{t("launch.stay")}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{t("launch.consequence")}</p><div className="mt-5 flex flex-wrap gap-3">{membership?.membership_state === "active" ? <Link to="/today" className="inline-flex min-h-12 items-center bg-primary px-5 py-3 text-sm font-bold text-black">{t("launch.today")}</Link> : null}<button type="button" disabled={joinScene.isPending || membership?.membership_state === "active"} onClick={handleJoin} className="min-h-12 bg-primary px-5 py-3 text-sm font-bold text-black disabled:opacity-70">{membership?.membership_state === "active" ? t("launch.following") : t("launch.follow")}</button><button type="button" onClick={share} className="min-h-12 border border-white/20 px-5 py-3 text-sm font-bold">{t("common.share")}</button></div></section>
      <MobileBottomNav />
    </main>
  );
}
