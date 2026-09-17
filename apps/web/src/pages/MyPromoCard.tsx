import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Copy, RefreshCw } from "lucide-react";
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
import { PromoCardFace, PromoCardWorldContext } from "@/components/promorang/SignatureObjects";
import { FillCardMoves } from "@/components/promocard/FillCardMoves";
import { StakeholderPutInPass } from "@/components/people/StakeholderLoop";
import { PromoCardActions } from "@/components/promocard/PromoCardActions";
import { CommunityCardLink } from "@/components/community/CommunityCardLink";
import { OfferIssuancePass } from "@/components/offers/OfferIssuancePass";
import type { OfferIssuance } from "@/hooks/useOffers";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import { localizeLens } from "@/i18n/localize";

type CardPerk = {
  id: string;
  title: string;
  detail?: string;
  redemptionCode?: string | null;
  expiresAt?: string | null;
  fulfillmentState?: string;
  fulfillmentType?: string | null;
  issuer?: { name?: string };
  eligibility?: { who?: string };
  availableQuantity?: number | null;
  redemption?: { recorded?: boolean; code?: string | null };
  sharedBy?: { name?: string };
  dropSlug?: string;
  href?: string;
  issuance?: PromoCardPerk["issuance"];
};

const actionClass = "experience-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-black disabled:opacity-50";

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

function BenefitTicket({ perk, aim, onShowCode }: { perk: CardPerk; aim?: PromoCardAim | null; onShowCode?: (perk: CardPerk, trigger: HTMLButtonElement) => void }) {
  const usable = canShowCode(perk);
  return (
    <article className="relative overflow-hidden border-y border-white/10 py-5">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{ownedBenefitKicker(perk, aim)}</p>
          <h3 className="mt-2 max-w-2xl font-serif text-3xl font-bold leading-[0.95] tracking-[-0.035em] text-white">{perk.title}</h3>
          {perk.detail ? <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">{perk.detail}</p> : null}
          <p className="mt-3 text-xs text-white/35">
            {[perk.issuer?.name, ownedBenefitStatus(perk as PromoCardPerk), perk.availableQuantity != null ? `${perk.availableQuantity} left` : null].filter(Boolean).join(" · ")}
          </p>
        </div>
        {usable ? (
          <button type="button" onClick={(event) => onShowCode?.(perk, event.currentTarget)} className={actionClass}>
            Show this <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
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
  const livePerks = perks.filter((perk) => !isExpired(perk));
  const expiredPerks = perks.filter(isExpired);
  const useThis = selectOwnedUseThis({
    aim,
    useThis: data?.useThis || null,
    benefits: (data?.benefits || perks || []) as PromoCardPerk[],
  }) || [...(data?.benefits || []), ...perks].find((item: CardPerk) => canShowCode(item)) || null;
  const nearby = sortBenefitsByAim(data?.nearby || [], aim);
  const nextBenefit = data?.nextBenefit || nearby[0] || null;
  const qrPass = perks.map(issuanceForPerk).find((issuance) => issuance && isPresentablePass(issuance.offers.fulfillment_type, issuance.status) && issuance.offers.fulfillment_type === "qr") || null;
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
      eyebrow="YOUR CREDENTIAL"
      title={copy.title}
      description={stake.promoCard.meaning}
      backTo="/dashboard"
      actions={data ? (
        <button type="button" aria-label={t("card.refreshAria")} disabled={card.isFetching} onClick={() => void card.refetch()} className="inline-flex min-h-10 items-center gap-2 self-start text-xs font-bold uppercase tracking-[0.14em] text-white/40 disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${card.isFetching ? "motion-safe:animate-spin" : ""}`} /> Refresh
        </button>
      ) : undefined}
    >
      {card.isLoading ? <ExperienceLoading label={t("card.loading")} /> : !data && card.isError ? (
        <QuietEmpty title={t("card.errorTitle")} copy={t("card.errorCopy")} action={<button type="button" className={actionClass} disabled={card.isFetching} onClick={() => void card.refetch()}>Try again</button>} />
      ) : (
        <>
          {card.isError ? <p role="status" className="border-y border-amber-200/20 py-3 text-sm text-amber-100">We couldn’t refresh your card. These are your last loaded details.</p> : null}

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,.75fr)] lg:items-center">
            <PromoCardFace
              className="max-w-none"
              model={face}
              flipped={flipped}
              onFlip={() => setFlipped((value) => !value)}
              onCopy={() => {
                if (!face.credential) return;
                void navigator.clipboard.writeText(face.credential).then(() => setCopyState("copied"), () => setCopyState("failed"));
              }}
              copyState={copyState}
              lastLoaded={Boolean(card.isError && face.credential)}
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Use now</p>
              {useThis ? (
                <>
                  <h2 className="mt-3 font-serif text-4xl font-bold leading-[0.92] tracking-[-0.045em] text-white">{useThis.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-white/50">{useThis.detail || "Present the card when you are ready. Nothing is used until the recorded validation happens."}</p>
                  {canShowCode(useThis) ? <button type="button" onClick={(event) => openPerk(useThis, event.currentTarget)} className={`${actionClass} mt-6`}>Show this <ArrowRight className="h-4 w-4" /></button> : null}
                </>
              ) : qrPass ? (
                <OfferIssuancePass issuance={qrPass as OfferIssuance} />
              ) : (
                <>
                  <h2 className="mt-3 font-serif text-4xl font-bold leading-[0.92] tracking-[-0.045em] text-white">{empty.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-white/50">{empty.description}</p>
                  <Link to={discoverHrefForAim(aim)} className={`${actionClass} mt-6`}>{aim ? `Browse ${aim.label}` : "Find something for the card"}<ArrowRight className="h-4 w-4" /></Link>
                </>
              )}
              <PromoCardActions useThis={useThis} nearbyCount={nearby.length} nextBenefit={nextBenefit} aim={aim} onUseThis={face.canFlip ? () => setFlipped(true) : undefined} />
            </div>
          </section>

          <section className="grid gap-5 border-t border-white/10 pt-8 lg:grid-cols-2">
            <CommunityCardLink />
            <PromoCardWorldContext
              scene={data?.memberships?.[0]?.title || null}
              season={data?.memberships?.length ? world?.slice?.seasonTitle : null}
              crew={world?.crew?.name}
              run={world?.crew?.runTitle ? `${world.crew.runTitle} · ${world.crew.runCompleted || 0}/${world.crew.runTotal || 0}` : null}
              pathCue={world?.path?.cue}
              identityLine={world?.identity?.line}
              formingLine={invitation.formingLine}
              latestReturn={world?.latestReturn?.heading}
              nearestUnlock={world?.promoCard?.nearestUnlock}
              latestPiece={world?.latestMemory?.title}
            />
          </section>

          {stake.role !== "participant" ? <StakeholderPutInPass role={stake.role} /> : null}

          <section className="border-t border-white/10 pt-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">What this opens</p>
                <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em] text-white">Access around you.</h2>
              </div>
              <Link to={discoverHrefForAim(aim)} className="text-sm font-bold text-primary">Discover more →</Link>
            </div>
            {nearby.length ? (
              <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {nearby.slice(0, 4).map((perk: CardPerk) => (
                  <Link key={perk.id} to={perk.dropSlug ? `/drop/${perk.dropSlug}` : perk.href || "/discover"} className="group grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{perk.issuer?.name || "Live access"}</p><p className="mt-1 font-serif text-2xl font-bold text-white group-hover:text-primary">{perk.title}</p></div>
                    <p className="text-xs text-white/35">{perk.availableQuantity == null ? "Open quantity" : `${perk.availableQuantity} left`}</p>
                  </Link>
                ))}
              </div>
            ) : <p className="mt-6 border-y border-white/10 py-6 text-sm text-white/45">Nothing else live nearby right now. Empty means empty—we won’t substitute sample access.</p>}
          </section>

          <section className="grid gap-6 border-t border-white/10 pt-9 lg:grid-cols-[1fr_.7fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d48a]">Next opening</p>
              {nextBenefit ? <><h2 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em]">{nextBenefit.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/45">Use what is already on your card. This is the next recorded opportunity—not a promised reward.</p></> : <><h2 className="mt-2 font-serif text-3xl font-bold">Nothing queued yet.</h2><p className="mt-3 text-sm text-white/45">A new opening appears only when there is real supply or an issued consequence.</p></>}
            </div>
            <Link to={to("/vault")} className="group border-l border-white/10 pl-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">What stayed with you</p><p className="mt-2 font-serif text-3xl font-bold">Open your Vault</p><p className="mt-3 text-sm text-white/45">Kept proof, possessed access and recorded chance live there.</p><span className="mt-4 inline-flex text-sm font-bold text-primary group-hover:translate-x-1">Open Vault →</span></Link>
          </section>

          <details className="border-t border-white/10 pt-6 text-white/55">
            <summary className="cursor-pointer py-3 text-xs font-black uppercase tracking-[0.18em] text-white/40">Card controls & history</summary>
            <div className="grid gap-6 py-5 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold text-white">Aim Discover</p>
                <p className="mt-1 text-xs leading-5 text-white/40">Optional. This changes what Discover prioritises; it does not change your canonical card state.</p>
                <div className="mt-3 flex flex-wrap gap-2">{PROMOCARD_AIMS.map((item) => <button key={item.id} type="button" aria-pressed={aim?.id === item.id} onClick={() => applied.chooseAim(item)} className={`min-h-9 rounded-full border px-3 text-xs font-bold ${aim?.id === item.id ? "border-[#f6d48a] bg-[#f6d48a] text-black" : "border-white/15 text-white/60"}`}>{item.label}</button>)}</div>
                {!useThis ? <div className="mt-5"><FillCardMoves aim={aim} authenticated={Boolean(user)} /></div> : null}
              </div>
              <div className="space-y-4 text-sm">
                <p><span className="text-white/35">PromoPoints</span><br/><strong className="font-serif text-2xl text-white">{Number(data?.points || 0).toLocaleString()}</strong></p>
                <p><span className="text-white/35">PromoKeys</span><br/><strong className="text-white">{Number(data?.keys || 0).toLocaleString()}</strong></p>
                <p><span className="text-white/35">Memberships</span><br/><strong className="text-white">{data?.memberships?.length || 0}</strong></p>
                {expiredPerks.length ? <p className="text-white/35">{expiredPerks.length} expired perk{expiredPerks.length === 1 ? "" : "s"} retained in history.</p> : null}
              </div>
            </div>
          </details>
        </>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) { setSelected(null); setCopyState("idle"); } }}>
        <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }} className="max-h-[90dvh] overflow-y-auto rounded-3xl border-white/15 bg-[#141313] text-white sm:max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">On your PromoCard</p>
          <DialogTitle className="break-words pr-5 font-serif text-3xl">{selected?.title}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/70">{selected?.detail || "Show this to the merchant. Nothing is used until they validate it."}</DialogDescription>
          {selectedCode && !selectedExpired && canShowCode(selected) ? (
            <div className="mt-2 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-center">
              <p className="text-sm text-white/80">Show this code to redeem</p>
              <code className="my-5 block select-all break-all font-mono text-3xl font-bold tracking-wider">{selectedCode}</code>
              <button type="button" onClick={() => void copyCode()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold">{copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copyState === "copied" ? "Copied" : "Copy code"}</button>
              <p role="status" className="mt-2 text-xs text-white/65">{copyState === "failed" ? "Couldn’t copy. You can select the code or show this screen." : copyState === "copied" ? "Code copied to clipboard." : "Only share this code when redeeming your perk."}</p>
            </div>
          ) : <p className="rounded-2xl bg-white/5 p-4 text-sm leading-6 text-white/70">{selectedExpired ? "This perk has expired. Explore Discover for something new." : "This perk has no usable code yet. A claimed, unexpired benefit is the only thing a merchant can validate."}</p>}
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}
