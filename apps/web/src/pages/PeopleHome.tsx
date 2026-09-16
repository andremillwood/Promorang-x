import { ArrowRight, CalendarDays, MapPin, Radio, Sparkles } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  firstGivenName,
  getStakeholderLens,
  resolvePromoCardFace,
  resolveStakeholderHomeMove,
} from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { localizeLens, localizedGreeting } from "@/i18n/localize";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, ExperienceLoading, QuietEmpty } from "@/components/people/ExperienceShell";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { momentLifecycleLabel } from "@/services/moment-feed";
import {
  ConsequenceReceipt,
  OutcomeProgress,
  OutcomeSurface,
  PromoCardV2,
} from "@/components/promorang-v2";

const PREVIEW_ROLES = ["participant", "creator", "host", "merchant", "brand"] as const;

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

function participantHeroTitle(state: string) {
  if (state === "ready") return "One thing on your card is ready.";
  if (state === "nearby") return "Something nearby is worth your attention.";
  if (state === "used") return "You showed up. Something changed.";
  if (state === "returned") return "You came back. PROMORANG noticed.";
  return "Your city has a next move.";
}

export default function PeopleHome() {
  const { t } = useI18n();
  const { user, profile, activeRole, roles } = useAuth();
  const home = useExperienceHome();
  const momentFeed = useCanonicalMomentFeed();
  const to = useExperiencePath();
  const location = useLocation();
  const [params] = useSearchParams();

  const previewRole = params.get("role");
  const data = home.data;
  const world = data?.world;
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
  const cardPerks = Number(data?.outcomes?.ledger?.cardPerks || data?.card?.perks?.length || 0);
  const claimed = Number(data?.happened?.buckets?.claimed || data?.outcomes?.ledger?.perksClaimed || 0);
  const used = Number(data?.happened?.buckets?.used || 0);
  const earned = Number(data?.earned || 0);
  const communities = Number(data?.communities?.length || 0);
  const workspaceRoles = (roles || []).filter((item) => ["host", "creator", "merchant", "brand", "agency", "admin"].includes(item));

  const nextMove = resolveStakeholderHomeMove(lensRole, {
    perksGiven,
    communities,
    cardPerks,
    hasInventory: Boolean(data?.outcomes?.suppliesInventory),
  });

  const hasMovement = Boolean(cardPerks || claimed || used || Number(data?.people || 0) || earned || perksGiven);
  const participantHasSelected = Boolean(cardPerks || claimed || used);
  const participantHasCommitted = Boolean(claimed || cardPerks || used);
  const participantHasUsed = Boolean(used);
  const outcomeStages = isMemberWorkspace
    ? [
        { id: "find", label: "Find something worthwhile", status: participantHasSelected ? "complete" as const : "current" as const },
        { id: "keep", label: "Put it on your card", status: participantHasCommitted ? "complete" as const : participantHasSelected ? "current" as const : "upcoming" as const },
        { id: "use", label: "Use it", status: participantHasUsed ? "complete" as const : participantHasCommitted ? "current" as const : "upcoming" as const },
        { id: "return", label: "Come back for what fits you", status: participantHasUsed ? "current" as const : "upcoming" as const },
      ]
    : [
        { id: "put-in", label: lens.putIn.label, status: perksGiven || earned ? "complete" as const : "current" as const },
        { id: "movement", label: "Cause a verified action", status: earned || Number(data?.happening || 0) ? "complete" as const : "current" as const },
        { id: "proof", label: "Read the result", status: earned ? "current" as const : "upcoming" as const },
      ];

  if (home.isLoading) {
    return (
      <ExperienceShell title={greeting} seoTitle={t("people.homeSeo")} description={description} className="pr-v2-canvas">
        <ExperienceLoading label={t("people.homeLoad")} />
      </ExperienceShell>
    );
  }

  if (!data && home.isError) {
    return (
      <ExperienceShell title={t("people.homeFallbackTitle")} eyebrow="PROMORANG" className="pr-v2-canvas">
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

  const cardModel = resolvePromoCardFace({
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
  });

  const liveMoments = momentFeed.data?.moments?.filter((moment) => moment.lifecycle !== "recently_ended").slice(0, 3) || [];
  const readyTitle = data?.card?.useThis?.title || data?.card?.nextBenefit?.title || nextMove.label;
  const readyIssuer = data?.card?.useThis?.issuer?.name || "PROMORANG partner";

  return (
    <ExperienceShell
      title={greeting}
      seoTitle={t("people.homeSeo")}
      description={description}
      className="pr-v2-canvas"
      hero={(
        <section className="pr-v2-cinematic-hero px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(330px,.72fr)] lg:items-center">
            <div className="min-w-0">
              <p className="pr-v2-kicker">PROMORANG · TODAY</p>
              <h1 className="pr-v2-editorial-title mt-4 text-white">{isMemberWorkspace ? participantHeroTitle(cardModel.state) : greeting}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
                {isMemberWorkspace ? "Real access, useful places and moments that actually lead somewhere." : description}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to={to(nextMove.href)} className="pr-v2-focusable pr-v2-primary-cta inline-flex items-center justify-center gap-2 px-6">
                  {cardModel.state === "ready" ? "Use this now" : nextMove.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to={to("/card")} className="pr-v2-focusable inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold text-white/82">
                  My PromoCard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <Link to={to("/card")} aria-label={t("people.openCardAria")} className="pr-v2-focusable block rounded-[var(--pr-v2-radius-object)]">
              <PromoCardV2 model={cardModel} />
            </Link>
          </div>

          {isMemberWorkspace ? (
            <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#f0bd72]" aria-hidden="true" />
                  <p className="pr-v2-kicker">{cardModel.state === "ready" ? "Ready now" : "Worth knowing"}</p>
                </div>
                <p className="mt-2 font-serif text-2xl font-semibold tracking-[-.035em] text-white">{readyTitle}</p>
                <p className="mt-1 text-sm text-white/48">{readyIssuer} · {cardModel.places}</p>
              </div>
              <Link to={to(nextMove.href)} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#ff7847]">
                {cardModel.state === "ready" ? "Use this" : nextMove.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </section>
      )}
    >
      <div className="space-y-10 pb-8">
        {isPreview ? (
          <nav aria-label={t("people.previewRoles")} className="flex flex-wrap gap-2">
            {PREVIEW_ROLES.map((item) => (
              <Link
                key={item}
                to={`/app-preview?role=${item}`}
                className={`min-h-11 rounded-full border px-4 py-2.5 text-xs font-bold ${lens.role === item ? "border-[#ff6b35]/55 bg-[#ff6b35]/12 text-[#ff895e]" : "border-white/10 text-white/55"}`}
              >
                {item}
              </Link>
            ))}
          </nav>
        ) : null}

        <section className="space-y-5">
          <div>
            <p className="pr-v2-kicker">Your rhythm</p>
            <h2 className="pr-v2-editorial-heading mt-2 text-white">Where you are right now</h2>
          </div>
          <OutcomeProgress stages={outcomeStages} label="" />
        </section>

        {hasMovement ? (
          <section aria-labelledby="recent-proof-title" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="pr-v2-kicker">Real actions</p>
                <h2 id="recent-proof-title" className="pr-v2-editorial-heading mt-2 text-white">What changed</h2>
              </div>
              <Link to={to("/happened")} className="pr-v2-focusable min-h-11 py-3 text-xs font-black uppercase tracking-[.16em] text-[#d6ad69]">See all</Link>
            </div>
            <ConsequenceReceipt
              event={isMemberWorkspace ? "Your recent PROMORANG activity" : "Your recent stakeholder activity"}
              occurredAt={world?.latestMemory?.issuedAt ? new Date(world.latestMemory.issuedAt).toLocaleString("en-JM", { timeZone: "America/Jamaica", dateStyle: "medium", timeStyle: "short" }) : undefined}
              lines={isMemberWorkspace
                ? [
                    { label: "Entry / use verified", value: used || "Recorded" },
                    { label: "On your card", value: cardPerks },
                    { label: "Claimed", value: claimed, emphasis: true },
                  ]
                : [
                    { label: "People moved", value: Number(data?.people || 0) },
                    { label: "Given", value: perksGiven },
                    { label: "Recorded value", value: money(earned), emphasis: true },
                  ]}
              next={<Link to={to(nextMove.href)} className="font-bold text-black underline decoration-black/30 underline-offset-4">{nextMove.label}</Link>}
            />
          </section>
        ) : null}

        <section aria-labelledby="around-you-title" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="pr-v2-kicker">People · places · possibilities</p>
              <h2 id="around-you-title" className="pr-v2-editorial-heading mt-2 text-white">Around you</h2>
            </div>
            <Link to={to("/discover/moments")} className="pr-v2-focusable min-h-11 py-3 text-xs font-black uppercase tracking-[.16em] text-[#d6ad69]">See all</Link>
          </div>

          {momentFeed.isLoading ? (
            <div role="status" aria-label="Loading confirmed moments" className="h-44 animate-pulse rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-white/[0.03]" />
          ) : momentFeed.isError ? (
            <OutcomeSurface>
              <p className="font-semibold text-[hsl(var(--pr-v2-text-1))]">Live timing unavailable</p>
              <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">PROMORANG is not substituting unconfirmed listings for verified timing.</p>
            </OutcomeSurface>
          ) : liveMoments.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveMoments.map((moment) => (
                <Link key={moment.id} to={`/moments/${moment.slug || moment.id}`} className="pr-v2-focusable pr-v2-world-card group min-w-0">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
                    {moment.image_url ? (
                      <img src={moment.image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <Radio className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-[#ff6b35]" aria-hidden="true" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" aria-hidden="true" />
                    <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-[#f0bd72] backdrop-blur">
                      {momentLifecycleLabel(moment.lifecycle)}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="truncate font-serif text-xl font-semibold tracking-[-.03em] text-white">{moment.title}</p>
                    <div className="mt-3 space-y-1.5 text-xs text-white/45">
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{new Date(moment.starts_at).toLocaleString("en-JM", { timeZone: "America/Jamaica", weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
                      <span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{moment.venue_name || moment.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <QuietEmpty title="Nothing confirmed right now" copy="New moments appear here only when their time and place can be verified." />
          )}
        </section>

        {workspaceRoles.length ? (
          <section className="pr-v2-section-rule">
            <p className="pr-v2-kicker">Your other workspaces</p>
            <h2 className="pr-v2-editorial-heading mt-2 text-white">Personal stays personal</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/52">
              Your Participant home is for what you can discover, carry and use. Open your operating workspace when you need creator, merchant, host, brand or admin tools.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/dashboard?view=studio" className="pr-v2-focusable inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-bold text-white">
                Open operating workspace
              </Link>
              {workspaceRoles.includes("admin") ? (
                <Link to="/admin?tab=command" className="pr-v2-focusable inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-bold text-white">
                  Admin Command Center
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </ExperienceShell>
  );
}
