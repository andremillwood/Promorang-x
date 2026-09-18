import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, CheckCircle2, Eye, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaperReceipt, PromoCardFace } from "@/components/promorang/SignatureObjects";

type CurrentArcProps = {
  className?: string;
  variant?: "hero" | "rail" | "return";
};

const arcPaths = {
  hero: {
    viewBox: "0 0 1200 420",
    outward: "M20 310 C190 42 478 34 650 170 C820 305 1000 294 1180 72",
    back: "M1178 74 C1035 330 664 388 332 248 C210 196 116 205 38 272",
  },
  rail: {
    viewBox: "0 0 1200 150",
    outward: "M12 98 C236 28 422 32 618 86 C812 140 1006 128 1188 42",
    back: "M1188 44 C1025 126 782 132 598 92 C416 52 226 56 20 106",
  },
  return: {
    viewBox: "0 0 1200 520",
    outward: "M40 360 C160 78 466 64 672 184 C856 292 1038 265 1150 78",
    back: "M1148 80 C1054 338 766 452 486 354 C296 288 170 284 70 350",
  },
} as const;

export function CurrentArc({ className, variant = "hero" }: CurrentArcProps) {
  const reducedMotion = useReducedMotion();
  const config = arcPaths[variant];

  return (
    <div className={cn("marketing-current-arc", `marketing-current-arc--${variant}`, className)} aria-hidden="true">
      <svg viewBox={config.viewBox} preserveAspectRatio="none" role="presentation">
        <path className="marketing-current-arc__ghost" d={config.outward} />
        <path className={cn("marketing-current-arc__line", !reducedMotion && "is-moving")} d={config.outward} />
        <path className="marketing-current-arc__return-ghost" d={config.back} />
        <path className={cn("marketing-current-arc__return", !reducedMotion && "is-moving")} d={config.back} />
        <circle className={cn("marketing-current-arc__signal", !reducedMotion && "is-pulsing")} cx={variant === "rail" ? 616 : 672} cy={variant === "rail" ? 86 : variant === "hero" ? 170 : 184} r="5" />
        <circle className="marketing-current-arc__return-dot" cx={variant === "rail" ? 20 : variant === "hero" ? 38 : 70} cy={variant === "rail" ? 106 : variant === "hero" ? 272 : 350} r="4" />
      </svg>
    </div>
  );
}

const steps = [
  {
    key: "notice",
    number: "01",
    label: "NOTICE",
    title: "Something catches you.",
    copy: "A Discovery, Moment, person, Place or idea gives you a reason to care.",
    icon: Eye,
  },
  {
    key: "move",
    number: "02",
    label: "MOVE",
    title: "You do something useful.",
    copy: "Watch it, join it, show up, use access, support it, share it or take another real action.",
    icon: ArrowDownRight,
  },
  {
    key: "count",
    number: "03",
    label: "IT COUNTS",
    title: "Something verifiable changes.",
    copy: "PROMORANG separates intention from proof. Only supported actions advance the story.",
    icon: CheckCircle2,
  },
  {
    key: "return",
    number: "04",
    label: "RETURN",
    title: "Something useful comes back.",
    copy: "Access, a perk, proof, memory, reputation, relationship or next opening can return to your PromoCard.",
    icon: RotateCcw,
  },
];

export function ReturnLoopStory() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="marketing-return-story relative overflow-hidden border-b border-white/10 bg-[#070707] px-5 py-16 sm:px-6 md:py-24">
      <CurrentArc variant="return" className="marketing-return-story__arc" />

      <div className="relative mx-auto max-w-[1440px]">
        <div className="marketing-section-head">
          <div>
            <p className="marketing-kicker"><Sparkles className="h-3.5 w-3.5" /> The Return</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black sm:text-5xl">Movement should leave a consequence — and give you a reason to come back.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
              PROMORANG's boomerang is product physics, not a button label. You notice something, move, something real changes, and the useful consequence has a path back to you.
            </p>
          </div>
          <div className="marketing-return-wordmark" aria-hidden="true">↗ ↘ ↩</div>
        </div>

        <div className="marketing-return-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.key}
                className="marketing-return-step"
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.42, delay: index * 0.07 }}
              >
                <div className="marketing-return-step__top">
                  <span>{step.number}</span>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="marketing-return-step__label">{step.label}</p>
                <h3>{step.title}</h3>
                <p className="marketing-return-step__copy">{step.copy}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="marketing-return-consequence">
          <div className="marketing-return-receipt">
            <PaperReceipt
              heading="IT COUNTED"
              lines={[
                { label: "What happened", value: "Verified action", strong: true },
                { label: "What changed", value: "Source-backed consequence", strong: true },
                { label: "What came back", value: "Access / value / memory" },
                { label: "What opened next", value: "A reason to return" },
              ]}
              footer="Illustrative anatomy only. Production receipts must be populated from authoritative records."
            />
          </div>

          <div className="marketing-return-landing">
            <div className="marketing-return-landing__label">
              <RotateCcw className="h-4 w-4" />
              THE RETURN LANDS HERE
            </div>
            <PromoCardFace
              holder="Your PromoCard"
              available="What came back"
              limit="Access · Proof · Memory"
              places="The persistent place where useful consequences stay connected to you."
              action="See what changed"
              variant="membership"
              interactive={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
