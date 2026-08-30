import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MEMBERSHIP_TIERS, type MembershipStanding, type StandingPackage } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";

type Props = {
  open: boolean;
  pack: StandingPackage | null;
  standing: MembershipStanding;
  onOpen: (pack: StandingPackage) => void;
  onClose: () => void;
};

export function StandingPackageOpening({ open, pack, standing, onOpen, onClose }: Props) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"sealed" | "tearing" | "revealed">("sealed");

  useEffect(() => {
    if (!open) {
      setPhase("sealed");
      return;
    }
    if (reduceMotion) setPhase("revealed");
  }, [open, reduceMotion]);

  if (!pack) return null;
  const tier = MEMBERSHIP_TIERS[pack.tier];
  const kindLabel =
    pack.kind === "month_grant"
      ? t("standing.month")
      : pack.kind === "week_boost"
        ? t("standing.week")
        : t("standing.weekend");

  const tearOpen = () => {
    if (phase !== "sealed") return;
    if (reduceMotion) {
      onOpen(pack);
      setPhase("revealed");
      return;
    }
    setPhase("tearing");
    window.setTimeout(() => {
      onOpen(pack);
      setPhase("revealed");
    }, 720);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-full max-w-md">
            {phase !== "revealed" ? (
              <motion.button
                type="button"
                onClick={tearOpen}
                className="relative w-full overflow-hidden rounded-[1.75rem] border border-amber-200/30 bg-[radial-gradient(circle_at_20%_0%,#5a3b12,transparent_36%),linear-gradient(160deg,#1a1208,#0b0a08_58%,#2a1608)] p-8 text-left shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
                animate={phase === "tearing" ? { rotate: [0, -2, 3, -8], y: [0, 8, -4], scale: [1, 1.02, 0.96] } : { rotate: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="absolute inset-x-10 top-0 h-10 bg-gradient-to-b from-amber-200/40 to-transparent" />
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">{t("standing.sealed")}</p>
                <h2 className="mt-4 font-serif text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-amber-50">
                  {kindLabel}
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-amber-50/70">{t("standing.tearCopy", { tier: tier.label })}</p>
                <span className="mt-8 inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-100">
                  {t("standing.tear")}
                </span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0.86, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[1.75rem] border border-amber-200/25 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black p-8 text-white shadow-[0_30px_80px_rgba(255,85,0,0.18)]"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">{t("standing.reveal")}</p>
                <h2 className="mt-3 font-serif text-5xl font-black uppercase leading-[0.84] tracking-[-0.06em]">
                  {tier.label}
                </h2>
                <p className="mt-3 text-sm text-white/65">
                  {t("standing.revealCopy", { tier: tier.label, days: String(pack.days) })}
                </p>
                <p className="mt-4 text-xs leading-5 text-white/50">
                  {t("standing.current", { tier: MEMBERSHIP_TIERS[standing.currentTier].label })}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-black text-white"
                >
                  {t("standing.keepEarning")}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
