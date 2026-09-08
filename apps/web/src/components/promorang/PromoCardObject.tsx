import { useState } from "react";
import { resolvePromoCardFace, type PromoCardFaceModel } from "@promorang/shared";
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
};

function stamps(model: PromoCardFaceModel) {
  return [model.sceneMark, model.crewMark].filter(Boolean) as string[];
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
}: PromoCardFaceProps) {
  const [localFlip, setLocalFlip] = useState(false);
  const looksLikeMoney = /\$|pts|J\$/i.test(`${available || ""} ${limit || ""}`);
  const resolved =
    model ||
    resolvePromoCardFace({
      holder,
      useThis:
        variant === "spending" && available && !looksLikeMoney
          ? { title: limit, issuer: { name: places } }
          : null,
      nearbyCount: /nearby/i.test(`${available || ""} ${action || ""} ${places || ""}`) ? 1 : 0,
      sceneMark,
      crewMark,
    });
  const face = model
    ? resolved
    : available && !looksLikeMoney
      ? {
          ...resolved,
          headline: available,
          detail: limit || resolved.detail,
          places: places || resolved.places,
          action: action || resolved.action,
          holder,
          sceneMark: sceneMark || resolved.sceneMark,
          crewMark: crewMark || resolved.crewMark,
        }
      : resolved;
  const isFlipped = flipped ?? localFlip;
  const canFlip = Boolean(interactive && face.canFlip && face.credential);
  const toggle = () => {
    if (!canFlip) return;
    if (onFlip) onFlip();
    else setLocalFlip((value) => !value);
  };

  return (
    <div className={cn("pr-card-stage w-full max-w-md", className)}>
      <div className={cn("pr-card-flip", isFlipped && "is-flipped")}>
        <article
          className={cn("pr-plastic-card pr-card-side", `pr-plastic-card--${face.state}`)}
          aria-label="PromoCard"
        >
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#0b0b0c] shadow-[0_0_0_1px_rgba(0,0,0,0.25)]">
                  <PromorangMark size={40} className="h-10 w-10" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.22em] text-white">PROMORANG</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white">PromoCard</h3>
                  {tier ? <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">{tier} tier</p> : null}
                </div>
              </div>
              {face.issuerInitial ? (
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-black/20 font-serif text-lg font-black text-white" aria-label={`${face.issuer} mark`}>
                  {face.issuerInitial}
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-white/80">{face.action}</p>
              <p className="mt-0.5 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">{face.headline}</p>
              <p className="mt-1 text-xs text-white/75">{face.detail}</p>
              <p className="mt-1 text-xs text-white/65">{face.places}</p>
              {stamps(face).length || face.returnStamp ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {stamps(face).map((mark) => (
                    <span key={mark} className="pr-card-stamp">{mark}</span>
                  ))}
                  {face.returnStamp ? (
                    <span className="pr-card-stamp pr-card-stamp--return">
                      {face.returnStamp}
                      {face.returnDate ? ` · ${face.returnDate}` : ""}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex items-end justify-between gap-3 text-[11px] text-white/80">
              <span>{face.holder}</span>
              <span className="max-w-[58%] text-right text-[10px] leading-4 tracking-wide">{face.footerCue}</span>
            </div>
          </div>
        </article>
        {canFlip ? (
        <article
          className={cn("pr-plastic-card pr-card-side pr-card-back", `pr-plastic-card--${face.state}`)}
          aria-hidden={!isFlipped}
        >
          <div className="relative z-10 flex h-full flex-col items-center justify-between text-center">
            <div>
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#0b0b0c]">
                <PromorangMark size={32} className="h-8 w-8" />
              </span>
              <p className="mt-2 text-[10px] font-bold tracking-[0.22em] text-white">PROMORANG · HOLD AT THE DOOR</p>
              <p className="mt-1 font-serif text-xl font-bold text-white">{face.issuer || "PromoCard"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Show this</p>
              <code className="mt-2 block select-all font-mono text-3xl font-black tracking-[0.16em] text-white">
                {face.credential}
              </code>
              {lastLoaded ? <p className="mt-2 text-[11px] text-white/80">Last loaded. The merchant still has to validate it.</p> : null}
            </div>
            <div className="w-full">
              {onCopy ? (
                <button
                  type="button"
                  onClick={onCopy}
                  className="min-h-11 rounded-full border border-white/20 px-4 text-sm font-semibold"
                >
                  {copyState === "copied" ? "Copied" : copyState === "failed" ? "Couldn’t copy" : "Copy code"}
                </button>
              ) : null}
              <p className="mt-2 text-[11px] text-white/50">{face.footerCue}</p>
            </div>
          </div>
        </article>
        ) : null}
      </div>
      {canFlip ? (
        <button
          type="button"
          onClick={toggle}
          className="experience-interactive mt-3 flex min-h-11 w-full items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-sm font-black text-primary"
          aria-label={isFlipped ? "Hide PromoCard code" : "Flip PromoCard to show the merchant"}
        >
          {isFlipped ? "Turn it back over" : face.action}
        </button>
      ) : null}
    </div>
  );
}

export function PromorangValidReceipt({
  title,
  reference,
  nextBenefit,
}: {
  title: string;
  reference?: string;
  nextBenefit?: string;
}) {
  return (
    <aside className="overflow-hidden rounded-[1.4rem] border border-primary/40 bg-[radial-gradient(circle_at_20%_0%,rgba(255,85,0,0.28),transparent_42%),#0b0b0c] p-5 text-white" aria-live="polite">
      <div className="flex items-center gap-3">
        <PromorangMark size={36} className="h-9 w-9" />
        <div>
          <p className="text-[10px] font-black tracking-[0.22em] text-primary">PROMORANG</p>
          <p className="font-serif text-2xl font-black text-primary">VALID</p>
        </div>
      </div>
      <p className="mt-3 font-serif text-xl font-bold">{title}</p>
      <p className="mt-1 text-sm text-white/60">This is a Promorang PromoCard redemption. The perk is used.</p>
      {reference ? <p className="mt-2 font-mono text-xs text-white/40">Ref {reference}</p> : null}
      {nextBenefit ? <p className="mt-2 text-xs text-orange-100">Next for this person: {nextBenefit}</p> : null}
    </aside>
  );
}
