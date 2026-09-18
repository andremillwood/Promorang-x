import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { encodeOfferRedeemPayload, resolvePromoCardFace, type PromoCardFaceModel } from "@promorang/shared";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { cn } from "@/lib/utils";

type PromoCardFaceProps = {
  available?: string;
  limit?: string;
  holder?: string;
  places?: string;
  action?: string;
  sceneMark?: string;
  crewMark?: string;
  className?: string;
  variant?: "spending" | "membership";
  tier?: string;
  model?: PromoCardFaceModel;
  interactive?: boolean;
  flipped?: boolean;
  onFlip?: () => void;
  onCopy?: () => void;
  copyState?: "idle" | "copied" | "failed";
  lastLoaded?: boolean;
  compact?: boolean;
};

function stamps(model: PromoCardFaceModel) {
  return [model.sceneMark, model.crewMark].filter(Boolean) as string[];
}

function PromoCardScanPlate({ credential, compact }: { credential?: string | null; compact?: boolean }) {
  if (credential) {
    return (
      <span className={cn("pr-card-chip pr-card-chip--live overflow-hidden rounded-[.75rem] border border-[#f4c66c]/40 bg-white p-1", compact && "h-9 w-9 sm:h-10 sm:w-10")} aria-label="PromoCard scan mark">
        <QRCodeSVG value={encodeOfferRedeemPayload(credential)} size={compact ? 30 : 44} level="M" className="h-full w-full" />
      </span>
    );
  }
  return <span className={cn("pr-card-chip rounded-[.8rem] border border-white/10 bg-white/5", compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-12 w-12")} aria-label="No code to scan yet" />;
}

export function PromoCardFace({
  available,
  limit,
  holder = "Your card",
  places,
  action,
  sceneMark,
  crewMark,
  className,
  variant = "spending",
  tier,
  model,
  interactive = true,
  flipped,
  onFlip,
  onCopy,
  copyState = "idle",
  lastLoaded,
  compact = false,
}: PromoCardFaceProps) {
  const [localFlip, setLocalFlip] = useState(false);
  const looksLikeMoney = /\$|pts|J\$/i.test(`${available || ""} ${limit || ""}`);
  const resolved = model || resolvePromoCardFace({
    holder,
    useThis: variant === "spending" && available && !looksLikeMoney ? { title: limit, issuer: { name: places } } : null,
    nearbyCount: /nearby/i.test(`${available || ""} ${action || ""} ${places || ""}`) ? 1 : 0,
    sceneMark,
    crewMark,
  });
  const face = model ? resolved : available && !looksLikeMoney ? {
    ...resolved,
    headline: available,
    detail: limit || resolved.detail,
    places: places || resolved.places,
    action: action || resolved.action,
    holder,
    sceneMark: sceneMark || resolved.sceneMark,
    crewMark: crewMark || resolved.crewMark,
  } : resolved;
  const isFlipped = flipped ?? localFlip;
  const canFlip = Boolean(interactive && face.canFlip && face.credential);
  const toggle = () => {
    if (!canFlip) return;
    if (onFlip) onFlip();
    else setLocalFlip((value) => !value);
  };

  return (
    <div className={cn("pr-card-stage w-full max-w-xl", className)}>
      <div className={cn("pr-card-flip", isFlipped && "is-flipped")}>
        <article
          className={cn(
            "pr-plastic-card pr-card-side overflow-hidden",
            compact
              ? "!aspect-auto min-h-[190px] p-4 sm:min-h-[230px] sm:p-5"
              : "min-h-[320px] p-6 sm:min-h-[360px] sm:p-7",
            `pr-plastic-card--${face.state}`,
          )}
          aria-label="PromoCard"
        >
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "linear-gradient(120deg, transparent 0 42%, rgba(244,198,108,.08) 42.2% 42.8%, transparent 43% 100%)" }} />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className={cn("grid shrink-0 place-items-center rounded-2xl border border-[#f4c66c]/30 bg-black/70 shadow-inner", compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-12 w-12")}>
                  <PromorangMark size={compact ? 30 : 40} className={compact ? "h-7 w-7 sm:h-8 sm:w-8" : "h-10 w-10"} />
                </span>
                <div>
                  <p className="text-[8px] font-black tracking-[0.28em] text-[#f4c66c] sm:text-[9px]">PROMORANG</p>
                  <h3 className={cn("mt-1 font-serif font-bold leading-none tracking-[-.04em] text-white", compact ? "text-[1.3rem] sm:text-[1.55rem]" : "text-[1.9rem]")}>PromoCard</h3>
                  {tier ? <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/45">{tier} tier</p> : null}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <PromoCardScanPlate credential={face.credential} compact={compact} />
                {face.issuerInitial ? <span className="grid h-8 w-8 place-items-center rounded-full border border-[#f4c66c]/35 bg-[#f4c66c]/10 font-serif text-xs font-black text-[#f4c66c]" aria-label={`${face.issuer} mark`}>{face.issuerInitial}</span> : null}
              </div>
            </div>

            <div className={compact ? "py-3 sm:py-4" : "py-7 sm:py-9"}>
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-white/38 sm:text-[10px]">{face.action}</p>
              <p className={cn("mt-1.5 max-w-[92%] font-serif font-bold leading-[.94] tracking-[-.05em] text-[#f4c66c]", compact ? "text-[1.55rem] sm:text-[1.9rem]" : "text-[2.45rem] sm:text-[3.25rem]")}>{face.headline}</p>
              <p className={cn("mt-2 text-white/56", compact ? "line-clamp-2 max-w-[92%] text-[11px] leading-4 sm:text-xs sm:leading-5" : "max-w-[82%] text-sm leading-6")}>{face.detail}</p>
              {face.places ? <p className={cn("mt-1 max-w-[82%] text-white/34", compact ? "hidden sm:block sm:text-[11px] sm:leading-4" : "text-xs leading-5")}>{face.places}</p> : null}
              {stamps(face).length || face.returnStamp ? (
                <div className={cn("flex flex-wrap gap-2", compact ? "mt-3" : "mt-5")}>
                  {stamps(face).map((mark) => <span key={mark} className="pr-card-stamp px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] text-[#f4c66c]">{mark}</span>)}
                  {face.returnStamp ? <span className="pr-card-stamp pr-card-stamp--return px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] text-[#f4c66c]">{face.returnStamp}{face.returnDate ? ` · ${face.returnDate}` : ""}</span> : null}
                </div>
              ) : null}
            </div>

            <div className={cn("flex items-end justify-between gap-4 border-t border-white/10 text-white/42", compact ? "pt-2 text-[9px]" : "pt-4 text-[10px]")}>
              <span className="font-black uppercase tracking-[.13em]">{face.holder}</span>
              <span className={cn("max-w-[58%] text-right", compact ? "line-clamp-1 leading-3" : "leading-4")}>{face.footerCue}</span>
            </div>
          </div>
        </article>

        {canFlip ? (
          <article className={cn("pr-plastic-card pr-card-side pr-card-back min-h-[320px] p-6 sm:min-h-[360px] sm:p-7", `pr-plastic-card--${face.state}`)} aria-hidden={!isFlipped} {...(!isFlipped ? { inert: "" } : {})}>
            <div className="relative z-10 flex h-full flex-col items-center justify-between text-center">
              <div>
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-[#f4c66c]/35 bg-black"><PromorangMark size={32} className="h-8 w-8" /></span>
                <p className="mt-3 text-[9px] font-black tracking-[0.24em] text-[#f4c66c]">PROMORANG · PRESENT THIS</p>
                <p className="mt-1 font-serif text-xl font-bold text-white">{face.issuer || "PromoCard"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/38">Merchant validation</p>
                <div className="mx-auto mt-3 w-fit rounded-2xl bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,.25)]" aria-label="PromoCard scan mark">
                  <QRCodeSVG value={encodeOfferRedeemPayload(face.credential || "")} size={132} level="M" />
                </div>
                <code className="mt-3 block select-all font-mono text-2xl font-black tracking-[0.16em] text-[#f4c66c]">{face.credential}</code>
                {lastLoaded ? <p className="mt-2 text-[11px] text-[#f4c66c]">Last loaded. The merchant still has to validate it.</p> : null}
              </div>
              <div className="w-full">
                {onCopy ? <button type="button" onClick={onCopy} className="min-h-11 rounded-full border border-white/15 bg-white/[.04] px-4 text-sm font-semibold text-white/72">{copyState === "copied" ? "Copied" : copyState === "failed" ? "Couldn’t copy" : "Copy code"}</button> : null}
                <p className="mt-3 text-[11px] leading-5 text-white/40">{face.footerCue}</p>
              </div>
            </div>
          </article>
        ) : null}
      </div>

      {canFlip ? <button type="button" onClick={toggle} className="pr-world-primary mt-4 w-full" aria-label={isFlipped ? "Hide PromoCard code" : "Flip PromoCard to show the merchant"}>{isFlipped ? "Turn it back over" : face.action}</button> : null}
    </div>
  );
}

export function PromorangValidReceipt({ title, reference, nextBenefit }: { title: string; reference?: string; nextBenefit?: string }) {
  return (
    <aside className="pr-world-panel pr-world-panel--signal overflow-hidden p-6 text-white" aria-live="polite">
      <div className="flex items-center gap-3">
        <PromorangMark size={36} className="h-9 w-9" />
        <div><p className="pr-world-kicker">PROMORANG</p><p className="mt-1 font-serif text-3xl font-black leading-none text-[#f4c66c]">VALID</p></div>
      </div>
      <p className="mt-5 font-serif text-2xl font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">This PromoCard entitlement has been validated. Validation still does not imply a separate purchase or fulfillment unless those records exist.</p>
      {reference ? <p className="mt-3 font-mono text-xs text-white/35">Ref {reference}</p> : null}
      {nextBenefit ? <p className="mt-3 text-xs text-orange-100">Next opening: {nextBenefit}</p> : null}
    </aside>
  );
}
