import { Archive, ArrowRight, CalendarDays, MapPin, Radio, Users } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  firstGivenName,
  getStakeholderLens,
  resolvePromoCardFace,
  resolveStakeholderHomeMove,
  resolveWorldInvitation,
} from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { localizeLens, localizedGreeting } from "@/i18n/localize";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, ExperienceLoading, QuietEmpty, WorldInvitationCard } from "@/components/people/ExperienceShell";
import { StakeholderLoopTrail, StakeholderPutInPass, StakeholderSetupPlaybook } from "@/components/people/StakeholderLoop";
import { PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { ConsequenceReceipt } from "@/components/promorang/ConsequenceReceipt";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";
import { LiveLoopActions } from "@/components/promocard/LiveLoopActions";
import { LiveReleaseSignal } from "@/components/content/LiveReleaseSignal";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { momentLifecycleLabel } from "@/services/moment-feed";

const money = (value: number) => value ? `J$${Math.round(value).toLocaleString()}` : "J$0";
const PREVIEW_ROLES = ["participant", "creator", "host", "merchant", "brand"] as const;

export default function PeopleHome() {
  const { t } = useI18n();
  const { user, profile, activeRole, roles } = useAuth();
  const workspaceRoles = (roles || []).filter((role) => ["host", "creator", "merchant", "brand", "agency", "admin"].includes(role));
  const home = useExperienceHome();
  const momentFeed = useCanonicalMomentFeed();
  const contentDrops = useContentDrops("active");
  const releaseDrops = contentDrops.data || [];
  const to = useExperiencePath();
  const location = useLocation();
  const [params] = useSearchParams();
  const previewRole = params.get("role");
  const data = home.data;
  const world = data?.world;
  const invitation = world?.invitation || world?.worldSystem?.invitation || resolveWorldInvitation({
    identityLine: world?.identity?.line,
    hasLiveMoment: Boolean(world?.currentMove?.href && String(world.currentMove.href).includes("/moments/")),
    nextHref: world?.currentMove?.href || "/discover",
  });
  const givenName = firstGivenName({
    displayName: data?.givenName || data?.name,
    fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name,
    username: profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.preferred_username,
    email: user?.email,
    fallback: "there",
  });
  const role = data?.role || (["creator", "host", "promoter", "merchant", "brand"].includes(String(activeRole)) ? "contributor" : "member");
  const lensRole = previewRole || activeRole || role;
  const lens = localizeLens(getStakeholderLens(lensRole), t);
  const isMemberWorkspace = lens.role === "participant";
  const isPreview = location.pathname.startsWith("/app-preview");
  const greeting = localizedGreeting(givenName, t);
  const description = lens.promise;
  const perksGiven = Number(data?.outcomes?.ledger?.perksGiven || 0);
  const nextMove = resolveStakeholderHomeMove(lensRole, {
    perksGiven,
    communities: data?.communities?.length || 0,
    cardPerks: Number(data?.outcomes?.ledger?.cardPerks || data?.card?.perks?.length || 0),
    hasInventory: Boolean(data?.outcomes?.suppliesInventory),
  });
  const hasMovement = Boolean(Number(data?.people || 0) || Number(data?.happening || 0) || Number(data?.earned || 0) || perksGiven || Number(data?.outcomes?.ledger?.perksClaimed || 0));
  const ticker = role === "operator" && Number(data?.happening || 0)
    ? t(Number(data?.happening || 0) === 1 ? "people.showedWeekOne" : "people.showedWeekMany", { count: data?.happening || 0 })
    : Number(data?.peopleThisMonth || 0)
      ? t("people.peopleThisMonth", { count: data.peopleThisMonth })
      : lens.ticker;

  if (home.isLoading) {
    return <ExperienceShell title={greeting} seoTitle={t("people.homeSeo")} description={description}><ExperienceLoading label={t("people.homeLoad")} /></ExperienceShell>;
  }

  if (!data && home.isError) {
    return (
      <ExperienceShell title={t("people.homeFallbackTitle")} eyebrow="PROMORANG">
        <QuietEmpty title={t("people.homeErrorTitle")} copy={t("people.homeErrorCopy")} action={<button type="button" disabled={home.isFetching} onClick={() => void home.refetch()} className="pr-world-primary disabled:opacity-50">{home.isFetching ? t("common.tryingAgain") : t("common.tryAgain")}</button>} />
      </ExperienceShell>
    );
  }

  const cardFace = resolvePromoCardFace({
    holder: givenName === "there" ? t("people.yourCard") : givenName,
    useThis: data?.card?.useThis,
    nearbyCount: data?.card?.nearby?.length || 0,
    nextBenefitTitle: data?.card?.nextBenefit?.title,
    latestReturn: world?.latestReturn?.heading,
    latestReturnAt: world?.latestMemory?.issuedAt ? new Date(world.latestMemory.issuedAt).toLocaleDateString() : undefined,
    sceneMark: world?.promoCard?.sceneMark,
    crewMark: world?.promoCard?.crewMark,
    recordedUse: Boolean(data?.card?.useThis?.redemption?.recorded),
  });

  if (isMemberWorkspace) {
    const liveMoments = momentFeed.data?.moments?.filter((moment) => moment.lifecycle !== "recently_ended").slice(0, 3) || [];
    const firstScene = data?.communities?.[0];

    return (
      <ExperienceShell
        title={greeting}
        seoTitle={t("people.homeSeo")}
        description={description}
        hero={(
          <section className="pr-world-hero p-5 sm:p-7 lg:p-9">
            <div className="relative z-10 grid min-h-[420px] gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,.65fr)] lg:items-center">
              <div className="min-w-0 flex flex-col justify-between self-stretch">
                <div>
                  <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a57]"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f] shadow-[0_0_14px_rgba(255,90,31,.9)]" />{ticker}</p>
                  <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">{greeting}</h1>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/52">{description}</p>
                </div>

                <div className="mt-10 max-w-2xl">
                  <p className="pr-world-kicker">One move today</p>
                  {world?.currentMove ? (
                    <Link to={to(world.currentMove.href || invitation.nextHref || "/discover")} className="group mt-3 block border-t border-white/15 pt-4">
                      <div className="flex items-end justify-between gap-5">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">{world.currentMove.eyebrow || "Today"}</p>
                          <h2 className="mt-3 max-w-xl font-serif text-4xl font-bold leading-[.95] tracking-[-.04em] text-[#f4c66c] sm:text-5xl xl:text-6xl">{world.currentMove.title}</h2>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-white/48">{world.currentMove.why || world.slice?.currentLine || invitation.why}</p>
                        </div>
                        <ArrowRight className="mb-1 h-6 w-6 shrink-0 text-[#f4c66c] transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ) : (
                    <Link to="/discover" className="group mt-3 flex items-end justify-between gap-5 border-t border-white/15 pt-4"><div><h2 className="font-serif text-3xl font-bold tracking-[-.04em] text-[#f4c66c]">Find what is moving.</h2><p className="mt-2 text-sm text-white/45">Explore discoveries, places and upcoming Moments. Choose what catches your attention.</p></div><ArrowRight className="h-6 w-6 shrink-0 text-[#f4c66c]" /></Link>
                  )}

                </div>
              </div>

              <Link to={to("/card")} aria-label={t("people.openCardAria")} className="group block w-full max-w-[420px] lg:justify-self-end">
                <PromoCardFace className="max-w-full" interactive={false} model={cardFace} />
                <div className="mt-4 flex items-center justify-between gap-3 px-1"><div><p className="text-xs font-black text-[#f4c66c]">{t("people.openCard")}</p><p className="mt-1 text-[11px] leading-5 text-white/35">Access you can actually present.</p></div><ArrowRight className="h-4 w-4 text-[#f4c66c] transition-transform group-hover:translate-x-1" /></div>
              </Link>
            </div>
          </section>
        )}
      >
        {home.isError ? <p role="status" className="text-sm text-amber-200">We couldn’t refresh Today. Showing your last loaded details.</p> : null}
        {isPreview ? (
          <nav aria-label={t("people.previewRoles")} className="pr-world-strip">
            {PREVIEW_ROLES.map((item) => <Link key={item} to={`/app-preview?role=${item}`} data-active={lens.role === item} className="pr-world-chip">{item}</Link>)}
          </nav>
        ) : null}

        <section aria-labelledby="now-next-title">
          <div className="flex items-end justify-between gap-4">
            <div><p className="pr-world-kicker">Coming up</p><h2 id="now-next-title" className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">Now & next.</h2></div>
            <Link to="/discover?tab=moments" className="pr-world-link">Full calendar</Link>
          </div>
          <div className="mt-5">
            {momentFeed.isLoading ? <div className="h-48 animate-pulse rounded-[1.8rem] border border-white/10 bg-white/[.03]" /> : momentFeed.isError ? <QuietEmpty title="Live timing unavailable" copy="We couldn’t load the calendar. Try again shortly." /> : liveMoments.length ? (
              <div className="grid gap-3 lg:grid-cols-3">{liveMoments.map((moment, index) => (
                <Link key={moment.id} to={`/moments/${moment.slug || moment.id}`} className={`pr-world-object group block min-h-[260px] overflow-hidden ${index === 0 ? "lg:col-span-2" : ""}`}>
                  <div className="relative h-full min-h-[260px]">
                    {moment.image_url ? <img src={moment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.025]" /> : <Radio className="absolute right-6 top-6 h-7 w-7 text-[#ff5a1f]" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6"><p className={`text-[9px] font-black uppercase tracking-[.18em] ${moment.lifecycle === "live" ? "text-emerald-300" : "text-[#ff8a57]"}`}>{momentLifecycleLabel(moment.lifecycle)}</p><h3 className="mt-2 font-serif text-3xl font-bold leading-[.95] tracking-[-.04em] text-white">{moment.title}</h3><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/45"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(moment.starts_at).toLocaleString("en-JM", { timeZone: "America/Jamaica", weekday: "short", hour: "numeric", minute: "2-digit" })}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{moment.venue_name || moment.location}</span></div></div>
                  </div>
                </Link>
              ))}</div>
            ) : <QuietEmpty title="Nothing confirmed right now" copy="Check Discover for places and ideas while the next Moment takes shape." />}
          </div>
        </section>

        <section>
          <p className="pr-world-kicker">Your world</p>
          <div className="pr-world-object-grid mt-4">
            {firstScene ? (
              <Link to={`/scenes/${firstScene.slug}`} className="pr-world-panel pr-world-panel--signal pr-world-object--wide group p-6 sm:p-8">
                <Radio className="h-5 w-5 text-[#ff5a1f]" /><p className="mt-8 text-[10px] font-black uppercase tracking-[.18em] text-white/35">Scene</p><h3 className="mt-2 max-w-lg font-serif text-4xl font-bold leading-[.92] tracking-[-.04em]">{firstScene.title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-white/45">Follow the people, places and Moments that bring this Scene together.</p><span className="pr-world-link mt-6 inline-flex items-center gap-1">Enter Scene <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ) : (
              <Link to="/discover" className="pr-world-panel pr-world-object--wide p-6 sm:p-8"><Radio className="h-5 w-5 text-[#ff5a1f]" /><p className="mt-8 pr-world-kicker">Scene</p><h3 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">Find a context worth returning to.</h3><p className="mt-3 text-sm leading-6 text-white/45">Scenes will appear here when you actually belong to one.</p></Link>
            )}

            <Link to="/vault" className="pr-world-panel pr-world-object--narrow group p-6">
              <Archive className="h-5 w-5 text-purple-300" /><p className="mt-8 text-[10px] font-black uppercase tracking-[.18em] text-white/35">Vault</p><h3 className="mt-2 font-serif text-3xl font-bold leading-none tracking-[-.04em]">What stayed.</h3><p className="mt-3 text-sm leading-6 text-white/45">Your access, draw entries and memories, ready to revisit.</p><span className="pr-world-link mt-6 inline-flex items-center gap-1">Open Vault <ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
        </section>

        {world?.latestReturn ? <section><p className="pr-world-kicker">Latest consequence</p><div className="mt-4"><ConsequenceReceipt receipt={world.latestReturn} /></div></section> : null}

        <LiveReleaseSignal drops={releaseDrops} />
        {!world?.identity?.line ? <WorldInvitationCard invitation={invitation} /> : null}

        {workspaceRoles.length ? (
          <section className="border-t border-white/10 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="pr-world-kicker">You also operate</p><p className="mt-2 text-sm leading-6 text-white/45">Your participant home stays personal. Work happens in the operator workspace.</p></div><Link to="/dashboard?view=studio" className="pr-world-chip">Open workspace <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          </section>
        ) : null}
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell title={greeting} seoTitle={t("people.homeSeo")} description={description} eyebrow={ticker}>
      {isPreview ? <nav aria-label={t("people.previewRoles")} className="pr-world-strip">{PREVIEW_ROLES.map((item) => <Link key={item} to={`/app-preview?role=${item}`} data-active={lens.role === item} className="pr-world-chip">{item}</Link>)}</nav> : null}
      <StakeholderLoopTrail role={lensRole} />
      <StakeholderSetupPlaybook role={lensRole} />

      <div className="pr-world-object-grid">
        <section className="pr-world-panel pr-world-panel--signal pr-world-object--wide p-6 sm:p-8"><p className="pr-world-kicker">Your next operating move</p><h2 className="mt-3 font-serif text-4xl font-bold leading-[.95] tracking-[-.04em]">{nextMove.label}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/50">{lens.promise}</p><Link to={to(nextMove.href)} className="pr-world-primary mt-6">Continue <ArrowRight className="h-4 w-4" /></Link></section>
        <StakeholderPutInPass role={lensRole} />
      </div>

      {hasMovement ? <PaperReceipt heading={t("people.inPlay")} lines={[{ label: t("people.people"), value: String(data?.people || 0) }, { label: t("people.verifiedActivity"), value: money(Number(data?.earned || 0)) }, { label: t("people.given"), value: String(perksGiven) }, { label: t("people.onCardsNow"), value: String(data?.outcomes?.ledger?.perksClaimed || 0), strong: true }]} footer={role === "operator" ? t(Number(data?.happening || 0) === 1 ? "people.showedWeekOne" : "people.showedWeekMany", { count: data?.happening || 0 }) : t("people.numbersQuiet")} /> : null}

      <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="font-serif text-3xl font-bold">{t("people.whatTheyAsked")}</h2><Users className="h-5 w-5 text-[#ff5a1f]" /></div><DiscoveryDemandInbox role={resolveDemandRole(activeRole)} variant="peek" /></section>
      <LiveLoopActions role={String(activeRole || role)} title={t("people.makeLive")} />

      {data?.perks?.length ? <section className="space-y-3"><h2 className="font-serif text-3xl font-bold">{t("people.perksYouCanGive")}</h2><div className="grid gap-3 md:grid-cols-2">{data.perks.slice(0, 3).map((perk: { id: string; source?: string; title: string; remaining?: number }) => <Link key={perk.id} to={to("/give")}><TicketPass kicker={perk.source === "yours" ? t("people.yours") : t("people.available")} title={perk.title} detail={perk.remaining != null ? t("people.remainingCount", { count: perk.remaining }) : t("people.readyToDrop")} stub="DROP" stubLabel="Perk" /></Link>)}</div></section> : null}
      {!data?.communities?.length ? <Link to={to("/start")}><TicketPass kicker={t("people.firstRoom")} title={t("people.bringPeople")} detail={t("people.bringPeopleCopy")} stub="ROOM" stubLabel={t("common.open")} /></Link> : <Link to={`/scenes/${data.communities[0].slug}`}><TicketPass kicker={t("people.yourCommunity")} title={data.communities[0].title} detail={t("people.yourCommunityCopy")} stub="IN" stubLabel="Room" /></Link>}
      <Link to="/dashboard?view=studio" className="block text-center text-xs text-white/30">{t("people.olderStudio")}</Link>
    </ExperienceShell>
  );
}
