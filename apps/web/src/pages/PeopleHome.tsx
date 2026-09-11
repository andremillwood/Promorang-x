import { ArrowRight } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  firstGivenName,
  getStakeholderLens,
  presentWorldRunTitle,
  resolvePromoCardFace,
  resolveStakeholderHomeMove,
  resolveWorldInvitation,
} from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { localizeLens, localizedGreeting } from "@/i18n/localize";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, ExperienceLoading, QuietEmpty } from "@/components/people/ExperienceShell";
import { StakeholderLoopTrail, StakeholderPutInPass, StakeholderSetupPlaybook } from "@/components/people/StakeholderLoop";
import { PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { ConsequenceReceipt } from "@/components/promorang/ConsequenceReceipt";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";
import { LiveLoopActions } from "@/components/promocard/LiveLoopActions";
import { LiveReleaseSignal } from "@/components/content/LiveReleaseSignal";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { seededContentDrops } from "@/data/seeded-content-drops";

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

const PREVIEW_ROLES = ["participant", "creator", "host", "merchant", "brand"] as const;

export default function PeopleHome() {
  const { t } = useI18n();
  const { user, profile, activeRole, roles } = useAuth();
  const workspaceRoles = (roles || []).filter((role) => ["host", "creator", "merchant", "brand", "agency", "admin"].includes(role));
  const home = useExperienceHome();
  const contentDrops = useContentDrops("active");
  const releaseDrops = contentDrops.data?.length ? contentDrops.data : seededContentDrops;
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
  const hasMovement = Boolean(
    Number(data?.people || 0) ||
    Number(data?.happening || 0) ||
    Number(data?.earned || 0) ||
    perksGiven ||
    Number(data?.outcomes?.ledger?.perksClaimed || 0),
  );
  const ticker = role === "operator" && Number(data?.happening || 0)
      ? t(Number(data?.happening || 0) === 1 ? "people.showedWeekOne" : "people.showedWeekMany", { count: data?.happening || 0 })
      : Number(data?.peopleThisMonth || 0)
        ? t("people.peopleThisMonth", { count: data.peopleThisMonth })
        : lens.ticker;

  if (home.isLoading) {
    return (
      <ExperienceShell title={greeting} seoTitle={t("people.homeSeo")} description={description}>
        <ExperienceLoading label={t("people.homeLoad")} />
      </ExperienceShell>
    );
  }

  if (!data && home.isError) {
    return (
      <ExperienceShell title={t("people.homeFallbackTitle")} eyebrow="PROMORANG">
        <QuietEmpty
          title={t("people.homeErrorTitle")}
          copy={t("people.homeErrorCopy")}
          action={
            <button
              type="button"
              disabled={home.isFetching}
              onClick={() => void home.refetch()}
              className="min-h-11 text-sm font-bold text-primary disabled:opacity-50"
            >
              {home.isFetching ? t("common.tryingAgain") : t("common.tryAgain")}
            </button>
          }
        />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      title={greeting}
      seoTitle={t("people.homeSeo")}
      description={description}
      hero={(
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 px-5 pb-5 pt-6 shadow-[0_0_40px_rgba(255,85,0,0.16)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgba(255,85,0,.24),transparent_46%)]" />
          <div className="relative">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {ticker}
            </p>
            <h1 className="mt-4 font-serif text-[2.55rem] font-bold leading-[0.9] tracking-tight sm:text-5xl">{greeting}</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">{description}</p>
            <Link to={to("/card")} aria-label={t("people.openCardAria")} className="experience-interactive group mx-auto mt-6 block max-w-md rounded-[22px]">
              <PromoCardFace
                className="max-w-none"
                interactive={false}
                model={resolvePromoCardFace({
                  holder: givenName === "there" ? t("people.yourCard") : givenName,
                  useThis: data?.card?.useThis,
                  nearbyCount: data?.card?.nearby?.length || 0,
                  nextBenefitTitle: data?.card?.nextBenefit?.title,
                  latestReturn: world?.latestReturn?.heading,
                  latestReturnAt: world?.latestMemory?.issuedAt
                    ? new Date(world.latestMemory.issuedAt).toLocaleDateString()
                    : undefined,
                  sceneMark: world?.promoCard?.sceneMark,
                  crewMark: world?.promoCard?.crewMark,
                  recordedUse: Boolean(data?.card?.useThis?.redemption?.recorded),
                })}
              />
              <span className="mt-3 flex min-h-11 items-center justify-between px-1 text-sm font-semibold text-amber-200">
                {t("people.openCard")} <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <p className="mt-2 px-1 text-xs leading-5 text-white/45">{lens.promoCard.meaning}</p>
            </Link>
            <Link
              to={to(nextMove.href)}
              className="experience-interactive mt-5 flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-black text-black shadow-[0_0_24px_rgba(255,85,0,0.28)]"
            >
              {nextMove.label}
            </Link>
          </div>
        </section>
      )}
    >
      {isPreview ? (
        <nav aria-label={t("people.previewRoles")} className="flex flex-wrap gap-2">
          {PREVIEW_ROLES.map((item) => (
            <Link
              key={item}
              to={`/app-preview?role=${item}`}
              className={`rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${
                lens.role === item ? "border-primary bg-primary text-black" : "border-white/15 text-white/60"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>
      ) : null}
      <StakeholderLoopTrail role={lensRole} />
      <StakeholderSetupPlaybook role={lensRole} />
      {hasMovement ? (
        <PaperReceipt
          heading={t("people.inPlay")}
          lines={
            isMemberWorkspace
              ? [
                  { label: t("people.onYourCard"), value: String(data?.outcomes?.ledger?.cardPerks || data?.card?.perks?.length || 0) },
                  { label: t("people.rooms"), value: String(data?.communities?.length || 0) },
                  { label: t("people.claimed"), value: String(data?.happened?.buckets?.claimed || 0) },
                  { label: t("common.used"), value: String(data?.happened?.buckets?.used || 0), strong: true },
                ]
              : [
                  { label: t("people.people"), value: String(data?.people || 0) },
                  { label: t("people.verifiedActivity"), value: money(Number(data?.earned || 0)) },
                  { label: t("people.given"), value: String(perksGiven) },
                  { label: t("people.onCardsNow"), value: String(data?.outcomes?.ledger?.perksClaimed || 0), strong: true },
                ]
          }
          footer={role === "operator"
            ? t(Number(data?.happening || 0) === 1 ? "people.showedWeekOne" : "people.showedWeekMany", { count: data?.happening || 0 })
            : t("people.numbersQuiet")}
        />
      ) : null}

      {workspaceRoles.length ? (
        <section className="rounded-[1.75rem] border border-primary/25 bg-primary/10 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{t("people.alsoOperate")}</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">{t("people.memberHomeNotDesk")}</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            {t("people.memberHomeCopy")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard?view=studio" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-black text-black">
              {activeRole === "admin" ? t("people.openStudio") : t("people.openWorkspace", { role: String(activeRole) })}
            </Link>
            {workspaceRoles.includes("admin") ? (
              <Link to="/admin?tab=command" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold text-white">
                {t("people.adminCommand")}
              </Link>
            ) : null}
            <Link to="/propose/new?from=home&role=host" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold text-white">
              {t("people.continueActivation")}
            </Link>
          </div>
        </section>
      ) : null}

      <LiveLoopActions role={String(activeRole || role)} title={t("people.makeLive")} />
      {isMemberWorkspace ? <LiveReleaseSignal drops={releaseDrops} /> : null}

      {!isMemberWorkspace ? (
        <section className="grid gap-3">
          <StakeholderPutInPass role={lensRole} />
          <Link to={to(lens.world.href)} className="block">
            <TicketPass kicker={t("people.theWorld")} title={t("people.seeScene")} detail={lens.world.meaning} stub="WORLD" stubLabel={t("common.open")} />
          </Link>
          <Link to={to(lens.activity.href)} className="block">
            <TicketPass kicker={t("people.activity")} title={lens.activity.href === "/happened" ? t("people.whatHappened") : t("people.recentActivity")} detail={lens.activity.meaning} stub="DID" stubLabel={t("common.open")} />
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">{t("people.forYou")}</h2>
          {world?.currentMove ? (
            <Link to={to(world.currentMove.href || invitation?.nextHref || "/discover")} className="block">
              <TicketPass
                kicker={world.currentMove.eyebrow || t("common.tonight")}
                title={world.currentMove.title}
                detail={
                  world.identity?.line
                    ? [world.identity.line, world.currentMove.why || world.slice?.currentLine].filter(Boolean).join(" · ")
                    : [
                        invitation?.why,
                        invitation?.benefit,
                        world.currentMove.why || world.slice?.currentLine,
                      ].filter(Boolean).join(" ")
                }
                stub="GO"
                stubLabel={t("common.live")}
                imageUrl={world.currentMove.imageUrl}
                imageAlt={world.currentMove.imageAlt || world.currentMove.title}
              />
            </Link>
          ) : (
            <Link to="/discover?tab=perks" className="block">
              <TicketPass
                kicker={t("people.whatsHappening")}
                title={t("people.browsePerks")}
                detail={
                  world?.identity?.line
                    ? t("people.browsePerksCopy")
                    : `${invitation.benefit} ${t("people.browsePerksCopy")}`
                }
                stub="GO"
                stubLabel={t("common.live")}
              />
            </Link>
          )}
          {world?.crew ? (
            <Link to={to("/crews")} className="block">
              <TicketPass
                kicker={t("people.whoYouMoveWith")}
                title={world.crew.name}
                detail={t("people.peopleCount", { count: world.crew.size, run: presentWorldRunTitle(world.crew.runTitle) })}
                stub="CREW"
                stubLabel={t("common.open")}
              />
            </Link>
          ) : null}
          {world?.crew && world?.guild ? (
            <Link to={to("/guilds")} className="block">
              <TicketPass
                kicker={t("people.whoCoordinates")}
                title={world.guild.name}
                detail={t("people.crewCount", { count: world.guild.crewCount, line: world.guild.line || t("people.sceneFederation") })}
                stub="GUILD"
                stubLabel={t("common.open")}
              />
            </Link>
          ) : null}
        </section>
      )}

      {isMemberWorkspace && world?.latestReturn ? (
        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("people.latestReturn")}</p>
          <ConsequenceReceipt receipt={world.latestReturn} />
        </section>
      ) : null}

      {!isMemberWorkspace && lens.putIn.href !== "/stock" && (data?.outcomes?.suppliesInventory || ["merchant", "brand"].includes(String(activeRole))) ? (
        <Link to={to("/stock")} className="block">
          <TicketPass
            kicker={t("people.inventory")}
            title={t("people.putSomethingUp")}
            detail={t("people.putSomethingUpCopy")}
            stub="STOCK"
            stubLabel={t("common.open")}
          />
        </Link>
      ) : null}

      {!isMemberWorkspace ? (
        <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold">{t("people.whatTheyAsked")}</h2>
          <DiscoveryDemandInbox role={resolveDemandRole(activeRole)} variant="peek" />
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">{t("people.perksYouCanGive")}</h2>
            <Link to={to("/give")} className="text-sm text-primary">{t("common.seeAll")}</Link>
          </div>
          {data?.perks?.length ? (
            <div className="grid gap-3">
              {data.perks.slice(0, 3).map((perk: { id: string; source?: string; title: string; remaining?: number }) => (
                <Link key={perk.id} to={to("/give")} className="block">
                  <TicketPass
                    kicker={perk.source === "yours" ? t("people.yours") : t("people.available")}
                    title={perk.title}
                    detail={perk.remaining != null ? t("people.remainingCount", { count: perk.remaining }) : t("people.readyToDrop")}
                    stub="DROP"
                    stubLabel="Perk"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <QuietEmpty title={t("people.nothingToGive")} copy={t("people.nothingToGiveCopy")} action={<Link to={to("/give")} className="text-sm font-bold text-primary">{t("people.makeAPerk")}</Link>} />
          )}
        </section>
      ) : null}

      {data?.opportunityItems?.length ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">{t("people.opportunities")}</h2>
            <Link to={to("/earn")} className="text-sm text-primary">{t("common.earn")}</Link>
          </div>
          {data.opportunityItems.slice(0, 2).map((item: { id: string; title: string; youEarn?: string }) => (
            <Link key={item.id} to={to("/earn")} className="block">
              <TicketPass kicker={t("common.earn")} title={item.title} detail={item.youEarn} stub="TAKE" stubLabel={t("common.open")} />
            </Link>
          ))}
        </section>
      ) : null}

      {!data?.communities?.length ? (
        isMemberWorkspace ? null : (
        <Link to={to("/start")} className="block">
          <TicketPass
            kicker={t("people.firstRoom")}
            title={t("people.bringPeople")}
            detail={t("people.bringPeopleCopy")}
            stub="ROOM"
            stubLabel={t("common.open")}
          />
        </Link>
        )
      ) : (
        <Link to={`/scenes/${data.communities[0].slug}`} className="block">
          <TicketPass
            kicker={t("people.yourCommunity")}
            title={data.communities[0].title}
            detail={t("people.yourCommunityCopy")}
            stub="IN"
            stubLabel="Room"
          />
        </Link>
      )}

      {!isMemberWorkspace ? (
        <Link to="/dashboard?view=studio" className="block text-center text-xs text-white/30">
          {t("people.olderStudio")}
        </Link>
      ) : null}
    </ExperienceShell>
  );
}
