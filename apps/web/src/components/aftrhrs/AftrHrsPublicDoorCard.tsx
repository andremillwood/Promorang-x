import { Link } from "react-router-dom";
import { AFTRHRS_COPY, AFTRHRS_PATHS } from "@promorang/shared";

export function AftrHrsPublicDoorCard({ variant = "home" }: { variant?: "home" | "scene" }) {
  const compact = variant === "scene";
  return (
    <Link
      to={AFTRHRS_PATHS.landing}
      className={`block rounded-[1.75rem] border border-fuchsia-300/35 bg-gradient-to-br from-fuchsia-500/20 via-black/40 to-cyan-400/10 text-left text-white ${
        compact ? "mb-6 px-4 py-4" : "mb-8 px-5 py-5 sm:px-6 sm:py-6"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200">
        {AFTRHRS_COPY.homepageHeroEyebrow}
      </p>
      <p className={`font-black uppercase tracking-[-0.05em] ${compact ? "mt-1 text-2xl" : "mt-2 text-3xl sm:text-4xl"}`}>
        AftrHrs
      </p>
      <p className={`mt-2 leading-6 text-white/75 ${compact ? "text-sm" : "max-w-xl text-sm sm:text-base"}`}>
        {compact ? AFTRHRS_COPY.sceneIsNotThePass : AFTRHRS_COPY.homepageHeroBody}
      </p>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-white">
        {AFTRHRS_COPY.claimGuestCta} →
      </p>
    </Link>
  );
}
