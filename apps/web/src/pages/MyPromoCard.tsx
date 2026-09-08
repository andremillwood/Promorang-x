import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Copy,
  MapPin,
  RefreshCw,
  Sparkles,
  Ticket,
} from "lucide-react";
import { firstGivenName, issuanceFromPromoCardPerk, isPresentablePass, resolvePromoCardFace, type PromoCardPerk } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome, useMyPromoCard } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import {
  ExperienceShell,
  ExperienceLoading,
  QuietEmpty,
} from "@/components/people/ExperienceShell";
import { PromoCardFace, PromoCardWorldContext } from "@/components/promorang/SignatureObjects";
import { PromoCardActions } from "@/components/promocard/PromoCardActions";
import { OfferIssuancePass } from "@/components/offers/OfferIssuancePass";
import type { OfferIssuance } from "@/hooks/useOffers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

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
  onShowCode,
}: {
  perk: CardPerk;
  action?: string;
  onShowCode?: (perk: CardPerk, trigger: HTMLButtonElement) => void;
}) {
  const usable = canShowCode(perk);
  return (
    <article className="rounded-[1.4rem] border border-white/10 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            {perk.fromDiscover ? "From Discover" : perk.issuer?.name || "Participating business"}
          </p>
          <p className="mt-1 font-serif text-xl font-bold">{perk.title}</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/50">
          {perk.fulfillmentState || perk.status || "Claimed"}
        </span>
      </div>
      {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/45">
        <div>
          <dt className="uppercase tracking-widest">Eligibility</dt>
          <dd className="mt-0.5 text-white/70">{perk.eligibility?.who || "Claimed members"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">Remaining</dt>
          <dd className="mt-0.5 text-white/70">{perk.availableQuantity == null ? "Open" : perk.availableQuantity}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">Expires</dt>
          <dd className="mt-0.5 text-white/70">{perk.expiresAt ? new Date(perk.expiresAt).toLocaleDateString() : "While supplies last"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">Redemption</dt>
          <dd className="mt-0.5 text-white/70">{perk.redemption?.recorded ? "Recorded" : "Waiting on the merchant"}</dd>
        </div>
      </dl>
      {usable ? (
        <button
          type="button"
          onClick={(event) => onShowCode?.(perk, event.currentTarget)}
          className="experience-interactive mt-4 flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-100"
          aria-label={`${perkCode(perk) ? "Show code for" : "View"} ${perk.title}`}
        >
          {action || "Show redemption code"}
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
      ) : null}
      {perk.sharedBy?.name ? <p className="mt-2 text-xs text-white/40">Shared by {perk.sharedBy.name}</p> : null}
    </article>
  );
}

export default function MyPromoCard() {
  const { user, profile } = useAuth();
  const card = useMyPromoCard();
  const home = useExperienceHome();
  const to = useExperiencePath();
  const world = home.data?.world;
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
  const useThis = data?.useThis || data?.benefits?.find((item: CardPerk) => canShowCode(item)) || null;
  const nearby = data?.nearby || [];
  const nextBenefit = data?.nextBenefit || nearby[0] || null;
  const perks: CardPerk[] = data?.perks || [];
  const qrPass = perks
    .map(issuanceForPerk)
    .find((issuance) => issuance && isPresentablePass(issuance.offers.fulfillment_type, issuance.status) && issuance.offers.fulfillment_type === "qr") || null;
  const expiredPerks = perks.filter(isExpired);
  const livePerks = perks.filter((perk) => !isExpired(perk));
  const selectedExpired = selected ? isExpired(selected) : false;
  const selectedCode = perkCode(selected);
  const face = resolvePromoCardFace({
    holder: holder === "there" ? "Your card" : holder,
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
      eyebrow="PromoCard"
      title="Use what’s on the card"
      description="A merchant supplied it. An ambassador shared it. You claim it. The merchant validates it. That is the only completion."
      backTo="/dashboard"
      actions={
        data ? (
          <button
            type="button"
            aria-label="Refresh your card"
            disabled={card.isFetching}
            onClick={() => void card.refetch()}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-white/15 px-4 text-sm text-white/70 disabled:opacity-50"
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-4 w-4 ${card.isFetching ? "motion-safe:animate-spin" : ""}`}
            />
            Refresh
          </button>
        ) : undefined
      }
    >
      {card.isLoading ? (
        <ExperienceLoading label="Getting your card ready…" />
      ) : !data && card.isError ? (
        <QuietEmpty
          title="Your card couldn’t load"
          copy="Try again to see your live perks and claimed benefits."
          action={
            <button
              type="button"
              className={actionClass}
              disabled={card.isFetching}
              onClick={() => void card.refetch()}
            >
              {card.isFetching ? "Trying again…" : "Try again"}
            </button>
          }
        />
      ) : (
        <>
          {card.isError ? (
            <p role="status" className="rounded-2xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm text-amber-100">
              We couldn’t refresh your card. These are your last loaded details.
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

          <PromoCardWorldContext
            scene={world?.slice?.sceneTitle}
            season={world?.slice?.seasonTitle}
            crew={world?.crew?.name}
            run={
              world?.crew?.runTitle
                ? `${world.crew.runTitle} · ${world.crew.runCompleted || 0}/${world.crew.runTotal || 0}`
                : null
            }
            pathCue={world?.path?.cue}
            latestReturn={world?.latestReturn?.heading}
            nearestUnlock={world?.promoCard?.nearestUnlock}
            latestPiece={world?.latestMemory?.title}
          />

          <PromoCardActions
            useThis={useThis}
            nearbyCount={nearby.length}
            nextBenefit={nextBenefit}
            onUseThis={face.canFlip ? () => setFlipped(true) : undefined}
          />

          <section id="use-this">
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Ticket className="h-5 w-5 text-primary" /> Use this</h2>
            {useThis ? (
              <div className="mt-3">
                <BenefitTicket perk={useThis} action="Show redemption code" onShowCode={openPerk} />
              </div>
            ) : qrPass ? (
              <div className="mt-3">
                <OfferIssuancePass issuance={qrPass as OfferIssuance} />
              </div>
            ) : (
              <div className="mt-3">
                <QuietEmpty
                  title="Nothing to use yet"
                  copy="Claim a benefit an ambassador shared, then show it at the merchant."
                  action={
                    <Link to="/discover?tab=perks" className={actionClass}>
                      Find your first perk <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  }
                />
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><MapPin className="h-5 w-5 text-primary" /> Available nearby</h2>
              <Link to="/discover" className="text-sm font-bold text-primary">See more</Link>
            </div>
            {nearby.length ? (
              <div className="mt-3 space-y-2">
                {nearby.map((perk: CardPerk) => (
                  <Link key={perk.id} to={perk.dropSlug ? `/drop/${perk.dropSlug}` : perk.href || "/discover"} className="block rounded-[1.4rem] border border-white/10 px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{perk.issuer?.name}</p>
                    <p className="mt-1 font-serif text-xl font-bold">{perk.title}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {perk.availableQuantity == null ? "Open quantity" : `${perk.availableQuantity} left`}
                      {perk.expiresAt ? ` · until ${new Date(perk.expiresAt).toLocaleDateString()}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <Link to="/discover" className="mt-3 block rounded-[1.4rem] border border-white/10 px-4 py-4 text-sm text-white/60">
                No participating businesses are sharing a live benefit right now. Discover what’s happening.
              </Link>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Sparkles className="h-5 w-5 text-primary" /> Get your next benefit</h2>
            {nextBenefit ? (
              <article className="mt-3 rounded-[1.4rem] border border-primary/30 bg-primary/10 px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{nextBenefit.issuer?.name || "Next visit"}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{nextBenefit.title}</p>
                <p className="mt-2 text-sm text-white/60">After this one is validated, come back for this. That is the reason to stay in PROMORANG.</p>
                <Link to="/discover" className="mt-4 inline-flex min-h-11 items-center text-sm font-black text-primary">Find it nearby</Link>
              </article>
            ) : (
              <p className="mt-3 text-sm text-white/50">Use a live perk first. The next benefit appears after a merchant records it.</p>
            )}
          </section>

          <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Points and membership</p>
            <p className="mt-2 font-serif text-3xl font-bold">{Number(data?.points || 0).toLocaleString()} PromoPoints</p>
            <p className="mt-1 text-sm text-white/55">{Number(data?.keys || 0)} PromoKeys · earned only after verified use</p>
            {data?.repeatUse ? (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/50">
                <div><dt>First redemptions</dt><dd className="text-white">{data.repeatUse.firstRedemptions}</dd></div>
                <div><dt>Second uses</dt><dd className="text-white">{data.repeatUse.secondUses}</dd></div>
                <div><dt>Referred users who redeemed</dt><dd className="text-white">{data.repeatUse.referredUsersWhoRedeem}</dd></div>
                <div><dt>Contributor rewards</dt><dd className="text-white">{data.repeatUse.contributorRewards?.pointsAwarded || 0} pts</dd></div>
              </dl>
            ) : null}
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold">On the card</h2>
            {perks.filter((perk) => !isExpired(perk)).length ? (
              <div className="mt-3 space-y-2">
                {perks.filter((perk) => !isExpired(perk)).map((perk) => {
                  const journey = journeyIssuance(perk);
                  return journey ? (
                    <OfferIssuancePass key={perk.id} issuance={journey as OfferIssuance} />
                  ) : (
                    <BenefitTicket key={perk.id} perk={perk} onShowCode={openPerk} />
                  );
                })}
              </div>
            ) : (
              <div className="mt-3">
                <QuietEmpty title="No perks yet" copy="When someone drops something for you, or Discover opens a claimed perk, it lands here." />
              </div>
            )}
          </section>

          {expiredPerks.length ? (
            <details className="rounded-2xl border border-white/10 p-4 text-white/65">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
                Expired perks ({expiredPerks.length})
              </summary>
              <ul className="mt-3 space-y-3">
                {expiredPerks.map((perk) => (
                  <li key={perk.id} className="border-t border-white/10 pt-3 text-sm">
                    {perk.title}
                    <span className="ml-2 text-xs text-white/50">Expired</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <section>
            <h2 className="font-serif text-2xl font-bold">Memberships</h2>
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
              <Link to="/scenes" className="mt-3 block text-sm font-bold text-primary">Find a community</Link>
            )}
          </section>

          <Link
            to={to("/dashboard")}
            className="inline-flex min-h-11 items-center text-sm text-white/65 hover:text-white"
          >
            Back to your home
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
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">
            On your PromoCard
          </p>
          <DialogTitle className="break-words pr-5 font-serif text-3xl">
            {selected?.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/70">
            {selected?.detail || "Show this to the merchant. Nothing is used until they validate it."}
          </DialogDescription>
          {selectedCode && !selectedExpired && canShowCode(selected) ? (
            <div className="mt-2 rounded-2xl border border-amber-200/25 bg-amber-200/5 p-5 text-center">
              <p className="text-sm text-amber-100">Show this code to redeem</p>
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
                {copyState === "copied" ? "Copied" : "Copy code"}
              </button>
              <p role="status" className="mt-2 text-xs text-white/65">
                {copyState === "failed"
                  ? "Couldn’t copy. You can select the code or show this screen."
                  : copyState === "copied"
                    ? "Code copied to clipboard."
                    : "Only share this code when redeeming your perk."}
              </p>
            </div>
          ) : (
            <p className="rounded-2xl bg-white/5 p-4 text-sm leading-6 text-white/70">
              {selectedExpired
                ? "This perk has expired. Explore Discover for something new."
                : "This perk has no usable code yet. A claimed, unexpired benefit is the only thing a merchant can validate."}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}
