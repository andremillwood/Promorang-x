import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { promoCardUnlockHref, type PromoCardAim } from "@promorang/shared";

type AimedDiscoverLeadProps = {
  aim: PromoCardAim;
  authenticated?: boolean;
  href?: string;
};

export function AimedDiscoverLead({ aim, authenticated, href }: AimedDiscoverLeadProps) {
  const toCard = href || promoCardUnlockHref({ authenticated, aim });
  return (
    <section className="rounded-[1.4rem] border border-amber-200/20 bg-amber-200/5 px-4 py-4 sm:px-5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
        On your card · {aim.label}
      </p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-white">{aim.cardLine.replace(/\.$/, "")}</h1>
      <p className="mt-1 max-w-xl text-sm leading-6 text-white/60">
        {aim.watchingLine} Answer a live question and it lands there.
      </p>
      <Link
        to={toCard}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-black text-primary"
      >
        {authenticated ? "Open your PromoCard" : "Unlock this"}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}
