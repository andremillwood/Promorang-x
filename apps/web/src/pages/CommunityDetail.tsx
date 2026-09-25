import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Compass, Heart, MapPin, Share2, Sparkles, Users } from "lucide-react";
import {
  AFTRHRS_COPY,
  AFTRHRS_PATHS,
  getSceneHumanState,
  hrefForSceneMoment,
  isAftrHrsMoment,
  isAftrHrsSceneSlug,
  presentContestLine,
  sceneLocation,
  sceneMomentsWithAftrHrs,
} from "@promorang/shared";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { useScene } from "@/hooks/useScenes";
import { useJoinScene } from "@/hooks/useScenes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useHubExperience, useExperienceActions, useExperienceHome } from "@/hooks/usePeopleExperience";
import { getSiteUrl } from "@/lib/discovery";
import { generateSceneSchema } from "@/lib/seo-schemas";
import { useI18n } from "@/i18n/I18nContext";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function CommunityDetail() {
  const { t, formatDate, formatNumber } = useI18n();
  const { slug } = useParams();
  const query = useScene(slug);
  const hub = useHubExperience(slug);
  const home = useExperienceHome();
  const { contribute, invite } = useExperienceActions();
  const { user } = useAuth();
  const { toast } = useToast();
  const joinScene = useJoinScene(query.data?.scene);
  if (query.isLoading) return <main className="grid min-h-screen place-items-center bg-black text-white"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></main>;
  if (!query.data) return <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white"><div><Heart className="mx-auto h-9 w-9 text-primary"/><h1 className="mt-5 font-serif text-4xl font-bold">{t("sceneDetail.unavailable")}</h1><Link to="/scenes" className="mt-6 inline-flex items-center gap-2 text-primary"><ArrowLeft className="h-4 w-4"/>{t("sceneDetail.browse")}</Link></div></main>;
  const { scene, membership, discoveries, demand, places, people } = query.data;
  const moments = sceneMomentsWithAftrHrs(scene.slug, query.data.moments);
  const state = getSceneHumanState(scene, membership);
  const nextMoment = moments[0];
  const aftrHrsScene = isAftrHrsSceneSlug(scene.slug);
  const aside = aftrHrsScene
    ? {
      eyebrow: AFTRHRS_COPY.sceneAsideEyebrow,
      title: AFTRHRS_COPY.sceneAsideTitle,
      body: AFTRHRS_COPY.sceneAsideBody,
      ctaLabel: AFTRHRS_COPY.sceneCta,
    }
    : state;
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
    if (navigator.share) {
      await navigator.share({ title: scene.title, text: scene.description || undefined, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => undefined);
    toast({ title: "Scene link copied", description: user ? "The link carries your recorded Scene invite attribution. A share is not a conversion or reward." : "Sign in before sharing when you want Scene invite attribution." });
  };
  const handleJoin = async () => {
    if (!user) { window.location.assign(`/auth?next=${encodeURIComponent(`/scenes/${scene.slug}`)}`); return; }
    try {
      await joinScene.mutateAsync();
      await contribute.mutateAsync({ slug: scene.slug, kind: "member" }).catch(() => undefined);
      toast({ title: t("sceneDetail.joinedToast", { scene: scene.title }), description: t("sceneDetail.joinedToastCopy") });
    }
    catch (error) { toast({ title: t("sceneDetail.joinError"), description: (error as Error).message, variant: "destructive" }); }
  };
  const handleInvitePeople = async () => {
    if (!user) { window.location.assign(`/auth?next=${encodeURIComponent(`/scenes/${scene.slug}`)}`); return; }
    try {
      const result = await invite.mutateAsync(scene.slug);
      await navigator.clipboard.writeText(result.shareUrl);
      toast({ title: t("sceneDetail.inviteReady"), description: t("sceneDetail.inviteReadyCopy") });
    } catch (error) {
      toast({ title: t("sceneDetail.inviteError"), description: (error as Error).message, variant: "destructive" });
    }
  };
  return (
    <main className="marketing-cinematic public-object-page min-h-screen bg-black pb-24 text-white">
      <SEO title={`${scene.title} — ${t("sceneDetail.seoSuffix")}`} description={scene.description || state.body} image={scene.image_url || undefined} url={getSiteUrl(`/scenes/${scene.slug}`)} schema={generateSceneSchema(scene, moments, discoveries)} />
      <section className="public-object-hero relative min-h-[640px] overflow-hidden border-b border-white/10 pt-24">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        {scene.image_url ? <img src={scene.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.76)_52%,rgba(0,0,0,.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        <div className="container relative flex min-h-[544px] items-end px-6 pb-12">
          <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div><Link to="/scenes" className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4"/>{t("sceneDetail.all")}</Link><p className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.28em] text-primary"><MapPin className="h-3.5 w-3.5"/>{sceneLocation(scene)}</p>{metadata.season_title ? <p className="mt-3 text-[10px] font-black uppercase tracking-[.28em] text-white/55">{metadata.season_title}{metadata.test_area ? ` · ${metadata.test_area}` : ""}</p> : null}{metadata.season_line ? <p className="mt-2 max-w-xl text-sm text-white/55">{metadata.season_line}</p> : null}<h1 className="mt-5 max-w-4xl font-serif text-6xl font-bold leading-[.86] tracking-[-.055em] sm:text-8xl lg:text-[7rem]">{scene.title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">{scene.description}</p>{aftrHrsScene ? <Link to={AFTRHRS_PATHS.landing} className="mt-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/35 bg-fuchsia-500/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-100">{AFTRHRS_COPY.sceneFeaturedLabel} · {AFTRHRS_COPY.sceneFeaturedLine}</Link> : null}<div className="mt-6 flex flex-wrap gap-2">{(metadata.vibe || []).map((vibe) => <span key={vibe} className="border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/70 backdrop-blur">{vibe}</span>)}</div></div>
            <aside className="border-t border-white/20 pt-6 backdrop-blur-sm"><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">{aside.eyebrow}</p><h2 className="mt-3 font-serif text-3xl font-bold leading-tight">{aside.title}</h2><p className="mt-3 text-sm leading-6 text-white/55">{aside.body}</p><p className="mt-4 text-xs text-white/50">{[hub.data?.people ? t("sceneDetail.peopleHub", { count: formatNumber(hub.data.people) }) : "", hub.data?.activeThisWeek ? t("sceneDetail.activeWeek", { count: formatNumber(hub.data.activeThisWeek) }) : "", hub.data?.operator?.name || ""].filter(Boolean).join(" · ")}</p><div className="mt-6 flex gap-2">{aftrHrsScene ? <Link to={AFTRHRS_PATHS.landing} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary px-5 text-sm font-black text-black">{AFTRHRS_COPY.sceneCta}<ArrowRight className="h-4 w-4"/></Link> : membership?.membership_state === "active" && nextMoment ? <Link to={hrefForSceneMoment(nextMoment)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary px-5 text-sm font-black text-black">{state.ctaLabel}<ArrowRight className="h-4 w-4"/></Link> : <button type="button" disabled={joinScene.isPending} onClick={handleJoin} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary px-5 text-sm font-black text-black disabled:opacity-60">{joinScene.isPending ? t("sceneDetail.joining") : nextMoment ? t("sceneDetail.join") : t("sceneDetail.keep")}<ArrowRight className="h-4 w-4"/></button>}<button type="button" aria-label={t("sceneDetail.share")} onClick={share} className="grid h-12 w-12 place-items-center border border-white/20"><Share2 className="h-4 w-4"/></button></div></aside>
          </div>
        </div>
      </section>

      <nav className="public-object-tabs border-b border-white/10 bg-black/92 px-6"><div className="container flex gap-7 overflow-x-auto py-4 text-[10px] font-black uppercase tracking-[.12em] text-white/48"><a href="#scene-about" className="text-primary">About</a>{moments.length ? <a href="#scene-moments">Moments</a> : null}{demand.length ? <a href="#scene-demand">What people want</a> : null}{discoveries.length ? <a href="#scene-discoveries">Discoveries</a> : null}{places.length || people.length ? <a href="#scene-around">Around</a> : null}<a href="#scene-join">Join</a></div></nav>
      <section id="scene-about" className="container px-6 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("sceneDetail.feeling")}</p><h2 className="mt-4 font-serif text-4xl font-bold leading-[.96] sm:text-5xl">{metadata.welcome || t("sceneDetail.welcome")}</h2><p className="mt-6 max-w-lg text-sm leading-7 text-white/48">{metadata.recurring_ritual || t("sceneDetail.ritual")}</p></div>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">{[[Users,t("sceneDetail.who"),metadata.hosts?.length ? t("sceneDetail.peopleCount", { count: formatNumber(metadata.hosts.length) }) : t("sceneDetail.peopleEmpty")],[MapPin,t("sceneDetail.where"),metadata.places?.length ? t("sceneDetail.placesCount", { count: formatNumber(metadata.places.length) }) : sceneLocation(scene)],[Heart,t("sceneDetail.return"),metadata.next_invitation || t("sceneDetail.nextInvitation")]].map(([Icon,title,copy]) => { const C=Icon as typeof Users; return <article key={title as string} className="bg-black p-6"><C className="h-5 w-5 text-primary"/><h3 className="mt-10 font-serif text-xl font-bold">{title as string}</h3><p className="mt-3 text-xs leading-5 text-white/42">{copy as string}</p></article>; })}</div>
        </div>
      </section>

      <section id="scene-moments" className="container px-6 py-8"><div className="mb-8 flex items-end justify-between border-b border-white/10 pb-6"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("sceneDetail.gatherEyebrow")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("sceneDetail.moments")}</h2></div><Link to="/discover" className="hidden items-center gap-2 text-sm text-white/50 hover:text-primary sm:flex">{t("sceneDetail.exploreAll")}<ArrowRight className="h-4 w-4"/></Link></div>{moments.length ? <div className="grid gap-5 md:grid-cols-2">{moments.slice(0,4).map((moment:any) => <Link key={moment.id} to={hrefForSceneMoment(moment)} className="group relative min-h-[380px] overflow-hidden border border-white/10">{moment.image_url ? <img src={moment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"/> : null}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-7">{isAftrHrsMoment(moment) ? <p className="mb-2 text-[10px] font-black uppercase tracking-[.2em] text-fuchsia-200">{AFTRHRS_COPY.sceneFeaturedLabel}</p> : null}<p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-primary"><CalendarDays className="h-3.5 w-3.5"/>{moment.starts_at ? formatDate(moment.starts_at,{month:"short",day:"numeric"}) : t("sceneDetail.coming")}</p><h3 className="mt-3 font-serif text-3xl font-bold">{moment.title}</h3><p className="mt-2 flex items-center gap-2 text-xs text-white/55"><MapPin className="h-3.5 w-3.5"/>{moment.venue_name || moment.location}</p></div></Link>)}</div> : <div className="border-y border-white/10 py-12"><Sparkles className="h-6 w-6 text-primary"/><h3 className="mt-4 font-serif text-3xl font-bold">{t("sceneDetail.noGathering")}</h3><p className="mt-3 text-sm text-white/45">{t("sceneDetail.noGatheringCopy")}</p></div>}</section>
      {demand.length ? <section id="scene-demand" className="container px-6 py-14"><div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">What this Scene wants</p><h2 className="mt-3 font-serif text-4xl font-bold">Demand before supply.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">These are recorded voices from this Scene. They are signals, not purchases or promises of supply.</p></div>{membership?.membership_state === "active" ? <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Add your voice <ArrowRight className="h-4 w-4"/></Link> : null}</div><div className="grid gap-4 lg:grid-cols-2">{demand.map((item:any) => { const options=[...(item.discovery_options || [])].sort((a:any,b:any)=>Number(b.votes_count||0)-Number(a.votes_count||0)); const leading=options[0]; return <article key={item.id} className="border border-white/10 bg-white/[.025] p-6"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">{item.category || "Scene demand"}</p><span className="text-xs font-black text-white/50">{formatNumber(Number(item.total_votes || 0))} voices</span></div><h3 className="mt-4 font-serif text-2xl font-bold leading-tight">{item.question}</h3>{leading ? <p className="mt-3 text-sm leading-6 text-white/50">Most people are leaning toward <strong className="text-white/75">{leading.option_text}</strong> · {formatNumber(Number(leading.votes_count || 0))} voices.</p> : null}<div className="mt-5 flex flex-wrap gap-2"><Link to={`/discover?demand_id=${item.id}`} className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-4 text-xs font-black">See the want <ArrowRight className="h-3.5 w-3.5"/></Link><Link to={`/dashboard?view=studio&tab=demand&scene_id=${scene.id}&demand_id=${item.id}&want=${encodeURIComponent(item.question)}`} className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-xs font-black text-black">Respond to this demand <ArrowRight className="h-3.5 w-3.5"/></Link></div></article>; })}</div></section> : null}
      <section id="scene-discoveries" className="container px-6 py-14"><div className="mb-8 border-b border-white/10 pb-6"><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("sceneDetail.localKnowledge")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("sceneDetail.discoveries")}</h2></div>{discoveries.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{discoveries.map((discovery:any) => <Link key={discovery.id} to={`/discoveries/${discovery.slug}`} className="group overflow-hidden border border-white/10 bg-white/[.03]"><div className="h-52 bg-white/5">{discovery.cover_image ? <img src={discovery.cover_image} alt={discovery.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-white/20"/></div>}</div><div className="p-6"><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("sceneDetail.discovery")}</p><h3 className="mt-2 font-serif text-2xl font-bold group-hover:text-primary">{discovery.title}</h3><p className="mt-2 flex items-center gap-2 text-xs text-white/50"><MapPin className="h-3.5 w-3.5"/>{[discovery.city,discovery.country].filter(Boolean).join(", ")}</p></div></Link>)}</div> : <p className="text-sm text-white/45">{t("sceneDetail.noDiscoveries")}</p>}</section>
      {places.length || people.length ? <section id="scene-around" className="container px-6 py-14"><div className="mb-8 border-b border-white/10 pb-6"><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">Around this Scene</p><h2 className="mt-3 font-serif text-4xl font-bold">Places and people already moving here.</h2></div><div className="grid gap-4 md:grid-cols-2">{places.slice(0,4).map((place:any) => <Link key={place.id} to={`/venues/${place.slug || place.id}`} className="group flex items-center justify-between border border-white/10 bg-white/[.025] p-5 transition hover:border-primary/40"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Around this place</p><h3 className="mt-2 font-serif text-2xl font-bold">{place.name}</h3><p className="mt-1 text-xs text-white/45">{[place.city,place.country].filter(Boolean).join(", ")}</p></div><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-primary"/></Link>)}{people.slice(0,4).map((person:any) => <Link key={person.user_id || person.id} to={`/profile/${person.user_id || person.id}`} className="group flex items-center justify-between border border-white/10 bg-white/[.025] p-5 transition hover:border-primary/40"><div className="flex items-center gap-4"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-white/10">{person.avatar_url ? <img src={person.avatar_url} alt="" className="h-full w-full object-cover"/> : <Users className="h-5 w-5 text-white/35"/>}</div><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">People moving this</p><h3 className="mt-1 text-lg font-bold">{person.display_name || person.full_name || person.username || "Scene contributor"}</h3><p className="mt-1 text-xs text-white/45">{person.location || "Connected through a real Scene Moment"}</p></div></div><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-primary"/></Link>)}</div></section> : null}
      <section id="scene-join" className="border-t border-white/10 bg-white/[.02]"><div className="container flex flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Stay close</p><h2 className="mt-2 font-serif text-2xl font-bold">Want to be part of this Scene?</h2><p className="mt-2 text-xs text-white/42">Join to keep the Scene close and return when a real Moment or Discovery changes.</p></div><div className="flex gap-2">{membership?.membership_state === "active" ? <Link to="/card" className="inline-flex min-h-11 items-center gap-2 border border-primary/40 px-5 text-xs font-black uppercase tracking-[.08em] text-primary">Open PromoCard <ArrowRight className="h-4 w-4"/></Link> : <button type="button" disabled={joinScene.isPending} onClick={handleJoin} className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-black uppercase tracking-[.08em] text-black">{joinScene.isPending ? t("sceneDetail.joining") : t("sceneDetail.join")} <ArrowRight className="h-4 w-4"/></button>}<button type="button" onClick={handleInvitePeople} className="inline-flex min-h-11 items-center border border-white/15 px-4 text-xs font-black uppercase tracking-[.08em]">Invite</button></div></div></section>
      <MobileBottomNav />
    </main>
  );
}
