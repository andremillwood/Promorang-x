import { Link } from "react-router-dom";
import { AFTRHRS_COPY, AFTRHRS_PATHS } from "@promorang/shared";

export function AftrHrsPublicDoorCard() {
  return (
    <Link
      to={AFTRHRS_PATHS.landing}
      className="mb-8 block rounded-[1.75rem] border border-fuchsia-300/35 bg-gradient-to-br from-fuchsia-500/20 via-black/40 to-cyan-400/10 px-5 py-5 text-left text-white sm:px-6 sm:py-6"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200">
        {AFTRHRS_COPY.homepageHeroEyebrow}
      </p>
      <p className="mt-2 font-black uppercase tracking-[-0.05em] text-3xl sm:text-4xl">
        AftrHrs
      </p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
        {AFTRHRS_COPY.homepageHeroBody}
      </p>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-white">
        {AFTRHRS_COPY.guestRsvpCta} →
      </p>
    </Link>
  );
}
