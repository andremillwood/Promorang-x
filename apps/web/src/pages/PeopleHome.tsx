import { ArrowRight, CalendarDays, MapPin, Radio } from "lucide-react";
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
  EvidencePair,
  NextMove,
  OutcomeProgress,
  OutcomeSurface,
  PageLead,
  PromoCardV2,
} from "@/components/promorang-v2";

const PREVIEW_ROLES = ["participant", "creator", "host", "merchant", "brand"] as const;

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

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

  return (
    <ExperienceShell
      title={greeting}
      seoTitle={t("people.homeSeo")}
      description={description}
      className="pr-v2-canvas"
      hero={(
        <div className="space-y-6 py-3">
          <PageLead
            eyebrow="PROMORANG · Today"
            title={greeting}
            description={isMemberWorkspace ? "One useful move at a time. Keep what matters on your card, use it in the real world, then let PROMORANG learn from what actually worked." : description}
          />

          <NextMove
            title={nextMove.label}
            description={isMemberWorkspace ? "This is the most useful next action PROMORANG can identify from what is currently on your card and around you." : description}
            reason={isMemberWorkspace ? "Your home now prioritizes one move instead of asking you to learn the whole platform." : undefined}
            action={
              <Link
                to={to(nextMove.href)}
                className="pr-v2-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black"
              >
                {nextMove.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
            aside={
              <Link to={to("/card")} aria-label={t("people.openCardAria")} className="pr-v2-focusable block rounded-[var(--pr-v2-radius-object)]">
                <PromoCardV2 model={cardModel} compact />
                <span className="mt-3 flex min-h-11 items-center justify-between text-sm font-semibold text-[hsl(var(--pr-v2-text-2))]">
                  Open PromoCard <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </Link>
            }
          />
        </div>
      )}
    >
      <div className="space-y-10 pb-8">
        {isPreview ? (
          <nav aria-label={t("people.previewRoles")} className="flex flex-wrap gap-2">
            {PREVIEW_ROLES.map((item) => (
              <Link
                key={item}
                to={`/app-preview?role=${item}`}
                className={`min-h-11 rounded-full border px-4 py-2.5 text-xs font-bold ${lens.role === item ? "border-[hsl(var(--pr-v2-active-role))] bg-[hsl(var(--pr-v2-active-role))] text-black" : "border-white/10 text-white/60"}`}
              >
                {item}
              </Link>
            ))}
          </nav>
        ) : null}

        <OutcomeProgress stages={outcomeStages} />

        <EvidencePair
          proof={{
            value: isMemberWorkspace ? used : Number(data?.happening || 0),
            label: isMemberWorkspace ? "Verified uses" : "Verified activity",
            description: isMemberWorkspace ? "PROMORANG counts use only when the underlying action has been recorded." : "This is activity PROMORANG can point to, not a vanity impression count.",
          }}
          value={{
            value: isMemberWorkspace ? cardPerks : money(earned),
            label: isMemberWorkspace ? "Useful things on your card" : "Recorded value",
            description: isMemberWorkspace ? "Access, perks and benefits you can actually use." : "Value currently recorded against your activity.",
          }}
        />

        {hasMovement ? (
          <section aria-labelledby="recent-proof-title" className="space-y-4">
            <div>
              <p className="pr-v2-eyebrow">Proof</p>
              <h2 id="recent-proof-title" className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">What happened</h2>
            </div>
            <ConsequenceReceipt
              event={isMemberWorkspace ? "Your recent PROMORANG activity" : "Your recent stakeholder activity"}
              occurredAt={world?.latestMemory?.issuedAt ? new Date(world.latestMemory.issuedAt).toLocaleString("en-JM", { timeZone: "America/Jamaica", dateStyle: "medium", timeStyle: "short" }) : undefined}
              lines={isMemberWorkspace
                ? [
                    { label: "On your card", value: cardPerks },
                    { label: "Claimed", value: claimed },
                    { label: "Verified uses", value: used, emphasis: true },
                  ]
                : [
                    { label: "People", value: Number(data?.people || 0) },
                    { label: "Given", value: perksGiven },
                    { label: "Recorded value", value: money(earned), emphasis: true },
                  ]}
              next={<Link to={to(nextMove.href)} className="font-bold text-black underline decoration-black/30 underline-offset-4">{nextMove.label}</Link>}
            />
          </section>
        ) : null}

        <section aria-labelledby="around-you-title" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="pr-v2-eyebrow">Around you</p>
              <h2 id="around-you-title" className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">Worth knowing about now</h2>
            </div>
            <Link to="/discover/moments" className="pr-v2-focusable min-h-11 py-3 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">See all</Link>
          </div>

          {momentFeed.isLoading ? (
            <div role="status" aria-label="Loading confirmed moments" className="h-36 animate-pulse rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-white/[0.03]" />
          ) : momentFeed.isError ? (
            <OutcomeSurface>
              <p className="font-semibold text-[hsl(var(--pr-v2-text-1))]">Live timing unavailable</p>
              <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">PROMORANG is not substituting unconfirmed listings for verified timing.</p>
            </OutcomeSurface>
          ) : liveMoments.length ? (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {liveMoments.map((moment) => (
                <Link
                  key={moment.id}
                  to={`/moments/${moment.slug || moment.id}`}
                  className="pr-v2-focusable grid min-h-[104px] grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-4 py-4"
                >
                  <div className="relative h-[76px] overflow-hidden rounded-[var(--pr-v2-radius-control)] bg-white/[0.04]">
                    {moment.image_url ? (
                      <img src={moment.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Radio className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[hsl(var(--pr-v2-active-role))]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--pr-v2-active-role))]">{momentLifecycleLabel(moment.lifecycle)}</p>
                    <p className="mt-1 truncate text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--pr-v2-text-1))]">{moment.title}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[hsl(var(--pr-v2-text-3))]">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" aria-hidden="true" />{new Date(moment.starts_at).toLocaleString("en-JM", { timeZone: "America/Jamaica", weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
                      <span className="inline-flex min-w-0 items-center gap-1 truncate"><MapPin className="h-3 w-3" aria-hidden="true" />{moment.venue_name || moment.location}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[hsl(var(--pr-v2-text-3))]" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <QuietEmpty title="Nothing confirmed right now" copy="New moments appear here only when their time and place can be verified." />
          )}
        </section>

        {workspaceRoles.length ? (
          <section className="border-t border-white/10 pt-7">
            <p className="pr-v2-eyebrow">Your other workspaces</p>
            <h2 className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">Personal stays personal</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">
              Your Participant home is for what you can discover, carry and use. Open your operating workspace when you need creator, merchant, host, brand or admin tools.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/dashboard?view=studio" className="pr-v2-focusable inline-flex min-h-11 items-center rounded-[var(--pr-v2-radius-control)] border border-white/15 px-4 text-sm font-bold text-white">
                Open operating workspace
              </Link>
              {workspaceRoles.includes("admin") ? (
                <Link to="/admin?tab=command" className="pr-v2-focusable inline-flex min-h-11 items-center rounded-[var(--pr-v2-radius-control)] border border-white/15 px-4 text-sm font-bold text-white">
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
