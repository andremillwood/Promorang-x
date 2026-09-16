import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Copy, RefreshCw, Sparkles } from "lucide-react";
import {
  discoverHrefForAim,
  firstGivenName,
  getStakeholderLens,
  issuanceFromPromoCardPerk,
  isPresentablePass,
  ownedBenefitKicker,
  ownedBenefitStatus,
  fillCardCopy,
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
};

const primaryActionClass = "pr-v2-focusable pr-v2-primary-cta inline-flex items-center justify-center gap-2 px-5";

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
  if (["qr", "shipping", "manual", "automatic"].includes(type)) return false;
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

function BenefitRow({ perk, aim, onShowCode }: { perk: CardPerk; aim?: PromoCardAim | null; onShowCode?: (perk: CardPerk, trigger: HTMLButtonElement) => void }) {
  const { t } = useI18n();
  const issuer = perk.issuer?.name || "PROMORANG partner";
  const status = ownedBenefitStatus(perk as PromoCardPerk);
  return (
    <article className="grid gap-4 border-t border-white/10 py-5 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="pr-v2-kicker">{ownedBenefitKicker(perk, aim)}</p>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[.12em] text-white/45">{status}</span>
        </div>
        <h3 className="mt-2 font-serif text-xl font-semibold tracking-[-.03em] text-white">{perk.title}</h3>
        <p className="mt-1 text-sm text-white/48">{issuer}{perk.sharedBy?.name ? ` · ${t("card.sharedBy", { name: perk.sharedBy.name })}` : ""}</p>
      </div>
      {canShowCode(perk) ? (
        <button type="button" onClick={(event) => onShowCode?.(perk, event.currentTarget)} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#ff7847]">
          Use now <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
  const useThis = selectOwnedUseThis({ aim, useThis: data?.useThis || null, benefits: (data?.benefits || perks || []) as PromoCardPerk[] })
    || [...(data?.benefits || []), ...perks].find((item: CardPerk) => canShowCode(item))
    || null;
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
  const empty = fillCardCopy(aim);

  useEffect(() => {
    if (face.credential) sessionStorage.setItem("promorang.promocard.lastCredential", face.credential);
  }, [face.credential]);

  async function copyCode() {
    const code = selectedCode || face.credential;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
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
      eyebrow="YOUR PROMOCARD"
      title="Culture moves with you."
      description="What you can use, where it works, and what opened because you showed up."
      backTo="/dashboard"
      className="pr-v2-canvas"
      actions={data ? (
        <button type="button" aria-label={t("card.refreshAria")} disabled={card.isFetching} onClick={() => void card.refetch()} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold text-white/55 disabled:opacity-50">
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${card.isFetching ? "motion-safe:animate-spin" : ""}`} /> Refresh
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

          <section className="pr-v2-cinematic-hero relative overflow-hidden p-5 sm:p-7 lg:p-9">
            <div className="grid gap-6 lg:grid-cols-[minmax(320px,.9fr)_minmax(0,1fr)] lg:items-center">
              <div>
                <PromoCardV2 model={face} />
                {face.credential ? <button type="button" onClick={() => setFlipped(true)} className="pr-v2-focusable mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#ff7847]">Open credential <ArrowRight className="h-4 w-4" /></button> : null}
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/35 p-5 backdrop-blur-md sm:p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#f0bd72]" aria-hidden="true" />
                  <p className="pr-v2-kicker">{useThis ? "Ready now" : "Your next opening"}</p>
                </div>
                <h2 className="mt-3 font-serif text-3xl font-semibold tracking-[-.04em] text-white sm:text-4xl">{useThis?.title || empty.title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">{useThis?.detail || empty.description}</p>
                {useThis?.issuer?.name ? <p className="mt-3 text-xs font-bold uppercase tracking-[.13em] text-white/38">{useThis.issuer.name}</p> : null}
                <div className="mt-6">
                  {useThis && face.canFlip ? (
                    <button type="button" onClick={() => setFlipped(true)} className={primaryActionClass}>Use this now <ArrowRight className="h-4 w-4" /></button>
                  ) : qrPass ? (
                    <OfferIssuancePass issuance={qrPass as OfferIssuance} />
                  ) : (
                    <Link to={discoverHrefForAim(aim)} className={primaryActionClass}>{aim ? `Find ${aim.label}` : "Find something useful"} <ArrowRight className="h-4 w-4" /></Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="owned-benefits-title" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div><p className="pr-v2-kicker">In your possession</p><h2 id="owned-benefits-title" className="pr-v2-editorial-heading mt-2 text-white">On your card</h2></div>
              <span className="text-sm text-white/38">{livePerks.length} active</span>
            </div>
            {livePerks.length ? (
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.025] px-5">
                {livePerks.map((perk) => {
                  const journey = journeyIssuance(perk);
                  return journey ? <div key={perk.id} className="py-5"><OfferIssuancePass issuance={journey as OfferIssuance} /></div> : <BenefitRow key={perk.id} perk={perk} aim={aim} onShowCode={openPerk} />;
                })}
              </div>
            ) : (
              <QuietEmpty title="Nothing on the card yet" copy="When you unlock something useful, it lands here." />
            )}
          </section>

          <section aria-labelledby="nearby-title" className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div><p className="pr-v2-kicker">Close enough to use</p><h2 id="nearby-title" className="pr-v2-editorial-heading mt-2 text-white">Available nearby</h2></div>
              <Link to={discoverHrefForAim(aim)} className="pr-v2-focusable min-h-11 py-3 text-xs font-black uppercase tracking-[.16em] text-[#d6ad69]">See more</Link>
            </div>
            {nearby.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {nearby.slice(0, 4).map((perk: CardPerk) => (
                  <OpportunityCard
                    key={perk.id}
                    eyebrow={perk.issuer?.name || "PROMORANG partner"}
                    status={perk.availableQuantity == null ? "Available" : `${perk.availableQuantity} left`}
                    title={perk.title}
                    description={perk.detail}
                    proof="Verified when used"
                    actionLabel="View benefit"
                    action={<Link to={perk.dropSlug ? `/drop/${perk.dropSlug}` : perk.href || "/discover"} className="font-bold">View benefit</Link>}
                  />
                ))}
              </div>
            ) : (
              <OutcomeSurface><p className="text-sm leading-6 text-white/55">Nothing else live nearby right now.</p><Link to={discoverHrefForAim(aim)} className="pr-v2-focusable mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#ff7847]">Open Discover <ArrowRight className="h-4 w-4" /></Link></OutcomeSurface>
            )}
          </section>

          {(data?.repeatUse || Number(data?.points || 0) || Number(data?.keys || 0) || world?.latestReturn) ? (
            <section aria-labelledby="card-proof-title" className="space-y-4">
              <div><p className="pr-v2-kicker">What changed</p><h2 id="card-proof-title" className="pr-v2-editorial-heading mt-2 text-white">Your card remembers</h2></div>
              <ConsequenceReceipt event="PromoCard history" lines={[
                { label: "PromoPoints", value: Number(data?.points || 0).toLocaleString() },
                { label: "PromoKeys", value: Number(data?.keys || 0) },
                ...(data?.repeatUse ? [
                  { label: "First uses", value: data.repeatUse.firstRedemptions },
                  { label: "Returns", value: data.repeatUse.secondUses, emphasis: true },
                ] : []),
              ]} next={nextBenefit ? <Link to={discoverHrefForAim(aim)} className="font-bold text-black underline decoration-black/30 underline-offset-4">See what opened next</Link> : undefined} />
            </section>
          ) : null}

          <details className="rounded-[1rem] border border-white/10 bg-white/[0.02] px-5 py-2">
            <summary className="pr-v2-focusable min-h-11 cursor-pointer py-3 text-sm font-bold text-white/70">More from your card</summary>
            <div className="space-y-6 border-t border-white/8 pb-4 pt-5">
              <div>
                <p className="text-sm leading-6 text-white/50">{aim ? aim.watchingLine : "Optionally tell PROMORANG what you want the card to notice more often."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PROMOCARD_AIMS.map((item) => {
                    const active = aim?.id === item.id;
                    return <button key={item.id} type="button" aria-pressed={active} onClick={() => chooseAim(item)} className={`pr-v2-focusable min-h-11 rounded-full border px-4 text-sm font-bold ${active ? "border-[#ff6b35]/55 bg-[#ff6b35]/12 text-[#ff895e]" : "border-white/10 text-white/52"}`}>{item.label}</button>;
                  })}
                </div>
              </div>
              <CommunityCardLink />
              {stake.role !== "participant" ? <StakeholderPutInPass role={stake.role} /> : null}
              <PromoCardWorldContext scene={data?.memberships?.[0]?.title || null} season={data?.memberships?.length ? world?.slice?.seasonTitle : null} crew={world?.crew?.name} run={world?.crew?.runTitle ? `${world.crew.runTitle} · ${world.crew.runCompleted || 0}/${world.crew.runTotal || 0}` : null} pathCue={world?.path?.cue} identityLine={world?.identity?.line} formingLine={invitation.formingLine} latestReturn={world?.latestReturn?.heading} nearestUnlock={world?.promoCard?.nearestUnlock} latestPiece={world?.latestMemory?.title} />
              {expiredPerks.length ? <p className="text-xs text-white/38">{expiredPerks.length} expired benefit{expiredPerks.length === 1 ? "" : "s"} kept in history.</p> : null}
            </div>
          </details>

          {!useThis && !qrPass ? <FillCardMoves aim={aim} authenticated={Boolean(user)} /> : null}
          <Link to={to("/dashboard")} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/52">Back to Today <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}

      <Dialog open={Boolean(selected) || flipped} onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
          setFlipped(false);
          setCopyState("idle");
        }
      }}>
        <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }} className="max-h-[90dvh] overflow-y-auto rounded-[var(--pr-v2-radius-object)] border-white/12 bg-[#0a0d11] text-white sm:max-w-md">
          <p className="pr-v2-kicker">On your PromoCard</p>
          <DialogTitle className="break-words pr-5 font-serif text-3xl font-semibold tracking-[-0.04em]">{selected?.title || face.headline}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/55">{selected?.detail || face.detail || "Show this only when you are ready to use it."}</DialogDescription>
          {(selectedCode && selected && !selectedExpired && canShowCode(selected)) || (!selected && face.credential) ? (
            <div className="mt-2 rounded-[1.1rem] border border-[#d99a4e]/25 bg-[#d99a4e]/8 p-5 text-center">
              <p className="text-sm text-white/50">Show this code to redeem</p>
              <code className="my-5 block select-all break-all font-mono text-3xl font-bold tracking-wider">{selectedCode || face.credential}</code>
              <button type="button" onClick={() => void copyCode()} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold">
                {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copyState === "copied" ? "Copied" : "Copy code"}
              </button>
              <p role="status" className="mt-2 text-xs text-white/38">{copyState === "failed" ? "Couldn’t copy. You can select the code or show this screen." : copyState === "copied" ? "Code copied to clipboard." : "Only share this code when redeeming your benefit."}</p>
            </div>
          ) : selected ? <p className="rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-white/55">{selectedExpired ? "This benefit has expired. Explore Discover for something new." : "This benefit has no usable code yet. Follow its fulfilment instructions instead."}</p> : null}
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}
