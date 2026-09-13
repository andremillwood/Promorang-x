import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Copy,
  MapPin,
  RefreshCw,
  Sparkles,
  Ticket,
} from "lucide-react";
import {
  discoverHrefForAim,
  firstGivenName,
  getStakeholderLens,
  issuanceFromPromoCardPerk,
  isPresentablePass,
  ownedBenefitStatus,
  PROMOCARD_AIMS,
  resolvePromoCardAim,
  resolvePromoCardFace,
  resolveWorldInvitation,
  selectOwnedUseThis,
  sortBenefitsByAim,
  type PromoCardAim,
  type PromoCardPerk,
} from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useApplyPromoCardAim } from "@/hooks/usePromoCardAim";
import { useExperienceHome, useMyPromoCard } from "@/hooks/usePeopleExperience";
import { resolveStoredPromoCardAim } from "@/lib/promocard-aim";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import {
  ExperienceShell,
  ExperienceLoading,
  QuietEmpty,
} from "@/components/people/ExperienceShell";
import { PromoCardFace, PromoCardWorldContext } from "@/components/promorang/SignatureObjects";
import { FillCardMoves } from "@/components/promocard/FillCardMoves";
import { StakeholderPutInPass } from "@/components/people/StakeholderLoop";
import { PromoCardActions } from "@/components/promocard/PromoCardActions";
import { OfferIssuancePass } from "@/components/offers/OfferIssuancePass";
import type { OfferIssuance } from "@/hooks/useOffers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import { localizedAimCopy, localizeLens } from "@/i18n/localize";

type CardPerk = {
  id: string;
  title: string;
  detail?: string;
  redemptionCode?: string | null;
  expiresAt?: string | null;
  status?: string;
  fulfillmentState?: string;
  fulfillmentType?: string | null;
  fulfillmentData?: Record<string, unknown>;
  issuer?: { name?: string };
  eligibility?: { who?: string };
  availableQuantity?: number | null;
  redemption?: { recorded?: boolean; code?: string | null };
  sharedBy?: { name?: string };
  dropSlug?: string;
  href?: string;
  issuance?: PromoCardPerk["issuance"];
  fromDiscover?: boolean;
};

const actionClass =
  "experience-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-black disabled:opacity-50";

function perkCode(perk: CardPerk | null | undefined) {
  return perk?.redemptionCode || perk?.redemption?.code || null;
}

function isExpired(perk: CardPerk) {
  if (!perk.expiresAt) return false;
  const expiry = Date.parse(perk.expiresAt);
  return !Number.isFinite(expiry) || expiry <= Date.now();
}

function canShowCode(perk: CardPerk | null | undefined) {
  if (!perk || isExpired(perk) || perk.redemption?.recorded) return false;
  const type = perk.fulfillmentType || perk.issuance?.offers?.fulfillment_type || "merchant_validation";
  if (type === "qr" || type === "shipping" || type === "manual" || type === "automatic") return false;
  return perk.fulfillmentState === "claimed" && Boolean(perkCode(perk));
}

function issuanceForPerk(perk: CardPerk) {
  return issuanceFromPromoCardPerk(perk as PromoCardPerk);
}

function journeyIssuance(perk: CardPerk) {
  const issuance = issuanceForPerk(perk);
  if (!issuance) return null;
  const type = issuance.offers?.fulfillment_type || perk.fulfillmentType;
  if (type === "code" || type === "merchant_validation") return null;
  return issuance;
}

function BenefitTicket({
  perk,
  action,
  aim,
  onShowCode,
}: {
  perk: CardPerk;
  action?: string;
  aim?: PromoCardAim | null;
  onShowCode?: (perk: CardPerk, trigger: HTMLButtonElement) => void;
}) {
  const { t, formatDate } = useI18n();
  const usable = canShowCode(perk);
  const aimCopy = localizedAimCopy(aim?.id, t);
  return (
    <article className="rounded-[1.4rem] border border-white/10 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            {aimCopy
              ? t("card.onCardAim", { aim: aimCopy.label })
              : perk.fromDiscover || !perk.issuer?.name
                ? t("card.onCardKicker")
                : perk.issuer.name}
          </p>
          <p className="mt-1 font-serif text-xl font-bold">{perk.title}</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/50">
          {ownedBenefitStatus(perk as PromoCardPerk)}
        </span>
      </div>
      {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/45">
        <div>
          <dt className="uppercase tracking-widest">{t("card.eligibility")}</dt>
          <dd className="mt-0.5 text-white/70">{perk.eligibility?.who || t("card.claimedMembers")}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">{t("card.remaining")}</dt>
          <dd className="mt-0.5 text-white/70">{perk.availableQuantity == null ? t("card.openQty") : perk.availableQuantity}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">{t("card.expires")}</dt>
          <dd className="mt-0.5 text-white/70">{perk.expiresAt ? formatDate(perk.expiresAt) : t("card.whileSupplies")}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">{t("card.redemption")}</dt>
          <dd className="mt-0.5 text-white/70">{ownedBenefitStatus(perk as PromoCardPerk)}</dd>
        </div>
      </dl>
      {usable ? (
        <button
          type="button"
          onClick={(event) => onShowCode?.(perk, event.currentTarget)}
          className="experience-interactive mt-4 flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-100"
          aria-label={perkCode(perk) ? t("card.showCodeFor", { title: perk.title }) : t("card.viewPerk", { title: perk.title })}
        >
          {action || t("card.showCode")}
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
      ) : null}
      {perk.sharedBy?.name ? <p className="mt-2 text-xs text-white/40">{t("card.sharedBy", { name: perk.sharedBy.name })}</p> : null}
    </article>
  );
}

export default function MyPromoCard() {
  const { t, formatNumber, formatDate } = useI18n();
  const { user, profile, activeRole } = useAuth();
  const [searchParams] = useSearchParams();
  const stake = localizeLens(getStakeholderLens(searchParams.get("role") || activeRole), t);
  const previewAim = resolveStoredPromoCardAim(searchParams);
  const card = useMyPromoCard(previewAim?.id);
  const applied = useApplyPromoCardAim(card.data?.aim);
  const aim = resolvePromoCardAim(applied.aim?.id) || applied.aim;
  const chooseAim = applied.chooseAim;
  const home = useExperienceHome();
  const to = useExperiencePath();
  const world = home.data?.world;
  const invitation = world?.invitation || world?.worldSystem?.invitation || resolveWorldInvitation({
    identityLine: world?.identity?.line,
    nextHref: "/discover",
  });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<CardPerk | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [flipped, setFlipped] = useState(false);
  const data = card.data;
  const holder = firstGivenName({
    displayName: data?.givenName || data?.name,
    fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name,
    username: profile?.username,
    email: user?.email,
    fallback: "there",
  });
  const perks: CardPerk[] = data?.perks || [];
  const useThis = selectOwnedUseThis({
    aim,
    useThis: data?.useThis || null,
    benefits: (data?.benefits || perks || []) as PromoCardPerk[],
  }) || [...(data?.benefits || []), ...perks].find((item: CardPerk) => canShowCode(item)) || null;
  const nearby = sortBenefitsByAim(data?.nearby || [], aim);
  const nextBenefit = data?.nextBenefit || nearby[0] || null;
  const qrPass = perks
    .map(issuanceForPerk)
    .find((issuance) => issuance && isPresentablePass(issuance.offers.fulfillment_type, issuance.status) && issuance.offers.fulfillment_type === "qr") || null;
  const expiredPerks = perks.filter(isExpired);
  const livePerks = perks.filter((perk) => !isExpired(perk));
  const selectedExpired = selected ? isExpired(selected) : false;
  const selectedCode = perkCode(selected);
  const face = resolvePromoCardFace({
    holder: holder === "there" ? t("people.yourCard") : holder,
    useThis: useThis,
    nearbyCount: nearby.length,
    nextBenefitTitle: nextBenefit?.title,
    latestReturn: world?.latestReturn?.heading,
    latestReturnAt: world?.latestMemory?.issuedAt
      ? new Date(world.latestMemory.issuedAt).toLocaleDateString()
      : undefined,
    sceneMark: world?.promoCard?.sceneMark,
    crewMark: world?.promoCard?.crewMark,
    recordedUse: Boolean(useThis?.redemption?.recorded),
    expiredOnly: !useThis && livePerks.length === 0 && expiredPerks.length > 0,
  });
  const aimCopy = localizedAimCopy(aim?.id, t);
  const namedHolder = holder && holder !== "there";
  const copy = (() => {
    if (useThis) {
      return {
        title: aimCopy
          ? namedHolder
            ? t("card.holderAim", { name: holder, aim: aimCopy.label })
            : t("card.yourAim", { aim: aimCopy.label })
          : t("card.ownedTitle"),
        description: t("card.ownedCopy"),
      };
    }
    if (aimCopy) {
      return {
        title: aimCopy.line.replace(/\.$/, ""),
        description: t("card.aimedWatchCopy", { watching: aimCopy.watching }),
      };
    }
    return {
      title: namedHolder ? t("card.holderTitle", { name: holder }) : t("card.yourTitle"),
      description: t("card.unlockAround"),
    };
  })();
  const empty = aimCopy
    ? { title: t("card.fillAimedTitle", { aim: aimCopy.label }), description: t("card.fillAimedCopy", { watching: aimCopy.watching }) }
    : { title: t("card.fillTitle"), description: t("card.fillCopy") };
  useEffect(() => {
    if (face.credential) sessionStorage.setItem("promorang.promocard.lastCredential", face.credential);
  }, [face.credential]);

  async function copyCode() {
    if (!selectedCode) return;
    try {
      await navigator.clipboard.writeText(selectedCode);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  function openPerk(perk: CardPerk, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSelected(perk);
    setCopyState("idle");
  }

  return (
    <ExperienceShell
      eyebrow={t("card.eyebrow")}
      title={copy.title}
      description={stake.promoCard.meaning}
      backTo="/dashboard"
      actions={
        data ? (
          <button
            type="button"
            aria-label={t("card.refreshAria")}
            disabled={card.isFetching}
            onClick={() => void card.refetch()}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-white/15 px-4 text-sm text-white/70 disabled:opacity-50"
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-4 w-4 ${card.isFetching ? "motion-safe:animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </button>
        ) : undefined
      }
    >
      {card.isLoading ? (
        <ExperienceLoading label={t("card.loading")} />
      ) : !data && card.isError ? (
        <QuietEmpty
          title={t("card.errorTitle")}
          copy={t("card.errorCopy")}
          action={
            <button
              type="button"
              className={actionClass}
              disabled={card.isFetching}
              onClick={() => void card.refetch()}
            >
              {card.isFetching ? t("common.tryingAgain") : t("common.tryAgain")}
            </button>
          }
        />
      ) : (
        <>
          {card.isError ? (
            <p role="status" className="rounded-2xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm text-amber-100">
              {t("card.stale")}
            </p>
          ) : null}

          <PromoCardFace
            model={face}
            flipped={flipped}
            onFlip={() => setFlipped((value) => !value)}
            onCopy={() => {
              if (!face.credential) return;
              void navigator.clipboard.writeText(face.credential).then(
                () => setCopyState("copied"),
                () => setCopyState("failed"),
              );
            }}
            copyState={copyState}
            lastLoaded={Boolean(card.isError && face.credential)}
          />

          {stake.role !== "participant" ? <StakeholderPutInPass role={stake.role} /> : null}

          <PromoCardWorldContext
            scene={data?.memberships?.[0]?.title || null}
            season={data?.memberships?.length ? world?.slice?.seasonTitle : null}
            crew={world?.crew?.name}
            run={
              world?.crew?.runTitle
                ? `${world.crew.runTitle} · ${world.crew.runCompleted || 0}/${world.crew.runTotal || 0}`
                : null
            }
            pathCue={world?.path?.cue}
            identityLine={world?.identity?.line}
            formingLine={invitation.formingLine}
            latestReturn={world?.latestReturn?.heading}
            nearestUnlock={world?.promoCard?.nearestUnlock}
            latestPiece={world?.latestMemory?.title}
          />

          <PromoCardActions
            useThis={useThis}
            nearbyCount={nearby.length}
            nextBenefit={nextBenefit}
            aim={aim}
            onUseThis={face.canFlip ? () => setFlipped(true) : undefined}
          />

          <section className="rounded-[1.4rem] border border-amber-200/20 bg-amber-200/5 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
              {aim ? t("card.onCardKicker") : t("card.optionalFilter")}
            </p>
            <p className="mt-1 font-serif text-2xl font-bold">{aimCopy ? aimCopy.line : t("card.aimThis")}</p>
            <p className="mt-1 text-sm text-white/60">
              {aimCopy ? aimCopy.watching : t("card.aimCopy")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PROMOCARD_AIMS.map((item) => {
                const active = aim?.id === item.id;
                const itemCopy = localizedAimCopy(item.id, t);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => chooseAim(item)}
                    className={`min-h-10 rounded-full border px-3.5 text-sm font-bold ${
                      active
                        ? "border-amber-300 bg-amber-300 text-black"
                        : "border-white/15 bg-white/[0.04] text-white"
                    }`}
                  >
                    {itemCopy?.label || item.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">
              {t("card.kadNote")}{" "}
              <Link to="/scenes" className="font-bold text-primary">{t("card.browseScenes")}</Link>
              {" "}{t("card.kadNoteRest")}
            </p>
          </section>

          <section id="use-this">
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Ticket className="h-5 w-5 text-primary" /> {useThis ? t("card.showThis") : t("card.onCardKicker")}</h2>
            {useThis ? (
              <div className="mt-3">
                <BenefitTicket perk={useThis} aim={aim} action={t("card.showThis")} onShowCode={openPerk} />
              </div>
            ) : qrPass ? (
              <div className="mt-3">
                <OfferIssuancePass issuance={qrPass as OfferIssuance} />
              </div>
            ) : (
              <div className="mt-3">
                <QuietEmpty
                  title={empty.title}
                  copy={empty.description}
                  action={
                    <Link to={discoverHrefForAim(aim)} className={actionClass}>
                      {aimCopy ? t("card.browseAim", { aim: aimCopy.label }) : t("card.browseLive")} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  }
                />
                <FillCardMoves aim={aim} authenticated={Boolean(user)} />
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><MapPin className="h-5 w-5 text-primary" /> {t("card.availableNearby")}</h2>
              <Link to={discoverHrefForAim(aim)} className="text-sm font-bold text-primary">{t("card.seeMore")}</Link>
            </div>
            {nearby.length ? (
              <div className="mt-3 space-y-2">
                {nearby.map((perk: CardPerk) => (
                  <Link key={perk.id} to={perk.dropSlug ? `/drop/${perk.dropSlug}` : perk.href || "/discover"} className="block rounded-[1.4rem] border border-white/10 px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{perk.issuer?.name}</p>
                    <p className="mt-1 font-serif text-xl font-bold">{perk.title}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {perk.availableQuantity == null ? t("card.openQuantity") : t("card.leftCount", { count: formatNumber(perk.availableQuantity) })}
                      {perk.expiresAt ? ` · ${t("card.until", { date: formatDate(perk.expiresAt) })}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="text-sm text-white/60">
                  {useThis
                    ? t("card.nothingElse")
                    : aimCopy
                      ? t("card.nothingAim", { aim: aimCopy.label })
                      : t("card.nothingBiz")}
                </p>
                <Link to={discoverHrefForAim(aim)} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-primary">
                  {aimCopy ? t("card.findAim", { aim: aimCopy.label }) : t("card.openDiscover")} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Sparkles className="h-5 w-5 text-primary" /> {t("card.nextBenefit")}</h2>
            {nextBenefit ? (
              <article className="mt-3 rounded-[1.4rem] border border-primary/30 bg-primary/10 px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{nextBenefit.issuer?.name || t("card.nextVisit")}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{nextBenefit.title}</p>
                <p className="mt-2 text-sm text-white/60">{t("card.useThenReturn")}</p>
                <Link to={discoverHrefForAim(aim)} className="mt-4 inline-flex min-h-11 items-center text-sm font-black text-primary">{t("card.findNearby")}</Link>
              </article>
            ) : (
              <p className="mt-3 text-sm text-white/50">
                {useThis ? t("card.useThenNext") : t("card.nothingUnlock")}
              </p>
            )}
          </section>

          <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("card.pointsMembership")}</p>
            <p className="mt-2 font-serif text-3xl font-bold">{t("card.promoPoints", { count: formatNumber(Number(data?.points || 0)) })}</p>
            <p className="mt-1 text-sm text-white/55">{t("card.promoKeys", { count: formatNumber(Number(data?.keys || 0)) })}</p>
            {data?.repeatUse ? (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/50">
                <div><dt>{t("card.firstRedemptions")}</dt><dd className="text-white">{formatNumber(data.repeatUse.firstRedemptions)}</dd></div>
                <div><dt>{t("card.secondUses")}</dt><dd className="text-white">{formatNumber(data.repeatUse.secondUses)}</dd></div>
                <div><dt>{t("card.referredRedeemed")}</dt><dd className="text-white">{formatNumber(data.repeatUse.referredUsersWhoRedeem)}</dd></div>
                <div><dt>{t("card.contributorRewards")}</dt><dd className="text-white">{t("card.ptsAwarded", { count: formatNumber(data.repeatUse.contributorRewards?.pointsAwarded || 0) })}</dd></div>
              </dl>
            ) : null}
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold">{t("card.onTheCard")}</h2>
            {perks.filter((perk) => !isExpired(perk)).length ? (
              <div className="mt-3 space-y-2">
                {perks.filter((perk) => !isExpired(perk)).map((perk) => {
                  const journey = journeyIssuance(perk);
                  return journey ? (
                    <OfferIssuancePass key={perk.id} issuance={journey as OfferIssuance} />
                  ) : (
                    <BenefitTicket key={perk.id} perk={perk} aim={aim} onShowCode={openPerk} />
                  );
                })}
              </div>
            ) : (
              <div className="mt-3">
                <QuietEmpty title={t("card.nothingYet")} copy={aimCopy ? t("card.unlockPuts", { watching: aimCopy.watching }) : t("card.unlockLands")} />
              </div>
            )}
          </section>

          {expiredPerks.length ? (
            <details className="rounded-2xl border border-white/10 p-4 text-white/65">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
                {t("card.expiredPerks", { count: formatNumber(expiredPerks.length) })}
              </summary>
              <ul className="mt-3 space-y-3">
                {expiredPerks.map((perk) => (
                  <li key={perk.id} className="border-t border-white/10 pt-3 text-sm">
                    {perk.title}
                    <span className="ml-2 text-xs text-white/50">{t("card.expired")}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <section>
            <h2 className="font-serif text-2xl font-bold">{t("card.memberships")}</h2>
            {data?.memberships?.length ? (
              <div className="mt-3 space-y-2">
                {data.memberships.map((item: { id: string; slug?: string; title: string; role: string }) => (
                  <Link key={item.id} to={item.slug ? `/scenes/${item.slug}` : "/scenes"} className="block rounded-[1.4rem] border border-white/10 px-4 py-4">
                    <p className="font-serif text-xl font-bold">{item.title}</p>
                    <p className="text-xs uppercase tracking-widest text-white/40">{item.role}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <Link to="/scenes" className="mt-3 block text-sm font-bold text-primary">{t("card.findCommunity")}</Link>
            )}
          </section>

          <Link
            to={to("/dashboard")}
            className="inline-flex min-h-11 items-center text-sm text-white/65 hover:text-white"
          >
            {t("card.backHome")}
          </Link>
        </>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setCopyState("idle");
          }
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          className="max-h-[90dvh] overflow-y-auto rounded-3xl border-white/15 bg-[#141313] text-white sm:max-w-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("card.onYourPromoCard")}
          </p>
          <DialogTitle className="break-words pr-5 font-serif text-3xl">
            {selected?.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/70">
            {selected?.detail || t("card.showMerchant")}
          </DialogDescription>
          {selectedCode && !selectedExpired && canShowCode(selected) ? (
            <div className="mt-2 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-center">
              <p className="text-sm text-white/80">{t("card.showToRedeem")}</p>
              <code className="my-5 block select-all break-all font-mono text-3xl font-bold tracking-wider">
                {selectedCode}
              </code>
              <button
                type="button"
                onClick={() => void copyCode()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold"
              >
                {copyState === "copied" ? (
                  <Check aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Copy aria-hidden="true" className="h-4 w-4" />
                )}
                {copyState === "copied" ? t("card.copied") : t("card.copyCode")}
              </button>
              <p role="status" className="mt-2 text-xs text-white/65">
                {copyState === "failed"
                  ? t("card.copyFailedHint")
                  : copyState === "copied"
                    ? t("card.codeCopied")
                    : t("card.copyHint")}
              </p>
            </div>
          ) : (
            <p className="rounded-2xl bg-white/5 p-4 text-sm leading-6 text-white/70">
              {selectedExpired ? t("card.expiredExplore") : t("card.noCode")}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}
