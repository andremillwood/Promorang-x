import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Copy, MapPin, RefreshCw, Ticket } from "lucide-react";
import {
  discoverHrefForAim,
  firstGivenName,
  getStakeholderLens,
  issuanceFromPromoCardPerk,
  isPresentablePass,
  ownedBenefitKicker,
  ownedBenefitStatus,
  fillCardCopy,
  ownedCardCopy,
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
import { ExperienceShell, ExperienceLoading, QuietEmpty } from "@/components/people/ExperienceShell";
import { PromoCardWorldContext } from "@/components/promorang/SignatureObjects";
import { FillCardMoves } from "@/components/promocard/FillCardMoves";
import { StakeholderPutInPass } from "@/components/people/StakeholderLoop";
import { PromoCardActions } from "@/components/promocard/PromoCardActions";
import { CommunityCardLink } from "@/components/community/CommunityCardLink";
import { OfferIssuancePass } from "@/components/offers/OfferIssuancePass";
import type { OfferIssuance } from "@/hooks/useOffers";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import { localizeLens } from "@/i18n/localize";
import { ConsequenceReceipt, OpportunityCard, OutcomeSurface, PromoCardV2 } from "@/components/promorang-v2";

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

const primaryActionClass =
  "pr-v2-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black disabled:opacity-50";

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

function BenefitTicket({ perk, aim, onShowCode }: {
  perk: CardPerk;
  aim?: PromoCardAim | null;
  onShowCode?: (perk: CardPerk, trigger: HTMLButtonElement) => void;
}) {
  const { t } = useI18n();
  const usable = canShowCode(perk);
  const status = ownedBenefitStatus(perk as PromoCardPerk);
  const issuer = perk.issuer?.name || "PROMORANG partner";

  return (
    <article className="border-t border-[hsl(var(--pr-v2-stroke-soft))] py-5 first:border-t-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[hsl(var(--pr-v2-active-role))]">{ownedBenefitKicker(perk, aim)}</p>
          <h3 className="mt-1 text-xl font-bold tracking-[-0.025em] text-[hsl(var(--pr-v2-text-1))]">{perk.title}</h3>
          {perk.detail ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{perk.detail}</p> : null}
          <p className="mt-2 text-xs text-[hsl(var(--pr-v2-text-3))]">{issuer}{perk.sharedBy?.name ? ` · ${t("card.sharedBy", { name: perk.sharedBy.name })}` : ""}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[hsl(var(--pr-v2-stroke-strong))] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--pr-v2-text-2))]">{status}</span>
      </div>

      <dl className="mt-4 grid gap-x-5 gap-y-3 border-t border-[hsl(var(--pr-v2-stroke-soft))] pt-4 text-xs sm:grid-cols-3">
        <div><dt className="text-[hsl(var(--pr-v2-text-3))]">Eligibility</dt><dd className="mt-1 font-semibold text-[hsl(var(--pr-v2-text-1))]">{perk.eligibility?.who || t("card.claimedMembers")}</dd></div>
        <div><dt className="text-[hsl(var(--pr-v2-text-3))]">Availability</dt><dd className="mt-1 font-semibold text-[hsl(var(--pr-v2-text-1))]">{perk.availableQuantity == null ? t("card.openQty") : `${perk.availableQuantity} remaining`}</dd></div>
        <div><dt className="text-[hsl(var(--pr-v2-text-3))]">Expires</dt><dd className="mt-1 font-semibold text-[hsl(var(--pr-v2-text-1))]">{perk.expiresAt ? new Date(perk.expiresAt).toLocaleDateString() : t("card.whileSupplies")}</dd></div>
      </dl>

      {usable ? (
        <button type="button" onClick={(event) => onShowCode?.(perk, event.currentTarget)} className="pr-v2-focusable mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--pr-v2-radius-control)] border border-[hsl(var(--pr-v2-stroke-strong))] px-4 text-sm font-bold text-[hsl(var(--pr-v2-text-1))]">
          Show redemption code <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </article>
  );
}

export default function MyPromoCard() {
  const { t } = useI18n();
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
  const invitation = world?.invitation || world?.worldSystem?.invitation || resolveWorldInvitation({ identityLine: world?.identity?.line, nextHref: "/discover" });
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
  const qrPass = perks.map(issuanceForPerk).find((issuance) => issuance && isPresentablePass(issuance.offers.fulfillment_type, issuance.status) && issuance.offers.fulfillment_type === "qr") || null;
  const expiredPerks = perks.filter(isExpired);
  const livePerks = perks.filter((perk) => !isExpired(perk));
  const selectedExpired = selected ? isExpired(selected) : false;
  const selectedCode = perkCode(selected);
  const face = resolvePromoCardFace({
    holder: holder === "there" ? t("people.yourCard") : holder,
    useThis,
    nearbyCount: nearby.length,
    nextBenefitTitle: nextBenefit?.title,
    latestReturn: world?.latestReturn?.heading,
    latestReturnAt: world?.latestMemory?.issuedAt ? new Date(world.latestMemory.issuedAt).toLocaleDateString() : undefined,
    sceneMark: world?.promoCard?.sceneMark,
    crewMark: world?.promoCard?.crewMark,
    recordedUse: Boolean(useThis?.redemption?.recorded),
    expiredOnly: !useThis && livePerks.length === 0 && expiredPerks.length > 0,
  });
  const copy = ownedCardCopy({ aim, owned: Boolean(useThis), holder });
  const empty = fillCardCopy(aim);

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
      eyebrow="PROMOCARD"
      title={copy.title}
      description="Everything here should be usable, provable, or clearly on its way."
      backTo="/dashboard"
      className="pr-v2-canvas"
      actions={data ? (
        <button type="button" aria-label={t("card.refreshAria")} disabled={card.isFetching} onClick={() => void card.refetch()} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 rounded-[var(--pr-v2-radius-control)] border border-[hsl(var(--pr-v2-stroke-strong))] px-4 text-sm font-semibold text-[hsl(var(--pr-v2-text-2))] disabled:opacity-50">
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${card.isFetching ? "motion-safe:animate-spin" : ""}`} /> {t("common.refresh")}
        </button>
      ) : undefined}
    >
      {card.isLoading ? (
        <ExperienceLoading label={t("card.loading")} />
      ) : !data && card.isError ? (
        <QuietEmpty title={t("card.errorTitle")} copy={t("card.errorCopy")} action={<button type="button" className={primaryActionClass} disabled={card.isFetching} onClick={() => void card.refetch()}>{card.isFetching ? "Trying again…" : "Try again"}</button>} />
      ) : (
        <div className="space-y-12 pb-8">
          {card.isError ? <p role="status" className="border-y border-amber-200/20 bg-amber-200/5 px-4 py-3 text-sm text-amber-100">We couldn’t refresh your card. These are your last loaded details.</p> : null}

          <section aria-labelledby="promocard-object-title" className="grid gap-7 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div>
              <h2 id="promocard-object-title" className="sr-only">Your PromoCard</h2>
              <PromoCardV2 model={face} />
              {face.credential ? (
                <button type="button" onClick={() => setFlipped(true)} className="pr-v2-focusable mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">
                  Open credential <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="space-y-6">
              <div>
                <p className="pr-v2-eyebrow">Right now</p>
                <h2 className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">{useThis ? "One thing is ready to use" : "Put one useful thing on your card"}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{useThis ? "PROMORANG keeps the usable benefit and its proof path together so you do not have to decode the wider platform." : empty.description}</p>
              </div>
              <PromoCardActions useThis={useThis} nearbyCount={nearby.length} nextBenefit={nextBenefit} aim={aim} onUseThis={face.canFlip ? () => setFlipped(true) : undefined} />
            </div>
          </section>

          <section id="use-this" aria-labelledby="use-this-title" className="space-y-4">
            <div>
              <p className="pr-v2-eyebrow">Use now</p>
              <h2 id="use-this-title" className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">{useThis ? "Ready on your card" : "Nothing usable yet"}</h2>
            </div>
            {useThis ? (
              <OutcomeSurface><BenefitTicket perk={useThis} aim={aim} onShowCode={openPerk} /></OutcomeSurface>
            ) : qrPass ? (
              <OfferIssuancePass issuance={qrPass as OfferIssuance} />
            ) : (
              <div className="space-y-4">
                <QuietEmpty title={empty.title} copy={empty.description} action={<Link to={discoverHrefForAim(aim)} className={primaryActionClass}>{aim ? `Browse ${aim.label} perks` : "Browse live perks"} <ArrowRight className="h-4 w-4" /></Link>} />
                <FillCardMoves aim={aim} authenticated={Boolean(user)} />
              </div>
            )}
          </section>

          <section aria-labelledby="owned-benefits-title" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div><p className="pr-v2-eyebrow">What you have</p><h2 id="owned-benefits-title" className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">On the card</h2></div>
              <span className="text-sm text-[hsl(var(--pr-v2-text-3))]">{livePerks.length} active</span>
            </div>
            {livePerks.length ? (
              <OutcomeSurface className="py-0">
                {livePerks.map((perk) => {
                  const journey = journeyIssuance(perk);
                  return journey ? <div key={perk.id} className="py-5"><OfferIssuancePass issuance={journey as OfferIssuance} /></div> : <BenefitTicket key={perk.id} perk={perk} aim={aim} onShowCode={openPerk} />;
                })}
              </OutcomeSurface>
            ) : <QuietEmpty title="Nothing on the card yet" copy={aim ? `${aim.watchingLine} Unlocking puts it here.` : "When you unlock a benefit, it lands here."} />}
          </section>

          <section aria-labelledby="nearby-title" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div><p className="pr-v2-eyebrow">Nearby</p><h2 id="nearby-title" className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">Available to add</h2></div>
              <Link to={discoverHrefForAim(aim)} className="pr-v2-focusable min-h-11 py-3 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">See more</Link>
            </div>
            {nearby.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {nearby.slice(0, 4).map((perk: CardPerk) => (
                  <OpportunityCard key={perk.id} context={perk.issuer?.name || "PROMORANG partner"} status={perk.availableQuantity == null ? "Available" : `${perk.availableQuantity} left`} title={perk.title} description={perk.detail} proof="Merchant validates use" action={<Link to={perk.dropSlug ? `/drop/${perk.dropSlug}` : perk.href || "/discover"} className={primaryActionClass}>View benefit</Link>} />
                ))}
              </div>
            ) : <OutcomeSurface><p className="text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{useThis ? "Nothing else live nearby right now." : aim ? `Nothing live for ${aim.label} right now. You can still fill the card.` : "No participating businesses are sharing a live benefit right now."}</p><Link to={discoverHrefForAim(aim)} className="pr-v2-focusable mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">{aim ? `Find ${aim.label}` : "Open Discover"} <ArrowRight className="h-4 w-4" /></Link></OutcomeSurface>}
          </section>

          <section aria-labelledby="next-benefit-title" className="space-y-4">
            <div><p className="pr-v2-eyebrow">Repeat</p><h2 id="next-benefit-title" className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">What comes next</h2></div>
            {nextBenefit ? (
              <OpportunityCard context={nextBenefit.issuer?.name || "Next visit"} status="Next" title={nextBenefit.title} description="Use what is already on your card first. The next benefit is a reason to return." proof="Appears when the qualifying action is recorded" action={<Link to={discoverHrefForAim(aim)} className={primaryActionClass}>Find it nearby</Link>} />
            ) : <p className="text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{useThis ? "Use the one on your card. The next benefit appears after the qualifying action is recorded." : "Nothing is queued next until something lands on the card."}</p>}
          </section>

          {data?.repeatUse || Number(data?.points || 0) || Number(data?.keys || 0) ? (
            <section aria-labelledby="card-proof-title" className="space-y-4">
              <div><p className="pr-v2-eyebrow">Proof & value</p><h2 id="card-proof-title" className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">What the card has recorded</h2></div>
              <ConsequenceReceipt event="PromoCard history" lines={[
                { label: "PromoPoints", value: Number(data?.points || 0).toLocaleString() },
                { label: "PromoKeys", value: Number(data?.keys || 0) },
                ...(data?.repeatUse ? [
                  { label: "First redemptions", value: data.repeatUse.firstRedemptions },
                  { label: "Second uses", value: data.repeatUse.secondUses, emphasis: true },
                ] : []),
              ]} next={nextBenefit ? <Link to={discoverHrefForAim(aim)} className="font-bold text-black underline decoration-black/30 underline-offset-4">Find the next useful thing</Link> : undefined} />
            </section>
          ) : null}

          <details className="border-y border-[hsl(var(--pr-v2-stroke-soft))] py-4">
            <summary className="pr-v2-focusable min-h-11 cursor-pointer py-3 text-sm font-bold text-[hsl(var(--pr-v2-text-1))]">Tune what this card looks for</summary>
            <div className="pb-3 pt-2">
              <p className="text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{aim ? aim.watchingLine : "Optional. Filter Discover toward food, tonight, or a neighbourhood; the card still works without an aim."}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROMOCARD_AIMS.map((item) => {
                  const active = aim?.id === item.id;
                  return <button key={item.id} type="button" aria-pressed={active} onClick={() => chooseAim(item)} className={`pr-v2-focusable min-h-11 rounded-full border px-4 text-sm font-bold ${active ? "border-[hsl(var(--pr-v2-active-role))] bg-[hsl(var(--pr-v2-active-role))] text-black" : "border-[hsl(var(--pr-v2-stroke-strong))] text-[hsl(var(--pr-v2-text-2))]"}`}>{item.label}</button>;
                })}
              </div>
            </div>
          </details>

          <details className="border-b border-[hsl(var(--pr-v2-stroke-soft))] pb-4">
            <summary className="pr-v2-focusable min-h-11 cursor-pointer py-3 text-sm font-bold text-[hsl(var(--pr-v2-text-1))]">Community & world context</summary>
            <div className="space-y-4 pt-2">
              <CommunityCardLink />
              {stake.role !== "participant" ? <StakeholderPutInPass role={stake.role} /> : null}
              <PromoCardWorldContext scene={data?.memberships?.[0]?.title || null} season={data?.memberships?.length ? world?.slice?.seasonTitle : null} crew={world?.crew?.name} run={world?.crew?.runTitle ? `${world.crew.runTitle} · ${world.crew.runCompleted || 0}/${world.crew.runTotal || 0}` : null} pathCue={world?.path?.cue} identityLine={world?.identity?.line} formingLine={invitation.formingLine} latestReturn={world?.latestReturn?.heading} nearestUnlock={world?.promoCard?.nearestUnlock} latestPiece={world?.latestMemory?.title} />
              {data?.memberships?.length ? <div className="space-y-2">{data.memberships.map((item: { id: string; slug?: string; title: string; role: string }) => <Link key={item.id} to={item.slug ? `/scenes/${item.slug}` : "/scenes"} className="block border-t border-[hsl(var(--pr-v2-stroke-soft))] py-3 text-sm font-semibold text-[hsl(var(--pr-v2-text-1))]">{item.title}<span className="ml-2 text-xs font-normal uppercase tracking-wider text-[hsl(var(--pr-v2-text-3))]">{item.role}</span></Link>)}</div> : <Link to="/scenes" className="inline-flex min-h-11 items-center text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">Find a community</Link>}
            </div>
          </details>

          {expiredPerks.length ? <details className="border-b border-[hsl(var(--pr-v2-stroke-soft))] pb-4"><summary className="pr-v2-focusable min-h-11 cursor-pointer py-3 text-sm font-bold text-[hsl(var(--pr-v2-text-2))]">Expired benefits ({expiredPerks.length})</summary><ul className="divide-y divide-[hsl(var(--pr-v2-stroke-soft))]">{expiredPerks.map((perk) => <li key={perk.id} className="py-3 text-sm text-[hsl(var(--pr-v2-text-2))]">{perk.title}<span className="ml-2 text-xs text-[hsl(var(--pr-v2-text-3))]">Expired</span></li>)}</ul></details> : null}

          <Link to={to("/dashboard")} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[hsl(var(--pr-v2-text-2))]">Back to Today <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}

      <Dialog open={Boolean(selected) || flipped} onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
          setFlipped(false);
          setCopyState("idle");
        }
      }}>
        <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }} className="max-h-[90dvh] overflow-y-auto rounded-[var(--pr-v2-radius-object)] border-[hsl(var(--pr-v2-stroke-strong))] bg-[hsl(var(--pr-v2-surface-1))] text-[hsl(var(--pr-v2-text-1))] sm:max-w-md">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[hsl(var(--pr-v2-active-role))]">On your PromoCard</p>
          <DialogTitle className="break-words pr-5 text-2xl font-bold tracking-[-0.03em]">{selected?.title || face.headline}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{selected?.detail || face.detail || "Show this only when you are ready to use it."}</DialogDescription>
          {(selectedCode && selected && !selectedExpired && canShowCode(selected)) || (!selected && face.credential) ? (
            <div className="mt-2 rounded-[var(--pr-v2-radius-module)] border border-[hsl(var(--pr-v2-active-role)/0.3)] bg-[hsl(var(--pr-v2-active-role)/0.08)] p-5 text-center">
              <p className="text-sm text-[hsl(var(--pr-v2-text-2))]">Show this code to redeem</p>
              <code className="my-5 block select-all break-all font-mono text-3xl font-bold tracking-wider">{selectedCode || face.credential}</code>
              <button type="button" onClick={() => {
                if (selected) void copyCode();
                else if (face.credential) void navigator.clipboard.writeText(face.credential).then(() => setCopyState("copied"), () => setCopyState("failed"));
              }} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 rounded-[var(--pr-v2-radius-control)] border border-[hsl(var(--pr-v2-stroke-strong))] px-4 text-sm font-semibold">
                {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copyState === "copied" ? "Copied" : "Copy code"}
              </button>
              <p role="status" className="mt-2 text-xs text-[hsl(var(--pr-v2-text-3))]">{copyState === "failed" ? "Couldn’t copy. You can select the code or show this screen." : copyState === "copied" ? "Code copied to clipboard." : "Only share this code when redeeming your benefit."}</p>
            </div>
          ) : selected ? <p className="rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-surface-3))] p-4 text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{selectedExpired ? "This benefit has expired. Explore Discover for something new." : "This benefit has no usable code yet. Follow its fulfilment instructions instead."}</p> : null}
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}
