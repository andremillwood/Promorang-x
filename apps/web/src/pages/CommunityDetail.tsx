import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Compass, Heart, MapPin, Share2, Sparkles, Users } from "lucide-react";
import { getSceneHumanState, sceneLocation } from "@promorang/shared";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { useScene } from "@/hooks/useScenes";
import { useJoinScene } from "@/hooks/useScenes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getSiteUrl } from "@/lib/discovery";
import { generateSceneSchema } from "@/lib/seo-schemas";
import { useI18n } from "@/i18n/I18nContext";

export default function CommunityDetail() {
  const { t, formatDate, formatNumber } = useI18n();
  const { slug } = useParams();
  const query = useScene(slug);
  const { user } = useAuth();
  const { toast } = useToast();
  const joinScene = useJoinScene(query.data?.scene);
  if (query.isLoading) return <main className="grid min-h-screen place-items-center bg-black text-white"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></main>;
  if (!query.data) return <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white"><div><Heart className="mx-auto h-9 w-9 text-primary"/><h1 className="mt-5 font-serif text-4xl font-bold">{t("sceneDetail.unavailable")}</h1><Link to="/scenes" className="mt-6 inline-flex items-center gap-2 text-primary"><ArrowLeft className="h-4 w-4"/>{t("sceneDetail.browse")}</Link></div></main>;
  const { scene, membership, moments, discoveries } = query.data;
  const state = getSceneHumanState(scene, membership);
  const nextMoment = moments[0];
  const metadata = scene.metadata || {};
  const share = () => navigator.share?.({ title: scene.title, text: scene.description || undefined, url: window.location.href }).catch(() => undefined);
  const handleJoin = async () => {
    if (!user) { window.location.assign(`/auth?next=${encodeURIComponent(`/scenes/${scene.slug}`)}`); return; }
    try { await joinScene.mutateAsync(); toast({ title: t("sceneDetail.joinedToast", { scene: scene.title }), description: t("sceneDetail.joinedToastCopy") }); }
    catch (error) { toast({ title: t("sceneDetail.joinError"), description: (error as Error).message, variant: "destructive" }); }
  };
  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO title={`${scene.title} — ${t("sceneDetail.seoSuffix")}`} description={scene.description || state.body} image={scene.image_url || undefined} url={getSiteUrl(`/scenes/${scene.slug}`)} schema={generateSceneSchema(scene, moments, discoveries)} />
      <section className="relative min-h-[700px] overflow-hidden border-b border-white/10 pt-24">
        {scene.image_url ? <img src={scene.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.76)_52%,rgba(0,0,0,.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        <div className="container relative flex min-h-[604px] items-end px-6 pb-12">
          <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div><Link to="/scenes" className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4"/>{t("sceneDetail.all")}</Link><p className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.28em] text-primary"><MapPin className="h-3.5 w-3.5"/>{sceneLocation(scene)}</p><h1 className="mt-5 max-w-4xl font-serif text-6xl font-bold leading-[.86] tracking-[-.055em] sm:text-8xl lg:text-[7rem]">{scene.title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">{scene.description}</p><div className="mt-6 flex flex-wrap gap-2">{(metadata.vibe || []).map((vibe) => <span key={vibe} className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/70 backdrop-blur">{vibe}</span>)}</div></div>
            <aside className="border-t border-white/20 pt-6 backdrop-blur-sm"><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">{state.eyebrow}</p><h2 className="mt-3 font-serif text-3xl font-bold leading-tight">{state.title}</h2><p className="mt-3 text-sm leading-6 text-white/55">{state.body}</p><div className="mt-6 flex gap-2">{membership?.membership_state === "active" && nextMoment ? <Link to={`/moments/${nextMoment.id}`} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-black">{state.ctaLabel}<ArrowRight className="h-4 w-4"/></Link> : <button type="button" disabled={joinScene.isPending} onClick={handleJoin} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-black disabled:opacity-60">{joinScene.isPending ? t("sceneDetail.joining") : nextMoment ? t("sceneDetail.join") : t("sceneDetail.keep")}<ArrowRight className="h-4 w-4"/></button>}<button type="button" aria-label={t("sceneDetail.share")} onClick={share} className="grid h-12 w-12 place-items-center rounded-full border border-white/20"><Share2 className="h-4 w-4"/></button></div></aside>
          </div>
        </div>
      </section>

      <section className="container px-6 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("sceneDetail.feeling")}</p><h2 className="mt-4 font-serif text-4xl font-bold leading-[.96] sm:text-5xl">{metadata.welcome || t("sceneDetail.welcome")}</h2><p className="mt-6 max-w-lg text-sm leading-7 text-white/48">{metadata.recurring_ritual || t("sceneDetail.ritual")}</p></div>
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-3">{[[Users,t("sceneDetail.who"),metadata.hosts?.length ? t("sceneDetail.peopleCount", { count: formatNumber(metadata.hosts.length) }) : t("sceneDetail.peopleEmpty")],[MapPin,t("sceneDetail.where"),metadata.places?.length ? t("sceneDetail.placesCount", { count: formatNumber(metadata.places.length) }) : sceneLocation(scene)],[Heart,t("sceneDetail.return"),metadata.next_invitation || t("sceneDetail.nextInvitation")]].map(([Icon,title,copy]) => { const C=Icon as typeof Users; return <article key={title as string} className="bg-black p-6"><C className="h-5 w-5 text-primary"/><h3 className="mt-10 font-serif text-xl font-bold">{title as string}</h3><p className="mt-3 text-xs leading-5 text-white/42">{copy as string}</p></article>; })}</div>
        </div>
      </section>

      <section className="container px-6 py-8"><div className="mb-8 flex items-end justify-between border-b border-white/10 pb-6"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("sceneDetail.gatherEyebrow")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("sceneDetail.moments")}</h2></div><Link to="/discover" className="hidden items-center gap-2 text-sm text-white/50 hover:text-primary sm:flex">{t("sceneDetail.exploreAll")}<ArrowRight className="h-4 w-4"/></Link></div>{moments.length ? <div className="grid gap-5 md:grid-cols-2">{moments.slice(0,4).map((moment:any) => <Link key={moment.id} to={`/moments/${moment.id}`} className="group relative min-h-[380px] overflow-hidden rounded-[2rem] border border-white/10">{moment.image_url ? <img src={moment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"/> : null}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-7"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-primary"><CalendarDays className="h-3.5 w-3.5"/>{moment.starts_at ? formatDate(moment.starts_at,{month:"short",day:"numeric"}) : t("sceneDetail.coming")}</p><h3 className="mt-3 font-serif text-3xl font-bold">{moment.title}</h3><p className="mt-2 flex items-center gap-2 text-xs text-white/55"><MapPin className="h-3.5 w-3.5"/>{moment.venue_name || moment.location}</p></div></Link>)}</div> : <div className="border-y border-white/10 py-12"><Sparkles className="h-6 w-6 text-primary"/><h3 className="mt-4 font-serif text-3xl font-bold">{t("sceneDetail.noGathering")}</h3><p className="mt-3 text-sm text-white/45">{t("sceneDetail.noGatheringCopy")}</p></div>}</section>
      <section className="container px-6 py-14"><div className="mb-8 border-b border-white/10 pb-6"><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("sceneDetail.localKnowledge")}</p><h2 className="mt-3 font-serif text-4xl font-bold">{t("sceneDetail.discoveries")}</h2></div>{discoveries.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{discoveries.map((discovery:any) => <Link key={discovery.id} to={`/discoveries/${discovery.slug}`} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.03]"><div className="h-52 bg-white/5">{discovery.cover_image ? <img src={discovery.cover_image} alt={discovery.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-white/20"/></div>}</div><div className="p-6"><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("sceneDetail.discovery")}</p><h3 className="mt-2 font-serif text-2xl font-bold group-hover:text-primary">{discovery.title}</h3><p className="mt-2 flex items-center gap-2 text-xs text-white/50"><MapPin className="h-3.5 w-3.5"/>{[discovery.city,discovery.country].filter(Boolean).join(", ")}</p></div></Link>)}</div> : <p className="text-sm text-white/45">{t("sceneDetail.noDiscoveries")}</p>}</section>
      <MobileBottomNav />
    </main>
  );
}
